# PERMISSION SYSTEM INVESTIGATION - SESSION PROMPT

**Context**: G-Admin Mini has MULTIPLE permission systems already implemented but they appear duplicated/conflicting. This session must investigate, consolidate, and make architectural decisions.

---

## 🎯 YOUR MISSION

Investigate the existing permission/role systems in the codebase, identify conflicts/duplications, propose a unified architecture, and update `PRODUCTION_PLAN.md` Section 7 with the final decisions.

---

## 📋 STEP-BY-STEP WORKFLOW

### PHASE 1: CODE DISCOVERY (30-45 min)

**1.1 Find ALL permission-related files**
```bash
# Search for role/permission code
grep -r "role|permission|auth" src/ --include="*.ts" --include="*.tsx"
```

**1.2 Read and analyze these CRITICAL files:**
- [ ] `src/contexts/AuthContext.tsx` (lines 1-150)
- [ ] `src/components/auth/RoleGuard.tsx` (complete)
- [ ] `src/lib/validation/permissions.tsx` (complete)
- [ ] `src/pages/admin/core/settings/types/permissions.ts` (complete)
- [ ] `src/components/auth/ProtectedRoute.tsx`
- [ ] `src/components/auth/ProtectedRouteNew.tsx`
- [ ] `src/store/appStore.ts` (search for "role" or "permission")

**1.3 Search for usage patterns:**
```typescript
// Find where permissions are used
grep -r "hasRole|hasPermission|canAccessModule|usePermissions" src/
grep -r "RoleGuard" src/
grep -r "ROLES\.|PERMISSIONS\." src/
```

**1.4 Check database schema:**
```sql
-- Look for permission/role tables in Supabase
-- Check src/lib/supabase/ for RLS policies
```

**Document findings in a table:**
| System | File | Roles Defined | Permissions | Integration | Status |
|--------|------|---------------|-------------|-------------|--------|
| A | AuthContext | CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, SUPER_ADMIN | Module-based | JWT + Supabase | ? |
| B | permissions.tsx | admin, manager, employee, cashier, kitchen, viewer | 47 granular | useAppStore | ? |
| ... | ... | ... | ... | ... | ... |

---

### PHASE 2: CONFLICT ANALYSIS (15-20 min)

**2.1 Identify conflicts:**
- Are System A and System B both active?
- Which one is used in which modules?
- Are they synchronized or independent?
- Which system is newer/more complete?

**2.2 Map role equivalences (if they overlap):**
```
System A          →  System B
SUPER_ADMIN      →  admin
ADMINISTRADOR    →  manager (?)
SUPERVISOR       →  supervisor (?) or employee (?)
OPERADOR         →  cashier (?) or employee (?)
CLIENTE          →  viewer (?) or N/A (?)
```

**2.3 Check integration with existing architecture:**
- Does either system integrate with `FeatureRegistry`?
- Does either system integrate with `BusinessModelRegistry` (capabilities)?
- How do permissions relate to multi-location support?
- Are there permission checks in service layers (src/services/)?

---

### PHASE 3: INTEGRATION WITH G-ADMIN ARCHITECTURE (20-30 min)

**3.1 Review the Capabilities → Features → Modules system:**
- Read `PRODUCTION_PLAN.md` Section 4 (Architecture Overview)
- Read `src/config/BusinessModelRegistry.ts` (capabilities)
- Read `src/config/FeatureRegistry.ts` (86 features)
- Read `src/modules/index.ts` (27 modules)

**3.2 Answer these critical questions:**

