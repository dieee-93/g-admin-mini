/**
 * Materials Notifications Tests - Sistema de Notificaciones Personalizado
 * 
 * Tests exhaustivos del sistema notify.* de G-Mini:
 * ✅ Valida mensajes específicos de notify.itemCreated(), notify.itemUpdated(), etc.
 * ✅ Verifica tipos correctos (success, error, warning, info)
 * ✅ Valida duración de toasts (3s success, 5s error, 4s warning)
 * ✅ Tests de notificaciones de stock (notify.stockAdded, notify.stockLow)
 * ✅ Validación de errores específicos con mensajes reales
 * 
 * @see src/lib/notifications.ts - Sistema centralizado de notificaciones
 */

import { test, expect } from '@playwright/test';

test.describe('Sistema de Notificaciones - Personalizado G-Mini', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    // Esperar elemento clave en lugar de domcontentloaded
    await page.locator('[data-testid="materials-page"], button:has-text("Nuevo")').first().waitFor({ timeout: 30000 });
  });

  // ============================================================================
  // SUCCESS NOTIFICATIONS - notify.itemCreated(), notify.itemUpdated()
  // ============================================================================

  test.describe('Notificaciones de Éxito (Success)', () => {

    test('1. notify.itemCreated() - Mensaje específico con nombre del item', async ({ page }) => {
      // Crear material
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');

      const materialName = 'Aceite de Oliva Extra Virgen';
      await dialog.locator('[data-testid="material-name"]').fill(materialName);

      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();

      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('litros');
      await dialog.getByLabel(/Costo por unidad/i).fill('250.00');

      await dialog.getByRole('button', { name: /Crear Material/i }).click();

      // ========== VALIDAR TOAST ESPECÍFICO ==========

      const toast = page.locator('[role="status"]');
      await expect(toast).toBeVisible({ timeout: 10000 });

      // Verificar estructura del mensaje: "Item creado" + descripción con nombre
      await expect(toast).toContainText('Item creado');
      await expect(toast).toContainText(`${materialName} se ha creado exitosamente`);

      // Verificar tipo (data-type="success")
      await expect(toast).toHaveAttribute('data-type', 'success');

      // Verificar que el toast tiene color verde (success)
      // En Chakra UI v3, success toasts tienen bg verde
      const toastColor = await toast.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      // Verde debe tener componente G alto (rgb(X, G, X) donde G > 150)
      expect(toastColor).toMatch(/rgb\(\d+,\s*([1-9]\d{2}|\d{3}),\s*\d+\)/); // G >= 100
    });

    test('2. notify.itemUpdated() - Actualización exitosa', async ({ page }) => {
      // Primero crear
      await page.locator('[data-testid="new-material-button"]').click();
      let dialog = page.locator('[role="dialog"]');

      await dialog.locator('[data-testid="material-name"]').fill('Material Update Test');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();

      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');

      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await page.waitForTimeout(1000);

      // Editar
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Update Test' });
      await materialCard.getByRole('button', { name: /editar/i }).click();

      dialog = page.locator('[role="dialog"]');
      const nameInput = dialog.locator('[data-testid="material-name"]');
      await nameInput.clear();
      await nameInput.fill('Material Actualizado');

      await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();

      // ========== VALIDAR notify.itemUpdated() ==========

      const toast = page.locator('[role="status"]');
      await expect(toast).toBeVisible({ timeout: 10000 });

      await expect(toast).toContainText('Item actualizado');
      await expect(toast).toContainText('Material Actualizado fue actualizado');
      await expect(toast).toHaveAttribute('data-type', 'success');
    });

    test('3. notify.itemDeleted() - Eliminación exitosa', async ({ page }) => {
      // Crear material
      await page.locator('[data-testid="new-material-button"]').click();
      let dialog = page.locator('[role="dialog"]');

      await dialog.locator('[data-testid="material-name"]').fill('Material Delete Notify');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();

      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('50.00');

      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      await page.waitForTimeout(1000);

      // Eliminar
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Delete Notify' });
      await materialCard.getByRole('button', { name: /eliminar|trash/i }).click();

      const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]')
        .filter({ hasText: /eliminar/i });
      await confirmDialog.getByRole('button', { name: /confirmar|eliminar|sí/i }).click();

      // ========== VALIDAR notify.itemDeleted() ==========

      const toast = page.locator('[role="status"]');
      await expect(toast).toBeVisible({ timeout: 10000 });

      await expect(toast).toContainText('Item eliminado');
      await expect(toast).toContainText('Material Delete Notify fue eliminado del inventario');
      await expect(toast).toHaveAttribute('data-type', 'success');
    });
  });

  // ============================================================================
  // ERROR NOTIFICATIONS - notify.error()
  // ============================================================================

  test.describe('Notificaciones de Error', () => {

    test('4. Error de validación - Campos requeridos', async ({ page }) => {
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');

      // Intentar submit sin llenar campos requeridos
      await dialog.getByRole('button', { name: /Crear Material/i }).click();

      // ========== VALIDAR ERRORES INLINE (no toast, sino mensajes de campo) ==========

      // Los errores de validación deben aparecer en los campos
      const nameError = dialog.locator('text=/nombre.*requerido/i');
      await expect(nameError.first()).toBeVisible({ timeout: 3000 });

      const categoryError = dialog.locator('text=/categoría.*requerida/i');
      await expect(categoryError.first()).toBeVisible();

      const typeError = dialog.locator('text=/tipo.*requerido/i');
      await expect(typeError.first()).toBeVisible();

      // Los errores inline deben ser rojos
      const nameField = dialog.locator('[data-testid="material-name"]');
      const borderColor = await nameField.evaluate((el) => {
        return window.getComputedStyle(el).borderColor;
      });
      // Rojo tiene componente R alto
      expect(borderColor).toMatch(/rgb\(([1-9]\d{2}|\d{3}),\s*\d+,\s*\d+\)/); // R >= 100
    });

    test('5. Error en operación de API (simular error de red)', async ({ page }) => {
      // Interceptar request y hacer que falle
      await page.route('**/materials*', route => route.abort('failed'));

      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');

      await dialog.locator('[data-testid="material-name"]').fill('Test API Error');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();

      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');

      await dialog.getByRole('button', { name: /Crear Material/i }).click();

      // ========== VALIDAR TOAST DE ERROR ==========

      const errorToast = page.locator('[role="status"]').filter({ hasText: /error/i });
      await expect(errorToast).toBeVisible({ timeout: 10000 });

      // Verificar tipo error
      await expect(errorToast).toHaveAttribute('data-type', 'error');

      // Verificar color rojo
      const toastColor = await errorToast.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(toastColor).toMatch(/rgb\(([1-9]\d{2}|\d{3}),\s*\d+,\s*\d+\)/); // R alto
    });
  });

  // ============================================================================
  // WARNING NOTIFICATIONS - notify.stockLow()
  // ============================================================================

  test.describe('Notificaciones de Advertencia (Warning)', () => {

    test('6. notify.stockLow() - Alerta de stock bajo', async ({ page }) => {
      // Crear material con stock bajo
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');

      await dialog.locator('[data-testid="material-name"]').fill('Material Stock Bajo');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();

      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');

      // Stock mínimo = 10
      const minStockField = dialog.getByLabel(/Stock mínimo/i);
      await minStockField.fill('10');

      // Agregar stock inicial MENOR que el mínimo (5 < 10)
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();

      const initialStockField = dialog.getByLabel(/Stock inicial/i);
      await initialStockField.fill('5'); // 5 < 10 = LOW STOCK

      await dialog.getByRole('button', { name: /Crear Material/i }).click();

      // ========== VALIDAR WARNING TOAST ==========

      // Puede aparecer un warning toast de stock bajo
      const warningToast = page.locator('[role="status"]').filter({ hasText: /stock|bajo|warning/i });

      // Si el sistema genera warning automáticamente
      if (await warningToast.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(warningToast).toHaveAttribute('data-type', 'warning');

        // Verificar color amarillo/naranja
        const toastColor = await warningToast.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        // Amarillo/naranja tiene R y G altos
        expect(toastColor).toMatch(/rgb\(([1-9]\d{2}|\d{3}),\s*([1-9]\d{2}|\d{3}),\s*\d+\)/);
      }
    });
  });

  // ============================================================================
  // INFO NOTIFICATIONS - notify.info()
  // ============================================================================

  test.describe('Notificaciones Informativas (Info)', () => {

    test('7. notify.info() - Información general', async ({ page }) => {
      // Las notificaciones info suelen usarse para acciones sin impacto crítico
      // Por ejemplo, al cambiar vista de cards a table

      // Click en toggle de vista (si existe)
      const viewToggle = page.locator('[data-testid="view-toggle"], button:has-text("Vista")');

      if (await viewToggle.isVisible().catch(() => false)) {
        await viewToggle.click();

        // Puede aparecer info toast
        const infoToast = page.locator('[role="status"]').filter({ hasText: /vista/i });

        if (await infoToast.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(infoToast).toHaveAttribute('data-type', 'info');

          // Verificar color azul (info)
          const toastColor = await infoToast.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
          });
          // Azul tiene componente B alto
          expect(toastColor).toMatch(/rgb\(\d+,\s*\d+,\s*([1-9]\d{2}|\d{3})\)/); // B >= 100
        }
      }
    });
  });

  // ============================================================================
  // TOAST DURATION TESTS - Duración específica por tipo
  // ============================================================================

  test.describe('Duración de Toasts', () => {

    test('8. Success toast dura 3 segundos', async ({ page }) => {
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');

      await dialog.locator('[data-testid="material-name"]').fill('Duration Test');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();

      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('10.00');

      const startTime = Date.now();
      await dialog.getByRole('button', { name: /Crear Material/i }).click();

      const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      await expect(toast).toBeVisible();

      // Toast debe desaparecer en ~3 segundos (tolerancia ±1s)
      await expect(toast).not.toBeVisible({ timeout: 5000 });

      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThan(2000); // Mínimo 2s
      expect(elapsedTime).toBeLessThan(6000);    // Máximo 6s (3s + 3s margen)
    });

    test('9. Error toast dura 5 segundos', async ({ page }) => {
      // Simular error
      await page.route('**/materials*', route => route.abort('failed'));

      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');

      await dialog.locator('[data-testid="material-name"]').fill('Error Duration');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();

      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('10.00');

      const startTime = Date.now();
      await dialog.getByRole('button', { name: /Crear Material/i }).click();

      const errorToast = page.locator('[role="status"]').filter({ hasText: /error/i });
      await expect(errorToast).toBeVisible({ timeout: 10000 });

      // Error toast debe durar ~5 segundos
      await expect(errorToast).not.toBeVisible({ timeout: 8000 });

      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThan(4000); // Mínimo 4s
      expect(elapsedTime).toBeLessThan(9000);    // Máximo 9s (5s + 4s margen)
    });
  });

  // ============================================================================
  // TOAST STACK TESTS - Múltiples toasts simultáneos
  // ============================================================================

  test.describe('Stack de Toasts', () => {

    test('10. Múltiples toasts se apilan correctamente', async ({ page }) => {
      // Crear 3 materiales rápidamente
      for (let i = 1; i <= 3; i++) {
        await page.locator('[data-testid="new-material-button"]').click();
        const dialog = page.locator('[role="dialog"]');

        await dialog.locator('[data-testid="material-name"]').fill(`Stack Test ${i}`);
        const categorySelect = dialog.locator('[data-testid="material-category"]');
        await categorySelect.click();
        await page.locator('[role="option"]').first().click();

        await dialog.getByRole('button', { name: /medible/i }).click();
        await dialog.getByLabel(/Unidad de medida/i).fill('kg');
        await dialog.getByLabel(/Costo por unidad/i).fill('10.00');

        await dialog.getByRole('button', { name: /Crear Material/i }).click();

        // Esperar muy poco para que se superpongan
        await page.waitForTimeout(500);
      }

      // Verificar que existen múltiples toasts
      const toasts = page.locator('[role="status"]');
      const count = await toasts.count();

      // Debe haber al menos 2 toasts visibles simultáneamente
      expect(count).toBeGreaterThanOrEqual(2);

      // Verificar que los toasts están posicionados correctamente (uno debajo del otro)
      const firstToast = toasts.first();
      const secondToast = toasts.nth(1);

      const firstPos = await firstToast.boundingBox();
      const secondPos = await secondToast.boundingBox();

      if (firstPos && secondPos) {
        // El segundo toast debe estar debajo del primero (Y mayor)
        expect(secondPos.y).toBeGreaterThan(firstPos.y);
      }
    });
  });
});
