import { Button as ChakraButton } from '@chakra-ui/react'
import type { ReactNode, MouseEventHandler } from 'react'
import type { InteractiveAccessibilityProps } from './types/accessibility'

interface ButtonProps extends InteractiveAccessibilityProps {
  children: ReactNode
  variant?: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain'
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink'
  spinner?: ReactNode | undefined
  spinnerPlacement?: 'start' | 'end' | undefined
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  loading?: boolean
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
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
  leftIcon,
  rightIcon,
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
      {leftIcon}
      {children}
      {rightIcon}
    </ChakraButton>
  )
}