// Refactored Sales Page with UNIFIED navigation pattern
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Tabs, Badge, Card } from '@chakra-ui/react';
import { 
  CreditCardIcon, 
  TableCellsIcon, 
  ChartBarIcon, 
  QrCodeIcon, 
  ClipboardDocumentListIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import existing components
import { SalesWithStockView } from './components/SaleWithStockView';
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

export default function SalesPageRefactored() {
  const { setQuickActions } = useNavigation();
  const [activeSection, setActiveSection] = useState('pos');

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-sale',
        label: 'Nueva Venta',
        icon: CreditCardIcon,
        action: () => setActiveSection('pos'),
        color: 'blue'
      },
      {
        id: 'kitchen-view',
        label: 'Ver Cocina',
        icon: ClipboardDocumentListIcon,
        action: () => setActiveSection('kitchen'),
        color: 'orange'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  const renderContent = () => {
    switch (activeSection) {
      case 'pos':
        return <SalesWithStockView />;
      case 'tables':
        return <TableFloorPlan tables={mockTables} onTableSelect={() => {}} />;
      case 'kitchen':
        return <KitchenDisplaySystem orders={mockOrders} />;
      case 'qr':
        return <QRCodeGenerator />;
      case 'analytics':
        return <SalesIntelligenceDashboard />;
      default:
        return <SalesWithStockView />;
    }
  };

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

          {/* UNIFIED PATTERN: Tabs (max 4, but we have 5 - need to reduce) */}
          <Tabs.Root 
            value={activeSection} 
            onValueChange={(e) => setActiveSection(e.value)}
            variant="line"
          >
            <Tabs.List>
              <Tabs.Trigger value="pos">
                <CreditCardIcon className="w-4 h-4" />
                Point of Sale
              </Tabs.Trigger>
              <Tabs.Trigger value="tables">
                <TableCellsIcon className="w-4 h-4" />
                Mesas
              </Tabs.Trigger>
              <Tabs.Trigger value="kitchen">
                <ClipboardDocumentListIcon className="w-4 h-4" />
                Cocina
              </Tabs.Trigger>
              <Tabs.Trigger value="analytics">
                <ChartBarIcon className="w-4 h-4" />
                Analytics
                <Badge colorPalette="teal" variant="subtle">v3.0</Badge>
              </Tabs.Trigger>
            </Tabs.List>

            {/* UNIFIED PATTERN: Content area */}
            <Tabs.Content value={activeSection}>
              <Box p="6">
                {renderContent()}
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </VStack>
      </Box>
    </Box>
  );
}
