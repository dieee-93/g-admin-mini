# 🎧 ConsoleHelper - API Reference

## 📚 Referencia Completa de API

Esta guía documenta **todos los métodos públicos** disponibles en ConsoleHelper, optimizada para consumo por IA.

---

## 🔧 Métodos de Inicialización

### `ConsoleHelper.init()`

Inicializa el interceptor de consola (solo en modo desarrollo).

**Firma**:
```typescript
static init(): void
```

**Comportamiento**:
- ✅ Solo activo si `process.env.NODE_ENV === 'development'`
- ✅ Verifica que no esté ya inicializado
- ✅ Wraps `console.log/info/warn/error/debug`
- ✅ Expone en `window.__CONSOLE_HELPER__`

**Uso**:
```typescript
// En src/App.tsx
if (process.env.NODE_ENV === 'development') {
  ConsoleHelper.init();
}
```

**Retorna**: `void`

**Efectos secundarios**:
- Modifica `console.*` methods globalmente
- Crea `window.__CONSOLE_HELPER__`
- Log en consola: "🎧 Console Helper initialized"

---

## 📊 Métodos de Estado

### `ConsoleHelper.isActive()`

Verifica si el interceptor está activo.

**Firma**:
```typescript
static isActive(): boolean
```

**Ejemplo**:
```javascript
if (__CONSOLE_HELPER__.isActive()) {
  console.log('ConsoleHelper está corriendo ✅');
}
```

**Retorna**: `true` si interceptor instalado, `false` si no.

**Uso con MCP**:
```javascript
// Chrome DevTools MCP
evaluate_script({ 
  function: "() => window.__CONSOLE_HELPER__.isActive()" 
})
```

---

### `ConsoleHelper.getSummary()`

Obtiene resumen compacto del estado (minimal tokens).

**Firma**:
```typescript
static getSummary(): {
  active: boolean;
  total: number;
  errors: number;
  warnings: number;
  topModule: string;
  uptime: string;
}
```

**Ejemplo**:
```javascript
const summary = __CONSOLE_HELPER__.getSummary();
console.log(summary);
// {
//   active: true,
//   total: 150,
//   errors: 2,
//   warnings: 5,
//   topModule: 'NavigationContext',
//   uptime: '45s'
// }
```

**Campos del retorno**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `active` | `boolean` | Si interceptor está activo |
| `total` | `number` | Total de logs capturados (max 1000) |
| `errors` | `number` | Count de logs nivel error |
| `warnings` | `number` | Count de logs nivel warn |
| `topModule` | `string` | Módulo con más logs (últimos 60s) |
| `uptime` | `string` | Tiempo desde init (formato: "45s") |

**Tokens**: ~50 tokens

---

### `ConsoleHelper.getStats()`

Obtiene estadísticas detalladas de logging.

**Firma**:
```typescript
static getStats(): LogStats

interface LogStats {
  total: number;
  last60s: number;
  byLevel: Record<string, number>;
  byModule: Record<string, number>;
  byDomain: Record<string, number>;
  longMessages: number;
  withData: number;
  avgMessageLength: number;
}
```

**Ejemplo**:
```javascript
const stats = __CONSOLE_HELPER__.getStats();
console.log(stats);
// {
//   total: 150,
//   last60s: 45,
//   byLevel: { debug: 20, info: 15, warn: 5, error: 2 },
//   byModule: { NavigationContext: 12, MaterialsStore: 8, ... },
//   byDomain: { Core: 15, Business: 10, Stores: 8, ... },
//   longMessages: 5,
//   withData: 12,
//   avgMessageLength: 87
// }
```

**Campos del retorno**:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total` | `number` | Total logs en buffer |
| `last60s` | `number` | Logs en últimos 60 segundos |
| `byLevel` | `Record<string, number>` | Count por nivel (debug/info/warn/error) |
| `byModule` | `Record<string, number>` | Count por módulo |
| `byDomain` | `Record<string, number>` | Count por dominio (Core/Business/Stores/etc.) |
| `longMessages` | `number` | Mensajes >200 chars |
| `withData` | `number` | Logs con campo `data` presente |
| `avgMessageLength` | `number` | Longitud promedio de mensajes |

**Tokens**: ~300-500 tokens (depende de cantidad de módulos)

---

## 🔍 Métodos de Filtrado

### `ConsoleHelper.getFiltered(options)`

Filtrado avanzado multi-criterio.

**Firma**:
```typescript
static getFiltered(options: ConsoleFilterOptions = {}): CapturedLog[]

