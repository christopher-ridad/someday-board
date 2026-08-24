import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { MemoryCard } from '@/components/memories/MemoryCard';
import { MemoryDetailModal } from '@/components/memories/MemoryDetailModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Gold } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';

export default function MemoriesScreen() {
  const items = useBoardStore((state) => state.items);
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  const done = useMemo(() => items.filter((i) => i.done), [items]);
  const pendingCount = items.length - done.length;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.statRow}>
          <Stat num={done.length} label="DONE" />
          <Stat num={pendingCount} label="WAITING" />
          <Stat num={items.length} label="TOTAL" />
        </View>

        {done.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyEmoji}>🎞️</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              No memories yet.{'\n'}Pull one off the board and go make one.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={done}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => <MemoryCard item={item} onPress={() => setDetailItem(item)} />}
          />
        )}
      </View>
      <MemoryDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </ThemedView>
  );
}

function Stat({ num, label }: { num: number; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="title" style={styles.statNum}>
        {num}
      </ThemedText>
      <ThemedText type="label" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 26, color: Gold },
  statLabel: { fontSize: 10 },
  grid: { paddingHorizontal: 8, paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { textAlign: 'center', lineHeight: 20 },
});
