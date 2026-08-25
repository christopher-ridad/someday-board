import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingPicker } from '@/components/memories/RatingPicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Fonts, Gold } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';

interface Props {
  itemId: string | null;
  itemText: string;
  onClose: () => void;
  onSaved?: () => void;
}

async function pickPhoto(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert('Add a photo', undefined, [
      {
        text: 'Take Photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return resolve(null);
          const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
          resolve(result.canceled ? null : result.assets[0].uri);
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return resolve(null);
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
          resolve(result.canceled ? null : result.assets[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

export function MemoryModal({ itemId, itemText, onClose, onSaved }: Props) {
  const completeItem = useBoardStore((state) => state.completeItem);
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setRating(null);
    setNote('');
    setPhotoUri(null);
  }

  function close() {
    reset();
    onClose();
  }

  async function onPickPhoto() {
    const uri = await pickPhoto();
    if (uri) setPhotoUri(uri);
  }

  async function onSave() {
    if (!itemId || saving) return;
    setSaving(true);
    try {
      await completeItem(itemId, { rating, note, photoUri });
      close();
      onSaved?.();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={itemId !== null} animationType="slide" transparent onRequestClose={close}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView style={styles.sheet}>
          <SafeAreaView edges={['bottom']}>
            {/* Bounded by sheet's maxHeight so this can actually scroll —
                without it, the sheet just grows to fit its content and the
                note input + Save button end up pushed off-screen under the
                keyboard with no way to reach them. */}
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <ThemedText type="title" style={styles.title}>
                Log this memory
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                {itemText}
              </ThemedText>

              <PressableScale style={styles.photoBox} onPress={onPickPhoto}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" />
                ) : (
                  <ThemedText themeColor="textSecondary">📷 Add a photo</ThemedText>
                )}
              </PressableScale>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="How did it go? What happened?"
                placeholderTextColor={Colors.light.textSecondary}
                style={styles.noteInput}
                multiline
              />

              <RatingPicker value={rating} onChange={setRating} />

              <View style={styles.actions}>
                <PressableScale style={styles.ghostButton} onPress={close}>
                  <ThemedText>Cancel</ThemedText>
                </PressableScale>
                <PressableScale style={styles.saveButton} onPress={onSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.saveButtonText}>Save memory</ThemedText>}
                </PressableScale>
              </View>
            </ScrollView>
          </SafeAreaView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, lineHeight: 26 },
  subtitle: { marginTop: -6 },
  // Photo can be any aspect ratio the camera/library gives us — "contain"
  // (not the default "cover") is what keeps the whole picture visible
  // instead of cropping it to fill this fixed-height box.
  photoBox: {
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.light.text,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  ghostButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.backgroundSelected },
  saveButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: Gold },
  saveButtonText: { color: '#fff', fontFamily: Fonts.bodySemiBold },
});
