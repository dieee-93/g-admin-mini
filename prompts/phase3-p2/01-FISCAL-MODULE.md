# 📄 FISCAL MODULE - Production Ready

**Module**: Fiscal (Tax & Invoicing)
**Phase**: Phase 3 P2 - Module 1/3
**Estimated Time**: 4-5 hours
**Priority**: P2 (Finance - depends on sales)

---

## 📋 OBJECTIVE

Make the **Fiscal module** production-ready following the 10-criteria checklist.

**Why this module**: Critical for tax compliance (Argentina AFIP), invoice generation, and financial reporting. Depends on Sales module.

---

## ✅ 10 PRODUCTION-READY CRITERIA

1. ✅ **Architecture compliant**: Follows Capabilities → Features → Modules
2. ✅ **Scaffolding ordered**: components/, services/, hooks/, types/ organized
3. ✅ **Zero errors**: 0 ESLint + 0 TypeScript errors in module
4. ✅ **UI complete**: Invoice generation, tax reports working
5. ✅ **Cross-module mapped**: README documents provides/consumes
6. ✅ **Zero duplication**: No repeated logic
7. ✅ **DB connected**: All operations via service layer
8. ✅ **Features mapped**: Clear activation from FeatureRegistry
9. ✅ **Permissions designed**: minimumRole + usePermissions + service layer
10. ✅ **README**: Cross-module integration documented

---

## 📂 MODULE FILES

### Core Files
- **Manifest**: `src/modules/fiscal/manifest.tsx`
- **Page**: `src/pages/admin/finance/fiscal/page.tsx`
- **Database Tables**: `invoices`, `tax_periods`

### Current Structure
```
src/pages/admin/finance/fiscal/
├── page.tsx                          # Main fiscal page
├── components/
│   ├── FiscalFormEnhanced.tsx        # Invoice creation form
│   ├── FiscalAnalyticsEnhanced.tsx   # Tax analytics
│   ├── TaxSummary.tsx                # Tax summary cards
│   ├── TaxCompliance/
│   │   └── TaxCompliance.tsx         # AFIP compliance
│   ├── InvoiceGeneration/
│   │   └── InvoiceGeneration.tsx     # Invoice generator
│   ├── FinancialReporting/
│   │   └── FinancialReporting.tsx    # Financial reports
│   └── OfflineFiscalView.tsx         # Offline fallback
├── hooks/
│   ├── useFiscalPage.ts              # Main page logic
│   └── index.ts
├── services/
│   └── taxCalculationService.ts      # Tax calculation logic
└── types/
    └── fiscalTypes.ts                # Type definitions
```

---

## 🔍 MODULE DETAILS

### Current Status (From Manifest)

**Metadata**:
- ✅ ID: `fiscal`
- ✅ minimumRole: `SUPERVISOR` (already set)
- ⚠️ Dependencies: Check if `['sales']` is correct
- ⚠️ Audit ESLint/TypeScript errors

**Hooks**:
- **PROVIDES**:
  - `fiscal.invoice_generated` - When invoice is created
  - `fiscal.tax_period_closed` - When tax period closes
  - `finance.integration_status` - Integration health

- **CONSUMES**:
  - `sales.order_completed` - Generate invoice from sale
  - `billing.payment_received` - Update invoice status

### Key Features

**Tax Compliance (Argentina AFIP)**:
- Invoice generation (Factura A, B, C)
- CUIT/CUIL validation
- IVA calculation (21%, 10.5%, 0%)
- Tax period management
- AFIP integration (WebService)

**Financial Reporting**:
- Monthly tax reports
- IVA books (purchases/sales)
- Balance sheets
- P&L statements

**Database Tables**:
```sql
-- invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  invoice_number TEXT UNIQUE,
  invoice_type TEXT, -- 'A', 'B', 'C'
  customer_id UUID REFERENCES customers(id),
  subtotal DECIMAL(12,2),
  tax_amount DECIMAL(12,2),
  total DECIMAL(12,2),
  status TEXT, -- 'draft', 'issued', 'paid', 'voided'
  afip_cae TEXT, -- AFIP authorization code
  afip_cae_expiration DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tax_periods table
CREATE TABLE tax_periods (
  id UUID PRIMARY KEY,
  period_start DATE,
  period_end DATE,
  status TEXT, -- 'open', 'closed'
  total_sales DECIMAL(14,2),
  total_purchases DECIMAL(14,2),
  iva_debit DECIMAL(14,2),
  iva_credit DECIMAL(14,2),
  net_iva DECIMAL(14,2),
  closed_at TIMESTAMPTZ
);
```

