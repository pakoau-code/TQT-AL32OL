const CACHE_NAME = 'tqt-al32ol-v12';
const ASSETS = [
  './index.html',
  './index-desktop.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './logo-tqt.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
      return res;
    }).catch(() => cached))
  );
});