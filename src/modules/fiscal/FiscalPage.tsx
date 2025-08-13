import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Tabs,
  Card,
  SimpleGrid,
  Badge,
  Alert,
  Switch,
  Tooltip
} from '@chakra-ui/react';
import { 
  DocumentTextIcon, 
  CogIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  WifiIcon,
  NoSymbolIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

// Import components
import { useNavigation } from '@/contexts/NavigationContext';
import { InvoiceGeneration } from './components/sections/InvoiceGeneration';
import { AFIPIntegration } from './components/sections/AFIPIntegration';
import { TaxCompliance } from './components/sections/TaxCompliance';
import { FinancialReporting } from './components/sections/FinancialReporting';
import { OfflineFiscalView } from './components/OfflineFiscalView';
import { useFiscal } from './logic/useFiscal';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents, type SaleCompletedEvent } from '@/lib/events/RestaurantEvents';
import { fiscalApi } from './data/fiscalApi';
import { notify } from '@/lib/notifications';
import { taxService } from './services/taxCalculationService';
import { useOfflineStatus } from '@/lib/offline';

// Fiscal mode types
type FiscalMode = 'auto' | 'online-first' | 'offline-first';
type EffectiveFiscalMode = 'online' | 'offline' | 'hybrid';

export function FiscalPage() {
  const { setQuickActions } = useNavigation();
  const [activeTab, setActiveTab] = useState('invoicing');
  const { fiscalStats, isLoading, error } = useFiscal();
  
  // Offline status monitoring
  const { isOnline, connectionQuality, isSyncing, queueSize } = useOfflineStatus();
  
  // Fiscal mode management
  const [fiscalMode, setFiscalMode] = useState<FiscalMode>(() => {
    const stored = localStorage.getItem('fiscal_mode');
    return (stored as FiscalMode) || 'offline-first';
  });

  // Calculate effective fiscal mode
  const effectiveFiscalMode: EffectiveFiscalMode = useMemo(() => {
    switch (fiscalMode) {
      case 'online-first':
        return isOnline ? 'online' : 'offline';
      case 'offline-first':
        return isOnline && connectionQuality !== 'poor' ? 'hybrid' : 'offline';
      case 'auto':
        if (!isOnline) return 'offline';
        if (connectionQuality === 'poor' || queueSize > 3) return 'hybrid';
        return 'online';
      default:
        return 'offline';
    }
  }, [fiscalMode, isOnline, connectionQuality, queueSize]);

  // Save fiscal mode preference
  useEffect(() => {
    localStorage.setItem('fiscal_mode', fiscalMode);
  }, [fiscalMode]);

  // Show offline view for critical fiscal operations when offline
  const shouldShowOfflineView = effectiveFiscalMode === 'offline' || 
    (effectiveFiscalMode === 'hybrid' && (activeTab === 'afip' || activeTab === 'invoicing'));

  // Set up quick actions and event listeners
  useEffect(() => {
    const quickActions = [
      {
        id: 'generate-invoice',
        label: 'Nueva Factura',
        icon: DocumentTextIcon,
        action: () => setActiveTab('invoicing'),
        color: 'blue'
      },
      {
        id: 'afip-status',
        label: 'Estado AFIP',
        icon: CogIcon,
        action: () => setActiveTab('afip'),
        color: 'green'
      },
      {
        id: 'tax-report',
        label: 'Reporte Impuestos',
        icon: ChartBarIcon,
        action: () => setActiveTab('tax'),
        color: 'purple'
      },
      {
        id: 'financial-reports',
        label: 'Reportes Financieros',
        icon: BanknotesIcon,
        action: () => setActiveTab('reports'),
        color: 'orange'
      }
    ];

    setQuickActions(quickActions);

    // Subscribe to SALE_COMPLETED events to automatically generate invoices
    const handleSaleCompleted = async (event: any) => {
      const saleEvent: SaleCompletedEvent = event.payload;
      
      try {
        // Use centralized tax calculation for accurate fiscal data
        const taxCalculation = taxService.reverseTaxCalculation(saleEvent.totalAmount);
        
        // Auto-generate invoice for completed sales
        const invoiceData = {
          tipo_comprobante: 'FACTURA_C', // Default consumer invoice
          denominacion_cliente: saleEvent.customerId ? undefined : 'Consumidor Final',
          cliente_id: saleEvent.customerId,
          condicion_iva_cliente: 'CONSUMIDOR_FINAL',
          subtotal: taxCalculation.subtotal,
          iva_21: taxCalculation.ivaAmount,
          iva_105: 0, // Not applicable for standard sales
          percepciones: 0,
          retenciones: 0,
          total: saleEvent.totalAmount,
          items: saleEvent.items.map(item => ({
            codigo: item.productId,
            descripcion: `Producto ${item.productId}`,
            cantidad: item.quantity,
            precio_unitario: item.unitPrice,
            total: item.totalPrice
          }))
        };

        const invoice = await fiscalApi.createInvoice(invoiceData);
        
        // Auto-request CAE if configured
        try {
          await fiscalApi.requestCAE(invoice.id);
          notify.success(`Factura ${invoice.numero} generada y autorizada automáticamente`);
        } catch (caeError) {
          notify.warning(`Factura ${invoice.numero} generada, CAE pendiente de autorización`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error auto-generating invoice for sale: ${errorMessage}`);
        notify.error('Error al generar factura automática para la venta');
      }
    };

    // Subscribe to event
    const unsubscribe = EventBus.on(RestaurantEvents.SALE_COMPLETED, handleSaleCompleted);

    return () => {
      setQuickActions([]);
      unsubscribe();
    };
  }, [setQuickActions]);

  if (error) {
    return (
      <Box p="6" maxW="7xl" mx="auto">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error al cargar datos fiscales</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box p="6" maxW="7xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* Offline Status Bar */}
        <Card.Root>
          <Card.Body p={4}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Badge 
                colorPalette={effectiveFiscalMode === 'offline' ? 'orange' : effectiveFiscalMode === 'hybrid' ? 'blue' : 'green'} 
                variant="subtle"
                p={2}
              >
                <HStack gap={1}>
                  {effectiveFiscalMode === 'offline' ? (
                    <NoSymbolIcon className="w-4 h-4" />
                  ) : effectiveFiscalMode === 'hybrid' ? (
                    <CloudIcon className="w-4 h-4" />
                  ) : (
                    <WifiIcon className="w-4 h-4" />
                  )}
                  <Text fontSize="sm" fontWeight="medium">
                    {effectiveFiscalMode === 'offline' ? 'Fiscal Offline' : 
                     effectiveFiscalMode === 'hybrid' ? 'Fiscal Híbrido' : 
                     'Fiscal Online'}
                  </Text>
                </HStack>
              </Badge>

              <Text fontSize="sm" color="gray.600">
                {effectiveFiscalMode === 'offline' && 'Facturas offline - sync automático al reconectar'}
                {effectiveFiscalMode === 'hybrid' && 'Operaciones críticas offline, reportes online'}
                {effectiveFiscalMode === 'online' && 'Todas las operaciones en tiempo real'}
              </Text>

              {isSyncing && (
                <Badge colorPalette="blue" size="sm">
                  <HStack gap={1}>
                    <CloudIcon className="w-3 h-3" />
                    <Text fontSize="xs">Sync AFIP ({queueSize})</Text>
                  </HStack>
                </Badge>
              )}
            </HStack>

            <HStack gap={2}>
              <Tooltip label="Modo de funcionamiento fiscal">
                <Switch.Root
                  checked={fiscalMode === 'offline-first'}
                  onCheckedChange={(details) => setFiscalMode(details.checked ? 'offline-first' : 'online-first')}
                  size="sm"
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label>
                    <Text fontSize="sm">Offline First</Text>
                  </Switch.Label>
                </Switch.Root>
              </Tooltip>
            </HStack>
          </HStack>
          </Card.Body>
        </Card.Root>

        {/* Header */}
        <VStack align="start" gap="3">
          <HStack justify="space-between" w="full">
            <VStack align="start" gap="1">
              <Text fontSize="3xl" fontWeight="bold">Gestión Fiscal</Text>
              <Text color="gray.600">
                Facturación electrónica, compliance AFIP y reportes financieros
              </Text>
            </VStack>

            <HStack gap="2">
              <Button 
                variant="outline"
                colorPalette="blue" 
                onClick={() => window.open('/tools/operational/tax-reports', '_blank')}
                leftIcon={<ChartBarIcon className="w-4 h-4" />}
                size="sm"
              >
                📊 Reportes Avanzados
              </Button>
              <Button 
                colorPalette="blue"
                leftIcon={<DocumentTextIcon className="w-4 h-4" />}
                onClick={() => setActiveTab('invoicing')}
              >
                Nueva Factura
              </Button>
            </HStack>
          </HStack>

          {/* Critical Alerts */}
          {fiscalStats && fiscalStats.cae_pendientes > 0 && (
            <Alert.Root status="warning" variant="subtle">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <Alert.Title>Atención: CAE Pendientes</Alert.Title>
              <Alert.Description>
                {fiscalStats.cae_pendientes} facturas esperando autorización de AFIP. 
                Revisar en la sección AFIP Integration.
              </Alert.Description>
            </Alert.Root>
          )}

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
            <Card.Root variant="subtle" bg="blue.50">
              <Card.Body p="4" textAlign="center">
                <VStack gap="1">
                  <HStack gap="1" align="center" justify="center">
                    <BanknotesIcon className="w-5 h-5 text-blue-600" />
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      ${fiscalStats?.facturacion_mes_actual?.toLocaleString() || '0'}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">Facturación Mes</Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="subtle" bg="green.50">
              <Card.Body p="4" textAlign="center">
                <VStack gap="1">
                  <HStack gap="1" align="center" justify="center">
                    <DocumentTextIcon className="w-5 h-5 text-green-600" />
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {fiscalStats?.facturas_emitidas_mes || 0}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">Facturas Mes</Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="subtle" bg={fiscalStats?.cae_pendientes ? "yellow.50" : "gray.50"}>
              <Card.Body p="4" textAlign="center">
                <VStack gap="1">
                  <HStack gap="1" align="center" justify="center">
                    <CogIcon className="w-5 h-5 text-yellow-600" />
                    <Text fontSize="lg" fontWeight="bold" 
                          color={fiscalStats?.cae_pendientes ? "yellow.600" : "gray.600"}>
                      {fiscalStats?.cae_pendientes || 0}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">CAE Pendientes</Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root variant="subtle" bg="purple.50">
              <Card.Body p="4" textAlign="center">
                <VStack gap="1">
                  <HStack gap="1" align="center" justify="center">
                    <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
                    <Text fontSize="xs" fontWeight="bold" color="purple.600">
                      {fiscalStats?.proxima_presentacion || 'N/A'}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">Próxima Presentación</Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </VStack>

        {/* Main Content */}
        {shouldShowOfflineView ? (
          /* Show comprehensive offline fiscal view for critical operations */
          <OfflineFiscalView />
        ) : (
          /* Show normal online fiscal interface */
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
            <Tabs.List>
              <Tabs.Trigger value="invoicing">
                <HStack gap={2}>
                  <DocumentTextIcon className="w-4 h-4" />
                  <Text display={{ base: "none", sm: "block" }}>Facturación</Text>
                </HStack>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="afip">
                <HStack gap={2}>
                  <CogIcon className="w-4 h-4" />
                  <Text display={{ base: "none", sm: "block" }}>AFIP</Text>
                </HStack>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="tax">
                <HStack gap={2}>
                  <ChartBarIcon className="w-4 h-4" />
                  <Text display={{ base: "none", sm: "block" }}>Impuestos</Text>
                </HStack>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="reports">
                <HStack gap={2}>
                  <BanknotesIcon className="w-4 h-4" />
                  <Text display={{ base: "none", sm: "block" }}>Reportes</Text>
                </HStack>
              </Tabs.Trigger>
            </Tabs.List>

            <Box mt="6">
              <Tabs.Content value="invoicing">
                {effectiveFiscalMode === 'hybrid' ? <OfflineFiscalView /> : <InvoiceGeneration />}
              </Tabs.Content>

              <Tabs.Content value="afip">
                {effectiveFiscalMode === 'hybrid' ? <OfflineFiscalView /> : <AFIPIntegration />}
              </Tabs.Content>

              <Tabs.Content value="tax">
                <TaxCompliance />
              </Tabs.Content>

              <Tabs.Content value="reports">
                <FinancialReporting />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        )}

        {/* Connection restored notification */}
        {effectiveFiscalMode === 'online' && fiscalMode === 'offline-first' && (
          <Alert.Root status="success" mb={4}>
            <Alert.Indicator />
            <Alert.Title>Conexión Restaurada</Alert.Title>
            <Alert.Description>
              Sistema fiscal ahora en modo híbrido. Las operaciones críticas seguirán siendo offline-first para mayor confiabilidad.
            </Alert.Description>
          </Alert.Root>
        )}
      </VStack>
    </Box>
  );
}

export default FiscalPage;