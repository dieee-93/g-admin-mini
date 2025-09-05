import React from 'react';
import {
  Stack,
  Box,
  Text,
  Heading,
  Circle,
  Tag,
  HStack,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import {
  InformationCircleIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, LockIcon } from '@chakra-ui/icons';
import { BusinessCapabilities, BusinessStructure } from '../config/businessCapabilities';

interface BusinessPreviewPanelProps {
  archetype: string;
  operationalProfile: string[];
  insightMessage: string | null;
  capabilities: BusinessCapabilities;
  businessStructure: BusinessStructure;
  completedMilestones: string[];
}

const profileBadgesConfig = {
  'E-commerce Asincrónico': { icon: '🛒', milestone: 'setup_ecommerce' },
  'Canal Digital Sincrónico': { icon: '🌐', milestone: 'setup_delivery' },
  'Enfoque B2B': { icon: '🏢', milestone: 'setup_b2b_billing' },
  'Multi-Sucursal': { icon: '🏢', milestone: 'setup_multi_location' },
  'Móvil': { icon: '🚚', milestone: 'setup_mobile_business' },
  'Local Único': { icon: '🏠', milestone: 'setup_single_location' },
};

export function BusinessPreviewPanel({
  archetype,
  operationalProfile,
  insightMessage,
  capabilities,
  businessStructure,
  completedMilestones,
}: BusinessPreviewPanelProps) {
  const scale = operationalProfile.find(p => p.includes('Local') || p.includes('Multi') || p.includes('Móvil'));
  const dynamicTitle = `${archetype} de ${scale || 'Escala Local'}`;

  return (
    <Stack gap={4} position="sticky" top="20px">
      {/* Main Identity Card */}
      <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md">
        <Box bg="gray.700" p={4}>
          <Text color="gray.50" fontSize="sm" fontWeight="medium">
            ADN del Negocio
          </Text>
        </Box>

        <Box p={5}>
          <VStack gap={4}>
            <Circle
              size="60px"
              bg="gray.100"
              color="gray.700"
              fontSize="2xl"
            >
              🧬
            </Circle>
            <Stack gap={1} textAlign="center">
              <Heading size="lg">{dynamicTitle}</Heading>
              <Text fontSize="sm" color="gray.600">
                Este es el ADN de tu negocio, basado en tus selecciones.
              </Text>
            </Stack>
          </VStack>
        </Box>
      </Box>

      {/* Operational Profile */}
      <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md" p={4}>
        <Text fontWeight="medium" fontSize="sm" mb={3} color="gray.700">
          Perfil Operativo:
        </Text>
        <Wrap spacing={2} mt={2}>
          {operationalProfile.map(profile => {
            const config = profileBadgesConfig[profile];
            const isUnlocked = completedMilestones.includes(config?.milestone);

            return (
              <Tag colorScheme={isUnlocked ? 'green' : 'gray'} key={profile}>
                {config?.icon} {profile}
                {isUnlocked ? <CheckCircleIcon ml={2} /> : <LockIcon ml={2} />}
              </Tag>
            );
          })}
        </Wrap>
      </Box>

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
      {archetype === 'Negocio' && (
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