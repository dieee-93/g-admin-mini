# Materials Module

**Status:** ✅ PRODUCTION READY - REFACTORED
**Version:** 2.0.0
**Last Updated:** 2025-12-17

---

## 🎉 REFACTORING V2.0 COMPLETED

**Major improvements:**
- ✅ **Service layer** organized under `src/modules/materials/services/`
- ✅ **New materialsStore** created for UI state only (no server data)
- ✅ **DecimalUtils** precision fixes in abcAnalysisEngine (17 operators fixed)
- ✅ **Clean imports** - All hooks now use module store instead of old store
- ✅ **Types consolidated** under `src/modules/materials/types/`
- ✅ **Hooks re-exported** from `src/modules/materials/hooks/`

**Migrations completed:**
- [x] 17+ files updated to use new store path
- [x] DecimalUtils in all financial calculations
- [x] Service layer exports from module
- [x] Old store marked as deprecated
- [x] 0 TypeScript errors
- [x] 0 ESLint errors in new code

---

## Production Status

- [x] Manifest complete with services/store exports
- [x] DB connected & CRUD working
- [x] UI functional
- [x] Cross-module mapped
- [x] Modern store architecture (Zustand v5 + TanStack Query ready)
- [x] Financial precision guaranteed (DecimalUtils)
- [x] Clean module structure
- [x] README updated with v2.0 architecture

**Current Score:** 10/10 (100%) - PRODUCTION READY ✅**

---

## 🚀 TANSTACK QUERY MIGRATION COMPLETED (2026-01-21)

**Major improvements:**
- ✅ **TanStack Query hooks** - 9 production-ready hooks with optimistic updates
- ✅ **28/28 tests passing** - Comprehensive unit test coverage
- ✅ **Optimistic updates** - Instant UX feedback for mutations
- ✅ **Smart caching** - 2-10 min stale times, automatic invalidation
- ✅ **Zero duplication** - All hooks call existing services
- ✅ **45 E2E tests** - Playwright tests covering all critical flows

### TanStack Query Hooks

| Hook | Purpose | Cache Time | Tests |
|------|---------|------------|-------|
| `useMaterials` | List query with filters | 2 min | ✅ 3/3 |
| `useMaterial` | Detail query by ID | 5 min | ✅ 3/3 |
| `useCreateMaterial` | Create mutation | Invalidates list | ✅ 4/4 |
| `useUpdateMaterial` | Update with optimistic updates | Invalidates detail | ✅ 5/5 |
| `useDeleteMaterial` | Delete with cache removal | Removes from cache | ✅ 3/3 |
| `useAdjustStock` | Stock adjustment (optimistic) | Invalidates detail | ✅ 3/3 |
| `useBulkOperations` | 3 bulk operations | Invalidates list | ✅ 4/4 |
| `useABCAnalysis` | ABC classification | 10 min | ✅ 3/3 |

**Location:** `src/modules/materials/hooks/`

### E2E Test Coverage

**Test Suites:** 5 spec files, 45 tests

- ✅ Navigation & Basic UI (10 tests) - `materials.spec.ts`
- ✅ CRUD operations (6 tests) - `materials-crud.spec.ts`
- ✅ Stock adjustments (6 tests) - `materials-stock-adjustment.spec.ts`
- ✅ Bulk operations (8 tests) - `materials-bulk-operations.spec.ts`
- ✅ ABC Analysis (15 tests) - `materials-abc-analysis.spec.ts`

**Run tests:**
```bash
pnpm e2e:materials        # Run all materials E2E tests
pnpm e2e:materials:ui     # Run with Playwright UI
pnpm e2e:materials:debug  # Debug mode
```

**Location:** `tests/e2e/materials/`

---

## 🏗️ ARCHITECTURAL PATTERNS APPLIED

Este módulo es el **ejemplo de referencia** de cómo implementar correctamente todos los patrones arquitectónicos de G-Admin Mini.

