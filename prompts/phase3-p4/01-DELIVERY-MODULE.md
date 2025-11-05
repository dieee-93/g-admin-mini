# 🚚 DELIVERY MODULE - Production Ready

**Module**: Delivery (Active Fulfillment with GPS)
**Phase**: Phase 3 P4 - Module 1/5
**Estimated Time**: 5-6 hours (COMPLEX)
**Priority**: P4 (Advanced - depends on sales + staff)

---

## 📋 OBJECTIVE

Make the **Delivery module** production-ready following the 10-criteria checklist.

**Why this module in P4**: Advanced fulfillment capability with GPS tracking, route optimization, and real-time driver management. Requires sales orders and staff drivers.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/, services/, hooks/, types/ organized
3. ⚠️ **Zero errors**: 0 ESLint + 0 TypeScript errors (need to verify pages/)
4. ✅ **UI complete**: All tabs working (Active, Pending, Completed, Zones, Settings)
5. ⚠️ **Cross-module mapped**: Partial README exists (needs expansion)
6. ✅ **Zero duplication**: Reuses fulfillment core services
7. ⚠️ **DB connected**: Tables exist, need to verify full CRUD
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ⚠️ **Permissions designed**: minimumRole set, need usePermissions integration
10. ⚠️ **README**: Exists but needs production checklist

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/fulfillment/delivery/manifest.tsx` ✅ (456 lines)
- **Page**: `src/pages/admin/operations/fulfillment/delivery/page.tsx` ✅ (243 lines)
- **README**: `src/pages/admin/operations/fulfillment/delivery/README.md` ✅ (233 lines)
- **Database Tables**: `delivery_assignments`, `delivery_zones`, `driver_locations` ✅

### Current Structure
```
src/modules/fulfillment/delivery/
├── manifest.tsx                              # ✅ Complete (456 lines)
├── components/
│   ├── AssignDriverModal.tsx                 # ✅ Driver assignment modal
│   ├── DeliveryQueue.tsx                     # ✅ Wrapper for FulfillmentQueue
│   ├── LiveDeliveryTracker.tsx               # ✅ GPS tracking map
│   ├── ZoneEditorEnhanced.tsx                # ✅ Zone editor with Leaflet
│   ├── ZoneMapEditor.tsx                     # ✅ Leaflet map editor
│   └── index.ts                              # ✅ Barrel export
├── hooks/
│   ├── useDriverLocation.ts                  # ✅ GPS tracking hook
│   └── index.ts                              # ✅ Barrel export
├── services/
│   ├── deliveryService.ts                    # ✅ Core delivery operations
│   ├── routeOptimizationService.ts           # ✅ Driver suggestions
│   └── index.ts                              # ✅ Barrel export
└── types/
    └── index.ts                              # ✅ Type definitions

src/pages/admin/operations/fulfillment/delivery/
├── page.tsx                                  # ✅ Main page with tabs (243 lines)
├── README.md                                 # ⚠️ Needs expansion
├── hooks/
│   ├── useDeliveryPageEnhanced.ts            # ✅ Page orchestration (242 lines)
│   └── index.ts                              # ✅ Barrel export
└── tabs/
    ├── ActiveDeliveriesTab.tsx               # ✅ Active deliveries (122 lines)
    ├── PendingDeliveriesTab.tsx              # ✅ Pending assignments (77 lines)
    ├── CompletedDeliveriesTab.tsx            # ✅ Completed today (91 lines)
    ├── ZonesTab.tsx                          # ✅ Zone management (142 lines)
    └── SettingsTab.tsx                       # ✅ Delivery configuration (244 lines)
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `fulfillment-delivery` (sub-module of fulfillment)
- ✅ minimumRole: Not explicitly set (inherits from fulfillment `OPERADOR`)
- ✅ autoInstall: `false` (requires features)
- ✅ depends: `['fulfillment', 'sales']`

**Required Features**:
- `sales_delivery_orders` - Delivery order sales
- `operations_delivery_zones` - Delivery zone management

