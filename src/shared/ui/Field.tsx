/**
 * FIELD COMPONENT - ChakraUI v3 Wrapper
 *
 * Form field wrapper with label, helper text, and error handling
 * Based on ChakraUI v3.23.0 Field component
 */

import { Field as ChakraField } from '@chakra-ui/react';
import type * as React from 'react';

// Re-export all Field namespace components
export const Field = {
  Root: ChakraField.Root,
  Label: ChakraField.Label,
  HelperText: ChakraField.HelperText,
  ErrorText: ChakraField.ErrorText,
  ErrorIcon: ChakraField.ErrorIcon,
  RequiredIndicator: ChakraField.RequiredIndicator,
  Input: ChakraField.Input,
  Select: ChakraField.Select,
  Textarea: ChakraField.Textarea,
  RootProvider: ChakraField.RootProvider,
};

// Type exports
export type FieldRootProps = React.ComponentProps<typeof ChakraField.Root>;
export type FieldLabelProps = React.ComponentProps<typeof ChakraField.Label>;
export type FieldHelperTextProps = React.ComponentProps<typeof ChakraField.HelperText>;
export type FieldErrorTextProps = React.ComponentProps<typeof ChakraField.ErrorText>;
