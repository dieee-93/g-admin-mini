import { supabase } from '@/lib/supabase/client';
import { cartService } from './cartService';
import { eventBus } from '@/lib/events';
import { logger } from '@/lib/logging';
import { DecimalUtils } from '@/lib/decimal';

export interface CreateOrderParams {
  customerId: string;
  deliveryAddressId: string;
  paymentMethod: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_type: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  tax: number;
  delivery_address_id: string;
  created_at: string;
}

export const orderService = {
  /**
   * Create an order from the customer's cart
   */
  async createOrderFromCart(params: CreateOrderParams): Promise<Order> {
    const { customerId, deliveryAddressId, paymentMethod } = params;

    try {
      // 1. Get cart
      const cart = await cartService.getCart({ customerId });

      if (!cart) {
        throw new Error('Cart not found');
      }

      // 2. Validate cart has items
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // 3. Create sale record (order)
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: customerId,
          order_type: 'ECOMMERCE',
          order_status: 'PENDING',
          payment_status: 'PENDING',
          payment_method: paymentMethod,
          total: cart.total,
          subtotal: cart.subtotal,
          tax: cart.tax,
          delivery_address_id: deliveryAddressId,
        })
        .select()
        .single();

      if (saleError) {
        logger.error('SalesModule', 'Failed to create sale', {
          error: saleError,
          customerId,
          orderType: 'ECOMMERCE'
        });
        throw new Error(`Failed to create order: ${saleError.message}`);
      }

      // 4. Create sale items from cart items
      const saleItems = cart.items.map((item) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        // ✅ PRECISION FIX: Use DecimalUtils for financial calculations
        subtotal: DecimalUtils.multiply(
          item.price.toString(),
          item.quantity.toString(),
          'financial'
        ).toNumber(),
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        logger.error('SalesModule', 'Failed to create sale items', {
          error: itemsError,
          saleId: sale.id,
          itemsCount: saleItems.length
        });
        // Rollback: delete the sale
        await supabase.from('sales').delete().eq('id', sale.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // 5. Clear cart after successful order
      await cartService.clearCart(cart.id);

      // 6. Emit sales.order_placed event for cross-module integration
      try {
        await eventBus.emit('sales.order_placed', {
          orderId: sale.id,
          customerId: sale.customer_id,
          total: sale.total,
          items: saleItems.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
            price: item.unit_price
          })),
          orderType: 'ECOMMERCE',
          timestamp: Date.now()
        });

        logger.info('SalesModule', 'Order placed event emitted', {
          orderId: sale.id,
          customerId: sale.customer_id
        });
      } catch (err) {
        logger.error('SalesModule', 'Failed to emit order_placed event', err);
        // Don't fail the order if event emission fails
      }

      return sale;
    } catch (error) {
      logger.error('SalesModule', 'Error in createOrderFromCart', {
        error,
        customerId: params.customerId
      });
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('SalesModule', 'Error fetching order', {
        error,
        orderId
      });
      return null;
    }
  },

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', customerId)
        .eq('order_type', 'ECOMMERCE')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('SalesModule', 'Error fetching customer orders', {
        error,
        customerId
      });
      return [];
    }
  },
};
