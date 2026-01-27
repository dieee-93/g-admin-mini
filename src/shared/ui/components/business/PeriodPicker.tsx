// PeriodPicker.tsx - Period Selection Component for RENTAL POS
// Allows selecting from/to date+time with availability checking
// Compatible with G-Admin Mini v2.1 Design System

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Stack, Text, Button, Badge, Icon } from '@/shared/ui';

// ✅ HEROICONS v2
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export interface PeriodPickerProps {
  /** ID del item a rentar */
  itemId: string;

  /** Callback cuando se confirma el período */
  onPeriodSelect: (period: PeriodSelection) => void;

  /** Período inicial */
  initialPeriod?: {
    start: DateTimeValue;
    end: DateTimeValue;
  };

  /** Conflictos detectados (opcional - puede venir de API) */
  conflicts?: RentalConflict[];

  /** Estado de carga (si availability check viene de API) */
  loading?: boolean;

  /** Modo compacto para POS */
  compactMode?: boolean;

  /** Título del componente */
  title?: string;
}

export interface DateTimeValue {
  date: string; // "2025-12-12"
  time: string; // "09:00"
}

export interface PeriodSelection {
  start: DateTimeValue;
  end: DateTimeValue;
  available: boolean;
  durationHours: number;
  conflicts?: RentalConflict[];
}

export interface RentalConflict {
  id: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  reason: string;
}

// ✅ UTILITY FUNCTIONS
function combineDateAndTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

function calculateDurationHours(start: DateTimeValue, end: DateTimeValue): number {
  const startDate = combineDateAndTime(start.date, start.time);
  const endDate = combineDateAndTime(end.date, end.time);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
}

