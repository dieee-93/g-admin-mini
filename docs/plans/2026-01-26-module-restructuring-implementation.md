# Module Restructuring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor G-Admin Mini from 31 modules in 9 domains to 25 modules in 7 domains with clear cohesion and no antipatterns.

**Architecture:** This plan executes 4 phases sequentially: (1) ELIMINATE deprecated modules, (2) RENOMBRAR existing modules, (3) CREATE new placeholder modules, (4) CONSOLIDATE Finance domain. Each phase has multiple tasks broken into TDD-style steps with frequent commits.

**Tech Stack:** TypeScript, React, Vite, ModuleRegistry system, git worktree

**Design Document:** `docs/plans/2026-01-26-module-restructuring-design.md`

---

## Pre-Implementation Checklist

Before starting, verify:

- [ ] Working in isolated git worktree (recommended: `refactor/module-restructuring` branch)
- [ ] Read design document: `docs/plans/2026-01-26-module-restructuring-design.md`
- [ ] Current branch is clean: `git status`
- [ ] Tests passing: `npm run test` (or document current failures)
- [ ] Development server NOT running (will restart between phases)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking imports across codebase | High | Critical | Use TypeScript compiler to catch errors, global search/replace |
| Routes break after renaming | Medium | High | Update routeMap.ts, test navigation manually |
| ModuleRegistry fails to load | Medium | Critical | Test after each phase, validate manifests |
| Lost code during deletion | Low | High | Audit and migrate useful code before deleting |
| Merge conflicts with main | Medium | Medium | Work in worktree, sync frequently with main |

---

## PHASE 1: ELIMINATE Deprecated Modules

**Goal:** Remove 12 deprecated modules/manifests, migrate useful code to appropriate locations.

**Estimated Time:** 4-6 hours

**Order:** Delete in dependency order (leaf modules first, then parents)

---

### Task 1.1: Audit and Backup kitchen/ Code

**Rationale:** Before deleting `production/kitchen/`, identify reusable components for migration to `production/`.

**Files:**
- Read: `src/modules/production/kitchen/` (all files)
- Document: `docs/temp/kitchen-audit.md` (temporary audit file)

