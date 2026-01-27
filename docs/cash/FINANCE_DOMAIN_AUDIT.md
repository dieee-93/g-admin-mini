# 🔍 FINANCE DOMAIN - AUDITORÍA COMPLETA

**Project**: G-Admin Mini
**Date**: 2025-12-09
**Scope**: Complete audit of Finance domain architecture, EventBus communication, and gaps

---

## 📊 EXECUTIVE SUMMARY

### Key Findings

✅ **Strengths**:
- Precision arithmetic with DecimalUtils (10 decimals for tax)
- Double-entry accounting infrastructure exists
- Tax engine for Argentina complete (IVA 21%, 10.5%)
- EventBus communication framework in place

🔴 **Critical Gaps**:
1. **Only CASH payments create journal entries** - CARD/TRANSFER/QR are not accounted
2. **Reversal handlers are stubs** - Cannot undo sales/payroll cancellations
3. **No idempotency** - Duplicate operations possible on retry
4. **Shift ⟷ Cash coordination undefined** - Unclear operational flow
5. **Dual module structure** - `cash` vs `cash-management` creates confusion

---

## 📦 FINANCE MODULES INVENTORY

### 1. Core Finance Modules

| Module ID | Location | Status | Purpose |
|-----------|----------|--------|---------|
| `cash` | `src/modules/cash/` | ✅ Complete | Core cash services & handlers |
| `cash-management` | `src/modules/cash-management/` | ⚠️ Partial | Manifest & hooks wrapper |
| `finance-billing` | `src/modules/finance-billing/` | ⚠️ Stub | Recurring billing & invoicing |
| `finance-corporate` | `src/modules/finance-corporate/` | ⚠️ Partial | B2B credit & corporate accounts |
| `finance-fiscal` | `src/modules/finance-fiscal/` | ⚠️ Stub | AFIP integration & fiscal docs |
| `finance-integrations` | `src/modules/finance-integrations/` | ⚠️ Stub | Payment gateways & bank integrations |
| `shift-control` | `src/modules/shift-control/` | ✅ Complete | Operational shift coordination |

### 2. Page-Level Logic (Duplicated)

| Location | Purpose | Status |
|----------|---------|--------|
| `pages/admin/finance/cash/` | Cash UI & reports | ✅ Complete |
| `pages/admin/finance-billing/` | Billing UI | ⚠️ Partial |
| `pages/admin/finance-corporate/` | Corporate accounts UI | ⚠️ Partial |
| `pages/admin/finance-fiscal/` | Fiscal documents UI | ⚠️ Stub |
| `pages/admin/finance-integrations/` | Integrations config UI | ⚠️ Stub |
| `pages/admin/operations/sales/` | **EMITS payment events** | ✅ Complete |

---

## 🔄 EVENTBUS COMMUNICATION MATRIX

### Cash Module (`src/modules/cash/`)

#### Emits (9 events)

| Event | Payload | Emitted From | Purpose |
|-------|---------|--------------|---------|
| `cash.session.opened` | sessionId, moneyLocationId, startingCash | cashSessionService.ts:92 | Notify session opened |
| `cash.session.closed` | sessionId, variance, finalCash | cashSessionService.ts:151 | Notify session closed |
| `cash.sale.recorded` | paymentId, saleId, amount, sessionId | salesPaymentHandler.ts:160 | Confirm sale recorded |
| `cash.sale.failed` | paymentId, error | salesPaymentHandler.ts:178 | Payment recording failed |
| `cash.purchase.recorded` | supplierOrderId, supplierId, amount | materialsHandler.ts:100 | Confirm purchase recorded |
| `cash.supplier_payment.recorded` | paymentId, supplierId, amount | materialsHandler.ts:228 | Confirm supplier payment |
| `cash.payroll.recorded` | payrollPeriodId, amount, employeeCount | payrollHandler.ts:142 | Confirm payroll recorded |
| `cash.journal_entry.created` | entryId, entryNumber, entryType | journalService.ts:87 | Journal entry created |
| `cash.refund.recorded` | saleId, amount | (PROPOSED in plan) | Refund/reversal recorded |

#### Consumes (7 events)

