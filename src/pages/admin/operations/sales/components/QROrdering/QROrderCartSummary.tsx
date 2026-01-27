import { Box, VStack, HStack, Text, Button } from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface OrderSummary {
  subtotal: number;
  estimated_prep_time: number;
  total_items: number;
}

interface QROrderCartSummaryProps {
  cartLength: number;
  orderSummary: OrderSummary;
  customerName: string;
  submitting: boolean;
  onSubmit: () => void;
}

export function QROrderCartSummary({
  cartLength,
  orderSummary,
  customerName,
  submitting,
  onSubmit,
}: QROrderCartSummaryProps) {
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      shadow="lg"
      p="4"
      borderTop="1px solid"
      borderColor="border.default"
    >
      <VStack gap="3">
        <HStack justify="space-between" w="full">
          <VStack align="start" gap="0">
            <Text fontSize="sm" color="gray.600">
              {orderSummary.total_items} items
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              ${orderSummary.subtotal.toFixed(2)}
            </Text>
          </VStack>

          <VStack align="end" gap="0">
            <Text fontSize="sm" color="gray.600">
              Est. {Math.ceil(orderSummary.estimated_prep_time)} min
            </Text>
            <HStack>
              <Icon icon={ShoppingCartIcon} size="sm" />
              <Text fontSize="sm" fontWeight="medium">
                {cartLength} different items
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <Button
          colorPalette="green"
          size="lg"
          fullWidth
          onClick={onSubmit}
          loading={submitting}
          disabled={!customerName.trim()}
        >
          {submitting ? 'Submitting Order...' : 'Place Order'}
        </Button>
      </VStack>
    </Box>
  );
}
