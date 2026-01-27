# Store Architecture Analysis - src/store vs modules/*/store

## 🎯 Objective

Analyze Zustand stores distribution across the project and determine optimal organization following Screaming Architecture principles.

---

## 📊 Current State

### Store Locations (2 patterns)

#### 1. Central `src/store/` (16 stores)

```
src/store/
├── achievementsStore.ts
├── appStore.ts
├── assetsStore.ts
├── capabilityStore.ts
├── cashStore.ts
├── customersStore.ts
├── fiscalStore.ts
├── gamificationStore.ts
├── materialsStore.ts (⚠️ DEPRECATED)
├── operationsStore.ts
├── paymentsStore.ts
├── salesStore.ts
├── setupStore.ts
├── staffStore.ts
├── suppliersStore.ts
└── themeStore.ts
```

#### 2. Module-Specific `src/modules/*/store/` (3 stores)

```
src/modules/
├── materials/store/materialsStore.ts (✅ MODERN - 415 lines)
├── products/store/productsStore.ts (✅ UI-only - 97 lines)
└── shift-control/store/shiftStore.ts
```

---

## 🔍 Detailed Analysis

### Duplication Case: materialsStore

**Problem**: 2 versions exist

1. **`src/store/materialsStore.ts`** - 164 lines
   - Status: **@deprecated** (marked in code)
   - Purpose: Backward compatibility wrapper
   - Content: Legacy implementation + deprecation notice
   - Imports Active: ~13 (all in docs/old files)

2. **`src/modules/materials/store/materialsStore.ts`** - 415 lines
   - Status: **MODERN** (production version)
   - Purpose: UI state only (no server data - uses TanStack Query)
   - Pattern: Follows `ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md`
   - Imports Active: 18 files (all production code)

**Analysis**:
```typescript
// OLD (src/store/materialsStore.ts)
/**
 * @deprecated THIS STORE IS DEPRECATED
 * Use @/modules/materials/store instead
 * MIGRATION COMPLETED
 */

// NEW (src/modules/materials/store/materialsStore.ts)
/**
 * MATERIALS MODULE - UI STATE STORE
 * ⚠️ CRITICAL RULES:
 * - NO server data - Use TanStack Query
 * - ONLY UI state (modals, filters, selections)
 */
```

**Decision**: Remove `src/store/materialsStore.ts` (deprecated, migration complete)

---

### productsStore - No Duplication

**Location**: `src/modules/products/store/productsStore.ts` only
- ✅ No version in `src/store/` (good - already following module pattern)
- Pattern: UI-only store (filters, modals, selections)
- Lines: 97
- Usage: Products module components

---

### shiftStore - Module-Specific

**Location**: `src/modules/shift-control/store/shiftStore.ts` only
- ✅ No version in `src/store/`
- Pattern: Shift control module state
- Usage: Shift control components (no active usage found)

---

## 📊 Store Classification

### Category A: Cross-Cutting Infrastructure (Keep in `src/store/`)

**Rationale**: Used across many modules, not domain-specific

| Store | Lines | Used By | Pattern | Keep in src/store? |
|-------|-------|---------|---------|-------------------|
| **appStore** | ? | App.tsx, modules | Global app state (user, UI, network) | ✅ YES |
| **capabilityStore** | ? | 20+ files | Business DNA, capabilities (cross-cutting) | ✅ YES |
| **themeStore** | ? | ThemeToggle, theming | Global theming system | ✅ YES |
| **setupStore** | ? | Setup wizard | First-time setup state | ✅ YES |

**Why Keep**:
- Used by infrastructure/lib code
- Not tied to specific business domain
- Global concerns (auth, theme, capabilities)

---

### Category B: Domain-Specific (Should Move to modules/)

**Rationale**: Tied to specific business domains, should colocate with domain code

