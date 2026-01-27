# Zustand → TanStack Query Migration Audit

**Fecha**: 24 de diciembre de 2025  
**Objetivo**: Migrar server state de Zustand stores a TanStack Query hooks  
**Arquitectura Target**: Zustand solo para UI state, TanStack Query para server state

---

## 📊 Estado Actual de Stores

### ✅ MIGRADOS (TanStack Query)

1. **Cash Module** (2025-12-17)
   - Store: `cashStore.ts` 
   - **Status**: ✅ COMPLETO - Referencia de migración
   - Hooks: `useCashTransactions.ts` (16 hooks: 10 queries + 6 mutations)
   - UI State: filters, modals, selections
   - Server State: TanStack Query

2. **Products Module** 
   - Store: ❓ (verificar si existe)
   - **Status**: ✅ MIGRADO - usa `useProducts()` de `@/modules/products`
   - Usado en: `useValidationContext.ts`

---

## ❌ PENDIENTES DE MIGRACIÓN (Server State en Zustand)

### 🔴 **CRÍTICO** - Usados en `useValidationContext` (causando loops)

#### 1. **staffStore.ts** 
- **Server State**: 
  - `staff: StaffMember[]` - Array de empleados (DB)
  - `schedules: ShiftSchedule[]` - Horarios (DB)
  - `timeEntries: TimeEntry[]` - Registros de tiempo (DB)
- **UI State**: 
  - `filters`, `selectedStaff`, `isModalOpen`, `modalMode`
- **API**: `staffApi` (ya existe en `src/services/staff/staffApi.ts`)
- **Migración**: 
  - [ ] Crear `useStaff()` hook con TanStack Query
  - [ ] Crear `useSchedules()` hook
  - [ ] Crear `useTimeEntries()` hook
  - [ ] Remover arrays de data del store
  - [ ] Mantener solo UI state
- **Estimación**: 4-6 horas

#### 2. **paymentsStore.ts**
- **Server State**: 
  - `paymentMethods: PaymentMethod[]` - Métodos de pago (DB)
  - `paymentGateways: PaymentGateway[]` - Gateways (DB)
- **UI State**: 
  - `selectedMethod`, `filters`, modals
- **Migración**:
  - [ ] Crear `usePaymentMethods()` hook
  - [ ] Crear `usePaymentGateways()` hook
  - [ ] Remover arrays de store
- **Estimación**: 2-3 horas
- **Nota**: El doc FASE_2.1 indica que ya existe `usePaymentMethods()` en finance-integrations

#### 3. **suppliersStore.ts**
- **Server State**: 
  - `suppliers: Supplier[]` - Lista de proveedores (DB)
- **UI State**: 
  - `filters`, `selectedSuppliers`, `isModalOpen`, `modalMode`, `currentSupplier`
- **API**: Probablemente en `services/suppliersService.ts`
- **Migración**:
  - [ ] Crear `useSuppliers()` hook con TanStack Query
  - [ ] Remover `suppliers` array del store
  - [ ] Mantener solo UI state
- **Estimación**: 2-3 horas

#### 4. **operationsStore.ts**
- **Server State**:
  - `tables: Table[]` - Mesas del restaurante (DB)
  - `deliveryZones: DeliveryZone[]` - Zonas de entrega (DB)
  - `operatingHours`, `pickupHours`, `deliveryHours` - Horarios (DB)
- **UI State**: 
  - Selecciones, modals
- **Migración**:
  - [ ] Crear `useTables()` hook
  - [ ] Crear `useDeliveryZones()` hook
  - [ ] Crear `useOperatingHours()` hook
  - [ ] Remover data del store
- **Estimación**: 3-4 horas

---

### 🟡 **ALTA PRIORIDAD** - Otros stores con server state

#### 5. **customersStore.ts**
- **Server State**: 
  - `customers: Customer[]` - Lista de clientes (DB)
  - `stats: CustomerStats` - Estadísticas calculadas
- **UI State**: 
  - `filters`, `selectedCustomers`, `isModalOpen`, `modalMode`
- **Migración**:
  - [ ] Crear `useCustomers()` hook
  - [ ] Crear `useCustomerStats()` hook (query separado)
  - [ ] Remover data y stats del store
- **Estimación**: 3-4 horas

