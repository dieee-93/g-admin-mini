// ⚡ React Scan must be imported FIRST - before React or any other imports
import './wdyr';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ✅ Phase 4: Initialize offline system with Service Worker + Background Sync
import { initializeOffline } from '@/lib/offline';

// Initialize offline system before rendering app
initializeOffline({
  enableServiceWorker: true, // Enable Service Worker in production
  enableBackgroundSync: true // Enable Background Sync API if supported
}).then(result => {
  console.log('[Main] Offline system initialized', result);
}).catch(error => {
  console.error('[Main] Failed to initialize offline system', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
