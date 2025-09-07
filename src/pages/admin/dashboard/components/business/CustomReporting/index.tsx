import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Tabs,
  Skeleton,
  SimpleGrid
} from '@chakra-ui/react';
import {
  DocumentChartBarIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CogIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/ui';

import { useReportingData } from './hooks/useReportingData';
import { useReportGeneration } from './hooks/useReportGeneration';
import { useReportBuilder } from './hooks/useReportBuilder';

import { ReportingSummary } from './components/ReportingSummary';
import { TemplatesTab } from './components/TemplatesTab';
import { GeneratedReportsTab } from './components/GeneratedReportsTab';
import { AutomationTab } from './components/AutomationTab';
import { InsightsTab } from './components/InsightsTab';
import { ReportBuilder } from './components/ReportBuilder';

export function CustomReporting() {
  const {
    templates,
    setTemplates,
    generatedReports,
    setGeneratedReports,
    automations,
    insights,
    loading,
    reportingSummary,
    toggleAutomation,
  } = useReportingData();

  const { isGenerating, generateReport } = useReportGeneration({
    templates,
    setTemplates,
    setGeneratedReports,
  });

  const {
    builderStep,
    setBuilderStep,
    newReport,
    setNewReport,
  } = useReportBuilder();

  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'automation' | 'insights' | 'builder'>('templates');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'green';
      case 'operational': return 'blue';
      case 'customer': return 'purple';
      case 'inventory': return 'orange';
      case 'staff': return 'pink';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'generating': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="80px" />
          <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="120px" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <VStack align="start" gap={3}>
          <HStack justify="space-between" w="full">
            <VStack align="start" gap={1}>
              <Text fontSize="3xl" fontWeight="bold">📊 Custom Reporting</Text>
              <Text color="gray.600">
                Constructor de reportes flexible con automatización y análisis inteligente
              </Text>
            </VStack>

            <HStack gap={2}>
              <Button
                colorPalette="blue"
                leftIcon={<PlusIcon className="w-4 h-4" />}
                onClick={() => {
                  setActiveTab('builder');
                  setBuilderStep('basic');
                }}
              >
                Nuevo Reporte
              </Button>
            </HStack>
          </HStack>

          <ReportingSummary summary={reportingSummary} />
        </VStack>

        {/* Main Content Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="templates">
              <HStack gap={2}>
                <DocumentChartBarIcon className="w-4 h-4" />
                <Text>Plantillas</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="generated">
              <HStack gap={2}>
                <ArrowDownTrayIcon className="w-4 h-4" />
                <Text>Reportes Generados</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="automation">
              <HStack gap={2}>
                <CogIcon className="w-4 h-4" />
                <Text>Automatización</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="insights">
              <HStack gap={2}>
                <ChartBarIcon className="w-4 h-4" />
                <Text>Insights</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="builder">
              <HStack gap={2}>
                <PlusIcon className="w-4 h-4" />
                <Text>Constructor</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            <Tabs.Content value="templates">
              <TemplatesTab
                templates={templates}
                getCategoryColor={getCategoryColor}
                generateReport={generateReport}
                isGenerating={isGenerating}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </Tabs.Content>

            <Tabs.Content value="generated">
              <GeneratedReportsTab
                reports={generatedReports}
                getStatusColor={getStatusColor}
              />
            </Tabs.Content>

            <Tabs.Content value="automation">
              <AutomationTab
                automations={automations}
                toggleAutomation={toggleAutomation}
              />
            </Tabs.Content>

            <Tabs.Content value="insights">
              <InsightsTab
                insights={insights}
                templates={templates}
              />
            </Tabs.Content>

            <Tabs.Content value="builder">
              <ReportBuilder />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}

export default CustomReporting;
