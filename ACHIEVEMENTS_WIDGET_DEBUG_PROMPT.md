# ACHIEVEMENTS WIDGET INFINITE LOOP - DEBUG PROMPT

## CONTEXTO DEL PROBLEMA

El `AchievementsWidget` en `src/modules/achievements/components/AchievementsWidget.tsx` está causando un **loop infinito de renders** que crashea la aplicación con el error:

```
Error: Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
React limits the number of nested updates to prevent infinite loops.
```

**Stack trace clave:**
```
at forceStoreRerender (react-dom_client.js:4653:21)
at updateStoreInstance (react-dom_client.js:4635:41)
```

Esto indica que **un Zustand store se está actualizando infinitamente**, causando re-renders continuos del componente.

---

## ESTADO ACTUAL DEL CÓDIGO

### Componente Problemático
**Archivo:** `src/modules/achievements/components/AchievementsWidget.tsx`

**Hooks utilizados:**
```typescript
const { activeCapabilities } = useCapabilities();
const context = useValidationContext();
const registry = useMemo(() => ModuleRegistry.getInstance(), []);
```

**useEffect con debounce (agregado como intento de fix):**
```typescript
React.useEffect(() => {
  // Timeout de 100ms para debounce
  const timer = setTimeout(() => {
    const results = activeCapabilities.map((capability) => {
      const actionResults = registry.doAction('achievements.get_progress', {
        capability,
        context,
      });
      return actionResults[0] as CapabilityProgress;
    }).filter(Boolean);

    setCapabilitiesProgress(prevResults => {
      // Comparación para evitar updates innecesarios
      if (prevResults.length !== results.length) return results;
      const hasChanged = results.some((r, i) =>
        r?.capability !== prevResults[i]?.capability ||
        r?.completed !== prevResults[i]?.completed
      );
      return hasChanged ? results : prevResults;
    });
  }, 100);

  return () => clearTimeout(timer);
}, [capabilitiesKey]); // Solo depende de capabilitiesKey = activeCapabilities.join(',')
```

### Hook Sospechoso: useValidationContext
**Archivo:** `src/hooks/useValidationContext.ts`

Este hook combina datos de **5 Zustand stores diferentes**:
- `useProductsStore`
- `useStaffStore`
- `useOperationsStore`
- `useSalesStore`
- `useAppStore`

**Cambios ya aplicados (sin éxito):**
1. ✅ Los selectores ahora obtienen la referencia directa del store
2. ✅ Se usa `useMemo` para transformar solo cuando cambia `array.length`
3. ✅ El objeto de retorno está envuelto en `useMemo` con dependencias:
   - `JSON.stringify(profile)`
   - `products.length`
   - `staff.length`
   - `tables.length`
   - `salesCount`

**Código actual de useValidationContext (extracto):**
```typescript
export function useValidationContext(): ValidationContext {
  const productsRaw = useProductsStore((state) => state.products);
  const products = useMemo(
    () => productsRaw.map((p: any) => ({ id: p.id, name: p.name, ... })),
    [productsRaw.length]
  );

  // Similar para staff, tables...

  return useMemo(
    () => ({
      profile,
      products,
      staff,
      tables,
      paymentMethods,
      paymentGateways,
      deliveryZones,
      salesCount,
      loyaltyProgram,
    }),
    [
      JSON.stringify(profile),
      products.length,
      staff.length,
      tables.length,
      salesCount,
    ]
  );
}
```

### Hook: useCapabilities
**Archivo:** `src/lib/capabilities/index.ts` (aproximadamente)

Este hook obtiene capabilities del `capabilityStore` (Zustand):
```typescript
const { activeCapabilities } = useCapabilities();
// activeCapabilities es un array de BusinessCapabilityId[]
```

---

## LOGS AGREGADOS (NO SE EJECUTAN)

Se agregaron logs extensivos en `AchievementsWidget.tsx`:
```typescript
logger.debug('App', '🎯 AchievementsWidget render');
logger.debug('App', '🎯 activeCapabilities:', activeCapabilities);
logger.debug('App', '🎯 context:', context);
logger.debug('App', '🔄 AchievementsWidget useEffect triggered', { capabilitiesKey });
logger.debug('App', '📊 Fetching capabilities progress...');
// etc...
```

