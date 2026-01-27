/**
 * Create Mercado Pago Preference API Endpoint
 * Vercel Serverless Function
 *
 * This endpoint creates a payment preference and returns the init_point URL
 * for redirecting the customer to Mercado Pago checkout
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import MercadoPago from 'mercadopago';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// TYPES
// ============================================

interface PreferenceItem {
  id?: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

interface PreferenceBackUrls {
  success: string;
  failure: string;
  pending: string;
}

interface CreatePreferenceRequest {
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

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get Mercado Pago credentials from database
 */
async function getMercadoPagoCredentials() {
  const { data, error } = await supabase
    .from('payment_gateways')
    .select('config')
    .eq('provider', 'mercadopago')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('No active Mercado Pago gateway found');
  }

  const config = data.config as any;

  if (!config.access_token) {
    throw new Error('Invalid Mercado Pago configuration');
  }

  return {
    access_token: config.access_token,
    test_mode: config.test_mode ?? true,
  };
}

// ============================================
// API HANDLER
// ============================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: CreatePreferenceRequest = req.body;

    // Validate request
    if (!body.items || body.items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!body.back_urls) {
      return res.status(400).json({ error: 'Back URLs are required' });
    }

    console.log('[Create Preference] Processing request', {
      items_count: body.items.length,
      external_reference: body.external_reference,
    });

    // Get Mercado Pago credentials
    const credentials = await getMercadoPagoCredentials();

    // Configure Mercado Pago SDK
    MercadoPago.configure({
      access_token: credentials.access_token,
    });

    // Create preference
    const preference = await MercadoPago.preferences.create({
      items: body.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS',
      })),
      back_urls: body.back_urls,
      notification_url: body.notification_url,
      external_reference: body.external_reference,
      auto_return: body.auto_return || 'approved',
      payer: body.payer,
      metadata: body.metadata,
      binary_mode: false, // Allow pending payments
      statement_descriptor: 'G-Admin Mini',
    });

    console.log('[Create Preference] Preference created', {
      preference_id: preference.body.id,
      init_point: preference.body.init_point,
    });

    // Return preference data
    return res.status(200).json({
      id: preference.body.id,
      init_point: credentials.test_mode
        ? preference.body.sandbox_init_point
        : preference.body.init_point,
      sandbox_init_point: preference.body.sandbox_init_point,
      date_created: preference.body.date_created,
      items: preference.body.items,
      auto_return: preference.body.auto_return,
      back_urls: preference.body.back_urls,
      external_reference: preference.body.external_reference,
    });

  } catch (error) {
    console.error('[Create Preference] Error:', error);

    return res.status(500).json({
      error: 'Failed to create preference',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
