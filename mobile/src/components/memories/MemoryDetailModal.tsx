import { useEffect } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ratings } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';

interface Props {
  item: Item | null;
  onClose: () => void;
}

export function MemoryDetailModal({ item, onClose }: Props) {
  const loadMemory = useBoardStore((state) => state.loadMemory);
  const photoUrlFor = useBoardStore((state) => state.photoUrlFor);
  const memory = useBoardStore((state) => (item ? state.memories[item.id] : undefined));
  const photoUrl = useBoardStore((state) => (memory?.photo_path ? (state.photoUrls[memory.photo_path] ?? null) : null));

  useEffect(() => {
    if (item) loadMemory(item.id);
  }, [item, loadMemory]);

  useEffect(() => {
    if (memory?.photo_path) photoUrlFor(memory.photo_path);
  }, [memory?.photo_path, photoUrlFor]);

  const dateStr = memory?.created_at
    ? new Date(memory.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <Modal visible={item !== null} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
            <ThemedText style={styles.closeText}>×</ThemedText>
          </Pressable>
          <ScrollView contentContainerStyle={styles.content}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <ThemedText style={styles.placeholderEmoji}>
                  {memory && memory.rating != null ? Ratings[memory.rating] : '✅'}
                </ThemedText>
              </View>
            )}
            <ThemedText type="title" style={styles.title}>
              {item?.text}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              {dateStr}
              {memory && memory.rating != null ? ` · ${Ratings[memory.rating]}` : ''}
            </ThemedText>
            <ThemedText style={styles.note}>
              {memory?.note || <ThemedText themeColor="textSecondary">No notes written.</ThemedText>}
            </ThemedText>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  closeButton: { alignSelf: 'flex-end', padding: 16 },
  closeText: { fontSize: 28, lineHeight: 30 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 16 },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 48 },
  title: { fontSize: 24, lineHeight: 28, marginTop: 8 },
  note: { lineHeight: 21, marginTop: 4 },
});
