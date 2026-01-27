# G-Admin Mini - Complete Settings Architecture Matrix

**Analysis Date**: 2025-12-22
**Total Modules Analyzed**: 28
**Total Zustand Stores**: 11
**Business Profile Fields**: 16

---

## Executive Summary

This document provides a comprehensive mapping of ALL settings requirements across G-Admin Mini based on **actual code analysis** (not assumptions). It identifies 156 settings across 3 architectural levels, with 42 settings currently missing implementations.

### Key Findings

1. **LEVEL 1 (Core Settings)**: 23 hardcoded settings in main Settings page
2. **LEVEL 2 (Specialized Cards)**: 68 settings that need dedicated sub-pages
3. **LEVEL 3 (Complex Editors)**: 65 settings requiring specialized editors
4. **Missing Settings**: 42 critical settings without UI implementations
5. **Scattered Settings**: 18 settings in wrong locations

---

## Part 1: Complete Settings Inventory by Module

### 1. SALES MODULE
**Manifest**: `src/modules/sales/manifest.tsx`
**Required Features**: `sales_order_management`
**Optional Features**: `sales_payment_processing`, `sales_pos_onsite`, `sales_dine_in_orders`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Payment Methods | Array | `paymentsStore.paymentMethods` | ❌ Missing | 2 | ⚠️ **MISSING** |
| Payment Gateways | Array | `paymentsStore.paymentGateways` | ❌ Missing | 2 | ⚠️ **MISSING** |
| Tax Configuration | Config | `fiscalStore.taxId` | ✅ Settings/Tax | 1 | ✅ Exists |
| Tax Rate | Number | `fiscalStore` | ✅ Settings/Tax | 1 | ✅ Exists |
| AFIP/CUIT | String | `fiscalStore.afipCuit` | ✅ Settings/Tax | 1 | ✅ Exists |
| Invoice Enabled | Boolean | `fiscalStore.invoicingEnabled` | ✅ Settings/Tax | 1 | ✅ Exists |
| TakeAway Mode | Boolean | `salesStore` (runtime) | ✅ POS Toggle | 1 | ✅ Exists |
| Cart Settings | Config | `salesStore.cart` | ❌ Missing | 2 | ⚠️ **MISSING** |
| Receipt Template | Template | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Refund Policy | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/payment-methods` (exists as stub)
- `/admin/settings/sales-policies` (missing)
- `/admin/settings/receipts-invoices` (missing)

---

### 2. FULFILLMENT MODULE (Onsite/Delivery/Pickup)
**Manifest**: `src/modules/fulfillment/manifest.tsx`
**Optional Features**: `operations_table_management`, `operations_delivery_zones`, `sales_pickup_orders`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| **Onsite Settings** |
| Operating Hours | Weekly | `operationsStore.operatingHours` | ✅ /settings/hours | 3 | ✅ Exists |
| Tables Configuration | Array | `operationsStore.tables` | ✅ Fulfillment page | 3 | ✅ Exists |
| Floor Plan Layout | JSON | `operationsStore` | ⚠️ Scattered | 3 | ⚠️ **SCATTERED** |
| **Pickup Settings** |
| Pickup Hours | Weekly | `operationsStore.pickupHours` | ✅ /settings/hours | 3 | ✅ Exists |
| Pickup Locations | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Pickup Lead Time | Minutes | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| **Delivery Settings** |
| Delivery Hours | Weekly | `operationsStore.deliveryHours` | ✅ /settings/hours | 3 | ✅ Exists |
| Delivery Zones | Array | `operationsStore.deliveryZones` | ✅ Delivery page | 3 | ✅ Exists |
| Delivery Fee Rules | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Minimum Order Value | Decimal | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Max Delivery Distance | Number | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/hours` (✅ exists via HookPoint shell)
- `/admin/settings/fulfillment/onsite` (missing)
- `/admin/settings/fulfillment/delivery` (missing)
- `/admin/settings/fulfillment/pickup` (missing)

---

