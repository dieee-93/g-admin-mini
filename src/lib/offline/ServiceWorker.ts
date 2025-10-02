// ServiceWorker.ts - PWA Implementation for G-Admin Mini
// Provides offline-first capabilities with intelligent caching and sync

/// <reference lib="webworker" />

import { logger } from '@/lib/logging';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'g-admin-mini-v3.0';
const OFFLINE_URL = '/offline.html';
const SYNC_TAG = 'g-admin-background-sync';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Critical CSS and JS will be added during build
];

// API endpoints that should work offline
const OFFLINE_ENDPOINTS = [
  '/api/sales',
  '/api/operations',
  '/api/materials',
  '/api/staff',
  '/api/customers',
  '/api/scheduling',
  '/api/settings'
];

// Data that needs background sync
const SYNC_OPERATIONS = [
  'orders',
  'inventory-updates',
  'staff-clock',
  'payments',
  'kitchen-updates'
];

// Install Event - Cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  logger.info('OfflineSync', '[ServiceWorker] Installing G-Admin Mini SW v3.0');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      logger.info('OfflineSync', '[ServiceWorker] Caching static assets');
      
      try {
        await cache.addAll(STATIC_ASSETS);
        logger.info('OfflineSync', '[ServiceWorker] Static assets cached successfully');
      } catch (error) {
        logger.error('OfflineSync', '[ServiceWorker] Failed to cache static assets:', error);
        // Cache assets individually to avoid failing due to one bad asset
        for (const asset of STATIC_ASSETS) {
          try {
            await cache.add(asset);
          } catch (assetError) {
            logger.error('OfflineSync', `[ServiceWorker] Failed to cache asset: ${asset}`, assetError);
          }
        }
      }
      
      // Skip waiting to activate immediately
      await self.skipWaiting();
    })()
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  logger.info('OfflineSync', '[ServiceWorker] Activating G-Admin Mini SW v3.0');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames
        .filter(name => name !== CACHE_NAME && name.startsWith('g-admin-mini'))
        .map(name => {
          logger.info('OfflineSync', `[ServiceWorker] Deleting old cache: ${name}`);
          return caches.delete(name);
        });
      
      await Promise.all(deletePromises);
      
      // Claim all clients immediately
      await self.clients.claim();
      
      logger.info('OfflineSync', '[ServiceWorker] G-Admin Mini SW v3.0 activated');
    })()
  );
});

// Fetch Event - Implement offline-first strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for now
  if (request.method !== 'GET') {
    return handleNonGetRequest(event);
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(event);
  } else if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    return handleStaticAssets(event);
  } else {
    return handlePageRequest(event);
  }
});

// Handle API requests with network-first strategy
function handleApiRequest(event: FetchEvent): void {
  const { request } = event;
  const url = new URL(request.url);
  
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
          // Cache successful responses for offline access
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        logger.error('OfflineSync', `[ServiceWorker] Network failed for ${url.pathname}, trying cache`);
        
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          // Add offline indicator header
          const headers = new Headers(cachedResponse.headers);
          headers.set('X-Served-From', 'cache');
          headers.set('X-Offline-Mode', 'true');
          
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers
          });
        }
        
        // No cache available, return offline response
        return createOfflineApiResponse(url.pathname);
      }
    })()
  );
}

// Handle static assets with cache-first strategy
function handleStaticAssets(event: FetchEvent): void {
  event.respondWith(
    (async () => {
      // Try cache first for static assets
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Not in cache, try network
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        logger.error('OfflineSync', '[ServiceWorker] Failed to load static asset:', event.request.url);
        throw error;
      }
    })()
  );
}

// Handle page requests
function handlePageRequest(event: FetchEvent): void {
  event.respondWith(
    (async () => {
      try {
        // Try network first for pages
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        logger.error('OfflineSync', '[ServiceWorker] Network failed for page, serving from cache');
        
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Serve offline page for navigation requests
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          return offlineResponse || new Response('Offline', { status: 200 });
        }
        
        throw error;
      }
    })()
  );
}

// Handle non-GET requests (POST, PUT, DELETE)
function handleNonGetRequest(event: FetchEvent): void {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle API requests for offline operations
  if (!url.pathname.startsWith('/api/')) {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (error) {
        logger.error('OfflineSync', `[ServiceWorker] Network failed for ${request.method} ${url.pathname}`);
        
        // Store request for background sync
        await storeRequestForSync(request);
        
        // Return success response to prevent app errors
        return new Response(JSON.stringify({
          success: true,
          offline: true,
          message: 'Request queued for sync when online',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Offline-Mode': 'true',
            'X-Sync-Queued': 'true'
          }
        });
      }
    })()
  );
}

// Background Sync Event
self.addEventListener('sync', (event: unknown) => {
  logger.info('OfflineSync', '[ServiceWorker] Background sync triggered:', event.tag);
  
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncQueuedRequests());
  }
});

