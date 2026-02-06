// tests/e2e/alerts-visual-testing.spec.ts
// 🎨 Visual Regression Testing Examples for Alerts System
// G-Mini v3.1 - Playwright Visual Testing Guide

import { test, expect } from '@playwright/test';

/**
 * SETUP INSTRUCTIONS:
 * 
 * Opción A: Playwright Native (Básico)
 * - No requiere instalación adicional
 * - Comando: pnpm test:e2e
 * 
 * Opción B: Percy (Enterprise)
 * - Instalación: pnpm add -D @percy/cli @percy/playwright
 * - Comando: pnpm exec percy exec -- pnpm test:e2e
 * - Dashboard: https://percy.io
 * 
 * Opción C: Playwright-Visual (Open Source)
 * - Instalación: pnpm add -D playwright-visual
 * - Comparación local de screenshots
 */

// =========================================
// OPCIÓN A: PLAYWRIGHT NATIVE (RECOMENDADO PARA EMPEZAR)
// =========================================

test.describe('Toast Visual Regression - Native Playwright', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Critical toast visual consistency', async ({ page }) => {
    // Trigger critical stock alert
    await page.click('[data-testid="create-material"]');
    await page.fill('input[name="name"]', 'Harina 000');
    await page.fill('input[name="stock"]', '2');
    await page.fill('input[name="minimum"]', '10');
    await page.click('button[type="submit"]');

    // Wait for toast to appear
    const toast = page.locator('[data-toast-severity="critical"]');
    await expect(toast).toBeVisible();

    // 📸 Visual comparison with baseline
    await expect(toast).toHaveScreenshot('critical-toast.png', {
      maxDiffPixels: 100,  // Tolerancia: 100 píxeles diferentes
      threshold: 0.2,      // 20% diferencia permitida
      animations: 'disabled'  // Desactivar animaciones para comparación
    });
  });

  test('Toast stack with multiple alerts', async ({ page }) => {
    // Trigger 3 different alerts
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('create-alert', {
        detail: { severity: 'critical', message: 'Stock crítico' }
      }));
      window.dispatchEvent(new CustomEvent('create-alert', {
        detail: { severity: 'error', message: 'Error de sincronización' }
      }));
      window.dispatchEvent(new CustomEvent('create-alert', {
        detail: { severity: 'warning', message: 'ABC reclasificado' }
      }));
    });

    // Wait for all toasts
    await page.waitForSelector('[data-toast-severity="critical"]');
    await page.waitForSelector('[data-toast-severity="error"]');
    await page.waitForSelector('[data-toast-severity="warning"]');

    // 📸 Screenshot del stack completo
    const toastContainer = page.locator('[data-toast-container]');
    await expect(toastContainer).toHaveScreenshot('toast-stack-3-alerts.png');
  });

  test('Toast with actions - all severities', async ({ page }) => {
    const severities = ['info', 'success', 'warning', 'error', 'critical'];

    for (const severity of severities) {
      await page.evaluate((sev) => {
        window.dispatchEvent(new CustomEvent('create-alert', {
          detail: {
            severity: sev,
            message: `Test ${sev} alert`,
            actions: [
              { label: 'Acción Primaria', type: 'primary' },
              { label: 'Snooze', type: 'secondary' }
            ]
          }
        }));
      }, severity);

      const toast = page.locator(`[data-toast-severity="${severity}"]`);
      await expect(toast).toBeVisible();

      // 📸 Screenshot por severidad
      await expect(toast).toHaveScreenshot(`toast-${severity}-with-actions.png`);

      // Dismiss para siguiente iteración
      await page.click(`[data-toast-severity="${severity}"] [data-dismiss]`);
      await expect(toast).not.toBeVisible();
    }
  });

  test('Toast progress bar animation', async ({ page }) => {
    // Crear toast con 5s de duración
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('create-alert', {
        detail: {
          severity: 'warning',
          message: 'Alert with progress',
          duration: 5000
        }
      }));
    });

    const toast = page.locator('[data-toast-severity="warning"]');
    await expect(toast).toBeVisible();

    // 📸 Screenshot inicial (progress bar full)
    await expect(toast).toHaveScreenshot('toast-progress-start.png');

    // Wait 2.5s (mitad)
    await page.waitForTimeout(2500);

    // 📸 Screenshot mid-point (progress bar ~50%)
    await expect(toast).toHaveScreenshot('toast-progress-mid.png');

    // Wait 2s más
    await page.waitForTimeout(2000);

    // 📸 Screenshot final (progress bar casi vacío)
    await expect(toast).toHaveScreenshot('toast-progress-end.png');
  });
});

