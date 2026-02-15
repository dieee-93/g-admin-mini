import { Stack, Text, Box, Grid, Button, CardWrapper, Icon } from '@/shared/ui';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAvailability } from '../hooks/useBooking';
import type { AvailableSlotInfo } from '@/types/appointment';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';

interface CalendarPickerProps {
  serviceId: string;
  staffId?: string;
  onSelect: (slot: AvailableSlotInfo) => void;
}

export function CalendarPicker({ serviceId, staffId, onSelect }: CalendarPickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const { data: slots, isLoading } = useAvailability({
    service_id: serviceId,
    date: format(selectedDate, 'yyyy-MM-dd'),
    staff_id: staffId,
  });

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handlePrevWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  return (
    <Stack gap="6">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb="2">
          Choose Date & Time
        </Text>
        <Text color="text.muted">
          Select your preferred date and time slot
        </Text>
      </Box>

      {/* Week Navigation */}
      <Stack direction="row" justify="space-between" align="center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevWeek}
          leftIcon={<Icon icon={ChevronLeftIcon} size="sm" />}
        >
          Previous Week
        </Button>
        <Text fontWeight="semibold">
          {format(currentWeek, 'MMMM yyyy')}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextWeek}
          rightIcon={<Icon icon={ChevronRightIcon} size="sm" />}
        >
          Next Week
        </Button>
      </Stack>

      {/* Week Days Selector */}
      <Grid templateColumns="repeat(7, 1fr)" gap="2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isPast = day < new Date() && !isToday;

          return (
            <Box
              key={day.toISOString()}
              as="button"
              onClick={() => !isPast && setSelectedDate(day)}
              disabled={isPast}
              p="3"
              borderRadius="md"
              border="2px solid"
              borderColor={isSelected ? 'blue.500' : 'gray.200'}
              bg={isSelected ? 'blue.50' : isPast ? 'gray.50' : 'white'}
              cursor={isPast ? 'not-allowed' : 'pointer'}
              opacity={isPast ? 0.5 : 1}
              transition="all 0.2s"
              _hover={!isPast ? { borderColor: 'blue.400', shadow: 'sm' } : {}}
            >
              <Stack gap="1" align="center">
                <Text fontSize="xs" color="text.muted" fontWeight="medium">
                  {format(day, 'EEE')}
                </Text>
                <Text fontSize="lg" fontWeight={isSelected ? 'bold' : 'medium'}>
                  {format(day, 'd')}
                </Text>
                {isToday && (
                  <Text fontSize="xs" color="blue.600" fontWeight="semibold">
                    Today
                  </Text>
                )}
              </Stack>
            </Box>
          );
        })}
      </Grid>

      {/* Available Time Slots */}
      <Stack gap="3">
        <Text fontSize="lg" fontWeight="semibold">
          Available Times for {format(selectedDate, 'MMMM d, yyyy')}
        </Text>

        {isLoading ? (
          <Stack gap="2">
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} height="50px" bg="gray.100" borderRadius="md" />
            ))}
          </Stack>
        ) : !slots || slots.length === 0 ? (
          <CardWrapper variant="outline">
            <CardWrapper.Body>
              <Text color="text.muted" textAlign="center" py="4">
                No available time slots for this date. Please select another date.
              </Text>
            </CardWrapper.Body>
          </CardWrapper>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="3">
            {slots.map((slot) => (
              <Button
                key={slot.slot_id}
                variant="outline"
                size="lg"
                onClick={() => onSelect(slot)}
                leftIcon={<Icon icon={ClockIcon} size="sm" />}
                colorPalette="blue"
              >
                {slot.start_time}
              </Button>
            ))}
          </Grid>
        )}
      </Stack>
    </Stack>
  );
}
