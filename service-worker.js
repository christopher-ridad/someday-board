// Someday Board — offline app shell caching.
// Bump this version string any time the app's files change, so users get updates.
const CACHE_NAME = 'someday-board-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/board.js',
  './js/list.js',
  './js/memories.js',
  './js/nav.js',
  './js/state.js',
  './js/storage.js',
  './js/audio.js',
  './js/utils.js',
  './js/constants.js',
  './js/sw-register.js',
  './images/cork-bg.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for the app shell, falling back to network (and caching the
// response) for anything else. This keeps the app opening instantly and
// working with no connection, since everyone's data already lives in
// localStorage on-device, not on a server.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
