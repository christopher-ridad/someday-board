export const Colors = {
  light: {
    text: '#4A2A1C',
    background: '#FDF1E6',
    backgroundElement: '#FFFBF5',
    backgroundSelected: '#F7E2CB',
    textSecondary: '#A8826C',
  },
  dark: {
    text: '#FDF1E6',
    background: '#2A1B12',
    backgroundElement: '#3A2618',
    backgroundSelected: '#4A3220',
    textSecondary: '#C7A88E',
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
export const Ratings = ['😐', '🙂', '😄', '🤩', '🏆'];
export const PinColors = ['#D64545', '#EDA426', '#B9BCC2', '#8C9B65', '#5B7FA6'];
export const Gold = '#8C9B65';
export const Violet = '#E8703A';

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
