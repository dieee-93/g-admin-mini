import { VStack, Alert, Progress } from '@chakra-ui/react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface PaymentProcessingStatusProps {
  isProcessing: boolean;
  processingStep: string;
}

export function PaymentProcessingStatus({
  isProcessing,
  processingStep,
}: PaymentProcessingStatusProps) {
  if (!isProcessing) {
    return null;
  }

  return (
    <Alert.Root status="info">
      <Alert.Indicator>
        <ClockIcon className="w-4 h-4" />
      </Alert.Indicator>
      <VStack align="start" flex="1" gap="2">
        <Alert.Title>Processing Payment...</Alert.Title>
        <Alert.Description>{processingStep}</Alert.Description>
        <Progress.Root value={33} size="sm" w="full">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </VStack>
    </Alert.Root>
  );
}