| Store | Domain | Should Move To | Reason |
|-------|--------|---------------|--------|
| **salesStore** | Sales/Operations | `modules/sales/store/` | Sales domain state |
| **customersStore** | CRM | `modules/crm/store/` | Customer management |
| **staffStore** | Resources | `modules/staff/store/` | Staff management |
| **suppliersStore** | Supply Chain | `modules/suppliers/store/` | Supplier management |
| **assetsStore** | Resources | `modules/assets/store/` | Asset tracking |
| **cashStore** | Finance | `modules/cash/store/` | Cash management |
| **paymentsStore** | Finance | `modules/payments/store/` | Payment processing |
| **fiscalStore** | Finance | `modules/fiscal/store/` | Fiscal/tax management |
| **operationsStore** | Operations | `modules/operations/store/` | Operations state |
| **achievementsStore** | Gamification | `modules/achievements/store/` | Achievement tracking |
| **gamificationStore** | Gamification | `modules/gamification/store/` | Gamification state |

**Why Move**:
- Domain-specific state
- Should follow Screaming Architecture
- Easier to find (folder name = functionality)
- Module ownership clarity

---

### Category C: Already Correct (No Action)

| Store | Location | Status |
|-------|----------|--------|
| productsStore | `modules/products/store/` | ✅ Already in module |
| materialsStore (new) | `modules/materials/store/` | ✅ Already in module |
| shiftStore | `modules/shift-control/store/` | ✅ Already in module |

---

## 🤔 Architectural Decision Analysis

### Option A: Move All Domain Stores to Modules (RECOMMENDED)

**Structure**:
```
src/store/
├── appStore.ts (global app state)
├── capabilityStore.ts (business DNA)
├── themeStore.ts (global theming)
└── setupStore.ts (onboarding)

src/modules/
├── sales/store/salesStore.ts
├── crm/store/customersStore.ts
├── staff/store/staffStore.ts
├── suppliers/store/suppliersStore.ts
├── assets/store/assetsStore.ts
├── cash/store/cashStore.ts
├── payments/store/paymentsStore.ts
├── fiscal/store/fiscalStore.ts
├── operations/store/operationsStore.ts
├── achievements/store/achievementsStore.ts
└── gamification/store/gamificationStore.ts
```

**Pros**:
- ✅ **Screaming Architecture**: folder name tells you what store does
- ✅ **Module Colocation**: store + hooks + components + services together
- ✅ **Clear Boundaries**: domain ownership obvious
- ✅ **Scalability**: easy to add new module stores
- ✅ **Consistency**: matches materials/products pattern

**Cons**:
- ⚠️ **Breaking Changes**: ~100+ imports to update
- ⚠️ **Migration Effort**: Need to update many files
- ⚠️ **Module Structure**: Need to create some missing module folders

**Impact**: High (many imports) but high value (better architecture)

---

### Option B: Keep Current Structure

**Pros**:
- ✅ No breaking changes
- ✅ All stores in one place (easy to find)

**Cons**:
- ❌ Violates Screaming Architecture
- ❌ Inconsistent with materials/products pattern
- ❌ No domain ownership clarity
- ❌ Mixed concerns (global + domain-specific)

**Impact**: Zero changes, but technical debt accumulates

---

### Option C: Hybrid Approach (Phase Migration)

**Phase 1**: Fix duplications + Move newest modules
- Remove deprecated `src/store/materialsStore.ts`
- Move stores for modules that already have module folders
- Keep others in `src/store/` temporarily

**Phase 2**: Create module structure + Move remaining stores
- Create missing module folders gradually
- Move stores as modules are refactored

**Pros**:
- ✅ Incremental migration (less risk)
- ✅ Can prioritize high-traffic stores
- ✅ Allows time for testing

**Cons**:
- ⚠️ Temporary inconsistency
- ⚠️ Takes longer to complete

---

## 📊 Import Impact Analysis

### materialsStore Migration (Already Done)

**Old Path**: `@/store/materialsStore`
**New Path**: `@/modules/materials/store`

