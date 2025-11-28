/**
 * ACHIEVEMENTS WIDGET - Dashboard Component
 *
 * Widget evolutivo que cambia su comportamiento según el estado de completitud:
 * - Vista PROMINENTE: Setup incompleto (ocupa 2 columnas, máxima visibilidad)
 * - Vista COMPACTA: Setup completo (ocupa 1 columna, baja prioridad)
 *
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { Box, VStack, HStack, Heading, Text, Button, Badge } from '@/shared/ui';
import { useCapabilities } from '@/lib/capabilities';
import { useValidationContext } from '@/hooks/useValidationContext';
import { ModuleRegistry } from '@/lib/modules';
import { useAchievementsStore } from '@/store/achievementsStore';
import { logger } from '@/lib/logging';
import { useNavigationActions } from '@/contexts/NavigationContext';
import type { CapabilityProgress } from '../types';
import type { BusinessCapabilityId } from '@/config/types';

/**
 * Mapeo de IDs de capabilities a nombres legibles
 */
// ✅ FIX Bug #2: Removed obsolete capabilities (production_workflow, appointment_based)
const CAPABILITY_NAMES: Record<BusinessCapabilityId, string> = {
  // Core business models
  physical_products: 'Productos Físicos',
  professional_services: 'Servicios Profesionales',
  asset_rental: 'Alquiler de Activos',
  membership_subscriptions: 'Membresías',
  digital_products: 'Productos Digitales',

  // Fulfillment methods
  onsite_service: 'Dine-In',
  pickup_orders: 'TakeAway',
  delivery_shipping: 'Delivery',

  // Special operations
  async_operations: 'Operaciones Async',
  corporate_sales: 'B2B',
  mobile_operations: 'Móvil'
};

/**
 * Main Widget Component - Exported for lazy loading
 */
