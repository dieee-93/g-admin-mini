import { Input, Field } from '@chakra-ui/react'
import type { ChangeEvent, ReactNode } from 'react'
import type { InputProps as ChakraInputProps } from '@chakra-ui/react'
import { Typography } from './Typography' // Usar nuestro Typography wrapper

interface InputFieldProps extends Omit<ChakraInputProps, 'size' | 'variant'> {
  label?: string
  placeholder?: string
  value?: string | number
  defaultValue?: string | number
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  error?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'flushed' | 'subtle'
  startElement?: ReactNode
  endElement?: ReactNode
  colorScheme?: 'theme' | 'default' // 🆕 Added theme support
}

export function InputField({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  type = 'text',
  error,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'outline',
  startElement,
  endElement,
  colorScheme = 'default',
  ...inputProps // ✅ Spread todas las demás props de Chakra Input
}: InputFieldProps) {
  // ✅ Recipes handle all theming automatically - no manual props needed
  
  return (
    <Field.Root invalid={!!error}>
      {label && (
        <Field.Label fontSize="sm" fontWeight="medium">
          {label}
          {required && <Typography as="span" style={{ marginLeft: '4px', color: 'var(--chakra-colors-error-500)' }}>*</Typography>}
        </Field.Label>
      )}
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        size={size}
        variant={variant}
        disabled={disabled}
        {...inputProps} // ✅ Spread props adicionales como borderColor, focusBorderColor, etc.
      />
      {error && (
        <Field.ErrorText fontSize="sm">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}