**Step 1: List all files in kitchen/**

```bash
find src/modules/production/kitchen -type f -name "*.ts*" | sort
```

Expected: List of TypeScript/TSX files

**Step 2: Identify useful components**

Create audit document:

```bash
cat > docs/temp/kitchen-audit.md <<'EOF'
# Kitchen Module Audit

## Files Found:
[Paste output from Step 1]

## Components to Migrate to production/:
- [ ] Component 1: [name] - [purpose]
- [ ] Component 2: [name] - [purpose]

## Components to Delete (obsolete):
- [ ] Component X: [name] - [reason]

## Services to Migrate:
- [ ] Service 1: [name]

## Decision:
[MIGRATE or DELETE for each]
EOF
```

**Step 3: Read key files manually**

```bash
# Read main components
cat src/modules/production/kitchen/manifest.tsx
cat src/modules/production/kitchen/components/*.tsx
cat src/modules/production/kitchen/services/*.ts
```

Document findings in `kitchen-audit.md`

**Step 4: Commit audit document**

```bash
git add docs/temp/kitchen-audit.md
git commit -m "docs: audit kitchen module before deletion"
```

---

### Task 1.2: Migrate Useful Code from kitchen/ to production/

**Files:**
- Modify: `src/modules/production/` (create components/ if needed)
- Create: Based on audit findings

**Step 1: Create production components directory if missing**

```bash
mkdir -p src/modules/production/components
mkdir -p src/modules/production/services
```

**Step 2: Copy useful components**

Based on audit, for each component marked "MIGRATE":

```bash
# Example (adjust based on actual audit):
cp src/modules/production/kitchen/components/KitchenDisplay.tsx \
   src/modules/production/components/ProductionDisplay.tsx
```

**Step 3: Rename and generalize copied components**

Open each copied file and:
- Rename component (e.g., `KitchenDisplay` → `ProductionDisplay`)
- Update imports
- Generalize terminology (order → production order, ticket → work order)
- Remove kitchen-specific logic

**Step 4: Update production manifest to export migrated components**

```typescript
// src/modules/production/manifest.tsx
import { ProductionDisplay } from './components/ProductionDisplay';

export const productionManifest: ModuleManifest = {
  // ... existing config
  exports: {
    ProductionDisplay, // New export
  }
};
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No new errors related to production module

**Step 6: Commit migration**

```bash
git add src/modules/production/
git commit -m "feat(production): migrate useful components from kitchen module

- Add ProductionDisplay (generalized from KitchenDisplay)
- Add production services from kitchen
- Update manifest exports"
```

---

### Task 1.3: Delete kitchen/ Module

**Files:**
- Delete: `src/modules/production/kitchen/` (entire directory)
- Modify: `src/modules/index.ts` (remove kitchen exports if any)
- Modify: `src/lib/modules/bootstrap.ts` (remove kitchen registration)

**Step 1: Search for imports of kitchen module**

```bash
grep -r "from.*production/kitchen" src/ --include="*.ts" --include="*.tsx"
grep -r "import.*kitchen" src/ --include="*.ts" --include="*.tsx"
```

Expected: List of files importing from kitchen (should be empty after migration, if not, fix imports first)

**Step 2: Remove kitchen from ModuleRegistry**

```typescript
// src/modules/index.ts
// Remove any lines like:
// export { kitchenManifest } from './production/kitchen/manifest';
```

**Step 3: Delete kitchen directory**

```bash
rm -rf src/modules/production/kitchen/
```

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors related to kitchen imports

**Step 5: Commit deletion**

```bash
git add -A
git commit -m "refactor: delete deprecated kitchen module

Kitchen functionality migrated to production module in previous commit."
```

---

### Task 1.4: Delete fulfillment/ Parent Manifest

**Rationale:** Fulfillment is not a module, just a concept. Delete parent manifest, keep subdirectories for now (will be promoted in later tasks).

**Files:**
- Delete: `src/modules/fulfillment/manifest.tsx`
- Modify: `src/modules/index.ts`
- Modify: `src/lib/modules/bootstrap.ts`

**Step 1: Verify fulfillment parent manifest exists**

```bash
ls -la src/modules/fulfillment/manifest.tsx
```

**Step 2: Search for fulfillment parent manifest imports**

```bash
grep -r "fulfillmentManifest" src/ --include="*.ts" --include="*.tsx"
```

**Step 3: Remove fulfillment parent from ModuleRegistry**

```typescript
// src/modules/index.ts
// Remove line:
// export { fulfillmentManifest } from './fulfillment/manifest';
```

Also check:
```typescript
// src/lib/modules/bootstrap.ts
// Remove registration if present:
// registry.register(fulfillmentManifest);
```

**Step 4: Delete parent manifest only**

```bash
rm src/modules/fulfillment/manifest.tsx
```

**Step 5: Verify submodule manifests still exist**

```bash
ls -la src/modules/fulfillment/delivery/manifest.tsx
ls -la src/modules/fulfillment/onsite/manifest.tsx
ls -la src/modules/fulfillment/pickup/manifest.tsx
```

Expected: All three should exist (they'll be moved in PHASE 2)

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: delete fulfillment parent manifest

Fulfillment is not a module, only a directory container.
Submodules (delivery, onsite, pickup) remain and will be promoted to top-level."
```

---

### Task 1.5: Audit and Delete memberships/ Module

**Rationale:** Memberships is a capability, not a module. Functionality should be distributed across customers, products, billing.

**Files:**
- Read: `src/modules/memberships/` (audit first)
- Delete: `src/modules/memberships/` (after audit)
- Document: `docs/temp/memberships-audit.md`

**Step 1: Audit memberships module**

```bash
find src/modules/memberships -type f -name "*.ts*" | sort
```

**Step 2: Create audit document**

```bash
cat > docs/temp/memberships-audit.md <<'EOF'
# Memberships Module Audit

## Files Found:
[List files]

## Code to Migrate:
- [ ] To customers/: [what]
- [ ] To products/: [what]
- [ ] To billing/: [what]

## Code to Delete (obsolete):
- [ ] [what]

## Decision:
Most functionality is placeholder/incomplete, safe to delete.
Real implementation will be done via capability activation in existing modules.
EOF
```

**Step 3: Search for imports**

```bash
grep -r "from.*memberships" src/ --include="*.ts" --include="*.tsx"
grep -r "membershipsManifest" src/ --include="*.ts" --include="*.tsx"
```

**Step 4: Remove from ModuleRegistry**

```typescript
// src/modules/index.ts
// Remove export
```

**Step 5: Delete module**

```bash
rm -rf src/modules/memberships/
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: delete memberships module

Memberships is a capability, not a standalone module.
Functionality will be distributed:
- customers/: membership status, renewal tracking
- products/: membership plans as product type
- billing/: recurring billing for memberships"
```

---

### Task 1.6: Audit and Delete reporting/, intelligence/, executive/ Modules

**Rationale:** Analytics should be distributed within each module, not centralized.

**Files:**
- Read: `src/modules/reporting/`, `src/modules/intelligence/`, `src/modules/executive/`
- Delete: All three modules
- Document: `docs/temp/analytics-modules-audit.md`

**Step 1: Audit all three modules**

```bash
find src/modules/reporting -type f 2>/dev/null | sort
find src/modules/intelligence -type f 2>/dev/null | sort
find src/modules/executive -type f 2>/dev/null | sort
```

**Step 2: Create audit document**

```bash
cat > docs/temp/analytics-modules-audit.md <<'EOF'
# Analytics Modules Audit (reporting, intelligence, executive)

## reporting/ Files:
[List]

## intelligence/ Files:
[List]

## executive/ Files:
[List]

## Useful Code to Migrate:
- [ ] To sales/: [analytics components]
- [ ] To customers/: [analytics components]
- [ ] To materials/: [analytics components]

## Code to Delete:
- [ ] [what]

## Decision:
[MIGRATE or DELETE for each component]
EOF
```

**Step 3: Search for imports**

```bash
grep -r "from.*reporting" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*intelligence" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*executive" src/ --include="*.ts" --include="*.tsx"
```

**Step 4: Remove from ModuleRegistry**

```typescript
// src/modules/index.ts
// Remove exports for all three
```

**Step 5: Delete modules**

```bash
rm -rf src/modules/reporting/
rm -rf src/modules/intelligence/
rm -rf src/modules/executive/
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: delete centralized analytics modules

Delete reporting/, intelligence/, executive/ modules.
Analytics should be distributed within domain modules:
- sales/ analytics for sales metrics
- customers/ analytics for RFM, segmentation
- materials/ analytics for ABC analysis, trends

Useful code will be migrated to appropriate modules in future tasks."
```

---

### Task 1.7: Delete team/ Module (Duplicate of staff/)

**Files:**
- Delete: `src/modules/team/`
- Modify: `src/modules/index.ts`

**Step 1: Verify team/ is duplicate**

```bash
# Check routes
grep -A5 "route:" src/modules/team/manifest.tsx
grep -A5 "route:" src/modules/staff/manifest.tsx
```

Expected: Both should have route `/admin/resources/team` (confirmed duplicate)

**Step 2: Search for team module imports**

```bash
grep -r "from.*modules/team" src/ --include="*.ts" --include="*.tsx"
grep -r "teamManifest" src/ --include="*.ts" --include="*.tsx"
```

**Step 3: Remove from ModuleRegistry**

```typescript
// src/modules/index.ts
// Remove: export { teamManifest } from './team/manifest';
```

**Step 4: Delete module**

```bash
rm -rf src/modules/team/
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: delete duplicate team module

team/ was duplicate of staff/ with same route.
Keep staff/ as canonical people management module."
```

---

### Task 1.8: Delete cash/ Legacy Module

**Files:**
- Delete: `src/modules/cash/`
- Modify: `src/modules/index.ts`

**Step 1: Verify cash/ is legacy**

```bash
# Check if has route/domain metadata
grep "route:" src/modules/cash/manifest.tsx
grep "domain:" src/modules/cash/manifest.tsx
```

Expected: Missing metadata (legacy module)

**Step 2: Verify cash-management/ exists as replacement**

```bash
ls -la src/modules/cash-management/manifest.tsx
```

**Step 3: Search for cash/ imports (not cash-management)**

```bash
grep -r "from.*modules/cash[^-]" src/ --include="*.ts" --include="*.tsx"
grep -r "from ['\"]\\.\\./cash['\"]" src/ --include="*.ts" --include="*.tsx"
```

**Step 4: Remove from ModuleRegistry**

```typescript
// src/modules/index.ts
// Remove if present: export { cashManifest } from './cash/manifest';
```

**Step 5: Delete module**

```bash
rm -rf src/modules/cash/
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: delete legacy cash module

cash/ is legacy module without route/domain metadata.
Functionality replaced by cash-management/ module."
```

---

### Task 1.9: Delete finance-corporate/ Module

**Files:**
- Delete: `src/modules/finance-corporate/`
- Modify: `src/modules/index.ts`

**Step 1: Verify module is mostly empty**

```bash
find src/modules/finance-corporate -type f -name "*.ts*" | wc -l
```

Expected: Very few files

**Step 2: Search for imports**

```bash
grep -r "from.*finance-corporate" src/ --include="*.ts" --include="*.tsx"
```

**Step 3: Remove from ModuleRegistry**

```typescript
// src/modules/index.ts
// Remove export
```

**Step 4: Delete module**

```bash
rm -rf src/modules/finance-corporate/
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: delete empty finance-corporate module

Module is nearly empty with no active functionality."
```

---

### Task 1.10: PHASE 1 Verification and Checkpoint

**Goal:** Verify all deletions successful, app still compiles and runs.

**Step 1: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: Clean compile (or only pre-existing errors)

**Step 2: Verify deleted modules are gone**

```bash
# Should all return "No such file or directory"
ls src/modules/production/kitchen/
ls src/modules/fulfillment/manifest.tsx
ls src/modules/memberships/
ls src/modules/reporting/
ls src/modules/intelligence/
ls src/modules/executive/
ls src/modules/team/
ls src/modules/cash/
ls src/modules/finance-corporate/
```

**Step 3: Count remaining modules**

```bash
find src/modules -name "manifest.tsx" -type f | wc -l
```

Expected: Reduced count (was 31, now ~22 after deletions)

**Step 4: Try to start dev server**

```bash
npm run dev
```

Expected: Server starts without module loading errors (may have other errors, focus on modules)

Stop server: Ctrl+C

**Step 5: Create PHASE 1 checkpoint commit**

```bash
git add -A
git commit -m "refactor(PHASE 1): complete module elimination

Deleted 12 deprecated modules/manifests:
- production/kitchen/ (migrated to production/)
- fulfillment/manifest.tsx (parent only)
- memberships/
- reporting/, intelligence/, executive/
- team/ (duplicate of staff/)
- cash/ (legacy)
- finance-corporate/ (empty)

Modules count: 31 → 22
Next: PHASE 2 (Rename existing modules)"
```

---

## PHASE 2: RENOMBRAR Existing Modules

**Goal:** Rename 5 modules with better names (code + UI).

**Estimated Time:** 3-4 hours

**Strategy:** Rename one module at a time, update all references, test, commit.

---

### Task 2.1: Rename gamification/ → loyalty/

**Files:**
- Rename: `src/modules/gamification/` → `src/modules/loyalty/`
- Modify: `src/modules/loyalty/manifest.tsx` (update id, name, route)
- Modify: `src/modules/index.ts`
- Modify: `src/config/routeMap.ts`
- Search and replace all imports

**Step 1: Rename directory**

```bash
mv src/modules/gamification src/modules/loyalty
```

**Step 2: Update manifest metadata**

```typescript
// src/modules/loyalty/manifest.tsx

export const loyaltyManifest: ModuleManifest = {
  id: 'loyalty', // was: 'gamification'
  name: 'Fidelización', // was: 'Gamificación' or similar
  domain: 'marketing',
  route: '/admin/marketing/loyalty', // was: '/admin/gamification'
  // ... rest of config
};
```

**Step 3: Update module exports**

```typescript
// src/modules/index.ts

// Change:
// export { gamificationManifest } from './gamification/manifest';
// To:
export { loyaltyManifest } from './loyalty/manifest';
```

**Step 4: Search and replace imports across codebase**

```bash
# Find all imports
grep -r "from.*gamification" src/ --include="*.ts" --include="*.tsx"

# For each file found, replace:
# from '@/modules/gamification' → from '@/modules/loyalty'
# from './gamification' → from './loyalty'
# gamificationManifest → loyaltyManifest
```

Use global search/replace in IDE or:

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@/modules/gamification|from '@/modules/loyalty|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from './gamification|from './loyalty|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|gamificationManifest|loyaltyManifest|g" {} +
```

**Step 5: Update routeMap if applicable**

```typescript
// src/config/routeMap.ts

// Update route mapping if present
'/admin/marketing/loyalty': {
  module: 'loyalty', // was: 'gamification'
  // ...
}
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors related to gamification/loyalty

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: rename gamification → loyalty

- Rename module directory
- Update manifest: id, name ('Fidelización'), route
- Update all imports across codebase
- Part of PHASE 2: module renaming"
```

---

### Task 2.2: Rename cash-management/ → accounting/

**Files:**
- Rename: `src/modules/cash-management/` → `src/modules/accounting/`
- Modify: `src/modules/accounting/manifest.tsx`
- Modify: `src/modules/index.ts`
- Modify: `src/config/routeMap.ts`
- Search and replace all imports

**Step 1: Rename directory**

```bash
mv src/modules/cash-management src/modules/accounting
```

**Step 2: Update manifest metadata**

```typescript
// src/modules/accounting/manifest.tsx

export const accountingManifest: ModuleManifest = {
  id: 'accounting', // was: 'cash-management'
  name: 'Contabilidad', // was: 'Gestión de Caja' or similar
  domain: 'finance',
  route: '/admin/finance/accounting', // was: '/admin/finance/cash'
  // ... rest
};
```

**Step 3: Update module exports**

```typescript
// src/modules/index.ts

// Change:
// export { cashManagementManifest } from './cash-management/manifest';
// To:
export { accountingManifest } from './accounting/manifest';
```

**Step 4: Search and replace imports**

```bash
# Find imports
grep -r "from.*cash-management" src/ --include="*.ts" --include="*.tsx"
grep -r "cashManagementManifest" src/ --include="*.ts" --include="*.tsx"
grep -r "useCashManagement" src/ --include="*.ts" --include="*.tsx"

# Replace
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@/modules/cash-management|from '@/modules/accounting|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from './cash-management|from './accounting|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|cashManagementManifest|accountingManifest|g" {} +
```

**Step 5: Update route references**

```bash
# Find references to old route
grep -r "/admin/finance/cash" src/ --include="*.ts" --include="*.tsx"

# Update to new route: /admin/finance/accounting
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: rename cash-management → accounting

- Rename module directory
- Update manifest: id, name ('Contabilidad'), route
- Update all imports and route references
- Part of PHASE 2: Finance consolidation prep"
```

---

### Task 2.3: Rename finance-integrations/ → payment-gateways/

**Files:**
- Rename: `src/modules/finance-integrations/` → `src/modules/payment-gateways/`
- Modify: `src/modules/payment-gateways/manifest.tsx`
- Modify: `src/modules/index.ts`
- Search and replace imports

**Step 1: Rename directory**

```bash
mv src/modules/finance-integrations src/modules/payment-gateways
```

**Step 2: Update manifest**

```typescript
// src/modules/payment-gateways/manifest.tsx

export const paymentGatewaysManifest: ModuleManifest = {
  id: 'payment-gateways', // was: 'finance-integrations'
  name: 'Medios de Pago', // was: 'Integraciones de Pago'
  domain: 'finance',
  route: '/admin/finance/payment-gateways', // was: '/admin/finance/integrations'
  // ...
};
```

**Step 3: Update module exports**

```typescript
// src/modules/index.ts

// Change:
// export { financeIntegrationsManifest } from './finance-integrations/manifest';
// To:
export { paymentGatewaysManifest } from './payment-gateways/manifest';
```

**Step 4: Search and replace imports**

```bash
grep -r "from.*finance-integrations" src/ --include="*.ts" --include="*.tsx"

find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@/modules/finance-integrations|from '@/modules/payment-gateways|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from './finance-integrations|from './payment-gateways|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|financeIntegrationsManifest|paymentGatewaysManifest|g" {} +
```

**Step 5: Update route references**

```bash
grep -r "/admin/finance/integrations" src/ --include="*.ts" --include="*.tsx"
# Replace with: /admin/finance/payment-gateways
```

**Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: rename finance-integrations → payment-gateways

- Rename module directory
- Update manifest: id, name ('Medios de Pago'), route
- Update all imports and route references
- Part of PHASE 2: clearer naming"
```

---

### Task 2.4: Promote fulfillment Submodules to Top-Level

**Goal:** Move delivery, onsite, pickup from `fulfillment/` subdirectory to top-level `src/modules/`.

**Files:**
- Move: `src/modules/fulfillment/delivery/` → `src/modules/delivery/`
- Move: `src/modules/fulfillment/onsite/` → `src/modules/onsite/`
- Move: `src/modules/fulfillment/pickup/` → `src/modules/pickup/`
- Modify: Each manifest (update domain, route)
- Modify: `src/modules/index.ts`
- Delete: `src/modules/fulfillment/` (now empty)

**Step 1: Move delivery/**

```bash
mv src/modules/fulfillment/delivery src/modules/delivery
```

**Step 2: Update delivery manifest**

```typescript
// src/modules/delivery/manifest.tsx

export const deliveryManifest: ModuleManifest = {
  id: 'delivery',
  name: 'Delivery', // UI name with motorcycle icon
  domain: 'sales-fulfillment', // NEW domain
  route: '/admin/sales/delivery', // was: /admin/operations/fulfillment/delivery
  // ...
};
```

**Step 3: Move onsite/**

```bash
mv src/modules/fulfillment/onsite src/modules/onsite
```

**Step 4: Update onsite manifest**

```typescript
// src/modules/onsite/manifest.tsx

export const onsiteManifest: ModuleManifest = {
  id: 'onsite',
  name: 'Salón y Mesas',
  domain: 'sales-fulfillment',
  route: '/admin/sales/onsite', // was: /admin/operations/fulfillment/onsite
  // ...
};
```

**Step 5: Move pickup/**

```bash
mv src/modules/fulfillment/pickup src/modules/pickup
```

**Step 6: Update pickup manifest**

```typescript
// src/modules/pickup/manifest.tsx

export const pickupManifest: ModuleManifest = {
  id: 'pickup',
  name: 'Take Away',
  domain: 'sales-fulfillment',
  route: '/admin/sales/pickup', // was: /admin/operations/fulfillment/pickup
  // ...
};
```

**Step 7: Update module index exports**

```typescript
// src/modules/index.ts

// Change from:
// export { deliveryManifest } from './fulfillment/delivery/manifest';
// To:
export { deliveryManifest } from './delivery/manifest';
export { onsiteManifest } from './onsite/manifest';
export { pickupManifest } from './pickup/manifest';
```

**Step 8: Search and replace imports**

```bash
# Find old imports
grep -r "from.*fulfillment/delivery" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*fulfillment/onsite" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*fulfillment/pickup" src/ --include="*.ts" --include="*.tsx"

# Replace
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@/modules/fulfillment/delivery|from '@/modules/delivery|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@/modules/fulfillment/onsite|from '@/modules/onsite|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from '@/modules/fulfillment/pickup|from '@/modules/pickup|g" {} +
```

**Step 9: Update route references**

```bash
# Old routes → new routes
# /admin/operations/fulfillment/delivery → /admin/sales/delivery
# /admin/operations/fulfillment/onsite → /admin/sales/onsite
# /admin/operations/fulfillment/pickup → /admin/sales/pickup
```

**Step 10: Delete empty fulfillment directory**

```bash
# Verify it's empty
ls -la src/modules/fulfillment/

# Delete
rmdir src/modules/fulfillment/
```

**Step 11: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 12: Commit**

```bash
git add -A
git commit -m "refactor: promote fulfillment submodules to top-level

- Move delivery/, onsite/, pickup/ from fulfillment/ to src/modules/
- Update manifests: domain (sales-fulfillment), routes
- Update all imports across codebase
- Delete empty fulfillment/ directory
- Part of PHASE 2: eliminate antipattern of submodules with manifests"
```

---

### Task 2.5: Rename Domain supply-chain → inventory

**Goal:** Rename domain in all module manifests that use `domain: 'supply-chain'`.

**Files:**
- Modify: `src/modules/materials/manifest.tsx`
- Modify: `src/modules/products/manifest.tsx`
- Modify: `src/modules/suppliers/manifest.tsx`
- Modify: `src/modules/assets/manifest.tsx`
- Modify: `src/modules/recipe/manifest.tsx` (if exists)
- Modify: `src/config/BusinessModelRegistry.ts` (if domain is registered)

**Step 1: Find all modules with domain 'supply-chain'**

```bash
grep -r "domain: 'supply-chain'" src/modules/ --include="manifest.tsx"
```

Expected: List of manifest files (materials, products, suppliers, assets, recipe)

**Step 2: Update each manifest domain**

For each file found:

```typescript
// Before:
domain: 'supply-chain',

// After:
domain: 'inventory',
```

Example:
```typescript
// src/modules/materials/manifest.tsx
export const materialsManifest: ModuleManifest = {
  id: 'materials',
  name: 'Materiales',
  domain: 'inventory', // was: 'supply-chain'
  // ...
};
```

Repeat for: products, suppliers, assets, recipe

**Step 3: Update domain registry if present**

```typescript
// src/config/BusinessModelRegistry.ts or similar

// Change domain definition if present:
{
  id: 'inventory', // was: 'supply-chain'
  name: 'Inventario', // was: 'Cadena de Suministro'
  // ...
}
```

**Step 4: Search for domain string references**

```bash
grep -r "supply-chain" src/ --include="*.ts" --include="*.tsx"

# Replace any references in code
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: rename domain supply-chain → inventory

- Update domain in manifests: materials, products, suppliers, assets, recipe
- Update domain registry
- 'Inventario' is clearer than 'Cadena de Suministro'
- Part of PHASE 2: domain renaming"
```

---

### Task 2.6: PHASE 2 Verification and Checkpoint

**Goal:** Verify all renames successful, routes work, app compiles.

**Step 1: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: Clean (or only pre-existing errors)

**Step 2: Check renamed modules exist**

```bash
ls -la src/modules/loyalty/manifest.tsx
ls -la src/modules/accounting/manifest.tsx
ls -la src/modules/payment-gateways/manifest.tsx
ls -la src/modules/delivery/manifest.tsx
ls -la src/modules/onsite/manifest.tsx
ls -la src/modules/pickup/manifest.tsx
```

All should exist

**Step 3: Check old modules are gone**

```bash
# Should all fail
ls src/modules/gamification/
ls src/modules/cash-management/
ls src/modules/finance-integrations/
ls src/modules/fulfillment/
```

**Step 4: Test dev server**

```bash
npm run dev
```

Expected: Starts successfully, modules load

Navigate to renamed routes:
- `/admin/marketing/loyalty`
- `/admin/finance/accounting`
- `/admin/finance/payment-gateways`
- `/admin/sales/delivery`
- `/admin/sales/onsite`
- `/admin/sales/pickup`

Verify pages load (may be empty placeholders, that's OK)

Stop server: Ctrl+C

**Step 5: Create PHASE 2 checkpoint commit**

```bash
git add -A
git commit -m "refactor(PHASE 2): complete module renaming

Renamed 5 modules + promoted 3 submodules:
- gamification → loyalty ('Fidelización')
- cash-management → accounting ('Contabilidad')
- finance-integrations → payment-gateways ('Medios de Pago')
- fulfillment/delivery → delivery/ (top-level)
- fulfillment/onsite → onsite/ (top-level)
- fulfillment/pickup → pickup/ (top-level)
- domain: supply-chain → inventory

All imports updated, routes verified working.
Next: PHASE 3 (Create new modules)"
```

---

## PHASE 3: CREATE New Modules

**Goal:** Create 4 new modules as placeholders (storefront, shipping, campaigns, social).

**Estimated Time:** 2-3 hours

**Strategy:** Use template structure, create minimal manifest + placeholder component.

---

### Task 3.1: Create storefront/ Module Template

**Files:**
- Create: `src/modules/storefront/manifest.tsx`
- Create: `src/modules/storefront/components/StorefrontPlaceholder.tsx`
- Create: `src/modules/storefront/index.ts`
- Modify: `src/modules/index.ts`

**Step 1: Create module directory structure**

```bash
mkdir -p src/modules/storefront/components
```

**Step 2: Create manifest**

```typescript
// src/modules/storefront/manifest.tsx
import type { ModuleManifest } from '@/lib/modules/types';

export const storefrontManifest: ModuleManifest = {
  id: 'storefront',
  name: 'Tienda',
  description: 'Configuración de tienda y menú visible al cliente',
  domain: 'sales-fulfillment',
  version: '0.1.0',
  route: '/admin/sales/storefront',
  icon: 'FiShoppingBag', // Chakra UI icon or custom

  capabilities: {
    required: [],
    optional: ['ecommerce', 'onsite']
  },

  permissions: {
    view: ['storefront.view'],
    manage: ['storefront.manage']
  },

  setup: async (registry) => {
    // Module setup logic (can be empty for now)
    console.log('Storefront module initialized');
  }
};
```

**Step 3: Create placeholder component**

```tsx
// src/modules/storefront/components/StorefrontPlaceholder.tsx
import { Box, Heading, Text, VStack } from '@/shared/ui';

export function StorefrontPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Tienda - En Desarrollo</Heading>
        <Text>
          Este módulo está en desarrollo. Permitirá configurar:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Diseño y branding de tienda</Text>
          <Text>• Menú digital y catálogo visible al cliente</Text>
          <Text>• Configuración de tienda online (si ecommerce activo)</Text>
          <Text>• Menú QR para mesas (si onsite activo)</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
```

**Step 4: Create module index**

```typescript
// src/modules/storefront/index.ts
export { storefrontManifest } from './manifest';
export { StorefrontPlaceholder } from './components/StorefrontPlaceholder';
```

**Step 5: Register module**

```typescript
// src/modules/index.ts

// Add export
export { storefrontManifest } from './storefront/manifest';
```

**Step 6: Add route (if using routeMap)**

```typescript
// src/config/routeMap.ts

import { StorefrontPlaceholder } from '@/modules/storefront';

// Add route
'/admin/sales/storefront': {
  component: StorefrontPlaceholder,
  module: 'storefront',
  requiredPermissions: ['storefront.view']
}
```

**Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 8: Test module loads**

```bash
npm run dev
```

Navigate to `/admin/sales/storefront` - should see placeholder

**Step 9: Commit**

```bash
git add src/modules/storefront/
git add src/modules/index.ts
git add src/config/routeMap.ts
git commit -m "feat(storefront): create storefront module placeholder

- Add manifest with basic metadata
- Add placeholder component
- Domain: sales-fulfillment
- Route: /admin/sales/storefront
- Part of PHASE 3: new module creation"
```

---

### Task 3.2: Create shipping/ Module Template

**Files:**
- Create: `src/modules/shipping/manifest.tsx`
- Create: `src/modules/shipping/components/ShippingPlaceholder.tsx`
- Create: `src/modules/shipping/index.ts`
- Modify: `src/modules/index.ts`

**Step 1: Create directory**

```bash
mkdir -p src/modules/shipping/components
```

**Step 2: Create manifest**

```typescript
// src/modules/shipping/manifest.tsx
import type { ModuleManifest } from '@/lib/modules/types';

export const shippingManifest: ModuleManifest = {
  id: 'shipping',
  name: 'Envíos por Correo',
  description: 'Gestión de envíos por correo, flete y couriers externos',
  domain: 'sales-fulfillment',
  version: '0.1.0',
  route: '/admin/sales/shipping',
  icon: 'FiPackage',

  capabilities: {
    required: [],
    optional: ['shipping']
  },

  permissions: {
    view: ['shipping.view'],
    manage: ['shipping.manage']
  },

  setup: async (registry) => {
    console.log('Shipping module initialized');
  }
};
```

**Step 3: Create placeholder component**

```tsx
// src/modules/shipping/components/ShippingPlaceholder.tsx
import { Box, Heading, Text, VStack } from '@/shared/ui';

export function ShippingPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Envíos por Correo - En Desarrollo</Heading>
        <Text>
          Este módulo gestionará envíos por servicios externos:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Integración con correos (Correo Argentino, OCA, Andreani)</Text>
          <Text>• Fletes y camiones para productos grandes</Text>
          <Text>• Tracking de envíos</Text>
          <Text>• Cálculo de costos de envío</Text>
          <Text>• Generación de etiquetas</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
```

**Step 4: Create index**

```typescript
// src/modules/shipping/index.ts
export { shippingManifest } from './manifest';
export { ShippingPlaceholder } from './components/ShippingPlaceholder';
```

**Step 5: Register module**

```typescript
// src/modules/index.ts
export { shippingManifest } from './shipping/manifest';
```

**Step 6: Add route**

```typescript
// src/config/routeMap.ts
import { ShippingPlaceholder } from '@/modules/shipping';

'/admin/sales/shipping': {
  component: ShippingPlaceholder,
  module: 'shipping',
  requiredPermissions: ['shipping.view']
}
```

**Step 7: Verify and test**

```bash
npx tsc --noEmit
npm run dev
```

Navigate to `/admin/sales/shipping`

**Step 8: Commit**

```bash
git add src/modules/shipping/
git add src/modules/index.ts
git add src/config/routeMap.ts
git commit -m "feat(shipping): create shipping module placeholder

- Add manifest for external shipping services
- Add placeholder component
- Domain: sales-fulfillment
- Route: /admin/sales/shipping
- Part of PHASE 3: new module creation"
```

---

### Task 3.3: Create campaigns/ Module Template

**Files:**
- Create: `src/modules/campaigns/manifest.tsx`
- Create: `src/modules/campaigns/components/CampaignsPlaceholder.tsx`
- Create: `src/modules/campaigns/index.ts`
- Modify: `src/modules/index.ts`

**Step 1: Create directory**

```bash
mkdir -p src/modules/campaigns/components
```

**Step 2: Create manifest**

```typescript
// src/modules/campaigns/manifest.tsx
import type { ModuleManifest } from '@/lib/modules/types';

export const campaignsManifest: ModuleManifest = {
  id: 'campaigns',
  name: 'Campañas',
  description: 'Gestión de promociones y campañas de marketing',
  domain: 'marketing',
  version: '0.1.0',
  route: '/admin/marketing/campaigns',
  icon: 'FiTrendingUp',

  capabilities: {
    required: [],
    optional: ['marketing']
  },

  permissions: {
    view: ['campaigns.view'],
    manage: ['campaigns.manage']
  },

  setup: async (registry) => {
    console.log('Campaigns module initialized');
  }
};
```

**Step 3: Create placeholder**

```tsx
// src/modules/campaigns/components/CampaignsPlaceholder.tsx
import { Box, Heading, Text, VStack } from '@/shared/ui';

export function CampaignsPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Campañas - En Desarrollo</Heading>
        <Text>
          Este módulo gestionará promociones y campañas:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Descuentos y cupones</Text>
          <Text>• Promociones 2x1, 3x2</Text>
          <Text>• Combos especiales</Text>
          <Text>• Reglas de aplicación (productos, clientes, fechas)</Text>
          <Text>• Tracking de uso y performance</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
```

**Step 4: Create index**

```typescript
// src/modules/campaigns/index.ts
export { campaignsManifest } from './manifest';
export { CampaignsPlaceholder } from './components/CampaignsPlaceholder';
```

**Step 5: Register module**

```typescript
// src/modules/index.ts
export { campaignsManifest } from './campaigns/manifest';
```

**Step 6: Add route**

```typescript
// src/config/routeMap.ts
import { CampaignsPlaceholder } from '@/modules/campaigns';

'/admin/marketing/campaigns': {
  component: CampaignsPlaceholder,
  module: 'campaigns',
  requiredPermissions: ['campaigns.view']
}
```

**Step 7: Verify and test**

```bash
npx tsc --noEmit
npm run dev
```

Navigate to `/admin/marketing/campaigns`

**Step 8: Commit**

```bash
git add src/modules/campaigns/
git add src/modules/index.ts
git add src/config/routeMap.ts
git commit -m "feat(campaigns): create campaigns module placeholder

- Add manifest for marketing campaigns
- Add placeholder component
- Domain: marketing
- Route: /admin/marketing/campaigns
- Part of PHASE 3: new module creation"
```

---

### Task 3.4: Create social/ Module Template

**Files:**
- Create: `src/modules/social/manifest.tsx`
- Create: `src/modules/social/components/SocialPlaceholder.tsx`
- Create: `src/modules/social/index.ts`
- Modify: `src/modules/index.ts`

**Step 1: Create directory**

```bash
mkdir -p src/modules/social/components
```

**Step 2: Create manifest**

```typescript
// src/modules/social/manifest.tsx
import type { ModuleManifest } from '@/lib/modules/types';

export const socialManifest: ModuleManifest = {
  id: 'social',
  name: 'Redes Sociales',
  description: 'Integración con redes sociales y marketing digital',
  domain: 'marketing',
  version: '0.1.0',
  route: '/admin/marketing/social',
  icon: 'FiShare2',

  capabilities: {
    required: [],
    optional: ['social-media']
  },

  permissions: {
    view: ['social.view'],
    manage: ['social.manage']
  },

  setup: async (registry) => {
    console.log('Social module initialized');
  }
};
```

**Step 3: Create placeholder**

```tsx
// src/modules/social/components/SocialPlaceholder.tsx
import { Box, Heading, Text, VStack } from '@/shared/ui';

export function SocialPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Redes Sociales - En Desarrollo</Heading>
        <Text>
          Este módulo gestionará integraciones sociales:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Facebook/Instagram: Posts, stories, catalog sync</Text>
          <Text>• WhatsApp Business: Mensajería, catálogo</Text>
          <Text>• Google My Business: Reviews, información</Text>
          <Text>• Publicación programada</Text>
          <Text>• Analytics de redes sociales</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
```

**Step 4: Create index**

```typescript
// src/modules/social/index.ts
export { socialManifest } from './manifest';
export { SocialPlaceholder } from './components/SocialPlaceholder';
```

**Step 5: Register module**

```typescript
// src/modules/index.ts
export { socialManifest } from './social/manifest';
```

**Step 6: Add route**

```typescript
// src/config/routeMap.ts
import { SocialPlaceholder } from '@/modules/social';

'/admin/marketing/social': {
  component: SocialPlaceholder,
  module: 'social',
  requiredPermissions: ['social.view']
}
```

**Step 7: Verify and test**

```bash
npx tsc --noEmit
npm run dev
```

Navigate to `/admin/marketing/social`

**Step 8: Commit**

```bash
git add src/modules/social/
git add src/modules/index.ts
git add src/config/routeMap.ts
git commit -m "feat(social): create social media module placeholder

- Add manifest for social media integrations
- Add placeholder component
- Domain: marketing
- Route: /admin/marketing/social
- Part of PHASE 3: new module creation"
```

---

### Task 3.5: PHASE 3 Verification and Checkpoint

**Step 1: Verify all new modules exist**

```bash
ls -la src/modules/storefront/manifest.tsx
ls -la src/modules/shipping/manifest.tsx
ls -la src/modules/campaigns/manifest.tsx
ls -la src/modules/social/manifest.tsx
```

**Step 2: Count total modules**

```bash
find src/modules -name "manifest.tsx" -type f | wc -l
```

Expected: ~26 modules (22 after PHASE 1 + 4 new)

**Step 3: Test all new routes**

```bash
npm run dev
```

Visit each:
- `/admin/sales/storefront` ✓
- `/admin/sales/shipping` ✓
- `/admin/marketing/campaigns` ✓
- `/admin/marketing/social` ✓

All should show placeholder pages

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 5: Create checkpoint commit**

```bash
git add -A
git commit -m "refactor(PHASE 3): complete new module creation

Created 4 new placeholder modules:
- storefront/ (sales-fulfillment)
- shipping/ (sales-fulfillment)
- campaigns/ (marketing)
- social/ (marketing)

All modules have:
- Basic manifest with metadata
- Placeholder component with roadmap
- Route registration
- Module exports

Modules count: 22 → 26
Next: PHASE 4 (Consolidate Finance)"
```

---

## PHASE 4: CONSOLIDATE Finance Domain

**Goal:** Merge finance-billing + finance-fiscal → billing/

**Estimated Time:** 3-4 hours

**Strategy:** This is the most complex phase. We'll create new `billing/` module and carefully migrate code from two source modules.

---

### Task 4.1: Audit finance-billing/ and finance-fiscal/

**Goal:** Understand what code exists in both modules before consolidation.

**Files:**
- Read: `src/modules/finance-billing/` (all files)
- Read: `src/modules/finance-fiscal/` (all files)
- Document: `docs/temp/finance-consolidation-audit.md`

**Step 1: List files in both modules**

```bash
echo "=== finance-billing files ===" > docs/temp/finance-consolidation-audit.md
find src/modules/finance-billing -type f -name "*.ts*" | sort >> docs/temp/finance-consolidation-audit.md

echo "" >> docs/temp/finance-consolidation-audit.md
echo "=== finance-fiscal files ===" >> docs/temp/finance-consolidation-audit.md
find src/modules/finance-fiscal -type f -name "*.ts*" | sort >> docs/temp/finance-consolidation-audit.md
```

**Step 2: Analyze components**

```bash
# List components from both
echo "" >> docs/temp/finance-consolidation-audit.md
echo "=== Components to merge ===" >> docs/temp/finance-consolidation-audit.md

ls src/modules/finance-billing/components/ >> docs/temp/finance-consolidation-audit.md
ls src/modules/finance-fiscal/components/ >> docs/temp/finance-consolidation-audit.md
```

**Step 3: Analyze services**

```bash
echo "" >> docs/temp/finance-consolidation-audit.md
echo "=== Services to merge ===" >> docs/temp/finance-consolidation-audit.md

ls src/modules/finance-billing/services/ >> docs/temp/finance-consolidation-audit.md
ls src/modules/finance-fiscal/services/ >> docs/temp/finance-consolidation-audit.md
```

**Step 4: Create merge plan**

Add to audit document:

```markdown
## Merge Strategy:

### billing/ will contain:

**From finance-billing:**
- [ ] RecurringBillingForm
- [ ] BillingAnalytics
- [ ] billingApi.ts
- [ ] [list other components/services]

**From finance-fiscal:**
- [ ] FiscalDocumentForm
- [ ] TaxCompliance
- [ ] fiscalApi.ts
- [ ] taxCalculationService.ts
- [ ] [list other components/services]

### Naming conventions:
- Billing-related: keep "Billing" prefix
- Fiscal-related: keep "Fiscal" prefix
- Merged features: use "BillingFiscal" or descriptive name

### Conflicts to resolve:
- [ ] If both have similar components (list)
- [ ] If both have overlapping services (list)
```

**Step 5: Commit audit**

```bash
git add docs/temp/finance-consolidation-audit.md
git commit -m "docs: audit finance modules before consolidation

Audit finance-billing and finance-fiscal for PHASE 4 merge."
```

---

### Task 4.2: Create billing/ Module Structure

**Goal:** Create empty billing/ module with proper manifest.

**Files:**
- Create: `src/modules/billing/manifest.tsx`
- Create: `src/modules/billing/components/` (directory)
- Create: `src/modules/billing/services/` (directory)
- Create: `src/modules/billing/hooks/` (directory)
- Create: `src/modules/billing/types/` (directory)

**Step 1: Create directory structure**

```bash
mkdir -p src/modules/billing/{components,services,hooks,types}
```

**Step 2: Create manifest**

```typescript
// src/modules/billing/manifest.tsx
import type { ModuleManifest } from '@/lib/modules/types';

export const billingManifest: ModuleManifest = {
  id: 'billing',
  name: 'Facturación e Impuestos',
  description: 'Gestión de facturación, documentos fiscales e impuestos',
  domain: 'finance',
  version: '1.0.0',
  route: '/admin/finance/billing',
  icon: 'FiFileText',

  capabilities: {
    required: [],
    optional: ['fiscal', 'recurring-billing']
  },

  permissions: {
    view: ['billing.view', 'fiscal.view'],
    manage: ['billing.manage', 'fiscal.manage']
  },

  setup: async (registry) => {
    // Will be populated with exports after migration
    console.log('Billing module initialized');
  },

  exports: {
    // Will be populated with migrated functions/components
  }
};
```

**Step 3: Create index**

```typescript
// src/modules/billing/index.ts
export { billingManifest } from './manifest';

// Exports will be added as we migrate components
```

**Step 4: Register in module index**

```typescript
// src/modules/index.ts

// Add (don't remove old ones yet, will do in later task)
export { billingManifest } from './billing/manifest';
```

**Step 5: Verify compiles**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/modules/billing/
git add src/modules/index.ts
git commit -m "feat(billing): create billing module structure

- Create manifest for consolidated billing+fiscal module
- Create directory structure (components, services, hooks, types)
- Register module
- Part of PHASE 4: Finance consolidation"
```

---

### Task 4.3: Migrate Components from finance-billing/ to billing/

**Goal:** Copy and adapt billing-specific components.

**Files:**
- Copy: Components from `src/modules/finance-billing/components/` → `src/modules/billing/components/`
- Modify: Update imports in copied files

**Step 1: Copy billing components**

Based on audit (adjust filenames as needed):

```bash
# Example - adjust based on actual files
cp src/modules/finance-billing/components/RecurringBillingForm.tsx \
   src/modules/billing/components/RecurringBillingForm.tsx

cp src/modules/finance-billing/components/BillingAnalytics.tsx \
   src/modules/billing/components/BillingAnalytics.tsx

# Copy all billing-related components
cp -r src/modules/finance-billing/components/* \
      src/modules/billing/components/
```

**Step 2: Update imports in copied components**

For each copied file, update imports:

```typescript
// Before:
import { somethingFromBilling } from '../services/billingApi';
import { BillingType } from '../types';

// After (same relative paths work, but verify):
import { somethingFromBilling } from '../services/billingApi';
import { BillingType } from '../types';
```

**Step 3: Copy billing services**

```bash
cp -r src/modules/finance-billing/services/* \
      src/modules/billing/services/
```

**Step 4: Copy billing types**

```bash
cp -r src/modules/finance-billing/types/* \
      src/modules/billing/types/
```

**Step 5: Copy billing hooks**

```bash
cp -r src/modules/finance-billing/hooks/* \
      src/modules/billing/hooks/
```

**Step 6: Update module exports**

```typescript
// src/modules/billing/index.ts

export { billingManifest } from './manifest';

// Export migrated components (add as needed)
export { RecurringBillingForm } from './components/RecurringBillingForm';
export { BillingAnalytics } from './components/BillingAnalytics';
// ... other exports
```

**Step 7: Verify compiles**

```bash
npx tsc --noEmit
```

Expected: May have errors if components import from old module paths, fix in next step

**Step 8: Commit**

```bash
git add src/modules/billing/
git commit -m "feat(billing): migrate components from finance-billing

- Copy all billing components to new billing module
- Copy services, hooks, types
- Update module exports
- Part of PHASE 4: Finance consolidation"
```

---

### Task 4.4: Migrate Components from finance-fiscal/ to billing/

**Goal:** Copy fiscal-specific components into billing/, keeping "Fiscal" naming to distinguish.

**Files:**
- Copy: Components from `src/modules/finance-fiscal/components/` → `src/modules/billing/components/`
- Modify: Resolve naming conflicts

**Step 1: Copy fiscal components**

```bash
# Keep "Fiscal" prefix to distinguish from billing components
cp src/modules/finance-fiscal/components/FiscalDocumentForm.tsx \
   src/modules/billing/components/FiscalDocumentForm.tsx

cp src/modules/finance-fiscal/components/TaxCompliance.tsx \
   src/modules/billing/components/TaxCompliance.tsx

cp src/modules/finance-fiscal/components/AFIPIntegration.tsx \
   src/modules/billing/components/AFIPIntegration.tsx

# Copy all fiscal components
cp -r src/modules/finance-fiscal/components/* \
      src/modules/billing/components/
```

**Step 2: Check for naming conflicts**

```bash
# List all files, look for duplicates
ls -la src/modules/billing/components/
```

If duplicates exist (e.g., both modules have "InvoiceForm"), rename one:
```bash
# Example conflict resolution
mv src/modules/billing/components/InvoiceForm.tsx \
   src/modules/billing/components/FiscalInvoiceForm.tsx
```

**Step 3: Copy fiscal services**

```bash
cp -r src/modules/finance-fiscal/services/* \
      src/modules/billing/services/

# Check for conflicts
ls -la src/modules/billing/services/
```

Resolve conflicts if any (e.g., rename `taxCalculationService.ts` if it conflicts)

**Step 4: Copy fiscal types**

```bash
cp -r src/modules/finance-fiscal/types/* \
      src/modules/billing/types/

# Merge or namespace if conflicts
```

**Step 5: Update exports**

```typescript
// src/modules/billing/index.ts

// Add fiscal exports
export { FiscalDocumentForm } from './components/FiscalDocumentForm';
export { TaxCompliance } from './components/TaxCompliance';
export { AFIPIntegration } from './components/AFIPIntegration';
// ... other fiscal exports
```

**Step 6: Verify compiles**

```bash
npx tsc --noEmit
```

Fix any import errors in copied components

**Step 7: Commit**

```bash
git add src/modules/billing/
git commit -m "feat(billing): migrate components from finance-fiscal

- Copy all fiscal components to billing module
- Maintain 'Fiscal' naming to distinguish from billing features
- Copy fiscal services and types
- Resolve naming conflicts
- Part of PHASE 4: Finance consolidation"
```

---

### Task 4.5: Update Imports Across Codebase

**Goal:** Find all imports from old finance-billing/ and finance-fiscal/, point them to new billing/.

**Files:**
- Modify: All files importing from `@/modules/finance-billing` or `@/modules/finance-fiscal`

**Step 1: Find all finance-billing imports**

```bash
grep -r "from '@/modules/finance-billing" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*finance-billing" src/ --include="*.ts" --include="*.tsx"
```

**Step 2: Replace finance-billing imports**

```bash
# Global replace
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|from '@/modules/finance-billing|from '@/modules/billing|g" {} +

find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|from './finance-billing|from './billing|g" {} +

find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|from '../finance-billing|from '../billing|g" {} +
```

**Step 3: Find all finance-fiscal imports**

```bash
grep -r "from '@/modules/finance-fiscal" src/ --include="*.ts" --include="*.tsx"
```

**Step 4: Replace finance-fiscal imports**

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|from '@/modules/finance-fiscal|from '@/modules/billing|g" {} +

find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|from './finance-fiscal|from './billing|g" {} +

find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|from '../finance-fiscal|from '../billing|g" {} +
```

**Step 5: Update manifest references**

```bash
# Replace manifest names
grep -r "financeBillingManifest\|financeB illingManifest" src/ --include="*.ts" --include="*.tsx"
grep -r "financeFiscalManifest" src/ --include="*.ts" --include="*.tsx"

# Replace with billingManifest
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|financeBillingManifest|billingManifest|g" {} +

find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s|financeFiscalManifest|billingManifest|g" {} +
```

**Step 6: Update route references**

```bash
# Find old routes
grep -r "/admin/finance-billing\|/admin/finance/billing" src/ --include="*.ts" --include="*.tsx"
grep -r "/admin/finance-fiscal\|/admin/finance/fiscal" src/ --include="*.ts" --include="*.tsx"

# Should now all point to /admin/finance/billing
```

**Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: Should compile (or show reduced errors)

**Step 8: Commit**

```bash
git add -A
git commit -m "refactor(billing): update imports across codebase

- Replace all finance-billing imports with billing
- Replace all finance-fiscal imports with billing
- Update manifest references
- Update route references
- Part of PHASE 4: Finance consolidation"
```

---

### Task 4.6: Delete Old finance-billing/ and finance-fiscal/ Modules

**Goal:** Remove source modules after successful migration.

**Files:**
- Delete: `src/modules/finance-billing/`
- Delete: `src/modules/finance-fiscal/`
- Modify: `src/modules/index.ts` (remove old exports)

**Step 1: Verify billing/ module works**

```bash
npm run dev
```

Navigate to `/admin/finance/billing` - should work

**Step 2: Search for remaining imports (should be none)**

```bash
grep -r "finance-billing" src/ --include="*.ts" --include="*.tsx"
grep -r "finance-fiscal" src/ --include="*.ts" --include="*.tsx"
```

Expected: No results (all migrated)

**Step 3: Remove old module exports**

```typescript
// src/modules/index.ts

// Remove these lines:
// export { financeBillingManifest } from './finance-billing/manifest';
// export { financeFiscalManifest } from './finance-fiscal/manifest';

// Keep:
export { billingManifest } from './billing/manifest';
```

**Step 4: Delete old modules**

```bash
rm -rf src/modules/finance-billing/
rm -rf src/modules/finance-fiscal/
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 6: Test app**

```bash
npm run dev
```

Test billing functionality, verify no broken imports

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor(billing): delete old finance-billing and finance-fiscal modules

- Remove finance-billing/ directory
- Remove finance-fiscal/ directory
- Remove old module exports
- Migration to consolidated billing/ module complete
- Part of PHASE 4: Finance consolidation"
```

---

### Task 4.7: PHASE 4 Verification and Final Checkpoint

**Goal:** Verify Finance consolidation successful, count final modules.

**Step 1: Verify old modules deleted**

```bash
# Should all fail
ls src/modules/finance-billing/
ls src/modules/finance-fiscal/
ls src/modules/cash-management/  # renamed to accounting in PHASE 2
```

**Step 2: Verify new Finance structure**

```bash
ls -la src/modules/accounting/manifest.tsx
ls -la src/modules/billing/manifest.tsx
ls -la src/modules/payment-gateways/manifest.tsx
```

All three should exist

**Step 3: Count final module total**

```bash
find src/modules -name "manifest.tsx" -type f | wc -l
```

Expected: **25 modules** (or close, verify count)

**Step 4: List all domains**

```bash
grep -h "domain:" src/modules/*/manifest.tsx | sort | uniq
```

Expected domains:
- core
- sales-fulfillment (or sales & fulfillment)
- inventory
- finance
- people
- marketing

**Step 5: Generate final module list**

```bash
find src/modules -name "manifest.tsx" -exec dirname {} \; | \
  xargs -I {} basename {} | \
  sort > docs/temp/final-modules-list.txt

