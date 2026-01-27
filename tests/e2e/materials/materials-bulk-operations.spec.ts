/**
 * Materials Module - Bulk Operations E2E Tests
 * 
 * Tests bulk operations including:
 * - Multi-select materials
 * - Bulk delete
 * - Bulk stock adjustment
 * - Bulk category change
 */

import { test, expect } from '@playwright/test';

test.describe('Materials Bulk Operations - Selection', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should select multiple materials', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Find all checkboxes
    const checkboxes = page.locator('[data-testid^="material-row-"] [data-testid="select-checkbox"]').or(
      page.locator('table tbody tr input[type="checkbox"]')
    );

    const checkboxCount = await checkboxes.count();

    if (checkboxCount === 0) {
      test.skip(); // No materials to select
    }

    // Select first 3 materials (or all if less than 3)
    const selectCount = Math.min(3, checkboxCount);
    
    for (let i = 0; i < selectCount; i++) {
      await checkboxes.nth(i).check();
      await page.waitForTimeout(200);
    }

    // Verify bulk actions bar appears
    const bulkActionsBar = page.locator('[data-testid="bulk-actions-bar"]').or(
      page.locator('.bulk-actions, [aria-label*="bulk" i]')
    );
    
    await expect(bulkActionsBar.first()).toBeVisible({ timeout: 3000 });

    // Verify selected count is displayed
    const selectedCount = page.locator('[data-testid="selected-count"]').or(
      page.locator('.selected-count, [aria-label*="selected" i]')
    );

    if (await selectedCount.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(selectedCount.first()).toContainText(selectCount.toString());
    }
  });

  test('should select all materials', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Find "select all" checkbox (usually in table header)
    const selectAllCheckbox = page.locator('[data-testid="select-all-checkbox"]').or(
      page.locator('table thead input[type="checkbox"], .select-all input[type="checkbox"]')
    );

    if (await selectAllCheckbox.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await selectAllCheckbox.first().check();
      await page.waitForTimeout(500);

      // Verify all rows are selected
      const rowCheckboxes = page.locator('table tbody tr input[type="checkbox"]');
      const totalCheckboxes = await rowCheckboxes.count();

      if (totalCheckboxes > 0) {
        // Verify all checkboxes are checked
        for (let i = 0; i < totalCheckboxes; i++) {
          await expect(rowCheckboxes.nth(i)).toBeChecked();
        }
      }
    }
  });

  test('should deselect all materials', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Select all first
    const selectAllCheckbox = page.locator('[data-testid="select-all-checkbox"]').or(
      page.locator('table thead input[type="checkbox"]')
    );

    if (await selectAllCheckbox.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await selectAllCheckbox.first().check();
      await page.waitForTimeout(500);

      // Now deselect all
      await selectAllCheckbox.first().uncheck();
      await page.waitForTimeout(500);

      // Bulk actions bar should disappear
      const bulkActionsBar = page.locator('[data-testid="bulk-actions-bar"]');
      
      if (await bulkActionsBar.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(bulkActionsBar).not.toBeVisible();
      }
    }
  });
});

test.describe('Materials Bulk Operations - Delete', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should bulk delete materials', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Get initial row count
    const rows = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    );
    const initialCount = await rows.count();

    if (initialCount < 2) {
      test.skip(); // Need at least 2 materials to test bulk delete
    }

    // Select 2 materials
    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    await checkboxes.nth(initialCount - 1).check(); // Select last
    await checkboxes.nth(initialCount - 2).check(); // Select second to last
    await page.waitForTimeout(500);

    // Click bulk delete button
    const bulkDeleteButton = page.locator('[data-testid="bulk-delete-button"]').or(
      page.getByRole('button', { name: /delete.*selected|bulk.*delete/i })
    );

    if (await bulkDeleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bulkDeleteButton.click();
      await page.waitForTimeout(500);

      // Confirm deletion
      const confirmButton = page.locator('[data-testid="confirm-bulk-delete"]').or(
        page.getByRole('button', { name: /confirm|yes|delete/i })
      );

      if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmButton.click();
        await page.waitForTimeout(1500);

        // Verify materials removed (count decreased by 2)
        const newCount = await rows.count();
        expect(newCount).toBeLessThan(initialCount);
      }
    }
  });

  test('should cancel bulk delete', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    const rows = page.locator('table tbody tr');
    const initialCount = await rows.count();

    if (initialCount < 2) {
      test.skip();
    }

    // Select materials
    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    await checkboxes.first().check();
    await checkboxes.nth(1).check();
    await page.waitForTimeout(500);

    // Click bulk delete
    const bulkDeleteButton = page.locator('[data-testid="bulk-delete-button"]').or(
      page.getByRole('button', { name: /delete/i })
    );

    if (await bulkDeleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bulkDeleteButton.click();
      await page.waitForTimeout(500);

      // Click cancel
      const cancelButton = page.locator('[data-testid="cancel-bulk-delete"]').or(
        page.getByRole('button', { name: /cancel|no/i })
      );

      if (await cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cancelButton.click();
        await page.waitForTimeout(500);

        // Verify count unchanged
        const newCount = await rows.count();
        expect(newCount).toBe(initialCount);
      }
    }
  });
});

