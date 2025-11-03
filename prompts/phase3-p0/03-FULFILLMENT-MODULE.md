# 🚚 FULFILLMENT MODULE - Production Ready

**Module**: Fulfillment (Onsite/Pickup/Delivery)
**Phase**: Phase 3 P0 - Module 3/3
**Estimated Time**: 5-6 hours
**Priority**: P0 (Complex - 3 sub-modes, requires DB audit)

---

## 📋 OBJECTIVE

Make the **Fulfillment module** production-ready following the 10-criteria checklist.

**Why this module last**: Most complex P0 module - has 3 sub-modes (onsite, pickup, delivery) with different workflows. Replaced the old Floor module.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/, services/, hooks/, types/ organized
3. ✅ **Zero errors**: 0 ESLint + 0 TypeScript errors in module
4. ✅ **UI complete**: All 3 sub-modes working
5. ✅ **Cross-module mapped**: README documents provides/consumes
6. ✅ **Zero duplication**: No repeated logic across sub-modes
7. ✅ **DB connected**: All operations via service layer
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: minimumRole + usePermissions + service layer
10. ✅ **README**: Cross-module integration documented

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/fulfillment/manifest.tsx`
- **Pages**: `src/pages/admin/operations/fulfillment/[mode]/page.tsx`
- **Components**: `src/modules/fulfillment/components/` (if exists)

### Current Structure
```
src/pages/admin/operations/fulfillment/
├── onsite/                           # Onsite fulfillment (formerly Floor)
│   ├── page.tsx                      # Main onsite page
│   ├── components/
│   │   ├── FloorPlanView.tsx         # Floor plan visual
│   │   ├── FloorPlanQuickView.tsx    # Quick view
│   │   ├── FloorStats.tsx            # Statistics
│   │   └── ReservationsList.tsx      # Reservations
│   └── __tests__/                    # Unit tests
│       ├── test-utils.tsx
│       └── unit/
│           ├── FloorPlanView.test.tsx
│           ├── FloorPlanQuickView.test.tsx
│           └── FloorStats.test.tsx
├── pickup/                           # Pickup fulfillment
│   └── page.tsx                      # Pickup queue page
├── delivery/                         # Delivery fulfillment
│   ├── page.tsx                      # Main delivery page
│   └── tabs/
│       ├── PendingDeliveriesTab.tsx  # Pending deliveries
│       ├── ActiveDeliveriesTab.tsx   # Active deliveries
│       ├── CompletedDeliveriesTab.tsx # Completed
│       ├── ZonesTab.tsx              # Delivery zones
│       └── SettingsTab.tsx           # Delivery settings
└── README.md                         # ⚠️ TO CREATE
```

**Additional Files**:
```
src/modules/fulfillment/
├── manifest.tsx                      # Module manifest
├── components/
│   ├── FulfillmentQueue.tsx          # Shared queue component
│   └── FulfillmentQueueWidget.tsx    # Dashboard widget
└── services/
    └── fulfillmentService.ts         # ⚠️ MAY NEED TO CREATE
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `fulfillment`
- ✅ minimumRole: `OPERADOR` (already set)
- ✅ autoInstall: `false`
- ✅ Dependencies: `['sales', 'staff', 'materials']`

**Hooks**:
- **PROVIDES**:
  - `fulfillment.order_ready` - Order ready for fulfillment
  - `fulfillment.toolbar.actions` - Toolbar actions
  - `dashboard.widgets` - Fulfillment queue widget

- **CONSUMES**:
  - `sales.order_placed` - New order queued
  - `production.order_ready` - Production completed
  - `materials.stock_updated` - Stock changes

**Features** (Optional):
- **Onsite**: `operations_table_management`, `operations_floor_plan_config`, `operations_waitlist_management`
- **Pickup**: `operations_pickup_scheduling`, `sales_pickup_orders`
- **Delivery**: `operations_delivery_zones`, `operations_delivery_tracking`, `sales_delivery_orders`

### Database Schema

**Tables**:

1. **`fulfillment_queue`** (Shared queue)
```sql
- id: uuid (PK)
- order_id: uuid (FK → sales)
- fulfillment_type: text ('onsite' | 'pickup' | 'delivery')
- status: text ('pending' | 'ready' | 'completed')
- priority: int
- created_at: timestamptz
- updated_at: timestamptz
```

2. **`pickup_time_slots`** (Pickup scheduling)
```sql
- id: uuid (PK)
- slot_time: timestamptz
- capacity: int
- reserved: int
- is_available: boolean
```

3. **`delivery_assignments`** (Driver assignments)
```sql
- id: uuid (PK)
- order_id: uuid (FK → sales)
- driver_id: uuid (FK → staff)
- status: text ('assigned' | 'picked_up' | 'in_transit' | 'delivered')
- assigned_at: timestamptz
- delivered_at: timestamptz
```

4. **`delivery_zones`** (Delivery zones)
```sql
- id: uuid (PK)
- name: text
- polygon: geography (PostGIS)
- delivery_fee: decimal
- is_active: boolean
```

5. **`driver_locations`** (GPS tracking)
```sql
- id: uuid (PK)
- driver_id: uuid (FK → staff)
- latitude: decimal
- longitude: decimal
- updated_at: timestamptz
```

---

## 🎯 WORKFLOW (5-6 HOURS)

### 1️⃣ AUDIT (45 min)

**Tasks**:
- [ ] Read `src/modules/fulfillment/manifest.tsx`
- [ ] Read all 3 sub-mode pages (onsite, pickup, delivery)
- [ ] Check ESLint errors: `pnpm -s exec eslint src/pages/admin/operations/fulfillment/`
- [ ] Check TypeScript errors: `pnpm -s exec tsc --noEmit`
- [ ] Review database schema (all 5 tables)
- [ ] Test each sub-mode manually
- [ ] Document current state

**Questions to Answer**:
- How many ESLint/TS errors?
- Are all 3 sub-modes functional?
- Is service layer complete for all modes?
- Are database tables properly migrated?
- Is permission system integrated?
- Are there duplicate components across modes?
- Which tests exist and pass?

---

### 2️⃣ FIX STRUCTURE (1.5 hours)

**Tasks**:
- [ ] Fix ESLint errors in all fulfillment files
- [ ] Fix TypeScript errors in all fulfillment files
- [ ] Remove duplicate logic across modes (extract to shared services)
- [ ] Verify manifest hooks are correct
- [ ] Ensure components use `@/shared/ui`
- [ ] Organize imports
- [ ] Add permission checks with `usePermissions('fulfillment')`

**Manifest Validation**:
```typescript
// Verify in manifest.tsx
depends: ['sales', 'staff', 'materials'],

hooks: {
  provide: [
    'fulfillment.order_ready',
    'fulfillment.toolbar.actions',
    'dashboard.widgets',
  ],
  consume: [
    'sales.order_placed',
    'production.order_ready',
    'materials.stock_updated',
  ],
}
```

**Permission Integration (Page)**:
```typescript
// In each mode page.tsx
import { usePermissions } from '@/hooks/usePermissions';

const {
  canRead,
  canUpdate,
  canConfigure
} = usePermissions('fulfillment');

// Conditional rendering
{canRead && <FulfillmentQueue mode="onsite" />}
{canUpdate && <Button>Update Status</Button>}
{canConfigure && <Button>Settings</Button>}
```

**Shared Service Layer**:
```typescript
// Create: src/modules/fulfillment/services/fulfillmentService.ts
import { requirePermission, requireModuleAccess } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';

export const getFulfillmentQueue = async (
  type: 'onsite' | 'pickup' | 'delivery',
  user?: AuthUser | null
) => {
  if (user) {
    requireModuleAccess(user, 'fulfillment');
  }

  return supabase
    .from('fulfillment_queue')
    .select('*')
    .eq('fulfillment_type', type)
    .order('priority', { ascending: false });
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  user: AuthUser
) => {
  requirePermission(user, 'fulfillment', 'update');

  return supabase
    .from('fulfillment_queue')
    .update({ status, updated_at: new Date() })
    .eq('order_id', orderId);
};
```

---

### 3️⃣ DATABASE & FUNCTIONALITY (2 hours)

