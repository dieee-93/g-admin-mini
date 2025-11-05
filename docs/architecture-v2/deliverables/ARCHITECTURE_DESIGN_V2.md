# G-ADMIN MINI - ARCHITECTURE DESIGN V2.0

**Date**: 2025-01-24 (Updated: Post-walkin_service correction)
**Status**: ✅ Complete Architecture Design
**Version**: 2.0.1 (Post-Redesign + walkin_service correction)
**Authors**: Architecture Redesign Team (Sessions 1-5)

**IMPORTANT UPDATE (2025-01-24)**: `walkin_service` capability was REMOVED after identifying it as an operational mode, not a business capability. Walk-in is now correctly handled as a mode of `onsite_service` (for products) and `appointment_based` (for services). See ARCHITECTURE_CLARIFICATIONS.md #7 for details.

---

## 📋 EXECUTIVE SUMMARY

This document presents the complete architectural redesign of G-Admin Mini, based on comprehensive analysis of all 8 business capabilities and 81 features (originally 84 features in code, reduced to 81 after Phase 0.5 cleanup of 3 obsolete features: mobile_pos_offline, mobile_sync_management, customer_reservation_reminders).

### Key Outcomes

**Module Count**: 27 → 24 modules total (-3 modules, 11% reduction)
- **Core Modules**: 22 (always available)
- **Optional Modules**: 2 (Rentals, Assets - industry-specific)
- **New Modules**: 3 (Fulfillment, Mobile, Finance)
- **Deleted Modules**: 1 (Floor → merged into Fulfillment/onsite)
- **Merged Modules**: 1 (Ecommerce → merged into Sales/ecommerce)
- **Renamed Modules**: 1 (Kitchen → Production)
- **Net Reduction**: 3 modules consolidated

**Capability Count**: 9 → 8 capabilities (-1 capability)
- **Deleted Capability**: `walkin_service` (identified as operational mode, not capability)
- Walk-in coverage: `onsite_service` (products) + `appointment_based` (services)

**Feature Count**: 84 → 81 features (-3 features)
- **Deleted Features**: `mobile_pos_offline`, `mobile_sync_management`, `customer_reservation_reminders`
- **Rationale**: First two are base architecture (offline-first), last one duplicates `scheduling_reminder_system`

