# 🎧 MCP CHROME DEVTOOLS - DEBUGGING GUIDE

**Para**: Auditoría de Navegación y Performance  
**Sistema**: G-Mini v3.1 con ConsoleHelper integrado  
**Fecha**: 12 de Noviembre, 2025

---

## 🚀 QUICK START

### 1. Iniciar Dev Server
```powershell
pnpm dev
```

### 2. Abrir Chrome DevTools
- Abrir `http://localhost:5173`
- Presionar `F12` o `Ctrl+Shift+I`
- Ir a pestaña **Console**

### 3. Verificar ConsoleHelper
```javascript
// Debe aparecer automáticamente al cargar:
// "🎧 Console Helper Available"

// Verificar que está activo:
__CONSOLE_HELPER__.isActive()
// → true
```

---

## 🔍 COMMANDS ESENCIALES

### **📊 Stats Rápidos**
```javascript
// Resumen de logging (minimal tokens)
__CONSOLE_HELPER__.getSummary()
/* Retorna:
{
  active: true,
  total: 150,
  errors: 2,
  warnings: 5,
  topModule: 'NavigationContext',
  uptime: '45s'
}
*/

// Stats detallados
__CONSOLE_HELPER__.getStats()
/* Retorna:
{
  total: 150,
  last60s: 45,
  byLevel: { debug: 20, info: 15, warn: 5, error: 2 },
  byModule: { NavigationContext: 12, Materials: 8, ... },
  byDomain: { Core: 15, Business: 10, ... }
}
*/
```

---

### **❌ Debug Errors**
```javascript
// Últimos 10 errores
__CONSOLE_HELPER__.getErrors(10)

// Últimos 20 warnings
__CONSOLE_HELPER__.getWarnings(20)

// Buscar error específico
__CONSOLE_HELPER__.search('failed', 30)
```

---

### **🧭 Debug NavigationContext**
```javascript
// Logs del NavigationContext
__CONSOLE_HELPER__.getByModule('NavigationContext', 20)

// Por dominio
__CONSOLE_HELPER__.getByDomain('Core', 20)

// Últimos 10 segundos
__CONSOLE_HELPER__.getRecent(10, 50)
```

---

### **📦 Export para AI Analysis**
```javascript
// Optimizado: 90% menos tokens
__CONSOLE_HELPER__.exportForAI({ 
  level: 'error',
  limit: 50 
})

// Con filtros
__CONSOLE_HELPER__.exportForAI({
  module: 'NavigationContext',
  since: Date.now() - 60000, // Último minuto
  limit: 30
})
```

---

### **🔥 Top Módulos con Más Logs**
```javascript
__CONSOLE_HELPER__.getTopModules(5)
/* Retorna:
[
  { module: 'NavigationContext', count: 25, domain: 'Core' },
  { module: 'MaterialsStore', count: 18, domain: 'Stores' },
  { module: 'EventBus', count: 15, domain: 'EventBus' },
  ...
]
*/
```

---

### **🧹 Cleanup**
```javascript
// Limpiar logs capturados
__CONSOLE_HELPER__.clear()

// Exportar antes de limpiar
const backup = __CONSOLE_HELPER__.exportFull(100);
console.log('Backup saved:', backup.length, 'logs');
__CONSOLE_HELPER__.clear();
```

---

## 🎯 ESCENARIOS DE USO

### **Scenario 1: Debug Re-renders Infinitos**
```javascript
// 1. Recargar página
location.reload();

// 2. Esperar 5 segundos sin tocar nada

// 3. Ver logs recientes
__CONSOLE_HELPER__.getRecent(5, 100)

// 4. Filtrar por NavigationContext
__CONSOLE_HELPER__.getByModule('NavigationContext', 50)

// 5. Buscar "Context dependencies changed"
__CONSOLE_HELPER__.search('dependencies changed', 30)
```