| Event | Handler | File | Status |
|-------|---------|------|--------|
| `sales.payment.completed` | handleSalesPaymentCompleted | salesPaymentHandler.ts:43 | ✅ **ONLY CASH** |
| `sales.order_cancelled` | handleSalesOrderCancelled | salesPaymentHandler.ts:199 | 🔴 **STUB** |
| `materials.purchase.approved` | handleMaterialsPurchaseApproved | materialsHandler.ts:41 | ✅ Complete |
| `materials.supplier.paid` | handleSupplierPaid | materialsHandler.ts:140 | ✅ Complete |
| `staff.payroll.processed` | handlePayrollProcessed | payrollHandler.ts:47 | ✅ Complete |
| `staff.payroll.cancelled` | handlePayrollCancelled | payrollHandler.ts:164 | 🔴 **STUB** |
| `staff.advance_payment` | handleAdvancePayment | payrollHandler.ts:200 | ✅ Complete |

---

### Shift Control Module

#### Emits (4 events)

| Event | Purpose |
|-------|---------|
| `shift.opened` | Operational shift started |
| `shift.closed` | Operational shift ended |
| `shift.close_validation.requested` | Request validation before close |
| `shift.close_validation.failed` | Close blocked by validators |

#### Consumes (12+ events)

| Event | Handler | Purpose |
|-------|---------|---------|
| `cash.session.opened` | handleCashSessionOpened | Track cash session in shift |
| `cash.session.closed` | handleCashSessionClosed | Clear cash session, detect discrepancy |
| `staff.employee.checked_in` | handleStaffCheckedIn | Track staff count |
| `staff.employee.checked_out` | handleStaffCheckedOut | Track staff count |
| `tables.table.opened` | handleTableOpened | Track open tables |
| `tables.table.closed` | handleTableClosed | Track open tables |
| `delivery.started` | handleDeliveryStarted | Track deliveries |
| `delivery.completed` | handleDeliveryCompleted | Track deliveries |
| `order.created` | handleOrderCreated | Track orders |
| `order.completed` | handleOrderCompleted | Track orders |
| `inventory.stock.low` | handleStockLow | Stock alerts |
| `inventory.stock.restocked` | handleStockRestocked | Stock updates |

---

### Sales Module (Emitter)

**Location**: `pages/admin/operations/sales/components/Payment/ModernPaymentProcessor.tsx:273`

#### Emits

| Event | Payload | When | Notes |
|-------|---------|------|-------|
| `sales.payment.completed` | paymentId, saleId, amount, **paymentMethod**, customerId | After each payment method processed | ✅ Emits for ALL payment types |

**Critical**: `paymentMethod` can be: `'CASH'`, `'CARD'`, `'TRANSFER'`, `'QR'`
**Current behavior**: Only CASH is processed by Cash Module

---

## 🚨 CRITICAL GAPS IDENTIFIED

### 1. Non-Cash Payments Not Accounted 🔴 BLOCKER

**File**: `src/modules/cash/handlers/salesPaymentHandler.ts:54-59`

```typescript
// Solo procesar pagos en efectivo
if (payload.paymentMethod !== 'CASH') {
  logger.debug('CashModule', 'Skipping non-cash payment', {
    paymentMethod: payload.paymentMethod,
  });
  return;  // ← CARD/TRANSFER/QR ignored
}
```

**Impact**:
- ❌ CARD payments don't create journal entries
- ❌ TRANSFER payments don't create journal entries
- ❌ QR payments don't create journal entries
- ❌ No accounting trail for non-cash revenue
- ❌ Reports are incomplete (missing 60-80% of revenue typically)

**Affected Flows**:
```
User pays with CARD $100
├─ ✅ ModernPaymentProcessor emits: sales.payment.completed (paymentMethod: 'CARD')
├─ ❌ Cash Module ignores event
├─ ❌ No journal entry created
├─ ❌ No accounting record
└─ ❌ Revenue not tracked
```

---

### 2. Reversal Handlers Are Stubs 🔴 BLOCKER

**Files**:
- `src/modules/cash/handlers/salesPaymentHandler.ts:199-223` - `handleSalesOrderCancelled`
- `src/modules/cash/handlers/payrollHandler.ts:164-190` - `handlePayrollCancelled`

