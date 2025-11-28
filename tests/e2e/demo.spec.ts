/**
 * PLAYWRIGHT DEMO - Test Simple
 * 
 * Este test demuestra las capacidades básicas de Playwright.
 * NO requiere que la app esté corriendo porque usa un sitio público.
 */

import { test, expect } from '@playwright/test';

test.describe('Playwright Demo - Básico', () => {
  test('puede navegar y verificar título de página', async ({ page }) => {
    // 1. Ir a una página pública
    await page.goto('https://playwright.dev');
    
    // 2. Verificar título
    await expect(page).toHaveTitle(/Playwright/);
    
    // 3. Verificar que hay un heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    console.log('✅ Test completado exitosamente!');
  });

  test('puede hacer click y navegar', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Click en "Get Started"
    await page.getByRole('link', { name: /get started/i }).first().click();
    
    // Verificar que navegó
    await expect(page).toHaveURL(/docs/);
    
    console.log('✅ Navegación funciona!');
  });

  test('puede llenar formulario de búsqueda', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Abrir búsqueda (si existe)
    const searchButton = page.getByRole('button', { name: /search/i }).first();
    
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // Escribir en search
      const searchInput = page.getByPlaceholder(/search/i).first();
      await searchInput.fill('testing');
      
      console.log('✅ Formulario funciona!');
    }
  });
});

// ============================================
// TEST PARA G-MINI (requiere app corriendo)
// ============================================

test.describe.skip('G-Mini Tests - Requiere localhost:5173', () => {
  test('debería cargar el login page', async ({ page }) => {
    // Este test está skip porque requiere que corras: pnpm dev
    await page.goto('http://localhost:5173');
    
    // Verificar que cargó
    await expect(page).toHaveURL(/localhost/);
    
    console.log('✅ App cargó correctamente!');
  });
});
