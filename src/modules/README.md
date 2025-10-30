# Module Registry - Demonstration Files

This directory contains demonstration files for the Module Registry pattern in the Scheduling system.

## Overview

The Module Registry pattern enables:
- **Decoupled Modules**: Modules communicate through hooks, not direct imports
- **Feature-Based Loading**: Only load modules when user has required features
- **Progressive Enhancement**: Modules can extend other modules' UI
- **Type-Safe Integration**: Full TypeScript support for hooks and exports

## File Structure

```
src/modules/
├── staff/
│   └── manifest.ts          # Staff module definition
├── scheduling/
│   └── manifest.ts          # Scheduling module definition
├── production/
│   └── manifest.ts          # Production module definition
├── index.ts                 # Central registry of all modules
└── README.md                # This file
```

## Module Manifests

### 1. Staff Module (`staff/manifest.ts`)
- **ID**: `staff`
- **Version**: `1.0.0`
- **Dependencies**: None (foundational module)
- **Required Features**: `staff_employee_management`
- **Provides Hooks**:
  - `calendar.events` (priority 100) - Staff shifts overlay
  - `dashboard.widgets` (priority 75) - Staff performance widget
  - `scheduling.toolbar.actions` (priority 100) - Availability button
- **Exports**:
  - `getStaffAvailability(date)` - Query staff availability
  - `calculateLaborCost(hours, rate)` - Calculate costs

### 2. Scheduling Module (`scheduling/manifest.ts`)
- **ID**: `scheduling`
- **Version**: `1.0.0`
- **Dependencies**: `staff` (requires staff module)
- **Required Features**: `staff_shift_management`
- **Provides Hooks**:
  - `calendar.events` (priority 80) - Time-off requests overlay
  - `dashboard.widgets` (priority 70) - Scheduling stats widget
- **Consumes Hooks**:
  - `staff.availability.updated` - React to availability changes
  - `sales.volume_forecast` - Adjust staffing
- **Exports**:
  - `getWeeklySchedule(week)` - Fetch week schedule
  - `calculateLaborCosts(shifts)` - Calculate shift costs

### 3. Production Module (`production/manifest.ts`)
- **ID**: `production`
- **Version**: `1.0.0`
- **Dependencies**: `materials` (requires materials module)
- **Required Features**: `production_kitchen_display`
- **Provides Hooks**:
  - `calendar.events` (priority 70) - Production schedule overlay
  - `materials.row.actions` (priority 80) - "Use in Kitchen" button
- **Consumes Hooks**:
  - `sales.order_placed` - React to new orders
  - `materials.stock_updated` - Adjust recipes
- **Exports**:
  - `calculateRecipeCost(recipeId)` - Calculate recipe cost
  - `canProduceRecipe(recipeId, quantity)` - Check stock availability

## How to Use

### 1. Bootstrap Modules (App Initialization)

```tsx
// src/App.tsx or src/main.tsx
import { getModuleRegistry } from '@/lib/modules';
import { ALL_MODULE_MANIFESTS } from '@/modules';
import { useCapabilities } from '@/lib/capabilities';

function App() {
  const { activeFeatures } = useCapabilities();

  useEffect(() => {
    const registry = getModuleRegistry();

    // Register all modules
    ALL_MODULE_MANIFESTS.forEach(manifest => {
      // Check if user has required features
      const hasFeatures = manifest.requiredFeatures.every(f =>
        activeFeatures.includes(f)
      );

      if (hasFeatures) {
        registry.register(manifest);
        console.log(`Registered module: ${manifest.id}`);
      } else {
        console.log(`Skipped module ${manifest.id} - missing features`);
      }
    });
  }, [activeFeatures]);

  return <RouterProvider router={router} />;
}
```

### 2. Use HookPoint in Pages

```tsx
// src/pages/admin/resources/scheduling/page.tsx
import { HookPoint } from '@/lib/modules';

export default function SchedulingPage() {
  return (
    <ContentLayout>
      <Section title="Calendar View">
        <HookPoint
          name="calendar.events"
          data={{
            selectedWeek: '2025-W42',
            shifts: allShifts,
            onShiftClick: handleShiftClick
          }}
          fallback={<Text>No calendar integrations</Text>}
          direction="column"
          gap={4}
          debug={true}
        />
      </Section>
    </ContentLayout>
  );
}
```

### 3. Call Module Exports

```tsx
// In another module
import { getModuleRegistry } from '@/lib/modules';

function SomeComponent() {
  const handleCheckAvailability = async () => {
    const registry = getModuleRegistry();
    const staffExports = registry.getExports('staff');

    if (staffExports) {
      const availability = await staffExports.getStaffAvailability('2025-10-15');
      console.log('Available staff:', availability);
    }
  };

  return <button onClick={handleCheckAvailability}>Check Staff</button>;
}
```

