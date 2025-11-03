# 📅 Scheduling Module - Production Ready

**Version**: 2.0.0
**Status**: ✅ PRODUCTION READY
**Last Updated**: January 2025
**Phase**: P3 (Resources)

---

## 📋 Overview

The **Scheduling Module** provides comprehensive shift management, appointment booking, time-off tracking, and labor cost optimization. It features a unified calendar system that displays multiple event types (shifts, appointments, deliveries, time-off, maintenance) in Month/Week/Day views.

### Key Features

✅ **Shift Management**
- Create, edit, and delete staff shifts
- Shift overlap detection with visual warnings
- Drag-and-drop rescheduling (Week/Day views)
- Bulk shift operations
- Auto-scheduling with AI recommendations

✅ **Calendar Views**
- Month View: Overview with event dots
- Week View: Detailed timeline with hour slots
- Day View: Granular timeline with 15-min increments

✅ **Appointment Booking** (Phase 4)
- Customer appointment scheduling
- Service provider assignment
- Time slot validation
- Cancellation policies with fees

✅ **Labor Cost Tracking**
- Real-time labor cost calculations
- Overtime alerts
- Budget threshold warnings
- Cost projections by week/month

✅ **Time-Off Management**
- Employee leave requests
- Approval/denial workflow
- Calendar integration
- Coverage impact analysis

✅ **Availability Configuration**
- Business hours by location
- Staff availability schedules
- Break time management
- Holiday/exception handling

---

## 🏗️ Architecture

### Module Structure

```
src/pages/admin/resources/scheduling/
├── page.tsx                          # Main page component
├── README.md                         # This file
├── components/
│   ├── calendar/                     # Calendar views (11 components)
│   │   ├── CalendarViewSelector.tsx
│   │   ├── MonthCalendarGrid.tsx
│   │   ├── WeekCalendarGrid.tsx
│   │   ├── DayCalendarTimeline.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventBlock.tsx
│   │   ├── EventDot.tsx
│   │   ├── EventTooltip.tsx
│   │   └── CalendarFiltersPanel.tsx
│   ├── ShiftEditorModal.tsx          # ✅ PRODUCTION-READY
│   ├── AutoSchedulingModal.tsx       # AI-powered scheduling
│   ├── AvailabilityTab.tsx           # Availability configuration
│   ├── Appointments/                 # Phase 4: Appointment system
│   │   ├── AppointmentBookingModal.tsx
│   │   ├── AppointmentList.tsx
│   │   └── AppointmentCard.tsx
│   ├── SchedulingTopBar.tsx          # Metrics & alerts
│   ├── SchedulingMetrics/            # Analytics components
│   ├── SchedulingActions/            # Toolbar actions
│   ├── SchedulingAlerts/             # Alert system
│   ├── LaborCosts/                   # Cost tracking
│   ├── TimeOff/                      # Leave management
│   └── WeeklySchedule/               # Weekly view
├── hooks/
│   ├── useSchedulingPage.ts          # Main page logic
│   ├── useScheduling.ts              # Shifts CRUD
│   ├── useAppointments.ts            # Appointments CRUD
│   ├── useSchedulingAlerts.ts        # Alert management
│   └── useShiftForm.ts               # Form validation
├── adapters/                         # ✅ ALL 7 ADAPTERS PRODUCTION-READY
│   ├── SchedulingAdapter.ts          # Base adapter utilities
│   ├── staffShiftAdapter.ts          # ✅ Shifts → Unified events (v3.0)
│   ├── appointmentAdapter.ts         # ✅ Appointments → Events (Phase 4)
│   ├── deliveryAdapter.ts            # ✅ Deliveries → Events (with zones)
│   ├── timeOffAdapter.ts             # ✅ Time-off → Events (with approval)
│   ├── maintenanceAdapter.ts         # ✅ Maintenance → Events (by equipment)
│   └── productionAdapter.ts          # ✅ Production → Events (v2.0 - COMPLETE)
├── services/
│   ├── schedulingApi.ts              # Supabase API
│   ├── SchedulingIntelligenceEngine.ts  # AI analytics
│   ├── SchedulingAlertsAdapter.ts    # Alert integration
│   └── index.ts
└── types/
    ├── calendar.ts                   # Unified event types
    ├── appointments.ts               # Appointment types
    └── index.ts
```

---