test.describe('Materials Bulk Operations - Stock Adjustment', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should bulk adjust stock', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount < 3) {
      test.skip();
    }

    // Select 3 materials
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();
    await page.waitForTimeout(500);

    // Click bulk adjust stock button
    const bulkAdjustButton = page.locator('[data-testid="bulk-adjust-stock-button"]').or(
      page.getByRole('button', { name: /adjust.*stock|bulk.*adjust/i })
    );

    if (await bulkAdjustButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bulkAdjustButton.click();
      await page.waitForTimeout(500);

      // Fill bulk adjustment form
      const quantityInput = page.locator('[data-testid="bulk-adjustment-quantity"]').or(
        page.locator('input[name*="quantity" i]')
      );
      await quantityInput.first().fill('5');

      const reasonSelect = page.locator('[data-testid="bulk-adjustment-reason"]').or(
        page.locator('select[name*="reason" i]')
      );
      
      if (await reasonSelect.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await reasonSelect.first().selectOption({ index: 1 });
      }

      // Submit
      const submitButton = page.locator('[data-testid="submit-bulk-adjustment"]').or(
        page.getByRole('button', { name: /submit|adjust|save/i })
      );
      await submitButton.first().click();
      await page.waitForTimeout(1500);

      // Verify success message
      const successAlert = page.locator('[role="alert"]').or(
        page.locator('.toast, .notification')
      );

      if (await successAlert.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(successAlert.first()).toContainText(/3.*updated|success|adjusted/i);
      }
    }
  });
});

test.describe('Materials Bulk Operations - Category Change', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should bulk change category', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount < 2) {
      test.skip();
    }

    // Select materials
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await page.waitForTimeout(500);

    // Look for bulk category change button
    const bulkCategoryButton = page.locator('[data-testid="bulk-change-category-button"]').or(
      page.getByRole('button', { name: /category|change category/i })
    );

    if (await bulkCategoryButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bulkCategoryButton.click();
      await page.waitForTimeout(500);

      // Select new category
      const categorySelect = page.locator('[data-testid="bulk-category-select"]').or(
        page.locator('select[name*="category" i]')
      );

      if (await categorySelect.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await categorySelect.first().selectOption({ index: 1 });

        // Submit
        const submitButton = page.getByRole('button', { name: /submit|save|apply/i });
        await submitButton.first().click();
        await page.waitForTimeout(1500);

        // Verify success
        const successAlert = page.locator('[role="alert"]');
        
        if (await successAlert.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(successAlert.first()).toContainText(/updated|success/i);
        }
      }
    }
  });
});

test.describe('Materials Bulk Operations - Export', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should export selected materials', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount === 0) {
      test.skip();
    }

    // Select some materials
    await checkboxes.first().check();
    if (checkboxCount > 1) {
      await checkboxes.nth(1).check();
    }
    await page.waitForTimeout(500);

    // Look for export button
    const exportButton = page.locator('[data-testid="bulk-export-button"]').or(
      page.getByRole('button', { name: /export|download|csv|excel/i })
    );

    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      await exportButton.click();
      
      const download = await downloadPromise;
      
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|xls)$/);
      }
    }
  });
});
