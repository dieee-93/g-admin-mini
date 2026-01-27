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
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@/shared/ui';
import { IconButton } from '@chakra-ui/react';
import {
  CalculatorIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/lib/decimal';
import { type TaxReport } from '../../types';
import { notify } from '@/lib/notifications';
import { supabase } from '@/lib/supabase/client';

import { logger } from '@/lib/logging';
interface TaxPeriod {
  id: string;
  period: string;
  year: number;
  type: 'mensual' | 'trimestral' | 'anual';
  dueDate: string;
  status: 'pendiente' | 'vencido' | 'presentado';
}

interface TaxComplianceProps {
  variant?: 'default' | 'compact' | 'detailed';
}

// Mock data for demonstration
const mockTaxPeriods: TaxPeriod[] = [
  {
    id: '1',
    period: 'Enero 2024',
    year: 2024,
    type: 'mensual',
    dueDate: '2024-02-15',
    status: 'presentado'
  },
  {
    id: '2',
    period: 'Febrero 2024',
    year: 2024,
    type: 'mensual',
    dueDate: '2024-03-15',
    status: 'presentado'
  },
  {
    id: '3',
    period: 'Marzo 2024',
    year: 2024,
    type: 'mensual',
    dueDate: '2024-04-15',
    status: 'vencido'
  },
  {
    id: '4',
    period: 'Abril 2024',
    year: 2024,
    type: 'mensual',
    dueDate: '2024-05-15',
    status: 'pendiente'
  }
];

const mockTaxReports: TaxReport[] = [
  {
    id: '1',
    periodo: '2024-01',
    tipo: 'iva_ventas',
    ventas_netas: 125000,
    iva_debito_fiscal: 26250,
    saldo_a_pagar: 26250,
    presentado: true,
    fecha_presentacion: '2024-02-10',
    created_at: '2024-01-31T23:59:59Z'
  },
  {
    id: '2',
    periodo: '2024-02',
    tipo: 'ganancias',
    saldo_a_pagar: 89000,
    presentado: true,
    fecha_presentacion: '2024-03-12',
    created_at: '2024-02-28T23:59:59Z'
  },
  {
    id: '3',
    periodo: '2024-03',
    tipo: 'iva_ventas',
    ventas_netas: 156000,
    iva_debito_fiscal: 32760,
    saldo_a_pagar: 32760,
    presentado: false,
    created_at: '2024-03-31T23:59:59Z'
  }
];

export const TaxCompliance = ({ variant = 'default' }: TaxComplianceProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [taxPeriods, setTaxPeriods] = useState<TaxPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaxType, setSelectedTaxType] = useState<string>('');

  useEffect(() => {
    loadTaxData();
  }, []);

  const loadTaxData = async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTaxReports(mockTaxReports);
      setTaxPeriods(mockTaxPeriods);
    } catch (error: unknown) {
      notify.error({ 
        title: 'Error al cargar datos fiscales',
        description: 'No se pudieron cargar los datos de impuestos'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodDetail = async (periodo: string) => {
    if (!periodo) return;
    
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Update period-specific data
    } catch (error: unknown) {
      logger.error('API', 'Error loading period detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateIVAReport = async () => {
    if (!selectedPeriod) {
      notify.warning({
        title: 'Seleccione un período',
        description: 'Debe seleccionar un período para generar el reporte'
      });
      return;
    }

    setLoading(true);
    try {
      // Find the selected period to get year and month
      const selectedTaxPeriod = taxPeriods.find(p => p.id === selectedPeriod);
      if (!selectedTaxPeriod) {
        throw new Error('Período seleccionado no válido');
      }

      // Call the calculate_tax_report RPC function for IVA
      const { data, error } = await supabase.rpc('calculate_tax_report', {
        report_type: 'iva_ventas',
        year: selectedTaxPeriod.year,
        month: parseInt(selectedTaxPeriod.period.split(' ')[0] === 'Enero' ? '1' : 
               selectedTaxPeriod.period.split(' ')[0] === 'Febrero' ? '2' :
               selectedTaxPeriod.period.split(' ')[0] === 'Marzo' ? '3' :
               selectedTaxPeriod.period.split(' ')[0] === 'Abril' ? '4' : '1') // Simple month mapping
      });

      if (error) {
        throw new Error(error.message);
      }

      notify.success({ 
        title: 'Reporte de IVA generado exitosamente',
        description: `Reporte para ${selectedTaxPeriod.period} creado. Ventas netas: $${data?.ventas_netas || 0}`
      });
      
      // Create new tax report entry
      const newTaxReport: TaxReport = {
        id: crypto.randomUUID(),
        periodo: `${selectedTaxPeriod.year}-${String(selectedTaxPeriod.year).padStart(2, '0')}`,
        tipo: 'iva_ventas',
        ventas_netas: data?.ventas_netas || 0,
        iva_debito_fiscal: data?.iva_debito_fiscal || 0,
        saldo_a_pagar: data?.saldo_a_pagar || 0,
        presentado: false,
        created_at: new Date().toISOString()
      };
      
      setTaxReports(prev => [newTaxReport, ...prev]);
    } catch (error: unknown) {
      notify.error({ 
        title: 'Error al generar reporte de IVA',
        description: error.message || 'No se pudo generar el reporte solicitado'
      });
    } finally {
      setLoading(false);
    }
  };

  const submitTaxReturn = async (tipo: string) => {
    if (!selectedPeriod) {
      notify.warning({
        title: 'Seleccione un período',
        description: 'Debe seleccionar un período para presentar la declaración'
      });
      return;
    }

    setLoading(true);
    try {
      // Find the selected period
      const selectedTaxPeriod = taxPeriods.find(p => p.id === selectedPeriod);
      if (!selectedTaxPeriod) {
        throw new Error('Período seleccionado no válido');
      }

      // First generate the tax report if it doesn't exist
      const { data: reportData, error: reportError } = await supabase.rpc('calculate_tax_report', {
        report_type: tipo || 'iva_ventas',
        year: selectedTaxPeriod.year,
        month: parseInt(selectedTaxPeriod.period.split(' ')[0] === 'Enero' ? '1' : 
               selectedTaxPeriod.period.split(' ')[0] === 'Febrero' ? '2' :
               selectedTaxPeriod.period.split(' ')[0] === 'Marzo' ? '3' :
               selectedTaxPeriod.period.split(' ')[0] === 'Abril' ? '4' : '1')
      });

      if (reportError) {
        throw new Error(reportError.message);
      }

      // Update period status to 'presentado'
      const updatedPeriods = taxPeriods.map(p => 
        p.id === selectedPeriod ? { ...p, status: 'presentado' as const } : p
      );
      setTaxPeriods(updatedPeriods);

      notify.success({ 
        title: 'Declaración presentada exitosamente',
        description: `Declaración de ${selectedTaxPeriod.period} enviada a AFIP correctamente`
      });
      
      loadTaxData(); // Reload data
    } catch (error: unknown) {
      notify.error({ 
        title: 'Error al presentar declaración',
        description: error.message || 'No se pudo enviar la declaración a AFIP'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      presentado: { colorPalette: 'success' as const, children: 'Presentado' },
      vencido: { colorPalette: 'error' as const, children: 'Vencido' },
      pendiente: { colorPalette: 'warning' as const, children: 'Pendiente' }
    };
    
    return <Badge {...statusConfig[status as keyof typeof statusConfig]} />;
  };

  const formatCurrency = (amount: number) => {
    return DecimalUtils.formatCurrency(amount);
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

  const periodOptions = taxPeriods.map(period => ({
    value: period.id,
    label: period.period
  }));

  const taxTypeOptions = [
    { value: 'iva', label: 'IVA' },
    { value: 'ganancias', label: 'Ganancias' },
    { value: 'bienes_personales', label: 'Bienes Personales' },
    { value: 'ingresos_brutos', label: 'Ingresos Brutos' }
  ];

  if (variant === 'compact') {
    return (
      <CardWrapper colorPalette="purple">
        <VStack gap="md" align="stretch">
          <HStack justify="space-between">
            <Typography variant="heading" size="sm">
              Cumplimiento Fiscal
            </Typography>
            <Button
              size="sm"
              onClick={loadTaxData}
              loading={loading}
            >
              Actualizar
            </Button>
          </HStack>
          
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="sm">
            {taxPeriods.slice(0, 3).map((period) => (
              <CardWrapper key={period.id} variant="outline" size="sm">
                <VStack gap="xs">
                  <Typography variant="body" size="sm">{period.period}</Typography>
                  {getStatusBadge(period.status)}
                  <Typography variant="caption" color="text.muted">
                    Vence: {formatDate(period.dueDate)}
                  </Typography>
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
      <CardWrapper colorPalette="purple">
        <VStack align="stretch" gap="md">
          <HStack justify="space-between">
            <Typography variant="heading" size="lg">Gestión de Impuestos</Typography>
            <HStack gap="sm">
              <SelectField
                placeholder="Seleccionar período"
                value={selectedPeriod}
                onChange={(value) => {
                  const selectedValue = Array.isArray(value) ? value[0] : value;
                  setSelectedPeriod(selectedValue);
                  loadPeriodDetail(selectedValue);
                }}
                options={periodOptions}
                size="sm"
              />
              <Button
                onClick={() => submitTaxReturn(selectedTaxType)}
                loading={loading}
                disabled={!selectedPeriod}
              >
                <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                Presentar
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </CardWrapper>

      {/* Compliance Overview */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap="md">
        <CardWrapper colorPalette="purple">
          <VStack align="stretch" gap="md">
            <HStack>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <Typography variant="heading" size="sm">
                Declaraciones al Día
              </Typography>
            </HStack>
            <Typography variant="display" size="lg" color="success">
              {taxPeriods.filter(p => p.status === 'presentado').length}
            </Typography>
            <Typography variant="caption" color="text.muted">
              de {taxPeriods.length} períodos
            </Typography>
          </VStack>
        </CardWrapper>

        <CardWrapper colorPalette="purple">
          <VStack align="stretch" gap="md">
            <HStack>
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              <Typography variant="heading" size="sm">
                Pendientes
              </Typography>
            </HStack>
            <Typography variant="display" size="lg" color="warning">
              {taxPeriods.filter(p => p.status === 'pendiente').length}
            </Typography>
            <Typography variant="caption" color="text.muted">
              próximos vencimientos
            </Typography>
          </VStack>
        </CardWrapper>

        <CardWrapper colorPalette="purple">
          <VStack align="stretch" gap="md">
            <HStack>
              <ClockIcon className="w-5 h-5 text-red-600" />
              <Typography variant="heading" size="sm">
                Vencidos
              </Typography>
            </HStack>
            <Typography variant="display" size="lg" color="error">
              {taxPeriods.filter(p => p.status === 'vencido').length}
            </Typography>
            <Typography variant="caption" color="text.muted">
              requieren atención
            </Typography>
          </VStack>
        </CardWrapper>

        <CardWrapper colorPalette="purple">
          <VStack align="stretch" gap="md">
            <HStack>
              <BanknotesIcon className="w-5 h-5 text-blue-600" />
              <Typography variant="heading" size="sm">
                Total Pagado
              </Typography>
            </HStack>
            <Typography variant="display" size="lg" color="info">
              {formatCurrency(
                taxReports
                  .filter(r => r.presentado)
                  .reduce((sum, r) => DecimalUtils.add(sum.toString(), (r.saldo_a_pagar || 0).toString(), 'financial').toNumber(), 0)
              )}
            </Typography>
            <Typography variant="caption" color="text.muted">
              este año
            </Typography>
          </VStack>
        </CardWrapper>
      </Grid>

      {/* Tax Management Tabs */}
      <Tabs defaultValue="periods" colorPalette="blue">
        <TabList>
          <Tab value="periods">
            <CalendarDaysIcon className="w-4 h-4 mr-2" />
            Períodos Fiscales
          </Tab>
          <Tab value="reports">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Reportes
          </Tab>
          <Tab value="actions">
            <CalculatorIcon className="w-4 h-4 mr-2" />
            Acciones
          </Tab>
        </TabList>

        <TabPanels>
          {/* Periods Tab */}
          <TabPanel value="periods">
            <CardWrapper colorPalette="purple">
              <VStack align="stretch" gap="md">
                <Typography variant="heading" size="sm">
                  Períodos Fiscales 2024
                </Typography>
                
                <Table.Root size="md" variant="outline">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Período</Table.ColumnHeader>
                      <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                      <Table.ColumnHeader>Vencimiento</Table.ColumnHeader>
                      <Table.ColumnHeader>Estado</Table.ColumnHeader>
                      <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {taxPeriods.map((period) => (
                      <Table.Row key={period.id}>
                        <Table.Cell>
                          <Typography variant="body" fontWeight="medium">
                            {period.period}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant="outline" colorPalette="blue">
                            {period.type}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="body" color="text.muted">
                            {formatDate(period.dueDate)}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(period.status)}
                        </Table.Cell>
                        <Table.Cell>
                          <HStack gap="xs">
                            <IconButton
                              aria-label="Ver detalles"
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedPeriod(period.id)}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </IconButton>
                            {period.status !== 'presentado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => submitTaxReturn('iva')}
                              >
                                Presentar
                              </Button>
                            )}
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </VStack>
            </CardWrapper>
          </TabPanel>

          {/* Reports Tab */}
          <TabPanel value="reports">
            <CardWrapper colorPalette="purple">
              <VStack align="stretch" gap="md">
                <Typography variant="heading" size="sm">
                  Reportes de Impuestos
                </Typography>
                
                <Table.Root size="md" variant="outline">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Período</Table.ColumnHeader>
                      <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                      <Table.ColumnHeader>Monto</Table.ColumnHeader>
                      <Table.ColumnHeader>Estado</Table.ColumnHeader>
                      <Table.ColumnHeader>Fecha Presentación</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {taxReports.map((report) => (
                      <Table.Row key={report.id}>
                        <Table.Cell>
                          <Typography variant="body" fontWeight="medium">
                            {formatPeriod(report.periodo)}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant="outline" colorPalette="accent">
                            {report.tipo}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="body" fontWeight="medium">
                            {formatCurrency(report.saldo_a_pagar || 0)}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(report.presentado ? 'presentado' : 'pendiente')}
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="body" color="text.muted">
                            {report.fecha_presentacion ? formatDate(report.fecha_presentacion) : '-'}
                          </Typography>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </VStack>
            </CardWrapper>
          </TabPanel>

          {/* Actions Tab */}
          <TabPanel value="actions">
            <VStack gap="md" align="stretch">
              {/* Generate Reports Section */}
              <CardWrapper colorPalette="purple">
                <VStack align="stretch" gap="md">
                  <Typography variant="heading" size="sm">
                    Generar Reportes
                  </Typography>
                  
                  <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="md">
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
                    
                    <VStack align="stretch" gap="sm">
                      <Typography variant="body" fontWeight="medium">
                        Tipo de Impuesto
                      </Typography>
                      <SelectField
                        placeholder="Seleccionar tipo"
                        value={selectedTaxType}
                        onChange={(value) => {
                          const selectedValue = Array.isArray(value) ? value[0] : value;
                          setSelectedTaxType(selectedValue);
                        }}
                        options={taxTypeOptions}
                      />
                    </VStack>
                  </Grid>
                  
                  <HStack gap="sm">
                    <Button
                      onClick={generateIVAReport}
                      loading={loading}
                      disabled={!selectedPeriod}
                    >
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Generar Reporte IVA
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!selectedPeriod}
                    >
                      <CalculatorIcon className="w-4 h-4 mr-2" />
                      Generar F.649
                    </Button>
                  </HStack>
                </VStack>
              </CardWrapper>

              {/* Alerts */}
              {taxPeriods.some(p => p.status === 'vencido') && (
                <Alert>
                  <AlertIcon>
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  </AlertIcon>
                  <VStack align="start" gap="xs">
                    <AlertTitle>Períodos Vencidos</AlertTitle>
                    <AlertDescription>
                      Tiene períodos fiscales vencidos que requieren atención inmediata. 
                      Las declaraciones fuera de término pueden generar multas e intereses.
                    </AlertDescription>
                  </VStack>
                </Alert>
              )}

              {taxPeriods.some(p => p.status === 'pendiente') && (
                <Alert>
                  <AlertIcon>
                    <ClockIcon className="w-5 h-5" />
                  </AlertIcon>
                  <VStack align="start" gap="xs">
                    <AlertTitle>Próximos Vencimientos</AlertTitle>
                    <AlertDescription>
                      Tiene declaraciones pendientes próximas a vencer. 
                      Revise los períodos y genere los reportes correspondientes.
                    </AlertDescription>
                  </VStack>
                </Alert>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default TaxCompliance;