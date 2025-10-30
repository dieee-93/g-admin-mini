// OfflineSalesView.tsx - Offline-First POS System for G-Admin Mini
// Provides seamless offline sales processing with intelligent sync

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Stack,
  Button,
  Typography,
  CardWrapper ,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalClose,
  Grid,
  Alert,
  Badge
} from '@/shared/ui';
import { notify } from '@/lib/notifications';
import {
  CreditCardIcon,
  ArrowPathIcon,
  WifiIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckSolid,
  WifiIcon as WifiOffIcon
} from '@heroicons/react/24/solid';

import { ProductWithStock } from './ProductWithStock';
import { StockValidationAlert } from './StockValidationAlert';
import { CartValidationSummary, CartQuickAlert } from './CartValidationSummary';
import { fetchCustomers, processSale } from '../services/saleApi';
import { useSalesCart } from '../hooks/useSalesCart';
import { EventBus } from '@/lib/events';
import type { CreateSaleData } from '../types';

// Event payload type for order placement
interface OrderPlacedEvent {
  orderId: string;
  customerId?: string;
  tableId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  timestamp: string;
}

// Offline sale item type (extends cart item with additional offline metadata)
interface OfflineSaleItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

// Offline functionality
import {
  useOfflineStatus,
  offlineSync,
  localStorage,
  type SyncOperation
} from '@/lib/offline';

import { logger } from '@/lib/logging';
interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface OfflineSale {
  id: string;
  timestamp: number;
  items: OfflineSaleItem[];
  customer?: Customer;
  note?: string;
  totalAmount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  syncOperationId?: string;
}

