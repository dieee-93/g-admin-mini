# 🐛 Estrategia de Debugging - Bug de Navegación Repetida

**Fecha**: 2025-11-17
**Problema**: Navegación falla intermitentemente, requiriendo múltiples intentos o refresh
**Módulos afectados**: Principalmente `products`, ocasionalmente otros módulos

---

## 📊 Análisis del Problema

### Síntomas Observados

De los logs proporcionados (12:02:01 - 12:02:08):

```
12:02:01,685 handleNavigateToModule called {moduleId: 'products'}
12:02:06,443 handleNavigateToModule called {moduleId: 'products'}  [+5s]
12:02:07,672 handleNavigateToModule called {moduleId: 'products'}  [+1s]
12:02:08,274 handleNavigateToModule called {moduleId: 'products'}  [+0.6s]
12:02:08,526 handleNavigateToModule called {moduleId: 'products'}  [+0.25s]
12:02:08,714 handleNavigateToModule called {moduleId: 'products'}  [+0.19s]
```

**Patrón detectado:**
- **7 intentos** en **7 segundos**
- **6 intentos** en el **último segundo** (posible loop)
- La navegación eventualmente "se desbloquea" después de PerformanceWrapper re-render

### Hipótesis Principales

1. **Race Condition**: Múltiples componentes llaman a `navigateToModule()` simultáneamente
2. **React Router bloqueado**: `navigate()` no está completando, causando reintentos
3. **Event listener duplicados**: Múltiples subscriptores al click event
4. **Re-render cascade**: Cambios de estado disparan re-renders que reintentan navegación
5. **Lock incorrecto**: Falta de debouncing/throttling en handleNavigateToModule

---

## 🔧 Soluciones Implementadas

### 1. **Instrumentación de NavigationContext** ✅

**Archivo**: `src/contexts/NavigationContext.tsx`

#### Cambios realizados:

**A. Navigation Lock para prevenir rapid-fire attempts**

```typescript
const navigationLockRef = useRef<{
  isNavigating: boolean;
  lastModuleId: string | null;
  lastTimestamp: number;
  attemptCount: number;
}>({
  isNavigating: false,
  lastModuleId: null,
  lastTimestamp: 0,
  attemptCount: 0
});
```

**B. Logs detallados con context completo**

Ahora cada llamada a `handleNavigateToModule` registra:
- `moduleId` solicitado
- Estado del lock (isNavigating, attemptCount, etc.)
- `currentLocation` (pathname actual)
- **Stack trace** (para identificar quién llama)
- Timestamp ISO para correlación temporal

**C. Detección automática de bug**

```typescript
if (lock.attemptCount >= 3) {
  logger.warn('NavigationContext', '🐛 BUG DETECTED: Rapid navigation attempts', {
    moduleId,
    attemptCount: lock.attemptCount,
    timeSinceLastAttempt,
    isNavigating: lock.isNavigating,
    currentPath: location.pathname,
    targetModule: navigationState.modules.find(m => m.id === moduleId),
    timestamp: new Date(now).toISOString()
  });
}
```

**D. Prevención de navegaciones duplicadas**

```typescript
// Si ya estamos navegando al mismo módulo en <500ms, ignorar
if (lock.isNavigating && timeSinceLastAttempt < 500) {
  logger.warn('NavigationContext', 'Navigation in progress, ignoring duplicate call');
  return;
}

// Si ya estamos en el path destino, no navegar
if (location.pathname === module.path) {
  logger.info('NavigationContext', 'Already at target module path, skipping navigation');
  return;
}
```

**E. Monitor de cambios de location**

```typescript
useEffect(() => {
  if (location.pathname !== lastLocationRef.current) {
    logger.debug('NavigationContext', 'Location changed', {
      from: lastLocationRef.current,
      to: location.pathname,
      wasNavigating: lock.isNavigating
    });

    // Liberar lock cuando navegación tiene éxito
    if (lock.isNavigating) {
      lock.isNavigating = false;
      lock.attemptCount = 0;
    }
  }
}, [location.pathname]);
```

---

### 2. **Hook de Debugging Especializado** ✅

**Archivo**: `src/hooks/useNavigationDebugger.ts`

Este hook trabaja en conjunto con Playwright para capturar el bug automáticamente.

#### Features:

- **Intercepta console logs** para capturar intentos de navegación
- **Detecta patrones de bug** (3+ intentos en 5 segundos)
- **Expone información a Playwright** via `window.__NAVIGATION_DEBUG_INFO__`
- **Captura stack traces** de cada intento
- **Genera reportes detallados** del bug cuando ocurre

