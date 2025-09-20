import React, { useMemo } from 'react';
import {
  CardWrapper,
  Typography,
  VStack,
  HStack,
  Badge,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@/shared/ui';
import type { Schedule } from '@/types/schedule';
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
        <CardWrapper variant="outline">
            <HStack justifyContent="space-between" mb={3}>
                <Typography variant="heading" size="md">{schedule.name}</Typography>
                <Badge colorPalette={typeColors[schedule.type]}>{schedule.type.replace('_', ' ')}</Badge>
            </HStack>
            <Typography variant="body" size="sm" color="text.muted" mb="4">
                Válido desde {schedule.validFrom || 'N/A'} hasta {schedule.validUntil || 'N/A'}
            </Typography>
            <VStack gap="sm" align="stretch">
                {sortedRules.map(rule => (
                    <HStack key={rule.dayOfWeek} justify="space-between" p="2" bg="gray.50" borderRadius="md">
                        <Typography variant="body" fontWeight="medium" width="100px">{rule.dayOfWeek.substring(0,3)}</Typography>
                        <Typography variant="body" size="sm">
                            {rule.timeBlocks.length > 0
                                ? rule.timeBlocks.map(b => `${b.startTime} - ${b.endTime}`).join(', ')
                                : 'Cerrado'}
                        </Typography>
                    </HStack>
                ))}
            </VStack>
        </CardWrapper>
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
    <CardWrapper bg="gray.100" minH="100vh" p="6">
      <VStack gap="lg" align="stretch" maxWidth="4xl" mx="auto">
        <Stack gap="xs">
          <Typography variant="heading" size="lg">Dashboard de Horarios</Typography>
          <Typography variant="body" color="text.muted">
            Vista consolidada de todos los horarios operativos del negocio.
          </Typography>
        </Stack>

        {allSchedules.length > 0 ? (
            allSchedules.map(schedule => (
                <ScheduleDisplayCard key={schedule.id} schedule={schedule} />
            ))
        ) : (
            <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <Stack gap="xs">
                    <AlertTitle>No hay horarios configurados.</AlertTitle>
                    <AlertDescription>
                        Ve a la sección de configuración de cada módulo (ej: Perfil de Negocio, Entregas) para definir sus horarios.
                    </AlertDescription>
                </Stack>
            </Alert>
        )}
      </VStack>
    </CardWrapper>
  );
}