**Optional Features**:
- `operations_delivery_tracking` - GPS tracking
- `mobile_location_tracking` - Mobile driver app location
- `sales_payment_processing` - Payment integration
- `operations_deferred_fulfillment` - Scheduled deliveries
- `mobile_notifications` - Customer notifications

**Hooks**:
- **PROVIDES**:
  - `fulfillment.delivery.dispatched` - Delivery dispatched event
  - `fulfillment.delivery.driver_assigned` - Driver assigned event
  - `fulfillment.delivery.in_transit` - Driver started delivery
  - `fulfillment.delivery.completed` - Delivery completed
  - `fulfillment.delivery.toolbar.actions` - Toolbar actions
  - `fulfillment.delivery.zone_selected` - Zone validated
  - `sales.order.actions` - "Assign Driver" button in Sales

- **CONSUMES**:
  - `sales.order_placed` - Listen to new delivery orders
  - `production.order_ready` - Auto-assign driver when ready
  - `fulfillment.order_ready` - General fulfillment ready
  - `staff.driver_location_update` - GPS location updates

**EventBus Patterns** (Implemented):
```typescript
// Emitted by this module
'fulfillment.delivery.queued'                // Order queued with zone validation
'fulfillment.delivery.validation_failed'     // Address validation failed
'fulfillment.delivery.driver_assigned'       // Driver auto-assigned
'fulfillment.delivery.needs_manual_assignment' // No drivers available
'fulfillment.delivery.tracking_enabled'      // GPS tracking ready

// Consumed by this module
'sales.order_placed'                         // Auto-queue delivery orders
'production.order_ready'                     // Auto-assign driver
'staff.driver_location_update'               // Update delivery location
```

### Database Schema

**Tables** (Phase 1 - Complete):

1. **delivery_assignments** (26 columns, 6 indexes, 2 RLS policies)
```sql
- id: uuid (PK)
- order_id: uuid (FK → sales)
- driver_id: uuid (FK → staff)
- zone_id: uuid (FK → delivery_zones)
- delivery_address: text
- delivery_coordinates: jsonb { lat, lng }
- delivery_status: text (pending, assigned, in_transit, delivered, failed)
- assigned_at: timestamptz
- picked_up_at: timestamptz
- delivered_at: timestamptz
- estimated_time_minutes: integer
- actual_time_minutes: integer
- current_location: jsonb { lat, lng }
- last_location_update: timestamptz
- delivery_fee: decimal(10,2)
- delivery_notes: text
- created_at: timestamptz
- updated_at: timestamptz
```

2. **delivery_zones** (15 columns - existing table)
```sql
- id: uuid (PK)
- zone_name: text
- polygon_coordinates: jsonb (GeoJSON polygon)
- delivery_fee_base: decimal(10,2)
- estimated_time_minutes: integer
- is_active: boolean
- max_orders_per_hour: integer
- created_at: timestamptz
- updated_at: timestamptz
```

3. **driver_locations** (11 columns - existing table)
```sql
- id: uuid (PK)
- driver_id: uuid (FK → staff)
- delivery_id: uuid (FK → delivery_assignments)
- lat: numeric
- lng: numeric
- heading: integer (0-359 degrees)
- speed_kmh: numeric
- accuracy_meters: numeric
- timestamp: timestamptz
- battery_level: integer (0-100)
- is_online: boolean
```

---

## 🎯 WORKFLOW (5-6 HOURS)

### 1️⃣ AUDIT (45 min)

**Tasks**:
- [ ] Read `src/modules/fulfillment/delivery/manifest.tsx` ✅ (already done)
- [ ] Read `src/pages/admin/operations/fulfillment/delivery/page.tsx` ✅
- [ ] Check ESLint errors: `pnpm -s exec eslint src/modules/fulfillment/delivery/ src/pages/admin/operations/fulfillment/delivery/`
- [ ] Check TypeScript errors: `pnpm -s exec tsc --noEmit`
- [ ] Review database schema (Supabase tables above)
- [ ] Test all tabs manually (Active, Pending, Completed, Zones, Settings)
- [ ] Verify GPS tracking works (useDriverLocation hook)
- [ ] Test driver assignment modal (AssignDriverModal)
- [ ] Verify zone editor works (ZoneEditorEnhanced with Leaflet Draw)
- [ ] Document current state

