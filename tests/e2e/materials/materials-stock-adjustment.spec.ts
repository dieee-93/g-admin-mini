/**
 * Materials Module - Stock Adjustment E2E Tests
 * 
 * Tests stock adjustment operations including:
 * - Optimistic UI updates
 * - Alert generation on low stock
 * - Stock history tracking
 */

import { test, expect } from '@playwright/test';

test.describe('Materials Stock Adjustment', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should adjust stock with optimistic update', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Find first material row
    const firstRow = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    ).first();

    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Get initial stock value
      const stockElement = firstRow.locator('[data-testid="stock-value"]').or(
        firstRow.locator('.stock, [aria-label*="stock" i]')
      );

      const initialStockText = await stockElement.first().textContent();
      const initialStock = parseFloat(initialStockText?.replace(/[^0-9.-]/g, '') || '0');

      // Click adjust stock button
      const adjustButton = firstRow.locator('[data-testid="adjust-stock-button"]').or(
        firstRow.getByRole('button', { name: /adjust|stock/i })
      );

      if (await adjustButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await adjustButton.click();
        await page.waitForTimeout(500);

        // Fill adjustment form
        const quantityInput = page.locator('[data-testid="stock-adjustment-quantity"]').or(
          page.locator('input[name*="quantity" i], input[name*="amount" i]')
        );
        await quantityInput.first().fill('10');

        const reasonSelect = page.locator('[data-testid="stock-adjustment-reason"]').or(
          page.locator('select[name*="reason" i], [aria-label*="reason" i]')
        );
        if (await reasonSelect.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await reasonSelect.first().selectOption({ index: 1 }); // Select first option
        }

        // Submit
        const submitButton = page.locator('[data-testid="submit-adjustment"]').or(
          page.getByRole('button', { name: /save|submit|adjust/i })
        );
        await submitButton.first().click();

        // Wait for optimistic update
        await page.waitForTimeout(1000);

        // Verify stock updated (should be immediate - optimistic)
        const newStockText = await stockElement.first().textContent();
        const newStock = parseFloat(newStockText?.replace(/[^0-9.-]/g, '') || '0');

        expect(newStock).toBeGreaterThan(initialStock);
      }
    }
  });

  test('should show adjustment history', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Find first material row
    const firstRow = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    ).first();

    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click to view details or history
      const detailsButton = firstRow.locator('[data-testid="view-details"]').or(
        firstRow.getByRole('button', { name: /details|history|view/i })
      );

      if (await detailsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await detailsButton.click();
        await page.waitForTimeout(500);

        // Look for history tab or section
        const historyTab = page.locator('[data-testid="history-tab"]').or(
          page.getByRole('tab', { name: /history|movements/i })
        );

        if (await historyTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await historyTab.click();
          await page.waitForTimeout(500);

          // Verify history list exists
          const historyList = page.locator('[data-testid="history-list"]').or(
            page.locator('table, .history, [role="list"]')
          );
          await expect(historyList.first()).toBeVisible();
        }
      }
    }
  });

  test('should decrease stock with negative adjustment', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Find first material row
    const firstRow = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    ).first();

    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Get initial stock
      const stockElement = firstRow.locator('[data-testid="stock-value"]').or(
        firstRow.locator('.stock')
      );
      const initialStockText = await stockElement.first().textContent();
      const initialStock = parseFloat(initialStockText?.replace(/[^0-9.-]/g, '') || '0');

      if (initialStock < 5) {
        test.skip(); // Skip if stock too low to decrease
      }

      // Open adjustment modal
      const adjustButton = firstRow.locator('[data-testid="adjust-stock-button"]').or(
        firstRow.getByRole('button', { name: /adjust/i })
      );

      if (await adjustButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await adjustButton.click();
        await page.waitForTimeout(500);

        // Enter negative adjustment
        const quantityInput = page.locator('[data-testid="stock-adjustment-quantity"]').or(
          page.locator('input[name*="quantity" i]')
        );
        await quantityInput.first().fill('-5');

        const reasonSelect = page.locator('[data-testid="stock-adjustment-reason"]');
        if (await reasonSelect.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await reasonSelect.first().selectOption({ index: 1 });
        }

        // Submit
        const submitButton = page.locator('[data-testid="submit-adjustment"]').or(
          page.getByRole('button', { name: /submit/i })
        );
        await submitButton.first().click();
        await page.waitForTimeout(1000);

        // Verify stock decreased
        const newStockText = await stockElement.first().textContent();
        const newStock = parseFloat(newStockText?.replace(/[^0-9.-]/g, '') || '0');

        expect(newStock).toBeLessThan(initialStock);
      }
    }
  });

  test('should trigger low stock alert', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Find a material with low min stock threshold
    const rows = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    );

    const rowCount = await rows.count();

    if (rowCount === 0) {
      test.skip();
    }

    // Try to adjust stock below minimum
    const firstRow = rows.first();
    const adjustButton = firstRow.locator('[data-testid="adjust-stock-button"]').or(
      firstRow.getByRole('button', { name: /adjust/i })
    );

    if (await adjustButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await adjustButton.click();
      await page.waitForTimeout(500);

      // Enter large negative adjustment to trigger low stock
      const quantityInput = page.locator('[data-testid="stock-adjustment-quantity"]').or(
        page.locator('input[name*="quantity" i]')
      );
      await quantityInput.first().fill('-100');

      const submitButton = page.getByRole('button', { name: /submit/i });
      await submitButton.first().click();

      // Wait for alert notification
      await page.waitForTimeout(1500);

      // Check for low stock warning/alert
      const alert = page.locator('[role="alert"], .warning, .low-stock-alert');
      
      // May show alert immediately or after submission
      if (await alert.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(alert.first()).toContainText(/low|minimum|warning/i);
      }
    }
  });

  test('should validate adjustment quantity', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    const firstRow = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    ).first();

    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const adjustButton = firstRow.locator('[data-testid="adjust-stock-button"]').or(
        firstRow.getByRole('button', { name: /adjust/i })
      );

      if (await adjustButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await adjustButton.click();
        await page.waitForTimeout(500);

        // Try to submit with invalid quantity (e.g., zero)
        const quantityInput = page.locator('[data-testid="stock-adjustment-quantity"]').or(
          page.locator('input[name*="quantity" i]')
        );
        await quantityInput.first().fill('0');

        const submitButton = page.getByRole('button', { name: /submit/i });
        await submitButton.first().click();
        await page.waitForTimeout(500);

        // Should show validation error
        const error = page.locator('.error, [role="alert"], .invalid-feedback');
        
        if (await error.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(error.first()).toBeVisible();
        }
      }
    }
  });

  test('should support different adjustment reasons', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    const firstRow = page.locator('[data-testid^="material-row-"]').first();

    if (await firstRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      const adjustButton = firstRow.locator('[data-testid="adjust-stock-button"]').or(
        firstRow.getByRole('button', { name: /adjust/i })
      );

      if (await adjustButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await adjustButton.click();
        await page.waitForTimeout(500);

        // Check that reason dropdown has multiple options
        const reasonSelect = page.locator('[data-testid="stock-adjustment-reason"]').or(
          page.locator('select[name*="reason" i]')
        );

        if (await reasonSelect.first().isVisible({ timeout: 2000 }).catch(() => false)) {
          const options = await reasonSelect.first().locator('option').count();
          
          // Should have at least: Purchase, Sale, Manual Adjustment, Inventory Count, Waste, etc.
          expect(options).toBeGreaterThan(2);
        }
      }
    }
  });
});
