# Labor/Staff System Unification Analysis

**Date:** 2026-02-05
**Status:** 🔴 CRITICAL - Duplicated Labor Calculation Logic
**Complexity:** ⭐⭐⭐⭐⭐ Very High

---

## 🎯 Executive Summary

**Problem**: Two parallel labor costing systems exist with different capabilities and no integration.

**Impact**:
- ❌ Data inconsistency (two sources of truth)
- ❌ ProductionConfig uses simplified calculation (no loaded_factor)
- ❌ RecipeBuilder uses sophisticated calculation (with loaded_factor)
- ❌ No code reuse between systems

**Solution**: Eliminate simple labor fields from ProductionConfig and use `StaffAssignment[]` model everywhere.

---

## 🔍 System A: Team Module (Sophisticated ✅)

### Architecture

**Tables:**
- `job_roles` - Job positions (Cocinero, Mesero, etc.)
- `team_members` - Employees with hourly rates

**Data Model:**
```typescript
// Role (Puesto)
interface JobRole {
  id: string;
  name: string;  // "Cocinero", "Mesero"
  default_hourly_rate?: number;  // Base hourly rate
  loaded_factor: number;         // Labor burden multiplier (e.g., 1.325 = 32.5%)
  loaded_hourly_cost: number;    // rate × factor
}

// Assignment (Asignación)
interface StaffAssignment {
  role_id: string;              // REQUIRED: Position
  employee_id?: string;         // OPTIONAL: Specific employee
  duration_minutes: number;     // How long
  count: number;                // How many people

  // Calculated by team module:
  hourly_rate: number;
  loaded_factor: number;
  loaded_hourly_cost: number;   // hourly_rate × loaded_factor
  total_cost: number;           // loaded_hourly_cost × (duration/60) × count
}
```

### Cost Calculation Formula

```
total_cost = hourly_rate × loaded_factor × (duration_minutes / 60) × count
```

**Example:**
- Cocinero: $15/hr base rate
- Loaded factor: 1.325 (includes benefits, taxes, overhead)
- Duration: 30 minutes
- Count: 2 people

```
loaded_hourly_cost = $15 × 1.325 = $19.875
total_cost = $19.875 × 0.5 hours × 2 = $19.88
```

### Where It's Used

✅ **RecipeBuilder** (`src/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx`)
- Uses `StaffAssignmentSection` component
- Stores `staffAssignments: StaffAssignment[]` in recipe
- Calculates labor with `calculateLaborCost()` function

✅ **Products** (`src/pages/admin/supply-chain/products/components/sections/StaffSection.tsx`)
- Uses `StaffSelector` component
- Connected to team module

✅ **Scheduling** (`src/modules/scheduling`)
- Staff availability and assignment
- Connected to team module

### Files

**Core Module:**
- `src/modules/team/manifest.tsx`
- `src/modules/team/store/teamStore.ts`
- `src/pages/admin/resources/team/types/staffRole.ts`

**Shared Component:**
- `src/shared/components/StaffSelector/StaffSelector.tsx`
- `src/shared/components/StaffSelector/types.ts`

**Calculation Logic:**
- `src/modules/recipe/utils/costCalculations.ts` (line 38-48)

---

## 🔍 System B: ProductionConfig (Simplified ❌)

### Architecture

**Data Model:**
```typescript
interface ProductionConfig {
  // Simple labor fields:
  labor_hours?: number;
  labor_cost_per_hour?: number;
  labor_total_cost?: number;

  // Other fields:
  equipment_usage?: ProductionEquipmentUsage[];
  overhead_percentage?: number;
  packaging_cost?: number;
  // ...
}
```

### Cost Calculation Formula

```
labor_total_cost = labor_hours × labor_cost_per_hour
```

**Example:**
- Hours: 2
- Rate: $15/hr

```
total = 2 × $15 = $30
```

**⚠️ Problem:** No loaded_factor! Ignores labor burden (taxes, benefits, overhead).

### Where It's Used

❌ **ProductionConfigSection** (`src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ProductionConfigSection.tsx`)
- Line 265-313: Labor section with two input fields
- Line 71-79: Simple calculation `hours × rate`
- NOT connected to team module
- Manual input only (no role/employee selector)

### Files

**Component:**
- `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ProductionConfigSection.tsx`

**Type Definition:**
- `src/pages/admin/supply-chain/materials/types/materialTypes.ts` (line 152-169)

---

## 📊 Comparison Matrix

