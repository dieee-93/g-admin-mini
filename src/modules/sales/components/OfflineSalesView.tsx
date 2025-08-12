// OfflineSalesView.tsx - Offline-First POS System for G-Admin Mini
// Provides seamless offline sales processing with intelligent sync

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  HStack,
  Text, 
  Card,
  Dialog,
  Select,
  Input,
  createListCollection,
  Grid,
  Alert,
  Badge,
  Progress,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { 
  UserIcon,
  CreditCardIcon,
  ArrowPathIcon,
  WifiIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckSolid,
  WifiIcon as WifiOffIcon
} from '@heroicons/react/24/solid';

import { ProductWithStock } from './ProductWithStock';
import { StockValidationAlert } from './StockValidationAlert';
import { CartValidationSummary, CartQuickAlert } from './CartValidationSummary';
import { fetchCustomers, processSale } from '../data/saleApi';
import { useSalesCart } from '../logic/useSalesCart';
import { toaster } from '@/shared/ui/toaster';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents, type OrderPlacedEvent } from '@/lib/events/RestaurantEvents';

// Offline functionality
import { 
  useOfflineStatus,
  offlineSync,
  localStorage,
  type SyncOperation 
} from '@/lib/offline';

// Real-time functionality
import { useRealtimeOrders, RealtimeStatusIndicator } from '@/lib/websocket';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface OfflineSale {
  id: string;
  timestamp: number;
  items: any[];
  customer?: Customer;
  note?: string;
  totalAmount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
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

  // Real-time functionality
  const {
    isConnected: isRealtimeConnected,
    createOrder,
    onOrderStatusChanged,
    onOrderUpdated
  } = useRealtimeOrders();

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
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);
  const syncRetryRef = useRef<NodeJS.Timeout>();

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
    warningThreshold: 0.8,
    // Offline-specific options
    enableOfflineMode: true,
    offlineValidationStrategy: 'cache_fallback'
  });

  // Initialize offline functionality and real-time subscriptions
  useEffect(() => {
    loadCustomersWithOfflineSupport();
    loadOfflineSales();
    setupSyncEventListeners();
    
    const unsubscribeRealtime = setupRealtimeSubscriptions();

    return () => {
      if (syncRetryRef.current) {
        clearTimeout(syncRetryRef.current);
      }
      unsubscribeRealtime?.();
    };
  }, []);

  const setupRealtimeSubscriptions = () => {
    if (!isRealtimeConnected) return;

    // Listen for order status changes
    const unsubscribeStatus = onOrderStatusChanged((order) => {
      setRealtimeOrders(prev => {
        const existing = prev.find(o => o.id === order.orderId);
        if (existing) {
          return prev.map(o => o.id === order.orderId ? { ...o, status: order.status } : o);
        }
        return prev;
      });
      
      // Show notification for status changes
      toaster.create({
        title: 'Order Status Update',
        description: `Order ${order.orderId} is now ${order.status}`,
        status: 'info',
        duration: 3000
      });
    });

    // Listen for order updates
    const unsubscribeUpdates = onOrderUpdated((order) => {
      setRealtimeOrders(prev => {
        const existing = prev.find(o => o.id === order.orderId);
        if (existing) {
          return prev.map(o => o.id === order.orderId ? { ...o, ...order.updatedFields } : o);
        }
        return prev;
      });
    });

    return () => {
      unsubscribeStatus();
      unsubscribeUpdates();
    };
  };

  // Sync status monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateSyncProgress();
    }, 1000);

    return () => clearInterval(interval);
  }, [isSyncing]);

  const loadCustomersWithOfflineSupport = async () => {
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
          toaster.create({
            title: "Modo Offline",
            description: "Cargando clientes desde caché local",
            status: "info",
            duration: 3000,
          });
        } else {
          setCustomers([]);
        }
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      
      // Try cache as fallback
      const cachedData = await getCachedData('customers');
      if (cachedData && Array.isArray(cachedData)) {
        setCustomers(cachedData);
        toaster.create({
          title: "Usando datos en caché",
          description: "No se pudo conectar al servidor. Usando datos guardados localmente.",
          status: "warning",
          duration: 5000,
        });
      } else {
        toaster.create({
          title: "Error al cargar clientes",
          description: "No se pudieron cargar los clientes y no hay datos en caché.",
          status: "error",
          duration: 5000,
        });
      }
    }
  };

  const loadOfflineSales = async () => {
    try {
      const sales = await localStorage.getAll('offline_sales');
      setOfflineSales(sales || []);
    } catch (error) {
      console.error('Error loading offline sales:', error);
    }
  };

  const setupSyncEventListeners = () => {
    // Listen for sync events
    offlineSync.on('syncStarted', (data: any) => {
      setSyncProgress(0);
    });

    offlineSync.on('syncCompleted', (data: any) => {
      setSyncProgress(100);
      loadOfflineSales(); // Refresh offline sales after sync
      toaster.create({
        title: "Sincronización completa",
        description: "Todas las ventas offline han sido sincronizadas",
        status: "success",
        duration: 4000,
      });
    });

    offlineSync.on('syncFailed', (data: any) => {
      toaster.create({
        title: "Error de sincronización",
        description: "Algunas ventas no se pudieron sincronizar. Se reintentará automáticamente.",
        status: "error",
        duration: 5000,
      });
    });
  };

  const updateSyncProgress = () => {
    if (isSyncing && queueSize > 0) {
      // Simulate progress based on queue reduction
      const progress = Math.max(0, Math.min(100, (1 - queueSize / 10) * 100));
      setSyncProgress(progress);
    } else if (!isSyncing) {
      setSyncProgress(100);
    }
  };

  // Collection for customer select
  const customersCollection = createListCollection({
    items: [
      { value: '', label: 'Sin cliente específico' },
      ...customers.map(customer => ({
        value: customer.id,
        label: `${customer.name}${customer.phone ? ` (${customer.phone})` : ''}`
      }))
    ]
  });

  // Enhanced checkout with offline support
  const handleOpenCheckout = useCallback(async () => {
    if (!summary.hasItems) {
      toaster.create({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de continuar",
        status: "warning",
        duration: 3000,
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
        toaster.create({
          title: "Validación pendiente",
          description: "Espera a que se complete la validación de stock",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      setCheckoutStep('details');
    } else if (checkoutStep === 'details') {
      setCheckoutStep('confirmation');
    }
  }, [checkoutStep, validationResult, isOnline]);

  // Enhanced sale processing with offline support
  const handleProcessSale = useCallback(async () => {
    if (!canProcessSale && isOnline) {
      toaster.create({
        title: "No se puede procesar la venta",
        description: "Verifica que todos los productos tengan stock suficiente",
        status: "error",
        duration: 4000,
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
            toaster.create({
              title: "Stock insuficiente",
              description: "El stock cambió desde la última validación. Revisa tu carrito.",
              status: "error",
              duration: 5000,
            });
            setCheckoutStep('validation');
            return;
          }

          // Process sale online
          const saleResult = await processSale(saleData);
          await handleSuccessfulSale(saleResult, saleData);
        } catch (error) {
          console.warn('Online sale failed, switching to offline mode:', error);
          await processOfflineSale(saleData);
        }
      } else {
        // Offline processing
        await processOfflineSale(saleData);
      }

    } catch (error) {
      console.error('Error processing sale:', error);
      toaster.create({
        title: "Error al procesar venta",
        description: error instanceof Error ? error.message : "Error inesperado",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [canProcessSale, isOnline, validateCartStock, getSaleData, selectedCustomerId, note]);

  const processOfflineSale = async (saleData: any) => {
    try {
      const offlineSale: OfflineSale = {
        id: `offline_sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        items: cart.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
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
        type: 'CREATE',
        entity: 'orders',
        data: {
          ...saleData,
          offlineSaleId: offlineSale.id,
          offlineTimestamp: offlineSale.timestamp
        },
        priority: 1 // High priority for sales
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
          console.warn('Failed to broadcast real-time order:', error);
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
        orderType: 'dine_in',
        timestamp: new Date().toISOString(),
        isOffline: true
      };

      await EventBus.emit(RestaurantEvents.ORDER_PLACED, orderPlacedEvent, 'OfflineSales');

      toaster.create({
        title: "¡Venta guardada offline!",
        description: `Venta por $${summary.totalAmount.toFixed(2)} guardada localmente. Se sincronizará automáticamente.`,
        status: "success",
        duration: 6000,
      });

      await handleSaleCompletion();
      loadOfflineSales(); // Refresh offline sales list

    } catch (error) {
      console.error('Error processing offline sale:', error);
      throw error;
    }
  };

  const handleSuccessfulSale = async (saleResult: any, saleData: any) => {
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
      orderType: 'dine_in',
      timestamp: new Date().toISOString()
    };

    await EventBus.emit(RestaurantEvents.ORDER_PLACED, orderPlacedEvent, 'SalesModule');

    toaster.create({
      title: "¡Venta procesada!",
      description: `Venta por $${summary.totalAmount.toFixed(2)} completada exitosamente`,
      status: "success",
      duration: 5000,
    });

    await handleSaleCompletion();
  };

  const handleSaleCompletion = async () => {
    // Reset form
    clearCart();
    setSelectedCustomerId('');
    setNote('');
    setShowCheckout(false);
    setCheckoutStep('validation');
  };

  const handleSuggestMaxQuantity = useCallback((productId: string, maxQuantity: number) => {
    updateQuantity(productId, maxQuantity);
    toaster.create({
      title: "Cantidad ajustada",
      description: `Cantidad ajustada al máximo disponible: ${maxQuantity}`,
      status: "info",
      duration: 3000,
    });
  }, [updateQuantity]);

  const handleForceSyncOfflineSales = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Error forcing sync:', error);
      toaster.create({
        title: "Error de sincronización",
        description: "No se pudo forzar la sincronización. Verifica tu conexión.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const getConnectionStatusColor = () => {
    if (!isOnline) return 'red';
    if (connectionQuality === 'excellent') return 'green';
    if (connectionQuality === 'good') return 'yellow';
    return 'orange';
  };

  const getConnectionStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isConnecting) return 'Conectando...';
    return `Online (${connectionQuality})`;
  };

  return (
    <Box p="6" maxW="7xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* Enhanced Header with Connection Status */}
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <HStack>
              <Text fontSize="2xl" fontWeight="bold">
                POS Offline-First
              </Text>
              <Badge 
                colorPalette={getConnectionStatusColor()} 
                variant="subtle"
                p={2}
              >
                <HStack spacing={1}>
                  <Icon as={isOnline ? WifiIcon : WifiOffIcon} boxSize={3} />
                  <Text fontSize="xs">{getConnectionStatusText()}</Text>
                </HStack>
              </Badge>
            </HStack>
            <Text color="gray.600">
              Sistema de ventas con capacidad offline completa
            </Text>
          </VStack>
          
          <HStack gap="3">
            {/* Real-time Status Indicator */}
            <RealtimeStatusIndicator size="sm" showDetails={true} />
            {/* Offline Sales Indicator */}
            {offlineSales.length > 0 && (
              <Tooltip label={`${offlineSales.length} ventas pendientes de sincronización`}>
                <Button
                  variant="outline"
                  colorPalette="orange"
                  onClick={() => setShowOfflineStatus(true)}
                >
                  <ClockIcon className="w-4 h-4" />
                  {offlineSales.length} Offline
                </Button>
              </Tooltip>
            )}

            {/* Sync Progress */}
            {isSyncing && (
              <Box minW="120px">
                <Text fontSize="xs" mb={1}>Sincronizando...</Text>
                <Progress.Root value={syncProgress} size="sm">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>
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
              loadingText="Validando..."
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
              loadingText="Procesando..."
            >
              <CreditCardIcon className="w-4 h-4" />
              Finalizar Venta ({summary.itemCount})
            </Button>
          </HStack>
        </HStack>

        {/* Offline Mode Alert */}
        {!isOnline && (
          <Alert.Root status="warning" variant="subtle">
            <Alert.Indicator>
              <ExclamationTriangleIcon className="w-5 h-5" />
            </Alert.Indicator>
            <Alert.Title>Modo Offline Activo</Alert.Title>
            <Alert.Description>
              Las ventas se guardarán localmente y se sincronizarán automáticamente cuando se restablezca la conexión.
            </Alert.Description>
          </Alert.Root>
        )}

        {/* Cart Alert */}
        <CartQuickAlert 
          validationResult={validationResult}
          isValidating={isValidating}
          isOffline={!isOnline}
        />

        {/* Main Layout */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6">
          {/* Products */}
          <Box>
            <VStack gap="4" align="stretch">
              <Text fontSize="lg" fontWeight="semibold">
                Productos Disponibles
              </Text>
              
              <ProductWithStock 
                onAddToCart={addToCart}
                onQuantityChange={updateQuantity}
                currentCart={cart}
                disabled={isProcessing}
                offlineMode={!isOnline}
              />
            </VStack>
          </Box>

          {/* Cart Summary */}
          <Box>
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
          </Box>
        </Grid>
      </VStack>

      {/* Enhanced Checkout Dialog with Offline Support */}
      <Dialog.Root 
        open={showCheckout} 
        onOpenChange={({ open }) => !isProcessing && setShowCheckout(open)}
        size="lg"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {checkoutStep === 'validation' && 'Validación de Stock'}
                {checkoutStep === 'details' && 'Detalles de Venta'}
                {checkoutStep === 'confirmation' && 'Confirmar Venta'}
                {!isOnline && (
                  <Badge colorPalette="orange" variant="subtle" ml={2}>
                    Modo Offline
                  </Badge>
                )}
              </Dialog.Title>
              <Dialog.CloseTrigger disabled={isProcessing} />
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap="4" align="stretch">
                {/* Validation Step */}
                {checkoutStep === 'validation' && (
                  <VStack gap="4" align="stretch">
                    {!isOnline ? (
                      <Alert.Root status="info">
                        <Alert.Indicator />
                        <Alert.Title>Modo Offline</Alert.Title>
                        <Alert.Description>
                          La validación de stock se realizará con datos locales. La venta se sincronizará automáticamente.
                        </Alert.Description>
                      </Alert.Root>
                    ) : (
                      <>
                        <Text>
                          Verificando disponibilidad de stock para todos los productos...
                        </Text>
                        
                        <StockValidationAlert
                          validationResult={validationResult}
                          isValidating={isValidating}
                          onSuggestMaxQuantity={handleSuggestMaxQuantity}
                          onRetryValidation={() => validateCartStock()}
                          showSuggestions={true}
                        />

                        {validationResult?.is_valid && (
                          <Alert.Root status="success">
                            <Alert.Indicator />
                            <Alert.Title>Stock confirmado</Alert.Title>
                            <Alert.Description>
                              Todos los productos tienen stock disponible. Puedes continuar con la venta.
                            </Alert.Description>
                          </Alert.Root>
                        )}
                      </>
                    )}
                  </VStack>
                )}

                {/* Details Step */}
                {checkoutStep === 'details' && (
                  <VStack gap="4" align="stretch">
                    <Box>
                      <Text mb="2" fontWeight="medium">Cliente</Text>
                      <Select.Root
                        collection={customersCollection}
                        value={selectedCustomerId ? [selectedCustomerId] : []}
                        onValueChange={(details) => setSelectedCustomerId(details.value[0] || '')}
                      >
                        <Select.Trigger>
                          <UserIcon className="w-4 h-4" />
                          <Select.ValueText placeholder="Seleccionar cliente (opcional)" />
                        </Select.Trigger>
                        <Select.Content>
                          {customersCollection.items.map((customer) => (
                            <Select.Item key={customer.value} item={customer}>
                              {customer.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>

                    <Box>
                      <Text mb="2" fontWeight="medium">Nota (Opcional)</Text>
                      <Input
                        placeholder="Nota adicional para la venta..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </Box>
                  </VStack>
                )}

                {/* Confirmation Step */}
                {checkoutStep === 'confirmation' && (
                  <VStack gap="4" align="stretch">
                    <Alert.Root status={isOnline ? "info" : "warning"}>
                      <Alert.Indicator />
                      <Alert.Title>
                        {isOnline ? 'Confirmar venta' : 'Confirmar venta offline'}
                      </Alert.Title>
                      <Alert.Description>
                        {isOnline 
                          ? '¿Estás seguro de procesar esta venta? Esta acción reducirá el stock automáticamente.'
                          : '¿Estás seguro de procesar esta venta offline? Se guardará localmente y se sincronizará cuando haya conexión.'
                        }
                      </Alert.Description>
                    </Alert.Root>

                    <Card.Root p="4" bg="gray.50">
                      <VStack gap="2" align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Total de productos:</Text>
                          <Text>{cartStats.totalItems}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Monto total:</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            ${summary.totalAmount.toFixed(2)}
                          </Text>
                        </HStack>
                        {selectedCustomerId && (
                          <HStack justify="space-between">
                            <Text fontWeight="medium">Cliente:</Text>
                            <Text>
                              {customers.find(c => c.id === selectedCustomerId)?.name || 'N/A'}
                            </Text>
                          </HStack>
                        )}
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Estado:</Text>
                          <Badge colorPalette={isOnline ? 'green' : 'orange'}>
                            {isOnline ? 'Procesamiento inmediato' : 'Procesamiento offline'}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Card.Root>
                  </VStack>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap="3" justify="space-between" w="full">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>

                <HStack gap="2">
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
                      loadingText="Validando..."
                    >
                      {checkoutStep === 'validation' ? 'Continuar' : 'Siguiente'}
                    </Button>
                  ) : (
                    <Button
                      colorPalette="green"
                      onClick={handleProcessSale}
                      loading={isProcessing}
                      loadingText="Procesando..."
                      disabled={false} // Allow offline processing
                    >
                      <CheckSolid className="w-4 h-4" />
                      {isOnline ? 'Procesar Venta' : 'Procesar Offline'}
                    </Button>
                  )}
                </HStack>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Offline Sales Status Modal */}
      <OfflineSalesStatusModal
        isOpen={showOfflineStatus}
        onClose={() => setShowOfflineStatus(false)}
        offlineSales={offlineSales}
        onForceSync={handleForceSyncOfflineSales}
        isSyncing={isSyncing}
      />
    </Box>
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
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="2xl">
          <Dialog.Header>
            <Dialog.Title>Ventas Offline Pendientes</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap="4" align="stretch">
              <Text color="gray.600">
                {offlineSales.length} venta(s) pendiente(s) de sincronización
              </Text>

              <Box maxH="400px" overflowY="auto">
                <VStack gap="3" align="stretch">
                  {offlineSales.map((sale) => (
                    <Card.Root key={sale.id} p="4">
                      <HStack justify="space-between" mb="2">
                        <VStack align="start" spacing="1">
                          <Text fontWeight="medium">
                            ${sale.totalAmount.toFixed(2)}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {new Date(sale.timestamp).toLocaleString()}
                          </Text>
                        </VStack>
                        <Badge
                          colorPalette={
                            sale.status === 'synced' ? 'green' :
                            sale.status === 'syncing' ? 'blue' :
                            sale.status === 'failed' ? 'red' : 'yellow'
                          }
                        >
                          {sale.status === 'pending' && 'Pendiente'}
                          {sale.status === 'syncing' && 'Sincronizando'}
                          {sale.status === 'synced' && 'Sincronizada'}
                          {sale.status === 'failed' && 'Error'}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600">
                        {sale.items.length} producto(s)
                        {sale.customer && ` • ${sale.customer.name}`}
                        {sale.note && ` • ${sale.note}`}
                      </Text>

                      {sale.retryCount > 0 && (
                        <Text fontSize="xs" color="orange.600" mt="1">
                          Reintentado {sale.retryCount} veces
                        </Text>
                      )}
                    </Card.Root>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack gap="3">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button
                colorPalette="blue"
                onClick={onForceSync}
                loading={isSyncing}
                loadingText="Sincronizando..."
                disabled={offlineSales.length === 0}
              >
                <CloudIcon className="w-4 h-4" />
                Forzar Sincronización
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default OfflineSalesView;