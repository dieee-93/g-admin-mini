import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],

  // ============================================
  // CONTENT SECURITY POLICY - HTTP Headers
  // ============================================
  // Using native Vite server.headers (dev) + production headers setup
  // WHY: vite-plugin-csp is obsolete (3 years old) and uses unreliable meta tags
  // BEST PRACTICE: CSP via HTTP headers is more secure and supports all directives
  server: {
    port: 5173,
    strictPort: true,
    // Optimizaciones para desarrollo
    hmr: {
      overlay: true,
    },
    // Preload de módulos para mejor performance
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/modules/**/manifest.tsx',
      ],
    },
    // Proxy API requests to local Express server in development
    // Pattern: https://github.com/internetdrew/vite-express-vercel
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep the path as-is
      },
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co", // unsafe-inline for theme script in index.html
        "worker-src 'self' blob:", // ✅ Allow Web Workers
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // unsafe-inline needed for Chakra UI
        "img-src 'self' data: https: blob: https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com", // ✅ OpenStreetMap tiles + Leaflet icons
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com https://apis.datos.gob.ar https://servicios.usig.buenosaires.gob.ar https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org", // ✅ Geocoding APIs
        "font-src 'self' data: https://fonts.gstatic.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'", // Clickjacking protection (works in headers, not meta tags)
        "upgrade-insecure-requests",
      ].join('; '),
    },
  },
  // Optimizaciones adicionales para desarrollo
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      '@tanstack/react-query',
      'zustand',
    ],
  },
  build: {
    // TEMPORARY: Enable sourcemaps for debugging
    sourcemap: true,

    // Disable inline assets for CSP compliance
    // CSP doesn't allow data: URIs in img-src by default
    assetsInlineLimit: 0,

    // Bundle size warning limit (500KB)
    chunkSizeWarningLimit: 500,

    // ⚠️ CRITICAL FIX: Use esbuild instead of terser to avoid Emotion initialization errors
    // Terser's aggressive optimization breaks Chakra UI's Emotion CSS-in-JS initialization
    // See: https://github.com/emotion-js/emotion/issues/2752
    minify: 'esbuild', // Changed from 'terser' to 'esbuild'

    // esbuild options (safer minification)
    // Note: esbuild doesn't support drop_console, we'll use a plugin if needed later

    rollupOptions: {
      output: {
        // ✅ BEST PRACTICE: Use object syntax for critical vendor dependencies
        // This ensures proper load order: vendor loads BEFORE any app code
        // Sources:
        // - https://sambitsahoo.com/blog/vite-code-splitting-that-works.html
        // - https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025
        manualChunks: {
          // ✅ Core React libraries - MUST load first (boot dependencies)
          // Including jsx-runtime ensures memo, createContext, etc. are available
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],

          // ✅ Routing libraries - separate for better caching
          'vendor-router': ['react-router-dom'],

          // ✅ Form libraries - frequently used together
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],

          // ✅ Supabase - large library, rarely changes
          'vendor-supabase': ['@supabase/supabase-js', '@supabase/ssr'],

          // ✅ Date/Time libraries - date-fns is used in the project
          'vendor-datetime': ['date-fns'],

          // ✅ Charts - large visualization libraries
          'vendor-charts': ['chart.js', 'react-chartjs-2'],

          // ✅ Icons - heroicons is used throughout the app
          // FIX: Match actual import paths (v2 uses /24/outline, /24/solid, etc.)
          'vendor-icons': ['@heroicons/react/24/outline', '@heroicons/react/24/solid', '@heroicons/react/20/solid'],
        },

        // ⚠️ DO NOT use function-based manualChunks for React
        // It breaks load order and causes "Cannot read properties of undefined"
        // Function approach is only for non-critical, app-specific chunks
      }
    }
  }
})