test.describe('Notification Center Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Populate notification center with mock data
    await page.evaluate(() => {
      // Inject mock alerts into localStorage or API
      localStorage.setItem('notificationHistory', JSON.stringify([
        {
          id: '1',
          severity: 'critical',
          message: 'Stock crítico',
          timestamp: Date.now() - 1000 * 60 * 2,  // 2 min ago
          status: 'unread'
        },
        {
          id: '2',
          severity: 'warning',
          message: 'ABC reclasificado',
          timestamp: Date.now() - 1000 * 60 * 15,  // 15 min ago
          status: 'read'
        },
        {
          id: '3',
          severity: 'info',
          message: 'Nuevo proveedor',
          timestamp: Date.now() - 1000 * 60 * 60 * 24,  // Yesterday
          status: 'archived'
        }
      ]));
    });
  });

  test('Notification center drawer open', async ({ page }) => {
    // Open notification center
    await page.click('[data-testid="nav-alert-badge"]');

    // Wait for drawer animation
    const drawer = page.locator('[data-testid="notification-center-drawer"]');
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(500);  // Wait for slide-in animation

    // 📸 Full drawer screenshot
    await expect(drawer).toHaveScreenshot('notification-center-open.png', {
      animations: 'disabled'
    });
  });

  test('Notification center timeline grouping', async ({ page }) => {
    await page.click('[data-testid="nav-alert-badge"]');
    const drawer = page.locator('[data-testid="notification-center-drawer"]');
    await expect(drawer).toBeVisible();

    // Verify timeline groups
    const todayGroup = drawer.locator('[data-timeline-group="today"]');
    const yesterdayGroup = drawer.locator('[data-timeline-group="yesterday"]');

    await expect(todayGroup).toBeVisible();
    await expect(yesterdayGroup).toBeVisible();

    // 📸 Screenshot con agrupación
    await expect(drawer).toHaveScreenshot('notification-center-timeline.png');
  });

  test('Notification center filters', async ({ page }) => {
    await page.click('[data-testid="nav-alert-badge"]');
    const drawer = page.locator('[data-testid="notification-center-drawer"]');

    // Test each filter
    const filters = ['all', 'unread', 'critical', 'acknowledged'];

    for (const filter of filters) {
      await page.click(`[data-filter="${filter}"]`);
      await page.waitForTimeout(200);  // Wait for filter animation

      // 📸 Screenshot por filtro
      await expect(drawer).toHaveScreenshot(`notification-center-filter-${filter}.png`);
    }
  });

  test('Notification center search', async ({ page }) => {
    await page.click('[data-testid="nav-alert-badge"]');
    const drawer = page.locator('[data-testid="notification-center-drawer"]');

    // Search for "stock"
    await page.fill('[data-testid="notification-search"]', 'stock');
    await page.waitForTimeout(300);  // Wait for search results

    // 📸 Screenshot con resultados de búsqueda
    await expect(drawer).toHaveScreenshot('notification-center-search-results.png');
  });
});

