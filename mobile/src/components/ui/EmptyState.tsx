import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface Props {
  emoji: string;
  children: string;
  rotation?: number;
  style?: StyleProp<ViewStyle>;
}

// A tilted index card for "nothing here yet" states, shared by Board, List,
// and Memories so the fix/design only lives in one place.
export function EmptyState({ emoji, children, rotation = -1, style }: Props) {
  return (
    // box-none: when used as a full-area overlay (see Board/List/Memories),
    // this needs to let touches through everywhere except the card itself —
    // otherwise it silently blocks taps on whatever it's layered over (e.g.
    // the track toggle), since a transparent View still intercepts touches
    // by default.
    <View style={[styles.wrapper, style]} pointerEvents="box-none">
      <View style={[styles.card, { transform: [{ rotate: `${rotation}deg` }] }]}>
        {/* fontSize alone isn't enough here — ThemedText's default type also
            sets lineHeight: 24, which clips anything larger than that
            unless it's explicitly overridden too. */}
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.text}>
          {children}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  card: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(253,250,242,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,178,138,0.35)',
    shadowColor: '#4A2A1C',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emoji: { fontSize: 40, lineHeight: 48 },
  text: { textAlign: 'center', lineHeight: 20 },
});
