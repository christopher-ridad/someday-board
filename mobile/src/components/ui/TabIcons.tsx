import { Circle, Line, Path, Rect, Svg } from 'react-native-svg';

// Ported line-icons from the original web app's bottom nav (index.html) —
// a pin for Board, a checklist for List, a camera for Memories — instead of
// generic/emoji tab icons, for visual consistency with the rest of the port.

interface IconProps {
  color: string;
  size?: number;
}

export function BoardIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx={12} cy={8} r={4} />
      <Line x1={12} y1={12} x2={12} y2={20} />
    </Svg>
  );
}

export function ListIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M9 6h11M9 12h11M9 18h11" />
      <Circle cx={4.5} cy={6} r={1.4} fill={color} stroke="none" />
      <Circle cx={4.5} cy={12} r={1.4} fill={color} stroke="none" />
      <Circle cx={4.5} cy={18} r={1.4} fill={color} stroke="none" />
    </Svg>
  );
}

export function MemoriesIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Rect x={3} y={6} width={18} height={14} rx={2} />
      <Path d="M8 6l1.5-2.5h5L16 6" />
      <Circle cx={12} cy={13} r={3.2} />
    </Svg>
  );
}

export function GearIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx={12} cy={12} r={3} />
      <Path
        d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
        strokeLinecap="round"
      />
    </Svg>
  );
}
