// src/components/forms/FormNumberInput.tsx
// Reusable form number input component with validation

import React from 'react';
import { NumberInput, VStack, Text } from '@chakra-ui/react';

interface FormNumberInputProps {
  label?: string;
  name: string;
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helper?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

export default function FormNumberInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  helper,
  min,
  max,
  step = 1,
  precision,
  formatOptions
}: FormNumberInputProps) {
  return (
    <VStack align="stretch" gap={1}>
      {label && (
        <Text fontSize="sm" fontWeight="medium">
          {label}
          {required && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
      )}
      
      <NumberInput.Root
        value={value?.toString()}
        onValueChange={(details) => onChange(parseFloat(details.value))}
        min={min}
        max={max}
        step={step}
        precision={precision}
        formatOptions={formatOptions}
        disabled={disabled}
        variant={error ? 'invalid' : 'outline'}
      >
        <NumberInput.Input placeholder={placeholder} />
        <NumberInput.Control>
          <NumberInput.IncrementTrigger />
          <NumberInput.DecrementTrigger />
        </NumberInput.Control>
      </NumberInput.Root>

      {error && (
        <Text fontSize="xs" color="red.500">
          {error}
        </Text>
      )}

      {helper && !error && (
        <Text fontSize="xs" color="gray.500">
          {helper}
        </Text>
      )}
    </VStack>
  );
}

export { FormNumberInput };