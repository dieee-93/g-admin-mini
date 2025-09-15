import {
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Button, Alert, Badge, Icon, Stack, Typography
} from '@/shared/ui';
import {
  CreditCardIcon,
  TableCellsIcon,
  ChartBarIcon,
  QrCodeIcon,
  ComputerDesktopIcon,
  PlusIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useSalesPage } from './hooks';

// Mock data
const mockTables = [{
  id: '1',
  number: '1',
  capacity: 4,
  location: 'dining_room' as const,
  status: 'available' as const,
  average_turn_time: 45,
  revenue_contribution: 1250,
  preferred_by: [],
  color_code: 'green' as const,
  priority: 'normal' as const,
  created_at: '2024-01-01',
  is_active: true
}];

const mockOrders = [{
  id: '1',
  order_number: 'ORD-001',
  table_number: '1',
  status: 'preparing' as const,
  items: [{
    id: '1',
    product_name: 'Pizza Margherita',
    quantity: 2,
    price: 12.99,
    notes: 'Extra cheese',
    category: 'Main Course'
  }],
  subtotal: 25.98,
  tax: 2.60,
  total: 28.58,
  estimated_time: 15,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:35:00Z'
}];

export default function SalesPage() {
  const {
    pageState,
    metrics,
    loading,
    error,
    actions
  } = useSalesPage();

  if (loading) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader
          title="Sistema de Ventas"
          subtitle="Cargando datos..."
          icon={ComputerDesktopIcon}
        />
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader
          title="Sistema de Ventas"
          subtitle="Error al cargar datos"
          icon={ComputerDesktopIcon}
        />
        <Alert variant="subtle" title={error} />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Sistema de Ventas"
        subtitle={
          <Stack direction="row" gap="sm" align="center">
            <Badge variant="solid">Live</Badge>
            <Typography variant="body" size="sm" color="text.muted">
              POS inteligente con gestión completa
            </Typography>
          </Stack>
        }
        icon={ComputerDesktopIcon}
        actions={
          <Button variant="solid" onClick={actions.handleNewSale} size="lg">
            <Icon icon={PlusIcon} size="sm" />
            Nueva Venta
          </Button>
        }
      />

      {/* Sales Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Ventas Hoy"
            value={`$${metrics.todayRevenue.toFixed(2)}`}
            icon={CurrencyDollarIcon}
            trend={{ value: metrics.salesGrowth, isPositive: metrics.salesGrowth > 0 }}
            colorPalette="green"
          />
          <MetricCard
            title="Transacciones"
            value={metrics.todayTransactions}
            icon={CreditCardIcon}
            colorPalette="blue"
          />
          <MetricCard
            title="Ticket Promedio"
            value={`$${metrics.averageOrderValue.toFixed(2)}`}
            icon={ArrowTrendingUpIcon}
            colorPalette="purple"
          />
          <MetricCard
            title="Mesas Activas"
            value={metrics.activeTables}
            icon={TableCellsIcon}
            colorPalette="teal"
          />
        </CardGrid>
      </StatsSection>

      {/* POS System Section */}
      <Section variant="elevated" title="Sistema POS">
        <Stack direction="row" gap="sm" align="center" mb="md">
          <Icon icon={CreditCardIcon} size="lg" color="teal.600" />
          <Badge variant="subtle" colorPalette="teal">Principal</Badge>
        </Stack>
        <Typography variant="body" mb="md">
          Sistema de punto de venta integrado con gestión de inventario en tiempo real.
        </Typography>
        <Stack direction="row" gap="md">
          <Button variant="solid" onClick={actions.handleNewSale}>
            Procesar Venta
          </Button>
          <Button variant="outline" onClick={actions.handleShowReports}>
            Ver Historial
          </Button>
        </Stack>
      </Section>

      {/* Table Management Section */}
      {pageState.activeSection === 'tables' && (
        <Section variant="elevated" title="Gestión de Mesas">
          <Stack direction="row" gap="sm" align="center" mb="md">
            <Icon icon={TableCellsIcon} size="lg" color="blue.600" />
            <Typography variant="body" color="text.muted">
              Ocupación: {metrics.tableOccupancy.toFixed(1)}%
            </Typography>
          </Stack>
          <Alert
            variant="subtle"
            icon={<Icon icon={InformationCircleIcon} size="sm" />}
            title="Seleccione una mesa para iniciar una nueva venta."
          />
        </Section>
      )}

      {/* Analytics Section */}
      {pageState.showAnalytics && (
        <Section variant="elevated" title="Analytics de Ventas">
          <CardGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
            <MetricCard
              title="Órdenes Pendientes"
              value={metrics.pendingOrders}
              icon={ClockIcon}
              colorPalette="orange"
            />
            <MetricCard
              title="Tiempo Promedio Servicio"
              value={`${metrics.averageServiceTime} min`}
              icon={UsersIcon}
              colorPalette="cyan"
            />
            <MetricCard
              title="Margen de Ganancia"
              value={`${metrics.profitMargin.toFixed(1)}%`}
              icon={ArrowTrendingUpIcon}
              colorPalette="green"
              trend={{ value: metrics.profitMargin, isPositive: metrics.profitMargin > 0 }}
            />
          </CardGrid>
        </Section>
      )}

      {/* Quick Actions */}
      <Section variant="flat" title="Acciones Rápidas">
        <Stack direction="row" gap="md" flexWrap="wrap">
          <Button
            variant="outline"
            onClick={actions.handleQRGeneration}
            flex="1"
            minW="200px"
          >
            <Icon icon={QrCodeIcon} size="sm" />
            Códigos QR
          </Button>
          <Button
            variant="outline"
            onClick={actions.handleShowAnalytics}
            flex="1"
            minW="200px"
          >
            <Icon icon={ChartBarIcon} size="sm" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={actions.handleKitchenDisplay}
            flex="1"
            minW="200px"
          >
            <Icon icon={ComputerDesktopIcon} size="sm" />
            Pantalla Cocina
          </Button>
        </Stack>
      </Section>
    </ContentLayout>
  );
}