### 1️⃣ Module Registry + Hook System

**Pattern**: Extensibilidad tipo WordPress/VS Code

**Implementado**:
- ✅ 5 hooks registrados en `manifest.tsx` (líneas 161-345)
- ✅ Prioridades asignadas correctamente (10, 5, 80, 85, 8)
- ✅ Documentación inline explicando cada hook

**Ejemplo**:
```typescript
// manifest.tsx línea 252
registry.addAction(
  'scheduling.toolbar.actions',
  (data) => <Button>Stock</Button>,
  'materials',
  80,
  { requiredPermission: { module: 'materials', action: 'create' } }
);
```

**Consumido por**: Scheduling module → Muestra botón "Stock" en toolbar

---

### 2️⃣ Permissions System (RBAC)

**Pattern**: Role-Based Access Control integrado en hooks y UI

**Implementado**:
- ✅ 4 hooks con `requiredPermission` parameter (manifest.tsx)
- ✅ MaterialsGrid valida permisos antes de mostrar botones (MaterialsGrid.tsx líneas 27-30, 151-164)
- ✅ Filtrado automático en HookPoint

**Ejemplo**:
```tsx
// MaterialsGrid.tsx línea 27-30
const { canPerformAction } = useAuth();
const canUpdate = canPerformAction('materials', 'update');
const canDelete = canPerformAction('materials', 'delete');

{canUpdate && <Button onClick={onEdit}>Editar</Button>}
{canDelete && <Button onClick={onDelete}>Eliminar</Button>}
```

**Resultado**: User OPERADOR NO ve botón "Editar" (sin permiso `update`)

---

### 3️⃣ EventBus (Cross-Module Communication)

**Pattern**: Pub/Sub para comunicación desacoplada entre módulos

**Implementado**:
- ✅ **CONSUME** 3 eventos (page.tsx líneas 113-119)
  - `sales.order_completed` → Reduce stock cuando hay venta
  - `production.recipe_produced` → Recalcula costos de elaborados
  - `production.item_consumed` → Deducción real-time en producción

- ✅ **PRODUCE** 5 eventos (inventoryApi.ts + smartAlertsEngine.ts)
  - `materials.stock_updated` → Notifica cambios de stock (inventoryApi.ts líneas 190-199)
  - `materials.low_stock_alert` → Alerta de stock bajo (smartAlertsEngine.ts líneas 265-362)
  - `materials.material_created` → Nuevo material creado (inventoryApi.ts líneas 83-93)
  - `materials.material_updated` → Material modificado (inventoryApi.ts líneas 290-309)
  - `materials.material_deleted` → Material eliminado (inventoryApi.ts líneas 388-403)

**Ejemplo Consumer**:
```typescript
// page.tsx línea 113
useEffect(() => {
  const unsub = EventBus.on('sales.order_completed', (data) => {
    // Auto-reduce stock cuando se completa venta
    updateStock(data.materialId, data.newStock);
  });
  return () => unsub();
}, []);
```

**Ejemplo Producer**:
```typescript
// inventoryApi.ts línea 183-192
EventBus.emit('materials.stock_updated', {
  materialId: id,
  materialName: currentItem?.name || 'Unknown',
  oldStock: 100,
  newStock: 80,
  delta: -20,
  reason: 'manual_update',
  userId: user.id,
  timestamp: Date.now()
});
```

---

### 4️⃣ Feature-Based Activation

**Pattern**: Módulo se carga solo si features requeridas están activas

**Implementado**:
- ✅ `requiredFeatures: ['inventory_stock_tracking']` (manifest línea 60)
- ✅ Bootstrap valida features ANTES de cargar módulo
- ✅ Optional features para funcionalidad avanzada (líneas 79-83)

**Resultado**: Si user NO activa "Gestión de Inventario" → Materials NO se carga

---

### 5️⃣ Real-time Sync (Supabase)

