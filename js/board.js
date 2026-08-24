// The Board screen: the corkboard wall of scattered notes/photos, the
// week/month toggle, drag-to-reposition, and the "pull one off the board"
// pick animation.

import { COLORS, RATINGS, TRACKS, PIN_COLORS } from './constants.js';
import { state, memoryCache, saveState, getMemoryRecord, activeChallengeItemIds } from './state.js';
import { $, escapeHtml, toast, burstConfetti } from './utils.js';
import { ensureAudio, playTick, playLandThunk, playWinChime, vibrate, playWindWhoosh, playCatch } from './audio.js';
import { openMemoryModal, openDetail } from './memories.js';
import { renderList } from './list.js';

export let activeWheelTrack = 'week';
export let spinning = { week: false, month: false };
export let justWon = { week: false, month: false };

export function renderWheelArea() {
  const area = $('wheelArea');
  area.innerHTML = toggleHtml() + wallStageHtml();
  justWon[activeWheelTrack] = false;

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.track === activeWheelTrack || spinning.week || spinning.month) return;
      activeWheelTrack = btn.dataset.track;
      renderWheelArea();
    });
  });

  attachWallHandlers();
  hydrateWallPhotos();
}

function toggleHtml() {
  const c = state.settings.challenges;
  return `
    <div class="track-toggle">
      <button class="toggle-btn week ${activeWheelTrack === 'week' ? 'active' : ''} ${c.week ? 'has-challenge' : ''}" data-track="week">This Week</button>
      <button class="toggle-btn month ${activeWheelTrack === 'month' ? 'active' : ''} ${c.month ? 'has-challenge' : ''}" data-track="month">This Month</button>
    </div>`;
}

function poolForTrack(track) {
  const excluded = activeChallengeItemIds();
  return state.items.filter(i => !i.done && !excluded.includes(i.id));
}

