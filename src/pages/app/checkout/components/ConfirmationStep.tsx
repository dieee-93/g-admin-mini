import { Stack, Text, Button, Alert } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';

interface ConfirmationStepProps {
  orderId: string;
}

export function ConfirmationStep({ orderId }: ConfirmationStepProps) {
  const navigate = useNavigate();

  const handleViewOrders = () => {
    // Navigate to customer orders page (Week 5)
    navigate('/app/orders');
  };

  const handleContinueShopping = () => {
    navigate('/app/catalog');
  };

  return (
    <Stack gap="6" align="center" textAlign="center" py="8">
      {/* Success Icon */}
      <Text fontSize="6xl">✅</Text>

      {/* Success Message */}
      <Stack gap="2">
        <Text fontSize="2xl" fontWeight="bold" color="green.600">
          Order Placed Successfully!
        </Text>
        <Text color="gray.600">
          Thank you for your purchase. Your order has been confirmed.
        </Text>
      </Stack>

      {/* Order Details */}
      <Alert.Root status="success" maxW="md">
        <Alert.Icon />
        <Stack gap="2">
          <Alert.Title>Order #{orderId.slice(0, 8).toUpperCase()}</Alert.Title>
          <Alert.Description>
            You will receive a confirmation email shortly with your order details
            and tracking information.
          </Alert.Description>
        </Stack>
      </Alert.Root>

      {/* What's Next */}
      <Stack gap="3" maxW="md" w="full">
        <Text fontWeight="bold">What's next?</Text>
        <Stack gap="2" textAlign="left" fontSize="sm" color="gray.600">
          <Text>• We'll prepare your order for delivery</Text>
          <Text>• You'll receive updates via email</Text>
          <Text>• Track your order status in your account</Text>
        </Stack>
      </Stack>

      {/* Action Buttons */}
      <Stack direction="row" gap="4" w="full" maxW="md">
        <Button
          variant="outline"
          onClick={handleViewOrders}
          flex="1"
        >
          View My Orders
        </Button>
        <Button
          colorPalette="blue"
          onClick={handleContinueShopping}
          flex="1"
        >
          Continue Shopping
        </Button>
      </Stack>
    </Stack>
  );
}
