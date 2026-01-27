/**
 * Sale Form Hook (POS System)
 * Manages all business logic for Sale/POS modal
 *
 * ARCHITECTURE:
 * - Separates cart/POS logic from UI
 * - Integrates useSaleValidation hook
 * - Manages cart state via useSalesStore
 * - Provides computed values (totals, counts, status)
 * - Handles payment confirmation flow
 *
 * PATTERN: Material Form Pattern adapted for Cart/POS system
 *
 * DIFFERENCES FROM TRADITIONAL FORMS:
 * - Uses cart state instead of form data
 * - Real-time calculations (subtotal, tax, total)
 * - Stock validation per item
 * - Payment flow management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, HStack, Spinner, Text } from '@/shared/ui';
import { CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useSalesStore } from '@/store/salesStore';
import { useSaleValidation } from '@/modules/sales/hooks';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import { eventBus } from '@/lib/events';
import { supabase } from '@/lib/supabase/client';

// Capability detection
import { useActiveFeatures, hasFeature } from '@/lib/capabilities';

// Cross-module types
import type { SaleContext } from '@/modules/fulfillment/onsite/events';

interface PaymentData {
  payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
  payments?: Array<{ id: string; type: string; amount: number }>;
  cashReceived?: number;
  cashChange?: number;
}

// ========================================================================
// PRODUCT TYPE & SALE PATTERN (Capability-aware architecture)
// ========================================================================

/**
 * ProductType - Types of products that determine the sale flow
 * - PHYSICAL: Physical goods (cart-based, immediate or deferred fulfillment)
 * - SERVICE: Professional services (booking-based, needs datetime)
 * - DIGITAL: Digital products (cart-based, instant delivery)
 * - RENTAL: Rental items (booking-based, needs period)
 */
export type ProductType = 'PHYSICAL' | 'SERVICE' | 'DIGITAL' | 'RENTAL';

/**
 * SalePattern - The UI/UX pattern for the sale
 * - CART: Traditional cart with multiple items, checkout at end
 * - DIRECT_ORDER: Items sent immediately (e.g., table order to kitchen)
 * - BOOKING: Single service/rental booking with datetime selection
 */
export type SalePattern = 'CART' | 'DIRECT_ORDER' | 'BOOKING';

interface UseSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Pre-selected context (e.g., table from FloorPlanView) */
  initialContext?: SaleContext;
}

