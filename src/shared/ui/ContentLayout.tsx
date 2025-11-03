/**
 * ContentLayout - Main content wrapper with semantic HTML
 *
 * LAYER 2: LAYOUT COMPONENTS
 * Purpose: Combines semantic <main> with flexible spacing system
 *
 * REFACTORED v3.0 (Semantic Architecture):
 * - ✅ Uses semantic <Main> component (Layer 3)
 * - ✅ Auto-generates skip link target ID
 * - ✅ ARIA label support for main content
 * - ✅ Consistent spacing system (tight/compact/normal/loose)
 * - ✅ Zero redundant Stack wrappers
 *
 * Architecture:
 * - Layer 3: <Main> (semantic HTML + ARIA)
 * - Layer 2: ContentLayout (styling + spacing) ← You are here
 * - Layer 1: Box, Stack (primitives)
 *
 * @example
 * // Basic usage
 * <ContentLayout spacing="compact">
 *   <Section>Content 1</Section>
 *   <Section>Content 2</Section>
 * </ContentLayout>
 *
 * @example
 * // With semantic label and skip link
 * <SkipLink />
 * <ContentLayout spacing="normal" mainLabel="Executive Dashboard">
 *   <Section>Dashboard content</Section>
 * </ContentLayout>
 *
 * Spacing options:
 * - tight: 16px gaps (dense dashboards)
 * - compact: 12px gaps, 16px padding (metrics-heavy pages)
 * - normal: 32px gaps (default, good breathing room)
 * - loose: 48px gaps (content-focused pages)
 */

import { Stack } from './Stack';
import { Main } from './semantic/Main';
import type { ReactNode } from 'react';
import type { SpacingProp } from './types';

interface ContentLayoutProps {
  /** Content to render inside layout */
  children: ReactNode;

  /** Spacing preset (default: normal) */
  spacing?: 'tight' | 'compact' | 'normal' | 'loose';

  /** Custom padding override */
  padding?: SpacingProp;

  /** ARIA label for main content region */
  mainLabel?: string;

  /** ID for skip link target (default: auto-generated) */
  skipLinkId?: string;

  /** Color palette for theming */
  colorPalette?: string;

  /** Additional className */
  className?: string;

  /** Any other props passed to Main component */
  [key: string]: any;
}

/**
 * ContentLayout - Semantic main content wrapper
 *
 * ✅ Uses Layer 3 semantic <Main> component
 * ✅ Flexible spacing system
 * ✅ WCAG 2.4.1 compliant (Bypass Blocks)
 */
export function ContentLayout({
  children,
  spacing = 'normal',
  padding,
  mainLabel,
  skipLinkId,
  colorPalette,
  className,
  ...chakraProps
}: ContentLayoutProps) {
  // Spacing map with both gap AND padding
  const spacingMap = {
    tight: { gap: '4', padding: '4' },     // 16px
    compact: { gap: '3', padding: '4' },   // 12px gap, 16px padding
    normal: { gap: '8', padding: '8' },    // 32px
    loose: { gap: '12', padding: '12' }    // 48px
  };

  const config = spacingMap[spacing];
  const finalPadding = padding ?? config.padding;

  // ✅ Uses semantic <Main> component (Layer 3)
  return (
    <Main
      label={mainLabel}
      skipLinkId={skipLinkId}
      width="full"
      bg="bg.canvas"
      p={finalPadding}
      colorPalette={colorPalette}
      className={className}
      {...chakraProps}
    >
      <Stack gap={config.gap} align="stretch">
        {children}
      </Stack>
    </Main>
  );
}
