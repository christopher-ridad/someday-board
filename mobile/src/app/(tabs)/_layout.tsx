import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { CorkBackground } from '@/components/ui/CorkBackground';
import { BoardIcon, ListIcon, MemoriesIcon } from '@/components/ui/TabIcons';
import { Colors, Gold } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';

export default function TabsLayout() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const items = useBoardStore((state) => state.items);
  const loadItems = useBoardStore((state) => state.loadItems);
  const loadAllMemories = useBoardStore((state) => state.loadAllMemories);

  useEffect(() => {
    loadItems();
    // So the Memories grid can sort by actual completion time (not item
    // add-order) the moment it's first opened, not after a per-card lazy
    // fetch finally resolves.
    loadAllMemories();
  }, [loadItems, loadAllMemories]);

  const pending = items.filter((i) => !i.done).length;
  const done = items.filter((i) => i.done).length;
  const subtitle =
    pending === 0 && done === 0 ? 'Add the things you keep putting off.' : `${pending} waiting on the board · ${done} done`;

  return (
    <CorkBackground style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDash} />
            <ThemedText type="label" style={styles.eyebrow}>
              SENIOR YEAR
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>
            Someday Board
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        </View>
      </SafeAreaView>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Gold,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: 'rgba(248,242,226,0.92)',
            height: 50 + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom + 4,
          },
          sceneStyle: { backgroundColor: 'transparent' },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Board', tabBarIcon: ({ color }) => <BoardIcon color={color} /> }} />
        <Tabs.Screen name="list" options={{ title: 'List', tabBarIcon: ({ color }) => <ListIcon color={color} /> }} />
        <Tabs.Screen name="memories" options={{ title: 'Memories', tabBarIcon: ({ color }) => <MemoriesIcon color={color} /> }} />
      </Tabs>
    </CorkBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,251,245,0.9)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(196,178,138,0.4)',
    shadowColor: '#4A2A1C',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowDash: { width: 16, height: 2, backgroundColor: Gold },
  eyebrow: { fontSize: 11, letterSpacing: 3, color: Gold },
  title: { fontSize: 26, lineHeight: 30, marginTop: 6, marginBottom: 3, transform: [{ rotate: '-1deg' }] },
  subtitle: { fontSize: 13, lineHeight: 16 },
});
