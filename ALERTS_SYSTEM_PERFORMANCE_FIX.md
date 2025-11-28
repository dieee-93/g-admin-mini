# 🚀 ALERTS SYSTEM PERFORMANCE OPTIMIZATION
## Fix para el problema de 453 renders en Buttons

**Fecha:** 2025-11-18  
**Problema:** Después de implementar `bulkCreate`, los Buttons se renderizaban 453 veces causando lag severo (674ms total time)  
**Causa raíz:** Re-creación de objetos en contexts y componentes sin memoización  

---

## 📊 PROBLEMA INICIAL

### Síntomas
- **453 renders** en Button components (esperado: < 50)
- **453 cambios** en onClick props
- **206ms** React time (esperado: < 100ms)
- **468ms** Other time
- **674ms** Total time
- Hover en alert #3 iluminaba toda la página hasta el top bar

### Causa Raíz Identificada

#### 1. **AlertsProvider - actionsValue inestable**
```typescript
// ❌ ANTES (PROBLEMA)
const create = useDebouncedCallback(createLogic, 300);

const actionsValue = useMemo(() => ({
  create,
  bulkCreate,
  acknowledge,
  // ... resto
}), [
  create, bulkCreate, acknowledge, // ← TODAS estas deps cambiaban!
  // ...
]);
```

**Problema:** `useDebouncedCallback` creaba un nuevo `create` en cada render, lo que hacía que `actionsValue` se re-creara, propagando re-renders a **TODOS** los consumidores del `AlertsActionsContext`.

#### 2. **useAlerts hook - re-memoización innecesaria**
```typescript
// ❌ ANTES (PROBLEMA)
const actions = useMemo(() => ({
  create: actionsContext.create,
  acknowledge: actionsContext.acknowledge,
  // ...
}), [
  actionsContext.create,  // ← Cambiaba en cada render!
  actionsContext.acknowledge,
  // ...
]);
```

**Problema:** Como `actionsContext` cambiaba constantemente, este `useMemo` no servía de nada y creaba nuevos objetos `actions` en cada render.

#### 3. **MaterialsAlerts - JSX inline con Buttons**
```typescript
// ❌ ANTES (PROBLEMA)
const alertItems: AlertItem[] = useMemo(() => 
  materialsAlerts.map((alert) => ({
    status: alert.severity,
    title: alert.title,
    description: (
      <Stack>
        {alert.actions?.map((action) => (
          <Button onClick={() => onAlertAction(alert.id, action.id)}>
            {action.label}
          </Button>
        ))}
      </Stack>
    )
  })),
  [materialsAlerts, onAlertAction]
);
```

**Problema:** Cada vez que `materialsAlerts` o `onAlertAction` cambiaba, se creaban 49 × N `Button` components nuevos con nuevos `onClick` handlers. Con 49 alerts, esto significaba ~147 nuevos Buttons en cada render.

---

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. AlertsProvider - Actions Estables con Empty Deps

```typescript
// ✅ DESPUÉS (FIX)
// Remove useDebouncedCallback - debouncing should be at UI level, not provider
const create = createLogic; // createLogic ya tiene useCallback(fn, [])

const actionsValue = useMemo(() => ({
  create,
  bulkCreate,
  acknowledge,
  resolve,
  dismiss,
  update,
  getByContext,
  getBySeverity,
  getFiltered,
  getStats,
  updateConfig,
  bulkAcknowledge,
  bulkResolve,
  bulkDismiss,
  clearAll
}), []); // 🎯 EMPTY DEPS - all actions are stable with useCallback(fn, [])
```

**Beneficios:**
- `actionsValue` se crea **UNA SOLA VEZ** en mount
- `AlertsActionsContext.Provider` **NUNCA** cambia de valor
- Componentes consumiendo solo actions **NO re-renderizan** cuando alerts cambian

### 2. useAlerts Hook - Actions Directos sin Re-memoización

```typescript
// ✅ DESPUÉS (FIX)
// Since actionsValue in provider has empty deps [], actionsContext never changes
// Therefore, we don't need to memoize or list individual actions as deps
const actions = actionsContext;

const queries = useMemo(() => ({
  getByContext: actionsContext.getByContext,
  getBySeverity: actionsContext.getBySeverity,
  getFiltered: actionsContext.getFiltered,
  getActive: () => contextAlerts.filter(alert => alert.status === 'active'),
  getCritical: () => contextAlerts.filter(alert => alert.severity === 'critical')
}), [actionsContext, contextAlerts]);
```

**Beneficios:**
- Elimina la re-memoización innecesaria
- `actions` es una referencia directa y estable
- Solo `queries` se recalcula cuando `contextAlerts` cambia (esperado)

### 3. MaterialsAlerts - Componente Memoizado Separado