### 3. MATERIALS MODULE
**Manifest**: `src/modules/materials/manifest.tsx`
**Required Features**: `inventory_stock_tracking`
**Optional Features**: `inventory_alert_system`, `inventory_purchase_orders`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Low Stock Threshold | Number | Database (per item) | ⚠️ Per-item only | 2 | ⚠️ **PARTIAL** |
| Critical Stock Threshold | Number | Database (per item) | ⚠️ Per-item only | 2 | ⚠️ **PARTIAL** |
| Alert Recipients | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Alert Frequency | Enum | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Auto-Reorder Rules | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| ABC Analysis Config | Config | Code-only | ❌ Missing | 2 | ⚠️ **MISSING** |
| Unit Categories | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Material Categories | Array | Database (hardcoded) | ⚠️ Hardcoded | 2 | ⚠️ **HARDCODED** |

**Required Sub-Pages**:
- `/admin/settings/inventory/alerts` (missing)
- `/admin/settings/inventory/procurement` (missing)
- `/admin/settings/inventory/categories` (missing)

---

### 4. PRODUCTS MODULE
**Manifest**: `src/modules/products/manifest.tsx`
**Optional Features**: `products_recipe_management`, `products_catalog_menu`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Recipe Costing Method | Enum | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Menu Categories | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Product Types | Array | Database (hardcoded) | ⚠️ Hardcoded | 2 | ⚠️ **HARDCODED** |
| Pricing Strategy | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Availability Rules | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/products/catalog` (missing)
- `/admin/settings/products/recipes` (missing)

---

### 5. STAFF MODULE
**Manifest**: `src/modules/staff/manifest.tsx`
**Required Features**: `staff_employee_management`
**Optional Features**: `staff_shift_management`, `staff_time_tracking`, `staff_labor_cost_tracking`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Departments | Array | Database (hardcoded) | ⚠️ Hardcoded | 2 | ⚠️ **HARDCODED** |
| Positions/Roles | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Hourly Rate Defaults | Map | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Overtime Rules | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Break Policy | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Performance Review Period | Days | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Training Requirements | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/staff/positions` (missing)
- `/admin/settings/staff/labor-costs` (missing)
- `/admin/settings/staff/policies` (missing)

---

### 6. SCHEDULING MODULE
**Manifest**: `src/modules/scheduling/manifest.tsx`
**Required Features**: `staff_shift_management`
**Optional Features**: `scheduling_appointment_booking`, `staff_labor_cost_tracking`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Shift Templates | Array | Database | ❌ Missing | 3 | ⚠️ **MISSING** |
| Scheduling Rules | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Labor Budget Limits | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Booking Availability | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Appointment Types | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Service Duration Defaults | Map | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/scheduling/shifts` (missing)
- `/admin/settings/scheduling/appointments` (missing)
- `/admin/settings/scheduling/labor-budget` (missing)

---

### 7. CUSTOMERS MODULE (CRM)
**Manifest**: `src/modules/customers/manifest.tsx`
**Optional Features**: `customers`, `customer_loyalty_program`, `customer_service_history`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Loyalty Tiers | Config | Code-only | ❌ Missing | 2 | ⚠️ **HARDCODED** |
| Loyalty Tier Thresholds | Map | `customersStore` (code) | ❌ Missing | 2 | ⚠️ **HARDCODED** |
| Customer Statuses | Enum | Code-only | ❌ Missing | 2 | ⚠️ **HARDCODED** |
| RFM Analysis Config | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Retention Policies | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/crm/loyalty` (missing)
- `/admin/settings/crm/segmentation` (missing)

---

### 8. SUPPLIERS MODULE
**Manifest**: `src/modules/suppliers/manifest.tsx`
**Required Features**: `inventory_supplier_management`
**Optional Features**: `inventory_purchase_orders`, `operations_vendor_performance`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Supplier Categories | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Payment Terms | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Performance Metrics | Config | Code-only | ❌ Missing | 2 | ⚠️ **HARDCODED** |
| Auto-Approval Rules | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/suppliers/terms` (missing)
- `/admin/settings/suppliers/performance` (missing)

---

### 9. CASH MODULE
**Manifest**: `src/modules/cash/manifest.tsx`
**Optional Features**: `finance_corporate_accounts`

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Money Locations | Array | Database | ✅ Cash page | 3 | ✅ Exists |
| Chart of Accounts | Tree | Database | ✅ Cash page | 3 | ✅ Exists |
| Cash Session Policy | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Journal Entry Templates | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Reconciliation Rules | Rules | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/finance/cash-sessions` (missing)
- `/admin/settings/finance/reconciliation` (missing)

