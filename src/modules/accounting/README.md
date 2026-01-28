# Cash Management (`/modules/cash-management`)

## Overview
Comprehensive cash flow tracking, session management, and accounting integration. Implements **double-entry accounting** for all cash operations to ensure financial integrity.

> **Architecture Note**: This module acts as the "Public Interface" and UI. It relies on the internal core library `src/modules/cash` for low-level services, types, and database interactions.

## 🏗️ Architecture
**Type**: Finance Module
**Category**: Business

This module connects **Sales** (Money In) and **Payroll/Expenses** (Money Out) with the **Fiscal/Accounting** backend.

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Sales** | Consumer | Listens for `sales.payment.completed` to debit cash. |
| **Shift Control** | Integration | Provides "Cash Session" status to the operations dashboard. |
| **Accounting** | Provider | Generates Journal Entries for every cash movement. |
| **Fiscal** | Dependency | Inherits permissions from the Fiscal module. |

---

## Features
- **Cash Sessions**: Strict Open/Close workflows with physical counting reconciliation.
- **Double-Entry Accounting**: distinct debits and credits for accuracy.
- **Discrepancy Detection**: Automated alerts for shortages/overages.
- **Drops & Withdrawals**: Secure cash handling logging with reason codes.
- **Safe Management**: Transfers between Tills and the Main Safe.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `cash.session.opened` / `closed`
- **Purpose**: Notify system of active cash handling periods.
- **Example**: Disable "Pay with Cash" button if no session is open.

#### 2. `shift-control.indicators`
- **Purpose**: Injects a traffic light component into the Shift Control screen.
- **Component**: `<CashSessionIndicator />`

#### 3. `cash.journal_entry.created`
- **Purpose**: Emitted whenever the ledger is touched. Useful for audit trails.

### Consumed Events
#### `sales.payment.completed`
- **Action**: Debit 'Cash on Hand', Credit 'Sales Revenue'.
- **Priority**: High (Critical for accuracy).

#### `staff.payroll.processed`
- **Action**: Credit 'Cash on Hand', Debit 'Wages Payable' (if paid in cash).

---

## 🔌 Public API (`exports`)

### Session Management
```typescript
// Check if current user has an open drawer
const session = await registry.getExports('cash-management').services.getActiveCashSession();

// Open a new drawer
await registry.getExports('cash-management').services.openCashSession({
  startingAmount: 200,
  tillId: 'till-manual-01'
}, userId);
```

### Accounting Logic
```typescript
// Create a manual journal entry (e.g., "Found money on floor")
await registry.getExports('cash-management').services.createJournalEntry({
  debit: 'cash_on_hand',
  credit: 'misc_income',
  amount: 5.00,
  notes: 'Found under register'
});
```

### React Hooks
```typescript
// Use in UI components
const { activeCashSession, loading } = useCashSession();
```

---

## 🗄️ Database Schema (Internal)
**Table**: `cash_sessions`
- `id`: UUID
- `status`: 'open' | 'closed' | 'reconciling'
- `opened_at`: Timestamp

**Table**: `journal_entries`
- `id`: UUID
- `debit_account`: string
- `credit_account`: string
- `amount`: decimal(12,4)
- `reference_id`: string (Link to Order/Shift)

---

## 🔒 Access Control
- **Minimum Role**: `CAJERO`
- **Permissions**: Inherited from `fiscal` module.

---

**Last Updated**: 2025-01-25
**Module ID**: `cash-management`
