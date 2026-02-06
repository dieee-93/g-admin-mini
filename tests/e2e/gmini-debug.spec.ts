/**
 * G-MINI DEBUG TEST
 * 
 * Test que captura errores de consola y muestra estado detallado.
 */

import { test, expect } from '@playwright/test';

test.describe('G-Mini - Debug Console', () => {
  test('debería capturar todos los mensajes de consola', async ({ page }) => {
    const consoleMessages: Array<{ type: string; text: string }> = [];

    // Capturar TODOS los mensajes de consola
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // Capturar errores de página
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Capturar request failures
    const requestFailures: string[] = [];
    page.on('requestfailed', request => {
      requestFailures.push(`${request.url()} - ${request.failure()?.errorText}`);
    });

    console.log('🚀 Navegando con captura de errores...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Esperar para que JavaScript se ejecute
    await page.waitForTimeout(5000);

    // Imprimir todos los mensajes
    console.log('\n📊 MENSAJES DE CONSOLA:');
    console.log(`   Total mensajes: ${consoleMessages.length}`);

    const byType = consoleMessages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   Por tipo:', byType);

    // Mostrar errores
    const errors = consoleMessages.filter(m => m.type === 'error');
    if (errors.length > 0) {
      console.log('\n❌ ERRORES:');
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.text}`);
      });
    }

    // Mostrar warnings
    const warnings = consoleMessages.filter(m => m.type === 'warning');
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach((warn, i) => {
        console.log(`   ${i + 1}. ${warn.text.substring(0, 100)}`);
      });
    }

    // Mostrar logs
    const logs = consoleMessages.filter(m => m.type === 'log');
    if (logs.length > 0) {
      console.log('\n📝 LOGS:');
      logs.slice(0, 10).forEach((log, i) => {
        console.log(`   ${i + 1}. ${log.text.substring(0, 100)}`);
      });
    }

    // Errores de página
    if (pageErrors.length > 0) {
      console.log('\n💥 PAGE ERRORS:');
      pageErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
    }

    // Request failures
    if (requestFailures.length > 0) {
      console.log('\n🌐 REQUEST FAILURES:');
      requestFailures.forEach((fail, i) => {
        console.log(`   ${i + 1}. ${fail}`);
      });
    }

    // Summary
    console.log('\n📋 RESUMEN:');
    console.log(`   ✅ Consola logs: ${logs.length}`);
    console.log(`   ⚠️  Warnings: ${warnings.length}`);
    console.log(`   ❌ Errors: ${errors.length}`);
    console.log(`   💥 Page errors: ${pageErrors.length}`);
    console.log(`   🌐 Request failures: ${requestFailures.length}`);

    // Screenshot
    await page.screenshot({ path: 'test-screenshots/gmini-with-errors.png' });
  });

  test('debería verificar que Vite está corriendo', async ({ page }) => {
    console.log('🔧 Verificando servidor Vite...');

    try {
      const response = await page.goto('http://localhost:5173/@vite/client', {
        timeout: 5000
      });

      const status = response?.status();
      console.log(`   Status: ${status}`);

      if (status === 200) {
        console.log('   ✅ Vite client disponible');
      } else {
        console.log(`   ❌ Vite client respondió con: ${status}`);
      }
    } catch (error: unknown) {
      console.log(`   ❌ Error accediendo a Vite: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  test('debería verificar el HTML inicial', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const html = await page.content();

    console.log('\n🔍 ANÁLISIS DEL HTML:');
    console.log(`   Longitud total: ${html.length} caracteres`);

    // Buscar cosas importantes
    const hasRootDiv = html.includes('id="root"') || html.includes('id="app"');
    const hasViteScript = html.includes('@vite/client');
    const hasReactRefresh = html.includes('react-refresh');
    const hasMainScript = html.includes('src="/src/') || html.includes('src="./src/');

    console.log(`   ✅ Tiene #root: ${hasRootDiv}`);
    console.log(`   ✅ Tiene Vite client: ${hasViteScript}`);
    console.log(`   ✅ Tiene React refresh: ${hasReactRefresh}`);
    console.log(`   ✅ Tiene main script: ${hasMainScript}`);

    // Buscar el script principal
    if (!hasMainScript) {
      console.log('\n   ⚠️  NO SE ENCONTRÓ EL SCRIPT PRINCIPAL!');
      console.log('   Buscando scripts en el HTML...');

      const scriptMatches = html.match(/<script[^>]*src="([^"]+)"[^>]*>/g);
      if (scriptMatches) {
        console.log('   Scripts encontrados:');
        scriptMatches.forEach(script => {
          console.log(`      ${script}`);
        });
      }
    }
  });
});
