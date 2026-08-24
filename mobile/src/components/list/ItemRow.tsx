import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Gold, Violet } from '@/constants/theme';
import type { Item } from '@/types/models';

interface Props {
  item: Item;
  dotColor: string;
  onDelete: () => void;
}

export function ItemRow({ item, dotColor, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <ThemedText style={styles.text} numberOfLines={2}>
        {item.text}
      </ThemedText>
      {item.claimed_track ? (
        <View style={[styles.lockBadge, { backgroundColor: item.claimed_track === 'week' ? Gold : Violet }]}>
          <ThemedText type="label" style={styles.lockBadgeText}>
            {item.claimed_track === 'week' ? 'WEEK' : 'MONTH'}
          </ThemedText>
        </View>
      ) : (
        <Pressable onPress={onDelete} hitSlop={8}>
          <ThemedText themeColor="textSecondary" style={styles.delete}>
            ×
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.backgroundSelected,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { flex: 1, fontSize: 15 },
  delete: { fontSize: 22, paddingHorizontal: 6 },
  lockBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  lockBadgeText: { color: '#fff', fontSize: 10 },
});
