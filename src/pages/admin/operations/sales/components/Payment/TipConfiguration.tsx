import { Box, Text, VStack, Select, createListCollection } from '@chakra-ui/react';
import { InputField, CardWrapper } from '@/shared/ui';

interface TipConfigurationProps {
  tipOptions: ReturnType<typeof createListCollection>;
  tipPercentage: number;
  customTipAmount: number;
  onTipPercentageChange: (percentage: number) => void;
  onCustomTipChange: (amount: number) => void;
}

export function TipConfiguration({
  tipOptions,
  tipPercentage,
  customTipAmount,
  onTipPercentageChange,
  onCustomTipChange,
}: TipConfigurationProps) {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">Tip Amount</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <VStack gap="4" align="stretch">
          <Select.Root
            collection={tipOptions}
            value={[customTipAmount > 0 ? 'custom' : tipPercentage.toString()]}
            onValueChange={(details) => {
              const value = details.value[0];
              if (value === 'custom') {
                // Keep current custom amount
              } else {
                const percentage = parseInt(value);
                onTipPercentageChange(percentage);
              }
            }}
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Select tip percentage" />
            </Select.Trigger>
            <Select.Content>
              {tipOptions.items.map((option) => (
                <Select.Item key={option.value} item={option}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          {(customTipAmount > 0 || tipOptions.items.find(item => item.value === 'custom')) && (
            <Box>
              <Text mb="2" fontSize="sm" fontWeight="medium">Custom Tip Amount</Text>
              <InputField
                type="number"
                min="0"
                step="0.01"
                value={customTipAmount}
                onChange={(e) => onCustomTipChange(parseFloat(e.target.value) || 0)}
                placeholder="Enter custom tip amount"
              />
            </Box>
          )}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
