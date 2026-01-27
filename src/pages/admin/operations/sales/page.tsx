/**
 * Sales Page - Point of Sale & Order Management
 *
 * REFACTORED v6.0 - MAGIC PATTERNS DESIGN
 * Design Principles:
 * - Decorative background blobs for visual depth
 * - Gradient metric cards with top border accents (3px)
 * - Elevated content cards with modern shadows
 * - Responsive grid layouts (SimpleGrid)
 * - Clean spacing system (gap="6/8", p="6/8")
 * - No maxW restrictions (w="100%")
 */

import { useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
  Flex,
  SimpleGrid,
  Button,
  Badge,
  SkipLink,
  Icon,
  Tabs,
  Alert,
  Section
} from '@/shared/ui';
import { Typography } from '@/shared/ui';
import { HookPoint } from '@/lib/modules';
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Systems
import EventBus from '@/lib/events';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePermissions } from '@/hooks';

// Components & Hooks
import { AppointmentsTab } from './components/AppointmentsTab';
import { LazySaleFormModal } from './components';
import { useSalesPage } from './hooks';
import { useModalState } from '@/store/salesStore';
import { logger } from '@/lib/logging';

// ===============================
// METRIC CARD COMPONENT (Magic Patterns Style)
// ===============================
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  gradient: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, change, changeType, gradient, loading }) => {
  return (
    <Box
      bg="bg.surface"
      p="6"
      borderRadius="2xl"
      shadow="md"
      position="relative"
      overflow="hidden"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      {/* Top gradient border */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg={gradient}
      />
      
      <Stack gap="4">
        <Flex justify="space-between" align="start">
          <Box
            p="3"
            borderRadius="xl"
            bg={`${gradient.split('.')[0]}.100`}
          >
            <Icon style={{ width: '24px', height: '24px', color: `var(--chakra-colors-${gradient.replace('.', '-')})` }} />
          </Box>
          {change && (
            <Badge colorPalette={changeType === 'increase' ? 'green' : 'red'} size="sm">
              {change}
            </Badge>
          )}
        </Flex>
        <Stack gap="1">
          <Typography variant="body" size="sm" color="text.muted">
            {label}
          </Typography>
          <Typography variant="heading" size="2xl" fontWeight="bold">
            {loading ? '---' : value}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

// Event handlers
const EVENT_HANDLERS = {
  'materials.stock_updated': () => logger.info('Sales', 'Stock updated'),
  'materials.low_stock_alert': () => logger.info('Sales', 'Low stock alert'),
  'kitchen.order_ready': () => logger.info('Sales', 'Order ready')
};

function SalesPage() {
  // Permissions
  const { canCreate, canRead, canUpdate, canDelete, canVoid, canExport } = usePermissions('sales');

  // Error & offline
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();

  // Page data
  const { metrics, pageState, actions, loading, error, activeTab, setActiveTab } = useSalesPage();

  // Modal
  const { isModalOpen, closeModal } = useModalState();

  // EventBus
  useEffect(() => {
    const subs = Object.entries(EVENT_HANDLERS).map(([name, handler]) =>
      EventBus.subscribe(name, () => handler())
    );
    return () => subs.forEach(unsub => unsub());
  }, []);

  // Error handling
  useEffect(() => {
    if (error && handleError) {
      handleError(error, { context: 'SalesPage', pageState, recoverable: true });
    }
  }, [error, handleError]);

  // Error state
  if (error) {
    return (
      <Box p="6">
        <SkipLink />
        <Alert status="error" title="Error de carga">{error}</Alert>
        <Button onClick={() => window.location.reload()} mt="4">
          <Icon icon={ArrowPathIcon} size="sm" /> Recargar
        </Button>
      </Box>
    );
  }

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      <SkipLink />
      
      {/* Decorative background elements */}
      <Box position="absolute" top="-10%" right="-5%" width="500px" height="500px" borderRadius="full" bg="teal.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" />
      <Box position="absolute" bottom="-10%" left="-5%" width="400px" height="400px" borderRadius="full" bg="purple.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" />

      <Box position="relative" zIndex="1" p={{ base: "6", md: "8" }}>
        <Stack gap="8" w="100%">

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Magic Patterns Style
              ═══════════════════════════════════════════════════════════════ */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <Flex align="center" gap="4">
              <Box
                p="4"
                borderRadius="2xl"
                bg="linear-gradient(135deg, var(--chakra-colors-teal-500) 0%, var(--chakra-colors-teal-700) 100%)"
                shadow="lg"
              >
                <CurrencyDollarIcon style={{ width: '32px', height: '32px', color: 'white' }} />
              </Box>
              <Stack gap="1">
                <Typography variant="heading" size="3xl" fontWeight="bold">
                  Punto de Venta
                </Typography>
                <Flex align="center" gap="2">
                  <Typography variant="body" size="md" color="text.muted">
                    Sistema de ventas y transacciones
                  </Typography>
                  {isOnline ? (
                    <Badge colorPalette="green" size="sm">
                      <Icon icon={CheckCircleIcon} size="xs" />
                      Online
                    </Badge>
                  ) : (
                    <Badge colorPalette="orange" size="sm">Offline</Badge>
                  )}
                </Flex>
              </Stack>
            </Flex>

            {canCreate && (
              <Button colorPalette="teal" size="lg" onClick={actions.handleNewSale}>
                <Icon icon={PlusIcon} size="sm" />
                Nueva Venta
              </Button>
            )}
          </Flex>

          {/* ═══════════════════════════════════════════════════════════════
              METRICS CARDS - Magic Patterns Style
              ═══════════════════════════════════════════════════════════════ */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
            <MetricCard
              icon={CurrencyDollarIcon}
              label="Revenue Hoy"
              value={`$${metrics.todayRevenue.toLocaleString('es-AR')}`}
              change={metrics.salesGrowth > 0 ? `+${metrics.salesGrowth}%` : `${metrics.salesGrowth}%`}
              changeType={metrics.salesGrowth > 0 ? 'increase' : 'decrease'}
              gradient="linear-gradient(90deg, var(--chakra-colors-green-400) 0%, var(--chakra-colors-green-600) 100%)"
              loading={loading}
            />
            <MetricCard
              icon={CreditCardIcon}
              label="Transacciones"
              value={metrics.todayTransactions.toString()}
              gradient="linear-gradient(90deg, var(--chakra-colors-blue-400) 0%, var(--chakra-colors-blue-600) 100%)"
              loading={loading}
            />
            <MetricCard
              icon={ArrowTrendingUpIcon}
              label="Ticket Promedio"
              value={`$${metrics.averageOrderValue.toLocaleString('es-AR')}`}
              gradient="linear-gradient(90deg, var(--chakra-colors-purple-400) 0%, var(--chakra-colors-purple-600) 100%)"
              loading={loading}
            />

            {/* Dynamic metrics via HookPoint */}
            <HookPoint name="sales.metrics.cards" data={{ metrics }} fallback={null} />
          </SimpleGrid>

          {/* ═══════════════════════════════════════════════════════════════
              MAIN CONTENT - Elevated Tabs Card (Magic Patterns Style)
              ═══════════════════════════════════════════════════════════════ */}
          {canRead && (
            <Box bg="bg.surface" p="8" borderRadius="2xl" shadow="xl">
              <Tabs.Root
                value={activeTab}
                onValueChange={(d) => setActiveTab(d.value)}
                lazyMount
                unmountOnExit={false}
              >
                <Tabs.List mb="6">
                  <Tabs.Trigger value="pos">
                    <Icon icon={CreditCardIcon} size="sm" />
                    POS
                  </Tabs.Trigger>
                  <Tabs.Trigger value="orders">
                    <Icon icon={ClipboardDocumentListIcon} size="sm" />
                    Órdenes
                  </Tabs.Trigger>
                  <Tabs.Trigger value="agenda">
                    <Icon icon={CalendarIcon} size="sm" />
                    Agenda
                  </Tabs.Trigger>
                  <Tabs.Trigger value="reports">
                    <Icon icon={DocumentTextIcon} size="sm" />
                    Reportes
                  </Tabs.Trigger>
                </Tabs.List>

                {/* POS Tab */}
                <Tabs.Content value="pos">
                  <Stack gap="6">
                    <Box>
                      <Typography variant="heading" size="xl" fontWeight="bold" mb="2">
                        Sistema de Punto de Venta
                      </Typography>
                      <Typography variant="body" size="md" color="text.muted">
                        Selecciona un tipo de venta para comenzar o usa el botón "Nueva Venta" en el header.
                      </Typography>
                    </Box>

                    {/* Quick action buttons - Magic Patterns Style */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
                      <Box
                        p="6"
                        bg="teal.50"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor="teal.200"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ borderColor: "teal.400", transform: "translateY(-2px)", shadow: "md" }}
                        onClick={actions.handleNewSale}
                      >
                        <Icon icon={PlusIcon} size="lg" color="teal.600" mb="3" />
                        <Typography variant="body" size="md" fontWeight="bold" mb="1">Producto Físico</Typography>
                        <Typography variant="body" size="sm" color="text.muted">Venta de productos del inventario</Typography>
                      </Box>

                      <Box
                        p="6"
                        bg="blue.50"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor="blue.200"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ borderColor: "blue.400", transform: "translateY(-2px)", shadow: "md" }}
                      >
                        <Text fontSize="2xl" mb="3">🛠️</Text>
                        <Typography variant="body" size="md" fontWeight="bold" mb="1">Servicio</Typography>
                        <Typography variant="body" size="sm" color="text.muted">Reservas y servicios profesionales</Typography>
                      </Box>

                      <Box
                        p="6"
                        bg="purple.50"
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor="purple.200"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ borderColor: "purple.400", transform: "translateY(-2px)", shadow: "md" }}
                      >
                        <Text fontSize="2xl" mb="3">💻</Text>
                        <Typography variant="body" size="md" fontWeight="bold" mb="1">Digital</Typography>
                        <Typography variant="body" size="sm" color="text.muted">Productos digitales y descargas</Typography>
                      </Box>
                    </SimpleGrid>

                    {/* HookPoint for module-specific actions */}
                    <HookPoint name="sales.pos.quick_actions" fallback={null} />
                  </Stack>
                </Tabs.Content>

                {/* Orders Tab */}
                <Tabs.Content value="orders">
                  <Stack gap="6">
                    <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
                      <Box>
                        <Typography variant="heading" size="xl" fontWeight="bold">Historial de Órdenes</Typography>
                        <Typography variant="body" size="sm" color="text.muted">Gestiona todas las órdenes: ventas, delivery, pickup y servicios</Typography>
                      </Box>
                      <Flex gap="2" flexWrap="wrap">
                        <Button size="sm" variant="solid" colorPalette="teal">Todas</Button>
                        <Button size="sm" variant="outline">Pendientes</Button>
                        <Button size="sm" variant="outline">Completadas</Button>
                        <Button size="sm" variant="outline">Delivery</Button>
                      </Flex>
                    </Flex>
                    {/* TODO: OrdersTable component */}
                    <Box p="12" textAlign="center" borderRadius="xl" borderWidth="2px" borderStyle="dashed" borderColor="border.default" bg="bg.muted">
                      <Text fontSize="4xl" mb="3">📋</Text>
                      <Typography variant="body" size="md" fontWeight="semibold" mb="2">Tabla de Órdenes</Typography>
                      <Typography variant="body" size="sm" color="text.muted">Component pendiente de implementación</Typography>
                    </Box>
                  </Stack>
                </Tabs.Content>

                {/* Agenda Tab */}
                <Tabs.Content value="agenda">
                  <AppointmentsTab />
                </Tabs.Content>

                {/* Reports Tab */}
                <Tabs.Content value="reports">
                  <Stack gap="6">
                    <Box>
                      <Typography variant="heading" size="xl" fontWeight="bold" mb="2">Reportes y Analytics</Typography>
                      <Typography variant="body" size="md" color="text.muted">
                        Genera reportes de ventas y visualiza métricas de rendimiento
                      </Typography>
                    </Box>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6">
                      <Box
                        p="6"
                        bg="bg.surface"
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="border.default"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                        textAlign="center"
                      >
                        <Icon icon={DocumentTextIcon} size="lg" color="purple.500" mb="3" />
                        <Typography variant="body" size="md" fontWeight="bold">Reporte del Día</Typography>
                      </Box>
                      <Box
                        p="6"
                        bg="bg.surface"
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="border.default"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                        textAlign="center"
                      >
                        <Text fontSize="2xl" mb="3">📊</Text>
                        <Typography variant="body" size="md" fontWeight="bold">Reporte Semanal</Typography>
                      </Box>
                      <Box
                        p="6"
                        bg="bg.surface"
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="border.default"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                        textAlign="center"
                      >
                        <Text fontSize="2xl" mb="3">📈</Text>
                        <Typography variant="body" size="md" fontWeight="bold">Reporte Mensual</Typography>
                      </Box>
                      {canExport && (
                        <Box
                          p="6"
                          bg="bg.surface"
                          borderRadius="xl"
                          borderWidth="1px"
                          borderColor="border.default"
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                          textAlign="center"
                        >
                          <Text fontSize="2xl" mb="3">💾</Text>
                          <Typography variant="body" size="md" fontWeight="bold">Exportar CSV</Typography>
                        </Box>
                      )}
                    </SimpleGrid>
                  </Stack>
                </Tabs.Content>
              </Tabs.Root>
            </Box>
          )}

          {/* Sale Modal */}
          {isModalOpen && (canCreate || canUpdate) && (
            <LazySaleFormModal
              isOpen={isModalOpen}
              onClose={closeModal}
            />
          )}

        </Stack>
      </Box>
    </Box>
  );
}

export default SalesPage;

if (import.meta.env.DEV) {
  SalesPage.whyDidYouRender = true;
}
