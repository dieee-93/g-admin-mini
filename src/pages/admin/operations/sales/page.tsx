import {
  ContentLayout, Section, StatsSection, CardGrid, MetricCard,
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
// CapabilityGate and Slot integration
import { CapabilityGate } from '@/lib/capabilities';
import { Slot } from '@/lib/composition';

// Module integration
import { useModuleIntegration } from '@/hooks/useModuleIntegration';

import { useSalesPage } from './hooks';

// Module configuration for Sales - CRITICAL: Inventory→Sales integration
const SALES_MODULE_CONFIG = {
  capabilities: ['sells_products', 'pos_system', 'payment_processing', 'customer_management'],
  events: {
    emits: ['order_placed', 'payment_completed', 'sale_completed', 'customer_registered'],
    listens: ['materials.stock_updated', 'materials.low_stock_alert', 'operations.order_ready']
  },
  eventHandlers: {
    'materials.stock_updated': (data: any) => {
      console.log('🛒 Sales: Stock updated, checking product availability', data);
      // Update product availability based on stock changes
      if (data.critical) {
        console.warn('⚠️ Sales: Critical stock detected for', data.materialName);
        // Show low stock warning in POS
      }
    },
    'materials.low_stock_alert': (data: any) => {
      console.log('🚨 Sales: Low stock alert received', data);
      // Handle low stock alerts in sales interface
      if (data.severity === 'critical') {
        // Disable product from POS
        console.log('🚫 Sales: Disabling product due to stock critical level');
      }
    },
    'operations.order_ready': (data: any) => {
      console.log('✅ Sales: Order ready notification', data);
      // Update order status for customer notification
    }
  },
  slots: ['sales-dashboard', 'pos-extensions', 'payment-methods']
} as const;

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
  // Module integration (EventBus + CapabilityGate + Slots)
  const { emitEvent, hasCapability, status, registerSlotContent } = useModuleIntegration(
    'sales',
    SALES_MODULE_CONFIG
  );

  const {
    pageState,
    metrics,
    loading,
    error,
    actions
  } = useSalesPage();

  // Enhanced actions with EventBus integration - CRITICAL: Inventory→Sales flow
  const handleOrderPlaced = (orderData: any) => {
    // Emit order placed event for inventory deduction
    emitEvent('order_placed', {
      orderId: orderData.id,
      items: orderData.items,
      customerId: orderData.customerId,
      totalAmount: orderData.total,
      timestamp: Date.now()
    });

    // Process order locally
    actions.handleOrderPlaced?.(orderData);
  };

  const handleSaleCompleted = (saleData: any) => {
    // Emit sale completed for materials stock update
    emitEvent('sale_completed', {
      saleId: saleData.id,
      items: saleData.items.map((item: any) => ({
        materialId: item.product_id,
        quantity: item.quantity,
        productName: item.product_name
      })),
      totalRevenue: saleData.total,
      timestamp: Date.now()
    });

    // Emit to operations for fulfillment tracking
    emitEvent('payment_completed', {
      orderId: saleData.id,
      paymentMethod: saleData.payment_method,
      amount: saleData.total
    });
  };

  if (loading) {
    return (
      <ContentLayout spacing="normal">
        <div>Cargando sistema de ventas...</div>
      </ContentLayout>
    );
  }

  if (error) {
    // Emit error event for monitoring
    emitEvent('sales_error', { type: 'load_failed', error, timestamp: Date.now() });
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de carga">
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* 🔒 Module status indicator */}
      {!status.isActive && (
        <Alert
          variant="subtle"
          title="Module Capabilities Required"
          description={`Missing capabilities: ${status.missingCapabilities.join(', ')}`}
        />
      )}

      <Stack gap={12}>
        {/* 📊 MÉTRICAS DE NEGOCIO - SIEMPRE PRIMERO */}
        <StatsSection>
          <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
            <MetricCard
              title="Ventas Hoy"
              value={`$${metrics.todayRevenue.toFixed(2)}`}
              icon={CurrencyDollarIcon}
              trend={{ value: metrics.salesGrowth, isPositive: metrics.salesGrowth > 0 }}
              colorPalette="green"
              onClick={() => emitEvent('metric_clicked', { metric: 'revenue', value: metrics.todayRevenue })}
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

        {/* 💼 SISTEMA POS PRINCIPAL */}
        <Section variant="elevated" title="Sistema POS">
          <Stack direction="row" gap="sm" align="center" mb="md">
            <Icon icon={CreditCardIcon} size="lg" color="teal.600" />
            <Badge variant="subtle" colorPalette="teal">Principal</Badge>
            <Badge variant="solid">Live</Badge>
          </Stack>
          <Typography variant="body" mb="md">
            Sistema de punto de venta integrado con gestión de inventario en tiempo real.
          </Typography>
          <Stack direction="row" gap="md">
            <Button variant="solid" onClick={actions.handleNewSale} size="lg">
              <Icon icon={PlusIcon} size="sm" />
              Nueva Venta
            </Button>
            <Button variant="outline" onClick={actions.handleShowReports}>
              Ver Historial
            </Button>
          </Stack>
        </Section>

        {/* 🏠 GESTIÓN DE MESAS - Condicional */}
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

        {/* 📈 ANALYTICS DE VENTAS - Condicional */}
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

        {/* ⚡ ACCIONES RÁPIDAS */}
        <Section variant="default" title="Acciones Rápidas">
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

        {/* Extensions Slot */}
        <Slot id="sales-dashboard" fallback={null} />
      </Stack>
    </ContentLayout>
  );
}
