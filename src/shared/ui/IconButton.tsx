/**
 * IconButton Component
 * Chakra UI v3 wrapper for IconButton with full prop support
 */

import { IconButton as ChakraIconButton } from '@chakra-ui/react';
import type { IconButtonProps as ChakraIconButtonProps } from '@chakra-ui/react';

export interface IconButtonProps extends ChakraIconButtonProps {
  // Inherits all Chakra IconButton props
  // Common props already included:
  // - aria-label: string (required for accessibility)
  // - variant: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain'
  // - size: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  // - colorPalette: color palette name
  // - loading: boolean
  // - disabled: boolean
  // - onClick: (event) => void
}

/**
 * IconButton - Button optimized for icon-only usage
 *
 * @example
 * ```tsx
 * import { IconButton } from '@/shared/ui';
 * import { TrashIcon } from '@heroicons/react/24/outline';
 *
 * <IconButton
 *   aria-label="Delete item"
 *   variant="ghost"
 *   size="sm"
 *   onClick={handleDelete}
 * >
 *   <TrashIcon style={{ width: '16px', height: '16px' }} />
 * </IconButton>
 * ```
 */
export const IconButton = (props: IconButtonProps) => {
  return <ChakraIconButton {...props} />;
};

// Re-export type for convenience
export type { ChakraIconButtonProps };