interface ConsoleFilterOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  module?: string;          // Partial match, case-insensitive
  domain?: string;          // Exact match
  search?: string;          // Text search in message
  limit?: number;           // Max results (default: 50)
  since?: number;           // Timestamp in ms (default: now - 60000)
}

interface CapturedLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;
  domain: string;
  message: string;
  data?: any;
  stack?: string;
}
```

**Ejemplos**:
```javascript
// 1. Solo errores del último minuto
__CONSOLE_HELPER__.getFiltered({ level: 'error' })

// 2. Logs de módulo Navigation
__CONSOLE_HELPER__.getFiltered({ module: 'Navigation', limit: 20 })

// 3. Buscar texto "failed"
__CONSOLE_HELPER__.getFiltered({ search: 'failed' })

// 4. Filtro complejo
__CONSOLE_HELPER__.getFiltered({
  level: 'warn',
  module: 'Materials',
  domain: 'Business',
  since: Date.now() - 120000, // Últimos 2 min
  limit: 30
})
```

**Comportamiento**:
- `module`: Hace **partial match** case-insensitive (ej: "nav" matchea "NavigationContext")
- `search`: Busca en campo `message` (case-insensitive)
- `limit`: Retorna últimos N logs que matchean
- `since`: Default = últimos 60 segundos

**Retorna**: Array de `CapturedLog` (vacío si no hay matches)

---

### `ConsoleHelper.getErrors(limit?)`

Obtiene solo logs de nivel error.

**Firma**:
```typescript
static getErrors(limit: number = 10): CapturedLog[]
```

**Ejemplo**:
```javascript
// Últimos 10 errores
const errors = __CONSOLE_HELPER__.getErrors(10);

// Últimos 5 errores
const recent = __CONSOLE_HELPER__.getErrors(5);
```

**Equivalente a**:
```javascript
__CONSOLE_HELPER__.getFiltered({ level: 'error', limit: 10 })
```

**Retorna**: Array de logs nivel `error`

---

### `ConsoleHelper.getWarnings(limit?)`

Obtiene solo logs de nivel warning.

**Firma**:
```typescript
static getWarnings(limit: number = 10): CapturedLog[]
```

**Ejemplo**:
```javascript
const warnings = __CONSOLE_HELPER__.getWarnings(20);
```

**Equivalente a**:
```javascript
__CONSOLE_HELPER__.getFiltered({ level: 'warn', limit: 10 })
```

**Retorna**: Array de logs nivel `warn`

---

### `ConsoleHelper.getByModule(module, limit?)`

Obtiene logs de un módulo específico.

**Firma**:
```typescript
static getByModule(module: string, limit: number = 20): CapturedLog[]
```

**Parámetros**:
- `module`: Nombre del módulo (partial match, case-insensitive)
- `limit`: Max logs a retornar (default: 20)

**Ejemplos**:
```javascript
// Logs de MaterialsStore
__CONSOLE_HELPER__.getByModule('Materials', 20)

// Logs de NavigationContext
__CONSOLE_HELPER__.getByModule('NavigationContext', 15)

// Todos los *Store modules
__CONSOLE_HELPER__.getByModule('Store', 50)
```

**Matching**:
- "Materials" matchea "MaterialsStore"
- "nav" matchea "NavigationContext", "NavigationProvider"
- Case-insensitive: "materials" = "Materials"

**Retorna**: Array de logs del módulo

---

### `ConsoleHelper.getByDomain(domain, limit?)`

Obtiene logs de un dominio específico.

**Firma**:
```typescript
static getByDomain(domain: string, limit: number = 20): CapturedLog[]
```

**Dominios disponibles**:
- `"Core"` - Contexts, providers
- `"Stores"` - Zustand stores
- `"Network"` - API calls, Supabase
- `"EventBus"` - Event system
- `"Performance"` - Performance monitoring
- `"Infrastructure"` - Services, workers
- `"Security"` - Security logs
- `"Business"` - Business logic

**Ejemplo**:
```javascript
// Todos los logs de stores
__CONSOLE_HELPER__.getByDomain('Stores', 30)

