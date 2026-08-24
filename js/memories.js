// The Memories screen (browsable grid of completed items) and the
// "log this memory" modal used when marking something done.

import { RATINGS } from './constants.js';
import { state, saveState, saveMemoryRecord, getMemoryRecord } from './state.js';
import { $, escapeHtml, toast, burstConfetti } from './utils.js';
import { renderWheelArea } from './board.js';
import { renderList } from './list.js';
import { updateSubtitle } from './nav.js';

let pendingMemoryPhoto = null;
let pendingMemoryRating = null;
let activeMemoryItemId = null;

export function closeMemoryModal() {
  $('memoryModalBackdrop').classList.remove('open');
  pendingMemoryPhoto = null;
  pendingMemoryRating = null;
  activeMemoryItemId = null;
  $('memoryNote').value = '';
  $('photoUploadLabel').innerHTML = `<span id="photoUploadHint">📷 Add a photo</span><input type="file" accept="image/*" id="photoInput">`;
  $('photoInput').addEventListener('change', handlePhotoInput);
}

export function openMemoryModal(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  activeMemoryItemId = itemId;
  $('memoryModalTitle').textContent = 'Log this memory';
  $('memoryModalSub').textContent = item.text;
  $('ratingRow').innerHTML = RATINGS.map((e, i) =>
    `<div class="rating-emoji" data-i="${i}">${e}</div>`).join('');
  $('ratingRow').querySelectorAll('.rating-emoji').forEach(el => {
    el.addEventListener('click', () => {
      pendingMemoryRating = parseInt(el.dataset.i);
      $('ratingRow').querySelectorAll('.rating-emoji').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
    });
  });
  $('photoInput').addEventListener('change', handlePhotoInput);
  $('memoryModalBackdrop').classList.add('open');
}

export function handlePhotoInput(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 640;
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = h * (maxDim / w); w = maxDim; }
      else if (h > maxDim) { w = w * (maxDim / h); h = maxDim; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = c.toDataURL('image/jpeg', 0.62);
      pendingMemoryPhoto = dataUrl;
      $('photoUploadLabel').innerHTML = `<img src="${dataUrl}">`;
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

export async function saveCurrentMemory() {
  if (!activeMemoryItemId) return;
  const item = state.items.find(i => i.id === activeMemoryItemId);
  if (!item) return;
  const memory = {
    note: $('memoryNote').value.trim(),
    photo: pendingMemoryPhoto,
    rating: pendingMemoryRating,
    date: Date.now(),
    title: item.text
  };
  await saveMemoryRecord(item.id, memory);
  item.done = true;
  const c = state.settings.challenges;
  if (c.week && c.week.itemId === item.id) c.week = null;
  if (c.month && c.month.itemId === item.id) c.month = null;
  await saveState();
  closeMemoryModal();
  renderWheelArea();
  renderList();
  updateSubtitle();
  burstConfetti();
  toast('Memory saved 🎉');
}

// ---------- MEMORIES SCREEN ----------
export async function renderMemories() {
  const grid = $('memoriesGrid');
  const statRow = $('statRow');
  const done = state.items.filter(i => i.done);
  const total = state.items.length;
  statRow.innerHTML = `
    <div class="stat"><div class="num">${done.length}</div><div class="lbl">DONE</div></div>
    <div class="stat"><div class="num">${state.items.filter(i => !i.done).length}</div><div class="lbl">WAITING</div></div>
    <div class="stat"><div class="num">${total}</div><div class="lbl">TOTAL</div></div>
  `;
  if (done.length === 0) {
    grid.innerHTML = `<div class="empty"><div class="big">🎞️</div>No memories yet.<br>Pull one off the board and go make one.</div>`;
    return;
  }
  grid.innerHTML = `<div class="memory-grid" id="memGridInner"></div>`;
  const inner = $('memGridInner');
  const cards = [];
  for (const item of done) {
    const mem = await getMemoryRecord(item.id);
    cards.push({ item, mem });
  }
  cards.sort((a, b) => (b.mem && b.mem.date || 0) - (a.mem && a.mem.date || 0));
  inner.innerHTML = cards.map(({ item, mem }) => {
    const dateStr = mem && mem.date ? new Date(mem.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
    const photoHtml = mem && mem.photo
      ? `<img class="memory-photo" src="${mem.photo}">`
      : `<div class="memory-photo-placeholder">${mem && mem.rating != null ? RATINGS[mem.rating] : '✅'}</div>`;
    return `
      <div class="memory-card" data-id="${item.id}">
        ${photoHtml}
        <div class="memory-body">
          <div class="memory-title">${escapeHtml(item.text)}</div>
          <div class="memory-date">${dateStr}</div>
        </div>
      </div>`;
  }).join('');
  inner.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });
}

export async function openDetail(itemId) {
  const item = state.items.find(i => i.id === itemId);
  const mem = await getMemoryRecord(itemId);
  const dateStr = mem && mem.date ? new Date(mem.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  $('detailContent').innerHTML = `
    ${mem && mem.photo ? `<img src="${mem.photo}">` : `<div class="no-photo">${mem && mem.rating != null ? RATINGS[mem.rating] : '✅'}</div>`}
    <h2>${escapeHtml(item.text)}</h2>
    <p class="modal-sub">${dateStr}${mem && mem.rating != null ? ' · ' + RATINGS[mem.rating] : ''}</p>
    <p style="line-height:1.5; font-size:14.5px; color:var(--text);">${mem && mem.note ? escapeHtml(mem.note) : '<span style="color:var(--text-dim)">No notes written.</span>'}</p>
  `;
  $('detailModalBackdrop').classList.add('open');
}
