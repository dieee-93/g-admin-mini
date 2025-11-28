# React Anti-Patterns Audit Report 🔍

**Fecha**: Noviembre 17, 2025  
**Basado en**: React.dev Official Documentation (2024-2025)  
**Fuente**: https://react.dev/reference/react/useMemo, https://react.dev/reference/react/useCallback

---

## 📋 Executive Summary

Auditoría completa del codebase para identificar anti-patterns de React que causan renders innecesarios y degradación de performance. Se encontraron **3 categorías principales** de problemas.

---

## 🔴 Anti-Pattern #1: Inline Arrow Functions en Props de Componentes Memoizados

### Descripción del Problema

Pasar inline arrow functions (`onClick={() => ...}`) a componentes wrapeados con `memo()` **rompe completamente la memoización**. Cada render del padre crea una nueva función, causando que `memo()` detecte cambio de props y re-renderice el hijo innecesariamente.

### Impacto en Performance

- ✅ **RESUELTO**: `MaterialsMetrics` (4 MetricCards)
- ✅ **RESUELTO**: `SalesMetrics` (8 MetricCards)
- ✅ **RESUELTO**: `SuppliersMetrics` (5 MetricCards)
- ✅ **RESUELTO**: `SupplierOrdersMetrics` (7 MetricCards)
- 🔴 **PENDIENTE**: Otros módulos similares

**Ejemplo del problema**:

```tsx
// ❌ ANTI-PATTERN: Inline functions rompen memo()
export function SalesMetrics({ metrics, onMetricClick }) {
  return (
    <StatsSection>
      <CardGrid>
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          onClick={() => onMetricClick('revenue', metrics.revenue)} // Nueva función cada render!
        />
        <MetricCard
          title="Orders"
          value={metrics.orders}
          onClick={() => onMetricClick('orders', metrics.orders)} // Nueva función cada render!
        />
        {/* ...más métricas */}
      </CardGrid>
    </StatsSection>
  );
}
```

**Impacto**: Si `SalesMetrics` tiene 8 MetricCards, cada cambio de state del padre causa:
- 8 nuevas funciones inline creadas
- 8 re-renders de MetricCard (aunque los datos no cambien)
- Cascada de re-renders en hijos (Icon, Typography, Badge, etc.)
- **Resultado**: 50-100+ componentes re-renderizando innecesariamente

### ✅ Solución Correcta (React.dev Pattern)

```tsx
// ✅ CORRECTO: useCallback memoizado
import { useCallback, memo } from 'react';

export const SalesMetrics = memo(function SalesMetrics({ metrics, onMetricClick }) {
  // Crear callbacks memoizados para cada métrica
  const handleRevenueClick = useCallback(() => 
    onMetricClick('revenue', metrics.revenue), 
    [onMetricClick, metrics.revenue]
  );
  
  const handleOrdersClick = useCallback(() => 
    onMetricClick('orders', metrics.orders), 
    [onMetricClick, metrics.orders]
  );

  return (
    <StatsSection>
      <CardGrid>
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          onClick={handleRevenueClick} // Referencia estable
        />
        <MetricCard
          title="Orders"
          value={metrics.orders}
          onClick={handleOrdersClick} // Referencia estable
        />
      </CardGrid>
    </StatsSection>
  );
});
```

**Por qué funciona**:
1. `useCallback` garantiza referencia estable de función entre renders
2. Solo re-crea callback si dependencias (`onMetricClick`, `metrics.revenue`) cambian
3. `memo()` compara props y evita re-render si callbacks son iguales
4. **Resultado**: Solo re-render cuando datos realmente cambien

---

## 🔴 Anti-Pattern #2: Componentes sin Memoización con Props Complejas

### Archivos Afectados

1. **`src/pages/admin/operations/sales/components/SalesMetrics.tsx`**
   - ❌ No usa `memo()`
   - ❌ Inline functions en onClick
   - ❌ 8 MetricCards re-renderizan en cada cambio de parent state

2. **`src/pages/admin/supply-chain/suppliers/components/SuppliersMetrics.tsx`**
   - ❌ No usa `memo()`
   - ❌ Inline functions: `onClick={() => onMetricClick?.('total_suppliers')}`
   - ❌ 6+ MetricCards afectados

3. **`src/pages/admin/supply-chain/materials/procurement/components/SupplierOrdersMetrics.tsx`**
   - ❌ No usa `memo()`
   - ❌ Inline functions en todos los MetricCards
   - ❌ 6+ MetricCards afectados

### Criterios para Memoización (React.dev)

**✅ USAR memo() cuando**:
- Componente recibe props que cambian infrecuentemente
- Componente es "pesado" (tiene hijos complejos o lógica costosa)
- Componente se renderiza muchas veces en lista o grid

**❌ NO USAR memo() cuando**:
- Componente SIEMPRE recibe props diferentes
- Componente es trivial (single div, text)
- Ya usas React Compiler (auto-memoiza)

