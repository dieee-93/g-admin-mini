# Dashboard Module

**Status**: ✅ Production-Ready (Phase 3 P0 - Module 1/3)

Central dashboard aggregating widgets and metrics from all modules using the Module Registry Hook System.

---

## 📋 Module Manifest

- **ID**: `dashboard`
- **Version**: 1.0.0
- **Category**: Core
- **Minimum Role**: `OPERADOR` (all logged-in users can view)
- **Auto-install**: `true` (always active)
- **Dependencies**: None (foundation module)

---

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Dashboard** | `/` | `page.tsx` | Main dashboard aggregation view. |

---

## 🎯 Purpose

The Dashboard module serves as the **central command center** for the G-Admin system. It:

1. **Aggregates widgets** from all registered modules via the Hook System
2. **Displays cross-module insights** and analytics
3. **Shows system alerts** from all operational areas
4. **Provides quick actions** for common tasks
5. **Tracks business milestones** and achievements

---

## 🔌 Hook System Integration

### Hooks this Module PROVIDES

```typescript
'dashboard.widgets'        // Main hook - primary dashboard widgets
'dashboard.kpi_cards'      // Quick KPI cards at the top
'dashboard.charts'         // Chart widgets for analytics
'dashboard.quick_actions'  // Quick action buttons
```

### Hooks this Module CONSUMES

```typescript
'sales.metrics'            // Sales module metrics
'materials.stock_status'   // Inventory status from Materials module
'staff.attendance'         // Staff attendance from Staff module
'scheduling.today_shifts'  // Today's shifts from Scheduling module
'finance.pending_invoices' // Pending invoices from Finance module
```

---

## 📦 How to Add a Widget

### Step 1: Register in Module Manifest

```typescript
// src/modules/materials/manifest.tsx
export const materialsManifest: ModuleManifest = {
  id: 'materials',
  setup: async (registry) => {
    registry.addAction(
      'dashboard.widgets',
      () => <MaterialsWidget />,
      'materials',
      50  // Priority
    );
  }
};
```

### Step 2: Create Widget Component

```typescript
import { CardWrapper, Stack, Typography } from '@/shared/ui';

export function MaterialsWidget() {
  const { stats } = useMaterialsStore(state => ({ stats: state.stats }));

  return (
    <CardWrapper variant="elevated" colorPalette="blue">
      <CardWrapper.Body>
        <Stack gap="3">
          <Typography variant="heading" size="lg">Inventory</Typography>
          <Typography>{stats?.totalItems || 0} items</Typography>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
```

---

## ✅ Production-Ready Checklist

- [x] Architecture compliant
- [x] Zero ESLint errors
- [x] Zero TypeScript errors
- [x] Cross-module documented
- [x] Permissions designed
- [x] README complete

---

**Next Module**: Fulfillment
