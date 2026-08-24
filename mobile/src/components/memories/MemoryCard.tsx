import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Ratings } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';

interface Props {
  item: Item;
  onPress: () => void;
}

export function MemoryCard({ item, onPress }: Props) {
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

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photoWrap}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <ThemedText style={styles.placeholderEmoji}>
            {memory && memory.rating != null ? Ratings[memory.rating] : '✅'}
          </ThemedText>
        )}
      </View>
      <ThemedText numberOfLines={2} style={styles.title}>
        {item.text}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.date}>
        {dateStr}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 4, padding: 8 },
  photoWrap: {
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  placeholderEmoji: { fontSize: 30 },
  title: { fontSize: 13, fontFamily: Fonts.bodySemiBold },
  date: { fontSize: 11 },
});
