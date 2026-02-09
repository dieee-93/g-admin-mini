# Staff → Team Renaming Reference

**Created:** 2026-02-06
**Status:** 🔴 Pending - To be executed with specialized agent
**Estimated Time:** 3-4 hours

---

## 📊 Summary

- **Total References:** 79+ occurrences
- **Files to Rename:** 14 files
- **Modules Affected:** 6 modules

---

## 🎯 Scope of Changes

### 1. Component Names

| Current | New |
|---------|-----|
| `StaffSelector` | `TeamSelector` |
| `StaffAssignmentSection` | `TeamAssignmentSection` |
| `StaffSection` | `TeamSection` |
| `StaffCard` | `TeamCard` |
| `StaffWidget` | `TeamWidget` |
| `StaffPoliciesFormModal` | `TeamPoliciesFormModal` |
| `StaffRoleFormModal` | `TeamRoleFormModal` |
| `StaffRolesList` | `TeamRolesList` |

### 2. Type Names

| Current | New |
|---------|-----|
| `StaffAssignment` | `TeamAssignment` |
| `StaffRoleOption` | `TeamRoleOption` |
| `StaffSelectorProps` | `TeamSelectorProps` |
| `StaffAssignmentData` | `TeamAssignmentData` |
| `StaffAPI` | `TeamAPI` |

### 3. Schema Names

| Current | New |
|---------|-----|
| `StaffAssignmentSchema` | `TeamAssignmentSchema` |

### 4. Hook Names

| Current | New |
|---------|-----|
| `useStaffForm` | `useTeamForm` |
| `useStaffPage` | `useTeamPage` |
| `useStaffRoles` | `useTeamRoles` |
| `useStaffData` | `useTeamData` |

### 5. Adapter Names

| Current | New |
|---------|-----|
| `staffShiftAdapter` | `teamShiftAdapter` |

### 6. Handler Names

| Current | New |
|---------|-----|
| `staffHandlers` | `teamHandlers` |

---

## 📁 Files to Rename

### Shared Components
```
src/shared/components/StaffSelector/
  → src/shared/components/TeamSelector/

src/shared/components/StaffSelector/StaffSelector.tsx
  → src/shared/components/TeamSelector/TeamSelector.tsx
```

### Recipe Module
```
src/modules/recipe/components/RecipeBuilder/sections/StaffAssignmentSection.tsx
  → src/modules/recipe/components/RecipeBuilder/sections/TeamAssignmentSection.tsx
```

### Team/Resources Module
```
src/pages/admin/resources/team/components/StaffCard.tsx
  → src/pages/admin/resources/team/components/TeamCard.tsx

src/pages/admin/resources/team/hooks/useStaffForm.tsx
  → src/pages/admin/resources/team/hooks/useTeamForm.tsx

src/pages/admin/resources/team/hooks/useStaffPage.ts
  → src/pages/admin/resources/team/hooks/useTeamPage.ts

src/pages/admin/resources/team/tabs/policies/components/StaffPoliciesFormModal.tsx
  → src/pages/admin/resources/team/tabs/policies/components/TeamPoliciesFormModal.tsx

src/pages/admin/resources/team/tabs/roles/components/StaffRoleFormModal.tsx
  → src/pages/admin/resources/team/tabs/roles/components/TeamRoleFormModal.tsx

src/pages/admin/resources/team/tabs/roles/components/StaffRolesList.tsx
  → src/pages/admin/resources/team/tabs/roles/components/TeamRolesList.tsx

src/pages/admin/resources/team/tabs/roles/hooks/useStaffRoles.ts
  → src/pages/admin/resources/team/tabs/roles/hooks/useTeamRoles.ts

src/pages/admin/resources/team/types/staffRole.ts
  → src/pages/admin/resources/team/types/teamRole.ts
```

### Products Module
```
src/pages/admin/supply-chain/products/components/sections/StaffSection.tsx
  → src/pages/admin/supply-chain/products/components/sections/TeamSection.tsx
```

### Scheduling Module
```
src/modules/scheduling/adapters/staffShiftAdapter.ts
  → src/modules/scheduling/adapters/teamShiftAdapter.ts
```

