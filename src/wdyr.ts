/// <reference types="@welldone-software/why-did-you-render" />

/**
 * React Performance Monitoring with React Scan
 *
 * Configuration optimized for debugging infinite loops based on official documentation.
 *
 * Key Features:
 * - Visual feedback: Components flash when rendering (red/hot = frequent)
 * - Inspector mode: Click toolbar icon → select component to see why it rendered
 * - Auto-detection: onRender callback alerts for potential infinite loops (>50 renders)
 * - Keyboard shortcuts: Shift+L (toggle logging), Shift+U (track unnecessary renders)
 *
 * Toolbar (bottom-right):
 * - Toggle icon: Show/hide outlines
 * - Inspector icon (left): "Why did it render?" mode
 * - Bell icon: Performance profiler
 *
 * Official Docs: https://github.com/aidenybai/react-scan
 */

// ⚠️ CRITICAL: React Scan must be imported BEFORE React
import { scan } from 'react-scan';
import React from 'react';

// 🔍 DEBUG: Track how many times this module loads
if (!window.__WDYR_LOAD_COUNT__) {
  window.__WDYR_LOAD_COUNT__ = 0;
}
window.__WDYR_LOAD_COUNT__++;
console.warn(`🔄 [WDYR MODULE LOAD] Count: ${window.__WDYR_LOAD_COUNT__}`);

// 🔍 React Scan - Optimized Configuration for Infinite Loop Detection
if (import.meta.env.DEV && typeof window !== 'undefined') {
  scan({
    // Core Settings
    enabled: true,
    showToolbar: true,
    animationSpeed: 'fast',

    // Filtering (CRITICAL for reducing noise)
    renderCountThreshold: 5,  // Only show components rendering 5+ times
    resetCountTimeout: 5000,  // Reset counts every 5 seconds

    // Performance Settings (start conservative)
    log: false,  // Enable via Shift+L or toolbar when needed
    trackUnnecessaryRenders: false,  // Enable via Shift+U when needed
    playSound: true,  // Geiger counter for renders

    // Infinite Loop Auto-Detection
    onRender: (fiber, renders) => {
      const componentName = fiber.type?.name || 'Anonymous';
      const count = renders.length;

      // Alert for potential infinite loops
      if (count > 50) {
        console.error(`🔥 POTENTIAL INFINITE LOOP: ${componentName} (${count} renders in 5s)`);
        console.log('Component fiber:', fiber);
        console.log('Render history (last 10):', renders.slice(-10));

        // Break to inspect state
        if (import.meta.env.DEV) {
          debugger;
        }
      }

      // Warning for high render counts
      if (count > 20 && count <= 50) {
        console.warn(`⚠️ High render count: ${componentName} (${count} renders)`);
      }
    }
  });

  // Keyboard Shortcuts for Runtime Control
  window.addEventListener('keydown', (e) => {
    // Shift+L: Toggle console logging
    if (e.shiftKey && e.key === 'L') {
      const currentOptions = (window as any).__REACT_SCAN_OPTIONS__ || {};
      scan({ log: !currentOptions.log });
      console.log('🔍 React Scan logging:', !currentOptions.log ? 'ON' : 'OFF');
    }

    // Shift+U: Toggle unnecessary render tracking
    if (e.shiftKey && e.key === 'U') {
      const currentOptions = (window as any).__REACT_SCAN_OPTIONS__ || {};
      scan({ trackUnnecessaryRenders: !currentOptions.trackUnnecessaryRenders });
      console.log('🔍 Unnecessary render tracking:', !currentOptions.trackUnnecessaryRenders ? 'ON' : 'OFF');
    }

    // Shift+R: Reset render counts
    if (e.shiftKey && e.key === 'R') {
      scan({ resetCountTimeout: 1 });
      setTimeout(() => scan({ resetCountTimeout: 5000 }), 100);
      console.log('🔄 Render counts reset');
    }
  });

  console.log(`✅ [React Scan] Initialized - Watch for flashing components (Load #${window.__WDYR_LOAD_COUNT__})`);
  console.log('📋 [React Scan] Keyboard shortcuts: Shift+L (log), Shift+U (unnecessary), Shift+R (reset)');
  console.log('🎯 [React Scan] Threshold: Only showing components with 5+ renders');
}

// ❌ Why Did You Render - DISABLED (incompatible with Vite + causes hook order errors)
// ✅ Alternative: React Scan provides better DX and works perfectly with Vite
console.log('ℹ️ [WDYR] Disabled - Using React Scan instead (better Vite compatibility)');
