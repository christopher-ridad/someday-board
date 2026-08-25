import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Gold } from '@/constants/theme';

interface Props {
  style?: StyleProp<ViewStyle>;
}

// Shown while the initial Supabase fetch is still in flight, so a slow
// connection reads as "loading" rather than flashing EmptyState's "nothing
// here yet" before the real data has had a chance to arrive.
export function LoadingState({ style }: Props) {
  return (
    <View style={[styles.wrapper, style]} pointerEvents="none">
      <ActivityIndicator color={Gold} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
