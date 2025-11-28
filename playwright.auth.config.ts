import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración especial para usar tu sesión de Chrome
 * con tus cookies y datos de usuario (login activo)
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: false, // Importante: no paralelo para usar perfil de usuario
  forbidOnly: false,
  retries: 0,
  workers: 1, // Solo 1 worker para evitar conflictos con el perfil
  
  reporter: [
    ['html'],
    ['list'],
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10 * 1000,
    navigationTimeout: 15 * 1000,
  },

  projects: [
    {
      name: 'chrome-with-session',
      use: {
        ...devices['Desktop Chrome'],
        // Usa tu perfil de Chrome con todas tus sesiones activas
        launchOptions: {
          channel: 'chrome',
          args: [
            '--disable-blink-features=AutomationControlled', // Evitar detección de automatización
          ],
        },
      },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // Reusar servidor si ya está corriendo
    timeout: 120 * 1000,
  },
});
