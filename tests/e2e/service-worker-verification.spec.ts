/**
 * Service Worker Verification Tests
 *
 * Tests that Service Worker registers correctly and handles background sync.
 * These tests run against production build only.
 */

import { test, expect } from '@playwright/test';

// Helper: Check if running against production build
function isProductionBuild() {
  return process.env.BASE_URL?.includes(':4173') || process.env.BASE_URL?.includes('preview');
}

test.describe('Service Worker Registration', () => {
  test.skip(!isProductionBuild(), 'Service Worker only available in production build');

  test('should register Service Worker successfully', async ({ page, context }) => {
    // Navigate to app
    await page.goto('/');

    // Wait for Service Worker to register
    await page.waitForTimeout(2000);

    // Check if Service Worker is registered
    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    });

    expect(swRegistered).toBe(true);
  });

  test('should have active Service Worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const hasActiveSW = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration?.active;
    });

    expect(hasActiveSW).toBe(true);
  });

  test('should log Service Worker initialization', async ({ page }) => {
    const consoleMessages: string[] = [];

    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Check for offline system initialization message
    const hasInitMessage = consoleMessages.some(msg =>
      msg.includes('[Main] Offline system initialized') ||
      msg.includes('Service Worker')
    );

    expect(hasInitMessage).toBe(true);
  });
});

test.describe('Background Sync API', () => {
  test.skip(!isProductionBuild(), 'Background Sync only in production');

  test('should detect Background Sync support', async ({ page, browserName }) => {
    await page.goto('/');

    const bgSyncSupported = await page.evaluate(() => {
      return 'sync' in ServiceWorkerRegistration.prototype;
    });

    // Chrome/Edge support Background Sync, Firefox/Safari don't
    if (browserName === 'chromium') {
      expect(bgSyncSupported).toBe(true);
    } else {
      // Firefox/Safari should gracefully handle lack of support
      expect(bgSyncSupported).toBe(false);
    }
  });

  test('should register background sync when operation queued (Chrome only)', async ({ page, browserName, context }) => {
    test.skip(browserName !== 'chromium', 'Background Sync only in Chrome');

    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Navigate to materials
    await page.goto('/admin/supply-chain/materials');
    await page.waitForSelector('[data-testid="materials-page"]', { timeout: 10000 });

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Create material offline
    await page.click('button:has-text("Nuevo Material")');
    await page.waitForSelector('[data-testid="material-form-dialog"]');
    await page.fill('input[name="name"]', `SW Test ${Date.now()}`);
    await page.selectOption('select[name="type"]', 'measurable');
    await page.fill('input[name="unit_cost"]', '100');
    await page.click('button[type="submit"]:has-text("Crear")');

    await page.waitForTimeout(1000);

    // Check if background sync was registered
    const syncRegistered = await page.evaluate(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const tags = await registration.sync.getTags();
        return tags.includes('offline-sync-queue');
      } catch {
        return false;
      }
    });

    expect(syncRegistered).toBe(true);
  });
});

test.describe('IndexedDB Queue', () => {
  test('should access IndexedDB queue', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    await page.goto('/admin/supply-chain/materials');
    await page.waitForSelector('[data-testid="materials-page"]', { timeout: 10000 });

    // Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Create material
    await page.click('button:has-text("Nuevo Material")');
    await page.waitForSelector('[data-testid="material-form-dialog"]');
    await page.fill('input[name="name"]', `Queue Test ${Date.now()}`);
    await page.selectOption('select[name="type"]', 'measurable');
    await page.fill('input[name="unit_cost"]', '150');
    await page.click('button[type="submit"]:has-text("Crear")');

    await page.waitForTimeout(1000);

    // Verify command in IndexedDB
    const queueHasCommand = await page.evaluate(async () => {
      const dbRequest = indexedDB.open('g_admin_offline', 1);

      return new Promise((resolve) => {
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const tx = db.transaction('sync_queue', 'readonly');
          const store = tx.objectStore('sync_queue');
          const index = store.index('by-status');
          const request = index.getAll('pending');

          request.onsuccess = () => {
            const commands = request.result || [];
            db.close();
            resolve(commands.length > 0);
          };

          request.onerror = () => {
            db.close();
            resolve(false);
          };
        };

        dbRequest.onerror = () => resolve(false);
      });
    });

    expect(queueHasCommand).toBe(true);
  });
});

test.describe('Service Worker Communication', () => {
  test.skip(!isProductionBuild(), 'Service Worker only in production');

  test('should receive messages from Service Worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Set up message listener
    const messageReceived = await page.evaluate(() => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);

        navigator.serviceWorker.addEventListener('message', (event) => {
          clearTimeout(timeout);
          resolve(true);
        }, { once: true });

        // Trigger manual sync to get a message
        navigator.serviceWorker.ready.then(reg => {
          if (reg.active) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = () => {
              clearTimeout(timeout);
              resolve(true);
            };
            reg.active.postMessage(
              { type: 'MANUAL_SYNC' },
              [messageChannel.port2]
            );
          }
        });
      });
    });

    // Should receive response within 5 seconds
    expect(messageReceived).toBe(true);
  });
});

test.describe('Service Worker Script', () => {
  test.skip(!isProductionBuild(), 'Service Worker only in production');

  test('should load service-worker.js file', async ({ page }) => {
    // Try to fetch the Service Worker script
    const response = await page.goto('/service-worker.js');

    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('javascript');
  });

  test('service-worker.js should contain expected code', async ({ page }) => {
    const response = await page.goto('/service-worker.js');
    const content = await response?.text();

    // Check for key functions
    expect(content).toContain('addEventListener');
    expect(content).toContain('sync');
    expect(content).toContain('SYNC_TAG');
    expect(content).toContain('processQueue');
  });
});

test.describe('Graceful Degradation', () => {
  test('should work without Service Worker in development', async ({ page }) => {
    await page.goto('/');

    // App should load regardless of Service Worker
    await expect(page).toHaveTitle(/G-Admin Mini/);

    // Check console for fallback message (optional)
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(msg.text()));

    await page.waitForTimeout(2000);

    // Should either have SW or fallback message
    const hasRelevantMessage = consoleMessages.some(msg =>
      msg.includes('Service Worker') ||
      msg.includes('Background Sync') ||
      msg.includes('Offline system')
    );

    expect(hasRelevantMessage).toBe(true);
  });
});
