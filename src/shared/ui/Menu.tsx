/**
 * Menu Component - ChakraUI v3 Wrapper
 * Dropdown menu component for actions and navigation
 */

import {
  Menu as ChakraMenu,
  type MenuRootProps as ChakraMenuRootProps
} from '@chakra-ui/react';
import type { ComponentProps } from 'react';

// ============================================================================
// Root Component
// ============================================================================

export interface MenuRootProps extends ChakraMenuRootProps {}

export const MenuRoot = (props: MenuRootProps) => {
  return <ChakraMenu.Root {...props} />;
};

// ============================================================================
// Trigger Components
// ============================================================================

export interface MenuTriggerProps extends ComponentProps<typeof ChakraMenu.Trigger> {}

export const MenuTrigger = (props: MenuTriggerProps) => {
  return <ChakraMenu.Trigger {...props} />;
};

export interface MenuContextTriggerProps extends ComponentProps<typeof ChakraMenu.ContextTrigger> {}

export const MenuContextTrigger = (props: MenuContextTriggerProps) => {
  return <ChakraMenu.ContextTrigger {...props} />;
};

// ============================================================================
// Content Components
// ============================================================================

export interface MenuContentProps extends ComponentProps<typeof ChakraMenu.Content> {}

export const MenuContent = (props: MenuContentProps) => {
  return <ChakraMenu.Content {...props} />;
};

export interface MenuPositionerProps extends ComponentProps<typeof ChakraMenu.Positioner> {}

export const MenuPositioner = (props: MenuPositionerProps) => {
  return <ChakraMenu.Positioner {...props} />;
};

// ============================================================================
// Item Components
// ============================================================================

export interface MenuItemProps extends ComponentProps<typeof ChakraMenu.Item> {}

export const MenuItem = (props: MenuItemProps) => {
  return <ChakraMenu.Item {...props} />;
};

export interface MenuItemTextProps extends ComponentProps<typeof ChakraMenu.ItemText> {}

export const MenuItemText = (props: MenuItemTextProps) => {
  return <ChakraMenu.ItemText {...props} />;
};

export interface MenuItemCommandProps extends ComponentProps<typeof ChakraMenu.ItemCommand> {}

export const MenuItemCommand = (props: MenuItemCommandProps) => {
  return <ChakraMenu.ItemCommand {...props} />;
};

export interface MenuTriggerItemProps extends ComponentProps<typeof ChakraMenu.TriggerItem> {}

export const MenuTriggerItem = (props: MenuTriggerItemProps) => {
  return <ChakraMenu.TriggerItem {...props} />;
};

// ============================================================================
// Checkbox & Radio Items
// ============================================================================

export interface MenuCheckboxItemProps extends ComponentProps<typeof ChakraMenu.CheckboxItem> {}

export const MenuCheckboxItem = (props: MenuCheckboxItemProps) => {
  return <ChakraMenu.CheckboxItem {...props} />;
};

export interface MenuRadioItemProps extends ComponentProps<typeof ChakraMenu.RadioItem> {}

export const MenuRadioItem = (props: MenuRadioItemProps) => {
  return <ChakraMenu.RadioItem {...props} />;
};

export interface MenuRadioItemGroupProps extends ComponentProps<typeof ChakraMenu.RadioItemGroup> {}

export const MenuRadioItemGroup = (props: MenuRadioItemGroupProps) => {
  return <ChakraMenu.RadioItemGroup {...props} />;
};

// ============================================================================
// Group Components
// ============================================================================

export interface MenuItemGroupProps extends ComponentProps<typeof ChakraMenu.ItemGroup> {}

export const MenuItemGroup = (props: MenuItemGroupProps) => {
  return <ChakraMenu.ItemGroup {...props} />;
};

export interface MenuItemGroupLabelProps extends ComponentProps<typeof ChakraMenu.ItemGroupLabel> {}

export const MenuItemGroupLabel = (props: MenuItemGroupLabelProps) => {
  return <ChakraMenu.ItemGroupLabel {...props} />;
};

// ============================================================================
// Indicator Components
// ============================================================================

export interface MenuIndicatorProps extends ComponentProps<typeof ChakraMenu.Indicator> {}

export const MenuIndicator = (props: MenuIndicatorProps) => {
  return <ChakraMenu.Indicator {...props} />;
};

export interface MenuItemIndicatorProps extends ComponentProps<typeof ChakraMenu.ItemIndicator> {}

export const MenuItemIndicator = (props: MenuItemIndicatorProps) => {
  return <ChakraMenu.ItemIndicator {...props} />;
};

// ============================================================================
// Visual Components
// ============================================================================

export interface MenuSeparatorProps extends ComponentProps<typeof ChakraMenu.Separator> {}

export const MenuSeparator = (props: MenuSeparatorProps) => {
  return <ChakraMenu.Separator {...props} />;
};

export interface MenuArrowProps extends ComponentProps<typeof ChakraMenu.Arrow> {}

export const MenuArrow = (props: MenuArrowProps) => {
  return <ChakraMenu.Arrow {...props} />;
};

export interface MenuArrowTipProps extends ComponentProps<typeof ChakraMenu.ArrowTip> {}

export const MenuArrowTip = (props: MenuArrowTipProps) => {
  return <ChakraMenu.ArrowTip {...props} />;
};

// ============================================================================
// Re-export as named exports for convenience
// ============================================================================

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  ContextTrigger: MenuContextTrigger,
  Content: MenuContent,
  Positioner: MenuPositioner,
  Item: MenuItem,
  ItemText: MenuItemText,
  ItemCommand: MenuItemCommand,
  TriggerItem: MenuTriggerItem,
  CheckboxItem: MenuCheckboxItem,
  RadioItem: MenuRadioItem,
  RadioItemGroup: MenuRadioItemGroup,
  ItemGroup: MenuItemGroup,
  ItemGroupLabel: MenuItemGroupLabel,
  Indicator: MenuIndicator,
  ItemIndicator: MenuItemIndicator,
  Separator: MenuSeparator,
  Arrow: MenuArrow,
  ArrowTip: MenuArrowTip
};
