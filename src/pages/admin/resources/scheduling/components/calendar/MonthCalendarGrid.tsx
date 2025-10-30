/**
 * MONTH CALENDAR GRID
 *
 * Vista mensual del calendario con dots de eventos.
 * Grid 7x5/6 (semanas x días).
 *
 * @version 1.0.0
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#month-view
 */

import React, { useMemo, useState } from 'react';
import { Stack, Typography } from '@/shared/ui';
import { EventDotsGroup } from './EventDot';
import { EventTooltip } from './EventTooltip';
import type { UnifiedScheduleEvent } from '../../types/calendar';
import { SchedulingUtils } from '../../adapters/SchedulingAdapter';

export interface MonthCalendarGridProps {
  /** Fecha de referencia (mes a mostrar) */
  referenceDate: Date;

  /** Eventos a mostrar */
  events: UnifiedScheduleEvent[];

  /** Callback cuando se hace click en un día */
  onDayClick?: (date: Date) => void;

  /** Si está en modo loading */
  loading?: boolean;
}

/**
 * MonthCalendarGrid Component
 *
 * Renderiza calendario mensual con:
 * - Grid de días del mes
 * - Dots de colores por tipo de evento
 * - Tooltips en hover
 * - Click navigation a Day view
 */
export function MonthCalendarGrid({
  referenceDate,
  events,
  onDayClick,
  loading = false
}: MonthCalendarGridProps) {

  // ============================================
  // STATE
  // ============================================

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // ============================================
  // CALENDAR GRID CALCULATION
  // ============================================

  const calendarDays = useMemo(() => {
    return generateMonthGrid(referenceDate);
  }, [referenceDate]);

  // ============================================
  // EVENTS GROUPING
  // ============================================

  const eventsByDate = useMemo(() => {
    return SchedulingUtils.groupByDate(events);
  }, [events]);

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getDayEvents = (date: Date): UnifiedScheduleEvent[] => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate.get(dateKey) || [];
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === referenceDate.getMonth();
  };

  const handleDayClick = (date: Date) => {
    if (onDayClick) {
      onDayClick(date);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Typography variant="body" size="sm" color="gray.500">
          Cargando calendario...
        </Typography>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: '#E2E8F0',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* HEADER: Days of week */}
      {DAYS_OF_WEEK.map((day) => (
        <div
          key={day}
          style={{
            padding: '12px',
            backgroundColor: '#F7FAFC',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '12px',
            color: '#4A5568',
            textTransform: 'uppercase'
          }}
        >
          {day}
        </div>
      ))}

      {/* BODY: Calendar days */}
      {calendarDays.map((date, index) => {
        const dayEvents = getDayEvents(date);
        const dateKey = date.toISOString().split('T')[0];
        const isHovered = hoveredDate === dateKey;
        const today = isToday(date);
        const currentMonth = isCurrentMonth(date);

        return (
          <div
            key={index}
            style={{
              position: 'relative',
              minHeight: '80px',
              padding: '8px',
              backgroundColor: currentMonth ? 'white' : '#F7FAFC',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              ...(isHovered && { backgroundColor: '#EBF8FF' })
            }}
            onClick={() => handleDayClick(date)}
            onMouseEnter={() => setHoveredDate(dateKey)}
            onMouseLeave={() => setHoveredDate(null)}
          >
            {/* Day number */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                fontSize: '14px',
                fontWeight: '500',
                color: currentMonth ? '#2D3748' : '#A0AEC0',
                backgroundColor: today ? '#3182CE' : 'transparent',
                ...(today && { color: 'white' })
              }}
            >
              {date.getDate()}
            </div>

            {/* Event dots */}
            {dayEvents.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <EventDotsGroup
                  eventTypes={dayEvents.map(e => e.type)}
                  maxDots={3}
                />
              </div>
            )}

            {/* Tooltip on hover */}
            {isHovered && dayEvents.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  marginTop: '4px'
                }}
              >
                <EventTooltip events={dayEvents} date={date} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// CONSTANTS
// ============================================

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Genera grid de días para un mes
 *
 * Incluye días del mes anterior y siguiente para completar semanas.
 *
 * @param referenceDate - Fecha del mes a generar
 * @returns Array de fechas (35 o 42 días)
 */
function generateMonthGrid(referenceDate: Date): Date[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  // Primer día del mes
  const firstDayOfMonth = new Date(year, month, 1);

  // Día de la semana del primer día (0 = domingo, 1 = lunes, ...)
  let firstDayOfWeek = firstDayOfMonth.getDay();

  // Ajustar para que lunes sea 0
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Calcular día de inicio del grid (puede ser del mes anterior)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  // Generar 42 días (6 semanas) o 35 días (5 semanas)
  // Decidir dinámicamente basado en cuántos días necesitamos
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDays = firstDayOfWeek + daysInMonth > 35 ? 42 : 35;

  const days: Date[] = [];

  for (let i = 0; i < totalDays; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  return days;
}
