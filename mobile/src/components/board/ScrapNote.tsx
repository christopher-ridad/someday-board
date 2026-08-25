import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { MemoryPhoto } from '@/components/ui/MemoryPhoto';
import { Pin } from '@/components/ui/Pin';
import { Fonts } from '@/constants/theme';
import { useMemoryPhoto } from '@/hooks/useMemoryPhoto';
import { formatShortDate } from '@/lib/date';
import { noteColorForIndex, noteTextColorForIndex, scrapStyle } from '@/lib/scrapLayout';
import type { Item } from '@/types/models';
import { MOVE_MS, PIN_POP_MS, WINDY_MS, type PullPhase } from './useBoardPullAnimation';

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
  visible: boolean;
  colorIndex: number;
  boardWidth: number;
  boardHeight: number;
  phase: PullPhase;
  winnerId: string | null;
  dragDisabled: boolean;
  onDragEnd: (itemId: string, xPct: number, yPct: number) => void;
  onRotateEnd: (itemId: string, degrees: number) => void;
  onPress: (itemId: string) => void;
}

// Memoized so dragging, rotating, or completing one note doesn't re-render
// every other note on the board — only the notes whose props actually
// changed (all of them, legitimately, during a shared phase/winnerId
// transition; none of them for an unrelated note's own gesture commit).
export const ScrapNote = memo(function ScrapNote({
  item,
  visible,
  colorIndex,
  boardWidth,
  boardHeight,
  phase,
  winnerId,
  dragDisabled,
  onDragEnd,
  onRotateEnd,
  onPress,
}: Props) {
  const { memory, photoUrl } = useMemoryPhoto(item.done ? item.id : null);

  const layout = useMemo(() => scrapStyle(item.id), [item.id]);
  const xPct = item.position_x ?? layout.x;
  const yPct = item.position_y ?? layout.y;
  const baseLeft = (xPct / 100) * boardWidth;
  const baseTop = (yPct / 100) * boardHeight;
  // Notes start at a seeded natural-looking tilt (layout.rotation) but can be
  // rotated by hand afterward — item.rotation, once set, is the persisted
  // override.
  const baseRotation = item.rotation ?? layout.rotation;
  const noteHeight = item.done ? DONE_HEIGHT : PENDING_HEIGHT;

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
  const rotation = useSharedValue(baseRotation);
  const rotateStart = useSharedValue(baseRotation);
  const wiggle = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const pinOffset = useSharedValue(0);
  const pinOpacity = useSharedValue(1);

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
    rotation.value = baseRotation;
  }, [baseRotation, rotation]);

  useEffect(() => {
    if (phase === 'windy') {
      // A slow gust sweeping left-to-right across the board: each note's
      // sway is delayed by its horizontal position, so they lean one after
      // another like an actual breeze passing through, rather than every
      // note moving in lockstep.
      const gustSpread = WINDY_MS * 0.5;
      const gustDelay = boardWidth > 0 ? (baseLeft / boardWidth) * gustSpread : 0;
      const segment = (WINDY_MS - gustSpread) / 3;
      wiggle.value = withDelay(
        gustDelay,
        withSequence(
          withTiming(6, { duration: segment, easing: Easing.out(Easing.quad) }),
          withTiming(-3, { duration: segment }),
          withTiming(0, { duration: segment })
        )
      );
    }
  }, [phase, boardWidth, baseLeft, wiggle]);

  useEffect(() => {
    if (phase !== 'resolving') return;
    if (isOther) {
      opacity.value = withDelay(Math.random() * 180, withTiming(0.25, { duration: 220 }));
    } else if (isWinner) {
      // The pin pulls free first, then the note itself glides to
      // board-center, straightens, and grows — becoming the ticket, rather
      // than flying off the board. It fades out right as claimChallenge()
      // mounts ChallengeTicket at that same spot (see
      // useBoardPullAnimation), so one visually hands off to the other.
      pinOffset.value = withTiming(-22, { duration: 500, easing: Easing.out(Easing.quad) });
      pinOpacity.value = withDelay(180, withTiming(0, { duration: 350 }));

      const centerX = boardWidth / 2 - NOTE_WIDTH / 2;
      const centerY = boardHeight / 2 - noteHeight / 2;
      const straighten = -0.6 - rotation.value;

      posX.value = withDelay(PIN_POP_MS, withTiming(centerX, { duration: MOVE_MS, easing: Easing.out(Easing.cubic) }));
      posY.value = withDelay(PIN_POP_MS, withTiming(centerY, { duration: MOVE_MS, easing: Easing.out(Easing.cubic) }));
      wiggle.value = withDelay(PIN_POP_MS, withTiming(straighten, { duration: MOVE_MS }));
      scale.value = withDelay(PIN_POP_MS, withTiming(1.55, { duration: MOVE_MS, easing: Easing.out(Easing.cubic) }));
      opacity.value = withDelay(PIN_POP_MS + MOVE_MS, withTiming(0, { duration: 300 }));
    }
  }, [phase, isOther, isWinner, boardWidth, boardHeight, noteHeight, opacity, scale, wiggle, posX, posY, rotation, pinOffset, pinOpacity]);

  useEffect(() => {
    if (phase === 'idle') {
      posX.value = baseLeft;
      posY.value = baseTop;
      opacity.value = 1;
      scale.value = 1;
      wiggle.value = withTiming(0, { duration: 150 });
      pinOffset.value = 0;
      pinOpacity.value = 1;
    }
  }, [phase, baseLeft, baseTop, opacity, scale, posX, posY, wiggle, pinOffset, pinOpacity]);

  // Extracted as primitives before the gesture is built, so the worklet's
  // closure captures plain numbers/strings/booleans/stable-function-refs
  // rather than the whole `item` object or an inline per-render closure.
  const itemId = item.id;
  const isDone = item.done;

  // Pan requires the touch to travel past its activation distance before it
  // recognizes anything at all — a true stationary tap never crosses that
  // threshold, so it never activates and its onEnd never fires. A separate
  // Tap gesture, raced against it, is what actually catches a tap: Race lets
  // whichever gesture activates first win, so a real drag still wins the
  // Pan side (Tap gets cancelled once it moves too far) while a stationary
  // tap — which Pan never activates for — is caught by Tap instead.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!dragDisabled && visible)
        .minDistance(10)
        // Two-finger touches are for the rotate gesture below — without
        // this, Pan's own translation heuristics can still react to the
        // second finger and fight with it.
        .maxPointers(1)
        // Notes are small (96px), so their own bounds barely fit two
        // fingers for the rotate gesture below — this extends every
        // gesture's touch-recognition area beyond the visible note without
        // changing how big it actually renders.
        .hitSlop(28)
        .onStart(() => {
          dragStartX.value = posX.value;
          dragStartY.value = posY.value;
        })
        .onUpdate((e) => {
          posX.value = dragStartX.value + e.translationX;
          posY.value = dragStartY.value + e.translationY;
        })
        .onEnd((e) => {
          const newLeft = clamp(dragStartX.value + e.translationX, 4, boardWidth - NOTE_WIDTH - 4);
          const newTop = clamp(dragStartY.value + e.translationY, 4, boardHeight - noteHeight - 4);
          posX.value = newLeft;
          posY.value = newTop;
          runOnJS(onDragEnd)(itemId, (newLeft / boardWidth) * 100, (newTop / boardHeight) * 100);
        }),
    [dragDisabled, visible, boardWidth, boardHeight, noteHeight, itemId, onDragEnd, posX, posY, dragStartX, dragStartY]
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(!dragDisabled && visible)
        .hitSlop(28)
        .onEnd(() => {
          if (isDone) runOnJS(onPress)(itemId);
        }),
    [dragDisabled, visible, isDone, onPress, itemId]
  );

  // A two-finger twist, so it can run alongside (not compete with) the
  // one-finger drag/tap gestures above. Clamped well short of upside-down —
  // this is a tilt control, not a spin.
  const rotate = useMemo(
    () =>
      Gesture.Rotation()
        .enabled(!dragDisabled && visible)
        .hitSlop(28)
        .onStart(() => {
          rotateStart.value = rotation.value;
        })
        .onUpdate((e) => {
          rotation.value = rotateStart.value + (e.rotation * 180) / Math.PI;
        })
        .onEnd(() => {
          const clamped = clamp(rotation.value, -60, 60);
          rotation.value = withTiming(clamped);
          runOnJS(onRotateEnd)(itemId, clamped);
        }),
    [dragDisabled, visible, itemId, onRotateEnd, rotation, rotateStart]
  );

  const gesture = useMemo(() => Gesture.Simultaneous(Gesture.Race(pan, tap), rotate), [pan, tap, rotate]);

  // Notes for the inactive track stay mounted (see the board screen) rather
  // than being unmounted/remounted on every toggle — tearing down and
  // rebuilding a note's native gesture recognizers is real per-note cost,
  // and doing that for every note at once is what made switching tracks
  // feel slow. Hiding via opacity + pointerEvents is just a style flip.
  const animatedStyle = useAnimatedStyle(() => ({
    left: posX.value,
    top: posY.value,
    transform: [{ rotate: `${rotation.value + wiggle.value}deg` }, { scale: scale.value }],
    opacity: visible ? opacity.value : 0,
  }));

  const pinAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pinOpacity.value,
    transform: [{ translateY: pinOffset.value }],
  }));

  const dateStr = memory?.created_at ? formatShortDate(memory.created_at) : '';

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[styles.note, { width: NOTE_WIDTH, height: noteHeight }, animatedStyle]}>
        {item.done ? (
          <View style={styles.polaroidCard}>
            <View style={styles.photoFrame}>
              <View style={styles.photoWrap}>
                <MemoryPhoto photoUrl={photoUrl} rating={memory?.rating} imageStyle={styles.photo} emojiStyle={styles.placeholderEmoji} />
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
          <View style={[styles.paper, { backgroundColor: noteColorForIndex(colorIndex) }]}>
            <ThemedText style={[styles.noteText, { color: noteTextColorForIndex(colorIndex) }]} numberOfLines={4}>
              {item.text}
            </ThemedText>
          </View>
        )}
        <Animated.View style={[StyleSheet.absoluteFill, pinAnimatedStyle]} pointerEvents="none">
          <Pin color={layout.pinColor} size={14} style={styles.pin} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

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
  noteText: { fontSize: 13, lineHeight: 14, textAlign: 'center' },
  placeholderEmoji: { fontSize: 22, lineHeight: 26 },
});
