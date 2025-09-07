// DashboardReports.tsx - Custom Reporting and Advanced Reports (migrated from tools)
import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Tabs,
  Alert
} from '@chakra-ui/react';
import {
  DocumentChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { Icon, CardWrapper } from '@/shared/ui';

const DashboardReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('custom');

  // Mock custom reports
  const customReports = [
    {
      id: 'sales_monthly',
      name: 'Monthly Sales Report',
      description: 'Comprehensive monthly sales analysis',
      type: 'scheduled',
      format: 'PDF',
      schedule: 'Monthly',
      lastRun: '2025-01-01',
      status: 'active',
      owner: 'Sales Manager',
      recipients: ['manager@restaurant.com', 'owner@restaurant.com']
    },
    {
      id: 'inventory_weekly',
      name: 'Weekly Inventory Report',
      description: 'Stock levels and reorder recommendations',
      type: 'scheduled',
      format: 'Excel',
      schedule: 'Weekly',
      lastRun: '2025-01-10',
      status: 'active',
      owner: 'Inventory Manager',
      recipients: ['inventory@restaurant.com']
    },
    {
      id: 'customer_analysis',
      name: 'Customer Analytics Dashboard',
      description: 'RFM analysis and customer segmentation',
      type: 'on_demand',
      format: 'Interactive',
      schedule: 'On-demand',
      lastRun: '2025-01-12',
      status: 'active',
      owner: 'Marketing Manager',
      recipients: []
    }
  ];

  // Mock quick reports
  const quickReports = [
    {
      id: 'daily_sales',
      title: 'Daily Sales Summary',
      description: 'Today\'s sales performance overview',
      icon: CurrencyDollarIcon,
      estimatedTime: '30 seconds'
    },
    {
      id: 'stock_status',
      title: 'Current Stock Status',
      description: 'Real-time inventory levels',
      icon: TableCellsIcon,
      estimatedTime: '15 seconds'
    },
    {
      id: 'customer_summary',
      title: 'Customer Activity',
      description: 'Recent customer interactions',
      icon: UsersIcon,
      estimatedTime: '45 seconds'
    },
    {
      id: 'financial_overview',
      title: 'Financial Overview',
      description: 'Revenue and costs summary',
      icon: ChartPieIcon,
      estimatedTime: '1 minute'
    }
  ];

  // Report templates
  const reportTemplates = [
    {
      id: 'sales_template',
      name: 'Sales Performance',
      description: 'Comprehensive sales analysis template',
      category: 'Sales',
      metrics: ['Revenue', 'Orders', 'Average Order Value', 'Top Products'],
      visualizations: ['Line Charts', 'Bar Charts', 'Tables']
    },
    {
      id: 'inventory_template',
      name: 'Inventory Analysis',
      description: 'Stock management and optimization',
      category: 'Inventory',
      metrics: ['Stock Levels', 'Turnover Rate', 'ABC Classification', 'Waste Analysis'],
      visualizations: ['Stock Charts', 'Heat Maps', 'Distribution Charts']
    },
    {
      id: 'customer_template',
      name: 'Customer Insights',
      description: 'Customer behavior and segmentation',
      category: 'Customer',
      metrics: ['RFM Scores', 'Lifetime Value', 'Churn Rate', 'Satisfaction'],
      visualizations: ['Segmentation Charts', 'Journey Maps', 'Cohort Analysis']
    },
    {
      id: 'financial_template',
      name: 'Financial Analysis',
      description: 'Profitability and cost analysis',
      category: 'Financial',
      metrics: ['Profit Margins', 'Cost Centers', 'ROI', 'Budget Variance'],
      visualizations: ['P&L Charts', 'Cost Breakdown', 'Trend Analysis']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sales': return 'green';
      case 'Inventory': return 'blue';
      case 'Customer': return 'purple';
      case 'Financial': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box>
      <VStack align="start" gap="6">
        {/* Header */}
        <HStack justify="space-between" w="full">
          <VStack align="start" gap="1">
            <Text fontSize="2xl" fontWeight="bold">Custom Reports</Text>
            <Text color="gray.600">
              Create, schedule, and manage business reports
            </Text>
          </VStack>
          <Button colorPalette="blue" leftIcon={<Icon icon={PlusIcon} size="sm" />}>
            New Report
          </Button>
        </HStack>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)} w="full">
          <Tabs.List>
            <Tabs.Trigger value="custom">
              <HStack gap={2}>
                <Icon icon={DocumentChartBarIcon} size="sm" />
                <Text>Custom Reports</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="quick">
              <HStack gap={2}>
                <Icon icon={ChartBarIcon} size="sm" />
                <Text>Quick Reports</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="templates">
              <HStack gap={2}>
                <Icon icon={DocumentTextIcon} size="sm" />
                <Text>Templates</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Custom Reports Tab */}
          <Tabs.Content value="custom">
            <VStack gap="4" align="stretch">
              {customReports.map((report) => (
                <CardWrapper .Root key={report.id} variant="outline">
                  <CardWrapper .Body>
                    <HStack justify="space-between">
                      <VStack align="start" gap="3" flex="1">
                        <HStack gap="3">
                          <Icon icon={DocumentChartBarIcon} size="lg" color="var(--chakra-colors-blue-500)" />
                          <VStack align="start" gap="1">
                            <Text fontSize="lg" fontWeight="semibold">{report.name}</Text>
                            <Text fontSize="sm" color="gray.600">{report.description}</Text>
                          </VStack>
                        </HStack>
                        
                        <HStack gap="4" wrap="wrap">
                          <Badge 
                            colorPalette={getStatusColor(report.status)}
                            variant="subtle"
                          >
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.format}
                          </Badge>
                          <HStack gap="1">
                            <Icon icon={ClockIcon} size="xs" color="var(--chakra-colors-gray-500)" />
                            <Text fontSize="xs" color="gray.500">{report.schedule}</Text>
                          </HStack>
                          <HStack gap="1">
                            <Icon icon={CalendarIcon} size="xs" color="var(--chakra-colors-gray-500)" />
                            <Text fontSize="xs" color="gray.500">Last: {report.lastRun}</Text>
                          </HStack>
                        </HStack>
                        
                        <Text fontSize="xs" color="gray.500">
                          Owner: {report.owner}
                          {report.recipients.length > 0 && (
                            <> • Recipients: {report.recipients.length}</>
                          )}
                        </Text>
                      </VStack>
                      
                      <VStack gap="2">
                        <HStack gap="2">
                          <Button size="sm" variant="outline" leftIcon={<Icon icon={EyeIcon} size="xs" />}>
                            View
                          </Button>
                          <Button size="sm" variant="outline" leftIcon={<Icon icon={PencilIcon} size="xs" />}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" leftIcon={<Icon icon={ArrowDownTrayIcon} size="xs" />}>
                            Export
                          </Button>
                        </HStack>
                        <HStack gap="2">
                          <Button size="sm" colorPalette="green" leftIcon={<Icon icon={PlayIcon} size="xs" />}>
                            Run Now
                          </Button>
                          <Button size="sm" variant="outline" leftIcon={<Icon icon={CogIcon} size="xs" />}>
                            Settings
                          </Button>
                        </HStack>
                      </VStack>
                    </HStack>
                  </CardWrapper .Body>
                </CardWrapper .Root>
              ))}
            </VStack>
          </Tabs.Content>

          {/* Quick Reports Tab */}
          <Tabs.Content value="quick">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              {quickReports.map((report) => {
                const IconComponent = report.icon;
                return (
                  <CardWrapper .Root 
                    key={report.id} 
                    variant="outline"
                    cursor="pointer"
                    _hover={{ 
                      borderColor: 'blue.300',
                      transform: 'translateY(-2px)',
                      shadow: 'md'
                    }}
                    transition="all 0.2s"
                  >
                    <CardWrapper .Body>
                      <VStack align="start" gap="4">
                        <HStack gap="3">
                          <Icon icon={IconComponent} size="2xl" color="var(--chakra-colors-blue-500)" />
                          <VStack align="start" gap="1">
                            <Text fontSize="lg" fontWeight="semibold">{report.title}</Text>
                            <Text fontSize="sm" color="gray.600">{report.description}</Text>
                          </VStack>
                        </HStack>
                        
                        <HStack justify="space-between" w="full">
                          <HStack gap="1">
                            <Icon icon={ClockIcon} size="xs" color="var(--chakra-colors-gray-500)" />
                            <Text fontSize="xs" color="gray.500">{report.estimatedTime}</Text>
                          </HStack>
                          <Button size="sm" colorPalette="blue">
                            Generate
                          </Button>
                        </HStack>
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                );
              })}
            </SimpleGrid>
          </Tabs.Content>

          {/* Templates Tab */}
          <Tabs.Content value="templates">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              {reportTemplates.map((template) => (
                <CardWrapper .Root key={template.id} variant="outline">
                  <CardWrapper .Body>
                    <VStack align="start" gap="4">
                      <HStack justify="space-between" w="full">
                        <VStack align="start" gap="1">
                          <Text fontSize="lg" fontWeight="semibold">{template.name}</Text>
                          <Text fontSize="sm" color="gray.600">{template.description}</Text>
                        </VStack>
                        <Badge 
                          colorPalette={getCategoryColor(template.category)}
                          variant="subtle"
                        >
                          {template.category}
                        </Badge>
                      </HStack>
                      
                      <VStack align="start" gap="2" w="full">
                        <Text fontSize="sm" fontWeight="medium">Included Metrics:</Text>
                        <HStack wrap="wrap" gap="1">
                          {template.metrics.map((metric, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {metric}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                      
                      <VStack align="start" gap="2" w="full">
                        <Text fontSize="sm" fontWeight="medium">Visualizations:</Text>
                        <HStack wrap="wrap" gap="1">
                          {template.visualizations.map((viz, index) => (
                            <Badge key={index} colorPalette="gray" variant="subtle" size="sm">
                              {viz}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                      
                      <Button 
                        size="sm" 
                        colorPalette="blue" 
                        w="full"
                        leftIcon={<Icon icon={PlusIcon} size="xs" />}
                      >
                        Use Template
                      </Button>
                    </VStack>
                  </CardWrapper .Body>
                </CardWrapper .Root>
              ))}
            </SimpleGrid>
          </Tabs.Content>
        </Tabs.Root>

        {/* Report Builder Hint */}
        <Alert.Root status="info">
          <Icon icon={DocumentChartBarIcon} size="sm" />
          <Alert.Title>Report Builder</Alert.Title>
          <Alert.Description>
            Use our drag-and-drop report builder to create custom reports with real-time data from all modules.
          </Alert.Description>
        </Alert.Root>
      </VStack>
    </Box>
  );
};

export default DashboardReports;