/**
 * Cross-Module Analytics Types - Recuperado y mejorado
 *
 * Interfaces robustas para análisis cross-module con datos reales
 * Consolidado de CrossModuleAnalytics + CrossModuleInsights
 */

export interface ModuleMetric {
  moduleId: string;
  moduleName: string;
  metricId: string;
  metricName: string;
  value: number;
  unit: string;
  category: 'financial' | 'operational' | 'customer' | 'inventory' | 'staff';
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
}

export interface CrossModuleCorrelation {
  id: string;
  metric1: ModuleMetric;
  metric2: ModuleMetric;
  correlationCoefficient: number; // -1 to 1
  correlationStrength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';
  correlationType: 'positive' | 'negative';
  significance: number; // 0-100% (statistical significance)
  businessInsight: string;
  actionableRecommendation?: string;
  impactScore: number; // 0-100
}

export interface BusinessBottleneck {
  id: string;
  name: string;
  type: 'capacity' | 'process' | 'resource' | 'information' | 'quality';
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedModules: string[];
  rootCause: string;
  symptoms: string[];
  estimatedImpact: {
    financial: number; // $ impact
    operational: number; // efficiency % loss
    customer: number; // satisfaction impact
  };
  recommendations: BottleneckRecommendation[];
  detectedAt: string;
  priority: number; // 1-10
}

export interface BottleneckRecommendation {
  action: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  expectedImprovement: number; // percentage
  cost: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface HolisticInsight {
  id: string;
  title: string;
  type: 'opportunity' | 'optimization' | 'risk' | 'trend' | 'pattern';
  scope: 'single_module' | 'cross_module' | 'enterprise_wide';
  confidence: number; // 0-100
  impact: 'very_high' | 'high' | 'medium' | 'low';
  description: string;
  involvedModules: string[];
  keyMetrics: string[];
  correlations: string[];
  businessValue: number; // estimated $ value
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    timeframe: string;
    resources: string[];
    dependencies: string[];
  };
  aiGenerated: boolean;
}

export interface SystemHealthMetric {
  category: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

export interface CrossModuleAnalyticsConfig {
  correlationThreshold: number; // minimum correlation to display
  significanceLevel: number; // statistical significance threshold
  analysisTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  autoRefreshEnabled: boolean;
  refreshInterval: number; // minutes
  alertThresholds: {
    correlationDrop: number;
    bottleneckSeverity: 'medium' | 'high' | 'critical';
    healthScore: number;
  };
}

// Simplified insight interface for current implementation (compatible with existing code)
export interface CrossModuleInsight {
  id: string;
  title: string;
  description: string;
  modules: string[];
  impact: 'high' | 'medium' | 'low';
  type: 'opportunity' | 'risk' | 'achievement' | 'trend';
  value?: string;
  change?: string;
  actionRequired?: boolean;
}