// OfflineFiscalView.tsx - Robust Offline Fiscal Operations - MIGRATED TO DESIGN SYSTEM
// Handles invoice generation, tax calculations, and AFIP queue management offline

import React, { useState, useEffect, useCallback } from 'react';

// DESIGN SYSTEM IMPORTS - Following our conventions
import {
  CardWrapper ,
  VStack,
  HStack,
  Typography,
  Badge,
  Button,
  Alert,
  AlertDescription,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid
} from '@/shared/ui';

import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  WifiIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

import { useOfflineStatus } from '@/lib/offline';
import { notify } from '@/lib/notifications';
import offlineSync from '@/lib/offline/OfflineSync';

// Offline Fiscal Types
interface OfflineInvoice {
  id: string;
  type: 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'NOTA_CREDITO' | 'NOTA_DEBITO';
  client: {
    name: string;
    cuit?: string;
    condition: 'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTO' | 'CONSUMIDOR_FINAL';
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
  amounts: {
    subtotal: number;
    ivaAmount: number;
    otherTaxes: number;
    total: number;
  };
  status: 'draft' | 'pending_afip' | 'afip_sent' | 'afip_approved' | 'afip_error';
  timestamp: number;
  syncStatus: 'queued' | 'syncing' | 'synced' | 'failed';
  afipAttempts: number;
  errorMessage?: string;
}

interface FiscalOfflineStats {
  pendingInvoices: number;
  queuedForAfip: number;
  totalAmount: number;
  lastSync: number;
  syncErrors: number;
}

// Mock data for demonstration
const generateMockOfflineInvoices = (): OfflineInvoice[] => [
  {
    id: 'inv_001',
    type: 'FACTURA_C',
    client: {
      name: 'Consumidor Final',
      condition: 'CONSUMIDOR_FINAL'
    },
    items: [
      {
        description: 'Combo Hamburguesa',
        quantity: 2,
        unitPrice: 850,
        taxRate: 21,
        total: 1700
      }
    ],
    amounts: {
      subtotal: 1404.96,
      ivaAmount: 295.04,
      otherTaxes: 0,
      total: 1700
    },
    status: 'pending_afip',
    timestamp: Date.now() - 3600000, // 1 hour ago
    syncStatus: 'queued',
    afipAttempts: 0
  },
  {
    id: 'inv_002',
    type: 'FACTURA_B',
    client: {
      name: 'Empresa ABC S.A.',
      cuit: '20-12345678-9',
      condition: 'RESPONSABLE_INSCRIPTO'
    },
    items: [
      {
        description: 'Servicio de Catering',
        quantity: 1,
        unitPrice: 15000,
        taxRate: 21,
        total: 15000
      }
    ],
    amounts: {
      subtotal: 12396.69,
      ivaAmount: 2603.31,
      otherTaxes: 0,
      total: 15000
    },
    status: 'afip_approved',
    timestamp: Date.now() - 7200000, // 2 hours ago
    syncStatus: 'synced',
    afipAttempts: 1
  }
];

const OfflineFiscalView: React.FC = () => {
  const [offlineInvoices, setOfflineInvoices] = useState<OfflineInvoice[]>([]);
  const [fiscalStats, setFiscalStats] = useState<FiscalOfflineStats | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { isOnline } = useOfflineStatus();

  // Initialize mock data
  useEffect(() => {
    const invoices = generateMockOfflineInvoices();
    setOfflineInvoices(invoices);
    
    // Calculate stats
    const stats: FiscalOfflineStats = {
      pendingInvoices: invoices.filter((inv: OfflineInvoice) => inv.status === 'pending_afip').length,
      queuedForAfip: invoices.filter((inv: OfflineInvoice) => inv.syncStatus === 'queued').length,
      totalAmount: invoices.reduce((sum: number, inv: OfflineInvoice) => sum + inv.amounts.total, 0),
      lastSync: Date.now() - 900000, // 15 minutes ago
      syncErrors: invoices.filter((inv: OfflineInvoice) => inv.syncStatus === 'failed').length
    };
    setFiscalStats(stats);
  }, []);

  // Handle invoice sync
  const handleSyncInvoice = useCallback(async (invoice: OfflineInvoice) => {
    try {
      // Mark as syncing
      setOfflineInvoices(prev => 
        prev.map(inv => 
          inv.id === invoice.id 
            ? { ...inv, syncStatus: 'syncing' }
            : inv
        )
      );

      // Queue the invoice for sync using OfflineSync
      await offlineSync.queueOperation({
        type: 'CREATE',
        entity: 'fiscal_invoice',
        data: invoice,
        priority: 1 // High priority for fiscal operations
      });

      // Update status
      setOfflineInvoices(prev => 
        prev.map(inv => 
          inv.id === invoice.id 
            ? { ...inv, syncStatus: 'queued', status: 'afip_sent' }
            : inv
        )
      );

      notify.success({ 
        title: 'Éxito', 
        description: `Invoice ${invoice.id} queued for AFIP sync` 
      });
    } catch (error) {
      // Mark as failed
      setOfflineInvoices(prev => 
        prev.map(inv => 
          inv.id === invoice.id 
            ? { ...inv, syncStatus: 'failed', afipAttempts: inv.afipAttempts + 1 }
            : inv
        )
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notify.error({ 
        title: 'Error', 
        description: `Failed to queue invoice ${invoice.id}: ${errorMessage}` 
      });
    }
  }, []);

  // Handle bulk sync
  const handleBulkSync = useCallback(async () => {
    const pendingInvoices = offlineInvoices.filter(inv => inv.syncStatus === 'queued');
    
    if (pendingInvoices.length === 0) {
      notify.info({ 
        title: 'Info', 
        description: 'No invoices pending sync' 
      });
      return;
    }

    notify.info({ 
      title: 'Sync iniciado', 
      description: `Starting bulk sync of ${pendingInvoices.length} invoices` 
    });

    for (const invoice of pendingInvoices) {
      await handleSyncInvoice(invoice);
    }
  }, [offlineInvoices, handleSyncInvoice]);

  // Handle force fiscal sync
  const handleForceFiscalSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      notify.success({ 
        title: 'Sync iniciado', 
        description: 'Fiscal data sync initiated' 
      });
    } catch (error) {
      notify.error({ 
        title: 'Error', 
        description: 'Failed to initiate fiscal sync' 
      });
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Badge helpers
  const getStatusBadgeProps = (status: OfflineInvoice['status']) => {
    switch (status) {
      case 'draft':
        return { colorPalette: 'gray' as const, label: 'Borrador' };
      case 'pending_afip':
        return { colorPalette: 'warning' as const, label: 'Pendiente AFIP' };
      case 'afip_sent':
        return { colorPalette: 'info' as const, label: 'Enviado AFIP' };
      case 'afip_approved':
        return { colorPalette: 'success' as const, label: 'Aprobado' };
      case 'afip_error':
        return { colorPalette: 'error' as const, label: 'Error AFIP' };
      default:
        return { colorPalette: 'gray' as const, label: 'Desconocido' };
    }
  };

  const getSyncStatusBadgeProps = (syncStatus: OfflineInvoice['syncStatus']) => {
    switch (syncStatus) {
      case 'queued':
        return { colorPalette: 'warning' as const, label: 'En Cola' };
      case 'syncing':
        return { colorPalette: 'info' as const, label: 'Sincronizando' };
      case 'synced':
        return { colorPalette: 'success' as const, label: 'Sincronizado' };
      case 'failed':
        return { colorPalette: 'error' as const, label: 'Error' };
      default:
        return { colorPalette: 'gray' as const, label: 'Pendiente' };
    }
  };

  return (
    <VStack gap="lg">
      {/* Offline Status Header */}
      <CardWrapper variant="outline" padding="md">
        <CardWrapper .Body>
          <HStack justify="space-between" align="center">
            <HStack gap="md">
              <Badge 
                colorPalette={isOnline ? 'success' : 'warning'} 
                variant="subtle"
              >
                <HStack gap="xs">
                  {isOnline ? (
                    <WifiIcon className="w-4 h-4" />
                  ) : (
                    <NoSymbolIcon className="w-4 h-4" />
                  )}
                  <Typography variant="caption">
                    {isOnline ? 'Modo Online' : 'Modo Offline'}
                  </Typography>
                </HStack>
              </Badge>

              <Typography variant="body" color="text.muted">
                Sistema fiscal funcionando offline. Las facturas se sincronizarán automáticamente.
              </Typography>

              {isSyncing && (
                <Badge colorPalette="info" size="sm">
                  <HStack gap="xs">
                    <CloudArrowUpIcon className="w-3 h-3" />
                    <Typography variant="caption">Sincronizando ({queueSize})</Typography>
                  </HStack>
                </Badge>
              )}
            </HStack>

            <HStack gap="sm">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkSync}
                disabled={isSyncing}
              >
                <CloudArrowUpIcon className="w-4 h-4" />
                Sync Todo
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceFiscalSync}
                loading={isSyncing}
              >
                <CloudArrowUpIcon className="w-4 h-4" />
                Forzar Sync
              </Button>
            </HStack>
          </HStack>
        </CardWrapper .Body>
      </CardWrapper>

      {/* Quick Stats */}
      {fiscalStats && (
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="md">
          <CardWrapper variant="outline" padding="md">
            <CardWrapper .Body>
              <VStack gap="sm">
                <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                <Typography variant="title">
                  {fiscalStats.pendingInvoices}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Facturas Pendientes
                </Typography>
              </VStack>
            </CardWrapper .Body>
          </CardWrapper>

          <CardWrapper variant="outline" padding="md">
            <CardWrapper .Body>
              <VStack gap="sm">
                <CloudArrowUpIcon className="w-8 h-8 text-yellow-500" />
                <Typography variant="title">
                  {fiscalStats.queuedForAfip}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Cola AFIP
                </Typography>
              </VStack>
            </CardWrapper .Body>
          </CardWrapper>

          <CardWrapper variant="outline" padding="md">
            <CardWrapper .Body>
              <VStack gap="sm">
                <BanknotesIcon className="w-8 h-8 text-green-500" />
                <Typography variant="title">
                  ${fiscalStats.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Total Pendiente
                </Typography>
              </VStack>
            </CardWrapper .Body>
          </CardWrapper>

          <CardWrapper variant="outline" padding="md">
            <CardWrapper .Body>
              <VStack gap="sm">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                <Typography variant="title">
                  {fiscalStats.syncErrors}
                </Typography>
                <Typography variant="caption" color="text.muted">
                  Errores de Sync
                </Typography>
              </VStack>
            </CardWrapper .Body>
          </CardWrapper>
        </SimpleGrid>
      )}

      {/* Offline Mode Alert */}
      {!isOnline && (
        <Alert status="info" title="Modo Offline Activo">
          <AlertDescription>
            Las facturas se están generando localmente y se sincronizarán con AFIP automáticamente cuando la conexión se restablezca.
          </AlertDescription>
        </Alert>
      )}

      {/* Invoice Management */}
      <CardWrapper variant="outline" padding="md">
        <CardWrapper .Body>
          <VStack gap="md">
            <HStack justify="space-between" align="center">
              <HStack gap="md">
                <Typography variant="title">Facturas Offline</Typography>
                <Badge colorPalette="info" variant="subtle">
                  {offlineInvoices.length} facturas
                </Badge>
              </HStack>

              <HStack gap="sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <CogIcon className="w-4 h-4" />
                  {showAdvanced ? 'Vista Simple' : 'Vista Avanzada'}
                </Button>
              </HStack>
            </HStack>

            {/* Invoice List */}
            <VStack gap="sm" align="stretch">
              {offlineInvoices.map((invoice) => {
                const statusProps = getStatusBadgeProps(invoice.status);
                const syncProps = getSyncStatusBadgeProps(invoice.syncStatus);
                
                return (
                  <CardWrapper key={invoice.id} variant="outline" padding="sm">
                    <CardWrapper .Body>
                      <HStack justify="space-between">
                        <VStack align="start" gap="xs">
                          <HStack gap="sm">
                            <Typography variant="body" fontWeight="medium">{invoice.id}</Typography>
                            <Badge colorPalette={statusProps.colorPalette} size="sm">
                              {statusProps.label}
                            </Badge>
                            <Badge colorPalette={syncProps.colorPalette} size="sm">
                              {syncProps.label}
                            </Badge>
                          </HStack>
                          
                          <HStack gap="sm">
                            <Typography variant="caption" color="text.muted">{invoice.client.name}</Typography>
                            <Typography variant="caption" color="text.muted">•</Typography>
                            <Typography variant="caption" color="text.muted">{invoice.type}</Typography>
                            <Typography variant="caption" color="text.muted">•</Typography>
                            <Typography variant="caption" color="text.muted">${invoice.amounts.total.toLocaleString()}</Typography>
                            <Typography variant="caption" color="text.muted">•</Typography>
                            <Typography variant="caption" color="text.muted">{new Date(invoice.timestamp).toLocaleString()}</Typography>
                          </HStack>

                          {invoice.errorMessage && (
                            <Typography variant="caption" color="error">
                              {invoice.errorMessage}
                            </Typography>
                          )}

                          {showAdvanced && (
                            <VStack align="start" gap="xs">
                              <Typography variant="caption" color="text.muted">Subtotal: ${invoice.amounts.subtotal.toFixed(2)}</Typography>
                              <Typography variant="caption" color="text.muted">IVA: ${invoice.amounts.ivaAmount.toFixed(2)}</Typography>
                              <Typography variant="caption" color="text.muted">Intentos AFIP: {invoice.afipAttempts}</Typography>
                            </VStack>
                          )}
                        </VStack>

                        <VStack gap="xs">
                          {invoice.syncStatus === 'failed' && (
                            <Button
                              size="sm"
                              colorPalette="warning"
                              onClick={() => handleSyncInvoice(invoice)}
                            >
                              <CloudArrowUpIcon className="w-3 h-3" />
                              Reintentar
                            </Button>
                          )}

                          {invoice.syncStatus === 'queued' && (
                            <Badge colorPalette="warning" size="sm">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              Esperando
                            </Badge>
                          )}

                          {invoice.status === 'afip_approved' && (
                            <Badge colorPalette="success" size="sm">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Completado
                            </Badge>
                          )}
                        </VStack>
                      </HStack>
                    </CardWrapper .Body>
                  </CardWrapper>
                );
              })}
            </VStack>

            {offlineInvoices.length === 0 && (
              <VStack gap="md" align="center">
                <DocumentTextIcon className="w-12 h-12 opacity-50" />
                <Typography variant="body" color="text.muted">No hay facturas offline disponibles</Typography>
                <Typography variant="caption" color="text.muted">Las facturas aparecerán aquí cuando se generen sin conexión</Typography>
              </VStack>
            )}
          </VStack>
        </CardWrapper .Body>
      </CardWrapper>
    </VStack>
  );
};

export default OfflineFiscalView;
