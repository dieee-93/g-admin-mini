/**
 * Development Server for Vercel API Functions
 *
 * This Express server runs locally to handle /api/* routes during development.
 * In production, Vercel automatically converts these to serverless functions.
 *
 * Pattern: https://github.com/internetdrew/vite-express-vercel
 */

import express from 'express';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

/**
 * Dynamically load and execute Vercel API functions
 */
async function loadApiHandler(filePath) {
  try {
    // Convert Windows path to file:// URL for ES modules
    const fileUrl = pathToFileURL(filePath).href;

    // Import the handler (supports ESM)
    const module = await import(fileUrl);
    return module.default || module;
  } catch (error) {
    console.error(`[API] Failed to load handler: ${filePath}`, error);
    throw error;
  }
}

/**
 * Scan /api directory and register routes
 */
async function registerApiRoutes() {
  const apiDir = path.join(__dirname, 'api');

  async function scanDirectory(dir, baseRoute = '/api') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const routePath = path.join(baseRoute, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath, routePath);
        } else if (entry.isFile() && /\.(js|ts)$/.test(entry.name)) {
          // Register route for .js or .ts files
          const fileName = entry.name.replace(/\.(js|ts)$/, '');
          const route = path.join(baseRoute, fileName).replace(/\\/g, '/');

          console.log(`[API] Registering route: ${route}`);

          app.all(route, async (req, res) => {
            try {
              const handler = await loadApiHandler(fullPath);

              // Call the Vercel-style handler
              await handler(req, res);
            } catch (error) {
              console.error(`[API] Error executing ${route}:`, error);

              if (!res.headersSent) {
                res.status(500).json({
                  error: 'Internal Server Error',
                  message: error.message,
                  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
              }
            }
          });
        }
      }
    } catch (error) {
      console.error(`[API] Error scanning directory ${dir}:`, error);
    }
  }

  await scanDirectory(apiDir);
}

/**
 * Start the development server
 */
async function startServer() {
  return new Promise((resolve, reject) => {
    try {
      // Register all API routes first (synchronously is fine for this)
      registerApiRoutes().then(() => {
        // Health check endpoint
        app.get('/health', (req, res) => {
          res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // Start listening
        const server = app.listen(PORT, () => {
          console.log('\n🚀 Development API Server');
          console.log(`   ├─ Running on: http://localhost:${PORT}`);
          console.log(`   ├─ API Routes: http://localhost:${PORT}/api/*`);
          console.log(`   └─ Health: http://localhost:${PORT}/health\n`);
          resolve(server);
        });

        server.on('error', (error) => {
          console.error('[API] Server error:', error);
          reject(error);
        });
      }).catch(reject);
    } catch (error) {
      console.error('[API] Failed to start server:', error);
      reject(error);
    }
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[API] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('[API] Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server and keep the promise alive
await startServer();