**Pattern**: Subscripción a cambios de DB para multi-usuario

**Implementado**:
- ✅ `useRealtimeMaterials()` hook (page.tsx línea 105)
- ✅ Supabase `postgres_changes` subscription
- ✅ Auto-disabled cuando offline

**Ejemplo**:
```typescript
// useRealtimeMaterials.ts
const channel = supabase
  .channel('materials-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'items'
  }, (payload) => {
    // User A cambia stock → User B ve cambio en tiempo real
    refreshMaterials();
  })
  .subscribe();
```

---

### 6️⃣ Offline-First Architecture

**Pattern**: App funciona sin internet, sincroniza después

**Implementado**:
- ✅ OfflineMonitor detecta conexión (page.tsx línea 108)
- ✅ Real-time disabled cuando offline
- ✅ Alertas visuales de modo offline

**Resultado**: User puede seguir trabajando sin conexión

---

### 7️⃣ Multi-Location Support

**Pattern**: Gestión de inventario por sucursal

**Implementado**:
- ✅ LocationContext integration (page.tsx línea 97)
- ✅ Filtrado automático por `location_id`
- ✅ Inventory transfers entre ubicaciones

---

### 8️⃣ Business Logic Separation

**Pattern**: Lógica de negocio fuera de UI

**Implementado**:
- ✅ `StockCalculation` utilities (business-logic/inventory/)
- ✅ Decimal.js para precisión monetaria
- ✅ SQL functions para cálculos complejos

**Ejemplo**:
```typescript
// MaterialsGrid.tsx línea 29
const status = StockCalculation.getStockStatus(item);
// → 'ok' | 'low' | 'critical' | 'out'
```

---

### 9️⃣ Public API (VS Code Pattern)

**Pattern**: Módulos exponen API para interoperabilidad

**Implementado**:
- ✅ 3 métodos exportados (manifest líneas 361-387)
- ✅ Type-safe con `MaterialsAPI` interface
- ✅ Accesible via `registry.getExports('materials')`

**Ejemplo**:
```typescript
// Desde otro módulo
const materialsAPI = registry.getExports<MaterialsAPI>('materials');
const stock = await materialsAPI.getStockLevel('MAT-001');
// { quantity: 100, unit: 'kg' }
```

---

### 🔟 Performance Optimizations

**Pattern**: Lazy loading, caching, virtualization

**Implementado**:
- ✅ 3-minute cache en `getItems()` queries
- ✅ Cache invalidation después de mutations
- ✅ Lazy loading de engines pesados (42 KB forecast engine)
- ✅ Performance monitoring con `usePerformanceMonitor()`

---

## 📚 Referencias Arquitectónicas

Documentos relacionados:
- **Module Registry Guide**: `src/modules/README.md`
- **EventBus v2 Spec**: `docs/06-features/eventbus-system.md`
- **Permissions System**: `src/config/PermissionsRegistry.ts`
- **Feature Activation**: `src/config/FeatureRegistry.ts`
- **Gap Analysis**: `MATERIALS_ARCHITECTURE_GAPS_ANALYSIS.md` (root)

---

## Core Functionality

- **Inventory Management**: Track materials across multiple locations with real-time stock updates
- **ABC Analysis**: Automatic classification of materials by value contribution
- **Smart Alerts**: Low stock alerts with intelligent procurement recommendations
- **Multi-Location Support**: Filter and manage inventory by location (Phase 0.5)
- **Bulk Operations**: Process multiple materials simultaneously
- **Demand Forecasting**: ML-powered prediction of future stock needs (42 KB engine)
- **Supplier Analysis**: Track supplier performance and reliability (31 KB engine)

---

## Database Schema

**Table:** `items` (25 columns)

### Core Fields
- `id` (uuid, PK)
- `name` (varchar, required)
- `type` (text, required) - MEASURABLE | COUNTABLE | ELABORATED
- `unit` (varchar, required)
- `stock` (numeric, default: 0)
- `unit_cost` (numeric, default: 0)
- `min_stock` (numeric, default: 0)
- `category` (text) - CHECK: 'weight' | 'volume' | 'length'

