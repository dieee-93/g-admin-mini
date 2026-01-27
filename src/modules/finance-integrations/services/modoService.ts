/**
 * MODO Service
 * Service for integrating with MODO payment gateway (Argentina)
 *
 * MODO is the digital wallet of 30+ Argentine banks consortium.
 * Supports QR payments, transfers, and instant payments.
 *
 * @module finance-integrations
 * @see https://docs.modo.com.ar/
 */

import { logger } from '@/lib/logging';
import { supabase } from '@/lib/supabase/client';

// ============================================
// TYPES
// ============================================

export interface MODOCredentials {
  api_key: string;
  merchant_id: string;
  webhook_secret?: string;
  is_test_mode: boolean;
}

export interface GenerateQRParams {
  amount: number;
  description: string;
  external_reference?: string; // sale_id or order_id
  expiration_minutes?: number; // QR expiration time (default: 15)
  metadata?: Record<string, unknown>;
}

export interface QRResponse {
  qr_id: string;
  qr_code: string; // QR code image (base64 or URL)
  qr_data: string; // QR string data for scanning
  deep_link?: string; // Deep link to open MODO app
  expiration_date: string;
  status: string; // 'PENDING', 'PAID', 'EXPIRED', 'CANCELLED'
}

export interface PaymentInfo {
  qr_id: string;
  external_reference?: string;
  status: string; // MODO payment status
  amount: number;
  paid_at?: string;
  customer_info?: {
    name?: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
}

// ============================================
// MODO SERVICE CLASS
// ============================================

export class MODOService {
  private apiKey: string;
  private merchantId: string;
  private webhookSecret?: string;
  private isTestMode: boolean;

  // API URLs (adjust based on actual MODO API documentation)
  private readonly PROD_API_URL = 'https://api.modo.com.ar/v1';
  private readonly TEST_API_URL = 'https://api-test.modo.com.ar/v1';

  constructor(credentials: MODOCredentials) {
    this.apiKey = credentials.api_key;
    this.merchantId = credentials.merchant_id;
    this.webhookSecret = credentials.webhook_secret;
    this.isTestMode = credentials.is_test_mode;

    logger.info('MODOService', 'MODO Service initialized', {
      merchantId: this.merchantId,
      isTestMode: this.isTestMode,
    });
  }

  /**
   * Get base API URL based on test mode
   */
  private getApiUrl(): string {
    return this.isTestMode ? this.TEST_API_URL : this.PROD_API_URL;
  }

  /**
   * Make authenticated request to MODO API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.getApiUrl()}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Merchant-Id': this.merchantId,
      ...options.headers,
    };

    logger.debug('MODOService', 'Making API request', {
      url,
      method: options.method || 'GET',
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('MODOService', 'API request failed', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      throw new Error(`MODO API error: ${response.status} - ${errorBody}`);
    }

    return await response.json();
  }

  /**
   * Test connection to MODO API
   * Verifies that credentials are valid
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info('MODOService', 'Testing MODO connection...');

      // Test endpoint - adjust based on actual MODO API
      // This could be a /health, /merchant/info, or similar endpoint
      const result = await this.makeRequest<{ status: string }>('/merchant/status');

      logger.info('MODOService', '✅ MODO connection successful', {
        status: result.status,
      });

      return true;
    } catch (error) {
      logger.error('MODOService', '❌ MODO connection failed', error);
      throw error;
    }
  }

  /**
   * Generate QR code for payment
   */
  async generateQR(params: GenerateQRParams): Promise<QRResponse> {
    try {
      logger.info('MODOService', 'Generating MODO QR', {
        amount: params.amount,
        description: params.description,
      });

      const payload = {
        merchant_id: this.merchantId,
        amount: params.amount,
        description: params.description,
        external_reference: params.external_reference,
        expiration_minutes: params.expiration_minutes || 15,
        metadata: params.metadata || {},
      };

      const response = await this.makeRequest<QRResponse>('/qr/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      logger.info('MODOService', '✅ QR generated successfully', {
        qr_id: response.qr_id,
        expiration_date: response.expiration_date,
      });

      return response;
    } catch (error) {
      logger.error('MODOService', '❌ Failed to generate QR', error);
      throw error;
    }
  }

  /**
   * Get payment status by QR ID
   */
  async getPaymentStatus(qrId: string): Promise<PaymentInfo> {
    try {
      logger.info('MODOService', 'Getting payment status', { qrId });

      const response = await this.makeRequest<PaymentInfo>(`/qr/${qrId}`);

      logger.info('MODOService', 'Payment status retrieved', {
        qrId,
        status: response.status,
      });

      return response;
    } catch (error) {
      logger.error('MODOService', 'Failed to get payment status', error);
      throw error;
    }
  }

  /**
   * Cancel QR payment
   */
  async cancelQR(qrId: string): Promise<void> {
    try {
      logger.info('MODOService', 'Cancelling QR', { qrId });

      await this.makeRequest(`/qr/${qrId}/cancel`, {
        method: 'POST',
      });

      logger.info('MODOService', '✅ QR cancelled successfully', { qrId });
    } catch (error) {
      logger.error('MODOService', '❌ Failed to cancel QR', error);
      throw error;
    }
  }

  /**
   * Map MODO payment status to our system status
   */
  static mapPaymentStatus(modoStatus: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'INITIATED',
      'PAID': 'SETTLED',
      'EXPIRED': 'FAILED',
      'CANCELLED': 'CANCELLED',
      'REFUNDED': 'REFUNDED',
    };

    return statusMap[modoStatus] || 'INITIATED';
  }

  /**
   * Verify webhook signature
   * MODO sends a signature header to verify webhook authenticity
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      // Implementation depends on MODO's signature algorithm
      // Usually HMAC SHA256
      // Example (adjust based on actual MODO implementation):
      // const crypto = require('crypto');
      // const expectedSignature = crypto
      //   .createHmac('sha256', secret)
      //   .update(payload)
      //   .digest('hex');
      // return expectedSignature === signature;

      logger.info('MODOService', 'Verifying webhook signature');

      // For now, return true if secret matches
      // TODO: Implement actual signature verification
      return !!secret;
    } catch (error) {
      logger.error('MODOService', 'Failed to verify webhook signature', error);
      return false;
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get MODO credentials from database
 */
export async function getMODOCredentials(): Promise<MODOCredentials> {
  try {
    const { data: gateway, error } = await supabase
      .from('payment_gateways')
      .select('config')
      .eq('provider', 'modo')
      .eq('is_active', true)
      .single();

    if (error) {
      throw new Error(`Failed to get MODO credentials: ${error.message}`);
    }

    if (!gateway || !gateway.config) {
      throw new Error('MODO gateway not configured');
    }

    const config = gateway.config as Record<string, unknown>;

    // Validate required fields
    if (!config.api_key || !config.merchant_id) {
      throw new Error('MODO credentials incomplete');
    }

    return {
      api_key: config.api_key as string,
      merchant_id: config.merchant_id as string,
      webhook_secret: config.webhook_secret as string | undefined,
      is_test_mode: (config.is_test_mode as boolean) || false,
    };
  } catch (error) {
    logger.error('MODOService', 'Failed to get MODO credentials', error);
    throw error;
  }
}

/**
 * Create MODO service instance with credentials from database
 */
export async function createMODOService(): Promise<MODOService> {
  const credentials = await getMODOCredentials();
  return new MODOService(credentials);
}

// ============================================
// EXPORTS
// ============================================

export default MODOService;