## 🗄️ Database Schema

### Tables

#### 1. **shifts** (Staff Shifts)
Primary table for shift assignments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `employee_id` | UUID | Staff member reference |
| `date` | TEXT | ISO date (YYYY-MM-DD) |
| `start_time` | TEXT | Start time (HH:MM) |
| `end_time` | TEXT | End time (HH:MM) |
| `position` | TEXT | Job position |
| `status` | TEXT | scheduled, confirmed, in_progress, completed, cancelled |
| `hourly_rate` | NUMERIC | Pay rate (optional) |
| `notes` | TEXT | Additional notes |

**Indexes**: `employee_id`, `date`, `status`
**RLS**: Enabled (role-based access)

#### 2. **appointments** (Customer Appointments)
Service appointments with time slots.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `appointment_date` | DATE | Appointment date |
| `start_time` | TEXT | Start time (HH:MM) |
| `end_time` | TEXT | End time (HH:MM) |
| `customer_id` | UUID | Customer reference |
| `provider_id` | UUID | Staff provider reference |
| `service_id` | UUID | Service/product reference |
| `status` | TEXT | scheduled, confirmed, in_progress, completed, cancelled, no_show |
| `booking_source` | TEXT | online, phone, walk_in |
| `cancellation_reason` | TEXT | Reason if cancelled |
| `notes` | TEXT | Additional notes |

**Functions**: `is_time_slot_available(provider_id, date, start_time, end_time, exclude_id)`
**RLS**: Enabled

#### 3. **time_off_requests** (Leave Requests)
Employee time-off/leave management.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `employee_id` | UUID | Staff member reference |
| `start_date` | DATE | Leave start date |
| `end_date` | DATE | Leave end date |
| `type` | TEXT | vacation, sick, personal, emergency |
| `status` | TEXT | pending, approved, denied, cancelled |
| `reason` | TEXT | Leave reason |
| `reviewed_by` | UUID | Approver user ID |
| `review_notes` | TEXT | Approval/denial notes |

**RLS**: Enabled

#### 4. **availability_rules** (Business Hours)
Global availability configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `location_id` | UUID | Location reference (optional) |
| `day_of_week` | INTEGER | 0-6 (Sunday=0) |
| `start_time` | TEXT | Open time (HH:MM:SS) |
| `end_time` | TEXT | Close time (HH:MM:SS) |
| `is_active` | BOOLEAN | Rule enabled/disabled |
| `min_advance_hours` | INTEGER | Booking window |
| `buffer_minutes` | INTEGER | Time between appointments |
| `slot_duration_minutes` | INTEGER | Default appointment length |

**RLS**: Enabled

#### 5. **professional_availability** (Staff Availability)
Individual staff member schedules.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `staff_id` | UUID | Staff member reference |
| `day_of_week` | INTEGER | 0-6 |
| `start_time` | TEXT | Available from (HH:MM:SS) |
| `end_time` | TEXT | Available until (HH:MM:SS) |
| `break_start_time` | TEXT | Break start (optional) |
| `break_end_time` | TEXT | Break end (optional) |
| `is_active` | BOOLEAN | Rule enabled |

**RLS**: Enabled

#### 6. **availability_exceptions** (Special Dates)
Holiday closures and special hours.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `staff_id` | UUID | Staff member (NULL = all staff) |
| `exception_date` | DATE | Special date |
| `is_closed` | BOOLEAN | Location closed that day |
| `custom_start_time` | TEXT | Modified open time (optional) |
| `custom_end_time` | TEXT | Modified close time (optional) |
| `reason` | TEXT | Holiday, Maintenance, etc. |

**RLS**: Enabled

---

## 🔌 Integration Points

### Module Dependencies

**Depends on**:
- `staff` - Employee data required for shift assignments

**Consumes Hooks**:
- `staff.availability.updated` - React to staff availability changes
- `sales.volume_forecast` - Adjust staffing based on demand forecasts
- `production.schedule.updated` - React to production schedule changes
- `materials.stock_alert` - Alert if low stock affects production

**Provides Hooks**:
- `calendar.events` - Render time-off requests in calendar
- `scheduling.toolbar.actions` - Custom toolbar buttons
- `dashboard.widgets` - Scheduling stats widget
- `scheduling.event.actions` - Context actions for events

### Event System

**Emits Events**:
```typescript
'scheduling.shift_created'       // New shift created
'scheduling.shift_updated'       // Shift modified
'scheduling.shift_deleted'       // Shift removed
'scheduling.slot_booked'         // Appointment slot reserved
'scheduling.today_scheduled'     // Today's schedule finalized
'scheduling.coverage_alert'      // Understaffed warning
'scheduling.overtime_alert'      // Overtime threshold exceeded
```

**Listens to Events**:
```typescript
'staff.employee_updated'         // Update shift display names
'staff.employee_deleted'         // Cancel shifts for deleted employees
'sales.order.completed'          // Track busy periods for auto-schedule
'production.batch.scheduled'     // Block shift times for production
```

---

## 🎯 Usage Examples

### Creating a Shift

```typescript
import { shiftsApi } from './services/schedulingApi';

const newShift = {
  employee_id: 'uuid-here',
  date: '2025-02-15',
  start_time: '09:00',
  end_time: '17:00',
  position: 'Server',
  status: 'scheduled',
  hourly_rate: 15.50
};

await shiftsApi.createShift(newShift);
```

### Booking an Appointment

```typescript
import { appointmentsApi } from './services/schedulingApi';

const appointment = {
  appointment_date: '2025-02-15',
  start_time: '14:00',
  end_time: '15:00',
  customer_id: 'customer-uuid',
  provider_id: 'staff-uuid',
  service_id: 'service-uuid',
  status: 'scheduled',
  booking_source: 'online'
};

await appointmentsApi.createAppointment(appointment);
```

### Checking Time Slot Availability

```typescript
import { supabase } from '@/lib/supabase/client';

const { data, error } = await supabase.rpc('is_time_slot_available', {
  provider_id: 'staff-uuid',
  date: '2025-02-15',
  start_time: '14:00',
  end_time: '15:00',
  exclude_id: null // Or appointment ID to exclude when editing
});

if (data) {
  // Slot is available
}
```

### Using Unified Events

```typescript
import { staffShiftAdapter, appointmentAdapter } from './adapters';

// Convert shifts to unified events
const shifts = await shiftsApi.getShifts({ date: '2025-02-15' });
const shiftEvents = staffShiftAdapter.adaptMany(shifts);

// Convert appointments to unified events
const appointments = await appointmentsApi.getAppointments({ date: '2025-02-15' });
const appointmentEvents = appointmentAdapter.adaptMany(appointments);

// Combine all events
const allEvents = [...shiftEvents, ...appointmentEvents];

// Render in calendar
<MonthCalendarGrid events={allEvents} />
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run scheduling-specific tests
pnpm test src/pages/admin/resources/scheduling/
```

### E2E Tests

```bash
# Run full scheduling workflow tests
pnpm test:run src/__tests__/e2e/scheduling-module.e2e.test.tsx
```

### Manual Testing Checklist

**Shift Management**:
- [ ] Create shift with valid employee
- [ ] Edit shift start/end times
- [ ] Delete shift
- [ ] Detect overlap when creating conflicting shift
- [ ] Drag & drop shift in Week view
- [ ] Auto-schedule suggests optimal shifts

**Appointment Booking**:
- [ ] Book appointment with available provider
- [ ] Reject booking for unavailable time slot
- [ ] Cancel appointment with cancellation fee
- [ ] No-show marks appointment correctly

**Calendar Views**:
- [ ] Month view shows event dots
- [ ] Week view displays 7-day timeline
- [ ] Day view shows 15-minute slots
- [ ] Filters work correctly (event type, employee, department)
- [ ] Search finds events by title/description/employee

**Labor Cost Tracking**:
- [ ] Real-time cost updates when shifts change
- [ ] Overtime alert triggers at 40+ hours/week
- [ ] Budget alert shows when threshold exceeded

**Time-Off Management**:
- [ ] Submit leave request
- [ ] Approve/deny request workflow
- [ ] Calendar shows approved leave as time-off event
- [ ] Coverage alert if understaffed due to leave

---

## 🚀 Performance

### Optimizations

- **Lazy Loading**: Calendar views load on-demand
- **Virtual Scrolling**: Week/Day views use virtualization for 100+ events
- **Memoization**: Event filtering uses `useMemo` to prevent re-renders
- **Batch Updates**: Bulk shift operations use single transaction
- **IndexedDB Cache**: Offline-first with local event cache

