import React from 'react';
import {
  Stack,
  Box,
  Text,
  Heading,
  Circle,
  HStack,
  VStack,
  Wrap,
  WrapItem,
  Badge,
} from '@chakra-ui/react';
import {
  InformationCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

// Mapeo de capacidades a iconos y nombres amigables
const capabilityDisplayMap: Record<string, { icon: string; displayName: string; color: string }> = {
  sells_products: { icon: '📦', displayName: 'Vende Productos', color: 'blue' },
  sells_services: { icon: '🛠️', displayName: 'Vende Servicios', color: 'green' },
  manages_events: { icon: '🎉', displayName: 'Gestiona Eventos', color: 'purple' },
  manages_recurrence: { icon: '🔄', displayName: 'Ingresos Recurrentes', color: 'orange' },
  sells_products_for_onsite_consumption: { icon: '🍽️', displayName: 'Consumo Local', color: 'blue' },
  sells_products_for_pickup: { icon: '📋', displayName: 'Para Llevar', color: 'blue' },
  sells_products_with_delivery: { icon: '🚚', displayName: 'Delivery', color: 'blue' },
  sells_digital_products: { icon: '💻', displayName: 'Productos Digitales', color: 'blue' },
  sells_services_by_appointment: { icon: '📅', displayName: 'Por Cita', color: 'green' },
  sells_services_by_class: { icon: '👥', displayName: 'Clases Grupales', color: 'green' },
  sells_space_by_reservation: { icon: '🏢', displayName: 'Espacios', color: 'green' },
  hosts_private_events: { icon: '🎊', displayName: 'Eventos Privados', color: 'purple' },
  manages_offsite_catering: { icon: '🍾', displayName: 'Catering', color: 'purple' },
  manages_rentals: { icon: '🏠', displayName: 'Alquileres', color: 'orange' },
  manages_memberships: { icon: '🎫', displayName: 'Membresías', color: 'orange' },
  manages_subscriptions: { icon: '📱', displayName: 'Suscripciones', color: 'orange' },
  has_online_store: { icon: '🛒', displayName: 'Tienda Online', color: 'teal' },
  is_b2b_focused: { icon: '🏢', displayName: 'Enfoque B2B', color: 'gray' },
};

interface BusinessPreviewPanelProps {
  selectedCapabilities: string[];
  activeCapabilitiesCount: number;
  completedMilestones: string[];
}

export function BusinessPreviewPanel({
  selectedCapabilities,
  activeCapabilitiesCount,
  completedMilestones,
}: BusinessPreviewPanelProps) {

  const getConstellationTitle = (): string => {
    if (activeCapabilitiesCount === 0) {
      return 'Define tu ADN de Negocio';
    }
    if (activeCapabilitiesCount === 1) {
      return 'Tu Modelo de Negocio';
    }
    return 'Tu Constelación de Negocio';
  };

  const getConstellationSubtitle = (): string => {
    if (activeCapabilitiesCount === 0) {
      return 'Selecciona las capacidades que formarán el núcleo de tu negocio.';
    }
    if (activeCapabilitiesCount === 1) {
      return 'Has iniciado la definición de tu modelo único.';
    }
    return `${activeCapabilitiesCount} capacidades componen tu modelo único.`;
  };

  const showHelpBox = activeCapabilitiesCount === 0;

  return (
    <Stack gap={5} position="sticky" top="24px">
      {/* Main Business DNA Card */}
      <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md">
        <Box
          bg="gray.700"
          p={4}
          borderBottom="4px solid"
          borderColor="yellow.400"
        >
          <Text color="gray.50" fontSize="sm" fontWeight="medium">
            ADN del Negocio
          </Text>
        </Box>

        <VStack p={{ base: 4, md: 6 }} gap={4}>
          {/* Constellation Icon/Visual */}
          <Box position="relative">
            <Circle size="80px" bg="gray.100" color="gray.500">
              <StarIcon width={32} height={32} />
            </Circle>
            {activeCapabilitiesCount > 0 && (
              <Circle 
                size="24px" 
                bg="blue.500" 
                color="white" 
                position="absolute" 
                top="-2px" 
                right="-2px"
                fontSize="sm"
                fontWeight="bold"
              >
                {activeCapabilitiesCount}
              </Circle>
            )}
          </Box>

          <VStack textAlign="center" mt={2}>
            <Heading size="md" color="gray.800">
              {getConstellationTitle()}
            </Heading>
            <Text fontSize="sm" color="gray.600" maxW="80%">
              {getConstellationSubtitle()}
            </Text>
          </VStack>

          {/* Capabilities Constellation Display */}
          {selectedCapabilities.length > 0 && (
            <Box w="full" mt={4}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
                Capacidades Activas:
              </Text>
              <Wrap gap={2} justify="center">
                {selectedCapabilities.map((capability) => {
                  const display = capabilityDisplayMap[capability];
                  if (!display) return null;
                  
                  return (
                    <WrapItem key={capability}>
                      <Badge
                        colorScheme={display.color}
                        variant="subtle"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                      >
                        <HStack gap={1}>
                          <Text>{display.icon}</Text>
                          <Text>{display.displayName}</Text>
                        </HStack>
                      </Badge>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Help Box - Only shown when needed */}
      {showHelpBox && (
        <Box
          bg="blue.50"
          borderRadius="xl"
          p={4}
          borderWidth="1px"
          borderColor="blue.100"
        >
          <HStack gap={3} align="flex-start">
            <Circle size="32px" bg="blue.100" color="blue.600">
              <InformationCircleIcon width={16} height={16} />
            </Circle>
            <Stack gap={1}>
              <Text fontWeight="medium" fontSize="sm" color="blue.800">
                Construye tu Modelo Único
              </Text>
              <Text fontSize="sm" color="blue.700">
                Cada capacidad que selecciones se convertirá en parte del ADN de tu negocio. Puedes elegir múltiples capacidades que coexistirán en tu modelo.
              </Text>
            </Stack>
          </HStack>
        </Box>
      )}
    </Stack>
  );
}