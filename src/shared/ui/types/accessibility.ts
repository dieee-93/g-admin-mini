/**
 * Standard accessibility props for all components
 * Based on WAI-ARIA guidelines and React best practices
 */
export interface AccessibilityProps {
  // ARIA attributes
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-checked'?: boolean | 'mixed'
  'aria-disabled'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
  
  // Role
  role?: string
  
  // Interactive states
  tabIndex?: number
  
  // Focus management
  autoFocus?: boolean
  
  // Screen reader
  title?: string
}

/**
 * Form-specific accessibility props
 */
export interface FormAccessibilityProps extends AccessibilityProps {
  'aria-invalid'?: boolean
  'aria-required'?: boolean
  'aria-readonly'?: boolean
  'aria-placeholder'?: string
  'aria-errormessage'?: string
}

/**
 * Navigation accessibility props
 */
export interface NavigationAccessibilityProps extends AccessibilityProps {
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
}

/**
 * Container accessibility props
 */
export interface ContainerAccessibilityProps extends AccessibilityProps {
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-owns'?: string
}

/**
 * Interactive accessibility props
 */
export interface InteractiveAccessibilityProps extends AccessibilityProps {
  'aria-pressed'?: boolean
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

/**
 * Default accessibility configurations for common patterns
 */
export const accessibilityDefaults = {
  button: {
    role: 'button',
    tabIndex: 0,
  },
  link: {
    role: 'link',
    tabIndex: 0,
  },
  heading: {
    role: 'heading',
  },
  list: {
    role: 'list',
  },
  listitem: {
    role: 'listitem',
  },
  navigation: {
    role: 'navigation',
  },
  main: {
    role: 'main',
  },
  complementary: {
    role: 'complementary',
  },
  banner: {
    role: 'banner',
  },
  contentinfo: {
    role: 'contentinfo',
  },
  dialog: {
    role: 'dialog',
    'aria-modal': true,
  },
  alert: {
    role: 'alert',
    'aria-live': 'assertive' as const,
  },
  status: {
    role: 'status',
    'aria-live': 'polite' as const,
  },
  tab: {
    role: 'tab',
    tabIndex: -1,
  },
  tabpanel: {
    role: 'tabpanel',
    tabIndex: 0,
  },
  tablist: {
    role: 'tablist',
  },
} as const

/**
 * Utility to merge accessibility props with defaults
 */
export function withAccessibilityDefaults<T extends AccessibilityProps>(
  props: T,
  defaults: Partial<AccessibilityProps>
): T {
  return {
    ...defaults,
    ...props,
  }
}

/**
 * Utility to validate required accessibility props
 */
export function validateAccessibility(
  componentName: string,
  props: AccessibilityProps,
  requiredProps: (keyof AccessibilityProps)[]
) {
  const missing = requiredProps.filter(prop => !props[prop])
  
  if (missing.length > 0) {
    console.warn(
      `${componentName}: Missing required accessibility props: ${missing.join(', ')}`
    )
  }
}

/**
 * Hook for managing focus within component
 */
export function useFocusManagement() {
  const focusableElementsSelector = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  const getFocusableElements = (container: HTMLElement) => {
    return container.querySelectorAll(focusableElementsSelector)
  }

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  }

  return { getFocusableElements, trapFocus }
}