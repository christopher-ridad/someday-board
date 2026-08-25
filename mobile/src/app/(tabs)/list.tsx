import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { TrackToggle } from '@/components/board/TrackToggle';
import { EditItemModal } from '@/components/list/EditItemModal';
import { ItemRow } from '@/components/list/ItemRow';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Gold, NoteColors } from '@/constants/theme';
import { CorkBackground } from '@/components/ui/CorkBackground';
import { DismissKeyboardView } from '@/components/ui/DismissKeyboardView';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PressableScale } from '@/components/ui/PressableScale';
import { isTrackClaimed, useBoardStore } from '@/store/useBoardStore';
import type { Item, Track } from '@/types/models';

export default function ListScreen() {
  const items = useBoardStore((state) => state.items);
  const loading = useBoardStore((state) => state.loading);
  const addItem = useBoardStore((state) => state.addItem);
  const deleteItem = useBoardStore((state) => state.deleteItem);
  const restoreItem = useBoardStore((state) => state.restoreItem);
  const [text, setText] = useState('');
  const [activeTrack, setActiveTrack] = useState<Track>('week');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [undoItem, setUndoItem] = useState<Item | null>(null);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pending = useMemo(() => items.filter((i) => !i.done && i.track === activeTrack), [items, activeTrack]);
  const weekClaimed = useMemo(() => isTrackClaimed(items, 'week'), [items]);
  const monthClaimed = useMemo(() => isTrackClaimed(items, 'month'), [items]);

  async function onAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    await addItem(trimmed, activeTrack);
  }

  // Deleting stays instant — no confirm prompt in the way — but the removed
  // item stays recoverable for a few seconds via this toast, in case the
  // tap was a mistake.
  async function onDeleteItem(item: Item) {
    await deleteItem(item.id);
    setUndoItem(item);
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => setUndoItem(null), 4000);
  }

  function onUndoDelete() {
    if (!undoItem) return;
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    restoreItem(undoItem);
    setUndoItem(null);
  }

  return (
    <CorkBackground style={styles.container}>
      <DismissKeyboardView style={styles.safeArea}>
        <TrackToggle
          track={activeTrack}
          onChange={setActiveTrack}
          weekClaimed={weekClaimed}
          monthClaimed={monthClaimed}
          disabled={false}
        />

        <View style={styles.addRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={`Something you could do this ${activeTrack}...`}
            placeholderTextColor={Colors.light.textSecondary}
            maxLength={80}
            style={styles.input}
            onSubmitEditing={onAdd}
            returnKeyType="done"
          />
          <PressableScale style={styles.addButton} onPress={onAdd}>
            <ThemedText style={styles.addButtonText}>+</ThemedText>
          </PressableScale>
        </View>

        {pending.length > 0 && (
          <FlatList
            data={pending}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemRow
                item={item}
                dotColor={NoteColors[index % NoteColors.length]}
                onPress={() => setEditingItem(item)}
                onDelete={() => onDeleteItem(item)}
              />
            )}
          />
        )}

        {loading ? (
          <LoadingState style={StyleSheet.absoluteFill} />
        ) : (
          pending.length === 0 && (
            <EmptyState emoji="📝" rotation={1} style={StyleSheet.absoluteFill}>
              {`Nothing on your ${activeTrack} list yet.\nAdd the thing you've been putting off.`}
            </EmptyState>
          )
        )}

        {undoItem && (
          <View style={styles.undoToast} pointerEvents="box-none">
            <ThemedText numberOfLines={1} style={styles.undoText}>
              Removed “{undoItem.text}”
            </ThemedText>
            <PressableScale onPress={onUndoDelete} hitSlop={8}>
              <ThemedText style={styles.undoAction}>UNDO</ThemedText>
            </PressableScale>
          </View>
        )}
      </DismissKeyboardView>
      <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} />
    </CorkBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  addRow: { flexDirection: 'row', gap: 10, padding: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.light.text,
    backgroundColor: 'rgba(255,251,245,0.92)',
  },
  addButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: Gold, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#26301C', fontSize: 22, lineHeight: 24 },
  // A dark bar instead of the app's usual cream cards, so it reads as a
  // transient toast rather than another piece of the screen's content.
  undoToast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(58,42,28,0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  undoText: { flex: 1, color: '#FFFBF5', fontSize: 13 },
  undoAction: { color: Gold, fontSize: 13, fontFamily: Fonts.bodySemiBold },
});
