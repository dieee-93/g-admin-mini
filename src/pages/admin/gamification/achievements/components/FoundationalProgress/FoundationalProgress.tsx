/**
 * FoundationalProgress - Vista de Progreso de Hitos Fundacionales
 * 
 * Muestra las capacidades del negocio y su estado de activación
 * mediante el progreso de hitos completados
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  SimpleGrid,
  Badge,
  Progress
} from '@chakra-ui/react';

interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

interface FoundationalCapability {
  capabilityId: string;
  capabilityName: string;
  status: 'active' | 'activating' | 'latent';
  completedMilestones: number;
  totalMilestones: number;
  progress: number;
  milestones: Milestone[];
}

interface FoundationalProgressProps {
  foundationalProgress: FoundationalCapability[];
  cardBg: string;
  cardBorder: string;
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'active': return { bg: 'green.500', glow: 'rgba(34, 197, 94, 0.4)' };
    case 'activating': return { bg: 'yellow.500', glow: 'rgba(234, 179, 8, 0.4)' };
    case 'latent': return { bg: 'gray.500', glow: 'rgba(107, 114, 128, 0.4)' };
    default: return { bg: 'purple.500', glow: 'rgba(139, 92, 246, 0.4)' };
  }
};

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'active': return '✅';
    case 'activating': return '⚡';
    case 'latent': return '💤';
    default: return '🌟';
  }
};

export const FoundationalProgress: React.FC<FoundationalProgressProps> = ({
  foundationalProgress,
  cardBg,
  cardBorder
}) => {
  return (
    <VStack gap="8" align="stretch">
      <Text fontSize="2xl" fontWeight="semibold" textAlign="center" color="white">
        🧬 ADN de tu Negocio - Activación por Hitos
      </Text>
      
      {/* Galaxia de Capacidades - Grid cósmico */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="8">
        {foundationalProgress.map((capability) => {
          // Validación y valores por defecto
          const safeCapability = {
            capabilityId: capability?.capabilityId || 'unknown',
            capabilityName: capability?.capabilityName || 'Capacidad Desconocida',
            status: capability?.status || 'latent',
            completedMilestones: capability?.completedMilestones || 0,
            totalMilestones: capability?.totalMilestones || 1,
            progress: capability?.progress || 0,
            milestones: capability?.milestones || []
          };

          const statusInfo = getStatusColor(safeCapability.status);

          return (
            <Box
              key={safeCapability.capabilityId}
              p="6"
              bg={cardBg}
              border="2px solid"
              borderColor={statusInfo.bg}
              borderRadius="2xl"
              position="relative"
              cursor="pointer"
              transition="all 0.4s ease"
              _hover={{
                transform: "translateY(-8px) scale(1.02)",
                boxShadow: `0 20px 40px ${statusInfo.glow}`,
                borderColor: statusInfo.bg,
              }}
            >
              {/* Efecto de resplandor de estado */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="200px"
                height="200px"
                bgGradient={`radial(${statusInfo.bg}, transparent)`}
                opacity={0.2}
                filter="blur(40px)"
                zIndex={0}
              />
              
              <VStack gap="4" position="relative" zIndex={1}>
                {/* Header con estado */}
                <HStack justify="space-between" width="100%">
                  <Text fontSize="2xl">
                    {getStatusIcon(safeCapability.status)}
                  </Text>
                  <Badge 
                    colorPalette={safeCapability.status === 'active' ? 'green' : 
                                 safeCapability.status === 'activating' ? 'yellow' : 'gray'}
                    size="sm"
                  >
                    {safeCapability.status.toUpperCase()}
                  </Badge>
                </HStack>
                
                {/* Nombre de la capacidad */}
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="white"
                  textAlign="center"
                  textShadow="0 0 10px rgba(255, 255, 255, 0.3)"
                >
                  {safeCapability.capabilityName}
                </Text>
                
                {/* Progreso de hitos */}
                <Box width="100%">
                  <HStack justify="space-between" mb="2">
                    <Text fontSize="sm" color="gray.400">
                      Progreso de Hitos
                    </Text>
                    <Text fontSize="sm" color="white" fontWeight="medium">
                      {safeCapability.completedMilestones}/{safeCapability.totalMilestones}
                    </Text>
                  </HStack>
                  
                  <Progress.Root
                    value={safeCapability.progress}
                    size="md"
                    colorPalette={safeCapability.status === 'active' ? 'green' : 
                                 safeCapability.status === 'activating' ? 'yellow' : 'gray'}
                  >
                    <Progress.Track bg="rgba(255, 255, 255, 0.1)">
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                  
                  <Text fontSize="xs" color="gray.500" textAlign="center" mt="1">
                    {safeCapability.progress}% completado
                  </Text>
                </Box>
                
                {/* Lista de hitos (máximo 3 visibles) */}
                <VStack gap="2" width="100%" align="stretch">
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    Próximos Hitos
                  </Text>
                  {safeCapability.milestones?.slice(0, 3).map((milestone: Milestone) => (
                    <HStack key={milestone?.id || Math.random()} gap="2">
                      <Text fontSize="xs" color={milestone?.completed ? 'green.400' : 'gray.500'}>
                        {milestone?.completed ? '✓' : '○'}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color={milestone?.completed ? 'green.200' : 'gray.400'}
                        textDecoration={milestone?.completed ? 'line-through' : 'none'}
                      >
                        {milestone?.name || 'Hito sin nombre'}
                      </Text>
                    </HStack>
                  ))}
                  {safeCapability.milestones?.length > 3 && (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      +{safeCapability.milestones.length - 3} hitos más...
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
};