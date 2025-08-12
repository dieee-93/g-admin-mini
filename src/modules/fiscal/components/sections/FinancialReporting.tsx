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
  Select,
  createListCollection,
  Alert,
  Progress,
  Tabs,
  IconButton
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { type FinancialReport } from '../../types';
import { fiscalApi } from '../../data/fiscalApi';
import { notify } from '@/lib/notifications';

interface FinancialKPI {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'percentage' | 'number';
}

const periodOptions = createListCollection({
  items: [
    { value: 'current_month', label: 'Mes Actual' },
    { value: 'last_month', label: 'Mes Anterior' },
    { value: 'current_quarter', label: 'Trimestre Actual' },
    { value: 'last_quarter', label: 'Trimestre Anterior' },
    { value: 'current_year', label: 'Año Actual' },
    { value: 'last_year', label: 'Año Anterior' },
    { value: 'custom', label: 'Período Personalizado' }
  ]
});

const reportTypeOptions = createListCollection({
  items: [
    { value: 'profit_loss', label: 'Estado de Resultados (P&L)' },
    { value: 'balance', label: 'Balance General' },
    { value: 'cash_flow', label: 'Flujo de Caja' },
    { value: 'tax_summary', label: 'Resumen Fiscal' }
  ]
});

export function FinancialReporting() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'analysis'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedReportType, setSelectedReportType] = useState('profit_loss');
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(null);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      const reports = await fiscalApi.getFinancialReports();
      setFinancialReports(reports);
      
      const kpisData = await fiscalApi.getFinancialKPIs(selectedPeriod);
      setKpis(kpisData);
      
      if (reports.length > 0) {
        const latestReport = reports.find(r => r.tipo === selectedReportType) || reports[0];
        setCurrentReport(latestReport);
      }
    } catch (error) {
      notify.error('Error al cargar reportes financieros');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      const report = await fiscalApi.generateFinancialReport(selectedReportType, selectedPeriod);
      setFinancialReports(prev => [report, ...prev]);
      setCurrentReport(report);
      notify.success('Reporte generado exitosamente');
    } catch (error) {
      notify.error('Error al generar reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      if (!currentReport) {
        notify.error('No hay reporte seleccionado');
        return;
      }
      
      await fiscalApi.exportFinancialReport(currentReport.id, format);
      notify.success(`Reporte exportado en formato ${format.toUpperCase()}`);
    } catch (error) {
      notify.error('Error al exportar reporte');
    }
  };

  const formatValue = (value: number, format: 'currency' | 'percentage' | 'number') => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ChartBarIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      default: return 'gray';
    }
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Header with Controls */}
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap="4">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">Reportes Financieros</Text>
              <HStack gap="2">
                <Select.Root
                  collection={periodOptions}
                  value={[selectedPeriod]}
                  onValueChange={(e) => setSelectedPeriod(e.value[0])}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {periodOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                
                <Select.Root
                  collection={reportTypeOptions}
                  value={[selectedReportType]}
                  onValueChange={(e) => setSelectedReportType(e.value[0])}
                  width="250px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {reportTypeOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </HStack>
            </HStack>

            <HStack gap="2" wrap="wrap">
              <Button
                size="sm"
                colorPalette="blue"
                leftIcon={<ChartBarIcon className="w-4 h-4" />}
                onClick={generateReport}
                isLoading={isGenerating}
              >
                Generar Reporte
              </Button>
              
              {currentReport && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    onClick={() => exportReport('pdf')}
                  >
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                    onClick={() => exportReport('excel')}
                  >
                    Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<PrinterIcon className="w-4 h-4" />}
                  >
                    Imprimir
                  </Button>
                </>
              )}
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Financial Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="dashboard">
            <HStack gap={2}>
              <ChartBarIcon className="w-4 h-4" />
              <Text>Dashboard</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="reports">
            <HStack gap={2}>
              <DocumentTextIcon className="w-4 h-4" />
              <Text>Reportes</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="analysis">
            <HStack gap={2}>
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <Text>Análisis</Text>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Dashboard Tab */}
          <Tabs.Content value="dashboard">
            <VStack gap="6" align="stretch">
              {/* KPI Cards */}
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                {kpis.map((kpi, index) => (
                  <Card.Root key={index} variant="subtle" bg="white">
                    <Card.Body p="4">
                      <VStack align="start" gap="2">
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {kpi.label}
                          </Text>
                          {getTrendIcon(kpi.trend)}
                        </HStack>
                        
                        <Text fontSize="2xl" fontWeight="bold">
                          {formatValue(kpi.value, kpi.format)}
                        </Text>
                        
                        <HStack gap="1">
                          <Badge 
                            colorPalette={getTrendColor(kpi.trend)} 
                            size="sm"
                          >
                            {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                          </Badge>
                          <Text fontSize="xs" color="gray.500">vs período anterior</Text>
                        </HStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </SimpleGrid>

              {/* Current Report Preview */}
              {currentReport && (
                <Card.Root>
                  <Card.Body>
                    <VStack align="stretch" gap="4">
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="semibold">
                          {reportTypeOptions.items.find(item => item.value === currentReport.tipo)?.label}
                        </Text>
                        <Badge colorPalette="blue" size="sm">
                          {currentReport.periodo_inicio} - {currentReport.periodo_fin}
                        </Badge>
                      </HStack>

                      {/* P&L Preview */}
                      {currentReport.tipo === 'profit_loss' && currentReport.ingresos && currentReport.egresos && (
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="green.600" mb="3">
                              Ingresos
                            </Text>
                            <VStack align="stretch" gap="2">
                              <HStack justify="space-between">
                                <Text fontSize="sm">Ventas Netas</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.ingresos.ventas_netas.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Otros Ingresos</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.ingresos.otros_ingresos.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between" pt="2" borderTop="1px" borderColor="gray.200">
                                <Text fontSize="sm" fontWeight="bold">Total</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                  ${currentReport.ingresos.total.toLocaleString()}
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>

                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="red.600" mb="3">
                              Egresos
                            </Text>
                            <VStack align="stretch" gap="2">
                              <HStack justify="space-between">
                                <Text fontSize="sm">Costo de Ventas</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.egresos.costo_ventas.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Gastos Operativos</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.egresos.gastos_operativos.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Gastos Admin.</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.egresos.gastos_administrativos.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Impuestos</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.egresos.impuestos.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between" pt="2" borderTop="1px" borderColor="gray.200">
                                <Text fontSize="sm" fontWeight="bold">Total</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                  ${currentReport.egresos.total.toLocaleString()}
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>

                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb="3">
                              Resultado
                            </Text>
                            <VStack align="stretch" gap="2">
                              <HStack justify="space-between">
                                <Text fontSize="sm">Resultado Bruto</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.resultado?.bruto.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Resultado Operativo</Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  ${currentReport.resultado?.operativo.toLocaleString()}
                                </Text>
                              </HStack>
                              <HStack justify="space-between" pt="2" borderTop="1px" borderColor="gray.200">
                                <Text fontSize="sm" fontWeight="bold">Resultado Neto</Text>
                                <Text fontSize="sm" fontWeight="bold" 
                                      color={(currentReport.resultado?.neto || 0) >= 0 ? 'green.600' : 'red.600'}>
                                  ${currentReport.resultado?.neto.toLocaleString()}
                                </Text>
                              </HStack>
                              
                              <Box mt="3">
                                <Text fontSize="xs" color="gray.600" mb="2">Márgenes</Text>
                                <VStack align="stretch" gap="1">
                                  <HStack justify="space-between">
                                    <Text fontSize="xs">Margen Bruto</Text>
                                    <Text fontSize="xs">{currentReport.resultado?.margen_bruto.toFixed(1)}%</Text>
                                  </HStack>
                                  <HStack justify="space-between">
                                    <Text fontSize="xs">Margen Operativo</Text>
                                    <Text fontSize="xs">{currentReport.resultado?.margen_operativo.toFixed(1)}%</Text>
                                  </HStack>
                                </VStack>
                              </Box>
                            </VStack>
                          </Box>
                        </SimpleGrid>
                      )}

                      {/* Tax Summary Preview */}
                      {currentReport.tipo === 'tax_summary' && currentReport.resumen_impuestos && (
                        <SimpleGrid columns={{ base: 2, md: 3 }} gap="4">
                          <Card.Root variant="outline">
                            <Card.Body textAlign="center" p="4">
                              <VStack gap="2">
                                <Text fontSize="lg" fontWeight="bold" color="red.600">
                                  ${currentReport.resumen_impuestos.iva_a_pagar.toLocaleString()}
                                </Text>
                                <Text fontSize="sm" color="gray.600">IVA a Pagar</Text>
                              </VStack>
                            </Card.Body>
                          </Card.Root>

                          <Card.Root variant="outline">
                            <Card.Body textAlign="center" p="4">
                              <VStack gap="2">
                                <Text fontSize="lg" fontWeight="bold" color="orange.600">
                                  ${currentReport.resumen_impuestos.ingresos_brutos.toLocaleString()}
                                </Text>
                                <Text fontSize="sm" color="gray.600">Ingresos Brutos</Text>
                              </VStack>
                            </Card.Body>
                          </Card.Root>

                          <Card.Root variant="outline">
                            <Card.Body textAlign="center" p="4">
                              <VStack gap="2">
                                <Text fontSize="lg" fontWeight="bold" color="purple.600">
                                  ${currentReport.resumen_impuestos.total_obligaciones.toLocaleString()}
                                </Text>
                                <Text fontSize="sm" color="gray.600">Total Obligaciones</Text>
                              </VStack>
                            </Card.Body>
                          </Card.Root>
                        </SimpleGrid>
                      )}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}
            </VStack>
          </Tabs.Content>

          {/* Reports Tab */}
          <Tabs.Content value="reports">
            <Card.Root>
              <Card.Body>
                <VStack align="stretch" gap="4">
                  <Text fontSize="md" fontWeight="semibold">Historial de Reportes</Text>
                  
                  {financialReports.length === 0 ? (
                    <Alert.Root status="info" variant="subtle">
                      <Alert.Description>
                        No hay reportes generados. Utilice el botón "Generar Reporte" para crear uno nuevo.
                      </Alert.Description>
                    </Alert.Root>
                  ) : (
                    <Table.Root size="sm">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                          <Table.ColumnHeader>Período</Table.ColumnHeader>
                          <Table.ColumnHeader>Generado</Table.ColumnHeader>
                          <Table.ColumnHeader>Por</Table.ColumnHeader>
                          <Table.ColumnHeader>Estado</Table.ColumnHeader>
                          <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {financialReports.slice(0, 10).map((report) => (
                          <Table.Row key={report.id}>
                            <Table.Cell>
                              <Text fontSize="sm">
                                {reportTypeOptions.items.find(item => item.value === report.tipo)?.label}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">
                                {report.periodo_inicio} - {report.periodo_fin}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">
                                {new Date(report.generated_at).toLocaleDateString()}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">{report.generated_by}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette="green" size="sm">
                                Completado
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <HStack gap="1">
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  aria-label="Ver reporte"
                                  onClick={() => setCurrentReport(report)}
                                >
                                  <EyeIcon className="w-3 h-3" />
                                </IconButton>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  aria-label="Descargar PDF"
                                  onClick={() => exportReport('pdf')}
                                >
                                  <ArrowDownTrayIcon className="w-3 h-3" />
                                </IconButton>
                              </HStack>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* Analysis Tab */}
          <Tabs.Content value="analysis">
            <Card.Root>
              <Card.Body>
                <VStack align="stretch" gap="4">
                  <Text fontSize="md" fontWeight="semibold">Análisis Financiero</Text>
                  
                  <Alert.Root status="info" variant="subtle">
                    <Alert.Description>
                      El análisis financiero avanzado con gráficos y tendencias estará disponible próximamente.
                      Incluirá análisis de rentabilidad, flujo de caja, y proyecciones financieras.
                    </Alert.Description>
                  </Alert.Root>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
                    <Card.Root variant="outline">
                      <Card.Body>
                        <VStack align="start" gap="4">
                          <Text fontSize="sm" fontWeight="semibold">Análisis de Tendencias</Text>
                          <Box h="200px" bg="gray.50" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                            <Text color="gray.500">Gráfico de tendencias - Próximamente</Text>
                          </Box>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <Card.Root variant="outline">
                      <Card.Body>
                        <VStack align="start" gap="4">
                          <Text fontSize="sm" fontWeight="semibold">Proyecciones</Text>
                          <Box h="200px" bg="gray.50" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                            <Text color="gray.500">Proyecciones financieras - Próximamente</Text>
                          </Box>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </SimpleGrid>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
}