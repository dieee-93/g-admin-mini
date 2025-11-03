# 🚀 PHASE 3 - P0 CORE OPERATIONS MODULES

**Date**: 2025-02-01
**Phase**: Phase 3 - Expand to Remaining Modules (P0 - Core Operations)
**Prerequisites**: Phase 1 (Pilot Modules) ✅ COMPLETE | Phase 2 (Permissions) ✅ COMPLETE

---

## 📋 OBJECTIVE

Make **3 P0 modules** production-ready following the same process as pilot modules (Materials, Sales, Production).

**P0 Modules (Core Operations)**:
1. **Dashboard** - Central dashboard (auto-install, already active)
2. **Fulfillment** - Fulfillment operations (onsite/pickup/delivery)
3. **Customers** - CRM foundation

---

## ✅ PRODUCTION-READY CRITERIA (10 ITEMS)

A module is **production-ready** when:

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules pattern
2. ✅ **Scaffolding ordered**: Clean folder structure (components/, services/, hooks/, types.ts)
3. ✅ **Zero errors**: 0 lint errors, 0 TypeScript errors IN THAT MODULE
4. ✅ **UI complete**: All views/components working, no unused components
5. ✅ **Cross-module mapped**: Relationships documented (provides/consumes)
6. ✅ **Zero duplication**: No repeated logic within or across modules
7. ✅ **DB connected**: All CRUD operations working via service layer
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: Role-based access defined (minimumRole + usePermissions)
10. ✅ **README**: Module README with cross-module integration docs

---

## 🏗️ PROJECT ARCHITECTURE REFERENCE

### Capabilities → Features → Modules System

**Three-Layer Architecture**:
1. **Capabilities** (User-facing): What the business can do
   - Example: `onsite_service`, `delivery_shipping`, `production_workflow`, `b2b_sales`

2. **Features** (System-level): 81 granular features auto-activated by capabilities
   - Defined in: `src/config/FeatureRegistry.ts`

3. **Modules** (UI-level): 27 modules shown based on active features
   - Manifests in: `src/modules/[module]/manifest.tsx`
   - Navigation via: `getModulesForActiveFeatures()` in FeatureRegistry

### Module Registry System (WordPress-inspired)

**Hook System**:
```typescript
// In module manifest setup
registry.addAction('dashboard.widgets', () => <MyWidget />, 'moduleId', priority);

// In page component
<HookPoint name="dashboard.widgets" data={{...}} fallback={<NoData />} />
```

**Module Manifest Structure**:
```typescript
export const moduleManifest: ModuleManifest = {
  id: 'module-name',
  name: 'Module Display Name',
  version: '1.0.0',

  depends: ['dependency1', 'dependency2'], // Other modules
  autoInstall: false, // Auto-activate when dependencies active

  requiredFeatures: ['feature_id'] as FeatureId[],
  optionalFeatures: ['optional_feature'] as FeatureId[],

  // 🔒 PERMISSIONS
  minimumRole: 'OPERADOR' as const, // CLIENTE | OPERADOR | SUPERVISOR | ADMINISTRADOR | SUPER_ADMIN

  hooks: {
    provide: ['hook.point.name'], // Hooks this module PROVIDES
    consume: ['other.hook.name'], // Hooks this module CONSUMES
  },

  setup: async (registry) => {
    // Register hook handlers
    registry.addAction('hook.point.name', (data) => <Component />, 'moduleId', priority);
  },

  teardown: async () => {
    // Cleanup
  },

  exports: {
    // Public API for other modules
  },

  metadata: {
    category: 'business', // business | analytics | settings
    description: 'Module description',
    navigation: {
      route: '/admin/domain/module',
      icon: IconComponent,
      color: 'blue',
      domain: 'domain-name',
      isExpandable: false
    }
  }
};
```

### Permission System (Extended System A)

**Files**:
- `src/config/PermissionsRegistry.ts` - Permission matrix (RBAC)
- `src/hooks/usePermissions.ts` - Component-level hook
- `src/lib/permissions/servicePermissions.ts` - Service layer validation
- `src/contexts/AuthContext.tsx` - Extended with permission methods

**Roles** (Generic business roles):
- `CLIENTE` - Customer portal access
- `OPERADOR` - Daily operations (POS, inventory)
- `SUPERVISOR` - Operational management (reports, staff)
- `ADMINISTRADOR` - Full business control (settings, finance)
- `SUPER_ADMIN` - System administration (debug, dev tools)

**Permission Actions**:
- `create`, `read`, `update`, `delete` (CRUD)
- `void` - Cancel/void transactions
- `approve` - Approve requests
- `configure` - System configuration
- `export` - Data export

**Usage in Pages**:
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const { canCreate, canUpdate, canDelete, canConfigure } = usePermissions('module-name');

return (
  <>
    {canCreate && <Button>Add New</Button>}
    {canConfigure && <Button>Settings</Button>}
  </>
);
```

**Usage in Services**:
```typescript
import { requirePermission, requireModuleAccess } from '@/lib/permissions';

