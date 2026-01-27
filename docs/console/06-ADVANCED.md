# 🎧 ConsoleHelper - Advanced Features

## 🚀 Funcionalidades Avanzadas y Edge Cases

Esta guía documenta features avanzadas, optimizaciones y troubleshooting profundo.

---

## 🎯 1. Filtrado Complejo Multi-Criterio

### Filtros Combinados

```javascript
// Combinación de TODOS los filtros
const complexLogs = __CONSOLE_HELPER__.getFiltered({
  level: 'error',               // Solo errores
  module: 'Materials',          // Módulo Materials
  domain: 'Business',           // Dominio Business
  search: 'failed',             // Que contengan "failed"
  since: Date.now() - 120000,   // Últimos 2 minutos
  limit: 30                     // Max 30 resultados
});
```

### Filtros con Regex (manual)

ConsoleHelper no soporta regex directamente, pero puedes filtrar después:

```javascript
const logs = __CONSOLE_HELPER__.getFiltered({ limit: 100 });

// Filtrar con regex
const filteredLogs = logs.filter(log => 
  /failed|error|timeout/i.test(log.message)
);

console.table(filteredLogs);
```

### Filtros por Timestamp Range

```javascript
// Entre dos timestamps específicos
const startTime = Date.parse('2025-01-15T14:30:00');
const endTime = Date.parse('2025-01-15T14:35:00');

const rangeLogs = __CONSOLE_HELPER__.getFiltered({ limit: 1000 })
  .filter(log => 
    log.timestamp >= startTime && log.timestamp <= endTime
  );
```

---

## 📊 2. Análisis Estadístico Avanzado

### Distribución Temporal

```javascript
// Agrupa logs por minuto
function analyzeLogDistribution() {
  const logs = __CONSOLE_HELPER__.exportFull(1000);
  
  const byMinute = {};
  logs.forEach(log => {
    const minute = new Date(log.timestamp).toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    byMinute[minute] = (byMinute[minute] || 0) + 1;
  });
  
  console.table(Object.entries(byMinute).map(([time, count]) => ({
    time,
    count,
    bar: '█'.repeat(Math.min(count, 50))
  })));
}

analyzeLogDistribution();
```

### Detección de Patrones

```javascript
// Detecta logs repetitivos (posible loop)
function detectRepeatingPatterns() {
  const logs = __CONSOLE_HELPER__.getRecent(10, 100);
  
  const patterns = new Map();
  logs.forEach(log => {
    const key = `${log.module}:${log.message.substring(0, 30)}`;
    patterns.set(key, (patterns.get(key) || 0) + 1);
  });
  
  // Logs que se repiten >5 veces en 10s
  const repeating = Array.from(patterns.entries())
    .filter(([_, count]) => count > 5)
    .sort((a, b) => b[1] - a[1]);
  
  if (repeating.length > 0) {
    console.warn('🔁 Repeating patterns detected:');
    console.table(repeating.map(([pattern, count]) => ({
      pattern,
      count,
      severity: count > 20 ? '🔴 Critical' : count > 10 ? '⚠️ High' : '⚠️ Medium'
    })));
  }
}

detectRepeatingPatterns();
```

### Análisis de Performance

```javascript
// Extrae duraciones de mensajes con "ms"
function analyzePerformance() {
  const logs = __CONSOLE_HELPER__.search('ms', 50);
  
  const durations = logs
    .map(log => {
      const match = log.message.match(/(\d+)ms/);
      return match ? {
        module: log.module,
        message: log.message,
        duration: parseInt(match[1])
      } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.duration - a.duration);
  
  console.log('=== SLOW OPERATIONS ===');
  console.table(durations.slice(0, 10));
  
  const avgDuration = durations.reduce((sum, d) => sum + d.duration, 0) / durations.length;
  console.log(`Average duration: ${avgDuration.toFixed(0)}ms`);
}

analyzePerformance();
```

---

## 🔧 3. Custom Export Formats

### Markdown Export

```javascript
function exportToMarkdown(options = {}) {
  const logs = __CONSOLE_HELPER__.exportForAI(options);
  
  const markdown = `# Console Logs Report

**Generated**: ${new Date().toISOString()}
**Total logs**: ${logs.length}

## Logs

| Time | Level | Module | Message |
|------|-------|--------|---------|
${logs.map(log => 
  `| ${log.time} | ${log.lvl} | ${log.mod} | ${log.msg} |`
).join('\n')}

`;
  
  copy(markdown);
  console.log('Markdown copied to clipboard ✅');
  return markdown;
}

// Usage
exportToMarkdown({ level: 'error' });
```

### HTML Export