---

## 🎯 WORKFLOW (4-5 HOURS)

### 1. Audit (30 min)
- [ ] Read `src/modules/fiscal/manifest.tsx`
- [ ] Read `src/pages/admin/finance/fiscal/page.tsx`
- [ ] Check ESLint errors: `pnpm -s exec eslint src/modules/fiscal src/pages/admin/finance/fiscal`
- [ ] Check TypeScript errors: `pnpm -s exec tsc --noEmit`
- [ ] Map dependencies: Should depend on `['sales']`
- [ ] Verify tax calculation service exists

### 2. Fix Structure (1 hour)
- [ ] Fix manifest dependencies if incorrect
- [ ] Fix ESLint errors in module files
- [ ] Fix TypeScript errors
- [ ] Organize folder structure
- [ ] Remove unused components
- [ ] Verify minimumRole: 'SUPERVISOR'

### 3. Database & Functionality (1-2 hours)
- [ ] Verify `invoices` table exists in Supabase
- [ ] Verify `tax_periods` table exists
- [ ] Test invoice generation from sales
- [ ] Test tax calculation (IVA 21%, 10.5%, 0%)
- [ ] Test CUIT/CUIL validation
- [ ] Verify RLS policies on fiscal tables
- [ ] Test offline-first if applicable

### 4. Cross-Module Integration (1 hour)
- [ ] Create/update `fiscal/README.md`
- [ ] Document hook: `fiscal.invoice_generated`
- [ ] Document hook: `fiscal.tax_period_closed`
- [ ] Test integration with Sales module
- [ ] Test integration with Billing module
- [ ] Verify EventBus events
- [ ] Document AFIP integration flow

### 5. Validation (30 min)
- [ ] Run production-ready checklist (10 items)
- [ ] Test end-to-end: Sale → Invoice generation
- [ ] Verify 0 ESLint errors in module
- [ ] Verify 0 TypeScript errors in module
- [ ] Test tax compliance features
- [ ] Mark module as production-ready

---

## 🔧 SERVICE LAYER

### Tax Calculation Service

**File**: `src/pages/admin/finance/fiscal/services/taxCalculationService.ts`

**Key Functions**:
```typescript
export const taxService = {
  calculateIVA(subtotal: number, rate: number): number,
  calculateTotal(subtotal: number, ivaRate: number): number,
  validateCUIT(cuit: string): boolean,
  getInvoiceType(customer: Customer): 'A' | 'B' | 'C',
  generateInvoiceNumber(type: string): Promise<string>
};
```

**IVA Rates** (Argentina):
- 21% - General rate
- 10.5% - Reduced rate (certain foods)
- 0% - Exempt

---

## ⚠️ CRITICAL PATTERNS

### Tax Calculation (Decimal.js)
```typescript
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

// ✅ CORRECT - Use Decimal.js for money
const subtotal = DecimalUtils.fromValue(sale.subtotal ?? 0, 'monetary');
const ivaRate = 0.21; // 21%
const iva = subtotal.mul(ivaRate);
const total = subtotal.plus(iva);
```

### Invoice Generation
```typescript
// Listen to sales events
EventBus.subscribe('sales.order_completed', async (event) => {
  const invoice = await generateInvoice(event.data.sale);
  EventBus.emit('fiscal.invoice_generated', { invoice });
});
```

### AFIP Integration
```typescript
// Mock for now - real AFIP integration in Phase 4
const requestCAE = async (invoice: Invoice) => {
  // TODO: Connect to AFIP WebService
  return {
    cae: 'MOCK_CAE_12345678',
    caeExpiration: new Date()
  };
};
```

---

## 📚 REFERENCE IMPLEMENTATIONS

**Similar Patterns**:
- `src/pages/admin/operations/sales/services/taxCalculationService.ts` - Tax calculation
- `src/pages/admin/finance/billing/` - Billing module (similar patterns)

---

## 🎯 SUCCESS CRITERIA

- [ ] 0 ESLint errors in fiscal module
- [ ] 0 TypeScript errors
- [ ] Invoice generation working from sales
- [ ] Tax calculation verified (21%, 10.5%, 0%)
- [ ] CUIT validation working
- [ ] README with cross-module docs
- [ ] Permissions integrated (SUPERVISOR minimum)
- [ ] All 10 production-ready criteria met

---

**Estimated Time**: 4-5 hours
**Dependencies**: Sales module (must be production-ready)
**Next Module**: Billing (P2 Module 2/3)
