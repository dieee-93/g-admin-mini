# 🎧 ConsoleHelper - Quick Start

## 🚀 Guía Rápida de Inicio (5 minutos)

Esta guía te enseña a usar ConsoleHelper desde cero en 5 minutos.

---

## 📋 Pre-requisitos

- ✅ G-Mini v3.1 corriendo en modo desarrollo
- ✅ Chrome/Edge/Firefox con DevTools
- ✅ `pnpm dev` ejecutándose

---

## Step 1: Iniciar Dev Server

```powershell
# En la raíz del proyecto
pnpm dev
```

**Output esperado**:
```
VITE v7.0.0  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 2: Abrir Chrome DevTools

1. Abre `http://localhost:5173` en Chrome
2. Presiona `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Opt+I` (Mac)
3. Ve a la pestaña **Console**

**Deberías ver automáticamente**:
```
🎧 Console Helper Available
📖 Quick Reference:
  __CONSOLE_HELPER__.getErrors(10)
  __CONSOLE_HELPER__.getByModule("Materials", 15)
  __CONSOLE_HELPER__.search("error")
  __CONSOLE_HELPER__.exportForAI({ level: "error" })
  __CONSOLE_HELPER__.getStats()
```

---

## Step 3: Verificar Instalación

En la consola de Chrome, ejecuta:

```javascript
__CONSOLE_HELPER__.isActive()
```

**Output esperado**: `true`

Si obtienes `undefined` o `false`, verifica:
- ✅ Estás en modo desarrollo (`NODE_ENV === 'development'`)
- ✅ El servidor está corriendo (`pnpm dev`)
- ✅ No hay errores de JavaScript en consola

---

## Step 4: Primeros Comandos

### Ver Resumen Rápido

```javascript
__CONSOLE_HELPER__.getSummary()
```

**Output esperado**:
```javascript
{
  active: true,
  total: 45,
  errors: 0,
  warnings: 2,
  topModule: 'App',
  uptime: '15s'
}
```

### Ver Últimos Errores

```javascript
__CONSOLE_HELPER__.getErrors(5)
```

**Output esperado**:
```javascript
[
  {
    timestamp: 1703512345678,
    level: 'error',
    module: 'MaterialsStore',
    domain: 'Stores',
    message: 'Failed to fetch materials',
    data: { error: 'Network timeout' },
    stack: 'Error: Network timeout\n  at...'
  }
  // ... más errores si existen
]
```

Si no hay errores: `[]` (array vacío) ✅

### Ver Módulos con Más Actividad

```javascript
__CONSOLE_HELPER__.getTopModules(5)
```

**Output esperado**:
```javascript
[
  { module: 'App', count: 18, domain: 'Core' },
  { module: 'NavigationContext', count: 12, domain: 'Core' },
  { module: 'MaterialsStore', count: 8, domain: 'Stores' },
  { module: 'EventBus', count: 6, domain: 'EventBus' },
  { module: 'OfflineSync', count: 4, domain: 'Infrastructure' }
]
```

---

## Step 5: Explorar un Módulo

Elige un módulo de la lista anterior (ej: `NavigationContext`):

```javascript
__CONSOLE_HELPER__.getByModule('NavigationContext', 10)
```

**Output esperado**:
```javascript
[
  {
    timestamp: 1703512345678,
    level: 'info',
    module: 'NavigationContext',
    domain: 'Core',
    message: '🧭 Context initialized',
    data: { activeLocation: '/admin/materials' }
  },
  {
    timestamp: 1703512346789,
    level: 'debug',
    module: 'NavigationContext',
    domain: 'Core',
    message: '🔵 RENDER #3'
  }
  // ... más logs
]
```

---

## Step 6: Buscar por Texto

```javascript
__CONSOLE_HELPER__.search('RENDER', 20)
```

**Output esperado**: Todos los logs que contengan "RENDER" en el mensaje

**Uso común**: Detectar componentes que renderizan demasiado

```javascript
// Buscar renders
__CONSOLE_HELPER__.search('RENDER #', 30)

// Buscar errores
__CONSOLE_HELPER__.search('failed', 20)

// Buscar cambios de estado
__CONSOLE_HELPER__.search('CHANGED', 15)
```

---

## Step 7: Export para Análisis con IA

Este es el **uso más importante** - Export optimizado para Claude/ChatGPT:

```javascript
__CONSOLE_HELPER__.exportForAI({ level: 'error' })
```

**Output esperado**:
```javascript
[
  {
    time: "14:32:15.123",
    lvl: "E",
    mod: "MaterialsStore",
    dom: "Stores",
    msg: "Failed to fetch materials",
    data: "{error:'Network timeout'}"
  }
  // ... más errores
]
```

**Ventajas**:
- ✅ Formato compacto (~90% menos tokens)
- ✅ Fácil de copiar/pegar a Claude
- ✅ Preserva información crítica

**Copy to Clipboard**:
```javascript
// Copiar resultado
const report = __CONSOLE_HELPER__.exportForAI({ level: 'error' });
copy(JSON.stringify(report, null, 2));
```

---

## 🎯 Comandos Más Útiles (Cheatsheet)

### Debugging Rápido
```javascript
// Estado general
__CONSOLE_HELPER__.getSummary()

// Últimos errores
__CONSOLE_HELPER__.getErrors(10)

// Módulos más activos
__CONSOLE_HELPER__.getTopModules(5)

// Buscar renders
__CONSOLE_HELPER__.search('RENDER', 30)
```

### Análisis de Módulo Específico
```javascript
// Logs de Materials
__CONSOLE_HELPER__.getByModule('Materials', 20)

// Logs de Navigation
__CONSOLE_HELPER__.getByModule('Navigation', 15)

// Todos los *Store modules
__CONSOLE_HELPER__.getByModule('Store', 50)
```

