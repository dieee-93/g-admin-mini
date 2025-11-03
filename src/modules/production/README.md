# Production Module

**Status:** ✅ PRODUCTION READY
**Version:** 1.0.0
**Last Updated:** 2025-01-25
**Formerly:** Kitchen Module (renamed in Phase 0.5)

---

## Production Status

- [x] Manifest complete
- [x] DB connected & CRUD working
- [x] UI functional
- [x] Cross-module mapped
- [x] 0 ESLint errors (13 errors fixed)
- [x] 0 TypeScript errors
- [x] README complete with cross-module documentation
- [x] Production-ready checklist completed (8/10 - permissions pending Phase 2)

**Current Score:** 8/10 (80%) - PRODUCTION READY ✅
**Pending:** Permissions (Phase 2)

---

## Overview

The Production module manages all aspects of product manufacturing and preparation workflows. It handles production orders, BOM tracking, station management, and real-time production monitoring.

**Renamed from "Kitchen"** in Phase 0.5 to better reflect its general-purpose production capabilities beyond food service.

## Features

### Core Production Management
- **Production Orders**: Create and track production batches
- **BOM Management**: Define and manage Bills of Materials for products
- **Production Workflow**: Multi-stage production process tracking
- **Real-time Monitoring**: Live production status and metrics

### Production Display System
- **Kitchen Display System** (Sub-module): Real-time order display for production stations
- **Station Management**: Configure and manage production stations
- **Order Routing**: Automatic routing to appropriate production stations
- **Priority Queue**: Intelligent order prioritization

### Production Planning
- **Batch Scheduling**: Plan production runs
- **Resource Allocation**: Manage production capacity
- **Waste Tracking**: Monitor material usage and waste
- **Efficiency Metrics**: Track production performance

## Module Structure

```
production/
├── manifest.tsx             # Main production module manifest
├── kitchen/                 # Kitchen Display sub-module
│   └── manifest.tsx         # KDS sub-module manifest
├── components/
│   ├── ProductionQueue.tsx
│   ├── BOMEditor.tsx
│   └── StationDisplay.tsx
└── services/
    └── productionService.ts
```

## Integration

### Required Features
- `production_workflow` - Core production capability
- `production_bom_management` - Bill of Materials system
- `production_display_system` - Kitchen Display System (KDS)
- `production_batch_tracking` - Batch production tracking

### Module Dependencies
- `materials` - Material requirements and consumption
- `products` - Product definitions and recipes
- `sales` - Production triggers from orders

### EventBus Events

**Consumed:**
- `sales.order.created` - New orders requiring production
- `materials.stock.low` - Material shortage alerts

**Emitted:**
- `production.order.started` - Production order started
- `production.order.ready` - Production order completed
- `production.batch.completed` - Production batch finished
- `production.station.update` - Station status changed

## Hook Points

- `production.display` - Custom display components for KDS
- `production.stations` - Station configuration extensions
- `production.metrics` - Custom production metrics
- `calendar.events` - Production events for unified calendar

## Usage Example

```typescript
import { useProductionQueue } from '@/modules/production';

function ProductionDashboard() {
  const { activeOrders, startProduction, completeOrder } = useProductionQueue();

  return (
    <ProductionQueue
      orders={activeOrders}
      onStart={startProduction}
      onComplete={completeOrder}
    />
  );
}
```

## Sub-Modules

### Kitchen Display (KDS)
Auto-installed sub-module providing real-time order display for production stations.

**Features:**
- Real-time order updates
- Multi-station support
- Order timing and alerts
- Touch-optimized interface

## Configuration

### Station Setup
1. Navigate to Production settings
2. Configure production stations (e.g., Grill, Fryer, Assembly)
3. Assign products to stations
4. Set capacity and timing parameters

### BOM Configuration
1. Create product in Products module
2. Add production workflow
3. Define material requirements
4. Set production steps and timing

## Cross-Module Integration

### This module PROVIDES:

#### 1. Hook: `calendar.events`
- **Used by**: Scheduling module
- **Returns**: React Stack component (production schedule blocks)
- **Purpose**: Display production schedule in unified calendar
- **Priority**: 70
- **Status**: ✅ ACTIVE

#### 2. Hook: `materials.row.actions`
- **Used by**: Materials module
- **Returns**: Action object `{ id, label, icon, onClick }`
- **Purpose**: Add "Use in Production" button to materials grid
- **Priority**: 80
- **Status**: ✅ ACTIVE

### This module CONSUMES:

#### 1. EventBus: `sales.order_placed`
- **Provided by**: Sales module
- **Purpose**: Trigger production when new orders arrive
- **Handler**: Create production queue entries
- **Status**: ✅ ACTIVE

#### 2. EventBus: `materials.stock_updated`
- **Provided by**: Materials module
- **Purpose**: Adjust recipes when ingredient availability changes
- **Handler**: Recalculate production feasibility
- **Status**: ✅ ACTIVE

### Direct Dependencies (Stores/Modules):

**CONSUMED FROM**:
- `materials` module - Required dependency for inventory tracking

**CONSUMED BY**:
- Sales module (via events)
- Scheduling module (via hooks)

---

## Permissions (Pending - Phase 2)

**Planned permissions**:
- **Admin**: Full access (CRUD + configure + delete)
- **Manager**: Read/write + approve production runs (no delete)
- **Chef/Supervisor**: Read/write (manage production queue)
- **Staff**: Read only (view production status)

---

## Notes

- **Renamed from "Kitchen"** module in Phase 0.5 for clarity
- Supports both food production and general manufacturing workflows
- **Link Module Pattern**: Depends on `materials` module
- Integrates with Materials for inventory consumption tracking
- Real-time updates ensure production visibility
- Sub-module (Kitchen Display) auto-loads when `production_display_system` feature is active
- EventBus integration for cross-module communication

---

**Last validated:** 2025-01-25
**Next review:** After Phase 2 completion (Permissions)
