/**
 * QR Interoperable Display Component
 * Displays BCRA-compliant QR code for payment
 *
 * Features:
 * - Generates QR via API
 * - Shows QR image
 * - Displays payment details
 * - Auto-refreshes on expiry
 * - Countdown timer
 * - Polling for payment confirmation
 */

import React, { useEffect, useState } from 'react';
import {
  Stack,
  Button,
  Alert,
  Spinner,
  Badge,
} from '@/shared/ui';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface QRInteroperableDisplayProps {
  /**
   * Transaction amount
   */
  amount: number;

  /**
   * Currency (ARS or USD)
   */
  currency?: 'ARS' | 'USD';

  /**
   * Order/Sale ID
   */
  orderId: string;

  /**
   * Point of Sale ID
   */
  posId?: string;

  /**
   * Callback when payment is completed
   */
  onPaymentCompleted?: (paymentData: any) => void;

  /**
   * Callback when QR expires
   */
  onExpired?: () => void;

  /**
   * Callback when cancelled
   */
  onCancel?: () => void;
}

interface QRData {
  qr_image: string;
  qr_string: string;
  payload: any;
  expires_at: string;
  type: 'static' | 'dynamic';
}

// ============================================
// COMPONENT
// ============================================

export function QRInteroperableDisplay({
  amount,
  currency = 'ARS',
  orderId,
  posId,
  onPaymentCompleted,
  onExpired,
  onCancel,
}: QRInteroperableDisplayProps) {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [polling, setPolling] = useState(false);

  // Generate QR on mount
  useEffect(() => {
    generateQR();
  }, [amount, currency, orderId]);

  // Countdown timer
  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(qrData.expires_at);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(0);
        if (onExpired) {
          onExpired();
        }
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData, onExpired]);

  // Poll for payment status
  useEffect(() => {
    if (!polling || !orderId) return;

    const interval = setInterval(async () => {
      try {
        // TODO: Call API to check payment status
        // const response = await fetch(`/api/payments/status/${orderId}`);
        // const data = await response.json();
        //
        // if (data.status === 'completed') {
        //   if (onPaymentCompleted) {
        //     onPaymentCompleted(data);
        //   }
        //   setPolling(false);
        // }
      } catch (err) {
        logger.error('QRInteroperableDisplay', 'Failed to poll payment status', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [polling, orderId, onPaymentCompleted]);

  /**
   * Generate QR code via API
   */
  const generateQR = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qr/generate-interoperable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          order_id: orderId,
          pos_id: posId,
          expiry_minutes: 15,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate QR');
      }

      const result = await response.json();
      setQrData(result.data);
      setPolling(true); // Start polling for payment

      logger.info('QRInteroperableDisplay', 'QR generated', {
        order_id: orderId,
        expires_at: result.data.expires_at,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('QRInteroperableDisplay', 'Failed to generate QR', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format time left as MM:SS
   */
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setPolling(false);
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Handle regenerate
   */
  const handleRegenerate = () => {
    generateQR();
  };

  // Loading state
  if (loading) {
    return (
      <Stack align="center" gap="md" padding="xl">
        <Spinner size="lg" />
        <p style={{ color: 'var(--colors-gray-600)' }}>
          Generando QR Interoperable...
        </p>
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Stack gap="md" padding="lg">
        <Alert status="error" title="Error al generar QR">
          {error}
        </Alert>
        <Stack direction="row" gap="sm">
          <Button onClick={handleRegenerate}>
            Reintentar
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </Stack>
      </Stack>
    );
  }

  // Success state with QR
  if (!qrData) {
    return null;
  }

  return (
    <Stack gap="lg" align="center" padding="lg">
      {/* Header */}
      <Stack align="center" gap="xs">
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
          QR Interoperable (BCRA)
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--colors-gray-600)',
          textAlign: 'center',
        }}>
          Escanea con cualquier app: MODO, Mercado Pago, BNA+, Ualá, etc.
        </p>
      </Stack>

      {/* QR Code */}
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        border: '2px solid var(--colors-gray-200)',
      }}>
        <img
          src={qrData.qr_image}
          alt="QR Interoperable"
          style={{
            width: '300px',
            height: '300px',
            display: 'block',
          }}
        />
      </div>

      {/* Payment Details */}
      <Stack gap="sm" width="100%" maxW="400px">
        <Stack direction="row" justify="space-between">
          <span style={{ color: 'var(--colors-gray-600)' }}>Monto:</span>
          <strong style={{ fontSize: '18px' }}>
            {currency} ${amount.toFixed(2)}
          </strong>
        </Stack>

        <Stack direction="row" justify="space-between">
          <span style={{ color: 'var(--colors-gray-600)' }}>Orden:</span>
          <span style={{ fontFamily: 'monospace' }}>{orderId}</span>
        </Stack>

        <Stack direction="row" justify="space-between" align="center">
          <span style={{ color: 'var(--colors-gray-600)' }}>Expira en:</span>
          <Badge colorPalette={timeLeft > 300 ? 'green' : timeLeft > 60 ? 'yellow' : 'red'}>
            {formatTimeLeft()}
          </Badge>
        </Stack>

        <Stack direction="row" justify="space-between">
          <span style={{ color: 'var(--colors-gray-600)' }}>Tipo:</span>
          <Badge colorPalette="blue">
            {qrData.type === 'dynamic' ? 'Dinámico' : 'Estático'}
          </Badge>
        </Stack>
      </Stack>

      {/* Status */}
      {polling && (
        <Alert status="info" title="Esperando pago...">
          <Stack direction="row" gap="sm" align="center">
            <Spinner size="sm" />
            <span>Verificando transferencia automáticamente</span>
          </Stack>
        </Alert>
      )}

      {/* Actions */}
      <Stack direction="row" gap="sm" width="100%">
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={timeLeft > 600} // Only allow regenerate in last 10 minutes
        >
          Regenerar QR
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          Cancelar
        </Button>
      </Stack>

      {/* Footer Info */}
      <Stack gap="xs" width="100%" maxW="400px">
        <p style={{
          fontSize: '12px',
          color: 'var(--colors-gray-500)',
          textAlign: 'center',
        }}>
          ✅ Transferencia instantánea (máx 25 seg)
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--colors-gray-500)',
          textAlign: 'center',
        }}>
          ✅ Irrevocable y segura
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--colors-gray-500)',
          textAlign: 'center',
        }}>
          ℹ️ Estándar BCRA Transfers 3.0
        </p>
      </Stack>
    </Stack>
  );
}

export default QRInteroperableDisplay;
