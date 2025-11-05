/**
 * Section - Semantic content section with styling
 *
 * LAYER 2: LAYOUT COMPONENTS
 * Purpose: Combines semantic sectioning with visual design variants
 *
 * REFACTORED v3.0 (Semantic Architecture):
 * - ✅ Uses semantic <SemanticSection> component (Layer 3)
 * - ✅ Auto-generates hidden headings for screen readers
 * - ✅ ARIA live region support for dynamic content
 * - ✅ Visual variants (default/elevated/flat)
 * - ✅ Separation of semantics (Layer 3) from styling (Layer 2)
 *
 * Architecture:
 * - Layer 3: <SemanticSection> (semantic HTML + ARIA)
 * - Layer 2: Section (styling + variants) ← You are here
 * - Layer 1: Box, Stack, Typography (primitives)
 *
 * @example
 * // Basic section with visual styling
 * <Section variant="elevated" title="Sales Metrics">
 *   <YourContent />
 * </Section>
 *
 * @example
 * // Section with semantic heading for screen readers
 * <Section
 *   variant="flat"
 *   title="Metrics"
 *   semanticHeading="Sales Performance Metrics"
 * >
 *   <MetricsGrid />
 * </Section>
 *
 * @example
 * // Article with live region for dynamic content
 * <Section
 *   as="article"
 *   variant="elevated"
 *   title="Latest Updates"
 *   semanticHeading="System Alerts and Notifications"
 *   live="polite"
 * >
 *   <AlertsView />
 * </Section>
 *
 * @example
 * // Aside for complementary content
 * <Section
 *   as="aside"
 *   variant="default"
 *   title="Quick Stats"
 *   semanticHeading="Performance Statistics"
 * >
 *   <StatsGrid />
 * </Section>
 */

import { Stack, HStack, Box } from '@chakra-ui/react';
import { SemanticSection } from './semantic/Section';
import { Typography } from './Typography';
import { Icon } from './Icon';
import type { ReactNode } from 'react';

interface SectionProps {
  // ===== PRESENTATIONAL PROPS (Layer 2) =====

  /** Visual variant for styling */
  variant?: 'default' | 'elevated' | 'flat';

  /** Visual title (displayed) */
  title?: string;

  /** Visual subtitle (displayed) */
  subtitle?: string;

  /** Icon component to display next to title */
  icon?: React.ComponentType<any>;

  /** Action buttons/controls in header */
  actions?: ReactNode;

  /** Color palette for theming */
  colorPalette?: string;

  // ===== SEMANTIC PROPS (delegated to Layer 3) =====

  /** HTML element to render (default: section) */
  as?: 'section' | 'article' | 'aside' | 'nav';

  /** Hidden heading for screen readers (auto-generates <h2>) */
  semanticHeading?: string;

  /** ARIA label (only if no semanticHeading) */
  ariaLabel?: string;

  /** ID of element that labels this section */
  ariaLabelledBy?: string;

  /** ARIA live region for dynamic content */
  live?: 'off' | 'polite' | 'assertive';

  /** Whether to announce all content changes */
  atomic?: boolean;

  /** What types of changes to announce */
  relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions removals';

  // ===== COMMON PROPS =====

  /** Content to render */
  children: ReactNode;

  /** Additional className */
  className?: string;

  /** Any other props passed to SemanticSection */
  [key: string]: any;
}

/**
 * Section - Styled semantic section component
 *
 * ✅ Uses Layer 3 semantic <SemanticSection>
 * ✅ Visual variants for different contexts
 * ✅ Auto-generates screen reader headings
 * ✅ ARIA live region support
 */
export function Section({
  // Presentational
  variant = 'default',
  title,
  subtitle,
  icon: IconComponent,
  actions,
  colorPalette,

  // Semantic
  as = 'section',
  semanticHeading,
  ariaLabel,
  ariaLabelledBy,
  live,
  atomic,
  relevant,

  // Common
  children,
  className,
  ...rest
}: SectionProps) {
  // ===== VISUAL STYLING (Layer 2 responsibility) =====
  const variantStyles = {
    default: {
      bg: 'gray.00',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      borderRadius: 'lg',
      p: '8',
      mb: '8',
      shadow: 'sm'
    },
    elevated: {
      bg: 'gray.50',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'border.default',
      borderRadius: 'lg',
      p: '8',
      mb: '8',
      shadow: 'lg',
      position: 'relative' as const
    },
    flat: {
      p: '8',
      mb: '6',
      bg: 'transparent',
      color: 'text.primary'
    }
  };

  // ===== VISUAL HEADER (optional) =====
  const renderHeader = () => {
    if (!title && !IconComponent && !actions) return null;

    return (
      <HStack justify="space-between" align="center" mb="6">
        <HStack align="center" gap="3">
          {IconComponent && (
            <Icon
              icon={IconComponent}
              size="xl"
              color="text.muted"
            />
          )}
          <Stack gap="1">
            {title && (
              <Typography
                variant="heading"
                size="xl"
                weight="bold"
                color="text.primary"
                lineHeight="1.2"
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body"
                size="md"
                color="text.muted"
                lineHeight="1.4"
              >
                {subtitle}
              </Typography>
            )}
          </Stack>
        </HStack>
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </HStack>
    );
  };

  // ===== RENDER =====
  // Layer 3 (SemanticSection) handles semantics + ARIA
  // Layer 2 (this component) handles styling + visual layout
  return (
    <SemanticSection
      as={as}
      heading={semanticHeading}
      label={ariaLabel}
      labelledBy={ariaLabelledBy}
      live={live}
      atomic={atomic}
      relevant={relevant}
      className={className}
      colorPalette={colorPalette}
      {...variantStyles[variant]}
      {...rest}
    >
      {renderHeader()}
      <Stack gap="4">
        {children}
      </Stack>
    </SemanticSection>
  );
}
