import type { Track } from '@/types/models';

export const TRACKS: Record<Track, { shortLabel: string; ms: number }> = {
  week: { shortLabel: 'WEEK', ms: 7 * 86400000 },
  month: { shortLabel: 'MONTH', ms: 30 * 86400000 },
};
