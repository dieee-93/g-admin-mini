// WeeklyCalendar.tsx - Enterprise Weekly Calendar Component
// Shared component para vista semanal con drag & drop y gestión de turnos
// Compatible con G-Admin Mini v2.1 Design System

import React, { useState, useCallback, useMemo } from 'react';
import {
  Stack, Button, Icon, Badge, Grid
} from '@/shared/ui';

import { Skeleton } from '@chakra-ui/react';
// ✅ HEROICONS v2
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// ✅ SHARED TYPES
export interface CalendarShift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  color?: string;
}

export interface DayData {
  date: string;
  dayName: string;
  dayNumber: number;
  shifts: CalendarShift[];
  totalHours: number;
  coverage: number;
  isToday: boolean;
  isWeekend: boolean;
}

export interface WeeklyCalendarProps {
  /** Array de turnos para mostrar */
  shifts: CalendarShift[];

  /** Semana inicial */
  initialWeek?: Date;

  /** Callback cuando se navega entre semanas */
  onWeekChange?: (startDate: Date) => void;

  /** Callback cuando se selecciona un día */
  onDayClick?: (date: string) => void;

  /** Callback cuando se hace click en un turno */
  onShiftClick?: (shift: CalendarShift) => void;

  /** Callback para crear nuevo turno */
  onNewShift?: (date: string) => void;

  /** Estados de carga */
  loading?: boolean;

  /** Configuración de vista */
  config?: {
    showCoverage?: boolean;
    showHours?: boolean;
    allowNewShifts?: boolean;
    compactMode?: boolean;
  };

  /** Callback para drag & drop */
  onShiftDrop?: (shiftId: string, newDate: string, newTime: string) => void;
}

// ✅ UTILITY FUNCTIONS
function generateWeekDays(startDate: Date): DayData[] {
  const days: DayData[] = [];
  const start = new Date(startDate);

  // Empezar desde lunes
  const dayOfWeek = start.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(start.getDate() + mondayOffset);

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const dayData: DayData = {
      date: day.toISOString().split('T')[0],
      dayName: day.toLocaleDateString('es-ES', { weekday: 'short' }),
      dayNumber: day.getDate(),
      shifts: [],
      totalHours: 0,
      coverage: 0,
      isToday: day.toDateString() === today.toDateString(),
      isWeekend: day.getDay() === 0 || day.getDay() === 6
    };

    days.push(dayData);
  }

  return days;
}