### Shift Control Module
```
src/modules/shift-control/handlers/staffHandlers.ts
  → src/modules/shift-control/handlers/teamHandlers.ts
```

### Factories/Examples
```
src/shared/factories/examples/StaffModuleExample.ts
  → src/shared/factories/examples/TeamModuleExample.ts
```

---

## 🔧 Files with Import Updates Required

### Materials Module (Phase 2 Integration - Just Completed)
- `src/pages/admin/supply-chain/materials/components/MaterialsManagement/MaterialFormModalComplete/components/ProductionConfigSection.tsx`
- `src/pages/admin/supply-chain/materials/types/materialTypes.ts`
- `src/pages/admin/supply-chain/materials/validation/materialFormSchema.ts`

### Recipe Module
- `src/modules/recipe/components/RecipeBuilder/RecipeBuilder.tsx`
- `src/modules/recipe/components/RecipeBuilder/sections/index.ts`
- `src/modules/recipe/utils/costCalculations.ts`

### Products Module
- `src/pages/admin/supply-chain/products/components/sections/StaffSection.tsx` (rename + update)

### Shared Components
- `src/shared/components/index.ts` (barrel export)

### Calendar/Shared
- `src/shared/calendar/hooks/useCalendarConfig.ts`
- `src/shared/calendar/hooks/useCalendarEngine.ts`
- `src/shared/calendar/types/DateTimeTypes.ts`

---

## 📝 Specific Line References

### ProductionConfigSection.tsx (Materials - Just Integrated)
```typescript
// Line 20: import { StaffSelector } from '@/shared/components/StaffSelector';
// Line 21: import type { StaffAssignment } from '@/shared/components/StaffSelector';
// Line 247: <StaffSelector

// After rename:
// Line 20: import { TeamSelector } from '@/shared/components/TeamSelector';
// Line 21: import type { TeamAssignment } from '@/shared/components/TeamSelector';
// Line 247: <TeamSelector
```

### materialTypes.ts
```typescript
// Line 154-155:
// Re-export StaffAssignment from shared components for convenience
export type { StaffAssignment } from '@/shared/components/StaffSelector';

// Line 161:
staff_assignments?: import('@/shared/components/StaffSelector').StaffAssignment[];

// After rename:
// Re-export TeamAssignment from shared components for convenience
export type { TeamAssignment } from '@/shared/components/TeamSelector';

team_assignments?: import('@/shared/components/TeamSelector').TeamAssignment[];
```

### materialFormSchema.ts
```typescript
// Line 29: export const StaffAssignmentSchema = z.object({
// Line 76: staff_assignments: z.array(StaffAssignmentSchema).optional(),
// Line 338: export type StaffAssignmentData = z.infer<typeof StaffAssignmentSchema>;

// After rename:
// Line 29: export const TeamAssignmentSchema = z.object({
// Line 76: team_assignments: z.array(TeamAssignmentSchema).optional(),
// Line 338: export type TeamAssignmentData = z.infer<typeof TeamAssignmentSchema>;
```

### RecipeBuilder.tsx
```typescript
// Line 16: import type { StaffAssignment } from '@/shared/components/StaffSelector/types';
// Line 30: import { BasicInfoSection, InputsEditorSection, StaffAssignmentSection } from './sections';
// Line 109: return (recipe.staffAssignments as StaffAssignment[]) || [];
// Line 113: (assignments: StaffAssignment[]) => {
// Line 275: <StaffAssignmentSection

// After rename:
// Line 16: import type { TeamAssignment } from '@/shared/components/TeamSelector/types';
// Line 30: import { BasicInfoSection, InputsEditorSection, TeamAssignmentSection } from './sections';
// Line 109: return (recipe.teamAssignments as TeamAssignment[]) || [];
// Line 113: (assignments: TeamAssignment[]) => {
// Line 275: <TeamAssignmentSection
```

### costCalculations.ts
```typescript
// Line 10: import type { StaffAssignment } from '@/shared/components/StaffSelector/types';
// Line 38: export const calculateLaborCost = (staffAssignments: StaffAssignment[] = []): number => {

// After rename:
// Line 10: import type { TeamAssignment } from '@/shared/components/TeamSelector/types';
// Line 38: export const calculateLaborCost = (teamAssignments: TeamAssignment[] = []): number => {
```

