// src/shared/ui/Progress.tsx
// Progress Component Wrapper for ChakraUI v3.23.0 - G-Admin Mini Design System

import React from 'react'
import { Progress as ChakraProgress } from '@chakra-ui/react'
import type { ReactNode } from 'react'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface BaseProgressProps {
  // Core Progress Props
  value?: number | null
  defaultValue?: number
  min?: number
  max?: number

  // Styling Props
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  variant?: 'outline' | 'subtle'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'square' | 'rounded' | 'full'

  // Visual Effects
  striped?: boolean
  animated?: boolean

  // Layout Props
  orientation?: 'horizontal' | 'vertical'

  // Content Props
  label?: ReactNode
  showValueText?: boolean
  valueText?: ReactNode
  info?: ReactNode

  // Additional Props
  children?: ReactNode
  className?: string

  // Chakra Props Pass-through
  [key: string]: any
}

interface ProgressRootProps extends BaseProgressProps {}

interface ProgressTrackProps {
  children?: ReactNode
  [key: string]: any
}

interface ProgressRangeProps {
  [key: string]: any
}

interface ProgressLabelProps {
  children?: ReactNode
  info?: ReactNode
  [key: string]: any
}

interface ProgressValueTextProps {
  children?: ReactNode
  [key: string]: any
}

// =============================================================================
// MAIN PROGRESS COMPONENT (Simplified Interface)
// =============================================================================

export function Progress({
  value,
  defaultValue = 50,
  min = 0,
  max = 100,
  colorPalette = 'blue',
  variant = 'outline',
  size = 'md',
  shape = 'rounded',
  striped = false,
  animated = false,
  orientation = 'horizontal',
  label,
  showValueText = false,
  valueText,
  info,
  children,
  className,
  ...props
}: BaseProgressProps) {
  return (
    <ChakraProgress.Root
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      colorPalette={colorPalette}
      variant={variant}
      size={size}
      shape={shape}
      striped={striped}
      animated={animated}
      orientation={orientation}
      className={className}
      {...props}
    >
      {label && (
        <ChakraProgress.Label>
          {label}
          {info && <span style={{ marginLeft: '4px' }}>{info}</span>}
        </ChakraProgress.Label>
      )}

      <ChakraProgress.Track>
        <ChakraProgress.Range />
      </ChakraProgress.Track>

      {showValueText && (
        <ChakraProgress.ValueText>
          {valueText}
        </ChakraProgress.ValueText>
      )}

      {children}
    </ChakraProgress.Root>
  )
}

// =============================================================================
// COMPOSITIONAL COMPONENTS (Direct Chakra Wrappers)
// =============================================================================

export const ProgressRoot = React.forwardRef<HTMLDivElement, ProgressRootProps>(
  function ProgressRoot({
    value,
    defaultValue = 50,
    min = 0,
    max = 100,
    colorPalette = 'blue',
    variant = 'outline',
    size = 'md',
    shape = 'rounded',
    striped = false,
    animated = false,
    orientation = 'horizontal',
    children,
    ...props
  }, ref) {
    return (
      <ChakraProgress.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        colorPalette={colorPalette}
        variant={variant}
        size={size}
        shape={shape}
        striped={striped}
        animated={animated}
        orientation={orientation}
        {...props}
      >
        {children}
      </ChakraProgress.Root>
    )
  }
)

export const ProgressTrack = React.forwardRef<HTMLDivElement, ProgressTrackProps>(
  function ProgressTrack({ children, ...props }, ref) {
    return (
      <ChakraProgress.Track ref={ref} {...props}>
        {children}
      </ChakraProgress.Track>
    )
  }
)

export const ProgressRange = React.forwardRef<HTMLDivElement, ProgressRangeProps>(
  function ProgressRange(props, ref) {
    return <ChakraProgress.Range ref={ref} {...props} />
  }
)

export const ProgressLabel = React.forwardRef<HTMLLabelElement, ProgressLabelProps>(
  function ProgressLabel({ children, info, ...props }, ref) {
    return (
      <ChakraProgress.Label ref={ref} {...props}>
        {children}
        {info && <span style={{ marginLeft: '4px' }}>{info}</span>}
      </ChakraProgress.Label>
    )
  }
)

export const ProgressValueText = React.forwardRef<HTMLSpanElement, ProgressValueTextProps>(
  function ProgressValueText({ children, ...props }, ref) {
    return (
      <ChakraProgress.ValueText ref={ref} {...props}>
        {children}
      </ChakraProgress.ValueText>
    )
  }
)

// =============================================================================
// BUSINESS PROGRESS COMPONENTS
// =============================================================================

interface LoadingProgressProps extends BaseProgressProps {
  loadingText?: string
}

export function LoadingProgress({
  loadingText = "Loading...",
  size = "sm",
  colorPalette = "blue",
  animated = true,
  striped = true,
  ...props
}: LoadingProgressProps) {
  return (
    <Progress
      value={null} // Indeterminate
      size={size}
      colorPalette={colorPalette}
      animated={animated}
      striped={striped}
      label={loadingText}
      {...props}
    />
  )
}

interface UploadProgressProps extends BaseProgressProps {
  fileName?: string
  uploadSpeed?: string
}

export function UploadProgress({
  value = 0,
  fileName = "File",
  uploadSpeed,
  showValueText = true,
  size = "md",
  colorPalette = "green",
  ...props
}: UploadProgressProps) {
  const displayText = uploadSpeed
    ? `${Math.round(value || 0)}% • ${uploadSpeed}`
    : `${Math.round(value || 0)}%`

  return (
    <Progress
      value={value}
      size={size}
      colorPalette={colorPalette}
      label={`Uploading ${fileName}`}
      showValueText={showValueText}
      valueText={displayText}
      {...props}
    />
  )
}

interface TaskProgressProps extends BaseProgressProps {
  taskName: string
  completed?: number
  total?: number
}

export function TaskProgress({
  taskName,
  completed = 0,
  total = 100,
  showValueText = true,
  size = "md",
  colorPalette = "blue",
  ...props
}: TaskProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  return (
    <Progress
      value={percentage}
      size={size}
      colorPalette={colorPalette}
      label={taskName}
      showValueText={showValueText}
      valueText={`${completed} / ${total}`}
      {...props}
    />
  )
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  BaseProgressProps,
  ProgressRootProps,
  ProgressTrackProps,
  ProgressRangeProps,
  ProgressLabelProps,
  ProgressValueTextProps,
  LoadingProgressProps,
  UploadProgressProps,
  TaskProgressProps
}