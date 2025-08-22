import { Input, Field } from '@chakra-ui/react'
import { ChangeEvent, ReactNode } from 'react'

interface InputFieldProps {
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
  variant?: 'outline' | 'filled' | 'flushed'
  startElement?: ReactNode
  endElement?: ReactNode
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
}: InputFieldProps) {
  return (
    <Field.Root invalid={!!error}>
      {label && (
        <Field.Label fontSize="sm" fontWeight="medium">
          {label}
          {required && <span style={{ color: 'var(--colors-red-500)', marginLeft: '4px' }}>*</span>}
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
        startElement={startElement}
        endElement={endElement}
      />
      {error && (
        <Field.ErrorText fontSize="sm">
          {error}
        </Field.ErrorText>
      )}
    </Field.Root>
  )
}