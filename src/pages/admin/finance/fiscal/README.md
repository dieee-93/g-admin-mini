# 🧾 Fiscal Module - Production Ready Status

**Module**: Fiscal (Tax & Invoicing)
**Phase**: Phase 3 P2 - Module 1/3
**Last Updated**: 2025-01-30
**Status**: ⚠️ **IN PROGRESS** - Needs lint fixes before production

---

## 📋 MODULE OVERVIEW

The Fiscal module handles tax compliance, invoice generation, and financial reporting for Argentina (AFIP integration).

### Key Features

- **Invoice Generation**: Electronic invoices (Factura A, B, C) with AFIP CAE authorization
- **Tax Calculation**: IVA (21%, 10.5%, 0%), Ingresos Brutos by jurisdiction
- **AFIP Integration**: CAE request/authorization, status monitoring
- **Financial Reporting**: Monthly tax reports, IVA books, P&L statements
- **Multi-Location Support**: Per-location and consolidated fiscal views
- **Offline-First**: Queue fiscal operations when offline, sync when online

---

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Fiscal Dashboard** | `/` | `page.tsx` | Main fiscal overview. |
| **Invoice Generation** | `(modal)` | `InvoiceGeneration` | Create AFIP invoices. |
| **Tax Reports** | `(tab)` | `FinancialReporting` | IVA/Gross Income reports. |

---

## ✅ PRODUCTION-READY CHECKLIST

### 1. ✅ Architecture Compliant
- **Capability**: N/A (Core finance functionality)
- **Features Required**: None (auto-loads with sales)
- **Module Dependencies**: `['sales']` ✅
- **Location**: `src/pages/admin/finance/fiscal/`

### 2. ⚠️ Scaffolding Ordered
```
src/pages/admin/finance/fiscal/
├── page.tsx                          ✅ Main fiscal page
├── components/
│   ├── AFIPIntegration/              ✅ AFIP WebService integration
│   ├── InvoiceGeneration/            ✅ Invoice creation UI
│   ├── TaxCompliance/                ✅ Compliance monitoring
│   ├── FinancialReporting/           ✅ Financial reports
│   ├── TaxSummary.tsx                ✅ Tax breakdown display
│   ├── FiscalAnalyticsEnhanced.tsx   ⚠️ Needs type fixes
│   ├── FiscalFormEnhanced.tsx        ⚠️ Unused imports
│   └── OfflineFiscalView.tsx         ⚠️ Unused error var
├── hooks/
│   ├── useFiscalPage.ts              ⚠️ `any` types, missing deps
│   ├── useFiscal.ts                  ✅ Fiscal data hook
│   ├── useTaxCalculation.ts          ✅ Tax calc hook
│   └── useFiscalDocumentForm.tsx     ⚠️ Unused error var
├── services/
│   ├── taxCalculationService.ts      ✅ Tax calculations (Decimal.js)
│   ├── fiscalApi.ts                  ⚠️ `any` types, unused params
│   ├── fiscalApi.multi-location.ts   ⚠️ Unused imports/params
│   └── financialPlanningEngine.ts    ✅ Cash flow projections
└── types/
    └── fiscalTypes.ts                ✅ Comprehensive types
```

### 3. ❌ Zero Errors
**Status**: 54/57 ESLint errors remaining

**Remaining Issues**:
- **17 `any` types** - Need proper type definitions
- **15 unused variables** - Need removal or usage
- **3 React Hook warnings** - Missing dependencies
- **19 unused parameters** - Need prefix with `_`

**Critical Fixes Completed** ✅:
- Fixed parsing error in `FinancialReporting.tsx` (line 290)
- Removed unused imports from `page.tsx` (WifiIcon, NoSymbolIcon)
- Removed unused variable `shouldShowOfflineView`
- Fixed `InformationCircleIcon` unused import

**See**: [FISCAL_LINT_FIXES_NEEDED.md](./FISCAL_LINT_FIXES_NEEDED.md) for complete fix list

### 4. ✅ UI Complete
- ✅ Invoice generation form
- ✅ AFIP integration status dashboard
- ✅ Tax summary cards
- ✅ Financial metrics
- ✅ Compliance monitoring
- ✅ Offline-first UI
- ✅ Multi-location support