**Questions to Answer**:
- How many ESLint/TS errors in delivery files? (Modules: 0, Pages: ?)
- Are all CRUD operations working for delivery assignments?
- Is GPS tracking functional in LiveDeliveryTracker?
- Is zone editor saving polygons correctly?
- Does auto-assignment work (sales.order_placed → driver_assigned)?
- Are there unused components or services?
- Is permission system integrated in page.tsx?

**Current Code Quality**:
- ✅ 0 ESLint errors in `src/modules/fulfillment/delivery/`
- ⚠️ Need to check `src/pages/admin/operations/fulfillment/delivery/`
- ✅ 100% logger usage (no console.log)
- ✅ All imports from `@/shared/ui`
- ✅ EventBus integration complete in manifest
- ⚠️ usePermissions not visible in page.tsx (only checks canRead, canConfigure)

---

### 2️⃣ FIX STRUCTURE (1.5 hours)

**Tasks**:
- [ ] Fix any ESLint errors in page files
- [ ] Fix any TypeScript errors in delivery files
- [ ] Add full permission integration to page.tsx
- [ ] Verify all tabs use proper permission checks
- [ ] Ensure Settings tab persistence (localStorage or DB)
- [ ] Complete TODO items in manifest.tsx (toolbar actions)
- [ ] Remove unused code (if any)
- [ ] Organize imports consistently

**Permission Integration (Page)**:
```typescript
// Update in page.tsx
import { usePermissions } from '@/hooks/usePermissions';

const {
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  canConfigure
} = usePermissions('fulfillment'); // or 'delivery' if separate

// Conditional rendering
{canCreate && <Button>Queue Delivery</Button>}
{canUpdate && <Button onClick={handleAssignDriver}>Assign Driver</Button>}
{canDelete && <Button onClick={handleCancel}>Cancel Delivery</Button>}
{canConfigure && <Tabs.Trigger value="zones">Zonas</Tabs.Trigger>}
{canConfigure && <Tabs.Trigger value="settings">Configuración</Tabs.Trigger>}
```

**Service Layer Permissions** (if creating new service):
```typescript
// Create: src/modules/fulfillment/delivery/services/deliveryApi.ts
import { requirePermission } from '@/lib/permissions';
import type { AuthUser } from '@/contexts/AuthContext';

export const assignDriver = async (assignment: DriverAssignment, user: AuthUser) => {
  requirePermission(user, 'fulfillment', 'update');

  return supabase
    .from('delivery_assignments')
    .update({ driver_id: assignment.driver_id, status: 'assigned' })
    .eq('id', assignment.queue_id);
};

export const cancelDelivery = async (deliveryId: string, user: AuthUser) => {
  requirePermission(user, 'fulfillment', 'delete');

  return supabase
    .from('delivery_assignments')
    .update({ status: 'cancelled' })
    .eq('id', deliveryId);
};
```

**Settings Persistence**:
```typescript
// In SettingsTab.tsx, add save to database or localStorage
const saveSettings = async (settings: DeliverySettings) => {
  // Option 1: Database (recommended)
  await supabase
    .from('delivery_settings')
    .upsert({ location_id: currentLocation, ...settings });

  // Option 2: localStorage (fallback)
  localStorage.setItem('delivery_settings', JSON.stringify(settings));

  toaster.success('Configuración guardada');
};
```

---

### 3️⃣ DATABASE & FUNCTIONALITY (2 hours)

**Tasks**:
- [ ] Verify `deliveryService.ts` has all CRUD operations
- [ ] Test CREATE delivery assignment
- [ ] Test READ delivery queue (with filters: status, zone, driver)
- [ ] Test UPDATE delivery status (pending → assigned → in_progress → delivered)
- [ ] Test DELETE/CANCEL delivery
- [ ] Verify GPS tracking updates `driver_locations` table
- [ ] Test zone validation (validateDeliveryAddress)
- [ ] Test driver assignment (auto + manual)
- [ ] Test route optimization (getSuggestedDrivers)
- [ ] Verify EventBus integration (emit/consume events)
- [ ] Test zone CRUD (create/edit/delete zones)
- [ ] Test settings save/load

