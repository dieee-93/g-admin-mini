// Business Profile Section - Company info, location, hours
import React from "react";
import {
  Stack, Typography, CardWrapper, Section, Button, Badge, SimpleGrid, MetricCard, ActionButton, Alert
} from "@/shared/ui";
import { 
  BuildingOfficeIcon, 
  PencilIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import { Icon, HeaderIcon } from "@/shared/ui/Icon";

export function BusinessProfileSection() {
  const businessData = {
    name: "Panadería El Buen Pan",
    type: "Panadería",
    address: "Calle Mayor 123, Madrid, España",
    email: "info@elbuenpan.com",
    phone: "+34 91 123 4567",
    website: "www.elbuenpan.com"
  };

  const operatingHours = [
    { day: "Lunes", hours: "06:00 - 20:00", isOpen: true },
    { day: "Martes", hours: "06:00 - 20:00", isOpen: true },
    { day: "Miércoles", hours: "06:00 - 20:00", isOpen: true },
    { day: "Jueves", hours: "06:00 - 20:00", isOpen: true },
    { day: "Viernes", hours: "06:00 - 20:00", isOpen: true },
    { day: "Sábado", hours: "07:00 - 15:00", isOpen: true },
    { day: "Domingo", hours: "Cerrado", isOpen: false }
  ];

  return (
    <Section variant="elevated" title="Perfil Empresarial" subtitle="Información básica sobre el negocio" icon={BuildingOfficeIcon}>
      <Stack direction="row" justify="space-between" align="center" mb="lg">
        <Button size="sm">
          <Icon icon={PencilIcon} size="sm" />
          Editar Información
        </Button>
      </Stack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
          {/* Business Information */}
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
              <Stack direction="column" gap="lg">
                {/* Main Business Info - More prominent */}
                <Stack direction="column" gap="sm">
                  <MetricCard
                    title="Negocio"
                    value={businessData.name}
                    subtitle={businessData.type}
                    icon={BuildingOfficeIcon}
                    colorPalette="blue"
                  />
                </Stack>
                
                {/* Contact Information */}
                <Stack direction="column" gap="md">
                  <Typography variant="subtitle" weight="semibold" color="text.muted">Contacto</Typography>
                  
                  <Stack direction="column" gap="sm">
                    {/* Address with icon */}
                    <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                      <Icon icon={MapPinIcon} size="md" color="blue.500" />
                      <Stack gap="xs">
                        <Typography variant="caption" color="text.secondary">Dirección</Typography>
                        <Typography variant="body" weight="medium">{businessData.address}</Typography>
                      </Stack>
                    </Stack>
                    
                    {/* Contact details in grid */}
                    <SimpleGrid columns={2} gap="sm">
                      <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                        <Icon icon={PhoneIcon} size="sm" color="green.500" />
                        <Stack gap="xs">
                          <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                          <Typography variant="body" weight="medium">{businessData.phone}</Typography>
                        </Stack>
                      </Stack>
                      
                      <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                        <Icon icon={EnvelopeIcon} size="sm" color="purple.500" />
                        <Stack gap="xs">
                          <Typography variant="caption" color="text.secondary">Email</Typography>
                          <Typography variant="body" weight="medium">{businessData.email}</Typography>
                        </Stack>
                      </Stack>
                    </SimpleGrid>
                    
                    {/* Website */}
                    <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                      <Icon icon={GlobeAltIcon} size="sm" color="orange.500" />
                      <Stack gap="xs">
                        <Typography variant="caption" color="text.secondary">Sitio Web</Typography>
                        <Typography variant="body" weight="medium" color="text.primary">{businessData.website}</Typography>
                      </Stack>
                      <ActionButton size="xs" colorPalette="gray">
                        Visitar
                      </ActionButton>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          {/* Operating Hours */}
          <CardWrapper variant="outline">
            <CardWrapper.Header>
              <Stack direction="row" justify="space-between" align="center">
                <CardWrapper.Title>Horarios de Operación</CardWrapper.Title>
                <Badge variant="subtle" colorPalette="blue">
                  <Icon icon={ClockIcon} size="xs" />
                  7 días
                </Badge>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <Stack direction="column" gap="md">
                {/* Quick Stats */}
                <SimpleGrid columns={2} gap="sm">
                  <MetricCard
                    title="Días Abierto"
                    value="6/7"
                    subtitle="días por semana"
                    icon={CheckCircleIcon}
                    colorPalette="green"
                    badge={{
                      value: "86%",
                      colorPalette: "green"
                    }}
                  />
                  <MetricCard
                    title="Horas Totales"
                    value="79h"
                    subtitle="por semana"
                    icon={ClockIcon}
                    colorPalette="blue"
                  />
                </SimpleGrid>
                
                {/* Daily Schedule */}
                <Stack direction="column" gap="xs">
                  <Typography variant="subtitle" weight="semibold" color="text.muted">Horario Semanal</Typography>
                  {operatingHours.map((schedule) => (
                    <Stack 
                      key={schedule.day} 
                      direction="row" 
                      justify="space-between" 
                      align="center"
                      p="sm"
                      bg={schedule.isOpen ? "green.50" : "bg.surface"}
                      borderRadius="md"
                      borderLeft="4px solid"
                      borderColor={schedule.isOpen ? "green.400" : "border.default"}
                    >
                      <Stack direction="row" align="center" gap="sm">
                        <Icon 
                          icon={schedule.isOpen ? CheckCircleIcon : ExclamationTriangleIcon} 
                          size="sm" 
                          color={schedule.isOpen ? "green.500" : "text.muted"}
                        />
                        <Typography variant="body" weight="medium">{schedule.day}</Typography>
                      </Stack>
                      <Stack direction="row" align="center" gap="sm">
                        <Typography 
                          variant="body" 
                          weight="medium"
                          color={schedule.isOpen ? "green.700" : "gray.500"}
                        >
                          {schedule.hours}
                        </Typography>
                        <Badge 
                          variant="solid" 
                          colorPalette={schedule.isOpen ? "green" : "gray"}
                          size="sm"
                        >
                          {schedule.isOpen ? "Abierto" : "Cerrado"}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
                
                {/* Quick Actions */}
                <Stack direction="row" gap="sm" mt="sm">
                  <ActionButton size="sm" colorPalette="blue" variant="outline">
                    <Icon icon={PencilIcon} size="xs" />
                    Editar Horarios
                  </ActionButton>
                  <ActionButton size="sm" colorPalette="gray" variant="ghost">
                    <Icon icon={InformationCircleIcon} size="xs" />
                    Ver Excepciones
                  </ActionButton>
                </Stack>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>
    </Section>
  );
}
