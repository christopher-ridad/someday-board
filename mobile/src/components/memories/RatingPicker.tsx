import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Ratings } from '@/constants/theme';

interface Props {
  value: number | null;
  onChange: (index: number) => void;
}

export function RatingPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {Ratings.map((emoji, index) => (
        <Pressable
          key={index}
          onPress={() => onChange(index)}
          style={[styles.emojiButton, value === index && styles.emojiButtonActive]}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  emojiButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emojiButtonActive: { borderColor: Colors.light.text, backgroundColor: Colors.light.backgroundSelected },
  emoji: { fontSize: 26 },
});