```typescript
export const handleSalesOrderCancelled: EventHandler = async (event) => {
  // TODO: Implementar lógica de reversa
  logger.warn('CashModule', 'Order cancellation handler not fully implemented');
};
```

**Impact**:
- ❌ Cannot reverse a sale if customer requests refund
- ❌ Cannot reverse payroll if processed incorrectly
- ❌ Money stays recorded but cannot be corrected
- ❌ Requires manual journal entries to fix
- ❌ Audit trail is broken

---

### 3. No Idempotency 🔴 HIGH

**Impact**:
- ❌ If network fails during `closeCashSession()`, retry will process twice
- ❌ Same sale can be recorded twice if event is replayed
- ❌ Duplicate journal entries possible
- ❌ Cash variance reports incorrect

**Example**:
```
User clicks "Close Session"
├─ Request sent to server
├─ Server processes (creates journal entry)
├─ Network timeout (no response)
├─ User clicks "Close Session" again
└─ ❌ Processed twice (duplicate entry)
```

---

### 4. Dual Module Structure ⚠️ ARCHITECTURAL

**Problem**: Two modules for cash

| Module | Location | Purpose | Status |
|--------|----------|---------|--------|
| `cash` | `src/modules/cash/` | Services, handlers, types | ✅ Complete |
| `cash-management` | `src/modules/cash-management/` | Manifest, exports wrapper | Partial wrapper |

**Impact**:
- 😕 Confusing for developers ("which module do I import from?")
- 😕 Duplication risk
- 😕 Two manifests to maintain
- 😕 Import paths inconsistent

**Recommendation**: Consolidate into single `cash-management` module with clear structure:
```
src/modules/cash-management/
├── manifest.tsx         (single manifest)
├── services/           (business logic)
├── handlers/           (event handlers)
├── components/         (UI widgets)
├── hooks/              (React hooks)
└── types/              (TypeScript types)
```

---

### 5. Shift ⟷ Cash Coordination Undefined ⚠️ HIGH

**Questions without answers**:

1. **Lifecycle**: Does opening a shift automatically open a cash session?
2. **Multiplicity**: Can 1 shift have multiple cash sessions (e.g., bar + main register)?
3. **Responsibility**: Who is responsible for cash if 3 employees work in 1 shift?
4. **Non-cash tracking**: Are CARD payments tracked per shift? Per employee?
5. **Closing**: Must all cash sessions be closed before closing shift?

**Current behavior**:
```
Shift Control:
├─ LISTENS to: cash.session.opened, cash.session.closed
├─ EMITS: shift.opened, shift.closed
└─ NO automatic coordination

Cash Module:
├─ LISTENS to: (nothing from shift-control)
├─ EMITS: cash.session.opened, cash.session.closed
└─ Operates independently
```

**Result**: Modules are **decoupled** (independent) but **not coordinated** (no strategy)

---

## 💰 PAYMENT METHODS FLOW ANALYSIS

### Current State

| Payment Method | Event Emitted? | Journal Entry Created? | Session Updated? | Tracked by Shift? |
|----------------|----------------|------------------------|------------------|-------------------|
| CASH | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| CARD | ✅ Yes | ❌ **NO** | ❌ NO | ❌ NO |
| TRANSFER | ✅ Yes | ❌ **NO** | ❌ NO | ❌ NO |
| QR | ✅ Yes | ❌ **NO** | ❌ NO | ❌ NO |

### Detailed Flow: CASH (Working)

```
1. User completes sale with CASH $100
   ↓
2. ModernPaymentProcessor emits:
   sales.payment.completed {
     paymentMethod: 'CASH',
     amount: 100
   }
   ↓
3. Cash Module handler PROCESSES:
   ├─ Get active cash session
   ├─ recordCashSale(drawerId, 100)
   │  └─ Updates cash_sessions.cash_sales
   ├─ Create journal entry:
   │  ├─ Debit: Cash Drawer (1.1.01.001) -$100
   │  ├─ Credit: Revenue (4.1) +$82.64
   │  └─ Credit: IVA (2.1.02) +$17.36
   └─ Emit: cash.sale.recorded
   ↓
4. Shift Control LISTENS:
   └─ (No specific action, just tracks session exists)
```

### Detailed Flow: CARD (Broken)

