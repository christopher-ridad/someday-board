import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemRow } from '@/components/list/ItemRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Gold, NoteColors } from '@/constants/theme';
import { useBoardStore } from '@/store/useBoardStore';
import type { Item } from '@/types/models';

export default function ListScreen() {
  const items = useBoardStore((state) => state.items);
  const addItem = useBoardStore((state) => state.addItem);
  const deleteItem = useBoardStore((state) => state.deleteItem);
  const [text, setText] = useState('');

  const pending = useMemo(() => items.filter((i) => !i.done), [items]);

  async function onAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    await addItem(trimmed);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.addRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Something you keep putting off..."
            placeholderTextColor={Colors.light.textSecondary}
            maxLength={80}
            style={styles.input}
            onSubmitEditing={onAdd}
            returnKeyType="done"
          />
          <Pressable style={styles.addButton} onPress={onAdd}>
            <ThemedText style={styles.addButtonText}>+</ThemedText>
          </Pressable>
        </View>

        {pending.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={styles.emptyEmoji}>📝</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Nothing on the board yet.{'\n'}Add the thing you&apos;ve been putting off.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={pending}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemRow item={item} dotColor={NoteColors[index % NoteColors.length]} onDelete={() => deleteItem(item.id)} />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  addRow: { flexDirection: 'row', gap: 10, padding: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  addButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: Gold, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 22, lineHeight: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { textAlign: 'center', lineHeight: 20 },
});
