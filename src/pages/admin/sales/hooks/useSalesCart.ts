// src/features/sales/logic/useSalesCart.ts (Enhanced Version)
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSaleStockValidation } from '@/hooks/useSaleStockValidation';
import { toaster } from '@/shared/ui/toaster';

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_available: number;
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
  enableProactiveWarnings?: boolean;
  warningThreshold?: number; // Porcentaje del stock disponible para mostrar warnings
}

const DEFAULT_OPTIONS: CartValidationOptions = {
  enableRealTimeValidation: true,
  validationDebounceMs: 800,
  enableProactiveWarnings: true,
  warningThreshold: 0.8 // Alertar cuando se use más del 80% del stock
};

export function useSalesCart(options: CartValidationOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [cart, setCart] = useState<SaleItem[]>([]);
  const { validateStock, validationResult, isValidating, clearValidation } = useSaleStockValidation();
  
  // Referencias para debouncing y control
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const lastValidationRef = useRef<string>('');

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

  // Función para mostrar warnings proactivos
  const checkProactiveWarnings = useCallback((item: SaleItem) => {
    if (!opts.enableProactiveWarnings) return;

    const usagePercentage = item.quantity / item.max_available;
    
    if (usagePercentage >= 1) {
      toaster.create({
        title: "Stock agotado",
        description: `${item.product_name}: No puedes agregar más, stock máximo: ${item.max_available}`,
        status: "error",
        duration: 4000,
      });
    } else if (usagePercentage >= (opts.warningThreshold || 0.8)) {
      toaster.create({
        title: "Stock limitado",
        description: `${item.product_name}: Quedan solo ${item.max_available - item.quantity} unidades disponibles`,
        status: "warning",
        duration: 3000,
      });
    }
  }, [opts.enableProactiveWarnings, opts.warningThreshold]);

  // Agregar producto al carrito con validaciones
  const addToCart = useCallback((item: SaleItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => cartItem.product_id === item.product_id);
      
      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const existingItem = prevCart[existingIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        
        // Validar contra stock disponible
        if (newQuantity > item.max_available) {
          toaster.create({
            title: "Cantidad excedida",
            description: `${item.product_name}: Stock disponible: ${item.max_available}, intentando agregar: ${newQuantity}`,
            status: "error",
            duration: 4000,
          });
          return prevCart; // No agregar si excede stock
        }

        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          unit_price: item.unit_price, // Actualizar precio
          max_available: item.max_available // Actualizar disponibilidad
        };

        // Verificar warnings
        checkProactiveWarnings(updatedCart[existingIndex]);
        
        return updatedCart;
      } else {
        // Validar antes de agregar nuevo item
        if (item.quantity > item.max_available) {
          toaster.create({
            title: "Stock insuficiente",
            description: `${item.product_name}: Solo hay ${item.max_available} unidades disponibles`,
            status: "error",
            duration: 4000,
          });
          return prevCart;
        }

        // Agregar nuevo item
        const newCart = [...prevCart, item];
        checkProactiveWarnings(item);
        return newCart;
      }
    });
  }, [checkProactiveWarnings]);

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

  // Actualizar cantidad con validaciones
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => prevCart.map(item => {
      if (item.product_id === productId) {
        // Validar contra stock disponible
        if (newQuantity > item.max_available) {
          toaster.create({
            title: "Cantidad no disponible",
            description: `${item.product_name}: Stock máximo disponible: ${item.max_available}`,
            status: "warning",
            duration: 3000,
          });
          return { ...item, quantity: item.max_available }; // Ajustar al máximo disponible
        }

        const updatedItem = { ...item, quantity: newQuantity };
        checkProactiveWarnings(updatedItem);
        return updatedItem;
      }
      return item;
    }));
  }, [removeFromCart, checkProactiveWarnings]);

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

  // Sugerir cantidad máxima disponible
  const suggestMaxQuantity = useCallback((productId: string) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.product_id === productId && item.max_available > 0) {
        toaster.create({
          title: "Cantidad ajustada",
          description: `${item.product_name}: Ajustado a máximo disponible (${item.max_available})`,
          status: "info",
          duration: 3000,
        });
        return { ...item, quantity: item.max_available };
      }
      return item;
    }));
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
    
    // Determinar si es válido basado en validación y stock local
    const hasLocalStockIssues = cart.some(item => item.quantity > item.max_available);
    const isValid = !hasLocalStockIssues && (!validationResult || validationResult.is_valid);
    
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
        item.unit_price > 0 && 
        item.quantity <= item.max_available
      )
    );
  }, [cart, summary.isValid, isValidating]);

  // Obtener estadísticas del carrito
  const cartStats = useMemo(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const averagePrice = cart.length > 0 ? summary.totalAmount / totalItems : 0;
    const stockUtilization = cart.reduce((sum, item) => sum + (item.quantity / item.max_available), 0) / cart.length;
    
    return {
      totalItems,
      averagePrice,
      stockUtilization: isNaN(stockUtilization) ? 0 : stockUtilization
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
    
    // Acciones de UX
    suggestMaxQuantity,
    
    // Helpers
    isInCart,
    getCartQuantity,
    getSaleData,
    
    // Control de validación
    enableRealTimeValidation: opts.enableRealTimeValidation,
    validationDebounceMs: opts.validationDebounceMs
  };
}