export default function AchievementsWidget() {
  logger.debug('App', '🎯 AchievementsWidget render');

  const { activeCapabilities } = useCapabilities();

  // ✅ FIX CRÍTICO: NO llamar useValidationContext en el render
  // En su lugar, obtener context solo cuando se necesite (dentro del useEffect)
  // Esto previene que los hooks de Zustand se suscriban en cada render
  const registry = useMemo(() => ModuleRegistry.getInstance(), []);

  logger.debug('App', '🎯 activeCapabilities:', activeCapabilities);

  // ✅ CORRECTO: Usar useState + useEffect con serialización para evitar loops
  // - activeCapabilities.join(',') evita re-ejecución por cambio de referencia del array
  // - Solo re-ejecuta cuando las capabilities REALMENTE cambian
  // - context se obtiene dentro del useEffect, NO en el render
  const [capabilitiesProgress, setCapabilitiesProgress] = React.useState<CapabilityProgress[]>([]);
  const capabilitiesKey = activeCapabilities.join(',');

  logger.debug('App', '🎯 capabilitiesKey:', capabilitiesKey);

  React.useEffect(() => {
    logger.debug('App', '🔄 AchievementsWidget useEffect triggered', { capabilitiesKey });

    if (activeCapabilities.length === 0) {
      logger.debug('App', '⚠️ No active capabilities, clearing progress');
      setCapabilitiesProgress([]);
      return;
    }

    // ✅ FIX: Evitar loop infinito - solo ejecutar si hay capabilities
    // No llamar doAction si no hay handlers registrados
    let isMounted = true;

    // Timeout para evitar que se ejecute en cada render
    const timer = setTimeout(() => {
      if (!isMounted) {
        logger.debug('App', '⚠️ Component unmounted, skipping doAction');
        return;
      }

      try {
        logger.debug('App', '📊 Fetching capabilities progress...');

        // ✅ CRITICAL FIX: Obtener context AQUÍ, no en el render
        // Esto evita suscripciones innecesarias de Zustand
        // Usar getState() en lugar de hooks para acceso directo sin subscription
        import('@/hooks/useValidationContext').then(({ useValidationContext }) => {
          // Acceder a los stores directamente sin hooks
          import('@/store/productsStore').then(({ useProductsStore }) => {
            import('@/store/staffStore').then(({ useStaffStore }) => {
              import('@/store/operationsStore').then(({ useOperationsStore }) => {
                import('@/store/salesStore').then(({ useSalesStore }) => {
                  import('@/store/appStore').then(({ useAppStore }) => {

                    // ✅ Usar getState() para acceso directo sin subscription
                    const products = useProductsStore.getState().products;
                    const staff = useStaffStore.getState().staff;
                    const tables = (useOperationsStore.getState() as any).tables || [];
                    const sales = useSalesStore.getState().sales;
                    const settings = useAppStore.getState().settings;

                    const context = {
                      profile: {
                        businessName: settings?.businessName,
                        address: undefined,
                        logoUrl: undefined,
                        taxId: undefined,
                        contactEmail: undefined,
                        contactPhone: undefined,
                        operatingHours: undefined,
                        pickupHours: undefined,
                        deliveryHours: undefined,
                        shippingPolicy: undefined,
                        termsAndConditions: undefined,
                      },
                      products: products.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        is_published: p.is_published ?? false,
                        images: p.images || [],
                      })),
                      staff: staff.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        is_active: s.is_active ?? true,
                        role: s.role,
                      })),
                      tables: tables.map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        capacity: t.capacity || 4,
                      })),
                      paymentMethods: [],
                      paymentGateways: [],
                      deliveryZones: [],
                      salesCount: sales?.length || 0,
                      loyaltyProgram: undefined,
                    };

                    // Obtener progreso de cada capability activa
                    const results = activeCapabilities.map((capability) => {
                      logger.debug('App', `📊 Getting progress for: ${capability}`);

                      const actionResults = registry.doAction('achievements.get_progress', {
                        capability,
                        context,
                      });

                      logger.debug('App', `📊 doAction result for ${capability}:`, actionResults);

                      // doAction retorna array, tomar el primer resultado
                      return actionResults[0] as CapabilityProgress;
                    }).filter(Boolean); // Filtrar undefined/null

                    logger.debug('App', '📊 Total results:', results);

                    // Solo actualizar si realmente cambió y componente sigue montado
                    if (isMounted) {
                      setCapabilitiesProgress(prevResults => {
                        // Comparar por longitud y IDs
                        if (prevResults.length !== results.length) {
                          logger.debug('App', '🔄 Length changed, updating state');
                          return results;
                        }

                        const hasChanged = results.some((r, i) =>
                          r?.capability !== prevResults[i]?.capability ||
                          r?.completed !== prevResults[i]?.completed
                        );

                        if (hasChanged) {
                          logger.debug('App', '🔄 Progress changed, updating state');
                        } else {
                          logger.debug('App', '✅ No changes detected, keeping previous state');
                        }

                        return hasChanged ? results : prevResults;
                      });
                    }
                  });
                });
              });
            });
          });
        });
      } catch (error) {
        logger.error('App', '❌ Error fetching progress:', error);
      }
    }, 100); // Debounce 100ms

    return () => {
      logger.debug('App', '🧹 Cleanup AchievementsWidget useEffect');
      isMounted = false;
      clearTimeout(timer);
    };
  }, [capabilitiesKey, activeCapabilities, registry]); // Dependencies mínimas

  // ¿Todo completo?
  const allOperational = capabilitiesProgress.length > 0 &&
    capabilitiesProgress.every(cp => cp?.isOperational);

  // EVOLUTIVO: Cambiar vista según completitud
  if (allOperational) {
    return <AchievementsCompactView progress={capabilitiesProgress} />;
  }

  return <AchievementsProminentView progress={capabilitiesProgress} />;
}

/**
 * Vista PROMINENTE - Setup Incompleto
 * - Ocupa 2 columnas en el dashboard grid
 * - Alta prioridad visual (purple theme)
 * - Muestra progreso detallado por capability
 */