| Feature | Team System (A) | ProductionConfig (B) | Winner |
|---------|----------------|---------------------|--------|
| **Loaded Factor** | ✅ Yes (1.325 default) | ❌ No | A |
| **Employment Type Factors** | ✅ Yes (FT/PT/Contract) | ❌ No | A |
| **Role Selection** | ✅ Via StaffSelector | ❌ Manual input | A |
| **Employee Selection** | ✅ Optional specific employee | ❌ None | A |
| **Multiple Assignments** | ✅ Array support | ❌ Single total | A |
| **Duration Tracking** | ✅ Per assignment (minutes) | ❌ Total hours only | A |
| **Count Support** | ✅ Number of people per role | ❌ No | A |
| **DB Integration** | ✅ job_roles, team_members | ❌ No DB tables | A |
| **Precision** | ✅ DecimalUtils | ❌ Native JS | A |
| **Connected to Team Module** | ✅ Yes | ❌ No | A |

**Result:** Team System wins on ALL criteria.

---

## 🚨 Problems Identified

### 1. **Data Inconsistency**

If both systems are used in the same material:
- Recipe stores `staffAssignments` with detailed breakdown
- ProductionConfig stores `labor_hours` and `labor_cost_per_hour`
- **Two sources of truth** - which one is correct?

### 2. **Missing Loaded Factor in ProductionConfig**

Simple formula `hours × rate` **UNDERESTIMATES** true labor cost.

**Real-world example:**
- Base rate: $15/hr
- Hours: 2
- **ProductionConfig**: $30
- **Team System** (1.325 loaded): $39.75
- **Difference**: $9.75 (32.5%) underestimation

### 3. **No Role/Employee Tracking in ProductionConfig**

ProductionConfig doesn't track:
- Which roles were used
- Which employees were assigned
- How long each person worked

This makes it impossible to:
- Analyze labor efficiency by role
- Track employee productivity
- Calculate accurate overhead
- Integrate with scheduling/shifts

### 4. **Code Duplication**

Two separate implementations:
- `StaffSelector` (359 lines) - Full-featured component
- ProductionConfigSection labor fields (48 lines) - Basic inputs
- No code reuse

### 5. **UI Confusion**

Users see:
- **In RecipeBuilder**: Sophisticated staff assignment interface
- **In ProductionConfig**: Basic hours/rate inputs

**Question**: Why are they different? Which one should I use?

---

## ✅ Recommended Solution

### Phase 1: Data Model Unification

**Change ProductionConfig type:**

```typescript
// BEFORE (❌ Current)
interface ProductionConfig {
  labor_hours?: number;
  labor_cost_per_hour?: number;
  labor_total_cost?: number;
  // ...
}

// AFTER (✅ Proposed)
interface ProductionConfig {
  staff_assignments?: StaffAssignment[];  // 🆕 Use shared type
  labor_total_cost?: number;  // Calculated from assignments
  // ...
}
```

### Phase 2: UI Component Replacement

**Replace labor input fields with StaffSelector:**

```tsx
// src/pages/admin/supply-chain/materials/.../ProductionConfigSection.tsx

// REMOVE lines 265-313 (Labor Section with input fields)

// ADD:
import { StaffSelector } from '@/shared/components/StaffSelector';

<Box p="5" bg="bg.panel" borderWidth="3px" ...>
  <Typography>Personal Asignado</Typography>

  <StaffSelector
    value={productionConfig?.staff_assignments || []}
    onChange={(assignments) => {
      const totalCost = calculateLaborCost(assignments);
      onChange(prev => ({
        ...prev,
        staff_assignments: assignments,
        labor_total_cost: totalCost,
      }));
    }}
    variant="compact"
    showCost={true}
    showEmployeeSelector={true}
    showDuration={true}
    showCount={true}
    defaultDuration={60}
  />

  {/* Show total */}
  {totals.labor > 0 && (
    <Box>Total Mano de Obra: ${totals.labor.toFixed(2)}</Box>
  )}
</Box>
```

### Phase 3: Calculation Logic Update

**Update ProductionConfigSection totals:**

```typescript
import { calculateLaborCost } from '@/modules/recipe/utils/costCalculations';

const totals = useMemo(() => {
  const equipmentCost = equipmentUsage.reduce(...);

  // Use shared calculation function
  const laborCost = calculateLaborCost(productionConfig?.staff_assignments || []);

  return {
    equipment: equipmentCost,
    labor: laborCost,
    direct: equipmentCost + laborCost,
  };
}, [equipmentUsage, productionConfig?.staff_assignments]);
```

### Phase 4: Database Migration

**Update materials table:**

```sql
-- Add comment to clarify the new structure
COMMENT ON COLUMN materials.production_config IS
'Production configuration JSONB with structure:
{
  "equipment_usage": [...],
  "staff_assignments": [
    {
      "id": "temp-id",
      "role_id": "uuid",
      "employee_id": "uuid",
      "duration_minutes": 120,
      "count": 2,
      "hourly_rate": 15.00,
      "loaded_factor": 1.325,
      "total_cost": 39.75
    }
  ],
  "overhead_percentage": 10,
  "total_cost": 150.00
}';
```

**No schema changes needed** - JSONB is flexible.

### Phase 5: Remove Legacy Fields

**Clean up ProductionConfig type:**

