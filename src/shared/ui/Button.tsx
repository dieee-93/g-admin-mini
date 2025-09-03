import { Button as ChakraButton } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { InteractiveAccessibilityProps } from './types/accessibility'

interface ButtonProps extends InteractiveAccessibilityProps {
  children: ReactNode
  variant?: 'solid' | 'outline' | 'ghost' | 'subtle'
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  spinner?: ReactNode | undefined
  spinnerPlacement?: 'start' | 'end' | undefined
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'solid',
  colorPalette,
  size = 'md',
  spinner,
  spinnerPlacement,
  loading,
  disabled,
  onClick,
  type = 'button',
  fullWidth = false,
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-pressed': ariaPressed,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  tabIndex,
  ...accessibilityProps
}: ButtonProps) {
  return (
    <ChakraButton
      variant={variant}
      colorPalette={colorPalette}
      size={size}
      loading={loading}
      spinner={spinner}
      spinnerPlacement={spinnerPlacement}
      disabled={disabled}
      onClick={onClick}
      type={type}
      width={fullWidth ? 'full' : 'auto'}
      // Accessibility props
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      tabIndex={tabIndex}
      {...accessibilityProps}
    >
      {children}
    </ChakraButton>
  )
}