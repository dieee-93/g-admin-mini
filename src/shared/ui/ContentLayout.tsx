/**
 * ContentLayout - Page Content Wrapper
 * 
 * Simplified version aligned with Magic Patterns design.
 * Provides consistent spacing and max-width container for page content.
 * 
 * NOTE: AppShell already provides <main> element with padding,
 * so ContentLayout only handles gap spacing and maxWidth.
 * 
 * @example
 * <ContentLayout spacing="compact">
 *   <PageHeader title="My Page" />
 *   <Section>Content</Section>
 * </ContentLayout>
 */

import { Box, Stack } from '@/shared/ui';
import type { ReactNode } from 'react';

export interface ContentLayoutProps {
  /** Content to render */
  children: ReactNode;

  /**
   * Spacing preset (gap between sections)
   * - tight: 16px gaps (dense dashboards)
   * - compact: 12px gaps (pages with header) ← Most common
   * - normal: 32px gaps (default)
   * - spacious: 48px gaps (content-focused)
   */
  spacing?: 'tight' | 'compact' | 'normal' | 'spacious';

  /**
   * Max width of content container
   * Default: 100% (full width, no restriction)
   */
  maxW?: string;

  /**
   * ARIA label for main content (deprecated - AppShell handles this)
   * @deprecated Use for backward compatibility only
   */
  mainLabel?: string;
}

const SPACING_MAP = {
  tight: '4',      // 16px
  compact: '3',    // 12px
  normal: '8',     // 32px
  spacious: '12'   // 48px
} as const;

export function ContentLayout({
  children,
  spacing = 'normal',
  maxW = '100%',
  mainLabel // Ignored - kept for backward compatibility
}: ContentLayoutProps) {
  const gap = SPACING_MAP[spacing];

  return (
    <Box p={{ base: "6", md: "8" }} w="100%">
      <Stack
        gap={gap}
        w="100%"
      >
        {children}
      </Stack>
    </Box>
  );
}
