/**
 * WEEK CALENDAR GRID
 *
 * Vista semanal del calendario con eventos apilados.
 * Grid 7 columnas (días) x N filas (horas).
 *
 * @version 2.0.0 - FULL IMPLEMENTATION
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#week-view
 */

import React, { useMemo, useState } from 'react';
import { Stack } from '@/shared/ui';
import type { UnifiedScheduleEvent } from '../../types/calendar';
import { EventBlock } from './EventBlock';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

export interface WeekCalendarGridProps {
  referenceDate: Date;
  events: UnifiedScheduleEvent[];
  onEventClick?: (event: UnifiedScheduleEvent) => void;
  onEventDrop?: (eventId: string, newStart: Date, newEnd: Date) => void;
  loading?: boolean;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
}

interface TimeSlot {
  hour: number;
  label: string;
}

interface DayColumn {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  events: UnifiedScheduleEvent[];
}

/**
 * WeekCalendarGrid Component
 *
 * Muestra 7 días (Lun-Dom) con eventos apilados por franja horaria.
 */
export function WeekCalendarGrid({
  referenceDate,
  events,
  onEventClick,
  onEventDrop,
  loading = false,
  startHour = 6,
  endHour = 22,
  intervalMinutes = 60
}: WeekCalendarGridProps) {
  const [draggedEvent, setDraggedEvent] = useState<UnifiedScheduleEvent | null>(null);

  // Generate week days (Mon-Sun)
  const weekDays = useMemo((): DayColumn[] => {
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday = 1

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dayEvents = events.filter(event => isSameDay(event.start, date));

      return {
        date,
        dayName: format(date, 'EEE', { locale: es }),
        dayNumber: format(date, 'd'),
        isToday: isToday(date),
        events: dayEvents
      };
    });
  }, [referenceDate, events]);

  // Generate time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const totalSlots = ((endHour - startHour) * 60) / intervalMinutes;

    for (let i = 0; i <= totalSlots; i++) {
      const hour = startHour + (i * intervalMinutes) / 60;
      const fullHour = Math.floor(hour);
      const minutes = (hour % 1) * 60;

      slots.push({
        hour: fullHour + minutes / 60,
        label: `${String(fullHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      });
    }

    return slots;
  }, [startHour, endHour, intervalMinutes]);

  // Filter events by time slot
  const getEventsForSlot = (dayEvents: UnifiedScheduleEvent[], slotHour: number): UnifiedScheduleEvent[] => {
    return dayEvents.filter(event => {
      const eventStartHour = event.start.getHours() + event.start.getMinutes() / 60;
      const eventEndHour = event.end.getHours() + event.end.getMinutes() / 60;
      const nextSlotHour = slotHour + intervalMinutes / 60;

      // Event overlaps with this slot
      return eventStartHour < nextSlotHour && eventEndHour > slotHour;
    });
  };

  const handleDragStart = (event: UnifiedScheduleEvent) => {
    setDraggedEvent(event);
  };

  const handleDrop = (date: Date, slotHour: number) => {
    if (!draggedEvent || !onEventDrop) return;

    const newStart = new Date(date);
    newStart.setHours(Math.floor(slotHour), (slotHour % 1) * 60, 0, 0);

    const duration = draggedEvent.end.getTime() - draggedEvent.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    onEventDrop(draggedEvent.id, newStart, newEnd);
    setDraggedEvent(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
        Cargando eventos...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          minWidth: '900px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* HEADER ROW */}
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'grid',
            gridTemplateColumns: 'subgrid',
            borderBottom: '2px solid #E5E7EB',
            backgroundColor: '#F9FAFB'
          }}
        >
          {/* Empty corner cell */}
          <div style={{ padding: '12px 8px', fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>
            Hora
          </div>

          {/* Day headers */}
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              style={{
                padding: '12px 8px',
                textAlign: 'center',
                borderLeft: '1px solid #E5E7EB',
                backgroundColor: day.isToday ? '#EFF6FF' : 'transparent'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                {day.dayName}
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: day.isToday ? '#2563EB' : '#111827',
                  marginTop: '2px'
                }}
              >
                {day.dayNumber}
              </div>
            </div>
          ))}
        </div>

        {/* TIME SLOTS */}
        {timeSlots.map((slot, slotIndex) => (
          <React.Fragment key={slot.hour}>
            {/* Hour label */}
            <div
              style={{
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#6B7280',
                textAlign: 'right',
                borderTop: slotIndex > 0 ? '1px solid #F3F4F6' : 'none',
                backgroundColor: '#FAFAFA'
              }}
            >
              {slot.label}
            </div>

            {/* Day cells */}
            {weekDays.map((day) => {
              const slotEvents = getEventsForSlot(day.events, slot.hour);

              return (
                <div
                  key={`${day.date.toISOString()}-${slot.hour}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(day.date, slot.hour);
                  }}
                  style={{
                    padding: '4px',
                    minHeight: '80px',
                    borderLeft: '1px solid #E5E7EB',
                    borderTop: slotIndex > 0 ? '1px solid #F3F4F6' : 'none',
                    backgroundColor: day.isToday ? '#F0F9FF' : '#FFFFFF',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!draggedEvent) {
                      e.currentTarget.style.backgroundColor = day.isToday ? '#E0F2FE' : '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = day.isToday ? '#F0F9FF' : '#FFFFFF';
                  }}
                >
                  {slotEvents.length > 0 && (
                    <Stack direction="column" gap={1}>
                      {slotEvents.map((event) => (
                        <EventBlock
                          key={event.id}
                          event={event}
                          onClick={onEventClick}
                          onDragStart={handleDragStart}
                          isDragging={draggedEvent?.id === event.id}
                        />
                      ))}
                    </Stack>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Summary footer */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6B7280'
        }}
      >
        <Stack direction="row" justify="space-between">
          <span>
            Semana del {format(weekDays[0].date, 'd MMM', { locale: es })} al{' '}
            {format(weekDays[6].date, 'd MMM yyyy', { locale: es })}
          </span>
          <span>{events.length} eventos esta semana</span>
        </Stack>
      </div>
    </div>
  );
}

/**
 * Utility: Get week start/end dates
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekEnd(date: Date): Date {
  return addDays(getWeekStart(date), 6);
}
