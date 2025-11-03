# MATERIALS MODULE - ARQUITECTURA Y ORQUESTACIÓN DE SISTEMAS

**Fecha**: 2025-01-30
**Objetivo**: Mapear cómo todos los sistemas se orquestan en Materials como gold standard

---

## 📋 SISTEMAS ARQUITECTÓNICOS

Materials debe integrar **12 sistemas** diferentes. Vamos a mapear cada uno:

| # | Sistema | Propósito | Estado en Materials |
|---|---------|-----------|---------------------|
| 1 | **EventBus** | Comunicación entre módulos | 🔴 **ROTO** |
| 2 | **Module Registry** | Hooks & extensions | 🟡 **PARCIAL** |
| 3 | **Offline Sync** | Queue offline operations | 🟢 **FUNCIONA** |
| 4 | **Permissions** | RBAC authorization | 🟡 **PARCIAL** |
| 5 | **Capabilities/Features** | Progressive disclosure | 🟡 **CONFUSO** |
| 6 | **Zustand Store** | Client state | 🟢 **FUNCIONA** |
| 7 | **Supabase DB** | Persistence | 🟢 **FUNCIONA** |
| 8 | **Supabase Realtime** | Live updates | 🟡 **PARCIAL** |
| 9 | **RLS (Row Level Security)** | Data security | ⚪ **UNKNOWN** |
| 10 | **Error Handling** | Global error boundary | 🟢 **FUNCIONA** |
| 11 | **Logging** | Structured logs | 🟢 **FUNCIONA** |
| 12 | **Performance Monitor** | FPS tracking | 🟢 **FUNCIONA** |

---

## 🔍 ANÁLISIS DETALLADO POR SISTEMA

### SISTEMA 1: EventBus

**Propósito**: Comunicación asíncrona entre módulos desacoplados

**Ubicación**:
- Core: `src/lib/events/EventBus.ts`
- Types: `src/lib/events/types.ts`
- Testing: `src/lib/events/testing/EventBusTestingHarness.ts`

**API**:
```typescript
// Emitir evento
eventBus.emit('materials.stock_updated', {
  materialId: '123',
  oldStock: 10,
  newStock: 5
});

// Escuchar evento
const unsub = eventBus.on('sales.order_completed', (event) => {
  // Handle stock reduction
});

// Cleanup
unsub();
```

**Características**:
- Pattern-based subscription: `domain.entity.action`
- Wildcards: `materials.*`, `*.stock_updated`
- Priority system (0-100)
- Deduplication
- Offline queueing
- Encryption para payloads sensibles

---

#### ❌ ESTADO ACTUAL EN MATERIALS: ROTO

**Problema 1**: Eventos declarados pero NO emitidos

```typescript
// En manifest.tsx línea 94
hooks: {
  provide: [
    'materials.stock_updated',      // ❌ NUNCA se emite
    'materials.low_stock_alert',    // ❌ NUNCA se emite
  ]
}
```

**Dónde debería emitirse**:
```typescript
// src/store/materialsStore.ts línea 150
updateItem: (id, updates) => {
  set(produce(draft => {
    const item = draft.items.find(i => i.id === id);
    if (item) Object.assign(item, updates);
  }));

  // ❌ FALTA: Emit event after update
  // eventBus.emit('materials.stock_updated', { id, updates });
}
```

---

**Problema 2**: Listeners declarados pero NO registrados

```typescript
// En page.tsx líneas 56-70
const MATERIALS_MODULE_CONFIG = {
  eventHandlers: {
    'sales.completed': (data) => {
      logger.info('MaterialsStore', '🛒 Sale completed, updating stock...', data);
      // ⚠️ Solo loguea, NO actualiza stock
    },
    'products.recipe_updated': (data) => {
      logger.debug('MaterialsStore', '📝 Recipe updated...');
      // ⚠️ Solo loguea
    },
    'kitchen.item_consumed': (data) => {
      logger.info('MaterialsStore', '🍳 Kitchen consumption...');
      // ⚠️ Solo loguea
    }
  }
}

// ❌ PROBLEMA: Este config se crea pero NUNCA se pasa a eventBus.on()
// No hay useEffect que registre estos handlers
```