**Active Imports**: 18 files (all production)
- pages/admin/supply-chain/materials/*.tsx (8 files)
- hooks/useMaterials*.ts (5 files)
- dashboard widgets (2 files)
- shared components (3 files)

**Status**: ✅ Migration complete, deprecated file remains for docs

---

### Estimated Impact for Full Migration

| Store | Estimated Active Imports | Module Exists? |
|-------|-------------------------|----------------|
| salesStore | ~15 | ⚠️ Partial (modules/sales/) |
| customersStore | ~10 | ❌ No (needs modules/crm/) |
| staffStore | ~8 | ✅ Yes (pages/admin/resources/staff/) |
| suppliersStore | ~6 | ✅ Yes (pages/admin/supply-chain/suppliers/) |
| assetsStore | ~5 | ✅ Yes (pages/admin/resources/assets/) |
| cashStore | ~12 | ⚠️ Partial (modules/cash/) |
| paymentsStore | ~8 | ⚠️ Partial (modules/payments/) |
| fiscalStore | ~10 | ✅ Yes (pages/admin/finance-fiscal/) |
| operationsStore | ~6 | ⚠️ Partial (modules/operations/) |
| achievementsStore | ~8 | ✅ Yes (modules/achievements/) |
| gamificationStore | ~5 | ✅ Yes (pages/admin/gamification/) |
| **TOTAL** | **~93 imports** | Mixed |

---

## 🎯 Recommendations

### Recommended: Option C (Phased Migration)

#### Phase 1: Cleanup + High-Impact Modules (Immediate)

**Actions**:

1. **Delete Deprecated materialsStore**
   ```powershell
   Remove-Item "src/store/materialsStore.ts"
   ```
   - Justification: Migration complete, all imports use new path
   - Impact: 0 (deprecated, no active production imports)

2. **Move Stores with Existing Module Structure**
   - cashStore → `modules/cash/store/`
   - achievementsStore → `modules/achievements/store/`
   - Move only if module folder already exists

**Estimated Time**: 2 hours  
**Risk**: Low (clean modules)

---

#### Phase 2: Create Module Structure (Next Sprint)

**Actions**:

1. **Create Missing Module Folders**
   ```
   modules/
   ├── crm/ (for customersStore)
   ├── suppliers/ (or use pages/admin/supply-chain/suppliers/)
   ├── fiscal/ (or use pages/admin/finance-fiscal/)
   └── operations/ (already exists, consolidate)
   ```

2. **Move Remaining Domain Stores**
   - Follow materialsStore pattern (UI-only, TanStack Query for data)
   - Create index.ts in each module/store/

**Estimated Time**: 1 week  
**Risk**: Medium (requires module refactoring)

---

#### Phase 3: Verification (After Phase 2)

**Actions**:

1. **Update All Imports**
   - PowerShell batch script (similar to services migration)
   - Pattern: `@/store/[name]Store` → `@/modules/[domain]/store`

2. **Verify TypeScript Compilation**
   ```powershell
   pnpm -s exec tsc --noEmit
   ```

3. **Update Documentation**
   - COPILOT_INSTRUCTIONS.md
   - Architecture docs

**Estimated Time**: 4 hours  
**Risk**: Low (automated + verified)

---

## 🚀 Phase 1 Migration Plan (Immediate)

### Step 1: Delete Deprecated materialsStore (5 min)

```powershell
# Verify no active imports (should be only docs)
rg "@/store/materialsStore" src/ --type ts --type tsx

# If safe, delete
Remove-Item "src/store/materialsStore.ts"
```

**Risk**: Very low (migration completed, file marked @deprecated)

---

### Step 2: Move cashStore to modules/ (30 min)

```powershell
# Check if modules/cash/store exists
Test-Path "src/modules/cash/store"

# If yes, move store
Move-Item "src/store/cashStore.ts" "src/modules/cash/store/"

# Update imports
$files = rg "@/store/cashStore" src/ --files-with-matches --type ts --type tsx
foreach ($file in $files) {
  (Get-Content $file -Raw) -replace '@/store/cashStore', '@/modules/cash/store' | Set-Content $file -NoNewline
}
```

**Risk**: Low (cash module already well-structured)

---

### Step 3: Move achievementsStore (30 min)

```powershell
# Check structure
Test-Path "src/modules/achievements"

# Move
Move-Item "src/store/achievementsStore.ts" "src/modules/achievements/store/"

# Update imports pattern
# @/store/achievementsStore → @/modules/achievements/store
```

**Risk**: Low (achievements module exists)

---

### Step 4: Verify TypeScript (2 min)

```powershell
pnpm -s exec tsc --noEmit
```

---

## 📝 Store Organization Principles

### Guiding Rules

1. **Infrastructure Stores** → `src/store/`
   - appStore (global app state)
   - capabilityStore (business capabilities)
   - themeStore (global theming)
   - setupStore (onboarding wizard)

2. **Domain Stores** → `src/modules/[domain]/store/`
   - Business domain state
   - UI-only (no server data - use TanStack Query)
   - Colocated with domain logic

3. **Store Pattern**:
   ```typescript
   // ✅ CORRECT: UI state only
   export interface ModuleStore {
     // UI State
     filters: Filters;
     selectedIds: string[];
     viewMode: ViewMode;
     isModalOpen: boolean;
     
     // Actions (synchronous)
     setFilters: (filters: Filters) => void;
     toggleModal: () => void;
   }
   
   // ❌ WRONG: Server data in store
   export interface ModuleStore {
     items: Item[]; // NO - use TanStack Query
     isLoading: boolean; // NO - Query handles this
   }
   ```

4. **Naming Convention**:
   - File: `[domain]Store.ts` (camelCase + Store suffix)
   - Hook: `use[Domain]Store` (exported function)
   - Example: `salesStore.ts` exports `useSalesStore`

---

## 📊 Success Metrics

**Phase 1 Complete When**:
- ✅ Deprecated materialsStore deleted
- ✅ cashStore + achievementsStore moved to modules/
- ✅ TypeScript compilation passes
- ✅ All tests pass
- ✅ Documentation updated

**Phase 2 Complete When**:
- ✅ All domain stores in modules/
- ✅ Only infrastructure stores in src/store/
- ✅ Consistent module structure across codebase
- ✅ Screaming Architecture achieved

---

## 🔍 Decision Matrix

| Criterion | Option A (Move All) | Option B (Keep Current) | **Option C (Phased)** |
|-----------|---------------------|-------------------------|-----------------------|
| Screaming Architecture | ✅✅ Full | ❌ Violated | ✅ Eventually |
| Breaking Changes | ⚠️ ~93 imports | ✅ None | ⚠️ Incremental |
| Consistency | ✅ Perfect | ❌ Mixed | ⚠️ Temporary mixed |
| Risk Level | ⚠️ High | ✅ None | ✅ Low |
| Time to Complete | ⚠️ 2 weeks | ✅ 0 | **✅ 1 week phased** |
| Technical Debt | ✅ Eliminated | ❌ Accumulates | ✅ Reduced |

**Winner**: Option C (Phased Migration) - Best balance of safety, progress, and architectural improvement

---

## 📋 Summary

### Current Issues
- ❌ Stores scattered between `src/store/` and `modules/*/store/`
- ❌ Deprecated materialsStore still exists (migration complete)
- ❌ Domain stores in central location (violates Screaming Architecture)
- ❌ Inconsistent patterns (materials/products in modules, others in store/)

### Proposed Solution
- ✅ **Phase 1** (Immediate): Delete deprecated, move 2-3 stores with existing modules
- ✅ **Phase 2** (Next Sprint): Create module structure, move remaining stores
- ✅ **Result**: Infrastructure stores in `src/store/`, domain stores in `modules/*/store/`
- ✅ **Benefits**: Screaming Architecture, module colocation, clear boundaries

### Next Steps
1. Delete `src/store/materialsStore.ts` (deprecated)
2. Move cashStore + achievementsStore to modules/
3. Verify TypeScript + tests
4. Plan Phase 2 module creation

---

*Analysis Date: 2025-12-30*  
*Stores Analyzed: 19 total (16 in src/store, 3 in modules)*  
*Migration Impact: ~93 imports to update (phased approach)*
