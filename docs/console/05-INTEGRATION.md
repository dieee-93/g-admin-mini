# 🎧 ConsoleHelper - Integration Guide

## 🔌 Integración con Sistemas Externos

Esta guía documenta cómo integrar ConsoleHelper con otras herramientas y sistemas.

---

## 🎨 1. Integración con Logger System

ConsoleHelper trabaja en conjunto con el sistema de logging centralizado de G-Mini.

### Relación Logger ↔ ConsoleHelper

```
┌──────────────────┐
│  Application     │
│  Code            │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  logger.info()   │  ← Sistema de logging estructurado
│  logger.error()  │
└────────┬─────────┘
         │
         ↓ Formatea log
┌──────────────────┐
│  console.log()   │
│  console.error() │
└────────┬─────────┘
         │
         ↓ Intercepta
┌──────────────────┐
│  ConsoleHelper   │  ← Captura y almacena
└──────────────────┘
```

### Configuración del Logger

```javascript
// window.__GADMIN_LOGGER__ configuración
window.__GADMIN_LOGGER__.configure({
  modules: 'all',             // 'all' o Set(['Module1', 'Module2'])
  level: 'info',              // 'debug' | 'info' | 'warn' | 'error'
  performanceThreshold: 100   // Solo log operaciones >100ms
});
```

### Ejemplo de Uso Conjunto

```typescript
// En tu código
import { logger } from '@/lib/logging';

// Logger formatea → console.log → ConsoleHelper captura
logger.info('MaterialsStore', 'Fetching materials...', { count: 50 });
logger.error('MaterialsStore', 'Failed to fetch', { error: 'Network timeout' });

// Después en Chrome DevTools
__CONSOLE_HELPER__.getByModule('MaterialsStore', 20);
```

### Best Practices

**✅ DO**: Usar `logger.*` para logs estructurados
```typescript
logger.info('Module', 'Message', { data: 'structured' });
```

**❌ DON'T**: Usar `console.log` directamente (funciona pero pierde estructura)
```typescript
console.log('Unstructured log'); // Se captura pero sin module/domain detection
```

---

## 📡 2. Integración con EventBus

ConsoleHelper captura automáticamente logs del EventBus system.

### EventBus Logging Patterns

```typescript
// EventBus emite logs automáticamente
eventBus.emit('sales.order.completed', { orderId: '123' }, {
  priority: 'high',
  correlationId: 'tx-456'
});

// Logs capturados automáticamente:
// [EventBus] Event emitted: sales.order.completed
// [EventBus] Event delivered to 3 subscribers
```

### Debug EventBus con ConsoleHelper

```javascript
// Ver todos los logs de EventBus
__CONSOLE_HELPER__.getByModule('EventBus', 30)

// Buscar eventos específicos
__CONSOLE_HELPER__.search('sales.order', 20)

// Ver solo errores de EventBus
__CONSOLE_HELPER__.getFiltered({
  level: 'error',
  module: 'EventBus'
})
```

### Monitoreo de Health del EventBus

```javascript
// Dashboard de EventBus
const eventBusStats = setInterval(() => {
  const logs = __CONSOLE_HELPER__.getByModule('EventBus', 50);
  const errors = logs.filter(l => l.level === 'error');
  const events = logs.filter(l => l.message.includes('Event emitted'));
  
  console.log('=== EVENTBUS HEALTH ===');
  console.log(`Events: ${events.length}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.table(errors);
  }
}, 10000);

clearInterval(eventBusStats);
```

---

## 🎧 3. Integración con Chrome DevTools MCP

**Chrome DevTools MCP** (Model Context Protocol) permite a IA (Claude) interactuar con DevTools.

### Problema Original

```javascript
// ❌ ANTES: list_console_messages falla
mcp_chrome-devtoo_list_console_messages()
// → Error: 123,000 tokens exceed 25K limit
```

### Solución con ConsoleHelper

```javascript
// ✅ DESPUÉS: evaluate_script + ConsoleHelper
mcp_chrome-devtoo_evaluate_script({ 
  function: "() => window.__CONSOLE_HELPER__.exportForAI({ level: 'error' })" 
})
// → 600 tokens ✅
```

### Comandos MCP Comunes

#### Get Summary
```javascript
mcp_chrome-devtoo_evaluate_script({ 
  function: "() => window.__CONSOLE_HELPER__.getSummary()" 
})
```

#### Get Errors
```javascript
mcp_chrome-devtoo_evaluate_script({ 
  function: "() => window.__CONSOLE_HELPER__.getErrors(10)" 
})
```

#### Get Module Logs
```javascript
mcp_chrome-devtoo_evaluate_script({ 
  function: "() => window.__CONSOLE_HELPER__.getByModule('Materials', 20)" 
})
```

#### Export for AI Analysis
```javascript
mcp_chrome-devtoo_evaluate_script({ 
  function: `() => {
    const report = {
      summary: window.__CONSOLE_HELPER__.getSummary(),
      errors: window.__CONSOLE_HELPER__.exportForAI({ level: 'error' }),
      context: window.__CONSOLE_HELPER__.getTopModules(5)
    };
    return report;
  }` 
})
```

### Workflow con Claude + MCP

```
1. Claude detecta error en codebase
2. Claude usa MCP evaluate_script para ejecutar ConsoleHelper
3. ConsoleHelper retorna logs filtrados (~600 tokens)
4. Claude analiza logs y sugiere fix
5. Desarrollador aplica fix
6. Claude verifica con ConsoleHelper nuevamente
```

**Ejemplo de Prompt para Claude**:
```
Hey Claude, estoy viendo errores en Materials module.
Usa Chrome DevTools MCP para:
1. Get summary with __CONSOLE_HELPER__.getSummary()
2. Get errors with __CONSOLE_HELPER__.getErrors(10)
3. Get Materials logs with __CONSOLE_HELPER__.getByModule('Materials', 20)
4. Analiza y sugiere fix
```

---

## 🧪 4. Integración con React DevTools

### Setup

1. Instalar React Developer Tools extension
2. Abrir DevTools (`F12`)
3. Ir a pestaña **Components** o **Profiler**

### Workflow: Components + ConsoleHelper

```javascript
// 1. Seleccionar componente en React DevTools
// 2. En Console, acceder a componente seleccionado

