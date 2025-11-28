// TODO: Uncomment CreateOrderParams when implementing checkout order creation
import { orderService, /* type CreateOrderParams, */ type Order } from './orderService';
import { cartService } from './cartService';
import { eventBus } from '@/lib/events';
import { logger } from '@/lib/logging';

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

      // 3. Create order from cart
      const order = await orderService.createOrderFromCart({
        customerId,
        deliveryAddressId,
        paymentMethod,
      });

      // 4. Emit sales.order_completed event for cross-module integration
      try {
        await eventBus.emit('sales.order_completed', {
          orderId: order.id,
          customerId: order.customer_id,
          total: order.total,
          paymentMethod: order.payment_method,
          timestamp: Date.now()
        });

        logger.info('SalesModule', 'Order completed event emitted', {
          orderId: order.id
        });
      } catch (err) {
        logger.error('SalesModule', 'Failed to emit order_completed event', err);
        // Don't fail the checkout if event emission fails
      }

      // 5. TODO: Send order confirmation email (Week 5)
      // await emailService.sendOrderConfirmation(order);

      // 6. TODO: Trigger inventory deduction (if applicable)
      // await inventoryService.deductStock(order);

      return {
        success: true,
        order,
      };
    } catch (error) {
      logger.error('SalesModule', 'Error processing checkout', {
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
      logger.error('SalesModule', 'Error validating checkout', {
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
