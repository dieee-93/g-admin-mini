import React, { useState } from "react";
import {
  Stack, Typography, CardWrapper, Section, Button, Badge, SimpleGrid, MetricCard, ActionButton
} from "@/shared/ui";
import { 
  BuildingOfficeIcon, 
  PencilIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";
import { WeeklyScheduleEditor } from '@/shared/components/WeeklyScheduleEditor';
import type { Schedule, DailyRule } from '@/types/schedule';
// TODO: Refactorizar para usar el sistema de capabilities unificado
// import { useBusinessCapabilities } from "@/store/businessCapabilitiesStore";
import { useCapabilities } from "@/store/capabilityStore";

import { logger } from '@/lib/logging';
const initialBusinessHours: Partial<Schedule> = {
  name: "Horario de Atención Principal",
  type: "BUSINESS_HOURS",
  weeklyRules: [
    { dayOfWeek: 'MONDAY', timeBlocks: [{ startTime: '08:00', endTime: '17:00' }] },
    { dayOfWeek: 'TUESDAY', timeBlocks: [{ startTime: '08:00', endTime: '17:00' }] },
    { dayOfWeek: 'WEDNESDAY', timeBlocks: [{ startTime: '08:00', endTime: '17:00' }] },
    { dayOfWeek: 'THURSDAY', timeBlocks: [{ startTime: '08:00', endTime: '17:00' }] },
    { dayOfWeek: 'FRIDAY', timeBlocks: [{ startTime: '08:00', endTime: '17:00' }] },
    { dayOfWeek: 'SATURDAY', timeBlocks: [{ startTime: '10:00', endTime: '14:00' }] },
    { dayOfWeek: 'SUNDAY', timeBlocks: [] },
  ]
};

const dayOrder: DailyRule['dayOfWeek'][] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export function BusinessProfileSection() {
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [businessHours, setBusinessHours] = useState(initialBusinessHours);
  // TODO: Refactorizar para integrar con achievements system
  // const { completeMilestone } = useCapabilities();

  const handleSaveHours = () => {
    logger.info('App', "Saving new business hours:", businessHours);
    setIsEditingHours(false);
    // TODO: Emit event para achievements system
    // completeMilestone('define-business-hours');
  };

  const businessData = {
    name: "Panadería El Buen Pan",
    type: "Panadería",
    address: "Calle Mayor 123, Madrid, España",
    email: "info@elbuenpan.com",
    phone: "+34 91 123 4567",
    website: "www.elbuenpan.com"
  };

  const sortedRules = businessHours.weeklyRules?.sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

  return (
    <Section variant="elevated" title="Perfil Empresarial" subtitle="Información básica sobre el negocio" icon={BuildingOfficeIcon}>
      <Stack direction="row" justify="space-between" align="center" mb="lg">
        <Button size="sm">
          <Icon icon={PencilIcon} size="sm" />
          Editar Información
        </Button>
      </Stack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
          <CardWrapper variant="outline">
            <CardWrapper.Header>
              <Stack direction="row" justify="space-between" align="center">
                <CardWrapper.Title>Información del Negocio</CardWrapper.Title>
                <Badge variant="solid" colorPalette="green">
                  <Icon icon={CheckCircleIcon} size="xs" />
                  Completo
                </Badge>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
                <Stack direction="column" gap="md">
                    <MetricCard
                        title="Negocio"
                        value={businessData.name}
                        subtitle={businessData.type}
                        icon={BuildingOfficeIcon}
                        colorPalette="blue"
                    />
                    <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                      <Icon icon={MapPinIcon} size="md" color="blue.500" />
                      <Typography variant="body" weight="medium">{businessData.address}</Typography>
                    </Stack>
                    <SimpleGrid columns={2} gap="sm">
                      <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                        <Icon icon={PhoneIcon} size="sm" color="green.500" />
                        <Typography variant="body" weight="medium">{businessData.phone}</Typography>
                      </Stack>
                      <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                        <Icon icon={EnvelopeIcon} size="sm" color="purple.500" />
                        <Typography variant="body" weight="medium">{businessData.email}</Typography>
                      </Stack>
                    </SimpleGrid>
                </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="outline">
            <CardWrapper.Header>
              <Stack direction="row" justify="space-between" align="center">
                <CardWrapper.Title>Horarios de Operación</CardWrapper.Title>
                <Badge variant="subtle" colorPalette="blue">
                  <Icon icon={ClockIcon} size="xs" />
                  {businessHours.weeklyRules?.filter(r => r.timeBlocks.length > 0).length || 0} días
                </Badge>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              {isEditingHours ? (
                <Stack gap={4}>
                  <WeeklyScheduleEditor schedule={businessHours} onChange={setBusinessHours} />
                  <Stack direction="row" justify="flex-end">
                    <Button variant="ghost" onClick={() => setIsEditingHours(false)}>Cancelar</Button>
                    <Button colorScheme="blue" onClick={handleSaveHours}>Guardar Horarios</Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction="column" gap={2}>
                  {sortedRules?.map((rule) => {
                    const isOpen = rule.timeBlocks.length > 0;
                    return (
                        <Stack key={rule.dayOfWeek} direction="row" justify="space-between" p={2} bg={isOpen ? "green.50" : "gray.100"} borderRadius="md">
                            <Typography variant="body" weight="medium" width="100px">{rule.dayOfWeek}</Typography>
                            <Typography variant="body" size="sm" color={isOpen ? "green.700" : "gray.500"}>
                                {isOpen ? rule.timeBlocks.map(b => `${b.startTime} - ${b.endTime}`).join(', ') : 'Cerrado'}
                            </Typography>
                        </Stack>
                    )
                  })}
                  <ActionButton mt={2} size="sm" colorPalette="blue" variant="outline" onClick={() => setIsEditingHours(true)}>
                    <Icon icon={PencilIcon} size="xs" />
                    Editar Horarios
                  </ActionButton>
                </Stack>
              )}
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>
    </Section>
  );
}
