import { Pressable, type PressableProps } from 'react-native';

// A drop-in Pressable with a small tactile "squish" on press (scale + a
// slight opacity dip) — the original web app has this via CSS
// `:active{ transform: scale(0.98) }` on its buttons; RN's Pressable has no
// built-in equivalent, so every button in the app was tapping with zero
// feedback. Accepts the same `style` prop (object, array, or function) as
// Pressable and layers the press effect underneath it.
export function PressableScale({ style, ...rest }: PressableProps) {
  return (
    <Pressable
      style={(state) => [
        { transform: [{ scale: state.pressed ? 0.96 : 1 }], opacity: state.pressed ? 0.85 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    />
  );
}
