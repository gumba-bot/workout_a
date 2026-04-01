const CACHE_NAME = 'workout-log-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './icon.png',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return from cache
        }
        return fetch(event.request).catch(() => {
          // If offline and request fails, we can optionally return a fallback or simply let it fail gracefully
          console.log('Fetch failing off-cache for:', event.request.url);
        });
      })
  );
});
