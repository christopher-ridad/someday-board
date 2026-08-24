import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MemoryPhoto } from '@/components/ui/MemoryPhoto';
import { Pin } from '@/components/ui/Pin';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Fonts, PinColors } from '@/constants/theme';
import { useMemoryPhoto } from '@/hooks/useMemoryPhoto';
import { formatShortDate } from '@/lib/date';
import type { Item } from '@/types/models';

interface Props {
  item: Item;
  rotation?: number;
  onPress: () => void;
}

export function MemoryCard({ item, rotation = 0, onPress }: Props) {
  const { memory, photoUrl } = useMemoryPhoto(item.id);

  const dateStr = memory?.created_at ? formatShortDate(memory.created_at) : '';
  const pinColor = PinColors[item.id.charCodeAt(0) % PinColors.length];

  return (
    <View style={[styles.rotationWrapper, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <PressableScale style={styles.card} onPress={onPress}>
        <View style={styles.photoFrame}>
          <View style={styles.photoWrap}>
            <MemoryPhoto photoUrl={photoUrl} rating={memory?.rating} imageStyle={styles.photo} emojiStyle={styles.placeholderEmoji} />
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