### Metrics

- **Initial Load**: < 500ms (without data)
- **Event Filtering**: < 50ms for 500+ events
- **Shift Creation**: < 200ms (optimistic update)
- **Calendar Re-render**: < 100ms (view change)

---

## 🔒 Security

### Role-Based Access

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Full access (all locations) |
| **MANAGER** | Full access (own location) |
| **SUPERVISOR** | View/edit shifts, approve time-off |
| **EMPLOYEE** | View own shifts, request time-off |
| **CUSTOMER** | Book appointments only |

### RLS Policies

All scheduling tables have Row Level Security enabled:

```sql
-- Example: shifts table policy
CREATE POLICY "supervisors_manage_shifts"
ON shifts
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM employees
    WHERE role IN ('SUPER_ADMIN', 'MANAGER', 'SUPERVISOR')
  )
);
```

---

## 📝 Configuration

### Required Features

Activate these features in `BusinessModelRegistry.ts`:

```typescript
capabilities: [
  'staff_management',          // Base staff capability
  'staff_shift_management',    // Shift CRUD (REQUIRED)
  'scheduling_calendar_management', // Calendar views
  'scheduling_appointment_booking', // Appointments (optional)
  'staff_labor_cost_tracking'  // Cost tracking (optional)
]
```

### Module Manifest

Located at: `src/modules/scheduling/manifest.tsx`

