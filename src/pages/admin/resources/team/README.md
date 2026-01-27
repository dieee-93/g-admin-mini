# 👥 Staff Module - Employee Management System

**Version**: 1.0.0
**Status**: Production Ready
**Module ID**: `staff`
**Domain**: Resources

---

## 📋 Overview

The **Staff Module** provides comprehensive employee management capabilities including personnel directory, performance tracking, time tracking, training management, and labor cost analytics.

### Key Features

## Feature & Route Map
| Feature | Sub-route | Component | Description |
|---------|-----------|-----------|-------------|
| **Staff Directory** | `/` | `page.tsx` | Grid view of all employees. |
| **Employee Form** | `(modal)` | `EmployeeForm` | CRUD for staff profiles. |
| **Performance** | `(tab)` | `PerformanceDashboard` | Staff metrics. |


- ✅ **Employee Directory** - Complete CRUD operations for staff management
- ✅ **Performance Tracking** - Real-time performance metrics and analytics
- ✅ **Time Tracking** - Clock in/out with offline support
- ✅ **Training Management** - Course catalog and certification tracking
- ✅ **Labor Cost Analytics** - Real-time cost calculations with Decimal.js precision
- ✅ **Multi-Location Support** - Filter employees by location
- ✅ **Offline-First** - Continues working without internet connection

---

## 🗄️ Database Schema

### Tables

#### `employees` (38 columns)
Primary table for employee data with comprehensive fields:

**Basic Info**:
- `id` (uuid) - Primary key
- `first_name`, `last_name`, `name` - Personnel identification
- `email`, `phone` - Contact information
- `avatar_url` - Profile picture

**Employment**:
- `position`, `department` - Role and department
- `employment_status` - `active` | `inactive` | `terminated` | `on_leave`
- `hire_date` - Date of hire
- `salary`, `hourly_rate` - Compensation (RLS protected)
- `weekly_hours` - Standard hours (default: 40)

**Performance**:
- `performance_score` - 0-100 rating
- `attendance_rate` - Attendance percentage

**Multi-Location**:
- `home_location_id` - Primary work location
- `can_work_multiple_locations` - Boolean flag

**Delivery/Driver**:
- `vehicle_type`, `license_number` - For delivery staff
- `driver_rating`, `total_deliveries` - Driver metrics

**Appointments** (for service businesses):
- `accepts_appointments` - Boolean flag
- `services_provided` - Array of service UUIDs
- `max_appointments_per_day` - Capacity limit
- `booking_buffer_minutes` - Time between appointments

#### `employee_availability`
Tracks when employees are available for scheduling.

#### `employee_skills`
Maps skills and certifications to employees.

#### `employee_training`
Stores training records and course completions.

#### `staffing_requirements`
Defines minimum staffing needs by department/time.

### Row Level Security (RLS)

✅ **6 RLS Policies Configured**:
1. `Enable all access for service role` - Service role bypass
2. `Enable read access for all users` - Public read
3. `employees_select_policy` - Read permissions
4. `employees_insert_policy` - Create permissions
5. `employees_update_policy` - Update permissions
6. `employees_delete_policy` - Delete permissions

**Sensitive Data Protection**:
- `salary` and `hourly_rate` fields are masked for non-HR roles
- Only users with `SUPERVISOR` or higher can access sensitive fields

---

## 🏗️ Architecture

### File Structure

```
src/pages/admin/resources/staff/
├── page.tsx                    # Main page component
├── README.md                   # This file
├── types.ts                    # TypeScript definitions
├── components/
│   ├── EmployeeForm.tsx        # CRUD form for employees
│   ├── LaborCostDashboard.tsx  # Real-time cost tracking
│   ├── PerformanceDashboard.tsx
│   ├── StaffAnalyticsEnhanced.tsx
│   ├── StaffFormEnhanced.tsx
│   └── sections/
│       ├── DirectorySection.tsx      # Employee list/grid
│       ├── PerformanceSection.tsx    # Performance metrics
│       ├── TimeTrackingSection.tsx   # Clock in/out
│       ├── TrainingSection.tsx       # Courses & certs
│       └── ManagementSection.tsx     # HR admin functions
├── hooks/
│   ├── useStaffPage.ts         # Page orchestrator hook
│   └── index.ts
└── services/
    ├── staffApi.ts              # Supabase CRUD operations
    ├── realTimeLaborCostEngine.ts       # Decimal.js cost calc
    ├── staffPerformanceAnalyticsEngine.ts
    └── index.ts
```

### Module Manifest

**Location**: `src/modules/staff/manifest.tsx`

**Dependencies**: None (foundation module)

**Required Features**:
- `staff_employee_management` (required)

**Optional Features**:
- `staff_shift_management`
- `staff_time_tracking`
- `staff_performance_tracking`
- `staff_training_management`
- `staff_labor_cost_tracking`

**Permissions**: Minimum role `SUPERVISOR`

**Hooks Provided**:
1. `calendar.events` - Renders staff shifts on scheduling calendar
2. `dashboard.widgets` - Staff performance widget
3. `scheduling.toolbar.actions` - "View Staff Availability" button

**Event Subscriptions** (EventBus):
- `production.alert.*` - Monitor kitchen alerts for staffing needs
- `sales.order.placed` - Track service load
- `scheduling.shift.reminder` - Send shift notifications

---

## 🔌 Integration with Other Modules

### Scheduling Module
- **Provides**: Staff availability data via `exports.getStaffAvailability()`
- **Consumes**: Shift data for calendar events
- **EventBus**: `scheduling.shift.completed` event

### Production Module
- **Listens**: `production.alert.*` to adjust kitchen staffing
- **Use Case**: Auto-alert when understaffed during rush hour

### Sales Module
- **Listens**: `sales.order.placed` to monitor service workload
- **Use Case**: Recommend additional service staff during high volume

### Materials Module
- Uses labor cost data for full cost accounting

---

## 🚀 Usage

### Basic Operations

#### Creating an Employee

```typescript
import { createEmployee } from '@/services/staff/staffApi';

const newEmployee = await createEmployee({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  position: 'Server',
  department: 'Servicio',
  hire_date: '2024-01-01',
  hourly_rate: 15.00,
  employment_status: 'active',
  can_work_multiple_locations: false
});
```

#### Fetching Staff

```typescript
import { getStaff } from '@/services/staff/staffApi';

// Get all active employees
const staff = await getStaff({ status: 'active' });

// Get by department
const kitchen = await getStaff({ department: 'Cocina' });

// Get by location (multi-location mode)
const locationStaff = await getStaff({ location_id: 'loc-123' });
```

#### Labor Cost Calculation

```typescript
import { calculateEmployeeLiveCost } from '@/services/staff/realTimeLaborCostEngine';

const cost = calculateEmployeeLiveCost({
  employee_id: 'emp-123',
  employee_name: 'John Doe',
  hourly_rate: 15.50,
  clock_in_time: new Date('2024-01-15T09:00:00'),
  shift_start_time: '09:00',
  shift_end_time: '17:00'
});

console.log(cost.current_cost); // Real-time cost (Decimal.js precision)
console.log(cost.overtime_hours); // Overtime calculation
console.log(cost.overtime_status); // 'normal' | 'approaching' | 'in_overtime'
```

### Using the Page Hook

```typescript
import { useStaffPage } from './hooks';

function MyStaffPage() {
  const {
    pageState,      // UI state (activeTab, filters, etc.)
    metrics,        // Real-time metrics (totalStaff, laborCost, etc.)
    employees,      // Staff list
    loading,        // Loading state
    actions         // Action handlers
  } = useStaffPage();

  return (
    <div>
      <h1>Total Staff: {metrics.totalStaff}</h1>
      <p>Today's Labor Cost: ${metrics.todayLaborCost.toFixed(2)}</p>
    </div>
  );
}
```

---

## 📊 Real-Time Metrics

The Staff module provides real-time metrics calculated with Decimal.js precision:

### Core Metrics
- **Total Staff**: Count of all employees
- **Active Staff**: Currently employed
- **On Shift**: Currently clocked in
- **Average Performance**: Mean performance rating (0-5 scale)

