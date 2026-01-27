# 🎧 ConsoleHelper - Usage Patterns

## 🎯 Patrones de Uso Comunes para Debugging

Esta guía documenta patrones probados para resolver problemas comunes usando ConsoleHelper.

---

## 🔄 Pattern 1: Debug de Re-renders Infinitos

### Síntoma
- Página se congela o va lenta
- CPU al 100%
- Muchos logs apareciendo constantemente

### Diagnóstico con ConsoleHelper

**Step 1: Recargar y esperar**
```javascript
// Recargar página
location.reload();

// Esperar 5 segundos sin tocar nada
```

**Step 2: Ver logs recientes**
```javascript
// Últimos 5 segundos
__CONSOLE_HELPER__.getRecent(5, 100)
```

**Qué buscar**:
- ✅ **Normal**: 5-10 logs
- ⚠️ **Sospechoso**: 20-50 logs
- 🔴 **Problema**: 100+ logs

**Step 3: Identificar módulo problemático**
```javascript
__CONSOLE_HELPER__.getTopModules(10)
```

**Output esperado**:
```javascript
[
  { module: 'NavigationContext', count: 250, domain: 'Core' }, // 🔴 PROBLEMA
  { module: 'MaterialsStore', count: 12, domain: 'Stores' },   // ✅ Normal
  // ...
]
```

**Step 4: Analizar logs del módulo**
```javascript
__CONSOLE_HELPER__.getByModule('NavigationContext', 50)
```

**Buscar patrones**:
```javascript
// Buscar renders repetidos
__CONSOLE_HELPER__.search('RENDER #', 50)

// Buscar cambios de estado
__CONSOLE_HELPER__.search('CHANGED', 30)

// Buscar "dependencies changed"
__CONSOLE_HELPER__.search('dependencies', 30)
```

**Step 5: Export para análisis**
```javascript
const report = {
  topModules: __CONSOLE_HELPER__.getTopModules(10),
  renders: __CONSOLE_HELPER__.search('RENDER #', 50),
  changes: __CONSOLE_HELPER__.search('CHANGED', 30),
  moduleDetails: __CONSOLE_HELPER__.exportForAI({ 
    module: 'NavigationContext',
    limit: 50
  })
};

// Copy to Claude
copy(JSON.stringify(report, null, 2));
```

### Solución Común
Si encuentras `RENDER #250` en NavigationContext:
1. Revisar `useEffect` dependencies
2. Verificar que no haya setState en render loop
3. Usar `React.memo()` si corresponde

---

## ❌ Pattern 2: Debug de Errores de API

### Síntoma
- Requests fallan silenciosamente
- Data no carga
- Errores en consola de red

### Diagnóstico con ConsoleHelper

**Step 1: Ver todos los errores**
```javascript
const errors = __CONSOLE_HELPER__.getErrors(20);
console.table(errors);
```

**Step 2: Filtrar errores de API**
```javascript
// Buscar errores de red
__CONSOLE_HELPER__.search('failed', 30)
__CONSOLE_HELPER__.search('timeout', 30)
__CONSOLE_HELPER__.search('network', 30)

// Por módulo de red
__CONSOLE_HELPER__.getByDomain('Network', 20)
```

**Step 3: Analizar error específico**
```javascript
const apiErrors = __CONSOLE_HELPER__.getErrors(20).filter(e => 
  e.module.includes('API') || 
  e.module.includes('Supabase') ||
  e.domain === 'Network'
);

console.table(apiErrors.map(e => ({
  time: new Date(e.timestamp).toLocaleTimeString(),
  module: e.module,
  message: e.message.substring(0, 60),
  data: JSON.stringify(e.data).substring(0, 40)
})));
```

**Step 4: Ver contexto temporal**
```javascript
// Ver qué pasó antes del error
const firstError = apiErrors[0];
const contextLogs = __CONSOLE_HELPER__.getFiltered({
  since: firstError.timestamp - 5000,  // 5s antes
  limit: 30
});

console.table(contextLogs);
```

**Step 5: Export para IA**
```javascript
const apiReport = {
  errors: __CONSOLE_HELPER__.exportForAI({ 
    level: 'error',
    domain: 'Network'
  }),
  warnings: __CONSOLE_HELPER__.exportForAI({ 
    level: 'warn',
    domain: 'Network'
  }),
  context: __CONSOLE_HELPER__.exportForAI({
    since: Date.now() - 60000,
    limit: 50
  })
};

copy(JSON.stringify(apiReport, null, 2));
```