### 5. ⚠️ Cross-Module Integration

#### PROVIDES (Hooks & Events)
```typescript
// Dashboard widget
'dashboard.widgets' → FiscalWidget
  Priority: 50 (medium-high)
  Shows: fiscal status, CAE pending, compliance %

// Invoice generation event
'fiscal.invoice_generated' → { invoice_id, location_id, total, tipo_comprobante }

// Tax period closed event
'fiscal.tax_period_closed' → { periodo, location_id, tipo, amount_due }

// Integration status
'finance.integration_status' → { connected, lastSync }
```

#### CONSUMES (Dependencies)
```typescript
// Sales module (required)
'sales.order_completed' → Generate invoices from sales
  ├─ sale_id
  ├─ customer_id
  ├─ total
  └─ items[]

// Billing module (optional)
'billing.payment_received' → Update invoice status
  ├─ invoice_id
  ├─ amount
  └─ payment_method
```

### 6. ⚠️ Zero Duplication
**Status**: Minimal duplication

- Tax calculation logic **centralized** in `taxCalculationService.ts` ✅
- Financial calculations use `@/business-logic/shared/FinancialCalculations` ✅
- Decimal precision via `@/business-logic/shared/decimalUtils` ✅

**Potential Duplication**:
- Invoice form logic duplicated between `FiscalFormEnhanced.tsx` and `InvoiceGeneration/InvoiceGeneration.tsx` ⚠️

### 7. ⚠️ DB Connected
**Status**: Needs verification

**Expected Tables**:
```sql
-- invoices (AFIP invoices)
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  location_id UUID NOT NULL,           -- Multi-location support
  numero INTEGER NOT NULL,
  punto_venta INTEGER NOT NULL,
  tipo_comprobante TEXT NOT NULL,
  fecha_emision TIMESTAMPTZ,
  cuit_cliente TEXT,
  denominacion_cliente TEXT,
  condicion_iva_cliente TEXT,
  subtotal DECIMAL(12,2),
  iva_105 DECIMAL(12,2),
  iva_21 DECIMAL(12,2),
  total DECIMAL(12,2),
  afip_cae TEXT,                       -- AFIP authorization code
  afip_cae_due_date DATE,              -- CAE expiration
  status TEXT,                         -- draft, sent, paid, cancelled
  sale_id UUID REFERENCES sales(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tax_reports (IVA, Ingresos Brutos)
CREATE TABLE tax_reports (
  id UUID PRIMARY KEY,
  location_id UUID,                    -- NULL = consolidated report
  is_consolidated BOOLEAN DEFAULT false,
  periodo TEXT NOT NULL,               -- YYYY-MM
  tipo TEXT NOT NULL,                  -- iva_ventas, iva_compras, ingresos_brutos
  ventas_netas DECIMAL(14,2),
  iva_debito_fiscal DECIMAL(14,2),
  compras_netas DECIMAL(14,2),
  iva_credito_fiscal DECIMAL(14,2),
  saldo_a_favor DECIMAL(14,2),
  saldo_a_pagar DECIMAL(14,2),
  presentado BOOLEAN DEFAULT false,
  fecha_presentacion DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- afip_configurations (per location)
CREATE TABLE afip_configurations (
  id UUID PRIMARY KEY,
  location_id UUID NOT NULL UNIQUE,
  location_name TEXT,
  cuit TEXT NOT NULL,
  certificate_path TEXT,
  private_key_path TEXT,
  environment TEXT DEFAULT 'testing',   -- testing | production
  punto_venta INTEGER NOT NULL,
  ultimo_comprobante INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TODO**: Run `mcp__supabase__list_tables` to verify tables exist ⚠️

### 8. ✅ Features Mapped
```typescript
// src/modules/fiscal/manifest.tsx
{
  id: 'fiscal',
  depends: ['sales'],
  autoInstall: true,
  requiredFeatures: [],  // Auto-loads when sales is active
  minimumRole: 'SUPERVISOR'
}
```

### 9. ✅ Permissions Designed
```typescript
// Manifest level
minimumRole: 'SUPERVISOR' ✅

