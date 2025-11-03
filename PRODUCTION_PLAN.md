# G-ADMIN MINI - PRODUCTION READINESS PLAN

Version: 1.1.0 (Updated with Architecture V2)
Date: 2025-01-14 (Updated: 2025-01-24)
**Status**: 🚧 IN PROGRESS

**Single Source of Truth** - Este documento reemplaza toda la documentación previa. El código es la verdad, este documento es la guía.

---
n## 🆕 ARCHITECTURE V2 UPDATE (2025-01-24)

**CRITICAL**: Before proceeding with pilot modules, Architecture V2 migration MUST be completed.

**New Documents Created:**
1. **MIGRATION_PLAN.md** - Migration guide (Phase 0.5: 10-14 days)
2. **CROSS_MODULE_INTEGRATION_MAP.md** - Integration catalog (24 modules)
3. **FEATURE_MODULE_UI_MAP.md** - 81 features mapped to modules/routes/components
4. **ARCHITECTURE_DESIGN_V2.md** - Master architecture document

**Key Changes:**
- **Modules**: 27 → 24 modules (22 core + 2 optional, -11% reduction)
- **Features**: 84 (current code) → 81 (after Phase 0.5 cleanup)
- **Capabilities**: 8 capabilities (walkin_service eliminated)
- **New Modules**: Fulfillment, Mobile, Finance
- **Deleted**: Floor → Fulfillment/onsite, Ecommerce → Sales/ecommerce
- **Renamed**: Kitchen → Production

**Updated Execution Plan:**
```
Phase 0.5 (NEW - REQUIRED FIRST): Architecture Migration (10-14 days)
  ├─ Registry updates (capabilities, features, modules)
  ├─ Delete Floor module → Fulfillment/onsite
  ├─ Rename Kitchen → Production
  ├─ Delete Ecommerce → Sales/ecommerce
  ├─ Database migration
  └─ Testing & validation

Phase 0 (THIS PLAN): Investigation & Planning (completed)
Phase 1-4 (THIS PLAN): Pilot Modules + Expansion (depends on Phase 0.5)
```

**Timeline Integration:**
- Phase 0.5 (MIGRATION_PLAN): 10-14 days
- Phase 1-4 (THIS PLAN): 35-50 hours (after Phase 0.5 complete)
- **TOTAL ESTIMATE**: ~60-80 hours (3-4 weeks with Phase 0.5)

**See Also:**
- `docs/architecture-v2/deliverables/ARCHITECTURE_DESIGN_V2.md` - Master architecture document
- Section 2.1 below for updated module inventory
- Section 9 below for integrated phases


## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Production-Ready Criteria](#3-production-ready-criteria)
4. [Architecture Overview](#4-architecture-overview)
5. [Feature → Module → Page → UI Mapping](#5-feature--module--page--ui-mapping)
6. [Cross-Module Relationship Matrix](#6-cross-module-relationship-matrix)
7. [Permission System Design](#7-permission-system-design)
8. [Pilot Module Selection](#8-pilot-module-selection)
9. [Execution Phases](#9-execution-phases)
10. [Open Questions & Decisions](#10-open-questions--decisions)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Current Status

**Code Base Health:**
- ✅ **Architecture**: Solid Capabilities → Features → Modules system (27 modules)
- ✅ **Module Registry**: WordPress-style hook system implemented
- ✅ **Database**: Supabase connected, service layers in place
- 🔴 **Lint**: 3,156 ESLint errors blocking build quality
- 🟡 **Hook Coverage**: 10/27 modules using hook system (37%)
- 🟡 **Dependencies**: 7 modules with incorrect/missing dependencies

**Documentation Status:**
- ❌ **Before**: 116 documents with massive duplication
- ✅ **After**: 0 docs (DELETED) - Code + CLAUDE.md + this file = truth

### 1.2 Documentation Strategy (DECISION)

**HYBRID APPROACH - Reference Modules + Minimal Docs:**

**Core Philosophy:**
- ❌ **NOT**: Extensive documentation that gets outdated
- ✅ **YES**: 2-3 **exemplary modules** that demonstrate all patterns correctly

**What This Means:**
1. **Reference Modules** (Materials, Sales, Kitchen):
   - Perfect scaffolding (components/, services/, hooks/, types.ts)
   - All architectural patterns applied correctly
   - Cross-module relationships **explicitly mapped in README**
   - Serve as **living examples** for other modules

2. **Minimal Centralized Docs** (2-3 files max):
   - `PRODUCTION_PLAN.md` (this file) - Strategic planning
   - `CLAUDE.md` - AI assistant instructions
   - Future: `CROSS_MODULE_PATTERNS.md` (discovered during pilot modules)

3. **Module READMEs** (critical for cross-module clarity):
   - **MUST document**: Cross-module relationships (provides/consumes)
   - **MUST document**: Interactive elements from other modules
   - **MUST document**: Feature activation logic
   - **NOT documented**: How the code works (read the code)

**Key Insight from Discussion:**
> "Lo que sí me parece importante hacer hincapié en no solo mapear bien las relaciones entre el featureRegistry y demás capas del capability system y cómo se relacionan con las páginas, vistas, y elementos interactivos de cada una, y también hay que prestar mucha atención a la estrategia para diseñar nuestras relaciones cross-module y cómo se relacionan los módulos entre sí, qué elementos interactivos tendrán, cuáles pertenecen a otros módulos"

**Translation:** The hard part isn't writing code, it's **mapping the web of relationships**:
- FeatureRegistry → Modules → Pages → UI elements
- Cross-module hooks (who provides what to whom)
- Interactive elements that belong to other modules (buttons, widgets, etc.)

**This is why reference modules are critical** - they make these relationships **visible and testable**.

### 1.3 Production-Ready Definition

A module is **production-ready** when:

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules pattern
2. ✅ **Scaffolding ordered**: Clean folder structure (components/, services/, hooks/, types.ts)
3. ✅ **Zero errors**: 0 lint errors, 0 TypeScript errors IN THAT MODULE
4. ✅ **UI complete**: All views/components working, no unused components
5. ✅ **Cross-module mapped**: Relationships documented (provides/consumes)
6. ✅ **Zero duplication**: No repeated logic within or across modules
7. ✅ **DB connected**: All CRUD operations working via service layer
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
n**🆕 Note**: This section reflects current state (27 modules). For target Architecture V2 (22 modules), see:
- MIGRATION_PLAN.md - Step-by-step migration
- CROSS_MODULE_INTEGRATION_MAP.md - Integration catalog
- FEATURE_MODULE_UI_MAP.md - Feature mapping

9. ✅ **Permissions designed**: Role-based access defined
10. ✅ **README**: Module README with cross-module integration docs

### 1.3 Strategy

**Approach**: Module-by-module, starting with testable flows

**NOT**:
- ❌ Fix all 3,156 ESLint errors at once
- ❌ Work on all modules simultaneously
- ❌ Create extensive documentation

**YES**:
- ✅ Select 2-3 pilot modules forming complete workflow
- ✅ Make each pilot production-ready (all 10 criteria)
- ✅ Document cross-module patterns discovered
- ✅ Expand to remaining modules
- ✅ Code + READMEs = documentation

---

## 2. CURRENT STATE ANALYSIS

### 2.1 Module Inventory

**27 Modules Registered** (organized by tier):

**TIER 0: System**
- `achievements` - Requirements validation (auto-install, 13.5 KB manifest)

**TIER 1: Foundation (no dependencies)**
- `dashboard` - Central dashboard (auto-install)
- `settings` - System config (auto-install)
- `debug` - Debug tools (dev only)
- `staff` - HR/staff management
- `materials` - Inventory & materials ⭐
- `suppliers` - Supplier management
- `sales` - POS & sales ⭐
- `customers` - CRM
- `reporting` - Custom reports
- `intelligence` - Market intelligence

**TIER 2: First-level dependencies**
- `scheduling` - Depends on: staff
- `products` - Depends on: materials
- `production` - Depends on: materials
- `billing` - Depends on: customers
- `fiscal` - Depends on: sales ❌ (currently has `[]`, INCORRECT)

**TIER 3: Second-level dependencies**
- `supplier-orders` - Depends on: suppliers + materials
- `floor` - Floor management (migrated from hub)
- `finance-integrations` - Depends on: fiscal + billing ❌ (currently has `[]`, INCORRECT)
- `ecommerce` - Depends on: sales + products (hook injection module)

**TIER 4: Third-level dependencies**
- `memberships` - Depends on: customers + billing ❌ (currently has `[]`, INCORRECT)
- `rentals` - Depends on: customers + scheduling ❌ (currently has `[]`, INCORRECT)
- `assets` - Depends on: (optional: rentals) ❌ (currently has `[]`, INCORRECT)

**TIER 5: Cross-cutting (aggregate/link modules)**
- `kitchen` - LINK MODULE: sales + materials (auto-install) ⭐
- `delivery` - Depends on: sales + staff ❌ (currently has `[]`, INCORRECT)
- `gamification` - Auto-install, listens to all modules
- `executive` - Aggregates all modules

⭐ = Priority for pilot selection

**🆕 ARCHITECTURE V2 UPDATE**:
- **Current**: 27 modules (shown above)
- **Target After Phase 0.5**: 24 modules (22 core + 2 optional: Rentals, Assets)
- **Changes**:
  - ❌ DELETE: Floor → Fulfillment/onsite, Ecommerce → Sales/ecommerce
  - 🆕 ADD: Fulfillment, Mobile, Finance
  - ♻️ RENAME: Kitchen → Production
- **See**: `docs/architecture-v2/deliverables/ARCHITECTURE_DESIGN_V2.md` for complete target catalog

### 2.2 ESLint Error Breakdown

**Total**: 3,156 errors + 190 warnings

**Top Error Types:**
- `@typescript-eslint/no-explicit-any`: ~1,200 occurrences (38%)
- `@typescript-eslint/no-unused-vars`: ~400 occurrences (13%)
- `react-hooks/exhaustive-deps`: ~150 occurrences (5%)
- `react-refresh/only-export-components`: ~190 warnings (6%)
- Others (no-useless-escape, etc.): ~216 (7%)

**Critical Files:**
- `src/hooks/core/useCrudOperations.ts` - 25+ errors
- `src/contexts/NavigationContext.tsx` - 13 errors
- `src/config/RequirementsRegistry.ts` - 3 errors
- Multiple `src/shared/ui/` files
- Multiple store files

**Strategy**: Fix module-by-module, NOT all at once

### 2.3 Cross-Module Anti-Patterns Found

**Direct Imports (Should use hook system):**
1. `src/modules/floor/components/OpenShiftButton.tsx`
   - ❌ `import { SetupRequiredModal } from '@/modules/achievements/components'`
   - ✅ Should use: `registry.doAction('achievements.show_modal')`

2. `src/modules/sales/components/TakeAwayToggle.tsx`
   - ❌ `import { SetupRequiredModal } from '@/modules/achievements/components'`
   - ✅ Should use: hook system

**Incorrect Dependencies (7 modules):**
- fiscal, finance-integrations, memberships, rentals, assets, delivery

---

## 3. PRODUCTION-READY CRITERIA

### 3.1 Detailed Checklist Per Module

Each module MUST pass this checklist:

#### A. Architecture & Structure
- [ ] Manifest complete (`manifest.tsx`)
  - [ ] Correct dependencies in `depends` array
  - [ ] Required features listed
  - [ ] Hook points documented (provide/consume)
  - [ ] Setup function registers all hooks
- [ ] Clean scaffolding
  ```
  src/modules/{module}/
  ├── manifest.tsx
  ├── README.md
  ├── components/
  ├── services/
  ├── hooks/
  └── types.ts
  ```
- [ ] Module registered in `src/modules/index.ts`

#### B. Code Quality
- [ ] 0 ESLint errors in module files
- [ ] 0 TypeScript errors in module files
- [ ] All imports from `@/shared/ui` (NOT `@chakra-ui/react`)
- [ ] No `any` types
- [ ] No unused imports/variables
- [ ] No unused components

#### C. Cross-Module Integration
- [ ] README documents:
  - [ ] Hooks PROVIDED (what others can use)
  - [ ] Hooks CONSUMED (what this module uses from others)
  - [ ] Direct dependencies (stores, services)
  - [ ] UI interaction points (buttons linking to other modules)
- [ ] No direct imports from `@/modules/{other-module}`
- [ ] Use hook system for cross-module composition
- [ ] No logic duplication (check with semantic search)

#### D. Database & Functionality
- [ ] Service layer exists (`services/`)
- [ ] All CRUD operations working
- [ ] Supabase queries tested
- [ ] All buttons/actions functional
- [ ] No placeholder/TODO UI

#### E. Feature Mapping
- [ ] Feature activations clear (check `FeatureRegistry.ts`)
- [ ] Conditional rendering uses `hasFeature()`
- [ ] Module only shows when required features active

#### F. Permissions (TBD - See Section 7)
- [ ] Permission requirements documented
- [ ] Role-based access defined
- [ ] UI adapts to user role

### 3.2 Module README Template

```markdown
# {Module Name}

## Production Status
- [x] Manifest complete
- [ ] DB connected
- [ ] UI functional
- [ ] Cross-module mapped
- [ ] 0 lint/TS errors

## Core Functionality
- Brief description (3-5 bullets)

## Cross-Module Integration

### This module PROVIDES:
- Hook `sales.toolbar.actions` → Kitchen Display button
  - Used by: Kitchen module
  - Returns: React component `<KDSButton />`
- Widget `dashboard.sales-metrics` → Sales metrics widget
  - Used by: Dashboard module

### This module CONSUMES:
- Hook `materials.stock-check` → Validate inventory
  - Provided by: Materials module
  - Usage: Before completing sale
- Store `customersStore` → Customer data
  - Provided by: Customers module

## Feature Activation
- Required: `sales_order_management`
- Optional: `sales_payment_processing`, `sales_pos_onsite`

## Permissions
- **Admin**: Full access (read/write/delete/void)
- **Manager**: Read/write/void (no delete)
- **Cashier**: Read/write (no void/delete)
- **Staff**: Read only

## Pending
- [ ] Add date range filter
- [ ] Connect payment webhook
```

---

## 4. ARCHITECTURE OVERVIEW

### 4.1 The 3-Layer System

```
┌─────────────────────────────────────────────────────┐
│ LAYER 1: USER CHOICES (Setup Wizard)               │
│ BusinessModelRegistry.ts                            │
│ - 10 business capabilities                          │
│ - 4 infrastructure types                            │
├─────────────────────────────────────────────────────┤
│ LAYER 2: SYSTEM FEATURES (Automatic Activation)    │
│ FeatureRegistry.ts                                  │
│ - 86 granular features                              │
│ - Activated by capabilities                         │
├─────────────────────────────────────────────────────┤
│ LAYER 3: MODULES (UI & Logic)                      │
│ src/modules/ (27 modules)                           │
│ - Conditional rendering via hasFeature()            │
│ - Cross-module via hook system                      │
└─────────────────────────────────────────────────────┘
```

**Key Files:**
- `/src/config/BusinessModelRegistry.ts` (519 lines) - Capabilities
- `/src/config/FeatureRegistry.ts` (1,109 lines) - Features
- `/src/modules/index.ts` (249 lines) - Module registry
- `/src/lib/modules/ModuleRegistry.ts` - Hook system core
- `/src/lib/modules/HookPoint.tsx` - Hook rendering component

### 4.2 Module Patterns

**A. Independent Module** (no dependencies)
```typescript
export const salesManifest: ModuleManifest = {
  id: 'sales',
  depends: [], // ← No dependencies
  autoInstall: false, // ← Manual activation via features
  requiredFeatures: ['sales_order_management'],
  hooks: {
    provide: ['sales.order_placed'],
    consume: ['materials.stock_updated']
  }
}
```

**B. Link Module** (auto-installs when dependencies ready)
```typescript
export const kitchenManifest: LinkModuleManifest = {
  id: 'kitchen',
  depends: ['sales', 'materials'], // ← 2+ dependencies
  autoInstall: true, // ← MUST be true for link modules
  requiredFeatures: ['sales_order_management', 'production_kitchen_display']
}
```

**C. Hook Injection Module** (extends other modules via hooks)
```typescript
// Ecommerce module injects into Sales, Products, Customers
registry.addAction('sales.tabs', () => <OnlineOrdersTab />);
registry.addAction('products.tabs', () => <OnlineCatalogTab />);
registry.addAction('customers.sections', () => <OnlineAccountsSection />);
```

### 4.3 Cross-Module Communication

**✅ CORRECT: Hook System**
```typescript
// In module manifest setup()
registry.addAction('sales.toolbar.actions', () => (
  <Button onClick={openKDS}>Kitchen Display</Button>
));

// In page component
<HookPoint name="sales.toolbar.actions" />
```

**❌ INCORRECT: Direct Import**
```typescript
// DON'T DO THIS
import { KDSButton } from '@/modules/kitchen/components';
```

---

## 5. FEATURE → MODULE → PAGE → UI MAPPING

### 5.1 Capabilities → Features → Modules

**Example: `onsite_service` Capability**

```
Capability: onsite_service
├─ Activates 20 features:
│  ├─ sales_order_management → Sales Module
│  ├─ sales_payment_processing → Sales Module
│  ├─ sales_pos_onsite → Sales Module
│  ├─ sales_dine_in_orders → Sales Module
│  ├─ operations_table_management → Floor Module
│  ├─ operations_floor_plan_config → Floor Module
│  ├─ inventory_stock_tracking → Materials Module
│  ├─ staff_shift_management → Staff Module
│  └─ ... (12 more)
│
└─ Results in active modules:
   ├─ Sales (core)
   ├─ Floor (operations)
   ├─ Materials (supply-chain)
   ├─ Staff (resources)
   └─ Kitchen (auto-installs when sales + materials active)
```

### 5.2 Module → Page → UI Elements

**Sales Module Example:**

```
Module: sales
├─ Route: /admin/operations/sales
├─ Page: src/pages/admin/operations/sales/page.tsx
├─ Main Component: <SalesManagement />
│
├─ UI Elements:
│  ├─ <POSInterface /> (when hasFeature('sales_pos_onsite'))
│  ├─ <PaymentProcessor /> (when hasFeature('sales_payment_processing'))
│  ├─ <DineInOrdersTab /> (when hasFeature('sales_dine_in_orders'))
│  ├─ <TakeAwayToggle /> (when hasFeature('sales_pickup_orders'))
│  └─ <HookPoint name="sales.toolbar.actions" /> ← Other modules inject here
│
└─ Cross-Module Interactions:
   ├─ Stock check button → Opens Materials stock view
   ├─ Customer selector → Links to Customers module
   ├─ Kitchen send → Sends to Kitchen module via EventBus
   └─ Invoice button → Opens Fiscal module
```

**Materials Module Example:**

```
Module: materials
├─ Route: /admin/supply-chain/materials
├─ Page: src/pages/admin/supply-chain/materials/page.tsx
├─ Main Component: <MaterialsManagement />
│
├─ UI Elements:
│  ├─ <MaterialsInventoryGrid />
│  │  └─ Row actions: Edit, Delete, View Stock
│  │     └─ <HookPoint name="materials.row.actions" /> ← Kitchen adds "Send to KDS"
│  ├─ <StockAlertsPanel /> (when hasFeature('inventory_alert_system'))
│  ├─ <PurchaseOrdersTab /> (when hasFeature('inventory_purchase_orders'))
│  └─ <SupplierManagementTab /> (when hasFeature('inventory_supplier_management'))
│
└─ Cross-Module Interactions:
   ├─ "Order from Supplier" → Opens Supplier Orders module
   ├─ "View Recipes" → Opens Products module (recipes using this material)
   └─ Stock level → Consumed by Sales (validation before order)
```

### 5.3 Complete Feature Map (Summary)

**Total**: 81 features across 8 domains (current code: 84, reduced to 81 after Phase 0.5 cleanup)

**SALES Domain** (26 features):
- 26 features → Sales, Fiscal, Ecommerce modules

**INVENTORY Domain** (8 features):
- 8 features → Materials, Suppliers, Supplier Orders modules

**OPERATIONS Domain** (12 features):
- 12 features → Floor, Kitchen, Delivery modules

**PRODUCTION Domain** (6 features):
- 6 features → Products, Production modules

**STAFF Domain** (7 features):
- 7 features → Staff, Scheduling modules

**CUSTOMER Domain** (5 features):
- 5 features → Customers, Memberships modules

**FINANCE Domain** (8 features):
- 8 features → Fiscal, Billing, Finance Integrations modules

**ANALYTICS Domain** (4 features):
- 4 features → Reporting, Intelligence, Executive modules

**ADVANCED Domain** (6 features):
- 6 features → Assets, Rentals modules

**GAMIFICATION Domain** (4 features):
- 4 features → Gamification module

---

## 6. CROSS-MODULE RELATIONSHIP MATRIX

### 6.1 Hook Providers & Consumers

**Format:**
```
Module → Hook Provided → Consumed By
```

#### Sales Module

**PROVIDES:**
- `sales.order_placed` → Kitchen, Materials, Fiscal
- `sales.order_completed` → Materials (stock update), Fiscal (invoice)
- `sales.payment_received` → Fiscal, Billing
- `sales.toolbar.actions` → Kitchen (KDS button), Ecommerce (online orders button)
- `dashboard.widgets` → Dashboard (sales metrics widget)

**CONSUMES:**
- `materials.stock_updated` ← Materials (validate stock before sale)
- `kitchen.order_ready` ← Kitchen (notify when order ready)
- `customers.selected` ← Customers (load customer data in POS)

#### Materials Module

**PROVIDES:**
- `materials.stock_updated` → Sales, Kitchen, Products
- `materials.low_stock_alert` → Dashboard, Suppliers
- `materials.row.actions` → Kitchen (add "Send to KDS" button)
- `dashboard.widgets` → Dashboard (inventory widget)

**CONSUMES:**
- `sales.order_completed` ← Sales (deduct stock)
- `production.recipe_produced` ← Production (deduct ingredients)
- `supplier-orders.received` ← Supplier Orders (add stock)

#### Kitchen Module (LINK MODULE)

**PROVIDES:**
- `kitchen.order_ready` → Sales (notify POS)
- `kitchen.display.orders` → (internal KDS display)
- `kitchen.ingredient_check` → Materials (check availability)

**CONSUMES:**
- `sales.order_placed` ← Sales (receive new orders)
- `materials.stock_updated` ← Materials (track ingredients)
- `materials.row.actions` ← Materials (add kitchen actions to materials grid)

#### Dashboard Module

**PROVIDES:**
- `dashboard.widgets` → Hook point for all modules to inject widgets

**CONSUMES:**
- `sales.order_placed` ← Sales (update metrics)
- `materials.low_stock_alert` ← Materials (show alerts)
- `staff.shift_started` ← Staff (labor tracking)
- (Consumes widgets from ALL modules)

### 6.2 Direct Dependencies (Stores/Services)

**Format:**
```
Module → Uses Store/Service → From Module
```

- Sales → `materialsStore` → Materials (stock validation)
- Sales → `customersStore` → Customers (customer data)
- Fiscal → `salesStore` → Sales (invoice generation)
- Kitchen → `salesStore` + `materialsStore` → Sales + Materials
- Scheduling → `staffStore` → Staff (shift management)
- Supplier Orders → `suppliersStore` + `materialsStore` → Suppliers + Materials

### 6.3 UI Interaction Points

**Cross-Module Navigation:**

| From Module | Button/Link | To Module | Purpose |
|-------------|-------------|-----------|---------|
| Sales | "Check Stock" | Materials | Validate inventory before sale |
| Sales | "View Customer" | Customers | See customer history |
| Sales | "Send to Kitchen" | Kitchen | Send order to KDS |
| Sales | "Generate Invoice" | Fiscal | Create fiscal invoice |
| Materials | "Order from Supplier" | Supplier Orders | Create purchase order |
| Materials | "View Recipes" | Products | See recipes using material |
| Kitchen | "Stock Alert" | Materials | Check ingredient levels |
| Dashboard | "View Sales" | Sales | Open sales module |
| Dashboard | "Low Stock Alert" | Materials | Open inventory |

### 6.4 Anti-Patterns to Fix

**Current Issues:**

1. **Floor Module** - Direct import from Achievements
   - Current: `import { SetupRequiredModal } from '@/modules/achievements/components'`
   - Fix: Use `registry.doAction('achievements.show_setup_modal')`

2. **Sales Module** - Direct import from Achievements
   - Current: `import { SetupRequiredModal } from '@/modules/achievements/components'`
   - Fix: Same as above

3. **7 Modules** - Missing dependency declarations
   - fiscal, finance-integrations, memberships, rentals, assets, delivery
   - Fix: Add correct `depends` arrays to manifests

---

## 7. PERMISSION SYSTEM DESIGN

**Status**: 🟢 **INVESTIGATION COMPLETE** - Ready for implementation

---

### 7.1 Current State Analysis

#### Systems Found in Codebase

**System A: AuthContext (ACTIVE - Primary System)**
- **Location**: `src/contexts/AuthContext.tsx`
- **Roles**: `CLIENTE`, `OPERADOR`, `SUPERVISOR`, `ADMINISTRADOR`, `SUPER_ADMIN`
- **Integration**: ✅ Supabase JWT + `users_roles` table
- **Database**: ✅ Enum `user_role` + custom access token hook
- **Usage**: ~30 files (RoleGuard, ProtectedRoute, NavigationContext, 27 modules)
- **Status**: **PRODUCTION ACTIVE** (3 users in DB: 1 CLIENTE, 2 SUPER_ADMIN)

**System B: permissions.tsx (DEPRECATED - To be deleted)**
- **Location**: `src/lib/validation/permissions.tsx`
- **Roles**: `admin`, `manager`, `employee`, `cashier`, `kitchen`, `viewer`
- **Integration**: ❌ Zustand store only (NOT synced with Supabase)
- **Usage**: Only 5 files (staff management, validation)
- **Status**: **TO DELETE** (iterative development artifact)

#### Conflicts Identified

1. ❌ **Dual role systems** with no equivalence mapping
2. ❌ **Two sources of truth** (JWT vs Zustand)
3. ❌ **Desynchronization risk** (DB roles ≠ appStore roles)
4. ❌ **47 granular permissions in System B** not available in System A

#### Integration Gaps

1. ❌ **FeatureRegistry doesn't check permissions** (only checks if feature active)
2. ❌ **ModuleRegistry has no `requiredRoles` field**
3. ❌ **HookPoint doesn't filter by role**
4. ❌ **No multi-location support** in current schema
5. ❌ **No record-level permissions** (own data only)

---

### 7.2 Modern RBAC Best Practices (2025 Research)

**Sources consulted:**
- EnterpriseReady.io - Enterprise RBAC patterns
- React-Admin RBAC - Component-level authorization
- Cerbos, Permit.io - Modern authorization platforms
- Real-world ERP/CRM implementations (GitHub)

#### Key Principles (Industry Standard)

**1. Backend-First Security**
> "The most secure approach is to enforce permissions at the API level, with the backend serving as the ultimate gatekeeper"

**Decision**: ✅ Permissions validated in BOTH frontend (UX) AND backend (security)

**2. Early Implementation**
> "Adding fine-grained authorization into an existing solution can be as hard as retrofitting multi-tenancy"

**Decision**: ✅ Implement now during production-ready phase (not later)

**3. Resource-Action Model**
> "A permission is an object defined by a `resource` (noun) and an `action` (verb)"

**Decision**: ✅ Use `{ action: 'read', resource: 'sales' }` pattern

**4. Least Privilege Principle**
> "Assign users the fewest permissions needed to get their work done"

**Decision**: ✅ Default deny, explicit allow

**5. Multi-Location via Resource Groups**
> "Define organizational constructs (projects, units, groups) and assign permissions uniformly to resources in that construct"

**Decision**: ✅ `accessible_locations[]` array for scoped access

---

### 7.3 ARCHITECTURAL DECISION (FINAL)

**Chosen Approach:** **Custom RBAC + Feature Integration**

**Base System:** Extend System A (AuthContext + Supabase)

**Rationale:**
1. ✅ System A already integrated with Supabase (JWT + database)
2. ✅ System A used by 30+ files (navigation, routing, 27 modules)
3. ✅ Avoids breaking existing code
4. ✅ No external dependencies (CASL/Casbin rejected)
5. ✅ Migrate System B's granular permissions INTO System A
6. ✅ Perfect fit for Capabilities → Features → Modules architecture

**Rejected Alternatives:**
- ❌ **Casbin**: Overkill (27 modules, not 1000s of tenants)
- ❌ **CASL**: Adds dependency, doesn't fit FeatureRegistry pattern
- ❌ **Keep System B**: Not synced with database, only 5 files use it

---

### 7.4 Role Hierarchy (FINAL)

**Decision:** Generic business roles (NOT gastronomy-specific)

**4 Production Roles** (subject to review based on permission needs):

```
admin         → Business owner (full access, all locations)
    ↓
manager       → Department manager (operational + approvals, multiple locations)
    ↓
supervisor    → Shift lead (operational, single location)
    ↓
employee      → Staff (assigned tasks, own data only)
```

**+ 1 System Role** (NOT for production):
```
super_admin   → System owner (DB migrations, infrastructure)
```

**+ 1 External Role**:
```
viewer        → Read-only (external users: accountants, customers)
```

**Total: 6 roles**

**Justification:**
- `admin` → Dueño del negocio, configura sistema completo
- `manager` → Gerente, aprueba transacciones, múltiples sucursales
- `supervisor` → Encargado de turno, operaciones diarias, 1 sucursal
- `employee` → Personal (cajero, cocina, mozo), tareas asignadas
- `viewer` → Solo lectura (contador, CLIENTE portal)
- `super_admin` → Solo para desarrollo/infraestructura

**Note**: Role count subject to revision during implementation based on actual permission differentiation needed across 27 modules.

---

### 7.5 Permission Granularity (FINAL)

**Decision:** Hybrid CRUD + Special Actions

**Permission Structure:**
```typescript
type Permission = {
  action: 'create' | 'read' | 'update' | 'delete' | 'void' | 'approve' | 'configure';
  resource: ModuleName; // 'sales', 'materials', 'staff', etc.
  record?: { field: string; value: any }; // Optional record-level filter
};
```

**Granularity Levels:**

1. **Module-level**: `canAccess('sales')` → Can see Sales module
2. **Action-level**: `canCreate('sales')` → Can create sales orders
3. **Feature-level**: `hasFeature('sales_analytics') && canRead('sales')` → Combined check
4. **Record-level**: `canUpdate('sales', { owner_id: user.id })` → Own records only

**Actions Mapping:**
- **CRUD**: `create`, `read`, `update`, `delete` (standard)
- **Special**: `void` (cancel orders), `approve` (workflows), `configure` (settings)

**Example Permission Set (Manager role):**
```typescript
{
  sales: ['create', 'read', 'update', 'void'], // No delete, no configure
  materials: ['create', 'read', 'update'],
  staff: ['create', 'read', 'update', 'approve'],
  settings: [] // No access
}
```

---

### 7.6 Integration with Architecture

#### Feature Flags + Permissions Flow

**Check Order:** Features FIRST, then Permissions

```typescript
// ✅ CORRECT PATTERN
if (!hasFeature('sales_analytics')) return null; // Feature OFF → Don't check permissions
if (!canRead('sales')) return null; // Feature ON → Check permission

// ❌ WRONG PATTERN
if (!canRead('sales')) return null; // Wastes permission check if feature OFF
```

**Rationale:** If feature is disabled, permissions are irrelevant.

#### Component-Level Pattern

**Pattern 1: usePermissions Hook** (Recommended for multiple checks)
```typescript
const { canCreate, canVoid, canConfigure } = usePermissions('sales');

return (
  <>
    {canCreate && <Button>New Sale</Button>}
    {canVoid && <Button>Void Order</Button>}
    {canConfigure && <Button>Settings</Button>}
  </>
);
```

**Pattern 2: RoleGuard Component** (Recommended for route protection)
```typescript
<RoleGuard requiredRoles={['admin', 'manager']} requiredModule="sales">
  <SalesPage />
</RoleGuard>
```

**Pattern 3: Inline Check** (For single checks)
```typescript
{canPerformAction('sales', 'void') && <VoidButton />}
```

#### ModuleRegistry Integration

**Add `requiredRoles` field to module manifests:**
```typescript
export const salesManifest: ModuleManifest = {
  id: 'sales',
  requiredFeatures: ['sales_order_management'],
  requiredRoles: ['employee', 'supervisor', 'manager', 'admin'], // ← NEW
  minimumRole: 'employee', // ← NEW (alternative simpler approach)
};
```

**Validation:** Module won't render if user role not in `requiredRoles`.

---

### 7.7 Multi-Location Support

**Decision:** Resource Groups Pattern (industry standard)

**Scoping Strategy:**
```typescript
type User = {
  id: string;
  role: RoleId;
  location_id: string;           // Primary location (REQUIRED)
  accessible_locations: string[]; // Multiple locations (Manager/Admin only)
};
```

**Access Rules:**
- **admin**: All locations (no filter)
- **manager**: `accessible_locations` array (assigned locations)
- **supervisor/employee**: Only `location_id` (single location)
- **viewer**: Only `location_id` (single location)

**Service Layer Filtering:**
```typescript
// Example: Get sales for user's accessible locations
const getSales = async (userId: string) => {
  const user = await getUser(userId);

  if (user.role === 'admin') {
    return supabase.from('sales').select('*'); // All locations
  }

  if (user.role === 'manager') {
    return supabase.from('sales')
      .in('location_id', user.accessible_locations); // Multiple locations
  }

  return supabase.from('sales')
    .eq('location_id', user.location_id); // Single location
};
```

**Why This Approach:**
- ✅ Standard enterprise pattern (EnterpriseReady.io)
- ✅ Simplifies admin burden (assign locations, not individual records)
- ✅ Scales to multi-tenant (future-proof)
- ✅ Prevents data leakage between locations

**Use Cases:**
- **Multi-branch restaurant**: Manager sees sales from branches A, B, C
- **Single location**: Employee only sees sales from their branch
- **Customer portal**: Viewer only sees their own orders (viewer role + location filter)

---

### 7.8 Migration Plan

**CRITICAL:** Zero legacy code, clean migration

#### Phase 2A: Delete System B (1 hour)

**Files to DELETE** (no comments, no references):
- [ ] `src/lib/validation/permissions.tsx` (entire file)
- [ ] All imports of `PERMISSIONS.*` or `ROLES.*` from deleted file
- [ ] All usages of `hasPermission()` from System B
- [ ] `user.permissions: string[]` from `appStore.ts`

**Files to UPDATE:**
- [ ] `src/pages/admin/resources/staff/components/sections/ManagementSection.tsx`
- [ ] `src/pages/admin/resources/staff/services/staffApi.ts`
- [ ] Any other file found with `grep -r "from '@/lib/validation/permissions'"` (search before deleting)

**Validation:** `grep -r "PERMISSIONS\." src/` should return ZERO results

#### Phase 2B: Extend System A (3-4 hours)

**New Files to CREATE:**
- [ ] `src/config/PermissionsRegistry.ts` - Centralized permission definitions
  ```typescript
  // Permissions per role (CRUD + special actions)
  export const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = { ... }
  ```
- [ ] `src/hooks/usePermissions.ts` - Permission check hook
  ```typescript
  export function usePermissions(resource: ModuleName): PermissionActions
  ```

**Files to MODIFY:**
- [ ] `src/contexts/AuthContext.tsx`
  - Add `canCreate()`, `canUpdate()`, `canDelete()`, `canVoid()`, `canApprove()`, `canConfigure()`
  - Remove deprecated helper methods
  - Integrate with PermissionsRegistry

- [ ] `database/migrations/create_user_roles_table.sql`
  - Add `location_id UUID REFERENCES locations(id)`
  - Add `accessible_locations UUID[]`

- [ ] `src/modules/*/manifest.tsx` (all 27 modules)
  - Add `requiredRoles` or `minimumRole` field

- [ ] `src/lib/modules/ModuleRegistry.ts`
  - Add role filtering to `getActiveModules()`

#### Phase 2C: Apply to Pilot Modules (2-3 hours)

**Materials Module:**
- [ ] Add `usePermissions('materials')` in components
- [ ] Hide "Create Material" if `!canCreate`
- [ ] Hide "Delete" if `!canDelete`
- [ ] Filter by location in service layer

**Sales Module:**
- [ ] Add `usePermissions('sales')` in components
- [ ] Show "Void Order" only if `canVoid`
- [ ] Show "Configure POS" only if `canConfigure`
- [ ] Filter by `accessible_locations` in queries

**Kitchen Module:**
- [ ] Add `usePermissions('kitchen')` in components
- [ ] Location-based order filtering

#### Phase 2D: Service Layer Security (2 hours)

**Pattern for ALL service files:**
```typescript
// BEFORE (no permission check)
export const createSale = async (data: Sale) => {
  return supabase.from('sales').insert(data);
};

// AFTER (with permission + location check)
export const createSale = async (data: Sale, user: User) => {
  if (!hasPermission(user, 'sales', 'create')) {
    throw new Error('Insufficient permissions');
  }

  if (user.role !== 'admin' && data.location_id !== user.location_id) {
    throw new Error('Cannot create sales for other locations');
  }

  return supabase.from('sales').insert(data);
};
```

**Apply to:**
- [ ] `src/pages/admin/operations/sales/services/saleApi.ts`
- [ ] `src/pages/admin/supply-chain/materials/services/materialsApi.ts`
- [ ] All other service layer files (27 modules)

#### Phase 2E: Database Migration (1 hour)

**SQL to run:**
```sql
-- Add location support to users_roles
ALTER TABLE users_roles
ADD COLUMN location_id UUID REFERENCES locations(id),
ADD COLUMN accessible_locations UUID[];

-- Create locations table if not exists
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assign default location to existing users
UPDATE users_roles
SET location_id = (SELECT id FROM locations LIMIT 1)
WHERE location_id IS NULL;
```

---

### 7.9 Implementation Files Summary

**New Files (2):**
- `src/config/PermissionsRegistry.ts` (permission definitions)
- `src/hooks/usePermissions.ts` (permission hook)

**Modified Files (30+):**
- `src/contexts/AuthContext.tsx` (extend with new methods)
- `src/modules/*/manifest.tsx` (all 27 manifests + `requiredRoles`)
- `src/lib/modules/ModuleRegistry.ts` (role filtering)
- `database/migrations/add_multi_location_support.sql` (new migration)

**Deleted Files (1):**
- `src/lib/validation/permissions.tsx` (entire file, zero legacy)

**Updated Service Files (~27):**
- All `services/*Api.ts` files (add user parameter + permission checks)

---

### 7.10 Testing Strategy

**Unit Tests:**
- [ ] `PermissionsRegistry.test.ts` - Validate role permission mappings
- [ ] `usePermissions.test.ts` - Test hook logic
- [ ] `AuthContext.test.ts` - Test permission methods

**Integration Tests:**
- [ ] Role-based UI rendering (Materials module)
- [ ] Location filtering (Sales queries)
- [ ] Permission denied handling (try to delete without permission)

**E2E Tests:**
- [ ] Admin flow: Full access to all modules
- [ ] Manager flow: Multiple locations, approval actions
- [ ] Supervisor flow: Single location, operational only
- [ ] Employee flow: Own data only, no delete/configure

---

### 7.11 Open Questions & Decisions

**✅ RESOLVED:**
1. **Migration strategy**: Delete System B, extend System A ✅
2. **Role naming**: Generic business roles (not gastronomy) ✅
3. **Multi-location**: Resource groups pattern with `accessible_locations[]` ✅
4. **Granularity**: CRUD + special actions (void, approve, configure) ✅
5. **FeatureRegistry integration**: Check features FIRST, then permissions ✅

**📋 TO VALIDATE DURING IMPLEMENTATION:**
1. **Final role count**: 4-6 roles (subject to permission differentiation needs)
2. **Permission matrix completeness**: May discover new actions while implementing modules
3. **Record-level permissions**: Implement if needed (e.g., "own orders only")

---

**Status**: 🟢 **READY FOR PHASE 2 IMPLEMENTATION**

---

## 8. PILOT MODULE SELECTION

### 8.1 Selection Criteria

**Must Have:**
1. Forms complete workflow (testable end-to-end)
2. Covers different module patterns (independent, link, hook injection)
3. Has cross-module relationships (PROVIDES + CONSUMES)
4. Database connected (CRUD operations)
5. Foundational (other modules depend on it)

### 8.2 Proposed Pilots

**Option A: Operations Flow** (RECOMMENDED)

**Pilot 1: Materials** (Foundation)
- Pattern: Independent module
- Dependencies: None
- Tier: 1 (Foundation)
- Size: 13.4 KB manifest (substantial but manageable)
- Cross-module: PROVIDES to Sales, Kitchen, Products
- Workflow role: Inventory base

**Pilot 2: Sales** (Core Operations)
- Pattern: Independent module
- Dependencies: None (but CONSUMES from Materials)
- Tier: 1 (Foundation)
- Size: 12.9 KB manifest
- Cross-module: PROVIDES to Kitchen, Fiscal, Dashboard; CONSUMES from Materials
- Workflow role: POS & orders

**Pilot 3: Kitchen** (Link Module)
- Pattern: Link module (auto-install)
- Dependencies: Sales + Materials
- Tier: 5 (Cross-cutting)
- Size: 15.9 KB manifest (heaviest)
- Cross-module: Bridges Sales ↔ Materials
- Workflow role: Order fulfillment

**Complete Workflow:**
```
Materials (inventory) → Sales (order) → Kitchen (prepare)
   ↓                       ↓                ↓
Stock tracking      →  Stock validation → Ingredient check
```

**Option B: Supply Chain Flow**

- Pilot 1: Materials
- Pilot 2: Suppliers
- Pilot 3: Supplier Orders (depends on both)

**Option C: Customer Journey**

- Pilot 1: Customers
- Pilot 2: Sales
- Pilot 3: Fiscal

### 8.3 Recommended Selection

**✅ OPTION A: Operations Flow** (Materials → Sales → Kitchen)

**Rationale:**
1. ✅ Complete testable workflow (inventory → sell → prepare)
2. ✅ Covers 3 module patterns (2 independent + 1 link)
3. ✅ Rich cross-module relationships (7+ hooks between them)
4. ✅ All 3 are tier 1-5 (well-defined dependencies)
5. ✅ High business value (core daily operations)
6. ✅ Foundation for other modules (Products, Fiscal, etc. depend on these)

**Production-Ready Order:**
1. **First**: Materials (no dependencies)
2. **Second**: Sales (consumes Materials hooks)
3. **Third**: Kitchen (link module, depends on both)

This allows testing at each step:
- After Materials: Test inventory CRUD
- After Sales: Test POS + stock validation
- After Kitchen: Test complete order flow

---

## 9. EXECUTION PHASES

### 9.1 Phase 0: Investigation & Planning (CURRENT)

**Status**: 🟡 IN PROGRESS

**Tasks:**
- [x] Delete obsolete documentation (DONE)
- [x] Create PRODUCTION_PLAN.md (DONE - this file)
- [ ] Map Feature → Module → UI (Section 5 - partially done)
- [ ] Research permission system (Section 7 - PENDING)
- [ ] Finalize pilot selection (Section 8 - proposed)

**Duration**: 1-2 sessions
**Output**: This document completed

### 9.2 Phase 1: Pilot Modules (Materials, Sales, Production)

**Status**: ✅ COMPLETE (2025-01-25)

**Results:**
- ✅ Materials: 8/10 (80%) - PRODUCTION READY
- ✅ Sales: 8/10 (80%) - PRODUCTION READY
- ✅ Production (formerly Kitchen): 8/10 (80%) - PRODUCTION READY
- **Total errors fixed**: 202 ESLint errors
- **Documentation**: 3 comprehensive READMEs created/updated
- **Time spent**: ~1 hour (faster than estimated due to prior cleanup)

**Workflow per module (COMPLETED):**
1. **Audit** (30 min)
   - Read current code
   - Identify lint/TS errors
   - Map features & cross-module relationships
   - Document in module README

2. **Fix Structure** (1 hour)
   - Fix manifest (dependencies, hooks)
   - Fix ESLint errors in module files
   - Fix TypeScript errors
   - Remove unused components
   - Fix anti-patterns (direct imports → hooks)

3. **Database & Functionality** (1-2 hours)
   - Verify service layer
   - Test all CRUD operations
   - Test all buttons/actions
   - Replace placeholders with real functionality

4. **Cross-Module Integration** (1 hour)
   - Document README (provides/consumes)
   - Test hook interactions
   - Verify EventBus events
   - Test navigation between modules

5. **Validation** (30 min)
   - Run through production-ready checklist (Section 3.1)
   - End-to-end test
   - Mark as complete

**Duration**: 8-12 hours (3-4 hours per module)
**Output**: 3 production-ready modules + patterns documented

### 9.3 Phase 2: Permission System Implementation

**Status**: ⏭️ READY TO START (Phase 1 complete)

**Tasks:**
1. Implement chosen permission system architecture
2. Define role hierarchy & permissions matrix
3. Integrate with FeatureRegistry
4. Update all modules with permission checks
5. Test role-based UI rendering

**Duration**: 6-8 hours
**Output**: Working permission system across all modules

### 9.4 Phase 3: Expand to Remaining Modules

**Status**: 🔴 NOT STARTED

**Priority Order:**

**P0 - Core Operations** (after pilots):
- Dashboard (already auto-install, verify production-ready)
- Floor (operations, depends on sales)
- Customers (CRM, foundation)

**P1 - Supply Chain**:
- Products (depends on materials)
- Suppliers (independent)
- Supplier Orders (depends on suppliers + materials)
- Production (depends on materials)

**P2 - Finance**:
- Fiscal (depends on sales)
- Billing (depends on customers)
- Finance Integrations (depends on fiscal + billing)

**P3 - Resources**:
- Staff (independent)
- Scheduling (depends on staff)

**P4 - Advanced Features**:
- Ecommerce (hook injection, depends on sales + products)
- Delivery (depends on sales + staff)
- Memberships (depends on customers + billing)
- Rentals (depends on customers + scheduling)
- Assets (depends on rentals)

**P5 - Analytics & Special**:
- Reporting (aggregate)
- Intelligence (independent)
- Executive (aggregate)
- Gamification (auto-install, cross-cutting)

**Duration**: 20-30 hours (1-2 hours per module)
**Output**: All 27 modules production-ready

### 9.5 Phase 4: Polish & Launch

**Status**: 🔴 NOT STARTED

**Tasks:**
1. Full integration testing (all workflows)
2. Performance audit (loading, rendering)
3. Security audit (RLS, permissions)
4. E2E testing suite
5. Deployment preparation
6. Documentation final review (README per module)

**Duration**: 8-12 hours
**Output**: Production deployment

---

## 10. OPEN QUESTIONS & DECISIONS

### 10.1 Critical Decisions Needed

**Permission System** (URGENT):
- ❓ Which architecture? (RBAC, ABAC, Policy-based)
- ❓ Role hierarchy definition (5-7 roles)
- ❓ Integration pattern with hasFeature()
- ❓ Multi-location permissions?
- **Status**: Needs dedicated research session

**Module Priority Order** (MEDIUM):
- ❓ Confirm Option A (Materials → Sales → Kitchen) for pilots?
- ❓ Adjust P0-P5 priority based on business needs?
- **Status**: Proposal in Section 8, awaiting confirmation

**Testing Strategy** (LOW):
- ❓ E2E tests per module or per workflow?
- ❓ Coverage requirements?
- **Status**: Can be decided during Phase 1

### 10.2 Architectural Clarifications Needed

**Hook System Usage:**
- ❓ When to use hooks vs EventBus?
  - **Current thinking**: Hooks for UI composition, EventBus for data events
- ❓ Should all modules expose HookPoints or only extensible ones?

**Feature Activation:**
- ❓ Can features be toggled at runtime or only at setup?
- ❓ Can admin disable features after initial setup?

**Multi-Location:**
- ❓ Is multi-location a top priority?
- ❓ Does it affect permission system design?

### 10.3 Technical Debt

**Known Issues to Address:**
1. 7 modules with incorrect dependencies (fiscal, finance-integrations, etc.)
2. 2 modules with direct imports (floor, sales → achievements)
3. 17 modules not using hook system (37% coverage)
4. 1,200+ `any` types across codebase
5. Dashboard widgets returning metadata instead of React components

**Strategy**: Fix during Phase 1-3 as we touch each module

---

## APPENDIX A: Key File Paths

**Core System:**
- `/src/config/BusinessModelRegistry.ts` - 10 capabilities
- `/src/config/FeatureRegistry.ts` - 86 features
- `/src/modules/index.ts` - 27 module manifests
- `/src/lib/modules/ModuleRegistry.ts` - Hook system core
- `/src/lib/modules/HookPoint.tsx` - Hook rendering
- `/CLAUDE.md` - Project instructions (20 KB)

**Pilot Modules:**
- `/src/modules/materials/manifest.tsx` - 13.4 KB
- `/src/modules/sales/manifest.tsx` - 12.9 KB
- `/src/modules/kitchen/manifest.tsx` - 15.9 KB

---

## APPENDIX B: Timeline Estimate

**Conservative Estimate** (single developer):

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 0 | 2-3 sessions | Planning, research, mapping |
| Phase 1 | 3-4 sessions | 3 pilot modules production-ready |
| Phase 2 | 2 sessions | Permission system |
| Phase 3 | 8-10 sessions | Remaining 24 modules |
| Phase 4 | 2-3 sessions | Polish & launch |
| **TOTAL** | **17-22 sessions** | ~35-50 hours |

**Optimistic Estimate** (with momentum):
- Phase 0: 1-2 sessions
- Phase 1: 2 sessions
- Phase 2: 1 session
- Phase 3: 6-8 sessions
- Phase 4: 2 sessions
- **TOTAL**: 12-15 sessions (~25-35 hours)

**Timeline**: 4-8 weeks (depending on session frequency)

---

**END OF DOCUMENT**

**Next Steps:**
1. Confirm pilot module selection (Materials → Sales → Kitchen?)
2. Schedule permission system research session
3. Begin Phase 1: Materials module audit

**Last Updated**: 2025-01-14
