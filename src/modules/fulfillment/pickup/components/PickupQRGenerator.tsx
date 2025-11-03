/**
 * PICKUP QR GENERATOR
 *
 * Generates and displays QR code for pickup orders.
 *
 * @version 1.0.0
 */

import React from 'react';
import { Stack, VStack, Button, Typography, CardWrapper, Badge } from '@/shared/ui';
import { QrCodeIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { pickupService } from '../services/pickupService';
import type { PickupQRCode } from '../types';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

export interface PickupQRGeneratorProps {
  orderId: string;
  pickupCode?: string;
  onGenerated?: (qrCode: PickupQRCode) => void;
  showActions?: boolean;
}

export function PickupQRGenerator({
  orderId,
  pickupCode,
  onGenerated,
  showActions = true
}: PickupQRGeneratorProps) {
  const [qrCode, setQrCode] = React.useState<PickupQRCode | null>(null);
  const [loading, setLoading] = React.useState(false);

  const generateQR = React.useCallback(async () => {
    try {
      setLoading(true);
      const qr = await pickupService.generatePickupQR(orderId, pickupCode);
      setQrCode(qr);
      onGenerated?.(qr);
    } catch (error) {
      logger.error('QRGenerator', 'Error generating QR', error);
      notify.error({ title: 'Error generating QR code' });
    } finally {
      setLoading(false);
    }
  }, [orderId, pickupCode, onGenerated]);

  React.useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleSendEmail = () => {
    // TODO: Integrate with email service
    notify.info({ title: 'Email feature coming soon' });
  };

  const handleSendSMS = () => {
    // TODO: Integrate with SMS service
    notify.info({ title: 'SMS feature coming soon' });
  };

  if (loading) {
    return <Typography>Generating QR code...</Typography>;
  }

  if (!qrCode) {
    return <Typography>Unable to generate QR code</Typography>;
  }

  return (
    <CardWrapper>
      <VStack align="center" gap="md" p="4">
        <Typography fontSize="xl" fontWeight="bold">
          Pickup QR Code
        </Typography>

        {/* QR Code Display */}
        <Stack
          w="200px"
          h="200px"
          bg="gray.100"
          borderRadius="md"
          align="center"
          justify="center"
        >
          <Icon icon={QrCodeIcon} size="2xl" />
          <Typography fontSize="xs" color="text.muted">
            QR Code Here
          </Typography>
        </Stack>

        {/* Pickup Code */}
        <Badge colorPalette="green" size="lg" px="6" py="3">
          <Typography fontSize="2xl" fontWeight="bold">
            {qrCode.pickupCode}
          </Typography>
        </Badge>

        <Typography fontSize="sm" color="text.muted" textAlign="center">
          Show this code or QR code to staff when picking up your order
        </Typography>

        {/* Actions */}
        {showActions && (
          <Stack direction="row" gap="sm" w="full">
            <Button
              flex="1"
              size="sm"
              variant="outline"
              onClick={handleSendEmail}
            >
              <Icon icon={EnvelopeIcon} size="sm" />
              Email
            </Button>
            <Button
              flex="1"
              size="sm"
              variant="outline"
              onClick={handleSendSMS}
            >
              <Icon icon={DevicePhoneMobileIcon} size="sm" />
              SMS
            </Button>
          </Stack>
        )}

        <Typography fontSize="xs" color="text.muted">
          Order ID: {orderId.slice(0, 8)}
        </Typography>
      </VStack>
    </CardWrapper>
  );
}

export default PickupQRGenerator;