**Q1: Should permissions check BEFORE or AFTER feature flags?**
```typescript
// Option A: Features first, then permissions
if (!hasFeature('sales_analytics')) return null; // Feature disabled
if (!hasPermission('sales', 'read')) return null; // No permission

// Option B: Permissions first, then features
if (!hasPermission('sales', 'read')) return null; // No permission
if (!hasFeature('sales_analytics')) return null; // Feature disabled
```
**Recommendation**: Features first (if feature is OFF, don't check permissions)

**Q2: Can a user have different roles per location?**
- User model supports `location_id` and `accessible_locations[]`?
- Role per location OR global role + location filtering?

**Q3: How granular should permissions be?**
- Module-level only? (can access Sales module: yes/no)
- Action-level? (can: read, write, delete, void, approve)
- Feature-level? (can access `sales_analytics` if Manager+)
- Record-level? (can edit own orders only)

**Q4: Should we use external library or custom system?**
- Casbin: Too complex for 27 modules?
- CASL: Adds dependency, doesn't fit FeatureRegistry pattern?
- Custom: Leverage existing code + integrate with architecture?

---

### PHASE 4: PROPOSE UNIFIED ARCHITECTURE (30-40 min)

**4.1 Design role hierarchy (5-7 roles max):**

Propose a SINGLE, unified role system based on findings:

```typescript
export type RoleId =
  | 'super_admin'  // System owner (1 user, NOT used in production)
  | 'admin'        // Business owner (full access)
  | 'manager'      // Department manager (operational + approvals)
  | 'supervisor'   // Shift supervisor (operational, own location)
  | 'employee'     // Staff member (assigned tasks, own data)
  | 'viewer';      // Read-only (reports, dashboards)
```

**Justify each role** (what business need does it serve?)

**4.2 Design permission check pattern:**

Propose the pattern to avoid IF hell:

```typescript
// In components
const { canWrite, canVoid } = usePermissions('sales');

return (
  <>
    {canWrite && <Button>New Sale</Button>}
    {canVoid && <Button>Void Order</Button>}
  </>
);
```

**4.3 Design integration with FeatureRegistry:**

```typescript
// Permission check should respect features
const { canWrite } = usePermissions('sales');
const { hasFeature } = useCapabilities();

// Feature OFF → Don't even check permissions
if (!hasFeature('sales_order_management')) return null;

// Feature ON → Check permissions
return canWrite && <Button>New Sale</Button>;
```

**4.4 Define permission matrix (simplified):**

| Module | Admin | Manager | Supervisor | Employee | Viewer |
|--------|-------|---------|------------|----------|--------|
| Sales | CRUD+V+C | CRU+V (all) | CRU (own) | CRU (own orders) | R |
| Materials | CRUD+C | CRU (all) | CRU (own) | - | - |
| ... | ... | ... | ... | ... | ... |

(V=Void, C=Configure)

---

### PHASE 5: ASK CLARIFYING QUESTIONS (10-15 min)

**Based on your findings, ask the user:**

1. **Role System Choice:**
   > "I found 2 permission systems in the code:
   > - System A (AuthContext): CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, SUPER_ADMIN
   > - System B (permissions.tsx): admin, manager, employee, cashier, kitchen, viewer
   >
   > Which one do you want to keep? Or should I propose a unified system?"

2. **Gastronomy-Specific Roles:**
   > "I see roles like 'kitchen' and 'cashier' in System B. Are these gastronomy-specific or do you want generic business roles?"

3. **Multi-Location Permissions:**
   > "Should users have different roles per location, or a single role with location-based data filtering?"

4. **Legacy Code:**
   > "I found [X files] using System A and [Y files] using System B. Should I:
   > - Migrate all to System A?
   > - Migrate all to System B?
   > - Create System C (unified)?"

5. **Feature-Permission Interaction:**
   > "Some features (like `sales_analytics`) should be Manager+ only. Should this be:
   > - Controlled by permission system?
   > - Controlled by FeatureRegistry with `requiredRole`?
   > - Hybrid (both)?"

6. **Current Gaps:**
   > "I noticed the existing systems don't integrate with:
   > - FeatureRegistry (86 features)
   > - Module manifests (27 modules)
   > - Multi-location support
   >
   > Do you want me to design this integration?"

---

### PHASE 6: UPDATE PRODUCTION_PLAN.md (20-30 min)

**6.1 Update Section 7 (Permission System Design):**

Replace the current Section 7 with:

```markdown
## 7. PERMISSION SYSTEM DESIGN

### 7.1 Current State Analysis

**Systems Found:**
- System A (AuthContext): [description]
- System B (permissions.tsx): [description]

**Conflicts Identified:**
- [List conflicts]

**Integration Gaps:**
- [List gaps with FeatureRegistry, Modules, etc.]

### 7.2 Architectural Decision

**Chosen Approach:** [Unified System C / Migrate to A / Migrate to B]

**Rationale:**
- [Why this approach]
- [How it integrates with Capabilities → Features → Modules]
- [How it handles multi-location]

### 7.3 Role Hierarchy (FINAL)

[Define 5-7 roles with business justification]

### 7.4 Permission Check Pattern (FINAL)

[Code example of usePermissions() hook]

### 7.5 Permission Matrix (FINAL)

[Complete matrix: Module × Role × Actions]

### 7.6 Integration with FeatureRegistry

[How permissions interact with hasFeature()]

### 7.7 Multi-Location Support

[How location-based permissions work]

### 7.8 Migration Plan

**Phase 2A: Consolidate Systems** (X hours)
- [ ] [Tasks to unify systems]

**Phase 2B: Integrate with Architecture** (X hours)
- [ ] [Tasks to integrate with FeatureRegistry, Modules]

**Phase 2C: Update Components** (X hours)
- [ ] [Tasks to update all components using old system]

### 7.9 Implementation Files

**New files to create:**
- `src/config/PermissionsRegistry.ts` - Unified permission definitions
- `src/hooks/usePermissions.ts` - Permission check hook
- [Other files]

**Files to modify:**
- [List files that need changes]

**Files to DELETE:**
- [List deprecated files]
```

**6.2 Update Section 9.2 (Phase 1):**

Add permission integration to pilot modules workflow:
```markdown
4. **Cross-Module Integration** (1 hour)
   - ...
   - Add permission checks to UI (usePermissions hook)
   - Test role-based rendering
```

---

## 📊 DELIVERABLES

At the end of this session, you MUST have:

1. ✅ **Complete analysis document** (can be in this chat or separate MD)
   - All systems found
   - All conflicts identified
   - All integration gaps listed

2. ✅ **Clarifying questions** asked to user (don't make assumptions)

3. ✅ **Proposed architecture** (with user approval)

4. ✅ **Updated PRODUCTION_PLAN.md Section 7** with FINAL decisions

5. ✅ **Migration checklist** ready for implementation

---

## ⚠️ CRITICAL RULES

1. **DO NOT assume** - If you find conflicting systems, ASK the user which to keep
2. **DO NOT delete code** yet - Only propose what to delete
3. **DO NOT implement** - This session is for INVESTIGATION and DECISION only
4. **DO integrate** - Ensure the chosen system works with:
   - FeatureRegistry (86 features)
   - BusinessModelRegistry (10 capabilities)
   - Module Registry (27 modules)
   - Multi-location support
5. **DO preserve context** - All decisions must be in PRODUCTION_PLAN.md for next session

---

## 📝 CONTEXT FROM PREVIOUS SESSION

**Decisions already made:**

1. **Documentation Strategy:**
   - Hybrid approach: 4-5 centralized docs + module READMEs
   - Focus on MAPPING cross-module relationships (not extensive docs)
   - Code is source of truth

2. **Pilot Modules Selected:**
   - Materials → Sales → Kitchen
   - Complete workflow: inventory → sell → prepare

3. **Production-Ready Criteria:**
   - 10-point checklist per module (see Section 3.1)
   - Zero unused components
   - Zero logic duplication
   - Cross-module relationships MUST be documented

4. **Architecture Pattern:**
   - Capabilities → Features → Modules (3-layer system)
   - Hook system for cross-module composition (WordPress-style)
   - Feature flags first, then permissions

**Files to read for context:**
- `PRODUCTION_PLAN.md` - Complete production plan
- `CLAUDE.md` - Project instructions
- `src/config/FeatureRegistry.ts` - 86 features
- `src/config/BusinessModelRegistry.ts` - 10 capabilities
- `src/modules/index.ts` - 27 modules

---

## 🚀 START HERE

**First action:**
```bash
# Read the production plan to understand the project
cat PRODUCTION_PLAN.md

# Then start Phase 1: Code Discovery
grep -r "role|permission" src/ --include="*.ts" --include="*.tsx" | wc -l
```

**Expected outcome:**
> "Found 168 files with role/permission references. Starting deep analysis..."

---

**Good luck! Remember: INVESTIGATE → ASK → DECIDE → DOCUMENT**