#### Uso en desarrollo:

```tsx
import { useAutoNavigationDebugger } from '@/hooks/useNavigationDebugger';

function App() {
  const debugInfo = useAutoNavigationDebugger();

  // En consola verás: 🐛 Navigation Bug Detected cuando ocurra

  return <YourApp />;
}
```

#### Uso con Playwright:

```typescript
// En el test
await page.evaluate(() => {
  window.__ENABLE_NAVIGATION_DEBUGGER__ = true;
});

// Después de detectar el bug
const debugInfo = await page.evaluate(() => window.__NAVIGATION_DEBUG_INFO__);
console.log('Bug details:', debugInfo.bugs);
```

---

### 3. **Tests Playwright Especializados** ✅

**Archivo**: `tests/e2e/navigation-bug-detector.spec.ts`

#### Tests implementados:

**Test 1: Detector de navegación repetida**
- Navega entre módulos de manera controlada
- Captura TODOS los logs de NavigationContext
- Detecta automáticamente el patrón de bug
- Genera reporte detallado con:
  - Total de intentos
  - Intentos por módulo
  - Timestamps
  - Logs relevantes alrededor del bug

**Test 2: Simulación de clicks rápidos**
- Simula usuario frustrado haciendo clicks rápidos
- Detecta si se disparan más intentos que clicks realizados
- Captura screenshot cuando detecta el bug

**Test 3: Sesión extendida de navegación**
- Navega a múltiples rutas durante varios minutos
- Monitorea re-renders excesivos
- Detecta patrones anómalos acumulativos

#### Cómo ejecutar:

```bash
# Ejecutar solo los tests de navegación
npx playwright test navigation-bug-detector

# Ejecutar con UI para ver en tiempo real
npx playwright test navigation-bug-detector --ui

# Ejecutar en modo debug (paso a paso)
npx playwright test navigation-bug-detector --debug
```

---

## 🎯 Cómo Usar Esta Estrategia

### Paso 1: Habilitar Debugging en Desarrollo

Agrega el hook al componente principal:

```tsx
// En src/App.tsx
import { useAutoNavigationDebugger } from '@/hooks/useNavigationDebugger';

function App() {
  const navDebug = useAutoNavigationDebugger();

  // El hook se activará automáticamente en desarrollo
  // Verás mensajes en consola cuando detecte el bug

  return (
    <div>
      {/* Tu app */}
    </div>
  );
}
```

### Paso 2: Usar la App Normalmente

Navega entre módulos normalmente. Cuando ocurra el bug, verás en consola:

```
🐛 BUG DETECTED: Rapid navigation attempts
  moduleId: "products"
  attemptCount: 7
  timeSinceLastAttempt: 188
  currentPath: "/admin/dashboard"
```

### Paso 3: Capturar el Bug con Playwright

Ejecuta el test especializado:

```bash
npx playwright test navigation-bug-detector --headed
```

El test:
1. Navega automáticamente entre módulos
2. Detecta el patrón de bug
3. Captura screenshots
4. Genera reporte completo

### Paso 4: Analizar el Reporte

El test generará un reporte con:

```
📊 ANÁLISIS DE NAVEGACIÓN:
   Total intentos: 47
   Intentos exitosos: 41
   Intentos fallidos: 6

🐛 BUG DETECTADO:
   Detectados 7 intentos de navegar a "products" en 1024ms

   Intentos sospechosos:
   1. [2025-11-17T15:02:01.685Z] products - ✗
   2. [2025-11-17T15:02:06.443Z] products - ✗
   3. [2025-11-17T15:02:07.672Z] products - ✗
   ...

   📝 Logs relevantes:
   [15:02:01] handleNavigateToModule called
   [15:02:01] Navigating to module root {targetPath: '/admin/supply-chain/products'}
   [15:02:06] handleNavigateToModule called  <- Reintento después de 5s
   ...
```

---

## 🔍 Información de Debugging Disponible

### En Consola del Browser

Con el debugger habilitado, verás:

```javascript
// Logs de NavigationContext
🔍 [DEBUG] handleNavigateToModule called {
  moduleId: "products",
  lockStatus: {
    isNavigating: false,
    lastModuleId: null,
    timeSinceLastAttempt: 0,
    attemptCount: 0
  },
  currentLocation: "/admin/dashboard",
  callStack: "at handleNavigateToModule | at onClick | at Sidebar"
}

// Cuando detecta bug
⚠️ [WARN] 🐛 BUG DETECTED: Rapid navigation attempts {
  moduleId: "products",
  attemptCount: 7,
  timeSinceLastAttempt: 188
}
```

