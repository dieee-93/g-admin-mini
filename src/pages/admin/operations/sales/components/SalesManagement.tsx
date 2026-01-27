import { Tabs, Stack, Button, Alert, Icon, Typography, Badge } from '@/shared/ui';
import { logger } from '@/lib/logging';
import { HookPoint } from '@/lib/modules';
import {
  CreditCardIcon,
  DocumentTextIcon,
  QrCodeIcon,
  PlusIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { AppointmentsTab } from './AppointmentsTab';

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
  permissions?: {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canVoid: boolean;
    canExport: boolean;
  };
}

/**
 * SalesManagement - Simplified Tab Structure
 * 
 * 4 clear tabs:
 * - POS: Nueva venta (ProductTypeSelector + context views)
 * - Órdenes: Historial + tracking (includes delivery orders)
 * - Agenda: View appointments (renamed from Appointments)
 * - Reportes: Reports + Analytics combined
 */
export function SalesManagement({
  activeTab,
  onTabChange,
  onNewSale,
  permissions
}: SalesManagementProps) {
  logger.debug('SalesStore', '🔍 SalesManagement Rendering with simplified 4-tab structure');

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(details) => onTabChange(details.value)}
      lazyMount
      unmountOnExit={false}
    >
      <Tabs.List>
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

        {/* HookPoint for external tab injection */}
        <HookPoint
          name="sales.tabs"
          data={{ activeTab, onTabChange }}
          direction="row"
          gap="0"
        />
      </Tabs.List>

      {/* POS Tab - Main sales interface */}
      <Tabs.Content value="pos">
        <Stack gap="4">
          {/* Header */}
          <Stack direction="row" gap="2" align="center">
            <Icon icon={CreditCardIcon} size="lg" color="teal.600" />
            <Badge variant="subtle" colorPalette="teal">Punto de Venta</Badge>
            <Badge variant="solid" colorPalette="green">Activo</Badge>
          </Stack>

          <Typography variant="body" color="text.muted">
            Sistema de punto de venta integrado con gestión de inventario en tiempo real.
          </Typography>

          {/* Action buttons */}
          <Stack direction="row" gap="3" flexWrap="wrap">
            {permissions?.canCreate && (
              <Button
                variant="solid"
                size="lg"
                onClick={onNewSale}
                colorPalette="teal"
              >
                <Icon icon={PlusIcon} size="sm" />
                Nueva Venta
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onTabChange('orders')}
            >
              Ver Historial
            </Button>

            {/* HookPoint for POS context actions (e.g., Gestión Mesas from onsite module) */}
            <HookPoint
              name="sales.pos.quick_actions"
              data={{ onNewSale }}
              fallback={null}
            />
          </Stack>

          {/* POS System Status */}
          <Alert
            variant="subtle"
            icon={<Icon icon={InformationCircleIcon} size="sm" />}
            title="Punto de Venta Activo"
            description="El sistema POS está funcionando correctamente."
          />
        </Stack>
      </Tabs.Content>

      {/* Orders Tab - All orders including delivery */}
      <Tabs.Content value="orders">
        <Stack gap="4">
          <Typography variant="heading" size="lg">
            Historial de Órdenes
          </Typography>

          <Typography variant="body" color="text.muted">
            Gestiona todas las órdenes: ventas, delivery, pickup y appointments.
          </Typography>

          {/* Filter buttons */}
          <Stack direction="row" gap="2" flexWrap="wrap">
            <Button variant="outline" size="sm">Todas</Button>
            <Button variant="ghost" size="sm">En Proceso</Button>
            <Button variant="ghost" size="sm">Completadas</Button>
            <Button variant="ghost" size="sm">Delivery</Button>
            <Button variant="ghost" size="sm">Pickup</Button>
          </Stack>

          {/* TODO: Integrate OrdersTable component */}
          <Alert
            variant="subtle"
            title="Órdenes"
            description="Aquí se mostrará el historial de órdenes con filtros."
          />
        </Stack>
      </Tabs.Content>

      {/* Agenda Tab - Appointments view */}
      <Tabs.Content value="agenda">
        <AppointmentsTab />
      </Tabs.Content>

      {/* Reports Tab - Combined analytics & reports */}
      <Tabs.Content value="reports">
        <Stack gap="4">
          <Typography variant="heading" size="lg">
            Reportes y Analytics
          </Typography>

          <Typography variant="body" color="text.muted">
            Genera reportes y visualiza analytics de ventas.
          </Typography>

          <Stack direction="row" gap="3" flexWrap="wrap">
            <Button variant="solid" colorPalette="purple">
              <Icon icon={DocumentTextIcon} size="sm" />
              Reporte del Día
            </Button>
            <Button variant="outline">
              Reporte Semanal
            </Button>
            <Button variant="outline">
              Reporte Mensual
            </Button>
            {permissions?.canExport && (
              <Button variant="outline">
                Exportar Datos
              </Button>
            )}
          </Stack>

          <Alert
            variant="subtle"
            title="Reportes Disponibles"
            description="Revenue patterns, conversion rates, y análisis de ventas."
          />
        </Stack>
      </Tabs.Content>

      {/* HookPoint for external tab content */}
      <HookPoint
        name="sales.tab_content"
        data={{ activeTab, onTabChange }}
        direction="column"
        gap="4"
      />
    </Tabs.Root>
  );
}