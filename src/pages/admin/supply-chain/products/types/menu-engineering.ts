// Menu Engineering Types for Products Module
// Re-exports from services + additional product-specific types

export {
  MenuCategory,
  type MenuEngineeringData
} from '@/services/recipe/types/menu-engineering';

// ===== ENUMS =====

export enum TrendDirection {
  IMPROVING = 'improving',
  DECLINING = 'declining',
  STABLE = 'stable'
}

export enum StrategyPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ===== INTERFACES =====

export interface MenuEngineeringMatrix {
  // Category Classifications
  stars: MenuEngineeringData[];
  plowhorses: MenuEngineeringData[];
  puzzles: MenuEngineeringData[];
  dogs: MenuEngineeringData[];

  // Performance Metrics
  performanceMetrics: PerformanceMetrics;

  // Analysis Data
  benchmarkAnalysis: BenchmarkAnalysis;
  trendAnalysis: TrendAnalysis;
  strategicActions: StrategyRecommendation[];

  // Metadata
  lastUpdated: string;
  analysisPeriod: string;
  totalProducts: number;
  totalRevenue: number;
}

export interface PerformanceMetrics {
  averagePopularity: number;
  averageProfitability: number;
  totalContributionMargin: number;
  menuMixPerformance: {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  categoryDistribution: {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  revenueByCategory: {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  marginByCategory: {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  portfolioScore: number;
}

export interface BenchmarkAnalysis {
  industryAverages: {
    popularity: number;
    profitability: number;
    contributionMargin: number;
  };
  comparisonToIndustry: {
    aboveAverage: number;
    atAverage: number;
    belowAverage: number;
  };
  competitivePosition: 'leading' | 'competitive' | 'trailing';
}

export interface TrendAnalysis {
  popularityTrend: TrendDirection;
  profitabilityTrend: TrendDirection;
  categoryShifts: {
    improving: number;
    declining: number;
    stable: number;
  };
  riskFactors: Array<{
    category: MenuCategory;
    riskLevel: RiskLevel;
    description: string;
  }>;
}

export interface StrategyRecommendation {
  category: MenuCategory;
  priority: StrategyPriority;
  action: string;
  expectedImpact: string;
  timeline: string;
  affectedProducts: number;
  estimatedRevenueLift?: number;
}

export interface MatrixConfiguration {
  popularityThreshold: number;  // Percentile threshold (0-100)
  profitabilityThreshold: number;  // Percentile threshold (0-100)
  minimumSalesVolume: number;  // Minimum volume to consider
  analysisPeriodDays: number;  // Days to analyze
}
