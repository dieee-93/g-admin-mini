// src/shared/ui/RadioGroup.tsx
// RadioGroup Component Wrapper for ChakraUI v3.23.0 - G-Admin Mini Design System

import React from 'react'
import { RadioGroup as ChakraRadioGroup, Radiomark, HStack, VStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface BaseRadioGroupProps {
  // Core Props
  value?: string
  defaultValue?: string
  disabled?: boolean
  readOnly?: boolean

  // Form Props
  name?: string
  form?: string

  // Layout Props
  orientation?: 'horizontal' | 'vertical'

  // Styling Props
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'subtle' | 'solid'

  // Event Handlers
  onValueChange?: (value: string) => void

  // Content Props
  children: ReactNode

  // Additional Props
  className?: string
  [key: string]: any
}

interface RadioItemProps {
  value: string
  disabled?: boolean
  children?: ReactNode
  [key: string]: any
}

// =============================================================================
// MAIN RADIOGROUP COMPONENT (Simplified Interface)
// =============================================================================

export function RadioGroup({
  value,
  defaultValue,
  disabled = false,
  readOnly = false,
  name,
  form,
  orientation = 'vertical',
  colorPalette = 'blue',
  size = 'md',
  variant = 'solid',
  onValueChange,
  children,
  className,
  ...props
}: BaseRadioGroupProps) {
  const StackComponent = orientation === 'horizontal' ? HStack : VStack

  return (
    <ChakraRadioGroup.Root
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      form={form}
      colorPalette={colorPalette}
      size={size}
      variant={variant}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
      className={className}
      {...props}
    >
      <StackComponent gap="2" align="start">
        {children}
      </StackComponent>
    </ChakraRadioGroup.Root>
  )
}

// =============================================================================
// COMPOSITIONAL COMPONENTS (Direct Chakra Wrappers)
// =============================================================================

export const RadioGroupRoot = React.forwardRef<HTMLDivElement, BaseRadioGroupProps>(
  function RadioGroupRoot({
    value,
    defaultValue,
    disabled = false,
    readOnly = false,
    name,
    form,
    orientation = 'vertical',
    colorPalette = 'blue',
    size = 'md',
    variant = 'solid',
    onValueChange,
    children,
    ...props
  }, ref) {
    return (
      <ChakraRadioGroup.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        name={name}
        form={form}
        colorPalette={colorPalette}
        size={size}
        variant={variant}
        onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
        {...props}
      >
        {children}
      </ChakraRadioGroup.Root>
    )
  }
)

export const RadioItem = React.forwardRef<HTMLLabelElement, RadioItemProps>(
  function RadioItem({ value, disabled, children, ...props }, ref) {
    return (
      <ChakraRadioGroup.Item
        ref={ref}
        value={value}
        disabled={disabled}
        {...props}
      >
        <HStack gap="2">
          <Radiomark />
          {children && (
            <ChakraRadioGroup.ItemText>
              {children}
            </ChakraRadioGroup.ItemText>
          )}
        </HStack>
        <ChakraRadioGroup.ItemHiddenInput />
      </ChakraRadioGroup.Item>
    )
  }
)

export const RadioItemControl = React.forwardRef<HTMLDivElement, { children?: ReactNode; [key: string]: any }>(
  function RadioItemControl({ children, ...props }, ref) {
    return (
      <div ref={ref} {...props}>
        {children || <Radiomark />}
      </div>
    )
  }
)

export const RadioItemText = React.forwardRef<HTMLSpanElement, { children?: ReactNode; [key: string]: any }>(
  function RadioItemText({ children, ...props }, ref) {
    return (
      <ChakraRadioGroup.ItemText ref={ref} {...props}>
        {children}
      </ChakraRadioGroup.ItemText>
    )
  }
)

export const RadioLabel = React.forwardRef<HTMLLabelElement, { children?: ReactNode; [key: string]: any }>(
  function RadioLabel({ children, ...props }, ref) {
    return (
      <ChakraRadioGroup.Label ref={ref} {...props}>
        {children}
      </ChakraRadioGroup.Label>
    )
  }
)

export const RadioItemHiddenInput = ChakraRadioGroup.ItemHiddenInput

// =============================================================================
// BUSINESS RADIO COMPONENTS
// =============================================================================

interface OptionItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface OptionsRadioGroupProps extends Omit<BaseRadioGroupProps, 'children'> {
  options: OptionItem[]
  label?: string
}

export function OptionsRadioGroup({
  options,
  label,
  size = 'md',
  colorPalette = 'blue',
  orientation = 'vertical',
  ...props
}: OptionsRadioGroupProps) {
  return (
    <RadioGroup
      size={size}
      colorPalette={colorPalette}
      orientation={orientation}
      {...props}
    >
      {label && <RadioLabel>{label}</RadioLabel>}
      {options.map((option) => (
        <RadioItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          <VStack gap="1" align="start">
            <Text fontWeight="medium">{option.label}</Text>
            {option.description && (
              <Text fontSize="sm" color="gray.600">
                {option.description}
              </Text>
            )}
          </VStack>
        </RadioItem>
      ))}
    </RadioGroup>
  )
}

interface ThemeRadioGroupProps extends Omit<BaseRadioGroupProps, 'children'> {
  themes: Array<{
    value: string
    name: string
    preview?: ReactNode
  }>
}

export function ThemeRadioGroup({
  themes,
  size = 'md',
  colorPalette = 'blue',
  ...props
}: ThemeRadioGroupProps) {
  return (
    <RadioGroup
      size={size}
      colorPalette={colorPalette}
      orientation="vertical"
      {...props}
    >
      {themes.map((theme) => (
        <RadioItem key={theme.value} value={theme.value}>
          <HStack gap="3" justify="space-between" width="full">
            <Text fontWeight="medium">{theme.name}</Text>
            {theme.preview && (
              <div>
                {theme.preview}
              </div>
            )}
          </HStack>
        </RadioItem>
      ))}
    </RadioGroup>
  )
}

// =============================================================================
// CONVENIENCE COMPONENT (Simple Radio)
// =============================================================================

interface RadioProps {
  value: string
  disabled?: boolean
  children?: ReactNode
  [key: string]: any
}

export function Radio({ value, disabled, children, ...props }: RadioProps) {
  return (
    <RadioItem value={value} disabled={disabled} {...props}>
      {children}
    </RadioItem>
  )
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  BaseRadioGroupProps,
  RadioItemProps,
  OptionItem,
  OptionsRadioGroupProps,
  ThemeRadioGroupProps,
  RadioProps
}