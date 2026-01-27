/**
 * BILLING API SERVICE
 *
 * Supabase CRUD operations for billing module
 *
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { DecimalUtils } from '@/lib/decimal';
import type {
  Subscription,
  BillingCycle,
  Invoice,
  Payment,
  RecurringBillingFormData
} from '../types';

// ==================== SUBSCRIPTIONS ====================

/**
 * Create a new subscription
 */
export async function createSubscription(data: RecurringBillingFormData) {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert([{
        customer_id: data.customerId,
        subscription_name: data.subscriptionName,
        description: data.description,
        internal_notes: data.internalNotes,
        billing_type: data.billingType,
        amount: data.amount,
        currency: data.currency,
        tax_included: data.taxIncluded,
        custom_interval: data.customInterval,
        custom_interval_type: data.customIntervalType,
        start_date: data.startDate,
        end_date: data.endDate,
        billing_cycles: data.billingCycles,
        status: 'active',
        auto_invoice: data.autoInvoice,
        auto_collect: data.autoCollect,
        retry_failed_payments: data.retryFailedPayments,
        max_retries: data.maxRetries,
        payment_terms: data.paymentTerms,
        reminder_days: data.reminderDays,
        prorate: data.prorate,
        allow_usage_charges: data.allowUsageCharges,
        suspend_on_failure: data.suspendOnFailure
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info('Billing', 'Subscription created', { id: subscription.id });
    return { data: subscription, error: null };
  } catch (error) {
    logger.error('Billing', 'Error creating subscription', error);
    return { data: null, error };
  }
}

/**
 * Get all subscriptions
 */
export async function getSubscriptions(filters?: {
  customerId?: string;
  status?: Subscription['status'];
}) {
  try {
    let query = supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as Subscription[], error: null };
  } catch (error) {
    logger.error('Billing', 'Error fetching subscriptions', error);
    return { data: null, error };
  }
}

/**
 * Get a single subscription by ID
 */
export async function getSubscription(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { data: data as Subscription, error: null };
  } catch (error) {
    logger.error('Billing', 'Error fetching subscription', error);
    return { data: null, error };
  }
}

/**
 * Update a subscription
 */
export async function updateSubscription(id: string, updates: Partial<RecurringBillingFormData>) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        subscription_name: updates.subscriptionName,
        description: updates.description,
        internal_notes: updates.internalNotes,
        amount: updates.amount,
        end_date: updates.endDate,
        billing_cycles: updates.billingCycles,
        auto_invoice: updates.autoInvoice,
        auto_collect: updates.autoCollect,
        retry_failed_payments: updates.retryFailedPayments,
        max_retries: updates.maxRetries,
        payment_terms: updates.paymentTerms,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Billing', 'Subscription updated', { id });
    return { data: data as Subscription, error: null };
  } catch (error) {
    logger.error('Billing', 'Error updating subscription', error);
    return { data: null, error };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(id: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString().split('T')[0],
        internal_notes: reason || 'Subscription cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Billing', 'Subscription cancelled', { id, reason });
    return { data: data as Subscription, error: null };
  } catch (error) {
    logger.error('Billing', 'Error cancelling subscription', error);
    return { data: null, error };
  }
}

/**
 * Suspend a subscription
 */
export async function suspendSubscription(id: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'suspended',
        internal_notes: reason || 'Subscription suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Billing', 'Subscription suspended', { id, reason });
    return { data: data as Subscription, error: null };
  } catch (error) {
    logger.error('Billing', 'Error suspending subscription', error);
    return { data: null, error };
  }
}

/**
 * Reactivate a suspended subscription
 */
export async function reactivateSubscription(id: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Billing', 'Subscription reactivated', { id });
    return { data: data as Subscription, error: null };
  } catch (error) {
    logger.error('Billing', 'Error reactivating subscription', error);
    return { data: null, error };
  }
}

// ==================== BILLING CYCLES ====================

/**
 * Create a billing cycle
 */
