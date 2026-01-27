/**
 * APPOINTMENT FORM
 *
 * Form for creating/editing appointments using react-hook-form + Zod.
 *
 * @version 1.0.0 - Phase 4
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack,
  Button,
  Input,
  Textarea,
  Field,
  HStack,
  Text,
  Badge
} from '@/shared/ui';
import {
  appointmentFormSchema,
  appointmentFormDefaults,
  calculateEndTime,
  calculateDuration,
  type AppointmentFormData
} from '../../types/appointmentSchema';
import type { Appointment } from '../../types/appointments';
import { logger } from '@/lib/logging';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  prefilledDate?: string;
  prefilledCustomerId?: string;
  loading?: boolean;
}

export function AppointmentForm({
  appointment,
  onSubmit,
  onCancel,
  prefilledDate,
  prefilledCustomerId,
  loading = false
}: AppointmentFormProps) {
  const isEditMode = !!appointment;

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: isEditMode
      ? {
          customer_id: appointment.customer_id,
          customer_name: appointment.customer_name,
          customer_phone: appointment.customer_phone || '',
          customer_email: appointment.customer_email || '',
          service_id: appointment.service_id,
          service_name: appointment.service_name,
          service_duration_minutes: appointment.service_duration_minutes,
          provider_id: appointment.provider_id,
          provider_name: appointment.provider_name,
          appointment_date: appointment.appointment_date,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          booking_source: appointment.booking_source,
          notes: appointment.notes || '',
          package_id: appointment.package_id
        }
      : {
          ...appointmentFormDefaults,
          appointment_date: prefilledDate || new Date().toISOString().split('T')[0],
          customer_id: prefilledCustomerId,
          start_time: '09:00',
          end_time: '10:00'
        }
  });

  // Watch fields that affect calculations
  const watchStartTime = watch('start_time');
  const watchDuration = watch('service_duration_minutes');

  // Auto-calculate end_time when start_time or duration changes
  useEffect(() => {
    if (watchStartTime && watchDuration) {
      const newEndTime = calculateEndTime(watchStartTime, watchDuration);
      setValue('end_time', newEndTime);
    }
  }, [watchStartTime, watchDuration, setValue]);

  // Handle form submission
  const handleFormSubmit = async (data: AppointmentFormData) => {
    try {
      await onSubmit(data);
      logger.info('Appointment form submitted', { isEditMode });
    } catch (error) {
      logger.error('Error submitting appointment form', { error });
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack gap={6}>
        {/* Customer Information */}
        <Stack gap={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Información del Cliente
          </Text>

          <Field.Root invalid={!!errors.customer_name}>
            <Field.Label>Nombre del Cliente *</Field.Label>
            <Input
              {...register('customer_name')}
              placeholder="Juan Pérez"
              disabled={loading || isSubmitting}
            />
            {errors.customer_name && (
              <Field.ErrorText>{errors.customer_name.message}</Field.ErrorText>
            )}
          </Field.Root>

          <HStack gap={4}>
            <Field.Root invalid={!!errors.customer_phone} flex={1}>
              <Field.Label>Teléfono</Field.Label>
              <Input
                {...register('customer_phone')}
                placeholder="+54 9 11 1234-5678"
                type="tel"
                disabled={loading || isSubmitting}
              />
              {errors.customer_phone && (
                <Field.ErrorText>{errors.customer_phone.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.customer_email} flex={1}>
              <Field.Label>Email</Field.Label>
              <Input
                {...register('customer_email')}
                placeholder="cliente@example.com"
                type="email"
                disabled={loading || isSubmitting}
              />
              {errors.customer_email && (
                <Field.ErrorText>{errors.customer_email.message}</Field.ErrorText>
              )}
            </Field.Root>
          </HStack>
        </Stack>

        {/* Service Details */}
        <Stack gap={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Detalles del Servicio
          </Text>

          <Field.Root invalid={!!errors.service_name}>
            <Field.Label>Servicio *</Field.Label>
            <Input
              {...register('service_name')}
              placeholder="Corte de cabello, Masaje, Consulta..."
              disabled={loading || isSubmitting}
            />
            <Field.HelperText>
              TODO: Implementar selector de servicios desde la tabla products
            </Field.HelperText>
            {errors.service_name && (
              <Field.ErrorText>{errors.service_name.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.service_duration_minutes}>
            <Field.Label>Duración (minutos) *</Field.Label>
            <Controller
              name="service_duration_minutes"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={loading || isSubmitting}
                />
              )}
            />
            {errors.service_duration_minutes && (
              <Field.ErrorText>{errors.service_duration_minutes.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.provider_name}>
            <Field.Label>Proveedor *</Field.Label>
            <Input
              {...register('provider_name')}
              placeholder="María García"
              disabled={loading || isSubmitting}
            />
            <Field.HelperText>
              TODO: Implementar selector de staff/providers
            </Field.HelperText>
            {errors.provider_name && (
              <Field.ErrorText>{errors.provider_name.message}</Field.ErrorText>
            )}
          </Field.Root>
        </Stack>

        {/* Scheduling */}
        <Stack gap={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Fecha y Hora
          </Text>

          <Field.Root invalid={!!errors.appointment_date}>
            <Field.Label>Fecha *</Field.Label>
            <Input
              {...register('appointment_date')}
              type="date"
              disabled={loading || isSubmitting}
            />
            {errors.appointment_date && (
              <Field.ErrorText>{errors.appointment_date.message}</Field.ErrorText>
            )}
          </Field.Root>

          <HStack gap={4}>
            <Field.Root invalid={!!errors.start_time} flex={1}>
              <Field.Label>Hora de Inicio *</Field.Label>
              <Input
                {...register('start_time')}
                type="time"
                disabled={loading || isSubmitting}
              />
              {errors.start_time && (
                <Field.ErrorText>{errors.start_time.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.end_time} flex={1}>
              <Field.Label>Hora de Fin *</Field.Label>
              <Input
                {...register('end_time')}
                type="time"
                disabled={loading || isSubmitting}
              />
              <Field.HelperText>
                Se calcula automáticamente
              </Field.HelperText>
              {errors.end_time && (
                <Field.ErrorText>{errors.end_time.message}</Field.ErrorText>
              )}
            </Field.Root>
          </HStack>

          {/* Duration badge */}
          {watchStartTime && watch('end_time') && (
            <Badge colorScheme="blue">
              Duración: {calculateDuration(watchStartTime, watch('end_time'))} minutos
            </Badge>
          )}
        </Stack>

        {/* Notes */}
        <Field.Root invalid={!!errors.notes}>
          <Field.Label>Notas</Field.Label>
          <Textarea
            {...register('notes')}
            placeholder="Información adicional sobre la cita..."
            rows={3}
            disabled={loading || isSubmitting}
          />
          {errors.notes && (
            <Field.ErrorText>{errors.notes.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Form Actions */}
        <HStack justify="end" gap={3} pt={4} borderTopWidth="1px">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            loading={loading || isSubmitting}
          >
            {isEditMode ? 'Actualizar Cita' : 'Crear Cita'}
          </Button>
        </HStack>
      </Stack>
    </form>
  );
}
