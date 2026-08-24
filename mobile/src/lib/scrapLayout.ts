import { NoteColors, PinColors } from '@/constants/theme';

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

export interface ScrapStyle {
  x: number;
  y: number;
  rotation: number;
  color: string;
  pinColor: string;
}

export function scrapStyle(id: string): ScrapStyle {
  const rng = scrapSeed(id);
  return {
    x: 8 + rng() * 62,
    y: 12 + rng() * 60,
    rotation: -16 + rng() * 32,
    color: NoteColors[Math.floor(rng() * NoteColors.length)],
    pinColor: PinColors[Math.floor(rng() * PinColors.length)],
  };
}
