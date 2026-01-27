# Scheduling (`/modules/scheduling`)

## Overview
Advanced Workforce Management system. Handles shift planning, time-off requests, and labor cost optimization. It ensures the right staff are in the right place at the right time.

## 🏗️ Architecture
**Type**: Business Module
**Category**: Resources

This module is heavily dependent on **Staff** (for profiles) and integrates with **Production/Sales** (for demand forecasting).

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Staff** | Dependency | Consumes Employee data to assign shifts. |
| **Calendar** | Provider | Injects "Time Off" and "Shift" layers into the global calendar. |
| **Dashboard** | Provider | Injects "Today's Schedule" widget. |
| **Sales** | Consumer | Uses sales forecasts to recommend staffing levels. |

---

## Features
- **Visual Scheduler**: Drag-and-drop interface for shift assignment.
- **Conflict Detection**: Alerts for overtime, overlapping shifts, or time-off conflicts.
- **Labor Costing**: Real-time calculation of scheduled labor vs projected sales.
- **Time-Off Workflow**: Request/Approve/Deny cycle for leave.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `calendar.events`
- **Purpose**: Render distinctive visual layers on the main calendar.
- **Layers**:
  - Shifts (Blue blocks)
  - Time Off (Orange/Green badges)
- **Priority**: `80` (Medium-High)

#### 2. `scheduling.toolbar.actions`
- **Purpose**: Action buttons for the schedule view (e.g., "Publish Schedule", "Copy Last Week").

#### 3. `dashboard.widgets`
- **Purpose**: KPI widgets (e.g., "Coverage vs Demand").
- **Component**: `<SchedulingWidget />` (Lazy loaded)

### Consumed Events
- `staff.availability.updated`: Re-validates the schedule if an employee changes their availability.
- `sales.volume_forecast`: Updates the "Recommended Staff" guidelines.

---

## 🔌 Public API (`exports`)

### Hooks
```typescript
// Comprehensive hook for managing scheduling state
const { useScheduling } = await registry.getExports('scheduling').hooks.useScheduling();
```

### Services
```typescript
// Calculate labor cost for a set of shifts
const cost = registry.getExports('scheduling').services.calculateLaborCosts(shifts);
```

### Data Access
```typescript
// Get the schedule for a specific week
const shifts = await registry.getExports('scheduling').services.getWeeklySchedule('2025-W42');
```

---

## 🚦 Future Enhancements
- **Auto-Scheduling**: AI-driven shift generation based on availability and sales forecast.
- **Shift Swapping**: Employee-led shift exchange with manager approval.
- **Budget Alerts**: Warning when scheduled cost exceeds labor budget.

---

**Last Updated**: 2025-01-25
**Module ID**: `scheduling`