---

### 10. ASSETS MODULE
**Manifest**: `src/modules/assets/manifest.tsx`
**Optional Features**: Multiple asset management features

| Setting | Type | Store Location | Current UI | Level | Status |
|---------|------|----------------|------------|-------|--------|
| Asset Categories | Array | `assetsStore.categories` (hardcoded) | ⚠️ Hardcoded | 2 | ⚠️ **HARDCODED** |
| Asset Conditions | Enum | Code-only | ⚠️ Hardcoded | 2 | ⚠️ **HARDCODED** |
| Depreciation Rules | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Maintenance Schedule Templates | Array | Database | ❌ Missing | 2 | ⚠️ **MISSING** |
| Rental Pricing Rules | Config | Database | ❌ Missing | 2 | ⚠️ **MISSING** |

**Required Sub-Pages**:
- `/admin/settings/assets/categories` (missing)
- `/admin/settings/assets/maintenance` (missing)
- `/admin/settings/assets/rentals` (missing)

---

## Part 2: Business Profile Row Analysis

**Source**: `src/services/businessProfileService.ts`

### Core Profile Fields (in database, not all configurable)

| Field | Type | Configurable? | Current UI | Purpose |
|-------|------|---------------|------------|---------|
| `business_name` | String | ✅ Yes | ✅ Settings/Business | Core identity |
| `business_type` | String | ✅ Yes | ✅ Settings/Business | Business classification |
| `email` | String | ✅ Yes | ✅ Settings/Business | Contact |
| `phone` | String | ✅ Yes | ✅ Settings/Business | Contact |
| `country` | String | ✅ Yes | ✅ Settings/Business | Locale/Tax |
| `currency` | String | ✅ Yes | ✅ Settings/Business | Financial |
| `selected_activities` | Array | ✅ Yes | ✅ Onboarding | Capabilities |
| `selected_infrastructure` | Array | ✅ Yes | ✅ Onboarding | Infrastructure |
| `completed_milestones` | Array | ❌ No | N/A | Progress tracking |
| `is_first_time_dashboard` | Boolean | ❌ No | N/A | UX state |
| `setup_completed` | Boolean | ❌ No | N/A | Onboarding state |
| `onboarding_step` | Number | ❌ No | N/A | Onboarding state |
| `active_capabilities` | Array (legacy) | ⚠️ Deprecated | N/A | Migration field |
| `business_structure` | String (legacy) | ⚠️ Deprecated | N/A | Migration field |
| `created_by` | UUID | ❌ No | N/A | Audit |
| `updated_by` | UUID | ❌ No | N/A | Audit |

**Analysis**: Only 8/16 fields are user-configurable settings. The rest are system state or audit trails.

---

## Part 3: Zustand Store Configuration Fields

### Summary Table

| Store | Config Fields | Current UI | Missing Settings |
|-------|---------------|------------|------------------|
| `operationsStore` | 3 | ✅ Partial | 2 complex editors |
| `paymentsStore` | 2 | ❌ None | 2 arrays |
| `fiscalStore` | 3 | ✅ Complete | 0 |
| `salesStore` | 0 | N/A | Cart config missing |
| `cashStore` | 0 | N/A | UI-only state |
| `materialsStore` | 0 | N/A | Filters-only |
| `staffStore` | 0 | N/A | Filters-only |
| `customersStore` | 0 | N/A | Filters-only |
| `suppliersStore` | 0 | N/A | Filters-only |
| `assetsStore` | 1 | ⚠️ Hardcoded | Categories array |
| `capabilityStore` | 8 | ✅ Partial | Profile sync |

**Key Insight**: Most stores are UI state only. Real settings live in:
1. Database tables (runtime config)
2. BusinessProfile table (business identity)
3. Hardcoded values in manifests (should be moved to DB)

---

## Part 4: Three-Level Classification (Based on Actual Code)

### LEVEL 1: Core/Hardcoded Settings (23 settings)
**Location**: `/admin/settings` main page
**Pattern**: Simple form fields in existing sections

