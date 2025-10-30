import React from 'react';
import {
  ContentLayout, PageHeader, Section, Stack, Button, Badge, Tabs, Icon
} from '@/shared/ui';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  PresentationChartLineIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import NaturalLanguageBI from './components/NaturalLanguageBI';
import ExternalDataIntegration from './components/ExternalDataIntegration';
import AdvancedVisualization from './components/AdvancedVisualization';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

const ExecutiveDashboardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'executive' | 'nlp' | 'external' | 'visualizations'>('executive');

  React.useEffect(() => {
    // Emit module loaded event
    ModuleEventUtils.system.moduleLoaded('executive-bi');
  }, []);

  const quickActions = (
    <Stack direction="row" gap="sm">
      <Button
        onClick={() => setActiveTab('executive')}
        colorPalette="purple"
        size="sm"
      >
        <Icon icon={ChartBarIcon} size="sm" />
        Executive View
      </Button>
      <Button
        onClick={() => setActiveTab('nlp')}
        variant="outline"
        size="sm"
      >
        <Icon icon={ChatBubbleLeftRightIcon} size="sm" />
        Natural Language
      </Button>
      <Button
        onClick={() => setActiveTab('external')}
        variant="outline"
        size="sm"
      >
        <Icon icon={GlobeAltIcon} size="sm" />
        External Data
      </Button>
      <Button
        onClick={() => setActiveTab('visualizations')}
        variant="outline"
        size="sm"
      >
        <Icon icon={PresentationChartLineIcon} size="sm" />
        Advanced Charts
      </Button>
    </Stack>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'executive':
        return <ExecutiveDashboard />;
      case 'nlp':
        return <NaturalLanguageBI />;
      case 'external':
        return <ExternalDataIntegration />;
      case 'visualizations':
        return <AdvancedVisualization />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Executive Business Intelligence"
        subtitle="Dashboards ejecutivos, Natural Language BI y integración de datos externos para decisiones estratégicas"
        actions={quickActions}
      />

      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="executive">
            <Icon icon={UserGroupIcon} size="sm" />
            C-Suite Dashboard
          </Tabs.Trigger>
          <Tabs.Trigger value="nlp">
            <Icon icon={ChatBubbleLeftRightIcon} size="sm" />
            Natural Language BI
          </Tabs.Trigger>
          <Tabs.Trigger value="external">
            <Icon icon={GlobeAltIcon} size="sm" />
            External Data
          </Tabs.Trigger>
          <Tabs.Trigger value="visualizations">
            <Icon icon={PresentationChartLineIcon} size="sm" />
            Advanced Charts
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value={activeTab}>
          {renderTabContent()}
        </Tabs.Content>
      </Tabs.Root>
    </ContentLayout>
  );
};

export default ExecutiveDashboardsPage;