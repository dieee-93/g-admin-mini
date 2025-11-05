/**
 * Drawer Component - ChakraUI v3 Wrapper
 * Slide-out panel component for overlays and side panels
 */

import {
  Drawer as ChakraDrawer,
  type DrawerRootProps as ChakraDrawerRootProps
} from '@chakra-ui/react';
import type { ComponentProps } from 'react';

// ============================================================================
// Root Component
// ============================================================================

export interface DrawerRootProps extends ChakraDrawerRootProps {}

export const DrawerRoot = (props: DrawerRootProps) => {
  return <ChakraDrawer.Root {...props} />;
};

// ============================================================================
// Trigger Components
// ============================================================================

export interface DrawerTriggerProps extends ComponentProps<typeof ChakraDrawer.Trigger> {}

export const DrawerTrigger = (props: DrawerTriggerProps) => {
  return <ChakraDrawer.Trigger {...props} />;
};

export interface DrawerActionTriggerProps extends ComponentProps<typeof ChakraDrawer.ActionTrigger> {}

export const DrawerActionTrigger = (props: DrawerActionTriggerProps) => {
  return <ChakraDrawer.ActionTrigger {...props} />;
};

export interface DrawerCloseTriggerProps extends ComponentProps<typeof ChakraDrawer.CloseTrigger> {}

export const DrawerCloseTrigger = (props: DrawerCloseTriggerProps) => {
  return <ChakraDrawer.CloseTrigger {...props} />;
};

// ============================================================================
// Content Components
// ============================================================================

export interface DrawerBackdropProps extends ComponentProps<typeof ChakraDrawer.Backdrop> {}

export const DrawerBackdrop = (props: DrawerBackdropProps) => {
  return <ChakraDrawer.Backdrop {...props} />;
};

export interface DrawerPositionerProps extends ComponentProps<typeof ChakraDrawer.Positioner> {}

export const DrawerPositioner = (props: DrawerPositionerProps) => {
  return <ChakraDrawer.Positioner {...props} />;
};

export interface DrawerContentProps extends ComponentProps<typeof ChakraDrawer.Content> {}

export const DrawerContent = (props: DrawerContentProps) => {
  return <ChakraDrawer.Content {...props} />;
};

// ============================================================================
// Structure Components
// ============================================================================

export interface DrawerHeaderProps extends ComponentProps<typeof ChakraDrawer.Header> {}

export const DrawerHeader = (props: DrawerHeaderProps) => {
  return <ChakraDrawer.Header {...props} />;
};

export interface DrawerBodyProps extends ComponentProps<typeof ChakraDrawer.Body> {}

export const DrawerBody = (props: DrawerBodyProps) => {
  return <ChakraDrawer.Body {...props} />;
};

export interface DrawerFooterProps extends ComponentProps<typeof ChakraDrawer.Footer> {}

export const DrawerFooter = (props: DrawerFooterProps) => {
  return <ChakraDrawer.Footer {...props} />;
};

// ============================================================================
// Text Components
// ============================================================================

export interface DrawerTitleProps extends ComponentProps<typeof ChakraDrawer.Title> {}

export const DrawerTitle = (props: DrawerTitleProps) => {
  return <ChakraDrawer.Title {...props} />;
};

export interface DrawerDescriptionProps extends ComponentProps<typeof ChakraDrawer.Description> {}

export const DrawerDescription = (props: DrawerDescriptionProps) => {
  return <ChakraDrawer.Description {...props} />;
};

// ============================================================================
// Re-export as named exports for convenience
// ============================================================================

export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  ActionTrigger: DrawerActionTrigger,
  CloseTrigger: DrawerCloseTrigger,
  Backdrop: DrawerBackdrop,
  Positioner: DrawerPositioner,
  Content: DrawerContent,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Title: DrawerTitle,
  Description: DrawerDescription
};
