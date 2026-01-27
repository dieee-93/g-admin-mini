/**
 * REQUIREMENTS & ACHIEVEMENTS PAGE
 *
 * Página dedicada para visualizar y completar requirements del sistema.
 * Integrada con Module Registry y Achievements System.
 *
 * CARACTERÍSTICAS:
 * - Vista de progreso por capability
 * - Checklist de requirements MANDATORY
 * - Enlaces directos a configuración
 * - Filtros por capability
 *
 * @version 1.0.0 - Integration with Achievements System
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Section,
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Stack,
  SkipLink
} from '@/shared/ui';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { useCapabilities } from '@/lib/capabilities';
import { useValidationContext } from '@/hooks';
import { ModuleRegistry } from '@/lib/modules';
import type { CapabilityProgress, Requirement } from '@/modules/achievements/types';
import type { BusinessCapabilityId } from '@/config/types';

/**
 * Capability Names Mapping
 */
const CAPABILITY_NAMES: Record<BusinessCapabilityId, string> = {
  onsite_service: 'Dine-In (Servicio en Mesas)',
  pickup_counter: 'TakeAway (Para Llevar)',
  async_operations: 'Operaciones Asíncronas',
  delivery_shipping: 'Delivery (Envíos a Domicilio)',
  corporate_sales: 'B2B (Ventas Corporativas)',
  manufacturing: 'Producción Industrial',
  rental_service: 'Alquiler de Equipos',
  membership_service: 'Membresías y Suscripciones',
  event_hosting: 'Organización de Eventos',
  consultation_service: 'Servicios de Consultoría'
};

/**
 * Main Page Component
 */
export default function RequirementsAchievementsPage() {
  const { activeCapabilities } = useCapabilities();
  const context = useValidationContext();
  const registry = useMemo(() => ModuleRegistry.getInstance(), []);
  const navigate = useNavigate();

  // Filter state
  const [selectedCapability, setSelectedCapability] = useState<BusinessCapabilityId | 'all'>('all');

  // Get progress for all active capabilities
  const capabilitiesProgress: CapabilityProgress[] = useMemo(() => {
    if (activeCapabilities.length === 0) {
      return [];
    }

    return activeCapabilities
      .map((capability) => {
        const results = registry.doAction('achievements.get_progress', {
          capability,
          context,
        });
        return results[0] as CapabilityProgress;
      })
      .filter(Boolean);
  }, [activeCapabilities.length, registry]);

  // Calculate global progress
  const globalProgress = useMemo(() => {
    const total = capabilitiesProgress.reduce((sum, cp) => sum + cp.total, 0);
    const completed = capabilitiesProgress.reduce((sum, cp) => sum + cp.completed, 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [capabilitiesProgress]);

  // Filter progress by selected capability
  const filteredProgress = useMemo(() => {
    if (selectedCapability === 'all') {
      return capabilitiesProgress;
    }
    return capabilitiesProgress.filter(cp => cp.capability === selectedCapability);
  }, [capabilitiesProgress, selectedCapability]);

  return (
    <>
      <SkipLink />

      <ContentLayout spacing="normal" mainLabel="Requirements & Achievements">
        {/* HEADER */}
        <Section
          variant="flat"
          title="Configuración del Sistema"
          subtitle="Completa estos pasos para comenzar a operar comercialmente"
          semanticHeading="Requirements and Business Setup Progress"
        />

        {/* GLOBAL PROGRESS */}
        <Section variant="elevated">
          <VStack align="start" gap="4" w="full">
            <HStack justify="space-between" w="full">
              <Heading size="md">Progreso Global</Heading>
              <Badge
                colorPalette={globalProgress.percentage === 100 ? 'green' : 'orange'}
                size="lg"
              >
                {globalProgress.completed} / {globalProgress.total} completados
              </Badge>
            </HStack>

            {/* Progress Bar */}
            <Box w="full">
              <Box
                h="12px"
                w="full"
                bg="gray.200"
                borderRadius="full"
                overflow="hidden"
                _dark={{ bg: 'gray.700' }}
              >
                <Box
                  h="full"
                  w={`${globalProgress.percentage}%`}
                  bg={globalProgress.percentage === 100 ? 'green.500' : 'orange.500'}
                  transition="width 0.5s"
                />
              </Box>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} mt={2}>
                {globalProgress.percentage}% completado
              </Text>
            </Box>

            {globalProgress.percentage === 100 && (
              <Box
                w="full"
                p="4"
                bg="green.50"
                borderRadius="md"
                border="2px solid"
                borderColor="green.200"
                _dark={{ bg: 'green.900/20', borderColor: 'green.700' }}
              >
                <HStack gap="2">
                  <Text fontSize="2xl">✅</Text>
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="bold" color="green.700" _dark={{ color: 'green.300' }}>
                      ¡Configuración Completa!
                    </Text>
                    <Text fontSize="xs" color="green.600" _dark={{ color: 'green.400' }}>
                      Tu negocio está listo para operar comercialmente
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}
          </VStack>
        </Section>

        {/* FILTERS */}
        <Section variant="flat">
          <VStack align="start" gap="3" w="full">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }}>
              Filtrar por Capability:
            </Text>
            <HStack wrap="wrap" gap="2">
              <Button
                size="sm"
                variant={selectedCapability === 'all' ? 'solid' : 'outline'}
                colorPalette={selectedCapability === 'all' ? 'blue' : 'gray'}
                onClick={() => setSelectedCapability('all')}
              >
                Todas ({capabilitiesProgress.length})
              </Button>
              {activeCapabilities.map(capability => (
                <Button
                  key={capability}
                  size="sm"
                  variant={selectedCapability === capability ? 'solid' : 'outline'}
                  colorPalette={selectedCapability === capability ? 'blue' : 'gray'}
                  onClick={() => setSelectedCapability(capability)}
                >
                  {CAPABILITY_NAMES[capability] || capability}
                </Button>
              ))}
            </HStack>
          </VStack>
        </Section>

        {/* CAPABILITIES LIST */}
        <Section variant="flat">
          <VStack gap="4" w="full">
            {filteredProgress.length === 0 ? (
              <Box p="8" textAlign="center">
                <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                  No hay capabilities activas. Activa capabilities desde la configuración del negocio.
                </Text>
              </Box>
            ) : (
              filteredProgress.map(progress => (
                <CapabilityCard
                  key={progress.capability}
                  progress={progress}
                  onNavigate={navigate}
                />
              ))
            )}
          </VStack>
        </Section>
      </ContentLayout>
    </>
  );
}

