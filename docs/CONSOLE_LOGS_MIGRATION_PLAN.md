# 🔧 Console Logs Migration Plan
**Date**: 2025-10-01
**Status**: Ready for Implementation
**Priority**: Medium (Post-Critical Fixes)

---

## 📊 Audit Summary

### Statistics
- **Total Files**: 54 files
- **Total Occurrences**: 629 console statements
- **Production Code**: 8 files (85 logs requiring migration)
- **Test/Debug Code**: 46 files (544 logs - acceptable)

### Breakdown by Type
```
Production Files:
  - EventBus logging:    66 logs (HIGH priority)
  - UI System logs:       6 logs (MEDIUM priority)
  - Placeholder actions: 45 logs (LOW priority - need implementations)
  - Debug scripts:        3 logs (LOW priority)

Test Files:
  - Unit tests:         400+ logs (acceptable)
  - Integration tests:  100+ logs (acceptable)
  - E2E tests:           44 logs (acceptable)
```

---

## 🎯 Phase 1: Critical Production Code

### File: `src/shared/events/ModuleEventBus.ts`
**Impact**: HIGH - 66 console.log statements
**Lines**: 212, 224, 242, 253, 272, 289, 318, 338, 368, 388, 409, 432, 453, 487, 513, 556, 585, 614, 654, 682, 717, 756, 799, 836, 863, 908, 951, 990, 1028, 1063, (and 36 more)

**Current Pattern:**
```typescript
console.log(`[EventBus] Customer created: ${customerId}`);
console.log(`[EventBus] Sale completed: ${saleId} for $${total}`);
console.log(`[EventBus] Stock low for material ${materialId}`);
```

**Migration Target:**
```typescript
logger.debug('EventBus', `Customer created: ${customerId}`);
logger.debug('EventBus', `Sale completed: ${saleId} for $${total}`);
logger.warn('EventBus', `Stock low for material ${materialId}`);
```

