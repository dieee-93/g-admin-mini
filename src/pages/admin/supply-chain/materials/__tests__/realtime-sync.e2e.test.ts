/**
 * E2E Tests: Real-Time Sync for Materials Module
 *
 * Tests real-time synchronization across multiple browser contexts
 * using Playwright and Chrome DevTools MCP.
 *
 * Requirements:
 * - Playwright installed (@playwright/test)
 * - Dev server running on localhost:5173
 * - Valid Supabase connection
 * - Chrome DevTools MCP configured
 *
 * NOTE: These tests are SKIPPED by default. To run:
 * 1. Remove .skip from describe()
 * 2. Ensure dev server is running: pnpm dev
 * 3. Run: pnpm test:e2e realtime-sync
 */

import { test, expect } from '@playwright/test';
import { logger } from '@/lib/logging';

describe.skip('Materials Real-Time Sync E2E', () => {
  const BASE_URL = 'http://localhost:5173';
  const MATERIALS_PAGE = `${BASE_URL}/admin/supply-chain/materials`;

  // Helper: Login to application
  async function login(page: any) {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForLoadState('networkidle');
  }

  // ============================================
  // Multi-User Stock Update Sync
  // ============================================
  test('should sync stock updates across multiple browser tabs', async ({ browser }) => {
    logger.info('Realtime-sync.e2e.test', '\n=== TEST: Multi-User Stock Update Sync ===');

    // Create two independent browser contexts (simulates 2 different users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User 1 & 2 login
    logger.debug('Realtime-sync.e2e.test', 'User 1 logging in...');
    await login(page1);
    logger.debug('Realtime-sync.e2e.test', 'User 2 logging in...');
    await login(page2);

    // Both navigate to materials page
    logger.debug('Realtime-sync.e2e.test', 'Both users navigating to materials page...');
    await page1.goto(MATERIALS_PAGE);
    await page2.goto(MATERIALS_PAGE);

    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Wait for table to load
    await page1.waitForSelector('[data-testid="materials-table"]', { timeout: 10000 });
    await page2.waitForSelector('[data-testid="materials-table"]', { timeout: 10000 });

    logger.debug('Realtime-sync.e2e.test', 'Both users on materials page');

    // User 1 gets the first item's current stock
    const initialStock = await page1.textContent(
      '[data-testid="material-row"]:first-child [data-testid="stock-value"]'
    );
    logger.info('Realtime-sync.e2e.test', `Initial stock: ${initialStock}`);

    // User 1 updates stock
    logger.debug('Realtime-sync.e2e.test', 'User 1 updating stock...');
    await page1.click('[data-testid="material-row"]:first-child [data-testid="actions-button"]');
    await page1.click('[data-testid="edit-stock-action"]');

    // Fill new stock value
    await page1.fill('[data-testid="stock-input"]', '250');
    await page1.click('[data-testid="save-stock-button"]');

    // Wait for save confirmation
    await page1.waitForSelector('[data-testid="toast-success"]', { timeout: 5000 });
    logger.debug('Realtime-sync.e2e.test', 'Stock updated by User 1');

    // Wait for real-time propagation (Supabase Realtime typically < 2 seconds)
    logger.info('Realtime-sync.e2e.test', 'Waiting for real-time sync...');
    await page2.waitForTimeout(3000);

    // User 2 should see the updated stock WITHOUT refreshing
    const updatedStock = await page2.textContent(
      '[data-testid="material-row"]:first-child [data-testid="stock-value"]'
    );

    logger.debug('Realtime-sync.e2e.test', `User 2 sees updated stock: ${updatedStock}`);

    expect(updatedStock).toBe('250');
    expect(updatedStock).not.toBe(initialStock);

    await context1.close();
    await context2.close();

    logger.info('Realtime-sync.e2e.test', '=== TEST COMPLETE ===\n');
  });

  // ============================================
  // Low Stock Alert Notification
  // ============================================
  test('should show low stock alert notification in real-time across modules', async ({ browser }) => {
    logger.debug('Realtime-sync.e2e.test', '\n=== TEST: Low Stock Alert Notification ===');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await login(page1);
    await login(page2);

    // User 1 on materials page
    await page1.goto(MATERIALS_PAGE);
    await page1.waitForLoadState('networkidle');

    // User 2 on sales page (different module)
    await page2.goto(`${BASE_URL}/admin/operations/sales`);
    await page2.waitForLoadState('networkidle');

    logger.debug('Realtime-sync.e2e.test', 'User 1 on Materials, User 2 on Sales');

    // User 1 reduces stock below min_stock threshold
    logger.debug('Realtime-sync.e2e.test', 'User 1 reducing stock below threshold...');
    await page1.click('[data-testid="material-row"]:first-child [data-testid="actions-button"]');
    await page1.click('[data-testid="edit-stock-action"]');
    await page1.fill('[data-testid="stock-input"]', '2'); // Below typical min_stock
    await page1.click('[data-testid="save-stock-button"]');

    await page1.waitForSelector('[data-testid="toast-success"]', { timeout: 5000 });
    logger.debug('Realtime-sync.e2e.test', 'Stock reduced below threshold');

    // Wait for EventBus propagation
    await page2.waitForTimeout(3000);

    // User 2 should see low stock notification
    logger.debug('Realtime-sync.e2e.test', 'Checking User 2 for notification...');
    const notification = await page2.waitForSelector(
      '[data-testid="low-stock-notification"]',
      { timeout: 5000 }
    );

    expect(notification).toBeDefined();

    const notificationText = await notification.textContent();
    expect(notificationText).toMatch(/stock bajo|low stock/i);

    logger.debug('Realtime-sync.e2e.test', `Notification received: ${notificationText}`);

    await context1.close();
    await context2.close();

    logger.info('Realtime-sync.e2e.test', '=== TEST COMPLETE ===\n');
  });

  // ============================================
  // Real-Time Item Creation
  // ============================================
  test('should sync new item creation across users', async ({ browser }) => {
    logger.debug('Realtime-sync.e2e.test', '\n=== TEST: Real-Time Item Creation ===');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await login(page1);
    await login(page2);

    await page1.goto(MATERIALS_PAGE);
    await page2.goto(MATERIALS_PAGE);

    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // User 2 gets current item count
    const initialRowCount = await page2.locator('[data-testid="material-row"]').count();
    logger.info('Realtime-sync.e2e.test', `Initial item count: ${initialRowCount}`);

    // User 1 creates new item
    logger.debug('Realtime-sync.e2e.test', 'User 1 creating new item...');
    await page1.click('[data-testid="add-material-button"]');
    await page1.waitForSelector('[data-testid="material-form-modal"]');

    // Fill form
    await page1.fill('[data-testid="name-input"]', 'E2E Test Item');
    await page1.selectOption('[data-testid="type-select"]', 'COUNTABLE');
    await page1.fill('[data-testid="stock-input"]', '50');
    await page1.fill('[data-testid="unit-cost-input"]', '15');
    await page1.click('[data-testid="save-material-button"]');

    // Wait for creation
    await page1.waitForSelector('[data-testid="toast-success"]', { timeout: 5000 });
    logger.info('Realtime-sync.e2e.test', 'New item created by User 1');

    // Wait for real-time sync
    await page2.waitForTimeout(3000);

    // User 2 should see new item without refresh
    const updatedRowCount = await page2.locator('[data-testid="material-row"]').count();
    logger.debug('Realtime-sync.e2e.test', `Updated item count: ${updatedRowCount}`);

    expect(updatedRowCount).toBe(initialRowCount + 1);

    // Verify item appears in User 2's view
    const newItemName = await page2.textContent(
      `[data-testid="material-row"]:has-text("E2E Test Item") [data-testid="name-value"]`
    );

    expect(newItemName).toContain('E2E Test Item');
    logger.debug('Realtime-sync.e2e.test', 'New item visible to User 2');

    await context1.close();
    await context2.close();

    logger.info('Realtime-sync.e2e.test', '=== TEST COMPLETE ===\n');
  });

  // ============================================
  // Offline Handling
  // ============================================
  test('should handle offline/online transitions gracefully', async ({ page }) => {
    logger.debug('Realtime-sync.e2e.test', '\n=== TEST: Offline/Online Handling ===');

    await login(page);
    await page.goto(MATERIALS_PAGE);
    await page.waitForLoadState('networkidle');

    // User goes offline
    logger.debug('Realtime-sync.e2e.test', 'Simulating offline...');
    await page.context().setOffline(true);

    // Verify offline indicator shows
    const offlineIndicator = await page.waitForSelector('[data-testid="offline-indicator"]', {
      timeout: 3000
    });
    expect(offlineIndicator).toBeDefined();
    logger.debug('Realtime-sync.e2e.test', 'Offline indicator shown');

    // User makes change while offline
    logger.debug('Realtime-sync.e2e.test', 'Making change while offline...');
    await page.click('[data-testid="material-row"]:first-child [data-testid="actions-button"]');
    await page.click('[data-testid="edit-stock-action"]');
    await page.fill('[data-testid="stock-input"]', '100');
    await page.click('[data-testid="save-stock-button"]');

    // Should show pending indicator
    const pendingIndicator = await page.waitForSelector('[data-testid="pending-sync-indicator"]', {
      timeout: 3000
    });
    expect(pendingIndicator).toBeDefined();
    logger.info('Realtime-sync.e2e.test', 'Pending sync indicator shown');

    // User goes back online
    logger.debug('Realtime-sync.e2e.test', 'Simulating back online...');
    await page.context().setOffline(false);

    // Wait for sync
    await page.waitForTimeout(5000);

    // Verify synced
    const syncSuccess = await page.waitForSelector('[data-testid="toast-success"]', {
      timeout: 10000
    });
    expect(syncSuccess).toBeDefined();
    logger.info('Realtime-sync.e2e.test', 'Changes synced successfully');

    logger.info('Realtime-sync.e2e.test', '=== TEST COMPLETE ===\n');
  });

  // ============================================
  // Concurrent Edit Conflict Resolution
  // ============================================
  test('should handle concurrent edits with last-write-wins', async ({ browser }) => {
    logger.debug('Realtime-sync.e2e.test', '\n=== TEST: Concurrent Edit Conflict Resolution ===');

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await login(page1);
    await login(page2);

    await page1.goto(MATERIALS_PAGE);
    await page2.goto(MATERIALS_PAGE);

    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Both users open edit form for same item simultaneously
    logger.debug('Realtime-sync.e2e.test', 'Both users editing same item simultaneously...');
    await Promise.all([
      page1.click('[data-testid="material-row"]:first-child [data-testid="actions-button"]'),
      page2.click('[data-testid="material-row"]:first-child [data-testid="actions-button"]')
    ]);

    await Promise.all([
      page1.click('[data-testid="edit-stock-action"]'),
      page2.click('[data-testid="edit-stock-action"]')
    ]);

    // User 1 saves first
    logger.debug('Realtime-sync.e2e.test', 'User 1 saving...');
    await page1.fill('[data-testid="stock-input"]', '111');
    await page1.click('[data-testid="save-stock-button"]');
    await page1.waitForSelector('[data-testid="toast-success"]');

    // User 2 saves second (should overwrite)
    logger.debug('Realtime-sync.e2e.test', 'User 2 saving...');
    await page2.fill('[data-testid="stock-input"]', '222');
    await page2.click('[data-testid="save-stock-button"]');
    await page2.waitForSelector('[data-testid="toast-success"]');

    // Wait for sync
    await page1.waitForTimeout(3000);

    // Both users should see User 2's value (last-write-wins)
    const finalStock1 = await page1.textContent(
      '[data-testid="material-row"]:first-child [data-testid="stock-value"]'
    );
    const finalStock2 = await page2.textContent(
      '[data-testid="material-row"]:first-child [data-testid="stock-value"]'
    );

    expect(finalStock1).toBe('222');
    expect(finalStock2).toBe('222');

    logger.debug('Realtime-sync.e2e.test', `Both users see final value: ${finalStock1}`);

    await context1.close();
    await context2.close();

    logger.info('Realtime-sync.e2e.test', '=== TEST COMPLETE ===\n');
  });
});

/**
 * To run these E2E tests:
 *
 * 1. Install Playwright: pnpm add -D @playwright/test
 * 2. Install browsers: npx playwright install
 * 3. Remove .skip from describe()
 * 4. Start dev server: pnpm dev
 * 5. Run tests: pnpm test:e2e realtime-sync
 *
 * Test Data Requirements:
 * - Materials table must have at least one item
 * - Test user credentials: test@example.com / testpassword123
 * - data-testid attributes must be added to components
 *
 * Environment Variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */
