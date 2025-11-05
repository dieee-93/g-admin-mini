# G-ADMIN MINI - FEATURE → MODULE → UI MAPPING

**Version**: 2.0.0
**Date**: 2025-01-24
**Status**: 📋 REFERENCE GUIDE
**Based On**: ARCHITECTURE_DESIGN_V2.md, FeatureRegistry.ts

---

## 📋 PURPOSE

This document maps ALL 81 features to their exact location in the codebase (current code has 84, reduced to 81 after Phase 0.5 cleanup).

**For each feature:**
- **Current State (As-Is)**: Module, route, components before migration
- **Proposed State (To-Be)**: Module, route, components after migration
- **Conditional Rendering**: Activation logic using `hasFeature()`
- **Cross-Module Interactions**: PROVIDES/CONSUMES hooks/events
- **Migration Notes**: Files to move, imports to update

**Use this document to:**
1. Find where a feature is implemented in the codebase
2. Understand feature activation logic
3. Plan migration of features during Phase 0.5
4. Verify all features are correctly mapped after migration

---

## 📊 FEATURE SUMMARY

**Total Features**: 81 (current code: 84, target after Phase 0.5: 81)

**Changes:**
- ✅ **RENAMED**: 2 features (production_recipe_management → production_bom_management, production_kitchen_display → production_display_system)
- ❌ **DELETED**: 3 features (mobile_pos_offline, mobile_sync_management, customer_reservation_reminders - Phase 0.5 Step 1.2)
- 🔄 **MOVED**: 5 features (Floor → Fulfillment/onsite)

**By Domain** (Target after Phase 0.5):
- Sales: 23 features
- Fulfillment: 23 features (includes Floor features)
- Inventory: 12 features
- Staff: 7 features
- Scheduling: 5 features (reduced from 6 after deleting customer_reservation_reminders duplicate)
- Finance: 4 features
- Production: 4 features
- Mobile: 3 features (reduced from 5 after deleting 2 architectural features)
- **TOTAL**: **81 features**

---

## 🔍 HOW TO USE THIS DOCUMENT

### Finding a Feature

**By Feature ID:**
1. Use Ctrl+F to search for feature ID (e.g., `sales_order_management`)
2. Read "Current State" for existing implementation
3. Read "Proposed State" for new location (if changed)

**By Module:**
1. Jump to domain section (e.g., "SALES DOMAIN")
2. Browse features in that domain
3. Check "Module" column for current location

### Understanding Activation Logic

**Pattern:**
```typescript
// In component
const hasOrderManagement = hasFeature('sales_order_management');

if (!hasOrderManagement) return null;

return <OrderManagementUI />;
```

### Migration Checklist

For each feature with **Status: MOVE**:
1. Read "Migration Notes" section
2. Move files to new location
3. Update imports
4. Update route references
5. Test feature activation

---

## 📦 FEATURES BY DOMAIN

---

## DOMAIN 1: SALES (23 features)

### Overview

**Modules**: Sales, Fiscal
**Routes**: `/admin/operations/sales`, `/admin/finance/fiscal`
**Capabilities**: onsite_service, pickup_orders, delivery_shipping, online_store, corporate_sales

---

### F1: sales_order_management

**Feature ID**: `sales_order_management`
**Name**: Order Management
**Description**: Create, manage, and track customer orders

#### Current State (As-Is)

- **Module**: `sales`
- **Route**: `/admin/operations/sales`
- **Components**:
  - `src/pages/admin/operations/sales/components/SalesManagement.tsx` (main)
  - `src/pages/admin/operations/sales/components/OrderList.tsx`
  - `src/pages/admin/operations/sales/components/OrderDetails.tsx`
- **Services**:
  - `src/pages/admin/operations/sales/services/saleApi.ts`

#### Proposed State (To-Be)

✅ **NO CHANGE** (stays in Sales module)

#### Conditional Rendering

```typescript
// In SalesManagement.tsx
const hasOrderManagement = hasFeature('sales_order_management');

if (!hasOrderManagement) {
  return <CapabilityGate requiredCapability="onsite_service" />;
}
```

#### Cross-Module Interactions

**PROVIDES:**
- Event: `sales.order_placed` → Fulfillment, Production, Materials
- Event: `sales.order_completed` → Materials, Fiscal, Customers

**CONSUMES:**
- Store: `customersStore` ← Customers
- Store: `materialsStore` ← Materials
- Hook: `production.order_ready` ← Production

#### Migration Notes

✅ **NO MIGRATION NEEDED** - Feature stays in current location.

---

### F2: sales_payment_processing

**Feature ID**: `sales_payment_processing`
**Name**: Payment Processing
**Description**: Process payments for orders (cash, card, digital wallets)

#### Current State (As-Is)

- **Module**: `sales`
- **Route**: `/admin/operations/sales`
- **Components**:
  - `src/pages/admin/operations/sales/components/Payment/PaymentProcessor.tsx`
  - `src/pages/admin/operations/sales/components/Payment/ModernPaymentProcessor.tsx`
- **Services**:
  - `src/pages/admin/operations/sales/services/saleApi.ts` (payment methods)

#### Proposed State (To-Be)

✅ **NO CHANGE**

#### Conditional Rendering

```typescript
const hasPaymentProcessing = hasFeature('sales_payment_processing');

return (
  <SalesForm>
    {hasPaymentProcessing && <PaymentProcessor />}
  </SalesForm>
);
```

#### Cross-Module Interactions

**PROVIDES:**
- Event: `sales.payment_received` → Fiscal, Billing, Finance

**CONSUMES:**
- Service: `payments.processPayment` ← Finance-Integrations

#### Migration Notes

✅ **NO MIGRATION NEEDED**

---

### F3: sales_pos_onsite

**Feature ID**: `sales_pos_onsite`
**Name**: Point of Sale (Onsite)
**Description**: In-person POS interface for onsite sales

#### Current State (As-Is)

- **Module**: `sales`
- **Route**: `/admin/operations/sales`
- **Components**:
  - `src/pages/admin/operations/sales/components/POSInterface.tsx`
  - `src/pages/admin/operations/sales/components/SalesView.tsx`

#### Proposed State (To-Be)

✅ **NO CHANGE**

#### Conditional Rendering

```typescript
const hasPOSOnsite = hasFeature('sales_pos_onsite');

return hasPOSOnsite ? <POSInterface /> : <OnlineOrdersInterface />;
```

#### Cross-Module Interactions

**PROVIDES:**
- None (internal UI)

**CONSUMES:**
- Store: `materialsStore` ← Materials (stock validation)

#### Migration Notes

✅ **NO MIGRATION NEEDED**

---

### F4: sales_dine_in_orders

**Feature ID**: `sales_dine_in_orders`
**Name**: Dine-In Orders
**Description**: Orders for onsite consumption (table service)

#### Current State (As-Is)

- **Module**: `sales`
- **Route**: `/admin/operations/sales`
- **Components**:
  - `src/pages/admin/operations/sales/components/SalesView.tsx` (dine-in tab)

#### Proposed State (To-Be)

✅ **NO CHANGE**

**Note**: Dine-in orders are created in Sales, fulfilled via Fulfillment/onsite (table management).

#### Conditional Rendering

```typescript
const hasDineIn = hasFeature('sales_dine_in_orders');

return (
  <Tabs>
    {hasDineIn && <Tab label="Dine-In"><DineInOrders /></Tab>}
  </Tabs>
);
```

#### Cross-Module Interactions

**PROVIDES:**
- Event: `sales.order_placed` → Fulfillment/onsite (send to table)

**CONSUMES:**
- Hook: `fulfillment.table_assignment` ← Fulfillment/onsite

#### Migration Notes

✅ **NO MIGRATION NEEDED** - Sales creates order, Fulfillment manages table assignment.

---

### F5: sales_pickup_orders

**Feature ID**: `sales_pickup_orders`
**Name**: Pickup Orders
**Description**: Orders for customer pickup (counter or curbside)

#### Current State (As-Is)

- **Module**: `sales`
- **Route**: `/admin/operations/sales`
- **Components**:
  - `src/pages/admin/operations/sales/components/TakeAwayToggle.tsx`

#### Proposed State (To-Be)

🔄 **ENHANCED** - Add integration with Fulfillment/pickup

**New Components** (To Create):
- `src/modules/fulfillment/pickup/components/PickupScheduler.tsx`
- `src/modules/fulfillment/pickup/components/CurbsidePickup.tsx`

#### Conditional Rendering

```typescript
const hasPickup = hasFeature('sales_pickup_orders');

return (
  <Tabs>
    {hasPickup && <Tab label="Pickup"><PickupOrders /></Tab>}
  </Tabs>
);
```

#### Cross-Module Interactions

**PROVIDES:**
- Event: `sales.order_placed` → Fulfillment/pickup (schedule pickup)

**CONSUMES:**
- Hook: `fulfillment.pickup_ready` ← Fulfillment/pickup

#### Migration Notes

**Action Required:**
1. Enhance TakeAwayToggle.tsx to integrate with Fulfillment/pickup
2. Create pickup scheduling UI in Fulfillment module
3. Update EventBus to route pickup orders to Fulfillment/pickup

---

### F6: sales_delivery_orders

**Feature ID**: `sales_delivery_orders`
**Name**: Delivery Orders
**Description**: Orders for delivery to customer location

#### Current State (As-Is)

- **Module**: `sales`
- **Route**: `/admin/operations/sales`
- **Components**:
  - `src/pages/admin/operations/sales/components/TakeAwayToggle.tsx` (delivery option)

#### Proposed State (To-Be)

🔄 **ENHANCED** - Add integration with Fulfillment/delivery

**New Components** (To Create):
- `src/modules/fulfillment/delivery/components/DeliveryManager.tsx`
- `src/modules/fulfillment/delivery/components/DeliveryTracking.tsx`

#### Conditional Rendering

```typescript
const hasDelivery = hasFeature('sales_delivery_orders');

return (
  <Tabs>
    {hasDelivery && <Tab label="Delivery"><DeliveryOrders /></Tab>}
  </Tabs>
);
```

#### Cross-Module Interactions

**PROVIDES:**
- Event: `sales.order_placed` → Fulfillment/delivery (dispatch order)

**CONSUMES:**
- Hook: `fulfillment.delivery_status` ← Fulfillment/delivery
- Service: `mobile.gps_tracking` ← Mobile (track driver)

#### Migration Notes

**Action Required:**
1. Create Fulfillment/delivery module components
2. Integrate with Mobile module for GPS tracking
3. Update EventBus to route delivery orders

---

### F7-F23: Other Sales Features (Summary)

For brevity, remaining sales features listed in table format:

| Feature ID | Name | Module | Route | Status | Migration Notes |
|------------|------|--------|-------|--------|----------------|
| `sales_split_payment` | Split Payment | Sales | `/sales` | ✅ NO CHANGE | Multi-payment method support |
| `sales_tip_management` | Tip Management | Sales | `/sales` | ✅ NO CHANGE | Tip calculation for service |
| `sales_catalog_menu` | Product Catalog | Sales | `/sales` | ✅ NO CHANGE | Display product menu |
| `sales_catalog_ecommerce` | E-commerce Catalog | Sales | `/sales/ecommerce` | 🆕 CREATE | New subfolder for online store |
| `sales_cart_management` | Shopping Cart | Sales | `/sales/ecommerce` | 🆕 CREATE | E-commerce cart (new) |
| `sales_checkout_process` | Checkout Process | Sales | `/sales/ecommerce` | 🆕 CREATE | E-commerce checkout (new) |
| `sales_online_payment_gateway` | Payment Gateway | Sales | `/sales/ecommerce` | 🆕 CREATE | Online payment integration |
| `sales_online_order_processing` | Online Orders | Sales | `/sales/ecommerce` | 🆕 CREATE | Process e-commerce orders |
| `sales_coupon_management` | Coupons & Discounts | Sales | `/sales` | ✅ NO CHANGE | Shared across POS & e-commerce |
| `sales_analytics` | Sales Analytics | Sales | `/sales` | ✅ NO CHANGE | Sales metrics & reports |
| `sales_contract_management` | Contract Management | Sales | `/sales/b2b` | 🆕 CREATE | B2B contracts (new subfolder) |
| `sales_quote_generation` | Quote Generation | Sales | `/sales/b2b` | 🆕 CREATE | B2B quotes (new) |
| `sales_tiered_pricing` | Tiered Pricing | Sales | `/sales/b2b` | 🆕 CREATE | B2B volume pricing (new) |
| `sales_approval_workflows` | Approval Workflows | Sales | `/sales/b2b` | 🆕 CREATE | B2B order approvals (new) |
| `sales_bulk_pricing` | Bulk Pricing | Sales | `/sales/b2b` | 🆕 CREATE | B2B bulk discounts (new) |
| `sales_package_management` | Service Packages | Scheduling | `/scheduling` | ✅ NO CHANGE | Package definition (e.g., "10 sessions") |

**Legend:**
- ✅ NO CHANGE: Feature stays in current module
- 🔄 ENHANCED: Feature gets new integrations
- 🆕 CREATE: New subfolder/components to create
- 🔀 MOVE: Feature moves to different module

---

## DOMAIN 2: FULFILLMENT (23 features)

### Overview

**Modules**: Fulfillment (NEW - consolidates onsite, pickup, delivery)
**Routes**: `/admin/operations/fulfillment/{onsite|pickup|delivery}`
**Capabilities**: onsite_service, pickup_orders, delivery_shipping

**Key Architectural Change**: Floor module DELETED, content MOVED to Fulfillment/onsite

---

### F24: operations_table_management

**Feature ID**: `operations_table_management`
**Name**: Table Management
**Description**: Manage tables, assign customers, track occupancy

#### Current State (As-Is)

- **Module**: `floor` ❌ (TO BE DELETED)
- **Route**: `/admin/operations/floor`
- **Components**:
  - `src/pages/admin/operations/floor/components/TableManagement.tsx`
  - `src/pages/admin/operations/floor/components/TableGrid.tsx`

#### Proposed State (To-Be)

🔀 **MOVE** to `fulfillment/onsite`

- **Module**: `fulfillment` ✅
- **Route**: `/admin/operations/fulfillment/onsite`
- **Components**:
  - `src/modules/fulfillment/onsite/components/TableManagement.tsx` ← MOVED
  - `src/modules/fulfillment/onsite/components/TableGrid.tsx` ← MOVED

#### Conditional Rendering

```typescript
// NEW location: Fulfillment/onsite
const hasTableManagement = hasFeature('operations_table_management');

if (!hasTableManagement) {
  return <CapabilityGate requiredCapability="onsite_service" />;
}

return <TableManagement />;
```

#### Cross-Module Interactions

**PROVIDES:**
- Hook: `fulfillment.table_assignment` → Sales (assign table to order)
- Event: `fulfillment.table_occupied` → Dashboard (update metrics)

**CONSUMES:**
- Event: `sales.order_placed` ← Sales (assign table)
- Store: `staffStore` ← Staff (assign server)

#### Migration Notes

**CRITICAL - Breaking Change:**

1. **Move files:**
   ```bash
   mv src/pages/admin/operations/floor/components/TableManagement.tsx \
      src/modules/fulfillment/onsite/components/TableManagement.tsx
   ```

2. **Update imports:**
   ```typescript
   // OLD
   import { TableManagement } from '@/pages/admin/operations/floor/components';

   // NEW
   import { TableManagement } from '@/modules/fulfillment/onsite/components';
   ```

3. **Update route:**
   ```typescript
   // OLD
   path: '/admin/operations/floor'

   // NEW
   path: '/admin/operations/fulfillment/onsite'
   ```

4. **Add redirect:**
   ```typescript
   // In routes.ts
   { path: '/admin/operations/floor', element: <Navigate to="/admin/operations/fulfillment/onsite" replace /> }
   ```

---

### F25: operations_table_assignment

**Feature ID**: `operations_table_assignment`
**Name**: Table Assignment
**Description**: Assign customers to specific tables