**Migration Strategy:**
1. Add import: `import { logger } from '@/lib/logging';`
2. Bulk replace with script:
   ```bash
   # Replace pattern
   console.log(`[EventBus] → logger.debug('EventBus', `
   ```
3. Manually adjust log levels:
   - `created/updated` → `debug`
   - `warnings/alerts` → `warn`
   - `errors/failures` → `error`

**Estimated Time**: 30 minutes

---

## 🎯 Phase 2: UI System Logs

### File: `src/shared/ui/provider.tsx`
**Impact**: MEDIUM - 3 console statements
**Lines**: 23, 26, 30

**Current Code:**
```typescript
// Line 23
console.log(`✅ Theme system loaded: ${currentTheme?.id || 'default'}`)

// Line 26
console.warn('Dynamic system invalid, falling back to default config')

// Line 30
console.error('Error creating theme system, falling back to default:', error)
```

**Migration:**
```typescript
// Line 23
logger.info('App', `Theme system loaded: ${currentTheme?.id || 'default'}`)

// Line 26
logger.warn('App', 'Dynamic system invalid, falling back to default config')

// Line 30
logger.error('App', 'Error creating theme system, falling back to default', error)
```

**Estimated Time**: 5 minutes

---

### File: `src/shared/ui/SelectField.tsx`
**Impact**: LOW - 1 console.warn
**Line**: 94

**Current Code:**
```typescript
console.warn('SelectField: Debes proporcionar "options" o "collection"')
```

**Migration:**
```typescript
logger.warn('Form', 'SelectField: Debes proporcionar "options" o "collection"')
```

**Estimated Time**: 2 minutes

---

### File: `src/shared/ui/types/accessibility.ts`
**Impact**: LOW - 1 console.warn
**Line**: 153

**Current Code:**
```typescript
console.warn(
  `${componentName}: Missing required accessibility props: ${missing.join(', ')}`
)
```

**Migration:**
```typescript
logger.warn(
  'App',
  `${componentName}: Missing required accessibility props: ${missing.join(', ')}`
)
```

**Estimated Time**: 2 minutes

---

### File: `src/shared/ui/utils/compoundUtils.ts`
**Impact**: LOW - 1 console.warn
**Line**: 93

**Current Code:**
```typescript
console.warn(
  `Warning: ${componentName} is recommended to be used within ${expectedParent} ` +
  `for optimal styling and behavior.`
)
```

**Migration:**
```typescript
logger.warn(
  'App',
  `${componentName} is recommended to be used within ${expectedParent} for optimal styling and behavior.`
)
```

**Estimated Time**: 2 minutes

---

## 🎯 Phase 3: Placeholder Actions (Need Implementation)

### File: `src/contexts/NavigationContext.tsx`
**Impact**: LOW - 28 placeholder console.log
**Lines**: 589, 596, 603, 612, 619, 626, 635, 642, 649, 658, 665, 672, 681, 688, 695, 704, 711, 718, 727, 734, 741, 750, 757, 764, 771, 780, 787, 794

**Current Pattern:**
```typescript
{
  id: 'add_stock',
  label: 'Add Stock',
  icon: PlusIcon,
  action: () => console.log('Add stock'), // ❌ PLACEHOLDER
}
```

**Options:**

**Option A: Implement Real Functions**
```typescript
{
  id: 'add_stock',
  label: 'Add Stock',
  icon: PlusIcon,
  action: () => {
    // Real implementation
    navigate('/admin/materials?action=add');
    logger.info('NavigationContext', 'Quick action: Add Stock');
  },
}
```

**Option B: Convert to TODOs**
```typescript
{
  id: 'add_stock',
  label: 'Add Stock',
  icon: PlusIcon,
  action: () => {
    // TODO: Implement add stock action
    logger.debug('NavigationContext', 'Quick action not implemented: Add Stock');
    notify.warning('Esta acción aún no está implementada');
  },
}
```

**Option C: Remove Unimplemented Actions**
```typescript
// Simply remove from quickActions array if not ready
```

**Recommendation**: Option B for now, Option A when time permits

**Estimated Time**:
- Option A: 2-3 hours (full implementation)
- Option B: 30 minutes (TODOs with notifications)
- Option C: 10 minutes (removal)

---

### File: `src/pages/admin/operations/sales/components/SalesManagement.tsx`
**Impact**: LOW - 9 placeholder console.log
**Lines**: 79, 86, 117, 124, 130, 158, 165, 171, 177

**Pattern:**
```typescript
<Button onClick={() => console.log('Gestión Mesas')}>
  Gestión Mesas
</Button>
```

**Recommended Migration:**
```typescript
<Button onClick={() => {
  // TODO: Implement table management
  logger.debug('SalesManagement', 'Table management not implemented');
  notify.warning('Gestión de mesas próximamente');
}}>
  Gestión Mesas
</Button>
```

**Estimated Time**: 20 minutes

---

### File: `src/pages/admin/operations/sales/components/SalesActions.tsx`
**Impact**: LOW - 2 placeholder console.log
**Lines**: 99, 110

**Same pattern as SalesManagement.tsx**

**Estimated Time**: 5 minutes

---

### File: `src/pages/admin/resources/scheduling/hooks/useSchedulingPage.ts`
**Impact**: LOW - 6 placeholder console.log
**Lines**: 150, 156, 165, 174, 183, 189

**Same pattern - quick actions placeholders**

**Estimated Time**: 15 minutes

---

## 📋 Migration Checklist

### Preparation
- [ ] Ensure logger system is working (already done ✅)
- [ ] Create backup branch: `git checkout -b feature/console-logs-migration`
- [ ] Run tests baseline: `pnpm test`

### Phase 1: EventBus (30 min)
- [ ] Add logger import to `ModuleEventBus.ts`
- [ ] Create migration script for bulk replacement
- [ ] Run script: `node migrate-eventbus-logs.cjs`
- [ ] Manual review for log level adjustments
- [ ] Test: `pnpm dev` and verify logs in console
- [ ] Commit: `git commit -m "migrate: EventBus logs to logger system"`

### Phase 2: UI System (15 min)
- [ ] Migrate `provider.tsx` (3 logs)
- [ ] Migrate `SelectField.tsx` (1 log)
- [ ] Migrate `accessibility.ts` (1 log)
- [ ] Migrate `compoundUtils.ts` (1 log)
- [ ] Test UI: Theme switching, form validation
- [ ] Commit: `git commit -m "migrate: UI system logs to logger"`

### Phase 3: Placeholders (1-3 hours depending on option)
- [ ] Decide on approach: A, B, or C
- [ ] Migrate `NavigationContext.tsx` (28 logs)
- [ ] Migrate `SalesManagement.tsx` (9 logs)
- [ ] Migrate `SalesActions.tsx` (2 logs)
- [ ] Migrate `useSchedulingPage.ts` (6 logs)
- [ ] Test all quick actions manually
- [ ] Commit: `git commit -m "migrate: Replace placeholder console.logs"`

### Final Steps
- [ ] Run full test suite: `pnpm test`
- [ ] Run type check: `pnpm -s exec tsc --noEmit`
- [ ] Run lint: `pnpm lint`
- [ ] Test in browser: All major flows
- [ ] Update this document with actual time taken
- [ ] Create PR: "feat: Migrate console logs to logger system"

---

## 🔧 Migration Scripts

### Script 1: EventBus Migration
**File**: `migrate-eventbus-logs.cjs`

```javascript
const fs = require('fs');
const filePath = 'src/shared/events/ModuleEventBus.ts';

let content = fs.readFileSync(filePath, 'utf8');

// Add import if not exists
if (!content.includes("import { logger }")) {
  // Find first import
  const firstImportIndex = content.indexOf('import');
  const insertPoint = content.indexOf('\n', firstImportIndex);

  content =
    content.slice(0, insertPoint + 1) +
    "import { logger } from '@/lib/logging';\n" +
    content.slice(insertPoint + 1);
}

// Replace console.log patterns
content = content.replace(
  /console\.log\(`\[EventBus\] (.*?)`\)/g,
  "logger.debug('EventBus', `$1`)"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ EventBus logs migrated to logger system');
console.log('⚠️  Manual review needed for log level adjustments');
```

### Script 2: UI System Migration
**File**: `migrate-ui-logs.cjs`

```javascript
const fs = require('fs');

const files = [
  'src/shared/ui/provider.tsx',
  'src/shared/ui/SelectField.tsx',
  'src/shared/ui/types/accessibility.ts',
  'src/shared/ui/utils/compoundUtils.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add import if not exists
  if (!content.includes("import { logger }")) {
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex === -1) {
      // Add at top
      content = "import { logger } from '@/lib/logging';\n\n" + content;
    } else {
      const insertPoint = content.indexOf('\n', firstImportIndex);
      content =
        content.slice(0, insertPoint + 1) +
        "import { logger } from '@/lib/logging';\n" +
        content.slice(insertPoint + 1);
    }
  }

  // Replace console methods
  content = content.replace(/console\.log\(/g, "logger.info('App', ");
  content = content.replace(/console\.warn\(/g, "logger.warn('App', ");
  content = content.replace(/console\.error\(/g, "logger.error('App', ");

  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ ${file} migrated`);
});

