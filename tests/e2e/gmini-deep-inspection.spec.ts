/**
 * G-MINI DEEP INSPECTION TEST
 * 
 * Test que espera carga completa y analiza qué se muestra.
 */

import { test, expect } from '@playwright/test';

test.describe('G-Mini - Deep Inspection', () => {
  test('debería esperar carga completa y analizar', async ({ page }) => {
    console.log('🚀 Navegando a http://localhost:5173...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('✅ Página cargada');

    // Esperar 5 segundos adicionales para JavaScript
    console.log('⏳ Esperando JavaScript...');
    await page.waitForTimeout(5000);

    // URL final
    const finalUrl = page.url();
    console.log(`📍 URL final: ${finalUrl}`);

    // Contenido del body
    const bodyText = await page.textContent('body');
    console.log(`📄 Contenido body: "${bodyText}"`);

    // HTML completo (primeros 500 chars)
    const html = await page.content();
    console.log(`🔧 HTML (primeros 500 chars):`);
    console.log(html.substring(0, 500));

    // Screenshots en diferentes momentos
    await page.screenshot({ path: 'test-screenshots/gmini-after-5sec.png' });
    console.log('📸 Screenshot guardado: gmini-after-5sec.png');

    // Buscar cualquier elemento visible
    const visibleElements = page.locator('*:visible');
    const visibleCount = await visibleElements.count();
    console.log(`👁️  Elementos visibles: ${visibleCount}`);

    // Buscar divs con contenido
    const divsWithContent = page.locator('div').filter({ hasText: /.+/ });
    const divCount = await divsWithContent.count();
    console.log(`📦 Divs con contenido: ${divCount}`);

    // Buscar root de React
    const rootDiv = page.locator('#root, #app, [data-reactroot]');
    const hasRoot = await rootDiv.count() > 0;
    console.log(`⚛️  ¿Tiene React root?: ${hasRoot}`);

    if (hasRoot) {
      const rootContent = await rootDiv.first().textContent();
      console.log(`   Root content: "${rootContent?.substring(0, 100)}"`);
    }

    // Buscar scripts
    const scripts = page.locator('script');
    const scriptCount = await scripts.count();
    console.log(`📜 Scripts: ${scriptCount}`);

    // Verificar errores en consola
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Recargar para capturar errores
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log(`❌ Errores en consola: ${errors.length}`);
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}`);
      });
    } else {
      console.log(`✅ Sin errores en consola`);
    }
  });

  test('debería intentar navegar a rutas conocidas', async ({ page }) => {
    const routes = [
      '/',
      '/login',
      '/admin',
      '/admin/dashboard',
      '/admin/operations/sales',
    ];

    for (const route of routes) {
      console.log(`\n🧭 Probando ruta: ${route}`);

      try {
        await page.goto(`http://localhost:5173${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        await page.waitForTimeout(2000);

        const url = page.url();
        const bodyText = await page.textContent('body');

        console.log(`   URL final: ${url}`);
        console.log(`   Contenido: ${bodyText?.substring(0, 50)}...`);
        console.log(`   Longitud: ${bodyText?.length || 0} caracteres`);

        // Screenshot
        const filename = route.replace(/\//g, '_') || 'root';
        await page.screenshot({
          path: `test-screenshots/route-${filename}.png`
        });

        // Buscar elementos comunes
        const hasForm = await page.locator('form').count() > 0;
        const hasInput = await page.locator('input').count() > 0;
        const hasButton = await page.locator('button').count() > 0;

        console.log(`   ¿Tiene form?: ${hasForm}`);
        console.log(`   ¿Tiene input?: ${hasInput}`);
        console.log(`   ¿Tiene button?: ${hasButton}`);

      } catch (error: unknown) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  });

  test('debería ejecutar código JavaScript en la página', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    // Ejecutar JavaScript para obtener info
    const pageInfo = await page.evaluate(() => {
      return {
        hasReact: typeof (window as any).React !== 'undefined',
        hasReactDOM: typeof (window as any).ReactDOM !== 'undefined',
        userAgent: navigator.userAgent,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        location: window.location.href,
        documentReady: document.readyState,
        bodyChildren: document.body.children.length,
      };
    });

    console.log('🔍 Información de la página:');
    console.log(JSON.stringify(pageInfo, null, 2));

    // Verificar que la página tiene contenido
    expect(pageInfo.bodyChildren).toBeGreaterThan(0);
  });
});
