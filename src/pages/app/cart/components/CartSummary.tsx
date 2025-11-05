import { Stack, Text, Button } from '@/shared/ui';

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  isCheckingOut?: boolean;
  itemCount: number;
}

export function CartSummary({
  subtotal,
  tax,
  total,
  onCheckout,
  isCheckingOut,
  itemCount,
}: CartSummaryProps) {
  return (
    <Stack
      gap="4"
      p="6"
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      bg="white"
      position="sticky"
      top="4"
    >
      <Text fontSize="xl" fontWeight="bold">
        Order Summary
      </Text>

      <Stack gap="3">
        <Stack direction="row" justify="space-between">
          <Text color="gray.600">Items ({itemCount})</Text>
          <Text fontWeight="medium">${subtotal.toFixed(2)}</Text>
        </Stack>

        <Stack direction="row" justify="space-between">
          <Text color="gray.600">Tax</Text>
          <Text fontWeight="medium">${tax.toFixed(2)}</Text>
        </Stack>

        <Stack
          pt="3"
          borderTopWidth="1px"
          borderColor="gray.200"
          direction="row"
          justify="space-between"
        >
          <Text fontSize="lg" fontWeight="bold">
            Total
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            ${total.toFixed(2)}
          </Text>
        </Stack>
      </Stack>

      <Button
        colorPalette="blue"
        size="lg"
        w="full"
        onClick={onCheckout}
        loading={isCheckingOut}
        disabled={itemCount === 0}
      >
        Proceed to Checkout
      </Button>

      <Text fontSize="xs" color="gray.500" textAlign="center">
        Tax calculated at checkout
      </Text>
    </Stack>
  );
}