function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} día${days !== 1 ? 's' : ''}`;
  }
  return `${days}d ${remainingHours}h`;
}

function isValidPeriod(start: DateTimeValue, end: DateTimeValue): boolean {
  const startDate = combineDateAndTime(start.date, start.time);
  const endDate = combineDateAndTime(end.date, end.time);
  return endDate > startDate;
}

// TODO: Replace with real API call
function checkAvailability(itemId: string, start: DateTimeValue, end: DateTimeValue): {
  available: boolean;
  conflicts: RentalConflict[];
} {
  // Mock: Simulate some conflicts
  const startDate = combineDateAndTime(start.date, start.time);
  const mockConflictDate = new Date(start.date);
  mockConflictDate.setDate(mockConflictDate.getDate() + 1);

  const hasConflict = Math.random() > 0.7; // 30% chance of conflict

  if (hasConflict) {
    return {
      available: false,
      conflicts: [{
        id: 'conflict-1',
        start: mockConflictDate.toISOString(),
        end: new Date(mockConflictDate.getTime() + 3600000).toISOString(),
        reason: 'Item ya reservado en este período'
      }]
    };
  }

  return {
    available: true,
    conflicts: []
  };
}

// ✅ DATE TIME INPUT SUB-COMPONENT
interface DateTimeInputProps {
  label: string;
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
  minDate?: string;
  minTime?: string;
  compactMode?: boolean;
}

function DateTimeInput({
  label,
  value,
  onChange,
  minDate,
  minTime,
  compactMode = true
}: DateTimeInputProps) {
  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      date: event.target.value
    });
  }, [value, onChange]);

  const handleTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      time: event.target.value
    });
  }, [value, onChange]);

  return (
    <Stack direction="column" gap="xs" w="full">
      <Text fontSize="sm" fontWeight="medium">
        {label}
      </Text>

      <Stack direction={compactMode ? 'column' : 'row'} gap="sm">
        {/* Date Input */}
        <Stack direction="column" gap="xs" flex="1">
          <Stack direction="row" align="center" gap="xs">
            <CalendarDaysIcon style={{ width: '16px', height: '16px' }} />
            <Text fontSize="xs" color="fg.muted">Fecha</Text>
          </Stack>
          <input
            type="date"
            value={value.date}
            onChange={handleDateChange}
            min={minDate}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid var(--colors-border-default)',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: 'var(--colors-bg-panel)',
              color: 'var(--colors-fg-default)'
            }}
          />
        </Stack>

        {/* Time Input */}
        <Stack direction="column" gap="xs" flex="1">
          <Stack direction="row" align="center" gap="xs">
            <ClockIcon style={{ width: '16px', height: '16px' }} />
            <Text fontSize="xs" color="fg.muted">Hora</Text>
          </Stack>
          <input
            type="time"
            value={value.time}
            onChange={handleTimeChange}
            min={minTime}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid var(--colors-border-default)',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: 'var(--colors-bg-panel)',
              color: 'var(--colors-fg-default)'
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

// ✅ AVAILABILITY INDICATOR SUB-COMPONENT
interface AvailabilityIndicatorProps {
  available: boolean;
  conflicts: RentalConflict[];
  duration: number;
  loading?: boolean;
}

function AvailabilityIndicator({
  available,
  conflicts,
  duration,
  loading
}: AvailabilityIndicatorProps) {
  if (loading) {
    return (
      <Stack
        direction="row"
        align="center"
        gap="sm"
        p="md"
        bg="bg.subtle"
        borderRadius="md"
      >
        <Text fontSize="sm" color="fg.muted">
          Verificando disponibilidad...
        </Text>
      </Stack>
    );
  }

  const statusColor = available ? 'green' : conflicts.length > 0 ? 'red' : 'orange';
  const StatusIcon = available ? CheckCircleIcon : conflicts.length > 0 ? XCircleIcon : ExclamationTriangleIcon;

  return (
    <Stack direction="column" gap="sm">
      {/* Status Badge */}
      <Stack
        direction="row"
        align="center"
        gap="sm"
        p="md"
        bg={`${statusColor}.subtle`}
        borderRadius="md"
        borderWidth="1px"
        borderColor={`${statusColor}.solid`}
      >
        <Icon icon={StatusIcon} size="md" color={`${statusColor}.solid`} />
        <Stack direction="column" gap="xs" flex="1">
          <Text fontSize="sm" fontWeight="semibold" color={`${statusColor}.solid`}>
            {available ? 'Disponible' : 'No Disponible'}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Duración: {formatDuration(duration)}
          </Text>
        </Stack>
      </Stack>

      {/* Conflicts List */}
      {conflicts.length > 0 && (
        <Stack direction="column" gap="xs">
          <Text fontSize="xs" fontWeight="medium" color="red.solid">
            Conflictos detectados:
          </Text>
          {conflicts.map(conflict => (
            <Stack
              key={conflict.id}
              direction="row"
              align="center"
              gap="xs"
              p="sm"
              bg="red.subtle"
              borderRadius="sm"
            >
              <ExclamationTriangleIcon style={{ width: '16px', height: '16px' }} />
              <Text fontSize="xs" color="red.solid">
                {conflict.reason}
              </Text>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ✅ MAIN COMPONENT
export function PeriodPicker({
  itemId,
  onPeriodSelect,
  initialPeriod,
  conflicts: providedConflicts,
  loading = false,
  compactMode = true,
  title = 'Seleccionar Período de Renta'
}: PeriodPickerProps) {

  // ✅ STATE
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [start, setStart] = useState<DateTimeValue>(
    initialPeriod?.start || {
      date: today,
      time: currentTime
    }
  );

  const [end, setEnd] = useState<DateTimeValue>(
    initialPeriod?.end || {
      date: today,
      time: currentTime
    }
  );

  // ✅ VALIDATION
  const isValid = useMemo(() => {
    return start.date && start.time && end.date && end.time && isValidPeriod(start, end);
  }, [start, end]);

  const duration = useMemo(() => {
    if (!isValid) return 0;
    return calculateDurationHours(start, end);
  }, [start, end, isValid]);

  // ✅ AVAILABILITY CHECK
  // TODO: Replace with real API hook - useRentalAvailability(itemId, start, end)
  const availability = useMemo(() => {
    if (!isValid) return { available: false, conflicts: [] };
    if (providedConflicts) return { available: providedConflicts.length === 0, conflicts: providedConflicts };
    return checkAvailability(itemId, start, end);
  }, [itemId, start, end, isValid, providedConflicts]);

  // ✅ HANDLE CONFIRM
  const handleConfirm = useCallback(() => {
    if (isValid && availability.available) {
      onPeriodSelect({
        start,
        end,
        available: true,
        durationHours: duration,
        conflicts: availability.conflicts
      });
    }
  }, [isValid, availability, start, end, duration, onPeriodSelect]);

  // ✅ MIN DATE/TIME FOR END
  const minEndDate = start.date;
  const minEndTime = start.date === end.date ? start.time : undefined;

  return (
    <Stack direction="column" gap="md" w="full">
      {/* Title */}
      {!compactMode && title && (
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
      )}

      {/* Start DateTime */}
      <DateTimeInput
        label="Inicio de Renta"
        value={start}
        onChange={setStart}
        minDate={today}
        compactMode={compactMode}
      />

      {/* End DateTime */}
      <DateTimeInput
        label="Fin de Renta"
        value={end}
        onChange={setEnd}
        minDate={minEndDate}
        minTime={minEndTime}
        compactMode={compactMode}
      />

      {/* Availability Indicator */}
      {isValid && (
        <AvailabilityIndicator
          available={availability.available}
          conflicts={availability.conflicts}
          duration={duration}
          loading={loading}
        />
      )}

      {/* Validation Error */}
      {!isValid && start.date && end.date && (
        <Stack
          direction="row"
          align="center"
          gap="sm"
          p="md"
          bg="orange.subtle"
          borderRadius="md"
        >
          <Icon icon={ExclamationTriangleIcon} size="sm" color="orange.solid" />
          <Text fontSize="sm" color="orange.solid">
            La fecha/hora de fin debe ser posterior al inicio
          </Text>
        </Stack>
      )}

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={!isValid || !availability.available || loading}
        colorPalette="green"
        size={compactMode ? 'md' : 'lg'}
        w="full"
      >
        {loading ? 'Verificando...' : 'Confirmar Período'}
      </Button>

      {/* Helper Info */}
      {compactMode && isValid && availability.available && (
        <Stack direction="row" justify="space-between" align="center">
          <Text fontSize="xs" color="fg.muted">
            Duración total
          </Text>
          <Badge colorPalette="blue" size="sm">
            {formatDuration(duration)}
          </Badge>
        </Stack>
      )}
    </Stack>
  );
}

export default PeriodPicker;
