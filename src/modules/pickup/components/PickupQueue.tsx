/**
 * PICKUP QUEUE COMPONENT
 *
 * Wrapper around FulfillmentQueue filtered for pickup orders.
 * Adds pickup-specific actions and display elements.
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

import React from 'react';
import { FulfillmentQueue } from '../fulfillment/components/FulfillmentQueue';
import type { FulfillmentQueueProps, QueueItem } from '../fulfillment/components/FulfillmentQueue';
import { Button, Icon } from '@/shared/ui';
import { QrCodeIcon, BellIcon } from '@heroicons/react/24/outline';
import { pickupService } from '../services/pickupService';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

// ============================================
// COMPONENT PROPS
// ============================================

export interface PickupQueueProps extends Omit<FulfillmentQueueProps, 'type'> {
  /**
   * Show QR code generation button
   */
  showQRButton?: boolean;

  /**
   * Show notify customer button
   */
  showNotifyButton?: boolean;

  /**
   * Callback when QR code button clicked
   */
  onGenerateQR?: (item: QueueItem) => void;

  /**
   * Callback when notify button clicked
   */
  onNotifyCustomer?: (item: QueueItem) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function PickupQueue({
  showQRButton = true,
  showNotifyButton = true,
  onGenerateQR,
  onNotifyCustomer,
  display = {},
  ...props
}: PickupQueueProps) {
  /**
   * Handle QR code generation
   */
  const handleGenerateQR = async (item: QueueItem) => {
    try {
      logger.debug('PickupQueue', 'Generating QR code', { orderId: item.order_id });

      const pickupCode = item.metadata?.pickup_code;

      if (!pickupCode) {
        notify.error({
          title: 'No pickup code',
          description: 'This order does not have a pickup code assigned'
        });
        return;
      }

      // Generate QR code
      const qrCodeDataUrl = await pickupService.generatePickupQR(item.order_id, pickupCode);

      logger.info('PickupQueue', 'QR code generated', { orderId: item.order_id });

      // Call callback if provided
      if (onGenerateQR) {
        onGenerateQR(item);
      } else {
        // Default: Download QR code as image
        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `pickup-qr-${item.order_id}.png`;
        link.click();

        notify.success({
          title: 'QR Code Downloaded',
          description: `Pickup code: ${pickupCode}`
        });
      }
    } catch (error) {
      logger.error('PickupQueue', 'Error generating QR code', error);
      notify.error({
        title: 'Error generating QR code',
        description: 'Please try again'
      });
    }
  };

  /**
   * Handle customer notification
   */
  const handleNotifyCustomer = async (item: QueueItem) => {
    try {
      logger.debug('PickupQueue', 'Notifying customer', { orderId: item.order_id });

      const pickupCode = item.metadata?.pickup_code;
      const customerPhone = item.order?.customer?.phone;

      if (!pickupCode) {
        notify.error({
          title: 'No pickup code',
          description: 'Cannot notify without pickup code'
        });
        return;
      }

      // Send notification
      await pickupService.notifyCustomerReady(
        item.order_id,
        pickupCode,
        customerPhone
      );

      // Call callback if provided
      if (onNotifyCustomer) {
        onNotifyCustomer(item);
      }
    } catch (error) {
      logger.error('PickupQueue', 'Error notifying customer', error);
      notify.error({
        title: 'Error sending notification',
        description: 'Please try again'
      });
    }
  };

  /**
   * Custom actions for pickup orders
   */
  const customActions = (item: QueueItem) => {
    return (
      <>
        {/* QR Code button (ready orders only) */}
        {showQRButton && item.status === 'ready' && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={(e) => {
              e.stopPropagation();
              handleGenerateQR(item);
            }}
          >
            <Icon icon={QrCodeIcon} size="sm" />
            QR Code
          </Button>
        )}

        {/* Notify button (ready orders only) */}
        {showNotifyButton && item.status === 'ready' && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="green"
            onClick={(e) => {
              e.stopPropagation();
              handleNotifyCustomer(item);
            }}
          >
            <Icon icon={BellIcon} size="sm" />
            Notify
          </Button>
        )}
      </>
    );
  };

  /**
   * Enhanced display config for pickup orders
   */
  const pickupDisplay = {
    showPriority: true,
    showAssignedUser: true,
    showCustomer: true,
    showOrderValue: true,
    showEstimatedTime: true,
    showLocation: false,
    ...display
  };

  return (
    <FulfillmentQueue
      type="pickup"
      customActions={customActions}
      display={pickupDisplay}
      {...props}
    />
  );
}

// ============================================
// EXPORTS
// ============================================

export default PickupQueue;
