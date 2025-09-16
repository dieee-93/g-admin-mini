import { ContentLayout, PageHeader } from '@/shared/ui';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { CustomReporting } from './components';

function ReportingPage() {
  return (
    <ContentLayout>
      <PageHeader
        title="Reporting"
        subtitle="Generate custom reports and insights"
        icon={DocumentChartBarIcon}
      />
      <CustomReporting />
    </ContentLayout>
  );
}

export default ReportingPage;
