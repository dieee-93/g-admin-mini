/**
 * G-MINI NAVIGATION TEST
 * 
 * Test que explora la navegación básica de la app.
 * Detecta automáticamente si hay login, dashboard, etc.
 */

import { test, expect } from '@playwright/test';

test.describe('G-Mini - Navigation', () => {
  test('debería detectar la pantalla inicial', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Esperar que el contenido cargue (máximo 10 segundos)
    await page.waitForTimeout(2000);
    
    // Tomar screenshot del estado inicial
    await page.screenshot({ path: 'test-screenshots/initial-screen.png' });
    
    // Detectar qué pantalla es
    const url = page.url();
    const bodyText = await page.textContent('body');
    
    console.log(`📍 URL actual: ${url}`);
    console.log(`📄 Longitud del contenido: ${bodyText?.length || 0} caracteres`);
    
    // Buscar indicadores comunes
    const hasLogin = bodyText?.toLowerCase().includes('login') || 
                     bodyText?.toLowerCase().includes('iniciar sesión') ||
                     bodyText?.toLowerCase().includes('email') ||
                     url.includes('login');
    
    const hasDashboard = bodyText?.toLowerCase().includes('dashboard') ||
                         url.includes('dashboard') ||
                         url.includes('admin');
    
    console.log(`🔐 ¿Es login?: ${hasLogin}`);
    console.log(`📊 ¿Es dashboard?: ${hasDashboard}`);
    
    // Buscar inputs
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`📝 Inputs encontrados: ${inputCount}`);
    
    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const type = await inputs.nth(i).getAttribute('type');
        const name = await inputs.nth(i).getAttribute('name');
        const placeholder = await inputs.nth(i).getAttribute('placeholder');
        console.log(`   Input ${i + 1}: type="${type}" name="${name}" placeholder="${placeholder}"`);
      }
    }
  });

  test('debería poder interactuar con la primera pantalla', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // Buscar elementos interactivos
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    console.log(`🔘 Botones encontrados: ${buttonCount}`);
    
    if (buttonCount > 0) {
      // Listar primeros 5 botones
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const buttonText = await buttons.nth(i).textContent();
        const isVisible = await buttons.nth(i).isVisible();
        console.log(`   Botón ${i + 1}: "${buttonText?.trim()}" (visible: ${isVisible})`);
      }
    }
    
    // Buscar links
    const links = page.locator('a');
    const linkCount = await links.count();
    
    console.log(`🔗 Links encontrados: ${linkCount}`);
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const linkText = await links.nth(i).textContent();
        const href = await links.nth(i).getAttribute('href');
        const isVisible = await links.nth(i).isVisible();
        console.log(`   Link ${i + 1}: "${linkText?.trim()}" -> ${href} (visible: ${isVisible})`);
      }
    }
  });

  test('debería poder tomar screenshot de la página completa', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // Screenshot completo
    await page.screenshot({ 
      path: 'test-screenshots/gmini-fullpage.png',
      fullPage: true 
    });
    
    // Screenshot del viewport
    await page.screenshot({ 
      path: 'test-screenshots/gmini-viewport.png' 
    });
    
    console.log('✅ Screenshots guardados:');
    console.log('   - test-screenshots/gmini-fullpage.png');
    console.log('   - test-screenshots/gmini-viewport.png');
  });

  test('debería poder inspeccionar el DOM', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    
    // Contar todos los elementos
    const allElements = page.locator('*');
    const totalCount = await allElements.count();
    
    // Elementos específicos
    const divs = await page.locator('div').count();
    const spans = await page.locator('span').count();
    const paragraphs = await page.locator('p').count();
    const headers = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const forms = await page.locator('form').count();
    
    console.log(`📊 Estructura del DOM:`);
    console.log(`   Total elementos: ${totalCount}`);
    console.log(`   Divs: ${divs}`);
    console.log(`   Spans: ${spans}`);
    console.log(`   Párrafos: ${paragraphs}`);
    console.log(`   Headers: ${headers}`);
    console.log(`   Buttons: ${buttons}`);
    console.log(`   Inputs: ${inputs}`);
    console.log(`   Forms: ${forms}`);
    
    // Verificar que hay una app real (no página en blanco)
    expect(totalCount).toBeGreaterThan(10);
  });
});
