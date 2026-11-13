// Network-first service worker: always try fresh files, fall back to cache when offline.
const C = 'brief-v2';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(['./', 'index.html', 'manifest.json', 'icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;  // live APIs: never cached
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(C).then((c) => c.put(e.request.url.split('?')[0], copy));
      return r;
    }).catch(() => caches.match(e.request.url.split('?')[0]))
  );
});
