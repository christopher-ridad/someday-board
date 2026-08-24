// App state: the single source of truth for items, challenges, custom
// board positions, and the in-memory cache of loaded memory records.
// Other modules import `state` and `memoryCache` directly and read/mutate
// their properties; only this module ever reassigns them wholesale.

import { storage } from './storage.js';

export let state = {
  items: [],
  settings: { challenges: { week: null, month: null } },
  positions: {}
};

export let memoryCache = {};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export async function loadState() {
  try {
    const res = await storage.get('wheel-state');
    if (res && res.value) {
      const parsed = JSON.parse(res.value);
      state = Object.assign(
        { items: [], settings: { challenges: { week: null, month: null } }, positions: {} },
        parsed
      );
      if (!state.settings.challenges) state.settings.challenges = { week: null, month: null };
      if (!state.positions) state.positions = {};
    }
  } catch (e) {
    /* no state yet, use default */
  }
}

export async function saveState() {
  try {
    await storage.set('wheel-state', JSON.stringify(state));
  } catch (e) {
    console.error('save failed', e);
  }
}

export async function saveMemoryRecord(itemId, memory) {
  try {
    await storage.set('memory:' + itemId, JSON.stringify(memory));
  } catch (e) {
    console.error('save memory failed', e);
  }
}

export async function getMemoryRecord(itemId) {
  try {
    const res = await storage.get('memory:' + itemId);
    return res && res.value ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}

export function activeChallengeItemIds() {
  const c = state.settings.challenges;
  return [c.week && c.week.itemId, c.month && c.month.itemId].filter(Boolean);
}
