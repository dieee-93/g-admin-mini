# Resumen Sesión de Debugging - Loop Infinito en Sales Page

**Fecha:** 29 de Enero, 2025
**Duración:** ~3 horas
**Estado:** SIN RESOLVER - Bug persiste

---

## 🔴 SÍNTOMAS DEL BUG

1. **Loop infinito de re-renders:** Página se renderiza 200+ veces consecutivamente
2. **Navegador colapsa:** Se cierra/congela después de un tiempo
3. **Loading perpetuo:** `loading=true` nunca cambia a `false`
4. **useEffects NO se ejecutan:** Ningún useEffect llega a ejecutarse
5. **Console logs masivos:** 896K tokens de logs

---

## 📊 EVIDENCIA CAPTURADA

### Logs Reales del Navegador (Render #217-218):

```
🚀 [SalesPage] COMPONENT MOUNT - FIRST LINE
✅ [SalesPage] useCapabilities returned: {hasActiveFeatures: 47, hasVisibleModules: 18, isLoading: false}
🔴 [SalesPage COMPONENT] RENDER #217
🔵 [useSalesPage HOOK] RENDER #217 at 15:58:44
🟢 [useSalesPage HOOK] loading=true, error=null
✅ [SalesPage] useSalesPage data loaded {metrics: {…}, loading: true, error: null}

🚀 [SalesPage] COMPONENT MOUNT - FIRST LINE
✅ [SalesPage] useCapabilities returned: {hasActiveFeatures: 47, hasVisibleModules: 18, isLoading: false}
🔴 [SalesPage COMPONENT] RENDER #218
🔵 [useSalesPage HOOK] RENDER #218 at 15:58:44
🟢 [useSalesPage HOOK] loading=true, error=null
```

### Observaciones Clave:

1. ❌ **NO aparece** el log `🔥🔥🔥 [CRITICAL useEffect]` → useEffect de mount NUNCA se ejecuta
2. ❌ **NO aparece** el log `🟡 [QuickActions useEffect]` → useEffect de QuickActions NUNCA se ejecuta
3. ❌ **NO aparece** el log `🔴 [loadSalesData] CALLED` → loadSalesData NUNCA se llama
4. ✅ **SÍ aparece** `loading=true` en CADA render → El estado nunca cambia
5. ✅ **SÍ aparece** useCapabilities con valores consistentes → No es ese hook el problema

---

## 🧪 CAMBIOS REALIZADOS (En orden cronológico)

### 1. Instrumentación con Console.logs

**Archivos modificados:**
- `src/pages/admin/operations/sales/hooks/useSalesPage.ts`
- `src/pages/admin/operations/sales/page.tsx`

**Logs agregados:**
```typescript
// En useSalesPage.ts línea 181-183
console.log(`🔵 [useSalesPage HOOK] RENDER #${renderNum}`);

// En useSalesPage.ts línea 345-350
console.log('🔴 [loadSalesData] CALLED');
console.log('🔴 [loadSalesData] Setting loading=true');

// En useSalesPage.ts línea 451-456
console.log('🔥🔥🔥 [CRITICAL useEffect] This should ONLY run on MOUNT');
return () => console.log('🔥🔥🔥 [CRITICAL useEffect] CLEANUP - Component is UNMOUNTING');

// En useSalesPage.ts línea 889
console.log('🟡 [QuickActions useEffect] Calling setQuickActions');

// En useSalesPage.ts línea 951-952
console.log(`🟢 [useSalesPage HOOK] RETURN`);
console.log(`🟢 [useSalesPage HOOK] loading=${loading}, error=${error}`);

// En page.tsx línea 92-98
const capabilitiesResult = useCapabilities();
console.log('✅ [SalesPage] useCapabilities returned:', {
  hasActiveFeatures: capabilitiesResult.activeFeatures?.length || 0,
  hasVisibleModules: capabilitiesResult.visibleModules?.length || 0,
  isLoading: capabilitiesResult.isLoading
});

// En page.tsx línea 122-127
useEffect(() => {
  console.log('🟢 [SalesPage] COMPONENT MOUNTED');
  return () => console.log('🔴 [SalesPage] COMPONENT UNMOUNTING!');
}, []);
```

**Resultado:** Logs confirman que useEffects NUNCA se ejecutan.

---

### 2. Circuit Breaker en useSalesPage

**Archivo:** `src/pages/admin/operations/sales/hooks/useSalesPage.ts`

**Líneas 173-193:** Agregado tracking de renders con snapshots
```typescript
if (!window.__salesPageHookRenders) {
  window.__salesPageHookRenders = [];
  window.__renderSnapshots = [];
}
window.__salesPageHookRenders.push(Date.now());

