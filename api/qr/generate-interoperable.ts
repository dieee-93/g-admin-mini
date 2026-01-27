/**
 * Generate Interoperable QR Code - API Endpoint
 * Vercel Serverless Function
 *
 * Generates BCRA-compliant interoperable QR codes that work with ALL Argentinian wallets
 * (MODO, Mercado Pago, BNA+, Ualá, Brubank, etc.)
 *
 * Documentation:
 * - BCRA Transfers 3.0: https://www.bcra.gob.ar/en/transfers-3-0/
 * - Technical Spec: https://docs.cdpi.dev/technical-notes/digital-payment-networks/interoperable-qr-code
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  createQRInteroperableService,
  type GenerateQRParams,
  type QRInteroperableConfig,
} from '../../src/modules/finance-integrations/services/qrInteroperableService';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// TYPES
// ============================================

interface RequestBody {
  /**
   * Transaction amount in ARS
   */
  amount: number;

  /**
   * Currency (ARS or USD)
   */
  currency?: 'ARS' | 'USD';

  /**
   * Order/Sale ID
   */
  order_id: string;

  /**
   * Point of Sale ID (optional)
   */
  pos_id?: string;

  /**
   * QR expiration in minutes (default: 15)
   */
  expiry_minutes?: number;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;

  /**
   * Override merchant CBU/CVU/Alias (optional, defaults to business profile)
   */
  payee_fa?: string;

  /**
   * Override merchant name (optional, defaults to business profile)
   */
  payee_name?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get QR Interoperable configuration from database
 * Fetches business profile configuration
 */
async function getQRConfig(): Promise<QRInteroperableConfig> {
  try {
    // TODO: Fetch from business_profile or qr_interoperable_config table
    // For now, use environment variables or defaults

    const config: QRInteroperableConfig = {
      payee_fa: process.env.QR_INTEROPERABLE_CBU || 'DEMO_CBU_0000000000000000000000',
      payee_name: process.env.QR_INTEROPERABLE_NAME || 'Demo Business',
      mid: process.env.QR_INTEROPERABLE_MID || 'M-DEMO-123',
      signing_secret: process.env.QR_INTEROPERABLE_SECRET,
    };

    // In production, fetch from database:
    // const { data, error } = await supabase
    //   .from('business_profile')
    //   .select('qr_config')
    //   .single();
    //
    // if (error || !data) {
    //   throw new Error('QR configuration not found');
    // }
    //
    // return data.qr_config;

    return config;
  } catch (error) {
    console.error('[QR Interoperable] Failed to get config:', error);
    throw new Error('Failed to get QR configuration');
  }
}

/**
 * Validate request body
 */
function validateRequest(body: RequestBody): string[] {
  const errors: string[] = [];

  if (typeof body.amount !== 'number' || body.amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (!body.order_id || typeof body.order_id !== 'string') {
    errors.push('order_id is required');
  }

  if (body.currency && body.currency !== 'ARS' && body.currency !== 'USD') {
    errors.push('currency must be ARS or USD');
  }

  if (body.expiry_minutes && (typeof body.expiry_minutes !== 'number' || body.expiry_minutes <= 0)) {
    errors.push('expiry_minutes must be a positive number');
  }

  return errors;
}

/**
 * Log QR generation to database
 */
async function logQRGeneration(params: {
  order_id: string;
  amount: number;
  currency: string;
  qr_string: string;
  expires_at: string;
}) {
  try {
    // TODO: Log to qr_interoperable_logs table
    // This is useful for tracking, debugging, and analytics

    // await supabase.from('qr_interoperable_logs').insert({
    //   order_id: params.order_id,
    //   amount: params.amount,
    //   currency: params.currency,
    //   qr_payload: params.qr_string,
    //   expires_at: params.expires_at,
    //   generated_at: new Date().toISOString(),
    // });

    console.log('[QR Interoperable] Generated QR logged:', {
      order_id: params.order_id,
      amount: params.amount,
    });
  } catch (error) {
    console.error('[QR Interoperable] Failed to log QR generation:', error);
    // Don't throw - logging failure shouldn't block QR generation
  }
}

// ============================================
// MAIN HANDLER
// ============================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted',
    });
  }

  try {
    const body: RequestBody = req.body;

    console.log('[QR Interoperable] Request received:', {
      order_id: body.order_id,
      amount: body.amount,
      currency: body.currency || 'ARS',
    });

    // Validate request
    const validationErrors = validateRequest(body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Get QR configuration
    const config = await getQRConfig();

    // Override with request params if provided
    if (body.payee_fa) {
      config.payee_fa = body.payee_fa;
    }
    if (body.payee_name) {
      config.payee_name = body.payee_name;
    }

    // Create service instance
    const qrService = createQRInteroperableService(config);

    // Generate QR parameters
    const params: GenerateQRParams = {
      amount: body.amount,
      currency: body.currency || 'ARS',
      order_id: body.order_id,
      pos_id: body.pos_id,
      expiry_minutes: body.expiry_minutes || 15,
      metadata: body.metadata,
    };

    // Generate QR code
    const qrResponse = await qrService.generateQR(params);

    // Log generation
    await logQRGeneration({
      order_id: body.order_id,
      amount: body.amount,
      currency: body.currency || 'ARS',
      qr_string: qrResponse.qr_string,
      expires_at: qrResponse.expires_at,
    });

    console.log('[QR Interoperable] QR generated successfully:', {
      order_id: body.order_id,
      expires_at: qrResponse.expires_at,
      type: qrResponse.type,
    });

    // Return QR code
    return res.status(200).json({
      success: true,
      data: {
        qr_image: qrResponse.qr_image,
        qr_string: qrResponse.qr_string,
        payload: qrResponse.payload,
        expires_at: qrResponse.expires_at,
        type: qrResponse.type,
      },
      meta: {
        generated_at: new Date().toISOString(),
        protocol_version: '1.0.0',
        standard: 'BCRA Transfers 3.0',
      },
    });
  } catch (error) {
    console.error('[QR Interoperable] Error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
