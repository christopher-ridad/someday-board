// One warm scrapbook palette — the app doesn't have a dark mode (neither
// does the original web app), so this isn't a light/dark pair.
export const Colors = {
  light: {
    text: '#4A2A1C',
    background: '#FDF1E6',
    backgroundElement: '#FFFBF5',
    backgroundSelected: '#F7E2CB',
    textSecondary: '#A8826C',
  },
} as const;

// Sticky-note colors, spanning the vibe of Post-it's named collections
// (Supernova Neon, Energy Boost, Playful Primaries, Wanderlust Pastels,
// Oasis, Summer Joy, Simply Serene, Beachside Café, Floral Fantasy,
// Poptimistic, Sweet Sprinkles) so the board reads as a real eclectic pile
// of different-colored notes rather than a handful of house-brand shades.
export const NoteColors = [
  '#FF3EA5', // Supernova Neon — tropical pink
  '#C6F135', // Supernova Neon — acid lime
  '#2FE6D9', // Supernova Neon — aqua splash
  '#FF7A29', // Energy Boost — vital orange
  '#FFD23F', // Playful Primaries — yellow
  '#3D5AF1', // Playful Primaries — blue
  '#2ECC71', // Playful Primaries — green
  '#E63946', // Playful Primaries — red
  '#C9B6E4', // Wanderlust Pastels — lavender
  '#FDE9A0', // Wanderlust Pastels — butter yellow
  '#2A9D8F', // Oasis — teal
  '#FF8FA3', // Summer Joy — coral pink
  '#8ECFEE', // Summer Joy — light blue
  '#A3B899', // Simply Serene — muted sage
  '#D97B5F', // Beachside Café — terracotta
  '#E88BA6', // Floral Fantasy — rose
  '#E4007C', // Poptimistic — fuchsia
  '#FFC4E1', // Sweet Sprinkles — cotton candy pink
];

// Perceived-brightness formula (the standard trick for picking readable
// black-vs-white text over an arbitrary background color): the palette
// spans neon pastels through saturated blue/red/teal/fuchsia, so a single
// hardcoded text color reads fine on the light ones and unreadable on the
// dark ones — this picks per-color instead.
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export const NoteTextColors = NoteColors.map((hex) => (isLightColor(hex) ? '#3A2A1C' : '#FFFBF5'));

export const Ratings = ['😐', '🙂', '😄', '🤩', '🏆'];
export const PinColors = ['#D64545', '#EDA426', '#B9BCC2', '#8C9B65', '#5B7FA6'];
export const Gold = '#8C9B65';

export type ThemeColor = keyof typeof Colors.light;

// Ported from the original web app's Google Fonts: Permanent Marker for
// big hand-drawn display text (titles, stat numbers), Special Elite
// (typewriter) for small tracked-letter-spacing labels, Work Sans as the
// general body font. Loaded via useFonts() in the root layout.
export const Fonts = {
  display: 'PermanentMarker_400Regular',
  typewriter: 'SpecialElite_400Regular',
  body: 'WorkSans_400Regular',
  bodyMedium: 'WorkSans_500Medium',
  bodySemiBold: 'WorkSans_600SemiBold',
  bodyBold: 'WorkSans_700Bold',
};
