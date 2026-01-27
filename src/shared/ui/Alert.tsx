// ============================================
// ALERT - Chakra UI v3 Wrapper
// ============================================
// Wrapper for Chakra UI v3 Alert component
// Provides feedback messages to users

import { Alert as ChakraAlert } from '@chakra-ui/react';
import type { AlertRootProps } from '@chakra-ui/react';
import * as React from 'react';
import { tokens } from '../../theme/tokens';

type AlertStatus = 'info' | 'warning' | 'success' | 'error' | 'loading';

// ============================================
// HELPERS
// ============================================

const getStatusPalette = (status: AlertStatus = 'info') => {
  const map: Record<string, keyof typeof tokens.colors> = {
    info: 'primary',
    success: 'success',
    warning: 'warning',
    error: 'error',
    loading: 'primary',
  };
  const key = (status && map[status]) || 'primary';
  return tokens.colors[key as keyof typeof tokens.colors];
};

// ============================================
// ROOT
// ============================================

/**
 * Alert Root Component
 * Main container for alert messages
 */
export const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(
  (props, ref) => {
    const { status = 'info', ...rest } = props;
    // Cast status to string for helper, or ensure AlertRootProps status matches my type
    const palette = getStatusPalette(status as AlertStatus);

    return (
      <ChakraAlert.Root
        ref={ref}
        status={status}
        bg={palette[50]}
        borderColor={palette[500]}
        borderWidth="1px"
        color={palette[900]}
        {...rest}
      />
    );
  }
);

// ============================================
// INDICATOR
// ============================================

/**
 * Alert Indicator Component
 * Shows status icon
 */
export const AlertIndicator = ChakraAlert.Indicator;

// ============================================
// CONTENT
// ============================================

/**
 * Alert Content Component
 * Wrapper for title and description
 */
export const AlertContent = ChakraAlert.Content;

// ============================================
// TITLE
// ============================================

/**
 * Alert Title Component
 * Main alert message
 */
export const AlertTitle = ChakraAlert.Title;

// ============================================
// DESCRIPTION
// ============================================

/**
 * Alert Description Component
 * Additional alert details
 */
export const AlertDescription = ChakraAlert.Description;

// ============================================
// CONVENIENT WRAPPER
// ============================================

export interface AlertProps extends Omit<AlertRootProps, 'title'> {
  /** Icon element or custom start element */
  startElement?: React.ReactNode;
  /** Custom end element (e.g., close button) */
  endElement?: React.ReactNode;
  /** Action element (alias for endElement - more semantic for buttons) */
  action?: React.ReactNode;
  /** Alert title */
  title?: React.ReactNode;
  /** Alert description (children) */
  children?: React.ReactNode;
  /** Alert description (alias for children) */
  description?: React.ReactNode;
  /** Custom icon to override default status icon */
  icon?: React.ReactElement;
}

/**
 * Alert Convenient Component
 * Simplified Alert with automatic structure
 */
const AlertComponent = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    const { title, children, description, startElement, endElement, action, ...rest } = props;

    // Support both 'action' (semantic) and 'endElement' (explicit)
    // Support both 'description' and 'children' for alert content
    const finalEndElement = action || endElement;
    const finalDescription = description || children;
    
    // Get status palette for manual icon coloring
    const status = (rest.status as AlertStatus) || 'info';
    const palette = getStatusPalette(status);

    return (
      <AlertRoot ref={ref} {...rest}>
        {/* AlertIndicator does not accept children in Chakra v3, use default indicator */}
        {startElement || <ChakraAlert.Indicator color={palette[500]} />}
        {finalDescription ? (
          <ChakraAlert.Content>
            <ChakraAlert.Title>{title}</ChakraAlert.Title>
            <ChakraAlert.Description>{finalDescription}</ChakraAlert.Description>
          </ChakraAlert.Content>
        ) : (
          <ChakraAlert.Title flex="1">{title}</ChakraAlert.Title>
        )}
        {finalEndElement}
      </AlertRoot>
    );
  }
);

// Add compound component properties with proper typing
export const Alert = Object.assign(AlertComponent, {
  Root: AlertRoot,
  Indicator: AlertIndicator,
  Content: AlertContent,
  Title: AlertTitle,
  Description: AlertDescription,
});

// ============================================
// COMPOUND COMPONENT EXPORT
// ============================================

/**
 * Alert Compound Component
 *
 * @example
 * ```tsx
 * import { Alert } from '@/shared/ui';
 *
 * // Simple usage with convenience component
 * <Alert status="info" title="Information">
 *   This is an informational alert
 * </Alert>
 *
 * // Compound component usage (more control)
 * <Alert.Root status="success">
 *   <Alert.Indicator />
 *   <Alert.Content>
 *     <Alert.Title>Success!</Alert.Title>
 *     <Alert.Description>
 *       Your changes were saved successfully
 *     </Alert.Description>
 *   </Alert.Content>
 * </Alert.Root>
 *
 * // With all status types
 * <Alert status="error" title="Error">
 *   Something went wrong
 * </Alert>
 *
 * <Alert status="warning" title="Warning">
 *   Please review your input
 * </Alert>
 *
 * <Alert status="success" title="Success">
 *   Operation completed
 * </Alert>
 *
 * <Alert status="info" title="Info">
 *   Additional information
 * </Alert>
 *
 * // With variants
 * <Alert status="success" variant="subtle" title="Subtle">
 *   Default subtle variant
 * </Alert>
 *
 * <Alert status="success" variant="solid" title="Solid">
 *   Solid background variant
 * </Alert>
 *
 * <Alert status="success" variant="surface" title="Surface">
 *   Surface variant
 * </Alert>
 *
 * <Alert status="success" variant="outline" title="Outline">
 *   Outlined variant
 * </Alert>
 *
 * // With custom icon
 * <Alert.Root status="warning">
 *   <Alert.Indicator>
 *     <CustomIcon />
 *   </Alert.Indicator>
 *   <Alert.Title>Custom icon alert</Alert.Title>
 * </Alert.Root>
 *
 * // With action button
 * <Alert.Root status="info">
 *   <Alert.Indicator />
 *   <Alert.Content>
 *     <Alert.Title>Update Available</Alert.Title>
 *     <Alert.Description>
 *       A new version is ready to install
 *     </Alert.Description>
 *   </Alert.Content>
 *   <Button size="sm" alignSelf="center">Update</Button>
 * </Alert.Root>
 *
 * // With close button
 * import { CloseButton } from '@chakra-ui/react';
 *
 * <Alert.Root>
 *   <Alert.Indicator />
 *   <Alert.Content>
 *     <Alert.Title>Notification</Alert.Title>
 *     <Alert.Description>You have new messages</Alert.Description>
 *   </Alert.Content>
 *   <CloseButton />
 * </Alert.Root>
 *
 * // Sizes
 * <Alert status="info" title="Small" size="sm" />
 * <Alert status="info" title="Medium" size="md" />
 * <Alert status="info" title="Large" size="lg" />
 *
 * // Color palette override
 * <Alert status="info" colorPalette="teal" title="Custom Color">
 *   Info alert with teal color
 * </Alert>
 * ```
 */

// ============================================
// TYPE EXPORTS
// ============================================

export type { AlertRootProps };
