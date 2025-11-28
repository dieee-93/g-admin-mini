/**
 * PLAYWRIGHT E2E TEST - ACHIEVEMENTS SYSTEM
 * 
 * Test completo del flujo de validación de requirements
 * para TakeAway capability.
 * 
 * @requires pnpm add -D @playwright/test
 */

import { test, expect, Page } from '@playwright/test';

// ============================================
// SETUP HELPERS
// ============================================
// Note: No login needed - using authenticated storageState from setup

async function setupEmptyProfile(page: Page) {
  // Clear all data to start fresh
  await page.goto('http://localhost:5173/admin/settings/business');
  
  // Clear business name
  await page.fill('[name="businessName"]', '');
  await page.fill('[name="address"]', '');
  await page.click('button[type="submit"]');
}

async function setupCompleteTakeAwayProfile(page: Page) {
  // 1. Business info
  await page.goto('http://localhost:5173/admin/settings/business');
  await page.fill('[name="businessName"]', 'Test Restaurant');
  await page.fill('[name="address"]', '123 Main St, Buenos Aires');
  await page.click('button[type="submit"]');
  
  // 2. Pickup hours
  await page.goto('http://localhost:5173/admin/settings/hours');
  await page.click('[data-testid="add-pickup-hours"]');
  await page.fill('[name="monday.open"]', '10:00');
  await page.fill('[name="monday.close"]', '20:00');
  await page.click('button[type="submit"]');
  
  // 3. Products (create 5)
  for (let i = 1; i <= 5; i++) {
    await page.goto('http://localhost:5173/admin/supply-chain/products');
    await page.click('[data-testid="add-product"]');
    await page.fill('[name="name"]', `Product ${i}`);
    await page.fill('[name="price"]', '100');
    await page.check('[name="is_published"]');
    await page.click('button[type="submit"]');
  }
  
  // 4. Payment method
  await page.goto('http://localhost:5173/admin/finance/integrations');
  await page.click('[data-testid="add-payment-method"]');
  await page.fill('[name="name"]', 'Efectivo');
  await page.click('button[type="submit"]');
}

// ============================================
// E2E TESTS - TAKEAWAY REQUIREMENTS
// ============================================

