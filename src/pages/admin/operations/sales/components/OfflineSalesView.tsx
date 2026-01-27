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
import { usePOSCart } from '@/modules/sales/hooks';
import { EventBus } from '@/lib/events';
import type { CreateSaleData } from '../types';

// Extracted components
import {
  OfflineSalesHeader,
  OfflineSalesAlerts,
  OfflineSalesMainLayout,
  OfflineSalesCheckoutModal,
  OfflineSalesStatusModal,
} from './OfflineSales';
import type { CheckoutStep } from './OfflineSales';

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
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('validation');
  
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
  } = usePOSCart({
    enableRealTimeValidation: true,
    validationDebounceMs: 800,
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

  return (
    <Stack direction="column" gap="lg" p="lg" maxW="7xl" mx="auto">
      <Stack direction="column" gap="lg" align="stretch">
        {/* Header with Connection Status and Actions */}
        <OfflineSalesHeader
          isOnline={isOnline}
          isConnecting={isConnecting}
          connectionQuality={connectionQuality}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          queueSize={queueSize}
          offlineSalesCount={offlineSales.length}
          cartItemCount={summary.itemCount}
          hasItems={summary.hasItems}
          isValidating={isValidating}
          isProcessing={isProcessing}
          onShowOfflineStatus={() => setShowOfflineStatus(true)}
          onForceSync={handleForceSyncOfflineSales}
          onValidateStock={() => validateCartStock()}
          onOpenCheckout={handleOpenCheckout}
        />

        {/* Alerts: Offline Mode & Cart Validation */}
        <OfflineSalesAlerts
          isOnline={isOnline}
          validationResult={validationResult}
          isValidating={isValidating}
        />

        {/* Main Layout: Products & Cart */}
        <OfflineSalesMainLayout
          cart={cart}
          summary={summary}
          validationResult={validationResult}
          isValidating={isValidating}
          isOnline={isOnline}
          isProcessing={isProcessing}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          validateCartStock={validateCartStock}
          onProceedToCheckout={handleOpenCheckout}
        />
      </Stack>

      {/* Enhanced Checkout Dialog with Offline Support */}
      <OfflineSalesCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        checkoutStep={checkoutStep}
        setCheckoutStep={setCheckoutStep}
        isOnline={isOnline}
        validationResult={validationResult}
        isValidating={isValidating}
        summary={summary}
        cartStats={cartStats}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
        note={note}
        setNote={setNote}
        isProcessing={isProcessing}
        onProceedToNextStep={handleProceedToNextStep}
        onProcessSale={handleProcessSale}
      />

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

export default OfflineSalesView;