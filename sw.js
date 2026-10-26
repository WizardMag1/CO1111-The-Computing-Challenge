/**
 * Service Worker for Treasure Hunt Web App
 * Caches static app shell for fast loading and offline presentation.
 */

const CACHE_NAME = 'treasure-hunt-shell-v1';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'app.html',
  'test.html',
  'notes.html',
  'css/styles.css',
  'app.js',
  'manifest.json',
  'assets/icons/icon-192x192.png',
  'assets/icons/icon-512x512.png',
  'favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Service worker pre-caching non-critical failure:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let live API calls pass straight through to network
  if (event.request.url.includes('/th/api/') || event.request.url.includes('/th/test-api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const toCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('app.html');
        }
      });
    })
  );
});
