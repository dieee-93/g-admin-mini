/**
 * Customers Alerts Adapter
 *
 * Adapter layer between Customers business logic and the global Alerts system.
 * Converts Customers-specific events and errors into CreateAlertInput format.
 *
 * @module customers/services/customersAlertsAdapter
 */

import type { CreateAlertInput } from '@/shared/alerts/types';

/**
 * Alert factory for customer creation failures
 *
 * @param error - The error that occurred
 * @param customerData - Customer data that failed to save
 */
export const customerCreationFailed = (
  error: Error,
  customerData?: { name?: string; email?: string }
): CreateAlertInput => ({
  type: 'operational',
  context: 'customers',
  severity: 'high',
  title: 'Customer Creation Failed',
  description: `Failed to create customer${customerData?.name ? ` "${customerData.name}"` : ''}: ${error.message}`,
  metadata: {
    errorCode: error.name,
    customerEmail: customerData?.email,
  },
  autoExpire: 30, // Auto-expire after 30 minutes
  persistent: true,
  actions: [
    {
      label: 'Retry',
      variant: 'primary',
      action: 'retry-customer-creation',
    },
    {
      label: 'Edit Data',
      variant: 'secondary',
      action: 'edit-customer-data',
    },
  ],
});

/**
 * Alert factory for duplicate customer warnings
 *
 * @param existingCustomerId - ID of the existing customer
 * @param existingCustomerName - Name of the existing customer
 * @param duplicateField - Field that caused the duplicate (email, phone, etc.)
 */
export const duplicateCustomerWarning = (
  existingCustomerId: string,
  existingCustomerName: string,
  duplicateField: 'email' | 'phone'
): CreateAlertInput => ({
  type: 'validation',
  context: 'customers',
  severity: 'medium',
  title: 'Duplicate Customer Detected',
  description: `Customer with same ${duplicateField} already exists: ${existingCustomerName}`,
  metadata: {
    itemId: existingCustomerId,
    itemName: existingCustomerName,
    validationRule: `unique_${duplicateField}`,
    relatedUrl: `/admin/customers?id=${existingCustomerId}`,
  },
  autoExpire: 15,
  actions: [
    {
      label: 'View Existing',
      variant: 'primary',
      action: 'view-existing-customer',
    },
    {
      label: 'Merge Records',
      variant: 'secondary',
      action: 'merge-customers',
    },
  ],
});

/**
 * Alert factory for RFM score updates
 *
 * @param customerId - Customer ID
 * @param customerName - Customer name
 * @param previousSegment - Previous RFM segment
 * @param newSegment - New RFM segment
 */
export const rfmScoreUpdated = (
  customerId: string,
  customerName: string,
  previousSegment: string,
  newSegment: string
): CreateAlertInput => ({
  type: 'business',
  context: 'customers',
  severity: 'info',
  title: 'Customer Segment Changed',
  description: `${customerName} moved from ${previousSegment} to ${newSegment}`,
  metadata: {
    itemId: customerId,
    itemName: customerName,
    previousValue: previousSegment,
    newValue: newSegment,
    relatedUrl: `/admin/customers?id=${customerId}`,
  },
  autoExpire: 60, // Auto-expire after 1 hour
  persistent: false,
  actions: [
    {
      label: 'View Profile',
      variant: 'primary',
      action: 'view-customer-profile',
    },
    {
      label: 'View Analytics',
      variant: 'secondary',
      action: 'view-customer-analytics',
    },
  ],
});

/**
 * Alert factory for segmentation processing failures
 *
 * @param error - The error that occurred
 * @param affectedCount - Number of customers affected
 */
export const segmentationFailed = (
  error: Error,
  affectedCount?: number
): CreateAlertInput => ({
  type: 'operational',
  context: 'customers',
  severity: 'medium',
  title: 'Customer Segmentation Failed',
  description: `Failed to process customer segmentation${affectedCount ? ` for ${affectedCount} customers` : ''}: ${error.message}`,
  metadata: {
    errorCode: error.name,
    estimatedImpact: affectedCount ? `${affectedCount} customers` : 'Unknown',
  },
  persistent: true,
  actions: [
    {
      label: 'Retry Segmentation',
      variant: 'primary',
      action: 'retry-segmentation',
    },
    {
      label: 'View Logs',
      variant: 'secondary',
      action: 'view-error-logs',
    },
  ],
});

