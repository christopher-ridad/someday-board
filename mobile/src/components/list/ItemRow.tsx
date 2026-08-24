import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors } from '@/constants/theme';
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
        <View
          style={[
            styles.lockBadge,
            { backgroundColor: item.claimed_track === 'week' ? 'rgba(140,155,101,0.2)' : 'rgba(232,112,58,0.18)' },
          ]}>
          <ThemedText
            type="label"
            style={[styles.lockBadgeText, { color: item.claimed_track === 'week' ? '#5F6B45' : '#B8481F' }]}>
            {item.claimed_track === 'week' ? 'WEEK' : 'MONTH'}
          </ThemedText>
        </View>
      ) : (
        <PressableScale onPress={onDelete} hitSlop={8}>
          <ThemedText themeColor="textSecondary" style={styles.delete}>
            ×
          </ThemedText>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(255,251,245,0.92)',
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 14,
    shadowColor: '#4A2A1C',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { flex: 1, fontSize: 15 },
  delete: { fontSize: 20, paddingHorizontal: 6, color: Colors.light.textSecondary },
  lockBadge: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 },
  lockBadgeText: { fontSize: 9 },
});
