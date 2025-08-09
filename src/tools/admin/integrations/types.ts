// API Integrations Types
export interface ApiIntegration {
  id: string;
  name: string;
  provider: string;
  type: 'payment' | 'delivery' | 'pos' | 'inventory' | 'marketing' | 'analytics';
  status: 'active' | 'inactive' | 'error' | 'pending_setup';
  configuration: Record<string, any>;
  rate_limits: {
    requests_per_minute: number;
    requests_per_day: number;
    current_usage: number;
  };
  last_sync: string;
  created_at: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret?: string;
  retry_policy: {
    max_retries: number;
    retry_delay: number;
  };
  last_triggered: string;
  success_count: number;
  failure_count: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  permissions: string[];
  rate_limit: number;
  expires_at?: string;
  last_used: string;
  created_by: string;
  status: 'active' | 'revoked';
}