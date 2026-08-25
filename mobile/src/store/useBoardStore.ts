import { create } from 'zustand';

import { TRACKS } from '@/constants/tracks';
import { placeNewNote, scrapStyle } from '@/lib/scrapLayout';
import { getSignedPhotoUrl, uploadMemoryPhoto } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { Item, Memory, Track } from '@/types/models';

interface CompleteItemInput {
  rating: number | null;
  note: string;
  photoUri: string | null;
}

interface BoardState {
  items: Item[];
  loading: boolean;
  memories: Record<string, Memory | null>;
  photoUrls: Record<string, string>;

  loadItems: () => Promise<void>;
  loadAllMemories: () => Promise<void>;
  addItem: (text: string, track: Track) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updatePosition: (id: string, xPct: number, yPct: number) => Promise<void>;
  updateRotation: (id: string, degrees: number) => Promise<void>;
  claimChallenge: (track: Track, itemId: string) => Promise<void>;
  releaseChallenge: (track: Track) => Promise<void>;
  completeItem: (itemId: string, input: CompleteItemInput) => Promise<void>;
  loadMemory: (itemId: string) => Promise<Memory | null>;
  photoUrlFor: (path: string) => Promise<string>;
}

function currentUserId() {
  const userId = useAuthStore.getState().session?.user.id;
  if (!userId) throw new Error('No signed-in user');
  return userId;
}

function patchItem(items: Item[], id: string, patch: Partial<Item>): Item[] {
  return items.map((i) => (i.id === id ? { ...i, ...patch } : i));
}

// Items belonging to the other track, already done, or already claimed as
// the active week/month challenge are excluded from the pool eligible to be
// pulled next.
export function poolForTrack(items: Item[], track: Track) {
  return items.filter((i) => i.track === track && !i.done && !i.claimed_track);
}

export function isTrackClaimed(items: Item[], track: Track) {
  return items.some((i) => i.claimed_track === track);
}

export const useBoardStore = create<BoardState>((set, get) => ({
  items: [],
  loading: true,
  memories: {},
  photoUrls: {},

  loadItems: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    set({ items: data as Item[], loading: false });
  },

  // Individual memory rows are otherwise loaded lazily, one per card, as
  // each MemoryCard mounts (see loadMemory below) — too late to sort the
  // Memories grid by completion time before it's even rendered. This loads
  // all of them up front instead.
  loadAllMemories: async () => {
    const { data, error } = await supabase.from('memories').select('*');
    if (error) throw error;
    const byItemId: Record<string, Memory> = {};
    for (const memory of data as Memory[]) byItemId[memory.item_id] = memory;
    set((state) => ({ memories: { ...state.memories, ...byItemId } }));
  },

  addItem: async (text, track) => {
    // Places the new note with real clearance from whatever's already on
    // this track's board — pure random scatter (each note's fallback
    // position, for anything never explicitly placed) starts overlapping
    // fast once there are more than a handful of notes.
    const existing = get()
      .items.filter((i) => i.track === track && !i.done)
      .map((i) => {
        const layout = scrapStyle(i.id);
        return { x: i.position_x ?? layout.x, y: i.position_y ?? layout.y };
      });
    const { x, y } = placeNewNote(existing);

    const { data, error } = await supabase.from('items').insert({ text, track, position_x: x, position_y: y }).select().single();
    if (error) throw error;
    set((state) => ({ items: [...state.items, data as Item] }));
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  updatePosition: async (id, xPct, yPct) => {
    const patch = { position_x: xPct, position_y: yPct };
    set((state) => ({ items: patchItem(state.items, id, patch) }));
    const { error } = await supabase.from('items').update(patch).eq('id', id);
    if (error) throw error;
  },

  updateRotation: async (id, degrees) => {
    const patch = { rotation: degrees };
    set((state) => ({ items: patchItem(state.items, id, patch) }));
    const { error } = await supabase.from('items').update(patch).eq('id', id);
    if (error) throw error;
  },

  claimChallenge: async (track, itemId) => {
    const claimedAt = new Date();
    const dueBy = new Date(claimedAt.getTime() + TRACKS[track].ms);
    const patch = { claimed_track: track, claimed_at: claimedAt.toISOString(), claimed_due_by: dueBy.toISOString() };
    const { error } = await supabase.from('items').update(patch).eq('id', itemId);
    if (error) throw error;
    set((state) => ({ items: patchItem(state.items, itemId, patch) }));
  },

  releaseChallenge: async (track) => {
    const item = get().items.find((i) => i.claimed_track === track);
    if (!item) return;
    const patch = { claimed_track: null, claimed_at: null, claimed_due_by: null };
    const { error } = await supabase.from('items').update(patch).eq('id', item.id);
    if (error) throw error;
    set((state) => ({ items: patchItem(state.items, item.id, patch) }));
  },

  completeItem: async (itemId, { rating, note, photoUri }) => {
    const userId = currentUserId();
    const photoPath = photoUri ? await uploadMemoryPhoto(userId, itemId, photoUri) : null;

    const memory: Memory = {
      item_id: itemId,
      user_id: userId,
      note: note.trim() || null,
      rating,
      photo_path: photoPath,
      created_at: new Date().toISOString(),
    };
    const { error: memoryError } = await supabase.from('memories').upsert(memory);
    if (memoryError) throw memoryError;

    const patch = { done: true, claimed_track: null, claimed_at: null, claimed_due_by: null };
    const { error: itemError } = await supabase.from('items').update(patch).eq('id', itemId);
    if (itemError) throw itemError;

    set((state) => ({
      items: patchItem(state.items, itemId, patch),
      memories: { ...state.memories, [itemId]: memory },
    }));
  },

  loadMemory: async (itemId) => {
    const cached = get().memories[itemId];
    if (cached !== undefined) return cached;
    const { data, error } = await supabase.from('memories').select('*').eq('item_id', itemId).maybeSingle();
    if (error) throw error;
    set((state) => ({ memories: { ...state.memories, [itemId]: data as Memory | null } }));
    return data as Memory | null;
  },

  photoUrlFor: async (path) => {
    const cached = get().photoUrls[path];
    if (cached) return cached;
    const url = await getSignedPhotoUrl(path);
    set((state) => ({ photoUrls: { ...state.photoUrls, [path]: url } }));
    return url;
  },
}));
