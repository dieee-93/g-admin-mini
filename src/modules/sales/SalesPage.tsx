// Sales Page - Unified dashboard without nested tabs  
import { useEffect } from 'react';
import { Box, VStack, HStack, Text, Badge, Card, Grid, SimpleGrid, Heading } from '@chakra-ui/react';
import { 
  CreditCardIcon, 
  TableCellsIcon, 
  ChartBarIcon, 
  QrCodeIcon, 
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import existing components
import { SalesView } from './components/SalesView';
import { TableFloorPlan } from './components/TableManagement/TableFloorPlan';
import { QRCodeGenerator } from './components/QROrdering/QRCodeGenerator';
import { KitchenDisplaySystem } from './components/OrderManagement/KitchenDisplaySystem';
import { SalesIntelligenceDashboard } from './components/Analytics/SalesIntelligenceDashboard';

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
        color: 'blue'
      },
      {
        id: 'view-qr',
        label: 'Códigos QR',
        icon: QrCodeIcon,
        action: () => console.log('QR codes'),
        color: 'green'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" p="4">
        <VStack gap="4" align="stretch">
          {/* UNIFIED PATTERN: Header with icon, badges, KPIs */}
          <Card.Root>
            <Card.Body>
              <HStack gap="4">
                <Box p="2" bg="blue.100" borderRadius="md">
                  <ComputerDesktopIcon className="w-8 h-8 text-blue-600" />
                </Box>
                <VStack align="start" gap="1">
                  <HStack>
                    <Text fontSize="2xl" fontWeight="bold">
                      G-Admin POS System
                    </Text>
                    <Badge colorPalette="green" variant="subtle">
                      Live
                    </Badge>
                    <Badge colorPalette="teal" variant="subtle">
                      v3.0
                    </Badge>
                  </HStack>
                  <Text color="gray.600" fontSize="sm">
                    Modern restaurant point-of-sale and management system with real-time analytics
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

        {/* Sales Dashboard - No nested tabs */}
        <VStack gap={6} align="stretch">
          {/* Sales Overview Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <CreditCardIcon className="w-8 h-8 text-green-600" />
                  <Heading size="sm">POS Sistema</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Punto de venta inteligente
                  </Text>
                  <Badge colorPalette="green" variant="subtle">Smart</Badge>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <TableCellsIcon className="w-8 h-8 text-blue-600" />
                  <Heading size="sm">Gestión de Mesas</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Control de ocupación
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <ClipboardDocumentListIcon className="w-8 h-8 text-orange-600" />
                  <Heading size="sm">Sistema de Cocina</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Órdenes en tiempo real
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <ChartBarIcon className="w-8 h-8 text-purple-600" />
                  <Heading size="sm">Analytics</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Inteligencia de ventas
                  </Text>
                  <Badge colorPalette="teal" variant="subtle">v3.0</Badge>
                </VStack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>

          {/* All sections displayed together */}
          <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
            <Card.Root>
              <Card.Header>
                <Heading size="md">Sistema POS</Heading>
              </Card.Header>
              <Card.Body>
                <SalesView showConnectionStatus={true} />
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <Heading size="md">Gestión de Mesas</Heading>
              </Card.Header>
              <Card.Body>
                <TableFloorPlan tables={mockTables} onTableSelect={() => {}} />
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <Heading size="md">Display de Cocina</Heading>
              </Card.Header>
              <Card.Body>
                <KitchenDisplaySystem orders={mockOrders} />
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <Heading size="md">Analytics de Ventas</Heading>
              </Card.Header>
              <Card.Body>
                <SalesIntelligenceDashboard 
                  analytics={{} as any}
                  onDateRangeChange={() => {}}
                  onRefresh={() => {}}
                />
              </Card.Body>
            </Card.Root>
          </Grid>
        </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
