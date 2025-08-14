// Advanced Reporting Types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'staff' | 'financial' | 'custom';
  parameters: ReportParameter[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: ReportSchedule;
  created_at: string;
  updated_at: string;
}

export interface ReportParameter {
  id: string;
  name: string;
  type: 'date_range' | 'select' | 'multi_select' | 'text' | 'number';
  required: boolean;
  default_value?: any;
  options?: string[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  recipients: string[];
  active: boolean;
}

export interface ReportExecution {
  id: string;
  template_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  result_url?: string;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}