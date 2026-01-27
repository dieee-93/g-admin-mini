/**
 * ACHIEVEMENTS PAGE - Modern Redesign
 *
 * Página de logros y configuración del sistema.
 * Usa achievementsStore directamente (Unified Architecture v2.0).
 *
 * CARACTERÍSTICAS:
 * - ✅ Hero con progress ring global
 * - ✅ Filtros por capability
 * - ✅ Cards modernas con gradientes
 * - ✅ Requirements con links directos
 * - ✅ Animaciones sutiles
 *
 * @version 2.0.0 - Unified Architecture + Modern Design
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
  SkipLink,
  SimpleGrid,
  Progress,
  Icon,
  CircularProgress,
} from '@/shared/ui';
import {
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useValidationContext } from '@/hooks';
import { useBusinessProfile } from '@/lib/capabilities';
import { useAchievementsStore } from '@/modules/achievements/store/achievementsStore';
import { BUSINESS_CAPABILITIES_REGISTRY } from '@/config/BusinessModelRegistry';
import type { CapabilityProgress, Requirement } from '@/modules/achievements/types';
import type { BusinessCapabilityId } from '@/config/types';

/**
 * Main Page Component
 */
export default function AchievementsPage() {
  const context = useValidationContext();
  const navigate = useNavigate();

  // Get capabilities from profile
  const { profile } = useBusinessProfile();
  const selectedCapabilities = profile?.selectedCapabilities || [];

  // Filter state
  const [selectedCapability, setSelectedCapability] = useState<
    BusinessCapabilityId | 'all'
  >('all');

  // ✅ Use achievementsStore directly (Unified Architecture)
  const computeAllProgress = useAchievementsStore((s) => s.computeAllProgress);

  // Get progress for all active capabilities
  const capabilitiesProgress: CapabilityProgress[] = useMemo(() => {
    if (selectedCapabilities.length === 0) return [];
    return computeAllProgress(context, selectedCapabilities);
  }, [selectedCapabilities, context, computeAllProgress]);

  // Calculate global progress
  const globalProgress = useMemo(() => {
    const total = capabilitiesProgress.reduce((sum, cp) => sum + cp.total, 0);
    const completed = capabilitiesProgress.reduce(
      (sum, cp) => sum + cp.completed,
      0
    );
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [capabilitiesProgress]);

  // Filter progress by selected capability
  const filteredProgress = useMemo(() => {
    if (selectedCapability === 'all') return capabilitiesProgress;
    return capabilitiesProgress.filter(
      (cp) => cp.capability === selectedCapability
    );
  }, [capabilitiesProgress, selectedCapability]);

  // Enrich with capability metadata
  const enrichedProgress = useMemo(() => {
    return filteredProgress.map((progress) => {
      const cap = BUSINESS_CAPABILITIES_REGISTRY[progress.capability];
      return {
        ...progress,
        name: cap?.name || progress.capability,
        icon: cap?.icon || '📦',
      };
    });
  }, [filteredProgress]);

  const isComplete = globalProgress.percentage === 100;

  return (
    <>
      <SkipLink />

      <ContentLayout spacing="normal" mainLabel="Achievements & Setup">
        {/* ==========================================
            HERO SECTION
            ========================================== */}
        <Section variant="flat">
          <Box
            bg={isComplete ? 'green.50' : 'bg.subtle'}
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            border="1px solid"
            borderColor={isComplete ? 'green.200' : 'border.default'}
            _dark={{
              bg: isComplete ? 'green.950' : 'gray.800',
              borderColor: isComplete ? 'green.800' : 'gray.700',
            }}
          >
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'start', md: 'center' }}
              gap={6}
            >
              {/* Left: Title & Description */}
              <VStack align="start" gap={2} flex={1}>
                <HStack gap={3}>
                  <Box
                    p={2}
                    bg={isComplete ? 'green.100' : 'blue.100'}
                    borderRadius="lg"
                    _dark={{
                      bg: isComplete ? 'green.900' : 'blue.900',
                    }}
                  >
                    <Icon
                      as={isComplete ? SparklesIcon : RocketLaunchIcon}
                      boxSize={6}
                      color={isComplete ? 'green.600' : 'blue.600'}
                      _dark={{
                        color: isComplete ? 'green.400' : 'blue.400',
                      }}
                    />
                  </Box>
                  <Heading size="xl">
                    {isComplete
                      ? '¡Configuración Completa!'
                      : 'Configuración del Sistema'}
                  </Heading>
                </HStack>
                <Text color="fg.muted" maxW="lg">
                  {isComplete
                    ? 'Tu negocio está listo para operar. Explora las opciones avanzadas para optimizar tu operación.'
                    : 'Completa estos pasos fundacionales para activar todas las funcionalidades comerciales.'}
                </Text>
              </VStack>

              {/* Right: Progress Ring */}
              <Box textAlign="center" minW="140px">
                <CircularProgress
                  value={globalProgress.percentage}
                  size="100px"
                  color={isComplete ? 'var(--chakra-colors-green-500)' : 'var(--chakra-colors-blue-500)'}
                  trackColor="var(--chakra-colors-gray-200)"
                  strokeWidth={8}
                >
                  <Text fontSize="xl" fontWeight="bold">
                    {globalProgress.percentage}%
                  </Text>
                </CircularProgress>
                <Text fontSize="sm" color="fg.muted" mt="2">
                  {globalProgress.completed} / {globalProgress.total} completados
                </Text>
              </Box>
            </Stack>
          </Box>
        </Section>

        {/* ==========================================
            CAPABILITY FILTERS
            ========================================== */}
        {selectedCapabilities.length > 0 && (
          <Section variant="flat">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="fg.muted"
              mb={3}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Filtrar por Área
            </Text>
            <HStack wrap="wrap" gap={2}>
              <Button
                size="sm"
                variant={selectedCapability === 'all' ? 'solid' : 'outline'}
                colorPalette={selectedCapability === 'all' ? 'blue' : 'gray'}
                onClick={() => setSelectedCapability('all')}
              >
                Todas ({capabilitiesProgress.length})
              </Button>
              {selectedCapabilities.map((capability) => {
                const cap = BUSINESS_CAPABILITIES_REGISTRY[capability];
                const progress = capabilitiesProgress.find(
                  (p) => p.capability === capability
                );
                return (
                  <Button
                    key={capability}
                    size="sm"
                    variant={
                      selectedCapability === capability ? 'solid' : 'outline'
                    }
                    colorPalette={
                      selectedCapability === capability ? 'blue' : 'gray'
                    }
                    onClick={() => setSelectedCapability(capability)}
                  >
                    {cap?.icon} {cap?.name || capability}
                    {progress && (
                      <Badge
                        ml={2}
                        size="sm"
                        colorPalette={
                          progress.percentage === 100 ? 'green' : 'orange'
                        }
                      >
                        {progress.percentage}%
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </HStack>
          </Section>
        )}

        {/* ==========================================
            CAPABILITY CARDS
            ========================================== */}
        <Section variant="flat">
          {enrichedProgress.length === 0 ? (
            <EmptyState />
          ) : (
            <VStack gap={4} w="full">
              {enrichedProgress.map((progress) => (
                <CapabilityCard
                  key={progress.capability}
                  progress={progress}
                  onNavigate={navigate}
                />
              ))}
            </VStack>
          )}
        </Section>
      </ContentLayout>
    </>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <Box
      p={12}
      textAlign="center"
      bg="bg.subtle"
      borderRadius="2xl"
      border="2px dashed"
      borderColor="border.default"
    >
      <Icon
        as={ExclamationCircleIcon}
        boxSize={12}
        color="fg.muted"
        mb={4}
      />
      <Heading size="md" mb={2}>
        Sin Capabilities Activas
      </Heading>
      <Text color="fg.muted" maxW="md" mx="auto">
        No hay capabilities configuradas para tu negocio. Ve a la configuración
        del perfil comercial para activar las funcionalidades que necesitas.
      </Text>
    </Box>
  );
}

/**
 * Capability Card Component
 */
interface CapabilityCardProps {
  progress: CapabilityProgress & { name: string; icon: string };
  onNavigate: (url: string) => void;
}

function CapabilityCard({ progress, onNavigate }: CapabilityCardProps) {
  const { capability, total, completed, percentage, missing, name, icon } =
    progress;
  const isComplete = percentage === 100;

  return (
    <Box
      w="full"
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor={isComplete ? 'green.200' : 'border.default'}
      overflow="hidden"
      transition="all 0.2s"
      _hover={{
        boxShadow: 'md',
        transform: 'translateY(-2px)',
      }}
      _dark={{
        bg: 'gray.800',
        borderColor: isComplete ? 'green.700' : 'gray.700',
      }}
    >
      {/* Header */}
      <Box
        p={5}
        bg={isComplete ? 'green.50' : 'gray.50'}
        _dark={{
          bg: isComplete ? 'green.950' : 'gray.900',
        }}
      >
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            <Text fontSize="2xl">{icon}</Text>
            <VStack align="start" gap={0}>
              <Heading size="md">{name}</Heading>
              <Text fontSize="sm" color="fg.muted">
                {completed} de {total} configuraciones
              </Text>
            </VStack>
          </HStack>

          <HStack gap={3}>
            <Badge
              size="lg"
              colorPalette={isComplete ? 'green' : 'blue'}
              variant="solid"
            >
              {isComplete ? (
                <HStack gap={1}>
                  <Icon as={CheckCircleSolid} boxSize={4} />
                  <Text>Listo</Text>
                </HStack>
              ) : (
                `${percentage}%`
              )}
            </Badge>
          </HStack>
        </HStack>

        {/* Progress Bar */}
        <Box mt={4}>
          <Progress.Root
            value={percentage}
            colorPalette={isComplete ? 'green' : 'blue'}
            size="sm"
          >
            <Progress.Track borderRadius="full">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
      </Box>

      {/* Requirements List */}
      {!isComplete && missing && missing.length > 0 && (
        <Box p={5} pt={4}>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color="fg.muted"
            mb={3}
            textTransform="uppercase"
            letterSpacing="wider"
          >
            Pasos Pendientes ({missing.length})
          </Text>
          <VStack gap={2} w="full">
            {missing.map((req) => (
              <RequirementItem
                key={req.id}
                requirement={req}
                onNavigate={onNavigate}
              />
            ))}
          </VStack>
        </Box>
      )}
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
  const hasLink = !!requirement.redirectUrl;

  return (
    <HStack
      w="full"
      p={3}
      bg="bg.subtle"
      borderRadius="lg"
      border="1px solid"
      borderColor="border.default"
      justify="space-between"
      cursor={hasLink ? 'pointer' : 'default'}
      transition="all 0.2s"
      _hover={
        hasLink
          ? {
            borderColor: 'blue.300',
            bg: 'blue.50',
            _dark: { borderColor: 'blue.600', bg: 'blue.950' },
          }
          : undefined
      }
      onClick={() => hasLink && onNavigate(requirement.redirectUrl!)}
    >
      <HStack gap={3} flex={1}>
        <Box
          p={2}
          bg="orange.100"
          borderRadius="md"
          _dark={{ bg: 'orange.900' }}
        >
          <Text fontSize="lg">{requirement.icon}</Text>
        </Box>
        <VStack align="start" gap={0} flex={1}>
          <Text fontWeight="medium">{requirement.name}</Text>
          {requirement.description && (
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {requirement.description}
            </Text>
          )}
        </VStack>
      </HStack>

      <HStack gap={2}>
        {requirement.estimatedMinutes && (
          <Badge size="sm" colorPalette="gray" variant="subtle">
            ~{requirement.estimatedMinutes} min
          </Badge>
        )}
        {hasLink && (
          <Icon
            as={ChevronRightIcon}
            boxSize={5}
            color="fg.subtle"
          />
        )}
      </HStack>
    </HStack>
  );
}
