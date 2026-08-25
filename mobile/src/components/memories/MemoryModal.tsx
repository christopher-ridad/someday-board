import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingPicker } from '@/components/memories/RatingPicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PressableScale } from '@/components/ui/PressableScale';
import { sheetStyles } from '@/components/ui/sheetStyles';
import { Colors, Fonts } from '@/constants/theme';
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Shrinks the photo preview while the keyboard's up, so the note field
  // and Save button stay in view without scrolling — the portrait-shaped
  // photo box (needed to show photos without letterboxing) is tall enough
  // that, combined with the keyboard, reaching them otherwise required a
  // scroll every time.
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
      <KeyboardAvoidingView style={sheetStyles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView style={[sheetStyles.sheet, styles.sheetTall]}>
          <SafeAreaView edges={['bottom']}>
            {/* Bounded by the sheet's maxHeight so this can actually
                scroll — without it, the sheet just grows to fit its
                content and the note input + Save button end up pushed
                off-screen under the keyboard with no way to reach them. */}
            <ScrollView contentContainerStyle={sheetStyles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <ThemedText type="title" style={sheetStyles.title}>
                Log this memory
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                {itemText}
              </ThemedText>

              <PressableScale style={[styles.photoBox, keyboardVisible && styles.photoBoxCompact]} onPress={onPickPhoto}>
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

              <View style={sheetStyles.actions}>
                <PressableScale style={sheetStyles.ghostButton} onPress={close}>
                  <ThemedText>Cancel</ThemedText>
                </PressableScale>
                <PressableScale style={sheetStyles.primaryButton} onPress={onSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={sheetStyles.primaryButtonText}>Save memory</ThemedText>}
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
  sheetTall: { maxHeight: '85%' },
  subtitle: { marginTop: -6 },
  // A portrait aspect ratio (matching a typical phone photo) instead of a
  // short fixed height — with "contain" keeping the whole picture visible,
  // a box shaped nothing like the photo just let it show up tiny and
  // letterboxed in the middle. This isn't a perfect match for every photo's
  // exact ratio, but it's close enough that most fill the box almost fully.
  photoBox: {
    aspectRatio: 3 / 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // aspectRatio explicitly cleared, not just left alone — height and
  // aspectRatio both being set at once is ambiguous, so the earlier value
  // needs to be unset rather than just outweighed.
  photoBoxCompact: { aspectRatio: undefined, height: 90 },
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
});
