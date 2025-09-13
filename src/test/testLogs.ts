import { afterEach, beforeEach, expect } from 'vitest';

// Configuración global para logs en tests
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

// Función para crear logs con timestamp
const createLoggedMethod = (method: (...args: any[]) => void, prefix: string) => {
  return (...args: any[]) => {
    const timestamp = new Date().toISOString();
    method(`[${timestamp}] ${prefix}:`, ...args);
  };
};

// Setup para logs en tests
export const setupTestLogs = () => {
  beforeEach(() => {
    if (process.env.VITEST_LOG_TESTS === 'true') {
      console.log = createLoggedMethod(originalConsole.log, 'TEST-LOG');
      console.error = createLoggedMethod(originalConsole.error, 'TEST-ERROR');
      console.warn = createLoggedMethod(originalConsole.warn, 'TEST-WARN');
      console.info = createLoggedMethod(originalConsole.info, 'TEST-INFO');
      
      console.log('='.repeat(50));
      console.log(`🧪 Test starting: ${expect.getState().currentTestName || 'Unknown'}`);
      console.log('='.repeat(50));
    }
  });

  afterEach(() => {
    if (process.env.VITEST_LOG_TESTS === 'true') {
      console.log('='.repeat(50));
      console.log(`✅ Test completed: ${expect.getState().currentTestName || 'Unknown'}`);
      console.log('='.repeat(50));
      
      // Restaurar consola original
      Object.assign(console, originalConsole);
    }
  });
};

// Helper para logs de debugging específicos
export const testLog = (...args: any[]) => {
  if (process.env.VITEST_LOG_TESTS === 'true') {
    const timestamp = new Date().toISOString();
    originalConsole.log(`[${timestamp}] 🔍 DEBUG:`, ...args);
  }
};

// Helper para logs de performance
export const perfLog = (label: string, startTime: number) => {
  if (process.env.VITEST_LOG_TESTS === 'true') {
    const elapsed = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    originalConsole.log(`[${timestamp}] ⏱️  PERF: ${label} took ${elapsed}ms`);
  }
};
