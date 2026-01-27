// DateTimePickerLite.tsx - Quick DateTime Selector for POS
// Combines date picker with TimeSlotPicker for SERVICE appointments
// Compatible with G-Admin Mini v2.1 Design System

import React, { useState, useCallback, useMemo } from 'react';
import { Stack, Text } from '@/shared/ui';
import { TimeSlotPicker, TimeSlot } from './TimeSlotPicker';

// ✅ HEROICONS v2
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export interface DateTimePickerLiteProps {
  /** ID del servicio para validar disponibilidad */
  serviceId: string;

  /** Callback cuando se selecciona fecha + hora */
  onSelect: (selection: DateTimeSelection) => void;

  /** Fecha inicial seleccionada */
  initialDate?: string; // "2025-12-12"

  /** Slot inicial seleccionado */
  initialSlotId?: string;

  /** Configuración de slots (opcional - puede venir de API) */
  availableSlots?: TimeSlot[];

  /** Estado de carga (si slots vienen de API) */
  loading?: boolean;

  /** Título del componente */
  title?: string;

  /** Modo compacto para POS */
  compactMode?: boolean;
}

export interface DateTimeSelection {
  date: string;      // "2025-12-12"
  slotId: string;    // ID del slot seleccionado
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

// ✅ MOCK SLOTS GENERATOR (temporal - reemplazar con API)
function generateMockSlots(date: string): TimeSlot[] {
  // TODO: Replace with real API call to scheduling service
  // BookingService.getAvailableSlots(serviceId, date)

  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const workingHours = isWeekend
    ? ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
    : ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  return workingHours.map((time, index) => {
    const [hours] = time.split(':').map(Number);
    const endHours = hours + 1;
    const endTime = `${endHours.toString().padStart(2, '0')}:00`;

    return {
      id: `slot-${date}-${time}`,
      startTime: time,
      endTime: endTime,
      duration: 60,
      available: Math.random() > 0.3, // 70% availability
      conflicted: false,
      capacity: 1,
      assigned: 0
    };
  });
}

// ✅ MAIN COMPONENT
export function DateTimePickerLite({
  serviceId,
  onSelect,
  initialDate,
  initialSlotId,
  availableSlots,
  loading = false,
  title = 'Seleccionar Fecha y Hora',
  compactMode = true
}: DateTimePickerLiteProps) {

  // ✅ STATE
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    initialSlotId || null
  );

  // ✅ GET SLOTS FOR SELECTED DATE
  // TODO: Replace with real API hook - useAvailableSlots(serviceId, selectedDate)
  const slots = useMemo(() => {
    if (availableSlots) return availableSlots;
    if (!selectedDate) return [];
    return generateMockSlots(selectedDate);
  }, [selectedDate, availableSlots]);

  // ✅ HANDLE DATE CHANGE
  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setSelectedSlotId(null); // Reset slot when date changes
  }, []);

  // ✅ HANDLE SLOT SELECTION
  const handleSlotSelect = useCallback((slotId: string | null) => {
    setSelectedSlotId(slotId);

    if (slotId) {
      const slot = slots.find(s => s.id === slotId);
      if (slot) {
        onSelect({
          date: selectedDate,
          slotId: slotId,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    }
  }, [slots, selectedDate, onSelect]);

  // ✅ MIN DATE (today)
  const minDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // ✅ MAX DATE (3 months from now)
  const maxDate = useMemo(() => {
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    return future.toISOString().split('T')[0];
  }, []);

  return (
    <Stack direction="column" gap="md" w="full">
      {/* Title */}
      {!compactMode && title && (
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
      )}

      {/* Date Picker */}
      <Stack direction="column" gap="xs">
        <Stack direction="row" align="center" gap="xs">
          <CalendarDaysIcon style={{ width: '20px', height: '20px' }} />
          <Text fontSize="sm" fontWeight="medium">
            Fecha
          </Text>
        </Stack>

        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={minDate}
          max={maxDate}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid var(--colors-border-default)',
            fontSize: '14px',
            fontFamily: 'inherit',
            backgroundColor: 'var(--colors-bg-panel)',
            color: 'var(--colors-fg-default)'
          }}
        />
      </Stack>

      {/* Time Slot Picker */}
      {selectedDate && (
        <TimeSlotPicker
          timeSlots={slots}
          selectedSlot={selectedSlotId}
          onSlotSelect={handleSlotSelect}
          config={{
            compactMode: compactMode,
            showDuration: true,
            showCapacity: false,
            showConflicts: true,
            allowConflicted: false
          }}
          loading={loading}
          title="Horarios Disponibles"
        />
      )}

      {/* Helper Text */}
      {compactMode && selectedDate && slots.length === 0 && !loading && (
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          No hay horarios disponibles para esta fecha
        </Text>
      )}
    </Stack>
  );
}

export default DateTimePickerLite;
