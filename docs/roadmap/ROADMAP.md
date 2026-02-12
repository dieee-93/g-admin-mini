# G-Admin Mini — Living Roadmap

> This document tracks the 10 priority tasks for completing the core business flow.
> Focus: **Materials → Products → Sales → Cash** with proper cross-module integration.
> Updated during work sessions via the `roadmap-aware-work` skill.

Last updated: 2026-02-12

---

## Active Tasks

### 1. Complete Product Form Complex Configs Persistence
**Status:** pending
**Module(s):** products
**Goal:** Enable full CRUD for rental, membership, digital, and asset product variants
**Complexity:** High - 5 product types with different schemas
**Notes:**
- ProductFormAPI has TODOs for loading/saving: asset_config, rental_terms, digital_delivery, recurring_config
- Currently only basic products work end-to-end
- Blocks: Product variants (rentals, memberships) unusable in production
- Files: `src/pages/admin/supply-chain/products/services/productFormApi.ts:199,258,356`

### 2. Integrate Recipe Module with EventBus & Dashboard
**Status:** pending
**Module(s):** recipe
**Goal:** Complete recipe manifest setup() to register hooks and widgets
**Complexity:** Medium
**Notes:**
- Manifest has "TODO: Register dashboard widgets" and "TODO: Register hooks"
- Recipe module exists but doesn't participate in module ecosystem
- No EventBus listeners for materials.stock_updated, sales.order_completed
- Files: `src/modules/recipe/manifest.tsx:82-83`

### 3. Connect Kitchen Display to EventBus
**Status:** pending
**Module(s):** production
**Goal:** Replace TODO comments with actual EventBus emissions for order status updates
**Complexity:** Medium
**Notes:**
- 3 critical handlers commented: updateItemStatus, completeOrder, priorityChange
- Kitchen Display shows orders but can't update status → breaks production workflow
- Files: `src/pages/admin/operations/production/page.tsx:42-56`

### 4. Fix Auth Context in Suppliers & Shift Control
**Status:** pending
**Module(s):** suppliers, shift-control
**Goal:** Replace hardcoded 'current-user' with real auth context
**Complexity:** Low - systematic replacement
**Notes:**
- Suppliers: 8 occurrences of user_id: 'current-user'
- Shift Control: name: 'User', role: 'staff' hardcoded
- Impact: No audit trail, can't track who performed actions
- Files: `src/pages/admin/supply-chain/suppliers/services/supplierOrdersApi.ts`, `src/modules/shift-control/services/shiftService.ts:606,607,712,713`

### 5. Complete Customers CRUD Operations
**Status:** pending
**Module(s):** customers
**Goal:** Implement edit, delete, and CustomerOrdersHistory integration with Sales
**Complexity:** Medium
**Notes:**
- CustomerForm exists but not integrated (line 35 commented)
- Edit/Delete/Reports all TODO placeholders
- CustomerOrdersHistory needs Sales module connection
- CLV and RFM metrics hardcoded
- Files: `src/pages/admin/core/crm/customers/hooks/useCustomersPage.ts:382-403`

### 6. Implement Sales Edge Functions (Refund & Audit)
**Status:** pending
**Module(s):** sales
**Goal:** Create Edge Functions for refund processing and audit logging
**Complexity:** High - requires Supabase Edge Functions
**Notes:**
- References to EDGE_FUNCTIONS_TODO.md
- Refund, audit logging, and other operations stubbed
- Critical for production: refunds currently don't work
- Files: `src/pages/admin/operations/sales/hooks/useSalesPage.ts:499,529,571,601`

### 7. Fix Direct Chakra Imports (Convention Violation)
**Status:** pending
**Module(s):** products, (scan for others)
**Goal:** Replace all `@chakra-ui/react` imports with `@/shared/ui`
**Complexity:** Low - find & replace
**Notes:**
- Products page violates CLAUDE.md import rule (line 20-25)
- CLAUDE.md explicitly forbids: "NEVER import { Box } from '@chakra-ui/react'"
- Must use: "import { Box } from '@/shared/ui'"
- Impact: Breaks build conventions, inconsistent with codebase
- Files: `src/pages/admin/supply-chain/products/page.tsx:20-25`

### 8. Connect Products Analytics to Real Data
**Status:** pending
**Module(s):** products
**Goal:** Replace hardcoded analytics placeholders with actual sales/inventory queries
**Complexity:** Medium
**Notes:**
- price: 0, popularity_score: 50, sales_volume: 0, total_revenue: 0 all hardcoded
- Menu Engineering Matrix unusable without real data
- Requires integration with sales history
- Files: `src/pages/admin/supply-chain/products/components/Analytics/ProductAnalytics.tsx:86-98`

### 9. Resolve ProductFormModal Version Chaos
**Status:** pending
**Module(s):** products
**Goal:** Consolidate ProductFormModal, ProductFormModalEnhanced, ProductFormModalNew into single source of truth
**Complexity:** Medium - requires decision on which version is canonical
**Notes:**
- Found 3+ versions of ProductFormModal in codebase
- Symptom of incomplete refactoring
- Need to determine which is current, delete others
- Files: Search results show ProductFormModal, ProductFormModalEnhanced, ProductFormModalNew

### 10. Complete Supplier Quality Tracking System
**Status:** pending
**Module(s):** suppliers
**Goal:** Implement defect tracking (quality_score, defect_reports table)
**Complexity:** Medium - requires DB migration
**Notes:**
- TODO comments reference missing tables: defect_reports, quality_score column
- Supplier performance metrics incomplete without quality data
- Files: `src/pages/admin/supply-chain/suppliers/services/supplierHistoryService.ts:225-226`

---

## Completion Criteria

Each task is considered **done** when:
- [ ] Code implemented and tested
- [ ] No remaining TODOs in modified files related to the task
- [ ] Module integrations verified (EventBus, hooks, exports work)
- [ ] Changes documented in DISCOVERIES.md
- [ ] Follows project conventions (imports, DecimalUtils, patterns)

---

## Notes

- **Pattern observed:** UI-first development left integration layer incomplete
- **Common issues:** EventBus commented out, auth hardcoded, data mocked
- **Focus:** Tasks ordered to complete **critical path** (1→2→3 enables production flow)
- **Quick wins:** Tasks 4, 7 are low-complexity, good for building momentum
