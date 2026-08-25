import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PressableScale } from '@/components/ui/PressableScale';
import { sheetStyles } from '@/components/ui/sheetStyles';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

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
      <View style={sheetStyles.backdrop}>
        <ThemedView style={sheetStyles.sheet}>
          <SafeAreaView edges={['bottom']} style={sheetStyles.content}>
            <ThemedText type="title" style={sheetStyles.title}>
              Account
            </ThemedText>
            {email ? (
              <ThemedText themeColor="textSecondary" style={styles.email}>
                Signed in as {email}
              </ThemedText>
            ) : null}
            <View style={sheetStyles.actions}>
              <PressableScale style={sheetStyles.ghostButton} onPress={onClose}>
                <ThemedText>Close</ThemedText>
              </PressableScale>
              <PressableScale style={sheetStyles.destructiveButton} onPress={onSignOut}>
                <ThemedText style={sheetStyles.primaryButtonText}>Sign out</ThemedText>
              </PressableScale>
            </View>
          </SafeAreaView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  email: { marginTop: -6 },
});