**Dónde debería registrarse**:
```typescript
// En page.tsx FALTA este useEffect:
useEffect(() => {
  const unsubscribers = Object.entries(MATERIALS_MODULE_CONFIG.eventHandlers).map(
    ([eventPattern, handler]) => eventBus.on(eventPattern, handler)
  );

  return () => unsubscribers.forEach(unsub => unsub());
}, []);
```

---

#### ✅ SOLUCIÓN: Integración EventBus correcta

**Paso 1**: Crear service de eventos

```typescript
// src/pages/admin/supply-chain/materials/services/materialsEvents.ts

import eventBus, { type EventPayload } from '@/lib/events';
import { useMaterials } from '@/store/materialsStore';
import { logger } from '@/lib/logging';

/**
 * Setup Materials EventBus integration
 * Registers all event listeners for the module
 */
export function setupMaterialsEvents() {
  logger.info('Materials', 'Setting up EventBus listeners');

  // ============================================
  // LISTEN: Sales module events
  // ============================================

  const unsubSales = eventBus.on('sales.order_completed', async (event) => {
    logger.info('Materials', 'Sale completed, reducing stock', {
      orderId: event.payload.orderId
    });

    try {
      const { items } = event.payload;

      // Reduce stock for each sold item
      for (const saleItem of items) {
        if (saleItem.materialId) {
          const store = useMaterials.getState();
          const material = store.items.find(m => m.id === saleItem.materialId);

          if (material) {
            const newStock = material.current_stock - saleItem.quantity;
            await store.updateItem(material.id, { current_stock: newStock });
          }
        }
      }
    } catch (error) {
      logger.error('Materials', 'Failed to reduce stock from sale', error);
    }
  });

  // ============================================
  // LISTEN: Production module events
  // ============================================

  const unsubProduction = eventBus.on('production.recipe_produced', async (event) => {
    logger.info('Materials', 'Recipe produced, reducing ingredients', {
      recipeId: event.payload.recipeId,
      quantity: event.payload.quantity
    });

    try {
      const { recipe, quantity } = event.payload;

      // Reduce stock for recipe materials
      for (const ingredient of recipe.ingredients) {
        const store = useMaterials.getState();
        const material = store.items.find(m => m.id === ingredient.materialId);

        if (material) {
          const consumedQty = ingredient.quantity * quantity;
          const newStock = material.current_stock - consumedQty;
          await store.updateItem(material.id, { current_stock: newStock });
        }
      }
    } catch (error) {
      logger.error('Materials', 'Failed to reduce stock from production', error);
    }
  });

  // ============================================
  // LISTEN: Wildcard for all material events
  // ============================================

  const unsubWildcard = eventBus.on('materials.*', (event) => {
    logger.debug('Materials', 'Material event occurred', {
      pattern: event.pattern,
      type: event.type
    });

    // Could trigger analytics, logging, etc.
  });

  // ============================================
  // CLEANUP FUNCTION
  // ============================================

  return () => {
    logger.info('Materials', 'Tearing down EventBus listeners');
    unsubSales();
    unsubProduction();
    unsubWildcard();
  };
}
```

---

**Paso 2**: Emit events desde el store

