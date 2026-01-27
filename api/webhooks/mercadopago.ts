/**
 * Mercado Pago Webhook Handler
 * Vercel Serverless Function to handle payment notifications
 *
 * Documentation: https://www.mercadopago.com.ar/developers/en/docs/checkout-api/additional-content/notifications/webhooks
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side operations
);

// ============================================
// TYPES
// ============================================

interface MercadoPagoWebhook {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: 'payment.created' | 'payment.updated';
  data: {
    id: string; // Payment ID
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map Mercado Pago payment status to our payment_status enum
 */
function mapPaymentStatus(mpStatus: string): string {
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

/**
 * Verify webhook signature (optional but recommended for security)
 */
function verifyWebhookSignature(
  req: VercelRequest,
  webhookSecret?: string
): boolean {
  if (!webhookSecret) {
    // If no secret configured, skip verification
    return true;
  }

  const signature = req.headers['x-signature'] as string;
  const requestId = req.headers['x-request-id'] as string;

  if (!signature || !requestId) {
    return false;
  }

  // TODO: Implement signature verification
  // For now, we'll accept all webhooks if secret is not configured
  return true;
}

/**
 * Get payment details from Mercado Pago
 */
async function getPaymentDetails(paymentId: string, accessToken: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment: ${response.statusText}`);
  }

  return await response.json();
}

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
    webhook_secret: config.webhook_secret,
  };
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let webhookEventId: string | null = null;

  try {
    const webhook: MercadoPagoWebhook = req.body;

    console.log('[MercadoPago Webhook] Received:', {
      type: webhook.type,
      action: webhook.action,
      payment_id: webhook.data?.id,
    });

    // Log webhook event to database
    const { data: webhookEvent, error: webhookInsertError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'mercadopago',
        event_type: `${webhook.type}.${webhook.action}`,
        payload: webhook,
        external_id: webhook.data?.id,
        status: 'pending',
        attempts: 1,
      })
      .select()
      .single();

    if (webhookInsertError) {
      console.error('[MercadoPago Webhook] Failed to log event:', webhookInsertError);
    } else {
      webhookEventId = webhookEvent.id;
    }

    // Only process payment notifications
    if (webhook.type !== 'payment') {
      console.log('[MercadoPago Webhook] Ignoring non-payment notification');

      // Mark webhook as processed
      if (webhookEventId) {
        await supabase
          .from('webhook_events')
          .update({ status: 'processed', processed_at: new Date().toISOString() })
          .eq('id', webhookEventId);
      }

      return res.status(200).json({ status: 'ignored' });
    }

    // Get Mercado Pago credentials
    const credentials = await getMercadoPagoCredentials();

    // Verify webhook signature (optional but recommended)
    if (!verifyWebhookSignature(req, credentials.webhook_secret)) {
      console.error('[MercadoPago Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Get payment details from Mercado Pago
    const paymentDetails = await getPaymentDetails(
      webhook.data.id,
      credentials.access_token
    );

    console.log('[MercadoPago Webhook] Payment details:', {
      id: paymentDetails.id,
      status: paymentDetails.status,
      external_reference: paymentDetails.external_reference,
      transaction_amount: paymentDetails.transaction_amount,
    });

    // Find sale_payment record by external_reference
    const { data: existingPayment, error: findError } = await supabase
      .from('sale_payments')
      .select('*')
      .eq('metadata->>external_id', paymentDetails.id.toString())
      .single();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is okay for new payments
      throw findError;
    }

    const mappedStatus = mapPaymentStatus(paymentDetails.status);

    if (existingPayment) {
      // Update existing payment
      const { error: updateError } = await supabase
        .from('sale_payments')
        .update({
          status: mappedStatus,
          metadata: {
            ...existingPayment.metadata,
            mercadopago_payment: paymentDetails,
            last_webhook_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPayment.id);

      if (updateError) {
        throw updateError;
      }

      console.log('[MercadoPago Webhook] Payment updated:', {
        payment_id: existingPayment.id,
        new_status: mappedStatus,
      });

      // Update webhook event with sale_payment_id
      if (webhookEventId) {
        await supabase
          .from('webhook_events')
          .update({
            sale_payment_id: existingPayment.id,
            status: 'processed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', webhookEventId);
      }
    } else {
      // Create new payment record if external_reference exists
      if (paymentDetails.external_reference) {
        const { data: newPayment, error: insertError } = await supabase
          .from('sale_payments')
          .insert({
            sale_id: paymentDetails.external_reference, // Assuming external_reference is sale_id
            amount: paymentDetails.transaction_amount,
            payment_type: 'CARD', // Adjust based on payment_method_id
            status: mappedStatus,
            metadata: {
              external_id: paymentDetails.id.toString(),
              mercadopago_payment: paymentDetails,
              payment_method_id: paymentDetails.payment_method_id,
              payment_type_id: paymentDetails.payment_type_id,
            },
          })
          .select()
          .single();

        if (insertError) {
          console.error('[MercadoPago Webhook] Failed to create payment:', insertError);
          // Don't throw - we already processed the webhook
        } else {
          console.log('[MercadoPago Webhook] Payment created');

          // Update webhook event with sale_payment_id
          if (webhookEventId && newPayment) {
            await supabase
              .from('webhook_events')
              .update({
                sale_payment_id: newPayment.id,
                status: 'processed',
                processed_at: new Date().toISOString(),
              })
              .eq('id', webhookEventId);
          }
        }
      } else {
        // Mark webhook as processed even if no payment was created
        if (webhookEventId) {
          await supabase
            .from('webhook_events')
            .update({
              status: 'processed',
              processed_at: new Date().toISOString(),
            })
            .eq('id', webhookEventId);
        }
      }
    }

    // Return 200 to acknowledge receipt
    return res.status(200).json({
      status: 'success',
      payment_id: paymentDetails.id,
      mapped_status: mappedStatus,
    });

  } catch (error) {
    console.error('[MercadoPago Webhook] Error:', error);

    // Mark webhook as failed
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', webhookEventId);
    }

    // Return 500 but log the error
    // Mercado Pago will retry failed webhooks
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
