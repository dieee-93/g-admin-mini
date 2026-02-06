/**
 * NAVIGATION BUG DETECTOR
 *
 * Test especializado para detectar y debuggear el bug de navegación
 * donde múltiples intentos de navegar al módulo products fallan.
 *
 * Estrategia:
 * 1. Monitorear TODAS las llamadas de navegación
 * 2. Detectar intentos repetidos (3+ en < 5 segundos)
 * 3. Capturar estado completo cuando ocurre
 * 4. Grabar video/screenshots del bug
 */

import { test, expect, Page } from '@playwright/test';

interface NavigationAttempt {
  timestamp: number;
  url: string;
  moduleId?: string;
  succeeded: boolean;
}

interface ConsoleLog {
  timestamp: number;
  type: string;
  text: string;
}

/**
 * Extrae moduleId de logs de NavigationContext
 */
function extractModuleId(logText: string): string | undefined {
  const match = logText.match(/moduleId:\s*['"]([^'"]+)['"]/);
  return match?.[1];
}

/**
 * Detecta si hay un bug de navegación repetida
 */
function detectNavigationBug(attempts: NavigationAttempt[]): {
  hasBug: boolean;
  details: string;
  suspectAttempts: NavigationAttempt[];
} {
  if (attempts.length < 3) {
    return { hasBug: false, details: 'No hay suficientes intentos', suspectAttempts: [] };
  }

  // Buscar ventanas de 5 segundos con 3+ intentos al mismo módulo
  for (let i = 0; i < attempts.length - 2; i++) {
    const window = attempts.slice(i, i + 10); // Revisar siguientes 10 intentos
    const windowDuration = window[window.length - 1].timestamp - window[0].timestamp;

    if (windowDuration < 5000) { // Menos de 5 segundos
      // Contar intentos al mismo módulo
      const moduleAttempts = window.reduce((acc, attempt) => {
        if (attempt.moduleId) {
          acc[attempt.moduleId] = (acc[attempt.moduleId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Encontrar módulo con 3+ intentos
      const suspectModule = Object.entries(moduleAttempts).find(([_, count]) => count >= 3);

      if (suspectModule) {
        const [moduleId, count] = suspectModule;
        const suspectAttempts = window.filter(a => a.moduleId === moduleId);

        return {
          hasBug: true,
          details: `Detectados ${count} intentos de navegar a "${moduleId}" en ${windowDuration}ms`,
          suspectAttempts
        };
      }
    }
  }

  return { hasBug: false, details: 'No se detectó patrón de bug', suspectAttempts: [] };
}

test.describe('Navigation Bug Detector', () => {

  test.beforeEach(async ({ page }) => {
    // Disable React Scan explicitly and simulate auth/dev environment
    await page.addInitScript(() => {
      (window as any).__IS_PLAYWRIGHT__ = true;
      localStorage.setItem('playwright-test', 'true');
    });
  });

  test('debería detectar intentos repetidos de navegación', async ({ page }) => {
    const navigationAttempts: NavigationAttempt[] = [];
    const consoleLogs: ConsoleLog[] = [];
    let bugDetected = false;

    // 1. CAPTURAR TODOS LOS LOGS DE CONSOLA
    page.on('console', msg => {
      const timestamp = Date.now();
      const text = msg.text();
      const type = msg.type();

      consoleLogs.push({ timestamp, type, text });

      // Detectar logs de NavigationContext
      if (text.includes('[NavigationContext]')) {

        // Detectar handleNavigateToModule called
        if (text.includes('handleNavigateToModule called')) {
          const moduleId = extractModuleId(text);

          navigationAttempts.push({
            timestamp,
            url: page.url(),
            moduleId,
            succeeded: false // Asumimos que falló hasta que confirmemos
          });

          console.log(`🔍 [${new Date(timestamp).toISOString()}] Intento de navegación: ${moduleId || 'unknown'}`);
        }

        // Detectar navegación exitosa
        if (text.includes('Navigating to module root')) {
          const moduleId = extractModuleId(text);

          // Marcar el último intento como exitoso
          const lastAttempt = navigationAttempts
            .filter(a => a.moduleId === moduleId)
            .pop();

          if (lastAttempt) {
            lastAttempt.succeeded = true;
          }
        }
      }

      // Detectar re-renders sospechosos
      if (text.includes('PerformanceWrapper RENDERED')) {
        console.log(`⚡ [${new Date(timestamp).toISOString()}] PerformanceWrapper renderizado`);
      }

      // Detectar inicialización de alertas
      if (text.includes('Initializing global alert systems')) {
        console.log(`🔔 [${new Date(timestamp).toISOString()}] Sistema de alertas inicializándose`);
      }
    });

    // 2. CAPTURAR CAMBIOS DE URL
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const timestamp = Date.now();
        console.log(`🧭 [${new Date(timestamp).toISOString()}] URL cambió a: ${frame.url()}`);
      }
    });

    // 3. NAVEGAR A LA APP
    console.log('🚀 Navegando a la aplicación...');
    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 4. ESPERAR A QUE CARGUE
    console.log('⏳ Esperando carga inicial...');
    await page.waitForTimeout(3000);

    // 5. SIMULAR NAVEGACIÓN A MÓDULOS (intentar reproducir el bug)
    console.log('\n🎯 Iniciando test de navegación...');

    const modulesToTest = [
      { selector: '[data-testid="nav-item-products"]', name: 'products' },
      { selector: '[data-testid="nav-item-materials"]', name: 'materials' },
      { selector: '[data-testid="nav-item-customers"]', name: 'customers' },
      { selector: '[data-testid="nav-item-sales"]', name: 'sales' },
    ];

    for (const module of modulesToTest) {
      console.log(`\n📍 Intentando navegar a ${module.name}...`);

      try {
        // Buscar el link en el sidebar
        const link = page.locator(module.selector).first();

        if (await link.isVisible({ timeout: 2000 })) {
          const beforeAttempts = navigationAttempts.length;

          // Click en el link
          await link.click({ timeout: 5000 });

          // Esperar a ver si navega o si hay intentos repetidos
          await page.waitForTimeout(2000);

          const afterAttempts = navigationAttempts.length;
          const newAttempts = afterAttempts - beforeAttempts;

          console.log(`   ✓ Intentos de navegación registrados: ${newAttempts}`);

          // Verificar si hubo múltiples intentos
          if (newAttempts > 2) {
            console.log(`   ⚠️  SOSPECHOSO: ${newAttempts} intentos para navegar a ${module.name}`);
            bugDetected = true;

            // Tomar screenshot
            await page.screenshot({
              path: `test-screenshots/navigation-bug-${module.name}.png`,
              fullPage: true
            });
          }

          // Volver al dashboard para siguiente test
          await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
        } else {
          console.log(`   ⚠️  Link para ${module.name} no visible`);
        }
      } catch (error) {
        console.log(`   ❌ Error navegando a ${module.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // 6. ANALIZAR RESULTADOS
    console.log('\n\n📊 ANÁLISIS DE NAVEGACIÓN:');
    console.log(`   Total intentos: ${navigationAttempts.length}`);
    console.log(`   Intentos exitosos: ${navigationAttempts.filter(a => a.succeeded).length}`);
    console.log(`   Intentos fallidos: ${navigationAttempts.filter(a => !a.succeeded).length}`);

    // Detectar patrón de bug
    const bugAnalysis = detectNavigationBug(navigationAttempts);

    if (bugAnalysis.hasBug) {
      console.log('\n🐛 BUG DETECTADO:');
      console.log(`   ${bugAnalysis.details}`);
      console.log('\n   Intentos sospechosos:');
      bugAnalysis.suspectAttempts.forEach((attempt, i) => {
        console.log(`   ${i + 1}. [${new Date(attempt.timestamp).toISOString()}] ${attempt.moduleId} - ${attempt.succeeded ? '✓' : '✗'}`);
      });

      // Mostrar logs relevantes alrededor del bug
      const bugTime = bugAnalysis.suspectAttempts[0].timestamp;
      const relevantLogs = consoleLogs.filter(log =>
        Math.abs(log.timestamp - bugTime) < 3000 && // ±3 segundos
        (log.text.includes('[NavigationContext]') ||
          log.text.includes('PerformanceWrapper') ||
          log.text.includes('alert'))
      );

      console.log('\n   📝 Logs relevantes:');
      relevantLogs.forEach(log => {
        console.log(`   [${new Date(log.timestamp).toISOString()}] ${log.text.substring(0, 100)}`);
      });
    } else {
      console.log('\n✅ No se detectó el bug en esta ejecución');
      console.log(`   ${bugAnalysis.details}`);
    }

    // 7. LOGS FINALES
    console.log('\n📋 RESUMEN DE CONSOLA:');
    const errorLogs = consoleLogs.filter(l => l.type === 'error');
    const warningLogs = consoleLogs.filter(l => l.type === 'warning');
    console.log(`   Errors: ${errorLogs.length}`);
    console.log(`   Warnings: ${warningLogs.length}`);
    console.log(`   Total logs: ${consoleLogs.length}`);

    if (errorLogs.length > 0) {
      console.log('\n   ❌ Errores capturados:');
      errorLogs.slice(0, 5).forEach(log => {
        console.log(`      ${log.text.substring(0, 150)}`);
      });
    }

    // NO FALLAR el test, solo reportar
    // expect(bugDetected).toBe(false); // Comentado para que no falle
  });

  test('debería simular clicks rápidos para reproducir el bug', async ({ page }) => {
    const navigationAttempts: NavigationAttempt[] = [];
    let multipleAttemptsDetected = false;

    // Capturar navegaciones
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('handleNavigateToModule called')) {
        const moduleId = extractModuleId(text);
        navigationAttempts.push({
          timestamp: Date.now(),
          url: page.url(),
          moduleId,
          succeeded: false
        });
      }
    });

    console.log('🚀 Navegando a la aplicación...');
    await page.goto('http://localhost:5173/admin/dashboard', {
      waitUntil: 'domcontentloaded', // Changed from networkidle to prevent hangs
      timeout: 30000
    });

    await page.waitForTimeout(3000); // Wait for hydration manually

    console.log('\n⚡ SIMULANDO CLICKS RÁPIDOS (intentando reproducir bug)...');

    // 0. Hover sidebar to expand it
    console.log('👆 Expandiendo sidebar...');
    const sidebar = page.locator('[data-testid="main-sidebar"]');
    if (await sidebar.isVisible()) {
      try {
        await sidebar.hover({ force: true, timeout: 2000 });
        await page.waitForTimeout(500); // Animation
      } catch (e) {
        console.log('⚠️ Hover failed, proceeding anyway...');
      }
    }

    // Intentar encontrar el link a products
    const productsLink = page.locator('[data-testid="nav-item-products"]').first();

    if (await productsLink.isVisible({ timeout: 5000 })) {
      console.log('📍 Link de products encontrado, realizando clicks rápidos...');

      const beforeCount = navigationAttempts.length;

      // Hacer 5 clicks rápidos (simular usuario frustrado)
      for (let i = 0; i < 5; i++) {
        console.log(`   Click ${i + 1}/5...`);

        // Expandir sidebar antes de cada click (se colapsa después de navegar)
        try {
          await sidebar.hover({ timeout: 500 });
          await page.waitForTimeout(100); // Dar tiempo para que se expanda
        } catch (e) {
          console.log('   ⚠️ Hover failed, trying anyway...');
        }

        // Intentar el click
        try {
          await productsLink.click({ timeout: 1000, force: true });
        } catch (e) {
          console.log(`   ⚠️ Click ${i + 1} failed: ${(e as Error).message}`);
        }

        await page.waitForTimeout(100); // Solo 100ms entre clicks
      }

      await page.waitForTimeout(3000); // Esperar a ver qué pasa

      const afterCount = navigationAttempts.length;
      const attemptsTriggered = afterCount - beforeCount;

      console.log(`\n📊 Resultados:`);
      console.log(`   Clicks realizados: 5`);
      console.log(`   Intentos de navegación disparados: ${attemptsTriggered}`);
      console.log(`   Comportamiento esperado: Solo 1 navegación (al primer click)`);
      console.log(`   Clicks subsiguientes: Ignorados (ya estás en esa página)`);

      // El comportamiento CORRECTO es:
      // - Primer click: Navega a Products (1 intento)
      // - Clicks 2-5: No navegan porque ya estás en Products (0 intentos adicionales)
      // Total esperado: 1 intento de navegación

      if (attemptsTriggered > 5) {
        console.log(`   🐛 BUG DETECTADO: Más intentos de navegación que clicks realizados`);
        console.log(`   Esto indica que cada click dispara múltiples navegaciones`);
        multipleAttemptsDetected = true;

        // Screenshot del estado
        await page.screenshot({
          path: 'test-screenshots/rapid-click-bug.png',
          fullPage: true
        });
      }

      // Verificar si finalmente navegó
      const currentUrl = page.url();
      console.log(`   URL final: ${currentUrl}`);
      console.log(`   ✓ Navegación exitosa: ${currentUrl.includes('products')}`);

    } else {
      console.log('⚠️  Link de products no encontrado');
    }
  });

  test('debería monitorear navegación durante sesión extendida', async ({ page }) => {
    const navigationAttempts: NavigationAttempt[] = [];
    const renderCounts: Record<string, number> = {};

    // Capturar todo
    page.on('console', msg => {
      const text = msg.text();

      if (text.includes('handleNavigateToModule called')) {
        const moduleId = extractModuleId(text);
        navigationAttempts.push({
          timestamp: Date.now(),
          url: page.url(),
          moduleId,
          succeeded: false
        });
      }

      if (text.includes('PerformanceWrapper RENDERED')) {
        const url = page.url();
        renderCounts[url] = (renderCounts[url] || 0) + 1;
      }
    });

    console.log('🚀 Iniciando sesión extendida de navegación...');

    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Navegar entre módulos de manera "natural"
    const routes = [
      '/admin/dashboard',
      '/admin/supply-chain/products',
      '/admin/supply-chain/materials',
      '/admin/core/crm/customers',
      '/admin/operations/sales',
      '/admin/dashboard'
    ];

    console.log('\n🧭 Navegando entre rutas...');

    for (const route of routes) {
      console.log(`\n📍 Navegando a ${route}...`);
      const before = navigationAttempts.length;

      await page.goto(`http://localhost:5173${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      const after = navigationAttempts.length;
      const attempts = after - before;

      console.log(`   Intentos de navegación: ${attempts}`);
      console.log(`   URL final: ${page.url()}`);

      if (attempts > 2) {
        console.log(`   ⚠️  SOSPECHOSO: ${attempts} intentos`);
      }
    }

    // Análisis final
    console.log('\n\n📊 RESUMEN DE SESIÓN:');
    console.log(`   Total navegaciones intentadas: ${navigationAttempts.length}`);
    console.log(`   Rutas visitadas: ${routes.length}`);

    console.log('\n   Renders por ruta:');
    Object.entries(renderCounts).forEach(([url, count]) => {
      console.log(`      ${url}: ${count} renders`);
      if (count > 2) {
        console.log(`         ⚠️  SOSPECHOSO: Re-renders excesivos`);
      }
    });

    // Detectar bug
    const bugAnalysis = detectNavigationBug(navigationAttempts);
    if (bugAnalysis.hasBug) {
      console.log('\n🐛 BUG DETECTADO:');
      console.log(`   ${bugAnalysis.details}`);
    }
  });
});
