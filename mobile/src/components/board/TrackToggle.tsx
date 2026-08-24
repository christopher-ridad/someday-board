import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Gold, Violet } from '@/constants/theme';
import type { Track } from '@/types/models';

interface Props {
  track: Track;
  onChange: (track: Track) => void;
  weekClaimed: boolean;
  monthClaimed: boolean;
  disabled: boolean;
}

export function TrackToggle({ track, onChange, weekClaimed, monthClaimed, disabled }: Props) {
  return (
    <View style={styles.row}>
      <ToggleButton label="This Week" active={track === 'week'} claimed={weekClaimed} color={Gold} disabled={disabled} onPress={() => onChange('week')} />
      <ToggleButton label="This Month" active={track === 'month'} claimed={monthClaimed} color={Violet} disabled={disabled} onPress={() => onChange('month')} />
    </View>
  );
}

function ToggleButton({
  label,
  active,
  claimed,
  color,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  claimed: boolean;
  color: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, active && { backgroundColor: color, borderColor: color }]}>
      <ThemedText type="label" style={active ? styles.activeLabel : styles.label}>
        {label}
        {claimed ? ' ●' : ''}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    alignItems: 'center',
  },
  label: { fontSize: 13 },
  activeLabel: { fontSize: 13, color: '#fff' },
});