const navSnapshot = {
  render: renderNum,
  setQuickActionsId: setQuickActions.toString().substring(0, 100),
  updateModuleBadgeId: updateModuleBadge.toString().substring(0, 100)
};
window.__renderSnapshots.push(navSnapshot);
```

**Líneas 913-949:** Agregado circuit breaker para analizar en render #5 y #20
```typescript
if (renderNum === 5) {
  console.warn('\n⚠️ ADVERTENCIA - 5 renders detectados:');
  console.table(window.__renderSnapshots);
}
```

**Resultado:** Confirmó que las funciones de NavigationContext NO cambian entre renders.

---

### 3. Intento de arreglar error de compilación

**Archivo:** `src/lib/validation/index.ts`

**Línea 5:** Comentado export que faltaba
```typescript
// TODO: Re-enable when permissions file exists
// export { checkPermissions, hasRole, hasPermission } from './permissions';
```

**Resultado:** Arregló error de build pero no afectó el loop.

---

### 4. Comentar useEffect de QuickActions

**Archivo:** `src/pages/admin/operations/sales/hooks/useSalesPage.ts`

**Líneas 808-904:** Comentado TODO el useEffect
```typescript
// 🧪 TEMPORARILY DISABLED TO TEST IF THIS CAUSES THE LOOP
/*
useEffect(() => {
  // ... todo el código del useEffect
  setQuickActions(quickActions);
}, []);
*/
console.log('🧪 [DEBUG] QuickActions useEffect DISABLED to test loop');
```

**Resultado:** ❌ **BUG PERSISTE** - Loop sigue ocurriendo.

---

### 5. Remover LazyWithErrorBoundary (App.tsx)

**Archivo:** `src/App.tsx`

**Líneas 370-380:** Reemplazado LazyWithErrorBoundary con Suspense directo
```typescript
// ANTES:
<LazyWithErrorBoundary moduleName="Ventas">
  <LazySalesPage />
</LazyWithErrorBoundary>

// DESPUÉS:
<Suspense fallback={<div>Cargando Ventas...</div>}>
  <LazySalesPage />
