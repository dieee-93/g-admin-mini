// src/components/forms/FormTextarea.tsx
// Reusable form textarea component with validation

import React from 'react';
import { Textarea, VStack, Text } from '@chakra-ui/react';

interface FormTextareaProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helper?: string;
  rows?: number;
  maxLength?: number;
}

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  helper,
  rows = 3,
  maxLength
}: FormTextareaProps) {
  return (
    <VStack align="stretch" gap={1}>
      {label && (
        <Text fontSize="sm" fontWeight="medium">
          {label}
          {required && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
      )}
      
      <Textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        variant={error ? 'invalid' : 'outline'}
        borderColor={error ? 'red.300' : undefined}
        focusBorderColor={error ? 'red.500' : 'blue.500'}
        resize="vertical"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
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
        </div>

        {maxLength && (
          <Text fontSize="xs" color="gray.500">
            {value.length}/{maxLength}
          </Text>
        )}
      </div>
    </VStack>
  );
}

export { FormTextarea };