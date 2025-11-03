# 🎯 DASHBOARD MODULE - Production Ready

**Module**: Dashboard (Central Dashboard)
**Phase**: Phase 3 P0 - Module 1/3
**Estimated Time**: 4 hours
**Priority**: P0 (Simplest - aggregator, no CRUD)

---

 Recuerda Por favorno desactivar warning con las cetiquetas eslint disable, en el caso de los type any deben ser reemplazado por su correspondiente tipo, si no existe debe ser creado en el
  archivo types correspondiente al modulo que sea el type, por otro lado para los unused import, revisar si el archivo posee logica que falte implementar aun, en el caso de ser compleja la
  implementacion faltante deja un todo para completar luego, si no es compleja implementala en el momento 
## 📋 OBJECTIVE

Make the **Dashboard module** production-ready following the 10-criteria checklist.

**Why this module first**: Simplest P0 module - it's an aggregator that consumes widgets from other modules, no CRUD operations.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/, hooks/, types.ts organized
3. ✅ **Zero errors**: 0 ESLint + 0 TypeScript errors in module
4. ✅ **UI complete**: All widgets working, no unused components
5. ✅ **Cross-module mapped**: README documents provides/consumes
6. ✅ **Zero duplication**: No repeated logic
7. ✅ **DB connected**: N/A (aggregator only)
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: minimumRole + usePermissions
10. ✅ **README**: Cross-module integration documented

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/dashboard/manifest.tsx`
- **Page**: `src/pages/admin/core/dashboard/page.tsx`
- **Store**: `src/store/appStore.ts` (if needed, or create dashboardStore.ts)

### Current Structure
```
src/pages/admin/core/dashboard/
├── page.tsx                          # Main dashboard page
├── components/
│   ├── widgets/                      # Dashboard widgets
│   │   ├── SalesWidget.tsx
│   │   ├── InventoryWidget.tsx
│   │   ├── StaffWidget.tsx
│   │   ├── CustomersWidget.tsx
│   │   ├── ProductsWidget.tsx
│   │   ├── RevenueWidget.tsx
│   │   ├── TablesWidget.tsx
│   │   ├── SchedulingWidget.tsx
│   │   ├── TrendsWidget.tsx
│   │   ├── ProductionWidget.tsx
│   │   └── MilestoneTracker.tsx
│   ├── DashboardGrid.tsx             # Grid layout
│   ├── DynamicDashboardGrid.tsx      # Dynamic widget loading
│   ├── AlertsView.tsx                # Alerts aggregation
│   ├── AchievementsWidget.tsx        # Gamification
│   ├── RecipeIntelligenceDashboard.tsx
│   └── CrossModuleInsights.tsx       # Cross-module analytics
├── hooks/
│   ├── useDashboardConfig.ts         # Dashboard configuration
│   └── useDynamicDashboardWidgets.ts # Widget loading logic
├── types/
│   ├── analytics.ts                  # Analytics types
│   └── index.ts                      # Type exports
└── data/
    └── mockData.ts                   # Mock data (development)
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `dashboard`
- ✅ minimumRole: `OPERADOR` (already set)
- ✅ autoInstall: `true` (always active)
- ✅ No dependencies (foundation module)

**Hooks**:
- **PROVIDES**:
  - `dashboard.widgets` - Main hook for dashboard widgets
  - `dashboard.kpi_cards` - Quick KPI cards at top
  - `dashboard.charts` - Chart widgets
  - `dashboard.quick_actions` - Quick action buttons

- **CONSUMES**:
  - `sales.metrics` - Sales metrics
  - `materials.stock_status` - Inventory status
  - `staff.attendance` - Staff attendance
  - `scheduling.today_shifts` - Today's shifts
  - `finance.pending_invoices` - Pending invoices

### Key Features
1. **Widget System**: Aggregates widgets from all modules via HookPoints
2. **Cross-Module Analytics**: Combines data from multiple sources
3. **Role-Based Views**: Different dashboards per role
4. **Quick Actions**: Fast access to common operations
5. **Alerts Aggregation**: Shows alerts from all modules