test.describe('Badge System Visual Regression', () => {
  test('Nav alert badge - different counts', async ({ page }) => {
    await page.goto('/admin/dashboard');

    const counts = [0, 1, 5, 10, 99, 100];

    for (const count of counts) {
      // Update badge count
      await page.evaluate((c) => {
        const badge = document.querySelector('[data-testid="nav-alert-badge"]');
        if (badge) badge.textContent = c > 99 ? '99+' : String(c);
      }, count);

      const badge = page.locator('[data-testid="nav-alert-badge"]');

      // 📸 Screenshot por contador
      await expect(badge).toHaveScreenshot(`nav-badge-count-${count}.png`);
    }
  });

  test('Critical badge pulse animation', async ({ page }) => {
    await page.goto('/admin/supply-chain/materials');

    // Activate critical badge
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('create-alert', {
        detail: { severity: 'critical', message: 'Test critical' }
      }));
    });

    const criticalBadge = page.locator('[data-testid="critical-alert-badge"]');
    await expect(criticalBadge).toBeVisible();

    // 📸 Capture pulse animation states
    await expect(criticalBadge).toHaveScreenshot('critical-badge-pulse-start.png');

    await page.waitForTimeout(1000);  // Mid-pulse
    await expect(criticalBadge).toHaveScreenshot('critical-badge-pulse-mid.png');
  });

  test('Sidebar module badges', async ({ page }) => {
    await page.goto('/admin/dashboard');

    const modules = ['materials', 'sales', 'production', 'finance'];

    for (const module of modules) {
      const badge = page.locator(`[data-sidebar-badge="${module}"]`);

      if (await badge.isVisible()) {
        // 📸 Screenshot por módulo
        await expect(badge).toHaveScreenshot(`sidebar-badge-${module}.png`);
      }
    }
  });
});

test.describe('Responsive Visual Regression', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },    // iPhone SE
    { name: 'tablet', width: 768, height: 1024 },   // iPad
    { name: 'desktop', width: 1920, height: 1080 }  // Full HD
  ];

  for (const viewport of viewports) {
    test(`Toast display on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/admin/supply-chain/materials');

      // Trigger alert
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('create-alert', {
          detail: { severity: 'critical', message: 'Test responsive alert' }
        }));
      });

      const toast = page.locator('[data-toast-severity="critical"]');
      await expect(toast).toBeVisible();

      // 📸 Screenshot responsive
      await expect(page).toHaveScreenshot(`toast-${viewport.name}.png`, {
        fullPage: false
      });
    });

    test(`Notification center on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/admin/dashboard');

      await page.click('[data-testid="nav-alert-badge"]');
      const drawer = page.locator('[data-testid="notification-center-drawer"]');
      await expect(drawer).toBeVisible();

      // 📸 Screenshot responsive
      await expect(page).toHaveScreenshot(`notification-center-${viewport.name}.png`);
    });
  }
});

test.describe('Dark Mode Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/admin/supply-chain/materials');
  });

  test('Toast dark mode - all severities', async ({ page }) => {
    const severities = ['info', 'success', 'warning', 'error', 'critical'];

    for (const severity of severities) {
      await page.evaluate((sev) => {
        window.dispatchEvent(new CustomEvent('create-alert', {
          detail: { severity: sev, message: `Dark mode ${sev}` }
        }));
      }, severity);

      const toast = page.locator(`[data-toast-severity="${severity}"]`);
      await expect(toast).toBeVisible();

      // 📸 Dark mode screenshot
      await expect(toast).toHaveScreenshot(`toast-dark-${severity}.png`);

      await page.click(`[data-toast-severity="${severity}"] [data-dismiss]`);
    }
  });

  test('Notification center dark mode', async ({ page }) => {
    await page.click('[data-testid="nav-alert-badge"]');
    const drawer = page.locator('[data-testid="notification-center-drawer"]');
    await expect(drawer).toBeVisible();

    // 📸 Dark mode drawer
    await expect(drawer).toHaveScreenshot('notification-center-dark.png');
  });
});

// =========================================
// OPCIÓN B: PERCY.IO (ENTERPRISE)
// =========================================

/**
 * Para usar Percy:
 * 
 * 1. Instalar:
 *    pnpm add -D @percy/cli @percy/playwright
 * 
 * 2. Crear cuenta en https://percy.io y obtener token
 * 
 * 3. Configurar .env:
 *    PERCY_TOKEN=your_token_here
 * 
 * 4. Ejecutar:
 *    pnpm exec percy exec -- pnpm test:e2e
 * 
 * 5. Ver resultados en dashboard: https://percy.io
 */

