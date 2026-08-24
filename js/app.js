// Entry point: wires up the static UI (nav, modals, inputs) and boots the app.
// Everything else lives in its own module — this file just connects them.

import { loadState } from './state.js';
import { $, toast } from './utils.js';
import { switchTab, updateSubtitle } from './nav.js';
import { renderWheelArea } from './board.js';
import { renderList, addItemFromInput } from './list.js';
import {
  closeMemoryModal,
  handlePhotoInput,
  saveCurrentMemory
} from './memories.js';

// ---------- NAV ----------
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ---------- LIST SCREEN ----------
$('addItemBtn').addEventListener('click', addItemFromInput);
$('newItemInput').addEventListener('keydown', e => { if (e.key === 'Enter') addItemFromInput(); });

// ---------- MEMORY MODAL ----------
$('closeMemoryModal').addEventListener('click', closeMemoryModal);
$('cancelMemory').addEventListener('click', closeMemoryModal);
$('saveMemory').addEventListener('click', saveCurrentMemory);
$('photoInput').addEventListener('change', handlePhotoInput);

// ---------- MEMORY DETAIL MODAL ----------
$('closeDetailModal').addEventListener('click', () => $('detailModalBackdrop').classList.remove('open'));
$('detailModalBackdrop').addEventListener('click', (e) => {
  if (e.target === $('detailModalBackdrop')) $('detailModalBackdrop').classList.remove('open');
});
$('memoryModalBackdrop').addEventListener('click', (e) => {
  if (e.target === $('memoryModalBackdrop')) closeMemoryModal();
});

// ---------- STORAGE WARNINGS ----------
window.addEventListener('storage-quota-exceeded', () => {
  toast('Storage is full — try smaller photos or fewer memories');
});

// ---------- BOOT ----------
(async function init() {
  await loadState();
  updateSubtitle();
  renderWheelArea();
  renderList();
})();
