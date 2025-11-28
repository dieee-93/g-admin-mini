/**
 * HOURS CONFIGURATION PAGE
 * 
 * Gestión de múltiples horarios operacionales.
 * 
 * HORARIOS SOPORTADOS:
 * - Operating Hours (Dine-in): Horario de atención en el local
 * - Pickup Hours (TakeAway): Horario de retiro de pedidos
 * - Delivery Hours (Delivery): Horario de entregas a domicilio
 * 
 * INTEGRACIÓN:
 * - operationsStore: Almacena operatingHours, pickupHours
 * - WeeklyScheduleEditor: Componente reutilizable para edición visual
 * - Achievements: Validación de requirement (takeaway_pickup_hours)
 * 
 * CONVERSIÓN DE FORMATOS:
 * - Store usa Hours (simple): { monday: { open: '09:00', close: '17:00' } }
 * - Editor usa Schedule (complejo): { weeklyRules: [{ dayOfWeek, timeBlocks }] }
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import {
  ContentLayout,
  PageHeader,
  Section,
  FormSection,
  Button,
  Stack,
  HStack,
  Alert,
  Badge,
  Icon,
  Tabs
} from '@/shared/ui';
import {
  ClockIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { WeeklyScheduleEditor } from '@/shared/components/WeeklyScheduleEditor';
import { useOperationsStore } from '@/store/operationsStore';
import { useCapabilities } from '@/lib/capabilities';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';
import type { Schedule, DailyRule, TimeBlock } from '@/types/schedule';
import type { Hours, DayHours } from '@/store/operationsStore';

// ============================================
// CONVERSION UTILITIES
// ============================================

/**
 * Convert simple Hours format to complex Schedule format
 */