// import percySnapshot from '@percy/playwright';
// 
// test('Toast with Percy', async ({ page }) => {
//   await page.goto('/admin/supply-chain/materials');
//   await triggerAlert(page, 'critical');
//   
//   // 📸 Percy snapshot (automatic comparison in dashboard)
//   await percySnapshot(page, 'Critical Toast - Desktop', {
//     widths: [375, 768, 1920],  // Multiple viewports
//     minHeight: 1024
//   });
// });

// =========================================
// OPCIÓN C: PLAYWRIGHT-VISUAL (OPEN SOURCE)
// =========================================

/**
 * Para usar playwright-visual:
 * 
 * 1. Instalar:
 *    pnpm add -D playwright-visual
 * 
 * 2. Configurar en playwright.config.ts:
 *    import { visualConfig } from 'playwright-visual';
 *    export default { ...visualConfig };
 * 
 * 3. Usar en tests:
 *    import { compareScreenshots } from 'playwright-visual';
 *    await compareScreenshots(page, 'toast-critical', { threshold: 0.05 });
 */

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Trigger alert via custom event (for testing)
 */
async function triggerAlert(
  page: any,
  severity: 'info' | 'success' | 'warning' | 'error' | 'critical',
  options: {
    message?: string;
    actions?: Array<{ label: string; type: string }>;
    duration?: number;
  } = {}
) {
  await page.evaluate(({ sev, opts }) => {
    window.dispatchEvent(new CustomEvent('create-alert', {
      detail: {
        severity: sev,
        message: opts.message || `Test ${sev} alert`,
        actions: opts.actions,
        duration: opts.duration
      }
    }));
  }, { sev: severity, opts: options });
}

/**
 * Wait for toast animations to complete
 */
async function waitForToastAnimation(page: any) {
  await page.waitForTimeout(500);  // 500ms for slide-in
}

/**
 * Dismiss all toasts
 */
async function dismissAllToasts(page: any) {
  const dismissButtons = page.locator('[data-toast] [data-dismiss]');
  const count = await dismissButtons.count();

  for (let i = 0; i < count; i++) {
    await dismissButtons.nth(0).click();  // Always click first (removes from DOM)
    await page.waitForTimeout(200);  // Wait for animation
  }
}

/**
 * Populate notification center with mock data
 */
async function populateNotificationCenter(page: any, alerts: any[]) {
  await page.evaluate((mockAlerts) => {
    localStorage.setItem('notificationHistory', JSON.stringify(mockAlerts));
  }, alerts);
}

// =========================================
// RUN INSTRUCTIONS
// =========================================

/**
 * Para ejecutar estos tests:
 * 
 * Opción A: Native (Recomendado para empezar)
 * ------------------------------------------
 * pnpm test:e2e tests/e2e/alerts-visual-testing.spec.ts
 * 
 * - Screenshots guardados en: tests/e2e/screenshots/
 * - Baselines en primera ejecución
 * - Comparación automática en siguientes ejecuciones
 * - Si hay diferencias > threshold, test falla
 * 
 * 
 * Opción B: Percy (Enterprise)
 * ---------------------------
 * PERCY_TOKEN=xxx pnpm exec percy exec -- pnpm test:e2e
 * 
 * - Dashboard online: https://percy.io
 * - Comparación visual automática
 * - Historial de cambios
 * - CI/CD integration
 * 
 * 
 * Opción C: Playwright-Visual (Open Source)
 * ----------------------------------------
 * pnpm test:e2e tests/e2e/alerts-visual-testing.spec.ts
 * 
 * - Comparación local
 * - Baselines en repo
 * - Sin dashboard
 * 
 * 
 * Update Baselines:
 * ----------------
 * pnpm test:e2e --update-snapshots
 * 
 * (Regenera todos los screenshots de referencia)
 */
