import { memo } from 'react';
import { Text, HStack, VStack, Grid, Badge, Button, CardWrapper } from '@/shared/ui';
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

interface PaymentMethodSelectionProps {
  paymentMethods: PaymentMethod[];
  remainingAmount: number;
  isProcessing: boolean;
  onSelectMethod: (type: PaymentType) => void;
}

export const PaymentMethodSelection = memo(function PaymentMethodSelection({
  paymentMethods,
  remainingAmount,
  isProcessing,
  onSelectMethod,
}: PaymentMethodSelectionProps) {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">Payment Methods</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isDisabled = remainingAmount <= 0;

            return (
              <Button
                key={method.type}
                variant="outline"
                onClick={() => onSelectMethod(method.type)}
                disabled={isDisabled || isProcessing}
              >
                <VStack gap="2">
                  <HStack gap="2">
                    <Icon className="w-5 h-5" />
                    <Text fontWeight="medium">{method.label}</Text>
                    {method.isContactless && (
                      <Badge colorPalette="green" size="sm">NFC</Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    {method.description}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    ~{method.processingTime}s
                  </Text>
                </VStack>
              </Button>
            );
          })}
        </Grid>
      </CardWrapper.Body>
    </CardWrapper>
  );
});
