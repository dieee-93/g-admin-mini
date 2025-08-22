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
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'filled' | 'flushed'
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
}: NumberFieldProps) {
  return (
    <Field label={label} required={required} invalid={!!error} errorText={error}>
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
      >
        <NumberInput.Field placeholder={placeholder} />
        <NumberInput.Control>
          <NumberInput.IncrementTrigger />
          <NumberInput.DecrementTrigger />
        </NumberInput.Control>
      </NumberInput.Root>
    </Field>
  )
}