// Logs de network
__CONSOLE_HELPER__.getByDomain('Network', 20)
```

**Retorna**: Array de logs del dominio

---

### `ConsoleHelper.getRecent(seconds?, limit?)`

Obtiene logs recientes por timeframe.

**Firma**:
```typescript
static getRecent(seconds: number = 10, limit: number = 50): CapturedLog[]
```

**Parámetros**:
- `seconds`: Ventana de tiempo (default: 10)
- `limit`: Max logs (default: 50)

**Ejemplos**:
```javascript
// Últimos 10 segundos
__CONSOLE_HELPER__.getRecent(10, 50)

// Último minuto
__CONSOLE_HELPER__.getRecent(60, 100)

// Últimos 5 segundos (default limit 50)
__CONSOLE_HELPER__.getRecent(5)
```

**Retorna**: Logs dentro del timeframe especificado

---

### `ConsoleHelper.search(query, limit?)`

Búsqueda de texto en mensajes.

**Firma**:
```typescript
static search(query: string, limit: number = 30): CapturedLog[]
```

**Parámetros**:
- `query`: Texto a buscar (case-insensitive)
- `limit`: Max resultados (default: 30)

**Ejemplos**:
```javascript
// Buscar "error"
__CONSOLE_HELPER__.search('error', 30)

// Buscar "RENDER"
__CONSOLE_HELPER__.search('RENDER #', 50)

// Buscar "failed to load"
__CONSOLE_HELPER__.search('failed to load', 20)
```

**Matching**: Case-insensitive substring match en campo `message`

**Retorna**: Logs cuyo mensaje contiene el query

---

## 📤 Métodos de Export

### `ConsoleHelper.exportForAI(options?)`

Export optimizado para análisis con IA (90% reducción de tokens).

**Firma**:
```typescript
static exportForAI(options: ConsoleFilterOptions = {}): Array<{
  time: string;
  lvl: string;
  mod: string;
  dom: string;
  msg: string;
  data?: string;
}>
```

**Formato de retorno**:
```javascript
[
  {
    time: "14:32:15.123",    // HH:MM:SS.mmm
    lvl: "E",                 // D/I/W/E
    mod: "NavigationCont",    // Truncated to 15 chars
    dom: "Core",              // Truncated to 10 chars
    msg: "Failed to load...", // Truncated to 100 chars
    data: "{error:...}"       // Truncated to 150 chars (optional)
  },
  // ...
]
```

**Ejemplos**:
```javascript
// 1. Solo errores (más común para debugging con IA)
__CONSOLE_HELPER__.exportForAI({ level: 'error' })

// 2. Módulo específico
__CONSOLE_HELPER__.exportForAI({ 
  module: 'Materials', 
  limit: 30 
})

// 3. Últimos 2 minutos
__CONSOLE_HELPER__.exportForAI({ 
  since: Date.now() - 120000,
  limit: 50
})

// 4. Filtro complejo
__CONSOLE_HELPER__.exportForAI({
  level: 'error',
  module: 'Navigation',
  since: Date.now() - 60000,
  limit: 20
})
```

**Uso con MCP**:
```javascript
// Chrome DevTools MCP
evaluate_script({ 
  function: "() => window.__CONSOLE_HELPER__.exportForAI({ level: 'error' })" 
})
```

**Ventajas**:
- ✅ ~90% menos tokens que `exportFull()`
- ✅ Formato compacto pero legible
- ✅ Preserva información crítica
- ✅ Ideal para copy/paste a Claude

**Retorna**: Array de logs en formato compacto

---

### `ConsoleHelper.exportFull(limit?)`

Export completo sin truncamiento (usar con moderación).

**Firma**:
```typescript
static exportFull(limit: number = 100): CapturedLog[]
```

**Ejemplo**:
```javascript
// Exportar últimos 100 logs completos
const fullLogs = __CONSOLE_HELPER__.exportFull(100);

