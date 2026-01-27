// Service Worker for G-Admin Mini
// 🚨 PRODUCTION ONLY - NOT registered in development to avoid conflicts with Vite HMR
// Standalone implementation - no external dependencies
//
// Registration:
// - Development: DISABLED (see App.tsx - enableServiceWorker: import.meta.env.PROD)
// - Production: ENABLED for offline-first capabilities
//
// Why disabled in dev:
// - Vite HMR uses @react-refresh, client.js, and other dynamic resources
// - Service Worker caching interferes with hot reloading
// - Causes 408 timeout errors on Vite dev server resources

const CACHE_NAME = 'g-admin-mini-v3.1.2'; // Updated: Skip external APIs (Georef, USIG, Nominatim)
const OFFLINE_URL = '/offline.html';

// Critical assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing G-Admin Mini Service Worker v3.1.2');

  // Force immediate activation (skip waiting)
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching static assets');

        // Cache assets individually to avoid failing due to one bad asset
        for (const asset of STATIC_ASSETS) {
          try {
            await cache.add(asset);
            console.log(`[SW] Cached: ${asset}`);
          } catch (assetError) {
            console.warn(`[SW] Failed to cache asset: ${asset}`, assetError);
          }
        }

        console.log('[SW] Static assets cached successfully');
      } catch (error) {
        console.error('[SW] Install failed:', error);
      }
    })()
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating G-Admin Mini Service Worker v3.1.2');

  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => name !== CACHE_NAME && name.startsWith('g-admin-mini'))
          .map(name => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          });

        await Promise.all(deletePromises);

        console.log('[SW] Service Worker activated successfully');
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

// Fetch Event - Network-first strategy for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Google Fonts (always fetch fresh to respect CSP)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return;
  }

  // 🚨 CRITICAL: Skip external APIs (INDUSTRY STANDARD)
  // Service Workers should NEVER intercept third-party APIs
  // Refs: Workbox patterns, next-pwa, Vite PWA
  const externalAPIs = [
    'apis.datos.gob.ar',              // Georef AR
    'servicios.usig.buenosaires.gob.ar', // USIG Buenos Aires
    'nominatim.openstreetmap.org',    // Nominatim
    'tile.openstreetmap.org',         // OpenStreetMap tiles
  ];

  if (externalAPIs.some(domain => url.hostname.includes(domain))) {
    console.log(`[SW] Bypassing external API: ${url.hostname}`);
    return; // Let browser handle it directly
  }

  // 🚨 CRITICAL: Skip Vite HMR resources (development mode detection)
  // These resources MUST bypass SW to avoid breaking hot reload
  const viteResources = [
    '/@vite/',           // Vite client scripts
    '/@react-refresh',   // React Fast Refresh
    '/@id/',             // Vite virtual modules
    '/__vite_ping',      // Vite health check
    '/node_modules/.vite/', // Vite cache
    '?import&t=',        // Vite timestamp imports
    '&t=',               // Vite cache busting
  ];

  // Check if this is a Vite development resource
  const isViteResource = viteResources.some(pattern =>
    url.pathname.includes(pattern) || url.search.includes(pattern)
  );

  if (isViteResource) {
    // Let Vite handle it directly, don't intercept
    console.log(`[SW] Bypassing Vite resource: ${url.pathname}`);
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // API requests: Network-first strategy
        if (url.pathname.startsWith('/api/')) {
          try {
            const networkResponse = await fetch(request);
            // Clone and cache successful API responses
            if (networkResponse.ok) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            // Network failed, try cache
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              console.log(`[SW] Serving cached API response: ${url.pathname}`);
              return cachedResponse;
            }
            throw error;
          }
        }

        // Static assets: Cache-first strategy
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        const networkResponse = await fetch(request);

        // Cache successful responses for static assets
        if (networkResponse.ok && (
          url.pathname.endsWith('.js') ||
          url.pathname.endsWith('.css') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.jpg') ||
          url.pathname.endsWith('.svg') ||
          url.pathname.endsWith('.woff') ||
          url.pathname.endsWith('.woff2')
        )) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        console.error('[SW] Fetch failed:', error);

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          const cachedOffline = await caches.match(OFFLINE_URL);
          if (cachedOffline) {
            return cachedOffline;
          }
        }

        // Return error response
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })()
  );
});

// Background Sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'g-admin-background-sync') {
    event.waitUntil(
      (async () => {
        try {
          // Notify all clients that sync is happening
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'BACKGROUND_SYNC',
              status: 'started'
            });
          });

          console.log('[SW] Background sync completed');

          // Notify success
          clients.forEach(client => {
            client.postMessage({
              type: 'BACKGROUND_SYNC',
              status: 'completed'
            });
          });
        } catch (error) {
          console.error('[SW] Background sync failed:', error);
        }
      })()
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('[SW] Cache cleared');
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] G-Admin Mini Service Worker script loaded');
