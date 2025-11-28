import { useState, useCallback } from 'react';
import {
  Box,
  Stack,
  Text,
  Spinner,
  Flex
} from '@/shared/ui';
import { InputField } from '@/shared/ui';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ValidatedFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidate?: (field: string, value: string) => void;
  field: string;
  error?: string;
  warning?: string;
  isValidating?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const ValidatedField = ({
  label,
  value,
  onChange,
  onValidate,
  field,
  error,
  warning,
  isValidating = false,
  placeholder,
  required = false,
  disabled = false
}: ValidatedFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (onValidate) {
      onValidate(field, newValue);
    }
  }, [onChange, onValidate, field]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <Spinner size="xs" color="blue.500" />;
    }
    if (error) {
      return <ExclamationTriangleIcon style={{ width: '16px', height: '16px', color: 'var(--colors-red-500)' }} />;
    }
    if (warning) {
      return <ExclamationTriangleIcon style={{ width: '16px', height: '16px', color: 'var(--colors-orange-500)' }} />;
    }
    if (value && !error && !warning) {
      return <CheckCircleIcon style={{ width: '16px', height: '16px', color: 'var(--colors-green-500)' }} />;
    }
    return null;
  };

  const getBorderColor = () => {
    if (error) return 'red.500';
    if (warning) return 'orange.500';
    if (isFocused) return 'blue.500';
    return 'border';
  };

  return (
    <Stack gap="2">
      <Text fontSize="sm" fontWeight="medium">
        {label}
        {required && <Text as="span" color="red.500" ml="1">*</Text>}
      </Text>

      <Box position="relative">
        <InputField
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          height="44px"
          fontSize="md"
          px="3"
          pr="10"
          borderRadius="md"
          borderColor={getBorderColor()}
          _hover={{
            borderColor: error ? 'red.600' : warning ? 'orange.600' : 'blue.300'
          }}
          _focus={{
            borderColor: error ? 'red.500' : warning ? 'orange.500' : 'blue.500',
            boxShadow: `0 0 0 1px ${error ? 'var(--colors-red-500)' : warning ? 'var(--colors-orange-500)' : 'var(--colors-blue-500)'}`
          }}
        />

        {/* Validation Icon */}
        <Flex
          position="absolute"
          right="3"
          top="50%"
          transform="translateY(-50%)"
          align="center"
          justify="center"
          pointerEvents="none"
        >
          {getValidationIcon()}
        </Flex>
      </Box>

      {/* Error Message */}
      {error && (
        <Text color="red.500" fontSize="sm" mt="1">
          {error}
        </Text>
      )}

      {/* Warning Message */}
      {warning && !error && (
        <Text color="orange.500" fontSize="sm" mt="1">
          {warning}
        </Text>
      )}
    </Stack>
  );
};