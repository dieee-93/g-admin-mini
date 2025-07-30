// src/features/sales/logic/useSalesCart.ts
import { useState, useCallback, useMemo } from 'react';
import { useSaleStockValidation } from '@/hooks/useSaleStockValidation';

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

export function useSalesCart() {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const { validateStock, validationResult, isValidating } = useSaleStockValidation();

  // Agregar producto al carrito
  const addToCart = useCallback((item: SaleItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => cartItem.product_id === item.product_id);
      
      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + item.quantity,
          unit_price: item.unit_price // Actualizar precio
        };
        return updatedCart;
      } else {
        // Agregar nuevo item
        return [...prevCart, item];
      }
    });
  }, []);

  // Remover producto del carrito
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  }, []);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => prevCart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }, [removeFromCart]);

  // Actualizar precio de un producto
  const updatePrice = useCallback((productId: string, newPrice: number) => {
    setCart(prevCart => prevCart.map(item => 
      item.product_id === productId 
        ? { ...item, unit_price: newPrice }
        : item
    ));
  }, []);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId: string) => {
    return cart.some(item => item.product_id === productId);
  }, [cart]);

  // Obtener cantidad de un producto en el carrito
  const getCartQuantity = useCallback((productId: string) => {
    const item = cart.find(cartItem => cartItem.product_id === productId);
    return item?.quantity || 0;
  }, [cart]);

  // Validar stock del carrito actual
  const validateCartStock = useCallback(() => {
    if (cart.length === 0) return;

    const items = cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }));

    validateStock(items);
  }, [cart, validateStock]);

  // Resumen del carrito
  const summary: CartSummary = useMemo(() => {
    const itemCount = cart.length;
    const totalAmount = cart.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
    const hasItems = itemCount > 0;
    const isValid = !validationResult || validationResult.is_valid;
    
    return {
      itemCount,
      totalAmount,
      hasItems,
      isValid,
      validationMessage: validationResult?.error_message
    };
  }, [cart, validationResult]);

  // Preparar datos para venta
  const getSaleData = useCallback((customerId?: string, note?: string) => {
    return {
      customer_id: customerId,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
      note
    };
  }, [cart]);

  // Verificar si el carrito puede procesarse
  const canProcessSale = useMemo(() => {
    return (
      cart.length > 0 && 
      (!validationResult || validationResult.is_valid) &&
      !isValidating &&
      cart.every(item => item.quantity > 0 && item.unit_price > 0)
    );
  }, [cart, validationResult, isValidating]);

  return {
    // Estado
    cart,
    summary,
    validationResult,
    isValidating,
    canProcessSale,
    
    // Acciones
    addToCart,
    removeFromCart,
    updateQuantity,
    updatePrice,
    clearCart,
    validateCartStock,
    
    // Helpers
    isInCart,
    getCartQuantity,
    getSaleData
  };
}