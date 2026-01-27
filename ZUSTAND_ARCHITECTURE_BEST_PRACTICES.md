# Arquitectura Correcta: Zustand + TanStack Query - Guía Definitiva

**Fecha**: 17 de diciembre de 2025 (Actualizado)  
**Fuentes**: TkDodo (React Query maintainer), Zustand Official Docs, TanStack Query Docs  
**Estado**: ✅ TanStack Query IMPLEMENTADO en el proyecto

---

## 🎯 Resumen Ejecutivo

**Arquitectura actual del proyecto** (después de migración Cash Module):

### ✅ Arquitectura IMPLEMENTADA

```
┌─────────────────────────────────────────────────────┐
│                   COMPONENTES UI                    │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌───────────────┐              ┌────────────────────┐
│  CUSTOM HOOKS │              │  ZUSTAND STORE     │
│  (facade)     │              │  (UI State)        │
│               │              │                    │
│  - Business   │              │  - UI state        │
│    Logic      │              │  - Filters         │
│  - Validation │              │  - Modal open      │
│  - Transform  │              │  - Selected item   │
└───────────────┘              └────────────────────┘
        ↓
┌───────────────┐
│ TANSTACK      │  ← ✅ IMPLEMENTADO
│ QUERY         │
│               │
│ - Data fetch  │
│ - Cache       │
│ - Revalidation│
│ - Mutations   │
└───────────────┘
        ↓
┌───────────────┐
│   SUPABASE    │
│   (Database)  │
└───────────────┘
```

### 📦 Módulos Migrados

- ✅ **Cash Module** (2025-12-17) - Referencia completa de implementación
  - 16 hooks de React Query (10 queries + 6 mutations)
  - Zustand solo para UI (modals, filters, selections)
  - Query keys centralizados para cache invalidation

### 🔄 Módulos Pendientes de Migración

- ⏳ Materials Module
- ⏳ Sales Module
- ⏳ Products Module
- ⏳ Customers Module
- ⏳ Suppliers Module

---

## 📚 Principios Fundamentales (TkDodo + Zustand Docs)

### 1. Separación: Server State vs Client State

**TanStack Query Official Docs**:
> "TanStack Query is a **server-state library**, responsible for managing asynchronous operations between your server and client. Redux, MobX, Zustand, etc. are **client-state libraries** that can be used to store asynchronous data, albeit **inefficiently** when compared to a tool like TanStack Query."

**Ejemplo de separación correcta**:

```typescript
// ❌ INCORRECTO - Todo en Zustand
const globalState = {
  suppliers,    // ← SERVER STATE (viene de DB)
  products,     // ← SERVER STATE
  orders,       // ← SERVER STATE
  modalOpen,    // ← CLIENT STATE
  filters,      // ← CLIENT STATE
}

// ✅ CORRECTO - Separados
const clientState = {
  modalOpen,
  filters,
  selectedItem,
}

// Server state manejado por TanStack Query
const { data: suppliers } = useQuery({
  queryKey: ['suppliers'],
  queryFn: fetchSuppliers
})
```

### 2. Zustand Store: Solo Client State y Actions Simples

**TkDodo**: "Separate Actions from State. Actions are functions which update values in your store. These are static and never change, so they aren't technically 'state'."

**Zustand Official Pattern**:

```typescript
// ✅ CORRECTO - Store solo tiene setters simples
const useBearStore = create((set) => ({
  // State
  bears: 0,
  fish: 0,
  
  // Actions namespace (nunca cambian)
  actions: {
    increasePopulation: (by) => 
      set((state) => ({ bears: state.bears + by })),
    eatFish: () => 
      set((state) => ({ fish: state.fish - 1 })),
  }
}))

// Export atomic selectors
export const useBears = () => useBearStore(state => state.bears)
export const useFish = () => useBearStore(state => state.fish)
export const useBearActions = () => useBearStore(state => state.actions)
```

### 3. Custom Hooks: Business Logic + Integración

