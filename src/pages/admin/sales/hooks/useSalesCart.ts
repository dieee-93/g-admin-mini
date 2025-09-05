// src/features/sales/logic/useSalesCart.ts (Enhanced Version)
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toaster } from '@/shared/ui/toaster';
import { supabase } from '@/lib/supabase/client';

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  // max_available is removed as we now rely on backend validation
}

export interface CartSummary {
  itemCount: number;
  totalAmount: number;
  hasItems: boolean;
  isValid: boolean;
  validationMessage?: string;
}

export interface CartValidationOptions {
  enableRealTimeValidation?: boolean;
  validationDebounceMs?: number;
}

const DEFAULT_OPTIONS: CartValidationOptions = {
  enableRealTimeValidation: true,
  validationDebounceMs: 800,
};

// Types from the old useSaleStockValidation hook
export interface ValidationSaleItem {
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


export function useSalesCart(options: CartValidationOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [cart, setCart] = useState<SaleItem[]>([]);
  
  // State from useSaleStockValidation is now here
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<StockValidationResult | null>(null);


  // Referencias para debouncing y control
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const lastValidationRef = useRef<string>('');

  // The validateStock function from useSaleStockValidation is now here
  const validateStock = useCallback(async (saleItems: ValidationSaleItem[]) => {
    if (!saleItems.length) {
      setValidationResult({ is_valid: true });
      return { is_valid: true };
    }

    setIsValidating(true);

    try {
      const { data, error } = await supabase.rpc('validate_sale_stock', {
        items_array: saleItems
      });

      if (error) {
        console.error('Error validating stock:', error);
        const errorMessage = error.message || 'Error al validar stock. Intenta nuevamente.';
        const result = {
          is_valid: false,
          error_message: `Error de validación: ${errorMessage}`
        };
        setValidationResult(result);
        return result;
      }

      const result = data as StockValidationResult;
      setValidationResult(result);
      return result;

    } catch (error) {
      console.error('Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const result = {
        is_valid: false,
        error_message: `Error inesperado: ${errorMessage}`
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  // Función para generar hash del carrito para evitar validaciones duplicadas
  const getCartHash = useCallback((cartItems: SaleItem[]) => {
    return cartItems
      .map(item => `${item.product_id}-${item.quantity}`)
      .sort()
      .join('|');
  }, []);

  // Validación automática con debounce
  const triggerValidation = useCallback(() => {
    if (!opts.enableRealTimeValidation || cart.length === 0) {
      clearValidation();
      return;
    }

    const cartHash = getCartHash(cart);
    if (cartHash === lastValidationRef.current) {
      return; // Evitar validaciones duplicadas
    }

    // Limpiar timeout anterior
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Programar nueva validación
    validationTimeoutRef.current = setTimeout(() => {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      validateStock(items);
      lastValidationRef.current = cartHash;
    }, opts.validationDebounceMs);
  }, [cart, opts.enableRealTimeValidation, opts.validationDebounceMs, validateStock, clearValidation, getCartHash]);

  // Validar automáticamente cuando cambia el carrito
  useEffect(() => {
    triggerValidation();
    
    // Cleanup
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [triggerValidation]);

  // Agregar producto al carrito (sin validaciones de stock frontales)
  const addToCart = useCallback((item: Omit<SaleItem, 'max_available'>) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => cartItem.product_id === item.product_id);
      
      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const existingItem = prevCart[existingIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          unit_price: item.unit_price, // Actualizar precio
        };
        
        return updatedCart;
      } else {
        // Agregar nuevo item
        const newCart = [...prevCart, item];
        return newCart;
      }
    });
  }, []);


  // Remover producto del carrito
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => {
      const removedItem = prevCart.find(item => item.product_id === productId);
      if (removedItem) {
        toaster.create({
          title: "Producto eliminado",
          description: `${removedItem.product_name} eliminado del carrito`,
          status: "info",
          duration: 2000,
        });
      }
      return prevCart.filter(item => item.product_id !== productId);
    });
  }, []);

  // Actualizar cantidad (sin validaciones de stock frontales)
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


  // Actualizar precio de un producto
  const updatePrice = useCallback((productId: string, newPrice: number) => {
    if (newPrice < 0) {
      toaster.create({
        title: "Precio inválido",
        description: "El precio no puede ser negativo",
        status: "error",
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

  // Limpiar carrito con confirmación
  const clearCart = useCallback(() => {
    if (cart.length > 0) {
      setCart([]);
      clearValidation();
      toaster.create({
        title: "Carrito limpiado",
        description: `${cart.length} productos eliminados del carrito`,
        status: "info",
        duration: 2000,
      });
    }
  }, [cart.length, clearValidation]);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId: string) => {
    return cart.some(item => item.product_id === productId);
  }, [cart]);

  // Obtener cantidad de un producto en el carrito
  const getCartQuantity = useCallback((productId: string) => {
    const item = cart.find(cartItem => cartItem.product_id === productId);
    return item?.quantity || 0;
  }, [cart]);

  // Validar stock del carrito manualmente
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

  // Resumen del carrito con validaciones
  const summary: CartSummary = useMemo(() => {
    const itemCount = cart.length;
    const totalAmount = cart.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
    const hasItems = itemCount > 0;
    
    // La validez ahora depende únicamente del resultado de la validación del backend
    const isValid = !validationResult || validationResult.is_valid;
    
    return {
      itemCount,
      totalAmount,
      hasItems,
      isValid,
      validationMessage: validationResult?.error_message
    };
  }, [cart, validationResult]);

  // Preparar datos para venta con validación final
  const getSaleData = useCallback((customerId?: string, note?: string) => {
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

  // Verificar si el carrito puede procesarse
  const canProcessSale = useMemo(() => {
    return (
      cart.length > 0 && 
      summary.isValid &&
      !isValidating &&
      cart.every(item => 
        item.quantity > 0 && 
        item.unit_price >= 0 // unit_price can be 0
      )
    );
  }, [cart, summary.isValid, isValidating]);

  // Obtener estadísticas del carrito
  const cartStats = useMemo(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const averagePrice = cart.length > 0 && totalItems > 0 ? summary.totalAmount / totalItems : 0;
    
    return {
      totalItems,
      averagePrice,
    };
  }, [cart, summary.totalAmount]);

  return {
    // Estado
    cart,
    summary,
    cartStats,
    validationResult,
    isValidating,
    canProcessSale,
    
    // Acciones principales
    addToCart,
    removeFromCart,
    updateQuantity,
    updatePrice,
    clearCart,
    validateCartStock,

    // Helpers
    isInCart,
    getCartQuantity,
    getSaleData,
    
    // Control de validación
    enableRealTimeValidation: opts.enableRealTimeValidation,
    validationDebounceMs: opts.validationDebounceMs
  };
}