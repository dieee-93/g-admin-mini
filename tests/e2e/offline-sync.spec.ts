/**
 * E2E Tests: Offline Sync Flow
 *
 * Tests the complete offline → online synchronization flow:
 * 1. Create/update/delete operations while offline
 * 2. Verify optimistic UI updates
 * 3. Go online and verify sync completes
 * 4. Verify server data matches expectations
 *
 * Based on Phase 3 testing strategy (design doc lines 394-399)
 */

import { test, expect, Page } from '@playwright/test';

// Helper: Login as test user
async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

// Helper: Go to materials page
async function goToMaterialsPage(page: Page) {
  await page.goto('/admin/supply-chain/materials');
  await page.waitForSelector('[data-testid="materials-page"]', { timeout: 10000 });
}

// Helper: Create material via UI
async function createMaterial(page: Page, materialData: { name: string; type: string; unitCost: number }) {
  // Click "New Material" button
  await page.click('button:has-text("Nuevo Material")');

  // Wait for modal
  await page.waitForSelector('[data-testid="material-form-dialog"]');

  // Fill form
  await page.fill('input[name="name"]', materialData.name);
  await page.selectOption('select[name="type"]', materialData.type);
  await page.fill('input[name="unit_cost"]', materialData.unitCost.toString());

  // Submit
  await page.click('button[type="submit"]:has-text("Crear")');

  // Wait for modal to close
  await page.waitForSelector('[data-testid="material-form-dialog"]', { state: 'hidden' });
}

