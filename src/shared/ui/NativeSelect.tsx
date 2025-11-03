/**
 * NativeSelect Component - ChakraUI v3 Wrapper
 *
 * Simple wrapper for native HTML select with ChakraUI v3 styling
 * Based on: https://www.chakra-ui.com/docs/components/native-select
 */

import { NativeSelect as ChakraNativeSelect } from '@chakra-ui/react';

// Re-export all NativeSelect parts
export const NativeSelectRoot = ChakraNativeSelect.Root;
export const NativeSelectField = ChakraNativeSelect.Field;
export const NativeSelectIndicator = ChakraNativeSelect.Indicator;

// Default export for convenience
export const NativeSelect = {
  Root: ChakraNativeSelect.Root,
  Field: ChakraNativeSelect.Field,
  Indicator: ChakraNativeSelect.Indicator,
};

export default NativeSelect;
