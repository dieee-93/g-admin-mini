/**
 * Cart API
 * Data access layer for shopping cart operations
 */

import { supabase } from '@/lib/supabase/client';
import type { Cart, CartItem } from '../types';

export const cartApi = {
  async getCart(params: { customerId?: string; sessionId?: string }) {
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
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as Cart;
  },

  async getCartById(cartId: string) {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .single();

    if (error) throw error;
    return data as Cart;
  },

  async createCart(cartData: {
    customer_id?: string | null;
    session_id?: string | null;
    location_id?: string | null;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
  }) {
    const { data, error } = await (supabase
      .from('carts') as any)
      .insert(cartData)
      .select()
      .single();

    if (error) throw error;
    return data as Cart;
  },

  async updateCartItems(cartId: string, items: CartItem[]) {
    const { data, error } = await (supabase
      .from('carts') as any)
      .update({ items })
      .eq('id', cartId)
      .select()
      .single();

    if (error) throw error;
    return data as Cart;
  },

  async deleteCart(cartId: string) {
    const { error } = await supabase.from('carts').delete().eq('id', cartId);
    if (error) throw error;
  },

  async migrateCart(sessionId: string, customerId: string) {
    const { data, error } = await supabase.rpc('migrate_session_cart_to_customer', {
      p_session_id: sessionId,
      p_customer_id: customerId,
    } as any);

    if (error) throw error;
    return data as string | null;
  }
};