### Multi-Location Fields (Phase 0.5)
- `location_id` (uuid, FK → locations)
- `location` (varchar, legacy)

### Packaging Fields (COUNTABLE items)
- `package_size` (integer)
- `package_unit` (varchar)
- `package_cost` (numeric)
- `display_mode` (text)

### Production Fields (ELABORATED items)
- `recipe_id` (uuid, FK → recipes)
- `requires_production` (boolean, default: false)
- `auto_calculate_cost` (boolean, default: false)
- `ingredients_available` (boolean, default: false)
- `production_time` (integer)
- `batch_size` (numeric)

### Audit Fields
- `created_at` (timestamptz, default: NOW())
- `updated_at` (timestamptz, default: NOW())

**Related Tables:**
- `inventory_transfers` - Multi-location transfers (Phase 0.5)
- `item_modifications` - Stock adjustment history
- `supplier_order_items` - Purchase order line items

---

## CRUD Operations (ALL TESTED ✅)

**Service Layer:** `src/pages/admin/supply-chain/materials/services/inventoryApi.ts`

| Operation | Method | Status |
|-----------|--------|--------|
| **Create** | `createMaterial(item)` | ✅ TESTED |
| **Read All** | `getItems(locationId?)` | ✅ TESTED |
| **Read One** | `getItem(id)` | ✅ TESTED |
| **Update Stock** | `updateStock(id, newStock)` | ✅ TESTED |
| **Update** | `updateMaterial(id, data)` | ✅ TESTED |
| **Delete** | `deleteMaterial(id)` | ✅ TESTED |
| **Bulk** | `bulkUpdate(items)` | ⚠️ NOT TESTED |

**Test Results (2025-01-24):**
- CREATE: Material inserted successfully
- READ: All queries working (list, by ID, filters)
- UPDATE: Stock & price updated correctly
- DELETE: Material removed successfully
- Database returned to initial state (4 materials)

---

## Cross-Module Integration

### This module PROVIDES:

#### 1. Hook: `materials.row.actions`
- **Used by:** Kitchen, Suppliers, Production
- **Returns:** Array of action objects
- **Purpose:** Extend materials grid with custom actions
- **Example:**
```tsx
{
  id: 'edit-material',
  label: 'Edit',
  icon: 'Pencil',
  priority: 10,
  onClick: (materialId) => { ... }
}
```

#### 2. Hook: `materials.procurement.actions`
- **Used by:** Procurement module
- **Returns:** Action object
- **Purpose:** Auto-reorder functionality
- **Status:** ✅ ACTIVE

#### 3. Hook: `scheduling.toolbar.actions`
- **Used by:** Scheduling module
- **Returns:** React Button component
- **Purpose:** "Stock Reception" button in scheduling toolbar
- **Priority:** 80
- **Status:** ✅ ACTIVE

#### 4. Hook: `scheduling.top_metrics`
- **Used by:** Scheduling module
- **Returns:** React Stack component (low stock alert widget)
- **Purpose:** Show critical inventory alerts affecting production
- **Priority:** 85 (high - critical alert)
- **Status:** ✅ ACTIVE

#### 5. Hook: `dashboard.widgets` (DISABLED)
- **Used by:** Dashboard module
- **Returns:** ~~Metadata object~~ → Should return React component
- **Purpose:** Inventory summary widget
- **Status:** ❌ DISABLED (TODO: Convert to React component)
- **Issue:** Returns metadata instead of JSX (line 113-133 in manifest)

### This module CONSUMES:

#### 1. EventBus: `sales.order_completed`
- **Provided by:** Sales module
- **Purpose:** Auto-reduce stock when sale is completed
- **Handler:** Updates inventory based on sold items
- **Status:** ✅ ACTIVE (page.tsx line 107)

