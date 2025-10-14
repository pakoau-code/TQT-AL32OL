// v13 — actualiza ya y toma control de inmediato
const CACHE_NAME = 'tqt-al32ol-v13';
const ASSETS = [
  './index.html',
  './index-desktop.html', // si no usas este archivo, borra esta línea
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './logo-tqt.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  // Network-first para HTML
  if (isHTML) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req) || caches.match('./index.html'))
    );
    return;
  }

  // Cache-first para lo demás
  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      })
    )
  );
});

  // Trato especial para HTML / navegaciones
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html') ||
    req.url.endsWith('/index.html') ||
    req.url.endsWith('/TQT-AL32OL/') ||
    req.url.endsWith('/TQT-AL32OL');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || caches.match('./index.html'))
    );
    return;
  }

  // Resto: cache-first con revalidación
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      })
    )
  );
});
