import { memo } from 'react';
import { Text, HStack, VStack, Separator, CardWrapper } from '@/shared/ui';

interface PaymentSummaryProps {
  subtotal: number;
  taxes: number;
  tipAmount: number;
  tipPercentage: number;
  finalTotal: number;
  remainingAmount: number;
}

export const PaymentSummary = memo(function PaymentSummary({
  subtotal,
  taxes,
  tipAmount,
  tipPercentage,
  finalTotal,
  remainingAmount,
}: PaymentSummaryProps) {
  return (
    <CardWrapper p="4" bg="gray.50">
      <VStack gap="3" align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="medium">Subtotal:</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontWeight="medium">Tax:</Text>
          <Text>${taxes.toFixed(2)}</Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontWeight="medium" color={tipAmount > 0 ? "green.600" : "gray.600"}>
            Tip ({tipPercentage}%):
          </Text>
          <Text color={tipAmount > 0 ? "green.600" : "gray.600"}>
            ${tipAmount.toFixed(2)}
          </Text>
        </HStack>
        <Separator />
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">Total:</Text>
          <Text fontSize="lg" fontWeight="bold" color="green.600">
            ${finalTotal.toFixed(2)}
          </Text>
        </HStack>
        {remainingAmount > 0 && (
          <HStack justify="space-between">
            <Text fontWeight="medium" color="red.600">Remaining:</Text>
            <Text fontWeight="bold" color="red.600">
              ${remainingAmount.toFixed(2)}
            </Text>
          </HStack>
        )}
      </VStack>
    </CardWrapper>
  );
});
