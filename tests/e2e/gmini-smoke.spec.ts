/**
 * G-MINI SMOKE TEST
 * 
 * Test básico que verifica que la app carga correctamente.
 * Requiere: pnpm dev corriendo en localhost:5173
 */

import { test, expect } from '@playwright/test';

test.describe('G-Mini - Smoke Tests', () => {
  test('debería cargar la aplicación', async ({ page }) => {
    // Ir a la app
    await page.goto('http://localhost:5173');

    // Esperar que cargue (cualquier contenido)
    await page.waitForLoadState('domcontentloaded');

    // Verificar que NO hay error fatal
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Cannot GET');
    expect(bodyText).not.toContain('404');

    console.log('✅ App cargó exitosamente');
  });

  test('debería tener un título', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Verificar que tiene título (no es página en blanco)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    console.log(`✅ Título de la app: "${title}"`);
  });

  test('debería mostrar algún contenido visible', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');

    // Verificar que hay al menos un heading, button o link visible
    const headings = page.locator('h1, h2, h3, h4');
    const buttons = page.locator('button');
    const links = page.locator('a');

    const headingCount = await headings.count();
    const buttonCount = await buttons.count();
    const linkCount = await links.count();

    console.log(`📊 Elementos encontrados:`);
    console.log(`   Headings: ${headingCount}`);
    console.log(`   Buttons: ${buttonCount}`);
    console.log(`   Links: ${linkCount}`);

    // Debe haber al menos algo visible
    const totalElements = headingCount + buttonCount + linkCount;
    expect(totalElements).toBeGreaterThan(0);

    console.log('✅ App tiene contenido visible');
  });

  test('debería poder tomar screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');

    // Tomar screenshot
    await page.screenshot({
      path: 'test-screenshots/gmini-home.png',
      fullPage: true
    });

    console.log('✅ Screenshot guardado en test-screenshots/gmini-home.png');
  });
});
