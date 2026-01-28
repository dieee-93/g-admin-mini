# Finance Modules Consolidation Audit

**Date**: 2026-01-28
**Purpose**: Audit finance-billing and finance-fiscal before merging into billing/

---

## finance-billing/ Files

### Components (2)
- `components/BillingWidget.tsx`
- `components/CustomerBillingSection.tsx`

### Manifest
- `manifest.tsx`

**Total Files**: 3

---

## finance-fiscal/ Files

### Components (1)
- `components/FiscalWidget.tsx`

### Hooks (3)
- `hooks/index.ts`
- `hooks/useFiscalDocumentValidation.ts`
- `hooks/useTaxConfig.ts`

### Manifest
- `manifest.tsx`

**Total Files**: 5

---

## Merge Strategy

### billing/ will contain:

**From finance-billing:**
- ✅ BillingWidget.tsx → keep as-is
- ✅ CustomerBillingSection.tsx → keep as-is

**From finance-fiscal:**
- ✅ FiscalWidget.tsx → keep as-is
- ✅ useFiscalDocumentValidation.ts → keep as-is
- ✅ useTaxConfig.ts → keep as-is
- ✅ hooks/index.ts → merge with billing hooks

### Naming Conventions:
- Billing-related: keep "Billing" prefix
- Fiscal-related: keep "Fiscal" prefix
- Clear separation between billing and fiscal features

### Expected Conflicts:
- ❌ No naming conflicts detected
- ❌ No overlapping functionality detected

### Directory Structure for billing/:
```
src/modules/billing/
├── manifest.tsx (new consolidated)
├── components/
│   ├── BillingWidget.tsx (from finance-billing)
│   ├── CustomerBillingSection.tsx (from finance-billing)
│   └── FiscalWidget.tsx (from finance-fiscal)
├── hooks/
│   ├── index.ts (merged from both)
│   ├── useFiscalDocumentValidation.ts (from finance-fiscal)
│   └── useTaxConfig.ts (from finance-fiscal)
└── index.ts (new exports)
```

---

## Decision: PROCEED with consolidation
Both modules are small, no conflicts, straightforward merge.
