// Sales Page - Redesigned with prioritized actions and better organization
import { useEffect, useState } from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, Button, Modal, Alert, Badge 
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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import existing components - Temporarily commented to avoid compilation errors
// import { SalesView } from './components/SalesView';
// import { TableFloorPlan } from './components/TableManagement/TableFloorPlan';
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
          <ComputerDesktopIcon className="w-8 h-8 text-teal-600" />
          <Stack direction="column" gap="xs">
            <Typography variant="heading" size="xl">
              Sistema de Ventas
            </Typography>
            <Stack direction="row" gap="sm">
              <Badge variant="solid" >Live</Badge>
              <Typography variant="body" size="sm" color="muted">
                POS inteligente con gestión completa
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        
        <Button variant="solid" color="accent" size="lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Venta
        </Button>
      </Stack>

      {/* Module Content */}
      <Stack direction="column" gap="lg" p="lg">
        {/* POS System Card */}
        <Card variant="elevated">
          <Card.Header>
            <Stack direction="row" align="center" gap="sm">
              <CreditCardIcon className="w-6 h-6 text-teal-600" />
              <Typography variant="heading" size="lg">Sistema POS</Typography>
              <Badge variant="subtle" color="accent">Principal</Badge>
            </Stack>
          </Card.Header>
          <Card.Body>
            <Stack direction="column" gap="md">
              <Typography variant="body">
                Sistema de punto de venta integrado con gestión de inventario en tiempo real.
              </Typography>
              <Stack direction="row" gap="md">
                <Button variant="solid" >
                  Procesar Venta
                </Button>
                <Button variant="outline">
                  Ver Historial
                </Button>
              </Stack>
            </Stack>
          </Card.Body>
        </CardWrapper>

        {/* Quick Actions */}
        <Stack direction="row" gap="md">
          <Card variant="outline" flex="1">
            <Card.Body>
              <Stack direction="row" align="center" gap="sm">
                <TableCellsIcon className="w-5 h-5 text-blue-600" />
                <Typography variant="body" weight="medium">Gestión de Mesas</Typography>
              </Stack>
            </Card.Body>
          </CardWrapper>

          <Card variant="outline" flex="1">
            <Card.Body>
              <Stack direction="row" align="center" gap="sm">
                <QrCodeIcon className="w-5 h-5 text-green-600" />
                <Typography variant="body" weight="medium">Códigos QR</Typography>
              </Stack>
            </Card.Body>
          </CardWrapper>

          <Card variant="outline" flex="1">
            <Card.Body>
              <Stack direction="row" align="center" gap="sm">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                <Typography variant="body" weight="medium">Analytics</Typography>
              </Stack>
            </Card.Body>
          </CardWrapper>
        </Stack>
      </Stack>
    </Layout>
  );
}
