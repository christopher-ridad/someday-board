import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TrackToggle } from '@/components/board/TrackToggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Fonts, Gold } from '@/constants/theme';
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
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedView style={styles.sheet}>
          <SafeAreaView edges={['bottom']} style={styles.content}>
            <ThemedText type="title" style={styles.title}>
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

            <View style={styles.actions}>
              <PressableScale style={styles.cancelButton} onPress={onClose}>
                <ThemedText>Cancel</ThemedText>
              </PressableScale>
              <PressableScale style={styles.saveButton} onPress={onSave} disabled={saving || !text.trim()}>
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </PressableScale>
            </View>
          </SafeAreaView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, lineHeight: 26 },
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
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.backgroundSelected },
  saveButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: Gold },
  saveButtonText: { color: '#fff', fontFamily: Fonts.bodySemiBold },
});