#### Current State (As-Is)

- **Module**: `floor` ❌
- **Route**: `/admin/operations/floor`
- **Components**:
  - `src/pages/admin/operations/floor/components/TableAssignment.tsx`

#### Proposed State (To-Be)

🔀 **MOVE** to `fulfillment/onsite`

- **Module**: `fulfillment` ✅
- **Route**: `/admin/operations/fulfillment/onsite`

#### Migration Notes

Same as F24 (operations_table_management). Part of Floor → Fulfillment/onsite migration.

---

### F26: operations_floor_plan_config

**Feature ID**: `operations_floor_plan_config`
**Name**: Floor Plan Configuration
**Description**: Visual floor plan editor, drag-drop table placement

#### Current State (As-Is)

- **Module**: `floor` ❌
- **Route**: `/admin/operations/floor/floor-plan`
- **Components**:
  - `src/pages/admin/operations/floor/components/FloorPlanView.tsx`
  - `src/pages/admin/operations/floor/components/FloorPlanEditor.tsx`

#### Proposed State (To-Be)

🔀 **MOVE** to `fulfillment/onsite`

- **Module**: `fulfillment` ✅
- **Route**: `/admin/operations/fulfillment/onsite/floor-plan`

#### Migration Notes

Same as F24. Visual editor component to move to new location.

---

### F27: operations_waitlist_management

**Feature ID**: `operations_waitlist_management`
**Name**: Waitlist Management
**Description**: Manage customer waitlist when tables unavailable

#### Current State (As-Is)

- **Module**: `floor` ❌
- **Route**: `/admin/operations/floor/waitlist`
- **Components**:
  - `src/pages/admin/operations/floor/components/WaitlistManagement.tsx`

#### Proposed State (To-Be)

🔀 **MOVE** to `fulfillment/onsite`

- **Module**: `fulfillment` ✅
- **Route**: `/admin/operations/fulfillment/onsite/waitlist`

#### Migration Notes

Same as F24. Waitlist component to move to new location.

---

### F28-F46: Other Fulfillment Features (Summary)

| Feature ID | Name | Module | Current Route | New Route | Status | Notes |
|------------|------|--------|---------------|-----------|--------|-------|
| `operations_pickup_scheduling` | Pickup Scheduling | Fulfillment | N/A | `/fulfillment/pickup` | 🆕 CREATE | New pickup subfolder |
| `operations_delivery_zones` | Delivery Zones | Fulfillment | N/A | `/fulfillment/delivery` | 🆕 CREATE | New delivery subfolder |
| `operations_delivery_tracking` | Delivery Tracking | Fulfillment | N/A | `/fulfillment/delivery` | 🆕 CREATE | GPS tracking integration |
| `sales_fulfillment_queue` | Fulfillment Queue | Fulfillment | N/A | `/fulfillment/core` | 🆕 CREATE | Shared queue for all types |
| `sales_notification_system` | Customer Notifications | Fulfillment | N/A | `/fulfillment/core` | 🆕 CREATE | SMS/email notifications |

**Note**: Pickup and Delivery subfolders are NEW (Phase 1 implementation). Onsite is MOVED from Floor.

---

## DOMAIN 3: INVENTORY (12 features)

### Overview

**Modules**: Materials, Suppliers, Supplier-Orders
**Routes**: `/admin/supply-chain/materials`, `/admin/supply-chain/suppliers`, `/admin/supply-chain/supplier-orders`
**Capabilities**: ALL fulfillment capabilities (universal)

---

### F47: inventory_stock_tracking

**Feature ID**: `inventory_stock_tracking`
**Name**: Stock Tracking
**Description**: Real-time inventory tracking, stock levels

#### Current State (As-Is)

- **Module**: `materials`
- **Route**: `/admin/supply-chain/materials`
- **Components**:
  - `src/pages/admin/supply-chain/materials/components/MaterialsManagement.tsx`
  - `src/pages/admin/supply-chain/materials/components/StockLevels.tsx`

#### Proposed State (To-Be)

✅ **NO CHANGE**

#### Conditional Rendering

```typescript
const hasStockTracking = hasFeature('inventory_stock_tracking');

if (!hasStockTracking) {
  return <CapabilityGate requiredCapability="onsite_service" />;
}

return <StockLevels />;
```

#### Cross-Module Interactions

**PROVIDES:**
- Event: `materials.stock_updated` → Sales, Production, Products
- Store: `materialsStore` → All modules (read stock levels)

**CONSUMES:**
- Event: `sales.order_completed` ← Sales (deduct stock)
- Event: `production.order_completed` ← Production (deduct ingredients)

#### Migration Notes

✅ **NO MIGRATION NEEDED**

---

### F48-F58: Other Inventory Features (Summary)

| Feature ID | Name | Module | Status | Notes |
|------------|------|--------|--------|-------|
| `inventory_supplier_management` | Supplier Management | Suppliers | ✅ NO CHANGE | Supplier CRUD |
| `inventory_alert_system` | Low Stock Alerts | Materials | ✅ NO CHANGE | Alerts & notifications |
| `inventory_low_stock_auto_reorder` | Auto-Reorder | Materials | ✅ NO CHANGE | Automatic PO creation |
| `inventory_purchase_orders` | Purchase Orders | Supplier-Orders | ✅ NO CHANGE | PO creation & tracking |
| `inventory_demand_forecasting` | Demand Forecasting | Materials | ✅ NO CHANGE | ML-based predictions |
| `inventory_batch_lot_tracking` | Batch/Lot Tracking | Materials | ✅ NO CHANGE | Batch expiration tracking |
| `inventory_expiration_tracking` | Expiration Tracking | Materials | ✅ NO CHANGE | Track expiry dates |
| `inventory_available_to_promise` | Available to Promise | Materials | ✅ NO CHANGE | ATP calculation |
| `operations_vendor_performance` | Vendor Performance | Suppliers | ✅ NO CHANGE | Supplier metrics |
| `mobile_inventory_constraints` | Mobile Inventory | Mobile | 🆕 CREATE | Truck/booth capacity limits |

