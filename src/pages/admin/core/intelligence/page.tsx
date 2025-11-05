/**
 * Intelligence Page - Competitive Intelligence & Market Analysis
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 */

import { ContentLayout, Section, SkipLink } from '@/shared/ui';
import { CompetitiveIntelligence } from './components';

function IntelligencePage() {
  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Competitive Intelligence">

        {/* ✅ INTELLIGENCE SECTION - Main content area */}
        <Section
          variant="elevated"
          title="Market Analysis"
          subtitle="Competitive intelligence and market tracking"
          semanticHeading="Competitive Intelligence Dashboard"
        >
          <CompetitiveIntelligence />
        </Section>

      </ContentLayout>
    </>
  );
}

export default IntelligencePage;