**Qué buscar**:
- ✅ 1-3 logs = Normal
- ⚠️ 10+ logs = Posible problema
- ❌ Logs constantes = Re-render infinito

---

### **Scenario 2: Debug Navigation Lenta**
```javascript
// 1. Configurar logger para ver performance
__GADMIN_LOGGER__.configure({
  modules: new Set(['NavigationContext']),
  level: 'performance',
  performanceThreshold: 100 // Solo operaciones >100ms
});

// 2. Navegar a Materials
// (hacer click en sidebar)

// 3. Ver performance logs
__CONSOLE_HELPER__.getByModule('NavigationContext', 20)

// 4. Export para análisis
const perfData = __CONSOLE_HELPER__.exportForAI({
  module: 'NavigationContext',
  since: Date.now() - 10000 // Últimos 10 segundos
});
console.table(perfData);
```

---

### **Scenario 3: Debug Errors de API**
```javascript
// 1. Ver todos los errores
const errors = __CONSOLE_HELPER__.getErrors(20);

// 2. Filtrar por API/Supabase
const apiErrors = errors.filter(e => 
  e.module.includes('API') || e.module.includes('Supabase')
);
console.table(apiErrors);

// 3. Export detallado
__CONSOLE_HELPER__.exportForAI({ level: 'error' })
```

---

### **Scenario 4: Monitoring en Tiempo Real**
```javascript
// Setup: Mostrar stats cada 5 segundos
const monitor = setInterval(() => {
  const stats = __CONSOLE_HELPER__.getSummary();
  console.clear();
  console.log('=== MONITORING ===');
  console.log(`Uptime: ${stats.uptime}`);
  console.log(`Total: ${stats.total} logs`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Warnings: ${stats.warnings}`);
  console.log(`Top Module: ${stats.topModule}`);
}, 5000);

// Detener monitoring
clearInterval(monitor);
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### **Logger Configuration**
```javascript
// Ver config actual
__GADMIN_LOGGER__.getConfig()

// Filtrar por módulos específicos
__GADMIN_LOGGER__.configure({
  modules: new Set([
    'NavigationContext',
    'EventBus',
    'MaterialsStore',
    'OfflineSync'
  ]),
  level: 'info',
  performanceThreshold: 200
});

// Solo errores y warnings
__GADMIN_LOGGER__.configure({
  modules: 'all',
  level: 'warn'
});

// Todo en debug
__GADMIN_LOGGER__.configure({
  modules: 'all',
  level: 'debug',
  performanceThreshold: 10
});
```

---

### **Filtrado Avanzado**
```javascript
// Filtros complejos con getFiltered()
__CONSOLE_HELPER__.getFiltered({
  level: 'error',
  module: 'Navigation',
  domain: 'Core',
  search: 'failed',
  limit: 50,
  since: Date.now() - 120000 // Últimos 2 minutos
});

// Por timeframe
const last5min = __CONSOLE_HELPER__.getFiltered({
  since: Date.now() - 300000,
  limit: 100
});
```

---

## 🎪 REACT DEVTOOLS INTEGRATION

### **Profiler + ConsoleHelper**
```javascript
// 1. Abrir React DevTools > Profiler
// 2. Start Recording (círculo azul)
// 3. Navegar a página problemática
// 4. Stop Recording (círculo rojo)
// 5. Correlacionar con logs:

const profilingLogs = __CONSOLE_HELPER__.getFiltered({
  since: Date.now() - 30000, // Ajustar según profiling duration
  module: 'NavigationContext'
});

console.table(profilingLogs.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString(),
  message: log.message.substring(0, 50),
  level: log.level
})));
```

---

### **Component Tree Inspection**
```javascript
// React DevTools expone:
$r // Selected component

// Combinar con ConsoleHelper:
console.log('Selected:', $r);
const moduleLogs = __CONSOLE_HELPER__.getByModule($r.type.name, 20);
console.table(moduleLogs);
```

---

