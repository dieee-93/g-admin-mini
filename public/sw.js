// Service Worker for G-Admin Mini - Production Build
// This is a wrapper that imports the main ServiceWorker.ts implementation

// Import the compiled ServiceWorker code
// Note: In production, this will be replaced by the bundled ServiceWorker.ts
importScripts('/assets/ServiceWorker.js');

console.log('[SW] G-Admin Mini Service Worker loaded from public/sw.js');