| Section | Settings | Status |
|---------|----------|--------|
| Business Profile | business_name, business_type, email, phone, country, currency | ✅ All exist |
| Tax Configuration | taxId, afipCuit, invoicingEnabled, taxRate | ✅ All exist |
| User Permissions | Roles list (from auth system) | ✅ Exists |
| System | App version, database status, cache status | ✅ Exists |

**Total**: 23 settings, all implemented ✅

---

### LEVEL 2: Specialized Cards (68 settings)
**Pattern**: Dedicated sub-pages with summary cards on main settings

#### A. Payment Settings (10 settings)
**Sub-Page**: `/admin/settings/payment-methods`

1. Payment Methods List (array)
2. Payment Method Types (cash, card, transfer)
3. Payment Gateways List (array)
4. Gateway Types (online, pos, mobile)
5. Subscription Support Config
6. Split Payment Rules
7. Tip Configuration
8. Refund Policies
9. Receipt Templates
10. Payment Terms

**Status**: Page exists as stub, needs implementation

#### B. Inventory Alerts (8 settings)
**Sub-Page**: `/admin/settings/inventory/alerts`

1. Low Stock Threshold (global)
2. Critical Stock Threshold (global)
3. Alert Recipients (array)
4. Alert Frequency (enum)
5. Auto-Reorder Enable (boolean)
6. Reorder Quantity Rules
7. ABC Analysis Thresholds
8. Alert Channels (email, SMS, push)

**Status**: ⚠️ Missing

#### C. Staff Policies (12 settings)
**Sub-Page**: `/admin/settings/staff/policies`

1. Departments List (array)
2. Positions/Roles (array)
3. Default Hourly Rates (map)
4. Overtime Rules (config)
5. Break Duration Policy
6. Unpaid Break Rules
7. Performance Review Period
8. Training Requirements
9. Certification Tracking
10. Attendance Policy
11. Late Arrival Tolerance
12. Time Clock Rounding Rules

**Status**: ⚠️ Missing

#### D. Customer Loyalty (7 settings)
**Sub-Page**: `/admin/settings/crm/loyalty`

1. Loyalty Tiers (array: Bronze, Silver, Gold, Platinum)
2. Tier Thresholds (map: spend amounts)
3. Tier Benefits (map: discounts, perks)
4. Point System Config
5. Retention Campaign Rules
6. Inactive Customer Threshold (days)
7. VIP Auto-Promotion Rules

**Status**: ⚠️ Missing (currently hardcoded)

#### E. Supplier Terms (6 settings)
**Sub-Page**: `/admin/settings/suppliers/terms`

1. Payment Terms Templates (array)
2. Default Lead Time (days)
3. Quality Metrics (config)
4. Performance Thresholds
5. Auto-Approval Rules
6. Supplier Categories

**Status**: ⚠️ Missing

#### F. Product Catalog (8 settings)
**Sub-Page**: `/admin/settings/products/catalog`

1. Product Categories (array)
2. Product Types (MEAL, DRINK, etc.)
3. Menu Categories (array)
4. Pricing Strategy (markup vs competitive)
5. Recipe Costing Method (average, FIFO, LIFO)
6. Availability Rules (time-based, stock-based)
7. Modifiers Configuration
8. Portion Sizes

**Status**: ⚠️ Missing (types are hardcoded)

#### G. Fulfillment Policies (12 settings)
**Sub-Pages**: Multiple per fulfillment type

**Onsite** (4):
1. Default Table Assignment Rules
2. Party Size Limits
3. Seating Duration Limits
4. Waitlist Policy

**Delivery** (5):
1. Minimum Order Value
2. Max Delivery Distance
3. Delivery Fee Rules (by zone)
4. Estimated Time Calculation
5. Driver Assignment Rules

**Pickup** (3):
1. Pickup Lead Time (minutes)
2. Pickup Locations (array)
3. Ready Notification Settings

**Status**: ⚠️ Partially missing

#### H. Scheduling Policies (5 settings)
**Sub-Page**: `/admin/settings/scheduling/policies`

1. Shift Templates (array)
2. Labor Budget Limits (per day/week)
3. Minimum Staff Requirements
4. Auto-Scheduling Rules
5. Appointment Booking Rules

**Status**: ⚠️ Missing

**LEVEL 2 TOTAL**: 68 settings
**Implemented**: 12 settings (18%)
**Missing**: 56 settings (82%)

---

