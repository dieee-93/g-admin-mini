# Scheduling Calendar Design - Architecture Document

**Version:** 2.3.0
**Last Updated:** 2025-01-12
**Author:** G-Admin Team

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Hierarchy](#component-hierarchy)
4. [Views Specification](#views-specification)
5. [Data Flow](#data-flow)
6. [Color System](#color-system)
7. [Interactions](#interactions)
8. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

### Problem Statement

El módulo de Scheduling anterior tenía problemas de:
- Fragmentación: Tabs separados (Horarios, Permisos, Cobertura, Costos)
- Falta de visión unificada del calendario
- Dificultad para ver múltiples tipos de eventos simultáneamente
- No escalaba para múltiples capabilities del negocio

### Solution

**Calendar-first design** con sistema unificado de eventos:
- ✅ Calendario como elemento central (80% de la interfaz)
- ✅ Vistas Month/Week/Day con navegación fluida
- ✅ Soporte para múltiples tipos de eventos (staff, production, appointments, etc.)
- ✅ Sistema de filtros robusto
- ✅ Arquitectura extensible via adapters

---

## 🏗️ Architecture

### High-Level Structure

```
SchedulingPage.tsx (Main orchestrator)
├── SchedulingTopBar (Metrics + Alerts compactas)
├── CalendarViewSelector (Month/Week/Day tabs + Navigation)
├── Calendar Views
│   ├── MonthCalendarGrid (Vista mensual con dots)
│   ├── WeekCalendarGrid (Vista semanal ✅ Completa)
│   └── DayCalendarTimeline (Vista diaria ✅ Completa)
├── CalendarFiltersPanel (Slide-in lateral)
└── Modals
    ├── ShiftEditorModal
    └── AutoSchedulingModal
```

### Data Architecture

```
Supabase Tables
      ↓
   Adapters (convert to UnifiedScheduleEvent)
      ↓
  Filters (apply user selections)
      ↓
  Calendar Views (render by type)
```

### Key Patterns

1. **Adapter Pattern**: Normaliza diferentes fuentes de datos
2. **Strategy Pattern**: Vistas intercambiables (Month/Week/Day)
3. **Observer Pattern**: EventBus para cross-module communication
4. **Command Pattern**: Actions con callbacks

---

## 📦 Component Hierarchy

### Top Level

```tsx
<SchedulingPage>
  <SchedulingTopBar stats={stats} />

  <Section>
    <CalendarViewSelector
      view={view}
      onViewChange={handleViewChange}
    />

    {view === 'month' && <MonthCalendarGrid />}
    {view === 'week' && <WeekCalendarGrid />}
    {view === 'day' && <DayCalendarTimeline />}
  </Section>

  <CalendarFiltersPanel isOpen={isOpen} />

  <ShiftEditorModal isOpen={isShiftEditorOpen} />
  <AutoSchedulingModal isOpen={isAutoSchedulingOpen} />
</SchedulingPage>
```

### MonthCalendarGrid Components

```tsx
<MonthCalendarGrid>
  {days.map(day => (
    <DayCell>
      <DayNumber />
      <EventDotsGroup types={eventTypes} />
      {hover && <EventTooltip events={dayEvents} />}
    </DayCell>
  ))}
</MonthCalendarGrid>
```

### WeekCalendarGrid Components (✅ Implemented)

```tsx
<WeekCalendarGrid>
  <WeekHeader days={weekDays} />
  <TimeSlotGrid>
    {timeSlots.map(slot => (
      <TimeSlot>
        {events.map(event => (
          <EventBlock
            variant="medium"
            event={event}
            onDragEnd={handleReschedule}
          />
        ))}
      </TimeSlot>
    ))}
  </TimeSlotGrid>
</WeekCalendarGrid>
```

### DayCalendarTimeline Components (✅ Implemented)

```tsx
<DayCalendarTimeline>
  <TimelineGrid>
    {hours.map(hour => (
      <HourSlot>
        <HourLabel />
        {events.map(event => (
          <EventCard
            variant="expanded"
            event={event}
            actions={inlineActions}
          />
        ))}
      </HourSlot>
    ))}
  </TimelineGrid>
  {isToday && <CurrentTimeIndicator />}
</DayCalendarTimeline>
```

---

## 📅 Views Specification

### Month View (✅ IMPLEMENTED)

**Purpose:** Visión general del mes, identificar días ocupados

**Layout:**
- Grid 7x5/6 (días x semanas)
- Días del mes anterior/siguiente para completar semanas
- Máximo 3 dots por día + contador

**Interactions:**
- Click en día → Navega a Day view
- Hover en día → Tooltip con resumen
- Dots por tipo de evento (color-coded)

**Data Density:** BAJA (solo indicadores)

### Week View (✅ Completed)

**Purpose:** Planificación semanal, ver distribución de turnos

**Layout:**
- Grid 7 columnas (Lun-Dom)
- Rows por hora (ej: 08:00-20:00, intervalos 1h)
- Eventos apilados verticalmente

**Interactions:**
- Drag & drop para rescheduling
- Click en evento → Modal de edición
- Resize de eventos (cambiar duración)

**Data Density:** MEDIA (bloques con nombre + tiempo)

### Day View (✅ Completed)

**Purpose:** Máximo detalle, gestión minuto a minuto

**Layout:**
- Timeline vertical con slots de 30min
- Multicolumna para overlaps
- Current time indicator (si es hoy)

**Interactions:**
- Click en evento → Inline expansion
- Actions inline (Edit, Delete, Complete)
- Drag to resize/move
- Hover muestra metadata completa

**Data Density:** ALTA (todos los detalles visibles)

---

## 🔄 Data Flow

### 1. Data Fetching

```typescript
useScheduling()
  → Supabase query (shift_schedules)
  → Returns: Shift[]
```

### 2. Adaptation

```typescript
staffShiftAdapter.adaptMany(shifts)
  → Converts: Shift[] → UnifiedScheduleEvent[]
  → Normalizes colors, metadata, timestamps
```

### 3. Filtering

```typescript
SchedulingUtils.filterByType(events, filters.eventTypes)
SchedulingUtils.filterByEmployee(events, filters.employeeIds)
  → Returns: filtered UnifiedScheduleEvent[]
```

### 4. Rendering

```typescript
<MonthCalendarGrid events={filteredEvents} />
  → Groups by date
  → Renders dots per type
  → Tooltips on hover
```

### 5. Event Handling

```typescript
handleDayClick(date)
  → setReferenceDate(date)
  → setCalendarView('day')
  → Re-renders with Day view
```

---

## 🎨 Color System

### Event Type Colors

| Type          | Bg        | Border     | Text       | Dot       |
|---------------|-----------|------------|------------|-----------|
| staff_shift   | blue.50   | blue.500   | blue.900   | #3182CE   |
| production    | purple.50 | purple.500 | purple.900 | #805AD5   |
| appointment   | green.50  | green.500  | green.900  | #38A169   |
| time_off      | orange.50 | orange.500 | orange.900 | #DD6B20   |
| delivery      | cyan.50   | cyan.500   | cyan.900   | #0BC5EA   |
| maintenance   | gray.50   | gray.500   | gray.900   | #718096   |

### Usage

```typescript
import { EVENT_COLORS } from './types/calendar';

const colors = EVENT_COLORS[event.type];
// colors.bg → 'blue.50'
// colors.dot → '#3182CE'
```

### Design Principles

- **Soft complementary tones** (clarity over chaos)
- **Color association** (red=urgency, green=success, blue=neutral)
- **Accessibility** (WCAG AA contrast ratios)

---

## 🖱️ Interactions

### Month View

| Action | Behavior |
|--------|----------|
| Click day | Navigate to Day view for that date |
| Hover day | Show tooltip with event summary |
| Click "Hoy" | Return to current month |
| Navigate ◀/▶ | Move to prev/next month |

### Week View (✅ Implemented)

| Action | Behavior |
|--------|----------|
| Drag event | Reschedule to new time slot |
| Click event | Open editor modal |
| Resize event | Change duration |
| Double-click empty | Create new shift |

### Day View (✅ Implemented)

| Action | Behavior |
|--------|----------|
| Click event | Inline expansion with actions |
| Click "Edit" | Open full editor modal |
| Click "Delete" | Confirm and delete |
| Drag event | Move to new time |

### Filters Panel

| Action | Behavior |
|--------|----------|
| Toggle checkbox | Add/remove from active filters |
| Click "Clear All" | Reset all filters to default |
| Close panel | Apply filters and update calendar |

---

## 🚀 Future Enhancements

### Phase 1: Week & Day Views (Next Session)

- [ ] Implement `WeekCalendarGrid` with drag & drop
- [ ] Implement `DayCalendarTimeline` with timeline
- [ ] Create `EventBlock` component (medium variant)
- [ ] Create `EventCard` component (expanded variant)
- [ ] Add resize handles for duration editing

### Phase 2: Cross-Module Integration

- [ ] Production adapter (production blocks in calendar)
- [ ] Appointment adapter (customer bookings)
- [ ] Delivery adapter (shipping schedules)
- [ ] Event emission for cross-module communication

### Phase 3: Advanced Features

- [ ] Bulk operations (copy week, delete multiple)
- [ ] Export to PDF/Excel
- [ ] Keyboard shortcuts (Cmd+N, arrows, etc.)
- [ ] Mobile responsive optimizations
- [ ] Dark mode support

### Phase 4: AI & Automation

- [ ] Smart scheduling suggestions based on history
- [ ] Conflict detection and resolution
- [ ] Auto-fill gaps based on availability
- [ ] Forecasting based on sales volume

---

## 📚 Related Documentation

- [Event Types Specification](./SCHEDULING_EVENT_TYPES.md)
- [Integration Guide](./SCHEDULING_INTEGRATION_GUIDE.md)
- [Module Registry Pattern](../../../../../lib/modules/README.md)
- [Atomic Capabilities System](../../../../../config/types/atomic-capabilities.ts)

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. ✅ Week view fully implemented with drag & drop
2. ✅ Day view fully implemented with timeline
3. ❗ Production/Appointment adapters disabled (capability not active)
4. ❗ Employee filter not wired (requires employee dropdown)
5. ❗ Search functionality not implemented

### Technical Debt

- ✅ Department/status filtering logic implemented
- ✅ EventBlock component for Week view completed
- ✅ EventCard component for Day view completed
- 📋 TODO: Add mobile responsive breakpoints
- 📋 TODO: Add loading skeletons for better UX

---

## ✅ Completed Features

- ✅ Unified event system with TypeScript types
- ✅ Adapter pattern for data normalization
- ✅ Month view with color dots
- ✅ Tooltips on hover with event summary
- ✅ Filters panel with type/department/status
- ✅ Compact top bar with metrics + alerts
- ✅ Navigation between views (Month/Week/Day)
- ✅ Date navigation (◀ Today ▶)
- ✅ Click to navigate (day → day view)
- ✅ Offline mode detection

---

**Document Version:** 2.0.0
**Last Review:** 2025-01-10
**Next Review:** After Week/Day views implementation