**CRUD Operations Checklist**:
- [ ] **Create**: Queue delivery from sales order, validate zone, insert to `delivery_assignments`
- [ ] **Read**: Get delivery queue (filters: status, zone, driver), get delivery details
- [ ] **Update**: Assign driver, update status, update GPS location, mark delivered
- [ ] **Delete**: Cancel delivery (soft delete with status='cancelled')

**GPS Tracking Checklist**:
- [ ] **Start Tracking**: `gpsTrackingService.startTracking(driverId)` works
- [ ] **Location Updates**: Updates `driver_locations` table every 5 seconds
- [ ] **Live Map**: `LiveDeliveryTracker` shows real-time driver positions
- [ ] **Location History**: Can view driver route history
- [ ] **Battery Monitoring**: Tracks battery level

**Zone Management Checklist**:
- [ ] **Create Zone**: Draw polygon on map, set name/fee/time
- [ ] **Edit Zone**: Modify polygon, update settings
- [ ] **Delete Zone**: Remove zone (check for active deliveries first)
- [ ] **Validate Address**: Check if address is in any zone
- [ ] **Calculate Fee**: Zone-based delivery fee calculation

**Auto-Assignment Checklist**:
- [ ] **On Order Placed**: Listens to `sales.order_placed`, validates zone, queues delivery
- [ ] **On Production Ready**: Listens to `production.order_ready`, auto-assigns best driver
- [ ] **Driver Suggestions**: Uses route optimization to find nearest available driver
- [ ] **Manual Assignment**: Fallback modal if auto-assignment fails

---

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)

**Tasks**:
- [ ] Expand `src/pages/admin/operations/fulfillment/delivery/README.md`
- [ ] Document all provided hooks and EventBus events
- [ ] Document all consumed hooks and dependencies
- [ ] Document database schema with RLS policies
- [ ] Document permission requirements
- [ ] Test integration with Sales module (order placement)
- [ ] Test integration with Production module (order ready)
- [ ] Test integration with Staff module (driver availability)
- [ ] Register "Assign Driver" button in Sales order actions
- [ ] Test GPS location updates flow

**README Expansion Template**:
```markdown
# Delivery Sub-Module (Fulfillment)

Advanced delivery order management with GPS tracking and route optimization.

## Production Status
- [x] 0 ESLint errors
- [x] 0 TypeScript errors
- [x] All CRUD operations working
- [x] GPS tracking functional
- [x] Zone management complete
- [x] Auto-assignment working
- [x] EventBus integration complete
- [x] Permissions integrated

## Database Tables
- `delivery_assignments` (26 columns, 6 indexes, 2 RLS)
- `delivery_zones` (15 columns, existing)
- `driver_locations` (11 columns, existing)

## Features
- Delivery zone management (polygon editor with Leaflet)
- Driver assignment (auto + manual)
- GPS tracking (real-time map)
- Route optimization (nearest driver suggestions)
- Delivery status tracking (pending → assigned → in_transit → delivered)
- Zone validation for delivery addresses
- Delivery metrics (avg time, on-time rate)

## Required Features
- `sales_delivery_orders` - Enable delivery order sales
- `operations_delivery_zones` - Enable zone management

## Optional Features
- `operations_delivery_tracking` - GPS tracking
- `mobile_location_tracking` - Mobile GPS updates
- `sales_payment_processing` - Payment integration
- `operations_deferred_fulfillment` - Scheduled deliveries

## Provides
- `fulfillment.delivery.dispatched`
- `fulfillment.delivery.driver_assigned`
- `fulfillment.delivery.in_transit`
- `fulfillment.delivery.completed`
- `fulfillment.delivery.toolbar.actions`
- `fulfillment.delivery.zone_selected`
- `sales.order.actions` - "Assign Driver" button

## Consumes
- `sales.order_placed` - Auto-queue delivery orders
- `production.order_ready` - Auto-assign driver
- `fulfillment.order_ready` - General fulfillment ready
- `staff.driver_location_update` - GPS updates

## Permissions
- minimumRole: `OPERADOR` (inherits from fulfillment)
- read: View delivery queue and maps
- update: Assign drivers, update status
- delete: Cancel deliveries
- configure: Manage zones and settings

## Service Layer
\`src/modules/fulfillment/delivery/services/deliveryService.ts\`

All operations include validation and emit EventBus events.

## Dependencies
- Fulfillment (parent module)
- Sales (order integration)
- Staff (driver management)
- Leaflet + Leaflet Draw (zone editor)

## Performance
- GPS updates: Every 5 seconds
- Route optimization: O(n²) nearest neighbor
- Zone validation: PostGIS point-in-polygon
- Real-time map: Leaflet with marker clustering

## Testing
Manual testing workflow:
1. Create delivery zone (draw polygon)
2. Place delivery order in Sales
3. Verify auto-queue with zone validation
4. Verify auto-assignment when production ready
5. Start GPS tracking
6. View live map in ActiveDeliveriesTab
7. Mark waypoint visited
8. Complete delivery
9. View in CompletedDeliveriesTab

## Known Issues
- [ ] Settings persistence not implemented (TODO)
- [ ] Toolbar actions placeholder (TODO in manifest)
- [ ] Battery level tracking optional
```

