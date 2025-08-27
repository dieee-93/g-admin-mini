// FiscalPage.tsx - Migrated to Design System
import { useState, useEffect, useMemo } from 'react';

// DESIGN SYSTEM IMPORTS - Following our conventions
import {
  // Layout & Structure
  Stack,
  VStack,
  HStack,
  SimpleGrid,
  
  // Typography
  Typography,
  
  // Components
  Card,
  Button,
  Badge,
  
  // Navigation
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  
  // Advanced
  Alert,
  AlertDescription
} from '@/shared/ui';

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
import OfflineFiscalView from './components/OfflineFiscalView';
import { useFiscal } from './hooks/useFiscal';
import { notify } from '@/lib/notifications';
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

  // Set up quick actions
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
        label: 'Reporte Fiscal',
        icon: ChartBarIcon,
        action: () => setActiveTab('reporting'),
        color: 'purple'
      }
    ];

    setQuickActions(quickActions);

    return () => {
      setQuickActions([]);
    };
  }, [setQuickActions]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle fiscal mode change
  const handleFiscalModeChange = (newMode: FiscalMode) => {
    setFiscalMode(newMode);
    
    notify.info({
      title: 'Modo Fiscal Actualizado',
      description: `Cambiado a: ${newMode.replace('-', ' ')}`
    });
  };

  return (
    <VStack gap="lg" align="stretch">
        {/* Header */}
        <VStack gap="sm" align="stretch">
          <Typography variant="heading">Gestión Fiscal</Typography>
          <Typography variant="body" color="muted">
            Control de facturación, impuestos y cumplimiento normativo
          </Typography>
        </VStack>

        {/* Status Header */}
        <Card variant="elevated" padding="md">
          <Card.Body>
            <HStack justify="space-between" align="center">
              <HStack gap="md">
                <Typography variant="title">Estado Fiscal</Typography>
                <Badge 
                  colorPalette={
                    effectiveFiscalMode === 'online' ? 'success' :
                    effectiveFiscalMode === 'hybrid' ? 'warning' : 'info'
                  }
                >
                  {effectiveFiscalMode.toUpperCase()}
                </Badge>
              </HStack>

              <HStack gap="sm">
                {/* Connection Status */}
                <Badge 
                  colorPalette={isOnline ? 'success' : 'error'}
                  variant="subtle"
                >
                  {isOnline ? <WifiIcon className="w-4 h-4" /> : <NoSymbolIcon className="w-4 h-4" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>

                {/* Sync Status */}
                {isSyncing && (
                  <Badge colorPalette="info" variant="subtle">
                    <CloudIcon className="w-4 h-4" />
                    Sincronizando
                  </Badge>
                )}

                {/* Queue Size */}
                {queueSize > 0 && (
                  <Badge colorPalette="warning" variant="subtle">
                    {queueSize} pendientes
                  </Badge>
                )}
              </HStack>
            </HStack>
          </Card.Body>
        </CardWrapper>

        {/* Fiscal Mode Selector */}
        <Card variant="outline" padding="md">
          <Card.Header>
            <Typography variant="title">Configuración del Modo Fiscal</Typography>
          </Card.Header>
          <Card.Body>
            <Stack gap="md">
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
                <Button
                  variant={fiscalMode === 'offline-first' ? 'solid' : 'outline'}
                  colorPalette="info"
                  onClick={() => handleFiscalModeChange('offline-first')}
                  size="lg"
                >
                  <VStack gap="xs">
                    <Typography variant="label">Offline First</Typography>
                    <Typography variant="caption" color="muted">
                      Prioriza confiabilidad local
                    </Typography>
                  </VStack>
                </Button>

                <Button
                  variant={fiscalMode === 'auto' ? 'solid' : 'outline'}
                  colorPalette="info"
                  onClick={() => handleFiscalModeChange('auto')}
                  size="lg"
                >
                  <VStack gap="xs">
                    <Typography variant="label">Automático</Typography>
                    <Typography variant="caption" color="muted">
                      Adapta según condiciones
                    </Typography>
                  </VStack>
                </Button>

                <Button
                  variant={fiscalMode === 'online-first' ? 'solid' : 'outline'}
                  colorPalette="success"
                  onClick={() => handleFiscalModeChange('online-first')}
                  size="lg"
                >
                  <VStack gap="xs">
                    <Typography variant="label">Online First</Typography>
                    <Typography variant="caption" color="muted">
                      Prioriza sincronización
                    </Typography>
                  </VStack>
                </Button>
              </SimpleGrid>
            </Stack>
          </Card.Body>
        </CardWrapper>

        {/* Quick Stats */}
        {fiscalStats && !isLoading && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
            <Card variant="outline" padding="md">
              <Card.Body>
                <VStack gap="sm">
                  <BanknotesIcon className="w-8 h-8 text-green-500" />
                  <Typography variant="title">
                    ${(fiscalStats.facturacion_mes_actual && typeof fiscalStats.facturacion_mes_actual === 'number') 
                      ? fiscalStats.facturacion_mes_actual.toLocaleString('es-AR') 
                      : '0'}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Facturación del mes
                  </Typography>
                </VStack>
              </Card.Body>
            </CardWrapper>

            <Card variant="outline" padding="md">
              <Card.Body>
                <VStack gap="sm">
                  <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                  <Typography variant="title">
                    {(fiscalStats.facturas_emitidas_mes && typeof fiscalStats.facturas_emitidas_mes === 'number') 
                      ? fiscalStats.facturas_emitidas_mes 
                      : 0}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Facturas generadas
                  </Typography>
                </VStack>
              </Card.Body>
            </CardWrapper>

            <Card variant="outline" padding="md">
              <Card.Body>
                <VStack gap="sm">
                  <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                  <Typography variant="title">
                    {(fiscalStats.cae_pendientes && typeof fiscalStats.cae_pendientes === 'number') 
                      ? fiscalStats.cae_pendientes 
                      : 0}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Obligaciones pendientes
                  </Typography>
                </VStack>
              </Card.Body>
            </CardWrapper>

            <Card variant="outline" padding="md">
              <Card.Body>
                <VStack gap="sm">
                  <CalendarDaysIcon className="w-8 h-8 text-purple-500" />
                  <Typography variant="title">
                    {(fiscalStats.proxima_presentacion && typeof fiscalStats.proxima_presentacion === 'string') 
                      ? fiscalStats.proxima_presentacion 
                      : 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Próximo vencimiento
                  </Typography>
                </VStack>
              </Card.Body>
            </CardWrapper>
          </SimpleGrid>
        )}

        {/* Error State */}
        {error && (
          <Alert status="error" title="Error en datos fiscales">
            <AlertDescription>
              {error}. Verifica tu conexión y configuración fiscal.
            </AlertDescription>
          </Alert>
        )}

        {/* Show offline view when necessary */}
        {shouldShowOfflineView ? (
          <OfflineFiscalView />
        ) : (
          /* Main Content Tabs */
          <Tabs value={activeTab} onValueChange={handleTabChange} variant="enclosed">
            <TabList>
              <Tab value="invoicing" icon={<DocumentTextIcon className="w-4 h-4" />}>
                Facturación
              </Tab>
              <Tab value="afip" icon={<CogIcon className="w-4 h-4" />}>
                AFIP
              </Tab>
              <Tab value="compliance" icon={<ExclamationTriangleIcon className="w-4 h-4" />}>
                Cumplimiento
              </Tab>
              <Tab value="reporting" icon={<ChartBarIcon className="w-4 h-4" />}>
                Reportes
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel value="invoicing">
                <InvoiceGeneration />
              </TabPanel>

              <TabPanel value="afip">
                <AFIPIntegration />
              </TabPanel>

              <TabPanel value="compliance">
                <TaxCompliance />
              </TabPanel>

              <TabPanel value="reporting">
                <FinancialReporting />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
    </VStack>
  );
}

export default FiscalPage;
