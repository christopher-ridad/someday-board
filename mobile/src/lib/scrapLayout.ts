import { NoteColors, NoteTextColors, PinColors } from '@/constants/theme';

// Deterministic pseudo-random generator seeded by item id, so each scrap
// keeps its spot on the board across re-renders instead of jumping around.
// Ported unchanged from the original web app's board.js.
function scrapSeed(id: string) {
  let h = 1779033703 ^ id.length;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function rng() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// The "safe zone" notes are seeded within — margin on every edge so a note
// never lands flush against the board's border.
const MIN_X = 8;
const MAX_X = 70;
const MIN_Y = 12;
const MAX_Y = 72;

export interface ScrapStyle {
  x: number;
  y: number;
  rotation: number;
  pinColor: string;
}

export function scrapStyle(id: string): ScrapStyle {
  const rng = scrapSeed(id);
  return {
    x: MIN_X + rng() * (MAX_X - MIN_X),
    y: MIN_Y + rng() * (MAX_Y - MIN_Y),
    rotation: -16 + rng() * 32,
    pinColor: PinColors[Math.floor(rng() * PinColors.length)],
  };
}

interface Point {
  x: number;
  y: number;
}

const MIN_SPACING = 16;
const PLACEMENT_ATTEMPTS = 30;

// Picks a spot for a newly-added note with real clearance from the notes
// already on the board, instead of pure random scatter — which starts
// overlapping fast once there are more than a handful of notes. Tries a
// batch of random candidates and keeps whichever ended up furthest from its
// nearest neighbor (a lightweight approximation of Poisson-disc sampling),
// rather than a full collision-solving layout — good enough to meaningfully
// push back when crowding starts, without needing to know anything about
// how big the board actually renders at.
export function placeNewNote(existing: Point[]): Point {
  let best: Point = { x: MIN_X + Math.random() * (MAX_X - MIN_X), y: MIN_Y + Math.random() * (MAX_Y - MIN_Y) };
  let bestClearance = clearanceOf(best, existing);

  for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS && bestClearance < MIN_SPACING; attempt++) {
    const candidate: Point = { x: MIN_X + Math.random() * (MAX_X - MIN_X), y: MIN_Y + Math.random() * (MAX_Y - MIN_Y) };
    const clearance = clearanceOf(candidate, existing);
    if (clearance > bestClearance) {
      best = candidate;
      bestClearance = clearance;
    }
  }
  return best;
}

function clearanceOf(point: Point, existing: Point[]): number {
  if (existing.length === 0) return Infinity;
  return Math.min(...existing.map((p) => Math.hypot(p.x - point.x, p.y - point.y)));
}

// Cycles through the full palette in order rather than picking randomly per
// note, so consecutive notes never repeat a color until every other color
// has been used once.
export function noteColorForIndex(index: number): string {
  return NoteColors[index % NoteColors.length];
}

export function noteTextColorForIndex(index: number): string {
  return NoteTextColors[index % NoteTextColors.length];
}
