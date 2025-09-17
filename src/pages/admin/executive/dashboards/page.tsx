import React from 'react';
import {
  ContentLayout, PageHeader, Section, Stack, Button, Badge, Tabs
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
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
        <Icon name="ChartBarIcon" />
        Executive View
      </Button>
      <Button
        onClick={() => setActiveTab('nlp')}
        variant="outline"
        size="sm"
      >
        <Icon name="ChatBubbleLeftRightIcon" />
        Natural Language
      </Button>
      <Button
        onClick={() => setActiveTab('external')}
        variant="outline"
        size="sm"
      >
        <Icon name="GlobeAltIcon" />
        External Data
      </Button>
      <Button
        onClick={() => setActiveTab('visualizations')}
        variant="outline"
        size="sm"
      >
        <Icon name="PresentationChartLineIcon" />
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
        icon="PresentationChartLineIcon"
        actions={quickActions}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="executive">
            <Icon name="UserGroupIcon" />
            C-Suite Dashboard
          </Tabs.Trigger>
          <Tabs.Trigger value="nlp">
            <Icon name="ChatBubbleLeftRightIcon" />
            Natural Language BI
          </Tabs.Trigger>
          <Tabs.Trigger value="external">
            <Icon name="GlobeAltIcon" />
            External Data
          </Tabs.Trigger>
          <Tabs.Trigger value="visualizations">
            <Icon name="PresentationChartLineIcon" />
            Advanced Charts
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value={activeTab}>
          {renderTabContent()}
        </Tabs.Content>
      </Tabs>
    </ContentLayout>
  );
};

export default ExecutiveDashboardsPage;