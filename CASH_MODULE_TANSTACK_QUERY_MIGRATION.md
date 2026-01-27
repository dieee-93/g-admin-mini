# Cash Module: TanStack Query Migration Plan

**Fecha**: 2025-12-17  
**Objetivo**: Migrar módulo Cash a arquitectura correcta con TanStack Query  
**Referencia**: `ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md`, `MASTER_REFACTORING_PROMPT.md`

---

## 📊 AUDITORÍA: Estado Actual

### ❌ Problemas Identificados

#### 1. **Server State en Zustand Store** (ANTI-PATTERN)

**Archivo**: `src/store/cashStore.ts`

```typescript
// ❌ INCORRECTO - Server state en Zustand
export interface CashState {
  moneyLocations: MoneyLocationWithAccount[];  // ← DB data
  activeSessions: CashSessionRow[];            // ← DB data
  sessionHistory: CashSessionRow[];            // ← DB data
  loading: boolean;
  error: string | null;
}
```

**Problema**: Según arquitectura, Zustand solo debe tener **UI state**, no server state.

#### 2. **Implementaciones Duplicadas**

| Archivo | Líneas | Propósito | Estado |
|---------|--------|-----------|--------|
| `src/store/cashStore.ts` | 113 | Zustand store global | ✅ Usado actualmente |
| `src/modules/cash-management/hooks/useCashSession.ts` | 271 | Hook que consume cashStore | ✅ Usado actualmente |
| `src/modules/cash/hooks/useCashSessions.ts` | 174 | Hook con useState local | ❌ DUPLICADO - Eliminar |
| `src/modules/cash/context/CashSessionContext.tsx` | 167 | Context Provider | ❌ NO USADO - Eliminar |

#### 3. **Archivos a Eliminar**

```
src/modules/cash/hooks/useCashSessions.ts
src/modules/cash/hooks/__tests__/useCashSessions.test.ts
src/modules/cash/context/CashSessionContext.tsx
src/modules/cash/context/__tests__/CashSessionContext.test.tsx
src/modules/cash/context/index.ts
src/modules/cash/context/README.md
src/modules/cash/components/examples/CashDrawerExample.tsx
```

Total: **7 archivos** creados por error

#### 4. **Consumidores Actuales de cashStore**

| Archivo | Importa | Uso |
|---------|---------|-----|
| `src/modules/cash-management/hooks/useCashSession.ts` | `useCashStore` | ✅ Hook principal (271 líneas) |
| `src/pages/admin/finance/cash/hooks/useCashData.ts` | `useCashStore` | ✅ Data slice (26 líneas) |
| `src/pages/admin/finance/cash/hooks/useCashActions.ts` | `useCashStore` | ✅ Actions slice (30 líneas) |

**Total**: 3 archivos dependen del cashStore actual

---

## 🎯 PLAN DE MIGRACIÓN

### Fase 1: Preparación (AHORA)

#### 1.1 Instalar TanStack Query

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

#### 1.2 Configurar QueryClient Provider

**Archivo**: `src/App.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min
      gcTime: 10 * 60 * 1000,         // 10 min (antes: cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App content */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 1.3 Eliminar Archivos Duplicados

```bash
# Eliminar archivos creados por error
rm src/modules/cash/hooks/useCashSessions.ts
rm src/modules/cash/hooks/__tests__/useCashSessions.test.ts
rm -rf src/modules/cash/context/
rm src/modules/cash/components/examples/CashDrawerExample.tsx
```

### Fase 2: Refactorizar cashStore (Solo UI State)

#### 2.1 Nuevo cashStore - Solo UI State

**Archivo**: `src/store/cashStore.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Cash UI State Store
 * 
 * ✅ CORRECTO - Solo UI state, NO server data
 * Server data manejado por TanStack Query
 */
export interface CashUIState {
  // ─── UI STATE ONLY ───
  selectedLocationId: string | null;
  isSessionModalOpen: boolean;
  filters: {
    dateRange: { from: Date | null; to: Date | null };
    status: 'OPEN' | 'CLOSED' | null;
  };
  
  // ─── ACTIONS ───
  actions: {
    selectLocation: (locationId: string | null) => void;
    openSessionModal: () => void;
    closeSessionModal: () => void;
    setFilters: (filters: Partial<CashUIState['filters']>) => void;
    clearFilters: () => void;
  };
}

const useCashUIStore = create<CashUIState>()(
  devtools(
    (set) => ({
      // State
      selectedLocationId: null,
      isSessionModalOpen: false,
      filters: {
        dateRange: { from: null, to: null },
        status: null,
      },
      
      // Actions
      actions: {
        selectLocation: (locationId) => set({ selectedLocationId: locationId }),
        openSessionModal: () => set({ isSessionModalOpen: true }),
        closeSessionModal: () => set({ isSessionModalOpen: false }),
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),
        clearFilters: () => set({
          filters: { dateRange: { from: null, to: null }, status: null }
        }),
      }
    }),
    { name: 'CashUIStore' }
  )
);

