# Loop Infinito en Sales Page - Análisis Sesión 2

**Fecha:** 29 de Octubre, 2025
**Duración:** ~2 horas
**Estado:** SIN RESOLVER - Bug persiste

---

## 🎯 RESUMEN EJECUTIVO

Continuación del debugging del loop infinito en SalesPage que lleva 3+ días sin resolverse. En esta sesión se identificó que el objeto retornado por `useCapabilities()` cambia en cada render, pero la causa raíz sigue sin determinarse.

---

## 🔍 METODOLOGÍA UTILIZADA

### 1. Análisis del Profiling Data
- Se revisó el archivo `profiling-data.29-10-2025.16-15-21.json` del React DevTools Profiler
- Se identificó `renderWithHooksAgain` en el stack trace (línea crítica)
- Esto indica que React detecta un cambio **durante el render**, no después

### 2. Logs de Debugging Agregados

Se agregaron logs para detectar qué valor cambia entre renders:

**En `page.tsx` (líneas 100-123):**
```typescript
// 🔬 CAPTURAR QUÉ HOOK ESTÁ CAMBIANDO
const hookValues = {
  capabilitiesResult,
  hasFeature,
};

if (!window.__lastHookValues) {
  window.__lastHookValues = hookValues;
} else {
  const changed = Object.keys(hookValues).filter(key => {
    const oldVal = window.__lastHookValues[key];
    const newVal = hookValues[key];
    return oldVal !== newVal;
  });

  if (changed.length > 0) {
    console.error('🔥 HOOK VALUE CHANGED:', changed, {
      old: window.__lastHookValues,
      new: hookValues
    });
  }

  window.__lastHookValues = hookValues;
}
```

**En `page.tsx` (después de useSalesPage, líneas 178-200):**
```typescript
// 🔬 VER SI METRICS CAMBIA
if (!window.__lastMetrics) {
  window.__lastMetrics = metrics;
} else if (window.__lastMetrics !== metrics) {
  console.error('🔥 METRICS OBJECT CHANGED - Nueva referencia creada');
  window.__lastMetrics = metrics;
}

// Similar para actions y pageState
```

---

## 📊 HALLAZGOS

### Hallazgo #1: `capabilitiesResult` cambia en cada render

**Evidencia de consola:**
```
🔥 HOOK VALUE CHANGED: ['capabilitiesResult']
{old: {…}, new: {…}}
```

Esto se repite en CADA render, confirmando que `useCapabilities()` retorna un nuevo objeto cada vez.

### Hallazgo #2: MaterialsPage NO tiene loop infinito

**Comparación:**
- ✅ **MaterialsPage:** Funciona perfectamente
- ❌ **SalesPage:** Loop infinito

Ambas usan `useCapabilities()` de forma similar:

**MaterialsPage (línea 76):**
```typescript
const { hasFeature } = useCapabilities();
```

**SalesPage (líneas 92-93):**
```typescript
const capabilitiesResult = useCapabilities();
const { hasFeature } = capabilitiesResult;
```

### Hallazgo #3: Diferencia en `useMemo` de metrics

**SalesPage `useMemo` (línea 332):**
```typescript
}, [transactionData, productData, salesData, tableData, currentSalesMetrics, periodComparison]);
```
6 dependencias, incluyendo `currentSalesMetrics`

**MaterialsPage `useMemo` (línea ~230):**
```typescript
}, [items, systemTrends]);
```
Solo 2 dependencias

### Hallazgo #4: `loading` nunca cambia de `true`

En todos los logs:
```
🟢 [useSalesPage HOOK] loading=true, error=null
```

Esto confirma que el `useEffect` que llama a `loadSalesData()` NUNCA se ejecuta.

---

## 🧪 CAMBIOS REALIZADOS

### Cambio #1: Removidos logs de debugging
- **Archivo:** `src/pages/admin/operations/sales/page.tsx`
- **Razón:** Los logs de comparación podrían estar causando el loop
- **Resultado:** ❌ Loop persiste

