/**
 * SELECT - Chakra UI v3 Select Component
 * 
 * Re-exporta Select de Chakra UI con todas sus subcomponentes
 * Soporta el patrón compuesto: Select.Root, Select.Trigger, Select.Content, etc.
 */

import { Select as ChakraSelect } from '@chakra-ui/react'

// Re-exporta el namespace completo de Select
export const Select = ChakraSelect

// Re-exporta subcomponentes individuales para imports directos
export const SelectRoot = ChakraSelect.Root
export const SelectTrigger = ChakraSelect.Trigger
export const SelectContent = ChakraSelect.Content
export const SelectValueText = ChakraSelect.ValueText
export const SelectControl = ChakraSelect.Control
export const SelectIndicator = ChakraSelect.Indicator
export const SelectIndicatorGroup = ChakraSelect.IndicatorGroup
export const SelectItem = ChakraSelect.Item
export const SelectItemText = ChakraSelect.ItemText
export const SelectItemIndicator = ChakraSelect.ItemIndicator
export const SelectLabel = ChakraSelect.Label
export const SelectPositioner = ChakraSelect.Positioner
export const SelectHiddenSelect = ChakraSelect.HiddenSelect
export const SelectClearTrigger = ChakraSelect.ClearTrigger
export const SelectItemGroup = ChakraSelect.ItemGroup
export const SelectItemGroupLabel = ChakraSelect.ItemGroupLabel

// Re-exporta tipos
export type {
  SelectRootProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectValueTextProps,
  SelectControlProps,
  SelectIndicatorProps,
  SelectItemProps,
  SelectLabelProps,
} from '@chakra-ui/react'