**EventBus Integration Verification**:
```typescript
// Test event flow manually:
// 1. Sales order placed with fulfillment_method='delivery'
//    → 'sales.order_placed' emitted
//    → Delivery manifest listens, validates zone, queues delivery
//    → 'fulfillment.delivery.queued' emitted

// 2. Production marks order ready
//    → 'production.order_ready' emitted
//    → Delivery manifest listens, auto-assigns driver
//    → 'fulfillment.delivery.driver_assigned' emitted

// 3. Driver updates GPS location (mobile app)
//    → 'staff.driver_location_update' emitted
//    → Delivery manifest listens, updates current_location
//    → LiveDeliveryTracker updates map

// 4. Driver marks delivered
//    → 'fulfillment.delivery.completed' emitted
//    → Other modules can listen (e.g., billing, analytics)
```

---

### 5️⃣ VALIDATION (45 min)

**Production-Ready Checklist**:
- [ ] ✅ Architecture compliant (Sub-module of Fulfillment)
- [ ] ✅ Scaffolding ordered (components/, services/, hooks/, types/)
- [ ] ⚠️ Zero ESLint errors (modules ✅, pages ?)
- [ ] ⚠️ Zero TypeScript errors (need to verify)
- [ ] ⚠️ Cross-module mapped (README needs expansion)
- [ ] ✅ Zero duplication (reuses fulfillment core)
- [ ] ⚠️ DB connected (tables exist, verify full CRUD)
- [ ] ✅ Features mapped (required + optional features)
- [ ] ⚠️ Permissions designed (need full usePermissions integration)
- [ ] ⚠️ README complete (needs production checklist)

**Manual Testing Workflow**:
1. [ ] Create delivery zone (Zones tab → draw polygon)
2. [ ] Place delivery order in Sales module
3. [ ] Verify delivery auto-queued (Pending tab)
4. [ ] Verify zone validation (address in polygon)
5. [ ] Manual assign driver (AssignDriverModal)
6. [ ] Verify driver suggestions (route optimization)
7. [ ] Start GPS tracking (mock or real)
8. [ ] View live map (Active tab)
9. [ ] Update delivery status (in_transit → delivered)
10. [ ] View completed delivery (Completed tab)
11. [ ] Test with different roles (OPERADOR, SUPERVISOR)
12. [ ] Test zone editor (create/edit/delete)
13. [ ] Test settings save/load
14. [ ] Verify EventBus events (check console logs)

**Final Validation**:
```bash
# Lint
pnpm -s exec eslint src/modules/fulfillment/delivery/
pnpm -s exec eslint src/pages/admin/operations/fulfillment/delivery/

# Type check
pnpm -s exec tsc --noEmit

# Test (if tests exist)
pnpm test:run delivery
```

Expected output: **0 errors**

---

## 🚨 CRITICAL PATTERNS

