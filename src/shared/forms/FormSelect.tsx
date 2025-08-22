// src/components/forms/FormSelect.tsx
// Reusable form select component with validation

import React from 'react';
import { Select, VStack, Text, createListCollection, Portal } from '@chakra-ui/react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helper?: string;
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  error,
  disabled = false,
  helper
}: FormSelectProps) {
  const collection = createListCollection({ items: options });

  return (
    <VStack align="stretch" gap={1}>
      {label && (
        <Text fontSize="sm" fontWeight="medium">
          {label}
          {required && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
      )}
      
      <Select.Root
        collection={collection}
        value={[value]}
        onValueChange={(details) => onChange(details.value[0])}
        disabled={disabled}
        variant={error ? 'invalid' : 'outline'}
      >
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.Content>
          {collection.items.map((option) => (
            <Select.Item key={option.value} item={option}>
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator>✓</Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

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

export { FormSelect };
export type { SelectOption };