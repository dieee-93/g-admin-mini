# Architecture Audit - Part 2: Patterns & Technical Debt

## 5. Design Patterns (85% Consistency)

### 5.1 Well-Implemented Patterns ✅

1. **Repository Pattern** (85% adoption)
   - Service layer wraps Supabase
   - Clean API abstraction
   - Used in: 12/14 modules

2. **Custom Hooks Pattern** (100% adoption)
   - Business logic extracted from components
   - Example: `useSalesPage()`, `useMaterialsPage()`
   - Used in: 14/14 modules

3. **Observer Pattern - EventBus** (71% adoption)
   - Cross-module communication
   - 40+ event types registered
   - Missing in: Customers, Intelligence, Reporting

4. **Zustand Store Pattern** (100% adoption)
   - Immer + Persist middleware
   - Domain-specific stores
   - 15/15 stores follow pattern

5. **Atomic Capabilities** (100% adoption)
   - Feature flag architecture v2.0
   - 9 atomic capabilities, 86 features
   - Progressive disclosure pattern

### 5.2 Anti-Patterns Detected ❌

1. **God Object** - `materialsStore.ts` (592 LOC)
   - Handles: CRUD + filters + modals + alerts
   - **Fix**: Split into 3 stores (Data, UI, Alerts)

2. **Shotgun Surgery** - 3 alert systems
   - Changes require updates in 3 places
   - **Fix**: Consolidate to v2.1

3. **Feature Envy** - Components access store internals
   ```typescript
   // ❌ Component knows too much
   const items = useStore(s => s.items.filter(...).sort(...));
   
   // ✅ Store provides selector
   const items = useMeasurableItems();
   ```
   Found in: 40% of components

4. **Inappropriate Intimacy** - Cross-module type imports
   ```typescript
   // ❌ Business logic imports page types
   import { Type } from '@/pages/admin/.../types';
   
   // ✅ Shared domain types
   import { Type } from '@/domain/.../types';
   ```
   Found in: 12 files

---

## 6. Cross-Cutting Concerns (152 files in src/lib/)

### 6.1 Infrastructure Quality

```
✅ EventBus v2:          1,312 LOC - Enterprise-grade
✅ Offline System:       Optimistic updates + sync
✅ Performance Monitor:  FPS tracking, lazy loading
✅ Error Handling:       Centralized + boundaries
✅ Logging:              Contextual logger
✅ Achievements:         EventBus integration
✅ Capabilities:         Atomic v2.0
✅ Composition:          Slot system
✅ Theming:              25+ themes, runtime switching
✅ Lazy Loading:         All routes code-split

❌ Security (deprecated): Marked for removal
⏳ WebSocket:            TODO (Supabase integration)
```

### 6.2 Adoption Gaps

| System | Adoption | Target | Gap |
|--------|----------|--------|-----|
| EventBus | 71% | 100% | 29% |
| Offline | 21% | 80% | 59% ⚠️ |
| Performance | 57% | 90% | 33% |
| Error Handling | 100% | 100% | 0% ✅ |
| Capabilities | 100% | 100% | 0% ✅ |

**Critical**: Offline support only in 3 modules (Sales, Materials, Operations)

---

## 7. Technical Debt Hotspots

### 7.1 Large Files (17 files > 1,000 LOC)

```
1. ModuleEventBus.ts           2,597 LOC 🔴 Must split
2. customerAnalyticsEngine.ts  1,323 LOC ⚠️ OK (complex)
3. EventBus.ts                 1,312 LOC ⚠️ OK (core)
4. NavigationContext.tsx       1,308 LOC 🔴 Reduce
5. staffPerformanceEngine.ts   1,057 LOC ⚠️ OK (analytics)
```

**Action**: Split NavigationContext, ModuleEventBus

### 7.2 Magic Values (68 instances)

- Magic numbers: 23 (e.g., `minStock = 10`)
- Magic strings: 45 (e.g., `status === 'active'`)

**Fix**: Extract to `src/config/{domain}Constants.ts`

### 7.3 Deprecated Code

1. `src/lib/validation/security.ts` - Still used in 8 files
2. Old capability hooks - Deleted ✅
3. Legacy alert components - 12 files to migrate

---

## 8. Refactoring Roadmap

### Phase 1: Critical (Week 1-2) - 5 days

**Priority**: 🔴 CRITICAL | **Impact**: High

1. **Eliminate Chakra Imports** (80 files, 2 days)
   - Replace with `@/shared/ui`
   - Add ESLint rule to prevent
   
2. **Consolidate Alerts** (12 files, 2 days)
   - Migrate to `@/shared/alerts` v2.1
   - Delete custom implementations
   
3. **Add Barrel Exports** (40% modules, 1 day)
   - Create `index.ts` in all subdirs
   - Fix 95 relative imports

### Phase 2: High-Priority (Week 3-4) - 5 days

**Priority**: 🟠 HIGH | **Impact**: Medium-High

1. **Service Consolidation** (3 days)
   - Move all to module-local services
   - Delete empty `src/services/`
   
2. **Fix Relative Imports** (95 files, 1 day)
   - Replace `../../` with `@/`
   - Leverage barrel exports
   
3. **Remove Deprecated Security** (8 files, 1 day)
   - Replace `secureApiCall()` with services
   - Delete deprecated file

### Phase 3: Structural (Week 5-6) - 6 days

**Priority**: 🟡 MEDIUM | **Impact**: Medium

1. **Flatten Deep Nesting** (2 days)
   - Materials: 7 → 4 levels
   - Products: 6 → 4 levels
   
2. **Split Large Files** (3 days)
   - ModuleEventBus.ts → Split by domain
   - NavigationContext → Extract sub-contexts
   - materialsStore → 3 separate stores
   
3. **Create Module Template** (1 day)
   - `/templates/module-template/`
   - CLI: `npm run generate:module`

### Phase 4: Optimization (Week 7-8) - 7 days

**Priority**: 🟢 LOW | **Impact**: Low-Medium

1. **Extract Magic Values** (68 instances, 2 days)
2. **Increase EventBus Adoption** (4 modules, 2 days)
3. **Extend Offline Support** (11 modules, 3 days)

**Total Effort**: 23 days (4.6 weeks)

