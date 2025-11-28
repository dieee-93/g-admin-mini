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
import { useAlerts } from '@/shared/alerts';
import { salesAlertsAdapter } from '../../services/salesAlertsAdapter';
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

  // Connect to global alerts system
  const { actions: alertActions } = useAlerts({
    context: 'sales',
    autoFilter: true,
  });

  // Load or create cart
  const loadCart = useCallback(async () => {
    if (!params.customerId && !params.sessionId) {
      logger.warn('CartHook', 'Cannot load cart without customerId or sessionId');
      return;
    }

    try {
      setLoading(true);

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

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Load Cart',
        description: `Error loading shopping cart: ${error.message}`,
        metadata: {
          errorCode: error.name,
        },
        autoExpire: 10,
      });
    } finally {
      setLoading(false);
    }
  }, [params.customerId, params.sessionId, params.locationId, alertActions]);

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

      const updatedCart = await cartService.addItem(cart.id, item);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Item added to cart');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error adding item:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Add Item to Cart',
        description: `Error adding ${item.product_name || 'item'} to cart: ${error.message}`,
        metadata: {
          itemId: item.product_id,
          itemName: item.product_name,
          errorCode: error.name,
        },
        autoExpire: 10,
      });

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

      const updatedCart = await cartService.updateItem(cart.id, productId, quantity);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Item updated in cart');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error updating item:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'low',
        title: 'Failed to Update Cart Item',
        description: `Error updating item quantity: ${error.message}`,
        metadata: {
          itemId: productId,
          errorCode: error.name,
        },
        autoExpire: 10,
      });

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

      const updatedCart = await cartService.removeItem(cart.id, productId);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Item removed from cart');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error removing item:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'low',
        title: 'Failed to Remove Cart Item',
        description: `Error removing item from cart: ${error.message}`,
        metadata: {
          itemId: productId,
          errorCode: error.name,
        },
        autoExpire: 10,
      });

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

      const updatedCart = await cartService.clearCart(cart.id);
      setCart(updatedCart);
      logger.info('CartHook', '✅ Cart cleared');
      return updatedCart;
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error clearing cart:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'low',
        title: 'Failed to Clear Cart',
        description: `Error clearing cart: ${error.message}`,
        metadata: {
          errorCode: error.name,
        },
        autoExpire: 10,
      });

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

      await cartService.deleteCart(cart.id);
      setCart(null);
      logger.info('CartHook', '✅ Cart deleted');
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error deleting cart:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Delete Cart',
        description: `Error deleting cart: ${error.message}`,
        metadata: {
          errorCode: error.name,
        },
        autoExpire: 10,
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Migrate guest cart to customer cart
  const migrateCart = async (sessionId: string, customerId: string) => {
    try {
      setLoading(true);

      const cartId = await cartService.migrateCart(sessionId, customerId);
      if (cartId) {
        // Reload cart after migration
        await loadCart();
      }
      logger.info('CartHook', '✅ Cart migrated');
    } catch (err) {
      const error = err as Error;
      logger.error('CartHook', '❌ Error migrating cart:', error);

      // Create alert using global alerts system
      await alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Migrate Cart',
        description: `Error migrating guest cart to customer account: ${error.message}`,
        metadata: {
          itemId: customerId,
          errorCode: error.name,
        },
        autoExpire: 15,
      });

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