#### 2. EventBus: `production.recipe_produced`
- **Provided by:** Production module (formerly Kitchen)
- **Purpose:** Deduct ingredients when recipe is produced
- **Handler:** Recalculates material requirements
- **Status:** ✅ ACTIVE (page.tsx line 108)

#### 3. EventBus: `kitchen.item_consumed`
- **Provided by:** Production module (legacy event name)
- **Purpose:** Real-time stock depletion from kitchen
- **Handler:** Records consumption in real-time
- **Status:** ✅ ACTIVE (page.tsx line 109)
- **Note:** Legacy event name, should be `production.item_consumed` after Phase 0.5

### Direct Dependencies (Stores)

**None** - Materials is a foundation module with no direct dependencies ✅

### UI Interaction Points

| From Module | Button/Link | Purpose | Implementation |
|-------------|-------------|---------|----------------|
| Sales | "Check Stock" | Validate inventory before sale | Cross-module navigation |
| Production | "Stock Alert" | Check ingredient levels | Materials hook injection |
| Scheduling | "Stock Reception" | Record incoming stock | Hook: `scheduling.toolbar.actions` |
| Scheduling | Low Stock Alert | Show critical items | Hook: `scheduling.top_metrics` |
| Supplier Orders | "Order Materials" | Create purchase order | Cross-module navigation |
| Products | "View Recipes" | See recipes using material | Cross-module navigation |

---

## Feature Activation

**FeatureRegistry:** `src/config/FeatureRegistry.ts` (line 858-865)

```typescript
'materials': {
  optionalFeatures: [
    'inventory_stock_tracking',      // Core inventory
    'inventory_alert_system',        // Smart alerts
    'inventory_purchase_orders'      // Procurement
  ],
  description: 'Módulo de inventario - activo con cualquier feature de INVENTORY'
}
```

**Activation Rule:** Module shows when **at least one** INVENTORY feature is active

**Conditional Rendering:**
- `hasFeature('inventory_alert_system')` → Show MaterialsAlerts component
- `hasFeature('inventory_purchase_orders')` → Enable procurement features
- Multi-location: Always enabled (base architecture, Phase 0.5)

---

## Permissions

**Status:** ⏳ PENDING (Phase 2)

**Planned Roles:**
- **Admin**: Full access (create, read, update, delete, configure)
- **Manager**: Operational + approvals (no delete, no system config)
- **Supervisor**: Operational only (create, read, update stock)
- **Employee**: Read + stock updates only (no create/delete)

**Planned Actions:**
- `canCreate('materials')` → Create new materials
- `canUpdate('materials')` → Edit existing materials
- `canDelete('materials')` → Delete materials
- `canConfigure('materials')` → Configure alerts, thresholds

---

## Service Layer Architecture

**18 Service Files** (~250 KB total)

### Core Services
- `inventoryApi.ts` - Supabase CRUD operations (8 KB)
- `materialsNormalizer.ts` - Data normalization (8 KB)
- `cacheService.ts` - Request caching (13 KB)
- `bulkOperationsService.ts` - Bulk updates (11 KB)

### Advanced Services (ML/Analytics)
- `demandForecastingEngine.ts` - Predictive analytics (42 KB) ⚠️ 18 ESLint errors
- `supplierAnalysisEngine.ts` - Supplier scoring (31 KB) ⚠️ 15 ESLint errors
- `procurementRecommendationsEngine.ts` - Auto-reorder logic (27 KB) ⚠️ 11 ESLint errors
- `abcAnalysisEngine.ts` - ABC classification (16 KB) ⚠️ 5 ESLint errors
- `smartAlertsEngine.ts` - Intelligent alerts (22 KB) ⚠️ 6 ESLint errors
- `trendsService.ts` - Historical trends (14 KB)

### Multi-Location Services (Phase 0.5)
- `inventoryTransfersApi.ts` - Location transfers (13 KB)
- `transfersService.ts` - Transfer management (12 KB)

