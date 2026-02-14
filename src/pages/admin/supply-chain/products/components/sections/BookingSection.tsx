/**
 * BOOKING SECTION
 *
 * Configuración de reservas para productos que requieren booking.
 * Visible para: physical_product, service, membership (si capability 'scheduling' activa)
 * ❌ NO para rental (usa availability_config en asset_config)
 *
 * Features:
 * - Toggle principal "Este producto requiere reserva"
 * - Ventana de reservas (min/max días de anticipación)
 * - Duración y buffer times
 * - Capacidad concurrente
 * - Auto-fill de duración desde Staff Section
 *
 * @design PRODUCTS_FORM_SECTIONS_SPEC.md - Section 4 (líneas 763-892)
 */

import { Stack, Switch, Alert, Text, HStack, NumberField, Field } from '@/shared/ui';
import type { FormSectionProps, BookingFields } from '../../types/productForm';

interface BookingSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: BookingFields;
  onChange: (data: BookingFields) => void;
}

export function BookingSection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: BookingSectionProps) {
  // Handle field changes
  const handleChange = <K extends keyof BookingFields>(
    field: K,
    value: BookingFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Get field error
  const getFieldError = (fieldName: string) => {
    return errors.find(e =>
      e.field === `booking.${fieldName}` || e.field === fieldName
    );
  };

  // Convert minutes to hours for display
  const minutesToHours = (minutes?: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return hours.toString();
    return `${hours}.${(mins / 60).toFixed(2).substring(2)}`;
  };

  // Convert hours to minutes for storage
  const hoursToMinutes = (hours: string): number | undefined => {
    const num = parseFloat(hours);
    if (isNaN(num)) return undefined;
    return Math.round(num * 60);
  };

  // Check if we have auto-filled duration from Staff
  const hasStaffDuration = data.duration_minutes && data.duration_minutes > 0;

  return (
    <Stack gap={4}>
      {/* Toggle principal */}
      <Stack gap={2}>
        <Switch
          checked={data.requires_booking || false}
          onCheckedChange={(e) => handleChange('requires_booking', e.checked)}
          disabled={readOnly}
        >
          Este producto requiere reserva
        </Switch>
        <Text color="fg.muted" fontSize="sm">
          Activa esto si el producto necesita ser reservado con anticipación
        </Text>
      </Stack>

      {data.requires_booking && (
        <>
          {/* Alert informativo */}
          <Alert.Root status="info" size="sm">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Integración con módulo Scheduling</Alert.Title>
              <Alert.Description>
                Esta configuración se integrará con el módulo de Scheduling para gestionar
                calendarios, disponibilidad y confirmaciones automáticas.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>

          {/* Ventana de reservas */}
          <HStack gap={4}>
            <NumberField
              label="Mínimo días de anticipación"
              min={0}
              placeholder="0"
              value={data.booking_window_days}
              onChange={(val) => handleChange('booking_window_days', val || undefined)}
              disabled={readOnly}
              error={getFieldError('booking_window_days')?.message}
            />

            <NumberField
              label="Máximo días de anticipación"
              min={data.booking_window_days || 0}
              placeholder="90"
              value={data.max_advance_days}
              onChange={(val) => handleChange('max_advance_days', val || undefined)}
              disabled={readOnly}
              error={getFieldError('max_advance_days')?.message}
            />
          </HStack>

          {/* Duración - Auto-fill desde Staff */}
          <NumberField
            label="Duración (horas)"
            min={0}
            step={0.5}
            precision={1}
            placeholder="1.5"
            value={data.duration_minutes ? data.duration_minutes / 60 : undefined}
            onChange={(val) => handleChange('duration_minutes', val ? Math.round(val * 60) : undefined)}
            disabled={readOnly}
            required
            error={getFieldError('duration_minutes')?.message}
          />

          {hasStaffDuration && (
            <Alert.Root status="success" size="sm">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  ✅ Duración auto-completada desde la sección de Personal
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Buffer time */}
          <NumberField
            label="Tiempo de espera entre reservas (minutos)"
            min={0}
            step={5}
            placeholder="15"
            value={data.buffer_time_minutes}
            onChange={(val) => handleChange('buffer_time_minutes', val || undefined)}
            disabled={readOnly}
            error={getFieldError('buffer_time_minutes')?.message}
          />

          {/* Capacidad concurrente */}
          <NumberField
            label="Capacidad concurrente"
            min={1}
            placeholder="1"
            value={data.concurrent_capacity}
            onChange={(val) => handleChange('concurrent_capacity', val || undefined)}
            disabled={readOnly}
            error={getFieldError('concurrent_capacity')?.message}
          />

          {/* Restricciones avanzadas - Sección colapsable (opcional para MVP) */}
          <Alert.Root status="warning" size="sm">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Restricciones avanzadas</Alert.Title>
              <Alert.Description>
                Para configurar días bloqueados, horarios disponibles o restricciones específicas,
                usa el módulo de Scheduling después de crear el producto.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </>
      )}
    </Stack>
  );
}

/**
 * Helper: Validar ventana de reservas
 */
export function validateBookingWindow(
  bookingWindowDays?: number,
  maxAdvanceDays?: number
): string | null {
  if (maxAdvanceDays && bookingWindowDays && maxAdvanceDays < bookingWindowDays) {
    return 'El máximo de días debe ser mayor o igual al mínimo';
  }
  return null;
}

/**
 * Helper: Auto-fill duration desde Staff
 */
export function autoFillDurationFromStaff(
  staffDurationMinutes?: number,
  currentBookingData?: BookingFields
): BookingFields | undefined {
  if (!staffDurationMinutes || !currentBookingData) return undefined;

  // Solo auto-fill si no hay duración definida
  if (!currentBookingData.duration_minutes || currentBookingData.duration_minutes === 0) {
    return {
      ...currentBookingData,
      duration_minutes: staffDurationMinutes
    };
  }

  return undefined;
}
