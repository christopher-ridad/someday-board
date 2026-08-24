import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { CorkBackground } from '@/components/ui/CorkBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Fonts, Gold } from '@/constants/theme';
import { sendSignInCode, verifySignInCode } from '@/lib/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSendCode() {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await sendSignInCode(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyCode() {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await verifySignInCode(email.trim(), code.trim());
      // Success flips the auth store's session, which flips the root
      // layout's Stack.Protected guard into (tabs) automatically.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code didn’t work. Check it and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <CorkBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Someday Board
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          A scrapbook wall for the things you keep putting off.
        </ThemedText>

        <View style={styles.card}>
          {!sent ? (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
              />
              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
              <PressableScale style={styles.button} onPress={onSendCode} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Send sign-in code</ThemedText>}
              </PressableScale>
            </>
          ) : (
            <>
              <ThemedText style={styles.sentMessage}>Check your email for a sign-in code, then enter it below.</ThemedText>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="code from email"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="number-pad"
                style={[styles.input, styles.codeInput]}
              />
              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
              <PressableScale style={styles.button} onPress={onVerifyCode} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Sign in</ThemedText>}
              </PressableScale>
              <PressableScale onPress={() => setSent(false)} disabled={busy}>
                <ThemedText themeColor="textSecondary" style={styles.backLink}>
                  Use a different email
                </ThemedText>
              </PressableScale>
            </>
          )}
        </View>
      </SafeAreaView>
    </CorkBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  title: { textAlign: 'center', fontSize: 34, lineHeight: 38, transform: [{ rotate: '-1deg' }] },
  subtitle: { textAlign: 'center', marginTop: 6, marginBottom: 24 },
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
  sentMessage: { textAlign: 'center', lineHeight: 22 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(74,42,28,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.light.text,
  },
  codeInput: { textAlign: 'center', fontSize: 22, letterSpacing: 4 },
  button: {
    backgroundColor: Gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: Fonts.bodySemiBold },
  error: { color: '#E15B3E' },
  backLink: { textAlign: 'center', fontSize: 13, marginTop: 4 },
});