export const createItem = async (data: Item, user: AuthUser) => {
  // Validate permission
  requirePermission(user, 'module-name', 'create');

  // Proceed with operation
  return supabase.from('table').insert(data);
};
```

### EventBus v2 Enterprise

**Event Patterns** (domain.entity.action):
```typescript
// Sales events
'sales.order.placed'
'sales.order.completed'
'sales.order.cancelled'

// Production events (formerly kitchen)
'production.order.created'
'production.order.completed'

// Fulfillment events (formerly floor)
'fulfillment.onsite.order_ready'
'fulfillment.pickup.ready'
'fulfillment.delivery.driver_assigned'

// Materials events
'materials.stock.updated'
'materials.stock.low_alert'

// Staff events
'staff.driver.available'
'staff.driver.location_update'
```

**Module Integration**:
```typescript
// In module setup
EventBus.emit('module.entity.action', { data }, { priority: EventPriority.HIGH });

// Subscribe in manifest
eventBus.subscribe('other.module.*', (event) => {
  // Handle event
}, { moduleId: 'your-module', priority: 100 });
```

### UI Component System

**CRITICAL**: Always import from `@/shared/ui`, NEVER from `@chakra-ui/react`:

```typescript
// ✅ CORRECT
import { Stack, Button, Text, ContentLayout, Section } from '@/shared/ui';

// ❌ WRONG - Will cause prop mismatches
import { Stack, Button } from '@chakra-ui/react';
```

**Page Layout Pattern**:
```typescript
import { ContentLayout, Section, SkipLink } from '@/shared/ui';

export default function ModulePage() {
  return (
    <>
      <SkipLink /> {/* Accessibility - WCAG 2.4.1 */}

      <ContentLayout spacing="normal" mainLabel="Module Name">
        <Section
          variant="flat"
          title="Section Title"
          subtitle="Section description"
          semanticHeading="Accessible heading"
          actions={<Button>Action</Button>}
        >
          {/* Content */}
        </Section>
      </ContentLayout>
    </>
  );
}
```

### State Management (Zustand v5)

**CRITICAL Performance Pattern**:
```typescript
import { useShallow } from 'zustand/react/shallow';

// ❌ WRONG - Creates new array reference every render
const items = useStore(state => state.items || []);

