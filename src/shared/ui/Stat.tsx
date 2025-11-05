/**
 * Stat Component Wrapper
 * ChakraUI v3.23.0 Stat components
 */

import { Stat as ChakraStat } from '@chakra-ui/react';

// Re-export all Stat sub-components
export const StatRoot = ChakraStat.Root;
export const StatLabel = ChakraStat.Label;
export const StatValueText = ChakraStat.ValueText;
export const StatHelpText = ChakraStat.HelpText;
export const StatUpIndicator = ChakraStat.UpIndicator;
export const StatDownIndicator = ChakraStat.DownIndicator;
export const StatValueUnit = ChakraStat.ValueUnit;

// Create a namespace object for dot notation usage (Stat.Root, Stat.Label, etc.)
export const Stat = {
  Root: ChakraStat.Root,
  Label: ChakraStat.Label,
  ValueText: ChakraStat.ValueText,
  HelpText: ChakraStat.HelpText,
  UpIndicator: ChakraStat.UpIndicator,
  DownIndicator: ChakraStat.DownIndicator,
  ValueUnit: ChakraStat.ValueUnit,
} as const;
