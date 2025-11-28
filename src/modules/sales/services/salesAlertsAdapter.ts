/**
 * Sales Alerts Adapter
 *
 * Adapter layer between Sales business logic and the global Alerts system.
 * Converts Sales-specific events and errors into CreateAlertInput format.
 *
 * @module sales/services/salesAlertsAdapter
 */

import type { CreateAlertInput } from '@/shared/alerts/types';

/**
 * Alert factory for order creation failures
 *
 * @param error - The error that occurred
 * @param orderId - Optional order ID if partially created
 * @param customerId - Customer ID who attempted the order
 */
export const orderCreationFailed = (
  error: Error,
  orderId?: string,
  customerId?: string
): CreateAlertInput => ({
  type: 'operational',
  context: 'sales',
  severity: 'high',
  title: 'Order Creation Failed',
  description: `Failed to create order: ${error.message}`,
  metadata: {
    itemId: orderId,
    errorCode: error.name,
    relatedUrl: customerId ? `/customers/${customerId}` : undefined,
  },
  autoExpire: 30, // Auto-expire after 30 minutes
  persistent: true,
  actions: [
    {
      label: 'Retry Order',
      variant: 'primary',
      action: 'retry-order',
    },
    {
      label: 'View Customer',
      variant: 'secondary',
      action: 'view-customer',
    },
  ],
});

/**
 * Alert factory for credit limit exceeded scenarios
 *
 * @param customerId - Customer ID who exceeded limit
 * @param customerName - Customer name for display
 * @param requestedAmount - Amount that was requested
 * @param availableCredit - Available credit remaining
 */
export const creditLimitExceeded = (
  customerId: string,
  customerName: string,
  requestedAmount: number,
  availableCredit: number
): CreateAlertInput => ({
  type: 'business',
  context: 'sales',
  severity: 'medium',
  title: 'Credit Limit Exceeded',
  description: `${customerName} exceeds credit limit. Requested: $${requestedAmount.toFixed(2)}, Available: $${availableCredit.toFixed(2)}`,
  metadata: {
    itemId: customerId,
    itemName: customerName,
    affectedRevenue: requestedAmount,
    relatedUrl: `/customers/${customerId}`,
  },
  persistent: true,
  actions: [
    {
      label: 'Request Approval',
      variant: 'primary',
      action: 'request-credit-approval',
    },
    {
      label: 'View Customer',
      variant: 'secondary',
      action: 'view-customer',
    },
    {
      label: 'Modify Order',
      variant: 'secondary',
      action: 'modify-order',
    },
  ],
});

/**
 * Alert factory for stock unavailability
 *
 * @param productId - Product ID that is out of stock
 * @param productName - Product name for display
 * @param currentStock - Current stock level (should be 0 or negative)
 */
export const stockUnavailable = (
  productId: string,
  productName: string,
  currentStock: number = 0
): CreateAlertInput => ({
  type: 'operational',
  context: 'sales',
  severity: 'medium',
  title: 'Product Out of Stock',
  description: `${productName} is currently unavailable (stock: ${currentStock})`,
  metadata: {
    itemId: productId,
    itemName: productName,
    currentStock,
    relatedUrl: `/materials/${productId}`,
  },
  autoExpire: 15, // Auto-expire after 15 minutes
  actions: [
    {
      label: 'Check Inventory',
      variant: 'primary',
      action: 'view-inventory',
    },
    {
      label: 'Order from Supplier',
      variant: 'secondary',
      action: 'create-supplier-order',
    },
  ],
});

/**
 * Alert factory for payment processing failures
 *
 * @param error - The payment error
 * @param orderId - Order ID
 * @param amount - Payment amount that failed
 * @param paymentMethod - Payment method used
 */
export const paymentFailed = (
  error: Error,
  orderId: string,
  amount: number,
  paymentMethod: string
): CreateAlertInput => ({
  type: 'operational',
  context: 'sales',
  severity: 'critical',
  title: 'Payment Processing Failed',
  description: `Payment of $${amount.toFixed(2)} failed using ${paymentMethod}: ${error.message}`,
  metadata: {
    itemId: orderId,
    affectedRevenue: amount,
    errorCode: error.name,
    relatedUrl: `/sales/orders/${orderId}`,
  },
  persistent: true,
  actions: [
    {
      label: 'Retry Payment',
      variant: 'primary',
      action: 'retry-payment',
    },
    {
      label: 'Use Different Method',
      variant: 'secondary',
      action: 'change-payment-method',
    },
    {
      label: 'Cancel Order',
      variant: 'danger',
      action: 'cancel-order',
    },
  ],
});

/**
 * Alert factory for checkout validation errors
 *
 * @param errors - Array of validation error messages
 * @param customerId - Customer ID attempting checkout
 */
