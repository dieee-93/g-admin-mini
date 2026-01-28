/**
 * Payment Methods API Service
 * Handles Supabase queries for payment methods configuration
 * 
 * @module finance-integrations
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface PaymentMethod {
  id: string;
  gateway_id: string | null;
  name: string;
  code: string;
  display_name: string;
  description?: string | null;
  icon?: string | null;
  requires_gateway: boolean;
  is_active: boolean;
  sort_order: number;
  config?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentGateway {
  id: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer' | 'qr_payment' | 'cash' | 'crypto' | 'bnpl';
  name: string;
  provider?: string | null;
  is_active: boolean;
  is_online: boolean;
  supports_refunds: boolean;
  supports_recurring: boolean;
  config?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// PAYMENT METHODS API
// ============================================

/**
 * Fetch all payment methods
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods_config')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    logger.info('PaymentMethodsApi', `Fetched ${data?.length || 0} payment methods`);
    return data || [];

  } catch (error) {
    logger.error('PaymentMethodsApi', 'Failed to fetch payment methods', error);
    throw error;
  }
}

/**
 * Fetch active payment methods only
 */
export async function fetchActivePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods_config')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return data || [];

  } catch (error) {
    logger.error('PaymentMethodsApi', 'Failed to fetch active payment methods', error);
    throw error;
  }
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod> {
  try {
    const { data, error } = await supabase
      .from('payment_methods_config')
      .insert([method])
      .select()
      .single();

    if (error) throw error;

    logger.info('PaymentMethodsApi', `Created payment method: ${method.name}`);
    return data;

  } catch (error) {
    logger.error('PaymentMethodsApi', 'Failed to create payment method', error);
    throw error;
  }
}

/**
 * Update an existing payment method
 */
export async function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
  try {
    const { data, error } = await supabase
      .from('payment_methods_config')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('PaymentMethodsApi', `Updated payment method: ${id}`);
    return data;

  } catch (error) {
    logger.error('PaymentMethodsApi', 'Failed to update payment method', error);
    throw error;
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('payment_methods_config')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('PaymentMethodsApi', `Deleted payment method: ${id}`);

  } catch (error) {
    logger.error('PaymentMethodsApi', 'Failed to delete payment method', error);
    throw error;
  }
}

// ============================================
// PAYMENT GATEWAYS API
// ============================================

/**
 * Fetch all payment gateways
 */
export async function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .order('name');

    if (error) throw error;

    logger.info('PaymentGatewaysApi', `Fetched ${data?.length || 0} payment gateways`);
    return data || [];

  } catch (error) {
    logger.error('PaymentGatewaysApi', 'Failed to fetch payment gateways', error);
    throw error;
  }
}

/**
 * Fetch active payment gateways only
 */
export async function fetchActivePaymentGateways(): Promise<PaymentGateway[]> {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return data || [];

  } catch (error) {
    logger.error('PaymentGatewaysApi', 'Failed to fetch active payment gateways', error);
    throw error;
  }
}

/**
 * Create a new payment gateway
 */
export async function createPaymentGateway(gateway: Omit<PaymentGateway, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentGateway> {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .insert([gateway])
      .select()
      .single();

    if (error) throw error;

    logger.info('PaymentGatewaysApi', `Created payment gateway: ${gateway.name || gateway.type}`);
    return data;

  } catch (error) {
    logger.error('PaymentGatewaysApi', 'Failed to create payment gateway', error);
    throw error;
  }
}

/**
 * Update an existing payment gateway
 */
export async function updatePaymentGateway(id: string, updates: Partial<PaymentGateway>): Promise<PaymentGateway> {
  try {
    const { data, error } = await supabase
      .from('payment_gateways')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('PaymentGatewaysApi', `Updated payment gateway: ${id}`);
    return data;

  } catch (error) {
    logger.error('PaymentGatewaysApi', 'Failed to update payment gateway', error);
    throw error;
  }
}

/**
 * Delete a payment gateway
 */
export async function deletePaymentGateway(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('payment_gateways')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('PaymentGatewaysApi', `Deleted payment gateway: ${id}`);

  } catch (error) {
    logger.error('PaymentGatewaysApi', 'Failed to delete payment gateway', error);
    throw error;
  }
}
