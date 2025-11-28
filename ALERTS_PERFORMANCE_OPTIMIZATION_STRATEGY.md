# 🚀 Estrategia de Optimización de Performance - Sistema de Alertas

## 📊 Problema Identificado

**Síntoma**: Caída de performance a 3 FPS cuando aparecen notificaciones  
**React Scan Metrics**:
- Total frame time: 310.5ms (106ms React + 204.5ms browser)
- chakra(div): 84 renders, 19ms self time
- Box: 44 renders, 13ms self time
- NavigationStateContext: 23x propagation
- AlertsStateContext: 11x re-renders

**Root Cause**: `AlertBadge` consumiendo full `AlertsStateContext` → cada alert creado/eliminado causa re-render masivo de TODOS los badges en toda la UI.

## 🔬 Investigación - React.dev Official Patterns

### Hallazgos Clave de la Documentación

1. **Context Re-render Behavior** (react.dev/reference/react/useContext):
   > "React automatically re-renders all the children that use a particular context starting from the provider that receives a different `value`. The previous and the next values are compared with the Object.is comparison."

2. **Optimization Pattern** (react.dev/reference/react/useContext#optimizing-re-renders):
   > "To help React take advantage of that fact, you may wrap the login function with useCallback and wrap the object creation into useMemo."

3. **Memoization Best Practice**:
   > "As a result of this change, even if MyApp needs to re-render, the components calling useContext(AuthContext) won't need to re-render unless currentUser has changed."

### Patrones Aplicados

```typescript
// ❌ BEFORE: New object on every render → triggers all consumers
const stateValue = { alerts, stats, config };

// ✅ AFTER: Individual memoization → only triggers when values change
const memoizedAlerts = useMemo(() => alerts, [alerts]);
const memoizedConfig = useMemo(() => config, [config]);
const stateValue = useMemo(() => ({
  alerts: memoizedAlerts,
  stats, // already memoized
  config: memoizedConfig
}), [memoizedAlerts, stats, memoizedConfig]);
```

## 🎯 Solución Implementada

### 1. Provider Optimization (AlertsProvider.tsx)

**YA IMPLEMENTADO** ✅:
- Split contexts: `AlertsStateContext` (data) + `AlertsActionsContext` (functions)
- `actionsValue` con deps vacías → **0 re-renders** cuando alertas cambian
- `stateValue` memoizado con deps individuales

**Beneficio**: Componentes que solo usan acciones (e.g., botones) nunca re-renderizan.

### 2. Hook Optimization (useAlertsBadgeOptimized.ts)

**NUEVO** 🆕:

```typescript
// Pattern: Extract primitive values, avoid object references
const unreadCount = stats.unread;
const criticalCount = stats.bySeverity.critical;
const highCount = stats.bySeverity.high;

const badgeData = useMemo(() => {
  // Calculate badge state
  return { count, color, statusText, shouldShow, hasCritical };
}, [unreadCount, criticalCount, highCount, mediumCount]); // ONLY primitives
```

**Beneficio**: Badge solo re-renderiza cuando conteos específicos cambian, no en cada alert.

### 3. Component Optimization (AlertBadge.tsx)

**APLICADO A** ✅:
- `NavAlertBadge`: Usa `useAlertsBadgeOptimized()`, pasa data como props

**PENDIENTE** ⏳:
- `SidebarAlertBadge`
- `StockAlertBadge`
- `CriticalAlertBadge`

```typescript
// Pattern: Call optimized hook, spread props (avoid internal hook call)
export const NavAlertBadge = memo(function NavAlertBadge({ onClick, openNotificationCenter }) {
  const badgeData = useAlertsBadgeOptimized(); // 🚀 Minimal re-renders
  
  return (
    <AlertBadge 
      variant="icon-only"
      {...badgeData}  // Direct props, no internal context consumption
    />
  );
});
```

## 📈 Mejoras Esperadas

### Antes (React Scan actual):
- **11x AlertsStateContext re-renders** por cada alert
- **84x chakra(div) renders** en cascada
- **106ms React render time**
- **3 FPS** durante animaciones de toast

### Después (proyección):
- **1-2x AlertsStateContext re-renders** (solo cuando stats cambian)
- **~20x chakra(div) renders** (75% reducción)
- **<50ms React render time** (53% reducción)
- **60 FPS** estable durante toasts

## 🧪 Testing Strategy

### Paso 1: Baseline (HECHO)
```powershell
# Abrir http://localhost:5173/debug/alerts
# React Scan activo
# Click "Create INFO" x5
# Resultado: 106ms, 84 renders, 11x context
```

### Paso 2: Post-Optimization (HACER AHORA)
```powershell
# Misma página, mismo test
# Expectativa: <50ms, <30 renders, 1-2x context
```

### Paso 3: Production Simulation
```powershell
# Simular alta frecuencia de alerts
# for i in 1..20 { Click "Create INFO" }
# Verificar: No frame drops, FPS estable
```

## 🔄 Trabajo Restante

### High Priority
1. ✅ **Optimizar NavAlertBadge** (COMPLETADO)
2. ⏳ **Aplicar patrón a SidebarAlertBadge**
3. ⏳ **Aplicar patrón a StockAlertBadge**
4. ⏳ **Test con React Scan - medir mejora**

### Medium Priority
5. ⏳ **Optimizar NavigationContext** (si sigue mostrando 23x propagation)
6. ⏳ **Investigar materials alerts reload** (user report: alerts vuelven al refrescar)

### Low Priority
7. ⏳ **Documenter mejoras en PERFORMANCE_OPTIMIZATION_COMPLETE.md**
8. ⏳ **Agregar performance tests automáticos**

## 📚 Referencias

1. **React.dev - useContext**: https://react.dev/reference/react/useContext
2. **React.dev - Passing Data with Context**: https://react.dev/learn/passing-data-deeply-with-context
3. **React.dev - Scaling with Reducer + Context**: https://react.dev/learn/scaling-up-with-reducer-and-context
4. **Pattern: Split Contexts**: "Create two contexts (for state and for dispatch functions)"
5. **Pattern: Memoize Values**: "wrap the object creation into useMemo"

## 🎓 Lecciones Aprendidas

### Context Performance Anti-Patterns
❌ **Nuevo objeto en cada render**:
```typescript
<Context.Provider value={{ data, actions }}>
```
Problema: `Object.is({...}, {...})` = false → re-render todos los consumidores

✅ **Memoización individual + split contexts**:
```typescript
const stateValue = useMemo(() => ({ data }), [data]);
const actionsValue = useMemo(() => ({ actions }), []); // stable
<StateContext.Provider value={stateValue}>
  <ActionsContext.Provider value={actionsValue}>
```

### useMemo Dependencies Anti-Pattern
❌ **Dependencias de objetos**:
```typescript
useMemo(() => calculate(stats.bySeverity), [stats.bySeverity])
// stats.bySeverity es nuevo objeto cada render → siempre recalcula
```

✅ **Dependencias de primitivos**:
```typescript
const critical = stats.bySeverity.critical; // extract primitive
useMemo(() => calculate(critical), [critical])
// primitive comparison → solo recalcula si número cambia
```

## 🚀 Next Action

**PROBAR AHORA**:
```powershell
# 1. Abrir navegador
Start-Process "http://localhost:5173/debug/alerts"

# 2. Activar React Scan
# 3. Click "Create INFO" 5 veces
# 4. Revisar métricas:
#    - Frame time esperado: <50ms (vs 106ms actual)
#    - Renders esperados: <30 (vs 84 actual)
#    - Context propagation: 1-2x (vs 11x actual)
```

---

**Status**: 🟡 Implementación parcial  
**Confidence**: 🟢 Alta (basada en docs oficiales React.dev)  
**Impact**: 🔴 Crítico (3 FPS → 60 FPS)