export const checkoutValidationFailed = (
  errors: string[],
  customerId: string
): CreateAlertInput => ({
  type: 'validation',
  context: 'sales',
  severity: 'medium',
  title: 'Checkout Validation Failed',
  description: errors.join(', '),
  metadata: {
    itemId: customerId,
    validationRule: errors[0],
    relatedUrl: `/customers/${customerId}`,
  },
  autoExpire: 10,
  actions: [
    {
      label: 'Fix Issues',
      variant: 'primary',
      action: 'fix-validation',
    },
  ],
});

/**
 * Alert factory for low stock warnings during sales
 *
 * @param productId - Product ID with low stock
 * @param productName - Product name
 * @param currentStock - Current stock level
 * @param minThreshold - Minimum threshold for this product
 */
export const lowStockWarning = (
  productId: string,
  productName: string,
  currentStock: number,
  minThreshold: number
): CreateAlertInput => ({
  type: 'stock',
  context: 'sales',
  severity: 'low',
  title: 'Low Stock Alert',
  description: `${productName} is running low. Current: ${currentStock}, Minimum: ${minThreshold}`,
  metadata: {
    itemId: productId,
    itemName: productName,
    currentStock,
    minThreshold,
    relatedUrl: `/materials/${productId}`,
  },
  autoExpire: 60, // Auto-expire after 1 hour
  actions: [
    {
      label: 'Order More',
      variant: 'primary',
      action: 'create-supplier-order',
    },
    {
      label: 'View Inventory',
      variant: 'secondary',
      action: 'view-inventory',
    },
  ],
});

/**
 * Alert factory for order ready notifications (from production)
 *
 * @param orderId - Order ID that is ready
 * @param customerName - Customer name
 * @param orderType - Type of order (PICKUP, DELIVERY, etc.)
 */
export const orderReadyNotification = (
  orderId: string,
  customerName: string,
  orderType: string
): CreateAlertInput => ({
  type: 'operational',
  context: 'sales',
  severity: 'info',
  title: 'Order Ready for Fulfillment',
  description: `Order for ${customerName} is ready for ${orderType.toLowerCase()}`,
  metadata: {
    itemId: orderId,
    itemName: customerName,
    relatedUrl: `/sales/orders/${orderId}`,
  },
  autoExpire: 120, // Auto-expire after 2 hours
  persistent: false,
  actions: [
    {
      label: 'Notify Customer',
      variant: 'primary',
      action: 'notify-customer',
      autoResolve: true,
    },
    {
      label: 'View Order',
      variant: 'secondary',
      action: 'view-order',
    },
  ],
});

/**
 * Alert factory for B2B quote approval needed
 *
 * @param quoteId - Quote ID requiring approval
 * @param customerName - Customer name
 * @param amount - Quote amount
 * @param approvalLevel - Required approval level
 */
export const quoteApprovalNeeded = (
  quoteId: string,
  customerName: string,
  amount: number,
  approvalLevel: number
): CreateAlertInput => ({
  type: 'business',
  context: 'sales',
  severity: 'medium',
  title: 'Quote Approval Required',
  description: `Quote for ${customerName} ($${amount.toFixed(2)}) requires Level ${approvalLevel} approval`,
  metadata: {
    itemId: quoteId,
    itemName: customerName,
    affectedRevenue: amount,
    estimatedImpact: `Revenue: $${amount.toFixed(2)}`,
    timeToResolve: 30,
    relatedUrl: `/sales/b2b/quotes/${quoteId}`,
  },
  persistent: true,
  actions: [
    {
      label: 'Review Quote',
      variant: 'primary',
      action: 'review-quote',
    },
    {
      label: 'Request Approval',
      variant: 'secondary',
      action: 'request-approval',
    },
  ],
});

/**
 * Alert factory for cart expiration warnings
 *
 * @param customerId - Customer ID with expiring cart
 * @param itemsCount - Number of items in cart
 * @param minutesRemaining - Minutes until cart expires
 */
export const cartExpirationWarning = (
  customerId: string,
  itemsCount: number,
  minutesRemaining: number
): CreateAlertInput => ({
  type: 'operational',
  context: 'sales',
  severity: 'low',
  title: 'Cart Expiring Soon',
  description: `Customer cart with ${itemsCount} items expires in ${minutesRemaining} minutes`,
  metadata: {
    itemId: customerId,
    timeToResolve: minutesRemaining,
    relatedUrl: `/customers/${customerId}`,
  },
  autoExpire: minutesRemaining,
  actions: [
    {
      label: 'Send Reminder',
      variant: 'primary',
      action: 'send-cart-reminder',
    },
  ],
});

/**
 * Adapter exports
 */
export const salesAlertsAdapter = {
  orderCreationFailed,
  creditLimitExceeded,
  stockUnavailable,
  paymentFailed,
  checkoutValidationFailed,
  lowStockWarning,
  orderReadyNotification,
  quoteApprovalNeeded,
  cartExpirationWarning,
};

export default salesAlertsAdapter;