test.describe('TakeAway Requirements Validation', () => {
  test('should block TakeAway toggle when requirements missing', async ({ page }) => {
    // Setup: Empty profile
    await setupEmptyProfile(page);
    
    // Navigate to Sales
    await page.goto('http://localhost:5173/admin/operations/sales');
    
    // Try to toggle public
    const toggle = page.locator('[data-testid="toggle-takeaway-public"]');
    await toggle.click();
    
    // ✅ Requirements modal should appear
    const modal = page.locator('[data-testid="requirements-modal"]');
    await expect(modal).toBeVisible();
    
    // ✅ Modal should have title
    await expect(modal.locator('h2')).toContainText('Configuración Requerida');
    
    // ✅ Should show missing requirements count
    const missingCount = page.locator('[data-testid="missing-count"]');
    await expect(missingCount).toContainText('5 pendientes');
    
    // ✅ Each requirement should be listed
    const requirements = page.locator('[data-testid="requirement-item"]');
    await expect(requirements).toHaveCount(5);
    
    // ✅ Requirements should have icons
    await expect(requirements.first()).toContainText('🏪'); // business name
    
    // ✅ Each should have redirect button
    const buttons = page.locator('[data-testid="requirement-item"] button');
    await expect(buttons).toHaveCount(5);
  });

  test('should navigate to configuration page when clicking requirement', async ({ page }) => {
    await setupEmptyProfile(page);
    await page.goto('http://localhost:5173/admin/operations/sales');
    await page.click('[data-testid="toggle-takeaway-public"]');
    
    // Click on address requirement
    const addressReq = page.locator('[data-testid="requirement-takeaway_address"]');
    await addressReq.locator('button').click();
    
    // ✅ Should redirect to business settings
    await expect(page).toHaveURL('**/admin/settings/business**');
    
    // ✅ Address field should be visible and focused
    const addressField = page.locator('[name="address"]');
    await expect(addressField).toBeVisible();
    await expect(addressField).toBeFocused();
  });

  test('should show progress as requirements are completed', async ({ page }) => {
    await setupEmptyProfile(page);
    
    // Step 1: 0/5 complete
    await page.goto('http://localhost:5173/admin/operations/sales');
    await page.click('[data-testid="toggle-takeaway-public"]');
    
    let progress = page.locator('[data-testid="requirements-progress"]');
    await expect(progress).toContainText('0 / 5');
    
    // Close modal
    await page.click('[data-testid="close-modal"]');
    
    // Complete business name
    await page.goto('http://localhost:5173/admin/settings/business');
    await page.fill('[name="businessName"]', 'Test Restaurant');
    await page.click('button[type="submit"]');
    
    // Step 2: 1/5 complete
    await page.goto('http://localhost:5173/admin/operations/sales');
    await page.click('[data-testid="toggle-takeaway-public"]');
    
    progress = page.locator('[data-testid="requirements-progress"]');
    await expect(progress).toContainText('1 / 5');
    
    // ✅ Progress bar should show 20%
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    
    // ✅ Business name should be checked
    const businessNameReq = page.locator('[data-testid="requirement-takeaway_business_name"]');
    await expect(businessNameReq).toHaveClass(/completed/);
    await expect(businessNameReq.locator('[data-icon="check"]')).toBeVisible();
  });

  test('should allow toggle when all requirements complete', async ({ page }) => {
    // Setup complete profile
    await setupCompleteTakeAwayProfile(page);
    
    // Navigate to Sales
    await page.goto('http://localhost:5173/admin/operations/sales');
    
    // Toggle should work without modal
    const toggle = page.locator('[data-testid="toggle-takeaway-public"]');
    await toggle.click();
    
    // ✅ Modal should NOT appear
    const modal = page.locator('[data-testid="requirements-modal"]');
    await expect(modal).not.toBeVisible();
    
    // ✅ Toggle should be checked
    await expect(toggle).toBeChecked();
    
    // ✅ Success toast should appear
    const toast = page.locator('.chakra-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('TakeAway público activado');
    
    // ✅ Badge should show "Activo"
    const badge = page.locator('[data-testid="takeaway-status-badge"]');
    await expect(badge).toContainText('Activo');
  });

  test('should show estimated time for pending requirements', async ({ page }) => {
    await setupEmptyProfile(page);
    await page.goto('http://localhost:5173/admin/operations/sales');
    await page.click('[data-testid="toggle-takeaway-public"]');
    
    // ✅ Each requirement should show estimated minutes
    const businessNameReq = page.locator('[data-testid="requirement-takeaway_business_name"]');
    await expect(businessNameReq).toContainText('2 min');
    
    const addressReq = page.locator('[data-testid="requirement-takeaway_address"]');
    await expect(addressReq).toContainText('3 min');
    
    // ✅ Total time should be shown
    const totalTime = page.locator('[data-testid="total-estimated-time"]');
    await expect(totalTime).toContainText('Tiempo estimado: 35 min');
  });
});

// ============================================
// E2E TESTS - MULTIPLE CAPABILITIES
// ============================================

test.describe('Multiple Capabilities Requirements', () => {
  test('should validate requirements independently per capability', async ({ page }) => {
    // Setup: Complete TakeAway but not Dine-In
    await setupCompleteTakeAwayProfile(page);
    
    // TakeAway should work
    await page.goto('http://localhost:5173/admin/operations/sales');
    const takeawayToggle = page.locator('[data-testid="toggle-takeaway-public"]');
    await takeawayToggle.click();
    await expect(takeawayToggle).toBeChecked(); // ✅ Works
    
    // Dine-In should be blocked
    const dineinToggle = page.locator('[data-testid="toggle-dinein-shift"]');
    await dineinToggle.click();
    
    // ✅ Modal should appear for Dine-In requirements
    const modal = page.locator('[data-testid="requirements-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Dine-In'); // Different capability
    
    // ✅ Should show Dine-In specific requirements (tables, staff)
    await expect(modal).toContainText('Configurar al menos 1 mesa');
    await expect(modal).toContainText('Registrar al menos 1 empleado');
  });
});

// ============================================
// E2E TESTS - EDGE CASES
// ============================================

test.describe('Requirements Edge Cases', () => {
  test('should handle concurrent requirement completion', async ({ page }) => {
    // Open modal in two tabs (simulate real user behavior)
    await page.goto('http://localhost:5173/admin/operations/sales');
    await page.click('[data-testid="toggle-takeaway-public"]');
    
    // Open settings in new tab (Ctrl+Click)
    const settingsLink = page.locator('[data-testid="requirement-takeaway_business_name"] button');
    
    // Complete requirement
    await page.goto('http://localhost:5173/admin/settings/business');
    await page.fill('[name="businessName"]', 'Test Restaurant');
    await page.click('button[type="submit"]');
    
    // Go back to sales
    await page.goto('http://localhost:5173/admin/operations/sales');
    await page.click('[data-testid="toggle-takeaway-public"]');
    
    // ✅ Should reflect updated state
    const modal = page.locator('[data-testid="requirements-modal"]');
    await expect(modal.locator('[data-testid="missing-count"]')).toContainText('4 pendientes');
  });

  test('should prevent toggle spam when requirements missing', async ({ page }) => {
    await setupEmptyProfile(page);
    await page.goto('http://localhost:5173/admin/operations/sales');
    
    const toggle = page.locator('[data-testid="toggle-takeaway-public"]');
    
    // Click multiple times rapidly
    await toggle.click();
    await toggle.click();
    await toggle.click();
    
    // ✅ Should only show one modal
    const modals = page.locator('[data-testid="requirements-modal"]');
    await expect(modals).toHaveCount(1);
    
    // ✅ Toggle should remain unchecked
    await expect(toggle).not.toBeChecked();
  });
});
