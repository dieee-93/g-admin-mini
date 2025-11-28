import { Textarea, Field } from '@chakra-ui/react'
import type { ChangeEvent, ReactNode } from 'react'
import type { TextareaProps as ChakraTextareaProps } from '@chakra-ui/react'
import { Typography } from './Typography' // Usar nuestro Typography wrapper

interface TextareaFieldProps extends Omit<ChakraTextareaProps, 'size' | 'variant'> {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'flushed' | 'subtle'
  rows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  colorPalette?: 'theme' | 'default' // Added theme support
}

export function TextareaField({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'outline',
  rows = 4,
  resize = 'vertical',
  colorPalette = 'default',
  ...textareaProps // Spread todas las demás props de Chakra Textarea
}: TextareaFieldProps) {
  // Recipes handle all theming automatically - no manual props needed

  return (
    <Field.Root invalid={!!error}>
      {label && (
        <Field.Label fontSize="sm" fontWeight="medium">
          {label}
          {required && <Typography as="span" style={{ marginLeft: '4px', color: 'var(--chakra-colors-error-500)' }}>*</Typography>}
        </Field.Label>
      )}
      <Textarea
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        size={size}
        variant={variant}
        disabled={disabled}
        rows={rows}
        resize={resize}
        {...textareaProps} // Spread props adicionales
      />
      {helperText && !error && (
        <Field.HelperText fontSize="sm">
          {helperText}
        </Field.HelperText>
      )}
      {error && (
        <Field.ErrorText fontSize="sm">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

// Re-export Textarea directly for cases where field wrapper is not needed
export { Textarea } from '@chakra-ui/react'
