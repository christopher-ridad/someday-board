// Registers the offline-support service worker. Only works when the app is
// actually hosted (http/https) — service workers can't run from a local
// file:// path, which is fine, since installing to a home screen requires
// real hosting anyway.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}