```typescript
// ✅ DESPUÉS (FIX)
// Extract AlertActions as a separate memoized component
const AlertActions = memo(function AlertActions({ 
  alertId, 
  actions, 
  onAlertAction, 
  onDismiss 
}: { 
  alertId: string; 
  actions?: Array<{ id: string; label: string }>; 
  onAlertAction: (alertId: string, actionId: string) => Promise<void>; 
  onDismiss: (id: string) => Promise<void>;
}) {
  const handleDismiss = useCallback(() => {
    onDismiss(alertId);
  }, [alertId, onDismiss]);

  return (
    <Stack direction="row" gap="xs" mt="sm">
      {actions?.map((action) => (
        <Button
          key={action.id}
          size="sm"
          variant="outline"
          onClick={() => onAlertAction(alertId, action.id)}
        >
          {action.label}
        </Button>
      ))}
      <Button size="sm" variant="ghost" onClick={handleDismiss}>
        Descartar
      </Button>
    </Stack>
  );
});

// Now use it in alertItems
const alertItems: AlertItem[] = useMemo(() => 
  materialsAlerts.map((alert) => ({
    status: alert.severity,
    title: alert.title,
    description: (
      <Stack direction="column" gap="xs">
        {alert.description}
        <AlertActions
          alertId={alert.id}
          actions={alert.actions}
          onAlertAction={onAlertAction}
          onDismiss={dismiss}
        />
      </Stack>
    )
  })),
  [materialsAlerts, onAlertAction, dismiss]
);
```

**Beneficios:**
- `AlertActions` es un componente memoizado que solo re-renderiza cuando sus props cambian
- React puede comparar shallow props y evitar re-renders innecesarios
- Los Buttons se crean **UNA VEZ** por alert, no en cada cambio de `alertItems`

### 4. Memoización de Componentes de UI

```typescript
// ✅ GlobalAlertsDisplay
export const GlobalAlertsDisplay = memo(function GlobalAlertsDisplay({...}) {
  // ...
});

// ✅ AlertDisplay
export const AlertDisplay = memo(function AlertDisplay({...}) {
  // ...
});

// ✅ AutoGlobalAlertsDisplay
export const AutoGlobalAlertsDisplay = memo(function AutoGlobalAlertsDisplay() {
  // ...
});
```

**Beneficios:**
- Previene re-renders cuando props no cambian
- Reduce trabajo de React diffing

### 5. Memoización de UI Primitives (Stack, Icon)

```typescript
// ✅ Stack, VStack, HStack - Memoized wrappers
export const Stack = memo(function Stack({...}) {
  return <ChakraStack {...props}>{children}</ChakraStack>;
});

export const VStack = memo(function VStack({...}) {
  return <ChakraVStack {...props}>{children}</ChakraVStack>;
});

export const HStack = memo(function HStack({...}) {
  return <ChakraHStack {...props}>{children}</ChakraHStack>;
});

// ✅ Icon - Memoized wrapper
export const Icon = memo(function Icon({...}) {
  // ... icon logic
});
```

**Problema Identificado:**
- `chakra(div)`: 121 renders con `ref:119x` y `className:119x` cambiando
- Chakra UI v3 usa `@emotion` CSS-in-JS que genera clases dinámicas
- Incluso con `memo()`, Chakra puede generar nuevas clases si hay cambios sutiles en props

**Beneficios de memo():**
- Reduce renders de Stack de ~156 → ~100 (esperado)
- Reduce renders de Icon de 92 → ~60 (esperado)
- Previene propagación de re-renders innecesarios

**Limitación:**
- No puede prevenir que Chakra genere nuevas clases CSS
- El "Other time" (layout/paint) seguirá siendo alto (~250-300ms)
- Esto es un **límite arquitectural de CSS-in-JS**

---

## 📈 RESULTADOS ESPERADOS

### Iteración 1 - Optimización de Contexts (Antes)
```
Button renders:     453x
onClick changes:    453x
React time:         206ms
Other time:         468ms
Total time:         674ms
```

### Iteración 2 - Post Context Fix (Medido)
```
Button renders:     33x   (93% mejora ✅)
chakra(div):        121x  (problema: refs/classNames)
React time:         170ms (17% mejora ⚠️)
Other time:         312ms (65% del tiempo total ⚠️)
Total time:         482ms (28% mejora - esperábamos 62%)
```

### Iteración 3 - Post UI Primitives Memoization (Esperado)
```
Button renders:     33x   (mantiene ✅)
chakra(div):        < 80x (34% mejora esperada)
Stack renders:      < 100x (36% mejora esperada)
Icon renders:       < 60x (35% mejora esperada)
React time:         < 120ms (29% mejora adicional)
Other time:         ~250ms (20% mejora - límite CSS-in-JS)
Total time:         < 370ms (23% mejora adicional, 45% total vs baseline)
```

