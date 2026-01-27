import {
  Dialog,
  Stack,
  Typography,
  Icon,
  Badge,
} from '@/shared/ui';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface SaleFormHeaderProps {
  productType?: string | null;
  selectedFulfillment?: string | null;
  cartStatusBadge?: React.ReactNode;
}

export function SaleFormHeader({ 
  productType, 
  selectedFulfillment, 
  cartStatusBadge 
}: SaleFormHeaderProps) {
  return (
    <Dialog.Header>
      <Stack direction="column" gap="sm" width="full">
        {/* Row 1: Title + Status */}
        <Stack direction="row" justify="space-between" align="center" width="full">
          <Stack direction="row" gap="md" align="center">
            <Icon icon={ShoppingCartIcon} size="lg" />
            <Typography variant="heading" size="lg">
              Nueva Venta
            </Typography>
          </Stack>
          {cartStatusBadge}
        </Stack>

        {/* ProductType now selected in body - header shows current state */}
        <Stack direction="row" gap="2" align="center">
          {productType && (
            <Badge colorPalette="blue" variant="subtle">
              {productType === 'PHYSICAL' ? 'Productos' : productType === 'SERVICE' ? 'Servicios' : productType === 'DIGITAL' ? 'Digital' : 'Alquiler'}
            </Badge>
          )}
          {selectedFulfillment && productType === 'PHYSICAL' && (
            <Badge colorPalette="teal" variant="subtle">
              {selectedFulfillment === 'onsite' ? 'Mesa' : selectedFulfillment === 'pickup' ? 'TakeAway' : 'Delivery'}
            </Badge>
          )}
        </Stack>
      </Stack>
    </Dialog.Header>
  );
}
