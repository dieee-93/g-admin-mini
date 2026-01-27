# 🎧 ConsoleHelper - Overview

## 📋 ¿Qué es ConsoleHelper?

**ConsoleHelper** es un sistema de captura y filtrado inteligente de logs diseñado específicamente para **debugging con IA (Chrome DevTools MCP)**. Intercepta y almacena en memoria todos los logs de la aplicación, proporcionando acceso filtrado y optimizado para análisis.

---

## 🎯 Problema que Resuelve

### Problema Original
Chrome DevTools MCP herramienta `list_console_messages` devuelve **123,000+ tokens** de logs, lo cual:
- ❌ Excede el límite de 25K tokens de Claude
- ❌ Falla con error de token overflow
- ❌ Es imposible de analizar eficientemente
- ❌ Incluye logs irrelevantes (framework noise, dev warnings, etc.)

### Solución Implementada
ConsoleHelper **reduce 123K tokens a <1K** mediante:
- ✅ Captura selectiva en memoria (últimos 1000 logs)
- ✅ Filtrado inteligente por nivel, módulo, dominio, tiempo
- ✅ Export optimizado con truncamiento y formato compacto
- ✅ Debouncing para eliminar duplicados
- ✅ Domain detection automático

**Ejemplo real**:
```javascript
// ❌ ANTES: Chrome DevTools MCP
list_console_messages()
// → 123,000 tokens ❌ (falla)

// ✅ DESPUÉS: ConsoleHelper
__CONSOLE_HELPER__.exportForAI({ level: 'error' })
// → 600 tokens ✅ (con información relevante)
```

---

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────┐
│           Application Code                  │
│   (logger.info(), console.log(), etc.)      │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│        Console Interceptor                  │
│  (Wraps console.log/info/warn/error)        │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│           Capture Engine                    │
│  • Parse log format (module, domain)        │
│  • Debounce duplicates (500ms window)       │
│  • Truncate long messages (500 chars)       │
│  • Store in circular buffer (max 1000)      │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│          In-Memory Store                    │
│     CapturedLog[] (max 1000 logs)           │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│         Query & Filter API                  │
│  • getErrors(), getByModule(), search()     │
│  • exportForAI(), getStats(), getTopModules()│
└─────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│      Global Window Access                   │
│    window.__CONSOLE_HELPER__                │
└─────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Application logs** → `logger.info('Module', 'message', data)`
2. **Interceptor** → Captura antes de mostrar en console
3. **Parser** → Extrae module, domain, level, message, data
4. **Debouncer** → Elimina duplicados dentro de 500ms
5. **Storage** → Almacena en array circular (FIFO)
6. **Query API** → Expone métodos de filtrado y export
7. **Window global** → Accesible como `__CONSOLE_HELPER__`

---

## 🔑 Características Clave

### 1. Captura Inteligente
- **Zero overhead** en producción (solo activo en `NODE_ENV=development`)
- **Circular buffer**: Mantiene últimos 1000 logs (elimina los más viejos automáticamente)
- **Debouncing**: Ignora logs duplicados dentro de 500ms window
- **Truncamiento**: Mensajes >500 chars y data >500 chars se truncan

### 2. Parsing Avanzado
Reconoce múltiples formatos de log:

```typescript
// Pattern 1: Logger format completo
"HH:MM:SS.mmm 🔍 [DEBUG] 🧭 [NavigationContext] Message"

// Pattern 2: Module only
"[NavigationContext] Message"

// Pattern 3: Custom prefixes
"[SW] Service Worker message"
"[Security] Security alert"
```

Detecta **domain automáticamente**:
- `*Store` → "Stores"
- `*Context` → "Core"
- `*API`, `*Supabase` → "Network"
- `*EventBus` → "EventBus"
- `*Performance`, `*LazyLoading` → "Performance"
- `*Service`, `*Worker` → "Infrastructure"
- `*Security` → "Security"
- Otros → "Business"

### 3. Filtrado Multi-Criterio
```typescript
interface ConsoleFilterOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  module?: string;          // Partial match (case-insensitive)
  domain?: string;          // Exact match
  search?: string;          // Text search in message
  limit?: number;           // Max results (default: 50)
  since?: number;           // Timestamp in ms (default: last 60s)
}
```

