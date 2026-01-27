/**
 * Checkout Success Page
 * Shown after successful payment via Mercado Pago
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ContentLayout,
  Stack,
  Button,
  Alert,
  Badge,
  CardWrapper,
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { CheckCircleIcon, HomeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [paymentInfo, setPaymentInfo] = useState<{
    collection_id?: string;
    collection_status?: string;
    payment_id?: string;
    status?: string;
    external_reference?: string;
    payment_type?: string;
    merchant_order_id?: string;
    preference_id?: string;
  }>({});

  useEffect(() => {
    // Extract payment info from URL params
    const info = {
      collection_id: searchParams.get('collection_id') || undefined,
      collection_status: searchParams.get('collection_status') || undefined,
      payment_id: searchParams.get('payment_id') || undefined,
      status: searchParams.get('status') || undefined,
      external_reference: searchParams.get('external_reference') || undefined,
      payment_type: searchParams.get('payment_type') || undefined,
      merchant_order_id: searchParams.get('merchant_order_id') || undefined,
      preference_id: searchParams.get('preference_id') || undefined,
    };

    setPaymentInfo(info);

    logger.info('CheckoutSuccessPage', 'Payment success', info);
  }, [searchParams]);

  const getStatusMessage = () => {
    const status = paymentInfo.status || paymentInfo.collection_status;

    switch (status) {
      case 'approved':
        return {
          title: '¡Pago Aprobado!',
          message: 'Tu pago se procesó exitosamente. Recibirás un email de confirmación pronto.',
          color: 'green',
        };
      case 'pending':
      case 'in_process':
        return {
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
          color: 'yellow',
        };
      default:
        return {
          title: 'Pago Recibido',
          message: 'Hemos recibido tu pago. Estamos procesando tu orden.',
          color: 'blue',
        };
    }
  };

  const statusInfo = getStatusMessage();
  const paymentId = paymentInfo.payment_id || paymentInfo.collection_id;
  const orderId = paymentInfo.external_reference;

  return (
    <ContentLayout spacing="normal" maxW="container.md">
      <Stack gap="xl" align="center" padding="xl">
        {/* Success Icon */}
        <Stack align="center" gap="md">
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--colors-green-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon as={CheckCircleIcon} boxSize="16" color="green.600" />
          </div>

          <Stack align="center" gap="xs">
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {statusInfo.title}
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--colors-gray-600)',
              textAlign: 'center',
              maxWidth: '500px',
            }}>
              {statusInfo.message}
            </p>
          </Stack>
        </Stack>

        {/* Payment Details */}
        <CardWrapper padding="lg" width="100%" maxW="500px">
          <Stack gap="md">
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              Detalles del Pago
            </h2>

            {paymentId && (
              <Stack direction="row" justify="space-between">
                <span style={{ color: 'var(--colors-gray-600)' }}>ID de Pago:</span>
                <strong style={{ fontFamily: 'monospace' }}>{paymentId}</strong>
              </Stack>
            )}

            {orderId && (
              <Stack direction="row" justify="space-between">
                <span style={{ color: 'var(--colors-gray-600)' }}>ID de Orden:</span>
                <strong style={{ fontFamily: 'monospace' }}>{orderId}</strong>
              </Stack>
            )}

            <Stack direction="row" justify="space-between">
              <span style={{ color: 'var(--colors-gray-600)' }}>Estado:</span>
              <Badge colorPalette={statusInfo.color}>
                {(paymentInfo.status || paymentInfo.collection_status || 'Procesando').toUpperCase()}
              </Badge>
            </Stack>

            {paymentInfo.payment_type && (
              <Stack direction="row" justify="space-between">
                <span style={{ color: 'var(--colors-gray-600)' }}>Método de Pago:</span>
                <span>{paymentInfo.payment_type}</span>
              </Stack>
            )}
          </Stack>
        </CardWrapper>

        {/* Info Alert */}
        <Alert status="info" title="¿Qué sigue?" maxW="500px">
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li>Recibirás un email de confirmación con los detalles de tu compra</li>
            <li>Puedes ver el estado de tu pedido en "Mis Órdenes"</li>
            <li>Si tienes alguna pregunta, contáctanos</li>
          </ul>
        </Alert>

        {/* Actions */}
        <Stack direction="row" gap="md" wrap="wrap" justify="center">
          <Button
            size="lg"
            onClick={() => navigate('/app/orders')}
          >
            <Icon as={DocumentTextIcon} />
            Ver Mis Órdenes
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/app/portal')}
          >
            <Icon as={HomeIcon} />
            Volver al Inicio
          </Button>
        </Stack>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && Object.keys(paymentInfo).length > 0 && (
          <CardWrapper padding="md" width="100%" maxW="500px" borderColor="gray.300">
            <Stack gap="sm">
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                Debug Info (Dev Only)
              </h3>
              <pre style={{
                fontSize: '12px',
                background: 'var(--colors-gray-50)',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
              }}>
                {JSON.stringify(paymentInfo, null, 2)}
              </pre>
            </Stack>
          </CardWrapper>
        )}
      </Stack>
    </ContentLayout>
  );
}
