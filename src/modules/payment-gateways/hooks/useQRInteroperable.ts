/**
 * useQRInteroperable Hook
 * React hook for generating and managing BCRA-compliant QR codes
 *
 * Features:
 * - Generate QR codes
 * - Validate QR codes
 * - Auto-regenerate on expiry
 * - Loading/error states
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface UseQRInteroperableParams {
  /**
   * Auto-regenerate QR when expired
   */
  autoRegenerate?: boolean;

  /**
   * Callback when QR is generated
   */
  onGenerated?: (qrData: QRData) => void;

  /**
   * Callback when QR expires
   */
  onExpired?: () => void;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void;
}

export interface QRData {
  qr_image: string;
  qr_string: string;
  payload: any;
  expires_at: string;
  type: 'static' | 'dynamic';
}

export interface GenerateQROptions {
  amount: number;
  currency?: 'ARS' | 'USD';
  order_id: string;
  pos_id?: string;
  expiry_minutes?: number;
  metadata?: Record<string, any>;
}

// ============================================
// HOOK
// ============================================

export function useQRInteroperable(params?: UseQRInteroperableParams) {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Generate QR code
   */
  const generateQR = useCallback(async (options: GenerateQROptions) => {
    setLoading(true);
    setError(null);

    try {
      logger.info('useQRInteroperable', 'Generating QR', {
        order_id: options.order_id,
        amount: options.amount,
      });

      const response = await fetch('/api/qr/generate-interoperable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency || 'ARS',
          order_id: options.order_id,
          pos_id: options.pos_id,
          expiry_minutes: options.expiry_minutes || 15,
          metadata: options.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate QR');
      }

      const result = await response.json();
      const qr: QRData = result.data;

      setQrData(qr);

      if (params?.onGenerated) {
        params.onGenerated(qr);
      }

      logger.info('useQRInteroperable', 'QR generated successfully', {
        order_id: options.order_id,
        expires_at: qr.expires_at,
      });

      return qr;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);

      if (params?.onError) {
        params.onError(error);
      }

      logger.error('useQRInteroperable', 'Failed to generate QR', err);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [params]);

  /**
   * Regenerate current QR
   */
  const regenerateQR = useCallback(async () => {
    if (!qrData || !qrData.payload) {
      throw new Error('No QR data to regenerate');
    }

    return generateQR({
      amount: parseFloat(qrData.payload.amount),
      currency: qrData.payload.currency,
      order_id: qrData.payload.order_id,
      pos_id: qrData.payload.pos_id,
      metadata: qrData.payload.metadata,
    });
  }, [qrData, generateQR]);

  /**
   * Clear QR data
   */
  const clearQR = useCallback(() => {
    setQrData(null);
    setError(null);
  }, []);

  /**
   * Check if QR is expired
   */
  const isExpired = useCallback(() => {
    if (!qrData) return false;

    const expiresAt = new Date(qrData.expires_at);
    const now = new Date();

    return expiresAt < now;
  }, [qrData]);

  /**
   * Get time left in seconds
   */
  const getTimeLeft = useCallback(() => {
    if (!qrData) return 0;

    const expiresAt = new Date(qrData.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    return Math.max(0, Math.floor(diff / 1000));
  }, [qrData]);

  return {
    qrData,
    loading,
    error,
    generateQR,
    regenerateQR,
    clearQR,
    isExpired,
    getTimeLeft,
  };
}

export default useQRInteroperable;
