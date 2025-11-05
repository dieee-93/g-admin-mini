import { Tabs, Stack, Button, Alert, Icon, Typography, Badge } from '@/shared/ui';
import { logger } from '@/lib/logging';
import { HookPoint } from '@/lib/modules';
import {
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TableCellsIcon,
  QrCodeIcon,
  PlusIcon,
  InformationCircleIcon,
  TruckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { DeliveryOrdersTab } from './DeliveryOrders/DeliveryOrdersTab';
import { AppointmentsTab } from './AppointmentsTab';

// 🔍 DEBUG: Check imports
logger.debug('SalesStore', '🔍 SalesManagement Imports:', {
  Tabs: typeof Tabs,
  Stack: typeof Stack,
  Button: typeof Button,
  Alert: typeof Alert,
  Icon: typeof Icon,
  Typography: typeof Typography,
  Badge: typeof Badge
});

interface OrderData {
  items: Array<{ productId: string; quantity: number }>;
  customerId?: string;
  tableId?: string;
}

interface PaymentData {
  amount: number;
  method: string;
  tip?: number;
}

interface SalesManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOrderPlace?: (orderData: OrderData) => void;
  onPaymentProcess?: (paymentData: PaymentData) => void;
  onNewSale?: () => void;
  performanceMode?: boolean;
}

export function SalesManagement({
  activeTab,
  onTabChange,
  onNewSale
}: SalesManagementProps) {
  // onOrderPlace, onPaymentProcess, performanceMode are available but not yet implemented
  // TODO: Implement order placement and payment processing handlers
  logger.debug('SalesStore', '🔍 SalesManagement Rendering - Tabs API fixed to use .Tab and .Panel');

  return (
    <Tabs.Root value={activeTab} onValueChange={(details) => onTabChange(details.value)}>
      <Tabs.List>
        <Tabs.Trigger value="pos">
          <Icon icon={CreditCardIcon} size="sm" />
          POS
        </Tabs.Trigger>
        <Tabs.Trigger value="analytics">
          <Icon icon={ChartBarIcon} size="sm" />
          Analytics
        </Tabs.Trigger>
        <Tabs.Trigger value="reports">
          <Icon icon={DocumentTextIcon} size="sm" />
          Reportes
        </Tabs.Trigger>
        <Tabs.Trigger value="delivery">
          <Icon icon={TruckIcon} size="sm" />
          Delivery Orders
        </Tabs.Trigger>
        <Tabs.Trigger value="appointments">
          <Icon icon={CalendarIcon} size="sm" />
          Appointments
        </Tabs.Trigger>

        {/* 🎯 HOOK POINT: External modules can inject tabs here */}
        <HookPoint
          name="sales.tabs"
          data={{ activeTab, onTabChange }}
          direction="row"
          gap="0"
        />
      </Tabs.List>

      <Tabs.Content value="pos">
        <Stack gap="lg">
          {/* Sistema POS Principal */}
          <Stack direction="row" gap="sm" align="center" mb="md">
            <Icon icon={CreditCardIcon} size="lg" color="teal.600" />
            <Badge variant="subtle" colorPalette="teal">Principal</Badge>
            <Badge variant="solid" colorPalette="green">Live</Badge>
          </Stack>

          <Typography variant="body" mb="md">
            Sistema de punto de venta integrado con gestión de inventario en tiempo real.
          </Typography>

          <Stack direction="row" gap="md" flexWrap="wrap">
            <Button
              variant="solid"
              size="lg"
              onClick={onNewSale}
              colorPalette="teal"
            >
              <Icon icon={PlusIcon} size="sm" />
              Nueva Venta
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.info('SalesStore', 'Ver Historial')}
            >
              Ver Historial
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesManagement', 'Gestión Mesas')}
            >
              <Icon icon={TableCellsIcon} size="sm" />
              Gestión Mesas
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesManagement', 'Códigos QR')}
            >
              <Icon icon={QrCodeIcon} size="sm" />
              Códigos QR
            </Button>
          </Stack>

          {/* Información adicional */}
          <Alert
            variant="subtle"
            icon={<Icon icon={InformationCircleIcon} size="sm" />}
            title="Punto de Venta Activo"
            description="El sistema POS está funcionando correctamente. Todas las integraciones activas."
          />
        </Stack>
      </Tabs.Content>

      <Tabs.Content value="analytics">
        <Stack gap="lg">
          <Typography variant="heading" size="lg" mb="md">
            Analytics de Ventas
          </Typography>

          <Typography variant="body" color="text.muted" mb="lg">
            Análisis en tiempo real de performance de ventas, tendencias y oportunidades de optimización.
          </Typography>

          <Stack direction="row" gap="md" flexWrap="wrap">
            <Button
              variant="solid"
              colorPalette="blue"
              onClick={() => logger.debug('SalesManagement', 'Análisis Profundo')}
            >
              <Icon icon={ChartBarIcon} size="sm" />
              Análisis Profundo
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesManagement', 'Revenue Trends')}
            >
              Revenue Trends
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesManagement', 'Customer Insights')}
            >
              Customer Insights
            </Button>
          </Stack>

          <Alert
            variant="subtle"
            title="Analytics Disponibles"
            description="Revenue patterns, conversion rates, customer behavior y correlaciones cross-módulo."
          />
        </Stack>
      </Tabs.Content>

      <Tabs.Content value="reports">
        <Stack gap="lg">
          <Typography variant="heading" size="lg" mb="md">
            Reportes y Documentación
          </Typography>

          <Typography variant="body" color="text.muted" mb="lg">
            Genera reportes detallados de ventas, performance y análisis financiero.
          </Typography>

          <Stack direction="row" gap="md" flexWrap="wrap">
            <Button
              variant="solid"
              colorPalette="purple"
              onClick={() => logger.debug('SalesManagement', 'Reporte Diario')}
            >
              <Icon icon={DocumentTextIcon} size="sm" />
              Reporte Diario
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesManagement', 'Reporte Semanal')}
            >
              Reporte Semanal
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesManagement', 'Reporte Mensual')}
            >
              Reporte Mensual
            </Button>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesManagement', 'Export Data')}
            >
              Export Data
            </Button>
          </Stack>

          <Alert
            variant="subtle"
            title="Reportes Programados"
            description="Los reportes se generan automáticamente y están disponibles para descarga."
          />
        </Stack>
      </Tabs.Content>

      <Tabs.Content value="delivery">
        <DeliveryOrdersTab />
      </Tabs.Content>

      <Tabs.Content value="appointments">
        <AppointmentsTab />
      </Tabs.Content>

      {/* 🎯 HOOK POINT: External modules can inject tab content here */}
      <HookPoint
        name="sales.tab_content"
        data={{ activeTab, onTabChange }}
        direction="column"
        gap="4"
      />
    </Tabs.Root>
  );
}