**PROBLEMA:** Estos logs **NUNCA aparecen en consola**, lo que indica que el componente falla **ANTES** de ejecutar la primera línea del render. El error ocurre en la fase de **montaje de hooks** (`commitHookEffectListMount`).

---

## SOLUCIÓN TEMPORAL APLICADA

El widget fue **deshabilitado** en `src/modules/achievements/manifest.tsx`:
```typescript
// ⚠️ TEMPORARILY DISABLED: AchievementsWidget causes infinite loop
// const AchievementsWidget = lazy(() => import('./components/AchievementsWidget'));
// registry.addAction('dashboard.widgets', () => <AchievementsWidget />, ...);

logger.warn('App', '⚠️ AchievementsWidget temporarily disabled due to infinite loop issue');
```

Esto permite que el dashboard cargue sin crashear.

---

## HIPÓTESIS PRINCIPALES

### Hipótesis 1: Store Reactivo en Loop
**Probabilidad: ALTA**

Uno de los 5 stores de Zustand se está actualizando a sí mismo infinitamente:
- `useProductsStore` → ¿Tiene algún middleware que cause updates?
- `useStaffStore` → ¿Tiene algún middleware que cause updates?
- `useOperationsStore` → ¿Tiene algún middleware que cause updates?
- `useSalesStore` → ¿Tiene algún middleware que cause updates?
- `useAppStore` → ¿Tiene algún middleware que cause updates?
- `useCapabilityStore` (del hook useCapabilities) → **CANDIDATO PRINCIPAL**

**Evidencia:**
- El stack trace muestra `forceStoreRerender` → es un update de Zustand
- `updateStoreInstance` → confirma que es un store

**Acción requerida:**
1. Revisar cada store en `src/store/*.ts`
2. Buscar middleware como `persist`, `immer`, `devtools`
3. Buscar `subscribe()` dentro del store que llame a `set()` (auto-subscribe)
4. Buscar computed values que dependan de sí mismos

### Hipótesis 2: Selector Inestable con Referencia que Cambia
**Probabilidad: MEDIA**

A pesar de usar `useMemo`, la referencia del array o objeto puede cambiar:

**Candidatos:**
```typescript
// En useValidationContext
const productsRaw = useProductsStore((state) => state.products);
// ¿state.products es un nuevo array en cada render?
```

**Problema potencial con `useMemo` y `.length`:**
```typescript
useMemo(() => transform(data), [data.length])
// Si los elementos del array cambian pero length es igual, NO re-calcula
// Pero si el array es nuevo en cada render de Zustand, sí causa loop
```

**Acción requerida:**
1. Verificar si los stores usan `immer` incorrectamente (retornan draft en lugar de immutable)
2. Agregar logging DENTRO del store para ver cuántas veces se actualiza
3. Usar React DevTools Profiler para ver qué hook causa el loop

### Hipótesis 3: ModuleRegistry.doAction() Causa Update
**Probabilidad: MEDIA-BAJA**

```typescript
registry.doAction('achievements.get_progress', { capability, context })
```

Si `doAction()` internamente actualiza algún store o state, podría causar un re-render que dispara el useEffect nuevamente.

**Acción requerida:**
1. Revisar `src/lib/modules/ModuleRegistry.ts` → método `doAction()`
2. Verificar si `doAction()` emite eventos o actualiza state
3. Verificar si hay algún listener en el EventBus que reaccione a `achievements.get_progress`

### Hipótesis 4: capabilityStore en Loop
**Probabilidad: ALTA**

El `capabilityStore` (usado por `useCapabilities()`) podría estar en un loop:

**Escenario posible:**
```typescript
// En capabilityStore
const useCapabilityStore = create((set, get) => ({
  activeCapabilities: [],

  // ⚠️ PELIGRO: Si esto se ejecuta en cada update
  loadCapabilities: async () => {
    const data = await fetchFromDB();
    set({ activeCapabilities: data }); // ← Causa update
    // Si hay un useEffect que llama a loadCapabilities cuando cambia activeCapabilities
    // = LOOP INFINITO
  }
}));
```

