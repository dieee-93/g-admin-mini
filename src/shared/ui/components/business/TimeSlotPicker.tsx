// TimeSlotPicker.tsx - Enterprise Time Slot Selection Component
// Shared component para selección de horarios con validación
// Compatible con G-Admin Mini v2.1 Design System

import React, { useState, useCallback, useMemo } from 'react';
import {
  Stack, Button, Icon, Badge, Grid
} from '@/shared/ui';

// ✅ HEROICONS v2
import {
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// ✅ SHARED TYPES
export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  duration: number;  // minutes
  available: boolean;
  conflicted?: boolean;
  reason?: string;   // Razón de no disponibilidad
  capacity?: number; // Cuántas personas pueden trabajar
  assigned?: number; // Cuántas ya asignadas
}

export interface TimeSlotPickerProps {
  /** Array de slots disponibles */
  timeSlots: TimeSlot[];

  /** Slot seleccionado actualmente */
  selectedSlot?: string | null;

  /** Callback cuando se selecciona un slot */
  onSlotSelect?: (slotId: string | null) => void;

  /** Modo de selección */
  selectionMode?: 'single' | 'multiple' | 'range';

  /** Slots seleccionados en modo múltiple */
  selectedSlots?: string[];

  /** Configuración de vista */
  config?: {
    showDuration?: boolean;
    showCapacity?: boolean;
    showConflicts?: boolean;
    allowConflicted?: boolean;
    compactMode?: boolean;
  };

  /** Validaciones personalizadas */
  validator?: (slot: TimeSlot) => { valid: boolean; message?: string };

  /** Estado de carga */
  loading?: boolean;

  /** Título del picker */
  title?: string;

  /** Callback para crear nuevo slot */
  onCreateSlot?: (startTime: string, endTime: string) => void;
}

