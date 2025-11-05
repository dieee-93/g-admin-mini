# ARCHITECTURE REDESIGN - PHASE 2: CAPABILITY DESIGNS

**Date**: 2025-01-24 (Session 4)
**Status**: ✅ Phase 2 COMPLETE
**Progress**: 9/9 capabilities designed (100%)
**Token Usage**: ~109k/200k (54.5%)

---

## 🎯 OBJETIVO

Diseñar la estructura IDEAL de módulos para cada una de las 9 capabilities del sistema, siguiendo el template establecido en ARCHITECTURE_REDESIGN_PROMPT.md.

**Template aplicado**:
- Business Flow Analysis
- Feature Requirements Evaluation
- Proposed Module Structure (Options A/B/C)
- Recommendation with Rationale
- Modules Needed
- Cross-Module Integration Points
- UI/UX Flow
- Questions & Decisions

---

# CAPABILITY 1: onsite_service

**Type**: fulfillment
**Icon**: 🏪
**Features**: 20

---

## Business Flow Analysis

**User Journey** (Restaurant/Café Scenario):

1. **Customer Arrival**: Customer arrives at location
2. **Host/Greeter**: Host checks availability and assigns table
3. **Seating**: Customer is seated at assigned table/booth
4. **Menu Browsing**: Customer reviews menu (physical or tablet)
5. **Order Taking**: Waiter takes order at table
6. **Kitchen Routing**: Order is sent to kitchen display system
7. **Preparation**: Kitchen staff prepares order following recipes
8. **Quality Check**: Order is reviewed before serving
9. **Service**: Waiter delivers order to table
10. **Additional Orders**: Customer may order more items (drinks, desserts)
11. **Bill Request**: Customer requests the bill
12. **Payment Processing**: Cashier/waiter processes payment (split payments, tips, coupons)
13. **Table Cleanup**: Table is cleared and prepared for next customer

**Pain Points in Current Structure**:

1. **Scattered Fulfillment Logic**:
   - Floor management (Floor module) is separate from Sales
   - Table assignment disconnected from order flow
   - Waitlist management is orphaned
   - **Impact**: Poor UX, duplicate state management

2. **Kitchen Display Separation**:
   - Kitchen module is separate link module
   - Kitchen Display System (KDS) requires manual integration
   - No unified order → production → serving flow
   - **Impact**: Complex setup, fragile integration

3. **Split Sales Experience**:
   - POS, order management, and fulfillment are separate
   - No single "Point of Sale" experience
   - Table status scattered across modules
   - **Impact**: Cognitive load for users, training difficulty

4. **Generic Terminology Issues**:
   - "Floor" is restaurant-specific (should be "Service Points")
   - "Kitchen" is gastronomy-specific (should be "Production")
   - **Impact**: Limits multi-industry support

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 20 features:**

### SALES Domain (8 features)
- `sales_order_management` ✅ **KEEP** - Core order functionality
- `sales_payment_processing` ✅ **KEEP** - Core payment functionality
- `sales_catalog_menu` ✅ **KEEP** - Product/service catalog
- `sales_pos_onsite` ✅ **KEEP** - Point of sale interface
- `sales_dine_in_orders` ✅ **KEEP** - Onsite-specific orders
- `sales_split_payment` ✅ **KEEP** - Multiple payment methods
- `sales_tip_management` ✅ **KEEP** - Tip handling (gastronomy)
- `sales_coupon_management` ✅ **KEEP** - Discount/coupon system

**Analysis**: All SALES features are essential for onsite service.

### OPERATIONS Domain (4 features)
- `operations_table_management` ❓ **QUESTION** - Should be in Fulfillment, not separate Operations module
- `operations_table_assignment` ❓ **QUESTION** - Part of table management, should consolidate
- `operations_floor_plan_config` ❓ **QUESTION** - Configuration belongs with table management
- `operations_waitlist_management` ❓ **QUESTION** - Related to table management

**Analysis**: These are "last mile" fulfillment concerns specific to onsite service. They belong together but are currently scattered.

### INVENTORY Domain (4 features)
- `inventory_stock_tracking` ✅ **KEEP** - Essential for product availability
- `inventory_supplier_management` ✅ **KEEP** - Supply chain management
- `inventory_alert_system` ✅ **KEEP** - Low stock warnings
- `inventory_low_stock_auto_reorder` ✅ **KEEP** - Automated replenishment

**Analysis**: All INVENTORY features are essential and should remain in Materials module.

### STAFF Domain (4 features)
- `staff_employee_management` ✅ **KEEP** - Staff administration
- `staff_shift_management` ✅ **KEEP** - Scheduling waiters/kitchen staff
- `staff_time_tracking` ✅ **KEEP** - Attendance and hours
- `staff_performance_tracking` ✅ **KEEP** - Performance metrics (tips, orders served)

**Analysis**: All STAFF features are essential and should remain in Staff module.

---

## Proposed Module Structure (IDEAL)

### Option A: Unified "Fulfillment" Module (Recommended)

```
Module: Fulfillment
├─ Purpose: Unified order fulfillment (onsite, pickup, delivery)
├─ Route: /admin/operations/fulfillment
│
├─ Submodules:
│  ├─ /core (shared 71% across fulfillment types)
│  │  ├─ OrderManagement.tsx (order creation, modification)
│  │  ├─ PaymentProcessing.tsx (payment handling)
│  │  ├─ FulfillmentQueue.tsx (order status tracking)
│  │  └─ NotificationService.tsx (customer notifications)
│  │
│  ├─ /onsite (specific to onsite_service)
│  │  ├─ TableManagement.tsx (MOVED from Floor module)
│  │  ├─ FloorPlan.tsx (MOVED from Floor module)
│  │  ├─ TableAssignment.tsx (assign tables to customers)
│  │  ├─ Waitlist.tsx (queue management)
│  │  └─ DineInFlow.tsx (onsite-specific order flow)
│  │
│  ├─ /pickup (for pickup_orders capability)
│  │  ├─ PickupScheduler.tsx
│  │  ├─ PickupQueue.tsx
│  │  └─ ReadyNotifications.tsx
│  │
│  └─ /delivery (for delivery_shipping capability)
│     ├─ DeliveryZones.tsx
│     ├─ DeliveryTracking.tsx
│     └─ DriverAssignment.tsx
│
├─ Features Activated:
│  ├─ Onsite: sales_dine_in_orders, operations_table_management, etc.
│  ├─ Pickup: sales_pickup_orders, operations_pickup_scheduling
│  └─ Delivery: sales_delivery_orders, operations_delivery_tracking
│
├─ Dependencies:
│  ├─ Materials (stock validation)
│  ├─ Production (kitchen orders) [if requires_preparation active]
│  ├─ Staff (waiters, delivery drivers)
│  └─ Customers (customer data, loyalty)
│
└─ Rationale:
   - 71% feature overlap between onsite/pickup/delivery justifies consolidation
   - Single source of truth for fulfillment status
   - Easier to add new fulfillment types (curbside, locker pickup, etc.)
   - Better UX: unified fulfillment experience
   - Reduces module count (delete Floor, merge scattered logic)
```

**Pros**:
- ✅ DRY principle (shared code for common fulfillment logic)
- ✅ Single fulfillment queue across all types
- ✅ Easier to add new fulfillment methods
- ✅ Reduces module count (21 from 27)
- ✅ Unified customer experience

**Cons**:
- ❌ Larger module (more complex)
- ❌ Migration effort (move Floor module content)
- ❌ May confuse users familiar with separate Floor module

---

### Option B: Separate Specialized Modules (Sales + Floor + Delivery)

```
Module: Sales
├─ Purpose: Order management and payment processing
├─ Features: sales_order_management, sales_payment_processing, sales_catalog_menu
├─ Dependencies: materials, customers, staff
└─ Rationale: Keep Sales focused on core commerce

Module: Floor (onsite)
├─ Purpose: Table management and floor operations
├─ Features: operations_table_management, operations_floor_plan_config
├─ Dependencies: sales, staff
└─ Rationale: Separation of concerns for different user roles

Module: Delivery (delivery)
├─ Purpose: Delivery operations
├─ Features: operations_delivery_tracking, operations_delivery_zones
├─ Dependencies: sales, staff
└─ Rationale: Delivery is complex enough to warrant separate module

(No Pickup module - pickup logic stays in Sales)
```

**Pros**:
- ✅ Smaller, focused modules
- ✅ Separation of concerns by user role (waiter vs host vs driver)
- ✅ Less migration effort (keep current structure mostly intact)

**Cons**:
- ❌ Duplicate fulfillment logic across modules (71% overlap ignored)
- ❌ More modules to maintain (27 modules unchanged)
- ❌ Harder to add new fulfillment types
- ❌ No single fulfillment queue
- ❌ Scattered state management

---

### Option C: "Point of Sale" Mega-Module (POS)

```
Module: POS (Point of Sale)
├─ Purpose: Complete onsite sales experience (order → payment → fulfillment)
├─ Route: /admin/operations/pos
│
├─ Submodules:
│  ├─ /sales (orders, payments)
│  ├─ /floor (tables, floor plan)
│  ├─ /kitchen (kitchen display) [if requires_preparation active]
│  └─ /checkout (payment processing)
│
├─ Features: ALL onsite_service features (20)
├─ Dependencies: materials, staff, customers, production
└─ Rationale: Single unified experience for restaurant/retail POS
```

**Pros**:
- ✅ Single cohesive experience for onsite service
- ✅ Natural mental model for restaurant owners ("this is my POS system")
- ✅ All onsite logic in one place