**Acción requerida:**
1. Revisar `src/store/capabilityStore.ts` completamente
2. Buscar `useEffect` o subscriptions que llamen a acciones del store
3. Buscar middleware `persist` con configuración incorrecta
4. Verificar si `reinitializeModulesForCapabilities` (visible en stack trace) causa el loop

---

## PASOS DE DEBUG RECOMENDADOS

### Paso 1: Identificar el Store Problemático
**Objetivo:** Descubrir cuál de los 5 stores causa `forceStoreRerender` infinito

**Método:**
```typescript
// Crear un componente de prueba simple
export default function StoreDebugger() {
  console.log('=== RENDER STARTED ===');

  // Probar cada store individualmente
  const products = useProductsStore((state) => state.products);
  console.log('Products length:', products.length);

  const staff = useStaffStore((state) => state.staff);
  console.log('Staff length:', staff.length);

  const operations = useOperationsStore((state) => state);
  console.log('Operations:', operations);

  const sales = useSalesStore((state) => state.sales);
  console.log('Sales length:', sales?.length);

  const appSettings = useAppStore((state) => state.settings);
  console.log('Settings:', appSettings);

  const capabilities = useCapabilityStore((state) => state.activeCapabilities);
  console.log('Capabilities:', capabilities);

  return <div>Check console - which log repeats infinitely?</div>;
}
```

**Uso:**
1. Comentar temporalmente el AchievementsWidget
2. Agregar `<StoreDebugger />` al dashboard
3. Ver consola: el store que imprime infinitamente es el culpable

### Paso 2: Auditar el Store Culpable
**Objetivo:** Encontrar el código que causa el auto-update

**Qué buscar:**
```typescript
// ❌ ANTI-PATTERN 1: Subscribe dentro del store
create((set, get) => ({
  someValue: [],
  init: () => {
    // ⚠️ Si hay un useEffect que llama a init() cuando cambia someValue
    someStore.subscribe((state) => {
      set({ someValue: state.data }); // ← LOOP
    });
  }
}));

// ❌ ANTI-PATTERN 2: Middleware persist con merge incorrecto
create(
  persist(
    (set) => ({ ... }),
    {
      name: 'store',
      merge: (persisted, current) => {
        // Si siempre retorna un objeto nuevo
        return { ...current, ...persisted }; // ← Puede causar loop
      }
    }
  )
);

// ❌ ANTI-PATTERN 3: Computed value que causa update
create((set, get) => ({
  items: [],
  get computedValue() {
    set({ items: [...get().items] }); // ⚠️ Llamar set() en un getter
    return get().items.length;
  }
}));

// ❌ ANTI-PATTERN 4: Middleware immer mal configurado
create(
  immer((set) => ({
    data: [],
    updateData: () => set((draft) => {
      draft.data = [...draft.data]; // ← Siempre crea nuevo array
    })
  }))
);
```

**Archivos a revisar:**
- `src/store/capabilityStore.ts` ⭐ **PRIORIDAD 1**
- `src/store/productsStore.ts`
- `src/store/staffStore.ts`
- `src/store/operationsStore.ts`
- `src/store/salesStore.ts`
- `src/store/appStore.ts`

### Paso 3: Revisar capabilityStore.reinitializeModulesForCapabilities
**Objetivo:** Este método aparece en el stack trace original

**Stack trace relevante:**
```
at reinitializeModulesForCapabilities (integration.ts:148)
at (anonymous) (integration.ts:301)
at setState (zustand.js:17)
at initializeProfile (capabilityStore.ts:162)
at loadFromDB (capabilityStore.ts:580)
```

**Acción:**
1. Ir a `src/lib/modules/integration.ts:148`
2. Revisar `reinitializeModulesForCapabilities()`
3. Ver si llama a `setState` de algún store
4. Ver si causa que `capabilityStore` se actualice
5. Ver si hay un ciclo: `loadFromDB` → `initializeProfile` → `reinitializeModulesForCapabilities` → `setState` → `loadFromDB`

