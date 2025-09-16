import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  type ReportTemplate,
  type GeneratedReport,
  type ReportAutomation,
  type ReportInsight,
} from '../types';
import {
  generateMockReportingData
} from '../../../data/mockData';

export function useReportingData() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [automations, setAutomations] = useState<ReportAutomation[]>([]);
  const [insights, setInsights] = useState<ReportInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportingData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockData = generateMockReportingData();
        const mockTemplates = mockData.templates;
        const mockGenerated = mockData.generatedReports;
        const mockAutomations = [];
        const mockInsights = [];

        setTemplates(mockTemplates);
        setGeneratedReports(mockGenerated);
        setAutomations(mockAutomations);
        setInsights(mockInsights);

      } catch (error) {
        console.error('Error loading custom reporting data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportingData();
  }, []);

  const reportingSummary = useMemo(() => {
    const totalTemplates = templates.length;
    const activeTemplates = templates.filter(t => t.isActive).length;
    const scheduledReports = templates.filter(t => t.schedule?.isEnabled).length;
    const totalGenerated = generatedReports.length;
    const activeAutomations = automations.filter(a => a.isEnabled).length;
    const totalInsights = insights.length;

    return {
      totalTemplates,
      activeTemplates,
      scheduledReports,
      totalGenerated,
      activeAutomations,
      totalInsights
    };
  }, [templates, generatedReports, automations, insights]);

  const toggleAutomation = useCallback((automationId: string) => {
    setAutomations(prev => prev.map(automation =>
      automation.id === automationId
        ? { ...automation, isEnabled: !automation.isEnabled }
        : automation
    ));
  }, []);

  return {
    templates,
    setTemplates,
    generatedReports,
    setGeneratedReports,
    automations,
    insights,
    loading,
    reportingSummary,
    toggleAutomation,
  };
}
