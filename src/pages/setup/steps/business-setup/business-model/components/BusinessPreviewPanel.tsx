import React from 'react';
import {
  Stack,
  Box,
  Text,
  Heading,
  Circle,
  HStack,
  VStack,
} from '@chakra-ui/react';
import {
  InformationCircleIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { BusinessConstellation } from './constellation/BusinessConstellation';
import { operationalProfileMilestones } from '@/config/milestones';

interface BusinessPreviewPanelProps {
  archetype: string;
  operationalProfile: string[];
  insightMessage: string | null;
  completedMilestones: string[];
}

const profileIcons = {
  'E-commerce Asincrónico': '🛒',
  'Canal Digital Sincrónico': '🌐',
  'Enfoque B2B': '🤝',
  'Multi-Sucursal': '🏬',
  'Móvil / Nómada': '🚚',
  'Escala Local': '🏠',
};

export function BusinessPreviewPanel({
  archetype,
  operationalProfile,
  insightMessage,
  completedMilestones,
}: BusinessPreviewPanelProps) {

  const profileWithStatus = operationalProfile.map(profileName => {
    const milestoneId = operationalProfileMilestones[profileName];
    return {
      name: profileName,
      isUnlocked: completedMilestones.includes(milestoneId) || !milestoneId,
      icon: profileIcons[profileName] || '🪐',
    };
  });

  const scale = operationalProfile.find(p => p.includes('Escala') || p.includes('Multi') || p.includes('Móvil'));
  const dynamicTitle = `${archetype} de ${scale || 'Escala Local'}`;

  return (
    <Stack gap={5} position="sticky" top="24px">
      {/* Main Identity CardWrapper  */}
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
          <BusinessConstellation
            archetype={archetype}
            operationalProfile={profileWithStatus}
          />
          <VStack textAlign="center" mt={2}>
            <Heading size="md" color="gray.800">{dynamicTitle}</Heading>
            <Text fontSize="sm" color="gray.600" maxW="80%">
              Esta es la constelación que representa tu negocio.
            </Text>
          </VStack>
        </VStack>
      </Box>

      {/* Business Insight */}
      {insightMessage && (
        <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md" p={4}>
          <HStack gap={3} align="flex-start">
            <Circle size="36px" bg="gray.200" color="gray.600">
              <ComputerDesktopIcon width={16} height={16} />
            </Circle>
            <Stack gap={1}>
              <Text fontWeight="medium" fontSize="sm" color="gray.800">
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
                Define tu Arquetipo
              </Text>
              <Text fontSize="sm" color="blue.700">
                Selecciona al menos una actividad principal para revelar el núcleo de tu negocio.
              </Text>
            </Stack>
          </HStack>
        </Box>
      )}
    </Stack>
  );
}