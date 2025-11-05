/**
 * CART SERVICE
 * Backend logic for shopping cart operations
 *
 * FEATURES:
 * - CRUD operations for carts
 * - Add/update/remove items
 * - Auto-calculate totals (via DB trigger)
 * - Guest cart (session_id) and customer cart (customer_id)
 * - Cart migration on login
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { Cart, CartItem } from '../types';

export const cartService = {
  /**
   * Get cart by customer ID or session ID
   */
  async getCart(params: { customerId?: string; sessionId?: string }): Promise<Cart | null> {
    try {
      let query = supabase.from('carts').select('*');

      if (params.customerId) {
        query = query.eq('customer_id', params.customerId);
      } else if (params.sessionId) {
        query = query.eq('session_id', params.sessionId);
      } else {
        throw new Error('Either customerId or sessionId is required');
      }

      const { data, error } = await query.single();

      if (error) {
        // Cart doesn't exist yet - this is not an error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      logger.info('CartService', '✅ Retrieved cart', { cartId: data?.id });
      return data as Cart;
    } catch (error) {
      logger.error('CartService', '❌ Error getting cart:', error);
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
      const { data, error } = await supabase
        .from('carts')
        .insert({
          customer_id: params.customerId || null,
          session_id: params.sessionId || null,
          location_id: params.locationId || null,
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('CartService', '✅ Created cart', { cartId: data.id });
      return data as Cart;
    } catch (error) {
      logger.error('CartService', '❌ Error creating cart:', error);
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
      const { data: cart, error: fetchError } = await supabase
        .from('carts')
        .select('items')
        .eq('id', cartId)
        .single();

      if (fetchError) throw fetchError;

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

      // Update cart (trigger will recalculate totals)
      const { data, error } = await supabase
        .from('carts')
        .update({ items: newItems })
        .eq('id', cartId)
        .select()
        .single();

      if (error) throw error;

      logger.info('CartService', '✅ Added item to cart', { cartId, productId: item.product_id });
      return data as Cart;
    } catch (error) {
      logger.error('CartService', '❌ Error adding item to cart:', error);
      throw error;
    }
  },

  /**
   * Update item quantity in cart
   */
  async updateItem(cartId: string, productId: string, quantity: number): Promise<Cart> {
    try {
      // Get current cart
      const { data: cart, error: fetchError } = await supabase
        .from('carts')
        .select('items')
        .eq('id', cartId)
        .single();

      if (fetchError) throw fetchError;

      const currentItems = (cart.items as CartItem[]) || [];

      // Update quantity
      const newItems = currentItems.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      );

      // Update cart (trigger will recalculate totals)
      const { data, error } = await supabase
        .from('carts')
        .update({ items: newItems })
        .eq('id', cartId)
        .select()
        .single();

      if (error) throw error;

      logger.info('CartService', '✅ Updated item in cart', { cartId, productId, quantity });
      return data as Cart;
    } catch (error) {
      logger.error('CartService', '❌ Error updating item in cart:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, productId: string): Promise<Cart> {
    try {
      // Get current cart
      const { data: cart, error: fetchError } = await supabase
        .from('carts')
        .select('items')
        .eq('id', cartId)
        .single();

      if (fetchError) throw fetchError;

      const currentItems = (cart.items as CartItem[]) || [];

      // Remove item
      const newItems = currentItems.filter((i) => i.product_id !== productId);

      // Update cart (trigger will recalculate totals)
      const { data, error } = await supabase
        .from('carts')
        .update({ items: newItems })
        .eq('id', cartId)
        .select()
        .single();

      if (error) throw error;

      logger.info('CartService', '✅ Removed item from cart', { cartId, productId });
      return data as Cart;
    } catch (error) {
      logger.error('CartService', '❌ Error removing item from cart:', error);
      throw error;
    }
  },

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: string): Promise<Cart> {
    try {
      const { data, error } = await supabase
        .from('carts')
        .update({ items: [] })
        .eq('id', cartId)
        .select()
        .single();

      if (error) throw error;

      logger.info('CartService', '✅ Cleared cart', { cartId });
      return data as Cart;
    } catch (error) {
      logger.error('CartService', '❌ Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Delete cart permanently
   */
  async deleteCart(cartId: string): Promise<void> {
    try {
      const { error } = await supabase.from('carts').delete().eq('id', cartId);

      if (error) throw error;

      logger.info('CartService', '✅ Deleted cart', { cartId });
    } catch (error) {
      logger.error('CartService', '❌ Error deleting cart:', error);
      throw error;
    }
  },

  /**
   * Migrate guest cart to customer cart on login
   * Uses database function for atomic operation
   */
  async migrateCart(sessionId: string, customerId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('migrate_session_cart_to_customer', {
        p_session_id: sessionId,
        p_customer_id: customerId,
      });

      if (error) throw error;

      if (data) {
        logger.info('CartService', '✅ Migrated cart on login', {
          sessionId,
          customerId,
          cartId: data,
        });
      }

      return data;
    } catch (error) {
      logger.error('CartService', '❌ Error migrating cart:', error);
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
