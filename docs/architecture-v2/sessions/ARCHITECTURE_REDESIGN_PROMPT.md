# ARCHITECTURE REDESIGN - Complete System Restructure

**Mission**: Redesign G-Admin Mini's module/feature/domain architecture from scratch using business-first thinking. Current structure grew organically and has technical debt. Your job is to propose the IDEAL structure.

**Scope**: AGGRESSIVE - Propose any changes needed (new modules, merge modules, delete modules, reorganize domains, etc.)

---

## 🎯 YOUR MISSION

Design the ideal architecture for G-Admin Mini by:
1. Analyzing current state (to understand decisions made)
2. Designing from scratch (business-first, capability-driven)
3. Validating design per capability (10 business models)
4. Proposing complete restructure (modules, features, domains)
5. Creating migration plan (how to get there)

**DO NOT let current structure bias your design.** Think: "If I were building this from scratch today, what would be the BEST structure?"

---

## 📚 REQUIRED CONTEXT - Read First

### Essential Files to Read:
1. **`PRODUCTION_PLAN.md`** - Complete production plan & current state
2. **`src/config/BusinessModelRegistry.ts`** - 10 business capabilities
3. **`src/config/FeatureRegistry.ts`** - 86 features (current)
4. **`src/modules/index.ts`** - 27 modules (current)
5. **`CLAUDE.md`** - Project instructions

### Current State Summary:

**10 Capabilities (Business Models):**
```
1. onsite_service - Service/consumption in location (tables, cabins)
2. pickup_orders - Customer pickup orders
3. delivery_shipping - Delivery management
4. async_operations - E-commerce/online orders
5. corporate_sales - B2B sales
6. membership_programs - Loyalty/memberships
7. rental_operations - Equipment rentals
8. manufacturing - Production/crafting
9. multi_location - Multi-branch support
10. advanced_analytics - BI & predictive analytics
```

**27 Modules (Current):**
```
TIER 0: System (1)
- achievements

TIER 1: Foundation (10)
- dashboard, settings, debug
- staff, materials, suppliers, sales, customers
- reporting, intelligence

TIER 2+: Dependent (16)
- scheduling, products, production, billing, fiscal
- supplier-orders, floor, finance-integrations, ecommerce
- memberships, rentals, assets
- kitchen, delivery, gamification, executive
```

**8 Domains (Current):**
```
- system (1)
- core (6) - dashboard, settings, debug, customers, reporting, intelligence
- supply-chain (5) - materials, suppliers, supplier-orders, products, production
- operations (8) - sales, floor, kitchen, delivery, memberships, rentals, assets, ecommerce
- resources (2) - staff, scheduling
- finance (3) - fiscal, billing, finance-integrations
- gamification (1)
- executive (1)
```

**86 Features:** See FeatureRegistry.ts (organized in 10 domains)

---

## 🚨 KNOWN ISSUES (Technical Debt)

### Structural Problems:
1. **Modules grew organically** - Not designed upfront
2. **Domains added later** - Retroactive organization attempt
3. **Inconsistent module sizes** - Some too big, some too small
4. **Unclear boundaries** - What's a module vs feature?

### Specific Examples of Debt:
1. **`intelligence` module** - Was dashboard function, moved to core (wrong domain?)
2. **`reporting` module** - Was dashboard function, moved to core (wrong domain?)
3. **`ecommerce` module** - Hook injection pattern, but maybe should be integrated?
4. **`floor` module** - Extracted from `hub` module that was deleted
5. **`executive` module** - Only 1 module in domain, is it needed?

### Questions You MUST Answer:
- Should `reporting` be a module or a feature available in ALL modules?
- Should `intelligence` be in "Analytics" domain with `executive`?
- Are `memberships`, `rentals`, `assets` really "operations" or separate domain?
- Is `gamification` a domain or a cross-cutting module?
- Do we need `kitchen` + `floor` + `delivery` separate or unified "Operations Hub"?

---

## 📋 STEP-BY-STEP WORKFLOW

### PHASE 1: Discovery & Analysis (2-3 hours)

#### 1.1 Read & Understand Current State

**Read these files completely:**
```bash
cat src/config/BusinessModelRegistry.ts  # 10 capabilities
cat src/config/FeatureRegistry.ts        # 86 features
cat src/modules/index.ts                 # 27 modules
cat PRODUCTION_PLAN.md                   # Sections 4, 5, 6
```

**Create analysis table:**

