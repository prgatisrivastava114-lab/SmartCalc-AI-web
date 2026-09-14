const CACHE_NAME = 'vanshavali-app-v3.0';
const ASSETS_TO_CACHE = [
  '/vanshavali/',
  '/vanshavali/index.html',
  '/vanshavali/manifest.json',
  '/assets/brand/mfp_icon.png',
  '/assets/brand/brand_logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/vanshavali/index.html');
        }
      });
    })
  );
});