// ✅ CORRECT - Use useShallow for arrays/objects
const items = useStore(useShallow(state => state.items || EMPTY_ARRAY));
```

**Store Pattern**:
```typescript
// src/store/moduleStore.ts
export const useModuleStore = create<ModuleState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchItems: async () => {
        set({ loading: true });
        const data = await moduleApi.getItems();
        set({ items: data, loading: false });
      },
    }),
    { name: 'module-store' }
  )
);
```

---

## 🎯 WORKFLOW PER MODULE (4-5 HOURS)

### 1. Audit (30 min)
- Read current module manifest
- Read page component
- Identify ESLint errors in module files
- Identify TypeScript errors
- Map features & cross-module relationships
- Document findings

### 2. Fix Structure (1 hour)
- Fix manifest (dependencies, hooks, minimumRole)
- Fix ESLint errors in module files
- Fix TypeScript errors
- Remove unused components
- Fix anti-patterns (direct imports → hooks)
- Organize folder structure (components/, services/, hooks/, types.ts)

### 3. Database & Functionality (1-2 hours)
- Verify service layer exists
- Test all CRUD operations
- Test all buttons/actions
- Replace placeholders with real functionality
- Verify Supabase integration
- Test offline-first if applicable

### 4. Cross-Module Integration (1 hour)
- Create/update module README
- Document provides/consumes hooks
- Test hook interactions
- Verify EventBus events
- Test navigation between modules
- Verify HookPoint components

### 5. Validation (30 min)
- Run through production-ready checklist (10 items)
- End-to-end test workflow
- Verify 0 ESLint errors in module
- Verify 0 TypeScript errors in module
- Mark module as production-ready

---

## 📦 MODULE DETAILS

### Module 1: Dashboard

**Manifest**: `src/modules/dashboard/manifest.tsx`
**Page**: `src/pages/admin/core/dashboard/page.tsx`
**Store**: `src/store/appStore.ts` (or create dashboardStore)

**Current Status**:
- ✅ Auto-install enabled
- ✅ minimumRole: 'OPERADOR'
- ⚠️ Needs audit for ESLint/TS errors
- ⚠️ Verify widget system (HookPoints)

**Key Features**:
- Dashboard widgets from all modules
- Business metrics aggregation
- Quick actions
- Alerts summary

**Hooks**:
- PROVIDES: `dashboard.widgets`, `dashboard.quick_actions`
- CONSUMES: `sales.metrics`, `materials.stock_status`, `staff.performance`

**Dependencies**: None (aggregates from all)

---

### Module 2: Fulfillment

**Manifest**: `src/modules/fulfillment/manifest.tsx`
**Page**: `src/pages/admin/operations/fulfillment/` (onsite/pickup/delivery)

**Current Status**:
- ⚠️ New module (replaced Floor)
- ✅ minimumRole: 'OPERADOR'
- ⚠️ Needs full implementation audit

**Key Features** (3 sub-modes):
1. **Onsite** (formerly Floor):
   - Table management
   - Floor plan
   - Waitlist

2. **Pickup**:
   - Time slot scheduling
   - Pickup queue
   - Ready notifications

3. **Delivery**:
   - Delivery zones
   - Driver assignment
   - GPS tracking

**Hooks**:
- PROVIDES: `fulfillment.order_ready`, `fulfillment.toolbar.actions`
- CONSUMES: `sales.order_placed`, `production.order_ready`

**Dependencies**: ['sales', 'staff', 'materials']

**Database Tables**:
- `fulfillment_queue`
- `pickup_time_slots`
- `delivery_assignments`
- `delivery_zones`
- `driver_locations`

---

### Module 3: Customers

**Manifest**: `src/modules/customers/manifest.tsx`
**Page**: `src/pages/admin/core/crm/customers/page.tsx`

**Current Status**:
- ✅ minimumRole: 'OPERADOR'
- ⚠️ Needs audit for ESLint/TS errors
- ⚠️ Verify CRM features

**Key Features**:
- Customer CRUD
- Order history
- RFM analysis (Recency, Frequency, Monetary)
- Customer segments
- Tags system
- Notes

**Hooks**:
- PROVIDES: `customers.profile_sections`, `customers.customer_created`
- CONSUMES: `sales.order_completed`, `billing.payment_received`

**Dependencies**: None (foundation)

**Database Tables**:
- `customers`
- `customer_notes`
- `customer_tags`

---

## 🔧 COMMANDS REFERENCE

### Code Quality
```bash
pnpm -s exec eslint .                # Check all ESLint errors
pnpm -s exec eslint src/modules/dashboard/  # Check specific module
pnpm -s exec tsc --noEmit            # Check TypeScript errors
```

### Development
```bash
pnpm dev                             # Start dev server (if not running)
pnpm build                           # Test production build
```

### Testing
```bash
pnpm test:run                        # Run all tests
vitest run path/to/test.test.ts     # Run specific test
```

---

## ⚠️ CRITICAL ANTI-PATTERNS TO AVOID

1. ❌ **Direct Chakra imports** - Use `@/shared/ui` wrappers
2. ❌ **Duplicate ErrorBoundary/ResponsiveLayout** - Already in App.tsx
3. ❌ **Direct module imports** - Use Module Registry and HookPoints
4. ❌ **Hardcoded permissions** - Use `usePermissions` hook
5. ❌ **Float arithmetic for money** - Use Decimal.js
6. ❌ **Zustand selectors without useShallow** - Causes re-renders
7. ❌ **Creating extensive docs** - Code + README = documentation
8. ❌ **Skipping TypeScript checks** - Always run `tsc --noEmit`

---

## 📚 REFERENCE IMPLEMENTATIONS

**Pilot Modules (Production-Ready)**:
- `src/pages/admin/supply-chain/materials/` - Materials module
- `src/pages/admin/operations/sales/` - Sales module
- `src/pages/admin/operations/production/` - Production module

**Study these for**:
- Folder structure (components/, services/, hooks/, types.ts)
- Permission integration (usePermissions + service layer)
- Cross-module integration (HookPoints + EventBus)
- README documentation
- Form patterns (react-hook-form + Zod)

---

## 🎯 SUCCESS CRITERIA

### Per Module
- [ ] 0 ESLint errors in module files
- [ ] 0 TypeScript errors in module files
- [ ] All 10 production-ready criteria met
- [ ] README created/updated with cross-module docs
- [ ] Permissions integrated (minimumRole + usePermissions)
- [ ] Service layer validated
- [ ] Cross-module relationships documented

### Overall Phase 3 P0
- [ ] 3 modules production-ready
- [ ] Dashboard widgets system working
- [ ] Fulfillment workflows tested (onsite/pickup/delivery)
- [ ] Customers CRM fully functional
- [ ] 0 regressions in pilot modules (Materials, Sales, Production)

---

## 🚀 EXECUTION NOTES

**Recommended Order**:
1. **Dashboard** (simplest - aggregator, no CRUD)
2. **Customers** (foundation - CRM, other modules depend on it)
3. **Fulfillment** (complex - 3 sub-modes, requires DB audit)

**Estimated Time**: 12-15 hours total (4-5 hours per module)

**Tools**:
- TodoWrite for task tracking
- Read tool for code audit
- Edit tool for fixes
- Bash for ESLint/TypeScript checks

**Documentation**:
- Create/update README in each module folder
- Document provides/consumes hooks
- Document database tables
- Document permission requirements

---

## 📖 ESSENTIAL FILES TO READ FIRST

1. `CLAUDE.md` - Project architecture overview
2. `PRODUCTION_PLAN.md` - Production readiness plan
3. `src/modules/ARCHITECTURE.md` - Module system architecture
4. `src/config/FeatureRegistry.ts` - Feature definitions
5. `src/config/PermissionsRegistry.ts` - Permission matrix
6. Pilot module READMEs (Materials, Sales, Production)

---

**Status**: 🟢 READY TO START
**Last Updated**: 2025-02-01
**Phase**: Phase 3 P0 - Core Operations Modules