// ✅ UTILITY FUNCTIONS
function formatTime(time: string): string {
  // Convierte "09:00" a "9:00 AM"
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function getSlotStatusColor(slot: TimeSlot): string {
  if (!slot.available) return 'red';
  if (slot.conflicted) return 'orange';
  if (slot.capacity && slot.assigned && slot.assigned >= slot.capacity) return 'gray';
  return 'green';
}

function getSlotStatusLabel(slot: TimeSlot): string {
  if (!slot.available) return slot.reason || 'No disponible';
  if (slot.conflicted) return 'Conflicto detectado';
  if (slot.capacity && slot.assigned && slot.assigned >= slot.capacity) return 'Completo';
  return 'Disponible';
}

// ✅ TIME SLOT CARD COMPONENT
interface TimeSlotCardProps {
  slot: TimeSlot;
  selected: boolean;
  onSelect: (slotId: string) => void;
  config: Required<TimeSlotPickerProps['config']>;
  validator?: TimeSlotPickerProps['validator'];
  disabled?: boolean;
}

function TimeSlotCard({
  slot,
  selected,
  onSelect,
  config,
  validator,
  disabled = false
}: TimeSlotCardProps) {

  const validation = validator ? validator(slot) : { valid: true };
  const isSelectable = slot.available && !slot.conflicted && validation.valid && !disabled;
  const statusColor = getSlotStatusColor(slot);

  const handleSelect = useCallback(() => {
    if (isSelectable) {
      onSelect(slot.id);
    }
  }, [isSelectable, onSelect, slot.id]);

  return (
    <Stack
      direction="column"
      gap="sm"
      p={config.compactMode ? "sm" : "md"}
      bg={selected ? `${statusColor}.subtle` : "bg.panel"}
      borderRadius="md"
      borderWidth="2px"
      borderColor={selected ? `${statusColor}.solid` :
                   isSelectable ? "border.default" : "border.muted"}
      cursor={isSelectable ? "pointer" : "not-allowed"}
      opacity={isSelectable ? 1 : 0.6}
      onClick={handleSelect}
      _hover={isSelectable ? {
        borderColor: `${statusColor}.solid`,
        bg: `${statusColor}.subtle`
      } : undefined}
    >
      {/* Time Display */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="row" align="center" gap="xs">
          <Icon icon={ClockIcon} size="sm" color={statusColor + ".solid"} />
          <Stack direction="column" gap="0">
            <text fontSize={config.compactMode ? "sm" : "md"} fontWeight="semibold">
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </text>
            {config.showDuration && (
              <text fontSize="xs" color="fg.muted">
                {formatDuration(slot.duration)}
              </text>
            )}
          </Stack>
        </Stack>

        {/* Selection Indicator */}
        {selected && (
          <Icon icon={CheckIcon} size="sm" color={statusColor + ".solid"} />
        )}
      </Stack>

      {/* Status Badge */}
      <Badge
        size="sm"
        colorPalette={statusColor}
        variant="subtle"
      >
        {getSlotStatusLabel(slot)}
      </Badge>

      {/* Capacity Info */}
      {config.showCapacity && slot.capacity && (
        <Stack direction="row" justify="space-between" align="center">
          <text fontSize="xs" color="fg.muted">
            Capacidad
          </text>
          <text fontSize="xs" fontWeight="medium">
            {slot.assigned || 0}/{slot.capacity}
          </text>
        </Stack>
      )}

      {/* Conflict Warning */}
      {config.showConflicts && slot.conflicted && (
        <Stack direction="row" align="center" gap="xs" p="xs" bg="orange.subtle" borderRadius="sm">
          <Icon icon={ExclamationTriangleIcon} size="xs" color="orange.solid" />
          <text fontSize="xs" color="orange.solid">
            {slot.reason || 'Conflicto de horario'}
          </text>
        </Stack>
      )}

      {/* Validation Error */}
      {!validation.valid && validation.message && (
        <Stack direction="row" align="center" gap="xs" p="xs" bg="red.subtle" borderRadius="sm">
          <Icon icon={XMarkIcon} size="xs" color="red.solid" />
          <text fontSize="xs" color="red.solid">
            {validation.message}
          </text>
        </Stack>
      )}
    </Stack>
  );
}

// ✅ QUICK TIME GENERATOR
interface QuickTimeGeneratorProps {
  onCreateSlot: (startTime: string, endTime: string) => void;
}

function QuickTimeGenerator({ onCreateSlot }: QuickTimeGeneratorProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const quickSlots = [
    { label: 'Mañana', start: '06:00', end: '14:00' },
    { label: 'Tarde', start: '14:00', end: '22:00' },
    { label: 'Noche', start: '22:00', end: '06:00' },
    { label: 'Jornada', start: '09:00', end: '17:00' }
  ];

  return (
    <Stack direction="column" gap="md" p="md" bg="bg.subtle" borderRadius="md">
      <text fontSize="sm" fontWeight="semibold">
        Crear horario personalizado
      </text>

      {/* Quick Presets */}
      <Grid templateColumns="repeat(auto-fit, minmax(100px, 1fr))" gap="sm">
        {quickSlots.map(preset => (
          <Button
            key={preset.label}
            size="sm"
            variant="outline"
            onClick={() => onCreateSlot(preset.start, preset.end)}
          >
            {preset.label}
          </Button>
        ))}
      </Grid>

      {/* Custom Time Inputs */}
      <Stack direction="row" gap="sm" align="end">
        <Stack direction="column" gap="xs">
          <text fontSize="xs" color="fg.muted">Inicio</text>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid var(--colors-border-default)',
              fontSize: '14px'
            }}
          />
        </Stack>

        <Stack direction="column" gap="xs">
          <text fontSize="xs" color="fg.muted">Fin</text>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid var(--colors-border-default)',
              fontSize: '14px'
            }}
          />
        </Stack>

        <Button
          size="sm"
          variant="solid"
          onClick={() => onCreateSlot(startTime, endTime)}
          disabled={startTime >= endTime}
        >
          Crear
        </Button>
      </Stack>
    </Stack>
  );
}

