import { useEffect, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Ratings } from '@/constants/theme';
import { scrapStyle } from '@/lib/scrapLayout';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';
import type { PullPhase } from './useBoardPullAnimation';

const NOTE_SIZE = 96;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

interface Props {
  item: Item;
  boardWidth: number;
  boardHeight: number;
  phase: PullPhase;
  winnerId: string | null;
  dragDisabled: boolean;
  onDragEnd: (xPct: number, yPct: number) => void;
  onPress: () => void;
}

export function ScrapNote({ item, boardWidth, boardHeight, phase, winnerId, dragDisabled, onDragEnd, onPress }: Props) {
  const loadMemory = useBoardStore((state) => state.loadMemory);
  const photoUrlFor = useBoardStore((state) => state.photoUrlFor);
  const memory = useBoardStore((state) => state.memories[item.id]);
  const photoUrl = useBoardStore((state) => (memory?.photo_path ? (state.photoUrls[memory.photo_path] ?? null) : null));

  const layout = useMemo(() => scrapStyle(item.id), [item.id]);
  const xPct = item.position_x ?? layout.x;
  const yPct = item.position_y ?? layout.y;
  const baseLeft = (xPct / 100) * boardWidth;
  const baseTop = (yPct / 100) * boardHeight;

  useEffect(() => {
    if (item.done) loadMemory(item.id);
  }, [item.done, item.id, loadMemory]);

  useEffect(() => {
    if (memory?.photo_path) photoUrlFor(memory.photo_path);
  }, [memory?.photo_path, photoUrlFor]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const wiggle = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const isWinner = winnerId === item.id;
  const isOther = winnerId !== null && !isWinner;

  useEffect(() => {
    if (phase === 'windy') {
      wiggle.value = withRepeat(withSequence(withTiming(6, { duration: 120 }), withTiming(-6, { duration: 120 })), 6, true);
    } else if (phase === 'idle') {
      wiggle.value = withTiming(0, { duration: 150 });
    }
  }, [phase, wiggle]);

  useEffect(() => {
    if (phase !== 'resolving') return;
    if (isOther) {
      opacity.value = withDelay(Math.random() * 180, withTiming(0.25, { duration: 220 }));
    } else if (isWinner) {
      scale.value = withSequence(withTiming(1.15, { duration: 150 }), withTiming(1, { duration: 120 }));
      const fallDistance = boardHeight - baseTop + 260;
      const driftX = (Math.random() - 0.5) * 140;
      translateY.value = withDelay(370, withTiming(fallDistance, { duration: 700, easing: Easing.bezier(0.5, 0, 0.85, 1) }));
      translateX.value = withDelay(370, withTiming(driftX, { duration: 700 }));
      opacity.value = withDelay(370, withTiming(0, { duration: 700 }));
    }
  }, [phase, isOther, isWinner, baseTop, boardHeight, opacity, scale, translateX, translateY]);

  useEffect(() => {
    if (phase === 'idle') {
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 1;
      scale.value = 1;
    }
  }, [phase, opacity, scale, translateX, translateY]);

  const pan = Gesture.Pan()
    .enabled(!dragDisabled)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const moved = Math.abs(e.translationX) > 5 || Math.abs(e.translationY) > 5;
      if (moved) {
        const newLeft = clamp(baseLeft + e.translationX, 4, boardWidth - NOTE_SIZE - 4);
        const newTop = clamp(baseTop + e.translationY, 4, boardHeight - NOTE_SIZE - 4);
        translateX.value = newLeft - baseLeft;
        translateY.value = newTop - baseTop;
        runOnJS(onDragEnd)(((newLeft / boardWidth) * 100), (newTop / boardHeight) * 100);
      } else {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        if (item.done) runOnJS(onPress)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${layout.rotation + wiggle.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.note, { left: baseLeft, top: baseTop, borderTopColor: layout.pinColor }, animatedStyle]}>
        {item.done ? (
          photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={[styles.paper, { backgroundColor: layout.color }]}>
              <ThemedText style={styles.placeholderEmoji}>{memory && memory.rating != null ? Ratings[memory.rating] : '✅'}</ThemedText>
            </View>
          )
        ) : (
          <View style={[styles.paper, { backgroundColor: layout.color }]}>
            <ThemedText style={styles.noteText} numberOfLines={4}>
              {item.text}
            </ThemedText>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  note: {
    position: 'absolute',
    width: NOTE_SIZE,
    height: NOTE_SIZE,
    borderTopWidth: 6,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  paper: { flex: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', padding: 8 },
  photo: { flex: 1, borderRadius: 4 },
  noteText: { fontSize: 11, textAlign: 'center', color: '#3A2A1C' },
  placeholderEmoji: { fontSize: 22 },
});