#### 6. **salesStore.ts**
- **Server State**: 
  - `sales: Sale[]` - Ventas (DB)
  - `orders: Order[]` - Órdenes (DB)
- **UI State**: 
  - `filters`, `selectedSales`, modals
- **Migración**:
  - [ ] Crear `useSales()` hook
  - [ ] Crear `useOrders()` hook
  - [ ] Remover arrays del store
- **Estimación**: 4-5 horas

#### 7. **materialsStore.ts**
- **Status**: ⚠️ DEPRECATED - Ya tiene nuevo store en `@/modules/materials/store`
- **Verificar**: Si el nuevo store ya usa TanStack Query o aún tiene server state
- **Action**: 
  - [ ] Auditar `@/modules/materials/store/materialsStore.ts`
  - [ ] Si tiene server state, migrar a hooks
- **Estimación**: 2-3 horas (si necesita migración)

#### 8. **assetsStore.ts**
- **Server State**: Probablemente `assets: Asset[]`
- **UI State**: filters, modals
- **Migración**:
  - [ ] Crear `useAssets()` hook
  - [ ] Remover data del store
- **Estimación**: 2-3 horas

---

### 🟢 **BAJA PRIORIDAD** - Stores principalmente UI o config

#### 9. **appStore.ts**
- **Contenido**: Settings globales, configuración de negocio
- **Análisis**: Verificar si tiene data de DB o solo config
- **Action**: [ ] Auditar contenido
- **Estimación**: 1-2 horas

#### 10. **fiscalStore.ts**
- **Contenido**: Configuración fiscal
- **Análisis**: Verificar si tiene data de DB
- **Action**: [ ] Auditar contenido
- **Estimación**: 1-2 horas

#### 11. **capabilityStore.ts**
- **Contenido**: Perfiles de usuario, capabilities seleccionadas
- **Análisis**: Este puede ser híbrido (profile de DB + UI selections)
- **Action**: [ ] Auditar y separar server/client state
- **Estimación**: 2-3 horas

#### 12. **achievementsStore.ts**
- **Contenido**: Logros del usuario
- **Análisis**: Verificar si tiene data de DB
- **Action**: [ ] Auditar contenido
- **Estimación**: 1-2 horas

#### 13. **gamificationStore.ts**
- **Contenido**: Estado de gamificación
- **Análisis**: Verificar server vs client state
- **Action**: [ ] Auditar contenido
- **Estimación**: 1-2 horas

#### 14. **setupStore.ts**
- **Contenido**: Onboarding/setup progress
- **Análisis**: Probablemente solo UI state
- **Action**: [ ] Auditar contenido
- **Estimación**: 1 hora

#### 15. **themeStore.ts**
- **Contenido**: Tema visual
- **Análisis**: Solo UI state - ✅ OK
- **Action**: [ ] Verificar que no tenga server state
- **Estimación**: 30 minutos

---

## 📋 Plan de Migración

### Fase 1: Crítico (useValidationContext) - **15-20 horas**
**Objetivo**: Resolver loops infinitos eliminando server state de stores usados en useValidationContext

1. **staffStore** → `useStaff()` hooks
2. **paymentsStore** → `usePaymentMethods()` + `usePaymentGateways()`
3. **suppliersStore** → `useSuppliers()` hook
4. **operationsStore** → `useTables()` + `useDeliveryZones()` + `useOperatingHours()`

### Fase 2: Alta Prioridad - **12-15 horas**
**Objetivo**: Migrar stores principales de módulos de negocio

5. **customersStore** → `useCustomers()` + `useCustomerStats()`
6. **salesStore** → `useSales()` + `useOrders()`
7. **materialsStore** → Verificar/migrar nuevo store
8. **assetsStore** → `useAssets()` hook

### Fase 3: Auditoría Final - **8-12 horas**
**Objetivo**: Limpiar stores restantes y documentar arquitectura final

9-15. Auditar y migrar stores de configuración y gamificación según necesidad

---

## 🎯 Patrón de Migración

### Antes (❌ Zustand con server state)

