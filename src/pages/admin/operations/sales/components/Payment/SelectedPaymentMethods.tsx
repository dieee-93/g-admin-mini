import { Text, HStack, VStack, Badge } from '@chakra-ui/react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { Button, CardWrapper } from '@/shared/ui';
import { PaymentType } from '../../types';

interface PaymentMethod {
  type: PaymentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  processingTime: number;
  isContactless: boolean;
  description: string;
}

interface PaymentSelection {
  type: PaymentType;
  amount: number;
  tipAmount: number;
  isContactless: boolean;
}

interface SelectedPaymentMethodsProps {
  selectedPayments: PaymentSelection[];
  paymentMethods: PaymentMethod[];
  onRemove: (index: number) => void;
}

export function SelectedPaymentMethods({
  selectedPayments,
  paymentMethods,
  onRemove,
}: SelectedPaymentMethodsProps) {
  if (selectedPayments.length === 0) {
    return null;
  }

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">Selected Payment Methods</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <VStack gap="3" align="stretch">
          {selectedPayments.map((payment, index) => {
            const method = paymentMethods.find(m => m.type === payment.type);
            const Icon = method?.icon || CreditCardIcon;

            return (
              <HStack key={index} gap="3" p="3" bg="gray.50" borderRadius="md">
                <Icon className="w-5 h-5" />
                <VStack align="start" flex="1" gap="1">
                  <Text fontWeight="medium">{method?.label}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Amount: ${payment.amount.toFixed(2)}
                    {payment.tipAmount > 0 && ` + $${payment.tipAmount.toFixed(2)} tip`}
                  </Text>
                </VStack>
                {payment.isContactless && (
                  <Badge colorPalette="green" size="sm">Contactless</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  colorPalette="red"
                  onClick={() => onRemove(index)}
                >
                  Remove
                </Button>
              </HStack>
            );
          })}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
