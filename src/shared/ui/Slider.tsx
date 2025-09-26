// src/shared/ui/Slider.tsx
// Slider Component Wrapper for ChakraUI v3.23.0 - G-Admin Mini Design System

import React from 'react'
import { Slider as ChakraSlider } from '@chakra-ui/react'
import type { ReactNode } from 'react'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface BaseSliderProps {
  // Core Props
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  invalid?: boolean
  readOnly?: boolean

  // Form Props
  name?: string
  form?: string

  // Layout Props
  orientation?: 'horizontal' | 'vertical'

  // Advanced Props
  minStepsBetweenThumbs?: number
  thumbAlignment?: 'center' | 'contain'
  origin?: 'start' | 'center' | 'end'

  // Styling Props
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'solid'

  // Accessibility Props
  'aria-label'?: string[]
  'aria-labelledby'?: string[]
  getAriaValueText?: (details: { value: number; index: number }) => string

  // Event Handlers
  onValueChange?: (value: number[]) => void
  onValueChangeEnd?: (value: number[]) => void
  onFocusChange?: (details: { focusedIndex: number }) => void

  // Content Props
  children?: ReactNode
  label?: string
  showValueText?: boolean

  // Additional Props
  className?: string
  [key: string]: any
}

interface SliderThumbProps {
  index: number
  name?: string
  [key: string]: any
}

interface SliderMarkerProps {
  value: number
  children?: ReactNode
  [key: string]: any
}

// =============================================================================
// MAIN SLIDER COMPONENT (Simplified Interface)
// =============================================================================

export function Slider({
  value,
  defaultValue = [50],
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  invalid = false,
  readOnly = false,
  name,
  form,
  orientation = 'horizontal',
  minStepsBetweenThumbs = 0,
  thumbAlignment = 'contain',
  origin = 'start',
  colorPalette = 'blue',
  size = 'md',
  variant = 'outline',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  getAriaValueText,
  onValueChange,
  onValueChangeEnd,
  onFocusChange,
  children,
  label,
  showValueText = false,
  className,
  ...props
}: BaseSliderProps) {
  return (
    <ChakraSlider.Root
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      invalid={invalid}
      readOnly={readOnly}
      name={name}
      form={form}
      orientation={orientation}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      thumbAlignment={thumbAlignment}
      origin={origin}
      colorPalette={colorPalette}
      size={size}
      variant={variant}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      getAriaValueText={getAriaValueText}
      onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
      onValueChangeEnd={onValueChangeEnd ? (details) => onValueChangeEnd(details.value) : undefined}
      onFocusChange={onFocusChange}
      className={className}
      {...props}
    >
      {label && <ChakraSlider.Label>{label}</ChakraSlider.Label>}

      <ChakraSlider.Control>
        <ChakraSlider.Track>
          <ChakraSlider.Range />
        </ChakraSlider.Track>
        {(value || defaultValue).map((_, index) => (
          <ChakraSlider.Thumb key={index} index={index}>
            <ChakraSlider.HiddenInput />
          </ChakraSlider.Thumb>
        ))}
      </ChakraSlider.Control>

      {showValueText && <ChakraSlider.ValueText />}

      {children}
    </ChakraSlider.Root>
  )
}

// =============================================================================
// COMPOSITIONAL COMPONENTS (Direct Chakra Wrappers)
// =============================================================================

export const SliderRoot = React.forwardRef<HTMLDivElement, BaseSliderProps>(
  function SliderRoot({
    value,
    defaultValue = [50],
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    invalid = false,
    readOnly = false,
    name,
    form,
    orientation = 'horizontal',
    minStepsBetweenThumbs = 0,
    thumbAlignment = 'contain',
    origin = 'start',
    colorPalette = 'blue',
    size = 'md',
    variant = 'outline',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    getAriaValueText,
    onValueChange,
    onValueChangeEnd,
    onFocusChange,
    children,
    ...props
  }, ref) {
    return (
      <ChakraSlider.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        invalid={invalid}
        readOnly={readOnly}
        name={name}
        form={form}
        orientation={orientation}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        thumbAlignment={thumbAlignment}
        origin={origin}
        colorPalette={colorPalette}
        size={size}
        variant={variant}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        getAriaValueText={getAriaValueText}
        onValueChange={onValueChange ? (details) => onValueChange(details.value) : undefined}
        onValueChangeEnd={onValueChangeEnd ? (details) => onValueChangeEnd(details.value) : undefined}
        onFocusChange={onFocusChange}
        {...props}
      >
        {children}
      </ChakraSlider.Root>
    )
  }
)

export const SliderControl = React.forwardRef<HTMLDivElement, { children?: ReactNode; [key: string]: any }>(
  function SliderControl({ children, ...props }, ref) {
    return (
      <ChakraSlider.Control ref={ref} {...props}>
        {children}
      </ChakraSlider.Control>
    )
  }
)