### Paso 4: Usar React DevTools Profiler
**Objetivo:** Ver exactamente qué componente y hook causa los re-renders

**Pasos:**
1. Abrir Chrome DevTools → React Profiler
2. Habilitar temporalmente `AchievementsWidget`
3. Click "Record"
4. Esperar al crash (será rápido)
5. Detener recording
6. Ver el flamegraph: mostrará qué hook se ejecuta infinitamente
7. Ver "Ranked" tab: componente con más renders está arriba

### Paso 5: Agregar Logging Defensivo en Stores
**Objetivo:** Ver cuántas veces se ejecuta `set()` en cada store

**Método:**
```typescript
// En cada store, wrappear set()
const useMyStore = create((originalSet, get) => {
  let updateCount = 0;

  const set = (partial: any, replace?: boolean) => {
    updateCount++;
    console.log(`[MyStore] Update #${updateCount}`, partial);

    if (updateCount > 50) {
      console.error('[MyStore] INFINITE LOOP DETECTED!', new Error().stack);
      return; // Prevenir más updates
    }

    return originalSet(partial, replace);
  };

  return {
    // ... resto del store usando set wrapeado
  };
});
```

### Paso 6: Simplificar useValidationContext
**Objetivo:** Eliminar variables para aislar el problema

**Test incremental:**
```typescript
// Versión 1: Solo 1 store
export function useValidationContext(): ValidationContext {
  const products = useProductsStore((state) => state.products);
  return useMemo(() => ({ products }), [products.length]);
}
// ¿Funciona? → El problema NO es productsStore

// Versión 2: Agregar otro store
export function useValidationContext(): ValidationContext {
  const products = useProductsStore((state) => state.products);
  const staff = useStaffStore((state) => state.staff);
  return useMemo(() => ({ products, staff }), [products.length, staff.length]);
}
// ¿Crashea? → El problema ES staffStore

// ... continuar agregando stores hasta encontrar el culpable
```

---

## ARCHIVOS CLAVE PARA INVESTIGAR

### Prioridad ALTA ⭐⭐⭐
1. `src/store/capabilityStore.ts` - Store que controla capabilities activas
2. `src/lib/modules/integration.ts` - Aparece en stack trace, línea 148 y 301
3. `src/hooks/useValidationContext.ts` - Combina 5 stores, punto de fallo
4. `src/lib/capabilities/index.ts` - Hook useCapabilities()

### Prioridad MEDIA ⭐⭐
5. `src/modules/achievements/components/AchievementsWidget.tsx` - Componente que crashea
6. `src/lib/modules/ModuleRegistry.ts` - doAction() puede causar side-effects
7. `src/store/productsStore.ts` - Uno de los 5 stores
8. `src/store/staffStore.ts` - Uno de los 5 stores
9. `src/store/operationsStore.ts` - Uno de los 5 stores
10. `src/store/salesStore.ts` - Uno de los 5 stores
11. `src/store/appStore.ts` - Uno de los 5 stores

### Prioridad BAJA ⭐
12. `src/lib/events/EventBus.ts` - Verificar si doAction emite eventos
13. `src/modules/achievements/manifest.tsx` - Verificar setup/teardown

---

## PREGUNTAS DIAGNÓSTICAS

### Para capabilityStore
1. ¿Tiene middleware `persist`? ¿Cómo está configurado?
2. ¿Hay algún `subscribe()` dentro del store que llame a `set()`?
3. ¿`reinitializeModulesForCapabilities()` actualiza el store?
4. ¿`loadFromDB()` se llama en cada update?
5. ¿Hay un `useEffect` externo que reaccione a `activeCapabilities` y llame a una acción del store?

### Para useValidationContext
1. ¿Los stores retornan referencias estables o nuevos objetos en cada get?
2. ¿`JSON.stringify(profile)` es costoso? ¿Podría causar problemas de performance?
3. ¿`useMemo` con `array.length` es suficiente o necesita comparación profunda?

### Para ModuleRegistry.doAction()
1. ¿`doAction()` actualiza algún state interno?
2. ¿Emite eventos al EventBus?
3. ¿Hay módulos suscritos a `achievements.get_progress` que causen updates?

---

## SOLUCIONES POTENCIALES

### Solución 1: Deshabilitar Persist Temporalmente
Si `capabilityStore` usa `persist`:
```typescript
// Comentar persist temporalmente
const useCapabilityStore = create(
  // persist(
    (set, get) => ({ ... })
  // )
);
```

### Solución 2: Usar Shallow Equality en Selectores
```typescript
import { shallow } from 'zustand/shallow';

