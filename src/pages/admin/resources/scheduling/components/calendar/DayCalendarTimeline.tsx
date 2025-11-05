/**
 * DAY CALENDAR TIMELINE
 *
 * Vista diaria del calendario con timeline vertical.
 * Máximo detalle, gestión minuto a minuto.
 *
 * @version 2.0.0 - FULL IMPLEMENTATION
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#day-view
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Stack } from '@/shared/ui';
import type { UnifiedScheduleEvent } from '../../types/calendar';
import { EventCard } from './EventCard';
import { format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

export interface DayCalendarTimelineProps {
  referenceDate: Date;
  events: UnifiedScheduleEvent[];
  onEventClick?: (event: UnifiedScheduleEvent) => void;
  onEventEdit?: (event: UnifiedScheduleEvent) => void;
  onEventDelete?: (event: UnifiedScheduleEvent) => void;
  onEventComplete?: (event: UnifiedScheduleEvent) => void;
  loading?: boolean;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
}

interface TimeSlot {
  hour: number;
  label: string;
  top: number; // Position in pixels
}

interface PositionedEvent {
  event: UnifiedScheduleEvent;
  top: number; // Position from top (px)
  height: number; // Height (px)
  column: number; // Column index for overlaps
  totalColumns: number; // Total columns needed
}

/**
 * DayCalendarTimeline Component
 *
 * Timeline vertical con slots de 30min, eventos expandidos con detalles.
 */
