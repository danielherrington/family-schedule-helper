// Progressive Web App Service Worker for Family Schedule Helper
const CACHE_NAME = 'family-schedule-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET requests and API / OAuth / Google APIs calls from caching
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('accounts.google.com')
  ) {
    return;
  }

  // Handle page navigation: Network-first, fallback to cached index.html for full offline support
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          return cached || caches.match(event.request);
        })
    );
    return;
  }

  // Handle static assets (JS, CSS, images, fonts): Cache-first with background network update (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
