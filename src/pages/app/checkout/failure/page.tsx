/**
 * Checkout Failure Page
 * Shown when payment fails or is cancelled
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ContentLayout,
  Stack,
  Button,
  Alert,
  CardWrapper,
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { XCircleIcon, ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

export default function CheckoutFailurePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [paymentInfo, setPaymentInfo] = useState<{
    collection_id?: string;
    collection_status?: string;
    payment_id?: string;
    status?: string;
    external_reference?: string;
    payment_type?: string;
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
      preference_id: searchParams.get('preference_id') || undefined,
    };

    setPaymentInfo(info);

    logger.info('CheckoutFailurePage', 'Payment failed', info);
  }, [searchParams]);

  const getErrorMessage = () => {
    const status = paymentInfo.status || paymentInfo.collection_status;

    switch (status) {
      case 'rejected':
        return {
          title: 'Pago Rechazado',
          message: 'Tu pago fue rechazado. Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.',
          suggestion: 'Puedes volver a intentar con otra tarjeta o método de pago.',
        };
      case 'cancelled':
        return {
          title: 'Pago Cancelado',
          message: 'Cancelaste el proceso de pago.',
          suggestion: 'Si deseas completar tu compra, puedes volver a intentarlo.',
        };
      default:
        return {
          title: 'Error en el Pago',
          message: 'Hubo un problema al procesar tu pago.',
          suggestion: 'Por favor, intenta nuevamente o contacta con soporte si el problema persiste.',
        };
    }
  };

  const errorInfo = getErrorMessage();
  const orderId = paymentInfo.external_reference;

  return (
    <ContentLayout spacing="normal" maxW="container.md">
      <Stack gap="xl" align="center" padding="xl">
        {/* Error Icon */}
        <Stack align="center" gap="md">
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--colors-red-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon as={XCircleIcon} boxSize="16" color="red.600" />
          </div>

          <Stack align="center" gap="xs">
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
              {errorInfo.title}
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--colors-gray-600)',
              textAlign: 'center',
              maxWidth: '500px',
            }}>
              {errorInfo.message}
            </p>
          </Stack>
        </Stack>

        {/* Error Details */}
        {orderId && (
          <CardWrapper padding="lg" width="100%" maxW="500px">
            <Stack gap="md">
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                Detalles
              </h2>

              <Stack direction="row" justify="space-between">
                <span style={{ color: 'var(--colors-gray-600)' }}>ID de Orden:</span>
                <strong style={{ fontFamily: 'monospace' }}>{orderId}</strong>
              </Stack>

              {paymentInfo.status && (
                <Stack direction="row" justify="space-between">
                  <span style={{ color: 'var(--colors-gray-600)' }}>Estado:</span>
                  <span style={{ color: 'var(--colors-red-600)', fontWeight: 'bold' }}>
                    {paymentInfo.status.toUpperCase()}
                  </span>
                </Stack>
              )}
            </Stack>
          </CardWrapper>
        )}

        {/* Suggestion Alert */}
        <Alert status="warning" title="¿Qué puedes hacer?" maxW="500px">
          <Stack gap="sm">
            <p>{errorInfo.suggestion}</p>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li>Verifica que los datos de tu tarjeta sean correctos</li>
              <li>Asegúrate de tener fondos suficientes</li>
              <li>Intenta con otro método de pago</li>
              <li>Contacta con tu banco si el problema persiste</li>
            </ul>
          </Stack>
        </Alert>

        {/* Actions */}
        <Stack direction="row" gap="md" wrap="wrap" justify="center">
          <Button
            size="lg"
            onClick={() => navigate('/app/checkout')}
          >
            <Icon as={ArrowLeftIcon} />
            Volver al Checkout
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/app/cart')}
          >
            <Icon as={ShoppingCartIcon} />
            Ver mi Carrito
          </Button>
        </Stack>

        {/* Help Section */}
        <CardWrapper padding="lg" width="100%" maxW="500px" borderColor="gray.300">
          <Stack gap="sm">
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              ¿Necesitas ayuda?
            </h3>
            <p style={{ color: 'var(--colors-gray-600)' }}>
              Si tienes problemas con el pago o necesitas asistencia, no dudes en contactarnos.
            </p>
            <Button variant="outline" size="sm">
              Contactar Soporte
            </Button>
          </Stack>
        </CardWrapper>

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