---

## 🎯 WORKFLOW (4 HOURS)

### 1️⃣ AUDIT (30 min)

**Tasks**:
- [ ] Read `src/modules/dashboard/manifest.tsx` (verify hooks, dependencies)
- [ ] Read `src/pages/admin/core/dashboard/page.tsx` (main component)
- [ ] Check ESLint errors: `pnpm -s exec eslint src/pages/admin/core/dashboard/`
- [ ] Check TypeScript errors: `pnpm -s exec tsc --noEmit`
- [ ] List all widget components in `components/widgets/`
- [ ] Verify HookPoint usage for widget loading
- [ ] Document current state

**Questions to Answer**:
- How many widgets exist?
- Are all widgets using HookPoints or direct imports?
- Are there unused widget components?
- What ESLint/TS errors exist?
- Is permission system integrated?

---

### 2️⃣ FIX STRUCTURE (1 hour)

**Tasks**:
- [ ] Fix ESLint errors in dashboard files
- [ ] Fix TypeScript errors in dashboard files
- [ ] Remove unused widgets (if any)
- [ ] Verify manifest hooks are correct
- [ ] Ensure widgets use `@/shared/ui` (not direct Chakra imports)
- [ ] Organize imports (group by type: React, UI, hooks, types)
- [ ] Add permission checks with `usePermissions('dashboard')`

**Manifest Validation**:
```typescript
// Verify this structure in manifest.tsx
hooks: {
  provide: [
    'dashboard.widgets',
    'dashboard.kpi_cards',
    'dashboard.charts',
    'dashboard.quick_actions',
  ],
  consume: [
    'sales.metrics',
    'materials.stock_status',
    'staff.attendance',
    'scheduling.today_shifts',
    'finance.pending_invoices',
  ],
}
```

**Permission Integration**:
```typescript
// In page.tsx
import { usePermissions } from '@/hooks/usePermissions';

const { canRead, canConfigure } = usePermissions('dashboard');

// Conditional rendering
{canRead && <DashboardGrid widgets={widgets} />}
{canConfigure && <Button>Customize Dashboard</Button>}
```

---

### 3️⃣ WIDGET SYSTEM VALIDATION (1.5 hours)

**Tasks**:
- [ ] Verify HookPoint implementation for widgets
- [ ] Test widget loading from other modules
- [ ] Ensure widgets handle empty/loading states
- [ ] Verify widgets use proper Chakra v3 components
- [ ] Test role-based widget visibility
- [ ] Verify widgets emit/consume correct events

**HookPoint Pattern**:
```typescript
// In page.tsx - consume widgets from other modules
<HookPoint
  name="dashboard.widgets"
  data={{ userId: user?.id }}
  fallback={<EmptyState />}
  direction="row"
  gap="4"
/>
```

**Widget Checklist** (for each widget):
- [ ] Uses `@/shared/ui` imports (not direct Chakra)
- [ ] Has loading state
- [ ] Has empty state
- [ ] Has error boundary
- [ ] Responsive design (mobile-friendly)
- [ ] Proper TypeScript types
- [ ] No ESLint errors

---

### 4️⃣ CROSS-MODULE INTEGRATION (1 hour)

**Tasks**:
- [ ] Create `src/pages/admin/core/dashboard/README.md`
- [ ] Document all provided hooks
- [ ] Document all consumed hooks
- [ ] Document how to add new widgets (example)
- [ ] Document permission requirements
- [ ] Test widget loading from pilot modules (Materials, Sales, Production)
- [ ] Verify EventBus integration for real-time updates

**README Template**:
```markdown
# Dashboard Module

Central dashboard aggregating widgets from all modules.

## Provides
- `dashboard.widgets` - Register dashboard widgets here
- `dashboard.kpi_cards` - Quick KPI cards
- `dashboard.charts` - Chart widgets
- `dashboard.quick_actions` - Quick action buttons

## Consumes
- `sales.metrics` - Sales module metrics
- `materials.stock_status` - Inventory status
- `staff.attendance` - Staff attendance
- (etc...)

## Adding a New Widget

Example from Materials module:
\`\`\`typescript
// In materials/manifest.tsx setup()
registry.addAction(
  'dashboard.widgets',
  () => <MaterialsWidget />,
  'materials',
  50 // priority
);
\`\`\`

## Permissions
- minimumRole: `OPERADOR`
- All logged-in users can view dashboard
- Configure action requires `ADMINISTRADOR`
```