### Labor Cost Metrics
- **Today's Labor Cost**: Real-time daily cost
- **Projected Cost**: Estimated end-of-day cost
- **Budget Utilization**: % of budget used
- **Budget Variance**: Over/under budget %

### Performance Metrics
- **Attendance Rate**: Average attendance %
- **Punctuality Score**: On-time arrival %
- **Overtime Hours**: Total OT this period
- **Efficiency Score**: Productivity rating

### Alerts
- **Critical Alerts**: Issues requiring immediate attention
- **Retention Risks**: Employees at risk of leaving
- **Overtime Concerns**: Employees with excessive OT

---

## 🧪 Testing

### E2E Tests

Located in: `src/__tests__/e2e/`

**Test Files**:
- `staff-module-basic.e2e.test.tsx` - Basic CRUD operations
- `staff-business-flows.e2e.test.tsx` - Business workflows
- `staff-production-performance.e2e.test.tsx` - Performance tests

**Running Tests**:
```bash
# Run all staff E2E tests
pnpm test staff-module

# Run specific test file
pnpm test staff-module-basic
```

### Manual Testing Checklist

- [ ] Create new employee
- [ ] Update employee information
- [ ] Deactivate/reactivate employee
- [ ] Clock in/out functionality
- [ ] View performance metrics
- [ ] Filter by department
- [ ] Filter by location (multi-location)
- [ ] Export staff report
- [ ] Labor cost calculations
- [ ] Offline mode (disconnect internet, create employee)

---

## 🔒 Security

### Data Masking

Sensitive fields (`salary`, `hourly_rate`, `social_security`) are automatically masked for users without proper permissions:

```typescript
import { getEmployeeWithMasking } from '@/services/staff/staffApi';

const employee = await getEmployeeWithMasking('emp-123', currentUserRole);

if (currentUserRole === 'EMPLOYEE') {
  console.log(employee.salary_masked); // true
  console.log(employee.salary); // undefined (hidden)
}
```

### Role-Based Access

- **ADMIN/HR**: Full access including sensitive data
- **SUPERVISOR**: Read access to all employees, edit their own team
- **EMPLOYEE**: Read-only access to public employee directory

---

## 📈 Performance Optimizations

1. **Lazy Loading**: All tab sections load on-demand
2. **Decimal.js**: Banking-grade precision for financial calculations
3. **Offline-First**: IndexedDB queue for offline operations
4. **Real-time Updates**: Supabase Realtime for live synchronization
5. **Zustand Performance**: Uses `useShallow` for array/object selectors

---

## 🐛 Known Issues

1. React Hook warning in `TimeTrackingSection.tsx` line 178
   - **Status**: Acceptable (false positive)
   - **Reason**: Functions intentionally not in deps to avoid re-runs

2. ESLint errors for `_param` unused variables
   - **Status**: Acceptable (intentional design)
   - **Reason**: Parameters prefixed with `_` are reserved for future use

---

## 🛠️ Troubleshooting

### Issue: "Cannot read employees"
**Solution**: Check RLS policies are enabled for your user role

### Issue: "Sensitive data visible"
**Solution**: Verify user role is correctly set in JWT token

### Issue: "Offline sync not working"
**Solution**: Check IndexedDB permissions and service worker registration

---

## 📝 TODO

- [ ] Implement DecimalUtils in `staffPerformanceAnalyticsEngine.ts`
- [ ] Add salary history tracking
- [ ] Implement skill-based scheduling recommendations
- [ ] Add performance review workflow
- [ ] Integrate with payroll systems
- [ ] Add automated shift scheduling based on demand

---

## 📚 References

- [Module Registry Documentation](../../../modules/README.md)
- [EventBus v2 Guide](../../../lib/events/README.md)
- [Decimal.js Configuration](../../../config/decimal-config.ts)
- [Multi-Location Guide](../../../contexts/LocationContext.tsx)

---

**Last Updated**: 2025-01-30
**Maintained By**: G-Admin Development Team