```javascript
function exportToHTML(options = {}) {
  const logs = __CONSOLE_HELPER__.exportForAI(options);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Console Logs - ${new Date().toISOString()}</title>
  <style>
    body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #444; padding: 8px; text-align: left; }
    th { background: #2d2d2d; }
    .error { color: #f48771; }
    .warn { color: #dcdcaa; }
    .info { color: #4fc1ff; }
    .debug { color: #6a9955; }
  </style>
</head>
<body>
  <h1>Console Logs Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <table>
    <tr>
      <th>Time</th>
      <th>Level</th>
      <th>Module</th>
      <th>Domain</th>
      <th>Message</th>
    </tr>
    ${logs.map(log => `
    <tr class="${log.lvl.toLowerCase()}">
      <td>${log.time}</td>
      <td>${log.lvl}</td>
      <td>${log.mod}</td>
      <td>${log.dom}</td>
      <td>${log.msg}</td>
    </tr>
    `).join('')}
  </table>
</body>
</html>
`;
  
  // Download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `console-logs-${Date.now()}.html`;
  a.click();
  
  console.log('HTML report downloaded ✅');
}

// Usage
exportToHTML({ level: 'error' });
```

---

## 🎨 4. Visualización Avanzada

### Timeline Visualization

```javascript
function visualizeTimeline(options = {}) {
  const logs = __CONSOLE_HELPER__.getFiltered(options);
  
  console.log('=== TIMELINE ===');
  
  logs.forEach(log => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const levelIcon = {
      error: '🔴',
      warn: '⚠️',
      info: '🔵',
      debug: '⚪'
    }[log.level];
    
    console.log(
      `${time} ${levelIcon} ${log.module.padEnd(20)} │ ${log.message.substring(0, 60)}`
    );
  });
}

// Usage
visualizeTimeline({ since: Date.now() - 30000, limit: 30 });
```

### Activity Heatmap

```javascript
function showActivityHeatmap() {
  const stats = __CONSOLE_HELPER__.getStats();
  
  console.log('=== ACTIVITY HEATMAP ===\n');
  
  // By Level
  console.log('By Level:');
  Object.entries(stats.byLevel).forEach(([level, count]) => {
    const bar = '█'.repeat(Math.min(count, 50));
    console.log(`${level.padEnd(6)} ${bar} ${count}`);
  });
  
  console.log('\nBy Module (Top 10):');
  Object.entries(stats.byModule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([module, count]) => {
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`${module.padEnd(20)} ${bar} ${count}`);
    });
  
  console.log('\nBy Domain:');
  Object.entries(stats.byDomain)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      const bar = '█'.repeat(Math.min(count, 40));
      console.log(`${domain.padEnd(15)} ${bar} ${count}`);
    });
}

showActivityHeatmap();
```

---

## 🔍 5. Advanced Search Techniques

### Multi-Pattern Search

```javascript
function multiSearch(patterns, options = {}) {
  const allResults = new Map();
  
  patterns.forEach(pattern => {
    const logs = __CONSOLE_HELPER__.search(pattern, options.limit || 50);
    logs.forEach(log => {
      const key = `${log.timestamp}-${log.module}`;
      if (!allResults.has(key)) {
        allResults.set(key, { ...log, matchedPatterns: [] });
      }
      allResults.get(key).matchedPatterns.push(pattern);
    });
  });
  
  return Array.from(allResults.values());
}

// Usage: Buscar logs con múltiples keywords
const results = multiSearch(['error', 'failed', 'timeout', 'network']);
console.table(results.map(r => ({
  module: r.module,
  message: r.message.substring(0, 40),
  patterns: r.matchedPatterns.join(', ')
})));
```

### Fuzzy Search

```javascript
// Simple fuzzy search (Levenshtein distance)
function fuzzySearch(query, threshold = 3) {
  const logs = __CONSOLE_HELPER__.getFiltered({ limit: 200 });
  
  function levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
  
  return logs.filter(log => {
    const words = log.message.toLowerCase().split(' ');
    return words.some(word => levenshtein(query.toLowerCase(), word) <= threshold);
  });
}

// Usage: Encuentra "navigasion" cuando buscas "navigation"
const results = fuzzySearch('navigasion', 2);
```

---

## 🛠️ 6. Performance Optimization

### Debounce Configuration (Advanced)

ConsoleHelper tiene debouncing integrado (500ms). Para ajustarlo, debes modificar el código fuente:

```typescript
// src/lib/logging/ConsoleHelper.ts (línea 82)
private static DEBOUNCE_TIME = 1000; // Cambiar de 500 a 1000ms
```

### Memory Management

```javascript
// Monitoreo de uso de memoria
function checkMemoryUsage() {
  const logs = __CONSOLE_HELPER__.exportFull(1000);
  const jsonSize = JSON.stringify(logs).length;
  const sizeKB = (jsonSize / 1024).toFixed(2);
  
  console.log(`📊 ConsoleHelper Memory Usage:`);
  console.log(`  Total logs: ${logs.length}`);
  console.log(`  JSON size: ${sizeKB} KB`);
  console.log(`  Avg per log: ${(jsonSize / logs.length).toFixed(0)} bytes`);
  
  if (jsonSize > 500000) {
    console.warn('⚠️ Memory usage high! Consider clearing logs.');
  }
}