**TkDodo**: "I honestly haven't needed to combine multiple Zustand stores very often, because most of the state in apps is either **server or url state**. I'm far more likely to combine a Zustand store with `useQuery` or `useParams`."

**Patrón correcto**:

```typescript
// ✅ CORRECTO - Hook combina Zustand + TanStack Query
export const useFilteredTodos = () => {
  // Client state desde Zustand
  const filters = useAppliedFilters()
  
  // Server state desde TanStack Query
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => getTodos(filters),
  })
}
```

### 4. Atomic Selectors (Performance)

**TkDodo**: "Prefer atomic selectors. Selectors have to return stable results. If you return a new Array or Object, it will always be considered a change."

```typescript
// ❌ INCORRECTO - Retorna nuevo objeto cada render
const { bears, fish } = useBearStore((state) => ({
  bears: state.bears,
  fish: state.fish,
}))

// ✅ CORRECTO - Selectores atómicos
const bears = useBearStore(state => state.bears)
const fish = useBearStore(state => state.fish)
```

### 5. Only Export Custom Hooks

**TkDodo**: "This is my number one tip for working with... everything in React, really."

```typescript
// ❌ Store NO exportado directamente
const useBearStore = create(...)

// ✅ Solo exportar custom hooks
export const useBears = () => useBearStore(state => state.bears)
export const useBearActions = () => useBearStore(state => state.actions)
```

---

## 🔧 Implementación Correcta para G-Mini

### Escenario 1: Solo Zustand (Sin TanStack Query - Actual)

Si NO queremos agregar TanStack Query ahora, esta es la mejor arquitectura:

#### A. Store: Solo UI State

```typescript
// ✅ src/store/suppliersStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SuppliersState {
  // ─── UI STATE ONLY ───
  isModalOpen: boolean
  selectedSupplier: Supplier | null
  filters: {
    search: string
    isActive: boolean | null
  }
  
  // ─── ACTIONS ───
  actions: {
    openModal: () => void
    closeModal: () => void
    selectSupplier: (supplier: Supplier) => void
    setFilters: (filters: Partial<Filters>) => void
    clearSelection: () => void
  }
}

const useSuppliersStore = create<SuppliersState>()(
  devtools(
    (set) => ({
      // State
      isModalOpen: false,
      selectedSupplier: null,
      filters: {
        search: '',
        isActive: null,
      },
      
      // Actions
      actions: {
        openModal: () => set({ isModalOpen: true }),
        closeModal: () => set({ isModalOpen: false }),
        selectSupplier: (supplier) => set({ selectedSupplier: supplier }),
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),
        clearSelection: () => set({ selectedSupplier: null }),
      }
    }),
    { name: 'SuppliersStore' }
  )
)

// ✅ Export atomic selectors
export const useIsModalOpen = () => useSuppliersStore(state => state.isModalOpen)
export const useSelectedSupplier = () => useSuppliersStore(state => state.selectedSupplier)
export const useFilters = () => useSuppliersStore(state => state.filters)
export const useSuppliersActions = () => useSuppliersStore(state => state.actions)
```

#### B. Hook: Business Logic + Data Fetching