**Análisis de SalesMetrics**:
- ✅ Props cambian infrecuentemente (`metrics` solo actualiza cada X segundos)
- ✅ Tiene 8 MetricCards hijos (cada uno con Icon, Typography, Badge)
- ✅ Se re-renderiza con cada state change del parent
- **Conclusión**: ✅ DEBE usar `memo()`

---

## 🟡 Anti-Pattern #3: Objetos y Arrays Creados Inline en Props

### Ejemplos Encontrados

```tsx
// ❌ ANTI-PATTERN: Objeto creado inline
<MetricCard
  trend={{
    value: metrics.valueGrowth,
    isPositive: metrics.valueGrowth > 0
  }}  // Nuevo objeto en cada render!
/>

// ❌ ANTI-PATTERN: Array creado inline
<Component items={data.filter(x => x.active)} /> // Nuevo array cada render!
```

### Impacto

Aunque `MetricCard` esté memoizado con `memo()`, la comparación de props **fallará** porque `{ value: 5, isPositive: true }` !== `{ value: 5, isPositive: true }` (referencias diferentes).

### ✅ Solución

```tsx
// ✅ CORRECTO: Memoizar objeto con useMemo
const trendData = useMemo(() => ({
  value: metrics.valueGrowth,
  isPositive: metrics.valueGrowth > 0
}), [metrics.valueGrowth]);

<MetricCard trend={trendData} />

// ✅ CORRECTO: Memoizar array filtrado
const activeItems = useMemo(() => 
  data.filter(x => x.active),
  [data]
);

<Component items={activeItems} />
```

**Cuándo memoizar objetos/arrays (React.dev)**:
- ✅ Si se pasan a componentes con `memo()`
- ✅ Si se usan como dependencias de `useEffect`
- ✅ Si causan re-renders costosos downstream
- ❌ Si son primitivos simples (strings, numbers, booleans)

---

## 📊 Priorización de Fixes

### 🔥 Prioridad ALTA (Performance Impact Severo)

#### 1. ✅ SalesMetrics Component - COMPLETADO
- **Archivo**: `src/pages/admin/operations/sales/components/SalesMetrics.tsx`
- **Problema**: 8 MetricCards con inline functions, sin memo
- **Solución**: Aplicado memo() + 8 useCallback handlers
- **Resultado**: Compilación OK, ESLint OK

#### 2. ✅ SuppliersMetrics Component - COMPLETADO
- **Archivo**: `src/pages/admin/supply-chain/suppliers/components/SuppliersMetrics.tsx`
- **Problema**: 5 MetricCards con inline functions, sin memo
- **Solución**: Aplicado memo() + 5 useCallback handlers
- **Resultado**: Compilación OK, ESLint OK

#### 3. ✅ SupplierOrdersMetrics Component - COMPLETADO
- **Archivo**: `src/pages/admin/supply-chain/materials/procurement/components/SupplierOrdersMetrics.tsx`
- **Problema**: 7 MetricCards con inline functions
- **Solución**: Aplicado memo() + 7 useCallback handlers
- **Resultado**: Compilación OK, ESLint OK

### 🟡 Prioridad MEDIA

#### 4. SchedulingMetrics Component
- **Archivo**: `src/pages/admin/resources/scheduling/components/SchedulingMetrics/SchedulingMetrics.tsx`
- **Problema**: Inline functions, métricas dinámicas
- **Estimado**: 15 minutos

#### 5. ProductListVirtualized - ProductCard
- **Archivo**: `src/pages/admin/supply-chain/products/components/ProductList/ProductListVirtualized.tsx`
- **Problema**: `ProductCard` memoizado pero recibe inline functions
- **Nota**: YA tiene `memo()`, solo necesita fix de callbacks
- **Estimado**: 10 minutos

### 🟢 Prioridad BAJA (Optimizaciones Nice-to-Have)

#### 6. Forms y Modals
- **Archivos**: `*FormModal.tsx`, `*Drawer.tsx`
- **Problema**: Inline event handlers
- **Impacto**: Menor (componentes no se renderizan frecuentemente)
- **Recomendación**: Fix solo si se identifica bottleneck

#### 7. Debug/Setup Pages
- **Archivos**: `src/pages/debug/**`, `src/pages/setup/**`
- **Problema**: Inline functions en dev-only pages
- **Impacto**: Mínimo (no son production-critical)
- **Recomendación**: Ignorar

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Quick Wins - ✅ COMPLETADO (100%)
1. ✅ **MaterialsMetrics** - useCallback para onClick handlers (4 handlers)
2. ✅ **SalesMetrics** - memo() + 8 useCallback handlers
3. ✅ **SuppliersMetrics** - memo() + 5 useCallback handlers
4. ✅ **SupplierOrdersMetrics** - memo() + 7 useCallback handlers

**Resumen**: 4 componentes optimizados, 24 handlers estabilizados, 0 errores TypeScript/ESLint

