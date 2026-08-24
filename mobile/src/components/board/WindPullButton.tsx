import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/ui/PressableScale';
import { Gold } from '@/constants/theme';

interface Props {
  disabled: boolean;
  pulling: boolean;
  onPress: () => void;
}

export function WindPullButton({ disabled, pulling, onPress }: Props) {
  return (
    <PressableScale style={[styles.button, disabled && styles.disabled]} disabled={disabled} onPress={onPress}>
      <ThemedText type="title" style={styles.text}>
        {pulling ? 'Looking…' : 'Pull one off the board'}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    backgroundColor: Gold,
    // Fixed height + justifyContent:center, rather than symmetric padding —
    // padding only guarantees equal space around the text's *line box*, and
    // a custom font's internal ascent/descent split inside that box can
    // still leave the glyphs looking off-center regardless. Centering the
    // whole box within a known-size container sidesteps that.
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  // A solid muted fill instead of just fading the opacity — a
  // half-transparent gold button blends into the busy cork texture behind
  // it almost completely, so "disabled" ends up reading as "invisible"
  // rather than "visible but not tappable."
  disabled: { backgroundColor: '#C7BBA8', borderBottomColor: 'rgba(0,0,0,0.08)' },
  // Permanent Marker (the hand-drawn font used for titles elsewhere) instead
  // of the typewriter face — that one reads as an official stamp/document,
  // this one actually looks whimsical. It's already visually bold/thick as
  // a marker font, so no faux-bold trick needed here.
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