/**
 * Alert factory for customer data sync failures
 *
 * @param error - The sync error
 * @param customerId - Customer ID that failed to sync
 * @param customerName - Customer name
 * @param syncSource - Source of the sync (sales, external API, etc.)
 */
export const customerDataSyncFailed = (
  error: Error,
  customerId: string,
  customerName: string,
  syncSource: string
): CreateAlertInput => ({
  type: 'operational',
  context: 'customers',
  severity: 'high',
  title: 'Customer Data Sync Failed',
  description: `Failed to sync data for ${customerName} from ${syncSource}: ${error.message}`,
  metadata: {
    itemId: customerId,
    itemName: customerName,
    errorCode: error.name,
    syncSource,
    relatedUrl: `/admin/customers?id=${customerId}`,
  },
  persistent: true,
  actions: [
    {
      label: 'Retry Sync',
      variant: 'primary',
      action: 'retry-customer-sync',
    },
    {
      label: 'View Customer',
      variant: 'secondary',
      action: 'view-customer',
    },
    {
      label: 'Manual Update',
      variant: 'secondary',
      action: 'manual-customer-update',
    },
  ],
});

/**
 * Alert factory for RFM profile loading failures
 *
 * @param error - The error that occurred
 */
export const rfmProfileLoadFailed = (error: Error): CreateAlertInput => ({
  type: 'operational',
  context: 'customers',
  severity: 'medium',
  title: 'RFM Analytics Unavailable',
  description: `Failed to load customer RFM profiles: ${error.message}`,
  metadata: {
    errorCode: error.name,
  },
  autoExpire: 20,
  persistent: false,
  actions: [
    {
      label: 'Retry',
      variant: 'primary',
      action: 'retry-rfm-load',
    },
  ],
});

/**
 * Alert factory for customer analytics loading failures
 *
 * @param error - The error that occurred
 */
export const analyticsLoadFailed = (error: Error): CreateAlertInput => ({
  type: 'operational',
  context: 'customers',
  severity: 'medium',
  title: 'Customer Analytics Unavailable',
  description: `Failed to load customer analytics dashboard: ${error.message}`,
  metadata: {
    errorCode: error.name,
  },
  autoExpire: 20,
  persistent: false,
  actions: [
    {
      label: 'Retry',
      variant: 'primary',
      action: 'retry-analytics-load',
    },
  ],
});

/**
 * Alert factory for high-value customer churn risk
 *
 * @param customerId - Customer ID at risk
 * @param customerName - Customer name
 * @param lifetimeValue - Customer lifetime value
 * @param churnRisk - Risk level (HIGH, MEDIUM)
 */
export const churnRiskAlert = (
  customerId: string,
  customerName: string,
  lifetimeValue: number,
  churnRisk: 'HIGH' | 'MEDIUM'
): CreateAlertInput => ({
  type: 'business',
  context: 'customers',
  severity: churnRisk === 'HIGH' ? 'high' : 'medium',
  title: `${churnRisk === 'HIGH' ? 'Critical' : 'Medium'} Churn Risk`,
  description: `${customerName} (LTV: $${lifetimeValue.toFixed(2)}) is at ${churnRisk.toLowerCase()} risk of churning`,
  metadata: {
    itemId: customerId,
    itemName: customerName,
    affectedRevenue: lifetimeValue,
    estimatedImpact: `Potential revenue loss: $${lifetimeValue.toFixed(2)}`,
    relatedUrl: `/admin/customers?id=${customerId}`,
  },
  persistent: true,
  actions: [
    {
      label: 'Launch Win-Back Campaign',
      variant: 'primary',
      action: 'launch-winback-campaign',
    },
    {
      label: 'View Customer',
      variant: 'secondary',
      action: 'view-customer',
    },
    {
      label: 'Send Personal Offer',
      variant: 'secondary',
      action: 'send-personal-offer',
    },
  ],
});

/**
 * Adapter exports
 */
export const customersAlertsAdapter = {
  customerCreationFailed,
  duplicateCustomerWarning,
  rfmScoreUpdated,
  segmentationFailed,
  customerDataSyncFailed,
  rfmProfileLoadFailed,
  analyticsLoadFailed,
  churnRiskAlert,
};

export default customersAlertsAdapter;
