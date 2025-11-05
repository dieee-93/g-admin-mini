# Scheduling Integration Guide - Developer Documentation

**Version:** 2.0.0
**Last Updated:** 2025-01-10
**Author:** G-Admin Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Creating Adapters](#creating-adapters)
4. [Cross-Module Integration](#cross-module-integration)
5. [Event Bus Integration](#event-bus-integration)
6. [Testing](#testing)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Purpose

Este documento guía a los desarrolladores en:
- Agregar nuevos tipos de eventos al calendario
- Integrar módulos externos (Production, Appointments, etc.)
- Usar EventBus para comunicación cross-module
- Testing de adapters y componentes

### Prerequisites

Antes de empezar, debes estar familiarizado con:
- TypeScript (especialmente discriminated unions)
- Adapter Pattern
- Zustand stores
- Supabase queries
- Module Registry pattern

---

## 🚀 Quick Start

### Scenario 1: Adding Staff Shifts (Already Implemented)

Este ejemplo muestra cómo se implementó el adapter de Staff Shifts (ya funcional):

#### Step 1: Define Source Type

```typescript
// store/schedulingStore.ts
export interface Shift {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}
```

#### Step 2: Create Adapter

```typescript
// adapters/staffShiftAdapter.ts
import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, StaffShiftMetadata } from '../types/calendar';
import type { Shift } from '@/store/schedulingStore';

export class StaffShiftAdapter extends SchedulingAdapter<Shift> {
  adapt(shift: Shift): UnifiedScheduleEvent {
    // 1. Parse dates
    const start = this.combineDateTime(shift.date, shift.start_time);
    const end = this.combineDateTime(shift.date, shift.end_time);
    this.validateDates(start, end);

    // 2. Get colors
    const colors = this.getColors('staff_shift');

    // 3. Build metadata
    const metadata: StaffShiftMetadata = {
      type: 'staff_shift',
      position: shift.position,
      hourlyRate: shift.hourly_rate,
      breakDuration: 30,
      notes: shift.notes
    };

    // 4. Return unified event
    return {
      id: shift.id,
      type: 'staff_shift',
      title: this.generateTitle(shift.employee_name, 'Shift', shift.position),
      start,
      end,
      allDay: false,
      employeeId: shift.employee_id,
      employeeName: shift.employee_name,
      status: this.normalizeStatus(shift.status),
      priority: 2,
      metadata,
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'UserIcon',
      createdAt: new Date(shift.created_at),
      updatedAt: new Date(shift.updated_at)
    };
  }
}

export const staffShiftAdapter = new StaffShiftAdapter();
```

#### Step 3: Use in Page

```typescript
// page.tsx
import { staffShiftAdapter } from './adapters/staffShiftAdapter';
import { useScheduling } from './hooks/useScheduling';

const { shifts } = useScheduling(); // Get from Supabase
const events = staffShiftAdapter.adaptMany(shifts);
```

**Done!** Los turnos ahora aparecen en el calendario.

---

### Scenario 2: Adding Production Blocks (TODO)

Este ejemplo muestra cómo agregar Production blocks (aún no implementado):

#### Step 1: Define Database Schema

```sql
-- production_schedules table (TODO: Create in Supabase)
CREATE TABLE production_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id),
  recipe_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL, -- 'units', 'kg', 'liters'
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  station TEXT, -- 'grill', 'prep', 'assembly'
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many: production_schedules ↔ employees
CREATE TABLE production_staff_assignments (
  production_schedule_id UUID REFERENCES production_schedules(id),
  employee_id UUID REFERENCES employees(id),
  PRIMARY KEY (production_schedule_id, employee_id)
);
```

#### Step 2: Define TypeScript Type

```typescript
// types/production.ts (TODO: Create)
export interface ProductionSchedule {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  unit: string;
  date: string;
  startTime: string;
  endTime: string;
  station?: string;
  status: string;
  assignedStaff: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}
```

#### Step 3: Create Supabase Query

```typescript
// services/productionApi.ts (TODO: Create)
import { supabase } from '@/lib/supabase/client';
import type { ProductionSchedule } from '../types/production';

export async function getProductionSchedules(
  startDate: string,
  endDate: string
): Promise<ProductionSchedule[]> {
  const { data, error } = await supabase
    .from('production_schedules')
    .select(`
      *,
      production_staff_assignments (
        employee:employees (
          id,
          first_name,
          last_name
        )
      )
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;

  // Transform to match ProductionSchedule type
  return data.map(item => ({
    id: item.id,
    recipeId: item.recipe_id,
    recipeName: item.recipe_name,
    quantity: item.quantity,
    unit: item.unit,
    date: item.date,
    startTime: item.start_time,
    endTime: item.end_time,
    station: item.station,
    status: item.status,
    assignedStaff: item.production_staff_assignments.map(a => ({
      id: a.employee.id,
      name: `${a.employee.first_name} ${a.employee.last_name}`
    })),
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}
```

#### Step 4: Implement Adapter

```typescript
// adapters/productionAdapter.ts
import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, ProductionMetadata } from '../types/calendar';
import type { ProductionSchedule } from '../types/production';

export class ProductionAdapter extends SchedulingAdapter<ProductionSchedule> {
  adapt(schedule: ProductionSchedule): UnifiedScheduleEvent {
    const start = this.combineDateTime(schedule.date, schedule.startTime);
    const end = this.combineDateTime(schedule.date, schedule.endTime);
    this.validateDates(start, end);

    const colors = this.getColors('production');

    const metadata: ProductionMetadata = {
      type: 'production',
      recipeId: schedule.recipeId,
      recipeName: schedule.recipeName,
      quantity: schedule.quantity,
      unit: schedule.unit,
      assignedStaffIds: schedule.assignedStaff.map(s => s.id),
      assignedStaffNames: schedule.assignedStaff.map(s => s.name),
      capacityUsed: this.calculateCapacity(schedule),
      station: schedule.station
    };

    return {
      id: schedule.id,
      type: 'production',
      title: `${schedule.recipeName} (${schedule.quantity} ${schedule.unit})`,
      start,
      end,
      allDay: false,
      departmentId: 'kitchen',
      departmentName: 'Kitchen',
      status: this.normalizeStatus(schedule.status),
      priority: 2,
      metadata,
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'BeakerIcon',
      createdAt: new Date(schedule.createdAt),
      updatedAt: new Date(schedule.updatedAt)
    };
  }

  private calculateCapacity(schedule: ProductionSchedule): number {
    // TODO: Implement based on kitchen capacity data
    // For now, return a mock value
    return 75;
  }
}

export const productionAdapter = new ProductionAdapter();
```

#### Step 5: Create Hook

```typescript
// hooks/useProduction.ts (TODO: Create)
import { useState, useEffect } from 'react';
import { getProductionSchedules } from '../services/productionApi';
import type { ProductionSchedule } from '../types/production';

export function useProduction(startDate: string, endDate: string) {
  const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      try {
        setLoading(true);
        const data = await getProductionSchedules(startDate, endDate);
        if (mounted) {
          setSchedules(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => { mounted = false; };
  }, [startDate, endDate]);

  return { schedules, loading, error };
}
```

#### Step 6: Integrate in Page

```typescript
// page.tsx
import { productionAdapter } from './adapters/productionAdapter';
import { useProduction } from './hooks/useProduction';

// Inside component
const { shifts } = useScheduling();
const { schedules: productionSchedules } = useProduction(weekStart, weekEnd);

const allEvents = useMemo(() => {
  const staffEvents = staffShiftAdapter.adaptMany(shifts);
  const productionEvents = productionAdapter.adaptMany(productionSchedules);

  return [...staffEvents, ...productionEvents].sort((a, b) =>
    a.start.getTime() - b.start.getTime()
  );
}, [shifts, productionSchedules]);
```

**Done!** Production blocks ahora aparecen en el calendario junto con staff shifts.

---

## 🔗 Cross-Module Integration

### Using Module Registry Hooks

El calendario puede consumir eventos de otros módulos via Module Registry:

#### Example: Staff Module Provides Shifts

```typescript
// modules/staff/manifest.tsx
export const staffManifest: ModuleManifest = {
  id: 'staff',
  hooks: {
    provide: ['calendar.events.staff_shifts']
  },
  setup: (registry) => {
    registry.addAction(
      'calendar.events.staff_shifts',
      (data?: { weekStart: Date; weekEnd: Date }) => {
        // Return staff shifts for the week
        const shifts = getStaffShifts(data?.weekStart, data?.weekEnd);
        return staffShiftAdapter.adaptMany(shifts);
      },
      'staff',
      100
    );
  }
};
```

#### Scheduling Page Consumes

```typescript
// page.tsx
import { HookPoint } from '@/lib/modules';

const staffEvents = useHookPoint('calendar.events.staff_shifts', {
  weekStart,
  weekEnd
});

const productionEvents = useHookPoint('calendar.events.production', {
  weekStart,
  weekEnd
});

const allEvents = [...staffEvents, ...productionEvents];
```

**Benefits:**
- ✅ Modules remain decoupled
- ✅ Calendar automatically gets events from all active modules
- ✅ Easy to add/remove modules without touching calendar code

---

## 📡 Event Bus Integration

### Emitting Events from Scheduling

```typescript
// page.tsx
import EventBus from '@/lib/events';

const handleShiftCreated = (shift: Shift) => {
  // Emit event
  EventBus.emit('scheduling.shift_created', {
    shiftId: shift.id,
    employeeId: shift.employee_id,
    date: shift.date,
    startTime: shift.start_time,
    endTime: shift.end_time
  });
};
```

### Listening to Events from Other Modules

```typescript
// page.tsx or hook
import EventBus from '@/lib/events';
import { useEffect } from 'react';

useEffect(() => {
  // Listen to staff availability updates
  const unsubscribe = EventBus.on('staff.availability_updated', (data) => {
    console.log('Staff availability changed:', data);
    // Refresh calendar data
    refreshData();
  });

  return () => unsubscribe();
}, []);
```

### Event Patterns

#### Pattern 1: Domain.Entity.Action

```
scheduling.shift_created
scheduling.shift_updated
scheduling.shift_deleted
scheduling.schedule_generated
```

#### Pattern 2: Domain.State.Changed

```
scheduling.coverage_changed
scheduling.overtime_threshold_exceeded
scheduling.conflict_detected
```

### Integration Examples

#### Sales → Scheduling

```typescript
// Sales module emits volume forecast
EventBus.emit('sales.volume_forecast', {
  date: '2025-01-10',
  expectedVolume: 150,
  suggestedStaff: 8
});

// Scheduling listens and adjusts
EventBus.on('sales.volume_forecast', ({ suggestedStaff }) => {
  showNotification(`Se sugiere programar ${suggestedStaff} empleados`);
});
```

#### Scheduling → Finance

```typescript
// Scheduling emits overtime alert
EventBus.emit('scheduling.overtime_alert', {
  week: '2025-W02',
  overtimeHours: 25,
  estimatedCost: 37500
});

// Finance listens and checks budget
EventBus.on('scheduling.overtime_alert', ({ estimatedCost }) => {
  if (estimatedCost > budget) {
    showAlert('Overtime cost exceeds budget!');
  }
});
```

---

## 🧪 Testing

### Unit Testing Adapters

```typescript
// adapters/__tests__/staffShiftAdapter.test.ts
import { staffShiftAdapter } from '../staffShiftAdapter';
import type { Shift } from '@/store/schedulingStore';

describe('StaffShiftAdapter', () => {
  it('should convert Shift to UnifiedScheduleEvent', () => {
    const shift: Shift = {
      id: 'shift_001',
      employee_id: 'emp_001',
      employee_name: 'John Doe',
      date: '2025-01-10',
      start_time: '09:00',
      end_time: '17:00',
      position: 'Kitchen Chef',
      status: 'confirmed',
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-05T15:00:00Z'
    };

    const event = staffShiftAdapter.adapt(shift);

    expect(event.id).toBe('shift_001');
    expect(event.type).toBe('staff_shift');
    expect(event.title).toContain('John Doe');
    expect(event.start).toEqual(new Date('2025-01-10T09:00:00'));
    expect(event.end).toEqual(new Date('2025-01-10T17:00:00'));
    expect(event.metadata.type).toBe('staff_shift');
    expect(event.metadata.position).toBe('Kitchen Chef');
  });

  it('should validate dates', () => {
    const invalidShift: Shift = {
      // ... shift with end before start
      date: '2025-01-10',
      start_time: '17:00',
      end_time: '09:00'
    };

    expect(() => staffShiftAdapter.adapt(invalidShift)).toThrow('End date cannot be before start date');
  });
});
```

### Integration Testing

```typescript
// page.test.tsx
import { render, screen } from '@testing-library/react';
import SchedulingPage from '../page';

describe('SchedulingPage', () => {
  it('should render calendar with events', async () => {
    render(<SchedulingPage />);

    // Wait for data to load
    await screen.findByText(/Turnos/i);

    // Check calendar is rendered
    expect(screen.getByText('Mes')).toBeInTheDocument();
    expect(screen.getByText('Semana')).toBeInTheDocument();
    expect(screen.getByText('Día')).toBeInTheDocument();
  });
});
```

---

## ✅ Best Practices

### 1. Adapter Design

**DO:**
- ✅ Extend `SchedulingAdapter` base class
- ✅ Use helper methods (`combineDateTime`, `validateDates`, etc.)
- ✅ Normalize statuses with `normalizeStatus()`
- ✅ Handle missing data gracefully

**DON'T:**
- ❌ Throw errors for missing optional fields
- ❌ Hard-code colors (use `getColors()`)
- ❌ Skip date validation
- ❌ Return partial UnifiedScheduleEvent objects

### 2. Error Handling

```typescript
// Good: Graceful degradation
const events = useMemo(() => {
  try {
    return staffShiftAdapter.adaptMany(shifts);
  } catch (err) {
    logger.error('Scheduling', 'Error adapting shifts', err);
    handleError(err);
    return []; // Return empty array, don't crash
  }
}, [shifts]);
```

### 3. Performance

```typescript
// Good: Memoize expensive transformations
const unifiedEvents = useMemo(() => {
  return staffShiftAdapter.adaptMany(allShifts);
}, [allShifts]);

// Good: Filter after adaptation (not before)
const filteredEvents = useMemo(() => {
  return SchedulingUtils.filterByType(unifiedEvents, filters.eventTypes);
}, [unifiedEvents, filters]);
```

### 4. TypeScript

```typescript
// Good: Use discriminated unions
type EventMetadata = StaffShiftMetadata | ProductionMetadata;

// TypeScript can infer:
if (event.metadata.type === 'staff_shift') {
  // event.metadata.position is available (type-safe)
  console.log(event.metadata.position);
}
```

### 5. Documentation

```typescript
/**
 * Converts ProductionSchedule to UnifiedScheduleEvent
 *
 * @param schedule - Production schedule from database
 * @returns Normalized event for calendar rendering
 * @throws Error if dates are invalid
 */
adapt(schedule: ProductionSchedule): UnifiedScheduleEvent {
  // Implementation
}
```

---

## 🐛 Troubleshooting

### Issue 1: Events not showing in calendar

**Symptoms:** Adapter runs but events don't appear

**Checklist:**
- [ ] Check filter settings (event type might be filtered out)
- [ ] Verify date range (events outside referenceDate range won't show)
- [ ] Check console for errors during adaptation
- [ ] Verify event.start and event.end are valid Date objects

**Solution:**
```typescript
// Debug: Log adapted events
const events = useMemo(() => {
  const adapted = staffShiftAdapter.adaptMany(shifts);
  console.log('Adapted events:', adapted);
  return adapted;
}, [shifts]);
```

### Issue 2: TypeScript errors on metadata

**Symptoms:** `Property 'position' does not exist on type 'EventMetadata'`

**Cause:** Not using discriminated union correctly

**Solution:**
```typescript
// Wrong
const position = event.metadata.position; // TS Error

// Correct
if (event.metadata.type === 'staff_shift') {
  const position = event.metadata.position; // OK
}
```

### Issue 3: Dates showing wrong timezone

**Symptoms:** Events showing 1-3 hours off

**Cause:** Not handling timezone conversion

**Solution:**
```typescript
// In adapter, use combineDateTime helper
const start = this.combineDateTime(shift.date, shift.start_time);
// This handles local timezone correctly
```

### Issue 4: Performance issues with many events

**Symptoms:** Calendar slow to render with 100+ events

**Solution:**
```typescript
// 1. Use virtualization for large lists (Week/Day view)
// 2. Memoize filtering
// 3. Paginate by date range

const visibleEvents = useMemo(() => {
  const rangeStart = getWeekStart(referenceDate);
  const rangeEnd = getWeekEnd(referenceDate);
  return SchedulingUtils.filterByDateRange(allEvents, rangeStart, rangeEnd);
}, [allEvents, referenceDate]);
```

---

## 📚 Additional Resources

### Code References

- **Adapter Base Class:** `adapters/SchedulingAdapter.ts`
- **Type Definitions:** `types/calendar.ts`
- **Calendar Components:** `components/calendar/`
- **Example Adapter:** `adapters/staffShiftAdapter.ts`

### External Documentation

- [Adapter Pattern (Refactoring Guru)](https://refactoring.guru/design-patterns/adapter)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
- [Supabase Queries](https://supabase.com/docs/reference/javascript/select)
- [Module Registry Pattern](../../../../../lib/modules/README.md)

### Related Docs

- [Calendar Design Architecture](./SCHEDULING_CALENDAR_DESIGN.md)
- [Event Types Specification](./SCHEDULING_EVENT_TYPES.md)
- [Atomic Capabilities System](../../../../../config/types/atomic-capabilities.ts)

---

## 🆘 Getting Help

### Internal Resources

1. Check existing adapters (`staffShiftAdapter.ts`)
2. Read type definitions (`types/calendar.ts`)
3. Review architecture doc (`SCHEDULING_CALENDAR_DESIGN.md`)

### Common Questions

**Q: How do I add a new field to UnifiedScheduleEvent?**
A: Add to interface in `types/calendar.ts`, then update all adapters.

**Q: Can I have multiple metadata types for one EventType?**
A: No, each EventType has one metadata type (discriminated union).

**Q: How do I handle optional relationships (e.g., employee)?**
A: Use optional fields (`employeeId?: string`) and check before rendering.

**Q: Should I create a store for my new event type?**
A: Yes, follow the pattern: `useMyEvents()` hook + Supabase query.

---

**Document Version:** 2.0.0
**Last Review:** 2025-01-10
**Next Review:** After Production/Appointment adapters implementation