```typescript
// src/store/materialsStore.ts

import eventBus from '@/lib/events';
import { EventPriority } from '@/lib/events/types';

export const useMaterials = create<MaterialsState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... existing state ...

        updateItem: (id, updates) => {
          const oldItem = get().items.find(i => i.id === id);
          if (!oldItem) return;

          // Update state
          set(produce(draft => {
            const item = draft.items.find(i => i.id === id);
            if (item) Object.assign(item, updates);
          }));

          // Get updated item
          const newItem = get().items.find(i => i.id === id);
          if (!newItem) return;

          // ✅ EMIT: Stock updated event
          if ('current_stock' in updates) {
            eventBus.emit('materials.stock_updated', {
              materialId: id,
              materialName: newItem.name,
              oldStock: oldItem.current_stock,
              newStock: newItem.current_stock,
              diff: newItem.current_stock - oldItem.current_stock
            }, {
              priority: EventPriority.MEDIUM,
              dedupKey: `stock-update-${id}-${Date.now()}`
            });

            // ✅ EMIT: Low stock alert if needed
            if (
              newItem.current_stock < newItem.reorder_point &&
              oldItem.current_stock >= oldItem.reorder_point
            ) {
              eventBus.emit('materials.low_stock_alert', {
                materialId: id,
                materialName: newItem.name,
                currentStock: newItem.current_stock,
                reorderPoint: newItem.reorder_point,
                severity: newItem.current_stock === 0 ? 'critical' : 'warning'
              }, {
                priority: EventPriority.HIGH
              });
            }
          }

          // Recalculate stats after update
          get().refreshStats();
        },

        addItem: (itemData) => {
          set(produce(draft => {
            const newItem = {
              id: crypto.randomUUID(),
              ...itemData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            draft.items.push(newItem);
          }));

          const addedItem = get().items.slice(-1)[0];

          // ✅ EMIT: Material created event
          eventBus.emit('materials.material_created', {
            materialId: addedItem.id,
            materialName: addedItem.name,
            itemType: addedItem.item_type,
            initialStock: addedItem.current_stock
          }, {
            priority: EventPriority.LOW
          });

          get().refreshStats();
        },

        deleteItem: (id) => {
          const item = get().items.find(i => i.id === id);
          if (!item) return;

          set(produce(draft => {
            draft.items = draft.items.filter(i => i.id !== id);
          }));

          // ✅ EMIT: Material deleted event
          eventBus.emit('materials.material_deleted', {
            materialId: id,
            materialName: item.name
          }, {
            priority: EventPriority.LOW
          });

          get().refreshStats();
        }
      }),
      { name: 'materials-storage' }
    )
  )
);
```

---

**Paso 3**: Usar en page.tsx

```typescript
// src/pages/admin/supply-chain/materials/page.tsx

import { setupMaterialsEvents } from './services/materialsEvents';

export default function MaterialsPage() {
  // ... existing hooks ...

  // ✅ Setup EventBus integration
  useEffect(() => {
    const cleanup = setupMaterialsEvents();
    return cleanup;
  }, []);

  // ... rest of component ...
}
```

---

#### 📊 RESULTADO: EventBus Integration

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Eventos emitidos** | 0 | 5 (`stock_updated`, `low_stock_alert`, `material_created`, `material_deleted`, `material.*`) |
| **Listeners registrados** | 0 | 3 (`sales.order_completed`, `production.recipe_produced`, `materials.*`) |
| **Cross-module communication** | ❌ ROTO | ✅ FUNCIONA |
| **Stock deduction automation** | ❌ Manual | ✅ Automático |
| **Low stock alerts** | ❌ No se emiten | ✅ Real-time |

---

### SISTEMA 2: Module Registry (Hook System)

**Propósito**: Extensibility system - modules can add UI/functionality to other modules

**Ubicación**:
- Core: `src/lib/modules/ModuleRegistry.ts`
- Types: `src/lib/modules/types.ts`
- Hook Component: `src/lib/modules/HookPoint.tsx`

**API**:
```typescript
// Register a hook (in module manifest)
registry.addAction(
  'scheduling.toolbar.actions',  // Hook name
  (data) => <MyButton data={data} />,  // Component to render
  'materials',  // Module ID
  80  // Priority (higher = earlier)
);

// Render hook point (in page)
<HookPoint
  name="scheduling.toolbar.actions"
  data={{ someData: 'value' }}
  direction="row"
  gap="2"
  fallback={null}
/>
```

**Diferencia con EventBus**:
- **EventBus**: Data/logic events (domain events, async)
- **Module Registry**: UI extension points (sync, returns React components)

---

#### 🟡 ESTADO ACTUAL EN MATERIALS: PARCIAL

**Lo que funciona**:

```typescript
// En manifest.tsx líneas 158-196
registry.addAction(
  'materials.row.actions',
  () => {
    return [
      {
        id: 'edit-material',
        label: 'Edit',
        icon: 'Pencil',
        onClick: (materialId: string) => { /* ... */ }
      }
    ];
  },
  'materials',
  10
);

// ✅ Este hook SÍ se registra correctamente
```

**Lo que NO funciona**:

1. **Dashboard widget DISABLED**:
```typescript
// En manifest.tsx línea 128
// TODO: Convert to React component - currently returns metadata instead of JSX
// registry.addAction('dashboard.widgets', ...)
logger.debug('App', 'DISABLED dashboard.widgets hook...');

// ❌ Widget comentado
```

2. **Hooks que usan mock data**:
```typescript
// En manifest.tsx líneas 283-285
registry.addAction('scheduling.top_metrics', () => {
  const lowStockCount = 3;  // ❌ HARDCODED
  const criticalItems = ['Harina', 'Azúcar', 'Manteca'];  // ❌ MOCK DATA

  return <StockAlertCard count={lowStockCount} items={criticalItems} />;
}, 'materials', 85);

// ⚠️ Funciona pero no usa datos reales del store
```

---

#### ✅ SOLUCIÓN: Module Registry Integration

**Fix 1**: Habilitar Dashboard Widget

```typescript
// En manifest.tsx línea 128

registry.addAction(
  'dashboard.widgets',
  () => {
    const { stats, getLowStockItems } = useMaterials.getState();
    const lowStockItems = getLowStockItems();

    return {
      id: 'inventory-summary',
      title: 'Inventory Status',
      type: 'stats',
      priority: 8,
      component: (
        <StatsCard>
          <Stat label="Total Items" value={stats.totalItems} />
          <Stat label="Total Value" value={formatCurrency(stats.totalValue)} />
          <Stat
            label="Low Stock"
            value={lowStockItems.length}
            color={lowStockItems.length > 0 ? 'orange' : 'green'}
          />
        </StatsCard>
      )
    };
  },
  'materials',
  8
);

logger.debug('App', '✅ Registered dashboard.widgets hook');
```

---

**Fix 2**: Usar datos reales en hooks

```typescript
// En manifest.tsx línea 275

registry.addAction(
  'scheduling.top_metrics',
  () => {
    // ✅ Get real data from store
    const { getLowStockItems, getCriticalStockItems } = useMaterials.getState();
    const lowStock = getLowStockItems();
    const critical = getCriticalStockItems();
    const count = lowStock.length + critical.length;

    if (count === 0) return null;  // Don't show if no alerts

    const topItems = [...critical, ...lowStock]
      .slice(0, 3)
      .map(m => m.name);

    return (
      <Stack
        key="materials-low-stock-metric"
        direction="column"
        gap="1"
        p="3"
        bg="orange.50"
        borderRadius="md"
        borderWidth="1px"
        borderColor="orange.300"
      >
        <Stack direction="row" align="center" justify="space-between">
          <Text fontSize="xs" color="orange.700" fontWeight="600">
            Stock Alert
          </Text>
          <Badge size="xs" colorPalette="orange">
            {count}
          </Badge>
        </Stack>
        <Text fontSize="xl" fontWeight="bold" color="orange.600">
          Low Stock
        </Text>
        <Text fontSize="xs" color="orange.500">
          {topItems.join(', ')}
        </Text>
      </Stack>
    );
  },
  'materials',
  85
);
```

---

#### 📊 RESULTADO: Module Registry Integration

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Dashboard widget** | ❌ DISABLED | ✅ FUNCIONA |
| **Mock data in hooks** | ⚠️ Hardcoded | ✅ Real data |
| **Hook registrations** | 4/5 | 5/5 |
| **Cross-module UI** | 🟡 PARCIAL | ✅ COMPLETO |

---

**CONTINÚA EN PRÓXIMA PARTE...**

Ahora voy a mapear los otros 10 sistemas (Offline Sync, Permissions, Capabilities, Store, DB, Realtime, RLS, Error Handling, Logging, Performance).

¿Quieres que continúe con el resto de sistemas o preferís que primero implementemos las soluciones para EventBus y Module Registry?