</Suspense>
```

**Resultado:** No testeado todavía (última modificación).

---

## 🔍 HIPÓTESIS DESCARTADAS

### ❌ Hipótesis 1: useEffect de QuickActions causa el loop
**Razón descartada:** Comentar el useEffect NO detuvo el loop.

### ❌ Hipótesis 2: NavigationContext cambia constantemente
**Razón descartada:** Snapshots muestran que `setQuickActions` y `updateModuleBadge` tienen identidad estable.

### ❌ Hipótesis 3: Dependencias inestables en useEffect
**Razón descartada:** El useEffect tiene deps vacías `[]` y de todas formas NUNCA se ejecuta.

### ❌ Hipótesis 4: useCapabilities causa re-renders
**Razón descartada:** Logs muestran valores consistentes (47 features, 18 modules, isLoading: false).

### ❌ Hipótesis 5: loadSalesData se llama en loop
**Razón descartada:** El log `🔴 [loadSalesData] CALLED` NUNCA aparece.

---

## 🎯 OBSERVACIÓN CRÍTICA

**El componente se re-renderiza PERO los useEffects NUNCA se ejecutan.**

Esto solo es posible en React si:

1. **El componente se DESMONTA antes de que los effects corran**
   - Timing: Component mount → Render → (unmount antes de effects) → Mount again
   - Causa posible: Un padre que re-monta el componente inmediatamente

2. **Hay un setState sincrónico en el cuerpo del componente/hook**
   - Fuera de useEffect/useCallback
   - Se ejecuta en CADA render
   - Causa nuevo render antes de que effects corran

3. **Un Context/Store cambia en cada render**
   - El componente se suscribe a un store
   - El store actualiza su estado en cada render del componente
   - Causa loop bidireccional

---

## 🚨 LO QUE NO HEMOS INVESTIGADO

### 1. ¿Hay un setState en el cuerpo de `useSalesPage`?
**Búsqueda realizada:** Sí, con Grep.
**Resultado:** No encontrado ninguno fuera de useCallback/useEffect.
**Pendiente:** Revisar manualmente línea por línea el hook completo.

### 2. ¿`useCapabilities()` está causando updates?
**Evidencia:** Valores son consistentes en logs.
**Pendiente:** Agregar log DENTRO de `useCapabilityStore` para ver si se actualiza.

### 3. ¿Hay un parent component que re-monta `SalesPage`?
**Sospechosos:**
- `ProtectedRouteNew`
- `RoleGuard`
- `ResponsiveLayout`
- `LazyWithErrorBoundary` (ya removido)

**Pendiente:** Agregar logs en cada uno de estos componentes.

### 4. ¿`useModalState()` causa updates?
**Archivo:** Se llama en `page.tsx` línea 150
**Pendiente:** Ver implementación de `useModalState` en salesStore.

### 5. ¿Hay un `useEffect` sin deps que causa setState?
**Pendiente:** Buscar en `useSalesPage.ts` cualquier `useEffect(() => {` sin array de deps.

### 6. ¿`metrics` calculado con `useMemo` tiene deps inestables?
**Línea:** `useSalesPage.ts:259-340`
**Pendiente:** Verificar si deps del useMemo cambian en cada render.

---

## 📁 ARCHIVOS MODIFICADOS (Estado actual)

### Instrumentados con logs:
1. `src/pages/admin/operations/sales/hooks/useSalesPage.ts`
2. `src/pages/admin/operations/sales/page.tsx`

### Con cambios funcionales:
3. `src/lib/validation/index.ts` - Comentado export de permissions
4. `src/App.tsx` - Removido LazyWithErrorBoundary de ruta sales

### Sin modificar pero sospechosos:
5. `src/store/capabilityStore.ts` - Hook useCapabilities
6. `src/store/salesStore.ts` - Hook useModalState
7. `src/contexts/NavigationContext.tsx` - Provider
8. `src/components/auth/ProtectedRouteNew.tsx` - Auth wrapper
9. `src/components/auth/RoleGuard.tsx` - Role wrapper
10. `src/shared/layout/ResponsiveLayout.tsx` - Layout wrapper

---

## 🔧 PRÓXIMOS PASOS SUGERIDOS

### Opción A: Aislar el componente completamente
1. Comentar TODO el contenido de `useSalesPage` y devolver valores mock
2. Ver si el loop se detiene
3. Si se detiene, ir descomentando secciones una por una

### Opción B: Buscar el parent que remonta
1. Agregar logs en `ProtectedRouteNew`, `RoleGuard`, `ResponsiveLayout`
2. Ver cuál de ellos se re-renderiza causando unmount de `SalesPage`

### Opción C: Revisar stores/contexts
1. Agregar logs en `useCapabilityStore` para ver si actualiza
2. Agregar logs en `useModalState` para ver si actualiza
3. Agregar logs en `NavigationContext` para ver si actualiza

### Opción D: Comparar con módulo que funciona
1. Tomar Materials page como referencia
2. Comparar estructura de hooks línea por línea
3. Identificar qué tiene Sales que Materials no tiene

---

## 💡 TEORÍA ACTUAL (No confirmada)

**El componente SalesPage se está DESMONTANDO y RE-MONTANDO en loop**, no solo re-renderizando.

**Evidencia:**
- Los useEffects NUNCA corren (solo corren en mount)
- `loading` nunca cambia de `true` (el useEffect que lo cambiaría nunca corre)
- Logs de "COMPONENT MOUNT" aparecen constantemente

**Posible causa:**
Un componente padre (ProtectedRouteNew, RoleGuard, o ResponsiveLayout) está causando unmount/remount por:
- Actualización de su propio estado
- Dependencia en un context que cambia
- Condición que se re-evalúa constantemente

---

## ⚠️ ESTADO DE LOS ARCHIVOS

**IMPORTANTE:** Los siguientes archivos tienen modificaciones temporales que deben limpiarse:

1. `useSalesPage.ts` - Múltiples console.log agregados
2. `page.tsx` - Console.log agregados
3. `App.tsx` - Removido LazyWithErrorBoundary (puede quedar así o restaurar)
4. `validation/index.ts` - Export comentado (debe arreglarse)

---

## 📊 TIEMPO INVERTIDO

- Sesión 1 (previa): ~3 días leyendo código sin resultados
- Sesión 2 (esta): ~3 horas con instrumentación
- **Total: ~8+ horas sin resolver el bug**

---

## 🎯 RECOMENDACIÓN FINAL

**Necesitas alguien que pueda:**
1. Ver el navegador en vivo mientras debuggea
2. Usar React DevTools Profiler para ver EXACTAMENTE qué causa los re-renders
3. Poner breakpoints en Chrome DevTools en el código del componente
4. Ver el call stack de React cuando se dispara el render

**El problema es demasiado sutil para debuggear solo con logs y lectura de código.**

---

Fecha: 2025-01-29 16:05
Estado: BUG ACTIVO - Sin resolver