// ✅ MAIN COMPONENT
export function TimeSlotPicker({
  timeSlots = [],
  selectedSlot,
  onSlotSelect,
  selectionMode = 'single',
  selectedSlots = [],
  config = {},
  validator,
  loading = false,
  title = "Seleccionar Horario",
  onCreateSlot
}: TimeSlotPickerProps) {

  // ✅ CONFIG WITH DEFAULTS
  const pickerConfig = useMemo(() => ({
    showDuration: true,
    showCapacity: true,
    showConflicts: true,
    allowConflicted: false,
    compactMode: false,
    ...config
  }), [config]);

  // ✅ ENHANCED TIME SLOTS WITH CALCULATED DURATION
  const enhancedSlots = useMemo(() => {
    return timeSlots.map(slot => ({
      ...slot,
      duration: slot.duration || calculateDuration(slot.startTime, slot.endTime)
    }));
  }, [timeSlots]);

  // ✅ SELECTION LOGIC
  const handleSlotSelect = useCallback((slotId: string) => {
    if (selectionMode === 'single') {
      onSlotSelect?.(selectedSlot === slotId ? null : slotId);
    } else if (selectionMode === 'multiple') {
      // Handle multiple selection logic
      const isSelected = selectedSlots.includes(slotId);
      const newSelection = isSelected
        ? selectedSlots.filter(id => id !== slotId)
        : [...selectedSlots, slotId];
      // Note: In multiple mode, we'd need a different callback
      onSlotSelect?.(slotId);
    }
  }, [selectionMode, selectedSlot, selectedSlots, onSlotSelect]);

  // ✅ FILTER SLOTS
  const availableSlots = enhancedSlots.filter(slot =>
    slot.available && (pickerConfig.allowConflicted || !slot.conflicted)
  );

  const unavailableSlots = enhancedSlots.filter(slot =>
    !slot.available || (!pickerConfig.allowConflicted && slot.conflicted)
  );

  if (loading) {
    return (
      <Stack direction="column" gap="md">
        <text fontSize="lg" fontWeight="semibold">{title}</text>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="md">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ height: '120px', backgroundColor: '#f0f0f0', borderRadius: '8px' }} />
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="md">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <text fontSize="lg" fontWeight="semibold">{title}</text>

        <Stack direction="row" gap="sm" align="center">
          <text fontSize="sm" color="fg.muted">
            {availableSlots.length} disponibles
          </text>

          {selectionMode === 'multiple' && (
            <Badge size="sm" colorPalette="blue" variant="subtle">
              {selectedSlots.length} seleccionados
            </Badge>
          )}
        </Stack>
      </Stack>

      {/* Available Slots */}
      {availableSlots.length > 0 && (
        <Stack direction="column" gap="sm">
          <text fontSize="sm" fontWeight="medium" color="green.solid">
            Horarios Disponibles
          </text>

          <Grid
            templateColumns={pickerConfig.compactMode
              ? "repeat(auto-fit, minmax(150px, 1fr))"
              : "repeat(auto-fit, minmax(200px, 1fr))"
            }
            gap="md"
          >
            {availableSlots.map(slot => (
              <TimeSlotCard
                key={slot.id}
                slot={slot}
                selected={selectionMode === 'single'
                  ? selectedSlot === slot.id
                  : selectedSlots.includes(slot.id)
                }
                onSelect={handleSlotSelect}
                config={pickerConfig}
                validator={validator}
              />
            ))}
          </Grid>
        </Stack>
      )}

      {/* Unavailable Slots */}
      {unavailableSlots.length > 0 && (
        <Stack direction="column" gap="sm">
          <text fontSize="sm" fontWeight="medium" color="red.solid">
            No Disponibles
          </text>

          <Grid
            templateColumns={pickerConfig.compactMode
              ? "repeat(auto-fit, minmax(150px, 1fr))"
              : "repeat(auto-fit, minmax(200px, 1fr))"
            }
            gap="md"
          >
            {unavailableSlots.map(slot => (
              <TimeSlotCard
                key={slot.id}
                slot={slot}
                selected={false}
                onSelect={() => {}} // No selectable
                config={pickerConfig}
                validator={validator}
                disabled={true}
              />
            ))}
          </Grid>
        </Stack>
      )}

      {/* Custom Slot Creator */}
      {onCreateSlot && (
        <QuickTimeGenerator onCreateSlot={onCreateSlot} />
      )}

      {/* Empty State */}
      {timeSlots.length === 0 && (
        <Stack
          direction="column"
          align="center"
          justify="center"
          gap="md"
          p="xl"
          bg="bg.subtle"
          borderRadius="md"
          minH="200px"
        >
          <Icon icon={ClockIcon} size="lg" color="fg.muted" />
          <text fontSize="md" color="fg.muted">
            No hay horarios disponibles
          </text>
          {onCreateSlot && (
            <Button size="sm" onClick={() => onCreateSlot('09:00', '17:00')}>
              Crear primer horario
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

export default TimeSlotPicker;