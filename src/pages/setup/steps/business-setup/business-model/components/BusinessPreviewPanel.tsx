import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stack,
  Box,
  Text,
  Heading,
  Circle,
  Tag,
  Flex,
  HStack,
  Badge,
  VStack,
} from '@chakra-ui/react';
import {
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { BusinessCapabilities, BusinessStructure } from '../config/businessCapabilities';

interface BusinessPreviewPanelProps {
  operationalTier: string;
  tierColor: string;
  tierDescription: string;
  insightMessage: string | null;
  mainOffersCount: number;
  capabilities: BusinessCapabilities;
  businessStructure: BusinessStructure;
}

export function BusinessPreviewPanel({
  operationalTier,
  tierColor,
  tierDescription,
  insightMessage,
  mainOffersCount,
  capabilities,
  businessStructure,
}: BusinessPreviewPanelProps) {
  // Get full tier data based on operational tier
  const tierData = getTierData(operationalTier);
  const complexityScore = calculateComplexityScore(capabilities, businessStructure);
  const selectedMainCapabilities = getSelectedMainCapabilities(capabilities);
  const businessSummary = getBusinessSummary(capabilities, businessStructure);
  
  return (
    <Stack gap={4} position="sticky" top="20px">
      {/* Main Tier Card */}
      <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md">
        {/* Header */}
        <Box bg={tierData.headerGradient} p={4} position="relative" overflow="hidden">
          {/* Animated background pattern */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            opacity="0.1"
            bgImage={`url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`}
          />
          <Flex justify="space-between" align="center">
            <Text color="gray.50" fontSize="sm" fontWeight="medium">
              Clasificación de Negocio
            </Text>
            <Tag.Root size="sm" variant="subtle" colorPalette="blue">
              <Tag.StartElement>
                <ArrowTrendingUpIcon width="10px" height="10px" />
              </Tag.StartElement>
              <Tag.Label fontSize="xs">
                Complejidad {complexityScore}/10
              </Tag.Label>
            </Tag.Root>
          </Flex>
        </Box>

        {/* Tier Information */}
        <Box p={5} textAlign="center">
          <AnimatePresence mode="wait">
            <motion.div
              key={operationalTier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VStack gap={4}>
                <Circle
                  size="60px"
                  bg={tierData.iconBg}
                  color={tierData.iconColor}
                  fontSize="2xl"
                >
                  {tierData.icon}
                </Circle>
                <Stack gap={1}>
                  <Heading size="md" fontWeight="semibold" color={tierData.titleColor}>
                    {tierData.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {tierData.description}
                  </Text>
                </Stack>
                {/* Features Tags */}
                <Flex wrap="wrap" justify="center" gap={2}>
                  {tierData.features.map((feature, index) => (
                    <Tag.Root
                      key={index}
                      size="sm"
                      borderRadius="full"
                      variant="subtle"
                      colorPalette={tierData.colorScheme}
                    >
                      <Tag.Label fontSize="xs">{feature}</Tag.Label>
                    </Tag.Root>
                  ))}
                </Flex>
              </VStack>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Selected Capabilities Quick View */}
      {selectedMainCapabilities.length > 0 && (
        <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md" p={4}>
          <Text fontWeight="medium" fontSize="sm" mb={3} color="gray.700">
            Capacidades Seleccionadas
          </Text>
          <Flex wrap="wrap" gap={2}>
            {selectedMainCapabilities.map((capability, index) => (
              <Badge
                key={index}
                variant="subtle"
                colorPalette="gray"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                {capability}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}

      {/* Business Summary */}
      {businessSummary.length > 0 && (
        <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md">
          <Box p={4} borderBottom="1px solid" borderColor="gray.200">
            <HStack>
              <InformationCircleIcon width={16} height={16} color="gray.600" />
              <Text fontWeight="medium" fontSize="sm">
                Resumen de tu Negocio
              </Text>
            </HStack>
          </Box>
          <Box p={4}>
            <Stack gap={3}>
              {businessSummary.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HStack align="flex-start" gap={3}>
                    <Circle
                      size="24px"
                      bg="gray.100"
                      color="gray.600"
                    >
                      <Text fontSize="xs" fontWeight="bold">
                        {index + 1}
                      </Text>
                    </Circle>
                    <Text fontSize="sm">{item}</Text>
                  </HStack>
                </motion.div>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* Business Insight */}
      {insightMessage && (
        <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md" p={4}>
          <HStack gap={3} align="flex-start">
            <Circle size="36px" bg="gray.200" color="gray.600">
              <ComputerDesktopIcon width={16} height={16} />
            </Circle>
            <Stack gap={1}>
              <Text fontWeight="medium" fontSize="sm">
                Insight de Negocio
              </Text>
              <Text fontSize="sm" color="gray.600">
                {insightMessage}
              </Text>
            </Stack>
          </HStack>
        </Box>
      )}

      {/* Help Box - Only shown when needed */}
      {operationalTier === 'Sin Configurar' && (
        <Box
          bg="gray.100"
          borderRadius="xl"
          p={4}
          borderWidth="1px"
          borderColor="gray.200"
        >
          <HStack gap={3} align="flex-start">
            <Circle size="32px" bg="gray.200" color="gray.600">
              <InformationCircleIcon width={16} height={16} />
            </Circle>
            <Stack gap={1}>
              <Text fontWeight="medium" fontSize="sm" color="gray.700">
                Para continuar
              </Text>
              <Text fontSize="sm" color="gray.600">
                Selecciona al menos una actividad principal para tu negocio.
              </Text>
            </Stack>
          </HStack>
        </Box>
      )}
    </Stack>
  );
}

// Helper function to get tier data with business icons and styling
function getTierData(tier: string) {
  const tiers = {
    'Base Operativa': {
      title: 'Base Operativa',
      description: 'Negocio con una actividad principal bien definida',
      icon: '🌱',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'green',
      features: ['Flujo simple', 'Gestión básica', 'Reportes esenciales'],
    },
    'Estructura Funcional': {
      title: 'Estructura Funcional',
      description: 'Negocio con múltiples canales o actividades',
      icon: '🏗️',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'blue',
      features: ['Multi-canal', 'Dashboard avanzado', 'Integraciones básicas'],
    },
    'Negocio Integrado': {
      title: 'Negocio Integrado',
      description: 'Operación compleja con varias líneas de negocio',
      icon: '🏢',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'purple',
      features: ['Multi-línea', 'Automatizaciones', 'Analytics avanzado'],
    },
    'Negocio Digital': {
      title: 'Negocio Digital',
      description: 'Enfoque digital con productos/servicios online',
      icon: '💻',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'cyan',
      features: ['E-commerce', 'Suscripciones', 'Automatización total'],
    },
    'Centro de Experiencias': {
      title: 'Centro de Experiencias',
      description: 'Negocio centrado en eventos y experiencias',
      icon: '🎭',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'orange',
      features: ['Gestión de eventos', 'Reservas', 'Experiencia de cliente'],
    },
    'Sistema Consolidado': {
      title: 'Sistema Consolidado',
      description: 'Operación empresarial de máxima complejidad',
      icon: '🏭',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'red',
      features: ['Multi-sucursal', 'Enterprise', 'Business Intelligence'],
    },
    'Sin Configurar': {
      title: 'Sin Configurar',
      description: 'Selecciona tus actividades para ver tu clasificación',
      icon: '⚙️',
      iconBg: 'gray.100',
      iconColor: 'gray.600',
      titleColor: 'gray.600',
      headerGradient: 'gray.600',
      colorScheme: 'gray',
      features: ['Pendiente', 'Configuración inicial'],
    },
  }
  return tiers[tier] || tiers['Sin Configurar']
}

// Helper function to get selected main capabilities with emojis
function getSelectedMainCapabilities(capabilities: BusinessCapabilities): string[] {
  const selected = []
  if (capabilities.sells_products) selected.push('📦 Productos')
  if (capabilities.sells_services) selected.push('⏰ Servicios')
  if (capabilities.manages_events) selected.push('🎉 Eventos')
  if (capabilities.manages_recurrence) selected.push('🔄 Activos')
  if (capabilities.has_online_store) selected.push('🛒 Online')
  if (capabilities.is_b2b_focused) selected.push('🏢 B2B')
  return selected
}

// Helper function to calculate complexity score
function calculateComplexityScore(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure,
): number {
  let score = 0
  
  const mainCapabilities = [
    capabilities.sells_products,
    capabilities.sells_services,
    capabilities.manages_events,
    capabilities.manages_recurrence,
  ].filter(Boolean).length

  const subCapabilities = [
    capabilities.sells_products_for_onsite_consumption,
    capabilities.sells_products_for_pickup,
    capabilities.sells_products_with_delivery,
    capabilities.sells_digital_products,
    capabilities.sells_services_by_appointment,
    capabilities.sells_services_by_class,
    capabilities.sells_space_by_reservation,
    capabilities.manages_offsite_catering,
    capabilities.hosts_private_events,
    capabilities.manages_rentals,
    capabilities.manages_memberships,
    capabilities.manages_subscriptions,
  ].filter(Boolean).length

  score += mainCapabilities * 1.5
  score += subCapabilities * 0.5

  if (capabilities.has_online_store) score += 1
  if (capabilities.is_b2b_focused) score += 1

  if (businessStructure === 'multi_location') score += 2
  else if (businessStructure === 'mobile') score += 1

  score = Math.min(Math.max(Math.round(score), 1), 10)
  return score
}

// Helper function to get business summary
function getBusinessSummary(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure,
): string[] {
  const summary = []
  
  if (capabilities.sells_products) {
    const productTypes = []
    if (capabilities.sells_products_for_onsite_consumption) productTypes.push('consumo en local')
    if (capabilities.sells_products_for_pickup) productTypes.push('retiro en tienda')
    if (capabilities.sells_products_with_delivery) productTypes.push('delivery')
    if (capabilities.sells_digital_products) productTypes.push('digitales')
    
    if (productTypes.length > 0) {
      summary.push(`Venta de productos ${productTypes.join(', ')}.`)
    } else {
      summary.push('Venta de productos.')
    }
  }

  if (capabilities.sells_services) {
    const serviceTypes = []
    if (capabilities.sells_services_by_appointment) serviceTypes.push('citas/turnos')
    if (capabilities.sells_services_by_class) serviceTypes.push('clases grupales')
    if (capabilities.sells_space_by_reservation) serviceTypes.push('reserva de espacios')
    
    if (serviceTypes.length > 0) {
      summary.push(`Servicios con ${serviceTypes.join(', ')}.`)
    } else {
      summary.push('Prestación de servicios.')
    }
  }

  if (capabilities.manages_events) {
    const eventTypes = []
    if (capabilities.manages_offsite_catering) eventTypes.push('catering externo')
    if (capabilities.hosts_private_events) eventTypes.push('eventos en local')
    
    if (eventTypes.length > 0) {
      summary.push(`Organización de ${eventTypes.join(' y ')}.`)
    } else {
      summary.push('Gestión de eventos.')
    }
  }

  if (capabilities.manages_recurrence) {
    const recurrenceTypes = []
    if (capabilities.manages_rentals) recurrenceTypes.push('alquileres')
    if (capabilities.manages_memberships) recurrenceTypes.push('membresías')
    if (capabilities.manages_subscriptions) recurrenceTypes.push('suscripciones')
    
    if (recurrenceTypes.length > 0) {
      summary.push(`Gestión de ${recurrenceTypes.join(', ')}.`)
    } else {
      summary.push('Gestión de activos recurrentes.')
    }
  }

  const channelsAndStructure = []
  if (capabilities.has_online_store) channelsAndStructure.push('tienda online')
  if (capabilities.is_b2b_focused) channelsAndStructure.push('enfoque B2B')

  const structureText = {
    single_location: 'local único',
    multi_location: 'múltiples locales',
    mobile: 'negocio móvil',
  }

  if (channelsAndStructure.length > 0) {
    summary.push(
      `Operación con ${channelsAndStructure.join(' y ')} en ${structureText[businessStructure]}.`,
    )
  } else {
    summary.push(`Operación en ${structureText[businessStructure]}.`)
  }

  return summary
}