**⚠️ LÍMITE FUNDAMENTAL:** El "Other time" (312ms → ~250ms) está limitado por Chakra UI's CSS-in-JS. 
Para mejoras adicionales, se requeriría:
- Migrar a CSS Modules o Tailwind (refactor mayor)
- Usar `styled-components` con `babel-plugin-styled-components` para stable class names
- O aceptar este overhead como costo de usar Chakra UI v3

---

## 🏗️ ARQUITECTURA DEL SISTEMA DE ALERTAS

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│ AlertsProvider (Root)                                        │
│ ┌─────────────────────┐  ┌─────────────────────────────┐   │
│ │ AlertsStateContext  │  │ AlertsActionsContext        │   │
│ │ - alerts            │  │ - create (stable, [])       │   │
│ │ - stats             │  │ - bulkCreate (stable, [])   │   │
│ │ - config            │  │ - acknowledge (stable, [])  │   │
│ │                     │  │ - resolve (stable, [])      │   │
│ │ Re-renders when:    │  │ - dismiss (stable, [])      │   │
│ │ - alerts change     │  │ - ... all with empty deps   │   │
│ │ - config change     │  │                             │   │
│ │                     │  │ 🎯 NEVER CHANGES!           │   │
│ └─────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    ↓                         ↓
         ┌──────────────────┐    ┌──────────────────┐
         │ useAlertsState() │    │ useAlertsActions()│
         │ - Re-renders     │    │ - NEVER re-renders│
         │   when alerts    │    │   (stable ref)    │
         │   change         │    │                   │
         └──────────────────┘    └──────────────────┘
                    ↓                         ↓
              ┌────────────────────────────────────┐
              │ useAlerts() Hook                   │
              │ - Combines state + actions         │
              │ - Filters alerts by context/etc    │
              │ - Returns stable actions reference │
              └────────────────────────────────────┘
                             ↓
        ┌────────────────────┴────────────────────┐
        ↓                                         ↓
┌──────────────────┐                  ┌──────────────────┐
│ GlobalAlerts     │                  │ MaterialsAlerts  │
│ Display (memo)   │                  │ (memo)           │
│                  │                  │                  │
│ Re-renders when: │                  │ Re-renders when: │
│ - alerts change  │                  │ - alerts change  │
│ - props change   │                  │ - props change   │
└──────────────────┘                  └──────────────────┘
        ↓                                         ↓
┌──────────────────┐                  ┌──────────────────┐
│ AlertDisplay     │                  │ AlertActions     │
│ (memo)           │                  │ (memo)           │
│                  │                  │                  │
│ Re-renders when: │                  │ 🎯 Only when     │
│ - alert changes  │                  │    alert.actions │
│ - handlers change│                  │    change        │
└──────────────────┘                  └──────────────────┘
```

### Principios de Optimización

1. **Split Context Pattern**
   - Separar state (cambia frecuentemente) de actions (estable)
   - Consumidores de solo actions no re-renderizan cuando state cambia

2. **Stable References con Empty Deps**
   - `useCallback(fn, [])` garantiza referencia estable
   - Usar functional updates `setState(prev => ...)` para evitar deps

3. **Memoización Estratégica**
   - `memo()` en componentes que renderizan listas
   - `useMemo()` para cálculos costosos o transformaciones de datos
   - `useCallback()` para handlers que se pasan como props

4. **Component Extraction**
   - Extraer sub-componentes con lógica compleja (ej: `AlertActions`)
   - Permite memoización granular y mejora testability

5. **Avoid Inline JSX in Maps**
   - No crear JSX inline dentro de `.map()` en `useMemo`
   - Usar componentes separados memoizados

---

### 🧪 TESTING

### Checklist de Validación - Iteración 2

- [x] TypeScript compila sin errores: `pnpm -s exec tsc --noEmit`
- [x] Dev server arranca: `pnpm dev`
- [ ] React Scan metrics (ESPERADOS):
  - [x] Button renders: 33x (✅ logrado)
  - [ ] chakra(div) renders < 80x (antes: 121x)
  - [ ] Stack renders < 100x (antes: 156x)
  - [ ] Icon renders < 60x (antes: 92x)
  - [ ] React time < 120ms (antes: 170ms)
  - [ ] Total time < 370ms (antes: 482ms)
- [ ] Hover en alerts NO ilumina página entera (ya debería estar resuelto)
- [x] Alerts se crean correctamente con bulkCreate
- [x] Actions (acknowledge, resolve, dismiss) funcionan
- [x] No regression en funcionalidad

### Comandos de Testing

```powershell
# Type check
pnpm -s exec tsc --noEmit

# Dev server
pnpm dev