```typescript
// ✅ src/pages/admin/supply-chain/suppliers/hooks/useSuppliers.ts
import { useState, useEffect, useCallback } from 'react'
import { suppliersService } from '@/services/suppliersService'
import { useFilters } from '@/store/suppliersStore'
import { logger } from '@/lib/logging'

export function useSuppliers() {
  // ─── SERVER STATE (Hook local) ───
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // ─── CLIENT STATE (Zustand) ───
  const filters = useFilters()
  
  // ─── DATA FETCHING ───
  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await suppliersService.fetchSuppliers()
      setSuppliers(data)
      logger.info('useSuppliers', 'Suppliers fetched', { count: data.length })
    } catch (err) {
      logger.error('useSuppliers', 'Fetch failed', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  // ⚠️ ALWAYS fetch on mount (no conditional lazy load)
  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])
  
  // ─── BUSINESS LOGIC ───
  const createSupplier = useCallback(async (data: SupplierInput) => {
    const newSupplier = await suppliersService.createSupplier(data)
    setSuppliers(prev => [...prev, newSupplier])
    return newSupplier
  }, [])
  
  const updateSupplier = useCallback(async (id: string, data: SupplierInput) => {
    const updated = await suppliersService.updateSupplier(id, data)
    setSuppliers(prev => prev.map(s => s.id === id ? updated : s))
    return updated
  }, [])
  
  // ─── DERIVED STATE ───
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      if (filters.search && !s.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.isActive !== null && s.is_active !== filters.isActive) {
        return false
      }
      return true
    })
  }, [suppliers, filters])
  
  return {
    suppliers: filteredSuppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    refetch: fetchSuppliers,
  }
}
```

#### C. Componente: Solo UI

```typescript
// ✅ src/pages/admin/supply-chain/suppliers/SuppliersPage.tsx
export default function SuppliersPage() {
  // Server state desde hook
  const { suppliers, loading, createSupplier } = useSuppliers()
  
  // Client state desde Zustand
  const isModalOpen = useIsModalOpen()
  const { openModal, closeModal } = useSuppliersActions()
  
  return (
    <ContentLayout>
      <PageHeader title="Proveedores" />
      
      <Button onClick={openModal}>Nuevo Proveedor</Button>
      
      {loading ? <Spinner /> : <SuppliersTable data={suppliers} />}
      
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={createSupplier}
      />
    </ContentLayout>
  )
}
```

---

### Escenario 2: Con TanStack Query (RECOMENDADO - Futuro)

Esta es la arquitectura profesional que recomienda la industria:

#### A. Store: Solo UI State (igual que antes)

```typescript
// Sin cambios - solo modal, filters, selection
```

#### B. Hook: Business Logic + React Query

```typescript
// ✅ src/pages/admin/supply-chain/suppliers/hooks/useSuppliers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersService } from '@/services/suppliersService'
import { useFilters } from '@/store/suppliersStore'

export function useSuppliers() {
  const queryClient = useQueryClient()
  const filters = useFilters()
  
  // ✅ React Query maneja: cache, revalidation, loading, error
  const { 
    data: suppliers = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: suppliersService.fetchSuppliers,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,   // 10 min
  })
  
  // ✅ Mutation con invalidación automática
  const createMutation = useMutation({
    mutationFn: suppliersService.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })
  
  // ✅ Derived state con filtros
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // ... filter logic
    })
  }, [suppliers, filters])
  
  return {
    suppliers: filteredSuppliers,
    loading: isLoading,
    error,
    createSupplier: createMutation.mutateAsync,
  }
}
```

#### Beneficios de TanStack Query

1. **Cache automático**: No refetch innecesarios
2. **Revalidación inteligente**: `staleTime`, `gcTime`
3. **Optimistic updates**: UI instant, rollback si falla
4. **Deduplicación**: Múltiples componentes = 1 request
5. **Background refetch**: Actualiza sin bloquear UI
6. **Retry automático**: Manejo de errores robusto

---

## 🐛 Análisis de Nuestro Bug Actual

### Problema: 7 en DB, 5 en Frontend

#### Causa Raíz

```typescript
// ❌ ANTI-PATTERN: Lazy load condicional
useEffect(() => {
  const currentSuppliers = useSuppliersStore.getState().suppliers;
  if (currentSuppliers.length === 0) {  // ← AQUÍ ESTÁ EL ERROR
    fetchSuppliers();
  }
}, [fetchSuppliers]);
```

**¿Por qué falla?**

1. Usuario crea 2 suppliers desde materials modal → Store tiene 2
2. Usuario navega a suppliers page → Hook ve store con 2 items
3. Condición `length === 0` es `false` → NO hace fetch
4. Frontend muestra solo los 2 del store, NO los 7 de la DB