**By Sub-Mode**:

#### A. **Onsite Fulfillment** (45 min)
- [ ] Verify floor plan visualization works
- [ ] Test table assignment
- [ ] Test reservations list
- [ ] Verify statistics dashboard
- [ ] Test order queue (pending → ready → completed)

#### B. **Pickup Fulfillment** (30 min)
- [ ] Verify time slot scheduling works
- [ ] Test pickup queue
- [ ] Test "ready for pickup" notifications
- [ ] Verify customer pickup confirmation

#### C. **Delivery Fulfillment** (45 min)
- [ ] Verify delivery zones map
- [ ] Test driver assignment (manual + auto)
- [ ] Test GPS tracking integration
- [ ] Test delivery status transitions
- [ ] Verify zone validation

**Shared Functionality**:
- [ ] Create/verify `fulfillmentService.ts`
- [ ] Test queue operations (add, update, complete)
- [ ] Verify EventBus integration (consume `sales.order_placed`)
- [ ] Verify EventBus integration (emit `fulfillment.order_ready`)
- [ ] Test cross-mode transitions (e.g., delivery → pickup fallback)

---

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)

**Tasks**:
- [ ] Create `src/pages/admin/operations/fulfillment/README.md`
- [ ] Document all 3 sub-modes
- [ ] Document database tables
- [ ] Document provided/consumed hooks
- [ ] Document EventBus events
- [ ] Document permission requirements
- [ ] Test integration with Sales (order → fulfillment)
- [ ] Test integration with Production (production → fulfillment)
- [ ] Test integration with Staff (driver assignment)
- [ ] Register dashboard widget

**EventBus Integration**:
```typescript
// In manifest.tsx setup() - Already implemented
eventBus.subscribe('sales.order_placed', (event) => {
  const { orderId, fulfillmentType } = event.payload;

  logger.debug('Fulfillment', 'New order placed', { orderId, fulfillmentType });

  // Add to fulfillment queue
  // Handled by FulfillmentService
}, { moduleId: 'fulfillment' });

eventBus.subscribe('production.order_ready', (event) => {
  const { orderId } = event.payload;

  logger.debug('Fulfillment', 'Production ready', { orderId });

  // Emit fulfillment.order_ready
  eventBus.emit('fulfillment.order_ready', { orderId });
}, { moduleId: 'fulfillment' });
```

**Dashboard Widget** (Already registered):
```typescript
// In manifest.tsx setup()
registry.addAction(
  'dashboard.widgets',
  () => <FulfillmentQueueWidget />,
  'fulfillment',
  10
);
```

**README Template**:
```markdown
# Fulfillment Module

Order fulfillment across 3 modes: Onsite, Pickup, Delivery.

## Sub-Modes

### 1. Onsite (formerly Floor)
- Table management
- Floor plan visualization
- Reservations
- Waitlist

### 2. Pickup
- Time slot scheduling
- Pickup queue
- Ready notifications
- Customer confirmation

### 3. Delivery
- Delivery zones
- Driver assignment (manual + auto)
- GPS tracking
- Route optimization

## Database Tables
- `fulfillment_queue` - Shared queue (all modes)
- `pickup_time_slots` - Pickup scheduling
- `delivery_assignments` - Driver assignments
- `delivery_zones` - Delivery zones (PostGIS)
- `driver_locations` - GPS tracking

## Provides
- `fulfillment.order_ready` - Order ready event
- `fulfillment.toolbar.actions` - Toolbar extensions
- `dashboard.widgets` - Fulfillment queue widget

## Consumes
- `sales.order_placed` - New order queued
- `production.order_ready` - Production completed
- `materials.stock_updated` - Stock changes

## EventBus Events

### Emitted:
- `fulfillment.onsite.order_ready`
- `fulfillment.pickup.ready`
- `fulfillment.pickup.picked_up`
- `fulfillment.delivery.driver_assigned`
- `fulfillment.delivery.in_transit`
- `fulfillment.delivery.delivered`

### Consumed:
- `sales.order_placed`
- `production.order_ready`

## Permissions
- minimumRole: `OPERADOR`
- read: View fulfillment queues
- update: Update order status
- configure: Delivery zones, time slots

## Dependencies
- Sales (order data)
- Staff (drivers)
- Materials (stock validation)
```