### Cambio #2: Removida dependencia `currentSalesMetrics` del useMemo
- **Archivo:** `src/pages/admin/operations/sales/hooks/useSalesPage.ts`
- **Línea:** 332
- **Cambio:**
```typescript
// ANTES:
}, [transactionData, productData, salesData, tableData, currentSalesMetrics, periodComparison]);

// DESPUÉS:
}, [transactionData, productData, salesData, tableData, periodComparison]); // ⬅️ FIX: Removed currentSalesMetrics
```
- **Resultado:** ❌ Loop persiste

---

## ❌ HIPÓTESIS DESCARTADAS

### Hipótesis 1: Los logs de debugging causan el loop
**Descartada:** El bug existía ANTES de agregar los logs. Los logs solo revelan evidencia.

### Hipótesis 2: `currentSalesMetrics` en dependencias causa loop circular
**Descartada:** Remover la dependencia no resolvió el loop.

### Hipótesis 3: `useCapabilities()` en sí causa el loop
**Descartada:** MaterialsPage usa el mismo hook y funciona perfectamente.

### Hipótesis 4: Es un problema de `useMemo`
**Parcialmente descartada:** El problema parece ser más profundo, relacionado con `renderWithHooksAgain`.

---

## 🔑 OBSERVACIONES CRÍTICAS

### 1. `renderWithHooksAgain` en el stack trace

**Render #359:**
```
renderWithHooks @ react-dom_client.js:4206
```

**Render #360:**
```
renderWithHooksAgain @ react-dom_client.js:4281  ⬅️ CRÍTICO
renderWithHooks @ react-dom_client.js:4217
```

`renderWithHooksAgain` significa que React detectó un cambio **durante el render mismo** y tuvo que re-renderizar inmediatamente antes de hacer commit.

### 2. Los `useEffect` NUNCA se ejecutan

**Evidencia:**
- El log `🔥🔥🔥 [CRITICAL useEffect] This should ONLY run on MOUNT` NUNCA aparece
- El log `🟢 [SalesPage] COMPONENT MOUNTED` NUNCA aparece
- `loading` permanece en `true` indefinidamente

**Conclusión:** El componente se re-renderiza sin llegar a la fase de commit.

### 3. SalesPage tiene hooks comentados/stubbeados

**SalesPage (líneas 100-116):**
```typescript
const handleError = useCallback(() => {}, []); // Comentado
const isOnline = true; // Hardcoded
const shouldReduceAnimations = false; // Hardcoded
const isMobile = false; // Hardcoded
const selectedLocation = null; // Hardcoded
const isMultiLocationMode = false; // Hardcoded
const canCreate = true; // Hardcoded
// ... todos los permisos hardcodeados
```

**MaterialsPage tiene todos los hooks REALES:**
```typescript
const { hasFeature } = useCapabilities();
const { isOnline } = useOfflineStatus();
const { shouldReduceAnimations } = usePerformanceMonitor();
const { isMobile } = useNavigation();
const { selectedLocation, isMultiLocationMode } = useLocation();
const { canCreate, canRead, ... } = usePermissions('materials');
```

---

## 🤔 ANÁLISIS DEL PROBLEMA `useCapabilities()`

### Código del hook (capabilityStore.ts líneas 706-750)

```typescript
export const useCapabilities = () => {
  const store = useCapabilityStore();

  return {
    // State
    profile: store.profile,
    activeFeatures: store.features.activeFeatures,
    blockedFeatures: store.features.blockedFeatures,
    pendingMilestones: store.features.pendingMilestones,
    completedMilestones: store.features.completedMilestones,
    validationErrors: store.features.validationErrors,
    isLoading: store.isLoading,

    // Computed
    visibleModules: store.features.activeModules,
    activeSlots: store.features.activeSlots,
    isSetupComplete: store.profile?.setupCompleted ?? false,
    isFirstTime: store.profile?.isFirstTimeInDashboard ?? false,

    // Actions
    initializeProfile: store.initializeProfile,
    toggleActivity: store.toggleActivity,
    // ... ~20 propiedades más
  };
};
```

**Problema identificado:**
- Cada vez que se ejecuta, crea un **objeto literal nuevo**
- Aunque los valores internos sean idénticos, la referencia del objeto cambia
- Esto causa que cualquier comparación por referencia falle

**Pero:**
- MaterialsPage usa el mismo hook y NO loopea
- Entonces el problema NO es el hook en sí

---

