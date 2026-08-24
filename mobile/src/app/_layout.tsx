import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/useAuthStore';

export default function RootLayout() {
  const session = useAuthStore((state) => state.session);
  const initializing = useAuthStore((state) => state.initializing);
  const [fontsLoaded] = useFonts({
    PermanentMarker_400Regular,
    SpecialElite_400Regular,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  if (initializing || !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Required for SafeAreaView / useSafeAreaInsets to get real device
          insets anywhere in the app — without it, React Navigation's bottom
          tabs can't correctly compute the tab bar's height/bottom padding
          against the actual safe area, which is why it was rendering with a
          much larger blank strip beneath it than the home indicator
          actually needs. */}
      <SafeAreaProvider>
        {/* Always the light/default nav theme — this app has one warm
            scrapbook look, not a light/dark pair (see hooks/use-theme.ts). */}
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Protected guard={!session}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={!!session}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
