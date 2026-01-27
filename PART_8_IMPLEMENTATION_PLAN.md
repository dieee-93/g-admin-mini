# Part 8: Implementation Plan - Reutilizing Existing Code

## 🎯 Strategy: REUTILIZAR, NO DUPLICAR

After auditing the codebase, **MUCH of the logic already exists**. Our strategy is:

1. ✅ **REUSE existing services** - Don't rewrite what works
2. ✅ **CREATE thin wrapper hooks** - TanStack Query hooks that call existing services
3. ✅ **REFACTOR minimal code** - Only update where necessary
4. ✅ **MAINTAIN backward compatibility** - During transition

---

## 📦 Existing Services Audit

### ✅ **ALREADY EXISTS - REUSE AS IS**

| Service | Location | What it Does | Action |
|---------|----------|--------------|--------|
| **materialsApi** | `services/materialsApi.ts` | CRUD (fetchItems, getItem, createItem, updateItem, deleteItem) | ✅ **REUSE** in TanStack hooks |
| **inventoryApi** | `services/inventoryApi.ts` | getItems, createMaterial, updateStock, createItem, updateItem, deleteItem | ✅ **REUSE** in TanStack hooks |
| **BulkOperationsService** | `services/bulkOperationsService.ts` | adjustStock, changeCategory, bulkDelete | ✅ **REUSE** in useBulkOperations |
| **ABCAnalysisEngine** | `services/abcAnalysisEngine.ts` | ABC analysis calculation | ✅ **REUSE** in useABCAnalysis |
| **MaterialsNormalizer** | `services/materialsNormalizer.ts` | DB ↔ App data normalization | ✅ **REUSE** in all hooks |
| **MaterialsDataNormalizer** | `services/materialsDataNormalizer.ts` | Alternative normalizer | ✅ **REUSE** where needed |
| **StockCalculation** | `modules/materials/services/stockCalculation.ts` | Stock status calculations | ✅ **REUSE** in stockService |
| **CacheService** | `services/cacheService.ts` | Manual caching (deprecated by TanStack) | ⚠️ **IGNORE** (TanStack handles caching) |
| **TrendsService** | `services/trendsService.ts` | Stock trends analysis | ✅ **REUSE** in analytics hooks |
| **SmartAlertsAdapter** | `services/smartAlertsAdapter.ts` | Alerts integration | ✅ **REUSE** in alertsIntegrationService |

---

## 🔄 Implementation Strategy

### **Phase 1: Create TanStack Query Hooks (Thin Wrappers)**

Instead of creating new services, **wrap existing services** with TanStack Query hooks.

#### **Example: useMaterials Hook**

```typescript
// ✅ CORRECT - Reuses existing materialsApi.fetchItems()
import { useQuery } from '@tanstack/react-query';
import { materialsApi } from '@/modules/materials/services';
import { useMaterialsStore } from '@/modules/materials/store';
import { materialsKeys } from './queryKeys';

export function useMaterials() {
  // Get filters from Zustand store
  const filters = useMaterialsStore((state) => state.filters);
  
  return useQuery({
    queryKey: materialsKeys.list(filters),
    queryFn: async () => {
      // ✅ REUSE existing materialsApi.fetchItems()
      const allItems = await materialsApi.fetchItems();
      
      // Apply client-side filters (could be moved to server later)
      let filtered = allItems;
      
      if (filters.searchTerm) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }
      
      if (filters.category) {
        filtered = filtered.filter(item => item.category === filters.category);
      }
      
      if (filters.lowStockOnly) {
        filtered = filtered.filter(item =>
          item.stock <= (item.min_stock || 0)
        );
      }
      
      if (filters.activeOnly) {
        // Assuming items have is_active field
        filtered = filtered.filter(item => item.is_active !== false);
      }
      
      return filtered;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**❌ WRONG** - Creating duplicate service:
```typescript
// ❌ DON'T DO THIS - Duplicates existing materialsApi.fetchItems()
export const materialsService = {
  async getAll() {
    const { data, error } = await supabase.from('materials').select('*');
    // ... duplicate logic
  }
};
```

---

### **Phase 2: Map Existing Services to New Hooks**

| New Hook | Reuses Existing Service | Notes |
|----------|------------------------|-------|
| `useMaterials()` | `materialsApi.fetchItems()` | Add client-side filtering |
| `useMaterial(id)` | `materialsApi.getItem(id)` | Direct wrapper |
| `useCreateMaterial()` | `inventoryApi.createMaterial()` OR `materialsApi.createItem()` | Use inventoryApi (has auth + events) |
| `useUpdateMaterial()` | `inventoryApi.updateItem()` | Direct wrapper |
| `useDeleteMaterial()` | `inventoryApi.deleteItem()` | Direct wrapper |
| `useAdjustStock()` | `inventoryApi.updateStock()` | Already emits events |
| `useBulkDelete()` | `BulkOperationsService.bulkDelete()` | Direct wrapper |
| `useBulkAdjustStock()` | `BulkOperationsService.adjustStock()` | Direct wrapper |
| `useABCAnalysis()` | `ABCAnalysisEngine.analyze()` | Direct wrapper |

---

## 📝 Implementation Steps

### **Step 1: Create Query Keys Factory**

**File**: `src/modules/materials/hooks/queryKeys.ts`

```typescript
import type { MaterialsFilters } from '@/modules/materials/store/materialsStore';

