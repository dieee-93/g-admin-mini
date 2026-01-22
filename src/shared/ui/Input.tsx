import { Input as ChakraInput, Field, InputGroup } from '@chakra-ui/react'
import type { ChangeEvent, ReactNode } from 'react'
import { forwardRef, memo } from 'react';
import type { InputProps as ChakraInputProps } from '@chakra-ui/react'
import { Typography } from './Typography' // Usar nuestro Typography wrapper

/**
 * Input wrapper con soporte automático de InputGroup de Chakra UI
 *
 * @example
 * // Input básico
 * <Input placeholder="Email" />
 *
 * @example
 * // Con label y validación
 * <Input
 *   label="Email"
 *   required
 *   error="Email es requerido"
 * />
 *
 * @example
 * // Con íconos dentro del input (usa InputGroup automáticamente)
 * <Input
 *   placeholder="Email"
 *   startElement={<LuMail />}
 * />
 *
 * @example
 * // Con addons fuera del input (usa InputGroup automáticamente)
 * <Input
 *   placeholder="yoursite"
 *   startAddon="https://"
 *   endAddon=".com"
 * />
 *
 * @example
 * // Con elementos de inicio y fin (usa InputGroup automáticamente)
 * <Input
 *   placeholder="0.00"
 *   startElement="$"
 *   endElement="USD"
 * />
 *
 * @example
 * // Con botón de limpiar
 * <Input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   endElement={value && <CloseButton onClick={() => setValue("")} />}
 * />
 */
interface InputProps extends Omit<ChakraInputProps, 'size' | 'variant'> {
  label?: string
  placeholder?: string
  value?: string | number
  defaultValue?: string | number
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'date'
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'flushed' | 'subtle'
  /** Elemento a renderizar dentro del input al inicio (izquierda) */
  startElement?: ReactNode
  /** Elemento a renderizar dentro del input al final (derecha) */
  endElement?: ReactNode
  /** Addon a renderizar fuera del input al inicio (izquierda) */
  startAddon?: ReactNode
  /** Addon a renderizar fuera del input al final (derecha) */
  endAddon?: ReactNode
}

export function Input({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  type = 'text',
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'outline',
  startElement,
  endElement,
  startAddon,
  endAddon,
  colorPalette = 'default',
  ...inputProps // ✅ Spread todas las demás props de Chakra Input
}: InputProps) {
  // ✅ Recipes handle all theming automatically - no manual props needed

  const hasInputGroup = startElement || endElement || startAddon || endAddon

  const inputElement = (
    <ChakraInput
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      size={size}
      variant={variant}
      disabled={disabled}
      bg="bg.surface"
      color="text.primary"
      borderColor="border.default"
      _placeholder={{ color: 'text.muted' }}
      {...inputProps} // ✅ Spread props adicionales como borderColor, focusBorderColor, etc.
    />
  )

  return (
    <Field.Root invalid={!!error}>
      {label && (
        <Field.Label fontSize="sm" fontWeight="medium" color="text.primary">
          {label}
          {required && <Typography as="span" ml="1" color="status.error">*</Typography>}
        </Field.Label>
      )}
      {hasInputGroup ? (
        <InputGroup
          startElement={startElement}
          endElement={endElement}
          startAddon={startAddon}
          endAddon={endAddon}
        >
          {inputElement}
        </InputGroup>
      ) : (
        inputElement
      )}
      {helperText && !error && (
        <Field.HelperText fontSize="sm" color="text.muted">
          {helperText}
        </Field.HelperText>
      )}
      {error && (
        <Field.ErrorText fontSize="sm" color="status.error">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}

// Backward compatibility alias
export const InputField = memo(forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, ...props }, ref) => {
  return (
    <Input
      label={label}
      error={error}
      helperText={helperText}
      ref={ref} // Pass the ref to the underlying Input component
      {...props}
    />
  );
}));
export type { InputProps };
