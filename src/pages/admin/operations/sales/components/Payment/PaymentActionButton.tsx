import { VStack, Alert, Button } from '@/shared/ui';

interface PaymentActionButtonProps {
  finalTotal: number;
  remainingAmount: number;
  selectedPaymentsCount: number;
  isProcessing: boolean;
  onProcessPayment: () => void;
}

export function PaymentActionButton({
  finalTotal,
  remainingAmount,
  selectedPaymentsCount,
  isProcessing,
  onProcessPayment,
}: PaymentActionButtonProps) {
  const isDisabled = remainingAmount > 0.01 || selectedPaymentsCount === 0 || isProcessing;

  return (
    <VStack gap="4" align="stretch">
      <Button
        colorPalette="green"
        size="lg"
        onClick={onProcessPayment}
        disabled={isDisabled}
        loading={isProcessing}
        fullWidth
      >
        <CheckCircleIcon className="w-5 h-5" />
        {isProcessing ? 'Processing...' : `Process Payment $${finalTotal.toFixed(2)}`}
      </Button>

      {remainingAmount > 0.01 && selectedPaymentsCount > 0 && (
        <Alert.Root status="warning">
          <Alert.Indicator>
            <ExclamationTriangleIcon className="w-4 h-4" />
          </Alert.Indicator>
          <Alert.Title>Incomplete Payment</Alert.Title>
          <Alert.Description>
            Please add payment methods to cover the remaining ${remainingAmount.toFixed(2)}
          </Alert.Description>
        </Alert.Root>
      )}
    </VStack>
  );
}
