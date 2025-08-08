// src/components/forms/FormInput.tsx
// Reusable form input component with validation

import React from 'react';
import { Input, VStack, Text, Box } from '@chakra-ui/react';

interface FormInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helper?: string;
}

export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  disabled = false,
  helper
}: FormInputProps) {
  return (
    <VStack align="stretch" gap={1}>
      {label && (
        <Text fontSize="sm" fontWeight="medium">
          {label}
          {required && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
      )}
      
      <Input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        variant={error ? 'invalid' : 'outline'}
        borderColor={error ? 'red.300' : undefined}
        focusBorderColor={error ? 'red.500' : 'blue.500'}
      />

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

export { FormInput };