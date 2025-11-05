/**
 * Flex Component Wrapper
 *
 * Semantic wrapper around Chakra UI v3 Flex component
 * Supports all Chakra v3 Flex props + custom extensions
 *
 * @see https://www.chakra-ui.com/docs/components/flex
 */

import { Flex as ChakraFlex } from '@chakra-ui/react';
import type { FlexProps as ChakraFlexProps } from '@chakra-ui/react';

export interface FlexProps extends ChakraFlexProps {
  // Add any custom props here if needed in the future
}

/**
 * Flex wrapper component
 *
 * A layout component that uses CSS Flexbox.
 * Shorthand for `<Box display="flex" />`
 *
 * @example
 * ```tsx
 * <Flex direction="row" gap="4" align="center">
 *   <Box>Item 1</Box>
 *   <Box>Item 2</Box>
 * </Flex>
 * ```
 */
export const Flex = (props: FlexProps) => {
  return <ChakraFlex {...props} />;
};

Flex.displayName = 'Flex';

export default Flex;