**Cons**:
- ❌ HUGE module (too large to maintain)
- ❌ Onsite-specific (doesn't help pickup/delivery)
- ❌ Kitchen Display System belongs in Production, not POS
- ❌ Limits extensibility (what about pickup/delivery?)
- ❌ Couples concerns that should be separate

---

## Recommendation: **Option A (Unified Fulfillment Module)**

**Rationale**:

### 1. Business Value
- **DRY Principle**: 71% feature overlap between onsite/pickup/delivery → consolidation justified
- **Scalability**: Easy to add new fulfillment types (curbside pickup, locker pickup, drone delivery)
- **Single Queue**: Unified fulfillment queue improves operational efficiency
- **Better Metrics**: Consolidated fulfillment analytics across all types

### 2. User Experience
- **Unified Interface**: Single location to manage all fulfillment methods
- **Consistent UX**: Same patterns for onsite/pickup/delivery (only "last mile" differs)
- **Reduced Training**: Learn one module instead of three
- **Contextual UI**: Show onsite/pickup/delivery sections conditionally based on active capabilities

### 3. Technical Complexity
- **Lower Maintenance**: Shared code reduces bugs and inconsistencies
- **Cleaner Architecture**: Clear module boundaries (Fulfillment vs Sales vs Production)
- **Migration**: One-time effort to move Floor module → Fulfillment/onsite (2-3 days)
- **Module Reduction**: 27 → 21 modules (22% simpler)

### 4. Multi-Industry Support
- **Generic**: "Fulfillment" is universal (vs "Floor" which is restaurant-specific)
- **Extensible**: Works for retail, salon, workshop, etc.
- **Terminology**: "Service Points" instead of "Tables" (configurable)

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Fulfillment (NEW)
- **Purpose**: Unified order fulfillment (onsite, pickup, delivery)
- **Features Activated**:
  - Onsite: `sales_dine_in_orders`, `operations_table_management`, `operations_table_assignment`, `operations_floor_plan_config`, `operations_waitlist_management`
  - Shared: `operations_notification_system`
- **Dependencies**:
  - Materials (stock validation: `inventory_stock_tracking`)
  - Production (kitchen orders: `production_kitchen_display`) [if requires_preparation active]
  - Staff (waiters, hosts: `staff_employee_management`, `staff_shift_management`)
  - Customers (customer data: loyalty, preferences)
- **Routes**:
  - `/admin/operations/fulfillment` (main)
  - `/admin/operations/fulfillment/onsite` (tables, floor plan)
  - `/admin/operations/fulfillment/queue` (unified queue)

#### 2. Sales (ENHANCED)
- **Purpose**: Order creation, payment processing, catalog management
- **Features Activated**:
  - `sales_order_management`
  - `sales_payment_processing`
  - `sales_catalog_menu`
  - `sales_pos_onsite`
  - `sales_split_payment`
  - `sales_tip_management`
  - `sales_coupon_management`
- **Dependencies**:
  - Fulfillment (send orders for fulfillment)
  - Materials (stock validation)
  - Customers (customer data)
  - Fiscal (tax calculation, invoicing)
- **Routes**:
  - `/admin/operations/sales` (main)
  - `/admin/operations/sales/pos` (point of sale interface)

#### 3. Materials (KEEP AS IS)
- **Purpose**: Inventory management, stock tracking, suppliers
- **Features Activated**:
  - `inventory_stock_tracking`
  - `inventory_supplier_management`
  - `inventory_alert_system`
  - `inventory_low_stock_auto_reorder`
- **Dependencies**: Suppliers, Supplier-Orders
- **Routes**: `/admin/supply-chain/materials`

#### 4. Production (RENAMED from Kitchen)
- **Purpose**: Order preparation, queue management, recipe management
- **Features Activated** [only if requires_preparation capability active]:
  - `production_kitchen_display`
  - `production_order_queue`
  - `production_recipe_management`
  - `production_capacity_planning`
- **Dependencies**: Materials (ingredients), Sales (orders)
- **Routes**: `/admin/operations/production`

### Supporting Modules

- **Staff**: Employee management, shifts, time tracking
- **Customers**: CRM, loyalty program, preferences
- **Fiscal**: Tax calculation, invoicing, AFIP integration (Argentina)
- **Finance-Integrations**: Payment gateways (Mercado Pago, MODO)
- **Dashboard**: Widgets for sales metrics, table occupancy, kitchen queue

---

## Cross-Module Integration Points

### Fulfillment Module PROVIDES:

**Hooks**:
- `fulfillment.toolbar.actions`
  - **Description**: Add custom actions to fulfillment toolbar
  - **Consumers**: Dashboard (quick actions), Reporting (export queue)
  - **Example**: Add "Export Queue" button

- `fulfillment.onsite.tableRow.actions`
  - **Description**: Add actions to each table row (e.g., "View Orders", "Assign Waiter")
  - **Consumers**: Staff (assign waiter), Sales (view orders)
  - **Example**: Add "Assign to Me" button for waiters

**Events**:
- `fulfillment.table_assigned`
  - **Payload**: `{ tableId, customerId, waiterId, timestamp }`
  - **Listeners**: Staff (track waiter assignments), Dashboard (update table status widget)

- `fulfillment.order_ready_for_service`
  - **Payload**: `{ orderId, tableId, items[] }`
  - **Listeners**: Production (mark as served), Fulfillment (notify waiter)

**Widgets**:
- `dashboard.fulfillment-queue`
  - **Location**: Dashboard main grid
  - **Purpose**: Show real-time fulfillment queue (orders being prepared/ready)
  - **Data**: Active orders by status (pending, preparing, ready, served)

- `dashboard.table-occupancy`
  - **Location**: Dashboard main grid (only if onsite_service active)
  - **Purpose**: Show table status (occupied, available, reserved)
  - **Data**: Table count by status, estimated turnover time

### Fulfillment Module CONSUMES:

**Hooks**:
- `materials.stock-check`
  - **Provider**: Materials module
  - **Usage**: Validate stock before accepting order
  - **Example**: Check if ingredients are available for menu item

- `production.order-status`
  - **Provider**: Production module [if requires_preparation active]
  - **Usage**: Display production status in fulfillment queue
  - **Example**: Show "In Kitchen" status for orders

**Stores** (Zustand):
- `materialsStore.inventory`
  - **From**: Materials module
  - **Usage**: Real-time stock levels for menu availability

- `staffStore.employees`
  - **From**: Staff module
  - **Usage**: Assign waiters to tables, track performance

**Events**:
- `sales.order_placed`
  - **Provider**: Sales module
  - **Usage**: Receive new orders for fulfillment
  - **Payload**: `{ orderId, type: 'dine_in', items[], tableId }`

- `production.order_completed`
  - **Provider**: Production module [if requires_preparation active]
  - **Usage**: Notify that order is ready for service
  - **Payload**: `{ orderId, items[], completedAt }`

---

## UI/UX Flow

### Main Pages

#### 1. `/admin/operations/fulfillment` (Main Fulfillment Hub)
- **Components**:
  - `<FulfillmentTabs />` (Onsite | Pickup | Delivery) - Conditional based on active capabilities
  - `<FulfillmentQueue />` (unified queue across all types)
  - `<FulfillmentMetrics />` (orders today, avg fulfillment time, etc.)

- **Conditional Rendering**:
  - Show "Onsite" tab if `onsite_service` capability active
  - Show "Pickup" tab if `pickup_orders` capability active
  - Show "Delivery" tab if `delivery_shipping` capability active

#### 2. `/admin/operations/fulfillment/onsite` (Table Management)
- **Components**:
  - `<FloorPlan />` (visual floor layout) - MOVED from Floor module
  - `<TableGrid />` (list view of all tables)
  - `<TableStatusIndicator />` (available/occupied/reserved)
  - `<WaitlistPanel />` (queue of customers waiting)
  - `<TableAssignmentModal />` (assign table to customer + waiter)

- **Conditional Rendering**:
  - Only show if `onsite_service` capability active
  - Show floor plan config if `operations_floor_plan_config` feature active

#### 3. `/admin/operations/sales/pos` (Point of Sale Interface)
- **Components**:
  - `<POSInterface />` (main sales interface)
  - `<MenuCatalog />` (product/service selection)
  - `<OrderBuilder />` (build current order)
  - `<TableSelector />` (select table for dine-in orders) - Conditional
  - `<PaymentProcessor />` (handle payments, split payments, tips)

- **Conditional Rendering**:
  - Show `<TableSelector />` only if `onsite_service` capability active
  - Show `<TipInput />` only if `sales_tip_management` feature active
  - Show `<CouponInput />` only if `sales_coupon_management` feature active

#### 4. `/admin/operations/production` (Kitchen Display System)
- **Components**:
  - `<KitchenDisplay />` (order queue for kitchen)
  - `<OrderCard />` (individual order with items, table, time)
  - `<ProductionQueue />` (pending → preparing → ready)

- **Conditional Rendering**:
  - Only show if `requires_preparation` capability active
  - Module-level conditional (link module activated by Sales + Materials)

### Dashboard Widgets

1. **Sales Metrics Widget**
   - **Data**: Revenue today, orders count, avg order value
   - **Location**: Dashboard main grid (always active)

2. **Table Occupancy Widget**
   - **Data**: Occupied/Available/Reserved count, turnover time
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `onsite_service` capability active

3. **Kitchen Queue Widget**
   - **Data**: Orders in queue, avg preparation time, delayed orders
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `requires_preparation` capability active

4. **Fulfillment Queue Widget**
   - **Data**: Active orders by status (pending/ready/served), avg fulfillment time
   - **Location**: Dashboard main grid (always active if any fulfillment capability)

---

## Questions & Decisions

### Q1: Should Floor management be part of Fulfillment or remain a separate module?

**Options**:
- **Option A (Recommended)**: Merge Floor → Fulfillment/onsite
  - **Pros**: Unified fulfillment experience, reduces module count, 71% overlap
  - **Cons**: Migration effort, larger Fulfillment module

- **Option B**: Keep Floor as separate module
  - **Pros**: Separation of concerns, less migration effort
  - **Cons**: Scattered fulfillment logic, duplicate state, no unified queue

**Decision**: **Option A - Merge into Fulfillment**

**Rationale**:
- Floor management is onsite-specific "last mile" fulfillment
- Table = onsite equivalent of pickup slot or delivery address
- 71% feature overlap justifies consolidation
- Better UX: single fulfillment hub for all types
- Multi-industry: "Service Points" instead of "Tables" (generic)

---

### Q2: Should Kitchen Display System (KDS) be part of Fulfillment, Production, or separate?

**Options**:
- **Option A**: KDS in Production module (Recommended)
  - **Pros**: Production is responsible for order preparation
  - **Cons**: None (clean separation of concerns)

- **Option B**: KDS in Fulfillment module
  - **Pros**: Closer to fulfillment flow
  - **Cons**: Couples production logic with fulfillment, not DRY

- **Option C**: KDS as separate link module (current)
  - **Pros**: Pluggable architecture
  - **Cons**: Complex setup, fragile integration, more modules

**Decision**: **Option A - KDS in Production Module**

**Rationale**:
- Production module is responsible for order preparation
- KDS is production concern, not fulfillment concern
- Fulfillment should only care about "order received → order ready" (not "how it was prepared")
- Cleaner separation: Sales → Fulfillment → Production
- Rename Kitchen → Production for generic terminology

---

### Q3: Should Sales and Fulfillment be merged into single POS module?

**Options**:
- **Option A**: Keep Sales and Fulfillment separate (Recommended)
  - **Pros**: Clear separation (commerce vs logistics), extensible
  - **Cons**: Two modules instead of one

- **Option B**: Merge into POS module
  - **Pros**: Single module for onsite experience
  - **Cons**: Huge module, onsite-specific, doesn't help pickup/delivery

**Decision**: **Option A - Keep Separate**

**Rationale**:
- Sales = Commerce concerns (order creation, payment)
- Fulfillment = Logistics concerns (order fulfillment, delivery)
- Separation allows pickup/delivery to use same Sales module
- POS module would be onsite-specific (violates DRY)
- Better scalability: easy to add new sales channels (B2B, e-commerce)

---

### Q4: How to handle generic terminology for multi-industry support?

**Current**: Table, Floor, Kitchen (restaurant-specific)

**Proposed**:
- **Table → Service Point** (configurable label)
- **Floor Plan → Service Area Layout**
- **Kitchen → Production Area**
- **Waiter → Service Staff** (configurable role)

**Decision**: **Use generic terms with configurable labels**

**Implementation**:
- Store industry-specific labels in Business Profile settings
- Default to generic terms ("Service Point")
- Allow customization ("Table" for restaurant, "Cabin" for spa, "Bay" for car wash)
- UI uses `t('servicePoint')` translation key

**Example**:
```typescript
// Business Profile settings
{
  industryType: 'restaurant',
  terminology: {
    servicePoint: 'Mesa',
    serviceArea: 'Plano del Restaurante',
    productionArea: 'Cocina',
    serviceStaff: 'Mesero'
  }
}
```

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/fulfillment/manifest.tsx` (NEW module)
2. `src/modules/fulfillment/core/OrderManagement.tsx`
3. `src/modules/fulfillment/onsite/TableManagement.tsx` (MOVED from Floor)
4. `src/modules/fulfillment/onsite/FloorPlan.tsx` (MOVED from Floor)

### Files to Modify
1. `src/config/routeMap.ts` (add Fulfillment routes)
2. `src/modules/index.ts` (register Fulfillment module, remove Floor)
3. `src/modules/sales/manifest.tsx` (remove onsite fulfillment logic)

### Files to Delete
1. `src/modules/floor/` (entire module) → Content moved to Fulfillment/onsite

### Breaking Changes
- Floor module routes change: `/admin/operations/floor` → `/admin/operations/fulfillment/onsite`
- Bookmarks/saved links will break (provide redirect)
- User training required (new location for table management)

### Testing Required
- [ ] Table assignment flow (assign table → take order → serve → payment → cleanup)
- [ ] Waitlist management (add to waitlist → table available → assign table)
- [ ] Floor plan configuration (create/edit layout, add/remove tables)
- [ ] Cross-module integration (Sales → Fulfillment → Production)
- [ ] Permission checks (waiter can assign tables, host can manage floor)

---

## Implementation Estimate

**Time**: 5-7 days

| Task | Duration | Effort |
|------|----------|--------|
| Create Fulfillment module skeleton | 0.5 day | Low |
| Migrate Floor → Fulfillment/onsite | 2 days | High |
| Create shared fulfillment core | 1 day | Medium |
| Update Sales integration | 1 day | Medium |
| Update Production integration | 0.5 day | Low |
| Update routing and navigation | 0.5 day | Low |
| Testing (unit + integration + e2e) | 1-2 days | High |

**Risk**: Medium (migration effort, breaking changes)

---

**END OF CAPABILITY 1: onsite_service**

---

# CAPABILITY 2: pickup_orders

**Type**: fulfillment
**Icon**: 🏪
**Features**: 13

---

## Business Flow Analysis

**User Journey** (Coffee Shop/Bakery Scenario):

1. **Order Placement**: Customer places order (phone, website, app, or in-person)
2. **Order Confirmation**: System confirms order and provides pickup time slot
3. **Payment Processing**: Customer pays online or selects "pay on pickup"
4. **Order Routing**: Order sent to production queue (if requires_preparation active)
5. **Preparation**: Staff prepares order following recipe/instructions
6. **Quality Check**: Order verified for completeness and quality
7. **Packaging**: Order is packaged for pickup (bag, box, labels)
8. **Ready Notification**: Customer receives SMS/push notification "Order ready for pickup"
9. **Pickup Arrival**: Customer arrives at location during time slot
10. **Order Retrieval**: Staff locates order (by name, order #, or QR code)
11. **Handoff**: Staff hands order to customer, verifies identity
12. **Payment Completion**: If not pre-paid, process payment now
13. **Completion**: Mark order as picked up, update metrics

**Pain Points in Current Structure**:

1. **No Unified Pickup Flow**:
   - Pickup logic scattered between Sales and Operations modules
   - No dedicated pickup queue (mixed with onsite orders)
   - Time slot scheduling is ad-hoc (no formal pickup scheduling system)
   - **Impact**: Confusing UX, duplicate orders, missed pickups

2. **Notification System Fragmented**:
   - No centralized notification management
   - Ready notifications inconsistent across fulfillment types
   - SMS/email/push not unified
   - **Impact**: Customers don't know when to pick up

3. **71% Feature Overlap with Onsite/Delivery**:
   - Same core fulfillment logic (order → prepare → ready)
   - Only difference is "last mile" (pickup slot vs table vs delivery address)
   - Duplicate code across modules
   - **Impact**: Maintenance burden, inconsistent behavior

4. **No Pickup-Specific Features**:
   - No "pickup window" management (e.g., "pickup between 2-3pm")
   - No "pickup area" designation (curbside, counter, locker)
   - No QR code scanning for quick retrieval
   - **Impact**: Operational inefficiency

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 13 features:**

### SALES Domain (7 features)
- `sales_order_management` ✅ **KEEP** - Core order functionality (SHARED with onsite)
- `sales_payment_processing` ✅ **KEEP** - Core payment functionality (SHARED with onsite)
- `sales_catalog_menu` ✅ **KEEP** - Product/service catalog (SHARED with onsite)
- `sales_pickup_orders` ✅ **KEEP** - Pickup-specific order type
- `sales_split_payment` ✅ **KEEP** - Multiple payment methods (SHARED with onsite)
- `sales_coupon_management` ✅ **KEEP** - Discount/coupon system (SHARED with onsite)

**Analysis**: 6/7 SALES features are shared with onsite_service (86% overlap)

### OPERATIONS Domain (2 features)
- `operations_pickup_scheduling` ✅ **KEEP** - Time slot management (pickup-specific)
- `operations_notification_system` ✅ **KEEP** - Notifications (SHARED with all fulfillment)

**Analysis**: Notification system is universal, pickup scheduling is pickup-specific

### INVENTORY Domain (4 features)
- `inventory_stock_tracking` ✅ **KEEP** - Essential for product availability (SHARED with onsite)
- `inventory_supplier_management` ✅ **KEEP** - Supply chain management (SHARED with onsite)
- `inventory_alert_system` ✅ **KEEP** - Low stock warnings (SHARED with onsite)
- `inventory_low_stock_auto_reorder` ✅ **KEEP** - Automated replenishment (SHARED with onsite)

**Analysis**: 100% identical to onsite_service inventory features

### STAFF Domain (3 features)
- `staff_employee_management` ✅ **KEEP** - Staff administration (SHARED with onsite)
- `staff_shift_management` ✅ **KEEP** - Scheduling staff (SHARED with onsite)
- `staff_time_tracking` ✅ **KEEP** - Attendance and hours (SHARED with onsite)

**Analysis**: 100% identical to onsite_service staff features

**OVERLAP SUMMARY**:
- **Shared features**: 10/13 (77%)
- **Pickup-specific**: 2/13 (15%) - `sales_pickup_orders`, `operations_pickup_scheduling`
- **Universal**: 1/13 (8%) - `operations_notification_system`

---

## Proposed Module Structure (IDEAL)

### Option A: Unified "Fulfillment" Module (Strongly Recommended)

```
Module: Fulfillment
├─ Purpose: Unified order fulfillment (onsite, pickup, delivery)
├─ Route: /admin/operations/fulfillment
│
├─ Submodules:
│  ├─ /core (shared 77% across fulfillment types)
│  │  ├─ OrderManagement.tsx (SHARED: order creation, modification)
│  │  ├─ PaymentProcessing.tsx (SHARED: payment handling)
│  │  ├─ FulfillmentQueue.tsx (SHARED: order status tracking)
│  │  └─ NotificationService.tsx (UNIVERSAL: customer notifications)
│  │
│  ├─ /pickup (specific to pickup_orders capability)
│  │  ├─ PickupScheduler.tsx (time slot selection)
│  │  ├─ PickupQueue.tsx (orders ready for pickup)
│  │  ├─ ReadyNotifications.tsx (SMS/push "order ready")
│  │  ├─ PickupAreas.tsx (counter, curbside, locker config)
│  │  └─ QRCodeScanner.tsx (quick order retrieval)
│  │
│  ├─ /onsite (for onsite_service capability)
│  │  ├─ TableManagement.tsx
│  │  ├─ FloorPlan.tsx
│  │  └─ DineInFlow.tsx
│  │
│  └─ /delivery (for delivery_shipping capability)
│     ├─ DeliveryZones.tsx
│     ├─ DeliveryTracking.tsx
│     └─ DriverAssignment.tsx
│
├─ Features Activated:
│  ├─ Pickup: sales_pickup_orders, operations_pickup_scheduling
│  ├─ Onsite: sales_dine_in_orders, operations_table_management
│  ├─ Delivery: sales_delivery_orders, operations_delivery_tracking
│  └─ Shared: sales_order_management, operations_notification_system
│
├─ Dependencies:
│  ├─ Materials (stock validation)
│  ├─ Production (prepare orders) [if requires_preparation active]
│  ├─ Staff (pickup counter staff)
│  └─ Customers (customer data, notification preferences)
│
└─ Rationale:
   - 77% feature overlap between pickup/onsite justifies consolidation
   - Single unified fulfillment queue (pickup + onsite + delivery)
   - Shared notification system (no duplicate logic)
   - Easier to add new pickup methods (curbside, locker, drive-thru)
   - Reduces complexity (no separate Pickup module needed)
```

**Pros**:
- ✅ **DRY**: 77% shared code eliminates duplication
- ✅ **Single Queue**: Unified view of all orders (pickup + onsite + delivery)
- ✅ **Consistent UX**: Same patterns, only "last mile" differs
- ✅ **Scalability**: Easy to add curbside, locker, drive-thru pickup
- ✅ **Notification Unified**: Single notification system for all types
- ✅ **Module Reduction**: No need for separate Pickup module (stays at 21 modules)

**Cons**:
- ❌ **Larger Module**: Fulfillment module handles 3 fulfillment types
- ❌ **Conditional Complexity**: UI must conditionally render pickup/onsite/delivery tabs

---

### Option B: Separate "Pickup" Module

```
Module: Pickup
├─ Purpose: Pickup order management
├─ Features: sales_pickup_orders, operations_pickup_scheduling
├─ Dependencies: sales, materials, staff
└─ Rationale: Keep pickup concerns separate from onsite/delivery

Module: Sales
├─ Purpose: Order creation, payment processing
├─ Features: sales_order_management, sales_payment_processing
├─ Dependencies: materials, customers
└─ Rationale: Keep Sales focused on commerce
```

**Pros**:
- ✅ **Smaller Modules**: Each module is focused
- ✅ **Separation of Concerns**: Pickup has its own home

**Cons**:
- ❌ **Duplicate Logic**: 77% overlap ignored (not DRY)
- ❌ **More Modules**: 22 modules instead of 21 (adds complexity)
- ❌ **Fragmented Queue**: Pickup queue separate from onsite queue
- ❌ **Duplicate Notifications**: Same notification logic in Pickup, Onsite, Delivery
- ❌ **Harder to Extend**: Adding curbside pickup requires updating Pickup module

---

### Option C: Pickup Logic in Sales Module

```
Module: Sales
├─ Purpose: All sales including pickup
├─ Submodules:
│  ├─ /onsite (POS, table orders)
│  ├─ /pickup (pickup orders, time slots)
│  └─ /ecommerce (online orders)
├─ Features: All sales features + pickup features
└─ Rationale: Pickup is just another sales channel
```

**Pros**:
- ✅ **No New Module**: Keep existing Sales module

**Cons**:
- ❌ **Couples Commerce and Logistics**: Sales should be order creation, not fulfillment
- ❌ **Huge Sales Module**: Too many concerns (commerce + fulfillment)
- ❌ **Not Extensible**: What about delivery? Also in Sales?
- ❌ **Wrong Abstraction**: "Last mile" fulfillment ≠ sales channel

---

## Recommendation: **Option A (Unified Fulfillment Module)**

**Rationale**:

### 1. Business Value
- **DRY Principle**: 77% overlap → consolidation is mandatory
- **Operational Efficiency**: Single queue improves staff workflow
- **Better Metrics**: Unified analytics across fulfillment types (pickup vs onsite vs delivery performance)
- **Cost Savings**: Shared code reduces bugs and maintenance

### 2. User Experience
- **Single Interface**: Staff manages all fulfillment from one location
- **Consistent Patterns**: Learn once, use everywhere (same queue UI for pickup/onsite/delivery)
- **Contextual Tabs**: Show pickup/onsite/delivery tabs based on active capabilities
- **Reduced Training**: One module instead of three

### 3. Technical Complexity
- **Shared Code**: 77% shared = less code to maintain
- **Single Notification System**: No duplicate SMS/email/push logic
- **Cleaner Architecture**: Fulfillment is separate concern from Sales
- **Easy to Extend**: Adding curbside, locker, drive-thru is trivial (new subfolder in /pickup)

### 4. Scalability
- **New Pickup Methods**: Easy to add curbside, locker pickup, drive-thru
- **Multi-Location**: Works with multi_location infrastructure (each location has its own fulfillment queue)
- **Third-Party Integrations**: Single integration point for delivery aggregators (Uber Eats, DoorDash)

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Fulfillment (NEW)
- **Purpose**: Unified order fulfillment (pickup, onsite, delivery)
- **Features Activated**:
  - Pickup: `sales_pickup_orders`, `operations_pickup_scheduling`
  - Shared: `operations_notification_system`
- **Dependencies**:
  - Sales (receive orders)
  - Materials (stock validation)
  - Production (prepare orders) [if requires_preparation active]
  - Staff (pickup counter staff)
  - Customers (notification preferences)
- **Routes**:
  - `/admin/operations/fulfillment` (main hub)
  - `/admin/operations/fulfillment/pickup` (pickup queue, time slots)
  - `/admin/operations/fulfillment/queue` (unified queue)

#### 2. Sales (UNCHANGED)
- **Purpose**: Order creation, payment processing
- **Features Activated**: (same as onsite_service)
- **Dependencies**: Fulfillment, Materials, Customers, Fiscal
- **Routes**: `/admin/operations/sales`

#### 3. Materials (UNCHANGED)
- **Purpose**: Inventory management
- **Features**: (same as onsite_service)
- **Routes**: `/admin/supply-chain/materials`

#### 4. Production (RENAMED from Kitchen)
- **Purpose**: Order preparation
- **Features**: (same as onsite_service)
- **Routes**: `/admin/operations/production`

### Supporting Modules
- **Staff**: Employee management, pickup counter staff scheduling
- **Customers**: CRM, notification preferences (SMS vs email vs push)
- **Dashboard**: Pickup queue widget, fulfillment metrics

---

## Cross-Module Integration Points

### Fulfillment Module PROVIDES (Pickup-Specific):

**Hooks**:
- `fulfillment.pickup.toolbar.actions`
  - **Description**: Add actions to pickup toolbar
  - **Consumers**: QRCodeScanner (add "Scan QR" button), Reporting (export pickup stats)
  - **Example**: Add "Print Pickup Labels" button

**Events**:
- `fulfillment.pickup_order_ready`
  - **Payload**: `{ orderId, customerId, pickupSlot, readyAt }`
  - **Listeners**: Notification service (send SMS "Order ready"), Dashboard (update pickup queue widget)

- `fulfillment.pickup_order_collected`
  - **Payload**: `{ orderId, customerId, collectedAt, collectedBy }`
  - **Listeners**: Staff (track performance), Analytics (avg wait time)

**Widgets**:
- `dashboard.pickup-queue`
  - **Location**: Dashboard main grid (only if pickup_orders active)
  - **Purpose**: Show pickup orders by status (preparing, ready, collected)
  - **Data**: Count by status, avg pickup time, delayed orders

### Fulfillment Module CONSUMES (Pickup-Specific):

**Hooks**:
- `customers.notification-preferences`
  - **Provider**: Customers module
  - **Usage**: Check if customer wants SMS, email, or push notifications
  - **Example**: Send SMS if customer opted in

**Events**:
- `sales.pickup_order_placed`
  - **Provider**: Sales module
  - **Usage**: Receive new pickup order
  - **Payload**: `{ orderId, items[], pickupSlot, customerId }`

- `production.order_completed`
  - **Provider**: Production module [if requires_preparation active]
  - **Usage**: Mark order as ready, trigger pickup notification
  - **Payload**: `{ orderId, completedAt }`

---

## UI/UX Flow

### Main Pages

#### 1. `/admin/operations/fulfillment` (Main Fulfillment Hub)
- **Components**:
  - `<FulfillmentTabs />` (Pickup | Onsite | Delivery) - Conditional
  - `<FulfillmentQueue />` (unified queue)
  - `<FulfillmentMetrics />` (orders today, avg time)

- **Conditional Rendering**:
  - Show "Pickup" tab if `pickup_orders` capability active
  - Show "Onsite" tab if `onsite_service` capability active
  - Show "Delivery" tab if `delivery_shipping` capability active

#### 2. `/admin/operations/fulfillment/pickup` (Pickup Management)
- **Components**:
  - `<PickupQueue />` (orders by status: preparing, ready, collected)
  - `<PickupSlotManager />` (configure time slots: "10am-11am", "11am-12pm")
  - `<PickupAreaConfig />` (counter, curbside, locker setup)
  - `<QRCodeScanner />` (scan QR to retrieve order)
  - `<ReadyNotificationLog />` (history of sent notifications)

- **Conditional Rendering**:
  - Only show if `pickup_orders` capability active
  - Show QR scanner if feature enabled in settings

#### 3. `/admin/operations/sales/pos` (Point of Sale - Pickup Option)
- **Components**:
  - `<POSInterface />` (main sales interface)
  - `<FulfillmentTypeSelector />` (Pickup | Onsite | Delivery) - NEW
  - `<PickupSlotSelector />` (if Pickup selected) - NEW
  - `<PaymentProcessor />` (pre-pay or pay-on-pickup option)

- **Conditional Rendering**:
  - Show `<FulfillmentTypeSelector />` if multiple fulfillment capabilities active
  - Show `<PickupSlotSelector />` only if Pickup selected
  - Show "Pay Later" option only if business allows it (config)

### Dashboard Widgets

1. **Pickup Queue Widget**
   - **Data**: Orders preparing, ready, collected (today)
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `pickup_orders` capability active

2. **Fulfillment Performance Widget**
   - **Data**: Avg fulfillment time by type (pickup: 15min, onsite: 25min, delivery: 45min)
   - **Location**: Dashboard main grid
   - **Conditional**: If any fulfillment capability active

---

## Questions & Decisions

### Q1: Should Pickup be part of Fulfillment or separate module?

**Options**:
- **Option A (Recommended)**: Pickup in Fulfillment module
  - **Pros**: 77% overlap, unified queue, DRY
  - **Cons**: Larger Fulfillment module

- **Option B**: Separate Pickup module
  - **Pros**: Smaller modules
  - **Cons**: Duplicate code, more modules, fragmented queue

**Decision**: **Option A - Pickup in Fulfillment**

**Rationale**:
- 77% feature overlap justifies consolidation
- Single fulfillment queue improves operational efficiency
- Shared notification system (no duplicate SMS/email logic)
- Easier to add new pickup methods (curbside, locker, drive-thru)

---

### Q2: Should pickup time slots be mandatory or optional?

**Options**:
- **Option A**: Mandatory time slots (business must configure slots)
  - **Pros**: Better capacity planning, avoids overcrowding
  - **Cons**: Less flexible for simple businesses

- **Option B (Recommended)**: Optional time slots (default to "ASAP")
  - **Pros**: Works for simple use case ("order now, pick up in 15min")
  - **Cons**: No capacity management (risk of bottlenecks)

**Decision**: **Option B - Optional Time Slots**

**Rationale**:
- Simple businesses don't need slot management ("order now" is enough)
- Advanced businesses can enable time slots in settings
- Default behavior: estimate pickup time based on production time + buffer
- **Implementation**: Add `enablePickupSlots` boolean in Business Profile settings

---

### Q3: Should notifications be sent automatically or manually?

**Options**:
- **Option A (Recommended)**: Automatic notifications (configurable)
  - **Trigger**: Order marked as "Ready" → Auto-send notification
  - **Config**: Business can disable auto-notifications in settings

- **Option B**: Manual notifications (staff clicks "Notify Customer")
  - **Pros**: More control for staff
  - **Cons**: Forgotten notifications, delayed customer arrivals

**Decision**: **Option A - Automatic Notifications**

**Rationale**:
- Automation improves customer experience (faster notifications)
- Reduces staff workload (no manual step)
- Can be disabled in settings for businesses that prefer manual control
- **Implementation**: Add `autoNotifyPickupReady` boolean in Business Profile settings

---

### Q4: Should we support curbside pickup from day one?

**Options**:
- **Option A**: Basic pickup only (counter pickup)
  - **Pros**: Simpler MVP, faster implementation
  - **Cons**: Missing popular feature (curbside is common)

- **Option B (Recommended)**: Include curbside pickup from start
  - **Pros**: Feature parity with competitors, modern UX
  - **Cons**: Slightly more complex (need parking spot selector)

**Decision**: **Option B - Include Curbside Pickup**

**Rationale**:
- Curbside pickup is now standard (post-COVID expectation)
- Implementation is simple (just add "pickup area" selector: counter, curbside, locker)
- Better customer experience (convenience)
- **Implementation**: Add `<PickupAreaSelector />` component with options:
  - Counter (default)
  - Curbside (with parking spot input)
  - Locker (with locker number)

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/fulfillment/pickup/PickupScheduler.tsx` (NEW)
2. `src/modules/fulfillment/pickup/PickupQueue.tsx` (NEW)
3. `src/modules/fulfillment/pickup/ReadyNotifications.tsx` (NEW)
4. `src/modules/fulfillment/pickup/PickupAreas.tsx` (NEW - curbside, counter, locker)

### Files to Modify
1. `src/modules/sales/components/SalesManagement.tsx` (add fulfillment type selector)
2. `src/modules/fulfillment/core/FulfillmentQueue.tsx` (add pickup orders to queue)

### Files to Delete
- None (no separate Pickup module exists currently)

### Breaking Changes
- None (new capability, no existing pickup logic to break)

### Testing Required
- [ ] Pickup order flow (place order → select slot → prepare → notify → pickup)
- [ ] Time slot management (configure slots, prevent overbooking)
- [ ] Curbside pickup (select parking spot, notify customer)
- [ ] Notification delivery (SMS, email, push all work)
- [ ] Unified queue (pickup orders show in fulfillment queue with onsite orders)

---

## Implementation Estimate

**Time**: 3-4 days

| Task | Duration | Effort |
|------|----------|--------|
| Create Fulfillment/pickup subfolder | 0.5 day | Low |
| Implement PickupScheduler (time slots) | 1 day | Medium |
| Implement PickupQueue (ready orders) | 0.5 day | Low |
| Implement ReadyNotifications (SMS/email) | 1 day | Medium |
| Add curbside/locker pickup support | 0.5 day | Low |
| Update Sales integration | 0.5 day | Low |
| Testing (unit + integration) | 1 day | Medium |

**Risk**: Low (no migration, new feature)

---

**END OF CAPABILITY 2: pickup_orders**

---

# CAPABILITY 3: delivery_shipping

**Type**: fulfillment
**Icon**: 🚚
**Features**: 14

---

## Business Flow Analysis

**User Journey** (Restaurant/Grocery Delivery Scenario):

1. **Order Placement**: Customer places order via app/website/phone
2. **Delivery Address**: Customer provides delivery address and validates delivery zone
3. **Delivery Fee Calculation**: System calculates delivery fee based on distance/zone
4. **Order Confirmation**: Customer confirms order with estimated delivery time (30-45min)
5. **Payment Processing**: Customer pays online (pre-payment required for delivery)
6. **Order Routing**: Order sent to production queue [if requires_preparation active]
7. **Preparation**: Staff prepares order following recipes
8. **Packaging**: Order packaged for delivery (insulated bags, secure containers)
9. **Driver Assignment**: System assigns available driver or staff selects driver
10. **Dispatch Notification**: Customer receives "Order dispatched" notification with driver info
11. **Real-Time Tracking**: Customer tracks driver location on map
12. **Delivery**: Driver delivers to customer address, customer signs/confirms receipt
13. **Completion**: Mark as delivered, collect feedback, update driver metrics

**Pain Points in Current Structure**:

1. **No Delivery Infrastructure**:
   - No delivery zones management (coverage areas)
   - No delivery tracking system (customer can't see driver location)
   - No driver assignment logic (manual or missing)
   - **Impact**: Cannot offer delivery capability

2. **71% Overlap with Onsite/Pickup**:
   - Same order → prepare → ready flow as onsite/pickup
   - Only difference is "last mile" (delivery tracking vs pickup slot vs table)
   - Duplicate fulfillment logic
   - **Impact**: If implemented separately, creates maintenance burden

3. **Missing Location Services**:
   - No GPS tracking infrastructure
   - No route optimization
   - No delivery zone validation (is address in coverage area?)
   - **Impact**: Manual delivery management, inefficient routing

4. **Driver Management Gap**:
   - No driver-specific features (availability, performance metrics)
   - No driver assignment workflow
   - No delivery completion tracking
   - **Impact**: Cannot scale delivery operations

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 14 features:**

### SALES Domain (7 features)
- `sales_order_management` ✅ **KEEP** - Core order functionality (SHARED with onsite/pickup)
- `sales_payment_processing` ✅ **KEEP** - Core payment functionality (SHARED with onsite/pickup)
- `sales_catalog_menu` ✅ **KEEP** - Product/service catalog (SHARED with onsite/pickup)
- `sales_delivery_orders` ✅ **KEEP** - Delivery-specific order type
- `sales_split_payment` ✅ **KEEP** - Multiple payment methods (SHARED with onsite/pickup)
- `sales_coupon_management` ✅ **KEEP** - Discount/coupon system (SHARED with onsite/pickup)

**Analysis**: 6/7 SALES features are identical to onsite/pickup (86% overlap)

### OPERATIONS Domain (2 features)
- `operations_delivery_zones` ✅ **KEEP** - Delivery coverage areas (delivery-specific)
- `operations_delivery_tracking` ✅ **KEEP** - Real-time GPS tracking (delivery-specific)
- `operations_notification_system` ✅ **KEEP** - Notifications (UNIVERSAL - shared with all fulfillment)

**Analysis**: 2 delivery-specific features, 1 universal notification system

### INVENTORY Domain (4 features)
- `inventory_stock_tracking` ✅ **KEEP** - Essential for product availability (SHARED with onsite/pickup)
- `inventory_supplier_management` ✅ **KEEP** - Supply chain management (SHARED with onsite/pickup)
- `inventory_alert_system` ✅ **KEEP** - Low stock warnings (SHARED with onsite/pickup)
- `inventory_low_stock_auto_reorder` ✅ **KEEP** - Automated replenishment (SHARED with onsite/pickup)

**Analysis**: 100% identical to onsite/pickup inventory features

### STAFF Domain (4 features)
- `staff_employee_management` ✅ **KEEP** - Staff administration (SHARED with onsite/pickup)
- `staff_shift_management` ✅ **KEEP** - Scheduling delivery drivers (SHARED with onsite/pickup)
- `staff_time_tracking` ✅ **KEEP** - Attendance and hours (SHARED with onsite/pickup)
- `staff_performance_tracking` ✅ **KEEP** - Driver performance metrics (SHARED with onsite/pickup)

**Analysis**: 100% identical to onsite/pickup staff features

**OVERLAP SUMMARY**:
- **Shared features**: 11/14 (79%)
- **Delivery-specific**: 2/14 (14%) - `sales_delivery_orders`, `operations_delivery_zones`, `operations_delivery_tracking`
- **Universal**: 1/14 (7%) - `operations_notification_system`

---

## Proposed Module Structure (IDEAL)

### Option A: Unified "Fulfillment" Module (Strongly Recommended)

```
Module: Fulfillment
├─ Purpose: Unified order fulfillment (onsite, pickup, delivery)
├─ Route: /admin/operations/fulfillment
│
├─ Submodules:
│  ├─ /core (shared 79% across fulfillment types)
│  │  ├─ OrderManagement.tsx (SHARED: order creation, modification)
│  │  ├─ PaymentProcessing.tsx (SHARED: payment handling)
│  │  ├─ FulfillmentQueue.tsx (SHARED: unified queue across all types)
│  │  └─ NotificationService.tsx (UNIVERSAL: SMS/email/push for all)
│  │
│  ├─ /delivery (specific to delivery_shipping capability)
│  │  ├─ DeliveryZones.tsx (configure coverage areas)
│  │  ├─ DeliveryZoneValidator.tsx (check if address is in coverage)
│  │  ├─ DeliveryFeeCalculator.tsx (calculate fee by distance/zone)
│  │  ├─ DriverManagement.tsx (driver availability, assignment)
│  │  ├─ DriverAssignment.tsx (auto/manual driver assignment)
│  │  ├─ DeliveryTracking.tsx (real-time GPS tracking map)
│  │  ├─ RouteOptimizer.tsx (optimize multi-delivery routes)
│  │  └─ DeliveryQueue.tsx (orders ready for dispatch)
│  │
│  ├─ /pickup (for pickup_orders capability)
│  │  ├─ PickupScheduler.tsx
│  │  ├─ PickupQueue.tsx
│  │  └─ ReadyNotifications.tsx
│  │
│  └─ /onsite (for onsite_service capability)
│     ├─ TableManagement.tsx
│     ├─ FloorPlan.tsx
│     └─ DineInFlow.tsx
│
├─ Features Activated:
│  ├─ Delivery: sales_delivery_orders, operations_delivery_zones, operations_delivery_tracking
│  ├─ Pickup: sales_pickup_orders, operations_pickup_scheduling
│  ├─ Onsite: sales_dine_in_orders, operations_table_management
│  └─ Shared: sales_order_management, operations_notification_system
│
├─ Dependencies:
│  ├─ Materials (stock validation)
│  ├─ Production (prepare orders) [if requires_preparation active]
│  ├─ Staff (drivers, delivery coordinators)
│  ├─ Customers (delivery addresses, preferences)
│  └─ Mobile (GPS tracking, route planning) [NEW - location services]
│
└─ Rationale:
   - 79% feature overlap confirms consolidation
   - Single fulfillment queue includes delivery orders
   - Shared notification system (dispatched, out for delivery, delivered)
   - Location services shared with mobile_operations capability
   - Easy to integrate third-party delivery (Uber Eats, DoorDash)
```

**Pros**:
- ✅ **DRY**: 79% shared code (highest overlap yet!)
- ✅ **Single Queue**: All fulfillment types in one unified view
- ✅ **Location Services**: Reusable GPS/tracking infrastructure
- ✅ **Third-Party Integration**: Single point for delivery aggregator APIs
- ✅ **Driver Management**: Unified driver availability and assignment
- ✅ **Module Reduction**: No separate Delivery module needed

**Cons**:
- ❌ **Complexity**: Delivery adds GPS tracking and route optimization
- ❌ **New Dependencies**: Requires location services infrastructure
- ❌ **Third-Party APIs**: Integration with maps (Google Maps, Mapbox)

---

### Option B: Separate "Delivery" Module

```
Module: Delivery
├─ Purpose: Delivery operations and tracking
├─ Features: sales_delivery_orders, operations_delivery_zones, operations_delivery_tracking
├─ Dependencies: sales, materials, staff, mobile (location services)
└─ Rationale: Delivery is complex enough to warrant separate module

Module: Sales
├─ Purpose: Order creation, payment processing
├─ Features: sales_order_management, sales_payment_processing
└─ Rationale: Keep Sales focused on commerce
```

**Pros**:
- ✅ **Separation**: Delivery complexity isolated
- ✅ **Focused Module**: Delivery-only concerns

**Cons**:
- ❌ **Duplicate Logic**: 79% overlap ignored (worst DRY violation)
- ❌ **More Modules**: 22 modules instead of 21
- ❌ **Fragmented Queue**: Delivery orders separate from pickup/onsite
- ❌ **Duplicate Notifications**: Same notification logic in 3 modules
- ❌ **No Unified Tracking**: Can't compare delivery vs pickup vs onsite metrics

---

### Option C: Delivery Logic in Sales Module

```
Module: Sales
├─ Purpose: All sales including delivery
├─ Submodules:
│  ├─ /onsite (POS, tables)
│  ├─ /pickup (pickup orders)
│  ├─ /delivery (delivery orders, tracking)
│  └─ /ecommerce (online orders)
└─ Rationale: Delivery is just another sales channel
```

**Pros**:
- ✅ **No New Module**: Keep existing Sales module

**Cons**:
- ❌ **Wrong Abstraction**: Delivery is logistics, not commerce
- ❌ **Huge Sales Module**: Too many concerns (commerce + fulfillment + tracking)
- ❌ **GPS in Sales?**: Location tracking doesn't belong in Sales
- ❌ **Not Scalable**: What about route optimization? Driver management? All in Sales?

---

## Recommendation: **Option A (Unified Fulfillment Module)**

**Rationale**:

### 1. Business Value
- **DRY Principle**: 79% overlap → consolidation is MANDATORY (highest overlap yet)
- **Operational Efficiency**: Single fulfillment queue for all order types
- **Better Metrics**: Unified KPIs (avg delivery time vs pickup time vs dine-in time)
- **Third-Party Integration**: Single integration point for Uber Eats, Rappi, Glovo, etc.

### 2. User Experience
- **Single Interface**: Staff manages onsite/pickup/delivery from one location
- **Unified Tracking**: Real-time view of all orders (preparing/ready/in-transit)
- **Contextual Tabs**: Show delivery tab only if delivery_shipping capability active
- **Consistent Patterns**: Same queue UI, only "last mile" differs

### 3. Technical Complexity
- **Shared Code**: 79% shared = maximum DRY benefit
- **Location Services**: GPS/maps infrastructure reusable for mobile_operations capability
- **Single Notification System**: No duplicate SMS/email/push logic across modules
- **Cleaner Architecture**: Fulfillment is distinct from Sales (commerce vs logistics)

### 4. Scalability
- **Third-Party Delivery**: Easy to integrate Uber Eats, Rappi, DoorDash (single API integration point)
- **Hybrid Model**: Business can use own drivers + third-party (toggle in settings)
- **Route Optimization**: Share route optimization logic with mobile_operations (food trucks)

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Fulfillment (NEW)
- **Purpose**: Unified order fulfillment (onsite, pickup, delivery)
- **Features Activated**:
  - Delivery: `sales_delivery_orders`, `operations_delivery_zones`, `operations_delivery_tracking`
  - Shared: `operations_notification_system`
- **Dependencies**:
  - Sales (receive orders)
  - Materials (stock validation)
  - Production (prepare orders) [if requires_preparation active]
  - Staff (drivers, delivery coordinators)
  - Customers (delivery addresses)
  - Mobile (GPS tracking, route planning) [NEW - location services]
- **Routes**:
  - `/admin/operations/fulfillment` (main hub)
  - `/admin/operations/fulfillment/delivery` (delivery zones, tracking)
  - `/admin/operations/fulfillment/queue` (unified queue)

#### 2. Mobile (NEW - Infrastructure Service)
- **Purpose**: Location services (GPS tracking, route planning, maps)
- **Features**: Reusable location infrastructure
- **Used By**: Fulfillment (delivery tracking), Mobile Operations (food trucks)
- **Routes**: `/admin/operations/mobile` (only if mobile_operations capability active)

#### 3. Sales (UNCHANGED)
- **Purpose**: Order creation, payment processing
- **Routes**: `/admin/operations/sales`

#### 4. Materials (UNCHANGED)
- **Purpose**: Inventory management
- **Routes**: `/admin/supply-chain/materials`

#### 5. Production (UNCHANGED)
- **Purpose**: Order preparation
- **Routes**: `/admin/operations/production`

### Supporting Modules
- **Staff**: Driver management, shift scheduling, performance tracking
- **Customers**: Delivery address management, order history
- **Dashboard**: Delivery tracking widget, driver performance metrics

---

## Cross-Module Integration Points

### Fulfillment Module PROVIDES (Delivery-Specific):

**Hooks**:
- `fulfillment.delivery.toolbar.actions`
  - **Description**: Add actions to delivery toolbar
  - **Consumers**: RouteOptimizer (add "Optimize Routes" button), Reporting (export delivery stats)
  - **Example**: Add "Assign All Drivers" button

**Events**:
- `fulfillment.delivery_dispatched`
  - **Payload**: `{ orderId, customerId, driverId, dispatchedAt, estimatedDelivery }`
  - **Listeners**: Notification service (send "Order dispatched"), Dashboard (update delivery map widget)

- `fulfillment.delivery_in_transit`
  - **Payload**: `{ orderId, driverId, currentLocation: { lat, lng }, progress: 0.65 }`
  - **Listeners**: Customers (update tracking page), Dashboard (real-time map)

- `fulfillment.delivery_completed`
  - **Payload**: `{ orderId, customerId, driverId, deliveredAt, customerSignature }`
  - **Listeners**: Staff (update driver metrics), Analytics (avg delivery time)

**Widgets**:
- `dashboard.delivery-map`
  - **Location**: Dashboard main grid (only if delivery_shipping active)
  - **Purpose**: Real-time map showing active deliveries (drivers + customers)
  - **Data**: Driver locations, delivery status, ETAs

- `dashboard.delivery-queue`
  - **Location**: Dashboard main grid
  - **Purpose**: Delivery orders by status (preparing, ready, dispatched, delivered)
  - **Data**: Count by status, avg delivery time, delayed deliveries

### Fulfillment Module CONSUMES (Delivery-Specific):

**Hooks**:
- `mobile.location-tracking`
  - **Provider**: Mobile module (NEW - infrastructure service)
  - **Usage**: Track driver location in real-time
  - **Example**: Show driver on map, calculate ETA

- `mobile.route-optimizer`
  - **Provider**: Mobile module (NEW - infrastructure service)
  - **Usage**: Optimize multi-delivery routes
  - **Example**: Sort deliveries by proximity, minimize total distance

- `customers.delivery-addresses`
  - **Provider**: Customers module
  - **Usage**: Validate delivery address, retrieve saved addresses
  - **Example**: Check if address is in delivery zone

**Events**:
- `sales.delivery_order_placed`
  - **Provider**: Sales module
  - **Usage**: Receive new delivery order
  - **Payload**: `{ orderId, items[], deliveryAddress, deliveryZone, deliveryFee }`

- `production.order_completed`
  - **Provider**: Production module [if requires_preparation active]
  - **Usage**: Mark order as ready for dispatch, assign driver
  - **Payload**: `{ orderId, completedAt }`

---

## UI/UX Flow

### Main Pages

#### 1. `/admin/operations/fulfillment` (Main Fulfillment Hub)
- **Components**:
  - `<FulfillmentTabs />` (Delivery | Pickup | Onsite) - Conditional
  - `<FulfillmentQueue />` (unified queue across all types)
  - `<FulfillmentMetrics />` (orders today, avg time by type)

- **Conditional Rendering**:
  - Show "Delivery" tab if `delivery_shipping` capability active
  - Show "Pickup" tab if `pickup_orders` capability active
  - Show "Onsite" tab if `onsite_service` capability active

#### 2. `/admin/operations/fulfillment/delivery` (Delivery Management)
- **Components**:
  - `<DeliveryMap />` (real-time map with drivers + customers)
  - `<DeliveryQueue />` (orders by status: preparing, ready, dispatched, delivered)
  - `<DeliveryZoneManager />` (configure coverage areas)
  - `<DriverManagement />` (driver availability, assignment)
  - `<RouteOptimizer />` (optimize multi-delivery routes)

- **Conditional Rendering**:
  - Only show if `delivery_shipping` capability active
  - Show route optimizer if multiple deliveries pending

#### 3. `/admin/operations/fulfillment/delivery/zones` (Delivery Zone Config)
- **Components**:
  - `<DeliveryZoneMap />` (draw coverage areas on map)
  - `<ZoneList />` (list of zones with names, fees)
  - `<ZoneForm />` (add/edit zone: name, polygon, base fee, per-km fee)

- **Features**:
  - Draw polygon on map (Google Maps Drawing Tools)
  - Set delivery fee per zone (flat rate or distance-based)
  - Set minimum order amount per zone

#### 4. `/admin/operations/sales/pos` (Point of Sale - Delivery Option)
- **Components**:
  - `<POSInterface />` (main sales interface)
  - `<FulfillmentTypeSelector />` (Delivery | Pickup | Onsite)
  - `<DeliveryAddressInput />` (if Delivery selected) - NEW
  - `<DeliveryZoneValidator />` (check if address is in coverage) - NEW
  - `<DeliveryFeeCalculator />` (show delivery fee) - NEW
  - `<PaymentProcessor />` (pre-payment required for delivery)

- **Conditional Rendering**:
  - Show `<FulfillmentTypeSelector />` if multiple fulfillment capabilities active
  - Show `<DeliveryAddressInput />` only if Delivery selected
  - Show "Pay Later" option ONLY for pickup/onsite (delivery requires pre-payment)

### Dashboard Widgets

1. **Delivery Map Widget**
   - **Data**: Real-time driver locations, active deliveries
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `delivery_shipping` capability active

2. **Delivery Queue Widget**
   - **Data**: Orders preparing, ready, dispatched, delivered (today)
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `delivery_shipping` capability active

3. **Driver Performance Widget**
   - **Data**: Avg delivery time per driver, deliveries completed, customer ratings
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `delivery_shipping` capability active

---

## Questions & Decisions

### Q1: Should Delivery be part of Fulfillment or separate module?

**Decision**: **Fulfillment Module** (79% overlap confirms consolidation)

**Rationale**: Same as pickup_orders (DRY, unified queue, single notification system)

---

### Q2: Should we build GPS tracking or integrate third-party service?

**Options**:
- **Option A (Recommended)**: Integrate third-party (Google Maps, Mapbox)
  - **Pros**: Faster implementation, better quality (turn-by-turn, traffic)
  - **Cons**: Monthly API costs (~$200-500/month)

- **Option B**: Build custom tracking
  - **Pros**: No ongoing costs
  - **Cons**: Months of development, inferior quality

**Decision**: **Option A - Third-Party Integration**

**Rationale**:
- Google Maps API provides superior UX (turn-by-turn, traffic, ETA)
- Faster time-to-market (weeks vs months)
- Cost is justified by business value (delivery revenue)
- **Implementation**: Start with Google Maps, support Mapbox as alternative

---

### Q3: Should delivery require pre-payment or allow "pay on delivery"?

**Options**:
- **Option A (Recommended)**: Require pre-payment
  - **Pros**: Reduces no-shows, protects business
  - **Cons**: May reduce conversion (some customers prefer cash)

- **Option B**: Allow "pay on delivery" (cash)
  - **Pros**: Better conversion, customer preference
  - **Cons**: Risk of no-shows, driver carries cash

**Decision**: **Option A - Pre-Payment Required (configurable)**

**Rationale**:
- Modern expectation (Uber Eats, DoorDash all require pre-payment)
- Reduces operational risk (no-shows, lost revenue)
- Can be made configurable in Business Profile settings for markets where cash is preferred
- **Implementation**: Add `allowCashOnDelivery` boolean in Business Profile settings

---

### Q4: Should we support third-party delivery aggregators (Uber Eats, Rappi)?

**Options**:
- **Option A (Recommended)**: Support third-party from day one
  - **Pros**: Increased reach, no driver management needed
  - **Cons**: Higher delivery fees (30-40% commission)

- **Option B**: Own drivers only
  - **Pros**: Full control, lower costs
  - **Cons**: Requires driver hiring, vehicle management, insurance

**Decision**: **Option A - Hybrid Model (own + third-party)**

**Rationale**:
- Hybrid model provides flexibility (use own drivers for nearby, third-party for far)
- Single API integration point in Fulfillment module
- Business can toggle third-party delivery on/off in settings
- **Implementation**: Add `enableThirdPartyDelivery` boolean, integrate Uber Direct API

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/fulfillment/delivery/DeliveryZones.tsx` (NEW)
2. `src/modules/fulfillment/delivery/DeliveryTracking.tsx` (NEW)
3. `src/modules/fulfillment/delivery/DriverManagement.tsx` (NEW)
4. `src/modules/fulfillment/delivery/RouteOptimizer.tsx` (NEW)
5. `src/modules/mobile/` (NEW - infrastructure module for location services)

### Files to Modify
1. `src/modules/sales/components/SalesManagement.tsx` (add delivery address input)
2. `src/modules/fulfillment/core/FulfillmentQueue.tsx` (add delivery orders to queue)

### Files to Delete
- None (no separate Delivery module exists currently)

### Breaking Changes
- None (new capability, no existing delivery logic to break)

### Testing Required
- [ ] Delivery order flow (place order → validate address → prepare → assign driver → track → deliver)
- [ ] Delivery zone management (create zones, validate addresses)
- [ ] GPS tracking (track driver location, update customer)
- [ ] Driver assignment (auto-assign based on availability)
- [ ] Route optimization (multi-delivery optimization)
- [ ] Third-party integration (Uber Direct API)

---

## Implementation Estimate

**Time**: 7-10 days

| Task | Duration | Effort |
|------|----------|--------|
| Create Fulfillment/delivery subfolder | 0.5 day | Low |
| Implement DeliveryZones (polygons on map) | 2 days | High |
| Integrate Google Maps API (tracking) | 2 days | High |
| Implement DriverManagement | 1 day | Medium |
| Implement RouteOptimizer | 1.5 days | High |
| Implement DeliveryQueue | 0.5 day | Low |
| Third-party integration (Uber Direct) | 1 day | Medium |
| Update Sales integration | 0.5 day | Low |
| Testing (unit + integration + e2e) | 2 days | High |

**Risk**: Medium-High (complex GPS integration, third-party APIs)

---

**END OF CAPABILITY 3: delivery_shipping**

---

# CAPABILITY 4: requires_preparation

**Type**: production
**Icon**: 👨‍🍳
**Features**: 11

---

## Business Flow Analysis

**User Journey** (Restaurant/Bakery/Manufacturing Scenario):

1. **Order Received**: Order arrives from Sales (onsite/pickup/delivery)
2. **Kitchen Display**: Order appears on Kitchen Display System (KDS)
3. **Recipe Lookup**: System shows recipe/BOM with ingredients and steps
4. **Ingredient Check**: Validate all ingredients are in stock
5. **Production Queue**: Order enters production queue (FIFO or priority-based)
6. **Preparation Start**: Cook/staff marks order as "in progress"
7. **Follow Recipe**: Staff follows recipe steps, portions ingredients
8. **Quality Check**: Verify dish/product meets standards
9. **Mark Complete**: Cook marks order as "ready" in KDS
10. **Notify Fulfillment**: Fulfillment module receives "order ready" event
11. **Serve/Package**: Waiter serves (onsite) or staff packages (pickup/delivery)

**Pain Points in Current Structure**:

1. **Kitchen Module = Gastronomy-Specific**:
   - Name "Kitchen" is restaurant-specific
   - Should be "Production" (generic for manufacturing, assembly, cooking, etc.)
   - **Impact**: Limits multi-industry support

2. **Recipe Management Scattered**:
   - Recipe features in Intelligence module (wrong location)
   - BOM (Bill of Materials) logic not centralized
   - **Impact**: Hard to find, inconsistent behavior

3. **No Production Capacity Planning**:
   - No way to estimate production time per recipe
   - No throughput optimization
   - No bottleneck detection
   - **Impact**: Can't predict delivery times accurately

4. **Link Module Complexity**:
   - Kitchen is "link module" (auto-activates when Sales + Materials active)
   - Fragile dependencies, hard to test
   - **Impact**: Complex setup, breaks easily

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 11 features:**

### PRODUCTION Domain (4 features)
- `production_recipe_management` ✅ **KEEP** - BOM and recipes
- `production_kitchen_display` ✅ **KEEP** - KDS (rename to production_display)
- `production_order_queue` ✅ **KEEP** - Production queue management
- `production_capacity_planning` ✅ **KEEP** - MRP (Material Requirements Planning)

**Analysis**: All production features are essential, rename for generic terminology

### INVENTORY Domain (5 features)
- `inventory_purchase_orders` ✅ **KEEP** - POs to suppliers
- `inventory_supplier_management` ✅ **KEEP** - Supplier catalog
- `inventory_demand_forecasting` ✅ **KEEP** - Predict ingredient needs
- `inventory_batch_lot_tracking` ✅ **KEEP** - Traceability
- `inventory_expiration_tracking` ✅ **KEEP** - FIFO/FEFO for perishables

**Analysis**: Advanced inventory features for production environments

### OPERATIONS Domain (1 feature)
- `operations_vendor_performance` ✅ **KEEP** - Supplier KPIs

### STAFF Domain (5 features)
- `staff_employee_management` ✅ **KEEP** - Staff administration
- `staff_shift_management` ✅ **KEEP** - Production shift scheduling
- `staff_time_tracking` ✅ **KEEP** - Hours worked
- `staff_performance_tracking` ✅ **KEEP** - Production metrics per staff
- `staff_training_management` ✅ **KEEP** - Recipe training, certifications

**Analysis**: Staff features for production personnel (cooks, assemblers, etc.)

---

## Proposed Module Structure (IDEAL)

### Option A: Rename "Kitchen" → "Production" (Strongly Recommended)

```
Module: Production (renamed from Kitchen)
├─ Purpose: Order preparation, recipe management, production queue
├─ Route: /admin/operations/production (was /kitchen)
│
├─ Submodules:
│  ├─ /queue
│  │  ├─ ProductionDisplay.tsx (KDS - order queue with status)
│  │  ├─ OrderCard.tsx (individual order with items, time, table)
│  │  └─ QueueManager.tsx (FIFO, priority, capacity management)
│  │
│  ├─ /recipes
│  │  ├─ RecipeManager.tsx (CRUD recipes/BOMs)
│  │  ├─ RecipeEditor.tsx (ingredients, steps, portions)
│  │  ├─ RecipeCalculator.tsx (scale portions, cost calculation)
│  │  └─ RecipeLibrary.tsx (browse, search, filter)
│  │
│  ├─ /capacity
│  │  ├─ CapacityPlanner.tsx (MRP - production capacity)
│  │  ├─ ThroughputAnalyzer.tsx (bottleneck detection)
│  │  └─ ProductionScheduler.tsx (estimated completion times)
│  │
│  └─ /training
│     ├─ RecipeTraining.tsx (staff training on recipes)
│     ├─ Certifications.tsx (cooking certifications)
│     └─ SkillMatrix.tsx (who can cook what)
│
├─ Features Activated:
│  ├─ production_recipe_management
│  ├─ production_kitchen_display → production_display
│  ├─ production_order_queue
│  └─ production_capacity_planning
│
├─ Dependencies:
│  ├─ Materials (ingredients, stock levels)
│  ├─ Sales (receive orders)
│  ├─ Fulfillment (send "order ready" event)
│  └─ Staff (production personnel)
│
└─ Rationale:
   - "Production" is generic (cooking, manufacturing, assembly)
   - Centralizes all preparation logic
   - Works for restaurant, bakery, factory, workshop, etc.
   - Cleaner than "link module" pattern (explicit dependency)
```

**Pros**:
- ✅ **Generic Terminology**: "Production" works for all industries
- ✅ **Centralized**: All production logic in one place
- ✅ **Clean Dependencies**: Explicit deps on Materials, Sales, Fulfillment
- ✅ **Extensible**: Easy to add manufacturing-specific features later
- ✅ **Multi-Industry**: Works for gastronomy, manufacturing, assembly, etc.

**Cons**:
- ❌ **Breaking Change**: Route changes from `/kitchen` to `/production`
- ❌ **Migration Effort**: Rename module, update imports (1-2 days)

---

### Option B: Keep "Kitchen" Module (Not Recommended)

**Cons**:
- ❌ **Industry-Specific**: "Kitchen" is gastronomy-only
- ❌ **Limits Adoption**: Won't work for manufacturing, assembly, etc.
- ❌ **Poor UX**: Confusing for non-restaurant businesses

---

## Recommendation: **Option A (Rename to Production)**

**Rationale**:

### 1. Multi-Industry Support
- "Production" is universal (cooking = production, assembly = production, manufacturing = production)
- Removes gastronomy assumptions
- Opens G-Admin to new markets (factories, workshops, maker spaces)

### 2. Business Value
- Larger addressable market (not just restaurants)
- Better positioning (ERP for SMBs, not just restaurant POS)
- Clearer terminology (everyone understands "production")

### 3. Technical Simplicity
- One-time migration (rename module, update routes)
- No functionality changes (same features, same code)
- Breaking change acceptable (product is in development)

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Production (RENAMED from Kitchen)
- **Purpose**: Order preparation, recipe management, production capacity
- **Features**: All production_* features
- **Routes**: `/admin/operations/production`

#### 2. Materials (ENHANCED)
- **Purpose**: Inventory with advanced features (batch tracking, expiration)
- **Features**: All inventory_* features
- **Routes**: `/admin/supply-chain/materials`

### Supporting Modules
- **Staff**: Production personnel, training, certifications
- **Suppliers**: Ingredient sourcing, vendor performance

---

## Cross-Module Integration Points

### Production Module PROVIDES:

**Events**:
- `production.order_started`
  - **Payload**: `{ orderId, startedAt, estimatedCompletion }`
  - **Listeners**: Fulfillment (update queue status), Dashboard (update metrics)

- `production.order_completed`
  - **Payload**: `{ orderId, completedAt, actualDuration }`
  - **Listeners**: Fulfillment (mark ready), Materials (deduct ingredients)

**Hooks**:
- `production.recipe.ingredient-list`
  - **Description**: Get ingredients for recipe
  - **Consumers**: Materials (validate stock), Sales (show availability)

---

## UI/UX Flow

**Main Pages**:
1. `/admin/operations/production` - Production queue (KDS)
2. `/admin/operations/production/recipes` - Recipe library
3. `/admin/operations/production/capacity` - Capacity planning

**Dashboard Widgets**:
- Production queue status
- Avg preparation time
- Delayed orders

---

## Questions & Decisions

### Q1: Should we keep "link module" pattern or make explicit dependency?

**Decision**: **Explicit Dependency** (Production always available if requires_preparation active)

**Rationale**: Link modules are complex, fragile, hard to test

---

### Q2: Should recipes be in Production or Intelligence module?

**Decision**: **Production Module**

**Rationale**: Recipes are core to production, not "intelligence"

---

## Migration Impact Analysis

### Files to Rename
1. `src/modules/kitchen/` → `src/modules/production/`
2. All imports: `@/modules/kitchen` → `@/modules/production`
3. Routes: `/admin/operations/kitchen` → `/admin/operations/production`

### Breaking Changes
- Route changes (provide redirects)
- Import paths change (automated find-replace)

### Testing Required
- [ ] Production queue flow
- [ ] Recipe management
- [ ] Capacity planning

---

## Implementation Estimate

**Time**: 2-3 days (mostly renaming)

| Task | Duration | Effort |
|------|----------|--------|
| Rename module folder | 0.5 day | Low |
| Update all imports | 0.5 day | Low |
| Update routes | 0.5 day | Low |
| Update documentation | 0.5 day | Low |
| Testing | 1 day | Medium |

**Risk**: Low (rename only, no logic changes)

---

**END OF CAPABILITY 4: requires_preparation**

---

# CAPABILITY 5: walkin_service

**Type**: service_mode
**Icon**: 🚶
**Features**: 3

---

## Business Flow Analysis

**User Journey** (Barbershop/Walk-in Clinic/Nail Salon Scenario):

1. **Customer Arrival**: Customer arrives at location without prior appointment
2. **Availability Check**: Staff checks availability of service providers
3. **Wait Time Estimate**: Customer is informed of estimated wait time
4. **Queue Management**: Customer added to wait queue (optional - may go directly to service)
5. **Service Provider Assignment**: Available provider takes next customer
6. **Service Delivery**: Service is performed (haircut, checkup, massage, etc.)
7. **Payment Processing**: Customer pays after service completion
8. **Exit**: Customer leaves, no follow-up required

**Pain Points in Current Structure**:

1. **No Walk-in Specific Module**:
   - Walk-in logic not differentiated from appointment-based services
   - No queue management for walk-ins
   - Wait time estimation is manual or missing
   - **Impact**: Cannot offer walk-in services efficiently

2. **Scheduling Confusion**:
   - Scheduling module is designed for appointments (time slots, reservations)
   - Walk-in is "anti-scheduling" (no appointment needed)
   - Mixing both creates UX complexity
   - **Impact**: Users confused about when to use scheduling vs walk-in

3. **Minimal Feature Set**:
   - Only 3 features: staff_employee_management, staff_shift_management, staff_time_tracking
   - No customer management (walk-ins are anonymous or minimal tracking)
   - No inventory (services don't require stock)
   - **Impact**: Simplest capability, minimal module needs

4. **Staff-Centric**:
   - Walk-in is primarily about staff availability
   - No complex customer relationships
   - No pre-booking or reminders
   - **Impact**: Can be implemented as staff-only feature (no separate module)

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 3 features:**

### STAFF Domain (3 features)
- `staff_employee_management` ✅ **KEEP** - Service providers (barbers, doctors, technicians)
- `staff_shift_management` ✅ **KEEP** - Schedule service provider availability
- `staff_time_tracking` ✅ **KEEP** - Track hours worked

**Analysis**: 100% staff-focused. No sales, no inventory, no customers features.

**Missing Features for Walk-in**:
- Queue management (wait list)
- Wait time estimation
- Customer minimal tracking (for loyalty, history)

**OVERLAP SUMMARY**:
- **Shared with appointment_based**: 3/3 (100%) - Same staff features
- **Unique to walkin_service**: 0 features (no unique features defined yet)

**RECOMMENDATION**: Add new features for walk-in:
- `operations_walkin_queue_management` (NEW)
- `operations_wait_time_estimation` (NEW)

---

## Proposed Module Structure (IDEAL)

### Option A: Walk-in as Staff Module Enhancement (Recommended)

```
Module: Staff
├─ Purpose: Employee management, scheduling, performance
├─ Route: /admin/resources/staff
│
├─ Submodules:
│  ├─ /management (employee CRUD, contracts)
│  ├─ /scheduling (shifts, availability) [existing]
│  ├─ /performance (metrics, KPIs) [existing]
│  ├─ /walkin (NEW - for walkin_service capability)
│  │  ├─ WalkinQueue.tsx (wait queue management)
│  │  ├─ WaitTimeEstimator.tsx (estimate wait based on avg service time)
│  │  └─ ProviderAvailability.tsx (show available providers)
│  └─ /appointments (for appointment_based capability)
│     ├─ AppointmentCalendar.tsx
│     └─ BookingManager.tsx
│
├─ Features Activated:
│  ├─ Base: staff_employee_management, staff_shift_management
│  ├─ Walk-in: operations_walkin_queue_management (conditional)
│  └─ Appointments: scheduling_appointment_booking (conditional)
│
├─ Dependencies:
│  └─ Customers (optional - for loyalty tracking)
│
└─ Rationale:
   - Walk-in is primarily about staff availability
   - No need for separate module (3 features, all staff-related)
   - Staff module already handles shifts and availability
   - Conditional UI: show /walkin subfolder only if walkin_service active
```

**Pros**:
- ✅ **No New Module**: Keep Staff module, add walk-in subfolder
- ✅ **DRY**: Reuse staff management, shifts, availability
- ✅ **Simplicity**: Walk-in is just "staff availability + queue"
- ✅ **Minimal Complexity**: Only 2-3 components needed
- ✅ **Module Count**: Stays at 21 modules (no increase)

**Cons**:
- ❌ **Staff Module Grows**: Adds walk-in subfolder to Staff module
- ❌ **Conditional Complexity**: Must hide walk-in UI if capability not active

---

### Option B: Separate "Walk-in" Module

```
Module: Walkin
├─ Purpose: Walk-in service queue and wait time management
├─ Features: operations_walkin_queue_management, operations_wait_time_estimation
├─ Dependencies: staff (provider availability)
└─ Rationale: Separate concern from staff management
```

**Pros**:
- ✅ **Separation of Concerns**: Walk-in logic isolated

**Cons**:
- ❌ **Overkill**: Separate module for 3 features (too small)
- ❌ **More Modules**: 22 modules instead of 21 (adds complexity)
- ❌ **Duplicate Logic**: Would duplicate staff availability logic
- ❌ **Poor UX**: Users must navigate to separate module for walk-in

---

### Option C: Walk-in in Scheduling Module

```
Module: Scheduling
├─ Purpose: Appointments + Walk-in queue
├─ Submodules:
│  ├─ /appointments (calendar, booking)
│  └─ /walkin (queue, wait time)
└─ Rationale: Both are time-based service delivery
```

**Pros**:
- ✅ **Time-Based**: Both appointments and walk-in are about time management

**Cons**:
- ❌ **Wrong Abstraction**: Walk-in is "anti-scheduling" (no appointments)
- ❌ **Confusing UX**: Scheduling implies appointments, not walk-in
- ❌ **Couples Opposites**: Walk-in and appointments are fundamentally different

---

## Recommendation: **Option A (Walk-in in Staff Module)**

**Rationale**:

### 1. Business Value
- **Minimal Overhead**: No new module needed (keeps architecture simple)
- **Correct Abstraction**: Walk-in is primarily about staff availability
- **Extensible**: Easy to add walk-in features later (queue notifications, priority queue)

### 2. User Experience
- **Single Location**: Staff manages shifts AND walk-in queue from same module
- **Contextual UI**: Show walk-in subfolder only if walkin_service capability active
- **Natural Flow**: Check staff availability → see walk-in queue → assign next customer

### 3. Technical Complexity
- **Low Implementation Effort**: Add 2-3 components to existing Staff module
- **DRY**: Reuse staff availability, shift management
- **No Breaking Changes**: Staff module already exists

### 4. Feature Completeness
- Walk-in needs:
  - ✅ Staff availability (already in Staff module)
  - ✅ Queue management (add WalkinQueue.tsx)
  - ✅ Wait time estimation (add WaitTimeEstimator.tsx)

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Staff (ENHANCED)
- **Purpose**: Employee management, scheduling, walk-in queue
- **Features Activated**:
  - Base: `staff_employee_management`, `staff_shift_management`, `staff_time_tracking`
  - Walk-in: `operations_walkin_queue_management` (NEW)
  - Walk-in: `operations_wait_time_estimation` (NEW)
- **Dependencies**: Customers (optional - for loyalty tracking)
- **Routes**:
  - `/admin/resources/staff` (main)
  - `/admin/resources/staff/walkin` (walk-in queue) [conditional]

### Supporting Modules
- **Customers** (optional): Minimal customer tracking (name, phone, visit history)
- **Dashboard**: Walk-in queue widget (customers waiting, avg wait time)

---

## Cross-Module Integration Points

### Staff Module PROVIDES (Walk-in-Specific):

**Hooks**:
- `staff.walkin.queue.actions`
  - **Description**: Add actions to walk-in queue
  - **Consumers**: Dashboard (quick actions), Reporting (export queue stats)
  - **Example**: Add "Call Next Customer" button

**Events**:
- `staff.walkin_customer_added`
  - **Payload**: `{ customerId, serviceType, estimatedWaitTime, addedAt }`
  - **Listeners**: Dashboard (update queue widget), Customers (track visit history)

- `staff.walkin_customer_served`
  - **Payload**: `{ customerId, providerId, serviceType, servedAt, duration }`
  - **Listeners**: Staff (update provider metrics), Dashboard (update availability)

**Widgets**:
- `dashboard.walkin-queue`
  - **Location**: Dashboard main grid (only if walkin_service active)
  - **Purpose**: Show walk-in queue (customers waiting, estimated wait time)
  - **Data**: Queue count, avg wait time, available providers

### Staff Module CONSUMES (Walk-in-Specific):

**Hooks**:
- `customers.minimal-info`
  - **Provider**: Customers module (optional)
  - **Usage**: Get customer name, phone for queue entry
  - **Example**: "John Doe - (555) 123-4567"

**Stores** (Zustand):
- `staffStore.employees`
  - **From**: Staff module (self)
  - **Usage**: Get available providers for wait time estimation

---

## UI/UX Flow

### Main Pages

#### 1. `/admin/resources/staff` (Staff Management)
- **Components**:
  - `<StaffTabs />` (Management | Scheduling | Walk-in | Performance) - Conditional
  - `<EmployeeList />` (existing)
  - `<ShiftCalendar />` (existing)

- **Conditional Rendering**:
  - Show "Walk-in" tab only if `walkin_service` capability active
  - Show "Appointments" tab only if `appointment_based` capability active

#### 2. `/admin/resources/staff/walkin` (Walk-in Queue Management)
- **Components**:
  - `<WalkinQueue />` (list of customers waiting)
  - `<QueueEntry />` (customer name, service type, wait time, "Serve Next" button)
  - `<ProviderAvailability />` (show available providers)
  - `<WaitTimeEstimator />` (estimate wait time based on queue + avg service time)
  - `<AddToQueueModal />` (add customer to queue: name, phone, service type)

- **Conditional Rendering**:
  - Only show if `walkin_service` capability active
  - Show customer tracking if Customers module active (optional)

#### 3. `/admin/operations/sales/pos` (Point of Sale - Walk-in Payment)
- **Components**:
  - `<POSInterface />` (main sales interface)
  - `<ServiceSelector />` (select service type)
  - `<PaymentProcessor />` (process payment after service)

- **Conditional Rendering**:
  - Service selector instead of product catalog (if walkin_service active)
  - No pre-payment (payment after service completion)

### Dashboard Widgets

1. **Walk-in Queue Widget**
   - **Data**: Customers waiting, avg wait time, available providers
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `walkin_service` capability active

2. **Provider Availability Widget**
   - **Data**: Providers on shift, currently serving, available
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `walkin_service` capability active

---

## Questions & Decisions

### Q1: Should Walk-in be in Staff or separate module?

**Decision**: **Staff Module** (walk-in is staff availability + queue)

**Rationale**:
- Walk-in is primarily about staff availability
- Only 3 features (too small for separate module)
- Staff module already handles shifts and availability
- No need for complex customer management (walk-ins are minimal tracking)

---

### Q2: Should we track walk-in customers or keep anonymous?

**Options**:
- **Option A**: Anonymous queue (no customer tracking)
  - **Pros**: Simpler, faster
  - **Cons**: No loyalty tracking, no visit history

- **Option B (Recommended)**: Minimal customer tracking (name, phone)
  - **Pros**: Can track loyalty, visit history, contact for promotions
  - **Cons**: Requires customer entry (adds friction)

**Decision**: **Option B - Minimal Customer Tracking**

**Rationale**:
- Minimal tracking (name + phone) provides loyalty benefits
- Optional: business can disable customer tracking in settings
- **Implementation**: Add `requireCustomerInfoForWalkin` boolean in Business Profile settings

---

### Q3: Should walk-in queue have priority system?

**Options**:
- **Option A**: FIFO queue (first in, first out)
  - **Pros**: Fair, simple
  - **Cons**: No priority for VIPs or urgent cases

- **Option B (Recommended)**: Priority queue (VIP, urgent, normal)
  - **Pros**: Better customer service (VIPs skip queue)
  - **Cons**: More complex logic

**Decision**: **Option A - FIFO (with future priority enhancement)**

**Rationale**:
- Start with simple FIFO queue (MVP)
- Add priority system in future enhancement
- **Implementation**: Add `enableQueuePriority` feature flag for future

---

### Q4: Should wait time estimation be automated or manual?

**Options**:
- **Option A (Recommended)**: Automated (based on avg service time)
  - **Formula**: `waitTime = queuePosition * avgServiceTime`
  - **Pros**: No staff input needed, always accurate
  - **Cons**: Requires historical data for avg service time

- **Option B**: Manual (staff estimates)
  - **Pros**: Staff knows better (complex services)
  - **Cons**: Inconsistent, staff overhead

**Decision**: **Option A - Automated Wait Time Estimation**

**Rationale**:
- Automation reduces staff workload
- Historical data improves accuracy over time
- Can be overridden manually if needed
- **Implementation**: Calculate `avgServiceTime` from past completed services

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/staff/walkin/WalkinQueue.tsx` (NEW)
2. `src/modules/staff/walkin/WaitTimeEstimator.tsx` (NEW)
3. `src/modules/staff/walkin/ProviderAvailability.tsx` (NEW)
4. `src/modules/staff/walkin/AddToQueueModal.tsx` (NEW)

### Files to Modify
1. `src/modules/staff/page.tsx` (add "Walk-in" tab conditional on walkin_service capability)
2. `src/config/FeatureRegistry.ts` (add new features: operations_walkin_queue_management, operations_wait_time_estimation)

### Files to Delete
- None (no separate Walkin module)

### Breaking Changes
- None (new capability, no existing walk-in logic to break)

### Testing Required
- [ ] Walk-in queue flow (add customer → serve → payment)
- [ ] Wait time estimation (accuracy vs manual estimation)
- [ ] Provider availability (correct availability calculation)
- [ ] Queue management (FIFO order maintained)
- [ ] Conditional UI (walk-in tab only shows if capability active)

---

## Implementation Estimate

**Time**: 2-3 days

| Task | Duration | Effort |
|------|----------|--------|
| Add WalkinQueue component | 0.5 day | Low |
| Implement WaitTimeEstimator | 0.5 day | Low |
| Add ProviderAvailability component | 0.5 day | Low |
| Create AddToQueueModal | 0.5 day | Low |
| Update Staff page (add Walk-in tab) | 0.5 day | Low |
| Testing (unit + integration) | 1 day | Medium |

**Risk**: Low (new feature, no migration, minimal dependencies)

---

**END OF CAPABILITY 5: walkin_service**

---
# CAPABILITY 6: appointment_based

**Type**: service_mode
**Icon**: 📅
**Features**: 13 (9 scheduling/customer + 4 staff)

---

## Business Flow Analysis

**User Journey** (Dental Clinic/Spa/Consulting Scenario):

1. **Service Discovery**: Customer browses available services (dental cleaning, massage, consultation)
2. **Provider Selection**: Customer selects preferred provider (dentist, therapist, consultant) [optional]
3. **Date/Time Selection**: Customer views calendar and selects available date/time slot
4. **Booking Confirmation**: Customer confirms appointment and provides contact info
5. **Confirmation Notification**: Customer receives email/SMS confirmation with details
6. **Reminder Sent**: System sends reminder 24h/1h before appointment (configurable)
7. **Check-in**: Customer arrives at scheduled time, staff checks them in
8. **Service Delivery**: Provider performs service (exam, massage, consultation)
9. **Service Completion**: Service ends, staff marks appointment as completed
10. **Payment Processing**: Customer pays after service (or pre-paid online)
11. **Follow-up**: System tracks service history for future recommendations
12. **Rescheduling/Cancellation**: Customer can reschedule or cancel (with policies)

**Pain Points in Current Structure**:

1. **Scheduling vs Calendar Confusion**:
   - Scheduling module is used for BOTH staff shifts AND customer appointments
   - No clear separation between:
     - Staff scheduling (when employees work)
     - Customer appointments (when services are booked)
   - **Impact**: Confusing UX, mixed concerns

2. **Customer Features Scattered**:
   - Customer service history in Customers module
   - Appointment booking in Scheduling module
   - Reminders in both modules (duplication?)
   - **Impact**: Fragmented customer journey

3. **No Inventory Dependencies**:
   - Appointment-based services DON'T require inventory
   - Unlike onsite/pickup/delivery (which need stock tracking)
   - Services are time-based, not product-based
   - **Impact**: Fundamentally different from fulfillment (Service vs Fulfillment)

4. **Scheduling Module Overload**:
   - Scheduling currently handles:
     - Staff shifts (when employees work)
     - Appointments (when customers book services)
     - Production schedules (when orders are prepared)
     - Deliveries (when orders are dispatched)
   - **Impact**: Module is doing too much, should focus on customer appointments

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 13 features:**

### SCHEDULING Domain (4 features)
- `scheduling_appointment_booking` ✅ **KEEP** - Core appointment booking
- `scheduling_calendar_management` ✅ **KEEP** - Calendar view, availability
- `scheduling_reminder_system` ✅ **KEEP** - Automated reminders (SMS/email)
- `scheduling_availability_rules` ✅ **KEEP** - Business hours, provider availability

**Analysis**: All scheduling features are essential for appointments

### CUSTOMER Domain (4 features)
- `customer_service_history` ✅ **KEEP** - Track past appointments
- `customer_preference_tracking` ✅ **KEEP** - Preferred provider, services
- `customer_online_reservation` ✅ **KEEP** - Online booking portal
- `customer_reservation_reminders` ❓ **QUESTION** - DUPLICATE with scheduling_reminder_system?

**Analysis**: Customer features support customer-facing appointment experience

### SALES Domain (1 feature)
- `sales_package_management` ✅ **KEEP** - Service packages (e.g., "10 massage sessions")

**Analysis**: Packages allow upselling and prepayment

### STAFF Domain (4 features)
- `staff_employee_management` ✅ **KEEP** - Service providers (doctors, therapists)
- `staff_shift_management` ✅ **KEEP** - When providers are available
- `staff_time_tracking` ✅ **KEEP** - Track hours worked
- `staff_performance_tracking` ✅ **KEEP** - Provider performance (appointments completed, ratings)

**Analysis**: 100% identical to walkin_service staff features

**OVERLAP SUMMARY**:
- **Shared with walkin_service**: 4/13 (31%) - Same staff features
- **Unique to appointment_based**: 9/13 (69%) - Scheduling, customer, packages

**BUG IDENTIFIED**:
- `customer_reservation_reminders` seems duplicate of `scheduling_reminder_system`
- Both send reminders for appointments
- **Recommendation**: Eliminate `customer_reservation_reminders`, keep `scheduling_reminder_system`

---

## Proposed Module Structure (IDEAL)

### Option A: Scheduling Module (Recommended)

```
Module: Scheduling
├─ Purpose: Customer appointment management (booking, calendar, reminders)
├─ Route: /admin/resources/scheduling
│
├─ Submodules:
│  ├─ /appointments (customer-facing appointment booking)
│  │  ├─ AppointmentCalendar.tsx (calendar view with availability)
│  │  ├─ AppointmentBooking.tsx (book new appointment)
│  │  ├─ AppointmentList.tsx (upcoming/past appointments)
│  │  └─ RescheduleModal.tsx (reschedule/cancel appointments)
│  │
│  ├─ /availability (provider availability management)
│  │  ├─ ProviderSchedule.tsx (when each provider works)
│  │  ├─ BusinessHours.tsx (business operating hours)
│  │  ├─ BlockedSlots.tsx (vacations, breaks, blocked times)
│  │  └─ AvailabilityRules.tsx (rules: min advance booking, max booking window)
│  │
│  ├─ /reminders (automated reminder system)
│  │  ├─ ReminderSettings.tsx (when to send: 24h, 1h before)
│  │  ├─ ReminderTemplates.tsx (SMS/email templates)
│  │  └─ ReminderLog.tsx (history of sent reminders)
│  │
│  ├─ /online-booking (public-facing booking portal)
│  │  ├─ OnlineBookingPage.tsx (customer self-booking)
│  │  ├─ ServiceSelector.tsx (select service type)
│  │  ├─ ProviderSelector.tsx (select provider or "any available")
│  │  └─ TimeSlotSelector.tsx (select date/time)
│  │
│  └─ /packages (service packages management)
│     ├─ PackageManager.tsx (create/edit packages)
│     ├─ PackagePurchase.tsx (customer buys package)
│     └─ PackageUsage.tsx (track sessions used)
│
├─ Features Activated:
│  ├─ scheduling_appointment_booking
│  ├─ scheduling_calendar_management
│  ├─ scheduling_reminder_system
│  ├─ scheduling_availability_rules
│  ├─ customer_online_reservation
│  └─ sales_package_management
│
├─ Dependencies:
│  ├─ Customers (customer data, service history, preferences)
│  ├─ Staff (provider availability, shifts)
│  ├─ Sales (payment for packages, prepayment)
│  └─ Notification service (SMS/email reminders)
│
└─ Rationale:
   - Scheduling is CUSTOMER-FOCUSED (not staff scheduling)
   - Separate from Staff module (Staff = when employees work, Scheduling = when customers book)
   - NO inventory dependencies (time-based services, not products)
   - Fundamentally different from Fulfillment (Service vs Product delivery)
```

**Pros**:
- ✅ **Clear Separation**: Scheduling = customer appointments, Staff = employee management
- ✅ **Service-Focused**: No inventory confusion (appointments don't need stock)
- ✅ **Scalability**: Easy to add group appointments, recurring appointments
- ✅ **Online Booking**: Public portal separate from admin interface
- ✅ **Module Count**: Keeps Scheduling module (no new modules)

**Cons**:
- ❌ **Scheduling Name Ambiguity**: "Scheduling" could mean staff shifts or appointments
- ❌ **Conditional Complexity**: Must hide appointment features if only walkin_service active

---

### Option B: Separate "Appointments" Module

```
Module: Appointments
├─ Purpose: Customer appointment booking and management
├─ Features: All scheduling_* and customer_online_reservation features
├─ Dependencies: staff, customers, sales
└─ Rationale: Clear distinction from staff scheduling
```

**Pros**:
- ✅ **Clear Naming**: "Appointments" is unambiguous (customer bookings)
- ✅ **Separation**: Appointments separate from Staff shifts

**Cons**:
- ❌ **More Modules**: 22 modules instead of 21 (adds complexity)
- ❌ **Duplicate Logic**: Would duplicate scheduling logic with Staff module
- ❌ **Scheduling Module Orphaned**: What happens to current Scheduling module?

---

### Option C: Appointments in Customers Module

```
Module: Customers
├─ Purpose: CRM + Appointment booking
├─ Submodules:
│  ├─ /crm (customer data, history)
│  └─ /appointments (booking, calendar)
└─ Rationale: Appointments are customer-centric
```

**Pros**:
- ✅ **Customer-Centric**: Appointments tied to customer data

**Cons**:
- ❌ **Wrong Abstraction**: Customers = CRM (data), not operations (booking)
- ❌ **Module Bloat**: Customers module becomes too large
- ❌ **Calendar in CRM?**: Scheduling logic doesn't belong in CRM

---

## Recommendation: **Option A (Scheduling Module)**

**Rationale**:

### 1. Business Value
- **Clear Purpose**: Scheduling module is for customer appointments (rename internally if needed)
- **Service Mode**: Appointment-based is service delivery (not product fulfillment)
- **Scalability**: Easy to add recurring appointments, group bookings, waitlist

### 2. User Experience
- **Single Location**: All appointment management in one place
- **Online Booking**: Public portal for customer self-service
- **Provider Management**: Availability rules integrated with staff shifts

### 3. Technical Complexity
- **Clean Architecture**: Scheduling separate from Staff (different concerns)
- **No Inventory**: Appointments don't need stock tracking (unlike fulfillment)
- **Existing Module**: Scheduling module already exists (enhance, don't recreate)

### 4. Key Insight: Service vs Fulfillment
- **Service Mode** (appointment_based, walkin_service):
  - Time-based (calendar, appointments, shifts)
  - NO inventory dependencies
  - Scheduling module

- **Fulfillment Mode** (onsite, pickup, delivery):
  - Product-based (orders, stock, preparation)
  - Inventory dependencies
  - Fulfillment module

- **Conclusion**: Keep Scheduling and Fulfillment as separate domains

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Scheduling (ENHANCED)
- **Purpose**: Customer appointment management (booking, calendar, reminders)
- **Features Activated**:
  - `scheduling_appointment_booking`
  - `scheduling_calendar_management`
  - `scheduling_reminder_system`
  - `scheduling_availability_rules`
  - `customer_online_reservation`
  - `sales_package_management`
- **Dependencies**:
  - Customers (service history, preferences)
  - Staff (provider availability)
  - Sales (payment for packages)
  - Notification service (reminders)
- **Routes**:
  - `/admin/resources/scheduling` (main)
  - `/admin/resources/scheduling/appointments` (appointment list)
  - `/admin/resources/scheduling/calendar` (calendar view)
  - `/public/booking` (online booking portal) [NEW - public route]

#### 2. Customers (ENHANCED)
- **Purpose**: CRM with service history tracking
- **Features Activated**:
  - `customer_service_history` (track past appointments)
  - `customer_preference_tracking` (preferred provider, services)
- **Dependencies**: Scheduling (appointment data)
- **Routes**: `/admin/core/crm/customers`

#### 3. Staff (UNCHANGED)
- **Purpose**: Employee management, shifts, performance
- **Features**: (same as walkin_service)
- **Routes**: `/admin/resources/staff`

### Supporting Modules
- **Sales**: Package purchase, prepayment
- **Dashboard**: Upcoming appointments widget, provider availability
- **Notifications**: SMS/email reminders (infrastructure service)

---

## Cross-Module Integration Points

### Scheduling Module PROVIDES (Appointment-Specific):

**Hooks**:
- `scheduling.appointment.toolbar.actions`
  - **Description**: Add actions to appointment toolbar
  - **Consumers**: Reporting (export appointments), Customers (view customer history)
  - **Example**: Add "Export Calendar" button

- `scheduling.calendar.slot.click`
  - **Description**: Handle click on calendar slot
  - **Consumers**: Dashboard (quick booking from widget)
  - **Example**: Click empty slot → open booking modal

**Events**:
- `scheduling.appointment_booked`
  - **Payload**: `{ appointmentId, customerId, providerId, serviceType, scheduledAt }`
  - **Listeners**: Customers (track service history), Staff (update provider metrics), Notifications (send confirmation)

- `scheduling.appointment_reminder_sent`
  - **Payload**: `{ appointmentId, customerId, reminderType: '24h' | '1h', sentAt }`
  - **Listeners**: Dashboard (update reminder log), Customers (track communications)

- `scheduling.appointment_completed`
  - **Payload**: `{ appointmentId, customerId, providerId, completedAt, duration }`
  - **Listeners**: Staff (update performance), Customers (update service history), Sales (trigger payment)

**Widgets**:
- `dashboard.upcoming-appointments`
  - **Location**: Dashboard main grid (only if appointment_based active)
  - **Purpose**: Show upcoming appointments (next 24h)
  - **Data**: Appointment list, customer names, providers, times

- `dashboard.provider-calendar`
  - **Location**: Dashboard main grid
  - **Purpose**: Mini calendar showing provider availability
  - **Data**: Available slots, booked slots, blocked times

### Scheduling Module CONSUMES (Appointment-Specific):

**Hooks**:
- `staff.provider-availability`
  - **Provider**: Staff module
  - **Usage**: Get provider availability for calendar
  - **Example**: Show only slots when provider is on shift

- `customers.service-preferences`
  - **Provider**: Customers module
  - **Usage**: Pre-fill booking form with preferred provider, services
  - **Example**: Autofill "Dr. Smith" if customer prefers this provider

**Stores** (Zustand):
- `staffStore.employees`
  - **From**: Staff module
  - **Usage**: List providers in booking form

- `customersStore.customers`
  - **From**: Customers module
  - **Usage**: Get customer data for appointment booking

**Events**:
- `staff.shift_updated`
  - **Provider**: Staff module
  - **Usage**: Refresh calendar availability when provider shifts change
  - **Payload**: `{ providerId, shiftStart, shiftEnd }`

---

## UI/UX Flow

### Main Pages

#### 1. `/admin/resources/scheduling` (Scheduling Hub)
- **Components**:
  - `<SchedulingTabs />` (Calendar | Appointments | Availability | Reminders | Packages)
  - `<UpcomingAppointments />` (list of today's/tomorrow's appointments)
  - `<SchedulingMetrics />` (bookings today, cancellation rate, avg duration)

- **Conditional Rendering**:
  - Only show if `appointment_based` capability active
  - Show "Packages" tab only if `sales_package_management` feature active

#### 2. `/admin/resources/scheduling/calendar` (Calendar View)
- **Components**:
  - `<AppointmentCalendar />` (full calendar with appointments)
  - `<ProviderFilter />` (filter by provider or "all providers")
  - `<ViewSelector />` (day/week/month view)
  - `<AppointmentCard />` (individual appointment on calendar)
  - `<QuickBookingModal />` (click empty slot → quick book)

- **Features**:
  - Drag-and-drop to reschedule
  - Color-coded by service type or provider
  - Show availability gaps
  - Block time slots (breaks, vacations)

#### 3. `/admin/resources/scheduling/appointments` (Appointment List)
- **Components**:
  - `<AppointmentList />` (table of appointments)
  - `<AppointmentFilters />` (filter by date, provider, service, status)
  - `<AppointmentActions />` (reschedule, cancel, mark complete)
  - `<BulkActions />` (bulk cancel, bulk reschedule)

- **Statuses**: Scheduled, Confirmed, Checked-in, Completed, No-show, Cancelled

#### 4. `/public/booking` (Online Booking Portal - NEW)
- **Components**:
  - `<ServiceSelector />` (select service type: "Dental Cleaning", "Massage")
  - `<ProviderSelector />` (select provider or "any available")
  - `<CalendarView />` (show available slots)
  - `<TimeSlotSelector />` (select specific time slot)
  - `<CustomerForm />` (name, email, phone, notes)
  - `<BookingConfirmation />` (confirmation with details)

- **Public Access**: No login required (or optional account creation)
- **Customization**: Business branding, colors, logo

### Dashboard Widgets

1. **Upcoming Appointments Widget**
   - **Data**: Next 24h appointments
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `appointment_based` capability active

2. **Provider Availability Widget**
   - **Data**: Available/busy/offline providers
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `appointment_based` capability active

3. **Booking Rate Widget**
   - **Data**: Bookings today vs target, cancellation rate
   - **Location**: Dashboard main grid
   - **Conditional**: Only if `appointment_based` capability active

---

## Questions & Decisions

### Q1: Should Scheduling be customer appointments or staff shifts?

**Decision**: **Customer Appointments** (staff shifts stay in Staff module)

**Rationale**:
- Scheduling module focus: customer-facing appointment booking
- Staff module focus: employee management, shifts, availability
- Clear separation of concerns (customer service vs employee management)

---

### Q2: Should we eliminate duplicate reminder features?

**Current**:
- `scheduling_reminder_system` (in Scheduling module)
- `customer_reservation_reminders` (in Customers module)

**Decision**: **Eliminate `customer_reservation_reminders`**

**Rationale**:
- Duplicate functionality (both send appointment reminders)
- Reminders belong in Scheduling (where appointments are managed)
- Customers module should only track history, not send reminders

**Implementation**:
- Remove `customer_reservation_reminders` from FeatureRegistry
- Update `appointment_based` capability to remove this feature
- Keep `scheduling_reminder_system` as single source of truth

---

### Q3: Should online booking require customer account or allow anonymous?

**Options**:
- **Option A**: Require customer account
  - **Pros**: Better customer tracking, loyalty, history
  - **Cons**: Friction (registration required)

- **Option B (Recommended)**: Optional account (guest booking allowed)
  - **Pros**: Lower friction, faster booking
  - **Cons**: Less customer data

**Decision**: **Option B - Guest Booking Allowed**

**Rationale**:
- Lower friction improves conversion
- Can optionally create account after booking
- Business can toggle `requireAccountForBooking` in settings

---

### Q4: Should we support recurring appointments?

**Options**:
- **Option A**: No recurring (MVP)
  - **Pros**: Simpler implementation
  - **Cons**: Missing common use case (therapy, classes)

- **Option B (Recommended)**: Support recurring from day one
  - **Pros**: Meets common use case (weekly therapy, monthly checkup)
  - **Cons**: More complex booking logic

**Decision**: **Option A - No Recurring (add in future enhancement)**

**Rationale**:
- Start with simple one-time appointments (MVP)
- Add recurring appointments in Phase 2
- **Implementation**: Add `enableRecurringAppointments` feature flag for future

---

### Q5: Should appointments integrate with payment (prepayment)?

**Options**:
- **Option A**: Payment after service only
  - **Pros**: Simpler (traditional flow)
  - **Cons**: Risk of no-shows

- **Option B (Recommended)**: Optional prepayment
  - **Pros**: Reduces no-shows, better cash flow
  - **Cons**: May reduce bookings

**Decision**: **Option B - Optional Prepayment**

**Rationale**:
- Business can require prepayment for high no-show rates
- Configurable: `requirePrepayment` boolean in Business Profile
- Can require deposit instead of full payment (e.g., 50%)

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/scheduling/appointments/AppointmentCalendar.tsx` (NEW)
2. `src/modules/scheduling/appointments/AppointmentBooking.tsx` (NEW)
3. `src/modules/scheduling/online-booking/OnlineBookingPage.tsx` (NEW - public portal)
4. `src/modules/scheduling/reminders/ReminderSettings.tsx` (NEW)
5. `src/modules/scheduling/packages/PackageManager.tsx` (NEW)

### Files to Modify
1. `src/modules/scheduling/page.tsx` (add appointment-focused UI)
2. `src/config/FeatureRegistry.ts` (remove duplicate `customer_reservation_reminders`)
3. `src/config/BusinessModelRegistry.ts` (update `appointment_based` to remove duplicate feature)

### Files to Delete
- None (enhance existing Scheduling module)

### Breaking Changes
- Remove `customer_reservation_reminders` feature (duplicate)
- Redirect: `/scheduling` → `/admin/resources/scheduling/appointments`

### Testing Required
- [ ] Appointment booking flow (select service → provider → time → confirm)
- [ ] Online booking portal (public access, no login)
- [ ] Reminder system (send 24h/1h reminders)
- [ ] Provider availability (only show available slots)
- [ ] Reschedule/cancel flow (customer or staff-initiated)
- [ ] Package management (purchase, track usage)

---

## Implementation Estimate

**Time**: 5-7 days

| Task | Duration | Effort |
|------|----------|--------|
| Create AppointmentCalendar (day/week/month) | 2 days | High |
| Implement AppointmentBooking | 1 day | Medium |
| Build Online Booking Portal (public) | 1.5 days | High |
| Implement Reminder System (SMS/email) | 1 day | Medium |
| Create Package Management | 1 day | Medium |
| Integrate with Staff (provider availability) | 0.5 day | Low |
| Testing (unit + integration + e2e) | 1.5 days | High |

**Risk**: Medium (complex calendar UI, reminder scheduling)

---

**END OF CAPABILITY 6: appointment_based**

---
# CAPABILITY 7: online_store

**Type**: special_operation
**Icon**: 🌐
**Features**: 11

---

## Business Flow Analysis

**User Journey** (E-commerce Store Scenario):

1. **Browse Catalog**: Customer visits online store, browses products
2. **Add to Cart**: Customer adds items to shopping cart
3. **Cart Review**: Customer reviews cart, applies coupons, calculates shipping
4. **Checkout**: Customer enters shipping address, payment info
5. **Payment Processing**: Online payment gateway (credit card, PayPal, etc.)
6. **Order Confirmation**: Customer receives email with order details
7. **Deferred Fulfillment**: Order enters fulfillment queue (pickup/delivery scheduled later)
8. **Fulfillment**: Business prepares order at scheduled time
9. **Delivery/Pickup**: Customer receives order (delivery or pickup)
10. **Post-Purchase**: Customer can track order, leave review

**Pain Points in Current Structure**:

1. **E-commerce vs POS Confusion**:
   - Sales module handles both POS (in-person) and e-commerce (online)
   - E-commerce needs cart, checkout, deferred fulfillment
   - POS needs immediate fulfillment
   - **Impact**: Mixed concerns in Sales module

2. **Deferred Fulfillment Missing**:
   - Online orders are placed NOW but fulfilled LATER (hours/days)
   - Need "order queue" separate from immediate fulfillment
   - Fulfillment scheduling (pickup window, delivery date)
   - **Impact**: Cannot handle async order processing

3. **Customer Accounts Required**:
   - E-commerce needs customer accounts (login, order history)
   - Unlike POS (anonymous or minimal tracking)
   - **Impact**: Different customer relationship model

4. **Analytics Needs**:
   - E-commerce needs conversion tracking (abandoned carts, funnel)
   - POS doesn't need these metrics
   - **Impact**: Analytics module must support e-commerce KPIs

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 11 features:**

### SALES Domain (6 features)
- `sales_catalog_ecommerce` ✅ **KEEP** - Online product catalog (vs POS catalog)
- `sales_online_order_processing` ✅ **KEEP** - E-commerce order flow
- `sales_online_payment_gateway` ✅ **KEEP** - Stripe, PayPal, etc.
- `sales_cart_management` ✅ **KEEP** - Shopping cart
- `sales_checkout_process` ✅ **KEEP** - Checkout flow
- `sales_coupon_management` ✅ **KEEP** - Discount codes (SHARED with onsite/pickup/delivery)

**Analysis**: E-commerce sales features

### ANALYTICS Domain (2 features)
- `analytics_ecommerce_metrics` ✅ **KEEP** - Conversion rate, avg order value
- `analytics_conversion_tracking` ✅ **KEEP** - Funnel analysis (cart → checkout → payment)

**Analysis**: E-commerce-specific analytics

### OPERATIONS Domain (1 feature)
- `operations_deferred_fulfillment` ✅ **KEEP** - Schedule fulfillment for later

**Analysis**: Key differentiator (async fulfillment)

### INVENTORY Domain (1 feature)
- `inventory_available_to_promise` ✅ **KEEP** - Real-time stock availability for online orders

**Analysis**: Prevents overselling

### CUSTOMER Domain (1 feature)
- `customer_online_accounts` ✅ **KEEP** - Customer login, order history

**Analysis**: E-commerce requires accounts (vs POS optional)

**OVERLAP SUMMARY**:
- **Shared with onsite/pickup/delivery**: 1/11 (9%) - `sales_coupon_management`
- **Unique to online_store**: 10/11 (91%)

---

## Proposed Module Structure (IDEAL)

### Option A: E-commerce as Sales Enhancement (Recommended)

```
Module: Sales
├─ Purpose: All sales channels (POS, e-commerce, B2B)
├─ Route: /admin/operations/sales
│
├─ Submodules:
│  ├─ /pos (in-person sales) [existing]
│  │  ├─ POSInterface.tsx
│  │  ├─ PaymentProcessor.tsx
│  │  └─ ReceiptPrinter.tsx
│  │
│  ├─ /ecommerce (NEW - for online_store capability)
│  │  ├─ OnlineStore.tsx (storefront management)
│  │  ├─ ProductCatalog.tsx (online product catalog)
│  │  ├─ ShoppingCart.tsx (cart management)
│  │  ├─ Checkout.tsx (checkout flow)
│  │  ├─ PaymentGateway.tsx (Stripe, PayPal integration)
│  │  └─ OrderQueue.tsx (deferred fulfillment queue)
│  │
│  ├─ /analytics (for analytics features)
│  │  ├─ EcommerceMetrics.tsx (conversion rate, AOV)
│  │  ├─ ConversionFunnel.tsx (cart → checkout → payment)
│  │  └─ AbandonedCarts.tsx (recover abandoned carts)
│  │
│  └─ /shared (shared between POS and e-commerce)
│     ├─ CouponManagement.tsx
│     ├─ OrderHistory.tsx
│     └─ PaymentProcessing.tsx
│
├─ Features Activated:
│  ├─ POS: sales_pos_onsite, sales_dine_in_orders
│  ├─ E-commerce: sales_catalog_ecommerce, sales_online_order_processing, etc.
│  └─ Shared: sales_coupon_management, sales_payment_processing
│
├─ Dependencies:
│  ├─ Fulfillment (deferred fulfillment scheduling)
│  ├─ Materials (stock availability)
│  ├─ Customers (online accounts, order history)
│  └─ Payment gateways (Stripe, PayPal, MercadoPago)
│
└─ Rationale:
   - Sales is universal (POS + e-commerce + B2B)
   - E-commerce is sales channel, not separate concern
   - Shared coupon/payment logic (DRY)
   - Conditional UI: show /ecommerce only if online_store active
```

**Pros**:
- ✅ **Unified Sales**: All sales channels in one module
- ✅ **DRY**: Shared coupon, payment logic
- ✅ **Scalability**: Easy to add new sales channels (marketplace, wholesale)
- ✅ **Module Count**: No new modules (stays at 21)

**Cons**:
- ❌ **Sales Module Grows**: Adds e-commerce subfolder
- ❌ **Conditional Complexity**: Must hide e-commerce UI if capability not active

---

### Option B: Separate "E-commerce" Module

```
Module: Ecommerce
├─ Purpose: Online store management
├─ Features: All sales_catalog_ecommerce, sales_online_*, analytics_ecommerce_*
├─ Dependencies: sales (payment processing), fulfillment, customers
└─ Rationale: E-commerce is complex enough for separate module
```

**Pros**:
- ✅ **Separation**: E-commerce isolated from POS

**Cons**:
- ❌ **More Modules**: 22 modules instead of 21
- ❌ **Duplicate Logic**: Would duplicate coupon, payment logic
- ❌ **Wrong Abstraction**: E-commerce is sales channel, not separate domain

---

## Recommendation: **Option A (E-commerce in Sales Module)**

**Rationale**:

### 1. Business Value
- **Unified Commerce**: POS and e-commerce share customers, products, inventory
- **DRY**: Coupons, payments shared across channels
- **Omnichannel**: Customer can buy online, pick up in store

### 2. User Experience
- **Single Sales Hub**: Manage all sales from one module
- **Contextual UI**: Show e-commerce tab only if online_store active
- **Seamless**: Online orders flow into same fulfillment queue as POS orders

### 3. Technical Complexity
- **Shared Code**: Payment, coupon, order logic reused
- **Clean Architecture**: Sales = commerce, Fulfillment = logistics
- **Easy Integration**: E-commerce orders use same fulfillment infrastructure

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Sales (ENHANCED)
- **Purpose**: All sales channels (POS, e-commerce, B2B)
- **Features**: All sales_* features
- **Routes**:
  - `/admin/operations/sales/ecommerce` (e-commerce management)
  - `/admin/operations/sales/ecommerce/catalog` (product catalog)
  - `/admin/operations/sales/ecommerce/orders` (order queue)
  - `/shop` (public storefront) [NEW - public route]

#### 2. Fulfillment (ENHANCED)
- **Purpose**: Deferred fulfillment scheduling
- **Features**: `operations_deferred_fulfillment` (NEW)
- **Routes**: `/admin/operations/fulfillment/queue`

#### 3. Customers (ENHANCED)
- **Purpose**: Customer accounts, order history
- **Features**: `customer_online_accounts`
- **Routes**: `/admin/core/crm/customers`

### Supporting Modules
- **Materials**: `inventory_available_to_promise` (real-time stock)
- **Dashboard**: E-commerce metrics widget
- **Payment Gateways**: Stripe, PayPal, MercadoPago integration

---

## Cross-Module Integration Points

### Sales Module PROVIDES (E-commerce-Specific):

**Events**:
- `sales.ecommerce_order_placed`
  - **Payload**: `{ orderId, customerId, items[], fulfillmentType: 'pickup' | 'delivery', scheduledFor }`
  - **Listeners**: Fulfillment (add to deferred queue), Customers (update order history)

- `sales.cart_abandoned`
  - **Payload**: `{ cartId, customerId, items[], abandonedAt }`
  - **Listeners**: Analytics (track abandonment), Marketing (send recovery email)

**Widgets**:
- `dashboard.ecommerce-metrics`
  - **Location**: Dashboard main grid (only if online_store active)
  - **Purpose**: Conversion rate, AOV, abandoned carts
  - **Data**: Orders today, conversion rate, abandoned cart count

### Sales Module CONSUMES (E-commerce-Specific):

**Hooks**:
- `fulfillment.schedule-deferred`
  - **Provider**: Fulfillment module
  - **Usage**: Schedule fulfillment for online order
  - **Example**: Customer selects "pickup tomorrow at 3pm"

- `materials.check-availability`
  - **Provider**: Materials module
  - **Usage**: Real-time stock check for online orders
  - **Example**: Show "In Stock" or "Out of Stock" on product page

---

## UI/UX Flow

### Admin Pages

#### 1. `/admin/operations/sales/ecommerce` (E-commerce Hub)
- **Components**:
  - `<EcommerceTabs />` (Orders | Catalog | Analytics)
  - `<OrderQueue />` (pending online orders)
  - `<EcommerceMetrics />` (conversion rate, AOV)

#### 2. `/admin/operations/sales/ecommerce/catalog` (Product Catalog Management)
- **Components**:
  - `<ProductList />` (online products)
  - `<ProductForm />` (add/edit product)
  - `<StockIndicator />` (show real-time availability)

### Public Pages

#### 3. `/shop` (Public Storefront - NEW)
- **Components**:
  - `<ProductGrid />` (browse products)
  - `<ShoppingCart />` (cart sidebar)
  - `<Checkout />` (checkout flow)
  - `<PaymentGateway />` (Stripe/PayPal)

---

## Questions & Decisions

### Q1: Should e-commerce be in Sales or separate module?

**Decision**: **Sales Module** (e-commerce is sales channel)

**Rationale**: E-commerce shares logic with POS (coupons, payments, products)

---

### Q2: Should online orders require customer account?

**Decision**: **Require Account** (unlike POS which is optional)

**Rationale**: E-commerce needs order history, tracking, reorders

---

### Q3: Should e-commerce integrate with fulfillment?

**Decision**: **Yes - Deferred Fulfillment**

**Rationale**: Online orders placed now, fulfilled later (pickup/delivery scheduled)

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/sales/ecommerce/OnlineStore.tsx` (NEW)
2. `src/modules/sales/ecommerce/ShoppingCart.tsx` (NEW)
3. `src/modules/sales/ecommerce/Checkout.tsx` (NEW)
4. `src/public/shop/` (NEW - public storefront)

### Files to Modify
1. `src/modules/sales/page.tsx` (add e-commerce tab)
2. `src/modules/fulfillment/core/FulfillmentQueue.tsx` (add deferred orders)

---

## Implementation Estimate

**Time**: 6-8 days

| Task | Duration | Effort |
|------|----------|--------|
| Create e-commerce subfolder | 0.5 day | Low |
| Implement Shopping Cart | 1 day | Medium |
| Build Checkout Flow | 1.5 days | High |
| Integrate Payment Gateway (Stripe) | 1.5 days | High |
| Create Public Storefront | 2 days | High |
| Implement Deferred Fulfillment | 1 day | Medium |
| Testing | 1.5 days | High |

**Risk**: Medium (payment gateway integration, public storefront security)

---

**END OF CAPABILITY 7: online_store**

---
# CAPABILITY 8: mobile_operations

**Type**: special_operation
**Icon**: 🚐
**Features**: 9

---

## Business Flow Analysis

**User Journey** (Food Truck/Mobile Service Scenario):

1. **Route Planning**: Operator plans daily route (locations, times)
2. **Vehicle Preparation**: Load inventory onto truck (limited capacity)
3. **Travel to Location**: Drive to first location (park, truck, event)
4. **Location Check-in**: Operator marks arrival at location (GPS tracking)
5. **Service Start**: Open for business at current location
6. **Sales (Offline-First)**: Accept orders and payments (mobile POS, offline mode)
7. **Inventory Constraints**: Track limited stock in truck (no restocking until end of day)
8. **Location Change**: Move to next location on route
9. **End of Day**: Return to base, sync all transactions, restock truck
10. **Route Analysis**: Review route performance (sales by location, best times)

**Pain Points in Current Structure**:

1. **No Mobile Infrastructure**:
   - No offline POS (requires internet connection)
   - No location tracking (GPS)
   - No route planning
   - **Impact**: Cannot support mobile businesses

2. **Inventory Constraints Missing**:
   - Mobile businesses have LIMITED inventory (truck capacity)
   - Cannot restock during day
   - Need "mobile inventory" separate from warehouse stock
   - **Impact**: Overselling risk (sell more than truck capacity)

3. **Sync Management Missing**:
   - Offline transactions must sync when online
   - Conflict resolution (what if same item sold offline and online?)
   - **Impact**: Data inconsistency, lost sales

4. **Location Services Missing** (from delivery_shipping analysis):
   - Mobile module needed for GPS tracking, route planning
   - Shared with delivery_shipping capability
   - **Impact**: Must create Mobile infrastructure module

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 9 features:**

### MOBILE Domain (5 features)
- `mobile_pos_offline` ✅ **KEEP** - POS works offline, syncs later
- `mobile_location_tracking` ✅ **KEEP** - GPS tracking of truck location
- `mobile_route_planning` ✅ **KEEP** - Plan daily routes (locations + times)
- `mobile_inventory_constraints` ✅ **KEEP** - Limited truck inventory
- `mobile_sync_management` ✅ **KEEP** - Sync offline transactions

**Analysis**: All mobile features are unique to this capability

### STAFF Domain (4 features)
- `staff_employee_management` ✅ **KEEP** - Drivers, mobile staff
- `staff_shift_management` ✅ **KEEP** - Schedule drivers, routes
- `staff_time_tracking` ✅ **KEEP** - Track hours on route
- `staff_performance_tracking` ✅ **KEEP** - Sales performance by driver/route

**Analysis**: Same staff features as other capabilities

**OVERLAP SUMMARY**:
- **Shared with other capabilities**: 4/9 (44%) - Staff features
- **Unique to mobile_operations**: 5/9 (56%) - All mobile_* features

---

## Proposed Module Structure (IDEAL)

### Option A: Create Mobile Infrastructure Module (Strongly Recommended)

```
Module: Mobile (NEW - Infrastructure Service)
├─ Purpose: Location services, offline POS, route planning
├─ Route: /admin/operations/mobile
│
├─ Submodules:
│  ├─ /pos (offline-capable POS)
│  │  ├─ MobilePOS.tsx (POS interface, works offline)
│  │  ├─ OfflineQueue.tsx (queued transactions waiting to sync)
│  │  ├─ SyncManager.tsx (sync offline transactions when online)
│  │  └─ ConflictResolver.tsx (resolve sync conflicts)
│  │
│  ├─ /location (GPS tracking, route planning)
│  │  ├─ LocationTracker.tsx (track truck GPS location) [SHARED with delivery]
│  │  ├─ RoutePlanner.tsx (plan daily routes)
│  │  ├─ RouteMap.tsx (map view with stops)
│  │  └─ RouteOptimizer.tsx (optimize route by distance/time) [SHARED with delivery]
│  │
│  ├─ /inventory (mobile inventory constraints)
│  │  ├─ MobileInventory.tsx (track truck inventory)
│  │  ├─ TruckCapacity.tsx (set truck capacity limits)
│  │  └─ RestockPlanner.tsx (plan restocking at end of day)
│  │
│  └─ /routes (route management)
│     ├─ DailyRoutes.tsx (schedule daily routes)
│     ├─ LocationLibrary.tsx (saved locations: parks, events)
│     └─ RoutePerformance.tsx (analytics by route/location)
│
├─ Features Activated:
│  ├─ mobile_pos_offline
│  ├─ mobile_location_tracking
│  ├─ mobile_route_planning
│  ├─ mobile_inventory_constraints
│  └─ mobile_sync_management
│
├─ Dependencies:
│  ├─ Sales (mobile POS uses sales logic)
│  ├─ Materials (mobile inventory syncs with warehouse)
│  ├─ Staff (drivers, mobile personnel)
│  └─ Maps API (Google Maps, Mapbox) [SHARED with delivery]
│
├─ Used By:
│  ├─ Mobile Operations (food trucks, mobile services)
│  └─ Delivery Shipping (GPS tracking, route optimization) [SHARED]
│
└─ Rationale:
   - Mobile is INFRASTRUCTURE SERVICE (shared by mobile ops + delivery)
   - Location services reused (GPS, route optimization)
   - Offline-first critical (no internet in truck)
   - Inventory constraints unique to mobile (limited capacity)
```

**Pros**:
- ✅ **Infrastructure Service**: Shared by mobile_operations AND delivery_shipping
- ✅ **Reusable**: GPS tracking, route optimization reused
- ✅ **Offline-First**: POS works without internet
- ✅ **Module Count**: +1 module (21 → 22, justified by shared infrastructure)

**Cons**:
- ❌ **New Module**: Adds one more module to architecture
- ❌ **Complexity**: Offline sync is complex (conflict resolution)

---

### Option B: Mobile Features in Sales Module

```
Module: Sales
├─ Submodules:
│  ├─ /pos (standard POS)
│  ├─ /mobile (mobile POS with offline)
│  └─ /ecommerce (online store)
└─ Rationale: Mobile POS is sales channel
```

**Pros**:
- ✅ **No New Module**: Keep Sales module

**Cons**:
- ❌ **Wrong Abstraction**: Location services don't belong in Sales
- ❌ **Not Reusable**: Can't share GPS tracking with delivery
- ❌ **Sales Module Bloat**: Too many concerns (POS + e-commerce + mobile + delivery)

---

## Recommendation: **Option A (Create Mobile Infrastructure Module)**

**Rationale**:

### 1. Business Value
- **Infrastructure Service**: GPS, route optimization shared with delivery_shipping
- **Offline-First**: Critical for mobile businesses (no internet in truck)
- **Reusable**: Location services used by multiple capabilities

### 2. User Experience
- **Dedicated Hub**: Mobile operations have dedicated interface
- **Route Planning**: Visual route planning with map
- **Offline Confidence**: Staff know transactions will sync later

### 3. Technical Complexity
- **Shared Infrastructure**: GPS tracking, route optimization reused
- **Offline Sync**: Complex enough to warrant dedicated module
- **Clean Separation**: Mobile concerns isolated from Sales

### 4. Module Count Justification
- **+1 Module**: 21 → 22 modules
- **Justified**: Shared infrastructure (mobile ops + delivery)
- **Net Benefit**: Reusable location services > module count increase

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Mobile (NEW - Infrastructure Service)
- **Purpose**: Offline POS, GPS tracking, route planning
- **Features**: All mobile_* features
- **Routes**:
  - `/admin/operations/mobile` (mobile hub)
  - `/admin/operations/mobile/pos` (offline POS)
  - `/admin/operations/mobile/routes` (route planning)
- **Used By**: Mobile Operations, Delivery Shipping

#### 2. Sales (ENHANCED)
- **Purpose**: Order processing (mobile POS uses sales logic)
- **Routes**: `/admin/operations/sales`

#### 3. Materials (ENHANCED)
- **Purpose**: Mobile inventory syncs with warehouse
- **Features**: `mobile_inventory_constraints` (NEW)
- **Routes**: `/admin/supply-chain/materials`

### Supporting Modules
- **Staff**: Drivers, mobile personnel
- **Dashboard**: Mobile operations widget (current location, sales today)
- **Maps API**: Google Maps, Mapbox (SHARED with delivery)

---

## Cross-Module Integration Points

### Mobile Module PROVIDES:

**Hooks**:
- `mobile.location-tracking` (GPS tracking)
  - **Consumers**: Delivery (track drivers), Dashboard (show truck location)

- `mobile.route-optimizer` (route optimization)
  - **Consumers**: Delivery (multi-delivery routes)

**Events**:
- `mobile.location_updated`
  - **Payload**: `{ truckId, location: { lat, lng }, timestamp }`
  - **Listeners**: Dashboard (update map widget), Analytics (track route)

- `mobile.offline_transaction`
  - **Payload**: `{ transactionId, orderId, amount, timestamp }`
  - **Listeners**: Sales (queue for sync), Dashboard (show offline queue)

- `mobile.sync_completed`
  - **Payload**: `{ syncedCount, conflicts[] }`
  - **Listeners**: Dashboard (notify staff), Materials (update inventory)

**Widgets**:
- `dashboard.mobile-location`
  - **Location**: Dashboard main grid (only if mobile_operations active)
  - **Purpose**: Show truck location on map
  - **Data**: Current location, route progress

- `dashboard.offline-queue`
  - **Location**: Dashboard main grid
  - **Purpose**: Show offline transactions waiting to sync
  - **Data**: Queue count, last sync time

---

## UI/UX Flow

### Admin Pages

#### 1. `/admin/operations/mobile` (Mobile Hub)
- **Components**:
  - `<MobileTabs />` (POS | Routes | Inventory | Sync)
  - `<CurrentLocation />` (map showing truck location)
  - `<TodayRoute />` (today's planned route)
  - `<OfflineStatus />` (online/offline indicator, sync status)

#### 2. `/admin/operations/mobile/pos` (Mobile POS)
- **Components**:
  - `<MobilePOS />` (POS interface, works offline)
  - `<OfflineIndicator />` (prominent offline mode indicator)
  - `<SyncButton />` (manual sync trigger)
  - `<OfflineQueue />` (queued transactions)

#### 3. `/admin/operations/mobile/routes` (Route Planning)
- **Components**:
  - `<RoutePlanner />` (plan daily routes)
  - `<RouteMap />` (map with stops)
  - `<LocationLibrary />` (saved locations)
  - `<RoutePerformance />` (analytics by route)

---

## Questions & Decisions

### Q1: Should Mobile be infrastructure service or capability-specific module?

**Decision**: **Infrastructure Service** (shared with delivery)

**Rationale**: GPS tracking, route optimization reused by delivery_shipping

---

### Q2: Should offline POS be separate from standard POS?

**Decision**: **Separate Implementation** (different sync requirements)

**Rationale**: Offline POS has complex sync logic (conflict resolution)

---

### Q3: How to handle inventory constraints (limited truck capacity)?

**Decision**: **Mobile Inventory Separate from Warehouse**

**Rationale**:
- Truck inventory is subset of warehouse inventory
- Sync at end of day (restock truck, update warehouse)
- **Implementation**: Add `mobileInventory` table with `truckId`, `itemId`, `quantity`

---

### Q4: How to handle sync conflicts (item sold offline and online)?

**Decision**: **Last Write Wins (with conflict log)**

**Rationale**:
- Simple conflict resolution (mobile transaction wins)
- Log conflicts for manual review
- **Implementation**: Add `syncConflicts` table with resolution history

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/mobile/` (NEW - entire module)
2. `src/modules/mobile/pos/MobilePOS.tsx` (NEW)
3. `src/modules/mobile/location/LocationTracker.tsx` (NEW)
4. `src/modules/mobile/routes/RoutePlanner.tsx` (NEW)
5. `src/modules/mobile/inventory/MobileInventory.tsx` (NEW)

### Files to Modify
1. `src/modules/sales/` (integrate with mobile POS)
2. `src/modules/materials/` (add mobile inventory constraints)
3. `src/modules/fulfillment/delivery/` (integrate location tracking from Mobile)

---

## Implementation Estimate

**Time**: 8-10 days

| Task | Duration | Effort |
|------|----------|--------|
| Create Mobile module skeleton | 0.5 day | Low |
| Implement Offline POS (IndexedDB) | 2 days | High |
| Implement Sync Manager (conflict resolution) | 2 days | High |
| Integrate GPS tracking (Google Maps) | 1.5 days | High |
| Implement Route Planner | 1.5 days | Medium |
| Implement Mobile Inventory | 1 day | Medium |
| Testing (offline scenarios, sync conflicts) | 2 days | High |

**Risk**: High (offline sync complexity, GPS integration, conflict resolution)

---

**END OF CAPABILITY 8: mobile_operations**

---
# CAPABILITY 9: corporate_sales

**Type**: special_operation
**Icon**: 🏢
**Features**: 15 (4 finance + 7 sales + 2 inventory + 1 operations + 2 staff - staff not counted in unique feature count)

---

## Business Flow Analysis

**User Journey** (B2B Sales/Wholesale Scenario):

1. **Corporate Account Setup**: Register corporate customer (business name, tax ID, credit terms)
2. **Credit Application**: Corporate customer applies for credit line (net 30, net 60)
3. **Credit Approval**: Sales manager approves credit limit ($10,000, $50,000, etc.)
4. **Quote Request**: Corporate customer requests quote for bulk order
5. **Quote Generation**: Sales rep creates quote (tiered pricing, volume discounts)
6. **Quote Approval**: Internal approval workflow (if quote > threshold)
7. **Quote Acceptance**: Customer accepts quote
8. **Purchase Order**: Customer sends PO, quote converts to order
9. **Order Fulfillment**: Order prepared and shipped (may be split shipments)
10. **Invoice Generation**: Invoice sent to corporate customer (net 30 payment terms)
11. **Payment Tracking**: Track invoice aging (overdue, paid)
12. **Credit Management**: Adjust credit limit based on payment history

**Pain Points in Current Structure**:

1. **No B2B Infrastructure**:
   - No corporate accounts (different from individual customers)
   - No credit management (credit limits, payment terms)
   - No NET payment terms (pay later, not immediate)
   - **Impact**: Cannot support B2B sales

2. **Finance Features Missing**:
   - Finance features scattered across modules
   - No dedicated Finance module for B2B
   - Fiscal module is for TAX compliance, not credit/invoicing
   - **Impact**: B2B features have no home

3. **Sales Features Not B2B-Ready**:
   - No contract management
   - No tiered pricing (volume discounts)
   - No approval workflows (large orders need manager approval)
   - **Impact**: Cannot handle complex B2B sales

4. **Vendor Performance Tracking**:
   - Operations feature, not sales feature
   - Should be in Finance or Procurement module
   - **Impact**: Feature in wrong location

---

## Feature Requirements (from FeatureRegistry)

**Currently activates 15 features:**

### FINANCE Domain (4 features - NEW MODULE NEEDED)
- `finance_corporate_accounts` ✅ **KEEP** - Corporate customer accounts (vs individual customers)
- `finance_credit_management` ✅ **KEEP** - Credit limits, aging, collections
- `finance_invoice_scheduling` ✅ **KEEP** - NET 30/60/90 payment terms
- `finance_payment_terms` ✅ **KEEP** - Payment terms configuration

**Analysis**: Finance features are NEW (no Finance module exists yet)

### SALES Domain (7 features)
- `sales_contract_management` ✅ **KEEP** - Long-term contracts with customers
- `sales_tiered_pricing` ✅ **KEEP** - Volume discounts (buy 100+, get 10% off)
- `sales_approval_workflows` ✅ **KEEP** - Approve large orders before processing
- `sales_quote_to_order` ✅ **KEEP** - Quote → PO → Order flow
- `sales_bulk_pricing` ✅ **KEEP** - Bulk pricing rules
- `sales_quote_generation` ✅ **KEEP** - Generate quotes for customers

**Analysis**: B2B sales features (all unique to corporate_sales)

### INVENTORY Domain (2 features)
- `inventory_available_to_promise` ✅ **KEEP** - Real-time stock availability (SHARED with online_store)
- `inventory_demand_forecasting` ✅ **KEEP** - Predict demand for B2B orders (SHARED with requires_preparation)

**Analysis**: Advanced inventory features

### OPERATIONS Domain (1 feature)
- `operations_vendor_performance` ❓ **QUESTION** - Should be in Finance or Procurement, not Operations

**Analysis**: Misplaced feature (vendor performance is finance/procurement concern)

### STAFF Domain (2 features)
- `staff_employee_management` ✅ **KEEP** - Account executives, B2B sales reps
- `staff_performance_tracking` ✅ **KEEP** - Sales rep performance (quotes won, revenue)

**Analysis**: Same staff features as other capabilities

**OVERLAP SUMMARY**:
- **Shared with other capabilities**: 4/15 (27%) - Inventory (2) + Staff (2)
- **Unique to corporate_sales**: 11/15 (73%) - Finance (4) + Sales (7)

**CRITICAL FINDING**:
- **Finance module is MISSING** (no home for finance_* features)
- **Must create Finance module** (NEW) for B2B features

---

## Proposed Module Structure (IDEAL)

### Option A: Create Finance Module + Enhance Sales (Strongly Recommended)

```
Module: Finance (NEW)
├─ Purpose: Corporate accounts, credit management, invoicing
├─ Route: /admin/finance
│
├─ Submodules:
│  ├─ /accounts (corporate accounts management)
│  │  ├─ CorporateAccounts.tsx (list of corporate customers)
│  │  ├─ AccountForm.tsx (create/edit corporate account)
│  │  ├─ CreditApplication.tsx (apply for credit line)
│  │  └─ CreditApproval.tsx (approve/deny credit)
│  │
│  ├─ /credit (credit management)
│  │  ├─ CreditLimits.tsx (set credit limits per account)
│  │  ├─ CreditUsage.tsx (track credit usage)
│  │  ├─ AgingReport.tsx (invoices by age: current, 30d, 60d, 90d+)
│  │  └─ Collections.tsx (overdue invoices, collection workflow)
│  │
│  ├─ /invoicing (invoice management)
│  │  ├─ InvoiceScheduling.tsx (NET 30/60/90 payment terms)
│  │  ├─ InvoiceGeneration.tsx (generate invoices from orders)
│  │  ├─ InvoiceList.tsx (all invoices, filter by status)
│  │  └─ PaymentTerms.tsx (configure payment terms per account)
│  │
│  └─ /reporting (B2B financial reporting)
│     ├─ ARAgingReport.tsx (accounts receivable aging)
│     ├─ CreditUtilization.tsx (credit usage by account)
│     └─ PaymentHistory.tsx (payment history by account)
│
├─ Features Activated:
│  ├─ finance_corporate_accounts
│  ├─ finance_credit_management
│  ├─ finance_invoice_scheduling
│  └─ finance_payment_terms
│
├─ Dependencies:
│  ├─ Sales (receive orders, generate invoices)
│  ├─ Customers (corporate customer data)
│  └─ Fiscal (tax calculation for invoices)
│
└─ Rationale:
   - Finance is NEW DOMAIN (corporate accounts, credit, invoicing)
   - Separate from Fiscal (Fiscal = tax compliance, Finance = B2B credit)
   - Separate from Billing (Billing = recurring subscriptions, Finance = B2B invoices)
   - Clean architecture: Finance = B2B credit/invoicing, Fiscal = tax, Billing = subscriptions

Module: Sales (ENHANCED)
├─ Submodules:
│  ├─ /pos (in-person sales) [existing]
│  ├─ /ecommerce (online store) [existing]
│  ├─ /b2b (NEW - for corporate_sales capability)
│  │  ├─ QuoteGeneration.tsx (create quotes)
│  │  ├─ QuoteApproval.tsx (approval workflow)
│  │  ├─ QuoteToPO.tsx (quote → PO → order)
│  │  ├─ ContractManagement.tsx (long-term contracts)
│  │  ├─ TieredPricing.tsx (volume discounts)
│  │  └─ BulkOrders.tsx (bulk order processing)
│  │
│  └─ /shared (shared sales logic)
│
├─ Features Activated:
│  ├─ B2B: sales_contract_management, sales_tiered_pricing, etc.
│  ├─ POS: sales_pos_onsite, sales_dine_in_orders
│  └─ E-commerce: sales_catalog_ecommerce, sales_online_order_processing
│
└─ Rationale:
   - Sales handles ALL sales channels (POS, e-commerce, B2B)
   - B2B subfolder for corporate sales features
   - Conditional UI: show /b2b only if corporate_sales active
```

**Pros**:
- ✅ **Clean Architecture**: Finance = B2B credit/invoicing (distinct from Fiscal/Billing)
- ✅ **Scalability**: Finance module can grow (payment plans, factoring, etc.)
- ✅ **Separation of Concerns**: Finance separate from Sales (credit vs commerce)
- ✅ **Module Count**: +1 module (21 → 22, justified by new domain)

**Cons**:
- ❌ **New Module**: Adds Finance module (complex implementation)
- ❌ **Finance vs Fiscal Confusion**: Users may confuse Finance (B2B) with Fiscal (tax)

---

### Option B: B2B in Sales Module (No Finance Module)

```
Module: Sales
├─ Submodules:
│  ├─ /b2b (all B2B features including credit, invoicing)
│  └─ /pos, /ecommerce (existing)
└─ Rationale: Keep all sales together
```

**Pros**:
- ✅ **No New Module**: Keep Sales module

**Cons**:
- ❌ **Wrong Abstraction**: Credit management is finance, not sales
- ❌ **Sales Module Bloat**: Too many concerns (POS + e-commerce + B2B + credit)
- ❌ **Finance Features Homeless**: Credit, aging, collections don't belong in Sales

---

## Recommendation: **Option A (Create Finance Module)**

**Rationale**:

### 1. Business Value
- **B2B Essential**: Corporate sales require credit management (distinct from B2C)
- **Clean Separation**: Finance (credit) vs Fiscal (tax) vs Billing (subscriptions)
- **Scalability**: Finance module can grow (payment plans, factoring, cash flow)

### 2. User Experience
- **Dedicated Hub**: Finance team has dedicated interface for credit/invoicing
- **Clear Purpose**: "Finance" = B2B accounts/credit, "Fiscal" = tax compliance
- **Natural Flow**: Quote (Sales) → Order (Sales) → Invoice (Finance) → Payment (Finance)

### 3. Technical Complexity
- **Justified Complexity**: B2B credit management is complex enough for dedicated module
- **Clean Dependencies**: Finance → Sales (invoices), Fiscal (tax calculation)
- **Module Count**: +1 module justified by new domain (Finance)

### 4. Domain Distinction
- **Finance Module** (NEW): Corporate accounts, credit, invoicing (B2B)
- **Fiscal Module** (existing): Tax compliance, AFIP, fiscal printers (all businesses)
- **Billing Module** (existing): Recurring subscriptions (B2C)
- **Conclusion**: Finance is distinct domain (B2B only)

---

## Modules Needed for This Capability

### Primary Modules

#### 1. Finance (NEW)
- **Purpose**: Corporate accounts, credit management, invoicing
- **Features**: All finance_* features
- **Routes**:
  - `/admin/finance` (finance hub)
  - `/admin/finance/accounts` (corporate accounts)
  - `/admin/finance/credit` (credit management)
  - `/admin/finance/invoicing` (invoicing)

#### 2. Sales (ENHANCED)
- **Purpose**: All sales channels (POS, e-commerce, B2B)
- **Features**: All sales_* features (including B2B features)
- **Routes**:
  - `/admin/operations/sales/b2b` (B2B sales)
  - `/admin/operations/sales/b2b/quotes` (quote generation)
  - `/admin/operations/sales/b2b/contracts` (contracts)

### Supporting Modules
- **Customers**: Corporate customer data (merged with corporate accounts in Finance)
- **Materials**: Demand forecasting, available-to-promise
- **Fiscal**: Tax calculation for invoices
- **Dashboard**: AR aging widget, credit utilization widget

---

## Cross-Module Integration Points

### Finance Module PROVIDES (B2B-Specific):

**Hooks**:
- `finance.credit-check`
  - **Description**: Check if customer has available credit
  - **Consumers**: Sales (before accepting order)
  - **Example**: Block order if customer exceeds credit limit

**Events**:
- `finance.invoice_generated`
  - **Payload**: `{ invoiceId, accountId, amount, dueDate, paymentTerms }`
  - **Listeners**: Dashboard (update AR aging), Customers (track invoice history)

- `finance.payment_received`
  - **Payload**: `{ paymentId, invoiceId, accountId, amount, receivedAt }`
  - **Listeners**: Finance (update credit usage), Dashboard (update metrics)

**Widgets**:
- `dashboard.ar-aging`
  - **Location**: Dashboard main grid (only if corporate_sales active)
  - **Purpose**: Accounts receivable aging report
  - **Data**: Current, 30d, 60d, 90d+ overdue invoices

- `dashboard.credit-utilization`
  - **Location**: Dashboard main grid
  - **Purpose**: Credit usage by account
  - **Data**: Total credit, used credit, available credit

### Finance Module CONSUMES (B2B-Specific):

**Hooks**:
- `sales.order-completed`
  - **Provider**: Sales module
  - **Usage**: Generate invoice when order is completed
  - **Example**: Order → Invoice (NET 30 terms)

- `fiscal.calculate-tax`
  - **Provider**: Fiscal module
  - **Usage**: Calculate tax for invoices
  - **Example**: Apply IVA (Argentina) to invoice

---

## UI/UX Flow

### Admin Pages

#### 1. `/admin/finance` (Finance Hub)
- **Components**:
  - `<FinanceTabs />` (Accounts | Credit | Invoicing | Reporting)
  - `<ARAgingWidget />` (accounts receivable aging)
  - `<CreditUtilizationWidget />` (credit usage)

#### 2. `/admin/finance/accounts` (Corporate Accounts)
- **Components**:
  - `<CorporateAccountsList />` (list of corporate customers)
  - `<AccountForm />` (create/edit corporate account)
  - `<CreditApplication />` (apply for credit)

#### 3. `/admin/finance/credit` (Credit Management)
- **Components**:
  - `<CreditLimits />` (set credit limits)
  - `<AgingReport />` (invoices by age)
  - `<Collections />` (overdue invoices)

#### 4. `/admin/operations/sales/b2b` (B2B Sales)
- **Components**:
  - `<QuoteGeneration />` (create quotes)
  - `<QuoteApproval />` (approval workflow)
  - `<ContractManagement />` (contracts)

---

## Questions & Decisions

### Q1: Should Finance be separate module or in Sales?

**Decision**: **Separate Finance Module**

**Rationale**: Credit management is finance concern, not sales concern

---

### Q2: How to distinguish Finance vs Fiscal vs Billing?

**Decision**:
- **Finance**: B2B accounts, credit, invoicing (corporate_sales capability)
- **Fiscal**: Tax compliance, AFIP, fiscal printers (all businesses)
- **Billing**: Recurring subscriptions (memberships, SaaS)

**Rationale**: Each has distinct purpose and user base

---

### Q3: Should vendor performance be in Operations or Finance?

**Decision**: **Move to Finance Module** (vendor performance is procurement/finance concern)

**Rationale**: Vendor performance tracks supplier KPIs (finance/procurement, not operations)

---

## Migration Impact Analysis

### Files to Create
1. `src/modules/finance/` (NEW - entire module)
2. `src/modules/finance/accounts/CorporateAccounts.tsx` (NEW)
3. `src/modules/finance/credit/CreditLimits.tsx` (NEW)
4. `src/modules/finance/invoicing/InvoiceScheduling.tsx` (NEW)
5. `src/modules/sales/b2b/QuoteGeneration.tsx` (NEW)

### Files to Modify
1. `src/modules/sales/page.tsx` (add B2B tab)
2. `src/config/FeatureRegistry.ts` (move operations_vendor_performance to Finance domain)

---

## Implementation Estimate

**Time**: 10-12 days

| Task | Duration | Effort |
|------|----------|--------|
| Create Finance module skeleton | 0.5 day | Low |
| Implement Corporate Accounts | 1.5 days | Medium |
| Implement Credit Management (limits, aging) | 2 days | High |
| Implement Invoice Scheduling (NET terms) | 2 days | High |
| Implement AR Aging Report | 1 day | Medium |
| Create B2B Sales subfolder | 1 day | Medium |
| Implement Quote Generation | 1.5 days | Medium |
| Implement Approval Workflows | 1 day | Medium |
| Testing (B2B flows, credit limits) | 2 days | High |

**Risk**: High (new module, complex B2B logic, credit management)

---

**END OF CAPABILITY 9: corporate_sales**

---

**END OF PHASE 2: ALL 9 CAPABILITIES DESIGNED**

---