export function OfflineSalesView() {
  // Offline status
  const {
    isOnline,
    isConnecting,
    connectionQuality,
    isSyncing,
    queueSize,
    queueOperation,
    forceSync,
    cacheData,
    getCachedData
  } = useOfflineStatus();

  // Component state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'validation' | 'details' | 'confirmation'>('validation');
  
  // Offline-specific state
  const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showOfflineStatus, setShowOfflineStatus] = useState(false);
  const syncRetryRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced cart with offline support
  const {
    cart,
    summary,
    cartStats,
    validationResult,
    isValidating,
    canProcessSale,
    addToCart,
    updateQuantity,
    clearCart,
    validateCartStock,
    getSaleData
  } = useSalesCart({
    enableRealTimeValidation: true,
    validationDebounceMs: 800,
    enableProactiveWarnings: true,
    warningThreshold: 0.8
    // Note: Offline-specific options removed as they don't exist in current interface
  });

  // Separate setup functions to avoid dependency issues
  const loadCustomersWithOfflineSupport = useCallback(async () => {
    try {
      if (isOnline) {
        // Try to fetch from server
        const data = await fetchCustomers();
        setCustomers(data);
        // Cache for offline use
        await cacheData('customers', data, 24 * 60 * 60 * 1000); // 24 hours TTL
      } else {
        // Load from cache
        const cachedData = await getCachedData('customers');
        if (cachedData && Array.isArray(cachedData)) {
          setCustomers(cachedData);
          notify.info({
            title: "Modo Offline",
            description: "Cargando clientes desde caché local",
          });
        } else {
          setCustomers([]);
        }
      }
    } catch (error) {
      logger.error('SalesStore', 'Error loading customers:', error);

      // Try cache as fallback
      const cachedData = await getCachedData('customers');
      if (cachedData && Array.isArray(cachedData)) {
        setCustomers(cachedData);
        notify.warning({
          title: "Usando datos en caché",
          description: "No se pudo conectar al servidor. Usando datos guardados localmente.",
        });
      } else {
        notify.error({
          title: "Error al cargar clientes",
          description: "No se pudieron cargar los clientes y no hay datos en caché.",
        });
      }
    }
  }, [isOnline, cacheData, getCachedData]);

  const setupSyncEventListeners = useCallback(() => {
    // Listen for sync events
    offlineSync.on('syncStarted', () => {
      setSyncProgress(0);
    });

    offlineSync.on('syncCompleted', () => {
      setSyncProgress(100);
      loadOfflineSales(); // Refresh offline sales after sync
      notify.success({
        title: "Sincronización completa",
        description: "Todas las ventas offline han sido sincronizadas",
      });
    });

    offlineSync.on('syncFailed', () => {
      notify.error({
        title: "Error de sincronización",
        description: "Algunas ventas no se pudieron sincronizar. Se reintentará automáticamente.",
      });
    });
  }, []);

  // Initialize offline functionality and real-time subscriptions
  useEffect(() => {
    loadCustomersWithOfflineSupport();
    loadOfflineSales();
    setupSyncEventListeners();

    const unsubscribeRealtime = setupRealtimeSubscriptions();
    const retryRef = syncRetryRef;

    return () => {
      if (retryRef.current) {
        clearTimeout(retryRef.current);
      }
      unsubscribeRealtime?.();
    };
  }, [loadCustomersWithOfflineSupport, setupSyncEventListeners]);

  // Realtime subscriptions removed - using Supabase Realtime or EventBus instead

  const updateSyncProgress = useCallback(() => {
    if (isSyncing && queueSize > 0) {
      // Simulate progress based on queue reduction
      const progress = Math.max(0, Math.min(100, (1 - queueSize / 10) * 100));
      setSyncProgress(progress);
    } else if (!isSyncing) {
      setSyncProgress(100);
    }
  }, [isSyncing, queueSize]);

  // Sync status monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateSyncProgress();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateSyncProgress]);

  const loadOfflineSales = async () => {
    try {
      const sales = await localStorage.getAll('offline_sales');
      setOfflineSales(sales || []);
    } catch (error) {
      logger.error('SalesStore', 'Error loading offline sales:', error);
    }
  };

  // TODO: Replace native HTML inputs with ChakraUI components
  // - Use SelectField for customer selection (with customers collection)
  // - Use TextareaField for notes
  // - Maintains design system consistency and accessibility
  // - See src/shared/ui/SelectField.tsx and TextareaField.tsx

  // Enhanced checkout with offline support
  const handleOpenCheckout = useCallback(async () => {
    if (!summary.hasItems) {
      notify.warning({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de continuar",
      });
      return;
    }

    setCheckoutStep('validation');
    setShowCheckout(true);
    
    // Validate cart (works offline with cached data)
    await validateCartStock();
  }, [summary.hasItems, validateCartStock]);

  const handleProceedToNextStep = useCallback(() => {
    if (checkoutStep === 'validation') {
      if (!validationResult?.is_valid && isOnline) {
        notify.warning({
          title: "Validación pendiente",
          description: "Espera a que se complete la validación de stock",
        });
        return;
      }
      setCheckoutStep('details');
    } else if (checkoutStep === 'details') {
      setCheckoutStep('confirmation');
    }
  }, [checkoutStep, validationResult, isOnline]);

  const handleSaleCompletion = useCallback(async () => {
    // Reset form
    clearCart();
    setSelectedCustomerId('');
    setNote('');
    setShowCheckout(false);
    setCheckoutStep('validation');
  }, [clearCart]);

  const handleSuccessfulSale = useCallback(async (saleResult: { sale_id?: string }) => {
    // Emit online order event
    const orderPlacedEvent: OrderPlacedEvent = {
      orderId: saleResult.sale_id || `sale_${Date.now()}`,
      customerId: selectedCustomerId || undefined,
      tableId: undefined,
      items: cart.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        specialInstructions: note || undefined
      })),
      totalAmount: summary.totalAmount,
      orderType: 'dine_in' as const,
      timestamp: new Date().toISOString()
    };

    await EventBus.emit('sales.order.placed', orderPlacedEvent, 'SalesModule');

    notify.success({
      title: "¡Venta procesada!",
      description: `Venta por $${summary.totalAmount.toFixed(2)} completada exitosamente`,
    });

    await handleSaleCompletion();
  }, [cart, selectedCustomerId, note, summary.totalAmount, handleSaleCompletion]);

  const processOfflineSale = useCallback(async (saleData: CreateSaleData) => {
    try {
      const offlineSale: OfflineSale = {
        id: `offline_sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        items: cart.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.unit_price,
          name: item.product_name
        })),
        customer: selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : undefined,
        note: note || undefined,
        totalAmount: summary.totalAmount,
        status: 'pending',
        retryCount: 0
      };

      // Store offline sale
      await localStorage.set('offline_sales', offlineSale.id, offlineSale);

      // Queue for sync
            const syncOperation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'retry'> = {
        clientOperationId: `sale_${Date.now()}`,
        type: 'CREATE' as const,
        entity: 'sales',
        data: saleData,
        priority: 1
      };

      const operationId = queueOperation(syncOperation);

      // Update offline sale with operation ID
      await localStorage.set('offline_sales', offlineSale.id, {
        ...offlineSale,
        syncOperationId: operationId
      });

      // Broadcast real-time order if connected
      if (isRealtimeConnected) {
        try {
          await createOrder({
            id: offlineSale.id,
            timestamp: offlineSale.timestamp,
            items: offlineSale.items,
            customer: offlineSale.customer,
            note: offlineSale.note,
            totalAmount: offlineSale.totalAmount,
            isOffline: true,
            source: 'pos'
          });
        } catch (error) {
          logger.error('SalesStore', 'Failed to broadcast real-time order:', error);
        }
      }

      // Emit offline order event
      const orderPlacedEvent: OrderPlacedEvent = {
        orderId: offlineSale.id,
        customerId: selectedCustomerId || undefined,
        tableId: undefined,
        items: offlineSale.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          specialInstructions: note || undefined
        })),
        totalAmount: summary.totalAmount,
        orderType: 'dine_in' as const,
        timestamp: new Date().toISOString()
      };

      await EventBus.emit('sales.order.placed', orderPlacedEvent, 'OfflineSales');

      notify.success({
        title: "¡Venta guardada offline!",
        description: `Venta por $${summary.totalAmount.toFixed(2)} guardada localmente. Se sincronizará automáticamente.`,
      });

      await handleSaleCompletion();
      loadOfflineSales(); // Refresh offline sales list

    } catch (error) {
      logger.error('SalesStore', 'Error processing offline sale:', error);
      throw error;
    }
  }, [cart, selectedCustomerId, customers, note, summary.totalAmount, queueOperation, handleSaleCompletion]);

  // Enhanced sale processing with offline support
  const handleProcessSale = useCallback(async () => {
    if (!canProcessSale && isOnline) {
      notify.error({
        title: "No se puede procesar la venta",
        description: "Verifica que todos los productos tengan stock suficiente",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const saleData = getSaleData(selectedCustomerId || undefined, note || undefined);
      
      if (isOnline) {
        // Online processing
        try {
          // Final validation if online
          const finalValidation = await validateCartStock();
          
          if (finalValidation && !finalValidation.is_valid) {
            notify.error({
              title: "Stock insuficiente",
              description: "El stock cambió desde la última validación. Revisa tu carrito.",
            });
            setCheckoutStep('validation');
            return;
          }

          // Process sale online
          const saleResult = await processSale(saleData);
          await handleSuccessfulSale(saleResult, saleData);
        } catch (error) {
          logger.error('SalesStore', 'Online sale failed, switching to offline mode:', error);
          await processOfflineSale(saleData);
        }
      } else {
        // Offline processing
        await processOfflineSale(saleData);
      }

    } catch (error) {
      logger.error('SalesStore', 'Error processing sale:', error);
      notify.error({
        title: "Error al procesar venta",
        description: error instanceof Error ? error.message : "Error inesperado",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [canProcessSale, isOnline, validateCartStock, getSaleData, selectedCustomerId, note, handleSuccessfulSale, processOfflineSale]);

  // TODO: Implement max quantity suggestion UI
  // This function is ready but needs UI integration in ProductWithStock component
  // const handleSuggestMaxQuantity = useCallback((productId: string, maxQuantity: number) => {
  //   updateQuantity(productId, maxQuantity);
  //   notify.info({
  //     title: "Cantidad ajustada",
  //     description: `Cantidad ajustada al máximo disponible: ${maxQuantity}`,
  //   });
  // }, [updateQuantity]);

  const handleForceSyncOfflineSales = async () => {
    try {
      await forceSync();
    } catch (error) {
      logger.error('SalesStore', 'Error forcing sync:', error);
      notify.error({
        title: "Error de sincronización",
        description: "No se pudo forzar la sincronización. Verifica tu conexión.",
      });
    }
  };

  const getConnectionStatusColor = () => {
    if (!isOnline) return 'error';
    if (connectionQuality === 'excellent') return 'success';
    if (connectionQuality === 'good') return 'warning';
    return 'warning';
  };

  const getConnectionStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isConnecting) return 'Conectando...';
    return `Online (${connectionQuality})`;
  };

  return (
    <Stack direction="column" gap="lg" p="lg" maxW="7xl" mx="auto">
      <Stack direction="column" gap="lg" align="stretch">
        {/* Enhanced Header with Connection Status */}
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="column" align="start" gap="xs">
            <Stack direction="row" align="center" gap="sm">
              <Typography variant="heading" size="xl" weight="bold">
                POS Offline-First
              </Typography>
              <Badge 
                colorPalette={getConnectionStatusColor()} 
                variant="subtle"
              >
                <Stack direction="row" gap="xs" align="center">
                  {isOnline ? <WifiIcon className="w-3 h-3" /> : <WifiOffIcon className="w-3 h-3" />}
                  <Typography variant="body" size="xs">{getConnectionStatusText()}</Typography>
                </Stack>
              </Badge>
            </Stack>
            <Typography variant="body" size="md" color="text.muted">
              Sistema de ventas con capacidad offline completa
            </Typography>
          </Stack>
          
          <Stack direction="row" gap="md">
            {/* Offline Sales Indicator */}
            {offlineSales.length > 0 && (
              <Button
                variant="outline"
                colorPalette="orange"
                onClick={() => setShowOfflineStatus(true)}
                title={`${offlineSales.length} ventas pendientes de sincronización`}
              >
                <ClockIcon className="w-4 h-4" />
                {offlineSales.length} Offline
              </Button>
            )}

            {/* Sync Progress */}
            {isSyncing && (
              <Stack direction="column" minW="120px" gap="xs">
                <Typography variant="body" size="xs">Sincronizando...</Typography>
                <Typography variant="body" size="xs">{syncProgress}%</Typography>
              </Stack>
            )}

            {/* Manual Sync Button */}
            {queueSize > 0 && (
              <Button
                variant="outline"
                colorPalette="blue"
                onClick={handleForceSyncOfflineSales}
                loading={isSyncing}
              >
                <CloudIcon className="w-4 h-4" />
                Sincronizar ({queueSize})
              </Button>
            )}

            {/* Stock Validation */}
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={() => validateCartStock()}
              loading={isValidating}
              disabled={!summary.hasItems}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Revalidar Stock
            </Button>
            
            {/* Checkout Button */}
            <Button
              colorPalette="green"
              onClick={handleOpenCheckout}
              disabled={!summary.hasItems || isValidating}
              loading={isProcessing}
            >
              <CreditCardIcon className="w-4 h-4" />
              Finalizar Venta ({summary.itemCount})
            </Button>
          </Stack>
        </Stack>

        {/* Offline Mode Alert */}
        {!isOnline && (
          <Alert status="warning">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <Alert.Title>Modo Offline Activo</Alert.Title>
            <Alert.Description>
              Las ventas se guardarán localmente y se sincronizarán automáticamente cuando se restablezca la conexión.
            </Alert.Description>
          </Alert>
        )}

        {/* Cart Alert */}
        <CartQuickAlert 
          validationResult={validationResult}
          isValidating={isValidating}
          isOffline={!isOnline}
        />

        {/* Main Layout */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="lg">
          {/* Products */}
          <Stack>
            <Stack gap="lg" direction="column" align="stretch">
              <Typography fontSize="lg" fontWeight="semibold">
                Productos Disponibles
              </Typography>
              
              <ProductWithStock 
                onAddToCart={addToCart}
                onQuantityChange={updateQuantity}
                currentCart={cart}
                disabled={isProcessing}
                offlineMode={!isOnline}
              />
            </Stack>
          </Stack>

          {/* Cart Summary */}
          <Stack>
            <CartValidationSummary
              cart={cart}
              summary={summary}
              validationResult={validationResult}
              isValidating={isValidating}
              onProceedToCheckout={handleOpenCheckout}
              onValidateCart={() => validateCartStock()}
              disabled={isProcessing}
              isOffline={!isOnline}
            />
          </Stack>
        </Grid>
      </Stack>

      {/* Enhanced Checkout Dialog with Offline Support */}
      <Modal isOpen={showCheckout} onClose={() => !isProcessing && setShowCheckout(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {checkoutStep === 'validation' && 'Validación de Stock'}
              {checkoutStep === 'details' && 'Detalles de Venta'}
              {checkoutStep === 'confirmation' && 'Confirmar Venta'}
              {!isOnline && (
                <Badge colorPalette="orange" variant="subtle">
                  Modo Offline
                </Badge>
              )}
            </ModalTitle>
            {!isProcessing && <ModalClose />}
          </ModalHeader>

          <ModalBody>
              <Stack gap="lg" direction="column" align="stretch">
                {/* Validation Step */}
                {checkoutStep === 'validation' && (
                  <Stack gap="lg" direction="column" align="stretch">
                    {!isOnline ? (
                      <Alert status="info">
                        <Alert.Title>Modo Offline</Alert.Title>
                        <Alert.Description>
                          La validación de stock se realizará con datos locales. La venta se sincronizará automáticamente.
                        </Alert.Description>
                      </Alert>
                    ) : (
                      <>
                        <Typography>
                          Verificando disponibilidad de stock para todos los productos...
                        </Typography>
                        
                        <StockValidationAlert
                          validationResult={validationResult!}
                        />

                        {validationResult?.is_valid && (
                          <Alert status="success">
                            <Alert.Title>Stock confirmado</Alert.Title>
                            <Alert.Description>
                              Todos los productos tienen stock disponible. Puedes continuar con la venta.
                            </Alert.Description>
                          </Alert>
                        )}
                      </>
                    )}
                  </Stack>
                )}

                {/* Details Step */}
                {checkoutStep === 'details' && (
                  <Stack gap="lg" direction="column" align="stretch">
                    <Stack>
                      <Typography variant="body" mb="2" fontWeight="medium">Cliente</Typography>
                      <div>
                        {/* Select component needs to be implemented */}
                        <input 
                          placeholder="Seleccionar cliente (opcional)"
                          value={selectedCustomerId || ''}
                          onChange={(e) => setSelectedCustomerId(e.target.value)}
                        />
                      </div>
                    </Stack>

                    <Stack>
                      <Typography variant="body" mb="2" fontWeight="medium">Nota (Opcional)</Typography>
                        {/* Simple input placeholder for now */}
                        <input
                          placeholder="Nota adicional para la venta..."
                          value={note}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </Stack>
                  </Stack>
                )}

                {/* Confirmation Step */}
                {checkoutStep === 'confirmation' && (
                  <Stack gap="lg" direction="column" align="stretch">
                    <Alert status={isOnline ? "info" : "warning"}>
                      <Alert.Title>
                        {isOnline ? 'Confirmar venta' : 'Confirmar venta offline'}
                      </Alert.Title>
                      <Alert.Description>
                        {isOnline 
                          ? '¿Estás seguro de procesar esta venta? Esta acción reducirá el stock automáticamente.'
                          : '¿Estás seguro de procesar esta venta offline? Se guardará localmente y se sincronizará cuando haya conexión.'
                        }
                      </Alert.Description>
                    </Alert>

                    <CardWrapper>
                      <Stack gap="sm" direction="column" align="stretch">
                        <Stack direction="row" justify="space-between">
                          <Typography fontWeight="medium">Total de productos:</Typography>
                          <Typography>{cartStats.totalItems}</Typography>
                        </Stack>
                        <Stack direction="row" justify="space-between">
                          <Typography fontWeight="medium">Monto total:</Typography>
                          <Typography fontSize="lg" fontWeight="bold" >
                            ${summary.totalAmount.toFixed(2)}
                          </Typography>
                        </Stack>
                        {selectedCustomerId && (
                          <Stack direction="row" justify="space-between">
                            <Typography fontWeight="medium">Cliente:</Typography>
                            <Typography>
                              {customers.find(c => c.id === selectedCustomerId)?.name || 'N/A'}
                            </Typography>
                          </Stack>
                        )}
                        <Stack direction="row" justify="space-between">
                          <Typography fontWeight="medium">Estado:</Typography>
                          <Badge colorPalette={isOnline ? 'success' : 'warning'}>
                            {isOnline ? 'Procesamiento inmediato' : 'Procesamiento offline'}
                          </Badge>
                        </Stack>
                      </Stack>
                    </CardWrapper>
                  </Stack>
                )}
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Stack gap="md" direction="row" justify="space-between" w="full">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>

                <Stack gap="sm" direction="row">
                  {checkoutStep !== 'validation' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (checkoutStep === 'details') setCheckoutStep('validation');
                        if (checkoutStep === 'confirmation') setCheckoutStep('details');
                      }}
                      disabled={isProcessing}
                    >
                      Atrás
                    </Button>
                  )}

                  {checkoutStep !== 'confirmation' ? (
                    <Button
                      colorPalette="blue"
                      onClick={handleProceedToNextStep}
                      disabled={
                        (checkoutStep === 'validation' && isOnline && (!validationResult?.is_valid || isValidating)) ||
                        isProcessing
                      }
                      loading={isValidating}
                    >
                      {checkoutStep === 'validation' ? 'Continuar' : 'Siguiente'}
                    </Button>
                  ) : (
                    <Button
                      colorPalette="green"
                      onClick={handleProcessSale}
                      loading={isProcessing}
                      disabled={false} // Allow offline processing
                    >
                      <CheckSolid className="w-4 h-4" />
                      {isOnline ? 'Procesar Venta' : 'Procesar Offline'}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </ModalFooter>
          </ModalContent>
      </Modal>

      {/* Offline Sales Status Modal */}
      <OfflineSalesStatusModal
        isOpen={showOfflineStatus}
        onClose={() => setShowOfflineStatus(false)}
        offlineSales={offlineSales}
        onForceSync={handleForceSyncOfflineSales}
        isSyncing={isSyncing}
      />
    </Stack>
  );
}

// Offline Sales Status Modal Component
const OfflineSalesStatusModal = ({
  isOpen,
  onClose,
  offlineSales,
  onForceSync,
  isSyncing
}: {
  isOpen: boolean;
  onClose: () => void;
  offlineSales: OfflineSale[];
  onForceSync: () => void;
  isSyncing: boolean;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Ventas Offline Pendientes</ModalTitle>
          <ModalClose />
        </ModalHeader>

        <ModalBody>
            <Stack gap="lg" direction="column" align="stretch">
              <Typography color="text.muted">
                {offlineSales.length} venta(s) pendiente(s) de sincronización
              </Typography>

              <Stack maxH="400px" overflowY="auto">
                <Stack gap="md" direction="column" align="stretch">
                  {offlineSales.map((sale) => (
                    <CardWrapper key={sale.id}>
                      <Stack direction="row" justify="space-between" mb="2">
                        <Stack direction="column" align="start">
                          <Typography fontWeight="medium">
                            ${sale.totalAmount.toFixed(2)}
                          </Typography>
                          <Typography fontSize="sm" color="text.muted">
                            {new Date(sale.timestamp).toLocaleString()}
                          </Typography>
                        </Stack>
                        <Badge
                          colorPalette={
                            sale.status === 'synced' ? 'success' :
                            sale.status === 'syncing' ? 'info' :
                            sale.status === 'failed' ? 'error' : 'warning'
                          }
                        >
                          {sale.status === 'pending' && 'Pendiente'}
                          {sale.status === 'syncing' && 'Sincronizando'}
                          {sale.status === 'synced' && 'Sincronizada'}
                          {sale.status === 'failed' && 'Error'}
                        </Badge>
                      </Stack>
                      
                      <Typography fontSize="sm" color="text.muted">
                        {sale.items.length} producto(s)
                        {sale.customer && ` • ${sale.customer.name}`}
                        {sale.note && ` • ${sale.note}`}
                      </Typography>

                      {sale.retryCount > 0 && (
                        <Typography fontSize="xs"  mt="1">
                          Reintentado {sale.retryCount} veces
                        </Typography>
                      )}
                    </CardWrapper>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Stack gap="sm" direction="row">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button
                colorPalette="blue"
                onClick={onForceSync}
                loading={isSyncing}
                disabled={offlineSales.length === 0}
              >
                <CloudIcon className="w-4 h-4" />
                Forzar Sincronización
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
    </Modal>
  );
};

export default OfflineSalesView;