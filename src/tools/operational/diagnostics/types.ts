// System Diagnostics Types
export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  components: ComponentHealth[];
  last_check: string;
  uptime: number;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  response_time?: number;
  error_rate?: number;
  last_error?: string;
  dependencies?: string[];
}

export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_in: number;
    bytes_out: number;
  };
  database_performance: {
    query_time_avg: number;
    active_connections: number;
    slow_queries: number;
  };
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}