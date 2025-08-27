import { NumberInput, Field } from '@chakra-ui/react'

interface NumberFieldProps {
  label?: string
  placeholder?: string
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  precision?: number
  error?: string
  required?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'flushed' | 'subtle'
  colorScheme?: 'theme' | 'default' // 🆕 Added theme support
}

export function NumberField({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  precision = 0,
  error,
  required = false,
  disabled = false,
  size = 'md',
  variant = 'outline',
  colorScheme = 'default',
}: NumberFieldProps) {
  // ✅ Recipes handle all theming automatically - no manual logic needed

  return (
    <Field.Root invalid={!!error} required={required} disabled={disabled}>
      {label && (
        <Field.Label {...themeLabelProps}>
          {label}
          <Field.RequiredIndicator />
        </Field.Label>
      )}
      <NumberInput.Root
        value={value?.toString()}
        defaultValue={defaultValue?.toString()}
        onValueChange={(details) => onChange?.(details.valueAsNumber)}
        min={min}
        max={max}
        step={step}
        formatOptions={{ maximumFractionDigits: precision }}
        size={size}
        variant={variant}
        disabled={disabled}
        {...themeProps}
      >
        <NumberInput.Input placeholder={placeholder} />
        <NumberInput.Control>
          <NumberInput.IncrementTrigger />
          <NumberInput.DecrementTrigger />
        </NumberInput.Control>
      </NumberInput.Root>
      {error && <Field.ErrorText {...themeLabelProps}>{error}</Field.ErrorText>}
    </Field.Root>
  )
}