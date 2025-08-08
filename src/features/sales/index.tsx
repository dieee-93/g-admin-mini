// src/features/sales/index.tsx - MODERN POS SYSTEM v3.0
import { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Badge
} from '@chakra-ui/react';
import {
  CreditCardIcon,
  TableCellsIcon,
  ChartBarIcon,
  QrCodeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// 🚀 Import new POS components
import { SalesWithStockView } from './components/SaleWithStockView';
import { TableFloorPlan } from './components/TableManagement/TableFloorPlan';
import { QRCodeGenerator } from './components/QROrdering/QRCodeGenerator';
import { KitchenDisplaySystem } from './components/OrderManagement/KitchenDisplaySystem';
import { SalesIntelligenceDashboard } from './components/Analytics/SalesIntelligenceDashboard';

// Mock data - in production, these would come from your data layer
const mockTables = [
  {
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
  }
];

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

// Main POS System Component
export default function ModernPOSSystem() {
  const [activeTab, setActiveTab] = useState('pos');

  const tabs = [
    {
      value: 'pos',
      label: 'Point of Sale',
      icon: CreditCardIcon,
      component: <SalesWithStockView />,
      description: 'Process sales with stock validation'
    },
    {
      value: 'tables',
      label: 'Table Management',
      icon: TableCellsIcon,
      component: (
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
      ),
      description: 'Visual floor plan and table management'
    },
    {
      value: 'kitchen',
      label: 'Kitchen Display',
      icon: ClipboardDocumentListIcon,
      component: (
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
      ),
      description: 'Real-time kitchen order management'
    },
    {
      value: 'qr',
      label: 'QR Ordering',
      icon: QrCodeIcon,
      component: (
        <QRCodeGenerator
          tables={mockTables}
          onQRGenerated={(tableId, qrCode) => 
            console.log('QR generated:', { tableId, qrCode })
          }
          onQRRevoked={(tableId) => 
            console.log('QR revoked:', tableId)
          }
        />
      ),
      description: 'Generate QR codes for tableside ordering'
    },
    {
      value: 'analytics',
      label: 'Sales Intelligence',
      icon: ChartBarIcon,
      component: (
        <SalesIntelligenceDashboard
          analytics={mockAnalytics}
          onDateRangeChange={(dateFrom, dateTo) => 
            console.log('Date range change:', { dateFrom, dateTo })
          }
          onRefresh={() => console.log('Refresh analytics')}
        />
      ),
      description: 'Advanced analytics and business insights'
    }
  ];

  const currentTab = tabs.find(tab => tab.value === activeTab);

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" p="4">
        <VStack gap="4" align="stretch">
          <HStack justify="space-between" align="center">
            <VStack align="start" gap="1">
              <Text fontSize="2xl" fontWeight="bold">
                G-Admin POS System
              </Text>
              <Text color="gray.600" fontSize="sm">
                Modern restaurant point-of-sale and management system
              </Text>
            </VStack>
            
            <HStack gap="2">
              <Badge colorPalette="green" size="md">Live System</Badge>
              <Badge colorPalette="blue" size="md">v3.0</Badge>
            </HStack>
          </HStack>

          {/* Tab Navigation */}
          <HStack gap="2" wrap="wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              
              return (
                <Button
                  key={tab.value}
                  variant={isActive ? "solid" : "outline"}
                  colorPalette={isActive ? "blue" : "gray"}
                  onClick={() => setActiveTab(tab.value)}
                  size="sm"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </HStack>

          {/* Current Tab Description */}
          {currentTab && (
            <Text fontSize="sm" color="gray.600">
              {currentTab.description}
            </Text>
          )}
        </VStack>
      </Box>

      {/* Tab Content */}
      <Box p="6">
        {currentTab?.component}
      </Box>
    </Box>
  );
}