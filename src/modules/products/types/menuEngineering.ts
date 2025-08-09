// Menu Engineering Matrix Types - Strategic Business Intelligence
// Based on G-Admin Mini Architecture Plan v3.0

export const enum MenuCategory {
  STARS = 'stars',           // High profit + High popularity - PROMOTE
  PLOWHORSES = 'plowhorses', // Low profit + High popularity - OPTIMIZE
  PUZZLES = 'puzzles',       // High profit + Low popularity - REPOSITION
  DOGS = 'dogs'              // Low profit + Low popularity - REMOVE
}

export const enum TrendDirection {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining'
}

export const enum StrategyPriority {
  IMMEDIATE = 'immediate',
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term'
}

export const enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Core Menu Engineering Data Structure
export interface MenuEngineeringData {
  productId: string;
  productName: string;
  
  // Core Metrics
  popularityIndex: number;        // % of total sales volume
  profitabilityIndex: number;     // Profit margin vs menu average
  contributionMargin: number;     // Revenue - variable costs
  salesVelocity: number;          // Units sold per time period
  
  // Classification
  menuCategory: MenuCategory;
  categoryConfidence: number;     // Statistical confidence in classification (0-1)
  trendDirection: TrendDirection;
  
  // Raw Data
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  profitMargin: number;
  
  // Performance Comparison
  vsMenuAverage: {
    popularityDifference: number;   // % difference from menu average
    profitabilityDifference: number;
  };
  
  // Time-based Analysis
  lastPeriodPerformance?: {
    popularityIndex: number;
    profitabilityIndex: number;
    trend: TrendDirection;
  };
}

// Strategic Recommendations
export interface StrategyRecommendation {
  productId: string;
  category: MenuCategory;
  priority: StrategyPriority;
  action: string;
  description: string;
  expectedImpact: string;
  implementationPlan: string;
  riskAssessment: RiskLevel;
  
  // Category-Specific Strategies
  starsStrategy?: StarsStrategy;
  plowhorsesStrategy?: PlowhorseStrategy;
  puzzlesStrategy?: PuzzleStrategy;
  dogsStrategy?: DogStrategy;
}

// Stars Strategy (High Profit + High Popularity)
export interface StarsStrategy {
  action: 'highlight' | 'slight_price_increase' | 'premium_version' | 'cross_sell' | 'expand_availability';
  description: string;
  expectedRevenueLift: number;    // % increase
  implementationCost: number;
  timeframe: string;
  successMetrics: string[];
}

// Plowhorses Strategy (Low Profit + High Popularity)
export interface PlowhorseStrategy {
  action: 'reduce_cost' | 'increase_price' | 'reduce_portion' | 'substitute_ingredients' | 'bundle_with_stars';
  description: string;
  expectedMarginImprovement: number;  // % improvement
  customerImpactRisk: RiskLevel;
  testingPlan: string;
}

// Puzzles Strategy (High Profit + Low Popularity)
export interface PuzzleStrategy {
  action: 'reposition_menu' | 'rename_product' | 'staff_training' | 'limited_promotion' | 'social_proof' | 'influencer_marketing';
  description: string;
  expectedPopularityIncrease: number; // % increase
  marketingBudget: number;
  successProbability: number; // 0-1
}

// Dogs Strategy (Low Profit + Low Popularity)
export interface DogStrategy {
  action: 'immediate_removal' | 'final_promotion' | 'reformulate' | 'limited_time_only' | 'seasonal_special';
  description: string;
  expectedCostSavings: number;
  customerComplaintRisk: RiskLevel;
  removalTimeline: string;
}

// Main Menu Engineering Matrix
export interface MenuEngineeringMatrix {
  // Product Classification
  stars: MenuEngineeringData[];
  plowhorses: MenuEngineeringData[];
  puzzles: MenuEngineeringData[];
  dogs: MenuEngineeringData[];
  
  // Performance Analytics
  performanceMetrics: PerformanceMetrics;
  benchmarkAnalysis: BenchmarkAnalysis;
  trendAnalysis: TrendAnalysis;
  
  // Strategic Recommendations
  strategicActions: StrategyRecommendation[];
  
  // Matrix Metadata
  lastUpdated: Date;
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
  };
  totalProducts: number;
  totalRevenue: number;
}

export interface PerformanceMetrics {
  // Revenue Distribution
  revenueByCategory: {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  
  // Profitability Analysis
  profitByCategory: {
    stars: number;
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
  
  // Menu Health Indicators
  menuHealthScore: number;        // Overall menu performance (0-100)
  optimizationOpportunities: number; // Number of actionable recommendations
  
  // Performance Averages
  averagePopularityIndex: number;
  averageProfitabilityIndex: number;
  averageContributionMargin: number;
}

export interface BenchmarkAnalysis {
  // Industry Benchmarks (if available)
  industryAverages?: {
    starsPercentage: number;
    plowhorsesPercentage: number;
    puzzlesPercentage: number;
    dogsPercentage: number;
  };
  
  // Internal Benchmarks
  historicalComparison: {
    periodComparison: string;
    performanceChange: number;
    trendDirection: TrendDirection;
  };
  
  // Target Recommendations
  targetDistribution: {
    stars: number;      // Target % of menu
    plowhorses: number;
    puzzles: number;
    dogs: number;
  };
}

export interface TrendAnalysis {
  // Category Movement
  categoryMigration: {
    productId: string;
    fromCategory: MenuCategory;
    toCategory: MenuCategory;
    migrationDate: Date;
    reason: string;
  }[];
  
  // Performance Trends
  popularityTrends: {
    improving: number;  // Count of products
    stable: number;
    declining: number;
  };
  
  profitabilityTrends: {
    improving: number;
    stable: number;
    declining: number;
  };
  
  // Seasonal Patterns (if available)
  seasonalPatterns?: {
    season: string;
    categoryDistribution: Record<MenuCategory, number>;
  }[];
}

// Matrix Calculation Configuration
export interface MatrixConfiguration {
  // Threshold Settings
  popularityThreshold: number;     // Above this = high popularity
  profitabilityThreshold: number;  // Above this = high profitability
  
  // Analysis Period
  analysisPeriodDays: number;      // Days to analyze (default: 30)
  
  // Minimum Data Requirements
  minimumSalesForAnalysis: number; // Minimum sales to include in analysis
  confidenceThreshold: number;     // Minimum confidence for classification
  
  // Calculation Settings
  includeSeasonalAdjustment: boolean;
  weightRecentSales: boolean;      // Give more weight to recent sales
  excludePromotionalPeriods: boolean;
}

// UI Component Props
export interface MenuEngineeringMatrixProps {
  configuration?: MatrixConfiguration;
  onProductSelect?: (product: MenuEngineeringData) => void;
  onStrategySelect?: (recommendation: StrategyRecommendation) => void;
  refreshInterval?: number; // Auto-refresh interval in minutes
}

export interface MatrixVisualizationProps {
  matrix: MenuEngineeringMatrix;
  onProductClick?: (product: MenuEngineeringData) => void;
  showTrends?: boolean;
  interactive?: boolean;
}

export interface StrategyRecommendationsProps {
  recommendations: StrategyRecommendation[];
  onImplementStrategy?: (recommendation: StrategyRecommendation) => void;
  priorityFilter?: StrategyPriority[];
  categoryFilter?: MenuCategory[];
}