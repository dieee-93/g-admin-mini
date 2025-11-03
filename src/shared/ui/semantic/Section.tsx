/**
 * SemanticSection Component - Semantic wrapper for content sections
 *
 * LAYER 3: SEMANTIC COMPONENTS
 * Purpose: Provides semantic HTML sectioning elements with ARIA support
 *
 * Features:
 * - Supports <section>, <article>, <aside>, <nav> elements
 * - Auto-generates hidden headings for screen readers
 * - ARIA live region support for dynamic content
 * - Stable ID generation with useId() (SSR-safe)
 * - Zero styling - pure semantics
 *
 * Best Practices (2024-2025):
 * - Uses React 18 useId() for stable SSR/CSR IDs
 * - Follows WAI-ARIA authoring practices
 * - Semantic HTML5 landmarks for better navigation
 * - Screen reader only headings for context
 *
 * @example
 * // Basic section
 * <SemanticSection heading="Sales Metrics">
 *   <YourContent />
 * </SemanticSection>
 *
 * @example
 * // Article with custom label
 * <SemanticSection as="article" label="Latest Blog Post">
 *   <YourContent />
 * </SemanticSection>
 *
 * @example
 * // Live region for alerts
 * <SemanticSection
 *   heading="System Alerts"
 *   live="polite"
 * >
 *   <AlertsView />
 * </SemanticSection>
 *
 * @example
 * // Aside for complementary content
 * <SemanticSection
 *   as="aside"
 *   heading="Related Articles"
 * >
 *   <RelatedContent />
 * </SemanticSection>
 */

import { useId } from 'react';
import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface SemanticSectionProps {
  /** Content to render inside section */
  children: ReactNode;

  /** HTML element to render (default: section) */
  as?: 'section' | 'article' | 'aside' | 'nav';

  /** Screen reader only heading (auto-generates h2 with hidden styles) */
  heading?: string;

  /** ARIA label (only if no heading or labelledBy) */
  label?: string;

  /** ID of element that labels this section */
  labelledBy?: string;

  /** ARIA live region for dynamic content */
  live?: 'off' | 'polite' | 'assertive';

  /** Whether to announce all content changes or only additions */
  atomic?: boolean;

  /** What types of changes should be announced */
  relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions removals';

  /** Additional className */
  className?: string;

  /** Any other props passed to Box/section element */
  [key: string]: any;
}

/**
 * SemanticSection - Semantic sectioning wrapper
 *
 * ✅ WAI-ARIA compliant landmarks
 * ✅ Auto-generates screen reader headings
 * ✅ SSR-safe ID generation with useId()
 * ✅ ARIA live region support
 * ✅ Zero styling - pure semantics
 */
export function SemanticSection({
  children,
  as = 'section',
  heading,
  label,
  labelledBy,
  live,
  atomic,
  relevant,
  className,
  ...rest
}: SemanticSectionProps) {
  // ✅ React 18 useId - generates stable ID for SSR/CSR
  const headingId = useId();

  // Auto-generate aria-labelledby if heading is provided
  const finalLabelledBy = heading ? `heading-${headingId}` : labelledBy;

  return (
    <Box
      as={as}
      role={as === 'section' ? 'region' : undefined}
      aria-label={!finalLabelledBy ? label : undefined}
      aria-labelledby={finalLabelledBy}
      aria-live={live}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={className}
      {...rest}
    >
      {/* ✅ Auto-generate visually hidden heading for screen readers */}
      {heading && (
        <Box
          as="h2"
          id={`heading-${headingId}`}
          position="absolute"
          width="1px"
          height="1px"
          padding="0"
          margin="-1px"
          overflow="hidden"
          clip="rect(0, 0, 0, 0)"
          whiteSpace="nowrap"
          border="0"
        >
          {heading}
        </Box>
      )}
      {children}
    </Box>
  );
}