| Capability | Features Activated | Current Modules Used | Issues Identified |
|------------|-------------------|---------------------|-------------------|
| onsite_service | 20 features | sales, floor, kitchen, materials, staff | floor+kitchen could merge? |
| ... | ... | ... | ... |

#### 1.2 Identify Project Decisions to Preserve

**Important architectural decisions (DO NOT change without reason):**
- ✅ Capabilities → Features → Modules (3-layer system)
- ✅ Hook system for cross-module composition
- ✅ Module manifests with dependencies
- ✅ FeatureRegistry drives activation
- ✅ Auto-install for link modules

**Search for critical patterns:**
```bash
# Find hook usage patterns
grep -r "registry.addAction" src/modules/

# Find cross-module dependencies
grep -r "depends:" src/modules/*/manifest.tsx

# Find important architectural comments
grep -r "IMPORTANT\|CRITICAL\|DO NOT" src/
```

**Document findings:**
```markdown
# Critical Decisions to Preserve
1. Hook system pattern (WordPress-style)
2. Link modules (auto-install when dependencies ready)
3. EventBus for data events
4. ...
```

#### 1.3 Extract Business Requirements

**From FeatureRegistry, identify feature groups:**
```markdown
# Sales-related features (26 features)
- Core sales: order_management, payment_processing, catalog
- Channels: pos_onsite, pickup_orders, delivery_orders, online_orders
- Advanced: split_payment, tip_management, loyalty_integration
- ...

# Inventory-related features (8 features)
- ...
```

**Question for each group:** Should this be ONE module or MULTIPLE?

---

### PHASE 2: Design by Capability (6-8 hours)

**This is the CORE work.** For EACH of the 10 capabilities, design the IDEAL structure.

#### Template per Capability:

```markdown
# CAPABILITY: onsite_service

## Business Flow Analysis

**User Journey:**
1. Customer arrives at location
2. Host assigns table/cabin
3. Waiter takes order
4. Kitchen receives order
5. Kitchen prepares food
6. Waiter serves
7. Customer requests bill
8. Cashier processes payment

**Pain Points in Current Structure:**
- Floor management separate from Sales (should be integrated?)
- Kitchen Display separate (link module complexity)
- Table status scattered across modules

## Feature Requirements (from FeatureRegistry)

**Currently activates 20 features:**
- sales_order_management ✅ Keep
- sales_payment_processing ✅ Keep
- sales_pos_onsite ✅ Keep
- operations_table_management ❓ Merge into Sales?
- operations_floor_plan_config ❓ Merge into Sales?
- production_kitchen_display ❓ Keep separate or merge?
- ...

## Proposed Module Structure (IDEAL)

### Option A: Unified "Point of Sale" Module
```
Module: POS (Point of Sale)
├─ Submodules:
│  ├─ Sales (orders, payments)
│  ├─ Floor (tables, reservations)
│  └─ Kitchen (display, queue)
├─ Features: All onsite_service features
├─ Dependencies: materials, staff, customers
└─ Rationale: Single cohesive experience for restaurant operations
```

### Option B: Separate Specialized Modules
```
Module: Sales (orders, payments)
Module: Floor (tables, floor plan)
Module: Kitchen (display, preparation)
├─ Dependencies: Sales, Materials
└─ Rationale: Separation of concerns, different user roles
```

### Option C: ... (propose 2-3 options)

## Recommendation: [A/B/C]

**Rationale:**
- Business value: ...
- User experience: ...
- Technical complexity: ...
- Maintenance: ...

## Modules Needed for This Capability

**Primary Modules:**
1. **Sales** (or POS if unified)
   - Purpose: Order management, payment processing
   - Features: sales_*, operations_table_* (if unified)
   - Dependencies: materials, customers, staff

2. **Materials**
   - Purpose: Inventory tracking, stock validation
   - Features: inventory_*
   - Dependencies: suppliers

3. **Kitchen** (or part of POS)
   - Purpose: Order preparation, queue management
   - Features: production_kitchen_*
   - Dependencies: sales, materials

**Supporting Modules:**
- Staff (shift management, waiters)
- Customers (CRM, loyalty)
- Fiscal (invoicing)

## Cross-Module Integration Points

**Sales PROVIDES:**
- Hook: `sales.toolbar.actions` (other modules add buttons)
- Event: `sales.order_placed` (notify Kitchen, Materials)
- Widget: `dashboard.sales-metrics`

**Sales CONSUMES:**
- Hook: `materials.stock-check` (validate inventory)
- Store: `customersStore` (customer data)

**Kitchen PROVIDES:**
- Event: `kitchen.order_ready` (notify Sales)
- Widget: `dashboard.kitchen-queue`

**Kitchen CONSUMES:**
- Event: `sales.order_placed` (receive orders)
- Hook: `materials.ingredient-check`

## UI/UX Flow

**Main Pages:**
- `/admin/operations/pos` (unified) OR `/admin/operations/sales` (separate)
  - Components: <POSInterface />, <TableSelector />, <OrderQueue />
  - Conditional: <FloorPlan /> if onsite_service active

- `/admin/operations/kitchen` (if separate)
  - Components: <KitchenDisplay />, <OrderQueue />, <IngredientStatus />

**Dashboard Widgets:**
- Sales metrics (revenue, orders)
- Kitchen queue status
- Table occupancy

## Questions & Decisions

**Q1: Should Floor be part of Sales or separate module?**
- If unified: Better UX, single source of truth, simpler
- If separate: Better separation of concerns, different permissions

**Decision:** [Your recommendation]

**Q2: Should Kitchen be link module or integrated?**
- Link module: Auto-installs when Sales+Materials active
- Integrated: Part of Sales, always available

**Decision:** [Your recommendation]
```

**Repeat this analysis for ALL 10 capabilities.**

---

### PHASE 3: Synthesize Global Architecture (3-4 hours)

#### 3.1 Consolidate Module List

After analyzing all 10 capabilities, create the FINAL module list:

```markdown
# PROPOSED MODULE STRUCTURE (To-Be)

## TIER 0: System (1 module)
- **achievements** (requirements validation)
  - Keep as-is ✅
  - Rationale: Core system, well-designed

## TIER 1: Foundation (X modules)

### Core Operations
1. **dashboard** (central hub)
   - Keep as-is ✅

2. **settings** (system configuration)
   - Keep as-is ✅

3. **sales** (order management, POS)
   - MERGE: floor module into sales ⚠️
   - MERGE: ecommerce features into sales ⚠️
   - Rationale: Unified sales experience
   - New features: All sales_*, operations_table_*, operations_floor_*
   - Dependencies: materials, customers, staff

4. **materials** (inventory management)
   - Keep as-is ✅
   - Dependencies: suppliers

5. **customers** (CRM)
   - Keep as-is ✅
   - MERGE: memberships features? ⚠️

... (continue for ALL modules)

## NEW Modules Proposed:

1. **warehouse** (multi-location inventory)
   - Why: Manufacturing + multi_location capabilities need it
   - Features: inventory_transfer, inventory_tracking_multilocation
   - Dependencies: materials, locations

2. **analytics** (reporting + intelligence)
   - Why: MERGE reporting + intelligence into single module
   - Rationale: Both are about insights, belong together
   - Features: reports_*, market_intelligence_*
   - Cross-cutting: Available in all modules

... (propose ANY new modules needed)

## REMOVED Modules:

1. **floor** → Merged into sales ⚠️
2. **ecommerce** → Merged into sales ⚠️
3. **intelligence** → Merged into analytics ⚠️
4. **executive** → Features merged into analytics + dashboard ⚠️
5. ... (list ALL removals with rationale)

## FINAL COUNT:
- Current: 27 modules
- Proposed: X modules (+Y new, -Z removed)
```

#### 3.2 Reorganize Domains

**Proposed Domain Structure:**

```markdown
# DOMAIN STRUCTURE (To-Be)

## 1. System (1 module)
- achievements
- Rationale: System-level, not business

## 2. Core (4 modules)
- dashboard, settings, debug, customers
- Rationale: Essential for ALL businesses

## 3. Sales & Operations (X modules)
- sales, kitchen, delivery, [others]
- Rationale: Revenue-generating operations
- WHY NOT "operations": More specific name

## 4. Supply Chain (X modules)
- materials, suppliers, products, production, warehouse
- Rationale: Procurement to inventory

## 5. Human Resources (X modules)
- staff, scheduling, [payroll?]
- Rationale: Employee management
- WHY NOT "resources": More specific

## 6. Finance (X modules)
- fiscal, billing, finance-integrations
- Rationale: Money management

## 7. Analytics (X modules)
- analytics, reporting, [intelligence merged]
- Rationale: Insights & BI

## 8. Customer Experience (X modules)
- memberships, [loyalty?], [marketing?]
- Rationale: Customer engagement
- WHY: Separated from "customers" (CRM)

## 9. Cross-Cutting (X modules)
- gamification, [notifications?], [audit-log?]
- Rationale: Used across all domains
```

