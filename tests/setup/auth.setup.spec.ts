/**
 * Setup de autenticación para Playwright
 * Basado en: https://playwright.dev/docs/auth
 * 
 * Este script realiza login UNA VEZ y guarda el estado para todas las pruebas.
 * 
 * Uso:
 * 1. Asegúrate que pnpm dev esté corriendo
 * 2. Ejecuta: pnpm exec playwright test tests/setup/auth.setup.spec.ts --headed
 * 3. Haz login manualmente cuando se abra el navegador
 * 4. El estado se guarda automáticamente en .auth/user.json
 * 5. Todas las pruebas posteriores usarán ese login
 */

import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  console.log('🔐 Iniciando proceso de autenticación...');
  console.log('📍 Navegando a la página de login...');
  
  // Ir a tu página de login
  await page.goto('http://localhost:5173/');
  
  console.log('');
  console.log('✋ INSTRUCCIONES:');
  console.log('   1. Haz login manualmente en el navegador que se abrió');
  console.log('   2. Espera a que la app cargue completamente');
  console.log('   3. El script esperará 60 segundos automáticamente');
  console.log('');
  console.log('⏱️  Esperando 60 segundos para que completes el login...');
  
  // Esperar 60 segundos para que hagas login manualmente
  await page.waitForTimeout(60000);
  
  console.log('');
  console.log('💾 Guardando estado de autenticación...');
  
  // Guardar el estado completo (cookies, localStorage, sessionStorage)
  await page.context().storageState({ path: authFile });
  
  console.log(`✅ ¡Listo! Estado guardado en: ${authFile}`);
  console.log('🚀 Ahora puedes ejecutar: pnpm e2e:with-session');
  console.log('   Todas las pruebas usarán tu sesión activa');
});
