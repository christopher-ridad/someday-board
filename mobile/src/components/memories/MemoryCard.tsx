import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Pin } from '@/components/ui/Pin';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Fonts, PinColors, Ratings } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';

interface Props {
  item: Item;
  rotation?: number;
  onPress: () => void;
}

export function MemoryCard({ item, rotation = 0, onPress }: Props) {
  const loadMemory = useBoardStore((state) => state.loadMemory);
  const photoUrlFor = useBoardStore((state) => state.photoUrlFor);
  const memory = useBoardStore((state) => state.memories[item.id]);
  const photoUrl = useBoardStore((state) => (memory?.photo_path ? (state.photoUrls[memory.photo_path] ?? null) : null));

  useEffect(() => {
    loadMemory(item.id);
  }, [item.id, loadMemory]);

  useEffect(() => {
    if (memory?.photo_path) photoUrlFor(memory.photo_path);
  }, [memory?.photo_path, photoUrlFor]);

  const dateStr = memory?.created_at
    ? new Date(memory.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';
  const pinColor = PinColors[item.id.charCodeAt(0) % PinColors.length];

  return (
    <View style={[styles.rotationWrapper, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <PressableScale style={styles.card} onPress={onPress}>
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
        <View style={styles.body}>
          <ThemedText numberOfLines={2} style={styles.title}>
            {item.text}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.date}>
            {dateStr}
          </ThemedText>
        </View>
      </PressableScale>
      <Pin color={pinColor} size={16} style={styles.pin} />
    </View>
  );
}

const styles = StyleSheet.create({
  rotationWrapper: { flex: 1, margin: 10 },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,251,245,0.97)',
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 6,
    shadowColor: '#4A2A1C',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pin: { top: -8 },
  // Polaroid-style white margin around the photo instead of it running
  // edge-to-edge, like an actual printed photo tucked into a frame.
  photoFrame: { padding: 8, paddingBottom: 4 },
  photoWrap: {
    aspectRatio: 1,
    borderRadius: 3,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  placeholderEmoji: { fontSize: 30, lineHeight: 36 },
  body: { paddingHorizontal: 10, paddingBottom: 10, paddingTop: 2 },
  title: { fontSize: 13, fontFamily: Fonts.bodySemiBold },
  date: { fontSize: 11, marginTop: 2 },
});
