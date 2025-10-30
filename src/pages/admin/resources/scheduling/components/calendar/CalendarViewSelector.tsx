/**
 * CALENDAR VIEW SELECTOR
 *
 * Selector de vistas Month/Week/Day con navegación de fechas.
 * Componente principal de control del calendario.
 *
 * @version 1.0.0
 * @see ../../docs/SCHEDULING_CALENDAR_DESIGN.md#calendar-view-selector
 */

import React from 'react';
import { Stack, Button, Badge, Icon } from '@/shared/ui';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import type { CalendarView } from '../../types/calendar';

export interface CalendarViewSelectorProps {
  /** Vista activa */
  view: CalendarView;

  /** Callback cuando cambia la vista */
  onViewChange: (view: CalendarView) => void;

  /** Fecha de referencia (centro del calendario) */
  referenceDate: Date;

  /** Callback cuando cambia la fecha */
  onDateChange: (date: Date) => void;

  /** Formato de fecha a mostrar */
  dateFormat?: 'full' | 'short';
}

/**
 * CalendarViewSelector Component
 *
 * Renderiza:
 * - Tabs Month/Week/Day
 * - Navegación ◀ Today ▶
 * - Formato de fecha actual
 */
export function CalendarViewSelector({
  view,
  onViewChange,
  referenceDate,
  onDateChange,
  dateFormat = 'full'
}: CalendarViewSelectorProps) {

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================

  const handlePrevious = () => {
    const newDate = new Date(referenceDate);

    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }

    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(referenceDate);

    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }

    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // ============================================
  // DATE FORMATTING
  // ============================================

  const formatDate = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: dateFormat === 'full' ? 'numeric' : undefined
    };

    switch (view) {
      case 'month':
        return referenceDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });

      case 'week': {
        // Calcular inicio de semana (lunes)
        const weekStart = getWeekStart(referenceDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return `${weekStart.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }

      case 'day':
        return referenceDate.toLocaleDateString('es-ES', options);

      default:
        return referenceDate.toLocaleDateString('es-ES');
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Stack direction="row" justify="space-between" align="center" gap={4} py={3}>
      {/* LEFT: View Tabs */}
      <Stack direction="row" gap={2}>
        <Button
          size="sm"
          variant={view === 'month' ? 'solid' : 'outline'}
          colorPalette={view === 'month' ? 'blue' : 'gray'}
          onClick={() => onViewChange('month')}
        >
          <Icon icon={CalendarIcon} size="xs" />
          Mes
        </Button>

        <Button
          size="sm"
          variant={view === 'week' ? 'solid' : 'outline'}
          colorPalette={view === 'week' ? 'blue' : 'gray'}
          onClick={() => onViewChange('week')}
        >
          <Icon icon={CalendarIcon} size="xs" />
          Semana
        </Button>

        <Button
          size="sm"
          variant={view === 'day' ? 'solid' : 'outline'}
          colorPalette={view === 'day' ? 'blue' : 'gray'}
          onClick={() => onViewChange('day')}
        >
          <Icon icon={CalendarIcon} size="xs" />
          Día
        </Button>
      </Stack>

      {/* CENTER: Date Navigation */}
      <Stack direction="row" align="center" gap={3}>
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePrevious}
          aria-label="Período anterior"
        >
          <Icon icon={ChevronLeftIcon} size="sm" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleToday}
          minW="100px"
        >
          Hoy
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleNext}
          aria-label="Período siguiente"
        >
          <Icon icon={ChevronRightIcon} size="sm" />
        </Button>
      </Stack>

      {/* RIGHT: Current Date Display */}
      <Stack direction="row" align="center" gap={2}>
        <Badge
          size="lg"
          variant="subtle"
          colorPalette="blue"
          px={4}
          py={2}
          fontWeight="semibold"
        >
          {formatDate()}
        </Badge>
      </Stack>
    </Stack>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Obtiene el lunes de la semana de una fecha
 *
 * @param date - Fecha de referencia
 * @returns Lunes de esa semana
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo, 1 = lunes, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar al lunes
  return new Date(d.setDate(diff));
}

/**
 * Obtiene el domingo de la semana de una fecha
 *
 * @param date - Fecha de referencia
 * @returns Domingo de esa semana
 */
function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

// Export utility functions for use in other components
export { getWeekStart, getWeekEnd };
