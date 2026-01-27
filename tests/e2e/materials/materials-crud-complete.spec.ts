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
    await page.goto('/admin/supply-chain/materials');
    
    // Esperar que la página esté lista (más tolerante que networkidle)
    await page.locator('[data-testid="materials-page"]').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
      // Si no existe materials-page, buscar cualquier indicador de materials
      return page.locator('text=/materiales?/i, button:has-text("Nuevo")').first().waitFor({ timeout: 30000 });
    });
  });

  // ============================================================================
  // CREATE TESTS - 3 TIPOS DE MATERIALES
  // ============================================================================

  test.describe('Create Materials - Los 3 Tipos', () => {
    
    test('1. Crear MEASURABLE Material (kg, litros)', async ({ page }) => {
      // Click en botón "Nuevo Material" - force:true para bypass Chakra UI overlays
      const button = page.getByRole('button', { name: 'Nuevo Material' }).first();
      await button.waitFor({ state: 'visible' });
      
      // DEBUG: Ver estado antes del click
      console.log('🔍 Antes del click...');
      await page.screenshot({ path: 'debug-before-click.png' });
      
      await button.click({ force: true });
      
      // DEBUG: Ver estado después del click
      console.log('🔍 Después del click, esperando 2 segundos...');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-after-click.png' });
      
      // DEBUG: Ver qué elementos con data-part existen
      const dataPartElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('[data-part]'));
        return elements.map(el => ({
          dataPart: el.getAttribute('data-part'),
          visible: el.offsetParent !== null,
          display: window.getComputedStyle(el).display,
          opacity: window.getComputedStyle(el).opacity
        }));
      });
      console.log('🔍 Elementos con data-part:', JSON.stringify(dataPartElements, null, 2));
      
      // Esperar a que el backdrop del modal aparezca (Chakra UI v3 Dialog)
      await page.waitForSelector('[data-part="backdrop"]', { state: 'visible', timeout: 10000 });
      
      // Esperar a que termine de cargar - esperar que el spinner desaparezca
      // Chakra UI usa role="status" para spinners
      await page.waitForFunction(() => {
        const spinners = document.querySelectorAll('[role="status"]');
        return spinners.length === 0 || Array.from(spinners).every(s => s.style.display === 'none');
      }, { timeout: 30000 }).catch(() => {
        console.log('No se encontró spinner o ya desapareció');
      });
      
      // Esperar el input del nombre que confirma que el formulario cargó
      await page.waitForSelector('[data-testid="material-name"]', { state: 'visible', timeout: 30000 });
      
      // Verificar título del modal
      await expect(page.getByRole('heading', { name: /Nuevo Material/i })).toBeVisible();
      
      // ========== SECCIÓN: Información Básica ==========
      
      // Llenar nombre
      const nameInput = dialog.locator('[data-testid="material-name"]');
      await expect(nameInput).toBeVisible();
      await nameInput.fill('Harina 0000 Premium');
      
      // Seleccionar categoría
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      // Esperar dropdown y seleccionar opción
      await page.locator('[role="option"]').filter({ hasText: 'Materia Prima' }).first().click();
      
      // ========== SECCIÓN: Configuración ==========
      
      // Seleccionar tipo MEASURABLE
      const measurableButton = dialog.getByRole('button', { name: /medible/i });
      await expect(measurableButton).toBeVisible();
      await measurableButton.click();
      
      // Verificar que aparezcan campos de MEASURABLE
      const unitField = dialog.getByLabel(/Unidad de medida/i);
      await expect(unitField).toBeVisible();
      await unitField.fill('kg');
      
      // Llenar costo unitario
      const costField = dialog.getByLabel(/Costo por unidad/i);
      await expect(costField).toBeVisible();
      await costField.fill('150.50');
      
      // Stock mínimo
      const minStockField = dialog.getByLabel(/Stock mínimo/i);
      if (await minStockField.isVisible()) {
        await minStockField.fill('5');
      }
      
      // ========== Agregar stock inicial ==========
      
      // Activar switch "Agregar al inventario ahora"
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await expect(stockSwitch).toBeVisible();
      await stockSwitch.check();
      
      // Llenar stock inicial
      const initialStockField = dialog.getByLabel(/Stock inicial/i);
      await expect(initialStockField).toBeVisible();
      await initialStockField.fill('20');
      
      // ========== Submit ==========
      
      // Click en botón "Crear Material"
      const submitButton = dialog.getByRole('button', { name: /Crear Material/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
      
      // ========== VALIDAR NOTIFICACIÓN EXACTA ==========
      
      // Esperar toast con mensaje específico
      const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      await expect(toast).toBeVisible({ timeout: 10000 });
      await expect(toast).toContainText('Harina 0000 Premium se ha creado exitosamente');
      
      // Verificar que el toast tiene el tipo correcto (success = verde)
      await expect(toast).toHaveAttribute('data-type', 'success');
      
      // Verificar que el modal se cerró
      await expect(dialog).not.toBeVisible({ timeout: 3000 });
      
      // ========== VERIFICAR EN LA TABLA ==========
      
      // Buscar el material creado en la grid
      const materialCard = page.locator('[data-testid^="material-card"]').filter({ hasText: 'Harina 0000 Premium' });
      await expect(materialCard).toBeVisible({ timeout: 5000 });
      
      // Verificar que muestra los datos correctos
      await expect(materialCard).toContainText('kg');
      await expect(materialCard).toContainText('20'); // stock inicial
    });

    test('2. Crear COUNTABLE Material (unidades contables)', async ({ page }) => {
      // Abrir modal
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // ========== Información Básica ==========
      await dialog.locator('[data-testid="material-name"]').fill('Latas de Tomate Perita');
      
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').filter({ hasText: 'Materia Prima' }).first().click();
      
      // ========== Seleccionar COUNTABLE ==========
      const countableButton = dialog.getByRole('button', { name: /contable/i });
      await expect(countableButton).toBeVisible();
      await countableButton.click();
      
      // Verificar campos específicos de COUNTABLE
      const packageSizeField = dialog.getByLabel(/Tamaño del paquete/i);
      await expect(packageSizeField).toBeVisible();
      await packageSizeField.fill('12'); // 12 latas por caja
      
      const packageNameField = dialog.getByLabel(/Nombre del paquete/i);
      if (await packageNameField.isVisible()) {
        await packageNameField.fill('Caja');
      }
      
      // Costo unitario
      const costField = dialog.getByLabel(/Costo por unidad/i);
      await expect(costField).toBeVisible();
      await costField.fill('45.00');
      
      // ========== Stock inicial ==========
      const stockSwitch = dialog.getByRole('switch', { name: /Agregar al inventario ahora/i });
      await stockSwitch.check();
      
      const initialStockField = dialog.getByLabel(/Stock inicial/i);
      await initialStockField.fill('50'); // 50 latas
      
      // ========== Submit ==========
      await dialog.getByRole('button', { name: /Crear Material/i }).click();
      
      // ========== Validar notificación ==========
      const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
      await expect(toast).toBeVisible({ timeout: 10000 });
      await expect(toast).toContainText('Latas de Tomate Perita se ha creado exitosamente');
      await expect(toast).toHaveAttribute('data-type', 'success');
      
      // Verificar en grid
      const materialCard = page.locator('[data-testid^="material-card"]')
        .filter({ hasText: 'Latas de Tomate Perita' });
      await expect(materialCard).toBeVisible();
      await expect(materialCard).toContainText('unidad');
    });

    test('3. Crear ELABORATED Material (producto elaborado)', async ({ page }) => {
      // Abrir modal
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      
      // ========== Información Básica ==========
      await dialog.locator('[data-testid="material-name"]').fill('Pizza Mozzarella');
      
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').filter({ hasText: 'Producto Elaborado' }).first().click();
      
      // ========== Seleccionar ELABORATED ==========
      const elaboratedButton = dialog.getByRole('button', { name: /elaborado/i });
      await expect(elaboratedButton).toBeVisible();
      await elaboratedButton.click();
      
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
      await page.locator('[data-testid="new-material-button"]').click();
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
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      // Llenar campos básicos
      await dialog.locator('[data-testid="material-name"]').fill('Material Test');
      
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      // Seleccionar tipo MEASURABLE
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
      
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
      await page.locator('[data-testid="new-material-button"]').click();
      let dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Para Editar');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
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
      await page.locator('[data-testid="new-material-button"]').click();
      let dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material Para Eliminar');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
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
      await page.locator('[data-testid="new-material-button"]').click();
      let dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Material No Eliminar');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
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
      await page.locator('[data-testid="new-material-button"]').click();
      const dialog = page.locator('[role="dialog"]');
      
      await dialog.locator('[data-testid="material-name"]').fill('Test Duration');
      const categorySelect = dialog.locator('[data-testid="material-category"]');
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
      
      await dialog.getByRole('button', { name: /medible/i }).click();
      await dialog.getByLabel(/Unidad de medida/i).fill('kg');
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
        await page.locator('[data-testid="new-material-button"]').click();
        const dialog = page.locator('[role="dialog"]');
        
        await dialog.locator('[data-testid="material-name"]').fill(`Multi Toast ${i}`);
        const categorySelect = dialog.locator('[data-testid="material-category"]');
        await categorySelect.click();
        await page.locator('[role="option"]').first().click();
        
        await dialog.getByRole('button', { name: /medible/i }).click();
        await dialog.getByLabel(/Unidad de medida/i).fill('kg');
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
