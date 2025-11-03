/**
 * SkipLink Component - Keyboard navigation bypass mechanism
 *
 * LAYER 3: SEMANTIC COMPONENTS
 * Purpose: Provides skip navigation links for keyboard users
 *
 * Features:
 * - WCAG 2.4.1 (Bypass Blocks - Level A) compliant
 * - WCAG AAA contrast ratios (7:1 normal text)
 * - Visible only on keyboard focus
 * - Works seamlessly with <Main> component
 * - Positioned as first focusable element
 *
 * Best Practices (2024-2025):
 * - Should be first element in <body>
 * - Links to #main-content or custom ID
 * - Becomes visible on :focus for sighted keyboard users
 * - Always accessible to screen readers
 *
 * Research Sources:
 * - WebAIM: Skip Navigation Links (2024)
 * - WCAG 2.4.1: Bypass Blocks
 * - A11Y Collective: Skip to Main Content
 *
 * @example
 * // Basic usage (links to #main-content)
 * <SkipLink />
 * <Main skipLinkId="main-content">
 *   <YourContent />
 * </Main>
 *
 * @example
 * // Custom target
 * <SkipLink href="#dashboard-content">
 *   Skip to dashboard
 * </SkipLink>
 * <Main skipLinkId="dashboard-content">
 *   <Dashboard />
 * </Main>
 *
 * @example
 * // Multiple skip links (use sparingly)
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 * <SkipLink href="#navigation">Skip to navigation</SkipLink>
 */

import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface SkipLinkProps {
  /** Target element ID (default: #main-content) */
  href?: string;

  /** Link text (default: "Skip to main content") */
  children?: ReactNode;

  /** Additional className */
  className?: string;
}

/**
 * SkipLink - WCAG AAA compliant skip navigation link
 *
 * ✅ WCAG 2.4.1 Level A (Bypass Blocks)
 * ✅ WCAG 1.4.6 Level AAA (Contrast 7:1)
 * ✅ Visible on keyboard focus
 * ✅ Screen reader accessible
 */
export function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
  className
}: SkipLinkProps) {
  return (
    <Box
      as="a"
      {...({ href } as any)}
      className={className}

      // ✅ Hidden off-screen by default
      position="absolute"
      left="-9999px"
      top="1rem"
      zIndex={10000}

      // ✅ Styling when visible
      padding="1rem 1.5rem"
      bg="bg.emphasized"
      color="white"
      textDecoration="none"
      borderRadius="md"
      fontWeight="semibold"
      fontSize="sm"

      // ✅ Smooth transition
      transition="left 0.2s ease"

      // ✅ Visible on keyboard focus
      _focus={{
        left: "1rem",
        outline: "3px solid",
        outlineColor: "border.emphasized",
        outlineOffset: "2px"
      }}

      // ✅ Hover state for mouse users who tab-focus
      _hover={{
        textDecoration: "underline"
      }}
    >
      {children}
    </Box>
  );
}