cat docs/temp/final-modules-list.txt
```

**Step 6: Test app thoroughly**

```bash
npm run dev
```

Navigate through app:
- Core modules (dashboard, settings, achievements, shift-control)
- Sales & Fulfillment (sales, storefront, production, delivery, shipping, onsite, pickup)
- Inventory (products, materials, suppliers, recipe, assets)
- Finance (accounting, billing, payment-gateways)
- People (staff, scheduling)
- Marketing (customers, loyalty, campaigns, social)

Verify no 404s, no module loading errors

**Step 7: Run tests (if any)**

```bash
npm run test
```

Document any failures (likely pre-existing)

**Step 8: Create final checkpoint commit**

```bash
git add -A
git commit -m "refactor(PHASE 4): complete Finance consolidation

Finance domain consolidated:
- finance-billing + finance-fiscal → billing/
- cash-management → accounting/ (done in PHASE 2)
- finance-integrations → payment-gateways/ (done in PHASE 2)

Finance modules: 6 → 3

Total modules: 31 → 25
Total domains: 9 → 7 (conceptually, may need domain registry update)

All phases complete. Module restructuring finished."
```

---

## POST-IMPLEMENTATION

### Task 5.1: Update Documentation

**Files:**
- Update: `README.md`
- Update: `docs/architecture/PROJECT_MODULE_TREE_CURRENT.md`
- Update: `CONTRIBUTING.md` (if has module info)

**Step 1: Update README module count**

```markdown
<!-- README.md -->

