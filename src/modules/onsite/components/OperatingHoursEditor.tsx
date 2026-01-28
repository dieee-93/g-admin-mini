/**
 * OPERATING HOURS EDITOR COMPONENT
 * 
 * Editor for business operating hours (dine-in).
 * Injected by fulfillment-onsite module into settings.hours HookPoints.
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
    Stack,
    HStack,
    Button,
    Badge,
    Alert,
    FormSection,
    Icon,
    Tabs
} from '@/shared/ui';
import {
    BuildingStorefrontIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { WeeklyScheduleEditor } from '@/shared/components/WeeklyScheduleEditor';
import { useOperationsStore } from '@/store/operationsStore';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';
import type { Schedule, DailyRule, TimeBlock } from '@/types/schedule';
import type { Hours } from '@/store/operationsStore';

// ============================================
// CONVERSION UTILITIES
// ============================================

function hoursToSchedule(hours: Hours | undefined, name: string): Partial<Schedule> {
    if (!hours) {
        return {
            name,
            type: 'BUSINESS_HOURS',
            weeklyRules: [
                { dayOfWeek: 'MONDAY', timeBlocks: [] },
                { dayOfWeek: 'TUESDAY', timeBlocks: [] },
                { dayOfWeek: 'WEDNESDAY', timeBlocks: [] },
                { dayOfWeek: 'THURSDAY', timeBlocks: [] },
                { dayOfWeek: 'FRIDAY', timeBlocks: [] },
                { dayOfWeek: 'SATURDAY', timeBlocks: [] },
                { dayOfWeek: 'SUNDAY', timeBlocks: [] }
            ]
        };
    }

    const dayMap: Record<string, DailyRule['dayOfWeek']> = {
        monday: 'MONDAY',
        tuesday: 'TUESDAY',
        wednesday: 'WEDNESDAY',
        thursday: 'THURSDAY',
        friday: 'FRIDAY',
        saturday: 'SATURDAY',
        sunday: 'SUNDAY'
    };

    const weeklyRules: DailyRule[] = Object.entries(dayMap).map(([key, dayOfWeek]) => {
        const dayHours = hours[key];
        const timeBlocks: TimeBlock[] = [];

        if (dayHours && !dayHours.closed) {
            timeBlocks.push({
                startTime: dayHours.open,
                endTime: dayHours.close
            });
        }

        return { dayOfWeek, timeBlocks };
    });

    return { name, type: 'BUSINESS_HOURS', weeklyRules };
}

function scheduleToHours(schedule: Partial<Schedule>): Hours {
    if (!schedule.weeklyRules) return {};

    const dayMap: Record<DailyRule['dayOfWeek'], string> = {
        MONDAY: 'monday',
        TUESDAY: 'tuesday',
        WEDNESDAY: 'wednesday',
        THURSDAY: 'thursday',
        FRIDAY: 'friday',
        SATURDAY: 'saturday',
        SUNDAY: 'sunday'
    };

    const hours: Hours = {};

    schedule.weeklyRules.forEach((rule) => {
        const key = dayMap[rule.dayOfWeek];
        if (!key) return;

        if (rule.timeBlocks.length === 0) {
            hours[key] = { open: '00:00', close: '00:00', closed: true };
        } else {
            const block = rule.timeBlocks[0];
            hours[key] = {
                open: block.startTime,
                close: block.endTime,
                closed: false
            };
        }
    });

    return hours;
}

// ============================================
// COMPONENTS
// ============================================

export function OperatingHoursTabTrigger() {
    const operatingHours = useOperationsStore((state) => state.operatingHours);

    const isComplete = useMemo(() => {
        if (!operatingHours) return false;
        return Object.values(operatingHours).some(h => !h.closed);
    }, [operatingHours]);

    return (
        <Tabs.Trigger value="operating">
            <HStack gap="2">
                <Icon icon={BuildingStorefrontIcon} size="sm" />
                Horario de Atención
                <Badge colorPalette={isComplete ? 'green' : 'orange'} size="xs">
                    <Icon icon={isComplete ? CheckCircleIcon : ClockIcon} size="xs" />
                </Badge>
            </HStack>
        </Tabs.Trigger>
    );
}

export function OperatingHoursTabContent() {
    const operatingHours = useOperationsStore((state) => state.operatingHours);
    const setOperatingHours = useOperationsStore((state) => state.setOperatingHours);

    const [schedule, setSchedule] = useState<Partial<Schedule>>(() =>
        hoursToSchedule(operatingHours, 'Horario de Atención')
    );
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync store changes to local state
    useEffect(() => {
        setSchedule(hoursToSchedule(operatingHours, 'Horario de Atención'));
        setIsDirty(false);
    }, [operatingHours]);

    const handleChange = (newSchedule: Partial<Schedule>) => {
        setSchedule(newSchedule);
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const hours = scheduleToHours(schedule);
            setOperatingHours(hours);
            setIsDirty(false);

            logger.info('Hours', 'Operating hours saved', {
                daysWithHours: Object.values(hours).filter((h) => !h.closed).length
            });

            toaster.create({
                title: '✅ Horarios guardados',
                description: 'Horario de Atención actualizado correctamente',
                type: 'success',
                duration: 3000
            });
        } catch (error) {
            logger.error('Hours', 'Failed to save operating hours', error);
            toaster.create({
                title: 'Error al guardar',
                description: 'No se pudieron guardar los horarios. Intenta de nuevo.',
                type: 'error',
                duration: 4000
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setSchedule(hoursToSchedule(operatingHours, 'Horario de Atención'));
        setIsDirty(false);
    };

    const status = useMemo(() => {
        const daysWithHours = schedule.weeklyRules?.filter((rule) => rule.timeBlocks.length > 0).length || 0;
        return {
            isComplete: daysWithHours > 0,
            daysCount: daysWithHours,
            percentage: Math.round((daysWithHours / 7) * 100)
        };
    }, [schedule]);

    return (
        <Tabs.Content value="operating">
            <Stack gap="4" mt="4">
                <Alert status="info" size="sm">
                    Horario en el que el local está abierto al público
                </Alert>

                <HStack justify="space-between">
                    <Badge colorPalette={status.isComplete ? 'green' : 'orange'} size="lg">
                        <Icon icon={status.isComplete ? CheckCircleIcon : ClockIcon} size="sm" />
                        {status.daysCount} de 7 días configurados ({status.percentage}%)
                    </Badge>

                    {isDirty && (
                        <Badge colorPalette="blue" size="sm">
                            Cambios sin guardar
                        </Badge>
                    )}
                </HStack>

                <FormSection
                    title="Editor de Horarios"
                    description="Selecciona los días y define los horarios de apertura y cierre"
                >
                    <WeeklyScheduleEditor schedule={schedule} onChange={handleChange} />
                </FormSection>

                <HStack justify="end" gap="3">
                    <Button
                        variant="ghost"
                        onClick={handleDiscard}
                        disabled={!isDirty || isSaving}
                    >
                        Descartar Cambios
                    </Button>
                    <Button
                        colorPalette="blue"
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        loading={isSaving}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Horarios'}
                    </Button>
                </HStack>
            </Stack>
        </Tabs.Content>
    );
}
