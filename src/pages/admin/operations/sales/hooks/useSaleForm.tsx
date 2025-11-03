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
import { useSaleValidation } from '@/hooks/useSaleValidation';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';

interface PaymentData {
  payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
  payments?: Array<{ id: string; type: string; amount: number }>;
  cashReceived?: number;
  cashChange?: number;
}

interface UseSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useSaleForm({
  isOpen,
  onClose,
  onSuccess
}: UseSaleFormProps) {
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

      await completeSale({
        payment_method: paymentData.payment_method
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
            onClick: () => {}
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
  }, [completeSale, totals.total, onSuccess, onClose]);

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
    }
  }, [isOpen, clearValidation]);

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
    onClose
  };
}
