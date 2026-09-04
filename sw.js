const CACHE_NAME = 'workout-log-cache-v9';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './styles.css',
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

// Network-first strategy: try network, fall back to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache the fresh response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// --- Background Timer Logic ---
let bgTimerId = null;

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_TIMER') {
    if (bgTimerId) clearTimeout(bgTimerId);
    
    bgTimerId = setTimeout(() => {
      const title = "휴식 종료";
      const options = {
        body: "휴식시간이 끝났습니다! 다음 세트를 준비하세요.",
        vibrate: [200, 100, 200],
        tag: "rest-timer-notification",
        renotify: true,
        icon: './icon.png' // optional icon
      };
      self.registration.showNotification(title, options);
    }, event.data.duration);
  } else if (event.data && event.data.type === 'CANCEL_TIMER') {
    if (bgTimerId) {
      clearTimeout(bgTimerId);
      bgTimerId = null;
    }
  }
});
