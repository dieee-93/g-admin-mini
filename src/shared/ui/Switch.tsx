import { Switch as ChakraSwitch } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Stack } from './Stack'
import { Text } from './Text'

interface SwitchProps {
  // Core functionality
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  invalid?: boolean

  // Content
  children?: ReactNode
  label?: string

  // Styling
  size?: 'sm' | 'md' | 'lg'
  colorPalette?: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'pink'
  variant?: 'solid' | 'raised'

  // Layout
  labelPlacement?: 'start' | 'end'

  // Props
  name?: string
  value?: string
  id?: string
  className?: string
}

interface SwitchGroupProps {
  children: ReactNode
  label?: string
  description?: string
  orientation?: 'horizontal' | 'vertical'
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const
}


export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  invalid = false,
  children,
  label,
  size = 'md',
  colorPalette = 'gray',
  variant = 'solid',
  labelPlacement = 'end',
  name,
  value,
  id,
  className,
  ...rest
}: SwitchProps) {
  const displayLabel = label || children

  return (
    <ChakraSwitch.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(details) => onChange?.(details.checked)}
      disabled={disabled}
      invalid={invalid}
      size={size}
      colorPalette={colorPalette}
      variant={variant}
      name={name}
      value={value}
      id={id}
      className={className}
      {...rest}
    >
      {labelPlacement === 'start' && displayLabel && (
        <ChakraSwitch.Label>{displayLabel}</ChakraSwitch.Label>
      )}
      
      <ChakraSwitch.HiddenInput />
      <ChakraSwitch.Control>
        <ChakraSwitch.Thumb />
      </ChakraSwitch.Control>
      
      {labelPlacement === 'end' && displayLabel && (
        <ChakraSwitch.Label>{displayLabel}</ChakraSwitch.Label>
      )}
    </ChakraSwitch.Root>
  )
}

export function SwitchGroup({
  children,
  label,
  description,
  orientation = 'vertical',
  gap = 'md',
  className,
}: SwitchGroupProps) {
  return (
    <Stack gap={gap} className={className}>
      {label && (
        <Text fontWeight="semibold" mb="2">
          {label}
        </Text>
      )}

      {description && (
        <Text fontSize="sm" color="gray.600" mb="4">
          {description}
        </Text>
      )}

      <Stack
        direction={orientation === 'horizontal' ? 'row' : 'column'}
        gap={gap}
        align={orientation === 'horizontal' ? 'center' : 'stretch'}
      >
        {children}
      </Stack>
    </Stack>
  )
}

// Business-specific switch components
export function StatusSwitch({
  active,
  onToggle,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo",
  ...props
}: {
  active: boolean
  onToggle: (active: boolean) => void
  activeLabel?: string
  inactiveLabel?: string
} & Omit<SwitchProps, 'checked' | 'onChange' | 'children'>) {
  return (
    <Switch
      checked={active}
      onChange={onToggle}
      colorPalette={active ? 'green' : 'gray'}
      {...props}
    >
      {active ? activeLabel : inactiveLabel}
    </Switch>
  )
}

export function PermissionSwitch({
  hasPermission,
  onToggle,
  allowLabel = "Permitir",
  denyLabel = "Denegar",
  ...props
}: {
  hasPermission: boolean
  onToggle: (hasPermission: boolean) => void
  allowLabel?: string
  denyLabel?: string
} & Omit<SwitchProps, 'checked' | 'onChange' | 'children'>) {
  return (
    <Switch
      checked={hasPermission}
      onChange={onToggle}
      colorPalette={hasPermission ? 'green' : 'red'}
      {...props}
    >
      {hasPermission ? allowLabel : denyLabel}
    </Switch>
  )
}
