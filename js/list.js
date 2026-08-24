// The List screen: a plain scrollable list of everything not yet done,
// plus the "add something new" input.

import { COLORS } from './constants.js';
import { state, saveState, uid, activeChallengeItemIds } from './state.js';
import { $, escapeHtml } from './utils.js';
import { renderWheelArea } from './board.js';
import { updateSubtitle } from './nav.js';

export function addItemFromInput() {
  const input = $('newItemInput');
  const text = input.value.trim();
  if (!text) return;
  state.items.push({ id: uid(), text, done: false, createdAt: Date.now() });
  input.value = '';
  saveState();
  renderList();
  renderWheelArea();
  updateSubtitle();
}

export function renderList() {
  const pending = state.items.filter(i => !i.done);
  const container = $('pendingList');
  if (pending.length === 0) {
    container.innerHTML = `<div class="empty"><div class="big">📝</div>Nothing on the board yet.<br>Add the thing you've been putting off.</div>`;
    return;
  }
  const c = state.settings.challenges;
  container.innerHTML = pending.map((item, idx) => {
    let lockBadge = '';
    if (c.week && c.week.itemId === item.id) lockBadge = `<span class="item-lock week">WEEK</span>`;
    else if (c.month && c.month.itemId === item.id) lockBadge = `<span class="item-lock month">MONTH</span>`;
    return `
      <div class="item-card">
        <span class="item-dot" style="background:${COLORS[idx % COLORS.length]}"></span>
        <span class="item-text">${escapeHtml(item.text)}</span>
        ${lockBadge || `<button class="item-del" data-id="${item.id}">&times;</button>`}
      </div>`;
  }).join('');
  container.querySelectorAll('.item-del').forEach(btn => {
    btn.addEventListener('click', () => {
      state.items = state.items.filter(i => i.id !== btn.dataset.id);
      if (state.positions) delete state.positions[btn.dataset.id];
      saveState();
      renderList();
      renderWheelArea();
      updateSubtitle();
    });
  });
}
