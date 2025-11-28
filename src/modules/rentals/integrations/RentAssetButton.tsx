/**
 * RENT ASSET BUTTON
 * Button injected into Assets table row actions
 * Demonstrates cross-module UI injection pattern
 */

import { IconButton } from '@/shared/ui';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { toaster } from '@/shared/ui/toaster';
import type { Asset } from '@/pages/admin/supply-chain/assets/types';

interface RentAssetButtonProps {
  asset: Asset;
}

export function RentAssetButton({ asset }: RentAssetButtonProps) {
  // Only show button for rentable assets that are available
  if (!asset.is_rentable || asset.currently_rented || asset.status !== 'available') {
    return null;
  }

  const handleRent = () => {
    // TODO: Open rental creation modal
    toaster.create({
      title: 'Rent Asset',
      description: `Opening rental form for ${asset.name}`,
      type: 'info',
    });
  };

  return (
    <IconButton
      size="xs"
      variant="ghost"
      colorPalette="purple"
      onClick={handleRent}
      aria-label="Alquilar"
    >
      <ShoppingBagIcon style={{ width: '1rem', height: '1rem' }} />
    </IconButton>
  );
}
