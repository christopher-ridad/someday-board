import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { CorkBackground } from '@/components/ui/CorkBackground';
import { signInWithApple } from '@/lib/auth';

export default function SignInScreen() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignIn() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithApple();
      // Success flips the auth store's session, which flips the root
      // layout's Stack.Protected guard into (tabs) automatically.
    } catch (e) {
      // Dismissing the system sign-in sheet without completing it reports
      // itself as an error too — that's not a real failure, so it shouldn't
      // show anything.
      if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') return;
      setError(e instanceof Error ? e.message : 'Could not sign in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <CorkBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.titleCard}>
          <ThemedText type="title" style={styles.title}>
            Someday Board
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            A scrapbook wall for the things you keep putting off.
          </ThemedText>
        </View>

        <View style={styles.card}>
          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={onSignIn}
          />
        </View>
      </SafeAreaView>
    </CorkBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  // A card behind the title/subtitle instead of setting them directly on
  // the cork texture — dark brown text on a brown/orange photo background
  // has poor contrast and was hard to read, especially the muted subtitle.
  titleCard: {
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,251,245,0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,178,138,0.4)',
    shadowColor: '#4A2A1C',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: { textAlign: 'center', fontSize: 34, lineHeight: 38, transform: [{ rotate: '-1deg' }] },
  subtitle: { textAlign: 'center', marginTop: 6 },
  card: {
    gap: 16,
    padding: 24,
    backgroundColor: 'rgba(255,251,245,0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,178,138,0.4)',
    shadowColor: '#4A2A1C',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  appleButton: { width: '100%', height: 50 },
  error: { color: '#E15B3E', textAlign: 'center' },
});
