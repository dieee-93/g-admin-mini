/**
 * OrderStatusBadge Component
 * Displays order status with color coding
 */

import React from 'react';
import { Badge } from '@/shared/ui';
import type { OrderStatus } from '../../types/supplierOrderTypes';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; colorPalette: string }> = {
  draft: {
    label: 'Borrador',
    colorPalette: 'gray'
  },
  pending: {
    label: 'Pendiente',
    colorPalette: 'yellow'
  },
  approved: {
    label: 'Aprobada',
    colorPalette: 'blue'
  },
  received: {
    label: 'Recibida',
    colorPalette: 'green'
  },
  cancelled: {
    label: 'Cancelada',
    colorPalette: 'red'
  }
};

export const OrderStatusBadge = React.memo(function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  
  return (
    <Badge colorPalette={config.colorPalette} variant="subtle">
      {config.label}
    </Badge>
  );
});

export default OrderStatusBadge;