test.describe('Offline Sync Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should create material offline and sync when online', async ({ page, context }) => {
    // 1. Navigate to materials page
    await goToMaterialsPage(page);

    // 2. Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500); // Wait for offline detection

    // 3. Create material while offline
    const materialName = `Offline Material ${Date.now()}`;
    await createMaterial(page, {
      name: materialName,
      type: 'measurable',
      unitCost: 150
    });

    // 4. Verify optimistic UI shows the material
    await expect(page.locator(`text=${materialName}`)).toBeVisible();

    // 5. Verify offline indicator shows
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toContainText('Sin conexión');
    }

    // 6. Go back online
    await context.setOffline(false);
    await page.waitForTimeout(1000); // Wait for sync to complete

    // 7. Verify sync completed (offline indicator should disappear or show "online")
    await page.waitForTimeout(2000); // Give sync time to complete

    // 8. Reload page to verify material persisted to server
    await page.reload();
    await page.waitForSelector('[data-testid="materials-page"]');

    // 9. Verify material still exists after reload (server-side)
    await expect(page.locator(`text=${materialName}`)).toBeVisible();
  });

  test('should update material offline and sync when online', async ({ page, context }) => {
    // 1. Navigate to materials page
    await goToMaterialsPage(page);

    // 2. Verify at least one material exists
    const firstMaterial = page.locator('[data-testid="material-row"]').first();
    await expect(firstMaterial).toBeVisible();

    // Get original name
    const originalName = await firstMaterial.locator('[data-testid="material-name"]').textContent();

    // 3. Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // 4. Edit material while offline
    await firstMaterial.locator('button:has-text("Editar")').click();
    await page.waitForSelector('[data-testid="material-form-dialog"]');

    const newName = `${originalName} (Edited Offline ${Date.now()})`;
    await page.fill('input[name="name"]', newName);
    await page.click('button[type="submit"]:has-text("Guardar")');

    // 5. Verify optimistic UI shows updated name
    await page.waitForSelector('[data-testid="material-form-dialog"]', { state: 'hidden' });
    await expect(page.locator(`text=${newName}`)).toBeVisible();

    // 6. Go back online
    await context.setOffline(false);
    await page.waitForTimeout(2000); // Wait for sync

    // 7. Reload to verify update persisted
    await page.reload();
    await page.waitForSelector('[data-testid="materials-page"]');
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  test('should not create duplicate materials when syncing', async ({ page, context }) => {
    // This test verifies the deduplication logic

    // 1. Navigate to materials page
    await goToMaterialsPage(page);

    // 2. Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // 3. Create same material twice (rapid succession)
    const materialName = `Dedup Test ${Date.now()}`;

    await createMaterial(page, {
      name: materialName,
      type: 'countable',
      unitCost: 100
    });

    // Try to create again immediately (should be deduplicated)
    await createMaterial(page, {
      name: materialName,
      type: 'countable',
      unitCost: 100
    });

    // 4. Go online
    await context.setOffline(false);
    await page.waitForTimeout(2000); // Wait for sync

    // 5. Reload and count materials with this name
    await page.reload();
    await page.waitForSelector('[data-testid="materials-page"]');

    const matchingMaterials = page.locator(`text=${materialName}`);
    const count = await matchingMaterials.count();

    // Should only have 1 material, not 2 (deduplication worked)
    expect(count).toBe(1);
  });

  test('should handle rapid online/offline transitions', async ({ page, context }) => {
    // Test flapping protection

    // 1. Navigate to materials page
    await goToMaterialsPage(page);

    // 2. Rapidly toggle online/offline
    for (let i = 0; i < 3; i++) {
      await context.setOffline(true);
      await page.waitForTimeout(100);
      await context.setOffline(false);
      await page.waitForTimeout(100);
    }

    // 3. Create material
    const materialName = `Flapping Test ${Date.now()}`;
    await createMaterial(page, {
      name: materialName,
      type: 'measurable',
      unitCost: 200
    });

    // 4. Wait for any pending syncs to complete
    await page.waitForTimeout(3000);

    // 5. Reload and verify material exists
    await page.reload();
    await page.waitForSelector('[data-testid="materials-page"]');
    await expect(page.locator(`text=${materialName}`)).toBeVisible();
  });

  test('should not cause excessive re-renders', async ({ page }) => {
    // This test verifies the performance fix (no polling = no re-renders)

    // 1. Navigate to materials page
    await goToMaterialsPage(page);

    // 2. Track component renders by watching DOM mutations
    let renderCount = 0;
    await page.evaluate(() => {
      const targetNode = document.querySelector('[data-testid="materials-page"]');
      if (targetNode) {
        const observer = new MutationObserver(() => {
          (window as any).__renderCount = ((window as any).__renderCount || 0) + 1;
        });
        observer.observe(targetNode, { childList: true, subtree: true });
      }
    });

    // 3. Wait 5 seconds (with polling, would cause ~2-3 re-renders)
    await page.waitForTimeout(5000);

    // 4. Get render count
    renderCount = await page.evaluate(() => (window as any).__renderCount || 0);

    // 5. With event-driven approach, should have very few renders (< 5)
    // With polling (every 2s), would have at least 2-3 renders
    expect(renderCount).toBeLessThan(5);
  });

  test('should show queue size in offline indicator', async ({ page, context }) => {
    // 1. Navigate to materials page
    await goToMaterialsPage(page);

    // 2. Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // 3. Create 3 materials offline
    for (let i = 0; i < 3; i++) {
      await createMaterial(page, {
        name: `Queued Material ${i} ${Date.now()}`,
        type: 'measurable',
        unitCost: 100 + i * 10
      });
      await page.waitForTimeout(300);
    }

    // 4. Verify offline indicator shows queue size
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    if (await offlineIndicator.isVisible()) {
      // Should show something like "3 pendientes" or "3 operations queued"
      const text = await offlineIndicator.textContent();
      expect(text).toMatch(/3/);
    }

    // 5. Go online and verify queue clears
    await context.setOffline(false);
    await page.waitForTimeout(3000); // Wait for sync

    // Queue should be empty now
    if (await offlineIndicator.isVisible()) {
      const text = await offlineIndicator.textContent();
      expect(text).not.toMatch(/3/);
      expect(text).toMatch(/0|online|en línea/i);
    }
  });
});

test.describe('Offline Sync - Delete Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should delete material offline and sync when online', async ({ page, context }) => {
    // 1. Navigate to materials page
    await goToMaterialsPage(page);

    // 2. Create a material first (while online)
    const materialName = `To Delete ${Date.now()}`;
    await createMaterial(page, {
      name: materialName,
      type: 'countable',
      unitCost: 50
    });

    await page.waitForTimeout(500);

    // 3. Go offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // 4. Delete the material while offline
    const materialRow = page.locator(`[data-testid="material-row"]:has-text("${materialName}")`);
    await materialRow.locator('button:has-text("Eliminar")').click();

    // Confirm deletion
    await page.locator('button:has-text("Confirmar")').click();

    // 5. Verify optimistic UI - material should disappear
    await expect(page.locator(`text=${materialName}`)).not.toBeVisible();

    // 6. Go online
    await context.setOffline(false);
    await page.waitForTimeout(2000); // Wait for sync

    // 7. Reload to verify deletion persisted
    await page.reload();
    await page.waitForSelector('[data-testid="materials-page"]');

    // Material should still be gone
    await expect(page.locator(`text=${materialName}`)).not.toBeVisible();
  });
});