```typescript
// ❌ INCORRECTO - Server state en Zustand
export const useStaffStore = create<StaffState>()(
  devtools((set, get) => ({
    // SERVER STATE (viene de DB) ❌
    staff: [],
    schedules: [],
    
    // UI STATE ✅
    filters: { search: '', department: 'all' },
    selectedStaff: [],
    isModalOpen: false,
    
    // Actions
    setStaff: (staff) => set({ staff }),
    fetchStaff: async () => {
      const data = await staffApi.fetchStaff()
      set({ staff: data })
    },
    
    // UI Actions ✅
    setFilters: (filters) => set({ filters }),
    selectStaff: (id) => set((s) => ({ 
      selectedStaff: [...s.selectedStaff, id] 
    })),
  }))
)
```

### Después (✅ TanStack Query + Zustand UI)

```typescript
// ✅ CORRECTO - Solo UI state en Zustand
export const useStaffStore = create<StaffUIState>()(
  devtools((set) => ({
    // UI STATE ONLY ✅
    filters: { search: '', department: 'all' },
    selectedStaff: [],
    isModalOpen: false,
    modalMode: 'add',
    
    // UI Actions ✅
    setFilters: (filters) => set({ filters }),
    resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    selectStaff: (id) => set((s) => ({ 
      selectedStaff: [...s.selectedStaff, id] 
    })),
    deselectAll: () => set({ selectedStaff: [] }),
    openModal: (mode) => set({ isModalOpen: true, modalMode: mode }),
    closeModal: () => set({ isModalOpen: false }),
  }), { name: 'StaffUIStore' })
)

// ✅ CORRECTO - Server state en TanStack Query
// src/hooks/useStaff.ts
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters?: StaffFilters) => [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
}

export function useStaff(filters?: StaffFilters) {
  return useQuery({
    queryKey: staffKeys.list(filters),
    queryFn: () => staffApi.fetchStaff(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export function useStaffById(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffApi.fetchStaffById(id),
    enabled: !!id,
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: staffApi.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
      notify.success('Staff member created')
    },
    onError: (error) => {
      notify.error('Failed to create staff member')
      logger.error('useCreateStaff', 'Mutation failed', error)
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffMember> }) =>
      staffApi.updateStaff(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: staffKeys.detail(id) })
      const previous = queryClient.getQueryData(staffKeys.detail(id))
      
      queryClient.setQueryData(staffKeys.detail(id), (old: StaffMember) => ({
        ...old,
        ...data,
      }))
      
      return { previous }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(staffKeys.detail(id), context.previous)
      }
      notify.error('Failed to update staff member')
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() })
    },
  })
}
```

---

## 🔍 Verificación Post-Migración

### Checklist por Store

- [ ] Server state removido del store
- [ ] Solo UI state permanece (filters, modals, selections)
- [ ] Hooks de TanStack Query creados con query keys factory
- [ ] Mutations implementadas con optimistic updates
- [ ] Cache invalidation configurado correctamente
- [ ] Error handling con notifications
- [ ] Logging en mutations
- [ ] staleTime y gcTime configurados (5min/10min estándar)
- [ ] TypeScript sin errores
- [ ] Tests actualizados (si existen)
- [ ] Documentación actualizada

### Métricas de Éxito

- ✅ `useValidationContext` no causa loops infinitos
- ✅ Todos los stores solo tienen UI state
- ✅ Data fetching centralizado en hooks
- ✅ Cache de TanStack Query funcional
- ✅ Optimistic updates funcionan correctamente
- ✅ Performance mejorado (menos re-renders)
- ✅ Código más mantenible y testeable

---

## 📖 Referencias

- **Cash Module**: `src/modules/cash/hooks/useCashTransactions.ts` - Implementación completa
- **Doc Arquitectura**: `ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md`
- **TanStack Query Docs**: https://tanstack.com/query/latest/docs/framework/react/overview
- **Zustand Best Practices**: https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions
- **TkDodo Blog**: https://tkdodo.eu/blog/practical-react-query

---

## 🚀 Próximos Pasos

1. **INMEDIATO**: Resolver loop infinito en `AlertsAchievementsSection`
   - Opción A: Migrar stores críticos (15-20h)
   - Opción B: Temporal fix con comparación shallow (2h) + migración después

2. **CORTO PLAZO** (1-2 semanas): Fase 1 - Stores críticos

3. **MEDIO PLAZO** (2-4 semanas): Fase 2 - Stores principales

4. **LARGO PLAZO** (1-2 meses): Fase 3 - Auditoría final y limpieza

---

**Estado del Documento**: 🟡 En progreso  
**Última Actualización**: 2025-12-24  
**Autor**: AI Assistant + Dev Team
