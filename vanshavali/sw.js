/* TOMBSTONE — 2026-11-14.
   The Digital Vanshavali page was removed from the site. This service worker
   previously cached /vanshavali/ and /vanshavali/index.html, so any browser
   that installed it would keep serving the deleted page from its own cache
   indefinitely. Deleting this file is NOT enough: an already-installed worker
   keeps running until its script is replaced.

   This replacement deletes every cache it owns and unregisters itself on the
   next update check, then reloads any open client onto the live site. */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const c of clients) {
      try { c.navigate(c.url); } catch (_) { /* cross-origin or detached */ }
    }
  })());
});

/* Never serve from cache again — always go to the network. */
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
