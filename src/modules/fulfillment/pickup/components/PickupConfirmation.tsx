/**
 * PICKUP CONFIRMATION
 *
 * QR scanner and manual code entry for pickup confirmation.
 *
 * @version 1.0.0
 */

import React from 'react';
import {
  Stack,
  VStack,
  Button,
  Input,
  Typography,
  CardWrapper,
  Badge,
  Alert
} from '@/shared/ui';
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { pickupService } from '../services/pickupService';
import type { QRValidation, ConfirmationResult } from '../types';
import { DecimalUtils } from '@/lib/decimal';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

export interface PickupConfirmationProps {
  onConfirmed?: (result: ConfirmationResult) => void;
  onCancelled?: () => void;
}

export function PickupConfirmation({
  onConfirmed,
  onCancelled
}: PickupConfirmationProps) {
  const [pickupCode, setPickupCode] = React.useState('');
  const [validation, setValidation] = React.useState<QRValidation | null>(null);
  const [confirming, setConfirming] = React.useState(false);

  const handleValidate = async () => {
    if (!pickupCode.trim()) {
      notify.warning({ title: 'Please enter pickup code' });
      return;
    }

    try {
      logger.debug('PickupConfirmation', 'Validating code', { pickupCode });

      // Create QR data format
      const qrData = JSON.stringify({
        orderId: 'unknown', // Will be validated
        pickupCode: pickupCode.trim().toUpperCase(),
        type: 'pickup',
        timestamp: new Date().toISOString()
      });

      const result = await pickupService.validatePickupQR(qrData);
      setValidation(result);

      if (result.valid) {
        notify.success({ title: 'Valid pickup code' });
      } else {
        notify.error({
          title: 'Invalid code',
          description: result.errorMessage
        });
      }
    } catch (error) {
      logger.error('PickupConfirmation', 'Validation error', error);
      notify.error({ title: 'Validation failed' });
    }
  };

  const handleConfirm = async () => {
    if (!validation?.valid) {
      notify.error({ title: 'Please validate code first' });
      return;
    }

    try {
      setConfirming(true);

      const qrData = JSON.stringify({
        orderId: validation.orderId,
        pickupCode: validation.pickupCode,
        type: 'pickup',
        timestamp: new Date().toISOString()
      });

      const result = await pickupService.confirmPickup(qrData);

      if (result.success) {
        notify.success({
          title: 'Pickup Confirmed',
          description: 'Order completed successfully'
        });

        onConfirmed?.(result);

        // Reset
        setPickupCode('');
        setValidation(null);
      } else {
        notify.error({
          title: 'Confirmation failed',
          description: result.errorMessage
        });
      }
    } catch (error) {
      logger.error('PickupConfirmation', 'Confirmation error', error);
      notify.error({ title: 'Confirmation failed' });
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setPickupCode('');
    setValidation(null);
    onCancelled?.();
  };

  return (
    <CardWrapper>
      <VStack align="start" gap="md" p="4">
        <Typography fontSize="xl" fontWeight="bold">
          Confirm Pickup
        </Typography>

        {/* QR Scanner Button (TODO: Implement) */}
        <Button w="full" variant="outline" colorPalette="blue">
          <Icon icon={QrCodeIcon} size="sm" />
          Scan QR Code
        </Button>

        <Typography fontSize="sm" color="text.muted" textAlign="center" w="full">
          or enter code manually
        </Typography>

        {/* Manual Code Entry */}
        <Stack direction="row" gap="sm" w="full">
          <Input
            flex="1"
            placeholder="Enter pickup code (e.g., ABC123)"
            value={pickupCode}
            onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
            maxLength={6}
            textTransform="uppercase"
          />
          <Button onClick={handleValidate} colorPalette="blue">
            Validate
          </Button>
        </Stack>

        {/* Validation Result */}
        {validation && (
          <Stack w="full">
            {validation.valid ? (
              <Alert.Root status="success">
                <Alert.Indicator>
                  <Icon icon={CheckCircleIcon} />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>Valid Pickup Code</Alert.Title>
                  <Alert.Description>
                    <VStack align="start" gap="xs" mt="2">
                      <Typography fontSize="sm">
                        <strong>Customer:</strong> {validation.customerName || 'N/A'}
                      </Typography>
                      <Typography fontSize="sm">
                        <strong>Order Total:</strong>{' '}
                        {validation.orderTotal
                          ? DecimalUtils.formatCurrency(validation.orderTotal)
                          : 'N/A'}
                      </Typography>
                      <Typography fontSize="sm">
                        <strong>Status:</strong>{' '}
                        <Badge colorPalette="green">{validation.orderStatus}</Badge>
                      </Typography>
                    </VStack>
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            ) : (
              <Alert.Root status="error">
                <Alert.Indicator>
                  <Icon icon={XCircleIcon} />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>Invalid Code</Alert.Title>
                  <Alert.Description>{validation.errorMessage}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </Stack>
        )}

        {/* Actions */}
        <Stack direction="row" gap="sm" w="full" pt="2">
          <Button flex="1" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            flex="1"
            colorPalette="green"
            onClick={handleConfirm}
            isDisabled={!validation?.valid}
            isLoading={confirming}
          >
            <Icon icon={CheckCircleIcon} size="sm" />
            Confirm Pickup
          </Button>
        </Stack>
      </VStack>
    </CardWrapper>
  );
}

export default PickupConfirmation;
