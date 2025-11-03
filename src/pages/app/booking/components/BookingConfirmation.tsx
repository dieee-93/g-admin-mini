import { Stack, Text, Box, Textarea } from '@chakra-ui/react';
import { Button, CardWrapper, Badge } from '@/shared/ui';
import { Icon } from '@/shared/ui/Icon';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { ServiceProduct, ProfessionalProfile, AvailableSlotInfo } from '@/types/appointment';

interface BookingConfirmationProps {
  service: ServiceProduct;
  professional?: ProfessionalProfile;
  slot: AvailableSlotInfo;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function BookingConfirmation({
  service,
  professional,
  slot,
  notes,
  onNotesChange,
  onConfirm,
  onBack,
  isLoading = false,
}: BookingConfirmationProps) {
  return (
    <Stack gap="6">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb="2">
          Confirm Your Booking
        </Text>
        <Text color="text.muted">
          Review your appointment details before confirming
        </Text>
      </Box>

      {/* Booking Summary Card */}
      <CardWrapper variant="elevated" size="lg">
        <CardWrapper.Body>
          <Stack gap="4">
            {/* Service */}
            <Stack gap="2">
              <Text fontSize="sm" color="text.muted" fontWeight="medium">
                SERVICE
              </Text>
              <Stack direction="row" justify="space-between" align="start">
                <Stack gap="1">
                  <Text fontSize="lg" fontWeight="semibold">
                    {service.name}
                  </Text>
                  {service.description && (
                    <Text fontSize="sm" color="text.muted">
                      {service.description}
                    </Text>
                  )}
                </Stack>
                <Badge colorPalette="blue" size="sm">
                  {service.duration_minutes} min
                </Badge>
              </Stack>
            </Stack>

            <Box height="1px" bg="gray.200" />

            {/* Professional */}
            {professional && (
              <>
                <Stack gap="2">
                  <Text fontSize="sm" color="text.muted" fontWeight="medium">
                    PROFESSIONAL
                  </Text>
                  <Stack direction="row" gap="2" align="center">
                    <Icon icon={UserIcon} size="sm" color="text.muted" />
                    <Text fontSize="md" fontWeight="medium">
                      {professional.name || `${professional.first_name} ${professional.last_name}`}
                    </Text>
                  </Stack>
                </Stack>

                <Box height="1px" bg="gray.200" />
              </>
            )}

            {/* Date & Time */}
            <Stack gap="3">
              <Text fontSize="sm" color="text.muted" fontWeight="medium">
                DATE & TIME
              </Text>

              <Stack direction="row" gap="2" align="center">
                <Icon icon={CalendarIcon} size="sm" color="text.muted" />
                <Text fontSize="md" fontWeight="medium">
                  {format(new Date(slot.date), 'EEEE, MMMM d, yyyy')}
                </Text>
              </Stack>

              <Stack direction="row" gap="2" align="center">
                <Icon icon={ClockIcon} size="sm" color="text.muted" />
                <Text fontSize="md" fontWeight="medium">
                  {slot.start_time} - {slot.end_time}
                </Text>
              </Stack>
            </Stack>

            <Box height="1px" bg="gray.200" />

            {/* Price */}
            <Stack gap="2">
              <Text fontSize="sm" color="text.muted" fontWeight="medium">
                TOTAL PRICE
              </Text>
              <Stack direction="row" gap="2" align="center">
                <Icon icon={CurrencyDollarIcon} size="sm" color="green.600" />
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${service.price.toFixed(2)}
                </Text>
              </Stack>
              <Text fontSize="xs" color="text.muted">
                Payment will be collected at the time of service
              </Text>
            </Stack>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Notes */}
      <Stack gap="2">
        <Text fontSize="sm" fontWeight="medium">
          Additional Notes (Optional)
        </Text>
        <Textarea
          placeholder="Any special requests or information..."
          value={notes || ''}
          onChange={(e) => onNotesChange?.(e.target.value)}
          rows={3}
        />
      </Stack>

      {/* Cancellation Policy */}
      {service.cancellation_policy !== 'flexible' && (
        <CardWrapper variant="outline" borderColor="orange.200" bg="orange.50">
          <CardWrapper.Body>
            <Text fontSize="sm" color="orange.800">
              <strong>Cancellation Policy:</strong>{' '}
              {service.cancellation_policy === '24h_notice' &&
                'Free cancellation up to 24 hours before appointment.'}
              {service.cancellation_policy === '48h_notice' &&
                'Free cancellation up to 48 hours before appointment.'}
              {service.cancellation_policy === 'strict' &&
                'No cancellations allowed. Please contact us for special circumstances.'}
            </Text>
          </CardWrapper.Body>
        </CardWrapper>
      )}

      {/* Actions */}
      <Stack direction="row" gap="3" justify="flex-end">
        <Button variant="ghost" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          colorPalette="blue"
          size="lg"
          onClick={onConfirm}
          loading={isLoading}
        >
          Confirm Booking
        </Button>
      </Stack>
    </Stack>
  );
}