### Fase 2: Component Memoization (2-3 horas)
3. Auditar componentes que deberían usar `memo()`:
   - Components renderizados en listas/grids
   - Components con props estables
   - Components "pesados" (muchos hijos)

4. Aplicar `memo()` con criterio React.dev:
   ```tsx
   // Solo si el componente realmente se beneficia
   export const MyComponent = memo(function MyComponent({ data }) {
     // ...
   });
   ```

### Fase 3: Advanced Optimizations (según necesidad)
5. Memoizar objetos/arrays inline con `useMemo`
6. Audit `useEffect` dependencies (evitar object deps no memoizados)
7. Considerar `React.lazy()` para code splitting si bundle es grande

---

## 📚 Patrones de Referencia

### Pattern 1: Metrics Component con useCallback

```tsx
// ✅ PATRÓN GOLD STANDARD
import { memo, useCallback } from 'react';

export const MyMetrics = memo(function MyMetrics({ metrics, onMetricClick, loading }) {
  // Crear un useCallback por cada tipo de métrica
  const handleRevenueClick = useCallback(() => 
    onMetricClick('revenue', metrics.revenue), 
    [onMetricClick, metrics.revenue]
  );
  
  const handleOrdersClick = useCallback(() => 
    onMetricClick('orders', metrics.orders), 
    [onMetricClick, metrics.orders]
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <StatsSection>
      <CardGrid>
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          onClick={handleRevenueClick}
        />
        <MetricCard
          title="Orders"
          value={metrics.orders}
          onClick={handleOrdersClick}
        />
      </CardGrid>
    </StatsSection>
  );
}, (prevProps, nextProps) => {
  // Custom comparison si necesario
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.onMetricClick === nextProps.onMetricClick &&
    prevProps.metrics.revenue === nextProps.metrics.revenue &&
    prevProps.metrics.orders === nextProps.metrics.orders
  );
});
```

### Pattern 2: List Item con memo

```tsx
// ✅ PATRÓN para list items
const ListItem = memo(function ListItem({ item, onEdit, onDelete }) {
  // NO usar inline functions aquí si ListItem está en un .map()
  const handleEdit = useCallback(() => onEdit(item.id), [onEdit, item.id]);
  const handleDelete = useCallback(() => onDelete(item.id), [onDelete, item.id]);

  return (
    <Card>
      <Text>{item.name}</Text>
      <Button onClick={handleEdit}>Edit</Button>
      <Button onClick={handleDelete}>Delete</Button>
    </Card>
  );
});

// Parent component
function ItemsList({ items, onEdit, onDelete }) {
  return (
    <Stack>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
```

### Pattern 3: useMemo para objetos complejos

```tsx
// ✅ PATRÓN para props complejas
function ParentComponent({ data }) {
  // Memoizar objeto config
  const cardConfig = useMemo(() => ({
    theme: 'dark',
    showBadge: data.premium,
    actions: ['edit', 'delete']
  }), [data.premium]); // Solo re-crear si premium cambia

  // Memoizar array filtrado
  const activeItems = useMemo(() => 
    data.items.filter(x => x.active),
    [data.items]
  );

  return (
    <Card config={cardConfig}>
      <ItemsList items={activeItems} />
    </Card>
  );
}
```

---

## 🔗 Referencias

- **React.dev - useMemo**: https://react.dev/reference/react/useMemo
- **React.dev - useCallback**: https://react.dev/reference/react/useCallback
- **React.dev - memo**: https://react.dev/reference/react/memo
- **When to useMemo and useCallback**: https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere

---

## ✅ Estado Actual

- ✅ **MaterialsMetrics**: Fixed con useCallback pattern (comentarios in-code agregados)
- ✅ **MaterialsPage actions object**: Fixed con useMemo pattern (comentarios in-code agregados)
- ⏳ **SalesMetrics**: Pendiente (TODO comments agregados)
- ⏳ **SuppliersMetrics**: Pendiente (TODO comments agregados)
- ⏳ **SupplierOrdersMetrics**: Pendiente (TODO comments agregados)
- ⏳ **SchedulingMetrics**: Pendiente

### 📍 Ubicación de Comentarios In-Code

**Patrones aplicados** (con comentarios explicativos):
- `src/pages/admin/supply-chain/materials/components/MaterialsMetrics/MaterialsMetrics.tsx` - useCallback pattern
- `src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts` - useMemo pattern para objects

**Pendientes de refactor** (con TODO comments):
- `src/pages/admin/operations/sales/components/SalesMetrics.tsx`
- `src/pages/admin/supply-chain/suppliers/components/SuppliersMetrics.tsx`
- `src/pages/admin/supply-chain/materials/procurement/components/SupplierOrdersMetrics.tsx`

**Total estimado para Phase 1**: ~1-2 horas  
**ROI esperado**: 60-80% reducción de unnecessary re-renders en módulos afectados
