import { useEffect, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Pin } from '@/components/ui/Pin';
import { Fonts, Ratings } from '@/constants/theme';
import { scrapStyle } from '@/lib/scrapLayout';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';
import type { PullPhase } from './useBoardPullAnimation';

const NOTE_WIDTH = 96;
const PENDING_HEIGHT = 96;
// Done notes are a real polaroid card — photo, title, date — so they need
// more vertical room than a plain square sticky note.
const DONE_HEIGHT = 134;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}

interface Props {
  item: Item;
  boardWidth: number;
  boardHeight: number;
  phase: PullPhase;
  winnerId: string | null;
  dragDisabled: boolean;
  onDragEnd: (itemId: string, xPct: number, yPct: number) => void;
  onPress: (itemId: string) => void;
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
  const noteHeight = item.done ? DONE_HEIGHT : PENDING_HEIGHT;

  useEffect(() => {
    if (item.done) loadMemory(item.id);
  }, [item.done, item.id, loadMemory]);

  useEffect(() => {
    if (memory?.photo_path) photoUrlFor(memory.photo_path);
  }, [memory?.photo_path, photoUrlFor]);

  // posX/posY are the note's absolute left/top in pixels — the single
  // source of truth for where it renders. Earlier this was split between a
  // static `left`/`top` style (from baseLeft/baseTop) and a separate
  // animated transform offset, which could never be guaranteed to update in
  // the same frame (one's driven by a React re-render, the other by
  // Reanimated on the UI thread) — that mismatch was the cause of a visible
  // flicker right after a drag committed. dragStartX/Y capture where the
  // note was when a gesture began, so .onUpdate can compute from a stable
  // anchor rather than fighting the value it's also mutating.
  const posX = useSharedValue(baseLeft);
  const posY = useSharedValue(baseTop);
  const dragStartX = useSharedValue(baseLeft);
  const dragStartY = useSharedValue(baseTop);
  const wiggle = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const isWinner = winnerId === item.id;
  const isOther = winnerId !== null && !isWinner;

  // Keep posX/posY in sync with the committed position — on mount, and
  // whenever it changes from outside the gesture below (our own drag
  // already set posX/posY to this same value, so this is a no-op then).
  useEffect(() => {
    posX.value = baseLeft;
    posY.value = baseTop;
  }, [baseLeft, baseTop, posX, posY]);

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
      posY.value = withDelay(370, withTiming(baseTop + fallDistance, { duration: 700, easing: Easing.bezier(0.5, 0, 0.85, 1) }));
      posX.value = withDelay(370, withTiming(baseLeft + driftX, { duration: 700 }));
      opacity.value = withDelay(370, withTiming(0, { duration: 700 }));
    }
  }, [phase, isOther, isWinner, baseTop, baseLeft, boardHeight, opacity, scale, posX, posY]);

  useEffect(() => {
    if (phase === 'idle') {
      posX.value = baseLeft;
      posY.value = baseTop;
      opacity.value = 1;
      scale.value = 1;
    }
  }, [phase, baseLeft, baseTop, opacity, scale, posX, posY]);

  // Extracted as primitives before the gesture is built, so the worklet's
  // closure captures plain numbers/strings/booleans/stable-function-refs
  // rather than the whole `item` object or an inline per-render closure.
  const itemId = item.id;
  const isDone = item.done;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!dragDisabled)
        .onStart(() => {
          dragStartX.value = posX.value;
          dragStartY.value = posY.value;
        })
        .onUpdate((e) => {
          posX.value = dragStartX.value + e.translationX;
          posY.value = dragStartY.value + e.translationY;
        })
        .onEnd((e) => {
          const moved = Math.abs(e.translationX) > 5 || Math.abs(e.translationY) > 5;
          if (moved) {
            const newLeft = clamp(dragStartX.value + e.translationX, 4, boardWidth - NOTE_WIDTH - 4);
            const newTop = clamp(dragStartY.value + e.translationY, 4, boardHeight - noteHeight - 4);
            posX.value = newLeft;
            posY.value = newTop;
            runOnJS(onDragEnd)(itemId, (newLeft / boardWidth) * 100, (newTop / boardHeight) * 100);
          } else {
            posX.value = withTiming(dragStartX.value);
            posY.value = withTiming(dragStartY.value);
            if (isDone) runOnJS(onPress)(itemId);
          }
        }),
    [dragDisabled, boardWidth, boardHeight, noteHeight, itemId, isDone, onDragEnd, onPress, posX, posY, dragStartX, dragStartY]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    left: posX.value,
    top: posY.value,
    transform: [{ rotate: `${layout.rotation + wiggle.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const dateStr = memory?.created_at
    ? new Date(memory.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.note, { width: NOTE_WIDTH, height: noteHeight }, animatedStyle]}>
        {item.done ? (
          <View style={styles.polaroidCard}>
            <View style={styles.photoFrame}>
              <View style={styles.photoWrap}>
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={styles.photo} />
                ) : (
                  <ThemedText style={styles.placeholderEmoji}>
                    {memory && memory.rating != null ? Ratings[memory.rating] : '✅'}
                  </ThemedText>
                )}
              </View>
            </View>
            <View style={styles.caption}>
              <ThemedText numberOfLines={1} style={styles.captionTitle}>
                {item.text}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.captionDate}>
                {dateStr}
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={[styles.paper, { backgroundColor: layout.color }]}>
            <ThemedText style={styles.noteText} numberOfLines={4}>
              {item.text}
            </ThemedText>
          </View>
        )}
        <Pin color={layout.pinColor} size={14} style={styles.pin} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  note: {
    position: 'absolute',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pin: { top: -7 },
  paper: { flex: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', padding: 8 },
  // Full polaroid card for a completed item: white card, photo mounted with
  // a thin margin, title + date underneath like a caption — the same
  // structure as the Memories grid card, just smaller.
  polaroidCard: { flex: 1, backgroundColor: '#FFFBF5', borderRadius: 4 },
  photoFrame: { padding: 5, paddingBottom: 3 },
  photoWrap: {
    aspectRatio: 1,
    borderRadius: 2,
    backgroundColor: '#F7E2CB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  caption: { paddingHorizontal: 6, paddingBottom: 4 },
  captionTitle: { fontSize: 9, fontFamily: Fonts.bodySemiBold, lineHeight: 11 },
  captionDate: { fontSize: 8, lineHeight: 10, marginTop: 1 },
  noteText: { fontSize: 11, textAlign: 'center', color: '#3A2A1C' },
  placeholderEmoji: { fontSize: 22, lineHeight: 26 },
});
