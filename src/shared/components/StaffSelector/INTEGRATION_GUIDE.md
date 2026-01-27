# StaffSelector - Integration Guide

## Overview

`StaffSelector` is a reusable, injectable component for assigning staff to tasks across all modules (products, production orders, recipes, processes, etc.).

**Status**: ✅ Ready for integration  
**Version**: 1.0.0  
**Created**: 2026-01-10

---

## Features

### Core Features
- ✅ **Two-selector pattern**: Role first → Employee optional
- ✅ **Compact UI**: Mobile-friendly, form-optimized design
- ✅ **Labor cost calculation**: Automatic cost calculation via staff module API
- ✅ **Cross-module data**: Single source of truth via ModuleRegistry
- ✅ **Financial precision**: DecimalUtils for all calculations
- ✅ **Assignment tracking**: Count + Duration + Cost display

### Configuration Options
- `showCost` - Display labor cost calculations
- `showEmployeeSelector` - Allow optional employee selection
- `showDuration` - Show duration field (minutes)
- `showCount` - Show count field (# of people)
- `filterByDepartment` - Restrict roles to specific department
- `maxAssignments` - Limit number of assignments
- `defaultDuration` - Default duration in minutes (default: 30)

---

## Installation

### 1. Component is Already Installed ✅

```typescript
// Available at:
import { StaffSelector, type StaffAssignment } from '@/shared/components';
```

### 2. Types Available

```typescript
import type { 
  StaffSelectorProps,
  StaffAssignment,
  StaffRoleOption,
  EmployeeOption 
} from '@/shared/components';
```

---

## Basic Usage

### Example 1: Simple Product Form

```tsx
import { StaffSelector, type StaffAssignment } from '@/shared/components';

function ProductForm() {
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [totalLaborCost, setTotalLaborCost] = useState(0);

  return (
    <Box>
      <Text>Staff Required for Production</Text>
      
      <StaffSelector
        value={staffAssignments}
        onChange={setStaffAssignments}
        variant="compact"
        showCost={true}
        onCostChange={(cost) => setTotalLaborCost(cost)}
        defaultDuration={60}
      />
      
      <Text>Total Labor Cost: ${totalLaborCost.toFixed(2)}</Text>
    </Box>
  );
}
```

### Example 2: Department-Specific (Kitchen Only)

```tsx
<StaffSelector
  value={staffAssignments}
  onChange={setStaffAssignments}
  filterByDepartment="Kitchen"
  showCost={true}
  defaultDuration={90}
  placeholder="Seleccionar rol de cocina..."
/>
```

### Example 3: Read-Only Display

```tsx
<StaffSelector
  value={existingAssignments}
  onChange={() => {}}
  readOnly={true}
  showCost={true}
/>
```

### Example 4: Limited Assignments

```tsx
<StaffSelector
  value={staffAssignments}
  onChange={setStaffAssignments}
  maxAssignments={3}
  showCost={true}
/>
```

---

## Integration Examples

### Example A: Replace StaffSection in ProductForm

**Location**: `src/pages/admin/supply-chain/products/components/sections/StaffSection.tsx`

**Current**: 668-line custom component  
**Replace with**: `<StaffSelector />`

```tsx
// BEFORE (668 lines)
import StaffSection from './sections/StaffSection';

<StaffSection
  data={staffFields}
  onChange={setStaffFields}
  productType={formData.product_type}
  hasBooking={formData.booking?.has_booking}
/>

// AFTER (15 lines)
import { StaffSelector } from '@/shared/components';

<StaffSelector
  value={staffFields.staff_allocations}
  onChange={(allocations) => setStaffFields({ 
    ...staffFields, 
    staff_allocations: allocations 
  })}
  showCost={true}
  defaultDuration={staffFields.default_duration || 30}
  onCostChange={(cost) => setStaffFields({ 
    ...staffFields, 
    total_labor_cost: cost 
  })}
/>
```

### Example B: Production Order Creation

```tsx
import { StaffSelector } from '@/shared/components';

function CreateProductionOrderForm() {
  const [staff, setStaff] = useState<StaffAssignment[]>([]);
  
  return (
    <Stack gap={4}>
      <Text fontWeight="bold">Assign Staff to Production Order</Text>
      
      <StaffSelector
        value={staff}
        onChange={setStaff}
        filterByDepartment="Production"
        showCost={true}
        showEmployeeSelector={true}
        defaultDuration={240} // 4 hours default
        maxAssignments={5}
      />
      
      <Button onClick={() => createProductionOrder({ staff })}>
        Create Order
      </Button>
    </Stack>
  );
}
```

### Example C: Recipe Builder

```tsx
import { StaffSelector } from '@/shared/components';

function RecipeForm() {
  const [recipeStaff, setRecipeStaff] = useState<StaffAssignment[]>([]);
  
  return (
    <Box>
      <Text>Labor Required</Text>
      <Text fontSize="sm" color="gray.500">
        Define staff needed to execute this recipe
      </Text>
      
      <StaffSelector
        value={recipeStaff}
        onChange={setRecipeStaff}
        filterByDepartment="Kitchen"
        showCost={true}
        showDuration={true}
        showCount={false} // Single cook per recipe
        defaultDuration={45}
        placeholder="Select kitchen role..."
      />
    </Box>
  );
}
```

### Example D: Service Booking

```tsx
import { StaffSelector } from '@/shared/components';

function ServiceBookingForm() {
  const [serviceStaff, setServiceStaff] = useState<StaffAssignment[]>([]);
  
  return (
    <Stack gap={3}>
      <Text>Service Staff</Text>
      
      <StaffSelector
        value={serviceStaff}
        onChange={setServiceStaff}
        filterByDepartment="Service"
        showCost={false} // Hide cost from customer-facing form
        showEmployeeSelector={true}
        showDuration={false} // Duration from booking
        showCount={false}
        placeholder="Assign service professional..."
        maxAssignments={1} // Single professional per service
      />
    </Stack>
  );
}
```

---

## Type System

### StaffAssignment Interface

```typescript
interface StaffAssignment {
  id: string;                        // UUID
  role_id: string;                   // Required
  role_name?: string;                // Display name
  employee_id: string | null;        // Optional
  employee_name?: string;            // Display name
  duration_minutes: number;          // Required
  count: number;                     // Default: 1
  hourly_rate?: number;              // Optional override
  loaded_factor?: number;            // Optional override
  loaded_hourly_cost?: number;       // Calculated
  total_cost?: number;               // Calculated
}
```

### StaffSelectorProps Interface

```typescript
interface StaffSelectorProps {
  // Required
  value: StaffAssignment[];
  onChange: (value: StaffAssignment[]) => void;
  
  // Optional
  variant?: 'compact' | 'full';
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  
  // Features
  showCost?: boolean;
  showEmployeeSelector?: boolean;
  showDuration?: boolean;
  showCount?: boolean;
  
  // Configuration
  defaultDuration?: number;
  maxAssignments?: number;
  filterByDepartment?: string;
  
  // Callbacks
  onCostChange?: (totalCost: number) => void;
}
```

---

## Data Flow

### 1. Cross-Module Data Fetching

StaffSelector uses ModuleRegistry to access staff module APIs:

```typescript
// Inside StaffSelector.tsx
const registry = ModuleRegistry.getInstance();
const staffModule = registry.getExports<StaffAPI>('staff');

// Access hooks
const useStaffRoles = staffModule?.hooks?.useStaffRoles;
const rolesHook = useStaffRoles ? useStaffRoles() : null;
const allRoles = rolesHook?.items || [];
```

**No duplicate API calls** - Single source of truth from staff module.

### 2. Cost Calculation

Uses `DecimalUtils` for financial precision:

```typescript
// Calculate hours
const hours = DecimalUtils.multiply(
  DecimalUtils.divide(duration_minutes.toString(), '60', 'financial'),
  count.toString(),
  'financial'
).toNumber();

// Calculate loaded hourly cost
const loadedHourlyCost = DecimalUtils.multiply(
  baseRate.toString(),
  loadedFactor.toString(),
  'financial'
).toNumber();

// Calculate total cost
const cost = DecimalUtils.multiply(
  hours.toString(),
  loadedHourlyCost.toString(),
  'financial'
).toNumber();
```

### 3. Parent Notification

Component notifies parent of cost changes:

```typescript
<StaffSelector
  value={staff}
  onChange={setStaff}
  onCostChange={(cost) => {
    // Parent receives total labor cost whenever it changes
    setFormData(prev => ({ 
      ...prev, 
      total_labor_cost: cost 
    }));
  }}
/>
```

---

## Migration Path

### Phase 1: Validate StaffSelector ✅

- [x] Component created
- [x] Types defined
- [x] Barrel exports created
- [x] Added to shared/components index
- [x] TypeScript compilation passes

### Phase 2: Test Integration (NEXT)

1. **Choose test module** (recommendation: ProductForm)
2. **Create side-by-side comparison**
   - Keep existing StaffSection
   - Add new StaffSelector alongside
   - Validate identical behavior
3. **User testing**
   - Test all features (add, remove, cost calculation)
   - Verify mobile responsiveness
   - Check accessibility

### Phase 3: Gradual Rollout

1. **Replace in ProductForm** (first target)
   - Update `src/pages/admin/supply-chain/products/components/sections/StaffSection.tsx`
   - OR create new section file: `StaffSectionV4.tsx`
2. **Add to Recipe Builder**
3. **Add to Production Orders**
4. **Add to Service Booking**
5. **Deprecate old implementations**

---

## Adapters (If Needed)

If existing modules have different data structures, create lightweight adapters:

### Example: ProductForm Adapter

```typescript
// src/pages/admin/supply-chain/products/adapters/staffAdapter.ts

import type { StaffAllocation } from '../types/productForm';
import type { StaffAssignment } from '@/shared/components';

export function toStaffAssignment(allocation: StaffAllocation): StaffAssignment {
  return {
    id: allocation.id,
    role_id: allocation.role_id,
    role_name: allocation.role_name,
    employee_id: allocation.employee_id,
    employee_name: allocation.employee_name,
    duration_minutes: allocation.duration_minutes,
    count: allocation.count || 1,
    hourly_rate: allocation.hourly_rate,
    loaded_factor: allocation.loaded_factor,
    loaded_hourly_cost: allocation.loaded_hourly_cost,
    total_cost: allocation.total_cost
  };
}

export function fromStaffAssignment(assignment: StaffAssignment): StaffAllocation {
  return {
    id: assignment.id,
    role_id: assignment.role_id,
    role_name: assignment.role_name,
    employee_id: assignment.employee_id || null,
    employee_name: assignment.employee_name,
    duration_minutes: assignment.duration_minutes,
    count: assignment.count,
    hourly_rate: assignment.hourly_rate,
    loaded_factor: assignment.loaded_factor,
    loaded_hourly_cost: assignment.loaded_hourly_cost,
    total_cost: assignment.total_cost
  };
}

// Usage in component
const staffAssignments = productData.staff_allocations.map(toStaffAssignment);

<StaffSelector
  value={staffAssignments}
  onChange={(assignments) => 
    updateProduct({ 
      staff_allocations: assignments.map(fromStaffAssignment) 
    })
  }
/>
```

---

## Architecture Compliance

### ✅ Follows Project Conventions

1. **Cross-Module Data** ✅
   - Uses `ModuleRegistry.getExports<StaffAPI>('staff')`
   - No direct imports from other modules
   - Single source of truth pattern

2. **Financial Precision** ✅
   - All calculations use `DecimalUtils`
   - Proper domain selection (`'financial'`)
   - No native JS operators (+, -, *, /)

3. **UI Components** ✅
   - Imports from `@/shared/ui`
   - No direct Chakra UI imports
   - Chakra UI v3 compatible props

4. **TypeScript** ✅
   - Strict typing throughout
   - No `any` types
   - Proper type exports

5. **Performance** ✅
   - Memoized sub-components
   - useMemo for expensive calculations
   - Minimal re-renders

---

## Testing Checklist

Before deploying to production:

- [ ] Unit tests for cost calculations
- [ ] Integration test with ProductForm
- [ ] Test cross-module data fetching (staff module enabled/disabled)
- [ ] Test empty states (no roles, no employees)
- [ ] Test read-only mode
- [ ] Test maxAssignments limit
- [ ] Test filterByDepartment
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Cost change callback fires correctly
- [ ] DecimalUtils precision validation

---

## Known Limitations

1. **Requires Staff Module** - Won't work if staff module is not registered
2. **No Async Validation** - Doesn't check for scheduling conflicts (future feature)
3. **No Availability Check** - Doesn't verify employee availability (future feature)

---

## Future Enhancements

### Planned Features
1. **Availability Integration** - Check employee schedules before assignment
2. **Conflict Detection** - Warn if employee double-booked
3. **Smart Suggestions** - Recommend staff based on skills/availability
4. **Drag-and-Drop** - Reorder assignments
5. **Bulk Import** - Upload CSV of staff assignments
6. **Templates** - Save/load common staff configurations

### Scheduling Integration (Deferred)
- Schedule module should act as central orchestrator
- StaffSelector should emit events to schedule module
- Schedule module validates conflicts and availability
- **Requires architecture research** - See separate task

---

## Support

### Questions?
- Check `CLAUDE.md` for project conventions
- Review `docs/cross-module/CROSS_MODULE_DATA_ARCHITECTURE.md`
- Ask in #dev channel

### Found a Bug?
- Create issue in GitHub
- Tag with `component:staff-selector`

### Need Help Integrating?
- Review examples in this guide
- Check existing usage in ProductForm
- Ask team for guidance

---

**Last Updated**: 2026-01-10  
**Component Version**: 1.0.0  
**Status**: ✅ Ready for Integration
