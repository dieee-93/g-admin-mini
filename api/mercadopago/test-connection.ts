/**
 * MercadoPago Test Connection API
 * Vercel Serverless Function to test MercadoPago credentials
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { access_token, test_mode } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'access_token is required',
      });
    }

    console.log('[MercadoPago Test] Testing connection...', {
      test_mode,
      token_prefix: access_token.substring(0, 10),
    });

    // Call MercadoPago API to get user info (this validates the credentials)
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MercadoPago Test] API request failed:', {
        status: response.status,
        error: errorText,
      });

      return res.status(200).json({
        success: false,
        error: `MercadoPago API error: ${response.status}`,
        details: errorText,
      });
    }

    const userData = await response.json();

    console.log('[MercadoPago Test] Connection successful!', {
      user_id: userData.id,
      email: userData.email,
    });

    return res.status(200).json({
      success: true,
      data: {
        user_id: userData.id,
        email: userData.email,
        site_id: userData.site_id,
        nickname: userData.nickname,
        first_name: userData.first_name,
        last_name: userData.last_name,
      },
    });
  } catch (error) {
    console.error('[MercadoPago Test] Error:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