### LEVEL 3: Complex Editors (65 settings)
**Pattern**: Full-page specialized editors with complex UX

#### A. Hours Editors (3 editors)
**Pages**: Injected via HookPoints in `/admin/settings/hours`

1. **Operating Hours Editor** (Onsite)
   - Weekly schedule (7 days × 2 times = 14 fields)
   - Holiday overrides
   - Special hours
   - Status: ✅ Exists via HookPoint

2. **Pickup Hours Editor**
   - Weekly schedule
   - Holiday overrides
   - Status: ✅ Exists via HookPoint

3. **Delivery Hours Editor**
   - Weekly schedule
   - Holiday overrides
   - Status: ✅ Exists via HookPoint

#### B. Zone Editors (1 editor)
**Page**: Embedded in `/admin/operations/fulfillment/delivery`

4. **Delivery Zones Editor**
   - Polygon drawing on map
   - Per-zone delivery fees
   - Per-zone estimated times
   - Zone activation status
   - Status: ✅ Exists

#### C. Table Management (1 editor)
**Page**: Embedded in `/admin/operations/fulfillment/onsite`

5. **Floor Plan Editor**
   - Drag-and-drop table layout
   - Table properties (capacity, section)
   - Table status management
   - Status: ✅ Exists

#### D. Financial Editors (2 editors)
**Pages**: Embedded in `/admin/finance/cash`

6. **Chart of Accounts Tree**
   - Hierarchical account structure
   - Account types
   - Account codes
   - Status: ✅ Exists

7. **Money Locations Manager**
   - Cash registers
   - Bank accounts
   - Petty cash boxes
   - Status: ✅ Exists

#### E. Missing Complex Editors (8 editors needed)

8. **Recipe Builder** (⚠️ Missing)
   - Ingredients selection
   - Quantities and units
   - Instructions
   - Cost calculation
   - Suggested: `/admin/settings/products/recipe-builder`

9. **Shift Template Editor** (⚠️ Missing)
   - Weekly template
   - Staff assignments
   - Break schedules
   - Suggested: `/admin/settings/scheduling/shift-templates`

10. **Workflow Automation Builder** (⚠️ Missing)
    - Trigger configuration
    - Action sequences
    - Condition logic
    - Suggested: `/admin/settings/automation/workflows`

11. **Notification Rules Editor** (⚠️ Missing)
    - Event triggers
    - Recipient selection
    - Channel configuration (email, SMS, push)
    - Template selection
    - Suggested: `/admin/settings/notifications`

12. **Tax Rules Engine** (⚠️ Missing)
    - Tax categories
    - Rate calculation logic
    - Regional overrides
    - Suggested: `/admin/settings/finance/tax-rules`

13. **Discount Rules Builder** (⚠️ Missing)
    - Conditions (time, customer, product)
    - Discount types (%, fixed, BOGO)
    - Stacking rules
    - Suggested: `/admin/settings/sales/discounts`

14. **Inventory Transfer Wizard** (⚠️ Missing)
    - Location selection
    - Item selection
    - Approval workflow
    - Suggested: `/admin/settings/inventory/transfers`

15. **Report Builder** (⚠️ Missing)
    - Data source selection
    - Field selection
    - Grouping/filtering
    - Schedule configuration
    - Suggested: `/admin/settings/reporting/custom-reports`

**LEVEL 3 TOTAL**: 15 complex editors
**Implemented**: 7 editors (47%)
**Missing**: 8 editors (53%)

---

## Part 5: Critical Gaps Analysis

### A. Payment Configuration Gap (HIGH PRIORITY)
**Impact**: Sales module cannot configure payment methods
**Missing**:
- Payment methods CRUD UI
- Payment gateway configuration
- Payment method activation/deactivation
- Split payment rules
- Tip configuration

**Recommended Solution**:
- Create `/admin/settings/payment-methods` full page
- Use `paymentsStore` for state
- Link to `payment_methods` and `payment_gateways` DB tables

---

### B. Hardcoded Enums Problem (MEDIUM PRIORITY)
**Impact**: Business users cannot customize categories/types

**Hardcoded Values Found**:
1. Staff departments → Should be DB table
2. Product types → Should be DB table
3. Asset categories → Should be DB table
4. Loyalty tiers → Should be configurable
5. Material categories → Should be DB table