---

## DOMAIN 4: PRODUCTION (4 features)

### Overview

**Modules**: Production (RENAMED from Kitchen)
**Routes**: `/admin/operations/production` (was `/kitchen`)
**Capabilities**: production_workflow (RENAMED from requires_preparation)

**Key Architectural Change**: Kitchen → Production rename + Generic terminology

---

### F59: production_bom_management

**Feature ID**: `production_bom_management` ♻️ **RENAMED**
**Old ID**: `production_recipe_management`
**Name**: BOM Management (Bill of Materials)
**Description**: Manage production workflows (recipes, assemblies, service protocols)

#### Current State (As-Is)

- **Module**: `kitchen` ❌ (TO BE RENAMED)
- **Route**: `/admin/operations/kitchen`
- **Components**:
  - `src/pages/admin/operations/kitchen/components/RecipeManagement.tsx` ❌

#### Proposed State (To-Be)

♻️ **RENAME** module + **UPDATE** terminology

- **Module**: `production` ✅
- **Route**: `/admin/operations/production`
- **Components**:
  - `src/modules/production/components/BOMManagement.tsx` ✅ (RENAMED)

**Terminology (Configurable by Industry):**
- **Gastronomy**: "Recipe Management"
- **Manufacturing**: "BOM Management"
- **Workshop**: "Work Order Management"
- **Salon**: "Service Protocol Management"

#### Conditional Rendering

```typescript
// Check capability (RENAMED)
const hasProductionWorkflow = hasCapability('production_workflow'); // Was: requires_preparation

// Check feature (RENAMED)
const hasBOMManagement = hasFeature('production_bom_management'); // Was: production_recipe_management

if (!hasBOMManagement) return null;

// Get terminology from Settings
const { production_bom_label } = useSettings().terminology;

return (
  <Section title={`${production_bom_label} Management`}>
    <BOMManagement />
  </Section>
);
```

#### Cross-Module Interactions

**PROVIDES:**
- Store: `productionStore.getBOM(productId)` → Products, Sales

**CONSUMES:**
- Store: `materialsStore` ← Materials (ingredients/components)

#### Migration Notes

**CRITICAL - Rename + Terminology Update:**

1. **Rename module directory:**
   ```bash
   mv src/modules/kitchen src/modules/production
   mv src/pages/admin/operations/kitchen src/pages/admin/operations/production
   ```

2. **Rename component files:**
   ```bash
   mv src/modules/production/components/RecipeManagement.tsx \
      src/modules/production/components/BOMManagement.tsx
   ```

3. **Update FeatureRegistry.ts:**
   ```typescript
   // OLD
   production_recipe_management: {
     id: 'production_recipe_management',
     name: 'Recipe Management',
   }

   // NEW
   production_bom_management: {
     id: 'production_bom_management',
     name: 'BOM Management',
     description: 'Manage production workflows (recipes, assemblies, protocols)',
   }
   ```

4. **Update BusinessModelRegistry.ts:**
   ```typescript
   // OLD
   {
     id: 'requires_preparation',
     activatesFeatures: ['production_recipe_management']
   }

   // NEW
   {
     id: 'production_workflow',
     activatesFeatures: ['production_bom_management']
   }
   ```

5. **Add terminology configuration:**
   ```typescript
   // In Settings/BusinessProfile
   const PRODUCTION_TERMINOLOGY = {
     gastronomy: {
       bom_label: 'Recipe',
       display_label: 'Kitchen Display',
     },
     manufacturing: {
       bom_label: 'BOM',
       display_label: 'Production Display',
     },
   };
   ```

6. **Update all imports:**
   ```bash
   # Find all references
   grep -r "production_recipe_management" src/
   grep -r "requires_preparation" src/
   grep -r "modules/kitchen" src/

   # Replace with new names
   ```

---

### F60: production_display_system

**Feature ID**: `production_display_system` ♻️ **RENAMED**
**Old ID**: `production_kitchen_display`
**Name**: Production Display System (PDS)
**Description**: Display system for production queue (KDS, job board, etc.)

#### Current State (As-Is)

- **Module**: `kitchen` ❌
- **Route**: `/admin/operations/kitchen/display`
- **Components**:
  - `src/pages/admin/operations/kitchen/components/KitchenDisplay.tsx` ❌

#### Proposed State (To-Be)

♻️ **RENAME** module + **UPDATE** terminology

- **Module**: `production` ✅
- **Route**: `/admin/operations/production/display`
- **Components**:
  - `src/modules/production/components/ProductionDisplay.tsx` ✅ (RENAMED)

**Terminology (Configurable):**
- **Gastronomy**: "Kitchen Display System (KDS)"
- **Manufacturing**: "Production Display System (PDS)"
- **Workshop**: "Job Board"
- **Salon**: "Treatment Display"

#### Migration Notes

