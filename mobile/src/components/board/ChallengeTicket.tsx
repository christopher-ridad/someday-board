import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Gold } from '@/constants/theme';
import type { Item, Track } from '@/types/models';

interface Props {
  track: Track;
  item: Item;
  onDone: () => void;
  onLetGo: () => void;
}

export function ChallengeTicket({ track, item, onDone, onLetGo }: Props) {
  const dueStr = item.claimed_due_by
    ? new Date(item.claimed_due_by).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <ThemedView style={styles.ticket}>
        <ThemedText type="label" themeColor="textSecondary" style={styles.eyebrow}>
          CURRENT {track === 'week' ? 'WEEK' : 'MONTH'} CHALLENGE
        </ThemedText>
        <ThemedText type="title" style={styles.title}>
          {item.text}
        </ThemedText>
        <ThemedText themeColor="textSecondary">Aim to finish by {dueStr}</ThemedText>
        <View style={styles.actions}>
          <PressableScale style={styles.ghostButton} onPress={onLetGo}>
            <ThemedText>Let it go</ThemedText>
          </PressableScale>
          <PressableScale style={styles.doneButton} onPress={onDone}>
            <ThemedText style={styles.doneButtonText}>I did it ✅</ThemedText>
          </PressableScale>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ticket: {
    width: '88%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(74,42,28,0.22)',
    borderStyle: 'dashed',
    padding: 20,
    gap: 8,
    transform: [{ rotate: '-0.6deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  eyebrow: { fontSize: 11 },
  title: { fontSize: 20, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  ghostButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  doneButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: Gold },
  doneButtonText: { color: '#fff', fontFamily: Fonts.bodyBold },
});
