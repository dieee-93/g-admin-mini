# 💰 CASH & FINANCIAL SYSTEM INTEGRATION - MASTER PROMPT

**Project**: G-Admin Mini
**Domain**: Finance & Cash Management
**Status**: Core ✅ Complete | Integration ⚠️ Partial | Debt 🔴 Critical
**Priority**: 🔴 HIGH - Financial accuracy and security critical

---

## 📋 EXECUTIVE SUMMARY

El sistema de cash management en G-Admin Mini tiene una **arquitectura sólida** con double-entry accounting, cash sessions, y event-driven integration. Sin embargo, existen **gaps críticos** en:

1. **Deuda Técnica**: Reversiones de transacciones (cancelaciones) no implementadas
2. **Sincronización**: Integración parcial entre módulos finance
3. **Centralización**: No existe un servicio unificado de cash/payment reconciliation
4. **Seguridad**: Falta audit trail completo y validación de permisos granular
5. **Precisión**: Variance threshold fijo, sin reconciliación automática

**Objetivo**: Completar la integración del sistema financiero, eliminar deuda técnica, y asegurar precisión/seguridad en el manejo de dinero.

---

## 🏗️ ARQUITECTURA ACTUAL

### Módulos Finance

```
src/modules/
├── cash/                           ✅ COMPLETE - Core accounting engine
│   ├── types/                      # Cash sessions, journal entries, accounts
│   ├── services/                   # cashSessionService, journalService, reports
│   ├── handlers/                   # Event handlers (sales, materials, payroll)
│   ├── init.ts                     # Module initialization
│   └── components/                 # Chart of accounts, locations UI
│
├── cash-management/                ✅ COMPLETE - Public interface
│   ├── manifest.tsx                # Module manifest with hookpoints
│   ├── hooks/useCashSession.ts     # React hook for session management
│   └── widgets/                    # CashSessionIndicator (shift integration)
│
├── finance-corporate/              ✅ COMPLETE - B2B accounts
│   ├── services/                   # Corporate accounts, credit, payment terms
│   ├── components/                 # AR aging, credit tracker
│   └── manifest.tsx                # Event subscriptions (sales, invoices, payments)
│
├── finance-billing/                ✅ COMPLETE - Invoicing & subscriptions
│   ├── components/                 # Billing widget, customer billing section
│   └── manifest.tsx                # Invoice generation, payment processing
│
└── finance-fiscal/                 ⚠️ MINIMAL - Tax/fiscal documents
    └── manifest.tsx                # Placeholder

src/pages/admin/finance/cash/       ✅ COMPLETE - Cash management UI
├── page.tsx                        # Main cash page with tabs
├── components/                     # Session manager, reports, modals
└── hooks/                          # useCashPage, useCashData, useCashActions

src/store/
├── cashStore.ts                    ✅ COMPLETE - Zustand store (optimized)
└── paymentsStore.ts                ✅ COMPLETE - Payment methods & gateways
```

### EventBus Integration

```
┌─────────────────────────────────────────────────────────────┐
│                     EVENT BUS (Central Hub)                  │
├─────────────────────────────────────────────────────────────┤
│ CONSUMED BY CASH MODULE:                                    │
│ ← sales.payment.completed         ✅ Handled                │
│ ← sales.order_cancelled           🔴 TODO: Reversal stub    │
│ ← materials.purchase.approved     ✅ Handled                │
│ ← materials.supplier.paid         ✅ Handled                │
│ ← staff.payroll.processed         ✅ Handled                │
│ ← staff.payroll.cancelled         🔴 TODO: Reversal stub    │
│ ← staff.advance_payment           ✅ Handled                │
│                                                              │
│ EMITTED BY CASH MODULE:                                     │
│ → cash.session.opened             ✅ Used by ShiftControl   │
│ → cash.session.closed             ✅ Used by ShiftControl   │
│ → cash.session.discrepancy        ⚠️ Not consumed yet       │
│ → cash.sale.recorded              ⚠️ Not consumed yet       │
│ → cash.journal_entry.created      ⚠️ Not consumed yet       │
└─────────────────────────────────────────────────────────────┘
```

### Double-Entry Accounting System

**Chart of Accounts**:
```
1.x    Assets
  1.1  Current Assets
    1.1.01   Cash
      1.1.01.001  Cash Drawer       ← CRITICAL for operations
      1.1.01.002  Safe              ← Drops destination
      1.1.01.003  Bank              ← Deposits destination
    1.1.02  Accounts Receivable     ← B2B customers

2.x    Liabilities
  2.1  Accounts Payable
    2.1.01  AP - Suppliers          ← Purchase tracking
    2.1.02  Taxes Payable (IVA)     ← Tax automation

4.x    Revenue
  4.1  Sales Revenue               ← Credit on sales

5.x    Expenses
  5.1  COGS (materials)            ← Debit on purchases
  5.2  Payroll                     ← Debit on payroll
  5.9  Cash Variance               ← Adjustment account
```

**Journal Entry Flow**:
```
Sales Payment (CASH):
  Debit:  1.1.01.001 (Cash Drawer)  +$100
  Credit: 4.1 (Revenue)              -$87 (net)
  Credit: 2.1.02 (IVA Payable)       -$13 (tax)

Material Purchase:
  Debit:  5.1 (COGS)                +$50
  Credit: 2.1.01 (AP - Suppliers)   -$50

Supplier Payment:
  Debit:  2.1.01 (AP - Suppliers)   +$50
  Credit: 1.1.01.001 (Cash Drawer)  -$50
```