console.log('Selected:', $r);
console.log('Type:', $r.type.name);

// 3. Ver logs de ese componente
__CONSOLE_HELPER__.getByModule($r.type.name, 20)

// 4. Ver renders
__CONSOLE_HELPER__.search($r.type.name, 50).filter(log => 
  log.message.includes('RENDER')
)
```

### Workflow: Profiler + ConsoleHelper

**Setup Profiling**:
```javascript
// 1. React DevTools > Profiler
// 2. Limpiar logs
__CONSOLE_HELPER__.clear()

// 3. Start Recording (círculo azul)
// 4. Interactuar con app
// 5. Stop Recording (círculo rojo)
```

**Análisis Post-Profiling**:
```javascript
// Correlacionar Profiler timeline con logs
const profilingDuration = 30; // Ajustar según duración real
const logs = __CONSOLE_HELPER__.getFiltered({
  since: Date.now() - (profilingDuration * 1000),
  limit: 100
});

// Ver timeline
console.table(logs.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString(),
  module: log.module,
  message: log.message.substring(0, 50),
  level: log.level
})));

// Export para análisis
const profilingReport = {
  duration: `${profilingDuration}s`,
  totalLogs: logs.length,
  topModules: __CONSOLE_HELPER__.getTopModules(10),
  renders: __CONSOLE_HELPER__.search('RENDER', 50),
  errors: __CONSOLE_HELPER__.getErrors(10)
};

copy(JSON.stringify(profilingReport, null, 2));
```

---

## 📊 5. Integración con Performance Monitor

G-Mini tiene un sistema de performance monitoring integrado.

### Access Performance Data

```javascript
// En Chrome DevTools Console
window.__PERFORMANCE_MONITOR__
```

### Combinar Performance + ConsoleHelper

```javascript
// Get performance metrics
const perfMetrics = window.__PERFORMANCE_MONITOR__.getMetrics();

// Get logs de performance
const perfLogs = __CONSOLE_HELPER__.getByDomain('Performance', 30);

// Combinar en report
const perfReport = {
  metrics: perfMetrics,
  logs: __CONSOLE_HELPER__.exportForAI({ 
    domain: 'Performance',
    limit: 30
  }),
  slowOperations: __CONSOLE_HELPER__.search('ms', 20).filter(log => {
    const match = log.message.match(/(\d+)ms/);
    return match && parseInt(match[1]) > 100;
  })
};

console.log('Performance Report:', perfReport);
```

---

## 🤖 6. Integración con CI/CD Pipeline

### Ejemplo: GitHub Actions

Aunque ConsoleHelper es para desarrollo, puedes usarlo en tests E2E:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start dev server
        run: pnpm dev &
        env:
          NODE_ENV: development
      
      - name: Run Playwright tests
        run: pnpm test:e2e
      
      - name: Collect ConsoleHelper logs
        if: failure()
        run: |
          # Script para extraer logs de ConsoleHelper
          node scripts/extract-console-logs.js
```

### Script: extract-console-logs.js

```javascript
// scripts/extract-console-logs.js
const { chromium } = require('playwright');

async function extractLogs() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  
  // Wait for ConsoleHelper to initialize
  await page.waitForFunction(() => 
    window.__CONSOLE_HELPER__ && window.__CONSOLE_HELPER__.isActive()
  );
  
  // Get logs
  const logs = await page.evaluate(() => {
    return window.__CONSOLE_HELPER__.exportForAI({ limit: 100 });
  });
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    'console-logs.json',
    JSON.stringify(logs, null, 2)
  );
  
  console.log(`Extracted ${logs.length} logs to console-logs.json`);
  
  await browser.close();
}

extractLogs();
```

---

## 🔧 7. Integración con Testing Framework

### Vitest + ConsoleHelper

