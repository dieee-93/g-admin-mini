import { Switch as ChakraSwitch } from '@chakra-ui/react'
import type { ReactNode } from 'react'

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
  description?: string
  
  // Styling
  size?: 'sm' | 'md' | 'lg'
  colorPalette?: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'pink'
  variant?: 'raised' | 'outline'
  
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
  sm: 'sm',
  md: 'md', 
  lg: 'lg'
}


export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  invalid = false,
  children,
  label,
  description,
  size = 'md',
  colorPalette = 'brand',
  variant = 'raised',
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
      size={sizeMap[size]}
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
      
      {description && (
        <ChakraSwitch.Description>{description}</ChakraSwitch.Description>
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
  const gapMap = {
    sm: '2',
    md: '4',
    lg: '6'
  }

  return (
    <ChakraSwitch.Root className={className}>
      {label && (
        <ChakraSwitch.Label fontWeight="semibold" mb="2">
          {label}
        </ChakraSwitch.Label>
      )}
      
      {description && (
        <ChakraSwitch.Description mb="4">
          {description}
        </ChakraSwitch.Description>
      )}
      
      <div
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          gap: `${gapMap[gap]}`,
          alignItems: orientation === 'horizontal' ? 'center' : 'stretch'
        }}
      >
        {children}
      </div>
    </ChakraSwitch.Root>
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
      colorPalette={hasPermission ? 'success' : 'error'}
      {...props}
    >
      {hasPermission ? allowLabel : denyLabel}
    </Switch>
  )
}