### Análisis Común
**Patrón**: Error "Failed to fetch materials"
```javascript
{
  level: 'error',
  module: 'MaterialsStore',
  message: 'Failed to fetch materials',
  data: { 
    error: 'Network timeout',
    url: '/api/materials',
    status: null
  }
}
```

**Causas posibles**:
1. Supabase RLS bloqueando request
2. Network timeout (lenta conexión)
3. Endpoint incorrecto
4. Auth token expirado

---

## 🚀 Pattern 3: Debug de Performance Lenta

### Síntoma
- Navegación tarda mucho
- Componentes tardan en cargar
- UI se siente sluggish

### Diagnóstico con ConsoleHelper

**Step 1: Configurar Logger para performance**
```javascript
// Ver solo operaciones lentas (>100ms)
window.__GADMIN_LOGGER__.configure({
  modules: 'all',
  level: 'info',
  performanceThreshold: 100
});
```

**Step 2: Navegar y capturar**
```javascript
// 1. Limpiar logs anteriores
__CONSOLE_HELPER__.clear();

// 2. Navegar a página lenta (ej: Materials)
// (hacer click en sidebar)

// 3. Esperar a que cargue completamente
```

**Step 3: Analizar timeline**
```javascript
// Ver logs de últimos 10 segundos
const timeline = __CONSOLE_HELPER__.getRecent(10, 100);

console.table(timeline.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString(),
  module: log.module,
  message: log.message.substring(0, 50),
  level: log.level
})));
```

**Step 4: Identificar bottlenecks**
```javascript
// Módulos más activos durante navegación
__CONSOLE_HELPER__.getTopModules(10)

// Buscar operaciones de performance
__CONSOLE_HELPER__.search('ms', 30)  // Mensajes con duración
__CONSOLE_HELPER__.search('slow', 20)
```

**Step 5: Export para IA**
```javascript
const perfReport = {
  summary: __CONSOLE_HELPER__.getSummary(),
  topModules: __CONSOLE_HELPER__.getTopModules(10),
  timeline: __CONSOLE_HELPER__.exportForAI({
    since: Date.now() - 15000,
    limit: 50
  }),
  renders: __CONSOLE_HELPER__.search('RENDER', 30)
};

copy(JSON.stringify(perfReport, null, 2));
```

### Análisis Común
**Patrón**: Navegación lenta a Materials

```javascript
// Timeline esperado ✅
[
  { time: "14:30:10.123", mod: "NavigationCont", msg: "Navigating to /admin/materials" },
  { time: "14:30:10.250", mod: "MaterialsStore", msg: "Fetching materials..." },
  { time: "14:30:10.820", mod: "MaterialsStore", msg: "Materials loaded (570ms)" },
  { time: "14:30:10.835", mod: "MaterialsPage", msg: "Page rendered" }
]

// Timeline con problema 🔴
[
  { time: "14:30:10.123", mod: "NavigationCont", msg: "Navigating..." },
  { time: "14:30:10.125", mod: "NavigationCont", msg: "RENDER #1" },
  { time: "14:30:10.127", mod: "NavigationCont", msg: "RENDER #2" },
  { time: "14:30:10.129", mod: "NavigationCont", msg: "RENDER #3" },
  // ... 50 más renders
  { time: "14:30:12.500", mod: "MaterialsPage", msg: "Page rendered" } // 2.4s después!
]
```

---

## 🧭 Pattern 4: Debug de Navegación

### Síntoma
- Navegación no funciona
- Página no cambia al hacer click
- URL cambia pero contenido no

### Diagnóstico con ConsoleHelper

**Step 1: Ver logs de navegación**
```javascript
// Todos los módulos de navegación
__CONSOLE_HELPER__.getByDomain('Core', 30)

// Específicamente NavigationContext
__CONSOLE_HELPER__.getByModule('Navigation', 20)
```

**Step 2: Reproducir problema**
```javascript
// 1. Limpiar logs
__CONSOLE_HELPER__.clear();

// 2. Hacer click en link problemático
// (ej: Sidebar > Materials)

// 3. Ver qué logs se generaron
__CONSOLE_HELPER__.getRecent(3, 50)
```

**Step 3: Buscar errores de navegación**
```javascript
// Buscar errores
__CONSOLE_HELPER__.search('error', 30)
__CONSOLE_HELPER__.search('failed', 30)

// Buscar warnings
__CONSOLE_HELPER__.getWarnings(20)
```