### Export para IA
```javascript
// Solo errores (~600 tokens)
__CONSOLE_HELPER__.exportForAI({ level: 'error' })

// Módulo específico (~800 tokens)
__CONSOLE_HELPER__.exportForAI({ module: 'Materials', limit: 30 })

// Últimos 2 minutos (~1K tokens)
__CONSOLE_HELPER__.exportForAI({ 
  since: Date.now() - 120000,
  limit: 50
})
```

### Limpieza
```javascript
// Ver cuántos logs hay
__CONSOLE_HELPER__.getSummary().total

// Limpiar todos los logs
__CONSOLE_HELPER__.clear()
```

---

## 🎪 Integración con React DevTools

### 1. Abrir React DevTools

- Chrome Extension: React Developer Tools
- Abrir pestaña **Components** o **Profiler**

### 2. Inspeccionar Componente + Logs

```javascript
// 1. Seleccionar componente en React DevTools
// 2. En Console, acceder al componente seleccionado
console.log($r); // $r = selected component

// 3. Ver logs de ese componente
__CONSOLE_HELPER__.getByModule($r.type.name, 20)
```

### 3. Profiler + ConsoleHelper

```javascript
// 1. React DevTools > Profiler > Start Recording (círculo azul)
// 2. Navegar/interactuar con la app
// 3. Stop Recording (círculo rojo)
// 4. Correlacionar con logs:

const profilingLogs = __CONSOLE_HELPER__.getFiltered({
  since: Date.now() - 30000, // Ajustar según duración del profiling
  module: 'NavigationContext'
});

console.table(profilingLogs.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString(),
  message: log.message.substring(0, 50),
  level: log.level
})));
```

---

## 🐛 Troubleshooting

### Problema: `__CONSOLE_HELPER__ is not defined`

**Causas posibles**:
1. No estás en modo desarrollo
2. El servidor no está corriendo
3. Error en inicialización

**Solución**:
```javascript
// 1. Verificar NODE_ENV
console.log('ENV:', import.meta.env.DEV); // Debe ser true

// 2. Recargar página (Ctrl+R)

// 3. Verificar que no haya errores en consola
```

### Problema: `isActive()` retorna `false`

**Causa**: Interceptor no se instaló correctamente

**Solución**:
1. Revisar `src/App.tsx` línea 238-240
2. Verificar que `ConsoleHelper.init()` se ejecute
3. Recargar con `Ctrl+Shift+R` (hard reload)

### Problema: No se capturan logs

**Causa**: Logs no pasan por `logger.*` o `console.*`

**Solución**:
```javascript
// ✅ CORRECTO - Se captura
logger.info('MyModule', 'Message');
console.log('Direct log');

// ❌ NO SE CAPTURA
// Logs de browser interno (network errors, etc.)
// Logs de extensions de Chrome
```

### Problema: Logs vacíos o pocos

**Causa**: Filtro muy restrictivo o buffer cleared

**Solución**:
```javascript
// Ver stats completas
__CONSOLE_HELPER__.getStats()

// Aumentar timeframe
__CONSOLE_HELPER__.getFiltered({
  since: Date.now() - 300000, // 5 minutos
  limit: 100
})

// Verificar que no se haya limpiado
__CONSOLE_HELPER__.getSummary().total // → debe ser > 0
```

---

## 📊 Escenario Completo: Debug de Error

### Situación: Error en módulo Materials

```javascript
// 1. Ver resumen
__CONSOLE_HELPER__.getSummary()
// → { errors: 3, topModule: 'MaterialsStore' }

// 2. Ver errores
const errors = __CONSOLE_HELPER__.getErrors(5);
console.table(errors);

// 3. Ver contexto del módulo
const context = __CONSOLE_HELPER__.getByModule('Materials', 20);
console.table(context);

// 4. Export para análisis con IA
const report = {
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error' }),
  context: __CONSOLE_HELPER__.exportForAI({ 
    module: 'Materials',
    limit: 30 
  })
};

// 5. Copiar a Claude
copy(JSON.stringify(report, null, 2));
```

---

## 🚀 Próximos Pasos

Ahora que sabes lo básico, continúa con:

1. **[04-USAGE-PATTERNS.md](./04-USAGE-PATTERNS.md)** - Patrones avanzados de debugging
2. **[02-API-REFERENCE.md](./02-API-REFERENCE.md)** - Referencia completa de API
3. **[05-INTEGRATION.md](./05-INTEGRATION.md)** - Integración con MCP y otras tools

---

## 💡 Tips para IA

Si estás usando estos logs con Claude/ChatGPT:

### ✅ DO
```javascript
// Export optimizado (600-1K tokens)
__CONSOLE_HELPER__.exportForAI({ level: 'error' })

// Con contexto específico
__CONSOLE_HELPER__.exportForAI({ 
  module: 'Materials',
  since: Date.now() - 60000,
  limit: 30
})
```

### ❌ DON'T
```javascript
// Export completo (10K+ tokens - muy pesado)
__CONSOLE_HELPER__.exportFull(1000)

// Sin filtros (demasiado ruido)
__CONSOLE_HELPER__.getFiltered({ limit: 500 })
```

**Prompt optimizado para Claude**:
```
Analiza estos logs de error de mi aplicación:

[logs from exportForAI here]

Context: G-Mini v3.1, React 19, Zustand stores.
Issue: [describe the problem]

¿Qué podría estar causando estos errores?
```

---

**¡Listo!** Ya sabes usar ConsoleHelper para debugging diario. 🎉
