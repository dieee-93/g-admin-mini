/**
 * useCart Hook
 * React hook for shopping cart management
 *
 * FEATURES:
 * - Get or create cart automatically
 * - Add/update/remove items
 * - Real-time cart state
 * - Loading/error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { logger } from '@/lib/logging';
import type { Cart } from '../types';

interface UseCartParams {
  customerId?: string;
  sessionId?: string;
  locationId?: string;
  autoLoad?: boolean; // Auto-load cart on mount
}

export function useCart(params: UseCartParams = {}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load or create cart
  const loadCart = useCallback(async () => {
    if (!params.customerId && !params.sessionId) {
      logger.warn('CartHook', 'Cannot load cart without customerId or sessionId');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const existingCart = await cartService.getOrCreateCart({
        customerId: params.customerId,
        sessionId: params.sessionId,
        locationId: params.locationId,
      });

      setCart(existingCart);
      logger.info('CartHook', '✅ Cart loaded', { cartId: existingCart.id });
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error loading cart:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [params.customerId, params.sessionId, params.locationId]);

  // Add item to cart
  const addItem = async (item: {
    product_id: string;
    quantity: number;
    price: number;
    product_name?: string;
  }) => {
    if (!cart) {
      throw new Error('Cart not loaded');
    }

    try {
      setLoading(true);
      setError(null);

      const updatedCart = await cartService.addItem(cart.id, item);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Item added to cart');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error adding item:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateItem = async (productId: string, quantity: number) => {
    if (!cart) {
      throw new Error('Cart not loaded');
    }

    try {
      setLoading(true);
      setError(null);

      const updatedCart = await cartService.updateItem(cart.id, productId, quantity);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Item updated in cart');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error updating item:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    if (!cart) {
      throw new Error('Cart not loaded');
    }

    try {
      setLoading(true);
      setError(null);

      const updatedCart = await cartService.removeItem(cart.id, productId);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Item removed from cart');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error removing item:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!cart) {
      throw new Error('Cart not loaded');
    }

    try {
      setLoading(true);
      setError(null);

      const updatedCart = await cartService.clearCart(cart.id);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Cart cleared');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error clearing cart:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete cart permanently
  const deleteCart = async () => {
    if (!cart) {
      throw new Error('Cart not loaded');
    }

    try {
      setLoading(true);
      setError(null);

      await cartService.deleteCart(cart.id);
      setCart(null);
      logger.info('CartHook', '✅ Cart deleted');
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error deleting cart:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Migrate guest cart to customer cart
  const migrateCart = async (sessionId: string, customerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const cartId = await cartService.migrateCart(sessionId, customerId);
      if (cartId) {
        // Reload cart after migration
        await loadCart();
      }
      logger.info('CartHook', '✅ Cart migrated');
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error migrating cart:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper methods
  const itemCount = cart ? cartService.getItemCount(cart) : 0;
  const hasProduct = (productId: string) =>
    cart ? cartService.hasProduct(cart, productId) : false;
  const getProductQuantity = (productId: string) =>
    cart ? cartService.getProductQuantity(cart, productId) : 0;

  // Auto-load cart on mount if autoLoad is true
  useEffect(() => {
    if (params.autoLoad && (params.customerId || params.sessionId)) {
      loadCart();
    }
  }, [params.autoLoad, params.customerId, params.sessionId, loadCart]);

  return {
    cart,
    loading,
    error,
    itemCount,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    deleteCart,
    migrateCart,
    hasProduct,
    getProductQuantity,
  };
}
