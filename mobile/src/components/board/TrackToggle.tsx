import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/ui/PressableScale';
import { Gold } from '@/constants/theme';
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
      <ToggleButton label="This Week" active={track === 'week'} claimed={weekClaimed} disabled={disabled} onPress={() => onChange('week')} />
      <ToggleButton label="This Month" active={track === 'month'} claimed={monthClaimed} disabled={disabled} onPress={() => onChange('month')} />
    </View>
  );
}

function ToggleButton({
  label,
  active,
  claimed,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  claimed: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={[styles.button, active && styles.buttonActive]}>
      <ThemedText type="label" style={active ? styles.activeLabel : styles.label}>
        {label}
        {claimed ? ' ●' : ''}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  button: {
    flex: 1,
    // Fixed height + justifyContent:center rather than symmetric padding —
    // padding only equalizes space around the text's line box, and a custom
    // font's internal ascent/descent split inside that box can still look
    // off-center regardless of the padding being even.
    height: 40,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(196,178,138,0.4)',
    backgroundColor: 'rgba(255,251,245,0.85)',
    alignItems: 'center',
    shadowColor: '#4A2A1C',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonActive: { backgroundColor: Gold, borderColor: Gold },
  // Neither label has any letters with descenders (g/j/p/q/y), so the
  // font's line box reserves unused space below the baseline — the visible
  // text sits above true center unless nudged down to compensate.
  label: { fontSize: 13, textAlign: 'center', marginTop: 3 },
  activeLabel: { fontSize: 13, textAlign: 'center', marginTop: 3, color: '#fff' },
});