---

### 5️⃣ VALIDATION (45 min)

**Production-Ready Checklist**:
- [ ] ✅ Architecture compliant
- [ ] ✅ Scaffolding ordered
- [ ] ✅ Zero ESLint errors
- [ ] ✅ Zero TypeScript errors
- [ ] ✅ Cross-module mapped
- [ ] ✅ Zero duplication
- [ ] ✅ DB connected (5 tables)
- [ ] ✅ Features mapped
- [ ] ✅ Permissions designed
- [ ] ✅ README complete

**Manual Testing (Per Mode)**:

**Onsite**:
1. [ ] View floor plan
2. [ ] Assign table
3. [ ] Create reservation
4. [ ] View statistics

**Pickup**:
1. [ ] View time slots
2. [ ] Reserve time slot
3. [ ] Mark order ready
4. [ ] Confirm pickup

**Delivery**:
1. [ ] View delivery zones
2. [ ] Assign driver
3. [ ] Track delivery (GPS)
4. [ ] Mark as delivered

**Cross-Mode**:
1. [ ] Order flows from Sales → Fulfillment
2. [ ] Production ready triggers fulfillment
3. [ ] Dashboard widget shows queue

**Final Validation**:
```bash
pnpm -s exec eslint src/pages/admin/operations/fulfillment/
pnpm -s exec eslint src/modules/fulfillment/
pnpm -s exec tsc --noEmit
```

Expected output: **0 errors**

---

## 🚨 CRITICAL PATTERNS

### ✅ DO
- Import from `@/shared/ui`
- Use `usePermissions('fulfillment')`
- Share service layer across modes (`fulfillmentService.ts`)
- Use EventBus for cross-module communication
- Document all 3 sub-modes in README
- Test GPS tracking with mock data
- Handle zone validation for delivery

### ❌ DON'T
- Import from `@chakra-ui/react`
- Duplicate queue logic across modes
- Skip permission checks
- Hardcode fulfillment data
- Forget database migrations (5 tables)
- Skip GPS tracking fallback (driver offline)

---

## 📚 REFERENCE IMPLEMENTATIONS

**Study These**:
- `src/pages/admin/supply-chain/materials/` - Service layer pattern
- `src/pages/admin/operations/sales/` - Integration with fulfillment
- `src/modules/production/manifest.tsx` - EventBus integration

**EventBus Patterns**:
- `src/lib/events/EventBus.ts` - Core implementation
- `src/modules/materials/manifest.tsx` - Event subscription example

---

## 📊 SUCCESS CRITERIA

### Module Complete When:
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] All 10 criteria met
- [ ] README complete
- [ ] Permissions integrated (page + service)
- [ ] All 3 sub-modes working
- [ ] Database tables verified (5 tables)
- [ ] EventBus integration working
- [ ] Manual testing passed (all workflows)

### Integration Verified:
- [ ] Sales orders flow to fulfillment
- [ ] Production triggers fulfillment.order_ready
- [ ] Dashboard widget shows queue
- [ ] Driver assignment works
- [ ] GPS tracking works

---

## 🔧 COMMANDS

```bash
# Audit
pnpm -s exec eslint src/pages/admin/operations/fulfillment/
pnpm -s exec eslint src/modules/fulfillment/
pnpm -s exec tsc --noEmit

# Development
pnpm dev

# Database
# Verify tables in Supabase dashboard:
# - fulfillment_queue
# - pickup_time_slots
# - delivery_assignments
# - delivery_zones
# - driver_locations
```

---

## ⏱️ TIME TRACKING

- [ ] Audit: 45 min
- [ ] Fix Structure: 1.5 hours
- [ ] Database & Functionality: 2 hours
- [ ] Cross-Module: 1 hour
- [ ] Validation: 45 min

**Total**: 6 hours

---

**Status**: 🟢 READY TO START (after Customers complete)
**Next Phase**: Phase 3 P1 - Supply Chain Modules