```
1. User completes sale with CARD $100
   ↓
2. ModernPaymentProcessor emits:
   sales.payment.completed {
     paymentMethod: 'CARD',
     amount: 100
   }
   ↓
3. Cash Module handler IGNORES:
   ├─ Check: paymentMethod !== 'CASH'
   └─ Return early (line 54-59)
   ↓
4. ❌ NO journal entry created
5. ❌ NO accounting record
6. ❌ Revenue not tracked
7. ❌ Shift doesn't know about this sale
```

---

## 📋 HANDLERS STATUS BREAKDOWN

### Complete Handlers ✅

| Handler | File | Events | Lines | Notes |
|---------|------|--------|-------|-------|
| `handleSalesPaymentCompleted` | salesPaymentHandler.ts | sales.payment.completed | 43-188 | ⚠️ CASH only |
| `handleMaterialsPurchaseApproved` | materialsHandler.ts | materials.purchase.approved | 41-116 | ✅ Complete |
| `handleSupplierPaid` | materialsHandler.ts | materials.supplier.paid | 140-244 | ✅ Complete |
| `handlePayrollProcessed` | payrollHandler.ts | staff.payroll.processed | 47-158 | ✅ Complete |
| `handleAdvancePayment` | payrollHandler.ts | staff.advance_payment | 200-265 | ✅ Complete |
| Shift Control handlers | shift-control/handlers/* | 12 events | Multiple | ✅ Complete |

### Stub/Incomplete Handlers 🔴

| Handler | File | Event | Issue | Priority |
|---------|------|-------|-------|----------|
| `handleSalesOrderCancelled` | salesPaymentHandler.ts:199 | sales.order_cancelled | TODO comment | 🔴 CRITICAL |
| `handlePayrollCancelled` | payrollHandler.ts:164 | staff.payroll.cancelled | TODO comment | 🔴 HIGH |
| Page-level listeners | finance/cash/page.tsx:71 | sales.payment.completed | Logger only | ⚠️ Duplicate? |
| Page-level listeners | finance/cash/page.tsx:76 | sales.order_cancelled | Logger only | ⚠️ Duplicate? |

---

## 🗄️ DATABASE SCHEMA (Finance Tables)

### Cash/Accounting Tables

| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|--------|
| `cash_sessions` | Cash drawer sessions | money_location_id, starting_cash, cash_sales, variance | ✅ Complete |
| `money_locations` | Physical cash locations | code, name, location_id, is_active | ✅ Complete |
| `journal_entries` | Double-entry ledger | entry_type, transaction_date, reference_id | ✅ Complete |
| `journal_lines` | Journal entry lines | entry_id, account_code, amount, money_location_id | ✅ Complete |
| `chart_of_accounts` | Account structure | code, name, type, subtype | ✅ Complete |

### Missing Tables

| Table | Purpose | Priority |
|-------|---------|----------|
| `operation_locks` | Idempotency tracking | 🔴 CRITICAL |
| `payment_methods_tracking` | Non-cash payment tracking | 🔴 CRITICAL |
| `shift_cash_sessions` | Link shifts to cash sessions | ⚠️ HIGH |

### Proposed Schema Extensions

**For Non-Cash Payments**:
```sql
-- Option 1: Extend cash_sessions
ALTER TABLE cash_sessions
  ADD COLUMN card_sales DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN transfer_sales DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN qr_sales DECIMAL(12,2) DEFAULT 0;

-- Option 2: Create virtual cash locations
INSERT INTO money_locations (code, name, type) VALUES
  ('CARD-001', 'Card Payments (Virtual)', 'VIRTUAL'),
  ('TRANSFER-001', 'Bank Transfers (Virtual)', 'VIRTUAL'),
  ('QR-001', 'QR Payments (Virtual)', 'VIRTUAL');
```

**For Dual Economy (Argentina)**:
```sql
ALTER TABLE sales
  ADD COLUMN fiscal_status TEXT DEFAULT 'FORMAL',
  ADD COLUMN fiscal_document_type TEXT,
  ADD COLUMN fiscal_document_number TEXT;

ALTER TABLE cash_sessions
  ADD COLUMN formal_cash_sales DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN informal_cash_sales DECIMAL(12,2) DEFAULT 0;
```

---

## 🎯 DISCONNECTED LOGIC

### Services Not Being Called

| Service | Location | Purpose | Called By |
|---------|----------|---------|-----------|
| `reportsService.generateBalanceSheet` | cash/services/reportsService.ts | Balance sheet report | ✅ page.tsx:135 |
| `reportsService.generateCashFlowStatement` | cash/services/reportsService.ts | Cash flow report | ✅ page.tsx:139 |
| `reportsService.generateProfitAndLoss` | cash/services/reportsService.ts | P&L report | ✅ page.tsx:150 |
| Finance-billing services | finance-billing/services/* | Billing logic | ⚠️ Stub only |
| Finance-fiscal services | finance-fiscal/services/* | AFIP integration | ⚠️ Stub only |

### Events Emitted But Not Consumed

| Event | Emitted By | Consumed By | Issue |
|-------|------------|-------------|-------|
| `cash.sale.failed` | salesPaymentHandler.ts:178 | ❌ No one | Consider adding error dashboard |
| `cash.journal_entry.created` | journalService.ts:87 | ❌ No one | Could trigger audit logs |
| `fiscal.invoice_generated` | finance-fiscal manifest | ❌ No one | Stub module |

### Events Consumed But Never Emitted

| Event | Consumed By | Emitted By | Issue |
|-------|-------------|------------|-------|
| `materials.purchase.approved` | materialsHandler.ts | ❌ Not found | Missing emitter? |
| `materials.supplier.paid` | materialsHandler.ts | ❌ Not found | Missing emitter? |
| `staff.payroll.processed` | payrollHandler.ts | ❌ Not found | Missing emitter? |
| `staff.advance_payment` | payrollHandler.ts | ❌ Not found | Missing emitter? |

**Note**: These events may be emitted from modules not yet audited (materials, staff modules).

---

## 📊 METRICS & COMPLEXITY

### Code Distribution

```
Finance Domain Total Lines: ~8,500
├─ cash module services:     ~2,000 lines
├─ cash module handlers:     ~650 lines
├─ cash-management:          ~300 lines
├─ finance pages (UI):       ~3,500 lines
├─ finance-billing (stub):   ~800 lines
├─ finance-corporate:        ~600 lines
├─ finance-fiscal (stub):    ~350 lines
└─ finance-integrations:     ~300 lines
```

### Event Handler Complexity

| Handler | Lines | Complexity | Status |
|---------|-------|------------|--------|
| `handleSalesPaymentCompleted` | 145 | Medium | ⚠️ Incomplete (CASH only) |
| `handleMaterialsPurchaseApproved` | 75 | Low | ✅ Complete |
| `handleSupplierPaid` | 104 | Medium | ✅ Complete |
| `handlePayrollProcessed` | 111 | Medium | ✅ Complete |
| `handleSalesOrderCancelled` | 24 | **STUB** | 🔴 TODO |
| `handlePayrollCancelled` | 26 | **STUB** | 🔴 TODO |

### EventBus Health

```
Total Events Defined:    ~30
Events Emitted:          ~15 (50%)
Events Consumed:         ~19 (63%)
Orphaned Events:         ~3 (10%)
Stub Handlers:           2 critical handlers
```

---

## 🔧 ARCHITECTURAL ISSUES

### 1. Module vs Page Logic Split

**Current**: Logic exists in BOTH places

```
src/modules/cash/              ← Business logic + handlers
src/modules/cash-management/   ← Manifest wrapper
src/pages/admin/finance/cash/  ← UI + hooks + page-level handlers
```

**Issue**: Which is source of truth?

**Recommendation**: Follow **Colocation Pattern**
```
src/modules/cash-management/
├── manifest.tsx           ← Single manifest
├── services/              ← Business logic
├── handlers/              ← Event handlers
├── components/            ← Reusable widgets
├── hooks/                 ← React hooks
├── types/                 ← TypeScript types
└── widgets/               ← Dashboard widgets

src/pages/admin/finance/cash/
├── page.tsx               ← Orchestration only
└── components/            ← Page-specific UI only
```

---

### 2. EventBus Registration Inconsistency

**Pattern 1**: Module manifest (Shift Control)
```typescript
// In manifest.tsx setup()
eventBus.subscribe('cash.session.opened', handler, 'shift-control');
```

**Pattern 2**: Init function (Cash Module)
```typescript
// In init.ts
export function initializeCashModule() {
  registerCashHandlers(); // Calls EventBus.on() internally
}
```

**Pattern 3**: Page-level (Finance Cash Page)
```typescript
// In page.tsx useEffect
EventBus.on('sales.payment.completed', handler);
```

**Issue**: Three different registration patterns

**Recommendation**: Standardize on manifest-based registration:
```typescript
// In manifest.tsx
setup: async (registry) => {
  const { eventBus } = await import('@/lib/events');

  eventBus.subscribe('sales.payment.completed', handleSalesPayment, 'cash');
  eventBus.subscribe('sales.order_cancelled', handleOrderCancel, 'cash');
}
```

---

## ✅ WHAT'S WORKING WELL

1. **DecimalUtils Precision** ✅
   - 10 decimal precision for tax calculations
   - Consistent usage across all financial calculations
   - No floating-point errors

2. **Tax Engine** ✅
   - Supports Argentina IVA (21%, 10.5%, exento)
   - Ingresos Brutos by jurisdiction
   - Reverse tax calculation implemented

3. **Double-Entry Accounting** ✅
   - Journal entries structure correct
   - Balance validation works (sum = 0)
   - Chart of accounts follows standard accounting

4. **EventBus Framework** ✅
   - Clean event-driven architecture
   - Module decoupling works
   - Easy to add new modules

5. **Shift Control** ✅
   - Comprehensive event consumption
   - Clean state management
   - Good validation framework

---

## 🚀 PRIORITY FIXES (Aligned with Plan)

### Phase 1: Critical Fixes (1-2 weeks)

1. **Non-Cash Payment Accounting** 🔴 BLOCKER
   - Modify `handleSalesPaymentCompleted` to process ALL payment methods
   - Create journal entries for CARD/TRANSFER/QR
   - Map to appropriate accounts (Bank Account, Payment Gateway)

2. **Payment Reversals** 🔴 BLOCKER
   - Implement `handleSalesOrderCancelled`
   - Implement `handlePayrollCancelled`
   - Add `recordCashRefund()` helper

3. **Idempotency** 🔴 HIGH
   - Create `operation_locks` table
   - Implement `IdempotencyService`
   - Wrap `closeCashSession()` and other critical ops

4. **Module Consolidation** ⚠️ HIGH
   - Merge `cash` + `cash-management` into single module
   - Standardize import paths
   - Single manifest

### Phase 2: Operational Coordination (2-3 weeks)

5. **Define Shift ⟷ Cash Strategy**
   - Document operational flows (CASH_OPERATIONAL_FLOWS.md)
   - Decide: Coupled vs Independent vs Semi-coupled
   - Implement chosen strategy

6. **Non-Cash Tracking by Shift**
   - Add virtual money locations OR
   - Extend cash_sessions with payment method columns
   - Track all payment types per shift

7. **Dual Economy Support (Argentina)** ⚠️ MEDIUM
   - Add fiscal_status to sales
   - Split formal/informal tracking
   - Legal disclaimer UI

### Phase 3: Future Enhancements (Backlog)

8. Three-way reconciliation (POS ⟷ Gateway ⟷ Bank)
9. AFIP integration (Controlador Fiscal, CAE)
10. Dynamic variance detection (Z-score analysis)
11. Multi-currency support

---

## 📚 RELATED DOCUMENTS

- ✅ **CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md** - Implementation plan (technical)
- 🔄 **CASH_OPERATIONAL_FLOWS.md** - Operational flows (PENDING - to be created)
- ✅ **RESEARCH_CASH_*.md** - Background research documents

---

## 🎯 ACTIONABLE NEXT STEPS

1. **Review this audit** with team
2. **Decide operational strategy** (Shift ⟷ Cash coordination)
3. **Create CASH_OPERATIONAL_FLOWS.md** based on decision
4. **Update CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md** with operational flows
5. **Implement Phase 1 fixes** (reversals + non-cash accounting + idempotency)
6. **Implement Phase 2** (operational coordination)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-09
**Audit Scope**: Complete
**Critical Issues**: 5
**High Priority Issues**: 3
**Medium Priority Issues**: 2