```typescript
// tests/setup.ts
import { beforeEach, afterEach } from 'vitest';
import { ConsoleHelper } from '@/lib/logging/ConsoleHelper';

beforeEach(() => {
  // Initialize ConsoleHelper en tests
  if (typeof window !== 'undefined') {
    ConsoleHelper.init();
  }
});

afterEach(() => {
  // Export logs si el test falla
  if (typeof window !== 'undefined' && window.__CONSOLE_HELPER__) {
    const logs = window.__CONSOLE_HELPER__.exportFull(50);
    if (logs.length > 0) {
      console.log('Test logs:', logs);
    }
  }
});
```

### Playwright + ConsoleHelper

```typescript
// tests/e2e/materials.spec.ts
import { test, expect } from '@playwright/test';

test('Materials page loads without errors', async ({ page }) => {
  await page.goto('http://localhost:5173/admin/materials');
  
  // Wait for ConsoleHelper
  await page.waitForFunction(() => 
    window.__CONSOLE_HELPER__ && window.__CONSOLE_HELPER__.isActive()
  );
  
  // Check for errors
  const errors = await page.evaluate(() => 
    window.__CONSOLE_HELPER__.getErrors(10)
  );
  
  expect(errors).toHaveLength(0);
  
  // If errors exist, log them
  if (errors.length > 0) {
    console.log('Errors found:', errors);
  }
});
```

---

## 📱 8. Integración con Mobile Debugging

### Remote Debugging Setup

Si estás debuggeando en mobile (Android Chrome):

```bash
# 1. Enable USB debugging en Android
# 2. Connect device
# 3. Chrome DevTools > Remote Devices

# 4. Inspect device
# 5. En Console:
__CONSOLE_HELPER__.isActive()
```

### Mobile-Specific Logging

```javascript
// En mobile, memory es limitado
// Usar límites más bajos
const mobileLogs = __CONSOLE_HELPER__.exportForAI({ limit: 20 });

// Export compacto para compartir
const mobileReport = {
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.getErrors(5),
  device: navigator.userAgent
};

// Copy y pegar en Slack/email
copy(JSON.stringify(mobileReport));
```

---

## 🔗 9. Integración con Monitoring Services

### Sentry Integration

```typescript
// src/lib/logging/sentry-integration.ts
import * as Sentry from '@sentry/react';

// Export ConsoleHelper logs to Sentry on error
if (typeof window !== 'undefined') {
  window.addEventListener('error', () => {
    if (window.__CONSOLE_HELPER__) {
      const logs = window.__CONSOLE_HELPER__.exportForAI({ 
        level: 'error',
        limit: 20
      });
      
      Sentry.setContext('console_logs', { logs });
    }
  });
}
```

### Custom Analytics

```typescript
// src/lib/analytics/console-analytics.ts
export function sendLogsToAnalytics() {
  if (!window.__CONSOLE_HELPER__) return;
  
  const summary = window.__CONSOLE_HELPER__.getSummary();
  
  // Send to your analytics service
  analytics.track('console_summary', {
    total: summary.total,
    errors: summary.errors,
    warnings: summary.warnings,
    topModule: summary.topModule
  });
}

// Call periodically
setInterval(sendLogsToAnalytics, 60000); // Every minute
```

---

## 📚 10. Integración con Documentation Tools

### JSDoc Comments

```typescript
/**
 * MaterialsStore - Manages materials inventory
 * 
 * @debug Use ConsoleHelper to inspect:
 * ```javascript
 * __CONSOLE_HELPER__.getByModule('MaterialsStore', 20)
 * ```
 * 
 * @troubleshooting If materials don't load:
 * 1. Check errors: `__CONSOLE_HELPER__.getErrors(10)`
 * 2. Check API logs: `__CONSOLE_HELPER__.getByDomain('Network', 20)`
 */
export const useMaterialsStore = create<MaterialsState>()(/*...*/);
```

### Storybook Integration

```typescript
// .storybook/preview.ts
export const decorators = [
  (Story) => {
    // Initialize ConsoleHelper en Storybook
    useEffect(() => {
      if (typeof window !== 'undefined') {
        import('@/lib/logging/ConsoleHelper').then(({ ConsoleHelper }) => {
          ConsoleHelper.init();
        });
      }
    }, []);
    
    return <Story />;
  }
];
```

---

## 🎯 Integration Cheatsheet

| Sistema | Comando | Propósito |
|---------|---------|-----------|
| **Logger** | `logger.info()` → capturado | Logging estructurado |
| **EventBus** | `getByModule('EventBus')` | Monitor event flow |
| **MCP** | `evaluate_script(...)` | IA debugging |
| **React DevTools** | `$r` + `getByModule()` | Component inspection |
| **Performance** | `getByDomain('Performance')` | Perf monitoring |
| **CI/CD** | Playwright script | Automated testing |
| **Mobile** | Remote debugging | Mobile issues |
| **Sentry** | Error event listener | Production monitoring |

---

**Próximo**: Lee [06-ADVANCED.md](./06-ADVANCED.md) para funcionalidades avanzadas.
