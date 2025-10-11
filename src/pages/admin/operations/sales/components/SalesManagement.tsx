import { Tabs, Stack, Button, Alert, Icon, Typography, Badge } from '@/shared/ui';
import { logger } from '@/lib/logging';
import {
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TableCellsIcon,
  QrCodeIcon,
  ComputerDesktopIcon,
  PlusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

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

interface SalesManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOrderPlace?: (orderData: any) => void;
  onPaymentProcess?: (paymentData: any) => void;
  onNewSale?: () => void;
  performanceMode?: boolean;
}

export function SalesManagement({
  activeTab,
  onTabChange,
  onOrderPlace,
  onPaymentProcess,
  onNewSale,
  performanceMode = false
}: SalesManagementProps) {
  logger.debug('SalesStore', '🔍 SalesManagement Rendering - Tabs API fixed to use .Tab and .Panel');

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <Tabs.List>
        <Tabs.Tab value="pos">
          <Icon icon={CreditCardIcon} size="sm" />
          POS
        </Tabs.Tab>
        <Tabs.Tab value="analytics">
          <Icon icon={ChartBarIcon} size="sm" />
          Analytics
        </Tabs.Tab>
        <Tabs.Tab value="reports">
          <Icon icon={DocumentTextIcon} size="sm" />
          Reportes
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="pos">
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
              onClick={() => console.log('Gestión Mesas')}
            >
              <Icon icon={TableCellsIcon} size="sm" />
              Gestión Mesas
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Códigos QR')}
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
      </Tabs.Panel>

      <Tabs.Panel value="analytics">
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
              onClick={() => console.log('Análisis Profundo')}
            >
              <Icon icon={ChartBarIcon} size="sm" />
              Análisis Profundo
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Revenue Trends')}
            >
              Revenue Trends
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Customer Insights')}
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
      </Tabs.Panel>

      <Tabs.Panel value="reports">
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
              onClick={() => console.log('Reporte Diario')}
            >
              <Icon icon={DocumentTextIcon} size="sm" />
              Reporte Diario
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Reporte Semanal')}
            >
              Reporte Semanal
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Reporte Mensual')}
            >
              Reporte Mensual
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log('Export Data')}
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
      </Tabs.Panel>
    </Tabs>
  );
}