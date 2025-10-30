# Scheduling Module - Documentation Index

**Version:** 2.3.0 - Phase 3 Complete + All Features Integrated
**Last Updated:** 2025-01-12

---

## 📚 Documentation

### Core Documentation

1. **[Scheduling Calendar Design](./docs/SCHEDULING_CALENDAR_DESIGN.md)** 🏗️
   - Architecture overview
   - Component hierarchy
   - Month/Week/Day views specification
   - Color system
   - Interactions & UX patterns

2. **[Event Types Specification](./docs/SCHEDULING_EVENT_TYPES.md)** 📊
   - Complete event type catalog
   - UnifiedScheduleEvent structure
   - Metadata specifications
   - Capability mapping
   - Examples for each event type

3. **[Integration Guide](./docs/SCHEDULING_INTEGRATION_GUIDE.md)** 🔗
   - Quick start examples
   - Creating new adapters
   - Cross-module integration
   - EventBus patterns
   - Testing strategies
   - Troubleshooting

4. **[Module Registry Integration](./docs/MODULE_REGISTRY_INTEGRATION.md)** 🔌 **NEW**
   - HookPoints implementation (calendar.events, toolbar.actions, top_metrics)
   - Cross-module actions reference (Sales, Materials, Kitchen)
   - Extension pattern for new modules
   - Debugging & troubleshooting
   - Styling guidelines & priorities

---

## 🚀 Quick Links

### For Users
- **Main Page:** `page.tsx`
- **Calendar Views:** `components/calendar/`
- **Filters:** `components/calendar/CalendarFiltersPanel.tsx`

### For Developers
- **Types:** `types/calendar.ts`
- **Adapters:** `adapters/` (StaffShift, Delivery, TimeOff, Maintenance)
- **Hooks:** `hooks/`
- **Services:** `services/schedulingApi.ts`
- **Implementation Guide:** `PHASE_3_PROMPT.md`

### For Designers
- **Color System:** See `types/calendar.ts` → `EVENT_COLORS`
- **UI Components:** `components/calendar/`
- **Design Spec:** `docs/SCHEDULING_CALENDAR_DESIGN.md`

---

## ✅ What's Implemented

### Phase 1: Core Calendar (✅ COMPLETED)

- ✅ **UnifiedScheduleEvent** type system
- ✅ **Adapter pattern** for data normalization
- ✅ **StaffShiftAdapter** (fully functional)
- ✅ **Month view** with event dots & tooltips
- ✅ **Calendar view selector** (Month/Week/Day tabs)
- ✅ **Date navigation** (◀ Today ▶)
- ✅ **Filters panel** (event types, departments, statuses)
- ✅ **Compact top bar** (metrics + alerts)
- ✅ **Modal integration** (ShiftEditor, AutoScheduling)
- ✅ **Complete documentation** (3 comprehensive guides)

### Phase 2: Week & Day Views (✅ COMPLETED)

- ✅ **WeekCalendarGrid** - Timeline with drag & drop
- ✅ **DayCalendarTimeline** - Detailed hour-by-hour view
- ✅ **EventBlock component** - Medium variant for week view
- ✅ **EventCard component** - Expanded variant for day view
- ✅ **Drag & drop** - Reschedule events by dragging (Week view)
- ✅ **Current time indicator** - Red line in Day view
- ✅ **Overlap handling** - Multi-column layout for simultaneous events
- ✅ **Inline actions** - Edit/Delete/Complete buttons in Day view
- ✅ **Auto-scroll** - Day view scrolls to current time
- ✅ **Empty states** - User-friendly messages when no events

### Phase 3: Additional Event Types & Features (✅ COMPLETED)

#### Event Type Adapters
- ✅ **DeliveryAdapter** - Delivery schedules with zones & drivers
- ✅ **TimeOffAdapter** - Employee time-off requests (vacation, sick, personal, emergency)
- ✅ **MaintenanceAdapter** - Equipment maintenance (preventive, corrective, inspection)
- ✅ **ProductionAdapter** - Production blocks (placeholder - requires production module data)
- ✅ **AppointmentAdapter** - Customer appointments (placeholder - requires appointments table)

#### Secondary Features
- ✅ **Drag & drop backend integration** - Events persist to database via `shiftsApi.updateEventTime()`
- ✅ **Employee filter dropdown** - Multi-select filter by employee with event counts
- ✅ **Search functionality** - Real-time search in title, description, employee, department
- ✅ **Department filters** - Exact match filtering by department name
- ✅ **Status filters** - Filter events by status (scheduled, confirmed, in_progress, etc.)
- ✅ **Event click handlers** - Switch-case routing for all 6 event types
- ✅ **Metric click actions** - Interactive metrics that open filters or navigate to views

