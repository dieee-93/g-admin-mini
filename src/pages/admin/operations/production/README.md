# Kitchen Display System Module

## Overview
Enterprise-grade Kitchen Display System (KDS) for managing kitchen orders, stations, and preparation workflow.

## Features
- ✅ Kitchen Display System component migrated (526 lines)
- ✅ 6 kitchen stations (grill, fryer, salad, dessert, drinks, expedite)
- ✅ Priority management (VIP, RUSH, NORMAL)
- ✅ Item status workflow (PENDING → IN_PROGRESS → READY → SERVED)
- ✅ Order timing & progress tracking
- ✅ Station filtering & sorting
- ✅ Special instructions & allergy warnings
- ✅ Modifications tracking

### 🗺️ Feature & Route Map

| Route (Relative) | Feature Area | Components | Description |
|------------------|--------------|------------|-------------|
| **`/`** | **Kitchen Display** | `KitchenDisplay` | Main KDS view. Orders flow from Sales to here. |
| **`(drawer)`** | **Configuration** | `KitchenConfigDrawer` | Settings for offline mode, printer routing, and station config. |

- 🚧 EventBus integration (needs activation)
- 🚧 Offline/Online mode configuration (migrated from Hub, needs refactor)

## Components

### `page.tsx`
Main Kitchen Display page - placeholder for now, will activate KDS once routing is complete.

### `components/KitchenDisplay.tsx`
Full KDS component migrated from Sales (526 lines).
**Note**: Currently uses `@chakra-ui/react` directly - needs refactor to `@/shared/ui` in Phase 8.

### `components/KitchenConfigDrawer.tsx` (TODO)
Configuration drawer for:
- Operation modes: online-first, offline-first, auto, offline-only
- Emergency mode toggle
- Connection quality monitoring
- EventBus settings

## Dependencies
- **EventBus**: `sales.order_placed`, `materials.stock_updated`
- **Link Module**: Auto-activates when Sales + Materials are active
- **Supabase**: Kitchen config persistence
- **Types**: KitchenOrder, KitchenItemStatus, PriorityLevel, KITCHEN_STATIONS

## Usage
Navigate to `/admin/operations/kitchen` to access KDS.

## Integration

### Link Module Pattern (Odoo-inspired)
This module follows the link module pattern - it auto-installs when dependencies are active:

```tsx
// src/modules/kitchen/manifest.tsx
depends: ['sales', 'materials'],
autoInstall: true,
category: 'integration'
```

### EventBus Integration
Listens to `sales.order_placed` → displays in kitchen:
```tsx
registry.addAction('sales.order_placed', (order) => {
  emit('kitchen.display.orders', {
    orderId: order.id,
    items: order.items,
    priority: order.priority || 'NORMAL',
    station: determineStation(order.items)
  })
}, 'kitchen', 100)
```

### Materials Integration
Checks ingredient availability via `materials.stock_updated`:
```tsx
registry.addAction('materials.stock_updated', (material) => {
  emit('kitchen.ingredient.check', {
    materialId: material.id,
    available: material.quantity > 0
  })
}, 'kitchen', 80)
```

## Technical Details
- **526 lines**: Core KDS logic (migrated from Sales orphan)
- **Config drawer**: For mode selection (not tab)
- **Real-time orders**: Via EventBus integration
- **Station-based workflow**: Grill, Fryer, Salad, Dessert, Drinks, Expedite
- **Priority system**: VIP (highest), RUSH, NORMAL
- **Status tracking**: PENDING → IN_PROGRESS → READY → SERVED

## Migration Notes
- Migrated from `src/pages/admin/operations/sales/components/OrderManagement/KitchenDisplaySystem.tsx`
- Component copied as-is (526 lines)
- **TODO Phase 8**: Refactor to use `@/shared/ui` instead of `@chakra-ui/react`
- **TODO**: Create KitchenConfigDrawer from Hub/Kitchen component
- **TODO**: Activate EventBus integration after routing complete

## Configuration (Future)
Access config drawer via button in page header:
- **Operation modes**: online-first, offline-first, auto, offline-only
- **Emergency mode** toggle
- **Connection quality** monitoring
- **Sync settings**

## Roadmap
1. ✅ Migrate KDS component to Kitchen module
2. ✅ Create page structure
3. 🚧 Refactor KDS to use @/shared/ui (Phase 8)
4. 🚧 Create KitchenConfigDrawer from Hub config
5. 🚧 Activate EventBus hooks (after routing)
6. 🚧 Connect to Sales orders real-time
7. 🚧 Add kitchen stats component
