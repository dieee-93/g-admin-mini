import { useState } from 'react';
import { type ReportTemplate } from '../types';

export function useReportBuilder() {
  const [builderStep, setBuilderStep] = useState<'basic' | 'data' | 'visualization' | 'schedule'>('basic');
  const [newReport, setNewReport] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    type: 'dashboard',
    dataSources: [],
    metrics: [],
    filters: [],
    visualizations: [],
    isActive: true
  });

  // We can add more logic here later for handling the builder steps
  // and saving the new report.

  return {
    builderStep,
    setBuilderStep,
    newReport,
    setNewReport,
  };
}
