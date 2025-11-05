// ================================================================
// TRANSFER STATUS BADGE COMPONENT
// ================================================================
// Purpose: Visual badge for inventory transfer status
// Pattern: Status badge with icon + color from config
// ================================================================

import { Badge } from '@/shared/ui';
import { TRANSFER_STATUS_CONFIG, type TransferStatus } from '../types/inventoryTransferTypes';

interface TransferStatusBadgeProps {
  status: TransferStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function TransferStatusBadge({ status, size = 'sm' }: TransferStatusBadgeProps) {
  const config = TRANSFER_STATUS_CONFIG[status];

  return (
    <Badge
      variant="solid"
      colorPalette={config.colorPalette}
      size={size}
    >
      {config.icon} {config.label}
    </Badge>
  );
}