**Architecture Principles**:
1. ✅ **Offline-First by Design**: Entire app works offline (EventBus, stores, sync) - not just mobile
2. ✅ **DRY (Don't Repeat Yourself)**: 76% fulfillment overlap → unified module
3. ✅ **Domain-Driven Design**: Clear separation (Service vs Fulfillment vs Production)
4. ✅ **Multi-Industry Support**: Generic terminology (Production, Service Points)
5. ✅ **Infrastructure Services**: Reusable components (Mobile for location services)
6. ✅ **Conditional Activation**: Modules/features shown based on active capabilities

---

## 🎯 DESIGN PHILOSOPHY

### 1. Capability-Driven Architecture

Modules are organized around **business capabilities**, not technical layers:
- ❌ **Before**: Technical silos (frontend/backend/database)
- ✅ **After**: Business capabilities (fulfillment, scheduling, finance)

### 2. Fulfillment vs Service Distinction

**Fulfillment Mode** (Product-Based):
- Capabilities: onsite_service, pickup_orders, delivery_shipping
- Inventory-dependent (stock tracking, preparation)
- Module: **Fulfillment** (unified for 76% overlap)

**Service Mode** (Time-Based):
- Capabilities: appointment_based
- Calendar-dependent, NO inventory
- Module: **Scheduling** (appointments, including walk-in immediate booking)

### 3. Offline-First Architecture (Universal)

**IMPORTANT**: Offline-first is NOT a feature - it's the **base architecture** of the entire application.

**Implementation**:
- **EventBus**: Queues events when offline, syncs when online
- **Stores (Zustand)**: Local persistence (IndexedDB) for all state
- **Service Workers**: Cache assets, handle offline requests
- **Sync Manager**: Conflict resolution, deduplication, retry logic

**All modules work offline by default**:
- Sales: POS transactions queued offline
- Materials: Inventory updates synced later
- Staff: Time tracking works offline
- Fulfillment: Orders queued offline
- **Mobile module**: Adds GPS tracking, route planning (not offline capability)

**Key Insight**: `mobile_operations` capability is about **no fixed location** (food trucks, fairs), NOT about offline functionality. Offline is universal.

### 4. Infrastructure Services Pattern

**Reusable infrastructure shared across capabilities**:
- **Mobile Module**: GPS tracking, route planning, maps (shared by mobile_operations + delivery_shipping)
- **Notification Service**: SMS/email (shared by all modules)
- **Payment Gateways**: Stripe, PayPal (shared by POS + e-commerce + B2B)

### 4. Generic Terminology for Multi-Industry

**Industry-Agnostic Terms**:
- Kitchen → **Production** (works for manufacturing, assembly, cooking)
- Floor → **Service Points** (works for tables, cabins, bays)
- Waiters → **Service Staff** (configurable per business)

**Customization**: Labels configurable in Business Profile settings

---

## 🏗️ COMPLETE MODULE CATALOG (24 Modules: 22 Core + 2 Optional)

### TIER 0: System Core (1 module)

#### 1. **Gamification** (Achievements System)
- **Route**: `/admin/gamification`
- **Purpose**: System-wide achievement tracking, milestone validation
- **Features**: Achievement tracking, milestone progression, gamification
- **Dependencies**: None (system core)
- **Status**: Keep as-is ✅

---

### TIER 1: Core Foundation (4 modules)

#### 2. **Dashboard** (Central Hub)
- **Route**: `/admin/core/dashboard`
- **Purpose**: Central hub with widgets from all modules
- **Features**: Dynamic widgets, cross-module insights, real-time metrics
- **Dependencies**: ALL modules (consumes widgets)
- **Status**: Keep as-is ✅

#### 3. **Settings** (System Configuration)
- **Route**: `/admin/core/settings`
- **Purpose**: Business profile, system configuration, user permissions
- **Features**: Business profile, user management, permissions, tax config
- **Dependencies**: None (foundation)
- **Status**: Keep as-is ✅

#### 4. **Customers** (CRM)
- **Route**: `/admin/core/crm/customers`
- **Purpose**: Customer relationship management
- **Features**: Customer CRUD, service history, preferences, online accounts
- **Capabilities**: Used by ALL fulfillment + service capabilities
- **Status**: Enhanced (add service history, online accounts)

#### 5. **Debug** (Development Tools)
- **Route**: `/admin/core/settings/diagnostics`
- **Purpose**: Development and diagnostics
- **Features**: Token test, CRUD test, performance monitoring
- **Dependencies**: None
- **Status**: Keep as-is ✅

---

### TIER 2: Sales & Fulfillment (4 modules)

#### 6. **Sales** (Revenue Operations)
- **Route**: `/admin/operations/sales`
- **Purpose**: ALL sales channels (POS, e-commerce, B2B)
- **Submodules**:
  - `/pos` - Point of Sale (in-person sales)
  - `/ecommerce` - Online store (e-commerce)
  - `/b2b` - Corporate sales (quotes, contracts, tiered pricing)
- **Features**: 23 features
  - POS: sales_pos_onsite, sales_dine_in_orders, sales_split_payment, sales_tip_management
  - E-commerce: sales_catalog_ecommerce, sales_cart_management, sales_checkout_process, sales_online_payment_gateway
  - B2B: sales_contract_management, sales_quote_generation, sales_tiered_pricing, sales_approval_workflows
  - Shared: sales_order_management, sales_payment_processing, sales_catalog_menu, sales_coupon_management
- **Capabilities**: onsite_service, pickup_orders, delivery_shipping, online_store, corporate_sales
- **Dependencies**: Fulfillment (send orders), Materials (stock), Customers, Fiscal (tax)
- **Status**: Enhanced (add /ecommerce, /b2b subfolders)

#### 7. **Fulfillment** (Order Logistics) ⭐ NEW
- **Route**: `/admin/operations/fulfillment`
- **Purpose**: Unified order fulfillment (onsite, pickup, delivery)
- **Submodules**:
  - `/core` - Shared fulfillment logic (76% overlap)
  - `/onsite` - Tables, floor plan, waitlist (MOVED from Floor module)
  - `/pickup` - Pickup scheduling, curbside pickup
  - `/delivery` - Delivery zones, GPS tracking, drivers
- **Features**: 23 features
  - Core: order management, payment processing, fulfillment queue, notifications (6 features)
  - Onsite: operations_table_management, operations_floor_plan_config, operations_waitlist_management (12 features)
  - Pickup: operations_pickup_scheduling, sales_pickup_orders (2 features)
  - Delivery: operations_delivery_zones, operations_delivery_tracking, sales_delivery_orders (3 features)
- **Capabilities**: onsite_service (71% overlap), pickup_orders (77% overlap), delivery_shipping (79% overlap)
- **Dependencies**: Sales (orders), Production (if requires_preparation), Staff (service staff, drivers), Materials (stock), Mobile (GPS for delivery)
- **Rationale**: 76% average overlap justifies consolidation (DRY principle)
- **Status**: NEW (replaces Floor module)

#### 8. **Production** (Production Workflows) ♻️ RENAMED
- **Route**: `/admin/operations/production` (was `/kitchen`)
- **Purpose**: Production workflows, BOM management, capacity planning (multi-industry)
- **Submodules**:
  - `/queue` - Production Display System (PDS), work order queue
  - `/workflows` - BOM/workflow management, cost calculation
  - `/capacity` - MRP, capacity planning, throughput analysis
  - `/training` - Workflow training, certifications, skill matrix
- **Features**: 4 features (with generic terminology)
  - production_bom_management (BOM = Bill of Materials - universal term)
  - production_display_system (PDS = Production Display System - was KDS)
  - production_order_queue (work orders, production queue)
  - production_capacity_planning (MRP, capacity planning)
- **Capabilities**: production_workflow (11 features activated) - RENAMED from requires_preparation
- **Configurable Labels** (by industry):
  - Gastronomy: BOM="Recipe", PDS="Kitchen Display", Operator="Cook"
  - Manufacturing: BOM="BOM", PDS="Production Display", Operator="Operator"
  - Workshop: BOM="Work Order", PDS="Job Board", Operator="Technician"
  - Salon: BOM="Service Protocol", PDS="Treatment Display", Operator="Stylist"
- **Dependencies**: Sales (orders), Materials (components/ingredients), Fulfillment (notify ready)
- **Rationale**: Generic "Production" + configurable labels work for ALL industries
- **Status**: RENAMED (Kitchen → Production) + Generic terminology

#### 9. **Mobile** (No Fixed Location Operations) ⭐ NEW
- **Route**: `/admin/operations/mobile`
- **Purpose**: Manage businesses without fixed location (food trucks, fairs, events)
- **Submodules**:
  - `/location` - GPS tracking, route planning, map integration
  - `/inventory` - Mobile inventory constraints (truck/booth capacity)
  - `/routes` - Daily routes, location library, performance analytics
  - `/events` - Event calendar, fair schedules, location registration
- **Features**: 3 features (reduced from 5 - removed offline/sync)
  - mobile_location_tracking (GPS tracking - where is the business now)
  - mobile_route_planning (daily routes - where to go next)
  - mobile_inventory_constraints (limited capacity - truck/booth limits)
- **Note**: Removed `mobile_pos_offline` and `mobile_sync_management` - these are base architecture, not features
- **Capabilities**: mobile_operations (9 features)
- **Used By**:
  - Food trucks (route planning, GPS tracking)
  - Fair vendors (event schedules, booth inventory)
  - Mobile services (plumbers, electricians with vans)
  - Delivery drivers (GPS tracking) **[SHARED with delivery_shipping]**
- **Dependencies**: Materials (inventory sync), Maps API (Google Maps, Mapbox)
- **Rationale**: "No fixed location" businesses need GPS, route planning, location-based inventory
- **Note**: Offline functionality is NOT specific to Mobile - entire app is offline-first
- **Status**: NEW (infrastructure service for location-based operations)

---

### TIER 3: Supply Chain (5 modules)

#### 10. **Materials** (Inventory Management)
- **Route**: `/admin/supply-chain/materials`
- **Purpose**: Inventory tracking, stock management
- **Features**: 12 features
  - inventory_stock_tracking
  - inventory_supplier_management
  - inventory_alert_system
  - inventory_low_stock_auto_reorder
  - inventory_purchase_orders
  - inventory_demand_forecasting
  - inventory_batch_lot_tracking
  - inventory_expiration_tracking
  - inventory_available_to_promise
  - mobile_inventory_constraints (for mobile ops)
- **Capabilities**: ALL fulfillment capabilities (onsite, pickup, delivery), requires_preparation, corporate_sales
- **Dependencies**: Suppliers, Supplier-Orders
- **Status**: Enhanced (add mobile inventory constraints)

#### 11. **Suppliers** (Supplier Management)
- **Route**: `/admin/supply-chain/suppliers`
- **Purpose**: Supplier catalog, vendor management
- **Features**: Supplier CRUD, contact info, payment terms
- **Dependencies**: Materials
- **Status**: Keep as-is ✅

#### 12. **Supplier-Orders** (Purchase Orders)
- **Route**: `/admin/supply-chain/supplier-orders`
- **Purpose**: Purchase orders to suppliers
- **Features**: PO creation, approval, receiving
- **Dependencies**: Materials, Suppliers
- **Status**: Keep as-is ✅

#### 13. **Products** (Product Catalog)
- **Route**: `/admin/supply-chain/products`
- **Purpose**: Product/service catalog management
- **Features**: Product CRUD, pricing, categories
- **Dependencies**: Materials (if physical products)
- **Status**: Keep as-is ✅

---

### TIER 4: Human Resources (2 modules)

#### 14. **Staff** (Employee Management)
- **Route**: `/admin/resources/staff`
- **Purpose**: Employee management, shifts, performance
- **Submodules**:
  - `/management` - Employee CRUD, contracts
  - `/scheduling` - Shift management, availability
  - `/performance` - Metrics, KPIs
  - `/training` - Training management, certifications
- **Features**: 5 features
  - staff_employee_management
  - staff_shift_management
  - staff_time_tracking
  - staff_performance_tracking
  - staff_training_management
- **Capabilities**: ALL capabilities (universal module)
- **Dependencies**: None (foundation)
- **Status**: Keep as-is ✅

#### 15. **Scheduling** (Appointment Management)
- **Route**: `/admin/resources/scheduling`
- **Purpose**: Customer appointment booking and management
- **Submodules**:
  - `/appointments` - Appointment calendar, booking, rescheduling
  - `/availability` - Provider schedules, business hours, blocked slots
  - `/reminders` - Automated reminder system (SMS/email)
  - `/online-booking` - Public booking portal
  - `/packages` - Service packages (e.g., "10 massage sessions")
- **Features**: 6 features
  - scheduling_appointment_booking
  - scheduling_calendar_management
  - scheduling_reminder_system
  - scheduling_availability_rules
  - customer_online_reservation
  - sales_package_management
- **Capabilities**: appointment_based (13 features activated)
- **Dependencies**: Staff (provider availability), Customers (service history)
- **Rationale**: Scheduling = customer appointments (NOT staff shifts)
- **Status**: Enhanced (focus on customer appointments, not staff scheduling)

---

### TIER 5: Finance (4 modules)

#### 16. **Fiscal** (Tax Compliance)
- **Route**: `/admin/finance/fiscal`
- **Purpose**: Tax calculation, AFIP integration (Argentina), fiscal printers
- **Features**: Tax calculation, fiscal invoicing, AFIP reports
- **Capabilities**: ALL capabilities (universal tax compliance)
- **Dependencies**: Sales (invoices)
- **Status**: Keep as-is ✅

#### 17. **Billing** (Recurring Subscriptions)
- **Route**: `/admin/finance/billing`
- **Purpose**: Recurring billing, subscriptions, memberships
- **Features**: Subscription management, recurring charges, dunning
- **Dependencies**: Customers, Payment gateways
- **Status**: Keep as-is ✅

#### 18. **Finance-Integrations** (Payment Gateways)
- **Route**: `/admin/finance/integrations`
- **Purpose**: Payment gateway integrations (Stripe, PayPal, MercadoPago, MODO)
- **Features**: Payment gateway config, webhook handling, reconciliation
- **Dependencies**: Sales, Billing
- **Status**: Keep as-is ✅

#### 19. **Finance** (B2B Accounts & Credit) ⭐ NEW
- **Route**: `/admin/finance`
- **Purpose**: Corporate accounts, credit management, invoicing (B2B)
- **Submodules**:
  - `/accounts` - Corporate accounts management
  - `/credit` - Credit limits, aging report, collections
  - `/invoicing` - Invoice scheduling, NET payment terms
  - `/reporting` - AR aging, credit utilization, payment history
- **Features**: 4 features
  - finance_corporate_accounts
  - finance_credit_management
  - finance_invoice_scheduling
  - finance_payment_terms
- **Capabilities**: corporate_sales (14 features activated)
- **Dependencies**: Sales (orders → invoices), Customers (corporate customer data), Fiscal (tax calculation)
- **Rationale**: B2B credit management distinct from Fiscal (tax) and Billing (subscriptions)
- **Status**: NEW (B2B domain)

---

### TIER 6: Analytics & Reporting (2 modules)

#### 20. **Reporting** (Business Intelligence)
- **Route**: `/admin/core/reporting`
- **Purpose**: Custom reports, templates, automation
- **Features**: Report builder, templates, scheduled reports, exports
- **Dependencies**: ALL modules (data sources)
- **Status**: Keep as-is ✅

#### 21. **Intelligence** (Market Intelligence)
- **Route**: `/admin/core/intelligence`
- **Purpose**: Market analysis, competitor tracking, pricing intelligence
- **Features**: Market trends, competitor analysis, pricing recommendations
- **Dependencies**: Sales (pricing data)
- **Status**: Enhanced (remove recipe features → moved to Production)

---

### TIER 7: Customer Experience (3 modules)

#### 22. **Memberships** (Membership Programs)
- **Route**: `/admin/operations/memberships`
- **Purpose**: Membership programs, tiers, benefits
- **Features**: Membership CRUD, tier management, benefits tracking
- **Dependencies**: Customers
- **Status**: Keep as-is ✅

#### 23. **Rentals** (Asset Rentals) [OPTIONAL]
- **Route**: `/admin/operations/rentals`
- **Purpose**: Rental management (equipment, spaces, etc.)
- **Features**: Rental CRUD, availability calendar, pricing
- **Dependencies**: Customers
- **Status**: Keep as-is ✅ (optional module)

#### 24. **Assets** (Asset Management) [OPTIONAL]
- **Route**: `/admin/operations/assets`
- **Purpose**: Asset tracking, maintenance schedules
- **Features**: Asset CRUD, maintenance tracking, depreciation
- **Dependencies**: None
- **Status**: Keep as-is ✅ (optional module)

---

## ❌ DELETED MODULES (1)

### Floor Module → ✅ Merged into Fulfillment/onsite

**Rationale**:
- Floor management is onsite-specific "last mile" fulfillment
- 71% feature overlap with pickup/delivery justifies consolidation
- Table management = onsite equivalent of pickup slot or delivery address
- **Impact**: All Floor module content moved to `Fulfillment/onsite/`

**Migration**:
- `src/modules/floor/` → `src/modules/fulfillment/onsite/`
- Routes: `/admin/operations/floor` → `/admin/operations/fulfillment/onsite`
- Breaking change: Redirect old routes to new location

---

## 📊 MODULE COUNT SUMMARY

| Category | Current (As-Is) | Proposed (To-Be) | Change |
|----------|----------------|------------------|--------|
| **System Core** | 1 | 1 | - |
| **Core Foundation** | 4 | 4 | - |
| **Sales & Fulfillment** | 4 | 5 | +1 (Fulfillment, Mobile NEW; Floor deleted) |
| **Supply Chain** | 5 | 5 | - |
| **Human Resources** | 2 | 2 | - |
| **Finance** | 3 | 4 | +1 (Finance NEW for B2B) |
| **Analytics** | 2 | 2 | - |
| **Customer Experience** | 3 | 3 | - |
| **TOTAL** | **27** | **24** | **-3 (-11%)** |

**Breakdown**:
- **Core Modules**: 22 (always available)
- **Optional Modules**: 2 (Rentals, Assets - marked [OPTIONAL])

**Changes**:
- **New Modules**: 3 (Fulfillment, Mobile, Finance)
- **Deleted Modules**: 1 (Floor → merged into Fulfillment/onsite)
- **Merged Modules**: 1 (Ecommerce → merged into Sales/ecommerce)
- **Renamed Modules**: 1 (Kitchen → Production)
- **Net Reduction**: 3 modules consolidated

---

## 🗂️ DOMAIN ORGANIZATION (To-Be)

### Domain 1: System Core
- **Modules**: Gamification (1)
- **Purpose**: System-wide functionality (achievements, requirements validation)
- **Characteristics**: Not tied to specific business capability

### Domain 2: Core Foundation
- **Modules**: Dashboard, Settings, Customers, Debug (4)
- **Purpose**: Essential for ALL businesses
- **Characteristics**: Always active, no conditional logic

### Domain 3: Sales & Fulfillment
- **Modules**: Sales, Fulfillment, Production, Mobile (5 total - includes Kitchen rename)
- **Purpose**: Revenue-generating operations and order logistics
- **Characteristics**: Product-based (inventory-dependent)

### Domain 4: Supply Chain
- **Modules**: Materials, Suppliers, Supplier-Orders, Products (5 total - includes Production)
- **Purpose**: Procurement, inventory, production
- **Characteristics**: Supply chain management end-to-end

### Domain 5: Human Resources
- **Modules**: Staff, Scheduling (2)
- **Purpose**: Employee and appointment management
- **Characteristics**: Time-based (calendar-dependent)
- **Note**: Scheduling for customer appointments, Staff for employee management

### Domain 6: Finance
- **Modules**: Fiscal, Billing, Finance-Integrations, Finance (4)
- **Purpose**: Financial operations (tax, subscriptions, B2B credit)
- **Characteristics**: Money management
- **Distinctions**:
  - Fiscal = Tax compliance (all businesses)
  - Billing = Recurring subscriptions (B2C)
  - Finance = B2B accounts/credit (corporate sales)

### Domain 7: Analytics & Reporting
- **Modules**: Reporting, Intelligence (2)
- **Purpose**: Business intelligence and insights
- **Characteristics**: Cross-cutting (data from all modules)

### Domain 8: Customer Experience
- **Modules**: Memberships, Rentals, Assets (3)
- **Purpose**: Customer engagement and retention
- **Characteristics**: Optional modules (not core to all businesses)

---

## 🔄 FEATURE REDISTRIBUTION MAP

### Features MOVED to New Modules

| Feature ID | From Module | To Module | Rationale |
|------------|-------------|-----------|-----------|
| `operations_table_management` | Floor | Fulfillment/onsite | Floor merged into Fulfillment |
| `operations_table_assignment` | Floor | Fulfillment/onsite | Floor merged into Fulfillment |
| `operations_floor_plan_config` | Floor | Fulfillment/onsite | Floor merged into Fulfillment |
| `operations_waitlist_management` | Floor | Fulfillment/onsite | Floor merged into Fulfillment |
| `production_recipe_management` | Intelligence | Production | Recipes are production concern |

### Features RENAMED

| Old Feature ID | New Feature ID | Rationale |
|----------------|----------------|-----------|
| `async_operations` (capability) | `online_store` | Clearer naming (e-commerce) |
| `requires_preparation` (capability) | `production_workflow` | Generic terminology (not gastronomy-specific) |
| `sales_async_order_processing` | `sales_online_order_processing` | Match new naming |
| `customer_online_reservation` | `customer_online_accounts` | Broader scope (accounts, not just reservations) |
| `production_recipe_management` | `production_bom_management` | BOM = Bill of Materials (universal) |
| `production_kitchen_display` | `production_display_system` | PDS = Production Display System (generic) |
| `mobile_pos_offline` | (REMOVED) | Offline is base architecture, not feature |
| `mobile_sync_management` | (REMOVED) | Sync is base architecture, not feature |

### Features DELETED (Duplicates or Architectural)

| Feature ID | Reason | Replacement |
|------------|--------|-------------|
| `customer_reservation_reminders` | Duplicate of `scheduling_reminder_system` | Use `scheduling_reminder_system` |
| `mobile_pos_offline` | Offline is base architecture (all modules) | Built-in offline-first architecture |
| `mobile_sync_management` | Sync is base architecture (EventBus) | Built-in sync manager |

### Features RELOCATED (Domain Change)

| Feature ID | From Domain | To Domain | Rationale |
|------------|-------------|-----------|-----------|
| `operations_vendor_performance` | Operations | Finance | Vendor performance is finance/procurement concern |

---

## 🔗 CROSS-MODULE INTEGRATION PATTERNS

### Pattern 1: Hook Points (Extension Mechanism)

**Purpose**: Allow modules to extend each other without tight coupling

**Example**: Fulfillment toolbar actions
```typescript
// Fulfillment module PROVIDES:
<HookPoint name="fulfillment.toolbar.actions" />

// Dashboard module CONSUMES:
registerHook('fulfillment.toolbar.actions', () => (
  <Button>Export Queue</Button>
))
```

### Pattern 2: Event Bus (Decoupled Communication)

**Purpose**: Modules communicate via events without direct dependencies

**Example**: Order lifecycle events
```typescript
// Sales module EMITS:
eventBus.emit('sales.order_placed', { orderId, items, fulfillmentType })

// Fulfillment module LISTENS:
eventBus.on('sales.order_placed', (order) => {
  addToFulfillmentQueue(order)
})

// Production module LISTENS (if requires_preparation active):
eventBus.on('sales.order_placed', (order) => {
  addToProductionQueue(order)
})
```

### Pattern 3: Dashboard Widgets (Aggregation)

**Purpose**: Modules provide widgets to Dashboard for central view

**Example**: Fulfillment queue widget
```typescript
// Fulfillment module PROVIDES:
<Widget id="dashboard.fulfillment-queue">
  <FulfillmentQueueWidget />
</Widget>

// Dashboard module CONSUMES:
<DashboardGrid>
  {widgets.map(widget => <Widget key={widget.id} {...widget} />)}
</DashboardGrid>
```

### Pattern 4: Shared Stores (State Management)

**Purpose**: Modules share state via Zustand stores

**Example**: Staff availability
```typescript
// Staff module PROVIDES:
const useStaffStore = create((set) => ({
  employees: [],
  getAvailableProviders: () => // ...
}))

// Scheduling module CONSUMES:
const { getAvailableProviders } = useStaffStore()
const availableProviders = getAvailableProviders()
```

---

## 🧩 CONDITIONAL MODULE ACTIVATION

### Capability-Driven Activation

**Principle**: Modules/features only active if corresponding capability selected

**Example**: Fulfillment subfolders
```typescript
// onsite_service capability active → show /onsite subfolder
if (hasCapability('onsite_service')) {
  showSubfolder('fulfillment/onsite')
}

// pickup_orders capability active → show /pickup subfolder
if (hasCapability('pickup_orders')) {
  showSubfolder('fulfillment/pickup')
}

// delivery_shipping capability active → show /delivery subfolder
if (hasCapability('delivery_shipping')) {
  showSubfolder('fulfillment/delivery')
}
```

### Feature Flags

**Purpose**: Enable/disable features within modules

**Example**: Curbside pickup
```typescript
// Default: counter pickup only
// Feature flag: enableCurbsidePickup = true → show curbside option
if (featureFlags.enableCurbsidePickup) {
  showPickupArea('curbside')
}
```

---

## 📈 MIGRATION IMPACT ANALYSIS

### High Impact Changes (Breaking)

#### 1. Floor Module Deletion
- **Impact**: HIGH (module routes change)
- **Affected**: onsite_service capability users
- **Migration**:
  - Move `src/modules/floor/` → `src/modules/fulfillment/onsite/`
  - Redirect `/admin/operations/floor` → `/admin/operations/fulfillment/onsite`
  - Update all imports: `@/modules/floor` → `@/modules/fulfillment/onsite`
- **Estimated Time**: 2-3 days

#### 2. Kitchen → Production Rename
- **Impact**: MEDIUM (routes + naming change)
- **Affected**: requires_preparation capability users
- **Migration**:
  - Rename `src/modules/kitchen/` → `src/modules/production/`
  - Redirect `/admin/operations/kitchen` → `/admin/operations/production`
  - Update all imports: `@/modules/kitchen` → `@/modules/production`
  - Update UI labels: "Kitchen" → "Production"
- **Estimated Time**: 1-2 days

### Medium Impact Changes (New Features)

#### 3. Fulfillment Module Creation
- **Impact**: MEDIUM (new module)
- **Affected**: ALL fulfillment capabilities (onsite, pickup, delivery)
- **Migration**:
  - Create `src/modules/fulfillment/` structure
  - Move shared logic from Sales to Fulfillment/core
  - Create /onsite, /pickup, /delivery subfolders
- **Estimated Time**: 5-7 days

#### 4. Mobile Module Creation
- **Impact**: HIGH (complex offline sync)
- **Affected**: mobile_operations, delivery_shipping capabilities
- **Migration**:
  - Create `src/modules/mobile/` structure
  - Implement offline POS (IndexedDB)
  - Integrate GPS tracking (Google Maps API)
  - Build sync manager (conflict resolution)
- **Estimated Time**: 8-10 days

#### 5. Finance Module Creation
- **Impact**: MEDIUM (new B2B domain)
- **Affected**: corporate_sales capability
- **Migration**:
  - Create `src/modules/finance/` structure
  - Implement corporate accounts, credit management
  - Build invoice scheduling (NET payment terms)
  - Create AR aging report
- **Estimated Time**: 10-12 days

### Low Impact Changes (Enhancements)

#### 6. Sales E-commerce/B2B Enhancement
- **Impact**: LOW (subfolders addition)
- **Affected**: online_store, corporate_sales capabilities
- **Migration**:
  - Add `src/modules/sales/ecommerce/` subfolder (online store)
  - Add `src/modules/sales/b2b/` subfolder (corporate sales)
- **Estimated Time**: 6-8 days (e-commerce) + 3-4 days (B2B)

---

## 📋 TOTAL IMPLEMENTATION ESTIMATE

### Summary by Priority

| Priority | Changes | Estimated Time | Risk |
|----------|---------|----------------|------|
| **P0 (Critical)** | Floor deletion, Kitchen rename, Fulfillment creation | 8-12 days | HIGH |
| **P1 (High)** | Mobile module, Finance module | 18-22 days | HIGH |
| **P2 (Medium)** | Sales enhancements (e-commerce, B2B) | 9-12 days | MEDIUM |
| **P3 (Low)** | Feature cleanup, bug fixes | 2-3 days | LOW |
| **TOTAL** | | **37-49 days** | |

### Phased Rollout Recommendation

**Phase 0.5: Architecture Migration** (10-14 days)
- Delete Floor module → Fulfillment/onsite
- Rename Kitchen → Production
- Create Fulfillment module skeleton
- **Goal**: Stabilize core architecture

**Phase 1: Fulfillment Capabilities** (15-20 days)
- Complete Fulfillment module (onsite/pickup/delivery)
- Integrate with Sales, Production, Staff
- **Goal**: Unified fulfillment experience

**Phase 2: Mobile Operations** (8-10 days)
- Create Mobile module (offline POS, GPS, routes)
- Integrate with Fulfillment (delivery tracking)
- **Goal**: Mobile business support

**Phase 3: B2B Sales** (10-12 days)
- Create Finance module (corporate accounts, credit)
- Add Sales/b2b subfolder (quotes, contracts)
- **Goal**: B2B sales capability

**Phase 4: Service Modes** (5-7 days)
- Enhance Scheduling (appointment booking, including walk-in immediate booking)
- **Goal**: Service business support

---

## ✅ SUCCESS CRITERIA

### Architecture Quality

- [x] Module count reduced (27 → 22 = 19% reduction)
- [x] DRY principle applied (76% fulfillment overlap consolidated)
- [x] Multi-industry support (generic terminology)
- [x] Clear domain separation (Service vs Fulfillment vs Production)
- [x] Infrastructure services identified (Mobile module)

### Business Value

- [x] All 8 capabilities supported (87 features mapped)
- [x] Conditional activation (modules shown based on capabilities)
- [x] Extensibility (easy to add new fulfillment types, service modes)
- [x] Scalability (supports multi-location, multi-industry)

### Technical Quality

- [x] Cross-module integration documented (hooks, events, widgets)
- [x] Migration plan defined (phased rollout)
- [x] Implementation estimates provided (39-52 days)
- [x] Risk assessment completed (HIGH/MEDIUM/LOW)

---

## 📚 APPENDIX

### A. Module Dependency Graph

```
Dashboard (hub)
  ├─ depends on: ALL modules (widgets)
  └─ provides: central hub

Sales (core)
  ├─ depends on: Fulfillment, Materials, Customers, Fiscal
  └─ provides: orders, payments

Fulfillment (NEW)
  ├─ depends on: Sales, Production, Staff, Materials, Mobile
  └─ provides: order logistics

Production (RENAMED)
  ├─ depends on: Materials, Sales
  └─ provides: prepared orders

Mobile (NEW - infrastructure)
  ├─ depends on: Sales, Materials, Maps API
  └─ provides: GPS tracking, offline POS (SHARED)

Finance (NEW)
  ├─ depends on: Sales, Customers, Fiscal
  └─ provides: B2B credit, invoicing

Staff (foundation)
  ├─ depends on: None
  └─ provides: employee data, availability

Scheduling (service mode)
  ├─ depends on: Staff, Customers
  └─ provides: appointments

Materials (supply chain)
  ├─ depends on: Suppliers, Products
  └─ provides: inventory data

Customers (CRM)
  ├─ depends on: None
  └─ provides: customer data
```

### B. Feature Count by Domain

| Domain | Feature Count | % of Total |
|--------|---------------|------------|
| Sales | 23 | 28% |
| Fulfillment | 23 | 28% |
| Inventory | 12 | 15% |
| Staff | 7 | 9% |
| Scheduling | 5 | 6% |
| Finance | 4 | 5% |
| Production | 4 | 5% |
| Mobile | 3 | 4% |
| **Total** | **81** | **100%** |

**Note**: Features reduced from 84 (current code) to 81 after Phase 0.5 cleanup.

---

**END OF ARCHITECTURE_DESIGN_V2.md**

---
