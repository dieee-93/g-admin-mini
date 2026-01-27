import { orderService, type Order } from './orderService';
import { cartService } from './cartService';
import { eventBus } from '@/lib/events';
import { logger } from '@/lib/logging';
import { supabase } from '@/lib/supabase/client';

export interface ProcessCheckoutParams {
  customerId: string;
  deliveryAddressId: string;
  paymentMethod: string;
}

export interface CheckoutResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export const checkoutService = {
  /**
   * Process complete checkout flow
   */
  async processCheckout(params: ProcessCheckoutParams): Promise<CheckoutResult> {
    const { customerId, deliveryAddressId, paymentMethod } = params;

    try {
      // 1. Validate customer info
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (!deliveryAddressId) {
        throw new Error('Delivery address is required');
      }

      if (!paymentMethod) {
        throw new Error('Payment method is required');
      }

      // 2. Validate cart has items
      const cart = await cartService.getCart({ customerId });

      if (!cart) {
        throw new Error('Cart not found');
      }

      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // 3. Get current total sales count (for achievements)
      const { count: previousTotalSales } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true });

      // 4. Create order from cart
      const order = await orderService.createOrderFromCart({
        customerId,
        deliveryAddressId,
        paymentMethod,
      });

      // 5. Get sale items for event payload
      const { data: saleItems } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', order.id);

      // 6. Calculate new total after order creation
      const totalSales = (previousTotalSales || 0) + 1;

      // 7. Emit sales.order_completed event for cross-module integration
      try {
        await eventBus.emit('sales.order_completed', {
          orderId: order.id,
          orderTotal: order.total,
          items: (saleItems || []).map((item: any) => ({
            productId: item.product_id,
            quantity: item.quantity
          })),
          totalSales,
          previousTotalSales: previousTotalSales || 0,
          timestamp: Date.now(),
          triggeredBy: 'manual' as const,
          userId: customerId
        });

        logger.info('App', 'Order completed event emitted', {
          orderId: order.id,
          totalSales,
          previousTotalSales
        });
      } catch (err) {
        logger.error('App', 'Failed to emit order_completed event', err);
        // Don't fail the checkout if event emission fails
      }

      // 8. TODO: Send order confirmation email (Week 5)
      // await emailService.sendOrderConfirmation(order);

      // 9. TODO: Trigger inventory deduction (if applicable)
      // await inventoryService.deductStock(order);

      return {
        success: true,
        order,
      };
    } catch (error) {
      logger.error('App', 'Error processing checkout', {
        error,
        customerId: params.customerId
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process checkout',
      };
    }
  },

  /**
   * Validate checkout prerequisites
   */
  async validateCheckout(customerId: string): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Check cart
      const cart = await cartService.getCart({ customerId });

      if (!cart) {
        errors.push('Cart not found');
      } else if (!cart.items || cart.items.length === 0) {
        errors.push('Cart is empty');
      }

      // TODO: Check customer has addresses (Week 5)
      // TODO: Validate stock availability (Week 5)

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error('App', 'Error validating checkout', {
        error,
        customerId
      });
      return {
        valid: false,
        errors: ['Failed to validate checkout'],
      };
    }
  },
};