---

## 📋 What's Pending

### Phase 4: Advanced Features

- 📋 **Bulk operations** - Copy week, delete multiple
- 📋 **Export** - PDF/Excel export
- 📋 **Keyboard shortcuts** - Cmd+N, arrows, etc.
- 📋 **Mobile responsive** - Touch optimizations
- 📋 **Detail modals** - Delivery, TimeOff, Maintenance detail views (handlers exist, modals pending)

### Phase 5: AI & Automation

- 📋 **Smart suggestions** - AI-powered scheduling
- 📋 **Conflict detection** - Auto-detect overlaps
- 📋 **Auto-fill gaps** - Based on availability
- 📋 **Forecasting** - Predict staffing needs

---

## 🏗️ Architecture

```
scheduling/
├── docs/                               # 📚 Documentation
│   ├── SCHEDULING_CALENDAR_DESIGN.md
│   ├── SCHEDULING_EVENT_TYPES.md
│   └── SCHEDULING_INTEGRATION_GUIDE.md
│
├── types/                              # 📐 TypeScript Types
│   └── calendar.ts                     # UnifiedScheduleEvent, EventType, etc.
│
├── adapters/                           # 🔄 Data Adapters
│   ├── SchedulingAdapter.ts            # Base class
│   ├── staffShiftAdapter.ts            # ✅ Staff shifts (implemented)
│   ├── deliveryAdapter.ts              # ✅ Deliveries (implemented)
│   ├── timeOffAdapter.ts               # ✅ Time-off (implemented)
│   ├── maintenanceAdapter.ts           # ✅ Maintenance (implemented)
│   ├── productionAdapter.ts            # 📋 Production (placeholder)
│   ├── appointmentAdapter.ts           # 📋 Appointments (placeholder)
│   └── index.ts
│
├── components/
│   ├── calendar/                       # 📅 Calendar Components
│   │   ├── CalendarViewSelector.tsx   # ✅ Month/Week/Day tabs
│   │   ├── MonthCalendarGrid.tsx      # ✅ Month view (completed)
│   │   ├── WeekCalendarGrid.tsx       # ✅ Week view (completed)
│   │   ├── DayCalendarTimeline.tsx    # ✅ Day view (completed)
│   │   ├── EventDot.tsx                # ✅ Color dots for month view
│   │   ├── EventTooltip.tsx            # ✅ Hover tooltips
│   │   ├── CalendarFiltersPanel.tsx   # ✅ Filters sidebar
│   │   └── index.ts
│   │
│   ├── SchedulingTopBar.tsx            # ✅ Metrics + Alerts compact
│   ├── SchedulingMetrics.tsx           # ⚠️ Legacy (usar TopBar)
│   ├── SchedulingAlerts.tsx            # ⚠️ Legacy (usar TopBar)
│   ├── ShiftEditorModal.tsx            # ✅ Create/edit shifts
│   └── AutoSchedulingModal.tsx         # ✅ Auto-schedule wizard
│
├── hooks/
│   ├── useSchedulingPage.ts            # Page orchestration
│   └── useScheduling.ts                # Supabase data fetching
│
├── services/
│   └── schedulingApi.ts                # Supabase queries
│
├── page.tsx                            # ✅ Main scheduling page (v2.0)
├── page.tsx.backup                     # Old version (backup)
└── README.md                           # 👈 You are here
```

---

## 🎨 Design System

### Event Colors

| Type        | Bg        | Border     | Text       | Dot       | Use Case            |
|-------------|-----------|------------|------------|-----------|---------------------|
| staff_shift | blue.50   | blue.500   | blue.900   | #3182CE   | Employee shifts     |
| production  | purple.50 | purple.500 | purple.900 | #805AD5   | Kitchen production  |
| appointment | green.50  | green.500  | green.900  | #38A169   | Customer bookings   |
| time_off    | orange.50 | orange.500 | orange.900 | #DD6B20   | Employee absences   |
| delivery    | cyan.50   | cyan.500   | cyan.900   | #0BC5EA   | Delivery schedules  |
| maintenance | gray.50   | gray.500   | gray.900   | #718096   | Equipment service   |

### Icons (Heroicons v2)

- `UserIcon` - Staff shifts
- `BeakerIcon` - Production
- `CalendarIcon` - Appointments
- `TruckIcon` - Deliveries
- `CalendarDaysIcon` - Time-off
- `WrenchScrewdriverIcon` - Maintenance

