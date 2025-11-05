/**
 * NumberInput Component Wrapper
 * ChakraUI v3.23.0 NumberInput components
 *
 * IMPORTANT: This wrapper prevents circular dependency issues
 * in the vendor-ui bundle that can cause TDZ (Temporal Dead Zone) errors.
 */

import { NumberInput as ChakraNumberInput } from '@chakra-ui/react';

// Export the NumberInput namespace
export const NumberInput = ChakraNumberInput;

// Export all NumberInput sub-components for convenience
export const NumberInputRoot = ChakraNumberInput.Root;
// NOTE: Field is NOT part of NumberInput namespace in Chakra v3
// Use the Input component from NumberInput instead
export const NumberInputInput = ChakraNumberInput.Input;
export const NumberInputControl = ChakraNumberInput.Control;
export const NumberInputIncrementTrigger = ChakraNumberInput.IncrementTrigger;
export const NumberInputDecrementTrigger = ChakraNumberInput.DecrementTrigger;
export const NumberInputLabel = ChakraNumberInput.Label;
export const NumberInputValueText = ChakraNumberInput.ValueText;
export const NumberInputScrubber = ChakraNumberInput.Scrubber;
