// Sales Page - Redesigned with prioritized actions and better organization
import { useEffect, useState } from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, Button, Modal, Alert, Badge, Box, Icon
} from '@/shared/ui';
import { 
  CreditCardIcon, 
  TableCellsIcon, 
  ChartBarIcon, 
  QrCodeIcon, 
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  PlusIcon,
  ArrowPathIcon,
  PlayIcon,
  EyeIcon,
  ChevronDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import existing components - Temporarily commented to avoid compilation errors
// import { SalesView } from './components/SalesView';
import { TableFloorPlan } from './components/TableManagement/TableFloorPlan';
// import { KitchenDisplaySystem } from './components/OrderManagement/KitchenDisplaySystem';
// import { SalesIntelligenceDashboard } from './components/Analytics/SalesIntelligenceDashboard';

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
  const { setQuickActions } = useNavigation();

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-sale',
        label: 'Nueva Venta',
        icon: CreditCardIcon,
        action: () => console.log('New sale'),
        color: 'teal'
      },
      {
        id: 'view-qr',
        label: 'Códigos QR',
        icon: QrCodeIcon,
        action: () => console.log('QR codes'),
        color: 'green'
      },
      {
        id: 'refresh-data',
        label: 'Actualizar',
        icon: ArrowPathIcon,
        action: () => window.location.reload(),
        color: 'blue'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  return (
    <Layout variant="panel">
      {/* Page Header */}
      <Stack direction="row" justify="space-between" align="center" p="lg">
        <Stack direction="row" align="center" gap="md">
          <Icon icon={ComputerDesktopIcon} size="2xl" color="teal.600" />
          <Stack direction="column" gap="xs">
            <Typography variant="heading" size="xl">
              Sistema de Ventas
            </Typography>
            <Stack direction="row" gap="sm">
              <Badge variant="solid">Live</Badge>
              <Typography variant="body" size="sm" color="text.muted">
                POS inteligente con gestión completa
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        
        <Button variant="solid" color="text.primary" size="lg">
          <Icon icon={PlusIcon} size="sm" />
          Nueva Venta
        </Button>
      </Stack>

      {/* Module Content */}
      <Stack direction="column" gap="lg" p="lg">
        {/* POS System CardWrapper  */}
        <CardWrapper variant="elevated">
          <CardWrapper.Header>
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={CreditCardIcon} size="lg" color="teal.600" />
              <Typography variant="heading" size="lg">Sistema POS</Typography>
              <Badge variant="subtle" color="text.primary">Principal</Badge>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack direction="column" gap="md">
              <Typography variant="body">
                Sistema de punto de venta integrado con gestión de inventario en tiempo real.
              </Typography>
              <Stack direction="row" gap="md">
                <Button variant="solid">
                  Procesar Venta
                </Button>
                <Button variant="outline">
                  Ver Historial
                </Button>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Table Management */}
        <CardWrapper variant="elevated">
          <CardWrapper.Header>
            <Stack direction="row" justify="space-between" align="center">
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={TableCellsIcon} size="lg" color="blue.600" />
                <Typography variant="heading" size="lg">Gestión de Mesas</Typography>
              </Stack>
              <Button variant="ghost" size="sm">Ver Todas</Button>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Alert
              variant="subtle"
              icon={<Icon icon={InformationCircleIcon} size="sm" />}
              title="Seleccione una mesa para iniciar una nueva venta."
            />
            <Box mt={4}>
              <TableFloorPlan />
            </Box>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Other Actions */}
        <Stack direction="row" gap="md">
          <CardWrapper variant="outline" flex="1">
            <CardWrapper.Body>
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={QrCodeIcon} size="sm" color="green.600" />
                <Typography variant="body" weight="medium">Códigos QR</Typography>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="outline" flex="1">
            <CardWrapper.Body>
              <Stack direction="row" align="center" gap="sm">
                <Icon icon={ChartBarIcon} size="sm" color="purple.600" />
                <Typography variant="body" weight="medium">Analytics</Typography>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </Stack>
      </Stack>
    </Layout>
  );
}