Same as F59 (production_bom_management). Rename Kitchen → Production + update terminology.

---

### F61-F62: Other Production Features (Summary)

| Feature ID | Name | Status | Notes |
|------------|------|--------|-------|
| `production_order_queue` | Production Queue | ♻️ RENAME MODULE | Kitchen → Production |
| `production_capacity_planning` | Capacity Planning | ♻️ RENAME MODULE | Kitchen → Production |

**All Production features**: Same migration as F59 (Kitchen → Production rename).

---

## DOMAIN 5: MOBILE (3 features)

### Overview

**Modules**: Mobile (NEW)
**Routes**: `/admin/operations/mobile`
**Capabilities**: mobile_operations

**Key Architectural Change**: Mobile = "No Fixed Location" operations, NOT offline (offline is universal)

---

### F63: mobile_location_tracking

**Feature ID**: `mobile_location_tracking`
**Name**: GPS Location Tracking
**Description**: Real-time GPS tracking for mobile businesses (food trucks, mobile services)

#### Current State (As-Is)

❌ **DOES NOT EXIST** (new feature)

#### Proposed State (To-Be)

🆕 **CREATE** new Mobile module

- **Module**: `mobile` ✅
- **Route**: `/admin/operations/mobile/location`
- **Components** (To Create):
  - `src/modules/mobile/location/components/LocationTracker.tsx`
  - `src/modules/mobile/location/components/MapView.tsx`

#### Conditional Rendering

```typescript
const hasLocationTracking = hasFeature('mobile_location_tracking');

if (!hasLocationTracking) {
  return <CapabilityGate requiredCapability="mobile_operations" />;
}

return <LocationTracker />;
```

#### Cross-Module Interactions

**PROVIDES:**
- Service: `mobile.gps_tracking` → Fulfillment/delivery (track drivers)
- Service: `mobile.getCurrentLocation()` → Sales (mobile POS location)

**CONSUMES:**
- External API: Google Maps / Mapbox

#### Migration Notes

**Action Required:**
1. Create Mobile module structure
2. Integrate GPS tracking library (Google Maps SDK)
3. Implement real-time location updates
4. Connect to Fulfillment/delivery for driver tracking

---

### F64-F65: Other Mobile Features (Summary)

| Feature ID | Name | Status | Notes |
|------------|------|--------|-------|
| `mobile_route_planning` | Route Planning | 🆕 CREATE | Daily routes, waypoint optimization |
| `mobile_inventory_constraints` | Mobile Inventory | 🆕 CREATE | Truck/booth capacity limits |

**Deleted Features** (now base architecture, not features):
- ❌ `mobile_pos_offline` - Offline is universal, not mobile-specific
- ❌ `mobile_sync_management` - Sync is universal (EventBus)

---

## DOMAIN 6: STAFF (7 features)

### Overview

**Modules**: Staff
**Routes**: `/admin/resources/staff`
**Capabilities**: ALL (universal)

---

### F66-F72: Staff Features (Summary)

| Feature ID | Name | Module | Status | Notes |
|------------|------|--------|--------|-------|
| `staff_employee_management` | Employee Management | Staff | ✅ NO CHANGE | CRUD operations |
| `staff_shift_management` | Shift Management | Staff | ✅ NO CHANGE | Shift scheduling |
| `staff_time_tracking` | Time Tracking | Staff | ✅ NO CHANGE | Clock in/out |
| `staff_performance_tracking` | Performance Tracking | Staff | ✅ NO CHANGE | KPIs & metrics |
| `staff_training_management` | Training Management | Staff | ✅ NO CHANGE | Training programs |
| `staff_walkin_queue` | Walk-In Queue | Staff | ✅ NO CHANGE | Queue for walk-in customers (service mode) |
| `staff_wait_time_estimation` | Wait Time Estimation | Staff | ✅ NO CHANGE | Estimate wait time |

**Note**: Walk-in features are NOT a separate capability. Walk-in is an operational mode within `appointment_based` capability (immediate booking option).

---

## DOMAIN 7: SCHEDULING (6 features)

### Overview

**Modules**: Scheduling
**Routes**: `/admin/resources/scheduling`
**Capabilities**: appointment_based

**Note**: Scheduling is for CUSTOMER appointments (not staff shifts). Staff shifts are in Staff module.

---

### F73-F78: Scheduling Features (Summary)

| Feature ID | Name | Module | Status | Notes |
|------------|------|--------|--------|-------|
| `scheduling_appointment_booking` | Appointment Booking | Scheduling | ✅ NO CHANGE | Book customer appointments |
| `scheduling_calendar_management` | Calendar Management | Scheduling | ✅ NO CHANGE | Provider calendars |
| `scheduling_reminder_system` | Reminder System | Scheduling | ✅ NO CHANGE | SMS/email reminders |
| `scheduling_availability_rules` | Availability Rules | Scheduling | ✅ NO CHANGE | Business hours, blocked slots |
| `customer_online_reservation` | Online Booking Portal | Scheduling | ✅ NO CHANGE | Public booking page |
| `sales_package_management` | Service Packages | Scheduling | ✅ NO CHANGE | Package definition (e.g., "10 sessions") |

**Deleted Feature:**
- ❌ `customer_reservation_reminders` - Duplicate of `scheduling_reminder_system`

---

## DOMAIN 8: FINANCE (4 features)

### Overview

**Modules**: Finance (NEW - B2B accounts)
**Routes**: `/admin/finance`
**Capabilities**: corporate_sales

