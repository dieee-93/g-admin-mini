/**
 * Main Component - Semantic wrapper for main content
 *
 * LAYER 3: SEMANTIC COMPONENTS
 * Purpose: Provides semantic HTML <main> element with ARIA support
 *
 * Features:
 * - Auto-generates stable IDs for skip links (SSR-safe with useId)
 * - ARIA label support (aria-label, aria-labelledby)
 * - Works seamlessly with <SkipLink> component
 * - Zero styling - pure semantics
 *
 * Best Practices (2024-2025):
 * - Uses React 18 useId() for stable SSR/CSR IDs
 * - Follows WCAG 2.4.1 (Bypass Blocks - Level A)
 * - One <main> per page (enforced by HTML5 spec)
 *
 * @example
 * // Basic usage
 * <Main>
 *   <YourContent />
 * </Main>
 *
 * @example
 * // With skip link support
 * <SkipLink />
 * <Main skipLinkId="main-content">
 *   <YourContent />
 * </Main>
 *
 * @example
 * // With ARIA label
 * <Main label="Executive Dashboard">
 *   <YourContent />
 * </Main>
 */

import { useId } from 'react';
import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface MainProps {
  /** Content to render inside <main> */
  children: ReactNode;

  /** ARIA label for main content region */
  label?: string;

  /** ID of element that labels this main content */
  labelledBy?: string;

  /** ID for skip link target (default: auto-generated) */
  skipLinkId?: string;

  /** Additional className */
  className?: string;

  /** Any other props passed to Box/main element */
  [key: string]: any;
}

/**
 * Main - Semantic <main> wrapper component
 *
 * ✅ WCAG 2.4.1 compliant (Bypass Blocks)
 * ✅ SSR-safe ID generation with useId()
 * ✅ Zero styling - pure semantics
 */
export function Main({
  children,
  label,
  labelledBy,
  skipLinkId,
  className,
  ...rest
}: MainProps) {
  // ✅ React 18 useId - generates stable ID for SSR/CSR
  const autoId = useId();
  const finalId = skipLinkId || `main-content-${autoId}`;

  return (
    <Box
      as="main"
      role="main"
      id={finalId}
      aria-label={!labelledBy ? label : undefined}
      aria-labelledby={labelledBy}
      className={className}
      {...rest}
    >
      {children}
    </Box>
  );
}