# Navigate to: http://localhost:5173/admin/supply-chain/materials
# Open React Scan overlay (look for render counts)
```

---

## 📚 REFERENCIAS

### Patrones Aplicados

1. **React.dev - Separating Events from Effects**
   - https://react.dev/learn/separating-events-from-effects
   - Patrón: Stable functions con empty deps

2. **React.dev - Queueing State Updates**
   - https://react.dev/learn/queueing-a-series-of-state-updates
   - Patrón: Functional updates `setState(prev => ...)`

3. **React.dev - Passing Data Deeply with Context**
   - https://react.dev/learn/passing-data-deeply-with-context
   - Patrón: Split contexts para state vs actions

4. **React.dev - Scaling Up with Reducer and Context**
   - https://react.dev/learn/scaling-up-with-reducer-and-context
   - Patrón: Memoizar contextos con useMemo

### Best Practices React Performance

- Use `memo()` for components rendering lists
- Use `useCallback()` for functions passed as props
- Use `useMemo()` for expensive calculations
- Avoid creating objects/arrays in render (use outside or memoize)
- Split contexts when state and actions change at different rates
- Use functional updates to avoid closure issues

---

## 🔍 DEBUGGING TIPS

### Análisis de Métricas Actuales (Iteración 2)

**Métricas reportadas por React Scan:**
```
React time:     170ms (target: < 120ms)
Other time:     312ms (65% del tiempo total - CSS-in-JS overhead)
Total time:     482ms

Top offenders:
- chakra(div): 121 renders (ref:119x, className:119x)
- Stack: 156 renders
- Icon: 92 renders
- Button: 33 renders ✅ (ya optimizado)
```

**Diagnóstico:**
1. ✅ **Button renders reducidos de 453 → 33** (optimización de contexts funcionó)
2. ⚠️ **chakra(div) con 121 renders**: Chakra CSS-in-JS generando clases dinámicas
3. ⚠️ **Other time alto (312ms)**: Layout/paint causado por CSS-in-JS recalculations

**Solución aplicada (Iteración 2):**
- Memoizar Stack, VStack, HStack → reduce renders de 156 a ~100 (esperado)
- Memoizar Icon → reduce renders de 92 a ~60 (esperado)
- Esto debería mejorar React time de 170ms → ~120ms

**Límite fundamental:**
- El "Other time" (312ms) es mayormente **Chakra UI CSS-in-JS overhead**
- Emotion genera clases CSS dinámicas que causan style recalculations
- Mejora esperada: 312ms → ~250ms (20% mejora)
- Para mejor performance, se requeriría migrar a CSS estático (Tailwind/CSS Modules)

### Si los renders siguen siendo altos:

1. **Verificar que actionsValue NO tiene deps:**
   ```typescript
   // AlertsProvider.tsx línea ~590
   const actionsValue = useMemo(() => ({...}), []); // ← MUST be empty!
   ```

2. **Verificar que useAlerts no re-memoiza actions:**
   ```typescript
   // useAlerts.ts línea ~175
   const actions = actionsContext; // ← Direct reference, NO useMemo!
   ```

3. **Verificar que MaterialsAlerts usa AlertActions:**
   ```typescript
   // MaterialsAlerts.tsx
   <AlertActions alertId={...} /> // ← Debe ser componente separado
   ```

4. **Usar React DevTools Profiler:**
   - Abrir DevTools → Profiler tab
   - Record → interactuar con alerts → Stop
   - Buscar componentes con render counts altos
   - Click en component → ver "Why did this render?"

### Si hay errores de TypeScript:

```powershell
# Ver errores específicos
pnpm -s exec tsc --noEmit | Select-String "error"

# Ver archivo específico
pnpm -s exec tsc --noEmit | Select-String "AlertsProvider"
```

---

## 📝 NOTAS ADICIONALES

### Debouncing en UI vs Provider

**Decisión:** Remover `useDebouncedCallback` del provider

**Razón:** El debouncing debe hacerse en la UI cuando el usuario escribe/interactúa, NO en el provider global. El provider debe ser lo más simple y estable posible.

**Implementación futura:** Si se necesita debounce, hacerlo en el componente que llama `create()`:

```typescript
// En un componente de UI
const debouncedCreate = useDebouncedCallback(actions.create, 300);

// Usar debouncedCreate en lugar de actions.create
```

### BulkCreate Performance

`bulkCreate` sigue siendo la solución correcta para crear múltiples alerts:

```typescript
// ✅ Correcto - 1 state update
await actions.bulkCreate(alerts); // 49 alerts → 1 setState

// ❌ Incorrecto - 49 state updates
for (const alert of alerts) {
  await actions.create(alert); // 49 × setState = 49 re-renders!
}
```

El problema NO era `bulkCreate`, sino la inestabilidad de `actionsValue` que causaba re-renders en cascada.

---

**Autor:** GitHub Copilot + Claude Sonnet 4.5  
**Revisión:** Pendiente de validación con métricas reales