console.log('✅ All UI system logs migrated');
```

---

## 📊 Expected Outcomes

### Before Migration
```bash
# Production console output (noisy)
[EventBus] Customer created: cust_123
[EventBus] Sale completed: sale_456 for $50.00
[EventBus] Stock low for material mat_789
✅ Theme system loaded: dark
SelectField: Debes proporcionar "options" o "collection"
```

### After Migration
```bash
# Structured logger output (clean, filterable)
🔍 [DEBUG] 📡 [EventBus] Customer created: cust_123
🔍 [DEBUG] 📡 [EventBus] Sale completed: sale_456 for $50.00
⚠️  [WARN]  📡 [EventBus] Stock low for material mat_789
ℹ️  [INFO]  📦 [App] Theme system loaded: dark
⚠️  [WARN]  📦 [Form] SelectField: Debes proporcionar "options" o "collection"
```

### Benefits
1. **Filterable**: Can disable debug logs in production
2. **Categorized**: Module-based filtering (EventBus, App, Form, etc.)
3. **Structured**: Consistent format with timestamps
4. **Configurable**: Can adjust log levels per module
5. **Tree-shakeable**: Logger code removed in production builds

---

## 🎯 Success Criteria

- [ ] Zero `console.log/warn/error` in production files
- [ ] All logs use logger system with appropriate modules
- [ ] Log levels correctly assigned (debug/info/warn/error)
- [ ] No performance regression
- [ ] All tests passing
- [ ] Type checking passing
- [ ] Lint passing
- [ ] Manual testing of affected areas completed

---

## 📚 References

- Logger System: `src/lib/logging/Logger.ts`
- Logger Usage: See `PERFORMANCE_ANALYSIS_REPORT.md`
- Logger Configuration: `logger.configure({ ... })`

---

**Total Estimated Time**: 2-4 hours (depending on placeholder implementation choice)
**Priority**: Medium (after critical CAPABILITY_DEFINITIONS fix)
**Assigned**: TBD
**Status**: 📝 Ready for Implementation
