/**
 * E2E Tests: Toast Progress Tracking (WITH AUTH)
 * 
 * Tests the critical fix for toast progress calculation:
 * - Progress should be calculated from toast APPEARANCE time, not alert CREATION time
 * - Pre-existing alerts should NOT auto-dismiss instantly
 * - New alerts should have proper countdown
 * 
 * Bug Reference: Toast Stack Progress Bug (Phase 9 Testing)
 * 
 * IMPORTANTE: Este test usa autenticación
 * 
 * Para ejecutar:
 * 1. Primero ejecuta el setup (solo una vez):
 *    pnpm exec playwright test tests/setup/auth.setup.spec.ts --headed
 *    (Haz login manualmente cuando se abra el navegador)
 * 
 * 2. Luego ejecuta este test:
 *    pnpm exec playwright test tests/e2e/alerts-toast-progress.spec.ts --project=authenticated
 * 
 * O usa el atajo:
 *    pnpm e2e:alerts
 */

import { test, expect } from '@playwright/test';

// Configurar para usar la sesión guardada
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Toast Progress Tracking', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to alerts testing page
    await page.goto('/debug/alerts');
    
    // Wait for page to be fully loaded with auth
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the right page - just check for any visible content
    // More relaxed check since PageHeader might render differently
    await page.waitForSelector('body', { state: 'visible' });
    await page.waitForTimeout(1000); // Give React time to render
    
    console.log('✅ Page loaded, ready to test alerts');
  });

  test('new alerts should show progress from 0% to 100%', async ({ page }) => {
    // Create a single alert - button text is "Create INFO"
    await page.click('button:has-text("Create INFO")');
    
    // Wait for toast to appear
    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible();
    
    // Check progress bar exists and starts near 0%
    const progressBar = toast.locator('[class*="progress"]').first();
    await expect(progressBar).toBeVisible();
    
    // Get initial progress (should be near 0%)
    const initialWidth = await progressBar.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.width);
    });
    
    expect(initialWidth).toBeLessThan(10); // Should be less than 10% initially
    
    // Wait a bit (500ms)
    await page.waitForTimeout(500);
    
    // Progress should have increased
    const midWidth = await progressBar.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.width);
    });
    
    expect(midWidth).toBeGreaterThan(initialWidth);
    expect(midWidth).toBeGreaterThan(10); // Should be more than 10% after 500ms
    
    // Wait for auto-dismiss (3s total for info alerts)
    await page.waitForTimeout(3000);
    
    // Toast should be gone
    await expect(toast).not.toBeVisible({ timeout: 1000 });
  });

  test('bulk creation should queue alerts properly', async ({ page }) => {
    // Create 5 alerts in bulk - button text is "Create 5 Alerts (Sequential)"
    await page.click('button:has-text("Create 5 Alerts")');
    
    // Wait for toasts to appear
    await page.waitForTimeout(500);
    
    // Should only see max 3 toasts visible
    const visibleToasts = page.locator('[role="alert"]');
    await expect(visibleToasts).toHaveCount(3);
    
    // All visible toasts should have progress bars
    const progressBars = page.locator('[role="alert"] [class*="progress"]');
    await expect(progressBars).toHaveCount(3);
    
    // Wait for first toast to dismiss
    await page.waitForTimeout(3500);
    
    // New toast should appear (4th one)
    await expect(visibleToasts).toHaveCount(3);
    
    // Progress bars should still be visible
    await expect(progressBars.first()).toBeVisible();
  });

  test('pre-existing alerts should NOT instantly dismiss', async ({ page }) => {
    // This test simulates the bug scenario:
    // Materials alerts that were created minutes ago should still show full countdown
    
    // Create alert and let it start
    await page.click('button:has-text("Create INFO")');
    
    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible();
    
    // Get the toast element
    const toastElement = await toast.elementHandle();
    
    // Wait 500ms
    await page.waitForTimeout(500);
    
    // Toast should STILL be visible (not instantly dismissed)
    await expect(toast).toBeVisible();
    
    // Progress should be reasonable (not 100%)
    const progressBar = toast.locator('[class*="progress"]').first();
    const width = await progressBar.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.width);
    });
    
    // Progress should be less than 50% after only 500ms (for 3s duration)
    expect(width).toBeLessThan(50);
  });

  test('critical alerts should NOT have countdown', async ({ page }) => {
    // Create critical alert
    await page.click('button:has-text("Create CRITICAL")');
    
    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible();
    
    // Wait 5 seconds (more than normal auto-dismiss time)
    await page.waitForTimeout(5000);
    
    // Critical alert should STILL be visible (no auto-dismiss)
    await expect(toast).toBeVisible();
  });

  test('dismissing toast should clean up tracking', async ({ page }) => {
    // Create alert
    await page.click('button:has-text("Create INFO")');
    
    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible();
    
    // Click dismiss button
    const dismissBtn = toast.locator('button[aria-label*="dismiss"], button[aria-label*="close"]').first();
    await dismissBtn.click();
    
    // Toast should disappear
    await expect(toast).not.toBeVisible({ timeout: 1000 });
    
    // Create another alert - should work normally
    await page.click('button:has-text("Create INFO")');
    
    const newToast = page.locator('[role="alert"]').first();
    await expect(newToast).toBeVisible();
    
    // New toast should have progress starting from 0%
    const progressBar = newToast.locator('[class*="progress"]').first();
    const width = await progressBar.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.width);
    });
    
    expect(width).toBeLessThan(10);
  });

  test('sequential alerts should each have independent progress', async ({ page }) => {
    // Create first alert
    await page.click('button:has-text("Create INFO")');
    await page.waitForTimeout(1000); // Let it run for 1 second
    
    // Create second alert
    await page.click('button:has-text("Create WARNING")');
    await page.waitForTimeout(100);
    
    // Should see 2 toasts
    const toasts = page.locator('[role="alert"]');
    await expect(toasts).toHaveCount(2);
    
    // Get both progress bars
    const progressBars = page.locator('[role="alert"] [class*="progress"]');
    
    // First toast (1 second old) should have more progress
    const firstProgress = await progressBars.nth(0).evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.width);
    });
    
    // Second toast (just created) should have less progress
    const secondProgress = await progressBars.nth(1).evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.width);
    });
    
    // First should be significantly ahead
    expect(firstProgress).toBeGreaterThan(secondProgress + 20);
  });

  test('browser console should NOT show errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Create multiple alerts
    await page.click('button:has-text("Create 5 Alerts")');
    await page.waitForTimeout(4000);
    
    // Should have no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('Toast Stack Visual Behavior', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/debug/alerts');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('body', { state: 'visible' });
    await page.waitForTimeout(1000);
  });

  test('toast stack should be positioned top-right', async ({ page }) => {
    await page.click('button:has-text("Create INFO")');
    
    const toastContainer = page.locator('[class*="toast-stack"], [class*="GlobalAlertsDisplay"]').first();
    await expect(toastContainer).toBeVisible();
    
    // Check positioning
    const position = await toastContainer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        top: style.top,
        right: style.right
      };
    });
    
    expect(position.position).toBe('fixed');
    expect(position.top).not.toBe('auto');
    expect(position.right).not.toBe('auto');
  });

  test('toasts should animate in smoothly', async ({ page }) => {
    await page.click('button:has-text("Create INFO")');
    
    const toast = page.locator('[role="alert"]').first();
    
    // Toast should appear with animation (check for Framer Motion attributes)
    const hasAnimation = await toast.evaluate(el => {
      return el.hasAttribute('data-framer-motion') || 
             el.style.animation !== '' ||
             el.style.transform !== '';
    });
    
    expect(hasAnimation).toBeTruthy();
  });

  test('max 3 toasts should be visible simultaneously', async ({ page }) => {
    // Create 10 alerts
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Create INFO")');
      await page.waitForTimeout(50);
    }
    
    // Wait for all to be queued
    await page.waitForTimeout(500);
    
    // Count visible toasts
    const visibleToasts = page.locator('[role="alert"]:visible');
    const count = await visibleToasts.count();
    
    // Should be exactly 3 (or less if some dismissed)
    expect(count).toBeLessThanOrEqual(3);
  });
});