### ✅ DO
- Import from `@/shared/ui` (Stack, Button, Text, etc.)
- Use `usePermissions('fulfillment')` for UI access control
- Use `requirePermission()` in service layer (if creating new service)
- Reuse `fulfillmentService` from parent module where possible
- Emit EventBus events for status changes
- Validate delivery address before queueing
- Handle GPS tracking errors gracefully
- Use Leaflet Draw for zone polygon editing
- Store GPS location history in `driver_locations`
- Handle offline GPS tracking (queue updates)

### ❌ DON'T
- Import directly from `@chakra-ui/react`
- Hardcode delivery data (use Supabase)
- Skip zone validation (always check address is in zone)
- Create duplicate route optimization logic (reuse routeOptimizationService)
- Skip permission checks in page actions
- Forget to emit EventBus events
- Allow delivery assignment without available driver check
- Delete zones with active deliveries (soft delete or validate first)
- Skip GPS tracking errors (log and fallback)
- Use `console.log` (use logger)

---

## 📚 REFERENCE IMPLEMENTATIONS

**Study These**:
- `src/modules/fulfillment/delivery/manifest.tsx` - EventBus integration pattern
- `src/modules/fulfillment/delivery/services/deliveryService.ts` - Service layer
- `src/modules/fulfillment/delivery/services/routeOptimizationService.ts` - Route optimization
- `src/modules/fulfillment/delivery/hooks/useDriverLocation.ts` - GPS tracking hook
- `src/pages/admin/operations/fulfillment/delivery/hooks/useDeliveryPageEnhanced.ts` - Page orchestration
- `src/pages/admin/supply-chain/materials/` - CRUD pattern reference
- `src/hooks/usePermissions.ts` - Permission hook usage

**External Dependencies**:
```json
{
  "leaflet": "^1.9.4",
  "leaflet-draw": "^1.0.4",
  "react-leaflet": "^5.0.0",
  "@types/leaflet": "^1.9.21",
  "@types/leaflet-draw": "^1.0.13"
}
```

---

## 📊 SUCCESS CRITERIA

### Module Complete When:
- [ ] 0 ESLint errors in delivery files
- [ ] 0 TypeScript errors in delivery files
- [ ] All 10 production-ready criteria met
- [ ] README.md expanded with production checklist
- [ ] Permissions integrated (page + service layer)
- [ ] All CRUD operations working
- [ ] GPS tracking functional
- [ ] Zone editor working (polygon drawing)
- [ ] Auto-assignment working
- [ ] Manual testing passed (14 workflows)
- [ ] Settings persistence implemented

### Integration Verified:
- [ ] Sales module triggers delivery queue
- [ ] Production module triggers driver assignment
- [ ] Staff module provides driver locations
- [ ] EventBus events flowing correctly
- [ ] "Assign Driver" button appears in Sales orders
- [ ] Live map shows driver locations in real-time

---

## 🔧 COMMANDS

```bash
# Audit
pnpm -s exec eslint src/modules/fulfillment/delivery/
pnpm -s exec eslint src/pages/admin/operations/fulfillment/delivery/
pnpm -s exec tsc --noEmit

# Development
pnpm dev  # If not already running

# Database (Supabase Dashboard)
# Check tables: delivery_assignments, delivery_zones, driver_locations
# Verify RLS policies are enabled

# Testing (if tests exist)
pnpm test:run delivery
```

---

## ⏱️ TIME TRACKING

- [ ] Audit: 45 min
- [ ] Fix Structure: 1.5 hours
- [ ] Database & Functionality: 2 hours
- [ ] Cross-Module: 1 hour
- [ ] Validation: 45 min

**Total**: 5.75 hours (~6 hours)

---

## 🔄 DEPENDENCIES

**Requires** (must be complete):
- ✅ Sales module (order placement)
- ✅ Staff module (driver management)
- ✅ Fulfillment core (queue operations)

**Enables** (unlock after complete):
- Mobile module (reuses GPS tracking)

---

**Status**: 🟡 IN PROGRESS (80% complete, needs validation)
**Next Module**: Memberships (after Delivery validated)