```typescript
interface ProductionConfig {
  equipment_usage?: ProductionEquipmentUsage[];
  staff_assignments?: StaffAssignment[];  // ✅ New unified field

  // REMOVED (no longer needed):
  // labor_hours?: number;
  // labor_cost_per_hour?: number;

  labor_total_cost?: number;  // Kept for caching
  overhead_percentage?: number;
  packaging_cost?: number;
  total_cost?: number;
  // ...
}
```

---

## 📋 Implementation Checklist

### ✅ Prerequisites
- [ ] Verify team module is fully functional
- [ ] Confirm job_roles table has data
- [ ] Test StaffSelector component works in isolation

### Phase 1: Type Updates (30 min)
- [ ] Update ProductionConfig interface in materialTypes.ts
- [ ] Add staff_assignments field
- [ ] Mark labor_hours/labor_cost_per_hour as deprecated
- [ ] Run TypeScript compiler to find breaking changes

### Phase 2: Component Refactor (2 hours)
- [ ] Import StaffSelector into ProductionConfigSection
- [ ] Replace labor input fields (lines 265-313)
- [ ] Update onChange handler to use calculateLaborCost
- [ ] Update totals calculation useMemo
- [ ] Test in Storybook/isolation

### Phase 3: Integration Testing (1 hour)
- [ ] Test creating elaborated material with staff
- [ ] Verify staff_assignments saves to DB
- [ ] Check loaded_factor is applied correctly
- [ ] Verify total costs match expectations

### Phase 4: Migration Script (1 hour)
- [ ] Write script to migrate existing production_configs
- [ ] Convert old labor_hours/labor_cost_per_hour to staff_assignments
- [ ] Use default loaded_factor (1.325) for legacy data
- [ ] Run on dev/staging before production

### Phase 5: Cleanup (30 min)
- [ ] Remove old labor input fields code
- [ ] Update documentation
- [ ] Remove deprecated type fields
- [ ] Update tests

**Total Estimated Time:** 5 hours

---

## 🔄 Migration Strategy for Existing Data

### Script Pseudocode

```typescript
// For each material with production_config:
const materials = await supabase
  .from('materials')
  .select('id, production_config')
  .not('production_config', 'is', null);

for (const material of materials) {
  const config = material.production_config;

  // If has old labor fields but no staff_assignments:
  if (config.labor_hours && !config.staff_assignments) {
    const staffAssignment: StaffAssignment = {
      id: crypto.randomUUID(),
      role_id: DEFAULT_GENERAL_ROLE_ID,  // "General Labor" role
      role_name: "General Labor",
      duration_minutes: config.labor_hours * 60,
      count: 1,
      hourly_rate: config.labor_cost_per_hour,
      loaded_factor: 1.325,  // Default
      loaded_hourly_cost: config.labor_cost_per_hour * 1.325,
      total_cost: config.labor_total_cost,
    };

    config.staff_assignments = [staffAssignment];
    delete config.labor_hours;
    delete config.labor_cost_per_hour;

    await supabase
      .from('materials')
      .update({ production_config: config })
      .eq('id', material.id);
  }
}
```

---

## 🎓 Learning Points

### Why Loaded Factor Matters

**Loaded Factor** accounts for:
1. **Payroll taxes** (FICA, unemployment, etc.)
2. **Benefits** (health insurance, retirement)
3. **Paid time off** (vacation, sick days)
4. **Workers compensation** insurance
5. **Equipment & supplies** for that employee
6. **Training & development** costs

**Industry Standard:** 1.25 - 1.50 (25-50% burden)
**Our Default:** 1.325 (32.5% burden)

**Example:**
- Employee earns $15/hr (salary)
- Employer pays $19.88/hr (true cost with 32.5% burden)

### Why Multiple Assignments Matter

Different roles have different costs:
- Cocinero: $20/hr loaded
- Mesero: $15/hr loaded
- Manager: $35/hr loaded

Simple `hours × rate` doesn't capture role-specific costs.

---

## 🚀 Benefits of Unification

### For Developers
- ✅ Single source of truth
- ✅ Code reuse (StaffSelector everywhere)
- ✅ Consistent calculations
- ✅ Easier to maintain

### For Business
- ✅ Accurate labor costing (with loaded factor)
- ✅ Role-based cost tracking
- ✅ Employee productivity analysis
- ✅ Better scheduling integration

### For Users
- ✅ Consistent UI across modules
- ✅ Role/employee selection everywhere
- ✅ Better cost transparency

---

## 📚 Related Documentation

- `docs/product/COSTING_ARCHITECTURE.md` - Overall costing design
- `src/shared/components/StaffSelector/README.md` - StaffSelector usage
- `src/modules/recipe/utils/costCalculations.ts` - Calculation functions
- `src/pages/admin/resources/team/types/staffRole.ts` - Team types

---

**Status:** Ready for implementation
**Estimated Impact:** High (affects material costing accuracy)
**Priority:** Critical (data inconsistency risk)