export async function createBillingCycle(subscriptionId: string, cycleData: {
  cycleNumber: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  amount: number;
}) {
  try {
    const { data, error } = await supabase
      .from('billing_cycles')
      .insert([{
        subscription_id: subscriptionId,
        cycle_number: cycleData.cycleNumber,
        start_date: cycleData.startDate,
        end_date: cycleData.endDate,
        due_date: cycleData.dueDate,
        amount: cycleData.amount,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info('Billing', 'Billing cycle created', { id: data.id, subscriptionId });
    return { data: data as BillingCycle, error: null };
  } catch (error) {
    logger.error('Billing', 'Error creating billing cycle', error);
    return { data: null, error };
  }
}

/**
 * Get billing cycles for a subscription
 */
export async function getBillingCycles(subscriptionId: string) {
  try {
    const { data, error } = await supabase
      .from('billing_cycles')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('cycle_number', { ascending: true });

    if (error) throw error;

    return { data: data as BillingCycle[], error: null };
  } catch (error) {
    logger.error('Billing', 'Error fetching billing cycles', error);
    return { data: null, error };
  }
}

// ==================== INVOICES ====================

/**
 * Generate invoice for a billing cycle
 */
export async function generateInvoice(customerId: string, data: {
  subscriptionId?: string;
  billingCycleId?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  dueDate: string;
}) {
  try {
    // Generate invoice number (format: INV-YYYYMMDD-XXXXX)
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    const invoiceNumber = `INV-${date}-${random}`;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([{
        customer_id: customerId,
        subscription_id: data.subscriptionId,
        billing_cycle_id: data.billingCycleId,
        invoice_number: invoiceNumber,
        amount: data.amount,
        tax_amount: data.taxAmount,
        total_amount: data.totalAmount,
        currency: data.currency,
        status: 'sent',
        due_date: data.dueDate
      }])
      .select()
      .single();

    if (error) throw error;

    // Update billing cycle if provided
    if (data.billingCycleId) {
      await supabase
        .from('billing_cycles')
        .update({
          invoice_id: invoice.id,
          status: 'invoiced'
        })
        .eq('id', data.billingCycleId);
    }

    logger.info('Billing', 'Invoice generated', { id: invoice.id, invoiceNumber });
    return { data: invoice as Invoice, error: null };
  } catch (error) {
    logger.error('Billing', 'Error generating invoice', error);
    return { data: null, error };
  }
}

/**
 * Get invoices
 */
export async function getInvoices(filters?: {
  customerId?: string;
  subscriptionId?: string;
  status?: Invoice['status'];
}) {
  try {
    let query = supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters?.subscriptionId) {
      query = query.eq('subscription_id', filters.subscriptionId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data as Invoice[], error: null };
  } catch (error) {
    logger.error('Billing', 'Error fetching invoices', error);
    return { data: null, error };
  }
}

// ==================== PAYMENTS ====================

/**
 * Process a payment
 */
export async function processPayment(invoiceId: string, paymentData: {
  paymentMethodId?: string;
  amount: number;
  currency: string;
  transactionId?: string;
  provider?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        invoice_id: invoiceId,
        payment_method_id: paymentData.paymentMethodId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'completed',
        transaction_id: paymentData.transactionId,
        provider: paymentData.provider,
        processed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Mark invoice as paid
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    logger.info('Billing', 'Payment processed', { id: data.id, invoiceId });
    return { data: data as Payment, error: null };
  } catch (error) {
    logger.error('Billing', 'Error processing payment', error);
    return { data: null, error };
  }
}

/**
 * Get payments for an invoice
 */
export async function getPayments(invoiceId: string) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as Payment[], error: null };
  } catch (error) {
    logger.error('Billing', 'Error fetching payments', error);
    return { data: null, error };
  }
}

// ==================== ANALYTICS ====================

/**
 * Get MRR (Monthly Recurring Revenue)
 */
export async function getMRR() {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('amount, billing_type, currency')
      .eq('status', 'active');

    if (error) throw error;

    // Calculate MRR based on billing type
    // ✅ PRECISION FIX: Use FinancialDecimal for MRR/ARR calculations
    const mrrDec = data.reduce((totalDec, sub) => {
      const amountDec = DecimalUtils.fromValue(sub.amount || 0, 'financial');
      let monthlyAmountDec;

      switch (sub.billing_type) {
        case 'monthly':
          monthlyAmountDec = amountDec;
          break;
        case 'quarterly':
          // Divide by 3 for quarterly subscriptions
          monthlyAmountDec = DecimalUtils.divide(amountDec, '3', 'financial');
          break;
        case 'annual':
          // Divide by 12 for annual subscriptions
          monthlyAmountDec = DecimalUtils.divide(amountDec, '12', 'financial');
          break;
        default:
          monthlyAmountDec = DecimalUtils.fromValue(0, 'financial');
      }

      return DecimalUtils.add(totalDec, monthlyAmountDec, 'financial');
    }, DecimalUtils.fromValue(0, 'financial'));

    const mrr = mrrDec.toNumber();

    return { data: mrr, error: null };
  } catch (error) {
    logger.error('Billing', 'Error calculating MRR', error);
    return { data: 0, error };
  }
}

/**
 * Get subscription count by status
 */
export async function getSubscriptionStats() {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(s => s.status === 'active').length,
      suspended: data.filter(s => s.status === 'suspended').length,
      cancelled: data.filter(s => s.status === 'cancelled').length,
      trial: data.filter(s => s.status === 'trial').length
    };

    return { data: stats, error: null };
  } catch (error) {
    logger.error('Billing', 'Error fetching subscription stats', error);
    return { data: null, error };
  }
}
