/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

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

// Ported from the original web app's constants.js — the corkboard note colors,
// pin colors, and completion-rating emoji.
export const NoteColors = ['#8C9B65', '#EDA426', '#E8703A', '#F6C89F', '#E15B3E', '#C9B896'];
export const Ratings = ['😐', '🙂', '😄', '🤩', '🏆'];
export const PinColors = ['#D64545', '#EDA426', '#B9BCC2', '#8C9B65', '#5B7FA6'];
export const Gold = '#8C9B65';
export const Violet = '#E8703A';

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    mono: 'monospace',
  },
});