---

## 🔴 DEUDA TÉCNICA CRÍTICA

### 1. Order Cancellation Reversal (BLOCKER)

**File**: `src/modules/cash/handlers/salesPaymentHandler.ts:199-223`

```typescript
export const handleSalesOrderCancelled: EventHandler = async (event) => {
  // TODO: Implementar lógica de reversa
  // Necesitaría:
  // 1. Buscar el journal entry original por saleId
  // 2. Crear journal entry reverso con signos invertidos
  // 3. Actualizar cash_session (restar de cash_sales, sumar a cash_refunds)
  // 4. Emit cash.refund.recorded event
};
```

**Impact**: Si se cancela una orden con pago CASH, el dinero queda registrado pero no se puede reversar.

**Required Implementation**:
1. Query `journal_entries` table for entry with `reference_id = saleId`
2. Create reversal entry: swap debits/credits
3. Update `cash_sessions.cash_refunds += amount`
4. Emit event for audit trail

---

### 2. Payroll Cancellation Reversal (BLOCKER)

**File**: `src/modules/cash/handlers/payrollHandler.ts:164-190`

```typescript
export const handlePayrollCancelled: EventHandler = async (event) => {
  // TODO: Implementar lógica de reversa
  // Similar a sales.order_cancelled
};
```

**Impact**: Payroll procesado en error no se puede reversar.

**Required Implementation**:
1. Query `journal_entries` for payroll entry
2. Create reversal entry
3. Update cash session if payment was from cash drawer
4. Emit event for HR audit

---

### 3. Dashboard Widget (NON-CRITICAL)

**File**: `src/modules/cash-management/manifest.tsx:67-80`

```typescript
// ❌ DISABLED: Invalid format - returns object instead of JSX
// TODO: Create CashBalanceWidget component and fix this
```

**Impact**: Cash balance no visible en dashboard principal.

**Required Implementation**:
1. Create `CashBalanceWidget.tsx` component
2. Show: total cash in drawers, safes, banks
3. Alert if variance detected in last session
4. Register correctly: `() => <CashBalanceWidget />`

---

### 4. Error Handling in Hook (MINOR)

**File**: `src/modules/cash-management/hooks/useCashSession.ts:260`

```typescript
error: null, // TODO: Implement error handling from store
```

**Impact**: Errores no se propagan a componentes.

**Required Implementation**:
1. Add `error` state to cashStore
2. Propagate from service layer
3. Display in UI with retry action

---

## ⚠️ SINCRONIZACIÓN Y VINCULACIÓN

### Cash Sessions ↔ Sales

**Current State**: ✅ **WORKING**

```typescript
// src/modules/cash/handlers/salesPaymentHandler.ts
eventBus.subscribe('sales.payment.completed', async (event) => {
  if (event.payload.paymentMethod === 'CASH') {
    await recordCashSale(drawerLocationId, amount);
    await createJournalEntry({
      type: 'SALE',
      reference: saleId,
      lines: [
        { account: '1.1.01.001', type: 'DEBIT', amount },      // Cash in
        { account: '4.1', type: 'CREDIT', amount: netAmount }, // Revenue
        { account: '2.1.02', type: 'CREDIT', amount: taxAmount } // Tax
      ]
    });
  }
});
```

**Gaps**:
- ❌ No reversal on order cancellation
- ⚠️ Only CASH payments tracked, CARD/TRANSFER/QR not integrated with accounting
- ⚠️ No validation if cash session is open (could record sale without active session)

**Required Improvements**:
1. Implement cancellation reversal (see above)
2. Create journal entries for ALL payment types:
   - CARD → Bank account (1.1.03)
   - TRANSFER → Bank account (1.1.03)
   - QR → Bank account (1.1.03) or Gateway account
3. Add validation: `if (!activeCashSession) throw new Error('No active session')`

---

### Cash Sessions ↔ Shifts

**Current State**: ✅ **WORKING**

```typescript
// src/modules/shift-control/handlers/cashHandlers.ts
eventBus.subscribe('cash.session.opened', (event) => {
  shiftStore.setState({ cashSession: event.payload });
});

eventBus.subscribe('cash.session.closed', (event) => {
  const { variance } = event.payload;

  if (Math.abs(variance) > 0.01) {
    shiftStore.addAlert({
      type: variance > 50 ? 'error' : 'warning',
      message: `Diferencia de caja: $${variance.toFixed(2)}`
    });
  }

  shiftStore.setState({ cashSession: null });
});
```

**ShiftStore Integration**:
```typescript
// src/modules/shift-control/store/shiftStore.ts
interface ShiftState {
  shifts: OperationalShift[];
  cashSession: CashSessionRow | null;  // ← LINKED
  activeStaffCount: number;
  openTablesCount: number;
  // ...
}
```

**Gaps**:
- ⚠️ CashSessionIndicator only shows `cash_sales`, not full balance
- ⚠️ No prevention if trying to close shift with open cash session
- ⚠️ Variance threshold fixed at $50 (should be configurable)

**Required Improvements**:
1. Update `CashSessionIndicator` to show expected vs actual balance
2. Add shift closing validation: `if (cashSession !== null) throw new Error('Close cash session first')`
3. Make variance threshold configurable (business_profile.cash_variance_threshold)