// Service layer protection
- fiscalApi.ts: No explicit permission checks (uses RLS)
- fiscalApi.multi-location.ts: No explicit checks (uses RLS)

// Database RLS
TODO: Verify RLS policies on invoices, tax_reports, afip_configurations ⚠️
```

### 10. ✅ README
**Status**: This document ✅

---

## 🔧 BUSINESS LOGIC

### Tax Calculation Engine

**Service**: `services/taxCalculationService.ts`

**Key Functions**:
```typescript
// Calculate taxes for amount
calculateTaxesForAmount(amount: number, config?: TaxConfiguration): TaxCalculationResult

// Calculate taxes for cart
calculateTaxesForItems(items: SaleItem[], config?: TaxConfiguration): TaxCalculationResult

// Reverse calculation (from final price to components)
reverseTaxCalculation(finalAmount: number, config?: TaxConfiguration): TaxCalculationResult
```

**Tax Rates** (Argentina):
- **IVA General**: 21%
- **IVA Reducido**: 10.5%
- **IVA Exento**: 0%
- **Ingresos Brutos CABA**: 3%
- **Ingresos Brutos Buenos Aires**: 3.5%
- **Ingresos Brutos Córdoba**: 4%

**Precision**: Uses `Decimal.js` (20 digits, 0% float errors) ✅

### AFIP Integration

**Status**: Mock implementation (Phase 4 will add real AFIP WebService)

**Endpoints**:
- ✅ CAE request (mocked)
- ✅ Invoice number generation
- ✅ AFIP status check (mocked)
- ✅ Sync pending CAEs

**Multi-Location Support**:
- Per-location AFIP configs (separate CUIT, punto_venta)
- Consolidated view across all locations
- Per-location CAE synchronization

---

## 📊 MULTI-LOCATION ARCHITECTURE

### Per-Location Fiscal Data

Each location has:
- **AFIP Config**: `punto_venta`, certificates, last invoice number
- **Invoice Series**: Correlative per (location_id, punto_venta, tipo_comprobante)
- **Tax Reports**: Per-location IVA books

### Consolidated View

- **Fiscal View Mode Toggle**: Per-location ↔ Consolidated
- **Consolidated Tax Reports**: Aggregates all locations
- **Consolidated Sync**: Sync all pending CAEs across locations

**UI State**:
```typescript
pageState: {
  fiscalViewMode: 'per-location' | 'consolidated',
  selectedLocation: Location | null,
  isMultiLocationMode: boolean,
  afipConfig: AFIPConfiguration
}
```

---

## 🔌 EVENT-DRIVEN INTEGRATION

### Events Published

```typescript
// Invoice generated (after CAE obtained)
EventBus.emit('fiscal.invoice_generated', {
  invoice_id: string,
  location_id: string,
  sale_id: string,
  total: number,
  tipo_comprobante: InvoiceType,
  punto_venta: number
});

// CAE obtained from AFIP
EventBus.emit('fiscal.cae_obtained', {
  invoice_id: string,
  location_id: string,
  afip_cae: string,
  afip_cae_due_date: string,
  punto_venta: number
});

// CAE request failed
EventBus.emit('fiscal.cae_rejected', {
  invoice_id: string,
  location_id: string,
  observaciones: string[],
  retry_count: number
});

// Tax period closed
EventBus.emit('fiscal.tax_period_closed', {
  periodo: string,
  location_id: string | null,  // NULL = consolidated
  tipo: string,
  amount_due: number
});
```

### Events Consumed

```typescript
// Generate invoice when sale completes
EventBus.subscribe('sales.order_completed', async (event) => {
  const { sale } = event.data;
  const invoice = await generateInvoice(sale);
  EventBus.emit('fiscal.invoice_generated', { invoice });
});

