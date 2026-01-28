import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for G-Mini E2E Tests
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Maximum time one test can run (30 seconds)
  timeout: 30 * 1000,
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:5173',
    
    // 🎯 Inject environment variable to disable React Scan
    extraHTTPHeaders: {
      'X-E2E-Test': 'true',
    },
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // 🎯 PERFORMANCE: Disable video recording (heavy overhead)
    // Video recording can reduce FPS from 60 to 3-5 FPS
    // Enable only when debugging: video: 'retain-on-failure'
    video: 'off',
    
    // Maximum time each action can take (10 seconds)
    actionTimeout: 10 * 1000,
    
    // Navigation timeout (15 seconds)
    navigationTimeout: 15 * 1000,
    
    // 🎯 Disable animations for stable element detection
    // Chakra UI animations prevent Playwright from detecting "stable" state
    // This reduces test time from 25-30s to 5-8s per test
    stylePath: './tests/e2e/disable-animations.css',
    
    // 🎯 PERFORMANCE: Launch options for better performance
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--enable-gpu',
        '--ignore-gpu-blocklist',
        '--enable-accelerated-2d-canvas',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    },
  },

  // 🎯 Visual Testing Configuration
  expect: {
    toHaveScreenshot: {
      // Maximum pixel difference threshold
      maxDiffPixels: 100,
      // Comparison threshold (0-1, lower = more strict)
      threshold: 0.2,
      // Disable animations for consistent screenshots
      animations: 'disabled',
      // Disable CSS animations and transitions
      stylePath: undefined,
    },
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - corre primero para autenticar
    {
      name: 'setup',
      testMatch: /.*\.setup\.spec\.ts/, // Busca en todas las carpetas
      testDir: './tests',
      timeout: 120000, // 2 minutos para permitir login manual
    },
    
    // Proyecto con sesión autenticada
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Usar el estado de autenticación guardado
        storageState: 'playwright/.auth/user.json',
      },
    },
    
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Google Chrome instalado en el sistema
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Usa Chrome instalado en tu sistema
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start server
  },
});