#### Solución Temporal (Sin React Query)

```typescript
// ✅ FIX: ALWAYS fetch on mount
useEffect(() => {
  // No conditional - siempre sincronizar con DB
  fetchSuppliers()
}, [fetchSuppliers])
```

#### Solución Definitiva (Con React Query)

```typescript
// ✅ React Query maneja todo esto automáticamente
const { data: suppliers } = useQuery({
  queryKey: ['suppliers'],
  queryFn: fetchSuppliers,
  staleTime: 5 * 60 * 1000,  // Considera data fresh por 5min
})

// ✅ Si creas supplier desde modal:
const createMutation = useMutation({
  mutationFn: createSupplier,
  onSuccess: () => {
    // Invalida cache → refetch automático
    queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  }
})
```

---

## 📋 Plan de Migración Sugerido

### Fase 1: Inmediata (Sin TanStack Query) ✅ COMPLETADA

**Objetivo**: Arreglar bug actual sin agregar dependencias

1. ✅ **Completado**: Cambiar lazy load de condicional a always-fetch en `useSuppliers.ts`
2. ✅ **Completado**: Aplicar mismo fix a `SupplierFields.tsx`
3. ✅ **Completado**: Remover debug logs de producción
4. ✅ **Validado**: Testear flujo completo:
   - useSuppliers page: Muestra 7 suppliers (correcto)
   - SupplierFields modal: Mostraba 1 menos, ahora corregido

**Archivos modificados**:
- `src/pages/admin/supply-chain/suppliers/hooks/useSuppliers.ts`
- `src/pages/admin/supply-chain/materials/.../SupplierFields/SupplierFields.tsx`

**Cambio clave**:
```typescript
// ❌ ANTES: Solo fetch si store vacío
if (currentSuppliers.length === 0) {
  fetchSuppliers();
}

// ✅ DESPUÉS: ALWAYS fetch para sincronizar con DB
// (sin verificar si store tiene data parcial)
fetchSuppliers();
```

### Fase 2: Refactor de Arquitectura (Próximas 3-4 semanas)

**Objetivo**: Eliminar produce() de 5 stores restantes y separar client/server state

**Auditoría completa**: Ver `STORES_PRODUCE_AUDIT_REPORT.md` (1,717 líneas, 33 usos de produce())

#### Semana 1: Stores Simples (5-7 horas)
1. **cashStore.ts** (113 líneas, 6 produce()) - 1-1.5h
   - Estructura más simple del proyecto
   - Solo arrays, sin complejidad
   
2. **assetsStore.ts** (290 líneas, 5 produce()) - 1.5-2h
   - Arrays + modal state
   - Estructura clara
   
3. **paymentsStore.ts** (339 líneas, 7 produce()) - 2-3h
   - Dual CRUD (methods + gateways)
   - Arrays simples

#### Semana 2: Store con Set/Map (3-4 horas)
4. **achievementsStore.ts** (359 líneas, 6 produce()) - 3-4h
   - Usa `Set<string>` y `Map<id, progress>`
   - Requiere `new Set([...old, item])` pattern
   - **Cuidado**: Persist con Set/Map

#### Semana 3-4: Store Crítico (8-12 horas)
5. **materialsStore.ts** (616 líneas, 9 produce()) - 8-12h
   - 🔴 **PRIORIDAD ALTA**: Store más complejo
   - Requiere refactor arquitectónico completo:
     - Separar client state (UI) de server state (items)
     - Mover business logic (100+ líneas) a custom hook
     - Considerar TanStack Query para caching
   
**Patrón de conversión**:
```typescript
// ❌ ANTES: produce() con mutation
set(produce((state) => {
  state.items.push(newItem);
}));

// ✅ DESPUÉS: Spread operator (nueva referencia)
set((state) => ({
  items: [...state.items, newItem]
}));
```

### Fase 3: TanStack Query ✅ COMPLETADA (17/12/2025)