export function useSaleForm({
  isOpen,
  onClose,
  onSuccess,
  initialContext
}: UseSaleFormProps) {
  // ========================================================================
  // CONTEXT DETECTION (Adaptive POS Architecture)
  // ========================================================================
  // The POS adapts by CONTEXT (Mesa, Delivery, TakeAway, Appointments, Rentals)
  // Each context has a completely different flow and UI.
  // @see POS_COMPONENT_ARCHITECTURE.md for full architecture

  const activeFeatures = useActiveFeatures();

  /**
   * Available sale contexts based on active capabilities
   * Each context maps to a specific fulfillment capability:
   * - onsite: sales_dine_in_orders (table service)
   * - delivery: sales_delivery_orders (delivery service)
   * - pickup: sales_takeaway_orders (TakeAway/pickup)
   * - appointment: scheduling_appointment_booking (service appointments)
   * - rental: rental_item_management (equipment rental)
   */
  type SaleContextType = 'onsite' | 'delivery' | 'pickup' | 'appointment' | 'rental';

  const availableContexts = useMemo((): SaleContextType[] => {
    const contexts: SaleContextType[] = [];

    // Check fulfillment capabilities
    if (hasFeature(activeFeatures, 'sales_dine_in_orders')) {
      contexts.push('onsite');
    }
    if (hasFeature(activeFeatures, 'sales_delivery_orders')) {
      contexts.push('delivery');
    }
    if (hasFeature(activeFeatures, 'sales_pickup_orders')) {
      contexts.push('pickup');
    }
    if (hasFeature(activeFeatures, 'scheduling_appointment_booking')) {
      contexts.push('appointment');
    }
    if (hasFeature(activeFeatures, 'rental_item_management')) {
      contexts.push('rental');
    }

    // If no specific context available, default to pickup (basic sale)
    if (contexts.length === 0) {
      contexts.push('pickup');
    }

    return contexts;
  }, [activeFeatures]);

  // Selected context - auto-select if only one available or if initialContext provided
  const [selectedContext, setSelectedContext] = useState<SaleContextType | null>(() => {
    // If initial context provided (e.g., from table click), use it
    if (initialContext?.type === 'onsite') return 'onsite';
    // Auto-select if only one context available
    if (availableContexts.length === 1) return availableContexts[0];
    return null;
  });

  // Legacy ProductType support (derived from context for backwards compatibility)
  const availableProductTypes = useMemo((): ProductType[] => {
    const types: ProductType[] = ['PHYSICAL']; // Always available
    if (hasFeature(activeFeatures, 'scheduling_appointment_booking')) types.push('SERVICE');
    if (hasFeature(activeFeatures, 'digital_file_delivery')) types.push('DIGITAL');
    if (hasFeature(activeFeatures, 'rental_item_management')) types.push('RENTAL');
    return types;
  }, [activeFeatures]);

  const [productType, setProductType] = useState<ProductType | null>(() =>
    availableProductTypes.length === 1 ? availableProductTypes[0] : null
  );

  // Fulfillment for PHYSICAL products (Mesa, TakeAway, Delivery)
  type FulfillmentType = 'onsite' | 'pickup' | 'delivery';

  const availableFulfillments = useMemo((): FulfillmentType[] => {
    const types: FulfillmentType[] = [];
    if (hasFeature(activeFeatures, 'sales_dine_in_orders')) types.push('onsite');
    if (hasFeature(activeFeatures, 'sales_pickup_orders')) types.push('pickup');
    if (hasFeature(activeFeatures, 'sales_delivery_orders')) types.push('delivery');
    // Default to pickup if no specific fulfillment
    if (types.length === 0) types.push('pickup');
    return types;
  }, [activeFeatures]);

  const [selectedFulfillment, setSelectedFulfillment] = useState<FulfillmentType | null>(() =>
    availableFulfillments.length === 1 ? availableFulfillments[0] : null
  );

  // Reset fulfillment when productType changes
  const handleProductTypeSelect = (type: ProductType) => {
    setProductType(type);
    setSelectedFulfillment(null); // Reset fulfillment when type changes
  };

  // Go back from fulfillment to productType selection
  const handleBackToProductType = () => {
    setProductType(null);
    setSelectedFulfillment(null);
  };

  // ========================================================================
  // CART STATE (from useSalesStore)
  // ========================================================================

  const {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    completeSale
  } = useSalesStore();

  // ========================================================================
  // VALIDATION HOOK INTEGRATION
  // ========================================================================

  // Create form data from cart for validation
  const formDataFromCart = useMemo(() => ({
    order_type: 'dine_in' as const,
    payment_method: 'cash' as const,
    items: cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price
    })),
    subtotal: cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    tax_amount: 0, // Will be calculated
    total: 0 // Will be calculated
  }), [cart]);

  const {
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm: optimizedValidateForm,
    validateCartStock,
    calculateTax,
    clearValidation
  } = useSaleValidation(
    formDataFromCart,
    [],
    undefined,
    {
      enableStockValidation: true,
      enableAutoCalculation: true
    }
  );

  // ========================================================================
  // LOADING & SUCCESS STATES
  // ========================================================================

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  // Sale context (table, delivery address, etc.) - injected via HookPoint
  const [saleContext, setSaleContext] = useState<SaleContext | undefined>(initialContext);

  /**
   * Sale Pattern based on ProductType and context
   * - CART: Standard cart for PHYSICAL and DIGITAL
   * - DIRECT_ORDER: For onsite (table) orders - items sent immediately
   * - BOOKING: For SERVICE and RENTAL - single item with datetime/period
   */
  const salePattern = useMemo((): SalePattern => {
    switch (productType) {
      case 'SERVICE':
      case 'RENTAL':
        return 'BOOKING';
      case 'DIGITAL':
      case 'PHYSICAL':
      default:
        // If we have a table context, use DIRECT_ORDER pattern
        if (saleContext?.type === 'onsite') {
          return 'DIRECT_ORDER';
        }
        return 'CART';
    }
  }, [productType, saleContext]);

  const [loadingStates, setLoadingStates] = useState({
    validatingStock: false,
    processingPayment: false,
    completingSale: false
  });

  const [successStates, setSuccessStates] = useState({
    stockValidated: false,
    paymentConfirmed: false,
    saleCompleted: false
  });

  // ========================================================================
  // CALCULATED VALUES (Totals)
  // ========================================================================

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxResult = calculateTax(subtotal, formDataFromCart.items);
    const total = subtotal + taxResult.totalTax;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      taxAmount: taxResult.totalTax,
      total,
      itemCount
    };
  }, [cart, calculateTax, formDataFromCart.items]);

  // ========================================================================
  // CART HANDLERS
  // ========================================================================

  const handleAddToCart = useCallback((item: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    max_available?: number;
  }) => {
    // Validate stock before adding
    const stockValidation = validateCartStock([
      ...formDataFromCart.items,
      {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price
      }
    ]);

    if (!stockValidation.valid) {
      const insufficient = stockValidation.insufficient[0];
      toaster.create({
        title: 'Stock insuficiente',
        description: `Solo hay ${insufficient.available} unidades disponibles`,
        type: 'error',
        duration: 3000
      });
      return false;
    }

    addToCart({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      available_stock: item.max_available
    });

    return true;
  }, [addToCart, validateCartStock, formDataFromCart.items]);

  const handleRemoveItem = useCallback((productId: string) => {
    removeFromCart(productId);
    toaster.create({
      title: 'Producto eliminado',
      description: 'El producto fue removido del carrito',
      type: 'info',
      duration: 2000
    });
  }, [removeFromCart]);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const item = cart.find(i => i.product_id === productId);
    if (item && item.available_stock && newQuantity > item.available_stock) {
      toaster.create({
        title: 'Stock insuficiente',
        description: `Solo hay ${item.available_stock} unidades disponibles`,
        type: 'error',
        duration: 3000
      });
      return;
    }

    updateCartItem(productId, { quantity: newQuantity });
  }, [cart, updateCartItem, handleRemoveItem]);

  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return;

    clearCart();
    toaster.create({
      title: 'Carrito vaciado',
      description: 'Todos los productos fueron removidos',
      type: 'info',
      duration: 2000
    });
  }, [cart.length, clearCart]);

  // ========================================================================
  // PAYMENT FLOW
  // ========================================================================

  const handleOpenPaymentConfirmation = useCallback(() => {
    if (cart.length === 0) {
      toaster.create({
        title: 'Carrito vacío',
        description: 'Agrega productos antes de procesar la venta',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    // Validate stock before proceeding
    setLoadingStates(prev => ({ ...prev, validatingStock: true }));

    const stockValidation = validateCartStock(formDataFromCart.items);

    setLoadingStates(prev => ({ ...prev, validatingStock: false }));

    if (!stockValidation.valid) {
      const insufficientItems = stockValidation.insufficient
        .map(item => `Producto ${item.product_id}: solicitado ${item.requested}, disponible ${item.available}`)
        .join('\n');

      toaster.create({
        title: 'Stock insuficiente',
        description: insufficientItems,
        type: 'error',
        duration: 5000
      });
      return;
    }

    setSuccessStates(prev => ({ ...prev, stockValidated: true }));
    setShowPaymentConfirmation(true);
  }, [cart.length, validateCartStock, formDataFromCart.items]);

  const handleConfirmPayment = useCallback(async (paymentData: PaymentData) => {
    try {
      setIsProcessing(true);
      setShowPaymentConfirmation(false);
      setLoadingStates(prev => ({ ...prev, processingPayment: true }));

      await new Promise(resolve => setTimeout(resolve, 500));

      setLoadingStates(prev => ({ ...prev, processingPayment: false, completingSale: true }));
      setSuccessStates(prev => ({ ...prev, paymentConfirmed: true }));

      // Get current total sales count before completing sale
      const { count: previousTotalSales } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true });

      const sale = await completeSale({
        payment_method: paymentData.payment_method,
        metadata: saleContext
      });

      // Calculate new total
      const totalSales = (previousTotalSales || 0) + 1;

      // Emit event for cross-module integration (e.g., updating onsite table status)
      if (saleContext) {
        eventBus.emit('sales.order_placed', {
          orderId: sale.id,
          total: sale.total,
          context: saleContext,
          items: sale.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        });
      }

      // Emit achievement event with optimized payload
      await eventBus.emit('sales.order_completed', {
        orderId: sale.id,
        orderTotal: sale.total,
        items: sale.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity
        })),
        totalSales,
        previousTotalSales: previousTotalSales || 0,
        timestamp: Date.now(),
        triggeredBy: 'manual' as const,
        userId: undefined
      });

      setLoadingStates(prev => ({ ...prev, completingSale: false }));
      setSuccessStates(prev => ({ ...prev, saleCompleted: true }));

      toaster.create({
        title: 'Venta procesada',
        description: `Venta completada por $${totals.total.toFixed(2)}`,
        type: 'success',
        duration: 3000,
        ...(paymentData.cashChange && paymentData.cashChange > 0 && {
          action: {
            label: `Cambio: $${paymentData.cashChange.toFixed(2)}`,
            onClick: () => { }
          }
        })
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess?.();
      onClose();
    } catch (error) {
      logger.error('SaleForm', 'Error al completar venta', error);

      toaster.create({
        title: 'Error al procesar venta',
        description: error instanceof Error ? error.message : 'Error desconocido',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
      setLoadingStates({
        validatingStock: false,
        processingPayment: false,
        completingSale: false
      });
    }
  }, [completeSale, totals.total, onSuccess, onClose, saleContext]);

  // ========================================================================
  // FORM INITIALIZATION
  // ========================================================================

  // Clear validation when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearValidation();
      setSuccessStates({
        stockValidated: false,
        paymentConfirmed: false,
        saleCompleted: false
      });
      setSaleContext(undefined); // Reset context when modal closes
    }
  }, [isOpen, clearValidation]);

  // Sync with initialContext when it changes (e.g., opened from table)
  useEffect(() => {
    if (initialContext) {
      setSaleContext(initialContext);
    }
  }, [initialContext]);

  // ========================================================================
  // CONTEXT HANDLER (Called by HookPoint injected components)
  // ========================================================================

  const handleContextSelect = useCallback((context: SaleContext) => {
    setSaleContext(context);
    logger.debug('SaleForm', 'Context selected', context);
  }, []);

  // ========================================================================
  // PRODUCT FLOW STATE (for SERVICE/RENTAL flows)
  // ========================================================================

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [flowData, setFlowData] = useState<any>(null);

  /**
   * Handle product selection for flows that require additional configuration
   * (e.g., SERVICE needs datetime, RENTAL needs period)
   */
  const handleProductSelect = useCallback((product: any) => {
    setSelectedProduct(product);
    setFlowData(null); // Reset flow data when product changes
    logger.debug('SaleForm', 'Product selected for flow', product);
  }, []);

  /**
   * Handle completion of product-specific flow
   * Called by HookPoint injected components (DateTimePickerLite, PeriodPicker, etc.)
   */
  const handleFlowComplete = useCallback((data: any) => {
    setFlowData(data);
    logger.debug('SaleForm', 'Flow completed with data', data);

    // Add to cart with flow data as metadata
    if (selectedProduct) {
      handleAddToCart(selectedProduct, {
        ...data,
        flowType: selectedProduct.product_type // SERVICE, RENTAL, etc.
      });

      // Reset flow state
      setSelectedProduct(null);
      setFlowData(null);

      toaster.create({
        title: 'Producto agregado',
        description: `${selectedProduct.name} agregado al carrito`,
        type: 'success',
        duration: 2000
      });
    }
  }, [selectedProduct, handleAddToCart]);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const modalTitle = 'Nueva Venta';

  const submitButtonContent = useMemo(() => {
    if (loadingStates.validatingStock) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Validando stock...</Text>
        </HStack>
      );
    }
    if (loadingStates.processingPayment) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Procesando pago...</Text>
        </HStack>
      );
    }
    if (loadingStates.completingSale) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Completando venta...</Text>
        </HStack>
      );
    }
    if (successStates.saleCompleted) {
      return (
        <HStack gap="2">
          <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
          <Text>¡Venta completada!</Text>
        </HStack>
      );
    }
    return (
      <HStack gap="2">
        <ShoppingCartIcon style={{ width: '16px', height: '16px' }} />
        <Text>Procesar Venta (${totals.total.toFixed(2)})</Text>
      </HStack>
    );
  }, [loadingStates, successStates, totals.total]);

  const operationProgress = useMemo(() => {
    if (!isProcessing) return null;

    let progress = 0;
    let currentStep = '';

    if (loadingStates.validatingStock) {
      progress = 33;
      currentStep = 'Validando disponibilidad de stock';
    } else if (loadingStates.processingPayment) {
      progress = 66;
      currentStep = 'Procesando método de pago';
    } else if (loadingStates.completingSale) {
      progress = 90;
      currentStep = 'Registrando venta en el sistema';
    } else if (successStates.saleCompleted) {
      progress = 100;
      currentStep = '¡Venta completada exitosamente!';
    }

    return { progress, currentStep };
  }, [isProcessing, loadingStates, successStates]);

  const cartStatusBadge = useMemo(() => {
    // Cart empty
    if (cart.length === 0) {
      return <Badge colorPalette="gray" variant="subtle">Carrito vacío</Badge>;
    }

    // Has validation errors
    if (validationState.hasErrors) {
      return (
        <Badge colorPalette="red" variant="subtle">
          Errores de stock ({validationState.errorCount})
        </Badge>
      );
    }

    // High value warning
    if (totals.total > 100000) {
      return <Badge colorPalette="orange" variant="subtle">⚠️ Venta de alto valor</Badge>;
    }

    // Has warnings
    if (validationState.hasWarnings) {
      return (
        <Badge colorPalette="orange" variant="subtle">
          Advertencias ({validationState.warningCount})
        </Badge>
      );
    }

    // All good
    return (
      <Badge colorPalette="green" variant="subtle">
        ✓ Listo ({totals.itemCount} {totals.itemCount === 1 ? 'producto' : 'productos'})
      </Badge>
    );
  }, [cart.length, validationState, totals.total, totals.itemCount]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Cart state
    cart,
    handleAddToCart,
    handleRemoveItem,
    handleUpdateQuantity,
    handleClearCart,

    // Totals
    totals,

    // Validation
    fieldErrors,
    fieldWarnings,
    validationState,

    // States
    isProcessing,
    loadingStates,
    successStates,

    // Payment flow
    showPaymentConfirmation,
    setShowPaymentConfirmation,
    handleOpenPaymentConfirmation,
    handleConfirmPayment,

    // Computed values
    modalTitle,
    submitButtonContent,
    operationProgress,
    cartStatusBadge,

    // Handlers
    onClose,

    // Context (for HookPoint injection)
    saleContext,
    handleContextSelect,

    // Product Flow (for SERVICE/RENTAL flows)
    selectedProduct,
    handleProductSelect,
    handleFlowComplete,
    flowData,

    // ========================================================================
    // CAPABILITY-AWARE ARCHITECTURE (NEW - Adaptive POS)
    // ========================================================================

    /** Available ProductTypes based on active capabilities */
    availableProductTypes,

    /** Currently selected ProductType for this sale */
    productType,

    /** Handler to change ProductType */
    setProductType,

    /** Sale pattern based on ProductType and context (CART, DIRECT_ORDER, BOOKING) */
    salePattern,

    // ========================================================================
    // CONTEXT-BASED ARCHITECTURE (REVISED - Correct Adaptive POS)
    // ========================================================================

    /** Available sale contexts based on active capabilities */
    availableContexts,

    /** Currently selected sale context */
    selectedContext,

    /** Handler to change sale context */
    setSelectedContext,

    // ========================================================================
    // PRODUCTTYPE-FIRST ARCHITECTURE (NEW - Opción B)
    // ========================================================================

    /** Available fulfillment types for PHYSICAL products */
    availableFulfillments,

    /** Currently selected fulfillment for PHYSICAL products */
    selectedFulfillment,

    /** Handler to set fulfillment type */
    setSelectedFulfillment,

    /** Handler to select product type (resets fulfillment) */
    handleProductTypeSelect,

    /** Handler to go back from fulfillment to product type */
    handleBackToProductType
  };
}
