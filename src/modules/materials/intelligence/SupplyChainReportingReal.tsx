/**
 * Supply Chain Reporting - Real Data Version
 * Connected to actual Supabase functions instead of mock data
 */

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Table,
  Alert,
  Tabs,
  Select,
  createListCollection,
  IconButton,
  Spinner
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  CubeIcon,
  CurrencyDollarIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

// Services
import { SupplyChainDataService } from '../services/supplyChainDataService';
import type { 
  SupplyChainMetrics, 
  ItemPerformance, 
  StockAlert, 
  MonthlyStats 
} from '../services/supplyChainDataService';

// Types
interface ReportData {
  type: string;
  title: string;
  generatedAt: string;
  metrics?: SupplyChainMetrics;
  items?: ItemPerformance[];
  alerts?: StockAlert[];
  trends?: MonthlyStats[];
  summary: any;
}

export function SupplyChainReportingReal() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [topItems, setTopItems] = useState<ItemPerformance[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tab options
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: ChartBarIcon,
      description: 'Métricas generales'
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: CubeIcon,
      description: 'Análisis de inventario'
    },
    {
      id: 'alerts', 
      label: 'Alertas',
      icon: ExclamationTriangleIcon,
      description: 'Alertas de stock'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: DocumentChartBarIcon,
      description: 'Reportes generados'
    }
  ];

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [metricsData, itemsData, alertsData] = await Promise.all([
        SupplyChainDataService.getMetrics(),
        SupplyChainDataService.getItemPerformance(),
        SupplyChainDataService.getStockAlerts()
      ]);

      setMetrics(metricsData);
      setTopItems(itemsData.slice(0, 10)); // Top 10 items
      setStockAlerts(alertsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: 'inventory' | 'alerts' | 'performance' | 'trends') => {
    try {
      setIsLoading(true);
      setError(null);

      const report = await SupplyChainDataService.generateSupplyChainReport(reportType);
      setCurrentReport(report);
      setActiveTab('reports');

    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
      setError(`Error al generar el reporte de ${reportType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const renderDashboard = () => (
    <VStack gap={6} align="stretch">
      {/* Key Metrics */}
      {metrics && (
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          <Card.Root>
            <Card.Body>
              <VStack gap={2} align="center">
                <CubeIcon className="w-8 h-8 text-blue-500" />
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {metrics.totalItems}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Items</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack gap={2} align="center">
                <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${metrics.totalStockValue.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.600">Valor Total</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack gap={2} align="center">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {metrics.lowStockItems}
                </Text>
                <Text fontSize="sm" color="gray.600">Stock Bajo</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack gap={2} align="center">
                <TruckIcon className="w-8 h-8 text-purple-500" />
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {metrics.stockEntriesThisMonth}
                </Text>
                <Text fontSize="sm" color="gray.600">Entradas/Mes</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      )}

      {/* Quick Actions */}
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">Generar Reportes</Text>
        </Card.Header>
        <Card.Body>
          <HStack gap={3} flexWrap="wrap">
            <Button onClick={() => generateReport('inventory')} isLoading={isLoading}>
              <CubeIcon className="w-4 h-4" />
              Reporte de Inventario
            </Button>
            <Button onClick={() => generateReport('alerts')} isLoading={isLoading}>
              <ExclamationTriangleIcon className="w-4 h-4" />
              Alertas de Stock
            </Button>
            <Button onClick={() => generateReport('performance')} isLoading={isLoading}>
              <ChartBarIcon className="w-4 h-4" />
              Análisis Performance
            </Button>
            <Button onClick={() => generateReport('trends')} isLoading={isLoading}>
              <DocumentChartBarIcon className="w-4 h-4" />
              Tendencias
            </Button>
          </HStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );

  const renderInventory = () => (
    <VStack gap={4} align="stretch">
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">Top Items por Valor</Text>
            <Button size="sm" onClick={loadDashboardData}>
              <ArrowPathIcon className="w-4 h-4" />
              Actualizar
            </Button>
          </HStack>
        </Card.Header>
        <Card.Body>
          {topItems.length > 0 ? (
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Item</Table.ColumnHeader>
                  <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                  <Table.ColumnHeader>Stock</Table.ColumnHeader>
                  <Table.ColumnHeader>Valor Total</Table.ColumnHeader>
                  <Table.ColumnHeader>% del Total</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {topItems.map((item) => (
                  <Table.Row key={item.item_id}>
                    <Table.Cell>
                      <Text fontWeight="medium">{item.item_name}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="subtle">{item.item_type}</Badge>
                    </Table.Cell>
                    <Table.Cell>{item.current_stock}</Table.Cell>
                    <Table.Cell>${item.total_value.toFixed(2)}</Table.Cell>
                    <Table.Cell>{item.percentage_of_total.toFixed(1)}%</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <Text color="gray.500">No hay datos de inventario disponibles</Text>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );

  const renderAlerts = () => (
    <VStack gap={4} align="stretch">
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">Alertas de Stock</Text>
            <Badge colorPalette="red" size="sm">{stockAlerts.length} alertas</Badge>
          </HStack>
        </Card.Header>
        <Card.Body>
          {stockAlerts.length > 0 ? (
            <VStack gap={3} align="stretch">
              {stockAlerts.map((alert) => (
                <Alert.Root key={alert.item_id} status="error">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>{alert.item_name}</Alert.Title>
                    <Alert.Description>
                      <VStack align="stretch" gap={1} fontSize="sm">
                        <Text>Stock actual: {alert.current_stock} {alert.unit}</Text>
                        <Text>Cantidad sugerida: {alert.suggested_order_quantity} {alert.unit}</Text>
                        <Text>Costo estimado: ${alert.estimated_cost.toFixed(2)}</Text>
                        <Badge colorPalette={getUrgencyColor(alert.urgency_level)} size="sm">
                          {alert.urgency_level}
                        </Badge>
                      </VStack>
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No hay alertas de stock críticas</Text>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );

  const renderReports = () => (
    <VStack gap={4} align="stretch">
      {currentReport ? (
        <Card.Root>
          <Card.Header>
            <VStack align="stretch" gap={2}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold">{currentReport.title}</Text>
                <Badge variant="subtle">
                  {new Date(currentReport.generatedAt).toLocaleString()}
                </Badge>
              </HStack>
            </VStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              {/* Report Summary */}
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="md" fontWeight="medium" mb={2}>Resumen Ejecutivo</Text>
                <SimpleGrid columns={2} gap={4} fontSize="sm">
                  {Object.entries(currentReport.summary).map(([key, value]) => (
                    <HStack key={key} justify="space-between">
                      <Text color="gray.600">{key}:</Text>
                      <Text fontWeight="medium">{value}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Report Data Preview */}
              {currentReport.alerts && (
                <Text fontSize="sm" color="gray.600">
                  {currentReport.alerts.length} alertas encontradas
                </Text>
              )}
              
              {currentReport.items && (
                <Text fontSize="sm" color="gray.600">
                  {currentReport.items.length} items analizados
                </Text>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        <Text color="gray.500" textAlign="center" py={8}>
          No hay reportes generados. Usa el Dashboard para generar reportes.
        </Text>
      )}
    </VStack>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'inventory': return renderInventory();
      case 'alerts': return renderAlerts();
      case 'reports': return renderReports();
      default: return renderDashboard();
    }
  };

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return (
    <Box>
      {/* Tab Navigation */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
        <Tabs.List>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Tabs.Trigger key={tab.id} value={tab.id}>
                <HStack gap={2}>
                  <Icon className="w-4 h-4" />
                  <VStack gap={0} align="flex-start">
                    <Text fontSize="sm" fontWeight="medium">{tab.label}</Text>
                    <Text fontSize="xs" color="gray.500">{tab.description}</Text>
                  </VStack>
                </HStack>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        <Tabs.Content value={activeTab}>
          <Box mt={6}>
            {isLoading ? (
              <Box textAlign="center" py={12}>
                <Spinner size="lg" />
                <Text mt={4} color="gray.600">Cargando datos...</Text>
              </Box>
            ) : (
              renderTabContent()
            )}
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}

export default SupplyChainReportingReal;