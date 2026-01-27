// Menu Engineering Types for Products Module
// BCG Matrix categories for menu engineering analysis

// ===== MENU ENGINEERING CATEGORY ENUM =====

/**
 * Menu Engineering Matrix Categories
 * Based on Boston Consulting Group Matrix adapted for food service
 */
export enum MenuEngineeringCategory {
  STARS = 'STARS',           // High popularity, high profitability
  PLOWHORSES = 'PLOWHORSES', // High popularity, low profitability
  PUZZLES = 'PUZZLES',       // Low popularity, high profitability
  DOGS = 'DOGS'              // Low popularity, low profitability
}

// ===== MENU ENGINEERING DATA INTERFACE =====

export interface MenuEngineeringData {
  productId: string;
  productName: string;
  category: MenuEngineeringCategory;
  popularityIndex: number;
  profitabilityIndex: number;
  contributionMargin: number;
  unitsSold: number;
  revenue: number;
  cost: number;
  menuMixPercentage: number;
  classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
}

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
    category: MenuEngineeringCategory;
    riskLevel: RiskLevel;
    description: string;
  }>;
}

export interface StrategyRecommendation {
  category: MenuEngineeringCategory;
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