**Step 4: Verificar estado de navegación**
```javascript
// Ver cambios de estado
__CONSOLE_HELPER__.search('activeLocation', 20)
__CONSOLE_HELPER__.search('currentModule', 20)
```

**Step 5: Export completo**
```javascript
const navReport = {
  errors: __CONSOLE_HELPER__.getErrors(10),
  warnings: __CONSOLE_HELPER__.getWarnings(10),
  navigation: __CONSOLE_HELPER__.exportForAI({ 
    module: 'Navigation',
    limit: 30
  }),
  timeline: __CONSOLE_HELPER__.getRecent(5, 50)
};

copy(JSON.stringify(navReport, null, 2));
```

---

## 🎪 Pattern 5: Integración con React DevTools

### Profiler + ConsoleHelper

**Setup**:
1. Abrir React DevTools
2. Ir a pestaña **Profiler**
3. Click en **Start Recording** (círculo azul)

**Durante profiling**:
```javascript
// Mientras grabas en Profiler, los logs se capturan automáticamente
```

**Después de profiling**:
```javascript
// 1. Stop Recording (círculo rojo)
// 2. Ver qué logs se generaron durante ese tiempo

const profilingDuration = 30; // segundos que duró el profiling
const profilingLogs = __CONSOLE_HELPER__.getFiltered({
  since: Date.now() - (profilingDuration * 1000),
  limit: 100
});

// 3. Correlacionar con Profiler
console.table(profilingLogs.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString(),
  module: log.module,
  message: log.message.substring(0, 60),
  level: log.level
})));
```

**Análisis combinado**:
```javascript
// Buscar componente problemático en Profiler
// Ejemplo: ResponsiveLayout renderiza 45 veces

// Ver logs de ese componente
__CONSOLE_HELPER__.getByModule('ResponsiveLayout', 50)

// Buscar renders
__CONSOLE_HELPER__.search('ResponsiveLayout', 50).filter(log => 
  log.message.includes('RENDER')
)
```

### Component Inspector + ConsoleHelper

**Seleccionar componente**:
```javascript
// 1. React DevTools > Components
// 2. Seleccionar componente en árbol
// 3. En Console:

console.log('Selected component:', $r);
console.log('Component type:', $r.type.name);

// 4. Ver logs de ese componente
__CONSOLE_HELPER__.getByModule($r.type.name, 20)
```

---

## 📊 Pattern 6: Monitoreo en Tiempo Real

### Dashboard de Logs

```javascript
// Setup: Dashboard que se actualiza cada 5 segundos
const logMonitor = setInterval(() => {
  console.clear();
  
  const summary = __CONSOLE_HELPER__.getSummary();
  const topModules = __CONSOLE_HELPER__.getTopModules(5);
  const recentErrors = __CONSOLE_HELPER__.getErrors(3);
  
  console.log('=== LOG MONITOR ===');
  console.log(`⏱️ Uptime: ${summary.uptime}`);
  console.log(`📊 Total logs: ${summary.total}`);
  console.log(`❌ Errors: ${summary.errors}`);
  console.log(`⚠️ Warnings: ${summary.warnings}`);
  console.log(`🔥 Top module: ${summary.topModule}\n`);
  
  console.log('📈 Top 5 Modules:');
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

// Detener monitor
clearInterval(logMonitor);
```

### Alert System

```javascript
// Setup: Alertar cuando hay errores nuevos
let lastErrorCount = 0;

const errorMonitor = setInterval(() => {
  const currentErrorCount = __CONSOLE_HELPER__.getSummary().errors;
  
  if (currentErrorCount > lastErrorCount) {
    const newErrors = currentErrorCount - lastErrorCount;
    console.error(`🚨 ${newErrors} new error(s) detected!`);
    
    const errors = __CONSOLE_HELPER__.getErrors(newErrors);
    console.table(errors);
  }
  
  lastErrorCount = currentErrorCount;
}, 3000);

// Detener monitor
clearInterval(errorMonitor);
```

---

## 🔧 Pattern 7: Debugging de Stores (Zustand)

### Problema: Store no actualiza UI

**Step 1: Ver logs de stores**
```javascript
// Todos los stores
__CONSOLE_HELPER__.getByDomain('Stores', 30)

// Store específico
__CONSOLE_HELPER__.getByModule('MaterialsStore', 20)
```