checkMemoryUsage();
```

### Selective Capture (Custom Implementation)

```javascript
// Capturar solo ciertos módulos (requires source modification)
// Este es un concepto - no implementado por defecto

// Ejemplo: Solo capturar errores y warnings de módulos críticos
const CRITICAL_MODULES = ['Materials', 'Sales', 'EventBus'];

// En ConsoleHelper.capture() agregar:
if (level === 'debug' || level === 'info') {
  if (!CRITICAL_MODULES.some(m => module.includes(m))) {
    return; // Skip non-critical debug/info logs
  }
}
```

---

## 🐛 7. Troubleshooting Avanzado

### Problema: Logs duplicados

**Causa**: React Strict Mode renderiza 2x en desarrollo

**Detección**:
```javascript
const logs = __CONSOLE_HELPER__.getRecent(5, 50);
const duplicates = new Map();

logs.forEach(log => {
  const key = `${log.module}:${log.message}`;
  duplicates.set(key, (duplicates.get(key) || 0) + 1);
});

const potentialDuplicates = Array.from(duplicates.entries())
  .filter(([_, count]) => count > 1);

if (potentialDuplicates.length > 0) {
  console.warn('⚠️ Potential duplicates detected:');
  console.table(potentialDuplicates);
}
```

**Solución**: Es comportamiento esperado en React Strict Mode. Disable en production.

### Problema: Logs no se capturan

**Debug**:
```javascript
// 1. Verificar interceptor
console.log('Interceptor installed:', __CONSOLE_HELPER__.isActive());

// 2. Test manual
console.log('TEST LOG');
setTimeout(() => {
  const recentLogs = __CONSOLE_HELPER__.getRecent(1, 10);
  console.log('Captured logs:', recentLogs.length);
}, 100);

// 3. Verificar que logger esté configurado
console.log('Logger config:', window.__GADMIN_LOGGER__?.getConfig());
```

### Problema: Alto uso de CPU

**Causa**: Demasiados logs por segundo (>100/s)

**Diagnóstico**:
```javascript
// Medir log rate
let lastCount = 0;
const measureRate = setInterval(() => {
  const currentCount = __CONSOLE_HELPER__.getSummary().total;
  const rate = currentCount - lastCount;
  console.log(`📊 Log rate: ${rate} logs/second`);
  
  if (rate > 100) {
    console.error('🔴 HIGH LOG RATE! Possible infinite loop.');
    __CONSOLE_HELPER__.getTopModules(5).forEach(m => {
      console.error(`  - ${m.module}: ${m.count} logs`);
    });
  }
  
  lastCount = currentCount;
}, 1000);

// Detener después de 10 segundos
setTimeout(() => clearInterval(measureRate), 10000);
```

---

## 🎯 8. Custom Utilities

### Create Custom Dashboard

```javascript
// Custom dashboard con métricas específicas
class ConsoleDashboard {
  constructor() {
    this.intervalId = null;
  }
  
  start() {
    this.intervalId = setInterval(() => {
      console.clear();
      
      const summary = __CONSOLE_HELPER__.getSummary();
      const stats = __CONSOLE_HELPER__.getStats();
      const topModules = __CONSOLE_HELPER__.getTopModules(5);
      const recentErrors = __CONSOLE_HELPER__.getErrors(3);
      
      console.log('╔════════════════════════════════╗');
      console.log('║   CONSOLE HELPER DASHBOARD    ║');
      console.log('╠════════════════════════════════╣');
      console.log(`║ Uptime:    ${summary.uptime.padEnd(19)}║`);
      console.log(`║ Total:     ${String(summary.total).padEnd(19)}║`);
      console.log(`║ Errors:    ${String(summary.errors).padEnd(19)}║`);
      console.log(`║ Warnings:  ${String(summary.warnings).padEnd(19)}║`);
      console.log(`║ Last 60s:  ${String(stats.last60s).padEnd(19)}║`);
      console.log('╚════════════════════════════════╝\n');
      
      console.log('🔥 Top Modules:');
      console.table(topModules);
      
      if (recentErrors.length > 0) {
        console.log('\n🚨 Recent Errors:');
        console.table(recentErrors.map(e => ({
          time: new Date(e.timestamp).toLocaleTimeString(),
          module: e.module,
          message: e.message.substring(0, 50)
        })));
      }
      
    }, 5000);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('Dashboard stopped');
    }
  }
}

// Usage
const dashboard = new ConsoleDashboard();
dashboard.start();

