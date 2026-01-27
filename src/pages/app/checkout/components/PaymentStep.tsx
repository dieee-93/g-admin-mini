import { Stack, Text, Button, RadioGroup, Alert } from '@/shared/ui';
import { useActivePaymentMethods } from '@/modules/finance-integrations/hooks/usePayments';

interface PaymentStepProps {
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onNext: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

// Icon mapping for different payment method codes
const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: '💵',
  credit_card: '💳',
  debit_card: '💳',
  mercadopago: '🔵',
  bank_transfer: '🏦',
  qr_payment: '📱',
  digital_wallet: '💼',
};

export function PaymentStep({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onNext,
  onBack,
  isProcessing,
}: PaymentStepProps) {
  const { data: paymentMethods, isLoading, error } = useActivePaymentMethods();

  if (isLoading) {
    return (
      <Stack gap="6">
        <Text>Loading payment methods...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap="6">
        <Alert.Root status="error">
          <Alert.Icon />
          <Stack gap="1">
            <Alert.Title>Error Loading Payment Methods</Alert.Title>
            <Alert.Description>
              {error instanceof Error ? error.message : 'Failed to load payment methods'}
            </Alert.Description>
          </Stack>
        </Alert.Root>
        <Button onClick={onBack}>Back</Button>
      </Stack>
    );
  }

  const availableMethods = paymentMethods || [];

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

      {availableMethods.length === 0 && (
        <Alert.Root status="warning">
          <Alert.Icon />
          <Stack gap="1">
            <Alert.Title>No Payment Methods Available</Alert.Title>
            <Alert.Description>
              Please contact support to configure payment methods.
            </Alert.Description>
          </Stack>
        </Alert.Root>
      )}

      {availableMethods.length > 0 && (
        <RadioGroup.Root
          value={selectedPaymentMethod || ''}
          onValueChange={(e) => onPaymentMethodSelect(e.value)}
        >
          <Stack gap="3">
            {availableMethods.map((method) => {
              const icon = PAYMENT_METHOD_ICONS[method.code] || '💰';
              const isMercadoPago = method.gateway_id !== null && method.code.toLowerCase().includes('mercadopago');

              return (
                <RadioGroup.Item
                  key={method.id}
                  value={method.code}
                  p="4"
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ borderColor: 'blue.500' }}
                >
                  <Stack direction="row" gap="3" align="flex-start">
                    <RadioGroup.ItemControl />
                    <Stack direction="row" gap="3" flex="1" align="center">
                      <Text fontSize="2xl">{icon}</Text>
                      <Stack gap="1" flex="1">
                        <RadioGroup.ItemText fontWeight="medium">
                          {method.display_name}
                        </RadioGroup.ItemText>
                        <Text fontSize="sm" color="gray.600">
                          {method.description ||
                            (isMercadoPago
                              ? 'Pay securely with Mercado Pago'
                              : `Pay with ${method.display_name.toLowerCase()}`
                            )
                          }
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                </RadioGroup.Item>
              );
            })}
          </Stack>
        </RadioGroup.Root>
      )}

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
          disabled={!selectedPaymentMethod || isProcessing || availableMethods.length === 0}
          loading={isProcessing}
        >
          {selectedPaymentMethod?.toLowerCase().includes('mercadopago')
            ? 'Continue to Mercado Pago'
            : 'Place Order'
          }
        </Button>
      </Stack>
    </Stack>
  );
}