### En Playwright

```typescript
// Acceder al estado de debugging
const debugInfo = await page.evaluate(() => window.__NAVIGATION_DEBUG_INFO__);

console.log(debugInfo);
// {
//   isEnabled: true,
//   attempts: [...],
//   bugs: [{
//     detected: true,
//     moduleId: "products",
//     attemptCount: 7,
//     timeWindow: 1024,
//     attempts: [...]
//   }],
//   currentPath: "/admin/supply-chain/products"
// }
```

---

## 📈 Próximos Pasos

### Cuando se capture el bug:

1. **Analizar el stack trace** para identificar el componente que dispara los reintentos
2. **Revisar event listeners** en el componente identificado
3. **Verificar dependencies de useEffect** que puedan causar loops
4. **Buscar renders en cascada** que reinicien la navegación

### Posibles causas a investigar:

- ✅ **Navigation lock**: Ya implementado
- ⏳ **Sidebar event handlers**: Revisar si hay múltiples listeners
- ⏳ **Module registry updates**: Ver si cambios en modules[] disparan re-navegaciones
- ⏳ **Alert system re-renders**: Como viste, las alertas se re-generan con cada render
- ⏳ **PerformanceWrapper effects**: Investiga por qué renderiza 2 veces consecutivas

---

## 🎬 Demo: Cómo Reproducir el Bug

### Opción 1: Manual (en desarrollo)

1. Abre la app en localhost:5173
2. Habilita el debugger agregando en consola:
   ```javascript
   window.__ENABLE_NAVIGATION_DEBUGGER__ = true
   ```
3. Navega al módulo products desde el sidebar
4. Si el bug ocurre, verás el warning automáticamente
5. Ejecuta para ver el reporte:
   ```javascript
   console.log(window.__NAVIGATION_DEBUG_INFO__)
   ```

### Opción 2: Playwright (automatizado)

```bash
# Ejecutar test y ver resultados en tiempo real
npx playwright test navigation-bug-detector --headed --workers=1

# Ver el reporte HTML después
npx playwright show-report
```

---

## 📝 Checklist de Debugging

Cuando ocurra el bug, verifica:

- [ ] ¿Cuántos intentos de navegación se registraron?
- [ ] ¿Cuál es el `timeSinceLastAttempt` entre intentos?
- [ ] ¿El stack trace muestra el mismo componente cada vez?
- [ ] ¿La URL cambió eventualmente o quedó bloqueada?
- [ ] ¿Hubo re-renders de PerformanceWrapper cercanos?
- [ ] ¿Se inicializó el sistema de alertas durante el bug?
- [ ] ¿El `isNavigating` lock estaba activado?
- [ ] ¿React Router mostró algún error/warning?

---

## 🛠️ Archivos Modificados/Creados

### Modificados:
- ✅ `src/contexts/NavigationContext.tsx` - Instrumentación y navigation lock

### Creados:
- ✅ `src/hooks/useNavigationDebugger.ts` - Hook de debugging
- ✅ `tests/e2e/navigation-bug-detector.spec.ts` - Tests especializados
- ✅ `NAVIGATION_BUG_DEBUGGING_STRATEGY.md` - Este documento

---

## 💡 Tips para el Debugging

1. **Usa Playwright en modo headed** (`--headed`) para ver el bug visualmente
2. **Habilita slow-mo** en Playwright para ver cada paso:
   ```typescript
   use: { launchOptions: { slowMo: 1000 } }
   ```
3. **Revisa el video** que Playwright graba cuando detecta el bug
4. **Compara stack traces** de múltiples ocurrencias del bug
5. **Busca patterns en timing** - ¿Ocurre siempre después de X segundos?

---

## 🚀 Estado Actual

- ✅ Instrumentación completa de NavigationContext
- ✅ Detection automática del bug
- ✅ Protection contra reintentos rápidos
- ✅ Hook de debugging
- ✅ Tests Playwright especializados
- ⏳ Identificación de root cause (pendiente - necesita capturar el bug)
- ⏳ Fix definitivo (pendiente - depende del root cause)

---

**Siguiente paso**: Ejecutar la app en desarrollo o correr los tests de Playwright para capturar el bug con toda esta instrumentación activa.
