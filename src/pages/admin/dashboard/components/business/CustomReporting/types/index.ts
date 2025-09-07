// Custom Reporting Interfaces
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'customer' | 'inventory' | 'staff' | 'custom';
  type: 'dashboard' | 'chart' | 'table' | 'kpi' | 'summary';
  dataSources: string[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  groupings: ReportGrouping[];
  visualizations: ReportVisualization[];
  schedule?: ReportSchedule;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastGenerated?: string;
  generationCount: number;
}

export interface ReportMetric {
  id: string;
  name: string;
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  format: 'number' | 'currency' | 'percentage' | 'date' | 'text';
  calculation?: string; // Custom calculation formula
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between';
  value: string | number | string[];
  displayName: string;
}

export interface ReportGrouping {
  field: string;
  displayName: string;
  sortOrder: 'asc' | 'desc';
}

export interface ReportVisualization {
  id: string;
  type: 'bar_chart' | 'line_chart' | 'pie_chart' | 'table' | 'kpi_card' | 'gauge';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0 = Sunday, 6 = Saturday
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'email_summary';
  isEnabled: boolean;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'completed' | 'failed';
  fileSize?: number;
  downloadUrl?: string;
  parameters: Record<string, any>;
  executionTime: number; // milliseconds
  error?: string;
}

export interface ReportAutomation {
  id: string;
  name: string;
  description: string;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  conditions: AutomationCondition[];
  isEnabled: boolean;
  lastExecuted?: string;
  executionCount: number;
  successRate: number; // 0-100
}

export interface AutomationTrigger {
  type: 'schedule' | 'data_change' | 'threshold' | 'manual';
  config: Record<string, any>;
}

export interface AutomationAction {
  type: 'generate_report' | 'send_email' | 'create_alert' | 'update_dashboard' | 'webhook';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: any;
  logicOperator?: 'and' | 'or';
}

export interface ReportInsight {
  id: string;
  reportId: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  generatedAt: string;
}

export interface CustomReportingConfig {
  maxReportsPerUser: number;
  maxScheduledReports: number;
  retentionDays: number;
  allowedExportFormats: string[];
  aiInsightsEnabled: boolean;
  automationEnabled: boolean;
}
