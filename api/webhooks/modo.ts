/**
 * API Endpoint: MODO Webhook Handler
 * Receives payment notifications from MODO
 *
 * POST /api/webhooks/modo
 *
 * MODO sends notifications when payment status changes:
 * - QR scanned
 * - Payment completed
 * - Payment failed
 * - QR expired
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { MODOService } from '../../src/modules/finance-integrations/services/modoService';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let webhookEventId: string | null = null;

  try {
    const webhookData = req.body;

    console.log('[MODO Webhook] Received notification:', {
      type: webhookData.type,
      qr_id: webhookData.data?.qr_id,
      status: webhookData.data?.status,
    });

    // Log webhook event to database
    const { data: webhookEvent, error: webhookInsertError } = await supabase
      .from('webhook_events')
      .insert({
        provider: 'modo',
        event_type: webhookData.type,
        payload: webhookData,
        external_id: webhookData.data?.qr_id || webhookData.data?.external_reference,
        status: 'pending',
        attempts: 1,
      })
      .select()
      .single();

    if (webhookInsertError) {
      console.error('[MODO Webhook] Failed to log event:', webhookInsertError);
    } else {
      webhookEventId = webhookEvent.id;
    }

    // Verify webhook signature (if configured)
    const signature = req.headers['x-modo-signature'] as string;
    const { data: gateway } = await supabase
      .from('payment_gateways')
      .select('config')
      .eq('provider', 'modo')
      .single();

    if (gateway?.config?.webhook_secret && signature) {
      const isValid = MODOService.verifyWebhookSignature(
        JSON.stringify(webhookData),
        signature,
        gateway.config.webhook_secret
      );

      if (!isValid) {
        console.warn('[MODO Webhook] Invalid signature');

        // Mark webhook as failed
        if (webhookEventId) {
          await supabase
            .from('webhook_events')
            .update({
              status: 'failed',
              error_message: 'Invalid signature',
            })
            .eq('id', webhookEventId);
        }

        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Extract payment data
    const {
      type,
      data: paymentData,
    } = webhookData;

    // Handle different webhook types
    if (type === 'payment.completed' || type === 'qr.paid') {
      await handlePaymentCompleted(paymentData, webhookEventId);
    } else if (type === 'qr.expired') {
      await handleQRExpired(paymentData, webhookEventId);
    } else if (type === 'payment.failed') {
      await handlePaymentFailed(paymentData, webhookEventId);
    } else {
      console.log('[MODO Webhook] Unknown webhook type:', type);

      // Mark as processed anyway
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

    // Always return 200 to acknowledge receipt
    // MODO will retry if we don't respond with 200
    return res.status(200).json({
      received: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[MODO Webhook] Error processing webhook:', error);

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

    // Still return 200 to prevent retries
    // Log error for manual investigation
    return res.status(200).json({
      received: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handle payment completed webhook
 */
async function handlePaymentCompleted(paymentData: any, webhookEventId: string | null) {
  try {
    const {
      qr_id,
      external_reference,
      amount,
      status,
      paid_at,
      customer_info,
    } = paymentData;

    console.log('[MODO Webhook] Processing payment completed:', {
      qr_id,
      external_reference,
      amount,
    });

    // Find the payment record by QR ID or external reference
    const { data: payment, error: fetchError } = await supabase
      .from('sale_payments')
      .select('*')
      .or(`metadata->qr_id.eq.${qr_id},external_reference.eq.${external_reference}`)
      .eq('status', 'INITIATED')
      .single();

    if (fetchError || !payment) {
      console.warn('[MODO Webhook] Payment record not found:', {
        qr_id,
        external_reference,
      });

      // Mark webhook as processed even without payment
      if (webhookEventId) {
        await supabase
          .from('webhook_events')
          .update({
            status: 'processed',
            processed_at: new Date().toISOString(),
            error_message: 'Payment record not found',
          })
          .eq('id', webhookEventId);
      }
      return;
    }

    // Map MODO status to our system status
    const newStatus = MODOService.mapPaymentStatus(status);

    // Update payment status
    const { error: updateError } = await supabase
      .from('sale_payments')
      .update({
        status: newStatus,
        settled_at: paid_at || new Date().toISOString(),
        metadata: {
          ...(payment.metadata || {}),
          modo_qr_id: qr_id,
          modo_status: status,
          modo_paid_at: paid_at,
          modo_customer: customer_info,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      throw updateError;
    }

    console.log('[MODO Webhook] ✅ Payment updated successfully:', {
      payment_id: payment.id,
      new_status: newStatus,
    });

    // Mark webhook as processed
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({
          sale_payment_id: payment.id,
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhookEventId);
    }

  } catch (error) {
    console.error('[MODO Webhook] Error handling payment completed:', error);
    throw error;
  }
}

/**
 * Handle QR expired webhook
 */
async function handleQRExpired(paymentData: any, webhookEventId: string | null) {
  try {
    const { qr_id, external_reference } = paymentData;

    console.log('[MODO Webhook] Processing QR expired:', { qr_id });

    // Find payment record
    const { data: payment } = await supabase
      .from('sale_payments')
      .select('*')
      .or(`metadata->qr_id.eq.${qr_id},external_reference.eq.${external_reference}`)
      .eq('status', 'INITIATED')
      .single();

    if (!payment) {
      console.warn('[MODO Webhook] Payment record not found for expired QR');
      return;
    }

    // Update to FAILED status
    await supabase
      .from('sale_payments')
      .update({
        status: 'FAILED',
        metadata: {
          ...(payment.metadata || {}),
          modo_qr_id: qr_id,
          modo_status: 'EXPIRED',
          expired_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    console.log('[MODO Webhook] ✅ Payment marked as FAILED (QR expired)');

    // Mark webhook as processed
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({
          sale_payment_id: payment.id,
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhookEventId);
    }

  } catch (error) {
    console.error('[MODO Webhook] Error handling QR expired:', error);
    throw error;
  }
}

/**
 * Handle payment failed webhook
 */
async function handlePaymentFailed(paymentData: any, webhookEventId: string | null) {
  try {
    const { qr_id, external_reference, reason } = paymentData;

    console.log('[MODO Webhook] Processing payment failed:', { qr_id, reason });

    // Find payment record
    const { data: payment } = await supabase
      .from('sale_payments')
      .select('*')
      .or(`metadata->qr_id.eq.${qr_id},external_reference.eq.${external_reference}`)
      .eq('status', 'INITIATED')
      .single();

    if (!payment) {
      console.warn('[MODO Webhook] Payment record not found for failed payment');
      return;
    }

    // Update to FAILED status
    await supabase
      .from('sale_payments')
      .update({
        status: 'FAILED',
        metadata: {
          ...(payment.metadata || {}),
          modo_qr_id: qr_id,
          modo_status: 'FAILED',
          failure_reason: reason,
          failed_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    console.log('[MODO Webhook] ✅ Payment marked as FAILED');

    // Mark webhook as processed
    if (webhookEventId) {
      await supabase
        .from('webhook_events')
        .update({
          sale_payment_id: payment.id,
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', webhookEventId);
    }

  } catch (error) {
    console.error('[MODO Webhook] Error handling payment failed:', error);
    throw error;
  }
}
