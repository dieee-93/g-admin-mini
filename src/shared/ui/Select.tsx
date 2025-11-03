/**
 * Select Component Wrapper
 *
 * Re-exports Chakra UI v3 Select namespace components
 * Following G-Admin Mini design system conventions
 */

import { Select as ChakraSelect } from '@chakra-ui/react';

// Re-export Select namespace and all sub-components
export const Select = ChakraSelect;
export const SelectRoot = ChakraSelect.Root;
export const SelectTrigger = ChakraSelect.Trigger;
export const SelectContent = ChakraSelect.Content;
export const SelectItem = ChakraSelect.Item;
export const SelectValueText = ChakraSelect.ValueText;
export const SelectLabel = ChakraSelect.Label;
export const SelectControl = ChakraSelect.Control;
export const SelectIndicator = ChakraSelect.Indicator;
export const SelectIndicatorGroup = ChakraSelect.IndicatorGroup;
export const SelectPositioner = ChakraSelect.Positioner;
export const SelectItemIndicator = ChakraSelect.ItemIndicator;
export const SelectHiddenSelect = ChakraSelect.HiddenSelect;
export const SelectItemText = ChakraSelect.ItemText;
export const SelectClearTrigger = ChakraSelect.ClearTrigger;

// Export types if needed
export type { SelectRootProps } from '@chakra-ui/react';
