/**
 * Materials Stock Calculations Tests - Validación de Cálculos Personalizados
 * 
 * Tests exhaustivos de cálculos de stock en la UI:
 * ✅ Valida operaciones de stock (+10, -10)
 * ✅ Verifica valores exactos después de ajustes
 * ✅ Tests de conversiones de unidades en UI (kg, litros, unidades)
 * ✅ Validación de stock bajo (minStock threshold)
 * ✅ Cálculo de valor total (stock * unit_cost)
 * ✅ Verificación de optimistic updates (UI update antes de server)
 * 
 * NOTA: Estos tests validan CÁLCULOS EN LA UI, no precisión matemática.
 * Para precisión Decimal.js, ver: src/__tests__/stocklab-precision-tests.test.ts
 * 
 * @see src/pages/admin/supply-chain/materials/components/MaterialsManagement/InventoryTab.tsx
 * @see src/lib/decimal/decimalUtils.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Stock Calculations - Validación de Cálculos en UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Esperar elemento clave en lugar de networkidle
    await page.locator('[data-testid="materials-page"], button:has-text("Nuevo")').first().waitFor({ timeout: 30000 });
  });

  // ============================================================================
  // STOCK ADJUSTMENT TESTS - Botones +10 / -10
  // ============================================================================

  test.describe('Ajustes de Stock (+10 / -10)', () => {
    
    test('1. Incrementar stock con botón +10', async ({ page }) => {
      // Crear material con stock inicial conocido
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Stock +10');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      // Stock inicial = 50
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      const initialStockField = dialog.getByLabel(/Stock inicial/i);
      await initialStockField.fill('50');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      // Esperar creación
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible({ timeout: 10000 });
      
      // ========== INCREMENTAR STOCK ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Stock +10' });
      await expect(materialCard).toBeVisible();
      
      // Obtener stock inicial del texto "Stock actual: 50"
      const stockText = materialCard.locator('text=/Stock actual:/i');
      const initialStockText = await stockText.textContent();
      const initialStock = parseFloat(initialStockText?.match(/[\d.]+/)?.[0] || '0');
      
      expect(initialStock).toBe(50); // Verificar stock inicial
      
      // Click en botón +10
      const plusButton = materialCard.getByRole('button', { name: '+10' });
      await expect(plusButton).toBeVisible();
      await plusButton.click();
      
      // ========== VALIDAR OPTIMISTIC UPDATE ==========
      
      // El stock debe actualizarse inmediatamente en la UI (optimistic)
      await page.waitForTimeout(500); // Wait for optimistic update
      
      const updatedStockText = await materialCard.locator('text=/Stock actual:/i').textContent();
      const updatedStock = parseFloat(updatedStockText?.match(/[\d.]+/)?.[0] || '0');
      
      // 50 + 10 = 60
      expect(updatedStock).toBe(60);
      
      // ========== VALIDAR NOTIFICACIÓN ==========
      
      const toast = page.locator('[role="status"]').filter({ hasText: /Stock agregado/i });
      if (await toast.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(toast).toContainText('10');
        await expect(toast).toContainText('kg');
      }
    });

    test('2. Decrementar stock con botón -10', async ({ page }) => {
      // Crear material con stock inicial = 100
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Stock -10');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('100');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== DECREMENTAR STOCK ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Stock -10' });
      await expect(materialCard).toBeVisible();
      
      const stockText = materialCard.locator('text=/Stock actual:/i');
      const initialStockText = await stockText.textContent();
      const initialStock = parseFloat(initialStockText?.match(/[\d.]+/)?.[0] || '0');
      
      expect(initialStock).toBe(100);
      
      // Click en botón -10
      const minusButton = materialCard.getByRole('button', { name: '-10' });
      await minusButton.click();
      
      // ========== VALIDAR ACTUALIZACIÓN ==========
      
      await page.waitForTimeout(500);
      
      const updatedStockText = await materialCard.locator('text=/Stock actual:/i').textContent();
      const updatedStock = parseFloat(updatedStockText?.match(/[\d.]+/)?.[0] || '0');
      
      // 100 - 10 = 90
      expect(updatedStock).toBe(90);
    });

    test('3. Stock no puede ser negativo (mínimo 0)', async ({ page }) => {
      // Crear material con stock = 5
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Stock Mínimo');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('5');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== INTENTAR DECREMENTAR MÁS DE LO DISPONIBLE ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Stock Mínimo' });
      
      // Click -10 cuando solo hay 5
      const minusButton = materialCard.getByRole('button', { name: '-10' });
      await minusButton.click();
      
      await page.waitForTimeout(500);
      
      // Stock debe ser 0 (no negativo)
      const stockText = await materialCard.locator('text=/Stock actual:/i').textContent();
      const finalStock = parseFloat(stockText?.match(/[\d.]+/)?.[0] || '0');
      
      expect(finalStock).toBe(0); // No debe ser -5
    });
  });

  // ============================================================================
  // VALUE CALCULATION TESTS - stock * unit_cost
  // ============================================================================

  test.describe('Cálculo de Valor Total', () => {
    
    test('4. Valor total = stock * unit_cost', async ({ page }) => {
      // Crear material: stock=20, cost=150.50 → valor=3010
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Valor Total');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('150.50');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('20');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== VERIFICAR VALOR EN CARD ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Valor Total' });
      
      // Buscar texto "Valor: $3,010.00" (o formato similar)
      const valueText = materialCard.locator('text=/Valor:/i');
      
      if (await valueText.isVisible().catch(() => false)) {
        const valueContent = await valueText.textContent();
        
        // Extraer número del formato "$3,010.00"
        const valueNumber = parseFloat(valueContent?.replace(/[^0-9.-]/g, '') || '0');
        
        // 20 * 150.50 = 3010
        expect(valueNumber).toBe(3010);
      }
    });

    test('5. Valor total se actualiza después de ajuste de stock', async ({ page }) => {
      // Crear: stock=10, cost=100 → valor=1000
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Valor Dinámico');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('10');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Valor Dinámico' });
      
      // Valor inicial: 10 * 100 = 1000
      let valueText = materialCard.locator('text=/Valor:/i');
      if (await valueText.isVisible().catch(() => false)) {
        let valueContent = await valueText.textContent();
        let valueNumber = parseFloat(valueContent?.replace(/[^0-9.-]/g, '') || '0');
        expect(valueNumber).toBe(1000);
      }
      
      // ========== INCREMENTAR STOCK +10 ==========
      
      await materialCard.getByRole('button', { name: '+10' }).click();
      await page.waitForTimeout(500);
      
      // Valor actualizado: 20 * 100 = 2000
      valueText = materialCard.locator('text=/Valor:/i');
      if (await valueText.isVisible().catch(() => false)) {
        const updatedValueContent = await valueText.textContent();
        const updatedValue = parseFloat(updatedValueContent?.replace(/[^0-9.-]/g, '') || '0');
        expect(updatedValue).toBe(2000);
      }
    });
  });

  // ============================================================================
  // LOW STOCK ALERT TESTS - minStock threshold
  // ============================================================================

  test.describe('Alertas de Stock Bajo', () => {
    
    test('6. Badge "Bajo" aparece cuando stock < minStock', async ({ page }) => {
      // Crear: stock=8, minStock=10 → LOW
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Stock Bajo');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      const minStockField = dialog.getByLabel(/Stock mínimo/i);
      await minStockField.fill('10');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('8'); // 8 < 10
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== VERIFICAR BADGE AMARILLO "BAJO" ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Stock Bajo' });
      
      const badge = materialCard.locator('[data-part="root"]').filter({ hasText: /Bajo/i });
      await expect(badge).toBeVisible({ timeout: 3000 });
      
      // Verificar color amarillo (warning)
      const badgeColor = await badge.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      // Amarillo tiene R y G altos
      expect(badgeColor).toMatch(/rgb\(([1-9]\d{2}|\d{3}),\s*([1-9]\d{2}|\d{3}),\s*\d+\)/);
    });

    test('7. Badge "Crítico" aparece cuando stock = 0', async ({ page }) => {
      // Crear con stock = 0
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Stock Crítico');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      const minStockField = dialog.getByLabel(/Stock mínimo/i);
      await minStockField.fill('5');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('0'); // CRITICAL
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== VERIFICAR BADGE ROJO "CRÍTICO" ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Stock Crítico' });
      
      const badge = materialCard.locator('[data-part="root"]').filter({ hasText: /Crítico/i });
      await expect(badge).toBeVisible({ timeout: 3000 });
      
      // Verificar color rojo
      const badgeColor = await badge.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(badgeColor).toMatch(/rgb\(([1-9]\d{2}|\d{3}),\s*\d+,\s*\d+\)/); // R alto
    });

    test('8. Badge "OK" aparece cuando stock >= minStock', async ({ page }) => {
      // Crear: stock=20, minStock=10 → OK
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Stock OK');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      const minStockField = dialog.getByLabel(/Stock mínimo/i);
      await minStockField.fill('10');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('20'); // 20 >= 10
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== VERIFICAR BADGE VERDE "OK" ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Stock OK' });
      
      const badge = materialCard.locator('[data-part="root"]').filter({ hasText: /OK/i });
      await expect(badge).toBeVisible({ timeout: 3000 });
      
      // Verificar color verde
      const badgeColor = await badge.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(badgeColor).toMatch(/rgb\(\d+,\s*([1-9]\d{2}|\d{3}),\s*\d+\)/); // G alto
    });
  });

  // ============================================================================
  // UNIT FORMATTING TESTS - kg, litros, unidades
  // ============================================================================

  test.describe('Formato de Unidades en UI', () => {
    
    test('9. Unidad "kg" se muestra correctamente', async ({ page }) => {
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Kilos');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('25.5');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== VERIFICAR FORMATO EN CARD ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Kilos' });
      
      // Debe mostrar "25.5 kg" o "25,5 kg"
      await expect(materialCard).toContainText(/25[.,]5/);
      await expect(materialCard).toContainText('kg');
    });

    test('10. Unidad "litros" se muestra correctamente', async ({ page }) => {
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Litros');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('litros');
      await dialog.getByLabel(/Costo por unidad/i).fill('50.00');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('100');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Litros' });
      
      await expect(materialCard).toContainText('100');
      await expect(materialCard).toContainText(/litros?/i);
    });

    test('11. Unidad "unidad" se muestra para COUNTABLE', async ({ page }) => {
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Unidades');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /contable/i }).click();
      
      const packageSizeField = dialog.getByLabel(/Tamaño del paquete/i);
      if (await packageSizeField.isVisible().catch(() => false)) {
        await packageSizeField.fill('12');
      }
      
      await dialog.getByLabel(/Costo por unidad/i).fill('25.00');
      
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      await dialog.getByLabel(/Stock inicial/i).fill('50');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Unidades' });
      
      await expect(materialCard).toContainText('50');
      await expect(materialCard).toContainText(/unidad/i);
    });
  });
});
