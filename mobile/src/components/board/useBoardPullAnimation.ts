import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { useBoardStore } from '@/store/useBoardStore';
import type { Item, Track } from '@/types/models';

export type PullPhase = 'idle' | 'windy' | 'resolving' | 'landed';

// Shared with ScrapNote.tsx so its Reanimated timings stay in lockstep with
// this orchestration. The resolving stage reads: pin pops loose, then the
// note glides to board-center and grows, then it fades out right as
// claimChallenge() mounts ChallengeTicket (which plays its own entrance
// animation) at that same spot — a hand-off, not a hard cut.
export const WINDY_MS = 3000;
export const PIN_POP_MS = 550;
export const MOVE_MS = 900;
export const FADE_MS = 300;
const LANDED_MS = 500;

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
      await delay(WINDY_MS);

      setPhase('resolving');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(PIN_POP_MS + MOVE_MS);

      await claimChallenge(track, winner.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onLanded?.();
      await delay(FADE_MS);

      setPhase('landed');
      await delay(LANDED_MS);

      setPhase('idle');
      setWinnerId(null);
    },
    [phase, claimChallenge, onLanded]
  );

  return { phase, winnerId, pulling: phase !== 'idle', pull };
}
