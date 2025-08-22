// Sales Page - Redesigned with prioritized actions and better organization
import { useEffect, useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Badge, 
  Card, 
  Heading, 
  Button, 
  Center,
  Skeleton,
  Collapsible
} from '@chakra-ui/react';
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

// Import existing components
import { SalesView } from './components/SalesView';
import { TableFloorPlan } from './components/TableManagement/TableFloorPlan';
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

// Loading skeleton component
const LoadingSkeleton = () => (
  <VStack gap={4}>
    <Skeleton height="60px" />
    <Skeleton height="40px" />
    <Skeleton height="80px" />
  </VStack>
);

// Empty state component
const EmptyState = ({ title, description, icon: Icon }: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }> 
}) => (
  <Center minH="200px">
    <VStack gap={4} textAlign="center">
      <Icon className="w-12 h-12 text-gray-400" />
      <VStack gap={2}>
        <Text fontWeight="semibold" color="gray.600">{title}</Text>
        <Text fontSize="sm" color="gray.500">{description}</Text>
      </VStack>
    </VStack>
  </Center>
);

export default function SalesPage() {
  const { setQuickActions } = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    tables: false,
    kitchen: false,
    analytics: false
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <VStack gap={6} p={4} maxW="container.xl" mx="auto">
        {/* MAIN HEADER with Primary CTA */}
        <Card.Root>
          <Card.Body>
            <HStack justify="space-between" align="center">
              <HStack gap={4}>
                <Box p={3} bg="teal.100" borderRadius="lg">
                  <ComputerDesktopIcon className="w-8 h-8 text-teal-600" />
                </Box>
                <VStack align="start" gap={1}>
                  <HStack>
                    <Text fontSize="2xl" fontWeight="bold">Sistema de Ventas</Text>
                    <Badge colorPalette="green" variant="subtle">Live</Badge>
                  </HStack>
                  <Text color="gray.600" fontSize="sm">
                    POS inteligente con gestión completa de ventas
                  </Text>
                </VStack>
              </HStack>
              
              {/* PRIMARY CTA - Highlighted */}
              <Button 
                size="lg" 
                colorPalette="teal" 
                variant="solid"
                leftIcon={<PlusIcon className="w-5 h-5" />}
                onClick={() => console.log('New sale')}
              >
                Nueva Venta
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* FEATURED SECTION - POS System (Always Visible) */}
        <Card.Root>
          <Card.Header>
            <HStack justify="space-between">
              <HStack gap={3}>
                <CreditCardIcon className="w-6 h-6 text-teal-600" />
                <Heading size="lg">Sistema POS</Heading>
                <Badge colorPalette="teal" variant="subtle">Principal</Badge>
              </HStack>
              <Button variant="ghost" size="sm" leftIcon={<EyeIcon className="w-4 h-4" />}>
                Vista Completa
              </Button>
            </HStack>
          </Card.Header>
          <Card.Body>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <SalesView showConnectionStatus={true} />
            )}
          </Card.Body>
        </Card.Root>

        {/* COLLAPSIBLE SECONDARY SECTIONS */}
        <VStack gap={4} align="stretch" width="100%">
          
          {/* Table Management */}
          <Card.Root>
            <Card.Header 
              as="button" 
              onClick={() => toggleSection('tables')}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              transition="background 0.2s"
            >
              <HStack justify="space-between" w="100%">
                <HStack gap={3}>
                  <TableCellsIcon className="w-6 h-6 text-blue-600" />
                  <Heading size="md">Gestión de Mesas</Heading>
                  <Badge colorPalette="blue" variant="outline">
                    {mockTables.length} mesas
                  </Badge>
                </HStack>
                <ChevronDownIcon 
                  className={`w-5 h-5 transition-transform ${sectionsExpanded.tables ? 'rotate-180' : ''}`}
                />
              </HStack>
            </Card.Header>
            <Collapsible.Root open={sectionsExpanded.tables}>
              <Collapsible.Content>
                <Card.Body>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : mockTables.length > 0 ? (
                    <TableFloorPlan tables={mockTables} onTableSelect={() => {}} />
                  ) : (
                    <EmptyState 
                      title="No hay mesas configuradas"
                      description="Configura las mesas de tu restaurante para comenzar"
                      icon={TableCellsIcon}
                    />
                  )}
                </Card.Body>
              </Collapsible.Content>
            </Collapsible.Root>
          </Card.Root>

          {/* Kitchen Display */}
          <Card.Root>
            <Card.Header 
              as="button" 
              onClick={() => toggleSection('kitchen')}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              transition="background 0.2s"
            >
              <HStack justify="space-between" w="100%">
                <HStack gap={3}>
                  <ClipboardDocumentListIcon className="w-6 h-6 text-orange-600" />
                  <Heading size="md">Display de Cocina</Heading>
                  <Badge colorPalette="orange" variant="outline">
                    {mockOrders.length} órdenes
                  </Badge>
                </HStack>
                <ChevronDownIcon 
                  className={`w-5 h-5 transition-transform ${sectionsExpanded.kitchen ? 'rotate-180' : ''}`}
                />
              </HStack>
            </Card.Header>
            <Collapsible.Root open={sectionsExpanded.kitchen}>
              <Collapsible.Content>
                <Card.Body>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : mockOrders.length > 0 ? (
                    <KitchenDisplaySystem orders={mockOrders} />
                  ) : (
                    <EmptyState 
                      title="No hay órdenes pendientes"
                      description="Las órdenes aparecerán aquí cuando se realicen ventas"
                      icon={ClipboardDocumentListIcon}
                    />
                  )}
                </Card.Body>
              </Collapsible.Content>
            </Collapsible.Root>
          </Card.Root>

          {/* Sales Analytics */}
          <Card.Root>
            <Card.Header 
              as="button" 
              onClick={() => toggleSection('analytics')}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              transition="background 0.2s"
            >
              <HStack justify="space-between" w="100%">
                <HStack gap={3}>
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  <Heading size="md">Analytics de Ventas</Heading>
                  <Badge colorPalette="purple" variant="outline">v3.0</Badge>
                </HStack>
                <ChevronDownIcon 
                  className={`w-5 h-5 transition-transform ${sectionsExpanded.analytics ? 'rotate-180' : ''}`}
                />
              </HStack>
            </Card.Header>
            <Collapsible.Root open={sectionsExpanded.analytics}>
              <Collapsible.Content>
                <Card.Body>
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : (
                    <SalesIntelligenceDashboard 
                      analytics={{}}
                      onDateRangeChange={() => {}}
                      onRefresh={() => {}}
                    />
                  )}
                </Card.Body>
              </Collapsible.Content>
            </Collapsible.Root>
          </Card.Root>
        </VStack>

        {/* QUICK ACCESS FOOTER */}
        <Card.Root>
          <Card.Body>
            <VStack gap={3}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                Accesos Rápidos
              </Text>
              <HStack gap={3} justify="center" wrap="wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<QrCodeIcon className="w-4 h-4" />}
                  onClick={() => console.log('QR codes')}
                >
                  Códigos QR
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  onClick={() => window.location.reload()}
                >
                  Actualizar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<PlayIcon className="w-4 h-4" />}
                  onClick={() => console.log('Quick sale')}
                >
                  Venta Rápida
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}