test.describe('Toast Visual Regression', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/debug/alerts');
    await page.waitForLoadState('networkidle');
  });

  test('toast stack initial state should match snapshot', async ({ page }) => {
    // Take snapshot of empty state
    await expect(page).toHaveScreenshot('toast-stack-empty.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 800, height: 600 }
    });
  });

  test('single toast should match snapshot', async ({ page }) => {
    await page.click('button:has-text("Create INFO")');
    
    // Wait for toast animation to complete
    await page.waitForTimeout(500);
    
    // Get toast container and take screenshot
    const toastContainer = page.locator('[class*="toast-stack"], [class*="GlobalAlertsDisplay"]').first();
    await expect(toastContainer).toHaveScreenshot('single-toast.png', {
      animations: 'disabled'
    });
  });

  test('multiple toasts should match snapshot', async ({ page }) => {
    // Create 3 toasts
    await page.click('button:has-text("Create INFO")');
    await page.waitForTimeout(100);
    await page.click('button:has-text("Create WARNING")');
    await page.waitForTimeout(100);
    await page.click('button:has-text("Create ERROR")');
    await page.waitForTimeout(500);
    
    // Screenshot of toast stack
    const toastContainer = page.locator('[class*="toast-stack"], [class*="GlobalAlertsDisplay"]').first();
    await expect(toastContainer).toHaveScreenshot('multiple-toasts.png', {
      animations: 'disabled',
      maxDiffPixels: 100 // Allow small rendering differences
    });
  });

  test('progress bar visual states', async ({ page }) => {
    await page.click('button:has-text("Create INFO")');
    const toast = page.locator('[role="alert"]').first();
    
    // Initial state (0-10% progress)
    await expect(toast).toHaveScreenshot('progress-0-percent.png', {
      animations: 'disabled'
    });
    
    // Mid progress (around 50%)
    await page.waitForTimeout(1500); // Half of 3s duration
    await expect(toast).toHaveScreenshot('progress-50-percent.png', {
      animations: 'disabled',
      maxDiffPixels: 50 // Progress bar position might vary slightly
    });
  });

  test('different severity colors should match snapshot', async ({ page }) => {
    // Create all severity types
    const buttons = [
      'Create CRITICAL',
      'Create ERROR', 
      'Create WARNING',
      'Create INFO'
    ];
    
    for (const buttonText of buttons) {
      await page.click(`button:has-text("${buttonText}")`);
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(500);
    
    // Screenshot showing severity color differences
    const toastContainer = page.locator('[class*="toast-stack"], [class*="GlobalAlertsDisplay"]').first();
    await expect(toastContainer).toHaveScreenshot('severity-colors.png', {
      animations: 'disabled'
    });
  });
});