// Detener
// dashboard.stop();
```

### Log Differ

```javascript
// Comparar logs antes/después de un cambio
class LogDiffer {
  constructor() {
    this.snapshot = null;
  }
  
  takeSnapshot() {
    this.snapshot = __CONSOLE_HELPER__.exportFull(1000);
    console.log(`📸 Snapshot taken: ${this.snapshot.length} logs`);
  }
  
  compare() {
    if (!this.snapshot) {
      console.error('❌ No snapshot taken. Call takeSnapshot() first.');
      return;
    }
    
    const current = __CONSOLE_HELPER__.exportFull(1000);
    const snapshotIds = new Set(this.snapshot.map(l => l.timestamp));
    
    const newLogs = current.filter(l => !snapshotIds.has(l.timestamp));
    
    console.log(`📊 Comparison Results:`);
    console.log(`  Snapshot:  ${this.snapshot.length} logs`);
    console.log(`  Current:   ${current.length} logs`);
    console.log(`  New:       ${newLogs.length} logs\n`);
    
    if (newLogs.length > 0) {
      console.log('📝 New logs since snapshot:');
      console.table(newLogs.map(l => ({
        time: new Date(l.timestamp).toLocaleTimeString(),
        level: l.level,
        module: l.module,
        message: l.message.substring(0, 50)
      })));
    }
    
    return newLogs;
  }
}

// Usage
const differ = new LogDiffer();

// Antes del cambio
differ.takeSnapshot();

// Aplicar cambio, navegar, interactuar...

// Después del cambio
differ.compare();
```

---

## 📚 9. Best Practices

### DO ✅

1. **Limpiar periódicamente**
   ```javascript
   // Cada hora
   setInterval(() => {
     const backup = __CONSOLE_HELPER__.exportFull(100);
     localStorage.setItem('logs-backup', JSON.stringify(backup));
     __CONSOLE_HELPER__.clear();
   }, 3600000);
   ```

2. **Usar filtros específicos**
   ```javascript
   // Específico ✅
   __CONSOLE_HELPER__.exportForAI({ level: 'error', module: 'Materials' })
   
   // Genérico ❌
   __CONSOLE_HELPER__.exportFull(1000)
   ```

3. **Combinar con otros tools**
   ```javascript
   // React DevTools + ConsoleHelper
   __CONSOLE_HELPER__.getByModule($r.type.name, 20)
   ```

### DON'T ❌

1. **No usar en producción**
   ```javascript
   // ConsoleHelper está disabled en production por defecto
   // No intentar habilitarlo
   ```

2. **No exportar demasiados logs**
   ```javascript
   // ❌ Demasiados tokens
   __CONSOLE_HELPER__.exportFull(5000)
   
   // ✅ Filtrado y limitado
   __CONSOLE_HELPER__.exportForAI({ limit: 50 })
   ```

3. **No confiar en timestamps exactos**
   ```javascript
   // Los timestamps son aprox, pueden variar ±10ms
   // No usar para micro-benchmarking
   ```

---

## 🎓 10. Advanced Recipes

### Recipe: Auto-report on Error

```javascript
// Automatically export report when error occurs
let lastErrorCount = 0;

setInterval(() => {
  const currentErrors = __CONSOLE_HELPER__.getSummary().errors;
  
  if (currentErrors > lastErrorCount) {
    console.warn('🚨 New error detected! Auto-generating report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: __CONSOLE_HELPER__.getSummary(),
      errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 10 }),
      context: __CONSOLE_HELPER__.getRecent(10, 30)
    };
    
    // Download report
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    
    console.log('✅ Report downloaded');
  }
  
  lastErrorCount = currentErrors;
}, 3000);
```

### Recipe: Performance Regression Detection

```javascript
// Detect if navigation is getting slower
const perfBaseline = {
  materials: 500,  // 500ms baseline
  sales: 600,
  products: 700
};

function checkPerformanceRegression() {
  __CONSOLE_HELPER__.search('ms', 50).forEach(log => {
    const match = log.message.match(/(\d+)ms/);
    if (!match) return;
    
    const duration = parseInt(match[1]);
    const module = log.module.toLowerCase();
    
    for (const [key, baseline] of Object.entries(perfBaseline)) {
      if (module.includes(key) && duration > baseline * 1.5) {
        console.error(`🔴 PERFORMANCE REGRESSION: ${log.module}`);
        console.error(`  Expected: <${baseline}ms`);
        console.error(`  Actual: ${duration}ms`);
        console.error(`  Message: ${log.message}`);
      }
    }
  });
}

// Run after navigation
setTimeout(checkPerformanceRegression, 2000);
```

---

**Próximo**: Lee [07-AI-OPTIMIZATION.md](./07-AI-OPTIMIZATION.md) para optimización específica para IA.
