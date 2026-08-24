import type { Track } from '@/types/models';

export const TRACKS: Record<Track, { label: string; ms: number }> = {
  week: { label: 'This Week', ms: 7 * 86400000 },
  month: { label: 'This Month', ms: 30 * 86400000 },
};