export const materialsKeys = {
  all: ['materials'] as const,
  lists: () => [...materialsKeys.all, 'list'] as const,
  list: (filters?: MaterialsFilters) => [...materialsKeys.lists(), filters] as const,
  details: () => [...materialsKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialsKeys.details(), id] as const,
  abc: () => [...materialsKeys.all, 'abc-analysis'] as const,
  stats: () => [...materialsKeys.all, 'stats'] as const,
};
```

---

### **Step 2: Create useMaterials Hook**

**File**: `src/modules/materials/hooks/useMaterials.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { materialsApi } from '@/modules/materials/services';
import { useMaterialsStore } from '@/modules/materials/store';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

export function useMaterials() {
  const filters = useMaterialsStore((state) => state.filters);
  
  return useQuery<MaterialItem[], Error>({
    queryKey: materialsKeys.list(filters),
    queryFn: async () => {
      // ✅ REUSE existing materialsApi.fetchItems()
      const allItems = await materialsApi.fetchItems();
      
      // Apply filters
      let filtered = allItems;
      
      if (filters.searchTerm) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }
      
      if (filters.category) {
        filtered = filtered.filter(item => item.category === filters.category);
      }
      
      if (filters.type) {
        filtered = filtered.filter(item => item.type === filters.type);
      }
      
      if (filters.supplier) {
        filtered = filtered.filter(item => item.supplier_id === filters.supplier);
      }
      
      if (filters.lowStockOnly) {
        filtered = filtered.filter(item => item.stock <= (item.min_stock || 0));
      }
      
      if (filters.activeOnly) {
        filtered = filtered.filter(item => item.is_active !== false);
      }
      
      // Apply sorting
      filtered = filtered.sort((a, b) => {
        const aVal = a[filters.sortBy] || '';
        const bVal = b[filters.sortBy] || '';
        
        if (filters.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      
      return filtered;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

### **Step 3: Create useMaterial Hook**

**File**: `src/modules/materials/hooks/useMaterial.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { materialsApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

export function useMaterial(id: string) {
  return useQuery<MaterialItem, Error>({
    queryKey: materialsKeys.detail(id),
    queryFn: () => materialsApi.getItem(id), // ✅ REUSE
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id, // Only run if id is provided
  });
}
```

---

### **Step 4: Create useCreateMaterial Hook**

**File**: `src/modules/materials/hooks/useCreateMaterial.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/lib/alerts/useAlerts';
import { inventoryApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { ItemFormData, MaterialItem } from '@/modules/materials/types';

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notify } = useAlerts();
  
  return useMutation<MaterialItem, Error, ItemFormData>({
    mutationFn: async (data) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing inventoryApi.createMaterial()
      // This already handles: permissions, EventBus, logging
      return inventoryApi.createMaterial(data, user);
    },
    onSuccess: (data) => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      notify.success({
        title: 'Material creado',
        description: `${data.name} ha sido creado exitosamente`,
      });
    },
    onError: (error) => {
      notify.error({
        title: 'Error al crear material',
        description: error.message,
      });
    },
  });
}
```

---

### **Step 5: Create useUpdateMaterial Hook**

**File**: `src/modules/materials/hooks/useUpdateMaterial.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlerts } from '@/lib/alerts/useAlerts';
import { inventoryApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

interface UpdateMaterialInput {
  id: string;
  data: Partial<MaterialItem>;
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  const { notify } = useAlerts();
  
  return useMutation<MaterialItem, Error, UpdateMaterialInput>({
    mutationFn: async ({ id, data }) => {
      // ✅ REUSE existing inventoryApi.updateItem()
      return inventoryApi.updateItem(id, data);
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: materialsKeys.detail(id) });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData<MaterialItem>(
        materialsKeys.detail(id)
      );
      
      // Optimistically update
      if (previous) {
        queryClient.setQueryData<MaterialItem>(
          materialsKeys.detail(id),
          { ...previous, ...data }
        );
      }
      
      return { previous };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(materialsKeys.detail(id), context.previous);
      }
      
      notify.error({
        title: 'Error al actualizar material',
        description: error.message,
      });
    },
    onSuccess: (data) => {
      notify.success({
        title: 'Material actualizado',
        description: `${data.name} ha sido actualizado`,
      });
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: materialsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
    },
  });
}
```

---

### **Step 6: Create useAdjustStock Hook**

**File**: `src/modules/materials/hooks/useAdjustStock.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/lib/alerts/useAlerts';
import { inventoryApi } from '@/modules/materials/services';
import { StockCalculation } from '@/modules/materials/services/stockCalculation';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

interface AdjustStockInput {
  materialId: string;
  newStock: number;
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notify, actions: alertActions } = useAlerts();
  
  return useMutation<MaterialItem, Error, AdjustStockInput>({
    mutationFn: async ({ materialId, newStock }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get current stock for oldStock parameter
      const currentMaterial = queryClient.getQueryData<MaterialItem>(
        materialsKeys.detail(materialId)
      );
      const oldStock = currentMaterial?.stock || 0;
      
      // ✅ REUSE existing inventoryApi.updateStock()
      // This already handles: permissions, EventBus, logging, stock_entries
      return inventoryApi.updateStock(materialId, newStock, user, oldStock);
    },
    onSuccess: async (updatedMaterial) => {
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: materialsKeys.detail(updatedMaterial.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: materialsKeys.lists() 
      });
      
      notify.success({
        title: 'Stock actualizado',
        description: `Stock de ${updatedMaterial.name}: ${updatedMaterial.stock} ${updatedMaterial.unit}`,
      });
      
      // ✅ REUSE StockCalculation.getStockStatus() for alert generation
      const status = StockCalculation.getStockStatus(updatedMaterial);
      
      // Generate alert if stock is low/critical/out
      if (status !== 'ok') {
        const severity = status === 'out' ? 'critical' : 
                        status === 'critical' ? 'critical' : 'high';
        
        await alertActions.create({
          type: 'stock',
          severity,
          context: 'materials',
          title: `Stock ${StockCalculation.getStatusLabel(status)}: ${updatedMaterial.name}`,
          description: `Stock actual: ${updatedMaterial.stock} ${updatedMaterial.unit} (Mínimo: ${updatedMaterial.min_stock || 0})`,
          metadata: {
            materialId: updatedMaterial.id,
            materialName: updatedMaterial.name,
            currentStock: updatedMaterial.stock,
            minStock: updatedMaterial.min_stock,
            status,
          },
          persistent: true,
          autoExpire: status === 'out' ? 240 : 120, // 4h for out, 2h for critical/low
          actions: [
            {
              label: 'Ver Material',
              variant: 'primary',
              action: () => {
                window.location.href = `/admin/supply-chain/materials?selected=${updatedMaterial.id}`;
              },
            },
          ],
        });
      }
    },
    onError: (error) => {
      notify.error({
        title: 'Error al ajustar stock',
        description: error.message,
      });
    },
  });
}
```

---

### **Step 7: Create useBulkOperations Hooks**

**File**: `src/modules/materials/hooks/useBulkOperations.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlerts } from '@/lib/alerts/useAlerts';
import { BulkOperationsService } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';

export function useBulkDelete() {
  const queryClient = useQueryClient();
  const { notify } = useAlerts();
  
  return useMutation({
    mutationFn: async (itemIds: string[]) => {
      // ✅ REUSE existing BulkOperationsService.bulkDelete()
      return BulkOperationsService.bulkDelete({ itemIds });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      if (result.totalFailed === 0) {
        notify.success({
          title: 'Eliminación exitosa',
          description: `Se eliminaron ${result.totalSucceeded} materiales`,
        });
      } else {
        notify.warning({
          title: 'Eliminación parcial',
          description: `Exitosos: ${result.totalSucceeded}, Fallidos: ${result.totalFailed}`,
        });
      }
    },
    onError: (error) => {
      notify.error({
        title: 'Error en eliminación masiva',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
  });
}

export function useBulkAdjustStock() {
  const queryClient = useQueryClient();
  const { notify } = useAlerts();
  
  return useMutation({
    mutationFn: async (adjustments: { itemId: string; adjustment: number; reason: string }[]) => {
      // ✅ REUSE existing BulkOperationsService.adjustStock()
      return BulkOperationsService.adjustStock(adjustments);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      if (result.totalFailed === 0) {
        notify.success({
          title: 'Ajuste exitoso',
          description: `Se ajustó el stock de ${result.totalSucceeded} materiales`,
        });
      } else {
        notify.warning({
          title: 'Ajuste parcial',
          description: `Exitosos: ${result.totalSucceeded}, Fallidos: ${result.totalFailed}`,
        });
      }
    },
    onError: (error) => {
      notify.error({
        title: 'Error en ajuste masivo',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
  });
}
```

---

### **Step 8: Create useABCAnalysis Hook**

**File**: `src/modules/materials/hooks/useABCAnalysis.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { ABCAnalysisEngine } from '@/modules/materials/services';
import { materialsApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { ABCAnalysisResult } from '@/modules/materials/types';

export function useABCAnalysis() {
  return useQuery<ABCAnalysisResult, Error>({
    queryKey: materialsKeys.abc(),
    queryFn: async () => {
      // Fetch all materials first
      const materials = await materialsApi.fetchItems();
      
      // ✅ REUSE existing ABCAnalysisEngine.analyze()
      return ABCAnalysisEngine.analyze(materials);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (expensive calculation)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

---

### **Step 9: Create Barrel Export**

**File**: `src/modules/materials/hooks/index.ts`

```typescript
export * from './queryKeys';
export * from './useMaterials';
export * from './useMaterial';
export * from './useCreateMaterial';
export * from './useUpdateMaterial';
export * from './useAdjustStock';
export * from './useBulkOperations';
export * from './useABCAnalysis';
```

---

### **Step 10: Update useMaterialsPage Hook**

**File**: `src/pages/admin/supply-chain/materials/hooks/useMaterialsPage.ts`

Apply the refactor designed in Part 7, using the new hooks created above.

---

## ✅ What We're NOT Creating

Because it already exists:

- ❌ **materialsService** - Use `materialsApi` and `inventoryApi`
- ❌ **stockService** - Use `inventoryApi.updateStock()` + `StockCalculation`
- ❌ **bulkOperationsService** - Use existing `BulkOperationsService`
- ❌ **abcAnalysisService** - Use existing `ABCAnalysisEngine`
- ❌ **alertsIntegrationService** - Use existing `SmartAlertsAdapter` + `useAlerts()`

---

## 🧪 Testing Strategy

**Test the NEW hooks**, not the existing services (those already have tests):

```typescript
// Test NEW hook
import { renderHook, waitFor } from '@testing-library/react';
import { useMaterials } from '../useMaterials';
import { materialsApi } from '@/modules/materials/services';

vi.mock('@/modules/materials/services');

test('useMaterials should call materialsApi.fetchItems', async () => {
  vi.mocked(materialsApi.fetchItems).mockResolvedValue([]);
  
  const { result } = renderHook(() => useMaterials(), { wrapper: createWrapper() });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  
  expect(materialsApi.fetchItems).toHaveBeenCalledTimes(1);
});
```

---

## 📊 Summary

### **What We're Doing**:

1. ✅ Creating **thin wrapper hooks** around existing services
2. ✅ **Reusing** all existing business logic
3. ✅ **Adding** TanStack Query layer for caching, optimistic updates, etc.
4. ✅ **Refactoring** `useMaterialsPage` to use new hooks

### **What We're NOT Doing**:

- ❌ Duplicating existing service logic
- ❌ Rewriting API calls
- ❌ Creating new business logic services
- ❌ Breaking existing code

### **Benefits**:

- ✅ **Zero duplication** - All logic reused
- ✅ **Minimal code changes** - Only hooks layer added
- ✅ **Backward compatible** - Existing services still work
- ✅ **Easy rollback** - Can remove hooks if needed
- ✅ **Incremental migration** - Can migrate page by page

---

## 🚀 Next Steps

1. Create all hook files (Steps 1-9)
2. Update `useMaterialsPage.ts` (Step 10)
3. Test each hook individually
4. Validate in dev server
5. Fix TypeScript errors
6. Update UI components to use new `useMaterialsPage`

Ready to execute? 🎯
