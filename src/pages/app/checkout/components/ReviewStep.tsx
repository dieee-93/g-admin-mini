import { Stack, Text, Button, Spinner } from '@/shared/ui';
import { useCart } from '@/modules/sales/ecommerce/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewStepProps {
  deliveryAddressId: string;
  onNext: () => void;
  onBack: () => void;
}

export function ReviewStep({ deliveryAddressId, onNext, onBack }: ReviewStepProps) {
  const { user } = useAuth();
  const { cart, loading } = useCart({
    customerId: user?.id,
    autoLoad: true,
  });

  if (loading || !cart) {
    return (
      <Stack py="10" align="center">
        <Spinner size="lg" colorPalette="blue" />
      </Stack>
    );
  }

  return (
    <Stack gap="6">
      <Stack gap="2">
        <Text fontSize="xl" fontWeight="bold">
          Review Your Order
        </Text>
        <Text color="gray.600">
          Please review your order details before proceeding to payment
        </Text>
      </Stack>

      {/* Order Items */}
      <Stack
        gap="4"
        p="4"
        borderWidth="1px"
        borderRadius="md"
        borderColor="gray.200"
      >
        <Text fontWeight="bold">Order Items ({cart.items.length})</Text>

        {cart.items.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            justify="space-between"
            align="center"
          >
            <Stack gap="1">
              <Text fontWeight="medium">{item.product_name}</Text>
              <Text fontSize="sm" color="gray.600">
                Qty: {item.quantity} × ${item.price.toFixed(2)}
              </Text>
            </Stack>
            <Text fontWeight="bold">
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </Stack>
        ))}
      </Stack>

      {/* Order Summary */}
      <Stack
        gap="3"
        p="4"
        borderWidth="1px"
        borderRadius="md"
        borderColor="gray.200"
        bg="gray.50"
      >
        <Text fontWeight="bold">Order Summary</Text>

        <Stack gap="2">
          <Stack direction="row" justify="space-between">
            <Text color="gray.600">Subtotal</Text>
            <Text fontWeight="medium">${cart.subtotal.toFixed(2)}</Text>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Text color="gray.600">Tax</Text>
            <Text fontWeight="medium">${cart.tax.toFixed(2)}</Text>
          </Stack>

          <Stack
            pt="2"
            borderTopWidth="1px"
            borderColor="gray.300"
            direction="row"
            justify="space-between"
          >
            <Text fontSize="lg" fontWeight="bold">
              Total
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              ${cart.total.toFixed(2)}
            </Text>
          </Stack>
        </Stack>
      </Stack>

      {/* Action Buttons */}
      <Stack direction="row" gap="4">
        <Button variant="outline" onClick={onBack} flex="1">
          Back to Delivery
        </Button>
        <Button colorPalette="blue" onClick={onNext} flex="1">
          Continue to Payment
        </Button>
      </Stack>
    </Stack>
  );
}
