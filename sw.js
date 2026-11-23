const CACHE_STATIC_NAME = 'static-camara-v1';
const STATIC_FILES = [
  './', './index.html', './styles.css', './app.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'
];

// DESAFÍO 1: PRECARGAR LOS ARCHIVOS.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_STATIC_NAME).then((cache) => cache.addAll(STATIC_FILES)));
});

// DESAFÍO 1: CACHE FIRST.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE_STATIC_NAME)
      .then((cache) => cache.match(event.request))
      .then((respuesta) => respuesta || fetch(event.request))
  );
});
