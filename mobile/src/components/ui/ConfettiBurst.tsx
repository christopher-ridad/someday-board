import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Explosion from 'react-native-confetti-cannon';

import { NoteColors } from '@/constants/theme';

// Imperative: attach a ref and call `.start()` on a celebratory moment
// (landing a pull, saving a memory) — mirrors the original web app's
// canvas-based burstConfetti().
export const ConfettiBurst = forwardRef<Explosion>((_props, ref) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Explosion ref={ref} count={80} origin={{ x: 0, y: -20 }} autoStart={false} fadeOut colors={NoteColors} />
  </View>
));

ConfettiBurst.displayName = 'ConfettiBurst';