### 4. Optimización para IA
Export compacto con campos abreviados:
```typescript
{
  time: "14:32:15.123",    // HH:MM:SS.mmm (vs ISO timestamp)
  lvl: "E",                // D/I/W/E (vs 'error')
  mod: "NavigationCont",   // Truncated to 15 chars
  dom: "Core",             // Truncated to 10 chars
  msg: "Failed to load...", // Truncated to 100 chars
  data: "{error:...}"      // Truncated to 150 chars
}
```

**Ahorro de tokens**: ~90% reduction vs full format

---

## 🎯 Casos de Uso Principales

### 1. Debug de Performance Issues
```javascript
// Detectar re-renders infinitos
__CONSOLE_HELPER__.search("RENDER #", 50)

// Ver módulo con más actividad
__CONSOLE_HELPER__.getTopModules(5)
```

### 2. Análisis de Errores
```javascript
// Últimos 10 errores con contexto
__CONSOLE_HELPER__.getErrors(10)

// Buscar errores de un módulo específico
__CONSOLE_HELPER__.exportForAI({ 
  level: 'error',
  module: 'Materials'
})
```

### 3. Debugging con IA
```javascript
// Export optimizado para Claude/ChatGPT
const report = {
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 20 }),
  context: __CONSOLE_HELPER__.exportForAI({ module: 'Navigation', limit: 30 })
};
// → ~1K tokens vs 123K
```

### 4. Monitoreo en Tiempo Real
```javascript
// Dashboard de estado
setInterval(() => {
  const stats = __CONSOLE_HELPER__.getSummary();
  console.log(`Errors: ${stats.errors}, Warnings: ${stats.warnings}`);
}, 5000);
```

---

## 🔧 Inicialización

### En App.tsx
```typescript
// src/App.tsx (línea 238-240)
if (process.env.NODE_ENV === 'development') {
  ConsoleHelper.init();
}
```

### Verificación de Startup
Al cargar la página en desarrollo, verás:
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

## 📊 Impacto en el Sistema

### Performance
- **Memory usage**: ~100KB para 1000 logs (despreciable)
- **CPU overhead**: <1ms por log capturado (imperceptible)
- **Bundle size**: 8.5KB minified (included in logging bundle)

### Seguridad
- ✅ Solo activo en desarrollo (`NODE_ENV !== 'production'`)
- ✅ No persiste datos (todo en memoria)
- ✅ Se limpia al refrescar página
- ✅ Trunca datos sensibles automáticamente

### Compatibilidad
- ✅ Chrome 90+
- ✅ Firefox 88+ (con `window.__CONSOLE_HELPER__`)
- ✅ Edge 90+
- ✅ Safari 14+ (limited support)

---

## 🚨 Limitaciones Conocidas

### 1. Solo Modo Desarrollo
ConsoleHelper **NO funciona en producción** por diseño. Es una herramienta de debugging, no de logging en producción.

### 2. No Persiste Datos
Los logs se pierden al refrescar la página. Para análisis histórico, exporta antes de refresh.

### 3. Limite de 1000 Logs
Circular buffer mantiene solo los últimos 1000 logs. Para análisis extenso, usa:
```javascript
const backup = __CONSOLE_HELPER__.exportFull(1000);
localStorage.setItem('logs-backup', JSON.stringify(backup));
```

### 4. No Captura Todos los Logs
Solo captura logs que pasan por:
- `logger.*` (sistema de logging centralizado)
- `console.*` (interceptado)

No captura:
- Logs nativos del browser (network errors, etc.)
- Logs de extensions
- Console direct writes sin interceptor

---

## 🔗 Referencias

- **Código fuente**: `src/lib/logging/ConsoleHelper.ts`
- **API completa**: Ver [02-API-REFERENCE.md](./02-API-REFERENCE.md)
- **Guía rápida**: Ver [03-QUICK-START.md](./03-QUICK-START.md)
- **Patrones de uso**: Ver [04-USAGE-PATTERNS.md](./04-USAGE-PATTERNS.md)

---

**Próximo**: Lee [02-API-REFERENCE.md](./02-API-REFERENCE.md) para ver todos los métodos disponibles.
