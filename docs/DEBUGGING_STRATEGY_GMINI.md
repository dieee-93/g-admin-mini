# Estrategia Integral de Debugging para G-Mini
## Guía Estratégica de Debugging por Aspectos de la Aplicación

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Sistema:** G-Mini v3.1 EventBus Enterprise Edition

---

## 📋 Tabla de Contenidos

1. [Introducción y Filosofía](#introducción-y-filosofía)
2. [Herramientas del Ecosistema](#herramientas-del-ecosistema)
3. [Estrategias por Aspecto](#estrategias-por-aspecto)
4. [Workflows de Debugging](#workflows-de-debugging)
5. [Troubleshooting Rápido](#troubleshooting-rápido)
6. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción y Filosofía

### Principio BASE: Zero Console Noise
```typescript
// ❌ PROHIBIDO - Viola ESLint rules
console.log('debug info'); 

// ✅ CORRECTO - Logger estructurado
import { logger } from '@/lib/logging';
logger.info('ModuleName', 'Operation description', { data });
```

### Arquitectura de Logging
```
Application Code
     ↓
logger.* (formato estructurado)
     ↓
console.* (salida visible)
     ↓
ConsoleHelper (captura inteligente)
     ↓
Chrome DevTools MCP (análisis con IA)
```

### Ventajas del Sistema
- ✅ **Logger**: Estructura, módulos, dominios, niveles
- ✅ **ConsoleHelper**: Reduce 123K tokens → <1K para IA
- ✅ **ESLint**: Fuerza buenas prácticas (no console.log)
- ✅ **MCP**: Debugging asistido por IA (Claude)

---

## Herramientas del Ecosistema

### 1. Logger System (`src/lib/logging/Logger.ts`)

**Propósito**: Logging estructurado con módulos y niveles

**API Principal**:
```typescript
import { logger } from '@/lib/logging';

// Niveles de logging
logger.debug('Module', 'Detailed info', data);
logger.info('Module', 'General info', data);
logger.warn('Module', 'Warning message', data);
logger.error('Module', 'Error occurred', error);
logger.performance('Module', 'Operation name', durationMs);
```

**Configuración Global**:
```javascript
// En Chrome DevTools
window.__GADMIN_LOGGER__.configure({
  modules: 'all', // o Set(['MaterialsStore', 'EventBus'])
  level: 'debug', // 'debug' | 'info' | 'warn' | 'error'
  performanceThreshold: 100 // Solo log si >100ms
});

// Ver estado actual
window.__GADMIN_LOGGER__.getConfig();
```

**Módulos Disponibles**:
- **Core**: NavigationContext, AuthContext, EventBus, CapabilitySystem
- **Stores**: MaterialsStore, SalesStore, ProductsStore, etc.
- **Services**: API, Supabase, SuppliersService
- **UI**: Layout, Modal, Form, Provider
- **Performance**: Performance, LazyLoading

---

### 2. ConsoleHelper (`src/lib/logging/ConsoleHelper.ts`)

**Propósito**: Captura inteligente de logs para análisis con IA

**API Global** (disponible como `window.__CONSOLE_HELPER__`):

#### Verificación de Estado
```javascript
// Verificar si está activo
__CONSOLE_HELPER__.isActive() // → true

// Ver resumen rápido (~50 tokens)
__CONSOLE_HELPER__.getSummary()
// → { active: true, total: 150, errors: 2, warnings: 5, topModule: 'NavigationContext', uptime: '45s' }

// Estadísticas detalladas (~300 tokens)
__CONSOLE_HELPER__.getStats()
// → { total, last60s, byLevel, byModule, byDomain, ... }
```

#### Filtrado de Logs
```javascript
// Filtrado multi-criterio
__CONSOLE_HELPER__.getFiltered({
  level: 'error',               // 'debug' | 'info' | 'warn' | 'error'
  module: 'Materials',          // Partial match, case-insensitive
  domain: 'Business',           // 'Core' | 'Business' | 'Stores' | 'Network' | 'Performance'
  search: 'failed',             // Text search en message
  since: Date.now() - 120000,   // Timestamp (últimos 2 min)
  limit: 30                     // Max resultados
});

// Shortcuts
__CONSOLE_HELPER__.getErrors(10);      // Últimos 10 errores
__CONSOLE_HELPER__.getWarnings(10);    // Últimas 10 warnings
__CONSOLE_HELPER__.getRecent(5, 50);   // Últimos 5s, max 50 logs
```

#### Búsqueda y Análisis
```javascript
// Buscar texto en mensajes
__CONSOLE_HELPER__.search('timeout', 20);

// Por módulo específico
__CONSOLE_HELPER__.getByModule('EventBus', 30);

// Por dominio
__CONSOLE_HELPER__.getByDomain('Network', 20);

// Top módulos más verbosos
__CONSOLE_HELPER__.getTopModules(10);
// → [{ module: 'NavigationContext', count: 250, domain: 'Core' }, ...]
```

#### Export para IA (Optimizado para Claude)
```javascript
// Export compacto (~600 tokens)
__CONSOLE_HELPER__.exportForAI({
  level: 'error',
  limit: 15
});

// Export completo (use con cuidado)
__CONSOLE_HELPER__.exportFull(50);
```

**Características Clave**:
- Buffer circular de 1000 logs (FIFO)
- Debouncing de 500ms (elimina duplicados)
- Domain detection automático
- Truncamiento de mensajes largos (500 chars)
- Zero overhead en producción

---

### 3. Chrome DevTools MCP

**Propósito**: Debugging asistido por IA (Claude + DevTools)

**Patrones de Uso**:
```javascript
// ❌ ANTES: list_console_messages (123K tokens, falla)
mcp_chrome-devtoo_list_console_messages()

// ✅ DESPUÉS: evaluate_script + ConsoleHelper (<1K tokens)
evaluate_script({
  function: "() => window.__CONSOLE_HELPER__.exportForAI({ level: 'error' })"
})
```

**Tools Útiles de MCP**:
- `take_snapshot()`: Captura estado de página (a11y tree)
- `take_screenshot()`: Screenshot de página o elemento
- `evaluate_script()`: Ejecuta JS en página
- `list_network_requests()`: Ve requests HTTP
- `get_console_message(msgid)`: Detalles de log específico
- `performance_start_trace()`: Profiling de performance

---

### 4. React DevTools

**Instalación**: Chrome/Firefox/Edge extension

**Components Tab**:
```
Funciones:
- Inspeccionar props, state, hooks en tiempo real
- Editar valores en vivo
- Ver "rendered by" (qué causó el render)
- Navegar a código fuente (con source maps)
```

**Profiler Tab**:
```
Métricas:
- Flame Chart: Jerarquía de renders con tiempos
- Ranked Chart: Componentes ordenados por duración
- Timeline: Historial de commits
- Highlight updates: Flash visual de re-renders
```

---

## Estrategias por Aspecto

### 🔄 Aspecto 1: Re-renders Infinitos

**Síntomas**:
- CPU al 100%
- Página congelada
- Logs apareciendo constantemente

**Estrategia de Diagnóstico**:

**Step 1: Recarga limpia**
```javascript
// Recargar página
location.reload();

// Esperar 5 segundos sin interactuar
```

**Step 2: Análisis rápido**
```javascript
// Ver logs recientes (últimos 5s)
const recent = __CONSOLE_HELPER__.getRecent(5, 100);
console.log(`Logs en 5s: ${recent.length}`);

// Clasificación:
// ✅ Normal: 5-10 logs
// ⚠️ Sospechoso: 20-50 logs
// 🔴 Crítico: 100+ logs
```

**Step 3: Identificar módulo problemático**
```javascript
// Ver top módulos
const topModules = __CONSOLE_HELPER__.getTopModules(10);
console.table(topModules);

// Buscar módulo con count muy alto (>100)
```

**Step 4: Análisis del módulo**
```javascript
// Asumir que NavigationContext es el problema
const navLogs = __CONSOLE_HELPER__.getByModule('NavigationContext', 50);

// Buscar patrones de re-render
__CONSOLE_HELPER__.search('RENDER #', 50);
__CONSOLE_HELPER__.search('CHANGED', 30);
__CONSOLE_HELPER__.search('dependencies', 30);
```

**Step 5: Usar React DevTools Profiler**
```javascript
// 1. Abrir React DevTools → Profiler tab
// 2. Click "Record" (⏺️)
// 3. Esperar 5 segundos
// 4. Click "Stop"
// 5. Ver Flame Chart - buscar componente con muchos renders
// 6. Usar "Highlight updates" para ver re-renders en tiempo real
```

**Step 6: Export para Claude**
```javascript
const report = {
  summary: __CONSOLE_HELPER__.getSummary(),
  topModules: __CONSOLE_HELPER__.getTopModules(10),
  renders: __CONSOLE_HELPER__.search('RENDER #', 50),
  problematicModule: __CONSOLE_HELPER__.exportForAI({ 
    module: 'NavigationContext',
    limit: 50
  })
};

// Copy to clipboard
copy(JSON.stringify(report, null, 2));
// Paste in Claude chat
```

**Soluciones Comunes**:
1. **useEffect dependencies**: Agregar dependencias faltantes
2. **setState en render**: Mover a useEffect o callback
3. **Inline objects/arrays en props**: Memoizar con useMemo
4. **Context value re-creation**: Memoizar con useMemo
5. **Missing React.memo**: Agregar a componentes puros

**Documentación Relevante**:
- [`docs/console/04-USAGE-PATTERNS.md`](../docs/console/04-USAGE-PATTERNS.md#-pattern-1-debug-de-re-renders-infinitos)
- [`docs/06-debugging/HOOKS_DEBUGGING_GUIDE.md`](../docs/06-debugging/HOOKS_DEBUGGING_GUIDE.md#2-useeffect-debugging)

---

### ❌ Aspecto 2: Errores de API/Network

**Síntomas**:
- Requests fallan silenciosamente
- Data no carga
- Errores 4xx/5xx en Network tab

**Estrategia de Diagnóstico**:

**Step 1: Ver errores generales**
```javascript
// Todos los errores recientes
const errors = __CONSOLE_HELPER__.getErrors(20);
console.table(errors);
```

**Step 2: Filtrar errores de red**
```javascript
// Errores de API/Supabase
const networkErrors = __CONSOLE_HELPER__.getFiltered({
  level: 'error',
  domain: 'Network',
  limit: 20
});

console.table(networkErrors.map(e => ({
  time: new Date(e.timestamp).toLocaleTimeString(),
  module: e.module,
  message: e.message.substring(0, 60),
  hasData: !!e.data
})));

// Buscar palabras clave
__CONSOLE_HELPER__.search('failed', 30);
__CONSOLE_HELPER__.search('timeout', 30);
__CONSOLE_HELPER__.search('network', 30);
```

**Step 3: Contexto temporal**
```javascript
// Ver qué pasó 5s antes del primer error
const firstError = networkErrors[0];
const contextLogs = __CONSOLE_HELPER__.getFiltered({
  since: firstError.timestamp - 5000,
  limit: 30
});

console.table(contextLogs);
```

**Step 4: Chrome DevTools Network tab**
```javascript
// Con MCP:
mcp_chrome-devtoo_list_network_requests({
  resourceTypes: ['fetch', 'xhr'],
  pageSize: 20
});

// Ver request específico
mcp_chrome-devtoo_get_network_request({ reqid: 123 });
```

**Step 5: Verificar Supabase RLS**
```javascript
// En código, agregar logging detallado:
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export async function fetchSuppliers() {
  logger.info('SuppliersService', 'Fetching suppliers...', { 
    user: supabase.auth.user()?.id 
  });

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true);

  if (error) {
    logger.error('SuppliersService', 'Fetch failed', { 
      error,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }

  logger.info('SuppliersService', 'Fetch successful', { count: data.length });
  return data;
}
```

**Step 6: Export para análisis**
```javascript
const apiReport = {
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', domain: 'Network' }),
  context: __CONSOLE_HELPER__.getByDomain('Network', 30),
  timeline: contextLogs
};

copy(JSON.stringify(apiReport, null, 2));
```

**Soluciones Comunes**:
1. **RLS Policy**: Verificar políticas en Supabase Dashboard
2. **Auth token**: Verificar que usuario esté autenticado
3. **CORS**: Verificar configuración de Supabase
4. **Timeouts**: Aumentar timeout o verificar slow queries
5. **Offline**: Verificar `offlineSync.queueOperation()`

**Documentación Relevante**:
- [`docs/console/04-USAGE-PATTERNS.md`](../docs/console/04-USAGE-PATTERNS.md#-pattern-2-debug-de-errores-de-api)
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md#supabase-service-patterns)

---

### 🐌 Aspecto 3: Performance (Slow Operations)

**Síntomas**:
- UI lenta/laggy
- Operaciones que toman demasiado tiempo
- FPS < 30

**Estrategia de Diagnóstico**:

**Step 1: Identificar operaciones lentas**
```javascript
// Buscar logs con "ms" en el mensaje
const perfLogs = __CONSOLE_HELPER__.search('ms', 50);

// Extraer duraciones
const slowOps = perfLogs
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

console.table(slowOps.slice(0, 10));
```

**Step 2: Ver métricas del Performance Monitor**
```javascript
// Si Performance Monitor está activo
window.__PERFORMANCE_MONITOR__?.getMetrics();
// → { fps, memory, slowOperations, ... }
```

**Step 3: React DevTools Profiler**
```
1. Abrir React DevTools → Profiler tab
2. Configurar "Record why each component rendered"
3. Click Record ⏺️
4. Realizar operación lenta
5. Click Stop
6. Analizar:
   - Flame Chart: Buscar barras amarillas/rojas (>12ms)
   - Ranked Chart: Ordenar por "Render duration"
   - Click componente lento → Ver "Why did this render?"
```

**Step 4: Chrome DevTools Performance**
```
1. Abrir DevTools → Performance tab
2. Click Record ⏺️
3. Realizar operación
4. Click Stop
5. Analizar:
   - Main thread: Buscar long tasks (>50ms)
   - Frames: Buscar frames >16ms (60fps threshold)
   - Bottom-Up: Identificar funciones costosas
```

**Step 5: Chrome DevTools MCP Performance Trace**
```javascript
// Con MCP:
mcp_chrome-devtoo_performance_start_trace({ 
  reload: true, 
  autoStop: true 
});

// Esperar unos segundos...

// Ver insights
mcp_chrome-devtoo_performance_analyze_insight({
  insightSetId: 'latest',
  insightName: 'LCPBreakdown' // o 'DocumentLatency', 'RenderBlocking'
});
```

**Step 6: Análisis de re-renders**
```javascript
// Detectar componentes que re-renderizan mucho
function analyzeReRenders() {
  const logs = __CONSOLE_HELPER__.getRecent(10, 1000);
  const patterns = new Map();
  
  logs.forEach(log => {
    const key = `${log.module}:${log.message.substring(0, 30)}`;
    patterns.set(key, (patterns.get(key) || 0) + 1);
  });
  
  const repeating = Array.from(patterns.entries())
    .filter(([_, count]) => count > 5)
    .sort((a, b) => b[1] - a[1]);
  
  console.table(repeating.map(([pattern, count]) => ({
    pattern,
    count,
    severity: count > 20 ? '🔴 Critical' : count > 10 ? '⚠️ High' : '⚠️ Medium'
  })));
}

analyzeReRenders();
```

**Soluciones Comunes**:
1. **Re-renders excesivos**: Usar React.memo, useMemo, useCallback
2. **Cálculos pesados**: Mover a useMemo o Web Worker
3. **Listas grandes**: Virtualización con `react-window`
4. **Animaciones pesadas**: Usar `transform`/`opacity` (GPU)
5. **Bundle size**: Code splitting con React.lazy
6. **Large objects**: Lazy loading de data

**Documentación Relevante**:
- [`docs/05-development/REACT_DEVTOOLS_PROFILING_GUIA_AVANZADA.md`](../docs/05-development/REACT_DEVTOOLS_PROFILING_GUIA_AVANZADA.md)
- [`docs/REACT_PERFORMANCE_DEBUGGING_GUIDE.md`](../docs/REACT_PERFORMANCE_DEBUGGING_GUIDE.md)
- [`docs/console/06-ADVANCED.md`](../docs/console/06-ADVANCED.md#-2-análisis-estadístico-avanzado)

---

### 🔌 Aspecto 4: EventBus y Comunicación entre Módulos

**Síntomas**:
- Eventos no se disparan
- Handlers no se ejecutan
- Deadlocks o timeouts

**Estrategia de Diagnóstico**:

**Step 1: Ver actividad del EventBus**
```javascript
// Todos los logs del EventBus
const eventLogs = __CONSOLE_HELPER__.getByModule('EventBus', 50);
console.table(eventLogs);

// Ver errores específicos
const eventErrors = __CONSOLE_HELPER__.getFiltered({
  level: 'error',
  module: 'EventBus',
  limit: 20
});
```

**Step 2: Buscar eventos específicos**
```javascript
// Buscar pattern de evento
__CONSOLE_HELPER__.search('sales.order.completed', 20);
__CONSOLE_HELPER__.search('inventory.', 30);

// Ver últimos eventos emitidos
__CONSOLE_HELPER__.search('Event emitted:', 20);
```

**Step 3: Verificar registro de módulos**
```javascript
// En código, verificar que módulos estén registrados
import { ModuleRegistry } from '@/lib/modules';

console.log('Registered modules:', ModuleRegistry.getRegisteredModules());
console.log('Active hooks:', ModuleRegistry.getActiveHooks());
```

**Step 4: Health monitoring del EventBus**
```javascript
// Dashboard de salud del EventBus
function eventBusHealth() {
  const logs = __CONSOLE_HELPER__.getByModule('EventBus', 100);
  const errors = logs.filter(l => l.level === 'error');
  const emitted = logs.filter(l => l.message.includes('Event emitted'));
  const delivered = logs.filter(l => l.message.includes('delivered'));
  
  console.log('=== EVENTBUS HEALTH ===');
  console.log(`Events emitted: ${emitted.length}`);
  console.log(`Events delivered: ${delivered.length}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Success rate: ${((delivered.length / emitted.length) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.warn('🔴 Recent errors:');
    console.table(errors);
  }
}

eventBusHealth();

// Ejecutar cada 10s
const healthInterval = setInterval(eventBusHealth, 10000);
// clearInterval(healthInterval); // Para detener
```

**Step 5: Verificar deduplicación**
```javascript
// Ver si hay eventos duplicados
const recentEvents = __CONSOLE_HELPER__.getRecent(5, 100);
const eventCounts = new Map();

recentEvents.forEach(log => {
  if (log.message.includes('Event emitted:')) {
    const pattern = log.message.match(/Event emitted: ([\w\.]+)/)?.[1];
    if (pattern) {
      eventCounts.set(pattern, (eventCounts.get(pattern) || 0) + 1);
    }
  }
});

console.log('Event frequency:');
console.table(Array.from(eventCounts.entries()).map(([event, count]) => ({
  event,
  count,
  status: count > 5 ? '⚠️ High frequency' : '✅ Normal'
})));
```

**Step 6: Export para análisis**
```javascript
const eventBusReport = {
  health: eventBusHealth(),
  allLogs: __CONSOLE_HELPER__.exportForAI({ module: 'EventBus', limit: 50 }),
  errors: __CONSOLE_HELPER__.getFiltered({ level: 'error', module: 'EventBus' })
};

copy(JSON.stringify(eventBusReport, null, 2));
```

**Soluciones Comunes**:
1. **Evento no registrado**: Verificar `eventBus.on(pattern, handler)`
2. **Pattern incorrecto**: Verificar sintaxis `domain.entity.action`
3. **Priority issues**: Usar `priority: 'high'` para eventos críticos
4. **Deduplicación**: Verificar `correlationId` en opciones
5. **Handler async**: Asegurar que handler maneje errores correctamente

**Documentación Relevante**:
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md#eventbus-communication)
- [`docs/console/05-INTEGRATION.md`](../docs/console/05-INTEGRATION.md#-2-integración-con-eventbus)
- [`src/lib/events/EventBus.ts`](../src/lib/events/EventBus.ts)

---

### 🗄️ Aspecto 5: State Management (Zustand Stores)

**Síntomas**:
- Estado no actualiza UI
- Stale data
- Race conditions

**Estrategia de Diagnóstico**:

**Step 1: Ver logs de stores**
```javascript
// Todos los stores
const storeLogs = __CONSOLE_HELPER__.getByDomain('Stores', 50);
console.table(storeLogs);

// Store específico
const materialsLogs = __CONSOLE_HELPER__.getByModule('MaterialsStore', 30);
console.table(materialsLogs);
```

**Step 2: Redux DevTools (Zustand devtools middleware)**
```
1. Instalar Redux DevTools Extension
2. Abrir Redux DevTools tab
3. Ver estado de todos los stores
4. Ver timeline de acciones
5. Usar "Jump to" para time-travel debugging
```

**Step 3: Verificar estado actual**
```javascript
// Acceder a stores directamente (solo dev)
import { useMaterialsStore } from '@/store/materialsStore';

// Ver estado completo
console.log('Materials state:', useMaterialsStore.getState());

// Subscribe a cambios
const unsub = useMaterialsStore.subscribe(
  (state) => console.log('Materials updated:', state.materials.length)
);
// unsub(); para detener
```

**Step 4: Verificar selectors**
```javascript
// Custom hook para debug de selectors
function useStoreDebug(store, selector, name) {
  const value = store(selector);
  
  useEffect(() => {
    console.log(`[${name}] Selector changed:`, value);
  }, [value, name]);
  
  return value;
}

// Uso
const materials = useStoreDebug(
  useMaterialsStore, 
  (state) => state.materials,
  'Materials'
);
```

**Step 5: Analizar actualización de estado**
```javascript
// Buscar operaciones de store
__CONSOLE_HELPER__.search('fetch', 30); // fetching data
__CONSOLE_HELPER__.search('update', 30); // updating state
__CONSOLE_HELPER__.search('success', 20); // successful operations
__CONSOLE_HELPER__.search('error', 20); // failed operations
```

**Step 6: Verificar persist middleware**
```javascript
// Ver localStorage para stores con persist
Object.keys(localStorage).forEach(key => {
  if (key.includes('-store')) {
    console.log(`Store: ${key}`);
    console.log('Value:', JSON.parse(localStorage.getItem(key)));
  }
});
```

**Soluciones Comunes**:
1. **Stale selectors**: Usar shallow comparison en useStore
2. **Immer draft**: Verificar que mutations estén en Immer producer
3. **Async actions**: Agregar loading/error states
4. **Race conditions**: Usar abort signals o debouncing
5. **Persist issues**: Clear localStorage si estructura cambió

**Documentación Relevante**:
- [`docs/06-debugging/STATE_MANAGEMENT_DEBUGGING.md`](../docs/06-debugging/STATE_MANAGEMENT_DEBUGGING.md#3-zustand-debugging)
- [`docs/05-development/ZUSTAND_V5_STORE_AUDIT_REPORT.md`](../docs/05-development/ZUSTAND_V5_STORE_AUDIT_REPORT.md)
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md#state-management)

---

### 🪝 Aspecto 6: React Hooks Issues

**Síntomas**:
- useEffect se ejecuta demasiado
- Stale closures
- Invalid hook call
- Missing dependencies warnings

**Estrategia de Diagnóstico**:

**Step 1: Logging de hooks**
```typescript
// Hook personalizado para debug
function useDebugEffect(name: string, effect: React.EffectCallback, deps?: React.DependencyList) {
  useEffect(() => {
    console.log(`[Effect: ${name}] Running with deps:`, deps);
    const cleanup = effect();
    return () => {
      console.log(`[Effect: ${name}] Cleanup`);
      cleanup?.();
    };
  }, deps);
}

// Uso
useDebugEffect('Fetch materials', () => {
  fetchMaterials();
}, [materialId]);
```

**Step 2: Custom hook useWhyDidYouUpdate**
```typescript
import { useEffect, useRef } from 'react';

function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changesObj).length) {
        console.log('[useWhyDidYouUpdate]', name, changesObj);
      }
    }

    previousProps.current = props;
  });
}

// Uso
function MyComponent({ user, settings, data }) {
  useWhyDidYouUpdate('MyComponent', { user, settings, data });
  // ...
}
```

**Step 3: Verificar dependencies con React DevTools**
```
1. Abrir React DevTools → Components tab
2. Buscar componente en árbol
3. Ver sección "hooks" en panel derecho
4. Ver valores de deps en useEffect/useMemo/useCallback
5. Usar "Why did this render?" para ver qué cambió
```

**Step 4: Buscar warnings en logs**
```javascript
// Buscar warnings de dependencies
__CONSOLE_HELPER__.search('dependencies', 30);
__CONSOLE_HELPER__.search('missing', 20);
__CONSOLE_HELPER__.search('exhaustive-deps', 20);
```

**Step 5: Análisis de closures**
```javascript
// Pattern: Detectar stale closures
function ComponentWithClosure() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // 🔴 BUG: count es stale (siempre 0)
      console.log('Stale count:', count);
      
      // ✅ FIX: Usar función actualizadora
      setCount(c => {
        console.log('Fresh count:', c);
        return c + 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // Empty deps = stale closure
  
  return <div>{count}</div>;
}
```

**Soluciones Comunes**:
1. **Missing dependencies**: Agregar a deps array o usar ESLint autofix
2. **Stale closures**: Usar useRef para valores mutables
3. **Infinite loop**: Verificar que deps no se re-creen cada render
4. **Inline objects/functions**: Memoizar con useMemo/useCallback
5. **Cleanup function**: Agregar return en useEffect para cleanup

**Documentación Relevante**:
- [`docs/06-debugging/HOOKS_DEBUGGING_GUIDE.md`](../docs/06-debugging/HOOKS_DEBUGGING_GUIDE.md)
- [`docs/debugging/01-debugging-basico-react.md`](../docs/debugging/01-debugging-basico-react.md#debugging-de-ciclos-de-vida-en-react)

---

### 🔐 Aspecto 7: Auth y Permisos

**Síntomas**:
- Usuario no puede acceder a recursos
- RLS policies fallan
- Token expirado

**Estrategia de Diagnóstico**:

**Step 1: Verificar estado de auth**
```javascript
import { supabase } from '@/lib/supabase/client';

// Ver usuario actual
const user = supabase.auth.user();
console.log('Current user:', user);

// Ver sesión
const session = supabase.auth.session();
console.log('Current session:', session);

// Verificar si token está expirado
if (session?.expires_at) {
  const expiresAt = new Date(session.expires_at * 1000);
  const now = new Date();
  console.log('Token expires:', expiresAt);
  console.log('Token expired:', now > expiresAt);
}
```

**Step 2: Ver logs de auth**
```javascript
// Logs del sistema de auth
const authLogs = __CONSOLE_HELPER__.getByModule('Auth', 30);
console.table(authLogs);

// Errores de auth
const authErrors = __CONSOLE_HELPER__.getFiltered({
  level: 'error',
  module: 'Auth',
  limit: 20
});
console.table(authErrors);
```

**Step 3: Verificar RLS en Supabase**
```sql
-- En Supabase SQL Editor
-- Ver policies para tabla
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'suppliers'; -- cambiar tabla

-- Ver si usuario tiene role correcto
SELECT current_user, current_role;

-- Ver claims del JWT
SELECT auth.jwt();
```

**Step 4: Test manual de RLS**
```javascript
// En código, agregar logging detallado
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export async function fetchProtectedData() {
  const user = supabase.auth.user();
  
  logger.info('Auth', 'Fetching protected data', {
    userId: user?.id,
    role: user?.role,
    aud: user?.aud
  });

  const { data, error } = await supabase
    .from('protected_table')
    .select('*');

  if (error) {
    logger.error('Auth', 'RLS policy failed', {
      error,
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message
    });
    throw error;
  }

  logger.info('Auth', 'Data fetched successfully', { count: data.length });
  return data;
}
```

**Step 5: Verificar permisos en Chrome DevTools**
```javascript
// Ver headers de request
// Network tab → Click en request → Headers tab
// Verificar:
// - Authorization: Bearer <token>
// - apikey: <supabase-anon-key>
```

**Soluciones Comunes**:
1. **Token expirado**: Implementar refresh token automático
2. **RLS policy**: Ajustar policies en Supabase Dashboard
3. **Missing role**: Agregar role claim en JWT
4. **Anon key**: Verificar que apikey sea correcta
5. **CORS**: Verificar configuración en Supabase

**Documentación Relevante**:
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md#rls-patterns)
- [`docs/AUTH_CONFIG_SECURITY_RECOMMENDATIONS.md`](../docs/AUTH_CONFIG_SECURITY_RECOMMENDATIONS.md)

---

### 📡 Aspecto 8: Offline Sync

**Síntomas**:
- Operaciones no se sincronizan
- Data perdida
- Conflictos de versión

**Estrategia de Diagnóstico**:

**Step 1: Verificar estado de offline sync**
```javascript
import offlineSync from '@/lib/offline/OfflineSync';

// Ver estado
console.log('Offline sync active:', offlineSync.isActive());
console.log('Is online:', offlineSync.isOnline());

// Ver cola de operaciones
const queue = await offlineSync.getQueue();
console.log('Pending operations:', queue.length);
console.table(queue);
```

**Step 2: Ver logs de OfflineSync**
```javascript
const offlineLogs = __CONSOLE_HELPER__.getByModule('OfflineSync', 50);
console.table(offlineLogs);

// Buscar operaciones encoladas
__CONSOLE_HELPER__.search('queued', 20);
__CONSOLE_HELPER__.search('synced', 20);
__CONSOLE_HELPER__.search('conflict', 20);
```

**Step 3: Simular offline/online**
```javascript
// Simular offline (Chrome DevTools)
// 1. Abrir DevTools → Network tab
// 2. Dropdown "No throttling" → "Offline"

// O con MCP:
mcp_chrome-devtoo_emulate({
  networkConditions: 'Offline'
});

// Realizar operaciones...

// Volver online
mcp_chrome-devtoo_emulate({
  networkConditions: 'No emulation'
});
```

**Step 4: Verificar IndexedDB**
```javascript
// Ver operaciones en IndexedDB (Chrome DevTools)
// Application tab → IndexedDB → offline-sync-db → operations

// O programáticamente:
async function inspectOfflineDB() {
  const db = await window.indexedDB.open('offline-sync-db', 1);
  // ... inspect operations store
}
```

**Step 5: Forzar sync manual**
```javascript
// Forzar sincronización
await offlineSync.forceSyncNow();

// Ver resultado
const queueAfter = await offlineSync.getQueue();
console.log('Operations after sync:', queueAfter.length);
```

**Soluciones Comunes**:
1. **Queue full**: Aumentar límite de cola
2. **Sync conflicts**: Implementar merge strategy
3. **Network flapping**: Usar anti-flapping delay
4. **Priority issues**: Ajustar priority de operaciones
5. **Stale operations**: Implementar TTL para operaciones

**Documentación Relevante**:
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md#offline-first-architecture)
- [`src/lib/offline/OfflineSync.ts`](../src/lib/offline/OfflineSync.ts)

---

## Workflows de Debugging

### 🚀 Workflow 1: Debugging Inicial (First Steps)

**Contexto**: Algo no funciona, no sabes por dónde empezar

```javascript
// 1. Verificar que herramientas estén activas
__CONSOLE_HELPER__.isActive(); // → true
__GADMIN_LOGGER__.getConfig(); // → ver config

// 2. Ver resumen general
const summary = __CONSOLE_HELPER__.getSummary();
console.log(summary);
// Si errors > 0, ir a Workflow 2
// Si topModule tiene count muy alto, ir a Workflow 3

// 3. Ver errores recientes
const errors = __CONSOLE_HELPER__.getErrors(10);
console.table(errors);

// 4. Si hay errores, ver contexto
if (errors.length > 0) {
  const firstError = errors[0];
  const context = __CONSOLE_HELPER__.getFiltered({
    since: firstError.timestamp - 5000,
    limit: 30
  });
  console.table(context);
}

// 5. Export para Claude
const initialReport = {
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.getErrors(10),
  topModules: __CONSOLE_HELPER__.getTopModules(5)
};
copy(JSON.stringify(initialReport, null, 2));
```

---

### 🔍 Workflow 2: Debugging de Errores Específicos

**Contexto**: Hay errores, necesitas entender la causa

```javascript
// 1. Analizar errores por nivel
const criticalErrors = __CONSOLE_HELPER__.getErrors(20);
const warnings = __CONSOLE_HELPER__.getWarnings(20);

console.log(`🔴 Errors: ${criticalErrors.length}`);
console.log(`⚠️ Warnings: ${warnings.length}`);

// 2. Agrupar por módulo
const errorsByModule = criticalErrors.reduce((acc, err) => {
  acc[err.module] = (acc[err.module] || 0) + 1;
  return acc;
}, {});
console.table(errorsByModule);

// 3. Analizar módulo con más errores
const topErrorModule = Object.entries(errorsByModule)
  .sort((a, b) => b[1] - a[1])[0]?.[0];

if (topErrorModule) {
  console.log(`🎯 Focus on: ${topErrorModule}`);
  
  const moduleErrors = __CONSOLE_HELPER__.getFiltered({
    level: 'error',
    module: topErrorModule,
    limit: 20
  });
  
  console.table(moduleErrors.map(e => ({
    time: new Date(e.timestamp).toLocaleTimeString(),
    message: e.message.substring(0, 80),
    hasStack: !!e.stack
  })));
  
  // Ver stack trace del primer error
  if (moduleErrors[0].stack) {
    console.log('Stack trace:');
    console.log(moduleErrors[0].stack);
  }
}

// 4. Ver qué pasó antes del primer error
const timeline = __CONSOLE_HELPER__.getFiltered({
  since: criticalErrors[0].timestamp - 10000, // 10s antes
  limit: 50
});
console.table(timeline);

// 5. Export
const errorReport = {
  errors: criticalErrors,
  warnings: warnings,
  moduleBreakdown: errorsByModule,
  topModule: topErrorModule,
  timeline: timeline
};
copy(JSON.stringify(errorReport, null, 2));
```

---

### ⚡ Workflow 3: Debugging de Performance

**Contexto**: App lenta, necesitas encontrar el cuello de botella

```javascript
// 1. Verificar logs recientes (posible loop)
const recent = __CONSOLE_HELPER__.getRecent(5, 100);
console.log(`Logs en 5s: ${recent.length}`);
if (recent.length > 50) {
  console.warn('⚠️ High log frequency - possible infinite loop');
}

// 2. Identificar hot modules
const topModules = __CONSOLE_HELPER__.getTopModules(10);
console.table(topModules);

// 3. Buscar operaciones lentas
const perfLogs = __CONSOLE_HELPER__.search('ms', 50);
const slowOps = perfLogs
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
console.table(slowOps.slice(0, 10));

// 4. Detectar re-renders
function detectReRenders() {
  const logs = __CONSOLE_HELPER__.getRecent(10, 1000);
  const patterns = new Map();
  
  logs.forEach(log => {
    const key = `${log.module}:${log.message.substring(0, 30)}`;
    patterns.set(key, (patterns.get(key) || 0) + 1);
  });
  
  const repeating = Array.from(patterns.entries())
    .filter(([_, count]) => count > 5)
    .sort((a, b) => b[1] - a[1]);
  
  return repeating.map(([pattern, count]) => ({
    pattern,
    count,
    severity: count > 20 ? '🔴 Critical' : count > 10 ? '⚠️ High' : '⚠️ Medium'
  }));
}

const reRenders = detectReRenders();
if (reRenders.length > 0) {
  console.warn('🔄 Re-render patterns detected:');
  console.table(reRenders);
}

// 5. Export
const perfReport = {
  logFrequency: recent.length,
  topModules: topModules,
  slowOperations: slowOps.slice(0, 10),
  reRenders: reRenders
};
copy(JSON.stringify(perfReport, null, 2));

// 6. Siguiente paso: React DevTools Profiler
console.log('👉 Next: Open React DevTools → Profiler → Record');
```

---

### 🎯 Workflow 4: Debugging de Módulo Específico

**Contexto**: Sabes qué módulo tiene el problema

```javascript
const MODULE_NAME = 'MaterialsStore'; // Cambiar según necesidad

// 1. Ver todos los logs del módulo
const moduleLogs = __CONSOLE_HELPER__.getByModule(MODULE_NAME, 50);
console.table(moduleLogs.map(log => ({
  time: new Date(log.timestamp).toLocaleTimeString(),
  level: log.level,
  message: log.message.substring(0, 80)
})));

// 2. Ver errores específicos
const moduleErrors = __CONSOLE_HELPER__.getFiltered({
  level: 'error',
  module: MODULE_NAME,
  limit: 20
});
if (moduleErrors.length > 0) {
  console.warn(`🔴 ${moduleErrors.length} errors in ${MODULE_NAME}`);
  console.table(moduleErrors);
}

// 3. Ver warnings
const moduleWarnings = __CONSOLE_HELPER__.getFiltered({
  level: 'warn',
  module: MODULE_NAME,
  limit: 20
});
if (moduleWarnings.length > 0) {
  console.warn(`⚠️ ${moduleWarnings.length} warnings in ${MODULE_NAME}`);
  console.table(moduleWarnings);
}

// 4. Analizar frecuencia
const last60s = moduleLogs.filter(
  log => log.timestamp > Date.now() - 60000
).length;
console.log(`Activity: ${last60s} logs in last 60s`);

// 5. Buscar patrones específicos
console.log('--- Searching for patterns ---');
['fetch', 'update', 'create', 'delete', 'error', 'success'].forEach(keyword => {
  const matches = __CONSOLE_HELPER__.search(keyword, 1000)
    .filter(log => log.module === MODULE_NAME);
  if (matches.length > 0) {
    console.log(`${keyword}: ${matches.length} matches`);
  }
});

// 6. Export optimizado para IA
const moduleReport = __CONSOLE_HELPER__.exportForAI({
  module: MODULE_NAME,
  limit: 50
});
copy(JSON.stringify(moduleReport, null, 2));
```

---

## Troubleshooting Rápido

### 🔥 Quick Fixes

#### ❌ "ConsoleHelper is not defined"
```javascript
// Verificar que esté inicializado
__CONSOLE_HELPER__.isActive();

// Si false o undefined, verificar App.tsx:
// import { ConsoleHelper } from '@/lib/logging';
// if (process.env.NODE_ENV === 'development') {
//   ConsoleHelper.init();
// }
```

#### ❌ "No logs being captured"
```javascript
// 1. Verificar que Logger esté activo
__GADMIN_LOGGER__.getConfig();

// 2. Verificar nivel de logging
__GADMIN_LOGGER__.configure({ level: 'debug' });

// 3. Forzar un log de prueba
import { logger } from '@/lib/logging';
logger.info('Test', 'Test log message');

// 4. Verificar en consola
__CONSOLE_HELPER__.search('Test', 10);
```

#### ❌ "Too many logs (>1000)"
```javascript
// Los logs se truncan automáticamente (buffer circular)
// Para limpiar manualmente:
location.reload(); // Recarga página (limpia buffer)

// O ajustar configuración:
__GADMIN_LOGGER__.configure({
  modules: new Set(['MaterialsStore', 'EventBus']), // Solo módulos específicos
  level: 'info' // Reducir ruido (skip debug)
});
```

#### ❌ "exportForAI() returns too many tokens"
```javascript
// Reducir límite
__CONSOLE_HELPER__.exportForAI({ 
  level: 'error', // Solo errores
  limit: 10       // Máximo 10 logs
});

// O filtrar por módulo específico
__CONSOLE_HELPER__.exportForAI({ 
  module: 'MaterialsStore',
  limit: 15
});
```

#### ❌ "React DevTools not detecting app"
```javascript
// 1. Verificar que React esté en modo desarrollo
console.log('React version:', React.version);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 2. Verificar que no haya múltiples copias de React
// En DevTools Console:
Object.keys(window).filter(k => k.includes('React'));

// 3. Reinstalar DevTools extension
// Chrome: chrome://extensions → React Developer Tools → Remove + Reinstall
```

---

## Mejores Prácticas

### ✅ DO

1. **Usar logger estructurado**
```typescript
// ✅ CORRECTO
import { logger } from '@/lib/logging';
logger.info('MaterialsStore', 'Fetching materials', { count: 50 });
```

2. **Categorizar logs por nivel**
```typescript
// Debug: Información detallada de desarrollo
logger.debug('Module', 'Detailed state', state);

// Info: Operaciones normales
logger.info('Module', 'Operation completed', result);

// Warn: Problemas potenciales
logger.warn('Module', 'Slow operation', { duration: 1500 });

// Error: Errores que requieren atención
logger.error('Module', 'Operation failed', error);
```

3. **Incluir contexto útil**
```typescript
// ✅ Contexto rico
logger.error('MaterialsStore', 'Failed to fetch materials', {
  error: error.message,
  userId: user.id,
  timestamp: Date.now(),
  retryCount: 3
});

// ❌ Sin contexto
logger.error('MaterialsStore', 'Error');
```

4. **Limpiar logs de producción**
```typescript
// El sistema ya filtra por NODE_ENV
// Pero para debugging temporal:
if (process.env.NODE_ENV === 'development') {
  logger.debug('Module', 'Debug info');
}
```

5. **Usar ConsoleHelper para análisis**
```javascript
// Antes de pedir ayuda a IA:
const report = {
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error' }),
  topModules: __CONSOLE_HELPER__.getTopModules(5)
};
copy(JSON.stringify(report, null, 2));
```

6. **Documentar findings**
```typescript
// En comentarios del código:
/**
 * BUG FIX: Materials re-fetching infinitely
 * Root cause: useEffect missing dependency [searchTerm]
 * Solution: Added searchTerm to deps array
 * Verified: ConsoleHelper shows logs reduced from 250 → 5 per 5s
 * Date: 2025-12-25
 */
```

---

### ❌ DON'T

1. **No usar console.log directamente**
```typescript
// ❌ PROHIBIDO (ESLint error)
console.log('Debug info');

// ✅ CORRECTO
logger.debug('Module', 'Debug info');
```

2. **No ignorar warnings**
```javascript
// ❌ No ignorar
const warnings = __CONSOLE_HELPER__.getWarnings(10);
// Si hay warnings, investigar

// ✅ Investigar y resolver
warnings.forEach(w => {
  console.log(`⚠️ ${w.module}: ${w.message}`);
});
```

3. **No loggear datos sensibles**
```typescript
// ❌ PELIGROSO
logger.info('Auth', 'User logged in', {
  password: user.password,  // NO!
  token: user.token        // NO!
});

// ✅ SEGURO
logger.info('Auth', 'User logged in', {
  userId: user.id,
  email: user.email
});
```

4. **No sobrecargar logs**
```typescript
// ❌ Logging en loop
items.forEach(item => {
  logger.debug('Module', 'Processing item', item); // 1000+ logs!
});

// ✅ Log agregado
logger.debug('Module', 'Processing items', { 
  count: items.length,
  sample: items[0]
});
```

5. **No dejar debuggers en producción**
```typescript
// ❌ Olvidar quitar
debugger; // Esto pausará en producción!

// ✅ Conditional debugging
if (process.env.NODE_ENV === 'development') {
  debugger;
}
```

6. **No mezclar sistemas de logging**
```typescript
// ❌ Inconsistente
console.log('Starting...');
logger.info('Module', 'Started');
console.error('Failed');

// ✅ Consistente
logger.info('Module', 'Starting...');
logger.info('Module', 'Started');
logger.error('Module', 'Failed');
```

---

## Checklist de Debugging

### 📋 Pre-Debugging Checklist

Antes de empezar a debuggear, verificar:

- [ ] ConsoleHelper está activo (`__CONSOLE_HELPER__.isActive()`)
- [ ] Logger está configurado (`__GADMIN_LOGGER__.getConfig()`)
- [ ] React DevTools instalado
- [ ] Redux DevTools instalado (para Zustand)
- [ ] Source maps habilitados (Vite: default)
- [ ] Chrome DevTools abierto
- [ ] Console limpio (Ctrl+L)

### 📋 Post-Fix Checklist

Después de resolver un bug:

- [ ] Verificar que logs se redujeron (`__CONSOLE_HELPER__.getRecent()`)
- [ ] No hay errores nuevos (`__CONSOLE_HELPER__.getErrors()`)
- [ ] Performance no empeoró (React DevTools Profiler)
- [ ] Tests pasan (si aplica)
- [ ] Documentar fix en código (comentario)
- [ ] Actualizar documentación (si es patrón recurrente)
- [ ] Remover debuggers temporales
- [ ] Limpiar console.logs de debugging (usar logger)

---

## Referencias Rápidas

### 📚 Documentación Relevante

**Console & Logging**:
- [`docs/console/README.md`](../docs/console/README.md) - Índice completo
- [`docs/console/01-OVERVIEW.md`](../docs/console/01-OVERVIEW.md) - Visión general
- [`docs/console/02-API-REFERENCE.md`](../docs/console/02-API-REFERENCE.md) - API completa
- [`docs/console/04-USAGE-PATTERNS.md`](../docs/console/04-USAGE-PATTERNS.md) - Patrones comunes

**React Debugging**:
- [`docs/REACT_DEBUGGING_MASTER_GUIDE.md`](../docs/REACT_DEBUGGING_MASTER_GUIDE.md) - Guía maestra
- [`docs/debugging/01-debugging-basico-react.md`](../docs/debugging/01-debugging-basico-react.md) - Fundamentos
- [`docs/06-debugging/HOOKS_DEBUGGING_GUIDE.md`](../docs/06-debugging/HOOKS_DEBUGGING_GUIDE.md) - Hooks
- [`docs/06-debugging/STATE_MANAGEMENT_DEBUGGING.md`](../docs/06-debugging/STATE_MANAGEMENT_DEBUGGING.md) - State

**Performance**:
- [`docs/05-development/REACT_DEVTOOLS_PROFILING_GUIA_AVANZADA.md`](../docs/05-development/REACT_DEVTOOLS_PROFILING_GUIA_AVANZADA.md)
- [`docs/REACT_PERFORMANCE_DEBUGGING_GUIDE.md`](../docs/REACT_PERFORMANCE_DEBUGGING_GUIDE.md)

**Arquitectura**:
- [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) - Patrones del proyecto
- [`src/lib/logging/Logger.ts`](../src/lib/logging/Logger.ts) - Logger source
- [`src/lib/logging/ConsoleHelper.ts`](../src/lib/logging/ConsoleHelper.ts) - ConsoleHelper source

---

## Conclusión

Esta estrategia proporciona un framework completo para debuggear cualquier aspecto de G-Mini:

1. **Herramientas**: Logger + ConsoleHelper + React DevTools + Chrome DevTools MCP
2. **Metodología**: Workflows estructurados por tipo de problema
3. **Best Practices**: Zero console noise, logging estructurado, análisis con IA
4. **Documentación**: Guides detallados para cada aspecto

**Próximos pasos sugeridos**:
1. Familiarizarse con ConsoleHelper API
2. Configurar React DevTools
3. Practicar workflows básicos
4. Documentar nuevos patrones encontrados

---

**Mantenido por**: Equipo G-Mini  
**Última actualización**: Diciembre 2025  
**Versión**: 1.0