// ✅ Export atomic selectors
export const useSelectedLocationId = () => useCashUIStore(state => state.selectedLocationId);
export const useIsSessionModalOpen = () => useCashUIStore(state => state.isSessionModalOpen);
export const useCashFilters = () => useCashUIStore(state => state.filters);
export const useCashUIActions = () => useCashUIStore(state => state.actions);
```

### Fase 3: Crear Query Hooks (TanStack Query)

#### 3.1 useMoneyLocations (React Query)

**Archivo**: `src/modules/cash/hooks/useMoneyLocations.ts` (NUEVO)

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchMoneyLocations } from '../services';
import { logger } from '@/lib/logging';

export function useMoneyLocations() {
  return useQuery({
    queryKey: ['cash', 'money-locations'],
    queryFn: async () => {
      logger.info('CashModule', 'Fetching money locations');
      const locations = await fetchMoneyLocations();
      return locations;
    },
    staleTime: 10 * 60 * 1000,  // 10 min (locations don't change often)
  });
}
```

#### 3.2 useCashSessions (React Query)

**Archivo**: `src/modules/cash/hooks/useCashSessions.ts` (REEMPLAZAR)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import {
  getActiveCashSession,
  fetchCashSessionHistory,
  openCashSession as openSessionService,
  closeCashSession as closeSessionService,
} from '../services';
import type {
  CashSessionRow,
  OpenCashSessionInput,
  CloseCashSessionInput,
} from '../types';

// ─── QUERIES ───

export function useActiveCashSession(moneyLocationId?: string) {
  return useQuery({
    queryKey: ['cash', 'sessions', 'active', moneyLocationId],
    queryFn: async () => {
      if (!moneyLocationId) return null;
      return await getActiveCashSession(moneyLocationId);
    },
    enabled: !!moneyLocationId,
    staleTime: 2 * 60 * 1000,  // 2 min (sessions change frequently)
  });
}

export function useCashSessionHistory(moneyLocationId?: string) {
  return useQuery({
    queryKey: ['cash', 'sessions', 'history', moneyLocationId],
    queryFn: async () => {
      return await fetchCashSessionHistory({ moneyLocationId });
    },
    staleTime: 5 * 60 * 1000,  // 5 min (history less critical)
  });
}

// ─── MUTATIONS ───

export function useOpenCashSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: OpenCashSessionInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      logger.info('CashModule', 'Opening cash session', { input });
      return await openSessionService(input, user.id);
    },
    onSuccess: (session) => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['cash', 'sessions', 'active', session.money_location_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['cash', 'sessions', 'history'] 
      });

      notify.success({
        title: 'Caja abierta',
        description: `Sesión iniciada con $${session.starting_cash}`
      });

      logger.info('CashModule', 'Session opened', { sessionId: session.id });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al abrir sesión';
      notify.error({ title: 'Error al abrir caja', description: message });
      logger.error('CashModule', 'Failed to open session', { error });
    },
  });
}

export function useCloseCashSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      input 
    }: { 
      sessionId: string; 
      input: CloseCashSessionInput 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      logger.info('CashModule', 'Closing cash session', { sessionId });
      return await closeSessionService(sessionId, input, user.id);
    },
    onSuccess: (session) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: ['cash', 'sessions', 'active'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['cash', 'sessions', 'history'] 
      });

      if (session.status === 'DISCREPANCY') {
        notify.warning({
          title: 'Caja cerrada con diferencia',
          description: `Diferencia: $${Math.abs(session.variance || 0)}`
        });
      } else {
        notify.success({ title: 'Caja cerrada correctamente' });
      }

      logger.info('CashModule', 'Session closed', { 
        sessionId: session.id, 
        status: session.status 
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      notify.error({ title: 'Error al cerrar caja', description: message });
      logger.error('CashModule', 'Failed to close session', { error });
    },
  });
}
```

#### 3.3 Facade Hook (Compatibility Layer)

**Archivo**: `src/modules/cash-management/hooks/useCashSession.ts` (REFACTORIZAR)

```typescript
/**
 * useCashSession Hook
 * 
 * ✅ REFACTORED: Now uses TanStack Query + Zustand UI
 * Facade hook that combines:
 * - Server state from React Query
 * - UI state from Zustand
 */

import { useSelectedLocationId } from '@/store/cashStore';
import {
  useActiveCashSession,
  useOpenCashSession,
  useCloseCashSession,
} from '@/modules/cash/hooks/useCashSessions';

