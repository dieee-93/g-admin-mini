import { ContentLayout, PageHeader } from '@/shared/ui';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { CompetitiveIntelligence } from './components';

function IntelligencePage() {
  return (
    <ContentLayout>
      <PageHeader
        title="Competitive Intelligence"
        subtitle="Market analysis and competitor tracking"
        icon={PresentationChartLineIcon}
      />
      <CompetitiveIntelligence />
    </ContentLayout>
  );
}

export default IntelligencePage;
