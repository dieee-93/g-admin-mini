/**
 * Materials Diagnostic Test - Para identificar problemas
 */

import { test, expect } from '@playwright/test';

test.describe('Materials Diagnostic', () => {
  test('1. Verificar que materials page carga', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    await page.waitForLoadState('networkidle');
    
    console.log('URL actual:', page.url());
    
    // Verificar materials page
    const materialsPage = page.locator('[data-testid="materials-page"]');
    const isVisible = await materialsPage.isVisible().catch(() => false);
    console.log('Materials page visible:', isVisible);
    
    if (isVisible) {
      console.log('✅ Materials page encontrada');
    } else {
      console.log('❌ Materials page NO encontrada');
      // Tomar screenshot
      await page.screenshot({ path: 'test-screenshots/diagnostic-page.png', fullPage: true });
    }
  });

  test('2. Verificar botón nuevo material', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    await page.waitForLoadState('networkidle');
    
    const button = page.locator('[data-testid="new-material-button"]');
    const exists = await button.count();
    console.log('Botones "new-material-button" encontrados:', exists);
    
    if (exists > 0) {
      console.log('✅ Botón encontrado');
      const text = await button.first().textContent();
      console.log('Texto del botón:', text);
    } else {
      console.log('❌ Botón NO encontrado');
      // Buscar botones alternativos
      const allButtons = await page.locator('button').all();
      console.log('Total de botones en página:', allButtons.length);
      
      for (let i = 0; i < Math.min(5, allButtons.length); i++) {
        const text = await allButtons[i].textContent();
        console.log(`  Botón ${i + 1}:`, text);
      }
    }
  });

  test('3. Click en botón y verificar modal', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    await page.waitForLoadState('networkidle');
    
    // Buscar cualquier botón que pueda abrir el modal
    const possibleButtons = [
      '[data-testid="new-material-button"]',
      'button:has-text("Nuevo Material")',
      'button:has-text("Nuevo")',
      'button:has-text("Agregar")',
      'button:has-text("+")'
    ];
    
    let buttonClicked = false;
    for (const selector of possibleButtons) {
      const button = page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        console.log('✅ Encontrado botón con selector:', selector);
        await button.click();
        buttonClicked = true;
        break;
      }
    }
    
    if (!buttonClicked) {
      console.log('❌ No se encontró ningún botón para abrir modal');
      await page.screenshot({ path: 'test-screenshots/diagnostic-no-button.png', fullPage: true });
      return;
    }
    
    // Esperar modal
    await page.waitForTimeout(1000);
    
    const dialog = page.locator('[role="dialog"]');
    const dialogVisible = await dialog.isVisible().catch(() => false);
    console.log('Modal visible:', dialogVisible);
    
    if (dialogVisible) {
      console.log('✅ Modal se abrió');
      
      // Verificar campos del formulario
      const nameField = page.locator('[data-testid="material-name"]');
      const categoryField = page.locator('[data-testid="material-category"]');
      
      console.log('Campo nombre existe:', await nameField.count());
      console.log('Campo categoría existe:', await categoryField.count());
      
      await page.screenshot({ path: 'test-screenshots/diagnostic-modal.png', fullPage: true });
    } else {
      console.log('❌ Modal NO se abrió');
      await page.screenshot({ path: 'test-screenshots/diagnostic-no-modal.png', fullPage: true });
    }
  });
});