export function useCashSession() {
  // UI state from Zustand
  const selectedLocationId = useSelectedLocationId();
  
  // Server state from React Query
  const { 
    data: activeCashSession, 
    isLoading,
    error 
  } = useActiveCashSession(selectedLocationId || undefined);
  
  // Mutations
  const openMutation = useOpenCashSession();
  const closeMutation = useCloseCashSession();

  return {
    // Data
    activeCashSession,
    activeSessions: activeCashSession ? [activeCashSession] : [],
    
    // Loading states
    loading: isLoading,
    isOpening: openMutation.isPending,
    isClosing: closeMutation.isPending,
    
    // Error
    error: error?.message || null,
    
    // Actions
    openCashSession: openMutation.mutateAsync,
    closeCashSession: (sessionId: string, input: CloseCashSessionInput) =>
      closeMutation.mutateAsync({ sessionId, input }),
  };
}
```

### Fase 4: Actualizar Consumidores

#### 4.1 useCashData (Migrar a React Query)

**Archivo**: `src/pages/admin/finance/cash/hooks/useCashData.ts`

```typescript
/**
 * useCashData Hook
 * 
 * ✅ REFACTORED: Now uses React Query for server state
 */

import { useMoneyLocations } from '@/modules/cash/hooks/useMoneyLocations';
import { useCashSessionHistory } from '@/modules/cash/hooks/useCashSessions';

export function useCashData() {
  const { 
    data: moneyLocations = [], 
    isLoading: locationsLoading 
  } = useMoneyLocations();
  
  const { 
    data: sessionHistory = [], 
    isLoading: historyLoading 
  } = useCashSessionHistory();

  return {
    moneyLocations,
    sessionHistory,
    loading: locationsLoading || historyLoading,
    error: null, // React Query handles errors per-query
  };
}
```

#### 4.2 useCashActions (Mantener pero simplificar)

**Archivo**: `src/pages/admin/finance/cash/hooks/useCashActions.ts`

```typescript
/**
 * useCashActions Hook
 * 
 * ✅ REFACTORED: Now returns UI actions + mutations
 */

import { useCashUIActions } from '@/store/cashStore';
import { useOpenCashSession, useCloseCashSession } from '@/modules/cash/hooks/useCashSessions';