**Justify EVERY domain:**
- Why does it exist?
- What modules belong?
- Could it merge with another?

#### 3.3 Feature Redistribution

**For features that moved modules:**

| Feature ID | Current Module | Proposed Module | Rationale |
|------------|----------------|-----------------|-----------|
| operations_table_management | floor | sales | Tables are part of sales flow |
| sales_catalog_ecommerce | ecommerce | sales | Unified sales experience |
| reports_* | reporting | analytics | Better domain grouping |
| ... | ... | ... | ... |

#### 3.4 Decision Criteria Documentation

**Document the criteria you used:**

```markdown
# Decision Criteria

## What makes something a MODULE?
1. Has independent business value (can be sold separately)
2. Has complex CRUD operations (not just display)
3. Used by multiple capabilities
4. Has 3+ pages/views
5. Requires dedicated service layer

## What makes something a FEATURE within a module?
1. Optional functionality (can be toggled)
2. Extends parent module (no independent value)
3. 1-2 pages max
4. Shares service layer with parent

## What makes something a WIDGET?
1. Display-only component
2. Lives in Dashboard or sidebar
3. Aggregates data from other modules
4. No routes

## What makes something a DOMAIN?
1. Groups 3+ related modules
2. Represents clear business area
3. Modules within share data models
4. Aids navigation (not just code organization)
```

---

### PHASE 4: Create Deliverables (2-3 hours)

#### 4.1 Document: ARCHITECTURE_DESIGN_V2.md

**Structure:**
```markdown
# G-Admin Mini - Architecture Design v2.0

## Executive Summary
- Current: 27 modules, 8 domains, 86 features
- Proposed: X modules, Y domains, Z features
- Changes: +A new, -B removed, ~C restructured

## Design Philosophy
- Business-first thinking
- Capability-driven architecture
- Clear module boundaries
- Maintainable domain structure

## Complete Module Catalog
[Full list with descriptions]

## Domain Organization
[Full domain structure with rationale]

## Feature Distribution
[Which features go where]

## Cross-Module Integration Map
[Hook points, events, dependencies]

## Migration Impact Analysis
[What breaks, what needs refactoring]
```

#### 4.2 Document: FEATURE_MODULE_UI_MAP.md

**Map EVERY feature to:**
- Module
- Page/Route
- UI Components
- Conditional rendering logic
- Cross-module interactions

**Example:**
```markdown
# Feature: sales_pos_onsite

## Activation
- Capability: onsite_service
- Required: true
- Optional features: sales_dine_in_orders, operations_table_management

## Module Assignment
- **Proposed Module**: sales (was: sales + floor)
- **Rationale**: Unified POS experience

## UI Implementation
- **Route**: `/admin/sales-operations/pos`
- **Main Component**: `<POSInterface />`
- **Conditional Components**:
  - `<TableSelector />` if operations_table_management active
  - `<FloorPlan />` if operations_floor_plan_config active
  - `<DineInOptions />` if sales_dine_in_orders active

## Cross-Module Integration
- **CONSUMES**:
  - `materials.stock-check` (validate inventory before order)
  - `customers.loyalty-points` (apply discounts)
  - `staff.active-shifts` (assign waiter)

- **PROVIDES**:
  - `sales.order-placed` event → Kitchen, Materials, Fiscal
  - `sales.toolbar.actions` hook → Other modules can add buttons

## User Permissions
- **Required Role**: employee+
- **Actions**: create, read, update (no delete)
- **Location**: own location only (supervisor), all locations (manager+)
```

**Repeat for ALL 86 features** (or at least the key ones)

#### 4.3 Document: CROSS_MODULE_INTEGRATION_MAP.md

**For EVERY module, document:**

