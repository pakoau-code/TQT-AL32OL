c// v13 — toma control inmediato y evita servir index.html desde caché antigua
const CACHE_NAME = 'tqt-al32ol-v14';
const ASSETS = [
  './index.html',
  './index-desktop.html', // si no lo usas, borra esta línea
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './logo-tqt.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // pasa a "activate" sin esperar
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim()) // toma control de todas las pestañas
  );
});

// Network-first para navegaciones (index.html) y cache-first para demás recursos
self.addEventListener('fetch', (event) => {
  const req = event.request;

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
