/**
 * usePOSCart Hook
 * TanStack Query hook for managing POS cart with stock validation
 * 
 * FEATURES:
 * - Cart state management
 * - Real-time stock validation via backend RPC
 * - Debounced validation (800ms)
 * - Integrated with alerts system
 * - Precise decimal calculations
 * 
 * MIGRATED FROM: src/pages/admin/operations/sales/hooks/useSalesCart.ts
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { useAlerts } from '@/shared/alerts';
import { DecimalUtils } from '@/lib/decimal';
import { toaster } from '@/shared/ui/toaster';

// ==================== Types ====================

export interface POSCartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_available?: number; // Optional - for backward compatibility with old components
}

export interface POSCartSummary {
  itemCount: number;
  totalAmount: number;
  hasItems: boolean;
  isValid: boolean;
  validationMessage?: string;
}

export interface POSCartValidationOptions {
  enableRealTimeValidation?: boolean;
  validationDebounceMs?: number;
}

export interface ValidationCartItem {
  product_id: string;
  quantity: number;
}

export interface StockValidationResult {
  is_valid: boolean;
  error_message?: string;
  insufficient_items?: Array<{
    product_id: string;
    product_name: string;
    required: number;
    available: number;
    missing: number;
  }>;
}

export interface SaleData {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  total: number;
  note?: string;
}

// ==================== Constants ====================

const DEFAULT_OPTIONS: POSCartValidationOptions = {
  enableRealTimeValidation: true,
  validationDebounceMs: 800,
};

// ==================== Hook ====================

export function usePOSCart(options: POSCartValidationOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const queryClient = useQueryClient();
  const { actions: alertActions } = useAlerts({
    context: 'sales',
    autoFilter: true,
  });

  // ==================== State ====================

  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<StockValidationResult | null>(null);

  // Debouncing refs
  const validationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastValidationRef = useRef<string>('');

  // ==================== Stock Validation ====================

  /**
   * Validate stock availability via backend RPC
   */
  const validateStockMutation = useMutation({
    mutationFn: async (saleItems: ValidationCartItem[]) => {
      if (!saleItems.length) {
        return { is_valid: true };
      }

      const { data, error } = await (supabase.rpc as any)('validate_sale_stock', {
        items_array: saleItems
      });

      if (error) {
        throw error;
      }

      return data as StockValidationResult;
    },
    onSuccess: (result) => {
      setValidationResult(result);
      
      // Show alert if validation failed
      if (!result.is_valid && result.error_message) {
        alertActions.create({
          type: 'operational',
          context: 'sales',
          severity: 'medium',
          title: 'Stock Validation Failed',
          description: result.error_message,
          autoExpire: 10,
          intelligence_level: 'simple',
        });
      }
    },
    onError: (error: any) => {
      logger.error('App', 'Error validating stock:', error);
      const errorMessage = error.message || 'Error al validar stock. Intenta nuevamente.';
      
      const result = {
        is_valid: false,
        error_message: `Error de validación: ${errorMessage}`
      };
      
      setValidationResult(result);
      
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'high',
        title: 'Stock Validation Error',
        description: errorMessage,
        autoExpire: 10,
        intelligence_level: 'simple',
      });
    },
    onMutate: () => {
      setIsValidating(true);
    },
    onSettled: () => {
      setIsValidating(false);
    }
  });

  /**
   * Validate stock - public interface
   */
  const validateStock = useCallback(async (saleItems: ValidationCartItem[]) => {
    return validateStockMutation.mutateAsync(saleItems);
  }, [validateStockMutation]);

  /**
   * Clear validation result
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  /**
   * Generate cart hash for duplicate prevention
   */
  const getCartHash = useCallback((cartItems: POSCartItem[]) => {
    return cartItems
      .map(item => `${item.product_id}-${item.quantity}`)
      .sort()
      .join('|');
  }, []);

  /**
   * Trigger validation with debounce
   */
  const triggerValidation = useCallback(() => {
    if (!opts.enableRealTimeValidation || cart.length === 0) {
      clearValidation();
      return;
    }

    const cartHash = getCartHash(cart);
    if (cartHash === lastValidationRef.current) {
      return; // Avoid duplicate validations
    }

    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Schedule new validation
    validationTimeoutRef.current = setTimeout(() => {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      validateStock(items);
      lastValidationRef.current = cartHash;
    }, opts.validationDebounceMs);
  }, [cart, opts.enableRealTimeValidation, opts.validationDebounceMs, validateStock, clearValidation, getCartHash]);

  /**
   * Auto-validate when cart changes
   */
  useEffect(() => {
    triggerValidation();
    
    // Cleanup
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [triggerValidation]);

  // ==================== Cart Actions ====================

  /**
   * Add product to cart
   */
  const addToCart = useCallback((item: POSCartItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => cartItem.product_id === item.product_id);
      
      if (existingIndex >= 0) {
        // Update quantity if exists
        const existingItem = prevCart[existingIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          unit_price: item.unit_price, // Update price
        };
        
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, item];
      }
    });
  }, []);

  /**
   * Remove product from cart
   */
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const removedItem = prevCart.find(item => item.product_id === productId);
      if (removedItem) {
        toaster.create({
          title: "Producto eliminado",
          description: `${removedItem.product_name} eliminado del carrito`,
          type: "info",
          duration: 2000,
        });
      }
      return prevCart.filter(item => item.product_id !== productId);
    });
  }, []);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => prevCart.map(item => {
      if (item.product_id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  }, [removeFromCart]);

  /**
   * Update item price
   */
  const updatePrice = useCallback((productId: string, newPrice: number) => {
    if (newPrice < 0) {
      toaster.create({
        title: "Precio inválido",
        description: "El precio no puede ser negativo",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setCart(prevCart => prevCart.map(item => 
      item.product_id === productId 
        ? { ...item, unit_price: newPrice }
        : item
    ));
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    if (cart.length > 0) {
      const itemCount = cart.length;
      setCart([]);
      clearValidation();
      
      toaster.create({
        title: "Carrito limpiado",
        description: `${itemCount} productos eliminados del carrito`,
        type: "info",
        duration: 2000,
      });
    }
  }, [cart.length, clearValidation]);

  /**
   * Check if product is in cart
   */
  const isInCart = useCallback((productId: string) => {
    return cart.some(item => item.product_id === productId);
  }, [cart]);

  /**
   * Get quantity of product in cart
   */
  const getCartQuantity = useCallback((productId: string) => {
    const item = cart.find(cartItem => cartItem.product_id === productId);
    return item?.quantity || 0;
  }, [cart]);

  /**
   * Validate cart stock manually
   */
  const validateCartStock = useCallback(async () => {
    if (cart.length === 0) {
      clearValidation();
      return { is_valid: true };
    }

    const items = cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }));

    return await validateStock(items);
  }, [cart, validateStock, clearValidation]);

  // ==================== Computed Values ====================

  /**
   * Cart summary with validation
   */
  const summary: POSCartSummary = useMemo(() => {
    const itemCount = cart.length;
    const totalAmount = cart.reduce((total, item) => {
      const itemTotal = DecimalUtils.multiply(
        item.quantity.toString(), 
        item.unit_price.toString(), 
        'financial'
      );
      return DecimalUtils.add(total.toString(), itemTotal.toString(), 'financial').toNumber();
    }, 0);
    const hasItems = itemCount > 0;
    
    // Validity depends on backend validation result
    const isValid = !validationResult || validationResult.is_valid;
    
    return {
      itemCount,
      totalAmount,
      hasItems,
      isValid,
      validationMessage: validationResult?.error_message
    };
  }, [cart, validationResult]);

  /**
   * Cart statistics
   */
  const cartStats = useMemo(() => {
    const totalItems = cart.reduce((sum, item) => 
      DecimalUtils.add(sum.toString(), item.quantity.toString(), 'financial').toNumber(), 0
    );
    const averagePrice = cart.length > 0 && totalItems > 0 
      ? DecimalUtils.divide(
          summary.totalAmount.toString(), 
          totalItems.toString(), 
          'financial'
        ).toNumber() 
      : 0;
    
    return {
      totalItems,
      averagePrice,
    };
  }, [cart, summary.totalAmount]);

  /**
   * Can process sale check
   */
  const canProcessSale = useMemo(() => {
    return (
      cart.length > 0 && 
      summary.isValid &&
      !isValidating &&
      cart.every(item => 
        item.quantity > 0 && 
        item.unit_price >= 0
      )
    );
  }, [cart, summary.isValid, isValidating]);

  /**
   * Get sale data for submission
   */
  const getSaleData = useCallback((customerId?: string, note?: string): SaleData => {
    return {
      customer_id: customerId,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
      total: summary.totalAmount,
      note
    };
  }, [cart, summary.totalAmount]);

  // ==================== Return API ====================

  return {
    // State
    cart,
    summary,
    cartStats,
    validationResult,
    isValidating,
    canProcessSale,
    
    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    updatePrice,
    clearCart,
    
    // Validation
    validateCartStock,
    clearValidation,

    // Helpers
    isInCart,
    getCartQuantity,
    getSaleData,
    
    // Configuration
    enableRealTimeValidation: opts.enableRealTimeValidation,
    validationDebounceMs: opts.validationDebounceMs
  };
}
