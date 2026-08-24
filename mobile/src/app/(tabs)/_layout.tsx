import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BoardIcon, ListIcon, MemoriesIcon } from '@/components/ui/TabIcons';
import { Colors, Gold } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const items = useBoardStore((state) => state.items);
  const loadItems = useBoardStore((state) => state.loadItems);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const pending = items.filter((i) => !i.done).length;
  const done = items.filter((i) => i.done).length;
  const subtitle =
    pending === 0 && done === 0 ? 'Add the things you keep putting off.' : `${pending} waiting on the board · ${done} done`;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="label" themeColor="textSecondary" style={styles.eyebrow}>
            SENIOR YEAR
          </ThemedText>
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
          tabBarStyle: { backgroundColor: colors.backgroundElement },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Board', tabBarIcon: ({ color }) => <BoardIcon color={color} /> }} />
        <Tabs.Screen name="list" options={{ title: 'List', tabBarIcon: ({ color }) => <ListIcon color={color} /> }} />
        <Tabs.Screen name="memories" options={{ title: 'Memories', tabBarIcon: ({ color }) => <MemoriesIcon color={color} /> }} />
      </Tabs>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  eyebrow: { fontSize: 11 },
  title: { fontSize: 26, marginTop: 4 },
  subtitle: { fontSize: 13, marginTop: 2 },
});
