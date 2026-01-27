/**
 * Tooltip Component - Chakra UI v3 Wrapper
 *
 * Full-featured tooltip wrapper supporting all native Chakra UI Tooltip functionality.
 * Follows G-Admin Mini design system patterns.
 *
 * @see https://chakra-ui.com/docs/components/tooltip
 * @see https://ark-ui.com/docs/components/tooltip
 */

import { forwardRef } from 'react'
import {
  Tooltip as ChakraTooltip,
  type SystemStyleObject,
  useTooltipContext as useChakraTooltipContext
} from '@chakra-ui/react'

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Placement options for tooltip positioning
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

/**
 * Positioning configuration for advanced control
 */
export interface TooltipPositioning {
  placement?: TooltipPlacement
  offset?: { x?: number; y?: number }
  gap?: number
  gutter?: number
  strategy?: 'absolute' | 'fixed'
  fallbackPlacement?: TooltipPlacement[]
  middleware?: any[]
}

/**
 * Root props - extends all native Chakra Tooltip.Root props
 */
export interface TooltipRootProps {
  children: React.ReactNode

  // State Management
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void

  // Positioning
  positioning?: TooltipPositioning

  // Timing
  openDelay?: number
  closeDelay?: number

  // Interaction
  interactive?: boolean
  disabled?: boolean
  closeOnEsc?: boolean
  closeOnPointerDown?: boolean

  // Rendering
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>

  // Styling
  className?: string
  css?: SystemStyleObject

  // Events
  onFocus?: () => void
  onBlur?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onPointerEnter?: () => void
  onPointerLeave?: () => void

  // Accessibility
  'aria-label'?: string
  id?: string
}

/**
 * Trigger props
 */
export interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  'data-testid'?: string
  disabled?: boolean
  [key: string]: any
}

/**
 * Content props
 */
export interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  css?: SystemStyleObject
  'data-testid'?: string
  role?: string
  'aria-live'?: 'polite' | 'assertive' | 'off'
  maxW?: string | number
  p?: string | number
  fontSize?: string | number
  [key: string]: any
}

/**
 * Positioner props
 */
export interface TooltipPositionerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  'data-testid'?: string
}

/**
 * Arrow props
 */
export interface TooltipArrowProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  asChild?: boolean
}

/**
 * ArrowTip props
 */
export interface TooltipArrowTipProps {
  className?: string
  style?: React.CSSProperties
}

// ============================================
// COMPONENT EXPORTS (Namespace Pattern)
// ============================================

/**
 * TooltipRoot - Main container managing state
 */
export const TooltipRoot = forwardRef<HTMLDivElement, TooltipRootProps>(
  (props, ref) => {
    const {
      children,
      open,
      defaultOpen,
      onOpenChange,
      positioning,
      openDelay = 0,
      closeDelay = 0,
      interactive = false,
      disabled = false,
      closeOnEsc = true,
      closeOnPointerDown = true,
      portalled = true,
      portalRef,
      className,
      css,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      onPointerEnter,
      onPointerLeave,
      'aria-label': ariaLabel,
      id,
      ...rest
    } = props

    return (
      <ChakraTooltip.Root
        ref={ref}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        positioning={positioning}
        openDelay={openDelay}
        closeDelay={closeDelay}
        interactive={interactive}
        disabled={disabled}
        closeOnEsc={closeOnEsc}
        closeOnPointerDown={closeOnPointerDown}
        portalled={portalled}
        portalRef={portalRef}
        className={className}
        css={css}
        aria-label={ariaLabel}
        id={id}
        {...rest}
      >
        {children}
      </ChakraTooltip.Root>
    )
  }
)

TooltipRoot.displayName = 'TooltipRoot'

/**
 * TooltipTrigger - Element that activates the tooltip
 */
export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  (props, ref) => {
    const { children, asChild = true, ...rest } = props

    return (
      <ChakraTooltip.Trigger ref={ref} asChild={asChild} {...rest}>
        {children}
      </ChakraTooltip.Trigger>
    )
  }
)

TooltipTrigger.displayName = 'TooltipTrigger'

/**
 * TooltipPositioner - Controls placement and positioning
 */
export const TooltipPositioner = forwardRef<HTMLDivElement, TooltipPositionerProps>(
  (props, ref) => {
    const { children, ...rest } = props

    return (
      <ChakraTooltip.Positioner ref={ref} {...rest}>
        {children}
      </ChakraTooltip.Positioner>
    )
  }
)

TooltipPositioner.displayName = 'TooltipPositioner'

/**
 * TooltipContent - The tooltip content container
 */
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (props, ref) => {
    const {
      children,
      className,
      style,
      css,
      role = 'tooltip',
      'aria-live': ariaLive = 'polite',
      maxW = '300px',
      p = '3',
      fontSize = 'sm',
      ...rest
    } = props

    return (
      <ChakraTooltip.Content
        ref={ref}
        className={className}
        style={style}
        css={css}
        role={role}
        aria-live={ariaLive}
        maxW={maxW}
        p={p}
        fontSize={fontSize}
        {...rest}
      >
        {children}
      </ChakraTooltip.Content>
    )
  }
)

TooltipContent.displayName = 'TooltipContent'

/**
 * TooltipArrow - Optional directional indicator
 */
export const TooltipArrow = forwardRef<HTMLDivElement, TooltipArrowProps>(
  (props, ref) => {
    const { children, asChild = false, ...rest } = props

    return (
      <ChakraTooltip.Arrow ref={ref} asChild={asChild} {...rest}>
        {children}
      </ChakraTooltip.Arrow>
    )
  }
)

TooltipArrow.displayName = 'TooltipArrow'

/**
 * TooltipArrowTip - Arrow visual element
 */
export const TooltipArrowTip = forwardRef<HTMLDivElement, TooltipArrowTipProps>(
  (props, ref) => {
    return <ChakraTooltip.ArrowTip ref={ref} {...props} />
  }
)

TooltipArrowTip.displayName = 'TooltipArrowTip'

// ============================================
// NAMESPACE EXPORT (Primary Pattern)
// ============================================

/**
 * Tooltip namespace - Use as Tooltip.Root, Tooltip.Trigger, etc.
 *
 * @example
 * ```tsx
 * <Tooltip.Root>
 *   <Tooltip.Trigger>Hover me</Tooltip.Trigger>
 *   <Tooltip.Positioner>
 *     <Tooltip.Content>Tooltip text</Tooltip.Content>
 *   </Tooltip.Positioner>
 * </Tooltip.Root>
 * ```
 */
export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Positioner: TooltipPositioner,
  Content: TooltipContent,
  Arrow: TooltipArrow,
  ArrowTip: TooltipArrowTip,
} as const

// ============================================
// CONTEXT HOOK
// ============================================

/**
 * useTooltipContext - Access tooltip state from within content
 *
 * @example
 * ```tsx
 * function CustomContent() {
 *   const { isOpen } = useTooltipContext()
 *   return <div>State: {isOpen ? 'Open' : 'Closed'}</div>
 * }
 * ```
 */
export const useTooltipContext = useChakraTooltipContext

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  TooltipRootProps as TooltipProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipPositionerProps,
  TooltipArrowProps,
  TooltipArrowTipProps,
}
