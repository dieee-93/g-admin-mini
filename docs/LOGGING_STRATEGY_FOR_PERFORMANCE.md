# 🎯 ESTRATEGIA DE LOGGING PARA DETECCIÓN DE RE-RENDERS

**Objetivo**: Detectar problemas de renderización tempranamente usando logging estratégico en componentes críticos.

**Autor**: Claude + Usuario
**Fecha**: 2025-01-31
**Basado en**: Optimización exitosa de LocationProvider y Materials module

---

## 📋 COMPONENTES CRÍTICOS QUE NECESITAN LOGGING

### ✅ Nivel 1: CRITICAL - Afectan toda la app

Estos componentes son **wrappers de toda la aplicación**. Si re-renderizan innecesariamente, afectan a TODOS los componentes hijos.

#### 1. **AuthContext** ❌ SIN LOGS
**Ubicación**: `src/contexts/AuthContext.tsx`
**Impacto**: MUY ALTO - Wraps toda la app autenticada
**Razón**: Cambios en `user`, `session` o `loading` causan cascada global
**Prioridad**: 🔴 URGENTE

```typescript
// AGREGAR:
const renderCountRef = useRef(0);
renderCountRef.current++;
logger.debug('AuthContext', `🔵 RENDER #${renderCountRef.current}`);

// Track state changes
const prevUserRef = useRef(user);
if (prevUserRef.current !== user) {
  logger.warn('AuthContext', '⚠️ user CHANGED!', {
    prevUser: prevUserRef.current?.id,
    newUser: user?.id,
    renderCount: renderCountRef.current
  });
  prevUserRef.current = user;
}
```

---

#### 2. **ResponsiveLayout** ❌ SIN LOGS
**Ubicación**: `src/shared/layout/ResponsiveLayout.tsx`
**Impacto**: MUY ALTO - Wraps todo el contenido de cada página
**Razón**: Cambios en breakpoints/viewport causan re-renders masivos
**Prioridad**: 🔴 URGENTE

```typescript
// AGREGAR:
const renderCountRef = useRef(0);
renderCountRef.current++;
logger.debug('ResponsiveLayout', `🔵 RENDER #${renderCountRef.current}`);

// Track breakpoint changes
const prevBreakpointRef = useRef(currentBreakpoint);
if (prevBreakpointRef.current !== currentBreakpoint) {
  logger.info('ResponsiveLayout', '📱 Breakpoint changed', {
    prev: prevBreakpointRef.current,
    new: currentBreakpoint,
    renderCount: renderCountRef.current
  });
  prevBreakpointRef.current = currentBreakpoint;
}
```

---

#### 3. **EventBusProvider** ❌ SIN LOGS
**Ubicación**: `src/providers/EventBusProvider.tsx`
**Impacto**: ALTO - Sistema de eventos global
**Razón**: Cambios en subscribers pueden causar re-renders
**Prioridad**: 🟠 ALTA

```typescript
// AGREGAR:
const renderCountRef = useRef(0);
renderCountRef.current++;
logger.debug('EventBusProvider', `🔵 RENDER #${renderCountRef.current}`);
```

---

#### 4. **AlertsProvider** ❌ SIN LOGS
**Ubicación**: `src/shared/alerts/AlertsProvider.tsx`
**Impacto**: MEDIO-ALTO - Sistema de alertas global
**Razón**: Nuevas alertas pueden causar renders frecuentes
**Prioridad**: 🟡 MEDIA

```typescript
// AGREGAR:
const renderCountRef = useRef(0);
renderCountRef.current++;
logger.debug('AlertsProvider', `🔵 RENDER #${renderCountRef.current}`, {
  alertsCount: alerts.length
});
```

---

### ✅ Nivel 2: HIGH - Contexts y Providers usados en múltiples páginas

#### 5. **NavigationContext** ✅ YA TIENE LOGS
**Ubicación**: `src/contexts/NavigationContext.tsx`
**Estado**: ✅ Optimizado con logs completos
**Patrón a seguir**: Ejemplo perfecto

#### 6. **LocationContext** ✅ YA TIENE LOGS
**Ubicación**: `src/contexts/LocationContext.tsx`
**Estado**: ✅ Optimizado (2025-01-31)
**Patrón a seguir**: Incluye tracking de array references

---

### ✅ Nivel 3: MEDIUM - Performance wrappers y HOCs

#### 7. **RuntimeOptimizations** ❌ SIN LOGS
**Ubicación**: `src/lib/performance/RuntimeOptimizations.tsx`
**Impacto**: MEDIO - Wraps componentes con optimizaciones
**Prioridad**: 🟡 MEDIA

```typescript
// AGREGAR solo si se detectan problemas
const renderCountRef = useRef(0);
if (process.env.NODE_ENV === 'development') {
  renderCountRef.current++;
  if (renderCountRef.current > 10) {
    logger.warn('RuntimeOptimizations', `⚠️ Excessive renders: ${renderCountRef.current}`);
  }
}
```

---

#### 8. **PerformanceMonitor** 🟢 REVISAR
**Ubicación**: `src/lib/performance/PerformanceMonitor.tsx`
**Estado**: Componente de monitoreo - probablemente ya tiene logs
**Acción**: Verificar y asegurar que loggea FPS drops

---

### ✅ Nivel 4: LOW - Stores de Zustand

Los stores de Zustand NO necesitan logs de render directamente, pero SÍ necesitan:

#### **Logging de cambios de estado** (en actions)

```typescript
// PATRÓN RECOMENDADO para actions de Zustand:
set((state) => {
  logger.debug('MaterialsStore', '🔄 State update', {
    operation: 'addMaterial',
    prevCount: state.items.length,
    newCount: state.items.length + 1
  });

  return { items: [...state.items, newItem] };
});
```

---

## 🎨 PATRÓN ESTÁNDAR DE LOGGING

### Template para cualquier Context/Provider:

```typescript
import { useRef } from 'react';
import { logger } from '@/lib/logging';