export function DayCalendarTimeline({
  referenceDate,
  events,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventComplete,
  loading = false,
  startHour = 6,
  endHour = 22,
  intervalMinutes = 30
}: DayCalendarTimelineProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [currentTimeTop, setCurrentTimeTop] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const PIXELS_PER_HOUR = 80; // Height of 1 hour in pixels
  const HEADER_HEIGHT = 60;

  // Filter events for this day
  const dayEvents = useMemo(() => {
    return events.filter(event => isSameDay(event.start, referenceDate));
  }, [events, referenceDate]);

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
        label: `${String(fullHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        top: (hour - startHour) * PIXELS_PER_HOUR
      });
    }

    return slots;
  }, [startHour, endHour, intervalMinutes]);

  // Calculate positioned events with overlap handling
  const positionedEvents = useMemo((): PositionedEvent[] => {
    const positioned: PositionedEvent[] = [];

    // Sort events by start time
    const sortedEvents = [...dayEvents].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Calculate positions
    sortedEvents.forEach(event => {
      const startHourDecimal = event.start.getHours() + event.start.getMinutes() / 60;
      const endHourDecimal = event.end.getHours() + event.end.getMinutes() / 60;

      const top = (startHourDecimal - startHour) * PIXELS_PER_HOUR;
      const height = (endHourDecimal - startHourDecimal) * PIXELS_PER_HOUR;

      positioned.push({
        event,
        top,
        height: Math.max(height, 60), // Minimum height
        column: 0,
        totalColumns: 1
      });
    });

    // Detect overlaps and assign columns
    for (let i = 0; i < positioned.length; i++) {
      const current = positioned[i];
      const overlapping: PositionedEvent[] = [current];

      // Find all overlapping events
      for (let j = i + 1; j < positioned.length; j++) {
        const next = positioned[j];
        const currentEnd = current.top + current.height;
        const nextStart = next.top;

        if (nextStart < currentEnd) {
          overlapping.push(next);
        } else {
          break;
        }
      }

      // Assign columns to overlapping events
      if (overlapping.length > 1) {
        const totalColumns = overlapping.length;
        overlapping.forEach((item, index) => {
          item.column = index;
          item.totalColumns = totalColumns;
        });
      }
    }

    return positioned;
  }, [dayEvents, startHour]);

  // Update current time indicator position
  useEffect(() => {
    if (!isToday(referenceDate)) return;

    const updateCurrentTime = () => {
      const now = new Date();
      const nowHour = now.getHours() + now.getMinutes() / 60;
      const top = (nowHour - startHour) * PIXELS_PER_HOUR;
      setCurrentTimeTop(top);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [referenceDate, startHour]);

  // Scroll to current time on mount
  useEffect(() => {
    if (isToday(referenceDate) && timelineRef.current) {
      const scrollTop = currentTimeTop - 100; // Offset from top
      timelineRef.current.scrollTop = scrollTop > 0 ? scrollTop : 0;
    }
  }, [referenceDate, currentTimeTop]);

  const handleEventClick = (event: UnifiedScheduleEvent) => {
    setExpandedEventId(expandedEventId === event.id ? null : event.id);
    onEventClick?.(event);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
        Cargando eventos del día...
      </div>
    );
  }

  const totalHeight = ((endHour - startHour) * PIXELS_PER_HOUR) + HEADER_HEIGHT;

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: isToday(referenceDate) ? '#EFF6FF' : '#F9FAFB',
          borderRadius: '8px 8px 0 0',
          borderBottom: '2px solid #E5E7EB'
        }}
      >
        <Stack direction="row" justify="space-between" align="center">
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
              {format(referenceDate, 'EEEE', { locale: es })}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: isToday(referenceDate) ? '#2563EB' : '#111827' }}>
              {format(referenceDate, 'd MMMM yyyy', { locale: es })}
            </div>
          </div>
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#6B7280'
            }}
          >
            {dayEvents.length} eventos
          </div>
        </Stack>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        style={{
          position: 'relative',
          height: '600px',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px'
        }}
      >
        <div style={{ position: 'relative', height: `${totalHeight}px` }}>
          {/* Time slots grid */}
          {timeSlots.map((slot, index) => (
            <div
              key={slot.hour}
              style={{
                position: 'absolute',
                top: `${slot.top}px`,
                left: 0,
                right: 0,
                height: `${PIXELS_PER_HOUR}px`,
                borderTop: index === 0 ? 'none' : '1px solid #F3F4F6',
                display: 'flex'
              }}
            >
              {/* Time label */}
              <div
                style={{
                  width: '80px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#6B7280',
                  textAlign: 'right',
                  backgroundColor: '#FAFAFA',
                  borderRight: '2px solid #E5E7EB'
                }}
              >
                {slot.label}
              </div>

              {/* Events column */}
              <div style={{ flex: 1, position: 'relative' }} />
            </div>
          ))}

          {/* Current time indicator */}
          {isToday(referenceDate) && currentTimeTop >= 0 && (
            <div
              style={{
                position: 'absolute',
                top: `${currentTimeTop}px`,
                left: '80px',
                right: 0,
                height: '2px',
                backgroundColor: '#EF4444',
                zIndex: 100,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '-5px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  border: '2px solid #FFFFFF'
                }}
              />
            </div>
          )}

          {/* Events */}
          {positionedEvents.map(({ event, top, height, column, totalColumns }) => {
            const width = `${100 / totalColumns}%`;
            const left = `${(column / totalColumns) * 100}%`;

            return (
              <div
                key={event.id}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `calc(80px + ${left})`,
                  width: `calc(${width} - 8px)`,
                  height: `${height}px`,
                  padding: '4px',
                  zIndex: expandedEventId === event.id ? 50 : 10
                }}
              >
                <EventCard
                  event={event}
                  onEdit={onEventEdit}
                  onDelete={onEventDelete}
                  onComplete={onEventComplete}
                  expanded={expandedEventId === event.id}
                  showActions={true}
                />
              </div>
            );
          })}

          {/* Empty state */}
          {dayEvents.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#9CA3AF'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>No hay eventos para este día</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Haz clic en "Nuevo Turno" para crear uno
              </div>
            </div>
          )}
        </div>
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
          <span>Horario: {format(new Date().setHours(startHour, 0), 'HH:mm')} - {format(new Date().setHours(endHour, 0), 'HH:mm')}</span>
          <span>
            {dayEvents.length} eventos • Total:{' '}
            {dayEvents.reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / (1000 * 60 * 60), 0).toFixed(1)}h
          </span>
        </Stack>
      </div>
    </div>
  );
}