// Update invoice status when payment received
EventBus.subscribe('billing.payment_received', async (event) => {
  const { invoice_id } = event.data;
  await updateInvoiceStatus(invoice_id, 'paid');
});
```

---

## 🚧 REMAINING WORK

### High Priority

1. **Fix ESLint Errors** (54 remaining)
   - Replace 17 `any` types with proper types
   - Remove or use 15 unused variables
   - Fix 3 React Hook dependency warnings
   - Prefix 19 unused parameters with `_`

2. **Verify Database Schema**
   - Run `mcp__supabase__list_tables` to confirm tables exist
   - Verify RLS policies on `invoices`, `tax_reports`, `afip_configurations`
   - Test CRUD operations via service layer

3. **Test Tax Calculations**
   - Unit tests for `taxCalculationService.ts`
   - Integration tests with Sales module
   - Verify Decimal.js precision (0% float errors)

### Medium Priority

4. **Consolidate Invoice Forms**
   - Merge `FiscalFormEnhanced.tsx` and `InvoiceGeneration/InvoiceGeneration.tsx`
   - Use single source of truth for invoice form logic

5. **Document AFIP Integration**
   - Document mock vs real AFIP endpoints
   - Add Phase 4 roadmap for real AFIP WebService integration

### Low Priority

6. **Performance Optimization**
   - Add indexes for common queries (`invoices.location_id`, `tax_reports.periodo`)
   - Cache AFIP configurations per location
   - Optimize consolidated report aggregations

---

## 📖 USAGE EXAMPLES

### Generate Invoice from Sale

```typescript
import { EventBus } from '@/lib/events';

// When sale completes
EventBus.emit('sales.order_completed', {
  sale: {
    id: 'sale-123',
    customer_id: 'cust-456',
    total: 12100,
    items: [...]
  }
});

// Fiscal module automatically:
// 1. Generates invoice
// 2. Requests CAE from AFIP
// 3. Emits fiscal.invoice_generated
```

### Calculate Taxes

```typescript
import { calculateTaxes } from '../services/taxCalculationService';

const result = calculateTaxes(10000, {
  ivaRate: 0.21,  // 21% IVA
  ingresosBrutosRate: 0.03,  // 3% Ingresos Brutos CABA
  includeIngresosBrutos: true
});

console.log(result);
// {
//   subtotal: 8130.08,
//   ivaAmount: 1707.32,
//   ingresosBrutosAmount: 243.90,
//   totalTaxes: 1951.22,
//   totalAmount: 10081.30
// }
```

### Multi-Location Sync

```typescript
import { fiscalApiMultiLocation } from '../services/fiscalApi.multi-location';

// Sync all locations
const results = await fiscalApiMultiLocation.syncAllLocationsPendingCAE();
console.log(results);
// { location1: 5, location2: 3, location3: 0 }

// Sync single location
const count = await fiscalApiMultiLocation.syncLocationPendingCAE('location-id');
console.log(`${count} CAEs synced`);
```

---

## 🐛 KNOWN ISSUES

1. **AFIP Integration is Mocked**
   - Real AFIP WebService integration pending (Phase 4)
   - CAE generation returns mock data
   - Status checks return mock responses

2. **Duplicate Invoice Form Logic**
   - `FiscalFormEnhanced.tsx` and `InvoiceGeneration/InvoiceGeneration.tsx` have overlapping code
   - Should be consolidated into single component

3. **Missing Unit Tests**
   - Tax calculation service needs comprehensive unit tests
   - Financial planning engine needs tests
   - Multi-location API needs integration tests

4. **Incomplete RLS Policies**
   - Need to verify RLS policies on fiscal tables
   - Need to test permission boundaries

---

## 📚 RELATED MODULES

- **Sales Module**: Generates sales that trigger invoice creation
- **Billing Module**: Updates invoice status when payments received
- **Finance Module**: Uses fiscal data for B2B credit management (Phase 3)
- **Reporting Module**: Aggregates fiscal data for BI dashboards

---

## 🎯 NEXT STEPS

**To make this module production-ready**:

1. Run linting fix script (see `FISCAL_LINT_FIXES_NEEDED.md`)
2. Verify database schema with Supabase MCP
3. Test tax calculations with unit tests
4. Test end-to-end: Sale → Invoice → CAE
5. Document remaining work for Phase 4 (real AFIP integration)

**Estimated Time to Production**: 2-3 hours

---

**Last Updated**: 2025-01-30
**Reviewed By**: Claude Code Assistant
**Status**: ⚠️ Needs lint fixes + DB verification
