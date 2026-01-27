# Shift Control (`/modules/shift-control`)

## Overview
Operational command center. Manages the lifecycle of business shifts (Opening/Closing), enforces operational consistency, and orchestrates cross-module validation (e.g., "Cannot close shift with open tables").

## 🏗️ Architecture
**Type**: Operations Module
**Category**: Operations

This module acts as a **Gatekeeper**. It listens to events from Sales, Stock, and Staff to determine if the business is in a state that allows opening or closing a shift.

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Cash** | Consumer | Requires "Cash Session Closed" before closing shift. |
| **Ordering** | Consumer | Prevents closing if active orders exist. |
| **Staff** | Consumer | Tracks active check-ins. |
| **Dashboard** | Provider | Injects "Current Shift Status" widget. |

---

## Features
- **Shift Lifecycle**: Formal Open/Close process with validation steps.
- **Operations Dashboard**: Real-time view of "Active Issues" (e.g., 3 Open Tables).
- **Validation Engine**: Pluggable rule system for allowing/blocking actions.
- **Audit Logging**: Comprehensive trace of all operational state changes.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `shift.opened` / `shift.closed`
- **Purpose**: Notify the system of operational state changes.
- **Usage**: Lighting system turns on/off, auto-reports generated.

#### 2. `shift-control.indicators`
- **Purpose**: Status lights on the shift dashboard (e.g., "Network Status", "Printer Status").

### Consumed Events
- `cash.session.opened` / `closed`: Validation for shift closure.
- `staff.employee.checked_in` / `out`: Tracking active personnel.
- `order.created` / `completed`: Tracking active trades.

---

## 🔌 Public API (`exports`)

### Operational Actions
```typescript
// Open a new shift
const shift = await registry.getExports('shift-control').services.openShift({
  openerId: 'user-123',
  startingCash: 500
});

// Force close (emergency override)
await registry.getExports('shift-control').services.forceCloseShift(shiftId, { reason: 'Emergency' });
```

### Validation
```typescript
// Check if safe to close
const { canClose, obstacles } = await registry.getExports('shift-control').services.validateCloseShift(shiftId);
// obstacles: ['Open Cash Session', 'Active Table 5']
```

---

## 🗄️ Database Schema
**Table**: `shifts`
- `id`: UUID
- `status`: 'active' | 'closed'
- `started_at` / `ended_at`: Timestamp
- `metrics`: JSON (Snapshot of sales/labor at close)

---

**Last Updated**: 2025-01-25
**Module ID**: `shift-control`
