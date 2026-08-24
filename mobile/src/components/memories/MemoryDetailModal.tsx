import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MemoryPhoto } from '@/components/ui/MemoryPhoto';
import { PressableScale } from '@/components/ui/PressableScale';
import { Ratings } from '@/constants/theme';
import { useMemoryPhoto } from '@/hooks/useMemoryPhoto';
import type { Item } from '@/types/models';

interface Props {
  item: Item | null;
  onClose: () => void;
}

export function MemoryDetailModal({ item, onClose }: Props) {
  const { memory, photoUrl } = useMemoryPhoto(item?.id ?? null);

  const dateStr = memory?.created_at
    ? new Date(memory.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <Modal visible={item !== null} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <PressableScale style={styles.closeButton} onPress={onClose} hitSlop={8}>
            <ThemedText style={styles.closeText}>×</ThemedText>
          </PressableScale>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.photoWrap}>
              <MemoryPhoto photoUrl={photoUrl} rating={memory?.rating} imageStyle={styles.photo} emojiStyle={styles.placeholderEmoji} />
            </View>
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
  photoWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  placeholderEmoji: { fontSize: 48, lineHeight: 56 },
  title: { fontSize: 24, lineHeight: 28, marginTop: 8 },
  note: { lineHeight: 21, marginTop: 4 },
});
