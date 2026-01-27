# Staff Module (`/modules/staff`)

## Overview
The Staff module is the foundational HR system for G-Admin Mini. It serves as the single source of truth for employee data, roles, and availability, powering the Scheduling, Shift Control, and Payroll systems.

## 🏗️ Architecture
**Type**: Foundational Module (No dependencies)
**Category**: Resources

This module implements the **Provider Pattern**, exposing employee data and hooks to downstream modules (Scheduling, Operations) without consuming external business logic itself.

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Scheduling** | Provider | Provides employee list and availability data for shift planning. |
| **Shift Control** | Provider | Validates active staff during shift opening/closing. |
| **Dashboard** | Provider | Injects "Staff on Duty" and "Labor Cost" widgets. |
| **Calendar** | Provider | Renders staff shifts on the global calendar. |

---

## Features
- **Employee Management**: CRUD operations for staff profiles, roles, and contact info.
- **Role-Based Access**: Distinguishes between `Admin`, `Manager`, `Supervisor`, and `Staff`.
- **Real-time Status**: Tracks who is currently "Checked In" vs "Checked Out".
- **Performance Metrics**: (Planned) Sales per labor hour tracking.
- **Availability Management**: Define working hours and time-off preferences.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
This module leverages the `ModuleRegistry` to inject UI and logic into other parts of the system:

#### 1. `calendar.events`
- **Purpose**: Render staff shifts overlay on the main calendar.
- **Priority**: `100` (High - renders on top)
- **Data**: Consumes week/date range.
- **Returns**: Visual blocks representing assigned shifts.

#### 2. `dashboard.widgets`
- **Purpose**: Display HR metrics on the main dashboard.
- **Widgets**:
  - `StaffWidget`: Comprehensive list of active staff.
  - `StaffStatWidget`: KPI card showing "Active Staff" vs "Total Staff".
- **Lazy Loaded**: Yes, for performance optimization.

#### 3. `scheduling.toolbar.actions`
- **Purpose**: Add staff-specific tool actions to the Scheduling module.
- **Action**: "View Staff Availability" button.
- **Interaction**: Opens a modal or filtered view to show who is available for a selected slot.

---

## 🔌 Public API (`exports`)

Other modules can access Staff functionality via `registry.getExports('staff')`.

### React Hooks
```typescript
// Fetch the list of employees with caching and real-time updates
const { useEmployeesList } = registry.getExports('staff').hooks;
const { items, loading } = useEmployeesList();
```

### Services
```typescript
// Get currently checked-in staff (Async)
const activeStaff = await registry.getExports('staff').getActiveStaff();

// Calculate estimated labor cost
const cost = registry.getExports('staff').calculateLaborCost(hours, rate);
```

---

## 🗄️ Database Schema

**Table**: `employees`

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `first_name` | Text | |
| `last_name` | Text | |
| `position` | Text | Job title (e.g., 'Chef', 'Server') |
| `hourly_rate` | Numeric | Cost per hour for labor calculations |
| `is_active` | Boolean | Soft delete / employment status |
| `checked_in` | Boolean | Real-time status |
| `checked_in_at` | Timestamptz | Last check-in timestamp |

---

## 💻 Usage Examples

### 1. Checking Active Staff for Shift Control
The Shift Control module uses this to prevent closing a shift if staff are still checked in.

```typescript
import { ModuleRegistry } from '@/lib/modules';

async function validateShiftClose() {
  const staffApi = ModuleRegistry.getInstance().getExports('staff');
  const activeStaff = await staffApi.getActiveStaff();
  
  if (activeStaff.length > 0) {
    throw new Error(`Cannot close shift. ${activeStaff.length} employees are still checked in.`);
  }
}
```

### 2. Displaying Labor Cost in Scheduling
The Scheduling module uses the employee's `hourly_rate` to forecast costs.

```typescript
const totalCost = shifts.reduce((acc, shift) => {
  return acc + staffApi.calculateLaborCost(shift.duration, shift.employee.hourly_rate);
}, 0);
```

---

## 🚦 Future Enhancements (Phase 2+)
- **Biometric Check-in**: Integration with hardware scanners.
- **Payroll Export**: Generate CSV/PDF for payroll processing.
- **Skill Matrix**: Tag employees with specific skills (e.g., "Grill", "POS") to validate schedule requirements.

---

**Last Updated**: 2025-01-25
**Module ID**: `staff`
