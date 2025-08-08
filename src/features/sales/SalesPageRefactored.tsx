// Refactored Sales Page with improved navigation
import { useState, useEffect } from 'react';
import { Box, VStack, Text, Tabs, Badge } from '@chakra-ui/react';
import { CreditCardIcon, TableCellsIcon, ChartBarIcon, QrCodeIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import existing components
import { SalesWithStockView } from './components/SaleWithStockView';
import { TableFloorPlan } from './components/TableManagement/TableFloorPlan';
import { QRCodeGenerator } from './components/QROrdering/QRCodeGenerator';
import { KitchenDisplaySystem } from './components/OrderManagement/KitchenDisplaySystem';
import { SalesIntelligenceDashboard } from './components/Analytics/SalesIntelligenceDashboard';
import { SalesNavigation } from './components/Navigation/SalesNavigation';

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

const mockAnalytics = {
  daily_revenue: 2500,
  monthly_revenue: 75000,
  average_order_value: 35.50,
  sales_per_labor_hour: 125,
  food_cost_percentage: 28,
  gross_profit_margin: 72,
  average_covers: 120,
  covers_trend: 'up' as const,
  table_utilization: 85,
  table_turnover_rate: 2.3,
  average_service_time: 35,
  customer_acquisition_cost: 15,
  repeat_customer_rate: 65,
  customer_lifetime_value: 450,
  peak_hours_analysis: [],
  seasonal_trends: [],
  menu_item_performance: [],
  current_day_metrics: {
    current_revenue: 850,
    orders_in_progress: 5,
    tables_occupied: 8,
    average_wait_time: 12,
    kitchen_backlog: 3
  },
  alerts_and_insights: []
};

export default function SalesPageRefactored() {
  const { setQuickActions } = useNavigation();
  const [activeSection, setActiveSection] = useState('pos');
  const [activeSubSection, setActiveSubSection] = useState<string | undefined>();

  const handleSectionChange = (section: string, subSection?: string) => {
    setActiveSection(section);
    setActiveSubSection(subSection);
  };

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-sale',
        label: 'Nueva Venta',
        icon: CreditCardIcon,
        action: () => handleSectionChange('pos'),
        color: 'blue'
      },
      {
        id: 'table-management',
        label: 'Gestionar Mesas',
        icon: TableCellsIcon,
        action: () => handleSectionChange('tables'),
        color: 'green'
      },
      {
        id: 'analytics',
        label: 'Ver Analytics',
        icon: ChartBarIcon,
        action: () => handleSectionChange('analytics', 'dashboard'),
        color: 'teal'
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
        return (
          <TableFloorPlan
            tables={mockTables}
            onTableSelect={(table) => console.log('Selected table:', table)}
            onSeatParty={(tableId, partySize, customerName) => 
              console.log('Seating party:', { tableId, partySize, customerName })
            }
            onUpdateTableStatus={(tableId, status) => 
              console.log('Update table status:', { tableId, status })
            }
            onProcessPayment={(tableId) => 
              console.log('Process payment for table:', tableId)
            }
          />
        );
      case 'kitchen':
        return (
          <KitchenDisplaySystem
            orders={[]}
            onUpdateItemStatus={(orderId, itemId, status) => 
              console.log('Update item status:', { orderId, itemId, status })
            }
            onCompleteOrder={(orderId) => 
              console.log('Complete order:', orderId)
            }
            onPriorityChange={(orderId, priority) => 
              console.log('Priority change:', { orderId, priority })
            }
          />
        );
      case 'qr':
        return (
          <QRCodeGenerator
            tables={mockTables}
            onQRGenerated={(tableId, qrCode) => 
              console.log('QR generated:', { tableId, qrCode })
            }
            onQRRevoked={(tableId) => 
              console.log('QR revoked:', tableId)
            }
          />
        );
      case 'analytics':
        return (
          <SalesIntelligenceDashboard
            analytics={mockAnalytics}
            onDateRangeChange={(dateFrom, dateTo) => 
              console.log('Date range change:', { dateFrom, dateTo })
            }
            onRefresh={() => console.log('Refresh analytics')}
          />
        );
      default:
        return <SalesWithStockView />;
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" p="4">
        <VStack gap="4" align="stretch">
          <VStack align="start" gap="2">
            <Text fontSize="2xl" fontWeight="bold">G-Admin POS System</Text>
            <Text color="gray.600" fontSize="sm">
              Modern restaurant point-of-sale and management system
            </Text>
          </VStack>

          <SalesNavigation
            currentSection={activeSection}
            currentSubSection={activeSubSection}
            onSectionChange={handleSectionChange}
          />

          <Tabs.Root 
            value={activeSection} 
            onValueChange={(e) => handleSectionChange(e.value)}
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
              <Tabs.Trigger value="qr">
                <QrCodeIcon className="w-4 h-4" />
                QR Orders
              </Tabs.Trigger>
              <Tabs.Trigger value="analytics">
                <ChartBarIcon className="w-4 h-4" />
                Analytics
                <Badge colorPalette="teal" variant="subtle">v3.0</Badge>
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </VStack>
      </Box>

      <Box p="6">
        {renderContent()}
      </Box>
    </Box>
  );
}