function calculateDayMetrics(shifts: CalendarShift[]): { hours: number; coverage: number } {
  const totalHours = shifts.reduce((sum, shift) => {
    const start = new Date(`2000-01-01T${shift.startTime}`);
    const end = new Date(`2000-01-01T${shift.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  // Cálculo básico de cobertura (puede ser más sofisticado)
  const coverage = Math.min(100, (totalHours / 16) * 100); // Asumiendo 16h target

  return { hours: totalHours, coverage };
}

function getShiftStatusColor(status: CalendarShift['status']): string {
  const colorMap = {
    scheduled: 'blue',
    confirmed: 'green',
    in_progress: 'orange',
    completed: 'gray',
    cancelled: 'red'
  };
  return colorMap[status] || 'gray';
}

function getCoverageColor(coverage: number): string {
  if (coverage >= 80) return 'green';
  if (coverage >= 60) return 'orange';
  return 'red';
}

// ✅ SHIFT CARD COMPONENT
interface ShiftCardProps {
  shift: CalendarShift;
  onClick?: (shift: CalendarShift) => void;
  compact?: boolean;
}

function ShiftCard({ shift, onClick, compact = false }: ShiftCardProps) {
  return (
    <Stack
      direction="column"
      gap="xs"
      p={compact ? "xs" : "sm"}
      bg={`${getShiftStatusColor(shift.status)}.subtle`}
      borderRadius="md"
      borderWidth="1px"
      borderColor={`${getShiftStatusColor(shift.status)}.muted`}
      cursor={onClick ? "pointer" : "default"}
      onClick={() => onClick?.(shift)}
      _hover={onClick ? {
        borderColor: `${getShiftStatusColor(shift.status)}.solid`,
        bg: `${getShiftStatusColor(shift.status)}.emphasized`
      } : undefined}
    >
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="column" gap="0">
          <text fontSize={compact ? "xs" : "sm"} fontWeight="medium">
            {shift.employeeName}
          </text>
          {!compact && (
            <text fontSize="xs" color="fg.muted">
              {shift.position}
            </text>
          )}
        </Stack>

        <Badge
          size="xs"
          colorPalette={getShiftStatusColor(shift.status)}
          variant="subtle"
        >
          {shift.status}
        </Badge>
      </Stack>

      <Stack direction="row" align="center" gap="xs">
        <Icon icon={CalendarIcon} size="xs" color="fg.muted" />
        <text fontSize="xs" color="fg.muted">
          {shift.startTime} - {shift.endTime}
        </text>
      </Stack>
    </Stack>
  );
}

// ✅ DAY COLUMN COMPONENT
interface DayColumnProps {
  day: DayData;
  onDayClick?: (date: string) => void;
  onShiftClick?: (shift: CalendarShift) => void;
  onNewShift?: (date: string) => void;
  config: Required<WeeklyCalendarProps['config']>;
}

function DayColumn({ day, onDayClick, onShiftClick, onNewShift, config }: DayColumnProps) {
  return (
    <Stack direction="column" gap="sm" align="stretch">
      {/* Day Header */}
      <Stack
        direction="column"
        align="center"
        gap="xs"
        p="sm"
        bg={day.isToday ? "blue.subtle" : "bg.panel"}
        borderRadius="md"
        borderWidth={day.isToday ? "2px" : "1px"}
        borderColor={day.isToday ? "blue.solid" : "border.default"}
        cursor={onDayClick ? "pointer" : "default"}
        onClick={() => onDayClick?.(day.date)}
        _hover={onDayClick ? { bg: day.isToday ? "blue.emphasized" : "bg.subtle" } : undefined}
      >
        <text fontSize="sm" fontWeight="medium" textTransform="capitalize" color="fg.default">
          {day.dayName}
        </text>

        <text fontSize="lg" fontWeight="bold" color={day.isToday ? "blue.solid" : "fg.default"}>
          {day.dayNumber}
        </text>

        {(config.showCoverage || config.showHours) && (
          <Stack direction="row" gap="xs" align="center">
            {config.showCoverage && (
              <Badge
                size="xs"
                colorPalette={getCoverageColor(day.coverage)}
                variant="subtle"
              >
                {Math.round(day.coverage)}%
              </Badge>
            )}

            {config.showHours && (
              <text fontSize="xs" color="fg.muted">
                {Math.round(day.totalHours)}h
              </text>
            )}
          </Stack>
        )}
      </Stack>

      {/* Shifts Area */}
      <Stack
        direction="column"
        gap="xs"
        minH="300px"
        p="sm"
        bg="gray.50"
        borderRadius="md"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="border.muted"
        _hover={config.allowNewShifts ? {
          borderColor: "blue.solid",
          bg: "blue.subtle"
        } : undefined}
      >
        {day.shifts.map((shift) => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            onClick={onShiftClick}
            compact={config.compactMode}
          />
        ))}

        {/* Empty State / Add Shift */}
        {day.shifts.length === 0 && (
          <Stack
            direction="column"
            align="center"
            justify="center"
            gap="sm"
            flex="1"
            color="fg.muted"
            cursor={config.allowNewShifts ? "pointer" : "default"}
            onClick={() => config.allowNewShifts && onNewShift?.(day.date)}
            _hover={config.allowNewShifts ? { color: "blue.solid" } : undefined}
          >
            {config.allowNewShifts && <Icon icon={PlusIcon} size="md" />}
            <text fontSize="sm">
              {config.allowNewShifts ? "Add shift" : "No shifts"}
            </text>
          </Stack>
        )}

        {/* Coverage Warning */}
        {day.coverage < 60 && day.shifts.length > 0 && (
          <Stack
            direction="row"
            align="center"
            gap="xs"
            p="xs"
            bg="red.subtle"
            borderRadius="sm"
            borderWidth="1px"
            borderColor="red.muted"
          >
            <Icon icon={CalendarIcon} size="xs" color="red.solid" />
            <text fontSize="xs" color="red.solid">
              Understaffed
            </text>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

// ✅ MAIN COMPONENT
export function WeeklyCalendar({
  shifts = [],
  initialWeek = new Date(),
  onWeekChange,
  onDayClick,
  onShiftClick,
  onNewShift,
  loading = false,
  config = {}
}: WeeklyCalendarProps) {

  // ✅ STATE
  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeek);

  // ✅ CONFIG WITH DEFAULTS
  const calendarConfig = useMemo(() => ({
    showCoverage: true,
    showHours: true,
    allowNewShifts: true,
    compactMode: false,
    ...config
  }), [config]);

  // ✅ GENERATE WEEK DATA
  const weekData = useMemo(() => {
    const days = generateWeekDays(currentWeekStart);

    // Distribuir turnos por día y calcular métricas
    return days.map(day => {
      const dayShifts = shifts.filter(shift => shift.date === day.date);
      const metrics = calculateDayMetrics(dayShifts);

      return {
        ...day,
        shifts: dayShifts,
        totalHours: metrics.hours,
        coverage: metrics.coverage
      };
    });
  }, [currentWeekStart, shifts]);

  // ✅ WEEK NAVIGATION
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
    onWeekChange?.(newDate);
  }, [currentWeekStart, onWeekChange]);

  // ✅ LOADING STATE
  if (loading) {
    return (
      <Stack direction="column" gap="md">
        <Skeleton h="60px" />
        <Grid templateColumns="repeat(7, 1fr)" gap="md">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} h="400px" />
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="md">
      {/* Week Navigation Header */}
      <Stack
        direction="row"
        justify="space-between"
        align="center"
        p="md"
        bg="bg.panel"
        borderRadius="md"
        borderWidth="1px"
        borderColor="border.default"
      >
        <Stack direction="row" align="center" gap="md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            <Icon icon={ChevronLeftIcon} size="sm" />
          </Button>

          <Stack direction="column" align="center" gap="0">
            <text fontSize="lg" fontWeight="bold">
              {currentWeekStart.toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric'
              })}
            </text>
            <text fontSize="sm" color="fg.muted">
              Week of {currentWeekStart.toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric'
              })}
            </text>
          </Stack>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('next')}
          >
            <Icon icon={ChevronRightIcon} size="sm" />
          </Button>
        </Stack>

        {/* Week Summary */}
        <Stack direction="row" gap="md" align="center">
          <text fontSize="sm" color="fg.muted">
            {shifts.length} shifts this week
          </text>

          {calendarConfig.allowNewShifts && (
            <Button
              size="sm"
              variant="subtle"
              onClick={() => onNewShift?.(weekData[0].date)}
            >
              <Icon icon={PlusIcon} size="sm" />
              New Shift
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Calendar Grid */}
      <Grid templateColumns="repeat(7, 1fr)" gap="md">
        {weekData.map((day) => (
          <DayColumn
            key={day.date}
            day={day}
            onDayClick={onDayClick}
            onShiftClick={onShiftClick}
            onNewShift={onNewShift}
            config={calendarConfig}
          />
        ))}
      </Grid>
    </Stack>
  );
}

export default WeeklyCalendar;