```typescript
export const schedulingManifest: ModuleManifest = {
  id: 'scheduling',
  version: '1.0.0',
  depends: ['staff'],
  requiredFeatures: ['staff_shift_management'],
  minimumRole: 'SUPERVISOR'
};
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Employee not found" error when creating shift
**Solution**: Ensure employee exists in `employees` table and is active

**Issue**: Time slot validation fails
**Solution**: Check `is_time_slot_available` function exists in database

**Issue**: Shifts not showing in calendar
**Solution**: Verify `staffShiftAdapter` is importing correctly and events are filtered properly

**Issue**: Overtime alerts not triggering
**Solution**: Check `useSchedulingAlerts` hook is subscribed to labor cost changes

**Issue**: Calendar is slow with 500+ events
**Solution**: Enable virtualization in Week/Day views and reduce visible date range

---

## 🔌 Adapter System (v2.0 - All Complete)

### Overview

The Scheduling module uses a **unified adapter system** to convert different event types into a common `UnifiedScheduleEvent` format. This enables the calendar to display shifts, appointments, deliveries, time-off, maintenance, and production blocks in a consistent, extensible way.

### ✅ Completed Adapters (7/7)

#### 1. **StaffShiftAdapter** (v3.0)
- Converts staff shifts to calendar events
- **Features**:
  - Break duration tracking
  - Hourly rate calculations
  - Position-based coloring
  - Week/day filtering helpers
- **Helper Methods**: `adaptWeekShifts()`, `adaptDayShifts()`

#### 2. **AppointmentAdapter** (Phase 4)
- Converts customer appointments to calendar events
- **Features**:
  - Customer contact info embedding
  - Service duration tracking
  - Provider (staff) assignment
  - Booking source tracking (online, phone, walk-in)
  - Reminder status tracking
- **Priority Logic**: Walk-ins = High, Confirmed = High, Scheduled = Medium
- **Helper Methods**: Priority calculation based on booking source

#### 3. **DeliveryAdapter**
- Converts delivery routes to calendar events
- **Features**:
  - Driver assignment tracking
  - Delivery zone mapping
  - Distance and estimated time
  - Tracking URL support
- **Priority Logic**: <30 min = High, >10 km = Medium
- **Helper Methods**: `adaptByZone()`, `adaptByDriver()`

#### 4. **TimeOffAdapter**
- Converts leave requests to calendar events
- **Features**:
  - Multiple request types (vacation, sick, personal, emergency)
  - Approval workflow status
  - All-day and partial-day support
  - Reviewer comments tracking
- **Priority Logic**: Emergency = High, Sick = High, Personal = Medium, Vacation = Low
- **Helper Methods**: `adaptByType()`, `adaptPendingApproval()`
- **Icons**: Dynamic based on request type (vacation = calendar, sick = heart, emergency = warning)

#### 5. **MaintenanceAdapter**
- Converts equipment maintenance schedules to calendar events
- **Features**:
  - Equipment tracking by ID
  - Maintenance types (preventive, corrective, inspection)
  - Technician assignment
  - Estimated cost tracking
- **Priority Logic**: Corrective (broken) = High, Inspection = Medium, Preventive = Low
- **Helper Methods**: `adaptByEquipment()`, `adaptByType()`, `adaptUrgent()`
- **Icons**: Dynamic based on type (corrective = exclamation, preventive = wrench)

#### 6. **ProductionAdapter** (v2.0 - NEWLY COMPLETE)
- Converts production batches to calendar events
- **Features**:
  - Recipe-based production tracking
  - Batch number support
  - Multi-staff assignment (team-based)
  - Station/workstation tracking
  - Capacity calculation (25% per person, max 100%)
  - Priority support (low, medium, high, urgent)
- **Priority Logic**:
  - Explicit priority if provided
  - Quantity >100 = High, >50 = Medium, else Low
- **Helper Methods**: `adaptByRecipe()`, `adaptByStation()`, `adaptHighPriority()`, `adaptUnassigned()`
- **Staff Formatting**: Smart display ("John", "John y Mary", "John +2")

#### 7. **SchedulingAdapter** (Base Class)
- Abstract base class for all adapters
- **Provides**:
  - `adapt()` abstract method
  - `adaptMany()` batch conversion
  - `combineDateTime()` date + time utility
  - `validateDates()` validation
  - `getColors()` event type colors
  - `normalizeStatus()` status mapping
  - `generateTitle()` title helper

### Adapter Architecture

```typescript
// All adapters extend SchedulingAdapter
export class StaffShiftAdapter extends SchedulingAdapter<StaffShift> {
  adapt(shift: StaffShift): UnifiedScheduleEvent {
    // 1. Combine date + time
    const start = this.combineDateTime(shift.date, shift.startTime);
    const end = this.combineDateTime(shift.date, shift.endTime);

    // 2. Get colors for event type
    const colors = this.getColors('staff_shift');

    // 3. Build metadata
    const metadata: StaffShiftMetadata = { /* ... */ };

    // 4. Return unified event
    return { /* UnifiedScheduleEvent */ };
  }
}
```

### Integration with Calendar

All adapted events flow through the unified pipeline:

```
Raw Data → Adapter → UnifiedScheduleEvent → Calendar Grid → User
```

**Benefits**:
- ✅ Single event format for all calendar views
- ✅ Consistent filtering across event types
- ✅ Easy to add new event types (just create adapter)
- ✅ Type-safe with TypeScript
- ✅ Testable in isolation

---

## 🔮 Future Enhancements

**Planned Features**:
- [ ] Recurring shift templates (every Monday 9-5)
- [ ] SMS/Email reminders for shifts and appointments
- [ ] Mobile app for staff shift swaps
- [ ] AI-powered demand forecasting integration
- [ ] Gantt chart view for production batches
- [ ] Export calendar to Google/Outlook
- [ ] Multi-location shift transfers
- [ ] Payroll integration (export hours worked)

**Phase 5 Enhancements**:
- [ ] Advanced auto-scheduling with ML
- [ ] Real-time collaboration (see who's editing)
- [ ] Shift marketplace (staff bid on open shifts)
- [ ] Integration with time-tracking hardware

---

## 📚 Related Documentation

- **Module Architecture**: `src/modules/ARCHITECTURE.md`
- **EventBus Integration**: `docs/06-features/eventbus-system.md`
- **Calendar Design Spec**: `src/pages/admin/resources/scheduling/docs/SCHEDULING_CALENDAR_DESIGN.md`
- **Event Types Reference**: `src/pages/admin/resources/scheduling/docs/SCHEDULING_EVENT_TYPES.md`
- **Staff Module**: `src/pages/admin/resources/staff/README.md`

---

## 🤝 Contributing

When modifying the Scheduling module:

1. **Add New Event Types**: Create adapter in `adapters/` directory
2. **New Calendar Views**: Extend `CalendarView` type and add grid component
3. **New Metrics**: Update `SchedulingIntelligenceEngine.ts`
4. **New Alerts**: Register in `SchedulingAlertsAdapter.ts`
5. **Database Changes**: Create migration in `database/migrations/`

---

**Last Updated**: January 2025
**Maintainer**: G-Admin Team
**Status**: ✅ PRODUCTION READY
**Version**: 2.0.0