---

### F79-F82: Finance Features (Summary)

| Feature ID | Name | Module | Status | Notes |
|------------|------|--------|--------|-------|
| `finance_corporate_accounts` | Corporate Accounts | Finance | 🆕 CREATE | B2B customer accounts |
| `finance_credit_management` | Credit Management | Finance | 🆕 CREATE | Credit limits, AR aging |
| `finance_invoice_scheduling` | Invoice Scheduling | Finance | 🆕 CREATE | NET payment terms (NET 30, NET 60) |
| `finance_payment_terms` | Payment Terms | Finance | 🆕 CREATE | Configure payment terms per customer |

**All Finance features are NEW** (Phase 3 implementation).

---

## DOMAIN 9: ANALYTICS (3 features)

### Overview

**Modules**: Reporting, Intelligence
**Routes**: `/admin/core/reporting`, `/admin/core/intelligence`

---

### F83-F85: Analytics Features (Summary)

| Feature ID | Name | Module | Status | Notes |
|------------|------|--------|--------|-------|
| `analytics_custom_reports` | Custom Reports | Reporting | ✅ NO CHANGE | Report builder |
| `analytics_scheduled_reports` | Scheduled Reports | Reporting | ✅ NO CHANGE | Automated report delivery |
| `analytics_data_export` | Data Export | Reporting | ✅ NO CHANGE | CSV, Excel, PDF export |

---

## DOMAIN 10: GAMIFICATION (2 features)

### Overview

**Modules**: Gamification
**Routes**: `/admin/gamification`

---

### F86-F87: Gamification Features (Summary)

| Feature ID | Name | Module | Status | Notes |
|------------|------|--------|--------|-------|
| `gamification_achievement_tracking` | Achievement Tracking | Gamification | ✅ NO CHANGE | Track milestone progress |
| `gamification_milestone_progression` | Milestone Progression | Gamification | ✅ NO CHANGE | Business milestone validation |

---

## 📊 MIGRATION IMPACT SUMMARY

### By Migration Type

| Migration Type | Count | Examples |
|----------------|-------|----------|
| ✅ NO CHANGE | 65 features (75%) | Most features stay in current location |
| 🔀 MOVE | 4 features (5%) | Floor → Fulfillment/onsite (table mgmt, floor plan, waitlist) |
| ♻️ RENAME | 2 features (2%) | production_recipe → production_bom, production_kitchen → production_display |
| 🆕 CREATE | 13 features (15%) | Fulfillment/pickup, Fulfillment/delivery, Mobile, Finance, E-commerce, B2B |
| ❌ DELETE | 3 features (3%) | mobile_pos_offline, mobile_sync_management, customer_reservation_reminders |

### High-Impact Features (Require Code Changes)

**CRITICAL (Breaking Changes):**
1. ✅ **Floor → Fulfillment/onsite** (4 features)
   - operations_table_management
   - operations_table_assignment
   - operations_floor_plan_config
   - operations_waitlist_management

2. ✅ **Kitchen → Production** (4 features)
   - production_bom_management (RENAMED)
   - production_display_system (RENAMED)
   - production_order_queue
   - production_capacity_planning

**HIGH (New Implementation):**
3. ✅ **Fulfillment/pickup** (2 features) - NEW
4. ✅ **Fulfillment/delivery** (3 features) - NEW
5. ✅ **Mobile Module** (3 features) - NEW
6. ✅ **Finance Module** (4 features) - NEW
7. ✅ **Sales/ecommerce subfolder** (5 features) - NEW
8. ✅ **Sales/b2b subfolder** (5 features) - NEW

---

## 🔍 FEATURE LOOKUP TABLE

**Quick reference: Feature ID → Module → Route**