```markdown
# Module: sales

## PROVIDES (What other modules can use)

### Hooks
- **sales.toolbar.actions**
  - Purpose: Add buttons to Sales toolbar
  - Location: `/admin/sales-operations/pos` top bar
  - Consumers: kitchen (KDS button), analytics (reports button)
  - Pattern: `registry.addAction('sales.toolbar.actions', () => <Button />)`

- **sales.order-tabs**
  - Purpose: Add tabs to order detail view
  - Location: Order detail modal
  - Consumers: delivery (tracking tab), fiscal (invoice tab)

### Events (EventBus)
- **sales.order_placed**
  - Payload: `{ orderId, items[], customer, total }`
  - Listeners: kitchen, materials, fiscal, analytics
  - Purpose: Notify order creation

- **sales.payment_received**
  - Payload: `{ orderId, amount, method }`
  - Listeners: fiscal, analytics

### Widgets
- **dashboard.sales-metrics**
  - Purpose: Revenue/orders widget
  - Injected into: Dashboard module
  - Priority: 10 (high)

## CONSUMES (What this module uses from others)

### Hooks
- **materials.stock-check**
  - Provided by: materials
  - Usage: Validate stock before completing order
  - Pattern: `const stockOk = registry.doAction('materials.stock-check', { items })`

- **customers.loyalty-apply**
  - Provided by: customers
  - Usage: Apply loyalty discounts
  - Pattern: `const discount = registry.doAction('customers.loyalty-apply', { customerId })`

### Stores (Direct Dependencies)
- **materialsStore**
  - From: materials module
  - Usage: Real-time stock levels
  - Import: `import { useMaterialsStore } from '@/store/materialsStore'`

- **customersStore**
  - From: customers module
  - Usage: Customer data, history
  - Import: `import { useCustomersStore } from '@/store/customersStore'`

## UI NAVIGATION (Buttons/links to other modules)

- **Button: "Check Stock"** → `/admin/supply-chain/materials/stock-view`
- **Button: "Customer History"** → `/admin/core/customers/:id`
- **Button: "Generate Invoice"** → `/admin/finance/fiscal/invoices/new`
- **Link: "View Kitchen Queue"** → `/admin/operations/kitchen`

## DEPENDENCIES (Module Registry)
```typescript
depends: ['materials', 'customers'] // Required to be active
optionalDepends: ['fiscal', 'kitchen'] // Enhanced functionality if active
```

## FEATURE ACTIVATION
- Required: `sales_order_management`
- Optional: `sales_pos_onsite`, `sales_payment_processing`, etc.
```

**Repeat for ALL modules**

#### 4.4 Document: MIGRATION_PLAN.md

```markdown
# Migration Plan: Current → Proposed Architecture

## Changes Summary
- **New Modules**: X (list)
- **Removed Modules**: Y (list)
- **Merged Modules**: Z pairs
- **Moved Features**: N features reassigned

## Step-by-Step Migration

### Step 1: Create New Modules (X hours)
1. Create `src/modules/analytics/manifest.tsx`
2. Merge intelligence + reporting code
3. Update FeatureRegistry assignments
4. ...

### Step 2: Merge Floor → Sales (X hours)
1. Move floor components to sales
2. Update routes
3. Merge manifests
4. Update hook registrations
5. Test table management flow

### Step 3: Feature Reassignments (X hours)
1. Move operations_table_* from floor to sales
2. Update FeatureRegistry entries
3. Update conditional renders
4. ...

### Step 4: Domain Reorganization (X hours)
1. Rename directories
2. Update imports
3. Update navigation
4. Update module registry

### Step 5: Update Cross-Module References (X hours)
1. Update hook names (if changed)
2. Update event names
3. Update store imports
4. ...

## Breaking Changes
- Routes changed: [list]
- Hooks renamed: [list]
- Events renamed: [list]
- Stores moved: [list]

## Testing Checklist
- [ ] All 10 capabilities still activate correctly
- [ ] All 86 features render correctly
- [ ] Cross-module hooks work
- [ ] Navigation works
- [ ] No unused code left

## Rollback Plan
[In case something breaks]
```

#### 4.5 Update: PRODUCTION_PLAN.md

**Update these sections:**
- Section 2.1: New module inventory
- Section 4: New architecture diagram
- Section 5: New feature mapping
- Section 8: New pilot selection (may change)
- Section 9: Add "Phase 0.5: Architecture Migration"

---

## ⚠️ CRITICAL RULES

### Design Principles:
1. **Business-first thinking** - Design for business value, not technical elegance
2. **Capability-driven** - Each capability should have clear module ownership
3. **User-centric** - Think about user journeys, not just code organization
4. **Maintainable** - Prefer clear boundaries over DRY if it aids understanding
5. **Scalable** - Design for 100+ features, not just current 86

