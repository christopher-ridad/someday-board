import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

// A small glossy thumbtack, sitting above and overlapping whatever it's
// pinning — shared between board notes and memory photos so everything on
// the "corkboard" reads as physically pinned up, not just laid on a card.
export function Pin({ color, size = 14, style }: Props) {
  const highlightSize = size * 0.36;
  return (
    <View
      style={[
        styles.pin,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: -size / 2,
          backgroundColor: color,
        },
        style,
      ]}>
      <View
        style={[
          styles.highlight,
          {
            width: highlightSize,
            height: highlightSize,
            borderRadius: highlightSize / 2,
            top: size * 0.14,
            left: size * 0.21,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    position: 'absolute',
    left: '50%',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
});
