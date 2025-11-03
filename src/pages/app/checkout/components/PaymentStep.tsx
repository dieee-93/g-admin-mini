import { Stack, Text, Button, RadioGroup, Alert } from '@/shared/ui';

interface PaymentStepProps {
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onNext: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Cash on Delivery',
    description: 'Pay with cash when your order arrives',
    icon: '💵',
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Payment gateway integration coming soon',
    icon: '💳',
    disabled: true,
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    description: 'Payment gateway integration coming soon',
    icon: '🔵',
    disabled: true,
  },
];

export function PaymentStep({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onNext,
  onBack,
  isProcessing,
}: PaymentStepProps) {
  return (
    <Stack gap="6">
      <Stack gap="2">
        <Text fontSize="xl" fontWeight="bold">
          Select Payment Method
        </Text>
        <Text color="gray.600">
          Choose how you'd like to pay for your order
        </Text>
      </Stack>

      <Alert.Root status="info">
        <Alert.Icon />
        <Stack gap="1">
          <Alert.Title>Week 4 - Limited Payment Options</Alert.Title>
          <Alert.Description>
            Full payment gateway integration (MercadoPago, Stripe) will be added in Week 5.
            For now, only Cash on Delivery is available.
          </Alert.Description>
        </Stack>
      </Alert.Root>

      <RadioGroup.Root
        value={selectedPaymentMethod || ''}
        onValueChange={(e) => onPaymentMethodSelect(e.value)}
      >
        <Stack gap="3">
          {PAYMENT_METHODS.map((method) => (
            <RadioGroup.Item
              key={method.id}
              value={method.id}
              p="4"
              borderWidth="1px"
              borderRadius="md"
              cursor={method.disabled ? 'not-allowed' : 'pointer'}
              opacity={method.disabled ? 0.5 : 1}
              _hover={method.disabled ? {} : { borderColor: 'blue.500' }}
              disabled={method.disabled}
            >
              <Stack direction="row" gap="3" align="flex-start">
                <RadioGroup.ItemControl />
                <Stack direction="row" gap="3" flex="1" align="center">
                  <Text fontSize="2xl">{method.icon}</Text>
                  <Stack gap="1" flex="1">
                    <RadioGroup.ItemText fontWeight="medium">
                      {method.name}
                    </RadioGroup.ItemText>
                    <Text fontSize="sm" color="gray.600">
                      {method.description}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </RadioGroup.Item>
          ))}
        </Stack>
      </RadioGroup.Root>

      <Stack direction="row" gap="4">
        <Button
          variant="outline"
          onClick={onBack}
          flex="1"
          disabled={isProcessing}
        >
          Back to Review
        </Button>
        <Button
          colorPalette="blue"
          onClick={onNext}
          flex="1"
          disabled={!selectedPaymentMethod || isProcessing}
          loading={isProcessing}
        >
          Place Order
        </Button>
      </Stack>
    </Stack>
  );
}