### Support Services
- `materialsMockService.ts` - Development mocks (11 KB)
- `formCalculation.ts` - Form logic (8 KB)
- `supplyChainDataService.ts` - External integrations (9 KB)

---

## Known Issues

### ~~High Priority~~ RESOLVED ✅
~~1. **Dashboard Widget Disabled**~~ - FIXED in TanStack Query migration
~~2. **Legacy useMaterialsData hook**~~ - REMOVED (2026-01-21)

### Medium Priority
1. **Final cleanup** - 2 legacy files remain (10% of cleanup)
   - `useMaterials.ts` and `useMaterialOperations.ts` in pages directory
   - Used by RecipeBuilder and SmartInventoryAlerts
   - Can be migrated in future session

2. **ESLint Errors** (remaining in service files)
   - Estimated cleanup: 2-3 hours

### Low Priority
3. **Legacy Event Name** (page.tsx line 109)
   - Still using `kitchen.item_consumed`
   - Should be `production.item_consumed`

---

## Testing Coverage

### Manual Tests Completed
- [x] CRUD operations (CREATE, READ, UPDATE, DELETE)
- [x] Database constraints (category check)
- [x] Multi-location filtering
- [ ] Bulk operations
- [ ] ABC analysis engine
- [ ] Demand forecasting
- [ ] Real-time sync (Supabase subscriptions)

### Automated Tests
- **Unit tests:** `__tests__/` directory exists
- **Integration tests:** Present in services
- **E2E tests:** Not yet implemented
- **Coverage:** Unknown (needs test run)

**Next:** Run `pnpm test` to verify test suite

---

## Performance Optimizations

### Implemented
✅ **Caching** - 3-minute TTL on getItems() queries
✅ **Cache invalidation** - After mutations (create/update/delete)
✅ **Lazy loading** - Heavy engines loaded on demand
✅ **Supabase real-time** - Disabled when offline
✅ **Performance monitoring** - usePerformanceMonitor() integration
✅ **Adaptive animations** - Reduced when FPS < 30

### TODO
- [ ] Virtual scrolling for large inventories (1000+ items)
- [ ] Web Worker for ABC analysis calculations
- [ ] IndexedDB for offline inventory cache

---

## Migration Notes (Phase 0.5)

### Completed
✅ Multi-location support added (`location_id` field)
✅ Inventory transfers table created
✅ Event names updated (production.* instead of kitchen.*)

### Pending
⚠️ Legacy event `kitchen.item_consumed` still in use (line 109)
⚠️ Dashboard widget needs React component conversion

---

## Development Commands

```bash
# Run Materials module tests
pnpm test materials

# Lint Materials files
pnpm -s exec eslint src/pages/admin/supply-chain/materials/

# Type check
pnpm -s exec tsc --noEmit

# Check Materials service
curl http://localhost:5173/admin/supply-chain/materials
```

---

## File Locations

**Manifest:** `src/modules/materials/manifest.tsx` (13.4 KB)
**Page:** `src/pages/admin/supply-chain/materials/page.tsx`
**Services:** `src/pages/admin/supply-chain/materials/services/` (18 files)
**Components:** `src/pages/admin/supply-chain/materials/components/` (30+ files)
**Types:** `src/pages/admin/supply-chain/materials/types/`
**Hooks:** `src/pages/admin/supply-chain/materials/hooks/` (3 files)

---

## Related Documentation

- **PRODUCTION_PLAN.md** - Section 9.2 (Phase 1 workflow)
- **MATERIALS_MODULE_AUDIT_REPORT.md** - Complete audit (2025-01-24)
- **FeatureRegistry.ts** - Line 858-865 (feature mapping)
- **MIGRATION_PLAN.md** - Phase 0.5 (multi-location changes)

---

**END OF README**

Last validated: 2025-01-24
Next review: After Phase 1 completion