const activeCapabilities = useCapabilityStore(
  (state) => state.activeCapabilities,
  shallow // ← Comparación superficial en lugar de referencial
);
```

### Solución 3: Estabilizar Referencia del Context
```typescript
// En lugar de useMemo con JSON.stringify
const contextRef = useRef<ValidationContext | null>(null);

if (!contextRef.current || hasChanged(contextRef.current, newContext)) {
  contextRef.current = newContext;
}

return contextRef.current;
```

### Solución 4: Aislar el Widget del ValidationContext
```typescript
// No usar useValidationContext en el render inicial
// Cargarlo solo cuando se necesite

const [context, setContext] = useState<ValidationContext | null>(null);

useEffect(() => {
  // Cargar async
  const ctx = getValidationContext();
  setContext(ctx);
}, []);

if (!context) return <Skeleton />;
```

### Solución 5: Refactorizar a Lazy Context
```typescript
// En lugar de calcular todo el context en cada render
// Usar getters perezosos

const context = {
  get products() { return useProductsStore.getState().products; },
  get staff() { return useStaffStore.getState().staff; },
  // Solo se calcula cuando se accede
};
```

---

## CRITERIOS DE ÉXITO

✅ **El AchievementsWidget se renderiza sin crashear**
✅ **No hay logs de "Maximum update depth exceeded"**
✅ **El componente muestra el progreso de capabilities correctamente**
✅ **No hay warnings de performance en React DevTools**
✅ **Los tests del componente pasan**

---

## NOTAS ADICIONALES

### Contexto del Proyecto
- **Framework:** React 19.1 + TypeScript 5.8.3
- **State Management:** Zustand v5.0.7 con Immer
- **Arquitectura:** Module Registry (WordPress-inspired hooks)
- **Store pattern:** Zustand slices con middleware persist

### Cambios Recientes que Podrían Relacionarse
1. ✅ Database migration: `async_operations` → `online_store`
2. ✅ Database migration: `requires_preparation` → `production_workflow`
3. ✅ `active_capabilities` sincronizado con `selected_activities` en DB
4. ✅ Agregado método `subscribe()` a EventBus como alias de `on()`

### Logs Disponibles
- G-Admin Logger en `src/lib/logging/Logger.ts`
- Uso: `logger.debug('App', 'mensaje', data)`
- Los logs con emojis (🎯 🔄 📊) están en el widget pero no se ejecutan

### Testing
Archivo de tests sugerido: `src/modules/achievements/components/__tests__/AchievementsWidget.test.tsx`

```typescript
describe('AchievementsWidget', () => {
  it('should not cause infinite loop', () => {
    const { rerender } = render(<AchievementsWidget />);

    // Forzar re-renders
    for (let i = 0; i < 10; i++) {
      rerender(<AchievementsWidget />);
    }

    // Si llegamos aquí sin timeout, no hay loop
    expect(true).toBe(true);
  });
});
```

---

## DOCUMENTACIÓN RELACIONADA

- `docs/05-development/STATE_MANAGEMENT_GUIDE.md` - Guía de Zustand
- `src/modules/README.md` - Module Registry system
- `src/modules/ARCHITECTURE.md` - Arquitectura de módulos
- `src/hooks/useValidationContext.ts` - Hook documentation inline
- `CLAUDE.md` - Instrucciones generales del proyecto

---

**ÚLTIMA ACTUALIZACIÓN:** 2025-01-26
**ESTADO:** Widget deshabilitado temporalmente, pendiente de debug profundo
**PRÓXIMO PASO:** Ejecutar Paso 1 (StoreDebugger) para identificar store culpable
