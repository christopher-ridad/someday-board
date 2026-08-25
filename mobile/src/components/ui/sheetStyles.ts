import { StyleSheet } from 'react-native';

import { Colors, Fonts, Gold } from '@/constants/theme';

// Shared by every bottom-sheet modal (MemoryModal, EditItemModal,
// AccountModal) — same backdrop/sheet shape, title, and ghost/primary
// button pair each was independently re-declaring, so this only needs to
// look right in one place.
export const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  content: { padding: 20, gap: 14 },
  title: { fontSize: 22, lineHeight: 26 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  ghostButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.backgroundSelected },
  primaryButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: Gold },
  destructiveButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: '#B8481F' },
  primaryButtonText: { color: '#fff', fontFamily: Fonts.bodySemiBold },
});