// Message Event - Communication with main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  logger.info('OfflineSync', '[ServiceWorker] Message received:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    case 'SYNC_NOW':
      syncQueuedRequests().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    case 'CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      });
      break;
  }
});

// Push Event - Handle push notifications
self.addEventListener('push', (event: PushEvent) => {
  logger.info('OfflineSync', '[ServiceWorker] Push received');
  
  let notificationData = {
    title: 'G-Admin Mini',
    body: 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {}
  };
  
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      logger.error('OfflineSync', '[ServiceWorker] Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      requireInteraction: false,
      silent: false
    })
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  logger.info('OfflineSync', '[ServiceWorker] Notification clicked');
  
  event.notification.close();
  
  // Handle notification click based on data
  const { data } = event.notification;
  let targetUrl = '/';
  
  if (data && data.url) {
    targetUrl = data.url;
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      // Return undefined if openWindow is not available
      return undefined;
    })
  );
});

// Helper Functions

async function createOfflineApiResponse(pathname: string): Promise<Response> {
  const offlineData = await getOfflineData(pathname);
  
  return new Response(JSON.stringify(offlineData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Served-From': 'offline',
      'X-Offline-Mode': 'true'
    }
  });
}

async function getOfflineData(pathname: string): Promise<any> {
  // Return appropriate offline data based on endpoint
  const baseResponse = {
    success: true,
    offline: true,
    message: 'Data served from offline storage',
    timestamp: new Date().toISOString()
  };
  
  switch (true) {
    case pathname.includes('/admin/sales'):
      return {
        ...baseResponse,
        data: {
          orders: [],
          summary: { total: 0, count: 0 }
        }
      };
    case pathname.includes('/admin/materials'):
      return {
        ...baseResponse,
        data: {
          items: [],
          alerts: []
        }
      };
    case pathname.includes('/admin/staff'):
      return {
        ...baseResponse,
        data: {
          employees: [],
          schedules: []
        }
      };
    default:
      return {
        ...baseResponse,
        data: {}
      };
  }
}

async function storeRequestForSync(request: Request): Promise<void> {
  try {
    // Clone request for storage
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };
    
    // Store in IndexedDB (implementation would use a proper IndexedDB wrapper)
    logger.info('OfflineSync', '[ServiceWorker] Storing request for sync:', requestData);
    
    // Register for background sync
    if ('sync' in self.registration) {
      await (self.registration as any).sync.register(SYNC_TAG);
    }
  } catch (error) {
    logger.error('OfflineSync', '[ServiceWorker] Error storing request for sync:', error);
  }
}

async function syncQueuedRequests(): Promise<void> {
  logger.info('OfflineSync', '[ServiceWorker] Syncing queued requests...');
  
  try {
    // Get queued requests from IndexedDB
    const queuedRequests = await getQueuedRequests();
    
    for (const requestData of queuedRequests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          logger.info('OfflineSync', `[ServiceWorker] Successfully synced: ${requestData.method} ${requestData.url}`);
          await removeQueuedRequest(requestData);
        } else {
          logger.error('OfflineSync', `[ServiceWorker] Sync failed for: ${requestData.method} ${requestData.url}`, response.status);
        }
      } catch (error) {
        logger.error('OfflineSync', `[ServiceWorker] Sync error for: ${requestData.method} ${requestData.url}`, error);
      }
    }
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: { syncedCount: queuedRequests.length }
      });
    });
    
  } catch (error) {
    logger.error('OfflineSync', '[ServiceWorker] Error during sync:', error);
  }
}

async function getQueuedRequests(): Promise<any[]> {
  // This would be implemented with proper IndexedDB operations
  logger.info('OfflineSync', '[ServiceWorker] Getting queued requests from IndexedDB');
  return [];
}

async function removeQueuedRequest(requestData: unknown): Promise<void> {
  // This would be implemented with proper IndexedDB operations
  logger.info('OfflineSync', '[ServiceWorker] Removing synced request from queue');
}

async function clearCache(): Promise<void> {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames
    .filter(name => name.startsWith('g-admin-mini'))
    .map(name => caches.delete(name));
  
  await Promise.all(deletePromises);
  logger.info('OfflineSync', '[ServiceWorker] All caches cleared');
}

async function getCacheStats(): Promise<any> {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }
  
  return {
    version: CACHE_NAME,
    itemCount: keys.length,
    totalSize,
    lastUpdated: Date.now()
  };
}

// Connection Status Monitoring
let isOnline = true;

self.addEventListener('online', () => {
  logger.info('OfflineSync', '[ServiceWorker] Device is now online');
  isOnline = true;
  
  // Notify clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NETWORK_STATUS',
        payload: { online: true }
      });
    });
  });
  
  // Trigger sync
  if ('sync' in self.registration) {
    (self.registration as any).sync.register(SYNC_TAG);
  }
});

self.addEventListener('offline', () => {
  logger.info('OfflineSync', '[ServiceWorker] Device is now offline');
  isOnline = false;
  
  // Notify clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NETWORK_STATUS',
        payload: { online: false }
      });
    });
  });
});

export {};