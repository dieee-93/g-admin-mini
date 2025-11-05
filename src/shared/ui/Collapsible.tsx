// ============================================
// COLLAPSIBLE - Chakra UI v3 Wrapper
// ============================================
// Wrapper for Chakra UI v3 Collapsible component
// Provides show/hide functionality with animation

import { Collapsible as ChakraCollapsible } from '@chakra-ui/react';
import type { CollapsibleRootProps } from '@chakra-ui/react';

// ============================================
// ROOT
// ============================================

export interface CollapsibleProps extends CollapsibleRootProps {
  children: React.ReactNode;
}

/**
 * Collapsible Root Component
 * Container for collapsible content
 */
export const CollapsibleRoot = ({ children, ...props }: CollapsibleProps) => {
  return <ChakraCollapsible.Root {...props}>{children}</ChakraCollapsible.Root>;
};

// ============================================
// TRIGGER
// ============================================

/**
 * Collapsible Trigger Component
 * Button that controls the collapsible state
 */
export const CollapsibleTrigger = ChakraCollapsible.Trigger;

// ============================================
// CONTENT
// ============================================

/**
 * Collapsible Content Component
 * Content that expands/collapses
 */
export const CollapsibleContent = ChakraCollapsible.Content;

// ============================================
// INDICATOR (Optional visual indicator)
// ============================================

/**
 * Collapsible Indicator Component
 * Optional visual indicator (e.g., chevron)
 */
export const CollapsibleIndicator = ChakraCollapsible.Indicator;

// ============================================
// COMPOUND COMPONENT EXPORT
// ============================================

/**
 * Collapsible Compound Component
 *
 * @example
 * ```tsx
 * import { Collapsible } from '@/shared/ui';
 *
 * // Basic usage
 * <Collapsible.Root>
 *   <Collapsible.Trigger paddingY={3}>
 *     Click to expand
 *   </Collapsible.Trigger>
 *   <Collapsible.Content>
 *     <Box padding={4} borderWidth="1px">
 *       This content can be collapsed
 *     </Box>
 *   </Collapsible.Content>
 * </Collapsible.Root>
 *
 * // With default open state
 * <Collapsible.Root defaultOpen>
 *   <Collapsible.Trigger>Toggle</Collapsible.Trigger>
 *   <Collapsible.Content>
 *     Content starts expanded
 *   </Collapsible.Content>
 * </Collapsible.Root>
 *
 * // Controlled state
 * const [open, setOpen] = useState(false);
 * <Collapsible.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
 *   <Collapsible.Trigger>Toggle</Collapsible.Trigger>
 *   <Collapsible.Content>
 *     Controlled content
 *   </Collapsible.Content>
 * </Collapsible.Root>
 *
 * // Lazy mounted (unmounts on exit)
 * <Collapsible.Root unmountOnExit>
 *   <Collapsible.Trigger>Toggle</Collapsible.Trigger>
 *   <Collapsible.Content>
 *     This unmounts when collapsed (better performance)
 *   </Collapsible.Content>
 * </Collapsible.Root>
 *
 * // With visual indicator (chevron)
 * <Collapsible.Root>
 *   <Collapsible.Trigger>
 *     <HStack>
 *       <Text>Toggle</Text>
 *       <Collapsible.Indicator>
 *         <ChevronDownIcon />
 *       </Collapsible.Indicator>
 *     </HStack>
 *   </Collapsible.Trigger>
 *   <Collapsible.Content>
 *     Content with indicator
 *   </Collapsible.Content>
 * </Collapsible.Root>
 * ```
 */
export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
  Indicator: CollapsibleIndicator
};

// ============================================
// TYPE EXPORTS
// ============================================

export type { CollapsibleRootProps };
