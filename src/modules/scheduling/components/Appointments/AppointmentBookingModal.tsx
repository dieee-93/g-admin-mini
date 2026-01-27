/**
 * APPOINTMENT BOOKING MODAL
 *
 * Modal for creating/editing appointments.
 *
 * @version 1.0.0 - Phase 4
 */

import { useState } from 'react';
import {
  Dialog,
  Icon,
  HStack,
  Text,
  VStack
} from '@/shared/ui';
import { CalendarIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { AppointmentForm } from './AppointmentForm';
import { useAppointments } from '../../hooks';
import type { Appointment } from '../../types/appointments';
import type { AppointmentFormData } from '../../types/appointmentSchema';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  appointment?: Appointment | null;
  prefilledDate?: string;
  prefilledCustomerId?: string;
}

export function AppointmentBookingModal({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  prefilledDate,
  prefilledCustomerId
}: AppointmentBookingModalProps) {
  const isEditMode = !!appointment;
  const { createAppointment, updateAppointment } = useAppointments({ autoLoad: false });
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      setLoading(true);

      if (isEditMode && appointment) {
        // Update existing appointment
        await updateAppointment(appointment.id, {
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_email: data.customer_email,
          service_name: data.service_name,
          service_duration_minutes: data.service_duration_minutes,
          provider_name: data.provider_name,
          appointment_date: data.appointment_date,
          start_time: data.start_time,
          end_time: data.end_time,
          notes: data.notes
        });

        notify.success({
          title: 'Cita actualizada',
          description: 'La cita ha sido actualizada exitosamente',
          duration: 3000
        });
      } else {
        // Create new appointment
        const newAppointment = await createAppointment({
          customer_id: data.customer_id,
          customer_name: data.customer_name,
          customer_phone: data.customer_phone,
          customer_email: data.customer_email,
          service_id: data.service_id || 'temp-service-id', // TODO: Get from service selector
          service_name: data.service_name,
          service_duration_minutes: data.service_duration_minutes,
          provider_id: data.provider_id,
          provider_name: data.provider_name,
          appointment_date: data.appointment_date,
          start_time: data.start_time,
          end_time: data.end_time,
          booking_source: data.booking_source || 'staff',
          notes: data.notes,
          package_id: data.package_id
        });

        logger.info('Appointment created via modal', {
          appointmentId: newAppointment.id
        });

        notify.success({
          title: 'Cita creada',
          description: `Cita programada para ${data.customer_name}`,
          duration: 3000
        });
      }

      // Success callback
      onSuccess?.();
      onClose();
    } catch (error) {
      logger.error('Error saving appointment', { error, isEditMode });

      notify.error({
        title: 'Error',
        description: isEditMode
          ? 'No se pudo actualizar la cita'
          : 'No se pudo crear la cita',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
      size={{ base: 'full', md: 'xl' }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: '100%', md: '900px' }}
          maxH={{ base: '100vh', md: '90vh' }}
          w="full"
          overflowY="auto"
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <HStack>
              <Icon
                icon={isEditMode ? PencilSquareIcon : CalendarIcon}
                size="lg"
                className="text-green-500"
              />
              <VStack align="start" gap="0">
                <Dialog.Title>
                  {isEditMode ? 'Editar Cita' : 'Nueva Cita'}
                </Dialog.Title>
                <Text fontSize="sm" color="gray.500">
                  {isEditMode
                    ? 'Actualiza los detalles de la cita.'
                    : 'Programa una nueva cita para un cliente.'}
                </Text>
              </VStack>
            </HStack>
          </Dialog.Header>

          <Dialog.Body>
            <AppointmentForm
              appointment={appointment}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              prefilledDate={prefilledDate}
              prefilledCustomerId={prefilledCustomerId}
              loading={loading}
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
