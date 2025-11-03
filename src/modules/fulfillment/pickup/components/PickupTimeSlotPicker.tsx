/**
 * PICKUP TIME SLOT PICKER
 *
 * Allows customers to select available pickup time slots.
 *
 * @version 1.0.0
 */

import React from 'react';
import {
  VStack,
  HStack,
  Grid,
  Badge,
  Typography,
  CardWrapper
} from '@/shared/ui';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { pickupService } from '../services/pickupService';
import type { SlotAvailability, TimeSlotConfig } from '../types';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

export interface PickupTimeSlotPickerProps {
  date: Date;
  locationId?: string;
  config?: Partial<TimeSlotConfig>;
  onSlotSelected: (slot: SlotAvailability) => void;
  selectedSlotId?: string;
}

export function PickupTimeSlotPicker({
  date,
  locationId,
  config,
  onSlotSelected,
  selectedSlotId
}: PickupTimeSlotPickerProps) {
  const [slots, setSlots] = React.useState<SlotAvailability[]>([]);
  const [loading, setLoading] = React.useState(true);

  const dateString = date.toISOString().split('T')[0];

  const loadSlots = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await pickupService.getAvailableSlots(dateString, locationId, config);
      setSlots(data);
    } catch (error) {
      logger.error('TimeSlotPicker', 'Error loading slots', error);
      notify.error({ title: 'Error loading time slots' });
    } finally {
      setLoading(false);
    }
  }, [dateString, locationId, config]);

  React.useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleSlotClick = (slot: SlotAvailability) => {
    if (!slot.available) {
      notify.warning({ title: 'Slot not available' });
      return;
    }

    onSlotSelected(slot);
    notify.success({
      title: 'Time slot selected',
      description: `${slot.slot.time_start} - ${slot.slot.time_end}`
    });
  };

  if (loading) {
    return <Typography>Loading time slots...</Typography>;
  }

  if (!slots.length) {
    return <Typography>No time slots available for this date</Typography>;
  }

  return (
    <VStack align="start" gap="md" w="full">
      <Typography fontSize="lg" fontWeight="bold">
        Select Pickup Time
      </Typography>

      <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap="sm" w="full">
        {slots.map((slotAvail) => {
          const isSelected = slotAvail.slot.id === selectedSlotId;

          return (
            <CardWrapper
              key={slotAvail.slot.id}
              onClick={() => handleSlotClick(slotAvail)}
              cursor={slotAvail.available ? 'pointer' : 'not-allowed'}
              bg={
                isSelected
                  ? 'green.50'
                  : slotAvail.available
                  ? 'white'
                  : 'gray.50'
              }
              borderColor={isSelected ? 'green.500' : 'gray.200'}
              borderWidth="2px"
              opacity={slotAvail.available ? 1 : 0.5}
              _hover={
                slotAvail.available
                  ? { borderColor: 'blue.500', shadow: 'sm' }
                  : undefined
              }
            >
              <VStack align="center" gap="xs" py="2">
                <HStack gap="xs">
                  <Icon
                    icon={isSelected ? CheckCircleIcon : ClockIcon}
                    size="sm"
                    color={isSelected ? 'green.600' : 'gray.600'}
                  />
                  <Typography fontWeight="bold" fontSize="sm">
                    {slotAvail.slot.time_start}
                  </Typography>
                </HStack>

                <Typography fontSize="xs" color="text.muted">
                  {slotAvail.spotsRemaining} spots
                </Typography>

                {slotAvail.isFullyBooked && (
                  <Badge colorPalette="red" size="xs">
                    Full
                  </Badge>
                )}

                {slotAvail.isPastCutoff && !slotAvail.isFullyBooked && (
                  <Badge colorPalette="orange" size="xs">
                    Past cutoff
                  </Badge>
                )}
              </VStack>
            </CardWrapper>
          );
        })}
      </Grid>
    </VStack>
  );
}

export default PickupTimeSlotPicker;
