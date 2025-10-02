import { useState, useCallback } from 'react';
import { EventBus } from '@/lib/events';
import { type ReportTemplate, type GeneratedReport } from '../types';

import { logger } from '@/lib/logging';
interface UseReportGenerationParams {
  templates: ReportTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<ReportTemplate[]>>;
  setGeneratedReports: React.Dispatch<React.SetStateAction<GeneratedReport[]>>;
}

export function useReportGeneration({
  templates,
  setTemplates,
  setGeneratedReports,
}: UseReportGenerationParams) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const generateReport = useCallback(async (templateId: string, format: string = 'pdf') => {
    setIsGenerating(templateId);

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const newGeneratedReport: GeneratedReport = {
        id: `gen_${Date.now()}`,
        templateId,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Current User',
        format: format as any,
        status: 'completed',
        fileSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
        downloadUrl: `/downloads/${template.name.toLowerCase().replace(/\s+/g, '-')}.${format}`,
        parameters: { generated_on_demand: true },
        executionTime: Math.floor(Math.random() * 5000) + 1000
      };

      setGeneratedReports(prev => [newGeneratedReport, ...prev]);

      // Update template generation count
      setTemplates(prev => prev.map(t =>
        t.id === templateId
          ? { ...t, generationCount: t.generationCount + 1, lastGenerated: new Date().toISOString() }
          : t
      ));

      // Emit generation event
      await EventBus.emit('system.data_synced', {
        type: 'custom_report_generated',
        templateId,
        templateName: template.name,
        format,
        fileSize: newGeneratedReport.fileSize,
        executionTime: newGeneratedReport.executionTime
      }, 'CustomReporting');

    } catch (error) {
      logger.error('App', 'Error generating report:', error);
    } finally {
      setIsGenerating(null);
    }
  }, [templates, setTemplates, setGeneratedReports]);

  return {
    isGenerating,
    generateReport,
  };
}