### Decision Making:
1. **Propose 2-3 options** for major decisions
2. **Document rationale** for every change
3. **Consider trade-offs** - There's no perfect answer
4. **Ask questions** when unclear (use comments)
5. **Preserve what works** - Don't change for change's sake

### DO NOT:
- ❌ Assume current structure is correct
- ❌ Let technical debt influence ideal design
- ❌ Avoid big changes because "it's hard"
- ❌ Design for only 1 capability (consider all 10)
- ❌ Forget about cross-module relationships

### DO:
- ✅ Challenge everything (module names, domain names, feature locations)
- ✅ Propose radical changes if justified
- ✅ Think about multi-tenant SaaS scale
- ✅ Consider different business types (restaurant, salon, retail, etc.)
- ✅ Document WHY for every decision

---

## 🎯 SUCCESS CRITERIA

At the end, you should have:

1. ✅ **Complete analysis** of all 10 capabilities
2. ✅ **Proposed module structure** with justification
3. ✅ **Domain organization** with rationale
4. ✅ **Feature redistribution** documented
5. ✅ **Cross-module map** complete
6. ✅ **Migration plan** ready to execute
7. ✅ **PRODUCTION_PLAN.md updated** with new structure
8. ✅ **All decisions documented** with rationale

**Deliverable files:**
- `ARCHITECTURE_DESIGN_V2.md` (complete redesign)
- `FEATURE_MODULE_UI_MAP.md` (86 features mapped)
- `CROSS_MODULE_INTEGRATION_MAP.md` (all relationships)
- `MIGRATION_PLAN.md` (how to get there)
- Updated `PRODUCTION_PLAN.md`

---

## 📊 QUALITY CHECKLIST

Before finishing, validate:

- [ ] Every capability has clear module ownership
- [ ] Every feature has a home (module assignment)
- [ ] Every module has clear purpose (not just "misc")
- [ ] Every domain has 3+ modules (or justified exception)
- [ ] Every cross-module relationship is documented
- [ ] Every decision has documented rationale
- [ ] Migration plan is actionable (step-by-step)
- [ ] No obvious gaps (missing modules for business needs)
- [ ] No obvious overlaps (features in wrong modules)
- [ ] Scales to 10+ business types (not just restaurant)

---

## 🚀 GETTING STARTED

**Your first actions:**

```bash
# 1. Read the production plan
cat PRODUCTION_PLAN.md

# 2. Read the registries
cat src/config/BusinessModelRegistry.ts
cat src/config/FeatureRegistry.ts
cat src/modules/index.ts

# 3. Start Phase 1: Analysis
# Create notes on current state problems

# 4. Start Phase 2: Design
# Begin with onsite_service capability (largest, most complex)

# 5. Continue methodically through all 10 capabilities

# 6. Synthesize in Phase 3

# 7. Create deliverables in Phase 4
```

**Expected time:** 15-20 hours of focused work

---

## 💡 EXAMPLE: Good vs Bad Decisions

### ❌ BAD Decision:
> "Keep intelligence and reporting separate because they're different."

**Why bad:** No clear rationale, maintains status quo

### ✅ GOOD Decision:
> "Merge intelligence and reporting into unified 'Analytics' module because:
> 1. Both provide insights (same business value)
> 2. Users want reports WITH intelligence, not separate
> 3. Shared service layer (same data sources)
> 4. Reduces cognitive load (1 place for insights)
> 5. Used by same user personas (managers, executives)
>
> Trade-off: Larger module, but cohesive purpose justifies size."

**Why good:** Clear rationale, considers user needs, documents trade-offs

---

**Good luck! Remember: Think business-first, design from scratch, document everything.**

---

## 📝 CONTEXT FROM PREVIOUS SESSION

**Key Decisions:**
1. Documentation strategy: Hybrid (4-5 strategic docs + module READMEs)
2. Pilot modules: Materials → Sales → Kitchen (may change after redesign)
3. Permission system: Researched, decisions in PRODUCTION_PLAN Section 7
4. Production-ready criteria: 10-point checklist per module

**Known Technical Debt:**
- intelligence in wrong domain (core → analytics?)
- reporting in wrong domain (core → analytics?)
- floor module extracted from deleted hub (should merge into sales?)
- ecommerce as hook injection (should integrate into sales?)
- executive domain with single module (merge into analytics?)

**User Priorities:**
- Map cross-module relationships BEFORE coding
- Don't let current structure bias new design
- Aggressive scope: Propose any changes needed
- Design for multiple business types (not just gastronomy)