export const SliderTrack = React.forwardRef<HTMLDivElement, { children?: ReactNode; [key: string]: any }>(
  function SliderTrack({ children, ...props }, ref) {
    return (
      <ChakraSlider.Track ref={ref} {...props}>
        {children}
      </ChakraSlider.Track>
    )
  }
)

export const SliderRange = React.forwardRef<HTMLDivElement, { [key: string]: any }>(
  function SliderRange(props, ref) {
    return <ChakraSlider.Range ref={ref} {...props} />
  }
)

export const SliderThumb = React.forwardRef<HTMLDivElement, SliderThumbProps>(
  function SliderThumb({ index, name, ...props }, ref) {
    return (
      <ChakraSlider.Thumb ref={ref} index={index} name={name} {...props}>
        <ChakraSlider.HiddenInput />
      </ChakraSlider.Thumb>
    )
  }
)

export const SliderLabel = React.forwardRef<HTMLLabelElement, { children?: ReactNode; [key: string]: any }>(
  function SliderLabel({ children, ...props }, ref) {
    return (
      <ChakraSlider.Label ref={ref} {...props}>
        {children}
      </ChakraSlider.Label>
    )
  }
)

export const SliderValueText = React.forwardRef<HTMLDivElement, { children?: ReactNode; [key: string]: any }>(
  function SliderValueText({ children, ...props }, ref) {
    return (
      <ChakraSlider.ValueText ref={ref} {...props}>
        {children}
      </ChakraSlider.ValueText>
    )
  }
)

export const SliderMarker = React.forwardRef<HTMLSpanElement, SliderMarkerProps>(
  function SliderMarker({ value, children, ...props }, ref) {
    return (
      <ChakraSlider.Marker ref={ref} value={value} {...props}>
        {children}
      </ChakraSlider.Marker>
    )
  }
)

export const SliderMarkerGroup = ChakraSlider.MarkerGroup
export const SliderMarkerIndicator = ChakraSlider.MarkerIndicator
export const SliderHiddenInput = ChakraSlider.HiddenInput

// =============================================================================
// BUSINESS SLIDER COMPONENTS
// =============================================================================

interface RangeSliderProps extends Omit<BaseSliderProps, 'defaultValue' | 'value'> {
  value?: [number, number]
  defaultValue?: [number, number]
  minDistance?: number
}

export function RangeSlider({
  value,
  defaultValue = [25, 75],
  minDistance = 10,
  label = "Range",
  showValueText = true,
  size = 'md',
  colorPalette = 'blue',
  ...props
}: RangeSliderProps) {
  const minStepsBetweenThumbs = minDistance / (props.step || 1)

  return (
    <Slider
      value={value}
      defaultValue={defaultValue}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      label={label}
      showValueText={showValueText}
      size={size}
      colorPalette={colorPalette}
      {...props}
    />
  )
}

interface VolumeSliderProps extends Omit<BaseSliderProps, 'defaultValue' | 'min' | 'max' | 'step'> {
  volume?: number
  onVolumeChange?: (volume: number) => void
}

export function VolumeSlider({
  volume,
  onVolumeChange,
  label = "Volume",
  showValueText = true,
  size = 'md',
  colorPalette = 'blue',
  ...props
}: VolumeSliderProps) {
  return (
    <Slider
      value={volume !== undefined ? [volume] : undefined}
      defaultValue={[50]}
      min={0}
      max={100}
      step={1}
      label={label}
      showValueText={showValueText}
      size={size}
      colorPalette={colorPalette}
      onValueChange={onVolumeChange ? (values) => onVolumeChange(values[0]) : undefined}
      getAriaValueText={({ value }) => `${value}%`}
      {...props}
    />
  )
}

interface PriceSliderProps extends Omit<BaseSliderProps, 'defaultValue' | 'min' | 'max' | 'step'> {
  price?: number
  minPrice?: number
  maxPrice?: number
  currency?: string
  onPriceChange?: (price: number) => void
}

export function PriceSlider({
  price,
  minPrice = 0,
  maxPrice = 1000,
  currency = '$',
  onPriceChange,
  label = "Price Range",
  showValueText = true,
  size = 'md',
  colorPalette = 'green',
  ...props
}: PriceSliderProps) {
  return (
    <Slider
      value={price !== undefined ? [price] : undefined}
      defaultValue={[minPrice]}
      min={minPrice}
      max={maxPrice}
      step={1}
      label={label}
      showValueText={showValueText}
      size={size}
      colorPalette={colorPalette}
      onValueChange={onPriceChange ? (values) => onPriceChange(values[0]) : undefined}
      getAriaValueText={({ value }) => `${currency}${value}`}
      {...props}
    />
  )
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  BaseSliderProps,
  SliderThumbProps,
  SliderMarkerProps,
  RangeSliderProps,
  VolumeSliderProps,
  PriceSliderProps
}