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
  Input,
  createListCollection,
  Progress,
  Alert,
  Tabs,
  IconButton,
  NumberInput
} from '@chakra-ui/react';
import {
  CalculatorIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { type TaxReport } from '../../types';
import { fiscalApi } from '../../data/fiscalApi';
import { notify } from '@/lib/notifications';

interface TaxPeriod {
  periodo: string;
  iva_ventas: number;
  iva_compras: number;
  saldo: number;
  estado: 'pendiente' | 'presentado' | 'vencido';
  vencimiento: string;
}

interface PercepcionesRetenciones {
  tipo: 'percepcion' | 'retencion';
  concepto: string;
  porcentaje: number;
  importe: number;
  fecha: string;
  proveedor_cliente: string;
  comprobante: string;
}

const periodOptions = createListCollection({
  items: Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const year = new Date().getFullYear();
    return {
      value: `${year}-${month.toString().padStart(2, '0')}`,
      label: `${month.toString().padStart(2, '0')}/${year}`
    };
  })
});

export function TaxCompliance() {
  const [activeTab, setActiveTab] = useState<'iva' | 'ganancias' | 'percepciones'>('iva');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [taxPeriods, setTaxPeriods] = useState<TaxPeriod[]>([]);
  const [percepciones, setPercepciones] = useState<PercepcionesRetenciones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const currentMonth = new Date();
    const currentPeriod = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedPeriod(currentPeriod);
    
    fetchTaxData();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchPeriodData(selectedPeriod);
    }
  }, [selectedPeriod]);

  const fetchTaxData = async () => {
    try {
      setIsLoading(true);
      const reports = await fiscalApi.getTaxReports();
      setTaxReports(reports);
      
      const periods = await fiscalApi.getTaxPeriods();
      setTaxPeriods(periods);
      
      const percepcionesData = await fiscalApi.getPercepcionesRetenciones();
      setPercepciones(percepcionesData);
    } catch (error) {
      notify.error('Error al cargar datos fiscales');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeriodData = async (periodo: string) => {
    try {
      const periodData = await fiscalApi.getTaxPeriodDetail(periodo);
      // Update relevant state with period-specific data
    } catch (error) {
      console.error('Error fetching period data:', error);
    }
  };

  const generateIVAReport = async () => {
    try {
      setIsGenerating(true);
      await fiscalApi.generateIVAReport(selectedPeriod);
      await fetchTaxData();
      notify.success('Reporte de IVA generado exitosamente');
    } catch (error) {
      notify.error('Error al generar reporte de IVA');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitTaxReturn = async (tipo: string) => {
    try {
      setIsGenerating(true);
      await fiscalApi.submitTaxReturn(selectedPeriod, tipo);
      await fetchTaxData();
      notify.success('Declaración presentada exitosamente');
    } catch (error) {
      notify.error('Error al presentar declaración');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPeriodStatus = (periodo: TaxPeriod) => {
    const now = new Date();
    const vencimiento = new Date(periodo.vencimiento);
    
    if (periodo.estado === 'presentado') {
      return { color: 'green', label: 'Presentado' };
    } else if (vencimiento < now) {
      return { color: 'red', label: 'Vencido' };
    } else {
      const daysLeft = Math.ceil((vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        color: daysLeft <= 5 ? 'yellow' : 'blue', 
        label: `${daysLeft} días`
      };
    }
  };

  const currentPeriodData = taxPeriods.find(p => p.periodo === selectedPeriod);

  return (
    <VStack gap="6" align="stretch">
      {/* Period Selector and Quick Stats */}
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap="4">
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">Gestión de Impuestos</Text>
              <HStack gap="2">
                <Select.Root
                  collection={periodOptions}
                  value={[selectedPeriod]}
                  onValueChange={(e) => setSelectedPeriod(e.value[0])}
                  width="150px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Período" />
                  </Select.Trigger>
                  <Select.Content>
                    {periodOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </HStack>
            </HStack>

            {/* Quick Overview for Selected Period */}
            {currentPeriodData && (
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="3" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        ${currentPeriodData.iva_ventas.toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600">IVA Débito</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="green.50">
                  <Card.Body p="3" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        ${currentPeriodData.iva_compras.toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600">IVA Crédito</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg={currentPeriodData.saldo > 0 ? "red.50" : "green.50"}>
                  <Card.Body p="3" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="lg" fontWeight="bold" 
                            color={currentPeriodData.saldo > 0 ? "red.600" : "green.600"}>
                        ${Math.abs(currentPeriodData.saldo).toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {currentPeriodData.saldo > 0 ? 'A Pagar' : 'A Favor'}
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg={getPeriodStatus(currentPeriodData).color + ".50"}>
                  <Card.Body p="3" textAlign="center">
                    <VStack gap="1">
                      <Badge colorPalette={getPeriodStatus(currentPeriodData).color} size="sm">
                        {getPeriodStatus(currentPeriodData).label}
                      </Badge>
                      <Text fontSize="xs" color="gray.600">Estado</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            )}

            {/* Vencimiento Alert */}
            {currentPeriodData && currentPeriodData.estado !== 'presentado' && (
              <Alert.Root 
                status={currentPeriodData.estado === 'vencido' ? 'error' : 'warning'} 
                variant="subtle"
              >
                {currentPeriodData.estado === 'vencido' ? 
                  <ExclamationTriangleIcon className="w-5 h-5" /> :
                  <CalendarDaysIcon className="w-5 h-5" />
                }
                <Alert.Title>
                  {currentPeriodData.estado === 'vencido' ? 'Declaración Vencida' : 'Próximo Vencimiento'}
                </Alert.Title>
                <Alert.Description>
                  Vencimiento: {new Date(currentPeriodData.vencimiento).toLocaleDateString()}
                  {currentPeriodData.estado === 'vencido' && 
                    ' - Se pueden aplicar multas e intereses'}
                </Alert.Description>
              </Alert.Root>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Tax Management Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="iva">
            <HStack gap={2}>
              <CalculatorIcon className="w-4 h-4" />
              <Text>IVA</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="ganancias">
            <HStack gap={2}>
              <DocumentTextIcon className="w-4 h-4" />
              <Text>Ganancias</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="percepciones">
            <HStack gap={2}>
              <ArrowUpTrayIcon className="w-4 h-4" />
              <Text>Percepciones</Text>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* IVA Tab */}
          <Tabs.Content value="iva">
            <VStack gap="6" align="stretch">
              <Card.Root>
                <Card.Body>
                  <VStack align="stretch" gap="4">
                    <HStack justify="space-between">
                      <Text fontSize="md" fontWeight="semibold">Libro IVA - {selectedPeriod}</Text>
                      <HStack gap="2">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<CalculatorIcon className="w-4 h-4" />}
                          onClick={generateIVAReport}
                          isLoading={isGenerating}
                        >
                          Generar Reporte
                        </Button>
                        {currentPeriodData && currentPeriodData.estado !== 'presentado' && (
                          <Button
                            size="sm"
                            colorPalette="blue"
                            leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}
                            onClick={() => submitTaxReturn('iva')}
                            isLoading={isGenerating}
                          >
                            Presentar DDJJ
                          </Button>
                        )}
                      </HStack>
                    </HStack>

                    <Table.Root size="sm">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Período</Table.ColumnHeader>
                          <Table.ColumnHeader>Ventas Netas</Table.ColumnHeader>
                          <Table.ColumnHeader>IVA Débito</Table.ColumnHeader>
                          <Table.ColumnHeader>Compras Netas</Table.ColumnHeader>
                          <Table.ColumnHeader>IVA Crédito</Table.ColumnHeader>
                          <Table.ColumnHeader>Saldo</Table.ColumnHeader>
                          <Table.ColumnHeader>Estado</Table.ColumnHeader>
                          <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {taxReports
                          .filter(report => report.tipo === 'iva_ventas')
                          .slice(0, 12)
                          .map((report) => (
                          <Table.Row key={report.id}>
                            <Table.Cell>
                              <Text fontSize="sm" fontWeight="medium">
                                {report.periodo}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">
                                ${report.ventas_netas?.toLocaleString() || '0'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" color="red.600">
                                ${report.iva_debito_fiscal?.toLocaleString() || '0'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">
                                ${report.compras_netas?.toLocaleString() || '0'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" color="green.600">
                                ${report.iva_credito_fiscal?.toLocaleString() || '0'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" fontWeight="medium"
                                    color={(report.saldo_a_pagar || 0) > 0 ? "red.600" : "green.600"}>
                                ${Math.abs(report.saldo_a_pagar || report.saldo_a_favor || 0).toLocaleString()}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge 
                                colorPalette={report.presentado ? 'green' : 'yellow'} 
                                size="sm"
                              >
                                {report.presentado ? 'Presentado' : 'Pendiente'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="Ver detalles"
                              >
                                <EyeIcon className="w-3 h-3" />
                              </IconButton>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </VStack>
          </Tabs.Content>

          {/* Ganancias Tab */}
          <Tabs.Content value="ganancias">
            <Card.Root>
              <Card.Body>
                <VStack align="stretch" gap="4">
                  <Text fontSize="md" fontWeight="semibold">Impuesto a las Ganancias</Text>
                  
                  <Alert.Root status="info" variant="subtle">
                    <Alert.Description>
                      El impuesto a las ganancias se calculará automáticamente basado en 
                      los ingresos y gastos registrados en el sistema.
                    </Alert.Description>
                  </Alert.Root>

                  <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                    <Card.Root variant="outline">
                      <Card.Body textAlign="center" p="4">
                        <VStack gap="2">
                          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                            $0
                          </Text>
                          <Text fontSize="sm" color="gray.600">Ganancias Acumuladas</Text>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <Card.Root variant="outline">
                      <Card.Body textAlign="center" p="4">
                        <VStack gap="2">
                          <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                            $0
                          </Text>
                          <Text fontSize="sm" color="gray.600">Impuesto Calculado</Text>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <Card.Root variant="outline">
                      <Card.Body textAlign="center" p="4">
                        <VStack gap="2">
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">
                            $0
                          </Text>
                          <Text fontSize="sm" color="gray.600">Pagos a Cuenta</Text>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </SimpleGrid>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Funcionalidad en desarrollo - Próximamente disponible
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* Percepciones y Retenciones Tab */}
          <Tabs.Content value="percepciones">
            <Card.Root>
              <Card.Body>
                <VStack align="stretch" gap="4">
                  <HStack justify="space-between">
                    <Text fontSize="md" fontWeight="semibold">
                      Percepciones y Retenciones - {selectedPeriod}
                    </Text>
                    <Button
                      size="sm"
                      colorPalette="blue"
                      leftIcon={<DocumentTextIcon className="w-4 h-4" />}
                    >
                      Generar Reporte
                    </Button>
                  </HStack>

                  {percepciones.length === 0 ? (
                    <Alert.Root status="info" variant="subtle">
                      <Alert.Description>
                        No hay percepciones o retenciones registradas para este período.
                      </Alert.Description>
                    </Alert.Root>
                  ) : (
                    <Table.Root size="sm">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                          <Table.ColumnHeader>Concepto</Table.ColumnHeader>
                          <Table.ColumnHeader>Proveedor/Cliente</Table.ColumnHeader>
                          <Table.ColumnHeader>Comprobante</Table.ColumnHeader>
                          <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                          <Table.ColumnHeader>%</Table.ColumnHeader>
                          <Table.ColumnHeader>Importe</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {percepciones.map((item, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>
                              <Badge 
                                colorPalette={item.tipo === 'percepcion' ? 'blue' : 'orange'} 
                                size="sm"
                              >
                                {item.tipo === 'percepcion' ? 'Percepción' : 'Retención'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">{item.concepto}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">{item.proveedor_cliente}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" fontFamily="mono">{item.comprobante}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">
                                {new Date(item.fecha).toLocaleDateString()}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm">{item.porcentaje}%</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" fontWeight="medium">
                                ${item.importe.toLocaleString()}
                              </Text>
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
        </Box>
      </Tabs.Root>
    </VStack>
  );
}