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
 *
 * ⚠️ PRODUCTION NOTE:
 * React Scan is DISABLED in production builds to avoid initialization conflicts with Emotion.
 * The development tool (this file) is different from React Scan Monitoring (https://react-scan.com/monitoring),
 * which is a paid SaaS service for production analytics.
 */

// ⚠️ CRITICAL FIX: Only load React Scan in DEVELOPMENT
// Importing 'react-scan' before React causes Emotion initialization errors in production builds
// This is because scan() modifies React's internals and Terser minification breaks the order

// 🎯 PLAYWRIGHT FIX: Disable React Scan during E2E tests for performance
// React Scan causes massive FPS drops (60 FPS → 3 FPS) in headed mode
const isPlaywrightTest = typeof navigator !== 'undefined' && navigator.webdriver;

if (import.meta.env.DEV && typeof window !== 'undefined' && !isPlaywrightTest) {
  // 🔍 DEBUG: Track how many times this module loads
  if (!window.__WDYR_LOAD_COUNT__) {
    window.__WDYR_LOAD_COUNT__ = 0;
  }
  window.__WDYR_LOAD_COUNT__++;
  console.warn(`🔄 [WDYR MODULE LOAD] Count: ${window.__WDYR_LOAD_COUNT__}`);

  // ⚠️ Dynamic import to ensure it's tree-shaken in production
  import('react-scan').then(({ scan }) => {
    // 🔍 React Scan - Optimized Configuration for Infinite Loop Detection
    scan({
      // Core Settings
      enabled: true,
      showToolbar: true,
      animationSpeed: 'slow', // Cambio a 'slow' para ver mejor los flashes

      // Filtering (REDUCIR threshold para ver más actividad)
      renderCountThreshold: 0,  // Mostrar TODOS los renders (0 = sin filtro)
      resetCountTimeout: 10000,  // AUMENTAR a 10 segundos para capturar más renders

      // Performance Settings (ACTIVAR para debugging)
      log: true,  // ACTIVADO por defecto para ver en consola
      trackUnnecessaryRenders: true,  // ACTIVADO por defecto
      playSound: false,  // Desactivado para no ser molesto

      // 🎯 FILTRAR componentes de Chakra UI y mostrar solo tus componentes
      includeChildren: false, // No mostrar hijos internos de componentes
      exclude: [
        // Excluir todos los componentes internos de Chakra UI
        /^chakra\./,
        /^Chakra/,
        /^Box$/,
        /^Stack$/,
        /^Text$/,
        /^Button$/,
        /^Flex$/,
        /^Grid$/,
        /^Center$/,
        /^Container$/,
        /^Heading$/,
        /^Card/,
        /^Badge$/,
        /^Icon/,
        /^Spinner$/,
        // Excluir componentes de React Router
        /^Router/,
        /^Route/,
        /^Link$/,
        /^Navigate/,
        // Excluir providers y wrappers genéricos
        /Provider$/,
        /Context$/,
        /Wrapper$/,
      ],

      // Infinite Loop Auto-Detection
      onRender: (fiber, renders) => {
        const componentName = fiber.type?.name || fiber.type?.displayName || 'Anonymous';
        const count = renders.length;

        // 🎯 MOSTRAR SIEMPRE si hay más de 10 renders
        if (count > 10) {
          console.warn(`⚠️ [React Scan] ${componentName} renderizó ${count} veces en 10s`);
        }

        // Alert for potential infinite loops
        if (count > 50) {
          console.error(`🔥 POTENTIAL INFINITE LOOP: ${componentName} (${count} renders en 10s)`);
          console.log('Component fiber:', fiber);
          console.log('Render history (últimos 10):', renders.slice(-10));

          // Break to inspect state
          if (import.meta.env.DEV) {
            debugger;
          }
        }

        // Warning for high render counts
        if (count > 20 && count <= 50) {
          console.warn(`⚠️ High render count: ${componentName} (${count} renders)`);
        }

        // 🎯 LOG cada 5 renders para tracking continuo
        if (count % 5 === 0 && count > 5) {
          console.log(`📊 [React Scan] ${componentName}: ${count} renders acumulados`);
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
  }).catch(error => {
    console.error('❌ [React Scan] Failed to initialize:', error);
  });
} else if (isPlaywrightTest) {
  // Playwright E2E tests - React Scan disabled for performance
  console.log('ℹ️ [WDYR] Disabled - Using React Scan instead (better for visual debugging)');
  console.log('🎭 [Playwright] React Scan disabled to maintain 60 FPS (was causing 3 FPS drop)');
  console.log('💡 React Scan only runs in manual dev mode for debugging re-renders');
} else {
  // Production mode - React Scan is disabled
  console.log('ℹ️ [WDYR] Disabled - Using React Scan instead (better for visual debugging and API compatibility)');
  console.log('💡 For production monitoring, see: https://react-scan.com/monitoring');
}

// ❌ Why Did You Render - DISABLED (incompatible with Vite + causes hook order errors)
// ✅ Alternative: React Scan provides better DX and works perfectly with Vite
console.log('ℹ️ [WDYR] Disabled - Using React Scan instead (better Vite compatibility)');