| Feature ID | Module | Route | Status |
|------------|--------|-------|--------|
| `sales_order_management` | Sales | `/sales` | NO CHANGE |
| `sales_payment_processing` | Sales | `/sales` | NO CHANGE |
| `sales_pos_onsite` | Sales | `/sales` | NO CHANGE |
| `sales_dine_in_orders` | Sales | `/sales` | NO CHANGE |
| `sales_pickup_orders` | Sales | `/sales` | ENHANCED |
| `sales_delivery_orders` | Sales | `/sales` | ENHANCED |
| `sales_split_payment` | Sales | `/sales` | NO CHANGE |
| `sales_tip_management` | Sales | `/sales` | NO CHANGE |
| `sales_catalog_menu` | Sales | `/sales` | NO CHANGE |
| `sales_catalog_ecommerce` | Sales | `/sales/ecommerce` | CREATE |
| `sales_cart_management` | Sales | `/sales/ecommerce` | CREATE |
| `sales_checkout_process` | Sales | `/sales/ecommerce` | CREATE |
| `sales_online_payment_gateway` | Sales | `/sales/ecommerce` | CREATE |
| `sales_online_order_processing` | Sales | `/sales/ecommerce` | CREATE |
| `sales_coupon_management` | Sales | `/sales` | NO CHANGE |
| `sales_analytics` | Sales | `/sales` | NO CHANGE |
| `sales_contract_management` | Sales | `/sales/b2b` | CREATE |
| `sales_quote_generation` | Sales | `/sales/b2b` | CREATE |
| `sales_tiered_pricing` | Sales | `/sales/b2b` | CREATE |
| `sales_approval_workflows` | Sales | `/sales/b2b` | CREATE |
| `sales_bulk_pricing` | Sales | `/sales/b2b` | CREATE |
| `sales_package_management` | Scheduling | `/scheduling` | NO CHANGE |
| `operations_table_management` | Fulfillment | `/fulfillment/onsite` | MOVE (from Floor) |
| `operations_table_assignment` | Fulfillment | `/fulfillment/onsite` | MOVE (from Floor) |
| `operations_floor_plan_config` | Fulfillment | `/fulfillment/onsite` | MOVE (from Floor) |
| `operations_waitlist_management` | Fulfillment | `/fulfillment/onsite` | MOVE (from Floor) |
| `operations_pickup_scheduling` | Fulfillment | `/fulfillment/pickup` | CREATE |
| `operations_delivery_zones` | Fulfillment | `/fulfillment/delivery` | CREATE |
| `operations_delivery_tracking` | Fulfillment | `/fulfillment/delivery` | CREATE |
| `sales_fulfillment_queue` | Fulfillment | `/fulfillment/core` | CREATE |
| `sales_notification_system` | Fulfillment | `/fulfillment/core` | CREATE |
| `inventory_stock_tracking` | Materials | `/materials` | NO CHANGE |
| `inventory_supplier_management` | Suppliers | `/suppliers` | NO CHANGE |
| `inventory_alert_system` | Materials | `/materials` | NO CHANGE |
| `inventory_low_stock_auto_reorder` | Materials | `/materials` | NO CHANGE |
| `inventory_purchase_orders` | Supplier-Orders | `/supplier-orders` | NO CHANGE |
| `inventory_demand_forecasting` | Materials | `/materials` | NO CHANGE |
| `inventory_batch_lot_tracking` | Materials | `/materials` | NO CHANGE |
| `inventory_expiration_tracking` | Materials | `/materials` | NO CHANGE |
| `inventory_available_to_promise` | Materials | `/materials` | NO CHANGE |
| `operations_vendor_performance` | Suppliers | `/suppliers` | NO CHANGE |
| `mobile_inventory_constraints` | Mobile | `/mobile` | CREATE |
| `production_bom_management` | Production | `/production` | RENAME (from kitchen) |
| `production_display_system` | Production | `/production` | RENAME (from kitchen) |
| `production_order_queue` | Production | `/production` | RENAME (from kitchen) |
| `production_capacity_planning` | Production | `/production` | RENAME (from kitchen) |
| `mobile_location_tracking` | Mobile | `/mobile/location` | CREATE |
| `mobile_route_planning` | Mobile | `/mobile/routes` | CREATE |
| `staff_employee_management` | Staff | `/staff` | NO CHANGE |
| `staff_shift_management` | Staff | `/staff` | NO CHANGE |
| `staff_time_tracking` | Staff | `/staff` | NO CHANGE |
| `staff_performance_tracking` | Staff | `/staff` | NO CHANGE |
| `staff_training_management` | Staff | `/staff` | NO CHANGE |
| `staff_walkin_queue` | Staff | `/staff` | NO CHANGE |
| `staff_wait_time_estimation` | Staff | `/staff` | NO CHANGE |
| `scheduling_appointment_booking` | Scheduling | `/scheduling` | NO CHANGE |
| `scheduling_calendar_management` | Scheduling | `/scheduling` | NO CHANGE |
| `scheduling_reminder_system` | Scheduling | `/scheduling` | NO CHANGE |
| `scheduling_availability_rules` | Scheduling | `/scheduling` | NO CHANGE |
| `customer_online_reservation` | Scheduling | `/scheduling` | NO CHANGE |
| `finance_corporate_accounts` | Finance | `/finance` | CREATE |
| `finance_credit_management` | Finance | `/finance` | CREATE |
| `finance_invoice_scheduling` | Finance | `/finance` | CREATE |
| `finance_payment_terms` | Finance | `/finance` | CREATE |
| `analytics_custom_reports` | Reporting | `/reporting` | NO CHANGE |
| `analytics_scheduled_reports` | Reporting | `/reporting` | NO CHANGE |
| `analytics_data_export` | Reporting | `/reporting` | NO CHANGE |
| `gamification_achievement_tracking` | Gamification | `/gamification` | NO CHANGE |
| `gamification_milestone_progression` | Gamification | `/gamification` | NO CHANGE |

**Deleted Features:**
- ❌ `mobile_pos_offline` (offline is base architecture)
- ❌ `mobile_sync_management` (sync is base architecture)
- ❌ `customer_reservation_reminders` (duplicate of scheduling_reminder_system)

---

## 📚 REFERENCE

**Related Documents:**
- `ARCHITECTURE_DESIGN_V2.md` - Master architecture document
- `MIGRATION_PLAN.md` - Step-by-step migration guide
- `CROSS_MODULE_INTEGRATION_MAP.md` - Module relationships
- `FeatureRegistry.ts` - Feature definitions (source of truth)

**Code References:**
- `src/config/FeatureRegistry.ts` - 87 feature definitions
- `src/config/BusinessModelRegistry.ts` - 8 capabilities
- `src/lib/capabilities/index.ts` - `hasFeature()` implementation

---

**END OF FEATURE → MODULE → UI MAP**

**Status**: 📋 COMPLETE
**Total Features Mapped**: 87 features
**Migration Impact**: 4 MOVE, 2 RENAME, 13 CREATE, 3 DELETE, 65 NO CHANGE
**Use**: Find feature location, plan migration, verify activation logic