/**
 * Capability Card Component
 */
interface CapabilityCardProps {
  progress: CapabilityProgress;
  onNavigate: (url: string) => void;
}

function CapabilityCard({ progress, onNavigate }: CapabilityCardProps) {
  const { capability, total, completed, percentage, missing } = progress;
  const isComplete = percentage === 100;

  return (
    <Box
      w="full"
      p="5"
      bg={isComplete ? 'green.50' : 'white'}
      borderRadius="lg"
      border="2px solid"
      borderColor={isComplete ? 'green.200' : 'gray.200'}
      _dark={{
        bg: isComplete ? 'green.900/20' : 'gray.800',
        borderColor: isComplete ? 'green.700' : 'gray.700'
      }}
    >
      <VStack align="start" gap="4" w="full">
        {/* Header */}
        <HStack justify="space-between" w="full">
          <VStack align="start" gap="1">
            <Text fontSize="lg" fontWeight="bold" color="gray.800" _dark={{ color: 'gray.200' }}>
              {CAPABILITY_NAMES[capability] || capability}
            </Text>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              {completed} de {total} configuraciones completadas
            </Text>
          </VStack>

          <Badge
            colorPalette={isComplete ? 'green' : 'orange'}
            size="lg"
          >
            {isComplete ? '✓ Listo' : `${percentage}%`}
          </Badge>
        </HStack>

        {/* Progress Bar */}
        <Box w="full">
          <Box
            h="8px"
            w="full"
            bg="gray.200"
            borderRadius="full"
            overflow="hidden"
            _dark={{ bg: 'gray.700' }}
          >
            <Box
              h="full"
              w={`${percentage}%`}
              bg={isComplete ? 'green.500' : 'orange.500'}
              transition="width 0.3s"
            />
          </Box>
        </Box>

        {/* Missing Requirements List */}
        {!isComplete && missing && missing.length > 0 && (
          <VStack align="start" gap="2" w="full">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }}>
              Pasos Pendientes:
            </Text>
            {missing.map(req => (
              <RequirementItem
                key={req.id}
                requirement={req}
                onNavigate={onNavigate}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

/**
 * Requirement Item Component
 */
interface RequirementItemProps {
  requirement: Requirement;
  onNavigate: (url: string) => void;
}

function RequirementItem({ requirement, onNavigate }: RequirementItemProps) {
  return (
    <HStack
      w="full"
      p="3"
      bg="white"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      _dark={{ bg: 'gray.900', borderColor: 'gray.700' }}
      justify="space-between"
      _hover={{
        borderColor: 'blue.300',
        _dark: { borderColor: 'blue.600' }
      }}
      cursor="pointer"
      onClick={() => requirement.redirectUrl && onNavigate(requirement.redirectUrl)}
    >
      <HStack gap="3">
        <Text fontSize="xl">{requirement.icon}</Text>
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="medium" color="gray.800" _dark={{ color: 'gray.200' }}>
            {requirement.name}
          </Text>
          {requirement.description && (
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              {requirement.description}
            </Text>
          )}
          {requirement.estimatedMinutes && (
            <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>
              ~{requirement.estimatedMinutes} minutos
            </Text>
          )}
        </VStack>
      </HStack>

      {requirement.redirectUrl && (
        <Icon icon={ChevronRightIcon} size="sm" color="gray.400" />
      )}
    </HStack>
  );
}
