/**
 * OnboardingGuide - Guía Interactiva de Activación de Capacidades
 * 
 * Reemplaza el MilestoneTracker con una experiencia gamificada que guía
 * a los usuarios a través de los hitos fundacionales para activar capacidades latentes.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Badge,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiCheckCircle, 
  FiCircle, 
  FiArrowRight, 
  FiStar,
  FiTarget,
  FiGift,
  FiTrendingUp,
  FiPlay
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAchievements } from '../hooks/useAchievements';
import { useBusinessProfile } from '@/store/businessCapabilitiesStore';
import { CAPABILITY_MILESTONE_CONFIG, getMilestoneDefinition } from '@/config/milestones';
import type { MilestoneDefinition } from '../types';

interface OnboardingGuideProps {
  userId?: string;
  compact?: boolean;
  showOnlyNext?: boolean;
  maxCapabilities?: number;
}

interface CapabilityCardProps {
  capabilityId: string;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Tarjeta individual de capacidad con sus hitos
 */
const CapabilityCard: React.FC<CapabilityCardProps> = ({ 
  capabilityId, 
  isExpanded, 
  onToggle 
}) => {
  const router = useRouter();
  const { 
    getCapabilityProgress, 
    getPendingMilestones,
    isCapabilityActive,
    getCompletionPercentage 
  } = useAchievements();
  
  const [pendingMilestones, setPendingMilestones] = useState<MilestoneDefinition[]>([]);
  
  // Configuración de capacidad
  const capabilityConfig = CAPABILITY_MILESTONE_CONFIG[capabilityId];
  const progress = getCapabilityProgress(capabilityId);
  const isActive = isCapabilityActive(capabilityId);
  const completion = getCompletionPercentage(capabilityId);
  
  // Cargar hitos pendientes
  useEffect(() => {
    if (isExpanded && !isActive) {
      getPendingMilestones(capabilityId).then(setPendingMilestones);
    }
  }, [isExpanded, isActive, capabilityId, getPendingMilestones]);

  // Colores del tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const progressBg = useColorModeValue('gray.100', 'gray.700');
  const activeBadgeColor = useColorModeValue('green', 'green');
  const pendingBadgeColor = useColorModeValue('orange', 'orange');

  /**
   * Maneja la navegación a una página específica para completar un hito
   */
  const handleMilestoneAction = (milestone: MilestoneDefinition) => {
    if (milestone.redirect_url) {
      router.push(milestone.redirect_url);
    }
  };

  if (!capabilityConfig) {
    return null;
  }

  return (
    <Card bg={cardBg} shadow="sm" borderWidth="1px">
      <CardBody p={4}>
        <VStack align="stretch" gap={3}>
          {/* Header de capacidad */}
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Icon as={FiTarget} boxSize={5} color={isActive ? 'green.500' : 'gray.400'} />
              <VStack align="start" gap={1}>
                <Text fontWeight="semibold" fontSize="md">
                  {capabilityConfig.name}
                </Text>
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  {capabilityConfig.description}
                </Text>
              </VStack>
            </HStack>
            
            <VStack align="end" gap={1}>
              <Badge 
                colorScheme={isActive ? activeBadgeColor : pendingBadgeColor}
                variant="subtle"
              >
                {isActive ? 'Activa' : 'Latente'}
              </Badge>
              {!isActive && (
                <Text fontSize="xs" color="gray.500">
                  {completion}% completado
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Barra de progreso */}
          {!isActive && (
            <Progress 
              value={completion} 
              colorScheme="blue" 
              bg={progressBg}
              borderRadius="full"
              height="8px"
            />
          )}

          {/* Estado activo o botón expandir */}
          {isActive ? (
            <HStack gap={2} justify="center" p={3} bg="green.50" borderRadius="md">
              <Icon as={FiCheckCircle} color="green.500" />
              <Text color="green.700" fontWeight="medium" fontSize="sm">
                ¡Capacidad activada! Ya puedes usar todas sus funcionalidades.
              </Text>
              <Icon as={FiGift} color="green.500" />
            </HStack>
          ) : (
            <Button
              variant={isExpanded ? "solid" : "outline"}
              colorScheme="blue"
              size="sm"
              onClick={onToggle}
              rightIcon={isExpanded ? undefined : <FiPlay />}
            >
              {isExpanded ? 'Ocultar hitos' : 'Ver hitos pendientes'}
            </Button>
          )}

          {/* Lista de hitos pendientes */}
          {isExpanded && !isActive && (
            <VStack align="stretch" gap={2} mt={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Hitos para activar esta capacidad:
              </Text>
              
              {pendingMilestones.map((milestone, index) => (
                <HStack
                  key={milestone.id}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                >
                  <HStack gap={3}>
                    <Icon 
                      as={FiCircle} 
                      boxSize={4} 
                      color="gray.400" 
                    />
                    <VStack align="start" gap={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {milestone.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {milestone.description}
                      </Text>
                      {milestone.estimated_minutes > 0 && (
                        <Text fontSize="xs" color="blue.600">
                          ~{milestone.estimated_minutes} min
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  
                  {milestone.redirect_url && (
                    <Tooltip label="Ir a completar este hito">
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="ghost"
                        rightIcon={<FiArrowRight />}
                        onClick={() => handleMilestoneAction(milestone)}
                      >
                        Completar
                      </Button>
                    </Tooltip>
                  )}
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Componente principal de la guía de activación
 */
export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  userId,
  compact = false,
  showOnlyNext = false,
  maxCapabilities = 6
}) => {
  const { selectedCapabilities } = useBusinessProfile();
  const { 
    progress,
    isLoading,
    error,
    totalCapabilities,
    activeCapabilities,
    overallProgress,
    refreshProgress
  } = useAchievements(userId);

  const [expandedCapabilities, setExpandedCapabilities] = useState<Set<string>>(new Set());

  // Manejar carga inicial
  useEffect(() => {
    if (userId) {
      refreshProgress();
    }
  }, [userId, refreshProgress]);

  /**
   * Alterna la expansión de una capacidad
   */
  const toggleExpanded = (capabilityId: string) => {
    setExpandedCapabilities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(capabilityId)) {
        newSet.delete(capabilityId);
      } else {
        newSet.add(capabilityId);
      }
      return newSet;
    });
  };

  // Filtrar capacidades a mostrar
  const capabilitiesToShow = showOnlyNext 
    ? selectedCapabilities
        .filter(cap => !progress.find(p => p.capabilityId === cap && p.isActive))
        .slice(0, 1)
    : selectedCapabilities.slice(0, maxCapabilities);

  // Estados de carga y error
  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <VStack gap={4}>
            <Icon as={FiTrendingUp} boxSize={8} color="blue.400" />
            <Text>Cargando tu progreso...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card borderColor="red.200">
        <CardBody>
          <VStack gap={3}>
            <Text color="red.600" fontWeight="medium">
              Error cargando progreso
            </Text>
            <Text fontSize="sm" color="gray.600">
              {error}
            </Text>
            <Button size="sm" onClick={refreshProgress}>
              Reintentar
            </Button>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      {/* Resumen de progreso */}
      {!compact && (
        <Card>
          <CardBody>
            <VStack gap={4}>
              <HStack justify="space-between" w="full">
                <VStack align="start" gap={1}>
                  <Text fontSize="lg" fontWeight="bold">
                    Progreso de Activación
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {activeCapabilities} de {totalCapabilities} capacidades activas
                  </Text>
                </VStack>
                
                <VStack align="end" gap={1}>
                  <HStack gap={2}>
                    <Icon as={FiStar} color="yellow.400" />
                    <Text fontWeight="bold" fontSize="lg">
                      {overallProgress}%
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    completado
                  </Text>
                </VStack>
              </HStack>
              
              <Progress 
                value={overallProgress} 
                colorScheme="green" 
                bg="gray.100"
                borderRadius="full"
                height="12px"
              />
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Lista de capacidades */}
      <VStack align="stretch" gap={3}>
        {capabilitiesToShow.length === 0 ? (
          <Card>
            <CardBody>
              <VStack gap={3}>
                <Icon as={FiTarget} boxSize={8} color="gray.400" />
                <Text color="gray.600">
                  No tienes capacidades seleccionadas para activar
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          capabilitiesToShow.map(capabilityId => (
            <CapabilityCard
              key={capabilityId}
              capabilityId={capabilityId}
              isExpanded={expandedCapabilities.has(capabilityId)}
              onToggle={() => toggleExpanded(capabilityId)}
            />
          ))
        )}
      </VStack>

      {/* Mensaje de motivación */}
      {!compact && activeCapabilities < totalCapabilities && (
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody>
            <HStack gap={3}>
              <Icon as={FiTrendingUp} color="blue.500" boxSize={5} />
              <VStack align="start" gap={1}>
                <Text fontWeight="medium" color="blue.700">
                  ¡Sigue activando capacidades!
                </Text>
                <Text fontSize="sm" color="blue.600">
                  Completa los hitos para desbloquear nuevas funcionalidades en tu sistema.
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default OnboardingGuide;