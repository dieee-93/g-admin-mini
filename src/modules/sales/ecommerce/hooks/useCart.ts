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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cartService';
import { logger } from '@/lib/logging';
import { useAlerts } from '@/shared/alerts';
import type { Cart } from '../types';

interface UseCartParams {
  customerId?: string;
  sessionId?: string;
  locationId?: string;
  autoLoad?: boolean; // Auto-load cart on mount
}

export const CART_QUERY_KEY = (customerId?: string, sessionId?: string) => 
  ['cart', { customerId, sessionId }];

export function useCart(params: UseCartParams = {}) {
  const queryClient = useQueryClient();
  const { customerId, sessionId, locationId, autoLoad } = params;

  // Connect to global alerts system
  const { actions: alertActions } = useAlerts({
    context: 'sales',
    autoFilter: true,
  });

  const queryKey = CART_QUERY_KEY(customerId, sessionId);
  const isEnabled = !!(autoLoad && (customerId || sessionId));

  // Load or create cart
  const { 
    data: cart = null, 
    isLoading: loading, 
    error,
    refetch: loadCart
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!customerId && !sessionId) return null;
      
      logger.debug('App', 'Loading cart', { customerId, sessionId });
      try {
        return await cartService.getOrCreateCart({
          customerId,
          sessionId,
          locationId,
        });
      } catch (err: any) {
        // Create alert using global alerts system
        await alertActions.create({
          type: 'operational',
          context: 'sales',
          severity: 'medium',
          title: 'Failed to Load Cart',
          description: `Error loading shopping cart: ${err.message}`,
          metadata: {
            errorCode: err.name,
          },
          autoExpire: 10,
          intelligence_level: 'simple',
        });
        throw err;
      }
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generic error handler for mutations
  const handleMutationError = (title: string, err: any, metadata: any = {}) => {
    logger.error('App', `❌ ${title}:`, err);
    alertActions.create({
      type: 'operational',
      context: 'sales',
      severity: 'medium',
      title,
      description: err.message,
      metadata: {
        errorCode: err.name,
        ...metadata,
      },
      autoExpire: 10,
      intelligence_level: 'simple',
    });
  };

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (item: { product_id: string; quantity: number; price: number; product_name?: string }) => {
      if (!cart) throw new Error('Cart not loaded');
      return await cartService.addItem(cart.id, item);
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKey, updatedCart);
      logger.info('App', '✅ Item added to cart');
    },
    onError: (err: any, variables) => {
      handleMutationError('Failed to Add Item to Cart', err, {
        itemId: variables.product_id,
        itemName: variables.product_name,
      });
    }
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!cart) throw new Error('Cart not loaded');
      return await cartService.updateItem(cart.id, productId, quantity);
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKey, updatedCart);
      logger.info('App', '✅ Item updated in cart');
    },
    onError: (err: any, variables) => {
      handleMutationError('Failed to Update Cart Item', err, { itemId: variables.productId });
    }
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!cart) throw new Error('Cart not loaded');
      return await cartService.removeItem(cart.id, productId);
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKey, updatedCart);
      logger.info('App', '✅ Item removed from cart');
    },
    onError: (err: any, variables) => {
      handleMutationError('Failed to Remove Cart Item', err, { itemId: variables });
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!cart) throw new Error('Cart not loaded');
      return await cartService.clearCart(cart.id);
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKey, updatedCart);
      logger.info('App', '✅ Cart cleared');
    },
    onError: (err: any) => {
      handleMutationError('Failed to Clear Cart', err);
    }
  });

  // Delete cart mutation
  const deleteCartMutation = useMutation({
    mutationFn: async () => {
      if (!cart) throw new Error('Cart not loaded');
      await cartService.deleteCart(cart.id);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
      logger.info('App', '✅ Cart deleted');
    },
    onError: (err: any) => {
      handleMutationError('Failed to Delete Cart', err);
    }
  });

  // Migrate cart mutation
  const migrateCartMutation = useMutation({
    mutationFn: async ({ sessionId, customerId }: { sessionId: string; customerId: string }) => {
      return await cartService.migrateCart(sessionId, customerId);
    },
    onSuccess: async (cartId, variables) => {
      if (cartId) {
        // Invalidate queries to reload cart with new customer association
        await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY(variables.customerId, variables.sessionId) });
        // Also invalidate just customer query
        await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY(variables.customerId, undefined) });
        logger.info('App', '✅ Cart migrated');
      }
    },
    onError: (err: any, variables) => {
      handleMutationError('Failed to Migrate Cart', err, { itemId: variables.customerId });
    }
  });

  // Helper methods
  const itemCount = cart ? cartService.getItemCount(cart) : 0;
  const hasProduct = (productId: string) => cart ? cartService.hasProduct(cart, productId) : false;
  const getProductQuantity = (productId: string) => cart ? cartService.getProductQuantity(cart, productId) : 0;

  return {
    cart,
    loading,
    error: error as Error | null,
    itemCount,
    loadCart: async () => { await loadCart() },
    addItem: (item: { product_id: string; quantity: number; price: number; product_name?: string }) => 
      addItemMutation.mutateAsync(item),
    updateItem: (productId: string, quantity: number) => 
      updateItemMutation.mutateAsync({ productId, quantity }),
    removeItem: (productId: string) => removeItemMutation.mutateAsync(productId),
    clearCart: clearCartMutation.mutateAsync,
    deleteCart: deleteCartMutation.mutateAsync,
    migrateCart: (sessionId: string, customerId: string) => 
      migrateCartMutation.mutateAsync({ sessionId, customerId }),
    hasProduct,
    getProductQuantity,
  };
}