## Hook Execution Order

Hooks are executed by **priority** (higher = first):

1. **Staff Module** (priority 100) - Staff shifts render first
2. **Scheduling Module** (priority 80) - Time-off requests render second
3. **Production Module** (priority 70) - Production schedule renders third

Example output in calendar:
```
┌─────────────────────────────────┐
│ Staff Shifts (5)                │ ← Priority 100
│ - John Doe: 09:00 - 17:00       │
│ - Jane Smith: 10:00 - 18:00     │
├─────────────────────────────────┤
│ Time-Off Requests (2)           │ ← Priority 80
│ - John Doe: 2025-10-15 (pending)│
├─────────────────────────────────┤
│ Production Schedule (3)         │ ← Priority 70
│ - 09:00: Classic Burger (50)    │
└─────────────────────────────────┘
```

## Benefits

### 1. Decoupling
Modules don't import each other directly:
```tsx
// ❌ BAD - Tight coupling
import { getStaffData } from '@/pages/admin/resources/staff';

// ✅ GOOD - Loose coupling via registry
const staffExports = registry.getExports('staff');
const data = await staffExports.getStaffAvailability('2025-10-15');
```

### 2. Progressive Enhancement
Calendar works with 0, 1, or all 3 modules:
- **0 modules**: Shows fallback message
- **1 module (Staff)**: Shows only staff shifts
- **3 modules (Staff + Scheduling + Production)**: Shows all events

### 3. Feature-Based Loading
Modules only load when user has features:
```tsx
// Staff module loads ONLY if user has 'staff_employee_management'
// Scheduling module loads ONLY if user has 'staff_shift_management'
// Production module loads ONLY if user has 'production_kitchen_display'
```

### 4. Dependency Resolution
Registry validates dependencies automatically:
```tsx
// Scheduling depends on Staff
// If Staff is not loaded, Scheduling won't load
```

## Testing

### Unit Tests
```tsx
import { getModuleRegistry } from '@/lib/modules';
import { staffManifest } from '@/modules';

describe('Staff Module', () => {
  it('should register successfully', () => {
    const registry = getModuleRegistry();
    registry.register(staffManifest);

    expect(registry.has('staff')).toBe(true);
  });

  it('should provide calendar hooks', () => {
    const registry = getModuleRegistry();
    registry.register(staffManifest);

    expect(registry.hasHook('calendar.events')).toBe(true);
  });

  it('should export API functions', () => {
    const registry = getModuleRegistry();
    registry.register(staffManifest);

    const exports = registry.getExports('staff');
    expect(exports.getStaffAvailability).toBeDefined();
  });
});
```

### Integration Tests
```tsx
describe('Calendar Integration', () => {
  it('should render events from all modules', () => {
    const registry = getModuleRegistry();
    registry.register(staffManifest);
    registry.register(schedulingManifest);
    registry.register(productionManifest);

    const results = registry.doAction('calendar.events', {
      selectedWeek: '2025-W42'
    });

    expect(results).toHaveLength(3); // Staff + Scheduling + Production
  });
});
```

## Performance

- **Lazy Loading**: Modules load only when needed
- **Priority-Based Execution**: High-priority hooks execute first
- **Memoization**: HookPoint memoizes results to avoid re-execution
- **Debug Mode**: Enable debug logging in development

```tsx
<HookPoint
  name="calendar.events"
  debug={process.env.NODE_ENV === 'development'} // Logs to console
/>
```

## Real-World Usage

### Dashboard Widgets
Multiple modules contribute widgets:
```tsx
<HookPoint name="dashboard.widgets" />
// Renders: Staff Widget + Scheduling Widget + Production Widget
```

### Toolbar Actions
Multiple modules add buttons:
```tsx
<HookPoint name="scheduling.toolbar.actions" />
// Renders: "View Staff Availability" + "Auto-Schedule" + "Export"
```

### Material Actions
Production module adds "Use in Kitchen" button:
```tsx
<HookPoint
  name="materials.row.actions"
  data={{ material: selectedMaterial }}
/>
// Renders: "Use in Kitchen" button (from Production module)
```

## Next Steps

1. **Bootstrap**: Add module registration to `App.tsx`
2. **Test**: Run dev server and verify hooks execute
3. **Extend**: Create more modules (materials, sales, customers)
4. **Optimize**: Add lazy loading for module code
5. **Document**: Add JSDoc to all exported functions

## References

- **Module Registry Pattern**: `docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md`
- **Hook System**: `src/lib/modules/HookPoint.tsx`
- **Type Definitions**: `src/lib/modules/types.ts`
- **Feature Registry**: `src/config/FeatureRegistry.ts`
