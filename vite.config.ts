import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import cspPlugin from 'vite-plugin-csp'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    // Content Security Policy - Protects against XSS, clickjacking, and code injection
    cspPlugin({
      policy: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'wasm-unsafe-eval'", // Required for Vite HMR in development
          'https://*.supabase.co', // Supabase Auth/Realtime scripts
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'", // Required for Chakra UI inline styles
        ],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'connect-src': [
          "'self'",
          'https://*.supabase.co', // Supabase API
          'wss://*.supabase.co', // Supabase Realtime WebSocket
        ],
        'font-src': ["'self'", 'data:'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"], // Prevents clickjacking (X-Frame-Options: DENY)
        'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS automatically
      },
    }),
  ],
  build: {
    // Disable inline assets for CSP compliance
    // CSP doesn't allow data: URIs in img-src by default
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          // 🔧 Atomic Capabilities v2.0 - Core system chunks
          // Loaded eagerly to ensure capabilities are available before lazy routes
          'capabilities': [
            './src/config/BusinessModelRegistry.ts',
            './src/config/FeatureRegistry.ts',
            './src/lib/features/FeatureEngine.ts',
            './src/lib/capabilities/components/CapabilityGate.tsx'
          ]
        }
      }
    }
  }
})
