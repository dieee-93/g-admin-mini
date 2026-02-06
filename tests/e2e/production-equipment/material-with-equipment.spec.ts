/**
 * Material with Production Equipment Integration Tests
 * 
 * Tests the full flow of creating an ELABORATED material with production equipment configuration.
 * This verifies the integration between MaterialFormDialog and ProductionConfigSection.
 * 
 * @see src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ProductionConfigSection.tsx
 * @see src/shared/components/EquipmentSelector.tsx
 */

import { test, expect } from '@playwright/test';

test.describe('Material with Production Equipment - Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Capture console logs for debugging
        page.on('console', msg => {
            const text = msg.text();
            if (
                text.includes('ProductionConfigSection') ||
                text.includes('EquipmentSelector') ||
                text.includes('[MaterialFormDialog]')
            ) {
                console.log(`[BROWSER] ${msg.type()}: ${text}`);
            }
        });

        // Disable React Scan for testing
        await page.addInitScript(() => {
            localStorage.setItem('playwright-test', 'true');
        });

        await page.goto('/admin/supply-chain/materials', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
    });

    test('should add equipment to production config in ELABORATED material', async ({ page }) => {
        // ========== Setup ==========
        const testId = Date.now();
        const materialName = `Pizza Equipment Test-${testId}`;

        console.log(`🧪 Creating ELABORATED material: ${materialName}`);

        // ========== Open modal ==========
        await page.getByTestId('materials-toolbar-new-button').click();

        // Wait for lazy loading
        await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });

        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();

        // ========== Fill basic info ==========
        await dialog.getByTestId('material-name-input').fill(materialName);

        // ========== Select type: ELABORATED ==========
        await dialog.getByTestId('material-type-select').locator('[data-part="trigger"]').click();
        await page.waitForTimeout(300);
        await page.getByRole('option', { name: /Elaborado/i }).click();

        // ========== Verify ELABORATED-specific UI appears ==========
        await expect(dialog.getByTestId('elaborated-header')).toBeVisible();

        // ========== Select category ==========
        await dialog.getByTestId('material-category-select').locator('[data-part="trigger"]').click();
        await page.waitForTimeout(500);
        await page.getByRole('option').first().click();

        // ========== Add ingredient to recipe (required for production config to show) ==========
        const inputsSection = dialog.getByTestId('recipe-inputs-section');
        await inputsSection.getByTestId('recipe-add-input-button').click();
        await page.waitForTimeout(200);

        const searchInput = inputsSection.getByPlaceholder('Buscar materia prima...');
        await expect(searchInput).toBeVisible();

        // The working pattern: click, clear, then fill
        await searchInput.click();
        await searchInput.clear();
        await searchInput.fill('Harina');
        await page.waitForTimeout(1000);

        // Select first option with fallback
        try {
            const option = page.getByRole('option', { name: 'Harina', exact: true }).first();
            if (await option.isVisible({ timeout: 2000 })) {
                await option.click();
            } else {
                // Fallback: try finding text in dialogs
                const textOption = page.getByRole('dialog').last().getByText('Harina', { exact: true });
                await textOption.click();
            }
        } catch (e) {
            console.log('Using keyboard navigation for ingredient selection');
            await searchInput.press('ArrowDown');
            await searchInput.press('Enter');
        }

        // Wait for selection
        await page.waitForTimeout(500);

        // Wait for selection to apply (popover closes, value updates)
        await page.waitForTimeout(500);

        // Fill quantity
        const quantityInput = inputsSection.getByRole('spinbutton', { name: 'Cantidad' });
        await expect(quantityInput).toBeVisible();
        await quantityInput.fill('2.5');

        // Confirm ingredient
        const confirmBtn = inputsSection.getByLabel('Confirmar');
        await confirmBtn.click();

        // Wait for confirmation to process
        await page.waitForTimeout(500);

        // ========== Save recipe ==========
        const outputQuantity = dialog.getByTestId('recipe-output-quantity');
        await outputQuantity.fill('10');

        const saveButton = dialog.getByTestId('recipe-save-button');
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // Wait for recipe success toast
        await expect(page.getByText('Receta creada exitosamente')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000);

        console.log('✅ Recipe created, now configuring production equipment');

        // ========== PRODUCTION CONFIG SECTION SHOULD NOW BE VISIBLE ==========
        const productionConfigSection = dialog.getByText(/Configuración de Producción/i);
        await expect(productionConfigSection).toBeVisible({ timeout: 5000 });

        // ========== Click "Agregar Equipo" button ==========
        const addEquipmentButton = dialog.getByRole('button', { name: /Agregar Equipo/i });
        await expect(addEquipmentButton).toBeVisible();
        await addEquipmentButton.click();

        console.log('🔧 Opening Equipment Selector modal');

        // ========== Equipment Selector Modal should open ==========
        const equipmentModal = page.locator('[role="dialog"]').filter({ hasText: 'Agregar Equipamiento' });
        await expect(equipmentModal).toBeVisible({ timeout: 5000 });

        // ========== Search for equipment ==========
        const searchEquipment = equipmentModal.getByPlaceholder(/Buscar por nombre/i);
        await searchEquipment.fill('Horno');
        await page.waitForTimeout(500);

        // ========== Select first equipment ==========
        const firstEquipment = equipmentModal.locator('div').filter({ hasText: 'Horno' }).first();
        await firstEquipment.click();
        await page.waitForTimeout(300);

        // ========== Fill hours ==========
        const hoursInput = equipmentModal.getByLabel(/Horas requeridas/i);
        await expect(hoursInput).toBeVisible();
        await hoursInput.fill('0.25');

        // ========== Verify cost preview appears ==========
        const costPreview = equipmentModal.getByText(/Costo Calculado/i);
        await expect(costPreview).toBeVisible({ timeout: 3000 });

        // ========== Click "Agregar Equipamiento" to submit ==========
        const submitEquipmentButton = equipmentModal.getByRole('button', { name: /Agregar Equipamiento/i });
        await expect(submitEquipmentButton).toBeEnabled();
        await submitEquipmentButton.click();

        console.log('✅ Equipment added to production config');

        // ========== Verify equipment appears in the list ==========
        await page.waitForTimeout(500);
        const equipmentList = dialog.getByText(/Horno/i);
        await expect(equipmentList).toBeVisible();

        // Verify equipment shows hours and cost
        const equipmentCost = dialog.getByText(/0\.25h × \$/i);
        await expect(equipmentCost).toBeVisible();

        // ========== Verify "Total Equipamiento" appears ==========
        const totalEquipment = dialog.getByText(/Total Equipamiento/i);
        await expect(totalEquipment).toBeVisible();

        console.log('✅ Equipment configuration verified in production config');

        // ========== Submit Material ==========
        const submitMaterialBtn = dialog.getByTestId('submit-material');
        await expect(submitMaterialBtn).toBeEnabled();
        await submitMaterialBtn.click();

        // ========== Confirm Event Sourcing ==========
        await page.waitForTimeout(1000);
        const confirmationDialog = page.locator('[role="dialog"]').filter({
            hasText: 'Confirmar Creación con Event Sourcing'
        });

        if (await confirmationDialog.isVisible({ timeout: 2000 })) {
            const confirmButton = confirmationDialog.getByRole('button', {
                name: 'Confirmar y Guardar →'
            });
            await confirmButton.click();
        }

        // ========== Verify success ==========
        try {
            const toast = page.locator('[role="status"]').filter({ hasText: /Item creado/i });
            await expect(toast).toBeVisible({ timeout: 10000 });
        } catch (e) {
            console.log('⚠️ Toast not detected, verifying table data...');
        }

        // Verify material appears in the table
        await page.waitForTimeout(2000);
        await page.getByPlaceholder('Buscar...').fill(materialName);
        await page.waitForTimeout(1000);
        const materialRow = page.getByText(materialName);
        await expect(materialRow).toBeVisible({ timeout: 10000 });

        console.log('✅ Material with production equipment created successfully');
    });

    test('should configure labor and packaging costs', async ({ page }) => {
        const testId = Date.now();
        const materialName = `Labor Config Test-${testId}`;

        console.log(`🧪 Testing labor and packaging costs: ${materialName}`);

        // ========== Create ELABORATED material with recipe (reusing pattern) ==========
        await page.getByTestId('materials-toolbar-new-button').click();
        await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });

        const dialog = page.locator('[role="dialog"]');
        await dialog.getByTestId('material-name-input').fill(materialName);

        // Select ELABORATED type
        await dialog.getByTestId('material-type-select').locator('[data-part="trigger"]').click();
        await page.waitForTimeout(300);
        await page.getByRole('option', { name: /Elaborado/i }).click();

        // Select category
        await dialog.getByTestId('material-category-select').locator('[data-part="trigger"]').click();
        await page.waitForTimeout(500);
        await page.getByRole('option').first().click();

        // Add ingredient
        const inputsSection = dialog.getByTestId('recipe-inputs-section');
        await inputsSection.getByTestId('recipe-add-input-button').click();
        await page.waitForTimeout(200);

        const searchInput = inputsSection.getByPlaceholder('Buscar materia prima...');
        await expect(searchInput).toBeVisible();

        await searchInput.click();
        await searchInput.clear();
        await searchInput.fill('Harina');
        await page.waitForTimeout(1000);

        try {
            const option = page.getByRole('option', { name: 'Harina', exact: true }).first();
            if (await option.isVisible({ timeout: 2000 })) {
                await option.click();
            } else {
                await searchInput.press('ArrowDown');
                await searchInput.press('Enter');
            }
        } catch (e) {
            await searchInput.press('ArrowDown');
            await searchInput.press('Enter');
        }

        await page.waitForTimeout(500);
        await page.waitForTimeout(500);

        const quantityInput = inputsSection.getByRole('spinbutton', { name: 'Cantidad' });
        await expect(quantityInput).toBeVisible();
        await quantityInput.fill('1.0');

        const confirmBtn = inputsSection.getByLabel('Confirmar');
        await confirmBtn.click();
        await page.waitForTimeout(500);

        // Save recipe
        const outputQuantity = dialog.getByTestId('recipe-output-quantity');
        await outputQuantity.fill('5');
        const saveButton = dialog.getByTestId('recipe-save-button');
        await saveButton.click();
        await expect(page.getByText('Receta creada exitosamente')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000);

        // ========== Configure Labor ==========
        const laborHoursInput = dialog.getByLabel(/Horas de trabajo/i);
        await expect(laborHoursInput).toBeVisible();
        await laborHoursInput.fill('0.5');

        const laborCostInput = dialog.getByLabel(/Costo por hora/i);
        await laborCostInput.fill('15.00');

        // Verify total labor cost appears
        await page.waitForTimeout(500);
        const totalLabor = dialog.getByText(/Total Mano de Obra/i);
        await expect(totalLabor).toBeVisible();

        // Verify calculation: 0.5h × $15 = $7.50
        const laborTotal = dialog.getByText(/\$7\.50/i);
        await expect(laborTotal).toBeVisible();

        console.log('✅ Labor costs configured correctly');

        // ========== Configure Packaging ==========
        const packagingInput = dialog.getByLabel(/Costo de empaquetado/i);
        await packagingInput.fill('2.50');

        console.log('✅ Packaging cost configured');

        // ========== Verify Cost Summary ==========
        const costSummary = dialog.getByText(/Resumen de Costos Directos/i);
        await expect(costSummary).toBeVisible();

        // ========== Submit Material ==========
        const submitMaterialBtn = dialog.getByTestId('submit-material');
        await submitMaterialBtn.click();

        await page.waitForTimeout(1000);
        const confirmationDialog = page.locator('[role="dialog"]').filter({
            hasText: 'Confirmar Creación con Event Sourcing'
        });

        if (await confirmationDialog.isVisible({ timeout: 2000 })) {
            const confirmButton = confirmationDialog.getByRole('button', {
                name: 'Confirmar y Guardar →'
            });
            await confirmButton.click();
        }

        // Verify success
        await page.waitForTimeout(2000);
        await page.getByPlaceholder('Buscar...').fill(materialName);
        await page.waitForTimeout(1000);
        const materialRow = page.getByText(materialName);
        await expect(materialRow).toBeVisible({ timeout: 10000 });

        console.log('✅ Material with labor and packaging costs created successfully');
    });

    test('should only show production config for ELABORATED materials with recipe', async ({ page }) => {
        console.log('🧪 Testing production config visibility rules');

        // ========== Test 1: MEASURABLE should NOT show production config ==========
        await page.getByTestId('materials-toolbar-new-button').click();
        await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });

        let dialog = page.locator('[role="dialog"]');
        await dialog.getByTestId('material-name-input').fill('Test Measurable');

        // Select MEASURABLE
        await dialog.getByTestId('material-type-select').locator('[data-part="trigger"]').click();
        await page.waitForTimeout(300);
        await page.getByRole('option', { name: /Conmensurable/i }).click();

        // Production config should NOT be visible
        const productionConfig1 = dialog.getByText(/Configuración de Producción/i);
        await expect(productionConfig1).not.toBeVisible();

        console.log('✅ Production config correctly hidden for MEASURABLE');

        // Close dialog
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // ========== Test 2: ELABORATED without recipe should show message ==========
        await page.getByTestId('materials-toolbar-new-button').click();
        await expect(page.getByText('Cargando formulario...')).toBeVisible({ timeout: 5000 });
        await expect(page.getByText('Cargando formulario...')).toBeHidden({ timeout: 30000 });

        dialog = page.locator('[role="dialog"]');
        await dialog.getByTestId('material-name-input').fill('Test Elaborated No Recipe');

        // Select ELABORATED
        await dialog.getByTestId('material-type-select').locator('[data-part="trigger"]').click();
        await page.waitForTimeout(300);
        await page.getByRole('option', { name: /Elaborado/i }).click();

        await dialog.getByTestId('material-category-select').locator('[data-part="trigger"]').click();
        await page.waitForTimeout(500);
        await page.getByRole('option').first().click();

        // Should show message about needing recipe
        const needsRecipeMessage = dialog.getByText(/Primero selecciona o crea una receta/i);
        await expect(needsRecipeMessage).toBeVisible();

        console.log('✅ Production config correctly shows recipe requirement message');
    });
});
