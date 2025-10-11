// src/shared/ui/SegmentGroup.tsx
// SegmentGroup Component Wrapper for ChakraUI v3.23.0 - G-Admin Mini Design System

import React from 'react';
import { SegmentGroup as ChakraSegmentGroup } from '@chakra-ui/react';
import type { ReactNode } from 'react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface BaseSegmentGroupProps {
  // Core Props
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;

  // Form Props
  name?: string;
  form?: string;

  // Layout Props
  orientation?: 'horizontal' | 'vertical';

  // Styling Props
  colorPalette?: 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'cyan' | 'purple' | 'pink';
  size?: 'xs' | 'sm' | 'md' | 'lg';

  // Event Handlers
  onValueChange?: (details: { value: string }) => void;

  // Content Props
  children: ReactNode;

  // Additional Props
  className?: string;
  [key: string]: any;
}

interface SegmentItemProps {
  value: string;
  disabled?: boolean;
  invalid?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

// =============================================================================
// MAIN SEGMENTGROUP COMPONENT (Simplified Interface)
// =============================================================================

/**
 * SegmentGroup - Segmented Control for Toggle/Radio functionality
 *
 * Wrapper del SegmentGroup de Chakra v3 siguiendo el sistema de diseño G-Admin.
 *
 * @example
 * <SegmentGroup value="alerts" onValueChange={({ value }) => console.log(value)}>
 *   <SegmentItem value="alerts">Alertas</SegmentItem>
 *   <SegmentItem value="setup">Setup</SegmentItem>
 * </SegmentGroup>
 */
export const SegmentGroup: React.FC<BaseSegmentGroupProps> = ({
  value,
  defaultValue,
  disabled = false,
  readOnly = false,
  name,
  form,
  orientation = 'horizontal',
  colorPalette = 'gray',
  size = 'md',
  onValueChange,
  children,
  className,
  ...rest
}) => {
  return (
    <ChakraSegmentGroup.Root
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      form={form}
      orientation={orientation}
      colorPalette={colorPalette}
      size={size}
      onValueChange={onValueChange}
      className={className}
      width="fit-content"
      {...rest}
    >
      {children}
    </ChakraSegmentGroup.Root>
  );
};

// =============================================================================
// SEGMENTITEM COMPONENT
// =============================================================================

/**
 * SegmentItem - Item individual del SegmentGroup
 */
export const SegmentItem: React.FC<SegmentItemProps> = ({
  value,
  disabled = false,
  invalid = false,
  children,
  ...rest
}) => {
  return (
    <ChakraSegmentGroup.Item
      value={value}
      disabled={disabled}
      invalid={invalid}
      {...rest}
    >
      <ChakraSegmentGroup.ItemText>{children}</ChakraSegmentGroup.ItemText>
      <ChakraSegmentGroup.ItemHiddenInput />
    </ChakraSegmentGroup.Item>
  );
};

// =============================================================================
// SUBCOMPONENTS EXPORT (Advanced Usage)
// =============================================================================

export const SegmentGroupRoot = ChakraSegmentGroup.Root;
export const SegmentGroupItem = ChakraSegmentGroup.Item;
export const SegmentGroupItemText = ChakraSegmentGroup.ItemText;
export const SegmentGroupIndicator = ChakraSegmentGroup.Indicator;
export const SegmentGroupItemControl = ChakraSegmentGroup.ItemControl;
export const SegmentGroupItemHiddenInput = ChakraSegmentGroup.ItemHiddenInput;
export const SegmentGroupLabel = ChakraSegmentGroup.Label;
