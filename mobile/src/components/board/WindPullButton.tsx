import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Gold } from '@/constants/theme';

interface Props {
  disabled: boolean;
  pulling: boolean;
  onPress: () => void;
}

export function WindPullButton({ disabled, pulling, onPress }: Props) {
  return (
    <Pressable style={[styles.button, disabled && styles.disabled]} disabled={disabled} onPress={onPress}>
      <ThemedText style={styles.text}>{pulling ? 'LOOKING…' : 'PULL ONE OFF THE BOARD'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    backgroundColor: Gold,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
});
