import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrackToggle } from '@/components/board/TrackToggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PressableScale } from '@/components/ui/PressableScale';
import { sheetStyles } from '@/components/ui/sheetStyles';
import { Colors, Fonts } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item, Track } from '@/types/models';

interface Props {
  item: Item | null;
  onClose: () => void;
}

export function EditItemModal({ item, onClose }: Props) {
  const updateItem = useBoardStore((state) => state.updateItem);
  const [text, setText] = useState('');
  const [track, setTrack] = useState<Track>('week');
  const [saving, setSaving] = useState(false);

  // Reset the draft to the item's actual values each time a different item
  // is opened for editing, rather than carrying over whatever was left in
  // the fields from the last edit.
  useEffect(() => {
    if (item) {
      setText(item.text);
      setTrack(item.track);
    }
  }, [item]);

  async function onSave() {
    if (!item || saving) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateItem(item.id, { text: trimmed, track });
      onClose();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={item !== null} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={sheetStyles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView style={sheetStyles.sheet}>
          <SafeAreaView edges={['bottom']} style={sheetStyles.content}>
            <ThemedText type="title" style={sheetStyles.title}>
              Edit item
            </ThemedText>

            <TextInput
              value={text}
              onChangeText={setText}
              maxLength={80}
              multiline
              style={styles.input}
              placeholderTextColor={Colors.light.textSecondary}
            />

            {/* Changing which board it's on doesn't make sense while it's
                the currently active challenge for its current track — that
                would leave claimed_track pointing at a track this item no
                longer belongs to. */}
            <TrackToggle track={track} onChange={setTrack} weekClaimed={false} monthClaimed={false} disabled={!!item?.claimed_track} />

            <View style={sheetStyles.actions}>
              <PressableScale style={sheetStyles.ghostButton} onPress={onClose}>
                <ThemedText>Cancel</ThemedText>
              </PressableScale>
              <PressableScale style={sheetStyles.primaryButton} onPress={onSave} disabled={saving || !text.trim()}>
                <ThemedText style={sheetStyles.primaryButtonText}>Save</ThemedText>
              </PressableScale>
            </View>
          </SafeAreaView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.light.text,
    textAlignVertical: 'top',
  },
});
