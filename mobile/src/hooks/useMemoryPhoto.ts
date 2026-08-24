import { useEffect } from 'react';

import { useBoardStore } from '@/store/useBoardStore';

// Loads a completed item's memory row and, once its photo path is known,
// resolves it to a signed URL — shared by every place a memory's photo
// renders (board note, memories grid card, memory detail view). Pass null
// to skip loading (e.g. an item that isn't done yet, or no item selected).
export function useMemoryPhoto(itemId: string | null) {
  const loadMemory = useBoardStore((state) => state.loadMemory);
  const photoUrlFor = useBoardStore((state) => state.photoUrlFor);
  const memory = useBoardStore((state) => (itemId ? state.memories[itemId] : undefined));
  const photoUrl = useBoardStore((state) => (memory?.photo_path ? (state.photoUrls[memory.photo_path] ?? null) : null));

  useEffect(() => {
    if (itemId) loadMemory(itemId);
  }, [itemId, loadMemory]);

  useEffect(() => {
    if (memory?.photo_path) photoUrlFor(memory.photo_path);
  }, [memory?.photo_path, photoUrlFor]);

  return { memory, photoUrl };
}
