/**
 * CART SERVICE
 * Business logic for shopping cart operations
 *
 * FEATURES:
 * - CRUD operations for carts
 * - Add/update/remove items logic
 * - Cart migration on login
 */

import { logger } from '@/lib/logging';
import { cartApi } from './cartApi';
import type { Cart, CartItem } from '../types';

export const cartService = {
  /**
   * Get cart by customer ID or session ID
   */
  async getCart(params: { customerId?: string; sessionId?: string }): Promise<Cart | null> {
    try {
      const cart = await cartApi.getCart(params);
      if (cart) {
        logger.info('App', '✅ Retrieved cart', { cartId: cart.id });
      }
      return cart;
    } catch (error) {
      logger.error('App', '❌ Error getting cart:', error);
      throw error;
    }
  },

  /**
   * Create new cart
   */
  async createCart(params: {
    customerId?: string;
    sessionId?: string;
    locationId?: string;
  }): Promise<Cart> {
    try {
      const cart = await cartApi.createCart({
        customer_id: params.customerId || null,
        session_id: params.sessionId || null,
        location_id: params.locationId || null,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      });

      logger.info('App', '✅ Created cart', { cartId: cart.id });
      return cart;
    } catch (error) {
      logger.error('App', '❌ Error creating cart:', error);
      throw error;
    }
  },

  /**
   * Get or create cart (convenience method)
   */
  async getOrCreateCart(params: {
    customerId?: string;
    sessionId?: string;
    locationId?: string;
  }): Promise<Cart> {
    const existingCart = await this.getCart({
      customerId: params.customerId,
      sessionId: params.sessionId,
    });

    if (existingCart) {
      return existingCart;
    }

    return this.createCart(params);
  },

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    item: { product_id: string; quantity: number; price: number; product_name?: string }
  ): Promise<Cart> {
    try {
      // Get current cart
      const cart = await cartApi.getCartById(cartId);
      const currentItems = (cart.items as CartItem[]) || [];

      // Check if item already exists
      const existingIndex = currentItems.findIndex((i) => i.product_id === item.product_id);

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        // Update quantity if item exists
        newItems = currentItems.map((i, idx) =>
          idx === existingIndex
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Add new item
        newItems = [...currentItems, item];
      }

      // Update cart
      const updatedCart = await cartApi.updateCartItems(cartId, newItems);

      logger.info('App', '✅ Added item to cart', { cartId, productId: item.product_id });
      return updatedCart;
    } catch (error) {
      logger.error('App', '❌ Error adding item to cart:', error);
      throw error;
    }
  },

  /**
   * Update item quantity in cart
   */
  async updateItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
    try {
      // Get current cart
      const cart = await cartApi.getCartById(cartId);
      const currentItems = (cart.items as CartItem[]) || [];

      // Update quantity
      const newItems = currentItems.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      );

      // Update cart
      const updatedCart = await cartApi.updateCartItems(cartId, newItems);

      logger.info('App', '✅ Updated item in cart', { cartId, productId, quantity });
      return updatedCart;
    } catch (error) {
      logger.error('App', '❌ Error updating item in cart:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, productId: string): Promise<Cart> {
    try {
      // Get current cart
      const cart = await cartApi.getCartById(cartId);
      const currentItems = (cart.items as CartItem[]) || [];

      // Remove item
      const newItems = currentItems.filter((i) => i.product_id !== productId);

      // Update cart
      const updatedCart = await cartApi.updateCartItems(cartId, newItems);

      logger.info('App', '✅ Removed item from cart', { cartId, productId });
      return updatedCart;
    } catch (error) {
      logger.error('App', '❌ Error removing item from cart:', error);
      throw error;
    }
  },

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: string): Promise<Cart> {
    try {
      const updatedCart = await cartApi.updateCartItems(cartId, []);
      logger.info('App', '✅ Cleared cart', { cartId });
      return updatedCart;
    } catch (error) {
      logger.error('App', '❌ Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Delete cart permanently
   */
  async deleteCart(cartId: string): Promise<void> {
    try {
      await cartApi.deleteCart(cartId);
      logger.info('App', '✅ Deleted cart', { cartId });
    } catch (error) {
      logger.error('App', '❌ Error deleting cart:', error);
      throw error;
    }
  },

  /**
   * Migrate guest cart to customer cart on login
   */
  async migrateCart(sessionId: string, customerId: string): Promise<string | null> {
    try {
      const cartId = await cartApi.migrateCart(sessionId, customerId);

      if (cartId) {
        logger.info('App', '✅ Migrated cart on login', {
          sessionId,
          customerId,
          cartId,
        });
      }

      return cartId;
    } catch (error) {
      logger.error('App', '❌ Error migrating cart:', error);
      throw error;
    }
  },

  /**
   * Get cart item count
   */
  getItemCount(cart: Cart | null): number {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * Check if product is in cart
   */
  hasProduct(cart: Cart | null, productId: string): boolean {
    if (!cart || !cart.items) return false;
    return cart.items.some((item) => item.product_id === productId);
  },

  /**
   * Get product quantity in cart
   */
  getProductQuantity(cart: Cart | null, productId: string): number {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find((i) => i.product_id === productId);
    return item?.quantity || 0;
  },
};
