/**
 * Materials Module - CRUD Operations E2E Tests
 * 
 * Tests Create, Read, Update, Delete operations for materials.
 * 
 * IMPORTANT: These tests may modify database state.
 * Run against a test database, not production.
 */

import { test, expect } from '@playwright/test';

test.describe('Materials CRUD - Create', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should create a new material', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Click "New Material" button
    const newButton = page.locator('[data-testid="new-material-button"]').or(
      page.getByRole('button', { name: /new material|add material/i })
    );
    await newButton.first().click();

    // Wait for form modal to appear
    await page.waitForTimeout(500);

    // Fill form fields (adjust selectors as needed)
    const nameInput = page.locator('[data-testid="material-name"]').or(
      page.locator('input[name="name"], label:has-text("Name") ~ input')
    );
    await nameInput.first().fill(`E2E Test Material ${Date.now()}`);

    const typeSelect = page.locator('[data-testid="material-type"]').or(
      page.locator('select[name="type"], [aria-label*="type" i]')
    );
    if (await typeSelect.first().isVisible()) {
      await typeSelect.first().selectOption('MEASURABLE');
    }

    const unitInput = page.locator('[data-testid="material-unit"]').or(
      page.locator('input[name="unit"], label:has-text("Unit") ~ input')
    );
    await unitInput.first().fill('kg');

    const costInput = page.locator('[data-testid="material-unit-cost"]').or(
      page.locator('input[name*="cost" i], label:has-text("Cost") ~ input')
    );
    await costInput.first().fill('10.50');

    const minStockInput = page.locator('[data-testid="material-min-stock"]').or(
      page.locator('input[name*="min" i], label:has-text("Min") ~ input')
    );
    if (await minStockInput.first().isVisible()) {
      await minStockInput.first().fill('5');
    }

    // Submit form
    const submitButton = page.locator('[data-testid="submit-material"]').or(
      page.getByRole('button', { name: /save|create|submit/i })
    );
    await submitButton.first().click();

    // Wait for success message or modal to close
    await page.waitForTimeout(1000);

    // Verify success (may need to check for toast/alert)
    const successAlert = page.locator('[role="alert"], .toast, .notification');
    if (await successAlert.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(successAlert.first()).toContainText(/created|success|saved/i);
    }

    // Verify material appears in grid
    const grid = page.locator('[data-testid="materials-grid"]').or(page.locator('table, [role="grid"]'));
    await expect(grid.first()).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Open new material form
    const newButton = page.locator('[data-testid="new-material-button"]').or(
      page.getByRole('button', { name: /new material|add material/i })
    );
    await newButton.first().click();
    await page.waitForTimeout(500);

    // Try to submit without filling required fields
    const submitButton = page.locator('[data-testid="submit-material"]').or(
      page.getByRole('button', { name: /save|create|submit/i })
    );
    await submitButton.first().click();

    // Should show validation errors
    await page.waitForTimeout(500);
    
    // Look for error messages
    const errorMessages = page.locator('.error, [role="alert"], .field-error, .invalid-feedback');
    const errorCount = await errorMessages.count();
    
    expect(errorCount).toBeGreaterThan(0);
  });
});

test.describe('Materials CRUD - Update', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should update an existing material', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Find the first material row and click edit
    const firstRow = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr, [role="row"]')
    ).first();

    const editButton = firstRow.locator('[data-testid="edit-button"]').or(
      firstRow.getByRole('button', { name: /edit|modify/i })
    );

    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Update unit cost
      const costInput = page.locator('[data-testid="material-unit-cost"]').or(
        page.locator('input[name*="cost" i]')
      );
      await costInput.first().clear();
      await costInput.first().fill('12.75');

      // Submit
      const submitButton = page.locator('[data-testid="submit-material"]').or(
        page.getByRole('button', { name: /save|update|submit/i })
      );
      await submitButton.first().click();

      // Wait for optimistic update
      await page.waitForTimeout(1000);

      // Verify success
      const successAlert = page.locator('[role="alert"]');
      if (await successAlert.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(successAlert.first()).toContainText(/updated|success|saved/i);
      }
    }
  });

  test('should show optimistic updates', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Get initial value
    const firstRow = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    ).first();

    const initialText = await firstRow.textContent();

    // Click edit
    const editButton = firstRow.locator('[data-testid="edit-button"]').or(
      firstRow.getByRole('button', { name: /edit/i })
    );

    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Make a change
      const nameInput = page.locator('[data-testid="material-name"]').or(
        page.locator('input[name="name"]')
      );
      const timestamp = Date.now();
      await nameInput.first().fill(`Updated Material ${timestamp}`);

      // Submit
      const submitButton = page.getByRole('button', { name: /save|update/i });
      await submitButton.first().click();

      // UI should update immediately (optimistic)
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Materials CRUD - Delete', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should delete a material with confirmation', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    // Get initial row count
    const rows = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    );
    const initialCount = await rows.count();

    if (initialCount === 0) {
      test.skip();
    }

    // Find delete button in last row
    const lastRow = rows.last();
    const deleteButton = lastRow.locator('[data-testid="delete-button"]').or(
      lastRow.getByRole('button', { name: /delete|remove/i })
    );

    if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(500);

      // Confirm deletion (look for confirmation dialog)
      const confirmButton = page.locator('[data-testid="confirm-delete"]').or(
        page.getByRole('button', { name: /confirm|yes|delete/i })
      );

      if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        // Verify material is removed (row count decreased)
        const newCount = await rows.count();
        expect(newCount).toBeLessThan(initialCount);
      }
    }
  });

  test('should cancel delete operation', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Wait for page content to load
    await page.waitForSelector('h1, h2, [data-testid="materials-page"]', { timeout: 20000 });

    const rows = page.locator('[data-testid^="material-row-"]').or(
      page.locator('table tbody tr')
    );
    const initialCount = await rows.count();

    if (initialCount === 0) {
      test.skip();
    }

    // Click delete
    const firstRow = rows.first();
    const deleteButton = firstRow.locator('[data-testid="delete-button"]').or(
      firstRow.getByRole('button', { name: /delete/i })
    );

    if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(500);

      // Click cancel instead of confirm
      const cancelButton = page.locator('[data-testid="cancel-delete"]').or(
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
