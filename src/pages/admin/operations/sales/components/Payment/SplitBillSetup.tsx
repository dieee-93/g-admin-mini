import { Text, HStack, VStack } from '@chakra-ui/react';
import { Button, InputField, CardWrapper } from '@/shared/ui';
import { SplitBillType } from '../../types';

interface SplitBillSetupProps {
  splitBillMode: SplitBillType | null;
  customerCount: number;
  splitAmounts: number[];
  onSetupSplitBill: (type: SplitBillType) => void;
  onCancelSplit: () => void;
  onUpdateSplitAmount: (index: number, amount: number) => void;
}

export function SplitBillSetup({
  splitBillMode,
  customerCount,
  splitAmounts,
  onSetupSplitBill,
  onCancelSplit,
  onUpdateSplitAmount,
}: SplitBillSetupProps) {
  // Show split bill options if not yet in split mode
  if (!splitBillMode) {
    return (
      <CardWrapper>
        <CardWrapper.Header>
          <Text fontWeight="bold">Split Bill ({customerCount} customers)</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <HStack gap="3">
            <Button
              variant="outline"
              onClick={() => onSetupSplitBill(SplitBillType.EVEN)}
            >
              Split Evenly
            </Button>
            <Button
              variant="outline"
              onClick={() => onSetupSplitBill(SplitBillType.CUSTOM)}
            >
              Custom Split
            </Button>
          </HStack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  // Show split bill configuration
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack justify="space-between">
          <Text fontWeight="bold">
            {splitBillMode === SplitBillType.EVEN ? 'Even Split' : 'Custom Split'}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelSplit}
          >
            Cancel Split
          </Button>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <VStack gap="3" align="stretch">
          {splitAmounts.map((amount, index) => (
            <HStack key={index} gap="3">
              <Text flex="1">Customer {index + 1}:</Text>
              <InputField
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => onUpdateSplitAmount(index, parseFloat(e.target.value) || 0)}
                width="120px"
                disabled={splitBillMode === SplitBillType.EVEN}
              />
              <Text>${amount.toFixed(2)}</Text>
            </HStack>
          ))}
          <Text fontSize="sm" color="gray.600">
            Total split: ${splitAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)}
          </Text>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
