import { test, expect, Page } from '@playwright/test';

/**
 * Helper to create a complete, valid material
 */
async function createMaterial(page: Page, name: string) {
  await page.getByTestId('materials-toolbar-new-button').click();
  const dialog = page.locator('[role="dialog"]');
  
  // Wait for load
  await expect(page.getByText('Cargando formulario...')).toBeHidden();

  // 1. Basic Info: Name
  await dialog.getByTestId('material-name-input').fill(name);
  
  // 2. Basic Info: Category (Optional but we fill it for realism)
  const categoryTrigger = dialog.getByTestId('material-category-select').locator('[data-part="trigger"]');
  await categoryTrigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option').first().click();

  // 3. Config: Type
  await dialog.getByTestId('material-type-select').locator('[data-part="trigger"]').click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: /Conmensurable/i }).click();

  // 4. Type-Specific: Unit (Appears after type selection)
  const unitTrigger = dialog.getByTestId('material-unit').locator('[data-part="trigger"]');
  await expect(unitTrigger).toBeVisible();
  await unitTrigger.click();
  await page.locator('[data-part="item"][data-value="kg"]').click();

  // 5. Stock: Activate switch to show Cost & Quantity
  await dialog.getByTestId('add-stock-switch').click();
  await page.waitForTimeout(500); 
  
  await expect(dialog.getByTestId('measurable-cost-input')).toBeVisible();
  await dialog.getByTestId('measurable-cost-input').fill('100');
  await dialog.getByTestId('measurable-quantity-input').fill('10');

  // Submit
  await dialog.getByTestId('submit-material').click();

  // Handle Event Sourcing Confirmation
  const confirmationDialog = page.locator('[role="dialog"]').filter({ hasText: 'Confirmar Creación' });
  if (await confirmationDialog.isVisible({ timeout: 2000 })) {
    await confirmationDialog.getByRole('button', { name: 'Confirmar y Guardar' }).click();
  }
  
  // Wait for success toast and dialog close
  await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i })).toBeVisible({ timeout: 10000 });
  await expect(dialog).toBeHidden();
}

/**
 * Materials Management Suite
 * Focuses on Search, Edit, and Delete operations
 */
test.describe('Materials Management - Search, Edit & Delete', () => {
  
  test.beforeEach(async ({ page }) => {
    // Disable React Scan explicitly
    await page.addInitScript(() => {
      (window as any).__IS_PLAYWRIGHT__ = true;
      localStorage.setItem('playwright-test', 'true');
    });

    // Navigate to Materials
    await page.goto('/admin/supply-chain/materials');
    await expect(page.getByTestId('materials-grid')).toBeVisible({ timeout: 15000 });
  });

  test('1. Buscar material por nombre', async ({ page }) => {
    const testId = Date.now();
    const materialName = `SearchMe-${testId}`;

    await createMaterial(page, materialName);

    // Esperar a que el toast desaparezca para no confundir locadores ni tapar clicks
    await expect(page.locator('[role="status"]')).not.toBeVisible({ timeout: 10000 });

    // --- PRUEBA DE BÚSQUEDA ---
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill(materialName);
    await page.waitForTimeout(1000); // Debounce wait

    // Verificar fila (específico al grid para evitar Toast)
    const row = page.getByTestId('materials-grid').getByText(materialName);
    await expect(row).toBeVisible();
    
    // Verificar filtro negativo
    await searchInput.fill(`NonExistent-${testId}`);
    await expect(page.getByText('No se encontraron materiales')).toBeVisible();
  });

  test('2. Editar nombre de un material existente', async ({ page }) => {
    const testId = Date.now();
    const materialName = `EditMe-${testId}`;
    const updatedName = `${materialName}-Upd`;

    await createMaterial(page, materialName);

    // Buscar
    await page.getByTestId('search-input').fill(materialName);
    await page.waitForTimeout(1000);

    // Click EDITAR
    const row = page.locator('tr').filter({ hasText: materialName });
    await row.getByTestId('material-edit-button').click();

    // Modificar
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Esperar carga
    await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 10000 });
    
    // Cambiar nombre
    await dialog.getByTestId('material-name-input').fill(updatedName);
    await dialog.getByTestId('submit-material').click();

    // Verificar éxito
    // Nota: El mensaje puede ser "Material actualizado" o "Item actualizado" dependiendo de la implementación
    await expect(page.locator('[role="status"]').filter({ hasText: /actualizado/i })).toBeVisible({ timeout: 10000 });
    await expect(dialog).toBeHidden();
    
    // Verificar cambio visual en tabla
    await page.getByTestId('search-input').clear();
    await page.getByTestId('search-input').fill(updatedName);
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('materials-grid').getByText(updatedName)).toBeVisible();
  });

  test('3. Eliminar un material', async ({ page }) => {
    const testId = Date.now();
    const materialName = `DeleteMe-${testId}`;

    await createMaterial(page, materialName);

    // Buscar
    await page.getByTestId('search-input').fill(materialName);
    await page.waitForTimeout(1000);

    // Configurar confirmación (window.confirm)
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Click BORRAR
    const row = page.locator('tr').filter({ hasText: materialName });
    await row.getByTestId('material-delete-button').click();

    // Verificar éxito
    await expect(page.locator('[role="status"]').filter({ hasText: /eliminado/i })).toBeVisible();
    
    // Verificar que desaparece
    await expect(page.getByText(materialName)).toBeHidden();
  });

});
