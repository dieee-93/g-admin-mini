import { useState, useEffect } from 'react';
import {
  CardWrapper ,
  VStack,
  HStack,
  Typography,
  Button,
  Badge,
  Grid,
  Table,
  SelectField,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@/shared/ui';
import { IconButton } from '@chakra-ui/react';
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
import { notify } from '@/lib/notifications';
import { supabase } from '@/lib/supabase/client';

interface FinancialKPI {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'percentage' | 'number';
}

interface FinancialReportingProps {
  variant?: 'default' | 'compact' | 'detailed';
}

// Mock data for demonstration
const mockFinancialKPIs: FinancialKPI[] = [
  {
    label: 'Ingresos Totales',
    value: 2450000,
    change: 8.5,
    trend: 'up',
    format: 'currency'
  },
  {
    label: 'Gastos Totales',
    value: 1890000,
    change: -3.2,
    trend: 'down',
    format: 'currency'
  },
  {
    label: 'Margen de Ganancia',
    value: 22.8,
    change: 2.1,
    trend: 'up',
    format: 'percentage'
  },
  {
    label: 'Flujo de Caja',
    value: 560000,
    change: 15.3,
    trend: 'up',
    format: 'currency'
  }
];

const mockFinancialReports: FinancialReport[] = [
  {
    id: '1',
    tipo: 'balance',
    periodo_inicio: '2024-03-01',
    periodo_fin: '2024-03-31',
    generated_at: '2024-03-31T23:59:59Z',
    generated_by: 'user_1'
  },
  {
    id: '2',
    tipo: 'profit_loss',
    periodo_inicio: '2024-03-01',
    periodo_fin: '2024-03-31',
    generated_at: '2024-03-31T23:59:59Z',
    generated_by: 'user_1'
  },
  {
    id: '3',
    tipo: 'cash_flow',
    periodo_inicio: '2024-03-01',
    periodo_fin: '2024-03-31',
    generated_at: '2024-03-30T23:59:59Z',
    generated_by: 'user_1'
  }
];

export const FinancialReporting = ({ variant = 'default' }: FinancialReportingProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current_month');
  const [selectedReportType, setSelectedReportType] = useState<string>('balance');
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [financialKPIs, setFinancialKPIs] = useState<FinancialKPI[]>([]);
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod, selectedReportType]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFinancialReports(mockFinancialReports);
      setFinancialKPIs(mockFinancialKPIs);
      
      if (mockFinancialReports.length > 0) {
        const latestReport = mockFinancialReports.find(r => r.tipo === selectedReportType) || mockFinancialReports[0];
        setCurrentReport(latestReport);
      }
    } catch (error) {
      notify.error({
        title: 'Error al cargar reportes financieros',
        description: 'No se pudieron cargar los datos financieros'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedReportType || !selectedPeriod) {
      notify.warning({
        title: 'Parámetros faltantes',
        description: 'Seleccione el tipo de reporte y el período'
      });
      return;
    }

    setLoading(true);
    try {
      // Extract year and month from selectedPeriod
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // Call the calculate_tax_report RPC function
      const { data, error } = await supabase.rpc('calculate_tax_report', {
        report_type: selectedReportType,
        year: year,
        month: month
      });

      if (error) {
        throw new Error(error.message);
      }

      notify.success({
        title: 'Reporte financiero generado exitosamente',
        description: `Reporte de ${selectedReportType} para ${month}/${year} creado correctamente`
      });
      
      // Create a new report entry
      const newReport: FinancialReport = {
        id: crypto.randomUUID(),
        tipo: selectedReportType as any,
        periodo_inicio: `${year}-${String(month).padStart(2, '0')}-01`,
        periodo_fin: `${year}-${String(month).padStart(2, '0')}-28`,
        generated_at: new Date().toISOString(),
        generated_by: 'current_user'
      };
      
      setFinancialReports(prev => [newReport, ...prev]);
      setCurrentReport(newReport);
    } catch (error: unknown) {
      notify.error({
        title: 'Error al generar reporte',
        description: error.message || 'No se pudo generar el reporte financiero'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!currentReport) {
      notify.error({
        title: 'No hay reporte seleccionado',
        description: 'Seleccione un reporte para exportar'
      });
      return;
    }

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      notify.success({
        title: `Reporte exportado en formato ${format.toUpperCase()}`,
        description: 'El archivo ha sido descargado correctamente'
      });
    } catch (error) {
      notify.error({
        title: 'Error al exportar reporte',
        description: 'No se pudo exportar el reporte en el formato solicitado'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-AR').format(value);
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'muted';
    }
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      finalizado: { colorPalette: 'success' as const, children: 'Finalizado' },
      borrador: { colorPalette: 'warning' as const, children: 'Borrador' },
      procesando: { colorPalette: 'info' as const, children: 'Procesando' }
    };
    
    return <Badge {...statusConfig[estado as keyof typeof statusConfig]} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const formatPeriod = (periodo: string) => {
    const [year, month] = periodo.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const periodOptions = [
    { value: 'current_month', label: 'Mes Actual' },
    { value: 'last_month', label: 'Mes Anterior' },
    { value: 'current_quarter', label: 'Trimestre Actual' },
    { value: 'last_quarter', label: 'Trimestre Anterior' },
    { value: 'current_year', label: 'Año Actual' },
    { value: 'last_year', label: 'Año Anterior' },
    { value: 'custom', label: 'Período Personalizado' }
  ];

  const reportTypeOptions = [
    { value: 'balance', label: 'Balance General' },
    { value: 'profit_loss', label: 'Estado de Resultados' },
    { value: 'cash_flow', label: 'Flujo de Efectivo' },
    { value: 'tax_summary', label: 'Resumen Fiscal' }
  ];

  if (variant === 'compact') {
    return (
      <CardWrapper colorPalette="brand">
        <VStack gap="md" align="stretch">
          <HStack justify="space-between">
            <Typography variant="heading" size="sm">
              Reportes Financieros
            </Typography>
            <Button
              size="sm"
              onClick={generateReport}
              loading={loading}
            >
              Generar
            </Button>
          </HStack>
          
          <Grid templateColumns="repeat(2, 1fr)" gap="sm">
            {financialKPIs.slice(0, 4).map((kpi, index) => (
              <CardWrapper key={index} variant="outline" size="sm">
                <VStack gap="xs">
                  <Typography variant="caption" color="text.muted">
                    {kpi.label}
                  </Typography>
                  <Typography variant="body" fontWeight="bold">
                    {formatValue(kpi.value, kpi.format)}
                  </Typography>
                  <HStack gap="xs">
                    {getTrendIcon(kpi.trend)}
                    <Typography variant="caption" color={getTrendColor(kpi.trend)}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </Typography>
                  </HStack>
                </VStack>
              </CardWrapper>
            ))}
          </Grid>
        </VStack>
      </CardWrapper>
    );
  }

  return (
    <VStack gap="lg" align="stretch">
      {/* Header */}
      <CardWrapper colorPalette="brand">
        <VStack align="stretch" gap="md">
          <HStack justify="space-between">
            <Typography variant="heading" size="lg">Reportes Financieros</Typography>
            <HStack gap="sm">
              <SelectField
                placeholder="Seleccionar período"
                value={selectedPeriod}
                onChange={(value) => {
                  const selectedValue = Array.isArray(value) ? value[0] : value;
                  setSelectedPeriod(selectedValue);
                }}
                options={periodOptions}
                size="sm"
              />
              <SelectField
                placeholder="Tipo de reporte"
                value={selectedReportType}
                onChange={(value) => {
                  const selectedValue = Array.isArray(value) ? value[0] : value;
                  setSelectedReportType(selectedValue);
                }}
                options={reportTypeOptions}
                size="sm"
              />
              <Button
                onClick={generateReport}
                loading={loading}
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </CardWrapper>

      {/* Financial KPIs */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap="md">
        {financialKPIs.map((kpi, index) => (
          <CardWrapper key={index} colorPalette="brand">
            <VStack align="stretch" gap="md">
              <HStack justify="space-between">
                <Typography variant="heading" size="sm">
                  {kpi.label}
                </Typography>
                {getTrendIcon(kpi.trend)}
              </HStack>
              <Typography variant="display" size="lg" color="text.primary">
                {formatValue(kpi.value, kpi.format)}
              </Typography>
              <HStack gap="xs">
                <Typography variant="caption" color="text.muted">
                  Cambio vs período anterior:
                </Typography>
                <Typography variant="caption" color={getTrendColor(kpi.trend)} fontWeight="medium">
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </Typography>
              </HStack>
            </VStack>
          </CardWrapper>
        ))}
      </Grid>

      {/* Reports Management */}
      <Tabs defaultValue="reports" colorPalette="blue">
        <TabList>
          <Tab value="reports">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Reportes Generados
          </Tab>
          <Tab value="generator">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Generador
          </Tab>
          <Tab value="analytics">
            <BanknotesIcon className="w-4 h-4 mr-2" />
            Análisis
          </Tab>
        </TabList>

        <TabPanels>
          {/* Reports Tab */}
          <TabPanel value="reports">
            <CardWrapper colorPalette="brand">
              <VStack align="stretch" gap="md">
                <HStack justify="space-between">
                  <Typography variant="heading" size="sm">
                    Reportes Financieros Disponibles
                  </Typography>
                  <HStack gap="sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport('pdf')}
                      disabled={!currentReport}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport('excel')}
                      disabled={!currentReport}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </HStack>
                </HStack>
                
                <Table.Root size="md" variant="outline">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                      <Table.ColumnHeader>Período</Table.ColumnHeader>
                      <Table.ColumnHeader>Fecha Creación</Table.ColumnHeader>
                      <Table.ColumnHeader>Estado</Table.ColumnHeader>
                      <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {financialReports.map((report) => (
                      <Table.Row key={report.id}>
                        <Table.Cell>
                          <Typography variant="body" fontWeight="medium">
                            {reportTypeOptions.find(opt => opt.value === report.tipo)?.label || report.tipo}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="body">
                            {formatDate(report.periodo_inicio)} - {formatDate(report.periodo_fin)}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="body" color="text.muted">
                            {formatDate(report.generated_at)}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette="success">Finalizado</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <HStack gap="xs">
                            <IconButton
                              aria-label="Ver reporte"
                              size="sm"
                              variant="ghost"
                              onClick={() => setCurrentReport(report)}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                              aria-label="Imprimir reporte"
                              size="sm"
                              variant="ghost"
                            >
                              <PrinterIcon className="w-4 h-4" />
                            </IconButton>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </VStack>
            </CardWrapper>
          </TabPanel>

          {/* Generator Tab */}
          <TabPanel value="generator">
            <CardWrapper colorPalette="brand">
              <VStack align="stretch" gap="md">
                <Typography variant="heading" size="sm">
                  Generar Nuevo Reporte
                </Typography>
                
                <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="md">
                  <VStack align="stretch" gap="sm">
                    <Typography variant="body" fontWeight="medium">
                      Tipo de Reporte
                    </Typography>
                    <SelectField
                      placeholder="Seleccionar tipo"
                      value={selectedReportType}
                      onChange={(value) => {
                        const selectedValue = Array.isArray(value) ? value[0] : value;
                        setSelectedReportType(selectedValue);
                      }}
                      options={reportTypeOptions}
                    />
                  </VStack>
                  
                  <VStack align="stretch" gap="sm">
                    <Typography variant="body" fontWeight="medium">
                      Período
                    </Typography>
                    <SelectField
                      placeholder="Seleccionar período"
                      value={selectedPeriod}
                      onChange={(value) => {
                        const selectedValue = Array.isArray(value) ? value[0] : value;
                        setSelectedPeriod(selectedValue);
                      }}
                      options={periodOptions}
                    />
                  </VStack>
                </Grid>
                
                <HStack gap="sm">
                  <Button
                    onClick={generateReport}
                    loading={loading}
                    disabled={!selectedReportType || !selectedPeriod}
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!selectedReportType || !selectedPeriod}
                  >
                    <CalendarDaysIcon className="w-4 h-4 mr-2" />
                    Programar Generación
                  </Button>
                </HStack>
              </VStack>
            </CardWrapper>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value="analytics">
            <VStack gap="md" align="stretch">
              <CardWrapper colorPalette="brand">
                <VStack align="stretch" gap="md">
                  <Typography variant="heading" size="sm">
                    Análisis Financiero
                  </Typography>
                  
                  <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="md">
                    <VStack align="stretch" gap="sm">
                      <Typography variant="body" fontWeight="medium" color="text.muted">
                        Liquidez Corriente
                      </Typography>
                      <Typography variant="display" size="md" color="success">
                        2.45
                      </Typography>
                      <Typography variant="caption" color="text.muted">
                        Ratio saludable ({'>'}2.0)
                      </Typography>
                    </VStack>
                    
                    <VStack align="stretch" gap="sm">
                      <Typography variant="body" fontWeight="medium" color="text.muted">
                        ROE (Return on Equity)
                      </Typography>
                      <Typography variant="display" size="md" color="success">
                        18.5%
                      </Typography>
                      <Typography variant="caption" color="text.muted">
                        Excelente rendimiento
                      </Typography>
                    </VStack>
                    
                    <VStack align="stretch" gap="sm">
                      <Typography variant="body" fontWeight="medium" color="text.muted">
                        Endeudamiento
                      </Typography>
                      <Typography variant="display" size="md" color="warning">
                        45.2%
                      </Typography>
                      <Typography variant="caption" color="text.muted">
                        Nivel moderado
                      </Typography>
                    </VStack>
                  </Grid>
                </VStack>
              </CardWrapper>

              {/* Recommendations */}
              <Alert>
                <AlertIcon>
                  <ChartBarIcon className="w-5 h-5" />
                </AlertIcon>
                <VStack align="start" gap="xs">
                  <Typography variant="body" fontWeight="medium">
                    Recomendaciones Financieras
                  </Typography>
                  <AlertDescription>
                    • Los ratios de liquidez son saludables, mantenga el flujo de caja positivo<br/>
                    • Consider reducir el nivel de endeudamiento en el próximo trimestre<br/>
                    • El ROE indica un excelente rendimiento sobre el patrimonio
                  </AlertDescription>
                </VStack>
              </Alert>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default FinancialReporting;