/**
 * API Endpoint: Generate MODO QR Code
 * Creates a QR payment code using MODO API
 *
 * POST /api/modo/generate-qr
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createMODOService } from '../../src/modules/finance-integrations/services/modoService';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      amount,
      description,
      external_reference,
      expiration_minutes,
      metadata
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Create MODO service instance
    const modoService = await createMODOService();

    // Generate QR
    const qrResponse = await modoService.generateQR({
      amount,
      description,
      external_reference,
      expiration_minutes: expiration_minutes || 15,
      metadata: metadata || {},
    });

    console.log('[MODO] QR generated successfully:', {
      qr_id: qrResponse.qr_id,
      amount,
      expiration_date: qrResponse.expiration_date,
    });

    // Return QR data
    return res.status(200).json({
      success: true,
      qr_id: qrResponse.qr_id,
      qr_code: qrResponse.qr_code,
      qr_data: qrResponse.qr_data,
      deep_link: qrResponse.deep_link,
      expiration_date: qrResponse.expiration_date,
      status: qrResponse.status,
    });

  } catch (error) {
    console.error('[MODO] Error generating QR:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate QR',
    });
  }
}
