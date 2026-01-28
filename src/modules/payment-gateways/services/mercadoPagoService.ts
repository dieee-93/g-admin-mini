/**
 * Mercado Pago Service
 * Handles integration with Mercado Pago API
 *
 * Documentation: https://www.mercadopago.com.ar/developers/en/docs/checkout-api/overview
 */

import MercadoPago from 'mercadopago';
import { logger } from '@/lib/logging';
import { supabase } from '@/lib/supabase/client';

// ============================================
// TYPES
// ============================================

export interface MercadoPagoCredentials {
  public_key: string;
  access_token: string;
  test_mode: boolean;
}

export interface PreferenceItem {
  id?: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface PreferenceBackUrls {
  success: string;
  failure: string;
  pending: string;
}

export interface CreatePreferenceParams {
  items: PreferenceItem[];
  back_urls: PreferenceBackUrls;
  notification_url?: string;
  external_reference?: string;
  auto_return?: 'approved' | 'all';
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
  };
  metadata?: Record<string, unknown>;
}

export interface PreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: PreferenceItem[];
  auto_return?: string;
  back_urls: PreferenceBackUrls;
  external_reference?: string;
}

export interface PaymentInfo {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payment_type_id: string;
  date_created: string;
  date_approved?: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
  payer: {
    id: number;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
}

// ============================================
// SERVICE CLASS
// ============================================

export class MercadoPagoService {
  private client: typeof MercadoPago;
  private credentials: MercadoPagoCredentials;

  constructor(credentials: MercadoPagoCredentials) {
    this.credentials = credentials;
    this.client = MercadoPago;

    // Configure SDK
    this.client.configure({
      access_token: credentials.access_token,
    });

    logger.info('MercadoPagoService', 'Initialized', {
      test_mode: credentials.test_mode,
    });
  }

  /**
   * Test connection to Mercado Pago API
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test by fetching account info
      const response = await fetch('https://api.mercadopago.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${this.credentials.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        logger.error('MercadoPagoService', 'Test connection failed', error);
        return false;
      }

      const data = await response.json();
      logger.info('MercadoPagoService', 'Test connection successful', {
        user_id: data.id,
        email: data.email,
      });

      return true;
    } catch (error) {
      logger.error('MercadoPagoService', 'Test connection error', error);
      return false;
    }
  }

  /**
   * Create a payment preference (Checkout Pro)
   * Returns init_point URL to redirect customer
   */
  async createPreference(params: CreatePreferenceParams): Promise<PreferenceResponse> {
    try {
      logger.info('MercadoPagoService', 'Creating preference', {
        items_count: params.items.length,
        external_reference: params.external_reference,
      });

      const preference = await this.client.preferences.create({
        items: params.items.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || 'ARS',
        })),
        back_urls: params.back_urls,
        notification_url: params.notification_url,
        external_reference: params.external_reference,
        auto_return: params.auto_return || 'approved',
        payer: params.payer,
        metadata: params.metadata,
        binary_mode: false, // Allow pending payments
        statement_descriptor: 'G-Admin Mini', // Shows in credit card statement
      });

      logger.info('MercadoPagoService', 'Preference created', {
        preference_id: preference.body.id,
        init_point: preference.body.init_point,
      });

      return {
        id: preference.body.id,
        init_point: this.credentials.test_mode
          ? preference.body.sandbox_init_point
          : preference.body.init_point,
        sandbox_init_point: preference.body.sandbox_init_point,
        date_created: preference.body.date_created,
        items: preference.body.items,
        auto_return: preference.body.auto_return,
        back_urls: preference.body.back_urls,
        external_reference: preference.body.external_reference,
      };
    } catch (error) {
      logger.error('MercadoPagoService', 'Failed to create preference', error);
      throw new Error('Failed to create Mercado Pago preference: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get payment information by ID
   * Used in webhook handler to verify payment status
   */
  async getPayment(paymentId: number): Promise<PaymentInfo> {
    try {
      logger.info('MercadoPagoService', 'Fetching payment', { payment_id: paymentId });

      const payment = await this.client.payment.get(paymentId);

      logger.info('MercadoPagoService', 'Payment fetched', {
        payment_id: paymentId,
        status: payment.body.status,
      });

      return {
        id: payment.body.id,
        status: payment.body.status,
        status_detail: payment.body.status_detail,
        transaction_amount: payment.body.transaction_amount,
        currency_id: payment.body.currency_id,
        payment_method_id: payment.body.payment_method_id,
        payment_type_id: payment.body.payment_type_id,
        date_created: payment.body.date_created,
        date_approved: payment.body.date_approved,
        external_reference: payment.body.external_reference,
        metadata: payment.body.metadata,
        payer: {
          id: payment.body.payer.id,
          email: payment.body.payer.email,
          identification: payment.body.payer.identification,
        },
      };
    } catch (error) {
      logger.error('MercadoPagoService', 'Failed to get payment', error);
      throw new Error('Failed to get Mercado Pago payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentId: number, amount?: number): Promise<any> {
    try {
      logger.info('MercadoPagoService', 'Creating refund', {
        payment_id: paymentId,
        amount: amount || 'full',
      });

      const refund = await this.client.refund.create({
        payment_id: paymentId,
        amount: amount, // If undefined, refunds full amount
      });

      logger.info('MercadoPagoService', 'Refund created', {
        refund_id: refund.body.id,
        status: refund.body.status,
      });

      return refund.body;
    } catch (error) {
      logger.error('MercadoPagoService', 'Failed to create refund', error);
      throw new Error('Failed to create Mercado Pago refund: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Map Mercado Pago payment status to our payment_status enum
   */
  static mapPaymentStatus(mpStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'INITIATED',
      'approved': 'AUTHORIZED',
      'authorized': 'AUTHORIZED',
      'in_process': 'INITIATED',
      'in_mediation': 'INITIATED',
      'rejected': 'FAILED',
      'cancelled': 'VOIDED',
      'refunded': 'REFUNDED',
      'charged_back': 'CHARGEDBACK',
    };

    return statusMap[mpStatus] || 'INITIATED';
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get MercadoPago credentials from database for current business
 */
export async function getMercadoPagoCredentials(): Promise<MercadoPagoCredentials | null> {
  try {
    const { data: gateway } = await supabase
      .from('payment_gateways')
      .select('config')
      .eq('provider', 'mercadopago')
      .eq('is_active', true)
      .single();

    if (!gateway || !gateway.config) {
      logger.warn('MercadoPagoService', 'No active MercadoPago gateway found');
      return null;
    }

    const config = gateway.config as any;

    if (!config.public_key || !config.access_token) {
      logger.error('MercadoPagoService', 'Invalid MercadoPago configuration', {
        has_public_key: !!config.public_key,
        has_access_token: !!config.access_token,
      });
      return null;
    }

    return {
      public_key: config.public_key,
      access_token: config.access_token,
      test_mode: config.test_mode ?? true,
    };
  } catch (error) {
    logger.error('MercadoPagoService', 'Failed to get credentials', error);
    return null;
  }
}

/**
 * Create MercadoPago service instance with credentials from database
 */
export async function createMercadoPagoService(): Promise<MercadoPagoService | null> {
  const credentials = await getMercadoPagoCredentials();

  if (!credentials) {
    return null;
  }

  return new MercadoPagoService(credentials);
}
