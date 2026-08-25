import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { MemoryCard } from '@/components/memories/MemoryCard';
import { MemoryDetailModal } from '@/components/memories/MemoryDetailModal';
import { ThemedText } from '@/components/themed-text';
import { CorkBackground } from '@/components/ui/CorkBackground';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Gold } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';

export default function MemoriesScreen() {
  const items = useBoardStore((state) => state.items);
  const loading = useBoardStore((state) => state.loading);
  const memories = useBoardStore((state) => state.memories);
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  // Most recently completed first — memories[id]?.created_at is when it was
  // actually finished, not item.created_at (when it was first added to the
  // list), which is what items already come sorted by.
  const done = useMemo(() => {
    return items
      .filter((i) => i.done)
      .slice()
      .sort((a, b) => (memories[b.id]?.created_at ?? b.created_at).localeCompare(memories[a.id]?.created_at ?? a.created_at));
  }, [items, memories]);
  const pendingCount = items.length - done.length;

  return (
    <CorkBackground style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.statRow}>
          <Stat num={done.length} label="DONE" />
          <Stat num={pendingCount} label="WAITING" />
          <Stat num={items.length} label="TOTAL" />
        </View>

        {done.length > 0 && (
          <FlatList
            data={done}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            renderItem={({ item, index }) => (
              // Alternating tilt per card, like photos casually taped into a
              // scrapbook rather than a perfectly aligned grid.
              <MemoryCard item={item} rotation={index % 2 === 0 ? -1.4 : 1.1} onPress={() => setDetailItem(item)} />
            )}
          />
        )}

        {loading ? (
          <LoadingState style={StyleSheet.absoluteFill} />
        ) : (
          done.length === 0 && (
            <EmptyState emoji="🎞️" style={StyleSheet.absoluteFill}>
              {'No memories yet.\nPull one off the board and go make one.'}
            </EmptyState>
          )
        )}
      </View>
      <MemoryDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </CorkBackground>
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
  statRow: { flexDirection: 'row', gap: 10, padding: 16 },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255,251,245,0.92)',
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 14,
  },
  statNum: { fontSize: 26, color: Gold },
  statLabel: { fontSize: 10 },
  grid: { paddingHorizontal: 8, paddingBottom: 24, paddingTop: 8 },
});
