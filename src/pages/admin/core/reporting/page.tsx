/**
 * Reporting Page - Custom Reports & Business Insights
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 */

import { ContentLayout, Section, SkipLink } from '@/shared/ui';
import { CustomReporting } from './components';

function ReportingPage() {
  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Custom Reporting">

        {/* ✅ REPORTING SECTION - Main content area */}
        <Section
          variant="elevated"
          title="Report Builder"
          subtitle="Generate custom reports and business insights"
          semanticHeading="Custom Report Builder Dashboard"
        >
          <CustomReporting />
        </Section>

      </ContentLayout>
    </>
  );
}

export default ReportingPage;