// Guardar a localStorage
localStorage.setItem('logs-backup', JSON.stringify(fullLogs));
```

**⚠️ Advertencia**: Puede generar 10K+ tokens. Usar solo para:
- Backup antes de limpiar logs
- Análisis offline detallado
- Debug de ConsoleHelper mismo

**Retorna**: Array de `CapturedLog` sin truncamiento

---

## 📈 Métodos de Análisis

### `ConsoleHelper.getTopModules(count?)`

Obtiene módulos con más actividad (últimos 60s).

**Firma**:
```typescript
static getTopModules(count: number = 5): Array<{
  module: string;
  count: number;
  domain: string;
}>
```

**Ejemplo**:
```javascript
const top = __CONSOLE_HELPER__.getTopModules(5);
console.table(top);
// [
//   { module: 'NavigationContext', count: 25, domain: 'Core' },
//   { module: 'MaterialsStore', count: 18, domain: 'Stores' },
//   { module: 'EventBus', count: 15, domain: 'EventBus' },
//   { module: 'OfflineSync', count: 12, domain: 'Infrastructure' },
//   { module: 'SupabaseAPI', count: 8, domain: 'Network' }
// ]
```

**Uso**: Identificar módulos con posibles problemas de performance (muchos logs = muchos renders o errores)

**Retorna**: Array ordenado por `count` (descendente)

---

## 🧹 Métodos de Limpieza

### `ConsoleHelper.clear()`

Limpia todos los logs capturados.

**Firma**:
```typescript
static clear(): void
```

**Ejemplo**:
```javascript
// Exportar antes de limpiar
const backup = __CONSOLE_HELPER__.exportFull(1000);
console.log('Backup creado:', backup.length, 'logs');

// Limpiar
__CONSOLE_HELPER__.clear();

// Verificar
__CONSOLE_HELPER__.getSummary()
// → { total: 0, errors: 0, warnings: 0, ... }
```

**Efectos secundarios**:
- Vacía array de logs
- Limpia debounce cache
- Log en consola: "🧹 Console logs cleared"

**Retorna**: `void`

---

## 🎯 Tipos TypeScript

### `ConsoleFilterOptions`

```typescript
export interface ConsoleFilterOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  module?: string;
  domain?: string;
  search?: string;
  limit?: number;
  since?: number;
}
```

### `CapturedLog`

```typescript
interface CapturedLog {
  timestamp: number;        // Unix timestamp in ms
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;           // Extracted from log format
  domain: string;           // Auto-detected category
  message: string;          // Truncated to 500 chars
  data?: any;              // Optional structured data
  stack?: string;          // Error stack trace (if error)
}
```

### `LogStats`

```typescript
interface LogStats {
  total: number;
  last60s: number;
  byLevel: Record<string, number>;
  byModule: Record<string, number>;
  byDomain: Record<string, number>;
  longMessages: number;
  withData: number;
  avgMessageLength: number;
}
```

---

## 🔗 Global Window Access

En desarrollo, ConsoleHelper está disponible globalmente:

```typescript
declare global {
  interface Window {
    __CONSOLE_HELPER__: typeof ConsoleHelper;
  }
}

// Uso
window.__CONSOLE_HELPER__.getErrors(10)

// Shorthand
__CONSOLE_HELPER__.getErrors(10)
```

---

## 📊 Comparación de Métodos por Uso

### Para Debugging Rápido
```javascript
getSummary()      // ✅ Quick overview (50 tokens)
getErrors(10)     // ✅ Recent errors
getTopModules(5)  // ✅ Activity hotspots
```

### Para Análisis con IA
```javascript
exportForAI({ level: 'error' })        // ✅ Error analysis (~600 tokens)
exportForAI({ module: 'X' })           // ✅ Module deep-dive
exportForAI({ since: now - 120000 })   // ✅ Timeline analysis
```

### Para Debugging Profundo
```javascript
getFiltered({ ... })  // ✅ Custom filtering
getByModule('X')      // ✅ Module inspection
search('keyword')     // ✅ Pattern detection
```

### Para Reports
```javascript
getStats()           // ✅ Detailed statistics
getTopModules(10)    // ✅ Activity ranking
exportFull(100)      // ⚠️ Full backup (use sparingly)
```

---

**Próximo**: Lee [03-QUICK-START.md](./03-QUICK-START.md) para empezar a usar ConsoleHelper.