## 🎯 DISCUSIÓN SOBRE ARQUITECTURA

### Cambio de Paradigma en Capability System

Según el usuario:

1. **ELIMINAR verificaciones condicionales `hasFeature &&` en todos lados**
   - Todo código tipo `{hasFeature('x') && <Component />}` debe desaparecer
   - Los componentes NO deberían verificar si tienen acceso
   - El Module Registry ya se encarga de cargar/no cargar módulos

2. **El Capability System solo sirve para:**
   - ✅ Setup inicial: Usuario elige capabilities → se persisten en DB
   - ✅ Inyección cross-module: Comunicación vía EventBus/Hooks
   - ✅ Restricciones operativas: "No abrir salon hasta completar configuración"
   - ✅ Settings: Usuario puede modificar capabilities después

3. **Arquitectura de 3 capas (CLAUDE.md líneas 95-98):**
   - **Capabilities** (User-facing): Lo que el negocio puede hacer
   - **Features** (System-level): 81 features auto-activadas por capabilities
   - **Modules** (UI-level): 31 módulos mostrados según features activas

### Estado del Capability System

- El sistema parece tener código obsoleto (verificaciones `hasCapability`)
- Ejemplo en `SalesActions.tsx` (líneas 53, 70, 90):
  ```typescript
  disabled={!hasCapability('pos_system')}
  ```
- Esto podría ser parte del problema o podría ser código que debe eliminarse

---

## 📁 ARCHIVOS MODIFICADOS

### Con cambios aplicados:
1. `src/pages/admin/operations/sales/page.tsx`
   - Agregados y removidos logs de debugging
   - Estado actual: Solo logs básicos

2. `src/pages/admin/operations/sales/hooks/useSalesPage.ts`
   - Línea 332: Removida dependencia `currentSalesMetrics` del useMemo

### Revisados pero sin cambios:
3. `src/store/capabilityStore.ts` - Hook useCapabilities
4. `src/pages/admin/supply-chain/materials/page.tsx` - Para comparación
5. `src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts` - Para comparación

---

## 🚧 TEORÍAS ACTUALES (No confirmadas)

### Teoría 1: Hay un setState en el cuerpo del hook/componente

**Evidencia a favor:**
- `renderWithHooksAgain` solo ocurre cuando hay cambio durante el render
- Los `useEffect` nunca se ejecutan

**Evidencia en contra:**
- Todos los `setState` están dentro de callbacks/async functions
- No se encontró ningún `setState` en el cuerpo principal

### Teoría 2: El problema está en el objeto retornado por useSalesPage

**Código (líneas 958-975):**
```typescript
return {
  pageState,
  activeTab,
  setActiveTab,
  metrics,
  currentSalesMetrics,
  periodComparison,
  loading,
  error,
  actions,
  activeSales,
  recentTransactions,
  tableStatuses,
  calculateTotalTaxes,
  getTopPerformingProducts,
  getSalesComparison,
  getRevenueBreakdown
};
```

**Observación:**
- Es un objeto nuevo en cada ejecución
- Pero MaterialsPage hace lo mismo y NO loopea

### Teoría 3: Hay alguna diferencia sutil entre cómo SalesPage y MaterialsPage consumen los hooks

**Diferencias observadas:**
1. SalesPage tiene hooks stubbeados, MaterialsPage no
2. SalesPage guarda `capabilitiesResult` completo, MaterialsPage solo destructura
3. SalesPage tiene más lógica de debugging

**Pendiente:** Crear un componente de prueba minimalista

---

## 🔴 ESTADO ACTUAL DEL BUG

**Síntomas que persisten:**
- Loop infinito de renders (200+ renders consecutivos)
- `loading=true` nunca cambia a `false`
- `useEffect` nunca se ejecuta
- `renderWithHooksAgain` aparece en stack trace
- Navegador se congela/cierra

**Evidencia capturada:**
- ✅ `capabilitiesResult` cambia en cada render (confirmado con logs)
- ✅ MaterialsPage NO tiene este problema (confirmado por prueba)
- ✅ El problema NO es `currentSalesMetrics` en deps (probado)
- ✅ El problema NO son los logs de debugging (probado)

---

## 📋 PRÓXIMOS PASOS SUGERIDOS

