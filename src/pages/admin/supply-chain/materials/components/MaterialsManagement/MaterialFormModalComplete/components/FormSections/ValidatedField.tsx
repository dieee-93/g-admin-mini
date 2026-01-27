// ✅ PERFORMANCE: React.memo (Phase 2 Round 2)
import { useState, useCallback, memo, useMemo } from 'react';
import { useDebounce } from '@/hooks';
import {
  Box,
  Stack,
  Text,
  Spinner,
  Flex
} from '@/shared/ui';
import { InputField } from '@/shared/ui';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// ⚡ PERFORMANCE: Hoist inline icon styles to module constants
const ERROR_ICON_STYLE = { width: '16px', height: '16px', color: 'var(--colors-red-500)' } as const;
const WARNING_ICON_STYLE = { width: '16px', height: '16px', color: 'var(--colors-orange-500)' } as const;
const SUCCESS_ICON_STYLE = { width: '16px', height: '16px', color: 'var(--colors-green-500)' } as const;

interface ValidatedFieldProps {
  label: React.ReactNode;
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
  validateOnChange?: boolean; // NEW: Control validation trigger
}

export const ValidatedField = memo<ValidatedFieldProps>(function ValidatedField({
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
  disabled = false,
  validateOnChange = false, // ⚡ DEFAULT: Only validate on blur for better performance
  "data-testid": dataTestId
}: ValidatedFieldProps & { "data-testid"?: string }) {
  const [isFocused, setIsFocused] = useState(false);

  // ⚡ PERFORMANCE: Debounce validation if validateOnChange is true
  const debouncedValidate = useDebounce((fieldName: string, fieldValue: string) => {
    if (onValidate) {
      onValidate(fieldName, fieldValue);
    }
  }, 300);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // ⚡ PERFORMANCE: Only validate on change if explicitly enabled
    if (validateOnChange && onValidate) {
      debouncedValidate(field, newValue);
    }
  }, [onChange, validateOnChange, onValidate, field, debouncedValidate]);

  // ⚡ PERFORMANCE: Validate on blur for better UX and performance
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    // Always validate on blur (best practice)
    if (onValidate && value) {
      onValidate(field, value);
    }
  }, [onValidate, field, value]);

  // ⚡ PERFORMANCE: Memoize validation icon to avoid recreating on every render
  const validationIcon = useMemo(() => {
    if (isValidating) {
      return <Spinner size="xs" color="blue.500" />;
    }
    if (error) {
      return <ExclamationTriangleIcon style={ERROR_ICON_STYLE} />;
    }
    if (warning) {
      return <ExclamationTriangleIcon style={WARNING_ICON_STYLE} />;
    }
    if (value && !error && !warning) {
      return <CheckCircleIcon style={SUCCESS_ICON_STYLE} />;
    }
    return null;
  }, [isValidating, error, warning, value]);

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
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          data-testid={dataTestId}
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
          {validationIcon}
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
});

ValidatedField.displayName = 'ValidatedField';;