## 📊 EXPORT STRATEGIES

### **1. Quick Summary (Slack/Email)**
```javascript
const summary = __CONSOLE_HELPER__.getSummary();
const errors = __CONSOLE_HELPER__.getErrors(5);

console.log(`
📊 Performance Summary:
- Total logs: ${summary.total}
- Errors: ${summary.errors}
- Top Module: ${summary.topModule}

Recent errors:
${errors.map(e => `- ${e.module}: ${e.message}`).join('\n')}
`);
```

---

### **2. Full Report (AI Analysis)**
```javascript
// Token-optimized export
const report = {
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 20 }),
  warnings: __CONSOLE_HELPER__.exportForAI({ level: 'warn', limit: 20 }),
  topModules: __CONSOLE_HELPER__.getTopModules(10),
  stats: __CONSOLE_HELPER__.getStats()
};

// Copy to clipboard (si available)
copy(JSON.stringify(report, null, 2));

// O download
const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `navigation-report-${Date.now()}.json`;
a.click();
```

---

### **3. CSV Export (Excel)**
```javascript
const logs = __CONSOLE_HELPER__.exportForAI({ limit: 100 });
const csv = [
  'Time,Level,Module,Domain,Message',
  ...logs.map(l => `${l.time},${l.lvl},${l.mod},${l.dom},"${l.msg}"`)
].join('\n');

// Download
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'logs.csv';
a.click();
```

---

## 🐛 TROUBLESHOOTING

### **ConsoleHelper no disponible**
```javascript
// Verificar NODE_ENV
console.log('ENV:', process.env.NODE_ENV); // Debe ser 'development'

// Verificar si se inicializó
console.log('Helper:', window.__CONSOLE_HELPER__);

// Re-inicializar manualmente
// (solo si algo falló)
// ConsoleHelper.init(); // No expuesto, revisar App.tsx línea 181
```

---

### **Logs no se capturan**
```javascript
// Verificar interceptor
__CONSOLE_HELPER__.isActive() // → debe ser true

// Ver logs capturados
__CONSOLE_HELPER__.getStats().total // → debe ser > 0

// Si es 0, revisar que logger.* se esté usando (no console.*)
```

---

### **Demasiados logs**
```javascript
// Limpiar
__CONSOLE_HELPER__.clear();

// Reducir captura configurando logger
__GADMIN_LOGGER__.configure({
  level: 'warn', // Solo warnings y errors
  modules: new Set(['NavigationContext']) // Solo este módulo
});
```

---

## 📚 REFERENCE CHEATSHEET

```javascript
// === CONSOLEHELPER ===
__CONSOLE_HELPER__.isActive()           // Check if active
__CONSOLE_HELPER__.getSummary()         // Quick stats
__CONSOLE_HELPER__.getStats()           // Detailed stats
__CONSOLE_HELPER__.getErrors(10)        // Last 10 errors
__CONSOLE_HELPER__.getWarnings(10)      // Last 10 warnings
__CONSOLE_HELPER__.getByModule('X', 20) // Module logs
__CONSOLE_HELPER__.getByDomain('X', 20) // Domain logs
__CONSOLE_HELPER__.getRecent(10, 50)    // Last 10 seconds
__CONSOLE_HELPER__.search('query', 30)  // Text search
__CONSOLE_HELPER__.exportForAI({})      // AI-optimized export
__CONSOLE_HELPER__.getTopModules(5)     // Top 5 modules
__CONSOLE_HELPER__.clear()              // Clear logs

// === LOGGER ===
__GADMIN_LOGGER__.getConfig()           // View config
__GADMIN_LOGGER__.configure({...})      // Update config

// === REACT DEVTOOLS ===
$r                                      // Selected component
$0                                      // Selected DOM element
```

---

**¿Preguntas?** Consulta `NAVIGATION_AUDIT_FINDINGS.md` para contexto completo.

*Generado: 12 de Noviembre, 2025*
