// TODO: Uncomment CreateOrderParams when implementing checkout order creation
import { orderService, /* type CreateOrderParams, */ type Order } from './orderService';
import { cartService } from './cartService';

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

      // 4. TODO: Send order confirmation email (Week 5)
      // await emailService.sendOrderConfirmation(order);

      // 5. TODO: Trigger inventory deduction (if applicable)
      // await inventoryService.deductStock(order);

      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('Error processing checkout:', error);
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
      console.error('Error validating checkout:', error);
      return {
        valid: false,
        errors: ['Failed to validate checkout'],
      };
    }
  },
};
