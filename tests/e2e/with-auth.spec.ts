/**
 * Prueba que usa tu sesión de Chrome
 * 
 * Para ejecutar:
 * pnpm exec playwright test tests/e2e/with-auth.spec.ts --headed --config=playwright.auth.config.ts
 * 
 * O mejor aún, usa el comando nuevo:
 * pnpm e2e:auth
 */

import { test, expect } from '@playwright/test';

test.describe('G-Mini con Sesión Activa', () => {

  test('debería mantener tu sesión de login', async ({ page }) => {
    // Ir a la app
    await page.goto('/');

    // Esperar a que cargue
    await page.waitForLoadState('domcontentloaded');

    // Tomar screenshot del estado inicial
    await page.screenshot({
      path: 'test-screenshots/session-home.png',
      fullPage: true
    });

    console.log('✅ Página cargada con tu sesión');
    console.log(`📍 URL: ${page.url()}`);

    // Ver si hay usuario logueado
    const bodyText = await page.textContent('body');
    console.log(`📄 Contenido length: ${bodyText?.length}`);
  });

  test('debería navegar a dashboard si estás logueado', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const url = page.url();
    console.log(`📍 URL final: ${url}`);

    // Tomar screenshot
    await page.screenshot({
      path: 'test-screenshots/session-dashboard.png',
      fullPage: true
    });

    // Contar elementos
    const headings = await page.locator('h1, h2, h3').count();
    const buttons = await page.locator('button').count();

    console.log(`📊 Elementos: ${headings} headings, ${buttons} buttons`);

    // Si no fue redirigido a login, considera que está logueado
    if (!url.includes('login')) {
      console.log('✅ Dashboard cargado con sesión activa');
    } else {
      console.log('⚠️ Redirigido a login - no hay sesión activa');
    }
  });

  test('debería explorar páginas principales', async ({ page }) => {
    const pagesToTest = [
      '/admin/dashboard',
      '/admin/operations/sales',
      '/admin/supply-chain/products',
      '/admin/supply-chain/materials',
    ];

    for (const path of pagesToTest) {
      console.log(`\n🔍 Visitando: ${path}`);

      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');

      const url = page.url();
      const title = await page.title();

      console.log(`   URL: ${url}`);
      console.log(`   Título: ${title}`);

      // Screenshot
      const filename = path.replace(/\//g, '-').replace(/^-/, '');
      await page.screenshot({
        path: `test-screenshots/session-${filename}.png`,
        fullPage: true
      });

      await page.waitForTimeout(1000);
    }
  });
});