---

### Payments → Cash → Accounting

**Current State**: ⚠️ **PARTIAL**

**Payment Methods** (paymentsStore.ts):
- ✅ Payment method types: cash, card, transfer, other
- ✅ Gateway types: online, pos, mobile
- ⚠️ No direct integration with cash module

**Gap**: Non-cash payments (CARD, TRANSFER, QR) don't create journal entries automatically.

**Required Implementation**:

1. **Create Payment Handler** (`src/modules/cash/handlers/allPaymentsHandler.ts`):

```typescript
export const handleAllPayments: EventHandler = async (event) => {
  const { paymentMethod, amount, saleId, gatewayId } = event.payload;

  // Determine account based on payment method
  let debitAccount = '1.1.01.001'; // Default: Cash Drawer

  if (paymentMethod === 'CARD' || paymentMethod === 'TRANSFER') {
    debitAccount = '1.1.03.001'; // Bank account
  } else if (paymentMethod === 'QR') {
    // Check gateway account mapping
    const gateway = await getPaymentGateway(gatewayId);
    debitAccount = gateway.accountCode || '1.1.03.001';
  }

  // Create journal entry
  await journalService.createJournalEntry({
    type: 'SALE',
    reference: saleId,
    description: `Venta - ${paymentMethod}`,
    lines: [
      { account: debitAccount, type: 'DEBIT', amount },
      { account: '4.1', type: 'CREDIT', amount: netAmount },
      { account: '2.1.02', type: 'CREDIT', amount: taxAmount }
    ]
  });
};
```

2. **Register Handler** (in `src/modules/cash/handlers/index.ts`):
```typescript
eventBus.subscribe('sales.payment.completed', handleAllPayments);
```

---

## 🔐 SEGURIDAD Y PRECISIÓN

### Current Security Measures

✅ **Implemented**:
1. Double-entry validation (debits = credits)
2. Cash variance detection (threshold: $50)
3. Blind count on session close (prevents bias)
4. Money location tracking (drawer, safe, bank)
5. EventBus audit trail (all events logged)

❌ **Missing**:
1. Granular permissions (who can open/close sessions, record drops, adjust variance)
2. Complete audit trail (who did what when)
3. Session tampering prevention (edit after close)
4. Reconciliation service (auto-match bank statements)
5. Dual authorization for large variances

### Required Security Improvements

#### 1. Granular Permissions

**Current**: Only `minimumRole: 'CAJERO'` in manifest.

**Required**: Permission-based actions in PermissionsRegistry.

```typescript
// src/config/PermissionsRegistry.ts
'cash_session.open': {
  roles: ['CAJERO', 'SUPERVISOR', 'ADMINISTRADOR'],
  description: 'Open cash session'
},
'cash_session.close': {
  roles: ['CAJERO', 'SUPERVISOR', 'ADMINISTRADOR'],
  description: 'Close cash session with blind count'
},
'cash_session.force_close': {
  roles: ['SUPERVISOR', 'ADMINISTRADOR'],
  description: 'Force close session (override variance)'
},
'cash_drop.record': {
  roles: ['CAJERO', 'SUPERVISOR', 'ADMINISTRADOR'],
  description: 'Record cash drop to safe'
},
'cash_variance.adjust': {
  roles: ['SUPERVISOR', 'ADMINISTRADOR'],
  description: 'Adjust cash variance'
},
'cash_variance.audit': {
  roles: ['ADMINISTRADOR'],
  description: 'Mark variance as audited'
},
```

#### 2. Complete Audit Trail

**Required**: `cash_audit_log` table with:

```sql
CREATE TABLE cash_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Action details
  action TEXT NOT NULL, -- 'open_session', 'close_session', 'record_drop', 'adjust_variance'
  session_id UUID REFERENCES cash_sessions(id),

  -- User details
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_role TEXT NOT NULL,

  -- Changes
  before_state JSONB,
  after_state JSONB,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  notes TEXT
);
```

**Service**: `src/modules/cash/services/auditService.ts`

```typescript
export async function logCashAction(params: {
  action: string;
  sessionId?: string;
  userId: string;
  userRole: string;
  beforeState?: unknown;
  afterState?: unknown;
  notes?: string;
}) {
  await supabase.from('cash_audit_log').insert({
    action: params.action,
    session_id: params.sessionId,
    user_id: params.userId,
    user_role: params.userRole,
    before_state: params.beforeState,
    after_state: params.afterState,
    notes: params.notes,
  });
}
```

#### 3. Session Tampering Prevention

**Required**: Add `edited_at` and `edited_by` columns to `cash_sessions`:

```sql
ALTER TABLE cash_sessions
  ADD COLUMN edited_at TIMESTAMPTZ,
  ADD COLUMN edited_by UUID REFERENCES auth.users(id),
  ADD CONSTRAINT no_edit_after_close CHECK (
    (status = 'OPEN') OR (edited_at IS NULL)
  );
```

**Service Validation**:
```typescript
async function updateCashSession(sessionId: string, updates: Partial<CashSession>) {
  const session = await getCashSession(sessionId);

  if (session.status !== 'OPEN') {
    throw new Error('Cannot edit closed session');
  }

  await supabase.from('cash_sessions')
    .update(updates)
    .eq('id', sessionId);
}
```

#### 4. Dual Authorization for Large Variances

**Required**: If variance > $100, require supervisor approval.