**Step 2: Buscar actualizaciones**
```javascript
// Buscar "setState", "updated", "changed"
__CONSOLE_HELPER__.search('setState', 20)
__CONSOLE_HELPER__.search('updated', 20)
```

**Step 3: Verificar timing**
```javascript
// Ver timeline de store + componente
const storeLogs = __CONSOLE_HELPER__.getByModule('MaterialsStore', 20);
const componentLogs = __CONSOLE_HELPER__.getByModule('MaterialsPage', 20);

// Combinar y ordenar por timestamp
const combined = [...storeLogs, ...componentLogs]
  .sort((a, b) => a.timestamp - b.timestamp);

console.table(combined.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString(),
  module: log.module,
  message: log.message.substring(0, 50)
})));
```

---

## 🎯 Pattern 8: Export Strategies

### Strategy 1: Quick Summary (para Slack/Email)

```javascript
const summary = __CONSOLE_HELPER__.getSummary();
const errors = __CONSOLE_HELPER__.getErrors(5);

const quickReport = `
📊 G-Mini Performance Summary

⏱️ Uptime: ${summary.uptime}
📊 Total logs: ${summary.total}
❌ Errors: ${summary.errors}
⚠️ Warnings: ${summary.warnings}
🔥 Top module: ${summary.topModule}

${errors.length > 0 ? '🚨 Recent Errors:\n' + errors.map(e => 
  `- ${new Date(e.timestamp).toLocaleTimeString()} ${e.module}: ${e.message}`
).join('\n') : '✅ No errors'}
`;

console.log(quickReport);
copy(quickReport);
```

### Strategy 2: Full Report (para IA analysis)

```javascript
const fullReport = {
  timestamp: new Date().toISOString(),
  summary: __CONSOLE_HELPER__.getSummary(),
  stats: __CONSOLE_HELPER__.getStats(),
  topModules: __CONSOLE_HELPER__.getTopModules(10),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 20 }),
  warnings: __CONSOLE_HELPER__.exportForAI({ level: 'warn', limit: 20 }),
  recentActivity: __CONSOLE_HELPER__.exportForAI({ 
    since: Date.now() - 60000,
    limit: 50
  })
};

// Copy to Claude
copy(JSON.stringify(fullReport, null, 2));

// O download como JSON
const blob = new Blob([JSON.stringify(fullReport, null, 2)], { 
  type: 'application/json' 
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `g-mini-logs-${Date.now()}.json`;
a.click();
```

### Strategy 3: CSV Export (para Excel)

```javascript
const logs = __CONSOLE_HELPER__.exportForAI({ limit: 100 });
const csv = [
  'Time,Level,Module,Domain,Message,Data',
  ...logs.map(l => 
    `${l.time},${l.lvl},${l.mod},${l.dom},"${l.msg}","${l.data || ''}"`
  )
].join('\n');

const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `logs-${Date.now()}.csv`;
a.click();
```

---

## 💡 Tips Avanzados

### Tip 1: Backup antes de limpiar
```javascript
const backup = __CONSOLE_HELPER__.exportFull(1000);
localStorage.setItem('logs-backup', JSON.stringify(backup));
__CONSOLE_HELPER__.clear();

// Restaurar (manual - ConsoleHelper no tiene "restore")
const savedLogs = JSON.parse(localStorage.getItem('logs-backup'));
console.table(savedLogs);
```

### Tip 2: Filtros complejos
```javascript
// Errores de módulos específicos en últimos 2 minutos
const complexFilter = __CONSOLE_HELPER__.getFiltered({
  level: 'error',
  module: 'Materials',
  domain: 'Business',
  since: Date.now() - 120000,
  limit: 50
});
```

### Tip 3: Comparar antes/después
```javascript
// Antes de fix
const beforeFix = __CONSOLE_HELPER__.exportForAI({ module: 'Navigation' });

// Aplicar fix...

// Limpiar logs
__CONSOLE_HELPER__.clear();

// Reproducir escenario...

// Después de fix
const afterFix = __CONSOLE_HELPER__.exportForAI({ module: 'Navigation' });

// Comparar
console.log('Before:', beforeFix.length, 'logs');
console.log('After:', afterFix.length, 'logs');
```

---

**Próximo**: Lee [05-INTEGRATION.md](./05-INTEGRATION.md) para integrar con otras herramientas.
