import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { TrackToggle } from '@/components/board/TrackToggle';
import { ItemRow } from '@/components/list/ItemRow';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Gold, NoteColors } from '@/constants/theme';
import { CorkBackground } from '@/components/ui/CorkBackground';
import { EmptyState } from '@/components/ui/EmptyState';
import { PressableScale } from '@/components/ui/PressableScale';
import { isTrackClaimed, useBoardStore } from '@/store/useBoardStore';
import type { Item, Track } from '@/types/models';

export default function ListScreen() {
  const items = useBoardStore((state) => state.items);
  const addItem = useBoardStore((state) => state.addItem);
  const deleteItem = useBoardStore((state) => state.deleteItem);
  const [text, setText] = useState('');
  const [activeTrack, setActiveTrack] = useState<Track>('week');

  const pending = useMemo(() => items.filter((i) => !i.done && i.track === activeTrack), [items, activeTrack]);
  const weekClaimed = useMemo(() => isTrackClaimed(items, 'week'), [items]);
  const monthClaimed = useMemo(() => isTrackClaimed(items, 'month'), [items]);

  async function onAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    await addItem(trimmed, activeTrack);
  }

  return (
    <CorkBackground style={styles.container}>
      <View style={styles.safeArea}>
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
              <ItemRow item={item} dotColor={NoteColors[index % NoteColors.length]} onDelete={() => deleteItem(item.id)} />
            )}
          />
        )}

        {pending.length === 0 && (
          <EmptyState emoji="📝" rotation={1} style={StyleSheet.absoluteFill}>
            {`Nothing on your ${activeTrack} list yet.\nAdd the thing you've been putting off.`}
          </EmptyState>
        )}
      </View>
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
});
