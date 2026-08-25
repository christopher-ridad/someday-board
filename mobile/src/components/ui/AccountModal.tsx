import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AccountModal({ visible, onClose }: Props) {
  const email = useAuthStore((state) => state.session?.user.email);

  function onSignOut() {
    onClose();
    supabase.auth.signOut();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ThemedView style={styles.sheet}>
          <SafeAreaView edges={['bottom']} style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Account
            </ThemedText>
            {email ? (
              <ThemedText themeColor="textSecondary" style={styles.email}>
                Signed in as {email}
              </ThemedText>
            ) : null}
            <View style={styles.actions}>
              <PressableScale style={styles.closeButton} onPress={onClose}>
                <ThemedText>Close</ThemedText>
              </PressableScale>
              <PressableScale style={styles.signOutButton} onPress={onSignOut}>
                <ThemedText style={styles.signOutText}>Sign out</ThemedText>
              </PressableScale>
            </View>
          </SafeAreaView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, lineHeight: 26 },
  email: { marginTop: -6 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  closeButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.backgroundSelected },
  signOutButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: '#B8481F' },
  signOutText: { color: '#fff', fontFamily: Fonts.bodySemiBold },
});