export function MyProvider({ children }: { children: ReactNode }) {
  // 1️⃣ Render counter
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  // 2️⃣ Log básico (desarrollo only)
  if (process.env.NODE_ENV === 'development') {
    logger.debug('MyProvider', `🔵 RENDER #${renderCountRef.current}`);
  }

  // 3️⃣ Track critical state changes
  const [criticalState, setCriticalState] = useState(initialValue);
  const prevCriticalStateRef = useRef(criticalState);

  if (prevCriticalStateRef.current !== criticalState) {
    logger.warn('MyProvider', '⚠️ criticalState CHANGED!', {
      prev: prevCriticalStateRef.current,
      new: criticalState,
      renderCount: renderCountRef.current
    });
    prevCriticalStateRef.current = criticalState;
  }

  // 4️⃣ Alert on excessive renders
  if (renderCountRef.current > 20) {
    logger.error('MyProvider', '🔴 EXCESSIVE RENDERS DETECTED!', {
      count: renderCountRef.current,
      uptime: Date.now() // or use performance.now()
    });
  }

  // ... resto del código
}
```

---

## 🔍 CUÁNDO AGREGAR LOGS

### SÍ agregar logs si:
- ✅ Es un Context/Provider que wrappea la app o módulos grandes
- ✅ Es un layout component usado en múltiples páginas
- ✅ Maneja estado global (auth, navigation, alerts)
- ✅ Usa `useEffect` con muchas dependencias
- ✅ Consume múltiples Zustand stores
- ✅ Es un HOC (Higher-Order Component)

### NO agregar logs si:
- ❌ Es un componente presentacional puro (solo recibe props)
- ❌ Es un componente de UI básico (Button, Input, etc.)
- ❌ Ya está memoizado con React.memo y no tiene estado
- ❌ Es renderizado por demanda (modales, dropdowns)

---

## 🚨 SEÑALES DE ALERTA EN CONSOLEHELPER

### Usar ConsoleHelper para detectar patrones:

```javascript
// 1. Ver módulos con más actividad
__CONSOLE_HELPER__.getTopModules(10)

// 2. Buscar logs de RENDER
__CONSOLE_HELPER__.search("RENDER #", 20)

// 3. Ver warnings de cambios
__CONSOLE_HELPER__.getWarnings(10)

// 4. Detectar renders excesivos
__CONSOLE_HELPER__.exportForAI({ module: "AuthContext" })
```

### Umbrales de alerta:

| Render Count | Nivel | Acción |
|--------------|-------|--------|
| 1-5 | 🟢 Normal | Ignorar |
| 6-10 | 🟡 Observar | Monitorear |
| 11-20 | 🟠 Sospechoso | Investigar |
| 20+ | 🔴 Problema | Fix urgente |

---

## 📊 CASO DE ÉXITO: LocationProvider

**Problema detectado**: 8 re-renders en 200ms
**Cómo lo encontramos**: Logs de `RENDER #` + `selectedInfrastructure CHANGED`
**Solución**: `useShallow` de Zustand + `getUpdatedArrayIfChanged`
**Resultado**: 0 re-renders innecesarios

### Log que reveló el problema:
```javascript
⚠️ selectedInfrastructure CHANGED!
{
  prevReference: ["single_location"],
  newReference: ["single_location"],
  areSameReference: false  // 🔴 AQUÍ ESTABA EL PROBLEMA
}
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1: CRITICAL (Esta semana)
1. [ ] AuthContext - Agregar logs completos
2. [ ] ResponsiveLayout - Agregar logs de breakpoints
3. [ ] EventBusProvider - Logs básicos

### Fase 2: HIGH (Siguiente semana)
4. [ ] AlertsProvider - Logs de alertas
5. [ ] RuntimeOptimizations - Conditional logging

### Fase 3: MONITORING (Continuo)
6. [x] ConsoleHelper para monitoreo regular
7. [x] Documentar umbrales en CLAUDE.md
8. [ ] Agregar a checklist de code review

---

## 📚 REFERENCIAS

- **CLAUDE.md**: Sección "Performance Optimization > Debugging Re-renders"
- **ConsoleHelper**: `src/lib/logging/ConsoleHelper.ts`
- **Casos resueltos**: LocationProvider (2025-01-31), NavigationContext

---

## 🔧 HERRAMIENTAS

### ConsoleHelper Quick Commands:
```javascript
// Estado general
__CONSOLE_HELPER__.getSummary()

// Buscar renders
__CONSOLE_HELPER__.search("RENDER", 30)

// Módulo específico
__CONSOLE_HELPER__.getByModule("AuthContext", 20)

// Export para Claude
__CONSOLE_HELPER__.exportForAI({ module: "ResponsiveLayout", limit: 30 })
```

### Logger Methods:
```typescript
logger.debug(module, message, data?)  // Renders normales
logger.info(module, message, data?)   // Cambios de estado
logger.warn(module, message, data?)   // Cambios sospechosos
logger.error(module, message, data?)  // Renders excesivos
```

---

**IMPORTANTE**: Los logs deben ser **informativos pero no verbosos**. Usar `logger.debug` para renders normales y `logger.warn` solo para cambios inesperados.