// deterministic pseudo-random generator seeded by item id, so each scrap
// keeps its spot on the wall across re-renders instead of jumping around
function scrapSeed(id) {
  let h = 1779033703 ^ id.length;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function scrapStyle(id) {
  const rng = scrapSeed(id);
  return {
    x: 8 + rng() * 62,
    y: 12 + rng() * 60,
    rot: -16 + rng() * 32,
    colorIdx: Math.floor(rng() * COLORS.length),
    pinClass: PIN_COLORS[Math.floor(rng() * PIN_COLORS.length)]
  };
}

function wallStageHtml() {
  const track = activeWheelTrack;
  const challenge = state.settings.challenges[track];
  const items = state.items;
  const n = items.length;
  const wallHeight = Math.max(480, 260 + Math.ceil(Math.max(n, 1) / 3) * 92);

  let scrapsHtml;
  if (n === 0) {
    scrapsHtml = `<div class="wall-empty"><div class="wall-empty-card"><div class="big">🍂</div><p>Nothing on the wall yet.<br>Add something you keep putting off.</p></div></div>`;
  } else {
    scrapsHtml = items.map(item => {
      const s = scrapStyle(item.id);
      const custom = state.positions && state.positions[item.id];
      const xPct = custom ? custom.x : s.x;
      const yPct = custom ? custom.y : s.y;
      const claimedTrack = (state.settings.challenges.week && state.settings.challenges.week.itemId === item.id) ? 'week'
        : (state.settings.challenges.month && state.settings.challenges.month.itemId === item.id) ? 'month' : null;
      const claimedClass = claimedTrack ? `claimed claim-${claimedTrack}` : '';
      const windDir = (s.rot >= 0 ? -1 : 1) * (3 + (Math.floor(s.x) % 3));
      const styleParts = [
        `left:${xPct}%`, `top:${yPct}%`, `transform:rotate(${s.rot}deg)`,
        `z-index:${1 + (Math.floor(s.x) % 5)}`, `--wr:${s.rot}deg`, `--wd:${windDir}deg`
      ];
      if (item.done) {
        const mem = memoryCache[item.id];
        let inner;
        if (mem === undefined) inner = `<div class="scrap-photo-placeholder">⏳</div>`;
        else if (mem && mem.photo) inner = `<img class="scrap-photo" src="${mem.photo}">`;
        else inner = `<div class="scrap-photo-placeholder">${mem && mem.rating != null ? RATINGS[mem.rating] : '✅'}</div>`;
        return `<div class="scrap done ${s.pinClass} ${claimedClass}" data-id="${item.id}" style="${styleParts.join(';')}">${inner}</div>`;
      } else {
        styleParts.push(`--paper-color:${COLORS[s.colorIdx]}`);
        return `<div class="scrap pending ${s.pinClass} ${claimedClass}" data-id="${item.id}" style="${styleParts.join(';')}">${escapeHtml(item.text)}</div>`;
      }
    }).join('');
  }

  const stage = `
    <div class="wall-stage full-bleed">
      <div class="wall-viewport" id="wallViewport">
        <div class="wall ${challenge ? 'dimmed' : ''}" id="theWall" style="height:${wallHeight}px;">${scrapsHtml}</div>
      </div>
      ${challenge ? ticketOverlayHtml(track, challenge) : ''}
    </div>`;

  return stage + (challenge ? '' : windControlsHtml(track));
}

function ticketOverlayHtml(track, challenge) {
  const meta = TRACKS[track];
  const item = state.items.find(i => i.id === challenge.itemId);
  if (!item) {
    state.settings.challenges[track] = null;
    return '';
  }
  const dueStr = new Date(challenge.dueBy).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `
    <div class="ticket-overlay">
      <div class="ticket ${justWon[track] ? 'reveal-pop' : ''}">
        <div class="ticket-eyebrow ${meta.badgeClass}">CURRENT CHALLENGE</div>
        <div class="ticket-title">${escapeHtml(item.text)}</div>
        <div class="ticket-meta">Aim to finish by ${dueStr}</div>
        <div class="ticket-actions">
          <button class="btn btn-primary" id="btnDone_${track}">I did it ✅</button>
          <button class="btn btn-ghost" id="btnLetGo_${track}">Let it go</button>
        </div>
      </div>
    </div>`;
}

function windControlsHtml(track) {
  const pool = poolForTrack(track);
  return `
    <button class="wind-btn ${track === 'month' ? 'month-btn' : ''}" id="windBtn_${track}" ${pool.length < 1 ? 'disabled' : ''}>PULL ONE OFF THE BOARD</button>`;
}

function attachWallHandlers() {
  const track = activeWheelTrack;
  const challenge = state.settings.challenges[track];
  if (challenge) {
    const doneBtn = $('btnDone_' + track);
    const letGoBtn = $('btnLetGo_' + track);
    if (doneBtn) doneBtn.addEventListener('click', () => openMemoryModal(challenge.itemId));
    if (letGoBtn) letGoBtn.addEventListener('click', () => {
      state.settings.challenges[track] = null;
      saveState();
      renderWheelArea();
      renderList();
      toast('Back on the wall. No pressure.');
    });
  } else {
    const pool = poolForTrack(track);
    const windBtn = $('windBtn_' + track);
    if (windBtn && pool.length >= 1) {
      windBtn.addEventListener('click', () => doBlow(track, pool));
    }
  }
  document.querySelectorAll('#theWall .scrap').forEach(el => {
    el.addEventListener('pointerdown', onScrapPointerDown);
  });
}

// ---------- DRAG TO REPOSITION ----------
function onScrapPointerDown(e) {
  if (spinning.week || spinning.month) return;
  if (e.button !== undefined && e.button !== 0) return;
  const el = e.currentTarget;
  const wall = $('theWall');
  if (!wall) return;
  const wallRect = wall.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const startClientX = e.clientX, startClientY = e.clientY;
  const offsetX = startClientX - elRect.left;
  const offsetY = startClientY - elRect.top;
  let moved = false;

  try { el.setPointerCapture(e.pointerId); } catch (err) {}
  el.classList.add('dragging');

  function onMove(ev) {
    const dx = ev.clientX - startClientX, dy = ev.clientY - startClientY;
    if (!moved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      moved = true;
      el.classList.add('drag-lifted');
    }
    if (!moved) return;
    let newLeftPx = ev.clientX - wallRect.left - offsetX;
    let newTopPx = ev.clientY - wallRect.top - offsetY;
    const margin = 4;
    newLeftPx = Math.max(margin, Math.min(wallRect.width - elRect.width - margin, newLeftPx));
    newTopPx = Math.max(margin, Math.min(wallRect.height - elRect.height - margin, newTopPx));
    el.style.left = newLeftPx + 'px';
    el.style.top = newTopPx + 'px';
  }

  function onUp(ev) {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    el.classList.remove('dragging', 'drag-lifted');

    if (moved) {
      const wallRect2 = wall.getBoundingClientRect();
      const elRect2 = el.getBoundingClientRect();
      const xPct = ((elRect2.left - wallRect2.left) / wallRect2.width) * 100;
      const yPct = ((elRect2.top - wallRect2.top) / wallRect2.height) * 100;
      el.style.left = xPct + '%';
      el.style.top = yPct + '%';
      if (!state.positions) state.positions = {};
      state.positions[el.dataset.id] = { x: xPct, y: yPct };
      saveState();
    } else if (el.classList.contains('done')) {
      openDetail(el.dataset.id);
    }
  }

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
}

async function hydrateWallPhotos() {
  const done = state.items.filter(i => i.done && memoryCache[i.id] === undefined);
  for (const item of done) {
    const mem = await getMemoryRecord(item.id);
    memoryCache[item.id] = mem;
    const el = document.querySelector(`#theWall .scrap[data-id="${item.id}"]`);
    if (el) {
      el.innerHTML = mem && mem.photo
        ? `<img class="scrap-photo" src="${mem.photo}">`
        : `<div class="scrap-photo-placeholder">${mem && mem.rating != null ? RATINGS[mem.rating] : '✅'}</div>`;
    }
  }
}

function disableControls(disabled) {
  document.querySelectorAll('.toggle-btn').forEach(b => b.style.pointerEvents = disabled ? 'none' : '');
}

function doBlow(track, pool) {
  if (spinning[track]) return;
  ensureAudio();
  spinning[track] = true;
  disableControls(true);

  const wall = $('theWall');
  const windBtn = $('windBtn_' + track);
  const hintEl = $('wallHint');
  if (windBtn) { windBtn.disabled = true; windBtn.textContent = 'LOOKING…'; }
  if (hintEl) hintEl.textContent = 'Searching the board...';

  const winIdx = Math.floor(Math.random() * pool.length);
  const winner = pool[winIdx];
  const winnerEl = wall.querySelector(`.scrap[data-id="${winner.id}"]`);
  const otherEls = Array.from(wall.querySelectorAll('.scrap')).filter(el => el.dataset.id !== winner.id);

  // Phase A: the wind picks up — everything rustles
  wall.querySelectorAll('.scrap').forEach(el => el.classList.add('windy'));
  playWindWhoosh();

  setTimeout(() => {
    // Phase B: everything else fades back; the winner's pin pops loose
    // and the note falls off the board before reappearing large in Phase C
    otherEls.forEach(el => {
      setTimeout(() => {
        el.classList.remove('windy');
        el.classList.add('faded');
      }, Math.random() * 180);
    });

    let fallDuration = 700;
    if (winnerEl) {
      winnerEl.classList.remove('windy');
      winnerEl.classList.add('pin-pop');
      playCatch();
      vibrate([15, 10, 25]);

      setTimeout(() => {
        winnerEl.classList.add('flying');
        const stageRect = wall.getBoundingClientRect();
        const elRect = winnerEl.getBoundingClientRect();
        const curCenterY = elRect.top + elRect.height / 2 - stageRect.top;
        const fallDistance = (stageRect.height - curCenterY) + 260;
        const driftX = (Math.random() - 0.5) * 70;
        const rotMatch = /rotate\(([-\d.]+)deg\)/.exec(winnerEl.style.transform);
        const baseRot = rotMatch ? parseFloat(rotMatch[1]) : 0;
        const extraRotate = 80 + Math.random() * 120;

        try {
          winnerEl.animate([
            { transform: `translate(0px,0px) rotate(${baseRot}deg)`, opacity: 1, offset: 0 },
            { transform: `translate(${driftX * 0.4}px, ${fallDistance * 0.55}px) rotate(${baseRot + extraRotate * 0.6}deg)`, opacity: 1, offset: 0.55 },
            { transform: `translate(${driftX}px, ${fallDistance}px) rotate(${baseRot + extraRotate}deg)`, opacity: 0, offset: 1 }
          ], { duration: fallDuration, easing: 'cubic-bezier(0.5,0,0.85,1)', fill: 'forwards' });
        } catch (e) {}
      }, 220);
    } else {
      playCatch();
      vibrate([20, 30, 40]);
    }

    setTimeout(landed, 220 + fallDuration + 150);
  }, 1100);

  function landed() {
    playLandThunk();
    vibrate([30, 40, 60]);
    if (hintEl) hintEl.textContent = '...';

    setTimeout(() => {
      spinning[track] = false;
      disableControls(false);
      const dueBy = Date.now() + TRACKS[track].ms;
      state.settings.challenges[track] = { itemId: winner.id, assignedAt: Date.now(), dueBy };
      saveState();
      justWon[track] = true;
      renderWheelArea();
      renderList();
      burstConfetti();
      playWinChime();
      vibrate([15, 30, 15, 30, 50]);
      toast(`${track === 'week' ? 'This week' : 'This month'}: ${winner.text}`);
    }, 520);
  }
}
