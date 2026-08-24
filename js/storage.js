// Real persistent storage, backed by the browser's localStorage.
//
// This gives the rest of the app the same small async key-value interface
// (get/set/delete/list) that the app was originally prototyped against, so
// nothing else in the codebase needs to know or care that the underlying
// storage is localStorage. Swap this file out later (e.g. for IndexedDB, or
// a real backend) without touching any other module.

const PREFIX = 'somedayboard:';

function fullKey(key) {
  return PREFIX + key;
}

export const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(fullKey(key));
      if (raw === null) return null;
      return { key, value: raw, shared: false };
    } catch (e) {
      console.error('storage.get failed', e);
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(fullKey(key), value);
      return { key, value, shared: false };
    } catch (e) {
      console.error('storage.set failed', e);
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded'));
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(fullKey(key));
      return { key, deleted: true, shared: false };
    } catch (e) {
      console.error('storage.delete failed', e);
      return null;
    }
  },

  async list(prefix) {
    try {
      const p = fullKey(prefix || '');
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(p) === 0) keys.push(k.slice(PREFIX.length));
      }
      return { keys, prefix, shared: false };
    } catch (e) {
      console.error('storage.list failed', e);
      return null;
    }
  }
};
