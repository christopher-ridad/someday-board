import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Text, useColorScheme } from 'react-native';

import { Colors, Gold } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const loadItems = useBoardStore((state) => state.loadItems);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.backgroundElement },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Board', tabBarIcon: () => <TabIcon emoji="📌" /> }} />
      <Tabs.Screen name="list" options={{ title: 'List', tabBarIcon: () => <TabIcon emoji="📝" /> }} />
      <Tabs.Screen name="memories" options={{ title: 'Memories', tabBarIcon: () => <TabIcon emoji="🎞️" /> }} />
    </Tabs>
  );
}