export function useCashActions() {
  const uiActions = useCashUIActions();
  const openMutation = useOpenCashSession();
  const closeMutation = useCloseCashSession();

  return {
    // UI actions
    ...uiActions,
    
    // Server mutations
    openSession: openMutation.mutateAsync,
    closeSession: (sessionId: string, input: CloseCashSessionInput) =>
      closeMutation.mutateAsync({ sessionId, input }),
  };
}
```

---

## 📋 CHECKLIST DE MIGRACIÓN

### ✅ Fase 1: Preparación

- [ ] Instalar `@tanstack/react-query` y devtools
- [ ] Configurar QueryClient en App.tsx
- [ ] Eliminar 7 archivos duplicados/no usados

### ✅ Fase 2: Refactorizar cashStore

- [ ] Reescribir `cashStore.ts` - solo UI state
- [ ] Exportar atomic selectors
- [ ] Verificar TypeScript (sin errores)

### ✅ Fase 3: Crear Query Hooks

- [ ] Crear `useMoneyLocations.ts` (React Query)
- [ ] Refactorizar `useCashSessions.ts` (React Query)
- [ ] Crear mutations: `useOpenCashSession`, `useCloseCashSession`
- [ ] Refactorizar facade `useCashSession.ts`

### ✅ Fase 4: Actualizar Consumidores

- [ ] Migrar `useCashData.ts`
- [ ] Migrar `useCashActions.ts`
- [ ] Actualizar componentes si necesario

### ✅ Fase 5: Testing

- [ ] Tests unitarios para query hooks
- [ ] Tests para mutations
- [ ] Tests de integración
- [ ] Verificar devtools de React Query

### ✅ Fase 6: Documentación

- [ ] Actualizar `CASH_MODULE_REFACTORING_CONTINUATION.md`
- [ ] Crear guía de uso de React Query en Cash
- [ ] Documentar patrones de query keys

---

## 🎓 LECCIONES APRENDIDAS

### ❌ Errores Cometidos

1. **No audité archivos existentes** antes de crear soluciones
2. **Creé duplicados** (`useCashSessions.ts`, `CashSessionContext.tsx`)
3. **Ignoré la arquitectura** establecida (Zustand para UI, no Context API)
4. **No seguí el MASTER_REFACTORING_PROMPT** que dice:
   > "Move server state to TanStack Query or Custom Hooks"

### ✅ Patrones Correctos

1. **Zustand**: Solo UI state (modals, filters, selections)
2. **React Query**: Todo server state (sessions, locations, history)
3. **Custom Hooks**: Facade que combina ambos
4. **Atomic Selectors**: Exportar selectores específicos, no el store

### 📚 Referencias

- `ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md` (líneas 1-630)
- `MASTER_REFACTORING_PROMPT.md` (líneas 49-64)
- TanStack Query Docs: https://tanstack.com/query/latest

---

## ✅ PROGRESO DE MIGRACIÓN

### FASE 1: Preparación ✅ COMPLETADA

- ✅ TanStack Query instalado (v5.90.12 + devtools v5.91.1)
- ✅ QueryClient configurado en `src/App.tsx`
  - staleTime: 5min, gcTime: 10min
  - retry: 3, refetchOnWindowFocus: false
  - DevTools habilitados en development
- ✅ 7 archivos duplicados eliminados correctamente

### FASE 2: Refactorizar cashStore ✅ COMPLETADA

- ✅ `src/store/cashStore.ts` refactorizado a UI-only
  - **Removido**: `moneyLocations`, `activeSessions`, `sessionHistory` (server state)
  - **Agregado**: `selectedLocationId`, `isSessionModalOpen`, `isCloseSessionModalOpen`, `filters`
- ✅ Atomic selectors exportados (best practice)
- ✅ Backward compatibility con `useCashStore` deprecated export
- ✅ Barrel export `src/store/index.ts` actualizado

### FASE 3: Crear Query Hooks ✅ COMPLETADA

**Archivos Creados:**

1. ✅ `src/modules/cash/hooks/useMoneyLocations.ts` (372 líneas)
   - Queries: `useMoneyLocations`, `useMoneyLocationsWithAccount`, `useCashDrawers`, `useMoneyLocationsByType`, `useMoneyLocationById`, `useMoneyLocationByCode`
   - Mutations: `useCreateMoneyLocation`, `useUpdateMoneyLocation`, `useDeactivateMoneyLocation`, `useUpdateMoneyLocationBalance`
   - Query keys centralizados para invalidación

2. ✅ `src/modules/cash/hooks/useCashSessions.ts` (244 líneas)
   - Queries: `useActiveCashSession`, `useCashSessionHistory`
   - Mutations: `useOpenCashSession`, `useCloseCashSession`
   - Optimistic updates + rollback on error
   - Auto-refetch cada 5min para sesión activa

3. ✅ `src/modules/cash/hooks/index.ts` actualizado
   - Exports de todos los hooks de React Query

### FASE 4: Migrar useCashSession ✅ COMPLETADA

- ✅ `src/modules/cash-management/hooks/useCashSession.ts` refactorizado
  - Facade que combina React Query (server) + Zustand (UI)
  - Auto-selección de location al abrir sesión
  - Auto-clear selection al cerrar sesión
  - Backward compatible con API anterior

### FASE 5: Actualizar Consumidores ✅ COMPLETADA

- ✅ `src/pages/admin/finance/cash/hooks/useCashData.ts` refactorizado
  - Usa `useMoneyLocationsWithAccount` + `useCashSessionHistory`
  - Removida dependencia de Zustand para server state

- ✅ `src/pages/admin/finance/cash/hooks/useCashActions.ts` refactorizado
  - Combina UI actions (Zustand) + Server mutations (React Query)
  - API limpia: sync actions + async mutations

---

## 📊 ESTADÍSTICAS DE MIGRACIÓN

**Archivos Modificados**: 7
- `src/App.tsx`
- `src/store/cashStore.ts`
- `src/store/index.ts`
- `src/modules/cash-management/hooks/useCashSession.ts`
- `src/pages/admin/finance/cash/hooks/useCashData.ts`
- `src/pages/admin/finance/cash/hooks/useCashActions.ts`
- `src/modules/cash/hooks/index.ts`

**Archivos Creados**: 2
- `src/modules/cash/hooks/useMoneyLocations.ts` (372 líneas)
- `src/modules/cash/hooks/useCashSessions.ts` (244 líneas)

**Archivos Eliminados**: 7
- Duplicados creados por error en sesión anterior

**Líneas de Código**: ~700 líneas nuevas de hooks con React Query

**Dependencias Agregadas**:
- `@tanstack/react-query@5.90.12`
- `@tanstack/react-query-devtools@5.91.1`

---

## 🎯 PRÓXIMOS PASOS (Opcional)

### Testing
- [ ] Tests unitarios para query hooks
- [ ] Tests de integración con React Query
- [ ] Verificar DevTools de React Query en navegador

### Documentación
- [ ] Guía de uso de React Query en Cash module
- [ ] Ejemplos de uso de hooks
- [ ] Patrones de query keys

### Performance Monitoring
- [ ] Verificar cache hits en DevTools
- [ ] Monitor de background refetch
- [ ] Análisis de re-renders

---

**Estado**: ✅ MIGRACIÓN COMPLETA - Listo para testing  
**Próximo paso**: Verificar en navegador y crear tests