---

### 5️⃣ VALIDATION (30 min)

**Production-Ready Checklist**:
- [ ] ✅ Architecture compliant (Capabilities → Features → Modules)
- [ ] ✅ Scaffolding ordered (components/, hooks/, types/)
- [ ] ✅ Zero ESLint errors in dashboard module
- [ ] ✅ Zero TypeScript errors in dashboard module
- [ ] ✅ Cross-module mapped (README created)
- [ ] ✅ Zero duplication (no repeated widget logic)
- [ ] ✅ N/A - DB connected (aggregator only)
- [ ] ✅ Features mapped (optional feature 'dashboard')
- [ ] ✅ Permissions designed (minimumRole + usePermissions)
- [ ] ✅ README complete

**Manual Testing**:
- [ ] Dashboard loads without errors
- [ ] Widgets from other modules appear
- [ ] Quick actions work
- [ ] Alerts aggregation shows alerts from all modules
- [ ] Role-based views work (test with different roles)
- [ ] Responsive design works on mobile

**Final Validation**:
```bash
# Run these commands
pnpm -s exec eslint src/pages/admin/core/dashboard/
pnpm -s exec eslint src/modules/dashboard/
pnpm -s exec tsc --noEmit
```

Expected output: **0 errors**

---

## 🚨 CRITICAL PATTERNS

### ✅ DO
- Import from `@/shared/ui` (Stack, Button, Text, etc.)
- Use HookPoints for widget aggregation
- Use `usePermissions('dashboard')` for access control
- Document all provides/consumes in README
- Keep widgets independent (no shared state)
- Handle loading/empty/error states in all widgets

### ❌ DON'T
- Import directly from `@chakra-ui/react`
- Hardcode widgets (use HookPoints)
- Skip permission checks
- Create duplicate widget logic
- Forget to test with different roles
- Skip README documentation

---

## 📚 REFERENCE IMPLEMENTATIONS

**Study These** (Pilot Modules):
- `src/pages/admin/supply-chain/materials/` - Widget registration example
- `src/pages/admin/operations/sales/` - Metrics hooks
- `src/pages/admin/operations/production/` - Cross-module integration

**HookPoint Usage**:
- `src/lib/modules/HookPoint.tsx` - Implementation
- `src/modules/materials/manifest.tsx` - Widget provider example

---

## 📊 SUCCESS CRITERIA

### Module Complete When:
- [ ] 0 ESLint errors in dashboard files
- [ ] 0 TypeScript errors in dashboard files
- [ ] All 10 production-ready criteria met
- [ ] README.md created with full documentation
- [ ] Permissions integrated (minimumRole + usePermissions)
- [ ] Widgets load from other modules via HookPoints
- [ ] Manual testing passed (all widgets work)

### Integration Verified:
- [ ] Materials widget appears on dashboard
- [ ] Sales widget appears on dashboard
- [ ] Production widget appears on dashboard
- [ ] Alerts from all modules aggregate correctly
- [ ] Quick actions navigate to correct modules

---

## 🔧 COMMANDS

```bash
# Audit
pnpm -s exec eslint src/pages/admin/core/dashboard/
pnpm -s exec eslint src/modules/dashboard/
pnpm -s exec tsc --noEmit

# Development
pnpm dev  # If not already running

# Testing
pnpm test:run  # Run all tests
```

---

## ⏱️ TIME TRACKING

- [ ] Audit: 30 min
- [ ] Fix Structure: 1 hour
- [ ] Widget System: 1.5 hours
- [ ] Cross-Module: 1 hour
- [ ] Validation: 30 min

**Total**: 4 hours

---

**Status**: 🟢 READY TO START
**Next Module**: Fulfillment (after Dashboard complete)