**Objetivo**: Implementar caching y revalidación profesional

1. ✅ **Instalado**: `@tanstack/react-query@5.90.12` + `@tanstack/react-query-devtools@5.91.1`
2. ✅ **Setup**: QueryClient provider en App.tsx (staleTime: 5min, gcTime: 10min)
3. ✅ **Cash Module Migrado** (referencia para otros módulos):
   - 16 hooks de React Query
   - Zustand solo para UI state
   - Query keys centralizados
   - Optimistic updates implementados
   
**Ver documentación completa**: `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md`

4. **Próximos módulos a migrar**:
   - Materials (siguiente prioridad)
   - Suppliers
   - Products
   - Sales

---

## 🎓 Lecciones Aprendidas

### 1. TanStack Query es ESENCIAL, no opcional

TanStack Query resuelve problemas que son casi imposibles de resolver manualmente:
- ✅ Caching automático con invalidación inteligente
- ✅ Deduplicación de requests
- ✅ Background refetch
- ✅ Optimistic updates con rollback
- ✅ DevTools visuales

**Ejemplo real del proyecto (Cash Module)**:
```typescript
// Antes: 100+ líneas de código manual
// Después: 10 líneas con React Query
const { data } = useQuery({
  queryKey: ['cash', 'sessions', 'active', locationId],
  queryFn: () => getActiveCashSession(locationId),
  staleTime: 2 * 60 * 1000,
});
```

### 2. Zustand no es para server state

**TkDodo**: "Most of the state in apps is either server or url state."

Zustand es excelente para:
- Modal open/closed
- Filters aplicados
- Selected item
- Theme mode
- Sidebar collapsed

Zustand NO es ideal para:
- Data de DB
- Listas de entidades
- Estado asíncrono

### 3. Always-fetch no es la solución óptima

Es un workaround. La solución real es React Query con:
- `staleTime`: "Data is fresh for X minutes"
- `invalidateQueries`: "Refetch after mutation"
- Background refetch automático

### 4. Produce() sin middleware rompe reactividad

Ya documentado en `ZUSTAND_PRODUCE_BUG_FIX.md`

### 5. Dos fuentes de verdad = Bug garantizado

`useState` + Zustand para misma data = eventual inconsistency

---

## 📚 Referencias

1. **TkDodo Blog**: "Working with Zustand"
   - https://tkdodo.eu/blog/working-with-zustand
   - Autor: Maintainer de TanStack Query

2. **Zustand Official Docs**: "Practice with no store actions"
   - https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions

3. **TanStack Query Docs**: "Does this replace client state?"
   - https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state

4. **Redux Style Guide**: "Model Actions as Events, not Setters"
   - https://redux.js.org/style-guide/style-guide#model-actions-as-events-not-setters

---

## 🚀 Estado Actual del Proyecto (17/12/2025)

### ✅ Implementado

1. **TanStack Query instalado y configurado**
2. **Cash Module migrado completamente** (referencia para otros módulos)
3. **Patrón establecido**: Zustand (UI) + React Query (Server)

### 🔄 Próximos Pasos

1. **Migrar Materials Module** usando Cash como referencia
2. **Migrar Suppliers Module**
3. **Migrar Products Module**
4. **Migrar Sales Module**
5. **Auditar stores restantes** (eliminar server state de Zustand)

### 📚 Referencias de Implementación

- **Documentación**: `CASH_MODULE_TANSTACK_QUERY_MIGRATION.md`
- **Código referencia**: `src/modules/cash/hooks/`
- **Patrón**: `MASTER_REFACTORING_PROMPT.md` (v2.0)

---

**Conclusión**: Nuestra arquitectura actual funciona, pero es sub-óptima. El camino correcto es:
1. Zustand para UI state (modal, filters, selection)
2. TanStack Query para server state (suppliers, materials, etc.)
3. Custom hooks para business logic que combine ambos

Este es el patrón que usa la industria en aplicaciones enterprise.
