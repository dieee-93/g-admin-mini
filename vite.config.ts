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
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co", // unsafe-inline for theme script in index.html
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // unsafe-inline needed for Chakra UI
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com https://fonts.gstatic.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'", // Clickjacking protection (works in headers, not meta tags)
        "upgrade-insecure-requests",
      ].join('; '),
    },
  },
  build: {
    // Disable inline assets for CSP compliance
    // CSP doesn't allow data: URIs in img-src by default
    assetsInlineLimit: 0,

    // Bundle size warning limit (500KB)
    chunkSizeWarningLimit: 500,

    // Enable minification
    minify: 'terser',
    terserOptions: {
      // @ts-ignore - Vite types incomplete for terser options
      compress: {
        // Remove console.log/debug in production
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info']
      },
      mangle: {
        // Mangle variable names for smaller bundle
        safari10: true
      }
    },

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 🔧 Atomic Capabilities v2.0 - Core system chunks
          if (id.includes('config/BusinessModelRegistry') ||
              id.includes('config/FeatureRegistry') ||
              id.includes('lib/features/FeatureEngine') ||
              id.includes('lib/capabilities/components/CapabilityGate')) {
            return 'capabilities';
          }

          // Vendor chunks - UI libraries
          if (id.includes('node_modules/@chakra-ui') ||
              id.includes('node_modules/@ark-ui')) {
            return 'vendor-ui';
          }

          // Vendor chunks - Forms
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }

          // Vendor chunks - Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }

          // Vendor chunks - Charts (if used)
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/chart.js')) {
            return 'vendor-charts';
          }

          // Materials module chunk
          if (id.includes('pages/admin/supply-chain/materials')) {
            return 'module-materials';
          }

          // Sales module chunk
          if (id.includes('pages/admin/operations/sales')) {
            return 'module-sales';
          }

          // Customers module chunk
          if (id.includes('pages/admin/core/crm/customers')) {
            return 'module-customers';
          }

          // Staff module chunk
          if (id.includes('pages/admin/resources/staff')) {
            return 'module-staff';
          }

          // Scheduling module chunk
          if (id.includes('pages/admin/resources/scheduling')) {
            return 'module-scheduling';
          }

          // Products module chunk
          if (id.includes('pages/admin/supply-chain/products')) {
            return 'module-products';
          }

          // Suppliers module chunk
          if (id.includes('pages/admin/supply-chain/suppliers')) {
            return 'module-suppliers';
          }

          // Supplier Orders module chunk
          if (id.includes('pages/admin/supply-chain/supplier-orders')) {
            return 'module-supplier-orders';
          }

          // Fiscal module chunk
          if (id.includes('pages/admin/finance/fiscal')) {
            return 'module-fiscal';
          }

          // Floor module chunk
          if (id.includes('pages/admin/operations/floor')) {
            return 'module-floor';
          }

          // Kitchen module chunk
          if (id.includes('pages/admin/operations/kitchen')) {
            return 'module-kitchen';
          }

          // Delivery module chunk
          if (id.includes('pages/admin/operations/delivery')) {
            return 'module-delivery';
          }
        }
      }
    }
  }
})
