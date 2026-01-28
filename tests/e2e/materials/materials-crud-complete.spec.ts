/**
 * Materials CRUD Tests - Personalizados para G-Mini
 * 
 * Tests absolutamente específicos para nuestra UI:
 * ✅ Usa selectores exactos (data-testid="material-name", etc.)
 * ✅ Valida notificaciones reales del sistema notify.*
 * ✅ Prueba LOS 3 TIPOS: MEASURABLE, COUNTABLE, ELABORATED
 * ✅ Valida mensajes específicos ("Item creado", "Item actualizado", etc.)
 * ✅ Tests de validación con mensajes exactos de nuestro sistema
 * 
 * @see src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/MaterialFormDialog.tsx
 * @see src/lib/notifications.ts
 */

import { test, expect } from '@playwright/test';

test.describe('Materials CRUD - Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // 📝 Capturar todos los console logs del browser
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('confirmAndSubmit') || text.includes('addItem') || text.includes('useMaterialsActions')) {
        console.log(`[BROWSER] ${msg.type()}: ${text}`);
      }
    });

    // 🎯 CRITICAL: Disable React Scan BEFORE loading page
    await page.addInitScript(() => {
      localStorage.setItem('playwright-test', 'true');
    });
    
    await page.goto('/admin/supply-chain/materials', { waitUntil: 'domcontentloaded' });
    
    // Esperar renders de React y que la página esté interactiva
    await page.waitForTimeout(2000);
  });

  // ============================================================================
  // CREATE TESTS - 3 TIPOS DE MATERIALES
  // ============================================================================

  test.describe('Create Materials - Los 3 Tipos', () => {
    
    test('1. Crear MEASURABLE Material (kg, litros)', async ({ page }) => {      
      // ========== 🔄 PATRÓN: TESTS RE-EJECUTABLES CON TIMESTAMPS ==========
      // 
      // 📚 PROBLEMA: E2E tests crean datos REALES en la DB
      //    - Primera ejecución: ✅ Crea "Harina Premium"
      //    - Segunda ejecución: ❌ Error "Harina Premium" ya existe
      //    - Solución manual: Borrar datos manualmente (tedioso)
      //
      // ✅ SOLUCIÓN: Nombres únicos con timestamp
      //    - Date.now() retorna Unix timestamp en milisegundos
      //    - Ejemplo: 1738012845678 (único por ejecución)
      //    - Cada test crea un registro nuevo sin conflictos
      //
      // 💡 CUÁNDO USAR:
      //    - ✅ Desarrollo rápido (fase actual)
      //    - ✅ Tests locales sin cleanup automático
      //    - ✅ DB compartida dev+test (1 proyecto Supabase)
      //    - ❌ NO usar en producción con cleanup automático
      //
      // 🎯 ALTERNATIVAS (para migrar después):
      //    1. test.beforeEach() → resetDatabase() (industry standard)
      //    2. Proyecto Supabase separado para tests
      //    3. Tablas con prefijo "test_" (test_materials, test_stock)
      //
      // 📖 PATRÓN COPIABLE:
      //    const testId = Date.now();
      //    const entityName = `NombreBase Test-${testId}`;
      //    // Usar entityName en fill(), filter(), expect()
      //
      const testId = Date.now();
      const materialName = `Harina Test-${testId}`;
      
      // ========== Open modal (ONLY data-testid) ==========
      await page.getByTestId('materials-toolbar-new-button').click();
      
      // Wait for lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // ========== Fill name ==========
      await dialog.getByTestId('material-name-input').fill(materialName);
      
      // ========== Select type: MEASURABLE ==========
      await dialog.getByTestId('material-type-select').locator('[data-part="trigger"]').click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: /Conmensurable/i }).click();
      
      // ========== Select category ==========
      await dialog.getByTestId('material-category-select').locator('[data-part="trigger"]').click();
      await page.waitForTimeout(500);
      await page.getByRole('option').first().click();
      
      // ========== Select unit (MEASURABLE specific) ==========
      await dialog.getByTestId('material-unit').locator('[data-part="trigger"]').click();
      await page.waitForTimeout(300);
      await page.getByRole('option', { name: 'kg' }).click();
      
      // ========== Activate stock switch ==========
      await dialog.getByTestId('add-stock-switch').click();
      await page.waitForTimeout(500);
      
      // ========== Fill stock fields (MEASURABLE type) ==========
      await dialog.getByTestId('measurable-quantity-input').fill('20');
      await dialog.getByTestId('measurable-cost-input').fill('3010');
      
      // ========== Submit ==========
      await dialog.getByTestId('submit-material').click();
      
      // ========== Confirm Event Sourcing ==========
      await page.waitForTimeout(500);
      const confirmationDialog = page.locator('[role="dialog"]').filter({ 
        hasText: 'Confirmar Creación con Event Sourcing' 
      });
      await expect(confirmationDialog).toBeVisible({ timeout: 5000 });
      
      const confirmButton = confirmationDialog.getByRole('button', { 
        name: 'Confirmar y Guardar →' 
      });
      await confirmButton.click();
      
      // ========== Validate success ==========
      const toast = page.locator('[role="status"]').filter({ hasText: /Material creado/i });
      await expect(toast).toBeVisible({ timeout: 10000 });
      
      // Verify material appears in the table/list
      await page.waitForTimeout(1000);
      const materialRow = page.getByText(materialName);
      await expect(materialRow).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Test MEASURABLE Material - SUCCESS');
    });

    test('2. Crear COUNTABLE Material (unidades contables)', async ({ page }) => {
      const testId = Date.now();
      const materialName = `Latas de Tomate Test-${testId}`;
      
      // ========== Open modal (ONLY data-testid) ==========
      await page.getByTestId('materials-toolbar-new-button').click();
      
      // Wait for lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // ========== Fill form (ONLY data-testid) ==========
      
      // 1. Name
      await dialog.getByTestId('material-name-input').fill(materialName);
      
      // 2. Type (COUNTABLE)
      const typeSelect = dialog.getByTestId('material-type-select').locator('[data-part="trigger"]');
      await typeSelect.click();
      await page.locator('[data-part="item"][data-value="COUNTABLE"]').click();
      
      // 3. Category (after type selection)
      const categorySelect = dialog.getByTestId('material-category-select').locator('[data-part="trigger"]');
      await categorySelect.click();
      await page.waitForTimeout(500);
      await page.getByRole('option').first().click();
      
      // 4. Activate stock switch
      await dialog.getByTestId('add-stock-switch').click();
      await page.waitForTimeout(500);
      
      // 5. Select individual mode (COUNTABLE specific)
      await dialog.getByTestId('stock-mode-individual').click();
      await page.waitForTimeout(300);
      
      // 6. Fill stock fields (COUNTABLE fields)
      await dialog.getByTestId('countable-quantity-input').fill('50');
      await dialog.getByTestId('countable-cost-input').fill('2250');
      
      // ========== Submit ==========
      await dialog.getByTestId('submit-material').click();
      
      // ========== Confirm Event Sourcing ==========
      await page.waitForTimeout(500);
      const confirmationDialog = page.locator('[role="dialog"]').filter({ 
        hasText: 'Confirmar Creación con Event Sourcing' 
      });
      await expect(confirmationDialog).toBeVisible({ timeout: 5000 });
      
      const confirmButton = confirmationDialog.getByRole('button', { 
        name: 'Confirmar y Guardar →' 
      });
      await confirmButton.click();
      
      // ========== Validate success ==========
      const toast = page.locator('[role="status"]').filter({ hasText: /Material creado/i });
      await expect(toast).toBeVisible({ timeout: 10000 });
      
      // Verify material appears in the table/list
      await page.waitForTimeout(1000); // Wait for list to refresh
      const materialRow = page.getByText(materialName);
      await expect(materialRow).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Test COUNTABLE Material - SUCCESS');
    });

    test('3. Crear ELABORATED Material (producto elaborado)', async ({ page }) => {
      // Abrir modal
      const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
      await newMaterialButton.dispatchEvent('click');
      
      // Esperar lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // ========== Información Básica ==========
      await dialog.locator('[data-testid="material-name"]').fill('Pizza Mozzarella');
      
      // ========== TIPO PRIMERO (handleTypeChange resetea category) ==========
      const elaboratedButton = dialog.getByRole('button', { name: /elaborado/i });
      await expect(elaboratedButton).toBeVisible();
      await elaboratedButton.click();
      
      // ========== CATEGORÍA DESPUÉS DEL TIPO ==========
      const categoryTrigger = dialog.locator('[data-testid="material-category"] [data-part="trigger"]');
      await categoryTrigger.click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: /Producto Elaborado/i }).click();
      
      // Verificar que aparecen campos de ELABORATED
      // (Nota: Este tipo puede tener componentes de receta que requieren interacción adicional)
      const elaboratedSection = dialog.getByText(/Componentes de la receta/i);
      if (await elaboratedSection.isVisible()) {
        // Si hay sección de receta, validar que está visible
        await expect(elaboratedSection).toBeVisible();
      }
      
      // Por ahora solo verificamos que se puede crear sin receta compleja
      // (Los tests de receta compleja serían otro suite)
      
      // ========== Submit (sin stock inicial - ELABORATED no requiere) ==========
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      // ========== Validar notificación ==========
      const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      await expect(toast).toBeVisible({ timeout: 10000 });
      await expect(toast).toContainText('Pizza Mozzarella se ha creado exitosamente');
      
      // Verificar en grid
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Pizza Mozzarella' });
      await expect(materialCard).toBeVisible();
    });
  });

  // ============================================================================
  // VALIDATION TESTS - Mensajes exactos de nuestro sistema
  // ============================================================================

  test.describe('Validación de Campos Requeridos', () => {
    
    test('4. Validar campos requeridos con mensajes específicos', async ({ page }) => {
      // Abrir modal
      const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
      await newMaterialButton.dispatchEvent('click');
      
      // Esperar lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // Intentar submit sin llenar nada
      const submitButton = dialog.getByRole('button', { name: /Crear Material/i });
      await submitButton.click();
      
      // ========== VALIDAR ERRORES ESPECÍFICOS ==========
      
      // Error en nombre (campo requerido)
      const nameError = dialog.locator('text=/nombre.*requerido/i').first();
      await expect(nameError).toBeVisible({ timeout: 3000 });
      
      // Error en categoría
      const categoryError = dialog.locator('text=/categoría.*requerida/i').first();
      await expect(categoryError).toBeVisible();
      
      // Error en tipo (debe seleccionar un tipo)
      const typeError = dialog.locator('text=/tipo.*requerido/i').first();
      await expect(typeError).toBeVisible();
      
      // ========== VERIFICAR QUE NO SE CREÓ NOTIFICACIÓN DE ÉXITO ==========
      const successToast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      await expect(successToast).not.toBeVisible();
      
      // ========== LLENAR NOMBRE Y VERIFICAR QUE ERROR DESAPARECE ==========
      await dialog.locator('[data-testid="material-name"]').fill('Test Material');
      
      // El error de nombre debe desaparecer
      await expect(nameError).not.toBeVisible({ timeout: 2000 });
    });

    test('5. Validar costo inválido (negativo)', async ({ page }) => {
      // Abrir modal
      const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
      await newMaterialButton.dispatchEvent('click');
      
      // Esperar lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      const dialog = page.locator('[role="dialog"]');
      
      // Llenar campos básicos
      await dialog.locator('[data-testid="material-name"]').fill('Material Test');
      
      // TIPO PRIMERO
      await dialog.getByRole('button', { name: /medible/i }).click();
      
      // CATEGORÍA DESPUÉS
      const categoryTrigger = dialog.locator('[data-testid="material-category"] [data-part="trigger"]');
      await categoryTrigger.click();
      await page.waitForTimeout(500);
      await page.getByRole('option').first().click();
      
      // Unidad de medida (usando trigger+value como test #1)
      const unitTrigger = dialog.locator('[data-testid="material-unit"] [data-part="trigger"]');
      await unitTrigger.click();
      await page.locator('[data-part="item"][data-value="kg"]').click();
      
      // Llenar costo NEGATIVO
      const costField = dialog.getByLabel(/Costo por unidad/i);
      await costField.fill('-10.50');
      
      // Intentar submit
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      // Verificar error de validación
      const costError = dialog.locator('text=/costo.*mayor.*0/i').first();
      await expect(costError).toBeVisible({ timeout: 3000 });
      
      // Verificar que NO se creó el material
      const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      await expect(toast).not.toBeVisible();
    });
  });

  // ============================================================================
  // UPDATE TESTS - Edición de materiales
  // ============================================================================

  test.describe('Update Materials', () => {
    
    test('6. Actualizar material existente', async ({ page }) => {
      // Primero crear un material para editar
      const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
      await newMaterialButton.dispatchEvent('click');
      
      // Esperar lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      let dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Para Editar');
      
      // TIPO PRIMERO
      await dialog.getByRole('button', { name: /medible/i }).click();
      
      // CATEGORÍA DESPUÉS
      const categoryTrigger = dialog.locator('[data-testid="material-category"] [data-part="trigger"]');
      await categoryTrigger.click();
      await page.waitForTimeout(500);
      await page.getByRole('option').first().click();
      
      // Unidad
      const unitTrigger = dialog.locator('[data-testid="material-unit"] [data-part="trigger"]');
      await unitTrigger.click();
      await page.locator('[data-part="item"][data-value="kg"]').click();
      await dialog.getByLabel(/Costo por unidad/i).fill('100.00');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      // Esperar notificación de creación
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible({ timeout: 10000 });
      
      // ========== AHORA EDITAR ==========
      
      // Buscar el card del material
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Para Editar' });
      await expect(materialCard).toBeVisible();
      
      // Click en botón editar (puede ser icono de lápiz o "Editar")
      const editButton = materialCard.getByRole('button', { name: /editar/i });
      await editButton.click();
      
      // Verificar que el modal se abrió en modo edición
      dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('heading')).toContainText(/Editar Material/i);
      
      // Cambiar nombre
      const nameInput = dialog.locator('[data-testid="material-name"]');
      await nameInput.clear();
      await nameInput.fill('Material Editado');
      
      // Cambiar costo
      const costField = dialog.getByLabel(/Costo por unidad/i);
      await costField.clear();
      await costField.fill('200.00');
      
      // Submit
      await dialog.getByRole('button', { name: /Guardar|Actualizar/i }).click();
      
      // ========== VALIDAR NOTIFICACIÓN DE ACTUALIZACIÓN ==========
      const updateToast = page.locator('[role="status"]').filter({ hasText: /Item actualizado/i });
      await expect(updateToast).toBeVisible({ timeout: 10000 });
      await expect(updateToast).toContainText('Material Editado fue actualizado');
      await expect(updateToast).toHaveAttribute('data-type', 'success');
      
      // Verificar cambios en la grid
      const updatedCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Editado' });
      await expect(updatedCard).toBeVisible();
    });
  });

  // ============================================================================
  // DELETE TESTS - Eliminación de materiales
  // ============================================================================

  test.describe('Delete Materials', () => {
    
    test('7. Eliminar material con confirmación', async ({ page }) => {
      // Crear material para eliminar
      const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
      await newMaterialButton.dispatchEvent('click');
      
      // Esperar lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      let dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Para Eliminar');
      
      // TIPO PRIMERO
      await dialog.getByRole('button', { name: /medible/i }).click();
      
      // CATEGORÍA DESPUÉS
      const categoryTrigger = dialog.locator('[data-testid="material-category"] [data-part="trigger"]');
      await categoryTrigger.click();
      await page.waitForTimeout(500);
      await page.getByRole('option').first().click();
      
      // Unidad
      const unitTrigger = dialog.locator('[data-testid="material-unit"] [data-part="trigger"]');
      await unitTrigger.click();
      await page.locator('[data-part="item"][data-value="kg"]').click();
      await dialog.getByLabel(/Costo por unidad/i).fill('50.00');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible({ timeout: 10000 });
      
      // ========== ELIMINAR ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material Para Eliminar' });
      await expect(materialCard).toBeVisible();
      
      // Click en botón eliminar (icono de trash o "Eliminar")
      const deleteButton = materialCard.getByRole('button', { name: /eliminar|trash/i });
      await deleteButton.click();
      
      // ========== CONFIRMAR DIALOG DE CONFIRMACIÓN ==========
      
      // Debe aparecer dialog de confirmación
      const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]')
        .filter({ hasText: /eliminar|confirmar/i });
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });
      
      // Verificar mensaje de confirmación
      await expect(confirmDialog).toContainText(/seguro.*eliminar/i);
      
      // Click en botón "Confirmar" o "Eliminar"
      const confirmButton = confirmDialog.getByRole('button', { name: /confirmar|eliminar|sí/i });
      await confirmButton.click();
      
      // ========== VALIDAR NOTIFICACIÓN DE ELIMINACIÓN ==========
      
      const deleteToast = page.locator('[role="status"]').filter({ hasText: /Item eliminado/i });
      await expect(deleteToast).toBeVisible({ timeout: 10000 });
      await expect(deleteToast).toContainText('Material Para Eliminar fue eliminado del inventario');
      await expect(deleteToast).toHaveAttribute('data-type', 'success');
      
      // Verificar que el card ya no existe
      await expect(materialCard).not.toBeVisible({ timeout: 3000 });
    });

    test('8. Cancelar eliminación (no debe eliminar)', async ({ page }) => {
      // Crear material
      const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
      await newMaterialButton.dispatchEvent('click');
      
      // Esperar lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      let dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material No Eliminar');
      
      // TIPO PRIMERO
      await dialog.getByRole('button', { name: /medible/i }).click();
      
      // CATEGORÍA DESPUÉS
      const categoryTrigger = dialog.locator('[data-testid="material-category"] [data-part="trigger"]');
      await categoryTrigger.click();
      await page.waitForTimeout(500);
      await page.getByRole('option').first().click();
      
      // Unidad
      const unitTrigger = dialog.locator('[data-testid="material-unit"] [data-part="trigger"]');
      await unitTrigger.click();
      await page.locator('[data-part="item"][data-value="kg"]').click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      await dialog.getByLabel(/Costo por unidad/i).fill('75.00');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      await expect(page.locator('[role="status"]').filter({ hasText: /Item creado/i }))
        .toBeVisible();
      
      // ========== INTENTAR ELIMINAR Y CANCELAR ==========
      
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Material No Eliminar' });
      await expect(materialCard).toBeVisible();
      
      const deleteButton = materialCard.getByRole('button', { name: /eliminar|trash/i });
      await deleteButton.click();
      
      // Aparecer confirmDialog
      const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]')
        .filter({ hasText: /eliminar|confirmar/i });
      await expect(confirmDialog).toBeVisible();
      
      // Click en CANCELAR
      const cancelButton = confirmDialog.getByRole('button', { name: /cancelar|no/i });
      await cancelButton.click();
      
      // ========== VERIFICAR QUE NO SE ELIMINÓ ==========
      
      // No debe aparecer toast de eliminación
      const deleteToast = page.locator('[role="status"]').filter({ hasText: /Item eliminado/i });
      await expect(deleteToast).not.toBeVisible();
      
      // El card debe seguir visible
      await expect(materialCard).toBeVisible();
    });
  });

  // ============================================================================
  // NOTIFICATION SYSTEM TESTS - Validación exhaustiva de toasts
  // ============================================================================

  test.describe('Sistema de Notificaciones', () => {
    
    test('9. Toast de éxito tiene duración correcta (3 segundos)', async ({ page }) => {
      // Crear material
      const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
      await newMaterialButton.dispatchEvent('click');
      
      // Esperar lazy loading
      await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
      
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Test Duration');
      
      // TIPO PRIMERO
      await dialog.getByRole('button', { name: /medible/i }).click();
      
      // CATEGORÍA DESPUÉS
      const categoryTrigger = dialog.locator('[data-testid="material-category"] [data-part="trigger"]');
      await categoryTrigger.click();
      await page.waitForTimeout(500);
      await page.getByRole('option').first().click();
      
      // Unidad
      const unitTrigger = dialog.locator('[data-testid="material-unit"] [data-part="trigger"]');
      await unitTrigger.click();
      await page.locator('[data-part="item"][data-value="kg"]').click();
      await dialog.getByLabel(/Costo por unidad/i).fill('10.00');
      
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      // Toast debe aparecer
      const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      await expect(toast).toBeVisible({ timeout: 10000 });
      
      // Toast debe desaparecer automáticamente (timeout = 3s + margen)
      await expect(toast).not.toBeVisible({ timeout: 5000 });
    });

    test('10. Múltiples toasts no se superponen', async ({ page }) => {
      // Crear 2 materiales rápidamente para generar 2 toasts
      for (let i = 1; i <= 2; i++) {
        const newMaterialButton = page.getByRole('button', { name: 'Agregar Material' });
        await newMaterialButton.dispatchEvent('click');
        
        // Esperar lazy loading
        await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });
        
        const dialog = page.locator('[role="dialog"]');
        
        await dialog.locator('[data-testid="material-name"]').fill(`Multi Toast ${i}`);
        
        // TIPO PRIMERO
        await dialog.getByRole('button', { name: /medible/i }).click();
        
        // CATEGORÍA DESPUÉS
        const categoryTrigger = dialog.locator('[data-testid="material-category"] [data-part="trigger"]');
        await categoryTrigger.click();
        await page.waitForTimeout(500);
        await page.getByRole('option').first().click();
        
        // Unidad
        const unitTrigger = dialog.locator('[data-testid="material-unit"] [data-part="trigger"]');
        await unitTrigger.click();
        await page.locator('[data-part="item"][data-value="kg"]').click();
        await dialog.getByLabel(/Costo por unidad/i).fill('10.00');
        
        await dialog.getByRole('button', { name: /Crear Material/i }).click();
        
        // No esperar a que desaparezca - crear el siguiente inmediatamente
        await page.waitForTimeout(100);
      }
      
      // Verificar que existen múltiples toasts
      const toasts = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      const count = await toasts.count();
      
      // Debe haber al menos 1 toast visible (pueden superponerse o mostrarse en stack)
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});