```typescript
async function closeCashSession(sessionId: string, blindCount: number, userId: string) {
  const session = await getCashSession(sessionId);
  const expected = calculateExpectedCash(session);
  const variance = blindCount - expected;

  if (Math.abs(variance) > 100) {
    // Create approval request
    await createApprovalRequest({
      type: 'CASH_VARIANCE',
      sessionId,
      variance,
      requestedBy: userId,
      requiredRole: 'SUPERVISOR'
    });

    // Mark session as pending approval
    await supabase.from('cash_sessions')
      .update({ status: 'PENDING_APPROVAL', variance })
      .eq('id', sessionId);

    throw new Error('Variance exceeds $100. Supervisor approval required.');
  }

  // Normal close flow
  await finalizeCashSession(sessionId, blindCount, variance);
}
```

---

## 🔧 SERVICIO UNIFICADO (Cash & Payment Reconciliation)

### Current State

**Fragmented Services**:
- `cashSessionService` - Cash sessions
- `journalService` - Journal entries
- `reportsService` - Financial reports
- Individual handlers - sales, materials, payroll

**Problem**: No central service to:
1. Reconcile cash sessions with journal entries
2. Match bank statements with online payments
3. Verify accounting integrity
4. Generate consolidated cash position report

### Required: CashReconciliationService

**File**: `src/modules/cash/services/reconciliationService.ts`

```typescript
/**
 * Cash Reconciliation Service
 *
 * Centralizes all cash/payment reconciliation logic:
 * - Verify cash session integrity
 * - Match journal entries with sessions
 * - Reconcile bank statements
 * - Detect discrepancies and anomalies
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logging';
import type { CashSessionRow } from '../types/cashSessions';
import type { JournalEntry } from '../types/journalEntries';

export interface ReconciliationReport {
  sessionId: string;
  expectedCash: number;
  actualCash: number;
  variance: number;

  // Breakdown
  journalEntries: JournalEntry[];
  totalDebits: number;
  totalCredits: number;

  // Validation
  isBalanced: boolean;
  discrepancies: Discrepancy[];
}

export interface Discrepancy {
  type: 'MISSING_ENTRY' | 'DUPLICATE_ENTRY' | 'AMOUNT_MISMATCH' | 'ORPHAN_TRANSACTION';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  amount?: number;
  referenceId?: string;
}

/**
 * Reconcile a cash session with journal entries
 */
export async function reconcileCashSession(
  sessionId: string
): Promise<ReconciliationReport> {
  logger.info('ReconciliationService', 'Starting reconciliation', { sessionId });

  // 1. Fetch session
  const { data: session, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  // 2. Fetch all journal entries for this session's time range
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .gte('entry_date', session.opened_at)
    .lte('entry_date', session.closed_at || new Date().toISOString())
    .or(`account_code.eq.1.1.01.001,account_code.eq.1.1.01.002,account_code.eq.1.1.01.003`); // Cash accounts

  // 3. Calculate expected cash from journal entries
  const totalDebits = entries
    ?.filter(e => e.type === 'DEBIT')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  const totalCredits = entries
    ?.filter(e => e.type === 'CREDIT')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  const expectedFromJournal = session.starting_cash + totalDebits - totalCredits;

  // 4. Compare with session's recorded values
  const expectedFromSession =
    session.starting_cash +
    session.cash_sales +
    session.cash_in -
    session.cash_refunds -
    session.cash_out -
    session.cash_drops;

  const discrepancies: Discrepancy[] = [];

  // 5. Detect discrepancies
  if (Math.abs(expectedFromJournal - expectedFromSession) > 0.01) {
    discrepancies.push({
      type: 'AMOUNT_MISMATCH',
      description: `Journal entries total (${expectedFromJournal}) doesn't match session total (${expectedFromSession})`,
      severity: 'HIGH',
      amount: expectedFromJournal - expectedFromSession
    });
  }

  // 6. Check for orphan sales (payments without journal entries)
  const { data: salesPayments } = await supabase
    .from('sales_payments')
    .select('id, amount')
    .eq('payment_method', 'CASH')
    .gte('created_at', session.opened_at)
    .lte('created_at', session.closed_at || new Date().toISOString());

  salesPayments?.forEach(payment => {
    const hasEntry = entries?.some(e => e.reference_id === payment.id);
    if (!hasEntry) {
      discrepancies.push({
        type: 'MISSING_ENTRY',
        description: `Payment ${payment.id} has no journal entry`,
        severity: 'CRITICAL',
        amount: payment.amount,
        referenceId: payment.id
      });
    }
  });

  // 7. Return report
  return {
    sessionId,
    expectedCash: expectedFromSession,
    actualCash: session.actual_cash || expectedFromSession,
    variance: (session.actual_cash || 0) - expectedFromSession,
    journalEntries: entries || [],
    totalDebits,
    totalCredits,
    isBalanced: discrepancies.length === 0,
    discrepancies
  };
}

/**
 * Reconcile bank statement with online payments
 */
