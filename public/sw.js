/**
 * PRO WEBCAM STUDIO - Progressive Web App Service Worker
 * Provides offline support, asset caching, and standalone PWA experience.
 */

const CACHE_NAME = 'webcam-studio-v1.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

// Installation: Cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (err) {
        console.warn('[PWA SW] Pre-caching partial notice:', err);
      }
    }).then(() => self.skipWaiting())
  );
});

// Activation: Clean up older cache versions and claim immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[PWA SW] Deleting obsolete cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy:
// - Navigation requests (HTML): Network first with fallback to cached index.html
// - Static assets (scripts, styles, images, fonts): Cache first, fallback to network and cache response
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or unsupported schemes (chrome-extension, blob, data)
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  // Navigation requests: HTML document
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Google fonts or static assets
  const url = new URL(request.url);
  const isFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  const isStatic = isFont ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico');

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cache immediately, optionally revalidate in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => { /* Offline, no-op */ });

          return cachedResponse;
        }

        // Fetch from network and cache
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default fetch handler
  event.respondWith(
    caches.match(request).then((response) => response || fetch(request))
  );
});

// Message listener for skipWaiting trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