## Architecture

- **7 Domains**: Core, Sales & Fulfillment, Inventory, Finance, People, Marketing
- **25 Modules**: Modular business logic
- **88 Features**: Granular feature flags
- **12 Capabilities**: Business model selection
```

**Step 2: Update PROJECT_MODULE_TREE**

Replace content with new structure (copy from design doc):

```markdown
# Project Module Tree - Current State

**Fecha**: 2026-01-26
**Status**: ✅ Restructured Architecture
**Total Modules**: 25 (down from 31)
**Total Domains**: 7 (down from 9)

## 📊 Final Architecture

### 1. CORE (4 modules)
...

(Copy structure from design document)
```

**Step 3: Commit documentation updates**

```bash
git add README.md docs/architecture/PROJECT_MODULE_TREE_CURRENT.md
git commit -m "docs: update architecture documentation after restructuring

- Update module count: 31 → 25
- Update domain count: 9 → 7
- Refresh module tree documentation
- Post-implementation cleanup"
```

---

### Task 5.2: Clean Up Temporary Files

**Files:**
- Delete: `docs/temp/kitchen-audit.md`
- Delete: `docs/temp/memberships-audit.md`
- Delete: `docs/temp/analytics-modules-audit.md`
- Delete: `docs/temp/finance-consolidation-audit.md`
- Delete: `docs/temp/final-modules-list.txt`

**Step 1: Delete temp files**

```bash
rm docs/temp/*.md
rm docs/temp/*.txt
rmdir docs/temp/  # if empty
```

**Step 2: Commit cleanup**

```bash
git add -A
git commit -m "chore: clean up temporary audit files

Remove temporary files used during restructuring."
```

---

### Task 5.3: Final Validation

**Step 1: Run full build**

```bash
npm run build
```

Expected: Successful build

**Step 2: Run linter (may have pre-existing errors)**

```bash
npm run lint
```

Document any errors (likely pre-existing from initial commit failure)

**Step 3: Verify TypeScript strict mode**

```bash
npx tsc --noEmit --strict
```

Document any errors

**Step 4: Test production build**

```bash
npm run preview
```

Navigate through app in production mode

**Step 5: Create validation commit**

```bash
git add -A
git commit -m "test: validate restructured architecture

- Build successful
- TypeScript compiles
- Production preview works
- Module restructuring complete and validated"
```

---

## Merge Strategy

### Option A: Merge to Main (Recommended)

```bash
# From worktree
git checkout main
git merge refactor/module-restructuring --no-ff

# Resolve conflicts if any
# Test on main
npm run build
npm run dev

# Push
git push origin main
```

### Option B: Create Pull Request

```bash
# Push branch
git push origin refactor/module-restructuring

# Create PR via GitHub CLI
gh pr create --title "Refactor: Module Restructuring (31→25 modules, 9→7 domains)" \
             --body "$(cat docs/plans/2026-01-26-module-restructuring-design.md)"
```

---

## Rollback Plan

If something goes wrong:

```bash
# From main branch
git log --oneline -20  # Find commit before restructuring

# Create rollback branch
git checkout -b rollback/before-restructuring <commit-hash>

# Or hard reset (destructive, use with caution)
git reset --hard <commit-hash-before-restructuring>
```

---

## Success Metrics

After completion, verify:

- [x] Module count: 31 → 25 (19% reduction)
- [x] Domain count: 9 → 7 (22% reduction)
- [x] Ratio modules/domain: 2.7 → 3.6 (33% improvement in cohesion)
- [x] 0 duplications (staff/team merged)
- [x] 0 modules without metadata
- [x] TypeScript compiles without new errors
- [x] App runs and navigates correctly
- [x] All routes work (no 404s)
- [x] No broken imports
- [x] Finance consolidated (6 → 3 modules)
- [x] Analytics modules deleted (reporting, intelligence, executive)
- [x] Submodule antipattern eliminated (fulfillment/* promoted)

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| PHASE 1: ELIMINATE | 10 tasks | 4-6 hours |
| PHASE 2: RENOMBRAR | 6 tasks | 3-4 hours |
| PHASE 3: CREATE | 5 tasks | 2-3 hours |
| PHASE 4: CONSOLIDATE | 7 tasks | 3-4 hours |
| POST-IMPLEMENTATION | 3 tasks | 1-2 hours |
| **TOTAL** | **31 tasks** | **13-19 hours** |

**Recommended:** Split across 2-3 work sessions with breaks between phases.

---

## Notes for Engineer

- **Commit frequently**: After every task (or subtask if complex)
- **Test incrementally**: Don't wait until end to test
- **Use TypeScript**: Let compiler catch import errors early
- **Search before replace**: Use grep to find all references before mass sed
- **Back up audits**: Don't delete audit docs until merge complete
- **Ask questions**: If audit reveals unexpected code, clarify before deleting
- **Monitor git status**: Keep track of what's staged/unstaged

---

**Plan Complete**: Ready for execution via `superpowers:executing-plans` or `superpowers:subagent-driven-development`.
