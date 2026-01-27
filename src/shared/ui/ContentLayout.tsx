/**
 * ContentLayout - Page Content Wrapper
 * 
 * Simplified version aligned with Magic Patterns design.
 * Provides consistent spacing and max-width container for page content.
 * 
 * NOTE: AppShell already provides <main> element, so ContentLayout
 * is just a spacing/container wrapper.
 * 
 * @example
 * <ContentLayout spacing="compact">
 *   <PageHeader title="My Page" />
 *   <Section>Content</Section>
 * </ContentLayout>
 */

import { Stack } from './Stack';
import type { ReactNode } from 'react';

export interface ContentLayoutProps {
  /** Content to render */
  children: ReactNode;

  /**
   * Spacing preset
   * - tight: 16px gaps (dense dashboards)
   * - compact: 12px gaps, 16px padding (pages with header) ← Most common
   * - normal: 32px gaps, 24px padding (default)
   * - spacious: 48px gaps, 32px padding (content-focused)
   */
  spacing?: 'tight' | 'compact' | 'normal' | 'spacious';

  /**
   * Max width of content container
   * Default: 1400px
   */
  maxW?: string;
}

const SPACING_MAP = {
  tight: { gap: '4', padding: '4' },      // 16px
  compact: { gap: '3', padding: '4' },    // 12px gap, 16px padding
  normal: { gap: '8', padding: '6' },     // 32px gap, 24px padding
  spacious: { gap: '12', padding: '8' }   // 48px gap, 32px padding
} as const;

export function ContentLayout({
  children,
  spacing = 'normal',
  maxW = '1400px'
}: ContentLayoutProps) {
  const config = SPACING_MAP[spacing];

  return (
    <Stack 
      gap={config.gap} 
      maxW={maxW} 
      mx="auto" 
      py={config.padding}
    >
      {children}
    </Stack>
  );
}
