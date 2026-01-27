# Kitchen Module Audit - Task 1.1

**Date**: 2026-01-26
**Module Path**: `src/modules/production/kitchen/`
**Purpose**: Audit kitchen module before deletion, identify reusable code

---

## Executive Summary

The kitchen module contains **1 file** - a manifest-only module with NO separate components, services, or UI code to migrate. All hook implementations are inline within the manifest setup function.

**Decision**: DELETE (no migration needed - functionality already exists in production page)

---

## Files Found

```
src/modules/production/kitchen/manifest.tsx (508 lines)
```

**Total**: 1 file

---

## Detailed Analysis

### manifest.tsx (508 lines)

**Type**: Link Module (Integration Pattern)
**Status**: DISABLED in src/modules/index.ts (line 68)
**Dependencies**: sales, materials

#### Purpose
Demonstrates the "Link Module" pattern (Odoo-inspired):
- Auto-installs when dependencies (sales + materials) are active
- Bridges functionality between sales and materials modules
- Provides Kitchen Display System (KDS) integration

#### Hook Points Provided
1. `kitchen.order_ready` - Order preparation complete
2. `kitchen.display.orders` - KDS order list
3. `kitchen.ingredient_check` - Ingredient availability
4. `dashboard.widgets` - Kitchen performance widget (DISABLED, needs React conversion)

#### Hook Points Consumed
1. `sales.order_placed` - Listen to new orders
2. `materials.stock_updated` - Track ingredient stock
3. `materials.row.actions` - Add kitchen-specific actions
4. `calendar.events` - Add production blocks to calendar
5. `scheduling.toolbar.actions` - Add kitchen capacity button

#### Exports (API)
- `canPrepareOrder(orderId)` - Check ingredient availability
- `getKitchenQueue()` - Get current kitchen queue
- `markOrderReady(orderId)` - Mark order as ready

---

## Migration Analysis

### Components to Migrate: NONE

**Reason**:
- Kitchen module has NO separate component files
- All hooks are inline functions in manifest.tsx
- `KitchenDisplaySystem` component already exists at `src/pages/admin/operations/production/components/KitchenDisplay.tsx`

### Services to Migrate: NONE

**Reason**:
- No separate service files exist
- API exports are stub implementations (return mock data)
- Production page (`src/pages/admin/operations/production/page.tsx`) already has working KDS implementation

### Hook Implementations to Consider

| Hook | Action Required | Notes |
|------|----------------|-------|
| `materials.row.actions` | ✅ KEEP IN PRODUCTION | Adds "Check Recipe Availability" button to materials grid |
| `calendar.events` | ✅ KEEP IN PRODUCTION | Shows production schedule blocks (Pan dulce, Empanadas example) |
| `scheduling.toolbar.actions` | ✅ KEEP IN PRODUCTION | "Kitchen Capacity" button in scheduling toolbar |
| `kitchen.display.orders` | ❌ DELETE | Returns mock data, not used |
| `dashboard.widgets` | ❌ DELETE | Disabled (line 168), needs React conversion |

**Migration Path for Hooks**:
The 3 useful hooks should be migrated to `src/modules/production/manifest.tsx` in Task 1.2. They are small inline functions that extend other modules' UI.

---

## Current Status in Codebase

### Module Registration
- **DISABLED** in `src/modules/index.ts` (lines 68, 196, 240)
- Import commented out: `// import { kitchenManifest } from './production/kitchen/manifest';`

### Production Page
- Working KDS implementation exists at `src/pages/admin/operations/production/page.tsx`
- Uses `KitchenDisplaySystem` component from `./components/KitchenDisplay`
- Reads from `useSalesStore` and transforms sales to kitchen orders
- NO dependency on kitchen module

### References in Docs
- Multiple migration plan docs reference kitchen → production rename
- Planning docs show kitchen module as deprecated
- No active code imports from kitchen module

---

## Decision Matrix

| Item | Migrate? | Delete? | Reason |
|------|----------|---------|--------|
| **manifest.tsx** | ❌ | ✅ | Main manifest - will be deleted |
| Hook: `materials.row.actions` | ✅ → production | - | Useful: adds recipe check button |
| Hook: `calendar.events` | ✅ → production | - | Useful: production schedule display |
| Hook: `scheduling.toolbar.actions` | ✅ → production | - | Useful: kitchen capacity button |
| Hook: `kitchen.display.orders` | - | ✅ | Mock data only, unused |
| Hook: `dashboard.widgets` | - | ✅ | Disabled, needs refactor |
| API: `canPrepareOrder` | - | ✅ | Stub implementation only |
| API: `getKitchenQueue` | - | ✅ | Returns empty mock data |
| API: `markOrderReady` | - | ✅ | Stub implementation only |

---

## Final Decision: DELETE MODULE

### Rationale

1. **No standalone functionality**: All hook implementations are 5-20 line inline functions
2. **Production page is independent**: Working KDS exists without this module
3. **Module already disabled**: Commented out in module registry since unknown date
4. **APIs are stubs**: All exported functions return mock data
5. **3 useful hooks**: Can be migrated to production manifest in 5 minutes (Task 1.2)

### Migration Path (Task 1.2)

Copy these 3 hook implementations to `src/modules/production/manifest.tsx`:

1. **materials.row.actions** (lines 178-195)
   - Adds "Check Recipe Availability" button to materials grid
   - 18 lines of code

2. **calendar.events** (lines 253-295)
   - Displays production schedule blocks (Pan dulce, Empanadas)
   - 43 lines of JSX

3. **scheduling.toolbar.actions** (lines 307-340)
   - "Kitchen Capacity" button in scheduling toolbar
   - 34 lines of JSX

**Total migration effort**: ~95 lines of code, mostly JSX and logging

---

## Risk Assessment

**Deletion Risk**: ✅ LOW

- Module already disabled in production
- No imports found in codebase (`grep -r "from.*production/kitchen"` returns only commented line)
- Production page works independently
- Hooks are standalone UI extensions (no complex business logic)

**Migration Risk**: ✅ LOW

- Small, self-contained hook implementations
- No external dependencies beyond registry and logger
- JSX is simple (buttons, badges, stacks)
- Can be tested independently via HookPoint system

---

## Next Steps (Task 1.2)

1. Create backup of 3 useful hooks (lines 178-195, 253-295, 307-340)
2. Add hooks to `src/modules/production/manifest.tsx` setup function
3. Test hooks appear in materials grid, calendar, and scheduling toolbar
4. Proceed to Task 1.3 (delete kitchen/ directory)

---

## Additional Notes

### Link Module Pattern Validation

This module is an excellent example of the Link Module pattern:
- ✅ Depends on 2+ modules (sales, materials)
- ✅ Category: 'integration'
- ✅ Metadata.links: ['sales', 'materials']
- ✅ Auto-activation via `activatedBy: 'sales_order_management'`

However, the pattern is **underutilized**:
- Most hooks consume but don't integrate data from both dependencies
- APIs are stubs that don't call dependency exports
- No real cross-module data enrichment occurs

### Recommendation for Production Module

When migrating hooks, consider:
- Renaming "kitchen" → "production" in hook names and labels
- Implementing real API functions if KDS queue management is needed
- Using EventBus for `production.order_ready` events
- Connecting hooks to real production schedule data

---

**Audit Completed**: 2026-01-26
**Auditor**: Claude Code Assistant
**Conclusion**: SAFE TO DELETE after migrating 3 useful hooks (~95 LOC)