function hoursToSchedule(hours: Hours | undefined, name: string, type: string): Partial<Schedule> {
  if (!hours) {
    return {
      name,
      type,
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

  return { name, type, weeklyRules };
}

/**
 * Convert complex Schedule format to simple Hours format
 */
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
      // Use first time block (most common case)
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
// COMPONENT
// ============================================

type ScheduleType = 'operating' | 'pickup' | 'delivery';

export default function HoursPage() {
  const { hasFeature } = useCapabilities();
  
  // Store access
  const operatingHours = useOperationsStore((state) => state.operatingHours);
  const pickupHours = useOperationsStore((state) => state.pickupHours);
  const setOperatingHours = useOperationsStore((state) => state.setOperatingHours);
  const setPickupHours = useOperationsStore((state) => state.setPickupHours);

  // Active tab
  const [activeTab, setActiveTab] = useState<ScheduleType>('operating');

  // Schedule state (editor format)
  const [operatingSchedule, setOperatingSchedule] = useState<Partial<Schedule>>(() =>
    hoursToSchedule(operatingHours, 'Horario de Atención', 'BUSINESS_HOURS')
  );
  const [pickupSchedule, setPickupSchedule] = useState<Partial<Schedule>>(() =>
    hoursToSchedule(pickupHours, 'Horario de Retiro TakeAway', 'PICKUP_HOURS')
  );
  const [deliverySchedule, setDeliverySchedule] = useState<Partial<Schedule>>(() =>
    hoursToSchedule(undefined, 'Horario de Entregas', 'DELIVERY_HOURS')
  );

  // Dirty state tracking
  const [isDirty, setIsDirty] = useState<Record<ScheduleType, boolean>>({
    operating: false,
    pickup: false,
    delivery: false
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync store changes to local state
  useEffect(() => {
    setOperatingSchedule(hoursToSchedule(operatingHours, 'Horario de Atención', 'BUSINESS_HOURS'));
  }, [operatingHours]);

  useEffect(() => {
    setPickupSchedule(hoursToSchedule(pickupHours, 'Horario de Retiro TakeAway', 'PICKUP_HOURS'));
  }, [pickupHours]);

  // Handlers
  const handleScheduleChange = (type: ScheduleType, newSchedule: Partial<Schedule>) => {
    switch (type) {
      case 'operating':
        setOperatingSchedule(newSchedule);
        break;
      case 'pickup':
        setPickupSchedule(newSchedule);
        break;
      case 'delivery':
        setDeliverySchedule(newSchedule);
        break;
    }
    setIsDirty((prev) => ({ ...prev, [type]: true }));
  };

  const handleSave = async (type: ScheduleType) => {
    setIsSaving(true);

    try {
      let schedule: Partial<Schedule>;
      let storeSetter: (hours: Hours) => void;
      let scheduleLabel: string;

      switch (type) {
        case 'operating':
          schedule = operatingSchedule;
          storeSetter = setOperatingHours;
          scheduleLabel = 'Horario de Atención';
          break;
        case 'pickup':
          schedule = pickupSchedule;
          storeSetter = setPickupHours;
          scheduleLabel = 'Horario de Retiro';
          break;
        case 'delivery':
          schedule = deliverySchedule;
          storeSetter = () => {}; // TODO: Add deliveryHours to operationsStore
          scheduleLabel = 'Horario de Entregas';
          break;
        default:
          return;
      }

      // Convert to Hours format and save
      const hours = scheduleToHours(schedule);
      storeSetter(hours);

      logger.info('Hours', `${scheduleLabel} saved`, {
        type,
        daysWithHours: Object.values(hours).filter((h) => !h.closed).length
      });

      setIsDirty((prev) => ({ ...prev, [type]: false }));

      toaster.create({
        title: '✅ Horarios guardados',
        description: `${scheduleLabel} actualizado correctamente`,
        type: 'success',
        duration: 3000
      });

      // TODO: Emit event for achievements system
      // if (type === 'pickup') {
      //   eventBus.emit('business.pickup_hours_configured', { hours });
      // }

    } catch (error) {
      logger.error('Hours', 'Failed to save schedule', error);

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

  const handleDiscard = (type: ScheduleType) => {
    switch (type) {
      case 'operating':
        setOperatingSchedule(hoursToSchedule(operatingHours, 'Horario de Atención', 'BUSINESS_HOURS'));
        break;
      case 'pickup':
        setPickupSchedule(hoursToSchedule(pickupHours, 'Horario de Retiro TakeAway', 'PICKUP_HOURS'));
        break;
      case 'delivery':
        setDeliverySchedule(hoursToSchedule(undefined, 'Horario de Entregas', 'DELIVERY_HOURS'));
        break;
    }
    setIsDirty((prev) => ({ ...prev, [type]: false }));
  };

  // Calculate completion for each schedule type
  const getCompletionStatus = (schedule: Partial<Schedule>) => {
    const daysWithHours = schedule.weeklyRules?.filter((rule) => rule.timeBlocks.length > 0).length || 0;
    return {
      isComplete: daysWithHours > 0,
      daysCount: daysWithHours,
      percentage: Math.round((daysWithHours / 7) * 100)
    };
  };

  const operatingStatus = useMemo(() => getCompletionStatus(operatingSchedule), [operatingSchedule]);
  const pickupStatus = useMemo(() => getCompletionStatus(pickupSchedule), [pickupSchedule]);
  const deliveryStatus = useMemo(() => getCompletionStatus(deliverySchedule), [deliverySchedule]);

  // Tab configuration
  const tabs = [
    {
      id: 'operating' as ScheduleType,
      label: 'Horario de Atención',
      icon: BuildingStorefrontIcon,
      schedule: operatingSchedule,
      status: operatingStatus,
      enabled: true,
      description: 'Horario en el que el local está abierto al público'
    },
    {
      id: 'pickup' as ScheduleType,
      label: 'Retiro TakeAway',
      icon: ShoppingBagIcon,
      schedule: pickupSchedule,
      status: pickupStatus,
      enabled: hasFeature('sales_pickup_orders'),
      description: 'Horario en el que los clientes pueden retirar pedidos'
    },
    {
      id: 'delivery' as ScheduleType,
      label: 'Entregas a Domicilio',
      icon: TruckIcon,
      schedule: deliverySchedule,
      status: deliveryStatus,
      enabled: hasFeature('delivery_home_delivery'), // TODO: Add this feature
      description: 'Horario en el que se realizan entregas a domicilio'
    }
  ].filter((tab) => tab.enabled);

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];
  const currentSchedule = currentTab.schedule;
  const currentStatus = currentTab.status;
  const currentIsDirty = isDirty[activeTab];

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Configuración de Horarios"
        subtitle="Gestiona los horarios operacionales de tu negocio"
      />

      {/* Overview Alert */}
      {!operatingStatus.isComplete && (
        <Alert
          status="warning"
          title="Configura tus horarios"
        >
          Define al menos un horario de atención para que tus clientes sepan cuándo pueden visitarte
          o hacer pedidos.
        </Alert>
      )}

      <Section
        title="Horarios Operacionales"
        description="Define los horarios de atención, retiro y entregas de tu negocio"
      >
        <Stack gap="6">
          {/* Tabs */}
          <Tabs.Root
            value={activeTab}
            onValueChange={(e) => setActiveTab(e.value as ScheduleType)}
            variant="enclosed"
          >
            <Tabs.List>
              {tabs.map((tab) => (
                <Tabs.Trigger key={tab.id} value={tab.id}>
                  <HStack gap="2">
                    <Icon icon={tab.icon} size="sm" />
                    {tab.label}
                    {tab.status.isComplete && (
                      <Badge colorPalette="green" size="xs">
                        <Icon icon={CheckCircleIcon} size="xs" />
                        {tab.status.daysCount}d
                      </Badge>
                    )}
                    {!tab.status.isComplete && (
                      <Badge colorPalette="orange" size="xs">
                        <Icon icon={ExclamationCircleIcon} size="xs" />
                        {tab.status.daysCount}d
                      </Badge>
                    )}
                  </HStack>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {tabs.map((tab) => (
              <Tabs.Content key={tab.id} value={tab.id}>
                <Stack gap="4" mt="4">
                  {/* Tab Description */}
                  <Alert status="info" size="sm">
                    {tab.description}
                  </Alert>

                  {/* Status Badge */}
                  <HStack justify="space-between">
                    <Badge
                      colorPalette={tab.status.isComplete ? 'green' : 'orange'}
                      size="lg"
                    >
                      <Icon
                        icon={tab.status.isComplete ? CheckCircleIcon : ClockIcon}
                        size="sm"
                      />
                      {tab.status.daysCount} de 7 días configurados ({tab.status.percentage}%)
                    </Badge>

                    {isDirty[tab.id] && (
                      <Badge colorPalette="blue" size="sm">
                        Cambios sin guardar
                      </Badge>
                    )}
                  </HStack>

                  {/* Schedule Editor */}
                  <FormSection
                    title="Editor de Horarios"
                    description="Selecciona los días y define los horarios de apertura y cierre"
                  >
                    <WeeklyScheduleEditor
                      schedule={tab.schedule}
                      onChange={(newSchedule) => handleScheduleChange(tab.id, newSchedule)}
                    />
                  </FormSection>

                  {/* Action Buttons */}
                  <HStack justify="flex-end" gap="3">
                    <Button
                      variant="ghost"
                      onClick={() => handleDiscard(tab.id)}
                      disabled={!isDirty[tab.id] || isSaving}
                    >
                      Descartar Cambios
                    </Button>
                    <Button
                      colorPalette="blue"
                      onClick={() => handleSave(tab.id)}
                      disabled={!isDirty[tab.id] || isSaving}
                      loading={isSaving}
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Horarios'}
                    </Button>
                  </HStack>
                </Stack>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Stack>
      </Section>
    </ContentLayout>
  );
}