---

## 🔧 Development

### Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server (usually running on :5173)
pnpm dev

# Type check
pnpm -s exec tsc --noEmit

# Lint
pnpm lint
```

### Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test scheduling
```

### Adding a New Event Type

1. Read [Integration Guide](./docs/SCHEDULING_INTEGRATION_GUIDE.md)
2. Define metadata interface in `types/calendar.ts`
3. Create adapter in `adapters/`
4. Wire to page in `page.tsx`
5. Update documentation

---

## 🐛 Known Issues

### High Priority
- ❗ Production/Appointment adapters need real data sources (placeholders throw errors)
- ❗ Delivery/TimeOff/Maintenance tables don't exist in Supabase yet (adapters ready)

### Medium Priority
- ⚠️ Detail modals for Delivery/TimeOff/Maintenance not implemented (click handlers log to console)
- ⚠️ Mobile responsive needs optimization
- ⚠️ Coverage/cost analysis views referenced by metrics don't exist yet

### Low Priority
- 💡 Keyboard shortcuts not implemented
- 💡 Bulk operations not implemented
- 💡 Export not implemented

---

## 📦 Dependencies

### Core
- React 19.1+
- TypeScript 5.8.3+
- Chakra UI v3.23.0 (via `@/shared/ui`)
- Heroicons v2.2.0

### State Management
- Zustand v5.0.7 (`schedulingStore.ts`)
- Supabase client (`shift_schedules` table)

### Utilities
- date-fns (via `combineDateTime` helper)
- Logger (`@/lib/logging`)
- EventBus (`@/lib/events`)

---

## 🆘 Support

### Internal Resources
1. **Documentation:** `./docs/`
2. **Code Examples:** `adapters/staffShiftAdapter.ts`
3. **Type Definitions:** `types/calendar.ts`

### Common Questions

**Q: Are Week/Day views functional?**
A: Yes! Both are fully implemented with drag & drop, time indicators, and overlap handling.

**Q: How do I add Production events?**
A: See [Integration Guide](./docs/SCHEDULING_INTEGRATION_GUIDE.md) → Scenario 2. Adapter exists but needs real data source.

**Q: Can I customize event colors?**
A: Yes, edit `EVENT_COLORS` in `types/calendar.ts`.

**Q: How do I filter by employee?**
A: Use the filters panel (funnel icon). Employee filter is fully functional via `SchedulingUtils.filterByEmployee()`.

**Q: Why aren't Delivery/TimeOff/Maintenance events showing?**
A: The adapters exist and are integrated, but the Supabase tables haven't been created yet. Add placeholder data to test.

---

## 📈 Version History

### v2.3.0 (2025-01-12) - Current
- ✅ All 3 new adapters integrated (Delivery, TimeOff, Maintenance)
- ✅ Department & status filters implemented
- ✅ Event click handlers for all 6 types
- ✅ Interactive metric clicks with filter actions
- ✅ Complete documentation update

### v2.2.0 (2025-01-11)
- ✅ DeliveryAdapter, TimeOffAdapter, MaintenanceAdapter created
- ✅ Phase 3 adapter development complete

### v2.1.0 (2025-01-11)
- ✅ Week view fully functional with drag & drop
- ✅ Day view with timeline and current time indicator
- ✅ EventBlock & EventCard components
- ✅ Overlap handling (multi-column layout)
- ✅ Inline actions in Day view
- ✅ Auto-scroll to current time

### v2.0.0 (2025-01-10)
- ✅ Complete rewrite with calendar-first design
- ✅ UnifiedScheduleEvent type system
- ✅ Adapter pattern implementation
- ✅ Month view with filters
- ✅ Comprehensive documentation

### v1.0.0 (Previous)
- ⚠️ Legacy tab-based design
- ⚠️ Separated views (Horarios, Permisos, Cobertura, etc.)
- ⚠️ No unified event system
- ⚠️ Backup available in `page.tsx.backup`

---

## 🎯 Next Steps

1. **Immediate** - Create Supabase tables for Delivery/TimeOff/Maintenance
2. **This Week** - Implement detail modals for new event types
3. **This Week** - Create production_schedules table and wire ProductionAdapter
4. **This Month** - Create appointments table and wire AppointmentAdapter
5. **Q1 2025** - Coverage/cost analysis views for metric clicks
6. **Q2 2025** - AI-powered scheduling suggestions

---

**Maintainer:** G-Admin Team
**Last Updated:** 2025-01-12
**Status:** ✅ Phase 1, 2 & 3 Complete