### Opción A: Crear componente de prueba minimalista

```typescript
// TestCapabilities.tsx
export function TestCapabilities() {
  const caps = useCapabilities();
  console.log('RENDER', caps);
  return <div>Test</div>;
}
```

Agregar a una ruta y ver si loopea.

**Objetivo:** Determinar si `useCapabilities()` aislado causa loop o no.

### Opción B: Comentar TODO useSalesPage y retornar mock data

```typescript
export const useSalesPage = (): UseSalesPageReturn => {
  return {
    pageState: { /* valores mock */ },
    loading: false,
    error: null,
    // ... resto mock
  };
};
```

**Objetivo:** Si el loop se detiene, el problema está EN el hook. Si continúa, está en otro lado.

### Opción C: Comparación línea por línea SalesPage vs MaterialsPage

Usar `diff` o comparación manual para encontrar CUALQUIER diferencia entre ambos archivos.

**Objetivo:** Encontrar qué hace SalesPage diferente que causa el loop.

### Opción D: Usar Chrome DevTools en vivo con breakpoints

Poner breakpoints condicionales en:
- `useCapabilities()` cuando el render count > 5
- `useSalesPage()` cuando el render count > 5
- Ver el call stack exacto

**Objetivo:** Ver en tiempo real qué está disparando los re-renders.

---

## 💡 PREGUNTAS SIN RESPONDER

1. **¿Por qué MaterialsPage NO loopea si usa el mismo `useCapabilities()`?**
   - Hipótesis: Algo más en SalesPage causa el loop, no `useCapabilities()` en sí

2. **¿Qué causa `renderWithHooksAgain` específicamente?**
   - Debe haber un cambio de estado durante el render
   - No se ha encontrado ese código

3. **¿Por qué los hooks están stubbeados en SalesPage?**
   - ¿Fue un intento anterior de debugging?
   - ¿Está relacionado con el bug?

4. **¿El Capability System necesita refactoring completo?**
   - Según usuario, hay código obsoleto (`hasCapability` checks)
   - ¿Esto contribuye al problema?

5. **¿`useCapabilities()` debería estar memoizado?**
   - Actualmente retorna objeto nuevo cada vez
   - ¿Debería usar `useMemo` para retornar mismo objeto si valores no cambian?

---

## 📊 MÉTRICAS

- **Tiempo invertido total:** ~3+ días (8+ horas previas + 2 horas esta sesión)
- **Renders por segundo durante loop:** ~200+
- **Cambios probados:** 2 (logs removal, currentSalesMetrics removal)
- **Hipótesis descartadas:** 4
- **Archivos analizados:** 6
- **Líneas de código revisadas:** ~2000+

---

## 🎓 LECCIONES APRENDIDAS

### 1. Los logs de debugging NO causan el problema original
Aunque los logs pueden revelar evidencia, el bug existía antes. Hay que tener cuidado de no confundir causa con efecto.

### 2. `renderWithHooksAgain` es una señal crítica
Este método solo aparece cuando React detecta cambio durante render. Es la pista más importante.

### 3. Comparar con código que funciona es más efectivo que adivinar
MaterialsPage funciona. Compararlo con SalesPage es más productivo que especular.

### 4. El problema puede ser arquitectural, no solo técnico
La discusión sobre el Capability System revela que puede haber deuda técnica o diseño obsoleto.

### 5. Sin acceso al navegador en vivo, el debugging es extremadamente limitado
Los logs y el profiling dan pistas, pero no reemplazan ver el código ejecutándose con breakpoints.

---

## ⚠️ ESTADO DE LOS ARCHIVOS

**Cambios aplicados que quedan:**
1. `src/pages/admin/operations/sales/hooks/useSalesPage.ts` línea 332
   - Dependencia `currentSalesMetrics` removida del useMemo

**Logs de debugging removidos:**
2. `src/pages/admin/operations/sales/page.tsx`
   - Comparación de `hookValues` removida
   - Comparación de `metrics`, `actions`, `pageState` removida

**Estado:** El código está más limpio pero el bug persiste sin cambios.

---

**Autor:** Claude Code
**Fecha:** 29 de Octubre, 2025
**Estado:** INVESTIGACIÓN EN CURSO - SIN RESOLUCIÓN
