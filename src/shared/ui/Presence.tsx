/**
 * Presence Component
 * Chakra UI v3 wrapper for Presence with animation support
 */

import { Presence as ChakraPresence } from '@chakra-ui/react';
import type { PresenceProps as ChakraPresenceProps } from '@chakra-ui/react';

export interface PresenceProps extends ChakraPresenceProps {
  // Inherits all Chakra Presence props
  // Common props:
  // - present: boolean - Whether the node is present
  // - immediate: boolean - Whether to synchronize the present change immediately
  // - onExitComplete: () => void - Callback when animation ends in closed state
  // - animationName: object - Animation names for open/closed states
  // - animationDuration: 'fast' | 'moderate' | 'slow' | string - Animation duration
}

/**
 * Presence - Component for enter/exit animations
 *
 * Used to animate components on mount/unmount with controlled presence.
 *
 * @example
 * ```tsx
 * import { Presence } from '@/shared/ui';
 *
 * <Presence
 *   present={isVisible}
 *   animationName={{ _open: "fade-in", _closed: "fade-out" }}
 *   animationDuration="moderate"
 * >
 *   <div>Content to animate</div>
 * </Presence>
 * ```
 */
export const Presence = (props: PresenceProps) => {
  return <ChakraPresence {...props} />;
};

// Re-export type for convenience
export type { ChakraPresenceProps };