function AchievementsProminentView({
  progress
}: {
  progress: CapabilityProgress[]
}) {
  const { navigate } = useNavigationActions();

  // Calcular progreso global
  const totalRequirements = progress.reduce((sum, cp) => sum + cp.total, 0);
  const totalCompleted = progress.reduce((sum, cp) => sum + cp.completed, 0);
  const globalPercentage = totalRequirements > 0
    ? Math.round((totalCompleted / totalRequirements) * 100)
    : 0;

  return (
    <Box
      gap="3"
      gridColumn={{ base: 'span 1', md: 'span 2' }} // Responsive: 2 cols en desktop
      p="6"
      bg="purple.50"
      borderRadius="lg"
      border="2px solid"
      borderColor="purple.200"
      _dark={{
        bg: 'purple.900/20',
        borderColor: 'purple.700'
      }}
    >
      <VStack align="start" gap="4" w="full">
        {/* Header */}
        <HStack gap="3">
          <Text fontSize="3xl">🎯</Text>
          <Heading size="lg" color="purple.700" _dark={{ color: 'purple.300' }}>
            Completa la Configuración
          </Heading>
        </HStack>

        {/* Progress Bar */}
        <Box w="full">
          <HStack justify="space-between" mb="2">
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              Progreso Global
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="purple.700" _dark={{ color: 'purple.300' }}>
              {globalPercentage}%
            </Text>
          </HStack>
          <Box
            h="8px"
            w="full"
            bg="gray.200"
            borderRadius="full"
            overflow="hidden"
            _dark={{ bg: 'gray.700' }}
          >
            <Box
              h="full"gap="2"
              w={`${globalPercentage}%`}
              bg="purple.500"
              transition="width 0.3s"
            />
          </Box>
        </Box>

        {/* Warning Message */}
        <Text color="gray.700" _dark={{ color: 'gray.300' }} fontSize="md">
          Tu negocio aún no puede operar comercialmente. Completa estos pasos para comenzar:
        </Text>

        {/* Capabilities Progress */}
        <VStack w="full" gap="2">
          {progress.map(cap => (
            <CapabilityProgressSummary key={cap.capability} {...cap} />
          ))}
        </VStack>

        {/* CTA Button */}
        <Button
          size="lg"
          colorPalette="purple"
          w="full"
          onClick={() => navigate('gamification', '/achievements')}
        >
          Ver Todos los Pasos ({totalRequirements - totalCompleted} pendientes)
        </Button>
      </VStack>
    </Box>
  );
}

/**
 * Vista COMPACTA - Setup Completo
 * - Ocupa 1 columna en el dashboard grid
 * - Baja prioridad visual
 * - Muestra total de puntos y badges operacionales
 */
function AchievementsCompactView({
  progress
}: {
  progress: CapabilityProgress[]
}) {
  const { navigate } = useNavigationActions();
  const totalPoints = useAchievementsStore(state => state.totalPoints);
  const completedAchievements = useAchievementsStore(state => state.completedAchievements);

  return (
    <Box
      gridColumn="span 1"
      p="5"
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      _dark={{
        bg: 'gray.800',
        borderColor: 'gray.700'
      }}
    >
      <VStack align="start" gap="4" w="full">
        {/* Header with Points */}
        <HStack justify="space-between" w="full">
          <VStack align="start" gap="1">
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              Logros Completados
            </Text>
            <HStack gap="2">
              <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                🏆
              </Text>
              <Heading size="md" color="green.600" _dark={{ color: 'green.400' }}>
                {totalPoints} pts
              </Heading>
            </HStack>
            <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>
              {completedAchievements.length} achievements
            </Text>
          </VStack>

          <Button
            size="sm"gap="2"
            variant="ghost"
            colorPalette="gray"
            onClick={() => navigate('gamification', '/achievements')}
          >
            Ver Todos
          </Button>
        </HStack>

        {/* Operational Badges */}
        <Box w="full">
          <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }} mb="2">
            Capabilities Activas
          </Text>
          <HStack wrap="wrap" gap="2">
            {progress.map(cap => (
              <Badge
                key={cap.capability}
                colorPalette="green"
                size="sm"
              >
                ✓ {CAPABILITY_NAMES[cap.capability] || cap.capability}
              </Badge>
            ))}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}

/**
 * Capability Progress Summary - Compact Row
 * Used in prominent view to show progress per capability
 */
function CapabilityProgressSummary(props: CapabilityProgress) {
  const { capability, completed, total, percentage } = props;

  return (
    <Box
      w="full"
      p="3"
      bg="white"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      _dark={{
        bg: 'gray.800',
        borderColor: 'gray.700'
      }}
    >
      <HStack justify="space-between" w="full">
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="medium" color="gray.800" _dark={{ color: 'gray.200' }}>
            {CAPABILITY_NAMES[capability] || capability}
          </Text>
          <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
            {completed} de {total} completados
          </Text>
        </VStack>

        <VStack align="end" gap="1">
          <Text fontSize="sm" fontWeight="bold" color={percentage === 100 ? 'green.600' : 'orange.600'}>
            {percentage}%
          </Text>
          {percentage === 100 ? (
            <Badge colorPalette="green" size="sm">Listo</Badge>
          ) : (
            <Badge colorPalette="orange" size="sm">Pendiente</Badge>
          )}
        </VStack>
      </HStack>

      {/* Mini Progress Bar */}
      <Box
        mt="2"
        h="4px"
        w="full"
        bg="gray.200"
        borderRadius="full"
        overflow="hidden"
        _dark={{ bg: 'gray.700' }}
      >
        <Box
          h="full"
          w={`${percentage}%`}
          bg={percentage === 100 ? 'green.500' : 'orange.500'}
          transition="width 0.3s"
        />
      </Box>
    </Box>
  );
}