export async function reconcileBankStatement(params: {
  bankAccountId: string;
  startDate: string;
  endDate: string;
  statementTransactions: Array<{
    date: string;
    amount: number;
    description: string;
    reference?: string;
  }>;
}) {
  logger.info('ReconciliationService', 'Reconciling bank statement', params);

  // 1. Fetch journal entries for bank account
  const { data: bankEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('account_code', params.bankAccountId)
    .gte('entry_date', params.startDate)
    .lte('entry_date', params.endDate);

  // 2. Match statement transactions with journal entries
  const matched: Array<{ statement: unknown; entry: unknown }> = [];
  const unmatched: Array<{ statement: unknown; reason: string }> = [];

  params.statementTransactions.forEach(txn => {
    const matchingEntry = bankEntries?.find(entry =>
      Math.abs(parseFloat(entry.amount) - txn.amount) < 0.01 &&
      entry.description?.includes(txn.description || '')
    );

    if (matchingEntry) {
      matched.push({ statement: txn, entry: matchingEntry });
    } else {
      unmatched.push({
        statement: txn,
        reason: 'No matching journal entry found'
      });
    }
  });

  return {
    totalStatementAmount: params.statementTransactions.reduce((s, t) => s + t.amount, 0),
    totalJournalAmount: bankEntries?.reduce((s, e) => s + parseFloat(e.amount), 0) || 0,
    matched,
    unmatched,
    reconciliationRate: (matched.length / params.statementTransactions.length) * 100
  };
}

/**
 * Generate consolidated cash position across all locations
 */
export async function getConsolidatedCashPosition() {
  const { data: sessions } = await supabase
    .from('cash_sessions')
    .select(`
      *,
      money_location:money_locations (
        id,
        name,
        location_type,
        account:chart_of_accounts (
          code,
          name
        )
      )
    `)
    .eq('status', 'OPEN');

  const positions = sessions?.map(session => ({
    locationId: session.money_location_id,
    locationName: session.money_location?.name,
    locationType: session.money_location?.location_type,
    balance: session.starting_cash +
             session.cash_sales +
             session.cash_in -
             session.cash_refunds -
             session.cash_out -
             session.cash_drops,
    sessionId: session.id,
    openedAt: session.opened_at
  })) || [];

  return {
    totalCash: positions.reduce((sum, p) => sum + p.balance, 0),
    byLocation: positions,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Detect anomalies in cash operations
 */
export async function detectCashAnomalies(params: {
  locationId?: string;
  lookbackDays?: number;
}) {
  const lookback = params.lookbackDays || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookback);

  const { data: sessions } = await supabase
    .from('cash_sessions')
    .select('*')
    .gte('opened_at', cutoffDate.toISOString())
    .order('opened_at', { ascending: false });

  const anomalies: Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    sessionId: string;
  }> = [];

  // Detect patterns
  sessions?.forEach(session => {
    // Large variance
    if (Math.abs(session.variance || 0) > 100) {
      anomalies.push({
        type: 'LARGE_VARIANCE',
        severity: 'HIGH',
        description: `Large cash variance: $${session.variance}`,
        sessionId: session.id
      });
    }

    // Unusual cash drops
    if (session.cash_drops > session.cash_sales * 0.8) {
      anomalies.push({
        type: 'EXCESSIVE_DROPS',
        severity: 'MEDIUM',
        description: 'Cash drops > 80% of sales',
        sessionId: session.id
      });
    }

    // Long session duration
    const duration = new Date(session.closed_at || new Date()).getTime() -
                     new Date(session.opened_at).getTime();
    const hours = duration / (1000 * 60 * 60);

    if (hours > 16) {
      anomalies.push({
        type: 'LONG_SESSION',
        severity: 'LOW',
        description: `Session open for ${hours.toFixed(1)} hours`,
        sessionId: session.id
      });
    }
  });

  return anomalies;
}
```

---

## 📊 PRECISION IMPROVEMENTS

### 1. Configurable Variance Threshold

**Current**: Fixed $50 threshold in code.

**Required**: Business profile setting.

```typescript
// business_profile table
{
  cash_variance_threshold_minor: 10,    // Warning
  cash_variance_threshold_major: 50,    // Error
  cash_variance_threshold_critical: 100, // Requires approval
  auto_reconcile_threshold: 1            // Auto-close if variance < $1
}
```

### 2. Automatic Reconciliation

**Required**: Auto-close sessions with variance < threshold.

```typescript
async function autoReconcileCashSession(sessionId: string, blindCount: number) {
  const session = await getCashSession(sessionId);
  const expected = calculateExpectedCash(session);
  const variance = blindCount - expected;

  const profile = await getBusinessProfile();

  if (Math.abs(variance) <= profile.auto_reconcile_threshold) {
    // Auto-approve
    await finalizeCashSession(sessionId, blindCount, variance);
    logger.info('CashService', 'Session auto-reconciled', { sessionId, variance });
    return { status: 'AUTO_RECONCILED', variance };
  }

  // Manual review required
  return { status: 'PENDING_REVIEW', variance };
}
```

### 3. Multi-Currency Support

**Current**: All amounts in ARS (hardcoded).

**Required**: Support USD, EUR for international operations.

```typescript
interface CashSession {
  // ... existing fields
  currency: 'ARS' | 'USD' | 'EUR';
  exchange_rate?: number; // If different from base currency
}

interface JournalEntry {
  // ... existing fields
  currency: string;
  exchange_rate?: number;
  base_currency_amount: number; // Normalized to business base currency
}
```

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Critical Debt (Week 1-2) 🔴

**Priority: CRITICAL** - Blocks financial accuracy

1. ✅ **Order Cancellation Reversal**
   - Implement `handleSalesOrderCancelled` in `salesPaymentHandler.ts`
   - Add reversal journal entry creation
   - Update cash session `cash_refunds`
   - Unit tests for reversal logic

2. ✅ **Payroll Cancellation Reversal**
   - Implement `handlePayrollCancelled` in `payrollHandler.ts`
   - Similar logic to sales reversal
   - Unit tests

3. ✅ **Non-Cash Payment Accounting**
   - Create `allPaymentsHandler.ts`
   - Journal entries for CARD, TRANSFER, QR payments
   - Account mapping by payment method
   - Integration tests

**Acceptance Criteria**:
- [ ] All payment types create journal entries
- [ ] Cancellations reverse journal entries correctly
- [ ] No orphan transactions (payments without journal entries)
- [ ] Tests passing with 90%+ coverage

---

### Phase 2: Security & Audit (Week 3-4) 🔐

**Priority: HIGH** - Prevents fraud and compliance issues

1. ✅ **Granular Permissions**
   - Add cash permissions to `PermissionsRegistry.ts`
   - Enforce in services (open/close/adjust/audit)
   - UI: hide actions user can't perform
   - Tests for permission enforcement

2. ✅ **Audit Trail**
   - Create `cash_audit_log` table migration
   - Implement `auditService.ts`
   - Log all cash actions (open, close, drop, adjust)
   - UI: Audit log viewer component

3. ✅ **Session Tampering Prevention**
   - Add `edited_at`, `edited_by` columns
   - Constraint: no edits after close
   - Service validation
   - Tests for tamper attempts

**Acceptance Criteria**:
- [ ] Only authorized users can perform sensitive actions
- [ ] All cash actions logged with timestamp, user, before/after state
- [ ] Closed sessions cannot be edited
- [ ] Audit log viewable by admins

---

### Phase 3: Reconciliation Service (Week 5-6) 🔧

**Priority: MEDIUM** - Improves operational efficiency

1. ✅ **ReconciliationService Implementation**
   - Create `reconciliationService.ts`
   - Implement `reconcileCashSession()`
   - Implement `reconcileBankStatement()`
   - Implement `getConsolidatedCashPosition()`
   - Implement `detectCashAnomalies()`

2. ✅ **Reconciliation UI**
   - `ReconciliationDashboard.tsx` component
   - Show discrepancies by session
   - Bank statement upload & matching
   - Anomaly alerts

3. ✅ **Scheduled Reconciliation**
   - Cron job: daily reconciliation at midnight
   - Notify if discrepancies found
   - Auto-generate reconciliation report

**Acceptance Criteria**:
- [ ] Daily auto-reconciliation runs
- [ ] Discrepancies surfaced to admins
- [ ] Bank statements matched with 95%+ accuracy
- [ ] Consolidated cash position visible in real-time

---

### Phase 4: Precision & Configurability (Week 7) 📊

**Priority: LOW** - Nice to have, improves UX

1. ✅ **Configurable Thresholds**
   - Add settings to `business_profile`
   - UI: Settings page for cash management
   - Apply thresholds in close session logic

2. ✅ **Auto-Reconciliation**
   - Implement `autoReconcileCashSession()`
   - Auto-close if variance < $1
   - UI: Show auto-reconciled sessions

3. ✅ **Dashboard Widget**
   - Create `CashBalanceWidget.tsx`
   - Register in manifest correctly
   - Show total cash + alerts

**Acceptance Criteria**:
- [ ] Thresholds configurable per business
- [ ] Small variances auto-reconciled
- [ ] Cash balance visible on dashboard

---

### Phase 5: Multi-Currency (Future) 🌍

**Priority: FUTURE** - International expansion

1. **Currency Support in Schema**
   - Add `currency` columns to sessions, journal entries
   - Add `exchange_rates` table

2. **Exchange Rate Service**
   - Fetch rates from API (e.g. OpenExchangeRates)
   - Cache rates daily
   - Convert all amounts to base currency

3. **Multi-Currency UI**
   - Currency selector on session open
   - Display amounts in original + base currency
   - Reports show multi-currency breakdown

---

## 🧪 TESTING STRATEGY

### Unit Tests

```typescript
// src/modules/cash/__tests__/reconciliationService.test.ts
describe('ReconciliationService', () => {
  describe('reconcileCashSession', () => {
    it('should detect missing journal entries', async () => {
      // Setup: session with cash_sales but no journal entry
      const report = await reconcileCashSession(sessionId);
      expect(report.discrepancies).toHaveLength(1);
      expect(report.discrepancies[0].type).toBe('MISSING_ENTRY');
    });

    it('should match session total with journal entries', async () => {
      // Setup: session with matching journal entries
      const report = await reconcileCashSession(sessionId);
      expect(report.isBalanced).toBe(true);
      expect(Math.abs(report.variance)).toBeLessThan(0.01);
    });
  });
});

// src/modules/cash/handlers/__tests__/salesPaymentHandler.test.ts
describe('Sales Payment Handler', () => {
  describe('handleSalesOrderCancelled', () => {
    it('should create reversal journal entry', async () => {
      const originalEntry = await createSaleJournalEntry(saleId, 100);
      await handleSalesOrderCancelled({ payload: { saleId } });

      const reversalEntry = await getJournalEntry(reversalEntryId);
      expect(reversalEntry.lines).toMatchObject([
        { account: '1.1.01.001', type: 'CREDIT', amount: -100 }, // Opposite
        { account: '4.1', type: 'DEBIT', amount: 100 }           // Opposite
      ]);
    });

    it('should update cash session refunds', async () => {
      await handleSalesOrderCancelled({ payload: { saleId, amount: 100 } });
      const session = await getActiveCashSession(drawerId);
      expect(session.cash_refunds).toBe(100);
    });
  });
});
```

### Integration Tests

```typescript
// src/modules/cash/__tests__/integration/cash-sales-flow.test.ts
describe('Cash Sales Flow Integration', () => {
  it('should complete full cash sale lifecycle', async () => {
    // 1. Open session
    const session = await openCashSession(drawerId, 1000);

    // 2. Record sale
    await recordSale({ amount: 100, paymentMethod: 'CASH' });

    // 3. Verify journal entry created
    const entries = await getJournalEntriesBySession(session.id);
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe('SALE');

    // 4. Close session
    await closeCashSession(session.id, 1100); // $1000 + $100

    // 5. Verify session closed correctly
    const closedSession = await getCashSession(session.id);
    expect(closedSession.status).toBe('CLOSED');
    expect(closedSession.variance).toBe(0);
  });

  it('should handle sale cancellation correctly', async () => {
    const session = await openCashSession(drawerId, 1000);
    const sale = await recordSale({ amount: 100, paymentMethod: 'CASH' });

    // Cancel sale
    await cancelSale(sale.id);

    // Verify reversal
    const updatedSession = await getCashSession(session.id);
    expect(updatedSession.cash_sales).toBe(0);
    expect(updatedSession.cash_refunds).toBe(100);

    const entries = await getJournalEntriesBySession(session.id);
    expect(entries).toHaveLength(2); // Original + reversal
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/cash-management.spec.ts
test.describe('Cash Management', () => {
  test('cashier can open and close session', async ({ page }) => {
    await page.goto('/admin/finance/cash');

    // Open session
    await page.click('button:has-text("Abrir Caja")');
    await page.fill('input[name="starting_cash"]', '5000');
    await page.click('button:has-text("Confirmar")');

    // Verify session active
    await expect(page.locator('text=Sesión Activa')).toBeVisible();

    // Record sale (via EventBus simulation)
    // ...

    // Close session
    await page.click('button:has-text("Cerrar Caja")');
    await page.fill('input[name="blind_count"]', '5100');
    await page.click('button:has-text("Cerrar")');

    // Verify closed
    await expect(page.locator('text=Sesión Cerrada')).toBeVisible();
    await expect(page.locator('text=Varianza: $0.00')).toBeVisible();
  });

  test('supervisor can audit variance', async ({ page }) => {
    // Setup: session with variance
    await setupSessionWithVariance(sessionId, 75);

    await page.goto(`/admin/finance/cash/audit/${sessionId}`);

    // Mark as audited
    await page.fill('textarea[name="audit_notes"]', 'Discrepancy due to incorrect change given.');
    await page.click('button:has-text("Marcar como Auditado")');

    // Verify status updated
    await expect(page.locator('text=Estado: AUDITADO')).toBeVisible();
  });
});
```

---

## 📚 DOCUMENTATION UPDATES NEEDED

1. **Architecture Docs**:
   - `docs/finance/ARCHITECTURE.md` - Overall finance architecture
   - `docs/finance/CASH_SESSIONS.md` - Cash session lifecycle
   - `docs/finance/ACCOUNTING.md` - Double-entry accounting system
   - `docs/finance/RECONCILIATION.md` - Reconciliation process

2. **API Docs**:
   - `docs/api/CASH_SERVICE.md` - Cash service API reference
   - `docs/api/JOURNAL_SERVICE.md` - Journal service API reference
   - `docs/api/RECONCILIATION_SERVICE.md` - Reconciliation API

3. **User Guides**:
   - `docs/user/CASH_MANAGEMENT_GUIDE.md` - For cashiers
   - `docs/user/CASH_AUDIT_GUIDE.md` - For supervisors/admins
   - `docs/user/BANK_RECONCILIATION_GUIDE.md` - For accountants

4. **Development Guides**:
   - `docs/dev/ADDING_PAYMENT_METHODS.md` - How to add new payment methods
   - `docs/dev/CASH_EVENT_HANDLERS.md` - Writing cash event handlers
   - `docs/dev/FINANCIAL_TESTING.md` - Testing financial operations

---

## ⚙️ CONFIGURATION REFERENCE

### Environment Variables

```env
# Cash Management
CASH_VARIANCE_THRESHOLD_MINOR=10
CASH_VARIANCE_THRESHOLD_MAJOR=50
CASH_VARIANCE_THRESHOLD_CRITICAL=100
CASH_AUTO_RECONCILE_THRESHOLD=1
CASH_SESSION_MAX_DURATION_HOURS=16

# Bank Reconciliation
BANK_RECONCILIATION_ENABLED=true
BANK_STATEMENT_IMPORT_FORMATS=csv,ofx,qif

# Audit & Compliance
CASH_AUDIT_LOG_RETENTION_DAYS=2555 # ~7 years for tax compliance
CASH_DUAL_AUTHORIZATION_THRESHOLD=100

# Multi-Currency
MULTI_CURRENCY_ENABLED=false
BASE_CURRENCY=ARS
SUPPORTED_CURRENCIES=ARS,USD,EUR
EXCHANGE_RATE_API_KEY=your_api_key_here
```

### Business Profile Settings

```typescript
// business_profile table
{
  // Cash management
  cash_variance_threshold_minor: 10,
  cash_variance_threshold_major: 50,
  cash_variance_threshold_critical: 100,
  auto_reconcile_threshold: 1,
  cash_session_max_duration: 16, // hours

  // Accounting
  base_currency: 'ARS',
  tax_rate_default: 0.21, // 21% IVA
  fiscal_year_start: '01-01',

  // Security
  dual_authorization_threshold: 100,
  cash_audit_required: true,
  bank_reconciliation_frequency: 'daily',

  // Multi-location
  centralized_cash_management: false,
  inter_location_transfers_enabled: true
}
```

---

## 🚨 KNOWN ISSUES & LIMITATIONS

### Current Limitations

1. **Single Currency**: Only ARS supported (hardcoded)
2. **No Split Payments**: Can't split cash + card in same transaction
3. **Manual Bank Reconciliation**: No automatic import from banks
4. **Fixed Accounting Periods**: Monthly only, no custom periods
5. **No Budget Tracking**: Budget vs actual not implemented
6. **Limited Reports**: Only Balance Sheet, P&L, Cash Flow
7. **No Forecasting**: Cash flow projections not available

### Known Bugs

1. **Race Condition**: Multiple simultaneous closes can create duplicate variance entries
   - **Workaround**: Use database transaction with row-level lock
   - **Fix**: Implement optimistic locking on `cash_sessions`

2. **EventBus Latency**: Large variance events may not reach shift control immediately
   - **Workaround**: Poll cash store in shift closing flow
   - **Fix**: Implement event delivery guarantees (ack/nack)

3. **Decimal Precision**: Floating point arithmetic can cause rounding errors
   - **Workaround**: Use DecimalUtils everywhere
   - **Fix**: Enforce Decimal.js in all financial calculations

---

## 📞 SUPPORT & ESCALATION

### For Issues During Implementation

1. **Cash Session Problems**: Check `cash_audit_log` and EventBus logs
2. **Journal Entry Errors**: Verify double-entry validation (debits = credits)
3. **Reconciliation Failures**: Run `detectCashAnomalies()` to find root cause
4. **Permission Issues**: Check PermissionsRegistry and user role
5. **Performance Issues**: Review database indexes on `cash_sessions`, `journal_entries`

### Escalation Path

1. **Level 1**: Check documentation and logs
2. **Level 2**: Run reconciliation service diagnostics
3. **Level 3**: Escalate to finance module maintainer
4. **Level 4**: Emergency: Force-close session with admin override

---

## ✅ CHECKLIST FOR GO-LIVE

Before deploying cash management to production:

### Pre-Deployment

- [ ] All critical debt resolved (Phase 1 complete)
- [ ] Unit tests passing (90%+ coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Security audit completed
- [ ] Performance testing completed (load test with 100 concurrent sessions)
- [ ] Database migrations tested on staging
- [ ] Rollback plan documented

### Deployment

- [ ] Database backup created
- [ ] Migrations applied successfully
- [ ] Feature flags enabled
- [ ] Monitoring dashboards configured
- [ ] Alert thresholds set
- [ ] On-call rotation notified

### Post-Deployment

- [ ] Smoke tests passed
- [ ] First cash session opened/closed successfully
- [ ] Journal entries created correctly
- [ ] Reconciliation service running
- [ ] Audit log populating
- [ ] No errors in logs for 24 hours
- [ ] User feedback collected

### Documentation

- [ ] Architecture docs updated
- [ ] API docs published
- [ ] User guides distributed
- [ ] Training materials prepared
- [ ] FAQ updated
- [ ] Changelog published

---

## 📈 SUCCESS METRICS

Track these KPIs post-deployment:

1. **Financial Accuracy**:
   - Cash variance rate < 2% of total sales
   - Reconciliation success rate > 95%
   - Zero orphan transactions

2. **Operational Efficiency**:
   - Average session close time < 5 minutes
   - Auto-reconciliation rate > 80%
   - Manual audit rate < 5%

3. **Security & Compliance**:
   - 100% audit log coverage
   - Zero unauthorized access attempts
   - Zero session tampering incidents

4. **User Satisfaction**:
   - Cashier NPS > 8/10
   - Training time < 1 hour
   - Support tickets < 5/month

---

## 🎯 FINAL NOTES

Este prompt está diseñado para ser **exhaustivo y accionable**. Cubre:

✅ **Estado Actual**: Arquitectura completa con todas las piezas existentes
✅ **Deuda Técnica**: Gaps críticos con ubicaciones exactas y soluciones propuestas
✅ **Seguridad**: Mejoras de auditoría, permisos, y prevención de fraude
✅ **Precisión**: Reconciliación automática y detección de anomalías
✅ **Implementación**: Roadmap por fases con acceptance criteria
✅ **Testing**: Estrategia completa (unit, integration, e2e)
✅ **Documentación**: Guías para usuarios y desarrolladores

**Next Steps**:
1. Revisar este documento con el equipo
2. Priorizar fases según urgencia del negocio
3. Asignar recursos a Phase 1 (critical debt)
4. Ejecutar implementación iterativa
5. Monitorear métricas de éxito

---

**Document Version**: 1.0
**Last Updated**: 2025-12-09
**Maintainer**: G-Admin Team
**Review Cycle**: Quarterly