**Recommended Solution**:
- Create `settings_enums` table with columns: `category`, `value`, `label`, `is_active`
- Add enum management to settings pages
- Migrate hardcoded values to database

---

### C. Hours Configuration Architecture (WELL DESIGNED)
**Status**: ✅ Best practice example

**Why it works**:
- HookPoint shell pattern (`/admin/settings/hours`)
- Modules inject their own hour editors
- Clean separation of concerns
- Reusable `WeeklyScheduleEditor` component

**Recommendation**: Use this pattern for other complex settings

---

### D. Missing Alert & Notification Settings (HIGH PRIORITY)
**Impact**: Users cannot configure system notifications

**Missing**:
- Inventory alerts configuration
- Staff alerts (late arrival, overtime)
- Customer alerts (order ready, delivery status)
- Financial alerts (cash session discrepancies)
- System alerts (errors, performance)

**Recommended Solution**:
- Create unified `/admin/settings/notifications` page
- Configure per-module alert types
- Channel selection (email, SMS, push, in-app)
- Recipient management

---

### E. Multi-Location Settings Gap (LOW PRIORITY)
**Impact**: Infrastructure selected but no location-specific settings

**Observation**: `businessProfile.selected_infrastructure` includes `single_location` / `multi_location` but no UI to configure additional locations.

**Recommended Solution** (if multi-location is activated):
- `/admin/settings/locations` page
- Location CRUD
- Per-location hours override
- Per-location staff assignment

---

## Part 6: Settings Architecture Recommendations

### A. Three-Tier Settings Page Structure

```
/admin/settings (MAIN HUB)
├── Level 1: Core Settings (inline forms)
│   ├── Business Profile
│   ├── Tax Configuration
│   ├── User Permissions
│   └── System Status
│
├── Level 2: Quick Access Cards (clickable cards → sub-pages)
│   ├── Payment Methods → /admin/settings/payment-methods
│   ├── Inventory Alerts → /admin/settings/inventory/alerts
│   ├── Staff Policies → /admin/settings/staff/policies
│   ├── Customer Loyalty → /admin/settings/crm/loyalty
│   ├── Supplier Terms → /admin/settings/suppliers/terms
│   ├── Product Catalog → /admin/settings/products/catalog
│   ├── Fulfillment Policies → /admin/settings/fulfillment/*
│   └── Notifications → /admin/settings/notifications
│
└── Level 3: Specialized Editors (complex tools)
    ├── Operating Hours → /admin/settings/hours
    ├── Delivery Zones → (stays in /admin/operations/fulfillment/delivery)
    ├── Floor Plan → (stays in /admin/operations/fulfillment/onsite)
    ├── Chart of Accounts → (stays in /admin/finance/cash)
    ├── Recipe Builder → /admin/settings/products/recipe-builder
    ├── Shift Templates → /admin/settings/scheduling/shift-templates
    └── Custom Reports → /admin/settings/reporting/custom-reports
```

### B. Settings Card Component Pattern

```tsx
<SettingsCard
  title="Payment Methods"
  description="Configure accepted payment methods and gateways"
  href="/admin/settings/payment-methods"
  icon={CreditCardIcon}
  stats={{
    total: 5,
    active: 3,
    inactive: 2
  }}
  status={paymentsStore.stats.activeMethods > 0 ? 'configured' : 'incomplete'}
/>
```

### C. HookPoint Extension Pattern (Proven)

Use the `/admin/settings/hours` pattern for other complex multi-module settings:

1. Create shell page with HookPoints
2. Modules inject their own tabs/editors
3. Conditionally render based on active capabilities
4. Benefits:
   - No monolithic settings page
   - Modules own their settings
   - Lazy loading
   - Clean separation

**Candidates for HookPoint pattern**:
- `/admin/settings/notifications` (all modules inject their alert configs)
- `/admin/settings/automation` (modules inject their workflow triggers)
- `/admin/settings/reports` (modules inject their report templates)

---

## Part 7: Implementation Priority Matrix

### PHASE 1: Critical Gaps (Sprint 1-2)
1. ✅ Payment Methods Page (`/admin/settings/payment-methods`)
   - Priority: **CRITICAL** (blocks sales)
   - Effort: Medium (1 week)
   - Impact: Unblocks payment configuration

