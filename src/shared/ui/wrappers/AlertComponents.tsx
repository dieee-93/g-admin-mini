/**
 * Alert Components - Wrappers para mejor trazabilidad en React Scan
 *
 * Estos wrappers permiten identificar componentes específicos del sistema de alertas
 * en React DevTools y React Scan, en lugar de ver nombres genéricos como "Box" o "Stack"
 *
 * @example
 * // ❌ Antes: React Scan muestra "Box", "Stack", "Button"
 * <Box>
 *   <Stack direction="row">
 *     <Button>Action</Button>
 *   </Stack>
 * </Box>
 *
 * // ✅ Después: React Scan muestra "AlertContainer", "AlertActions", "AlertButton"
 * <AlertContainer>
 *   <AlertActions>
 *     <AlertButton>Action</AlertButton>
 *   </AlertActions>
 * </AlertContainer>
 */

import { memo, type ReactNode } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';
import { Stack, type StackProps, Button, type ButtonProps, Badge, type BadgeProps } from '@/shared/ui';

// ============================================
// CONTAINERS
// ============================================

/**
 * AlertContainer - Contenedor principal de alertas
 * Wrapper de Box para identificar contenedores de alertas en React Scan
 */
export const AlertContainer = memo(function AlertContainer(props: BoxProps) {
  return <Box {...props} />;
});
AlertContainer.displayName = 'AlertContainer';

/**
 * AlertContentBox - Contenedor de contenido de alerta
 * Nota: Renombrado para evitar conflicto con AlertContent de Chakra
 */
export const AlertContentBox = memo(function AlertContentBox(props: BoxProps) {
  return <Box {...props} />;
});
AlertContentBox.displayName = 'AlertContentBox';

// ============================================
// LAYOUT
// ============================================

/**
 * AlertStack - Stack para organizar alertas verticalmente
 */
export const AlertStack = memo(function AlertStack(props: StackProps) {
  return <Stack direction="column" {...props} />;
});
AlertStack.displayName = 'AlertStack';

/**
 * AlertActions - Stack horizontal para botones de acción
 */
export const AlertActions = memo(function AlertActions(props: StackProps) {
  return <Stack direction="row" {...props} />;
});
AlertActions.displayName = 'AlertActions';

/**
 * AlertHeader - Stack horizontal para encabezados de alerta
 */
export const AlertHeader = memo(function AlertHeader(props: StackProps) {
  return <Stack direction="row" {...props} />;
});
AlertHeader.displayName = 'AlertHeader';

// ============================================
// ACTIONS
// ============================================

interface AlertButtonProps extends ButtonProps {
  action?: 'acknowledge' | 'resolve' | 'dismiss' | 'view' | 'custom';
}

/**
 * AlertButton - Botón para acciones de alerta
 */
export const AlertButton = memo(function AlertButton({ action, ...props }: AlertButtonProps) {
  return <Button {...props} />;
});
AlertButton.displayName = 'AlertButton';

// ============================================
// BADGES
// ============================================

interface AlertBadgeProps extends BadgeProps {
  type?: 'count' | 'severity' | 'status' | 'custom';
}

/**
 * AlertBadge - Badge para mostrar información de alertas
 */
export const AlertBadge = memo(function AlertBadge({ type, ...props }: AlertBadgeProps) {
  return <Badge {...props} />;
});
AlertBadge.displayName = 'AlertBadge';

// ============================================
// SPECIALIZED WRAPPERS
// ============================================

/**
 * AlertListItem - Wrapper para items individuales en lista de alertas
 */
export const AlertListItem = memo(function AlertListItem({ children, ...props }: BoxProps) {
  return (
    <Box
      p="3"
      borderRadius="md"
      borderWidth="1px"
      {...props}
    >
      {children}
    </Box>
  );
});
AlertListItem.displayName = 'AlertListItem';

/**
 * AlertMetadata - Contenedor para metadata de alertas
 */
export const AlertMetadata = memo(function AlertMetadata(props: StackProps) {
  return <Stack direction="row" gap="xs" fontSize="sm" color="gray.600" {...props} />;
});
AlertMetadata.displayName = 'AlertMetadata';

// ============================================
// EXPORTS
// ============================================

export const AlertComponents = {
  Container: AlertContainer,
  ContentBox: AlertContentBox,
  Stack: AlertStack,
  Actions: AlertActions,
  Header: AlertHeader,
  Button: AlertButton,
  Badge: AlertBadge,
  ListItem: AlertListItem,
  Metadata: AlertMetadata,
} as const;
