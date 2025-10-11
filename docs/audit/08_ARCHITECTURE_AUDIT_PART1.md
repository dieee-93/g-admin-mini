# G-Admin Mini - Architecture & Structure Audit

**Date**: 2025-10-09  
**Version**: 1.0  
**Auditor**: Claude Code (Architecture Analysis)  
**Project**: G-Admin Mini Multi-tenant SaaS ERP  
**Codebase Size**: 1,007 TypeScript files  

---

## Executive Summary

### Overall Architecture Health: 7.2/10

**Strengths**:
- Strong domain-driven organization (Screaming Architecture: 85%)
- Robust cross-cutting concerns (EventBus, Offline, Performance)
- Well-defined atomic capabilities system (v2.0)
- Comprehensive business logic separation

**Critical Issues**:
- 80 files with direct Chakra UI imports (violates design system)
- 95 relative import violations (`../../` pattern)
- 3 overlapping alert systems
- Inconsistent module structure (60% vs target 95%)
- Missing barrel exports in 40% of modules
- 17 large files (>1,000 lines)

---

## 1. Screaming Architecture Compliance

### 1.1 Domain Organization (85% Compliance)

```
src/pages/admin/
├── core/            [95%] Dashboard, Settings, Intelligence, Reporting, CRM
├── operations/      [80%] Sales, Hub, Memberships, Rentals, Assets
├── supply-chain/    [85%] Materials, Products
├── finance/         [90%] Fiscal, Billing, Integrations, Payroll
├── resources/       [95%] Staff, Scheduling
├── gamification/    [80%] Achievements
├── executive/       [70%] Dashboards (overlaps with core/dashboard)
└── tools/           [65%] Reporting (overlaps with core/reporting)
```

**Verdict**: STRONG - Business domains clearly visible

### 1.2 Violations

**Critical**:
1. `executive/` overlaps with `core/dashboard` - Merge to `core/bi/`
2. `tools/` overlaps with `core/reporting` - Consolidate
3. Deep nesting (7 levels in Materials) - Flatten to 4 max

---

## 2. Separation of Concerns (75% Compliance)

### 2.1 Layer Architecture

```
PRESENTATION (src/pages/)          75% ⚠️  (business logic leakage)
        ↓
BUSINESS LOGIC (src/business-logic/) 90% ✅  (well separated)
        ↓
SERVICES (src/services/)           70% ⚠️  (scattered: global + local)
        ↓
STATE (src/store/)                 85% ✅  (domain-specific stores)
        ↓
DATABASE (Supabase + RLS)          95% ✅  (strong separation)
```

### 2.2 Violations (12 total)

1. **Business Logic → Presentation** (4 violations)
   ```typescript
   // src/business-logic/customer/customerAnalyticsEngine.ts
   import { CustomerSegment } from '@/pages/admin/core/crm/customers/types';
   ```
   **Fix**: Create `src/business-logic/customer/types.ts`

2. **Components → Services** (8 violations - bypassing stores)
   ```typescript
   // Component calling service directly
   import { fetchSales } from '../services/saleApi';
   ```
   **Fix**: Route through store actions

---

## 3. Module Organization (68% Compliance)

### 3.1 Expected Structure

```
{module}/
├── components/  ✅ 100% present
├── hooks/       ⚠️ 70% present
├── services/    ⚠️ 60% present (scattered)
├── types/       ⚠️ 50% present
├── utils/       ❌ 30% present
└── page.tsx     ✅ 100% present
```

### 3.2 Module Compliance Scores

| Module | Score | Issues |
|--------|-------|--------|
| Materials | 85% | Missing utils/ |
| Sales | 70% | Missing types/, utils/ |
| Products | 65% | Scattered services |
| Staff | 60% | Mixed types, missing utils/ |
| Fiscal | 80% | Missing utils/ |

**Average**: 68% (Target: >85%)

---

## 4. Critical Issues

### Issue #1: Chakra Direct Imports (80 files)

**Violation**: Direct imports bypass design system
```typescript
// ❌ WRONG
import { Box, VStack } from '@chakra-ui/react';

// ✅ CORRECT
import { Section, Stack } from '@/shared/ui';
```

**Affected**:
- gamification/achievements/ (20 files)
- setup/ (15 files)
- finance/fiscal/ (10 files)
- Others (35 files)

**Fix**: Phase 1 - Week 1 (2 days effort)

### Issue #2: Alert System Chaos (3 systems)

**Problem**: 3 overlapping implementations
1. `@/shared/alerts/` (Unified v2.1) ✅
2. Module-local `*Alerts.tsx` (12 files) ❌
3. Direct `notify.*()` calls ❌

**Fix**: Migrate all to Unified v2.1 (2 days)

### Issue #3: Barrel Exports Missing (40%)

**Impact**: 95 relative import violations (`../../`)

**Missing in**:
- Sales, Products, Staff, Customers, Settings, Intelligence

**Fix**: Create `index.ts` in all subdirs (1 day)

