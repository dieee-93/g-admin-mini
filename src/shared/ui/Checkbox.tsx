// src/shared/ui/Checkbox.tsx
// Checkbox Component Wrapper for ChakraUI v3.23.0 - G-Admin Mini Design System

import React from 'react'
import { Checkbox as ChakraCheckbox } from '@chakra-ui/react'
import type { ReactNode } from 'react'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface BaseCheckboxProps {
  // Core Props
  checked?: boolean | 'indeterminate'
  defaultChecked?: boolean | 'indeterminate'
  disabled?: boolean
  invalid?: boolean
  readOnly?: boolean
  required?: boolean

  // Form Props
  name?: string
  value?: string
  form?: string

  // Styling Props
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'solid' | 'subtle'

  // Event Handlers
  onCheckedChange?: (checked: boolean | 'indeterminate') => void

  // Content Props
  children?: ReactNode

  // Additional Props
  className?: string
  [key: string]: any
}

interface CheckboxGroupProps {
  // Core Props
  value?: string[]
  defaultValue?: string[]
  disabled?: boolean
  invalid?: boolean
  readOnly?: boolean

  // Form Props
  name?: string

  // Event Handlers
  onValueChange?: (value: string[]) => void

  // Content Props
  children: ReactNode

  // Additional Props
  className?: string
  [key: string]: any
}

interface CheckboxControlProps {
  children?: ReactNode
  [key: string]: any
}

interface CheckboxLabelProps {
  children?: ReactNode
  [key: string]: any
}

interface CheckboxIndicatorProps {
  checked?: ReactNode
  indeterminate?: boolean
  [key: string]: any
}

// =============================================================================
// MAIN CHECKBOX COMPONENT (Simplified Interface)
// =============================================================================

export function Checkbox({
  checked,
  defaultChecked,
  disabled = false,
  invalid = false,
  readOnly = false,
  required = false,
  name,
  value = 'on',
  form,
  colorPalette = 'blue',
  size = 'md',
  variant = 'solid',
  onCheckedChange,
  children,
  className,
  ...props
}: BaseCheckboxProps) {
  return (
    <ChakraCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      invalid={invalid}
      readOnly={readOnly}
      required={required}
      name={name}
      value={value}
      form={form}
      colorPalette={colorPalette}
      size={size}
      variant={variant}
      onCheckedChange={onCheckedChange ? (details) => onCheckedChange(details.checked) : undefined}
      className={className}
      {...props}
    >
      <ChakraCheckbox.Control>
        <ChakraCheckbox.Indicator />
      </ChakraCheckbox.Control>
      {children && (
        <ChakraCheckbox.Label>
          {children}
        </ChakraCheckbox.Label>
      )}
      <ChakraCheckbox.HiddenInput />
    </ChakraCheckbox.Root>
  )
}

// =============================================================================
// COMPOSITIONAL COMPONENTS (Direct Chakra Wrappers)
// =============================================================================

export const CheckboxRoot = React.forwardRef<HTMLLabelElement, BaseCheckboxProps>(
  function CheckboxRoot({
    checked,
    defaultChecked,
    disabled = false,
    invalid = false,
    readOnly = false,
    required = false,
    name,
    value = 'on',
    form,
    colorPalette = 'blue',
    size = 'md',
    variant = 'solid',
    onCheckedChange,
    children,
    ...props
  }, ref) {
    return (
      <ChakraCheckbox.Root
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        invalid={invalid}
        readOnly={readOnly}
        required={required}
        name={name}
        value={value}
        form={form}
        colorPalette={colorPalette}
        size={size}
        variant={variant}
        onCheckedChange={onCheckedChange ? (details) => onCheckedChange(details.checked) : undefined}
        {...props}
      >
        {children}
      </ChakraCheckbox.Root>
    )
  }
)

export const CheckboxControl = React.forwardRef<HTMLDivElement, CheckboxControlProps>(
  function CheckboxControl({ children, ...props }, ref) {
    return (
      <ChakraCheckbox.Control ref={ref} {...props}>
        {children}
      </ChakraCheckbox.Control>
    )
  }
)

export const CheckboxIndicator = React.forwardRef<HTMLDivElement, CheckboxIndicatorProps>(
  function CheckboxIndicator({ checked, indeterminate, ...props }, ref) {
    return (
      <ChakraCheckbox.Indicator
        ref={ref}
        checked={checked}
        indeterminate={indeterminate}
        {...props}
      />
    )
  }
)

export const CheckboxLabel = React.forwardRef<HTMLSpanElement, CheckboxLabelProps>(
  function CheckboxLabel({ children, ...props }, ref) {
    return (
      <ChakraCheckbox.Label ref={ref} {...props}>
        {children}
      </ChakraCheckbox.Label>
    )
  }
)

export const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup({
    value,
    defaultValue,
    disabled = false,
    invalid = false,
    readOnly = false,
    name,
    onValueChange,
    children,
    ...props
  }, ref) {
    return (
      <ChakraCheckbox.Group
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        invalid={invalid}
        readOnly={readOnly}
        name={name}
        onValueChange={onValueChange}
        {...props}
      >
        {children}
      </ChakraCheckbox.Group>
    )
  }
)

export const CheckboxHiddenInput = ChakraCheckbox.HiddenInput

// =============================================================================
// BUSINESS CHECKBOX COMPONENTS
// =============================================================================

interface PermissionCheckboxProps extends BaseCheckboxProps {
  permissionLabel: string
  description?: string
}

export function PermissionCheckbox({
  permissionLabel,
  description,
  size = 'md',
  colorPalette = 'blue',
  ...props
}: PermissionCheckboxProps) {
  return (
    <Checkbox
      size={size}
      colorPalette={colorPalette}
      {...props}
    >
      <div>
        <div style={{ fontWeight: 'medium' }}>{permissionLabel}</div>
        {description && (
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
    </Checkbox>
  )
}

interface FeatureToggleProps extends BaseCheckboxProps {
  featureName: string
  status?: 'enabled' | 'disabled' | 'beta'
}

export function FeatureToggle({
  featureName,
  status = 'enabled',
  size = 'md',
  colorPalette = status === 'beta' ? 'orange' : 'blue',
  ...props
}: FeatureToggleProps) {
  return (
    <Checkbox
      size={size}
      colorPalette={colorPalette}
      {...props}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {featureName}
        {status === 'beta' && (
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: '#FED7AA',
            color: '#C2410C',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 'medium'
          }}>
            BETA
          </span>
        )}
      </div>
    </Checkbox>
  )
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  BaseCheckboxProps,
  CheckboxGroupProps,
  CheckboxControlProps,
  CheckboxLabelProps,
  CheckboxIndicatorProps,
  PermissionCheckboxProps,
  FeatureToggleProps
}