import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { useBoardStore } from '@/store/useBoardStore';
import type { Item, Track } from '@/types/models';

export type PullPhase = 'idle' | 'windy' | 'resolving' | 'landed';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Orchestrates the "pull one off the board" sequence. Winner selection and
// timing live here in plain JS; each ScrapNote reacts to `phase`/`winnerId`
// with its own Reanimated worklets (see ScrapNote.tsx).
export function useBoardPullAnimation(onLanded?: () => void) {
  const [phase, setPhase] = useState<PullPhase>('idle');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const claimChallenge = useBoardStore((state) => state.claimChallenge);

  const pull = useCallback(
    async (track: Track, pool: Item[]) => {
      if (phase !== 'idle' || pool.length === 0) return;
      const winner = pool[Math.floor(Math.random() * pool.length)];

      setWinnerId(winner.id);
      setPhase('windy');
      await delay(1100);

      setPhase('resolving');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(370 + 700 + 150);

      await claimChallenge(track, winner.id);
      setPhase('landed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onLanded?.();
      await delay(500);

      setPhase('idle');
      setWinnerId(null);
    },
    [phase, claimChallenge, onLanded]
  );

  return { phase, winnerId, pulling: phase !== 'idle', pull };
}
