// Executive Dashboard Interfaces
export interface ExecutiveKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  changeType: 'increase' | 'decrease';
  target?: number;
  category: 'financial' | 'operational' | 'customer' | 'strategic';
  trend: 'up' | 'down' | 'stable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  lastUpdated: string;
}

export interface StrategicInsight {
  id: string;
  title: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: 'very_high' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  description: string;
  metrics: InsightMetric[];
  actionItems: ActionItem[];
  timeline: string;
  category: 'revenue' | 'costs' | 'efficiency' | 'customer' | 'market' | 'operations';
  aiGenerated: boolean;
}

export interface InsightMetric {
  name: string;
  value: string;
  change?: string;
  trend: 'positive' | 'negative' | 'neutral';
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedImpact: string;
  estimatedEffort: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface PerformanceCorrelation {
  metric1: string;
  metric2: string;
  correlationStrength: number; // -1 to 1
  insight: string;
  businessImplication: string;
  confidence: number;
}

export interface ExecutiveSummary {
  period: string;
  overallPerformance: 'excellent' | 'good' | 'fair' | 'poor';
  keyHighlights: string[];
  keyConcerns: string[];
  strategicRecommendations: string[];
  financialHealth: FinancialHealth;
  operationalEfficiency: OperationalHealth;
  marketPosition: MarketHealth;
}

export interface FinancialHealth {
  score: number; // 0-100
  revenue: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  profitability: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  costs: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  cashFlow: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

export interface OperationalHealth {
  score: number; // 0-100
  efficiency: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  quality: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  productivity: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  utilization: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

export interface MarketHealth {
  score: number; // 0-100
  customerSatisfaction: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  marketShare: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  competitivePosition: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  brandStrength: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

export interface ExecutiveDashboardConfig {
  refreshInterval: number; // minutes
  aiInsightsEnabled: boolean;
  alertThresholds: {
    revenue: number;
    profitability: number;
    customerSatisfaction: number;
    operationalEfficiency: number;
  };
  displayPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  kpiTargets: Record<string, number>;
}
