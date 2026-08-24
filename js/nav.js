// Bottom nav tab switching and the header's live item-count subtitle.

import { state } from './state.js';
import { $ } from './utils.js';
import { renderWheelArea } from './board.js';
import { renderList } from './list.js';
import { renderMemories } from './memories.js';

export function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $('screen-' + tab).classList.add('active');
  if (tab === 'memories') renderMemories();
  if (tab === 'wheel') renderWheelArea();
  if (tab === 'list') renderList();
  updateSubtitle();
}

export function updateSubtitle() {
  const pending = state.items.filter(i => !i.done).length;
  const done = state.items.filter(i => i.done).length;
  $('subtitleText').textContent = pending === 0 && done === 0
    ? 'Add the things you keep putting off.'
    : `${pending} waiting on the board · ${done} done`;
}
