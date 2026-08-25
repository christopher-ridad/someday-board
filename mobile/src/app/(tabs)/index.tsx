import { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import type Explosion from 'react-native-confetti-cannon';

import { ChallengeTicket } from '@/components/board/ChallengeTicket';
import { ScrapNote } from '@/components/board/ScrapNote';
import { TrackToggle } from '@/components/board/TrackToggle';
import { useBoardPullAnimation } from '@/components/board/useBoardPullAnimation';
import { WindPullButton } from '@/components/board/WindPullButton';
import { MemoryDetailModal } from '@/components/memories/MemoryDetailModal';
import { MemoryModal } from '@/components/memories/MemoryModal';
import { ConfettiBurst } from '@/components/ui/ConfettiBurst';
import { CorkBackground } from '@/components/ui/CorkBackground';
import { EmptyState } from '@/components/ui/EmptyState';
import { isTrackClaimed, poolForTrack, useBoardStore } from '@/store/useBoardStore';
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

  // Completed items move to (and stay in) Memories rather than piling up
  // here indefinitely — the board only ever shows what's still pending, so
  // it doesn't get more crowded the longer you use the app.
  const pendingItems = useMemo(() => items.filter((i) => !i.done), [items]);
  // Week and Month are separate boards — each only shows the items
  // belonging to that track, not just a shared pull pool filtered by it.
  const pendingTrackItems = useMemo(() => pendingItems.filter((i) => i.track === activeTrack), [pendingItems, activeTrack]);
  const pool = useMemo(() => poolForTrack(items, activeTrack), [items, activeTrack]);
  const currentChallenge = useMemo(() => items.find((i) => i.claimed_track === activeTrack) ?? null, [items, activeTrack]);
  const weekClaimed = useMemo(() => isTrackClaimed(items, 'week'), [items]);
  const monthClaimed = useMemo(() => isTrackClaimed(items, 'month'), [items]);

  // Colors cycle through the palette in pending-note order — that way notes
  // pinned one after another never repeat a color.
  const colorIndexById = useMemo(() => {
    const map = new Map<string, number>();
    let i = 0;
    for (const item of pendingTrackItems) map.set(item.id, i++);
    return map;
  }, [pendingTrackItems]);

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

  // Stable across re-renders (unlike inline arrow functions closing over
  // `item` in the .map() below) so ScrapNote's memoized gesture doesn't need
  // to be torn down and rebuilt whenever the board re-renders — recreating
  // a note's native gesture recognizer while a drag on it is mid-touch is a
  // real way to crash native-side.
  const handleDragEnd = useCallback((itemId: string, xPct: number, yPct: number) => {
    useBoardStore.getState().updatePosition(itemId, xPct, yPct);
  }, []);
  const handleRotateEnd = useCallback((itemId: string, degrees: number) => {
    useBoardStore.getState().updateRotation(itemId, degrees);
  }, []);
  const handleOpenDetail = useCallback((itemId: string) => setDetailItemId(itemId), []);

  return (
    <CorkBackground style={styles.container}>
      <View style={styles.safeArea}>
        <TrackToggle
          track={activeTrack}
          onChange={setActiveTrack}
          weekClaimed={weekClaimed}
          monthClaimed={monthClaimed}
          disabled={pulling}
        />

        <View style={styles.board} onLayout={onLayout}>
          {/* Every item stays mounted regardless of which track is active —
              only visible toggles. Unmounting/remounting a note tears down
              and rebuilds its native gesture recognizers, and doing that
              for every note at once on every tab switch is what made
              toggling feel slow; a style flip is instant. */}
          {pendingItems.length > 0 && boardSize.width > 0 && (
            <View style={[styles.notes, currentChallenge && styles.notesDimmed]}>
              {pendingItems.map((item) => (
                <ScrapNote
                  key={item.id}
                  item={item}
                  visible={item.track === activeTrack}
                  colorIndex={colorIndexById.get(item.id) ?? 0}
                  boardWidth={boardSize.width}
                  boardHeight={boardSize.height}
                  phase={phase}
                  winnerId={winnerId}
                  dragDisabled={pulling}
                  onDragEnd={handleDragEnd}
                  onRotateEnd={handleRotateEnd}
                  onPress={handleOpenDetail}
                />
              ))}
            </View>
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

        {pendingTrackItems.length === 0 && (
          <EmptyState emoji="🍂" style={StyleSheet.absoluteFill}>
            {`Nothing on your ${activeTrack} board yet.\nAdd something you could do this ${activeTrack}.`}
          </EmptyState>
        )}
      </View>

      <MemoryModal
        itemId={completingItemId}
        itemText={completingItem?.text ?? ''}
        onClose={() => setCompletingItemId(null)}
        onSaved={() => confettiRef.current?.start()}
      />
      <MemoryDetailModal item={detailItem} onClose={() => setDetailItemId(null)} />
      <ConfettiBurst ref={confettiRef} />
    </CorkBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  board: { flex: 1 },
  notes: { flex: 1 },
  notesDimmed: { opacity: 0.35 },
});
