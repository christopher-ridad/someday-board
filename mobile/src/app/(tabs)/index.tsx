import { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import type Explosion from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChallengeTicket } from '@/components/board/ChallengeTicket';
import { ScrapNote } from '@/components/board/ScrapNote';
import { TrackToggle } from '@/components/board/TrackToggle';
import { useBoardPullAnimation } from '@/components/board/useBoardPullAnimation';
import { WindPullButton } from '@/components/board/WindPullButton';
import { MemoryDetailModal } from '@/components/memories/MemoryDetailModal';
import { MemoryModal } from '@/components/memories/MemoryModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ConfettiBurst } from '@/components/ui/ConfettiBurst';
import { poolForTrack, useBoardStore } from '@/store/useBoardStore';
import type { Track } from '@/types/models';

export default function BoardScreen() {
  const items = useBoardStore((state) => state.items);
  const releaseChallenge = useBoardStore((state) => state.releaseChallenge);
  const [activeTrack, setActiveTrack] = useState<Track>('week');
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [completingItemId, setCompletingItemId] = useState<string | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const confettiRef = useRef<Explosion>(null);
  const { phase, winnerId, pulling, pull } = useBoardPullAnimation(() => confettiRef.current?.start());

  const pool = useMemo(() => poolForTrack(items), [items]);
  const currentChallenge = useMemo(() => items.find((i) => i.claimed_track === activeTrack) ?? null, [items, activeTrack]);
  const weekClaimed = useMemo(() => items.some((i) => i.claimed_track === 'week'), [items]);
  const monthClaimed = useMemo(() => items.some((i) => i.claimed_track === 'month'), [items]);

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setBoardSize({ width, height });
  }

  async function onLetGo() {
    if (!currentChallenge) return;
    await releaseChallenge(activeTrack);
  }

  const completingItem = items.find((i) => i.id === completingItemId);
  const detailItem = items.find((i) => i.id === detailItemId) ?? null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TrackToggle
          track={activeTrack}
          onChange={setActiveTrack}
          weekClaimed={weekClaimed}
          monthClaimed={monthClaimed}
          disabled={pulling}
        />

        <View style={styles.board} onLayout={onLayout}>
          {items.length === 0 ? (
            <View style={styles.empty}>
              <ThemedText style={styles.emptyEmoji}>🍂</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Nothing on the board yet.{'\n'}Add something you keep putting off.
              </ThemedText>
            </View>
          ) : (
            boardSize.width > 0 && (
              <View style={[styles.notes, currentChallenge && styles.notesDimmed]}>
                {items.map((item) => (
                  <ScrapNote
                    key={item.id}
                    item={item}
                    boardWidth={boardSize.width}
                    boardHeight={boardSize.height}
                    phase={phase}
                    winnerId={winnerId}
                    dragDisabled={pulling}
                    onDragEnd={(xPct, yPct) => useBoardStore.getState().updatePosition(item.id, xPct, yPct)}
                    onPress={() => setDetailItemId(item.id)}
                  />
                ))}
              </View>
            )
          )}

          {currentChallenge ? (
            <ChallengeTicket
              track={activeTrack}
              item={currentChallenge}
              onDone={() => setCompletingItemId(currentChallenge.id)}
              onLetGo={onLetGo}
            />
          ) : (
            <WindPullButton
              disabled={pool.length < 1 || pulling}
              pulling={pulling}
              onPress={() => pull(activeTrack, pool)}
            />
          )}
        </View>
      </SafeAreaView>

      <MemoryModal
        itemId={completingItemId}
        itemText={completingItem?.text ?? ''}
        onClose={() => setCompletingItemId(null)}
        onSaved={() => confettiRef.current?.start()}
      />
      <MemoryDetailModal item={detailItem} onClose={() => setDetailItemId(null)} />
      <ConfettiBurst ref={confettiRef} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  board: { flex: 1 },
  notes: { flex: 1 },
  notesDimmed: { opacity: 0.35 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { textAlign: 'center', lineHeight: 20 },
});
