import React, { useMemo } from 'react';
import { Box, Heading, Text, VStack, HStack, Tag, Divider, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { Schedule } from '@/types/schedule';
import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore';

const ScheduleDisplayCard = ({ schedule }: { schedule: Schedule }) => {
    const typeColors = {
        BUSINESS_HOURS: 'blue',
        DELIVERY: 'green',
        PICKUP: 'orange',
        STAFF_SHIFT: 'purple',
    };

    const sortedRules = useMemo(() =>
        [...(schedule.weeklyRules || [])].sort((a, b) => {
            const dayOrder: Schedule['weeklyRules'][0]['dayOfWeek'][] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
            return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
        }),
    [schedule.weeklyRules]);

    return (
        <Box borderWidth="1px" borderRadius="lg" p={4} width="100%" bg="white">
            <HStack justifyContent="space-between" mb={3}>
                <Heading size="md">{schedule.name}</Heading>
                <Tag colorScheme={typeColors[schedule.type]}>{schedule.type.replace('_', ' ')}</Tag>
            </HStack>
            <Text fontSize="sm" color="gray.500" mb={4}>
                Válido desde {schedule.validFrom || 'N/A'} hasta {schedule.validUntil || 'N/A'}
            </Text>
            <VStack spacing={2} align="stretch">
                {sortedRules.map(rule => (
                    <HStack key={rule.dayOfWeek} justifyContent="space-between" p={2} bg="gray.50" borderRadius="md">
                        <Text fontWeight="medium" width="100px">{rule.dayOfWeek.substring(0,3)}</Text>
                        <Text fontSize="sm">
                            {rule.timeBlocks.length > 0
                                ? rule.timeBlocks.map(b => `${b.startTime} - ${b.endTime}`).join(', ')
                                : 'Cerrado'}
                        </Text>
                    </HStack>
                ))}
            </VStack>
        </Box>
    );
};

export default function SchedulesDashboardPage() {
  const { profile } = useBusinessCapabilities();

  // In a real application, this would fetch all schedules from a central API.
  // For now, we simulate this by creating a list of schedules from the profile.
  // Currently, the profile doesn't store schedules, so this will be empty.
  // This setup is ready for when the backend persistence is implemented.
  const allSchedules = useMemo((): Schedule[] => {
    const schedules: Schedule[] = [];

    // Example of how we would pull schedules from the profile in the future
    if (profile?.customizations.schedules?.businessHours) {
      // schedules.push(profile.customizations.schedules.businessHours);
    }

    // For demonstration, let's add a default placeholder if no schedules are found.
    // This can be removed once the profile correctly stores the schedule data.
    if (schedules.length === 0) {
        return [{
            id: 'placeholder_1',
            name: 'Horario de Atención (Ejemplo)',
            type: 'BUSINESS_HOURS',
            associatedEntityId: 'branch_main',
            weeklyRules: [
                { dayOfWeek: 'MONDAY', timeBlocks: [{ startTime: '09:00', endTime: '18:00' }] },
                { dayOfWeek: 'TUESDAY', timeBlocks: [{ startTime: '09:00', endTime: '18:00' }] },
                { dayOfWeek: 'WEDNESDAY', timeBlocks: [{ startTime: '09:00', endTime: '18:00' }] },
                { dayOfWeek: 'THURSDAY', timeBlocks: [{ startTime: '09:00', endTime: '18:00' }] },
                { dayOfWeek: 'FRIDAY', timeBlocks: [{ startTime: '09:00', endTime: '18:00' }] },
                { dayOfWeek: 'SATURDAY', timeBlocks: [] },
                { dayOfWeek: 'SUNDAY', timeBlocks: [] },
            ]
        }];
    }

    return schedules;
  }, [profile]);

  return (
    <Box p={6} bg="gray.100" minH="100vh">
      <VStack spacing={6} align="stretch" maxWidth="4xl" mx="auto">
        <Box>
          <Heading as="h1" size="lg">Dashboard de Horarios</Heading>
          <Text color="gray.600">
            Vista consolidada de todos los horarios operativos del negocio.
          </Text>
        </Box>

        {allSchedules.length > 0 ? (
            allSchedules.map(schedule => (
                <ScheduleDisplayCard key={schedule.id} schedule={schedule} />
            ))
        ) : (
            <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Box>
                    <AlertTitle>No hay horarios configurados.</AlertTitle>
                    <AlertDescription>
                        Ve a la sección de configuración de cada módulo (ej: Perfil de Negocio, Entregas) para definir sus horarios.
                    </AlertDescription>
                </Box>
            </Alert>
        )}
      </VStack>
    </Box>
  );
}
