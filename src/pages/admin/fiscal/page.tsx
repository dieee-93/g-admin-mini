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
  CardWrapper,
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
  AlertDescription,
  Icon
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
          <Typography variant="body" color="text.muted">
            Control de facturación, impuestos y cumplimiento normativo
          </Typography>
        </VStack>

        {/* Status Header */}
        <CardWrapper variant="elevated" padding="md">
            <CardWrapper.Body>
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
                  colorPalette={isOnline ? 'green' : 'red'}
                  variant="subtle"
                >
                  {isOnline ? <Icon icon={WifiIcon} size="sm" /> : <Icon icon={NoSymbolIcon} size="sm" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>

                {/* Sync Status */}
                {isSyncing && (
                  <Badge colorPalette="blue" variant="subtle">
                    <Icon icon={CloudIcon} size="sm" />
                    Sincronizando
                  </Badge>
                )}

                {/* Queue Size */}
                {queueSize > 0 && (
                  <Badge colorPalette="orange" variant="subtle">
                    {queueSize} pendientes
                  </Badge>
                )}
              </HStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Fiscal Mode Selector */}
        <CardWrapper variant="outline" padding="md">
          <CardWrapper.Header>
            <Typography variant="title">Configuración del Modo Fiscal</Typography>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="md">
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
                <Button
                  variant={fiscalMode === 'offline-first' ? 'solid' : 'outline'}
                  colorPalette="blue"
                  onClick={() => handleFiscalModeChange('offline-first')}
                  size="lg"
                >
                  <VStack gap="xs">
                    <Typography variant="label">Offline First</Typography>
                    <Typography variant="caption" color="text.muted">
                      Prioriza confiabilidad local
                    </Typography>
                  </VStack>
                </Button>

                <Button
                  variant={fiscalMode === 'auto' ? 'solid' : 'outline'}
                  colorPalette="blue"
                  onClick={() => handleFiscalModeChange('auto')}
                  size="lg"
                >
                  <VStack gap="xs">
                    <Typography variant="label">Automático</Typography>
                    <Typography variant="caption" color="text.muted">
                      Adapta según condiciones
                    </Typography>
                  </VStack>
                </Button>

                <Button
                  variant={fiscalMode === 'online-first' ? 'solid' : 'outline'}
                  colorPalette="green"
                  onClick={() => handleFiscalModeChange('online-first')}
                  size="lg"
                >
                  <VStack gap="xs">
                    <Typography variant="label">Online First</Typography>
                    <Typography variant="caption" color="text.muted">
                      Prioriza sincronización
                    </Typography>
                  </VStack>
                </Button>
              </SimpleGrid>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Quick Stats */}
        {fiscalStats && !isLoading && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
            <CardWrapper variant="outline" padding="md">
              <CardWrapper.Body>
                <VStack gap="sm">
                  <Icon icon={BanknotesIcon} size="2xl" color="green.500" />
                  <Typography variant="title">
                    ${(fiscalStats.facturacion_mes_actual && typeof fiscalStats.facturacion_mes_actual === 'number') 
                      ? fiscalStats.facturacion_mes_actual.toLocaleString('es-AR') 
                      : '0'}
                  </Typography>
                  <Typography variant="caption" color="text.muted">
                    Facturación del mes
                  </Typography>
                </VStack>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="outline" padding="md">
              <CardWrapper.Body>
                <VStack gap="sm">
                  <Icon icon={DocumentTextIcon} size="2xl" color="blue.500" />
                  <Typography variant="title">
                    {(fiscalStats.facturas_emitidas_mes && typeof fiscalStats.facturas_emitidas_mes === 'number') 
                      ? fiscalStats.facturas_emitidas_mes 
                      : 0}
                  </Typography>
                  <Typography variant="caption" color="text.muted">
                    Facturas generadas
                  </Typography>
                </VStack>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="outline" padding="md">
              <CardWrapper.Body>
                <VStack gap="sm">
                  <Icon icon={ExclamationTriangleIcon} size="2xl" color="orange.500" />
                  <Typography variant="title">
                    {(fiscalStats.cae_pendientes && typeof fiscalStats.cae_pendientes === 'number') 
                      ? fiscalStats.cae_pendientes 
                      : 0}
                  </Typography>
                  <Typography variant="caption" color="text.muted">
                    Obligaciones pendientes
                  </Typography>
                </VStack>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="outline" padding="md">
              <CardWrapper.Body>
                <VStack gap="sm">
                  <Icon icon={CalendarDaysIcon} size="2xl" color="purple.500" />
                  <Typography variant="title">
                    {(fiscalStats.proxima_presentacion && typeof fiscalStats.proxima_presentacion === 'string') 
                      ? fiscalStats.proxima_presentacion 
                      : 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.muted">
                    Próximo vencimiento
                  </Typography>
                </VStack>
              </CardWrapper.Body>
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
              <Tab value="invoicing" icon={<Icon icon={DocumentTextIcon} size="sm" />}>
                Facturación
              </Tab>
              <Tab value="afip" icon={<Icon icon={CogIcon} size="sm" />}>
                AFIP
              </Tab>
              <Tab value="compliance" icon={<Icon icon={ExclamationTriangleIcon} size="sm" />}>
                Cumplimiento
              </Tab>
              <Tab value="reporting" icon={<Icon icon={ChartBarIcon} size="sm" />}>
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