---

## 🧪 Test Files to Update

### E2E Tests
- `src/__tests__/e2e/staff-business-flows.e2e.test.tsx` → `team-business-flows.e2e.test.tsx`
- `src/__tests__/e2e/staff-module-basic.e2e.test.tsx` → `team-module-basic.e2e.test.tsx`

### Unit Tests
- `src/hooks/__tests__/useStaffData.test.ts` → `useTeamData.test.ts`
- `src/lib/events/__tests__/business/staff-management.test.ts` → `team-management.test.ts`

---

## ⚠️ Important Notes

### Database Compatibility
- **No database changes required** - Database columns can remain as `staff_assignments`
- JSON fields (like `production_config.staff_assignments`) are flexible
- OR can be migrated to `team_assignments` with a migration script

### Backward Compatibility
- Consider keeping deprecated exports during transition:
  ```typescript
  // In shared/components/index.ts
  export { TeamSelector as StaffSelector } from './TeamSelector'; // @deprecated
  export type { TeamAssignment as StaffAssignment } from './TeamSelector'; // @deprecated
  ```

### Variable Names
Not all variables need renaming:
- Keep: `const staffModule = ...` (refers to team module, not component)
- Keep: `requiresStaffAssignment` (existing prop in calendar types)
- Rename: Component/Type/Schema names only

---

## 🚀 Execution Steps for Agent

### Phase 1: Rename Files (10 min)
1. Rename all 14 files listed above
2. Update directory name `StaffSelector/` → `TeamSelector/`

### Phase 2: Update Component Names (30 min)
3. Find/replace `StaffSelector` → `TeamSelector`
4. Find/replace `StaffAssignmentSection` → `TeamAssignmentSection`
5. Update all component function names

### Phase 3: Update Type Names (20 min)
6. Find/replace `StaffAssignment` → `TeamAssignment`
7. Find/replace `StaffRoleOption` → `TeamRoleOption`
8. Find/replace `StaffSelectorProps` → `TeamSelectorProps`
9. Find/replace `StaffAPI` → `TeamAPI`

### Phase 4: Update Schema Names (10 min)
10. Find/replace `StaffAssignmentSchema` → `TeamAssignmentSchema`
11. Find/replace `StaffAssignmentData` → `TeamAssignmentData`

### Phase 5: Update Hooks (15 min)
12. Rename hook files and function names
13. Update imports

### Phase 6: Update Barrel Exports (5 min)
14. Update `src/shared/components/index.ts`
15. Update section barrel exports

### Phase 7: Database Migration (optional, 30 min)
16. Write migration script if renaming JSON fields
17. Test on dev/staging

### Phase 8: Testing (1 hour)
18. Run `npm run build`
19. Run `npx tsc --noEmit`
20. Run E2E tests
21. Manual testing of affected modules

---

## ✅ Verification Checklist

After renaming:
- [ ] TypeScript compiles without errors
- [ ] No references to old `Staff*` names (except deprecated exports)
- [ ] Materials module ProductionConfig works
- [ ] Recipe module labor assignment works
- [ ] Products staff section works
- [ ] Team module works
- [ ] Scheduling module works
- [ ] Shift-control module works
- [ ] All tests pass
- [ ] No broken imports

---

## 📚 Related Documentation

- Phase 2 completion: `docs/materials/Phase1-COMPLETE.md`
- Labor/Staff unification: `docs/materials/Labor-Staff-Unification-Analysis.md`
- Resume here: `docs/materials/RESUME-AQUI.md`

---

**Command for Agent:**

```
Lee docs/materials/Staff-to-Team-Renaming-Reference.md

Ejecuta el renombrado completo de Staff → Team siguiendo las fases 1-8.

IMPORTANTE:
1. Usa git para rastrear cambios
2. Haz commits incrementales por fase
3. Verifica que TypeScript compile después de cada fase
4. Reporta cualquier conflicto o error
```