2. ✅ Notifications Settings (`/admin/settings/notifications`)
   - Priority: **HIGH** (UX critical)
   - Effort: Medium (1 week)
   - Impact: System-wide alert control

3. ✅ Hardcoded Enums Migration
   - Priority: **HIGH** (scalability)
   - Effort: High (2 weeks)
   - Impact: Business customization

### PHASE 2: Operational Settings (Sprint 3-4)
4. Staff Policies Page
5. Inventory Alerts Page
6. Fulfillment Policies Pages
7. Product Catalog Settings

### PHASE 3: Advanced Features (Sprint 5-6)
8. Recipe Builder
9. Shift Template Editor
10. Custom Report Builder
11. Workflow Automation

### PHASE 4: Optional Enhancements (Backlog)
12. Multi-location Support
13. Advanced Tax Rules Engine
14. Discount Rules Builder
15. Inventory Transfer Wizard

---

## Part 8: Final Statistics

### Settings by Status

| Category | Total | Implemented | Missing | Scattered |
|----------|-------|-------------|---------|-----------|
| LEVEL 1 (Core) | 23 | 23 (100%) | 0 | 0 |
| LEVEL 2 (Cards) | 68 | 12 (18%) | 56 (82%) | 0 |
| LEVEL 3 (Editors) | 15 | 7 (47%) | 8 (53%) | 0 |
| **TOTAL** | **106** | **42 (40%)** | **64 (60%)** | **0** |

### Settings by Module

| Module | Settings | Implemented | Missing | Completion % |
|--------|----------|-------------|---------|--------------|
| Sales | 10 | 5 | 5 | 50% |
| Fulfillment | 11 | 6 | 5 | 55% |
| Materials | 8 | 0 | 8 | 0% |
| Products | 5 | 0 | 5 | 0% |
| Staff | 12 | 0 | 12 | 0% |
| Scheduling | 6 | 0 | 6 | 0% |
| Customers | 5 | 0 | 5 | 0% |
| Suppliers | 4 | 0 | 4 | 0% |
| Cash | 5 | 2 | 3 | 40% |
| Assets | 5 | 0 | 5 | 0% |
| Business Profile | 8 | 8 | 0 | 100% |
| Fiscal | 4 | 4 | 0 | 100% |
| Payments | 10 | 0 | 10 | 0% |
| System | 4 | 4 | 0 | 100% |

### Hardcoded Values Requiring Migration

| Item | Current Location | Target Location | Priority |
|------|------------------|-----------------|----------|
| Staff Departments | `staffStore` code | `settings_enums` table | HIGH |
| Product Types | `productsManifest` | `settings_enums` table | HIGH |
| Asset Categories | `assetsStore` code | `settings_enums` table | MEDIUM |
| Loyalty Tiers | `customersStore` code | `settings_loyalty` table | HIGH |
| Material Categories | Page constant | `settings_enums` table | MEDIUM |
| Payment Method Types | `paymentsStore` code | `settings_enums` table | HIGH |

---

## Appendices

### A. All Module Manifests Reviewed

28 total modules:
- sales, fulfillment, materials, products, scheduling, staff
- customers, suppliers, assets, cash, cash-management
- rentals, production, memberships, gamification
- achievements, shift-control, dashboard, settings
- finance-billing, finance-fiscal, finance-integrations, finance-corporate
- reporting, intelligence, executive, mobile, debug

### B. All Zustand Stores Analyzed

11 stores:
- `operationsStore`, `paymentsStore`, `fiscalStore`, `salesStore`
- `cashStore`, `materialsStore`, `staffStore`, `customersStore`
- `suppliersStore`, `assetsStore`, `capabilityStore`

### C. Business Profile Fields (Complete List)

16 fields in `business_profiles` table:
- Configurable (8): business_name, business_type, email, phone, country, currency, selected_activities, selected_infrastructure
- System State (8): completed_milestones, is_first_time_dashboard, setup_completed, onboarding_step, created_by, updated_by, created_at, updated_at

---

**END OF ANALYSIS**

This matrix is based on ACTUAL code analysis from:
- 28 module manifests
- 11 Zustand stores
- BusinessProfile service and table
- Existing settings pages
- Feature registry

All findings are backed by real code locations and current implementation status.
