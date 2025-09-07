// Menu Engineering Matrix Calculations
// Strategic Business Intelligence Engine for G-Admin Mini

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { 
  MenuCategory, 
  TrendDirection, 
  StrategyPriority,
  RiskLevel,
  type MenuEngineeringData, 
  type MenuEngineeringMatrix,
  type PerformanceMetrics,
  type BenchmarkAnalysis,
  type TrendAnalysis,
  type MatrixConfiguration,
  type StrategyRecommendation
} from '@/pages/admin/products/types/menuEngineering';

// Default configuration for matrix calculations
export const DEFAULT_MATRIX_CONFIG: MatrixConfiguration = {
  popularityThreshold: 0.5,        // 50% of average popularity
  profitabilityThreshold: 0.5,     // 50% of average profitability  
  analysisPeriodDays: 30,
  minimumSalesForAnalysis: 5,
  confidenceThreshold: 0.6,
  includeSeasonalAdjustment: false,
  weightRecentSales: true,
  excludePromotionalPeriods: false
};

// Product sales data interface (from database)
export interface ProductSalesData {
  productId: string;
  productName: string;
  unitsSold: number;
  totalRevenue: number;
  totalCost: number;
  averagePrice: number;
  salesDates: Date[];
}

/**
 * Calculate Menu Engineering Matrix from sales data
 */
export function calculateMenuEngineeringMatrix(
  salesData: ProductSalesData[],
  config: MatrixConfiguration = DEFAULT_MATRIX_CONFIG
): MenuEngineeringMatrix {
  // Filter products with minimum sales
  const filteredData = salesData.filter(
    product => product.unitsSold >= config.minimumSalesForAnalysis
  );

  if (filteredData.length === 0) {
    return createEmptyMatrix();
  }

  // Calculate totals for index calculations with Decimal.js precision
  const totalUnitsDec = filteredData.reduce((sum, p) => {
    return DecimalUtils.add(sum, p.unitsSold, 'financial');
  }, DecimalUtils.fromValue(0, 'financial'));
  
  const totalRevenueDec = filteredData.reduce((sum, p) => {
    return DecimalUtils.add(sum, p.totalRevenue, 'financial');
  }, DecimalUtils.fromValue(0, 'financial'));
  
  const averageMarginDec = filteredData.reduce((sum, p) => {
    const revenueDec = DecimalUtils.fromValue(p.totalRevenue, 'financial');
    const costDec = DecimalUtils.fromValue(p.totalCost, 'financial');
    const marginDec = DecimalUtils.divide(
      DecimalUtils.subtract(revenueDec, costDec, 'financial'), 
      revenueDec, 
      'financial'
    );
    return DecimalUtils.add(sum, marginDec, 'financial');
  }, DecimalUtils.fromValue(0, 'financial'));
  
  const finalAverageMarginDec = DecimalUtils.divide(averageMarginDec, filteredData.length, 'financial');
  
  const totalUnits = DecimalUtils.toNumber(totalUnitsDec);
  const totalRevenue = DecimalUtils.toNumber(totalRevenueDec);
  const averageMargin = DecimalUtils.toNumber(finalAverageMarginDec);

  // Calculate menu engineering data for each product
  const menuData = filteredData.map(product => 
    calculateProductMenuData(product, totalUnits, averageMargin, config)
  );

  // Classify products into categories
  const matrix = classifyProducts(menuData);

  // Add performance metrics
  const performanceMetrics = calculatePerformanceMetrics(menuData, totalRevenue);
  
  // Generate strategic recommendations
  const strategicActions = generateStrategicRecommendations(menuData);

  return {
    ...matrix,
    performanceMetrics,
    benchmarkAnalysis: calculateBenchmarkAnalysis(menuData),
    trendAnalysis: calculateTrendAnalysis(menuData),
    strategicActions,
    lastUpdated: new Date(),
    analysisPeriod: {
      startDate: new Date(Date.now() - config.analysisPeriodDays * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    totalProducts: menuData.length,
    totalRevenue
  };
}

/**
 * Calculate menu engineering data for a single product
 */
function calculateProductMenuData(
  product: ProductSalesData,
  totalUnits: number,
  averageMargin: number,
  config: MatrixConfiguration
): MenuEngineeringData {
  // Calculate core metrics with Decimal.js precision
  const unitsSoldDec = DecimalUtils.fromValue(product.unitsSold, 'financial');
  const totalUnitsDec = DecimalUtils.fromValue(totalUnits, 'financial');
  const popularityIndexDec = DecimalUtils.multiply(
    DecimalUtils.divide(unitsSoldDec, totalUnitsDec, 'financial'), 
    DecimalUtils.fromValue(100, 'financial'), 
    'financial'
  );
  
  const revenueDec = DecimalUtils.fromValue(product.totalRevenue, 'financial');
  const costDec = DecimalUtils.fromValue(product.totalCost, 'financial');
  const profitMarginDec = DecimalUtils.divide(
    DecimalUtils.subtract(revenueDec, costDec, 'financial'), 
    revenueDec, 
    'financial'
  );
  
  const averageMarginDec = DecimalUtils.fromValue(averageMargin, 'financial');
  const profitabilityIndexDec = DecimalUtils.multiply(
    DecimalUtils.divide(profitMarginDec, averageMarginDec, 'financial'), 
    DecimalUtils.fromValue(100, 'financial'), 
    'financial'
  );
  
  const contributionMarginDec = DecimalUtils.subtract(revenueDec, costDec, 'financial');
  const salesVelocityDec = DecimalUtils.divide(
    unitsSoldDec, 
    DecimalUtils.fromValue(config.analysisPeriodDays, 'financial'), 
    'financial'
  );

  const popularityIndex = DecimalUtils.toNumber(popularityIndexDec);
  const profitMargin = DecimalUtils.toNumber(profitMarginDec);
  const profitabilityIndex = DecimalUtils.toNumber(profitabilityIndexDec);
  const contributionMargin = DecimalUtils.toNumber(contributionMarginDec);
  const salesVelocity = DecimalUtils.toNumber(salesVelocityDec);

  // Determine category based on thresholds
  const menuCategory = determineMenuCategory(
    popularityIndex, 
    profitabilityIndex, 
    config.popularityThreshold * 100, 
    config.profitabilityThreshold * 100
  );

  // Calculate confidence (simplified - based on sales volume)
  const categoryConfidence = Math.min(product.unitsSold / (config.minimumSalesForAnalysis * 10), 1);

  // Determine trend (simplified - would need historical data for accurate calculation)
  const trendDirection = determineTrendDirection(product);

  return {
    productId: product.productId,
    productName: product.productName,
    popularityIndex,
    profitabilityIndex,
    contributionMargin,
    salesVelocity,
    menuCategory,
    categoryConfidence,
    trendDirection,
    unitsSold: product.unitsSold,
    totalRevenue: product.totalRevenue,
    totalCost: product.totalCost,
    profitMargin,
    vsMenuAverage: {
      popularityDifference: popularityIndex - 100/totalUnits, // Simplified average
      profitabilityDifference: profitabilityIndex - 100
    }
  };
}

/**
 * Determine menu category based on popularity and profitability indices
 */
function determineMenuCategory(
  popularityIndex: number,
  profitabilityIndex: number,
  popularityThreshold: number,
  profitabilityThreshold: number
): MenuCategory {
  const isHighPopularity = popularityIndex >= popularityThreshold;
  const isHighProfitability = profitabilityIndex >= profitabilityThreshold;

  if (isHighPopularity && isHighProfitability) return MenuCategory.STARS;
  if (isHighPopularity && !isHighProfitability) return MenuCategory.PLOWHORSES;
  if (!isHighPopularity && isHighProfitability) return MenuCategory.PUZZLES;
  return MenuCategory.DOGS;
}

/**
 * Determine trend direction (simplified implementation)
 */
function determineTrendDirection(product: ProductSalesData): TrendDirection {
  // This is a simplified implementation
  // In a real scenario, you'd compare with historical data
  if (product.unitsSold > 20) return TrendDirection.IMPROVING;
  if (product.unitsSold < 5) return TrendDirection.DECLINING;
  return TrendDirection.STABLE;
}

/**
 * Classify products into matrix categories
 */
function classifyProducts(menuData: MenuEngineeringData[]): Omit<MenuEngineeringMatrix, 'performanceMetrics' | 'benchmarkAnalysis' | 'trendAnalysis' | 'strategicActions' | 'lastUpdated' | 'analysisPeriod' | 'totalProducts' | 'totalRevenue'> {
  const stars = menuData.filter(p => p.menuCategory === MenuCategory.STARS);
  const plowhorses = menuData.filter(p => p.menuCategory === MenuCategory.PLOWHORSES);
  const puzzles = menuData.filter(p => p.menuCategory === MenuCategory.PUZZLES);
  const dogs = menuData.filter(p => p.menuCategory === MenuCategory.DOGS);

  return { stars, plowhorses, puzzles, dogs };
}

/**
 * Calculate performance metrics
 */
function calculatePerformanceMetrics(
  menuData: MenuEngineeringData[],
  totalRevenue: number
): PerformanceMetrics {
  const revenueByCategory = {
    stars: menuData.filter(p => p.menuCategory === MenuCategory.STARS).reduce((sum, p) => sum + p.totalRevenue, 0),
    plowhorses: menuData.filter(p => p.menuCategory === MenuCategory.PLOWHORSES).reduce((sum, p) => sum + p.totalRevenue, 0),
    puzzles: menuData.filter(p => p.menuCategory === MenuCategory.PUZZLES).reduce((sum, p) => sum + p.totalRevenue, 0),
    dogs: menuData.filter(p => p.menuCategory === MenuCategory.DOGS).reduce((sum, p) => sum + p.totalRevenue, 0)
  };

  const profitByCategory = {
    stars: menuData.filter(p => p.menuCategory === MenuCategory.STARS).reduce((sum, p) => sum + p.contributionMargin, 0),
    plowhorses: menuData.filter(p => p.menuCategory === MenuCategory.PLOWHORSES).reduce((sum, p) => sum + p.contributionMargin, 0),
    puzzles: menuData.filter(p => p.menuCategory === MenuCategory.PUZZLES).reduce((sum, p) => sum + p.contributionMargin, 0),
    dogs: menuData.filter(p => p.menuCategory === MenuCategory.DOGS).reduce((sum, p) => sum + p.contributionMargin, 0)
  };

  // Calculate menu health score (0-100)
  const starsCount = menuData.filter(p => p.menuCategory === MenuCategory.STARS).length;
  const dogsCount = menuData.filter(p => p.menuCategory === MenuCategory.DOGS).length;
  const menuHealthScore = Math.max(0, Math.min(100, 
    ((starsCount * 25) + ((menuData.length - dogsCount) * 10)) / menuData.length * 4
  ));

  // Count optimization opportunities
  const optimizationOpportunities = menuData.filter(p => 
    p.menuCategory === MenuCategory.PLOWHORSES || 
    p.menuCategory === MenuCategory.PUZZLES || 
    p.menuCategory === MenuCategory.DOGS
  ).length;

  return {
    revenueByCategory,
    profitByCategory,
    menuHealthScore,
    optimizationOpportunities,
    averagePopularityIndex: menuData.reduce((sum, p) => sum + p.popularityIndex, 0) / menuData.length,
    averageProfitabilityIndex: menuData.reduce((sum, p) => sum + p.profitabilityIndex, 0) / menuData.length,
    averageContributionMargin: menuData.reduce((sum, p) => sum + p.contributionMargin, 0) / menuData.length
  };
}

/**
 * Calculate benchmark analysis
 */
function calculateBenchmarkAnalysis(menuData: MenuEngineeringData[]): BenchmarkAnalysis {
  const totalProducts = menuData.length;
  
  return {
    industryAverages: {
      starsPercentage: 20,        // Industry benchmark: 20% stars
      plowhorsesPercentage: 30,   // 30% plowhorses
      puzzlesPercentage: 20,      // 20% puzzles
      dogsPercentage: 30          // 30% dogs (to be optimized)
    },
    historicalComparison: {
      periodComparison: 'Previous 30 days',
      performanceChange: 0, // Would need historical data
      trendDirection: TrendDirection.STABLE
    },
    targetDistribution: {
      stars: 35,      // Target: 35% stars
      plowhorses: 25, // 25% plowhorses
      puzzles: 15,    // 15% puzzles
      dogs: 25        // Maximum 25% dogs
    }
  };
}

/**
 * Calculate trend analysis
 */
function calculateTrendAnalysis(menuData: MenuEngineeringData[]): TrendAnalysis {
  return {
    categoryMigration: [], // Would need historical data for real migration tracking
    popularityTrends: {
      improving: menuData.filter(p => p.trendDirection === TrendDirection.IMPROVING).length,
      stable: menuData.filter(p => p.trendDirection === TrendDirection.STABLE).length,
      declining: menuData.filter(p => p.trendDirection === TrendDirection.DECLINING).length
    },
    profitabilityTrends: {
      improving: menuData.filter(p => p.trendDirection === TrendDirection.IMPROVING).length,
      stable: menuData.filter(p => p.trendDirection === TrendDirection.STABLE).length,
      declining: menuData.filter(p => p.trendDirection === TrendDirection.DECLINING).length
    }
  };
}

/**
 * Generate strategic recommendations
 */
function generateStrategicRecommendations(menuData: MenuEngineeringData[]): StrategyRecommendation[] {
  const recommendations: StrategyRecommendation[] = [];

  menuData.forEach(product => {
    const recommendation = generateProductRecommendation(product);
    if (recommendation) {
      recommendations.push(recommendation);
    }
  });

  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { immediate: 0, short_term: 1, long_term: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate recommendation for a single product
 */
function generateProductRecommendation(product: MenuEngineeringData): StrategyRecommendation | null {
  switch (product.menuCategory) {
    case MenuCategory.STARS:
      return {
        productId: product.productId,
        category: MenuCategory.STARS,
        priority: StrategyPriority.SHORT_TERM,
        action: 'Highlight and Promote',
        description: `${product.productName} is performing excellently with high profit and popularity. Consider highlighting it more prominently.`,
        expectedImpact: 'Revenue increase of 10-15%',
        implementationPlan: 'Feature in menu design, train staff to recommend, consider premium pricing',
        riskAssessment: RiskLevel.LOW,
        starsStrategy: {
          action: 'highlight',
          description: 'Feature prominently in menu and marketing materials',
          expectedRevenueLift: 12,
          implementationCost: 500,
          timeframe: '2-4 weeks',
          successMetrics: ['Increased sales volume', 'Maintained profit margin', 'Customer satisfaction']
        }
      };

    case MenuCategory.PLOWHORSES:
      return {
        productId: product.productId,
        category: MenuCategory.PLOWHORSES,
        priority: StrategyPriority.IMMEDIATE,
        action: 'Optimize Profitability',
        description: `${product.productName} is popular but has low profitability. Focus on cost reduction or price optimization.`,
        expectedImpact: 'Margin improvement of 15-25%',
        implementationPlan: 'Analyze ingredient costs, consider portion adjustments, explore price increase',
        riskAssessment: product.popularityIndex > 80 ? RiskLevel.HIGH : RiskLevel.MEDIUM,
        plowhorsesStrategy: {
          action: 'reduce_cost',
          description: 'Review ingredient costs and optimize recipes without compromising quality',
          expectedMarginImprovement: 20,
          customerImpactRisk: RiskLevel.LOW,
          testingPlan: 'A/B test with small portion adjustments'
        }
      };

    case MenuCategory.PUZZLES:
      return {
        productId: product.productId,
        category: MenuCategory.PUZZLES,
        priority: StrategyPriority.SHORT_TERM,
        action: 'Boost Popularity',
        description: `${product.productName} is highly profitable but not popular. Focus on marketing and repositioning.`,
        expectedImpact: 'Popularity increase of 25-40%',
        implementationPlan: 'Reposition on menu, staff training, limited-time promotion',
        riskAssessment: RiskLevel.MEDIUM,
        puzzlesStrategy: {
          action: 'reposition_menu',
          description: 'Move to prominent menu position and train staff on selling points',
          expectedPopularityIncrease: 30,
          marketingBudget: 1000,
          successProbability: 0.7
        }
      };

    case MenuCategory.DOGS:
      return {
        productId: product.productId,
        category: MenuCategory.DOGS,
        priority: StrategyPriority.IMMEDIATE,
        action: 'Consider Removal',
        description: `${product.productName} has low profit and popularity. Consider removal or major reformulation.`,
        expectedImpact: 'Cost savings of $200-500/month',
        implementationPlan: 'Phase out gradually, offer final promotion, remove from menu',
        riskAssessment: RiskLevel.LOW,
        dogsStrategy: {
          action: 'final_promotion',
          description: 'Run final promotion to clear inventory, then remove from menu',
          expectedCostSavings: 300,
          customerComplaintRisk: RiskLevel.LOW,
          removalTimeline: '4-6 weeks'
        }
      };

    default:
      return null;
  }
}

/**
 * Create empty matrix for edge cases
 */
function createEmptyMatrix(): MenuEngineeringMatrix {
  return {
    stars: [],
    plowhorses: [],
    puzzles: [],
    dogs: [],
    performanceMetrics: {
      revenueByCategory: { stars: 0, plowhorses: 0, puzzles: 0, dogs: 0 },
      profitByCategory: { stars: 0, plowhorses: 0, puzzles: 0, dogs: 0 },
      menuHealthScore: 0,
      optimizationOpportunities: 0,
      averagePopularityIndex: 0,
      averageProfitabilityIndex: 0,
      averageContributionMargin: 0
    },
    benchmarkAnalysis: {
      historicalComparison: {
        periodComparison: 'N/A',
        performanceChange: 0,
        trendDirection: TrendDirection.STABLE
      },
      targetDistribution: { stars: 0, plowhorses: 0, puzzles: 0, dogs: 0 }
    },
    trendAnalysis: {
      categoryMigration: [],
      popularityTrends: { improving: 0, stable: 0, declining: 0 },
      profitabilityTrends: { improving: 0, stable: 0, declining: 0 }
    },
    strategicActions: [],
    lastUpdated: new Date(),
    analysisPeriod: { startDate: new Date(), endDate: new Date() },
    totalProducts: 0,
    totalRevenue: 0
  };
}

/**
 * Get category color for UI styling
 */
export function getCategoryColor(category: MenuCategory): string {
  switch (category) {
    case MenuCategory.STARS: return 'gold.400';
    case MenuCategory.PLOWHORSES: return 'blue.400';
    case MenuCategory.PUZZLES: return 'orange.400';
    case MenuCategory.DOGS: return 'red.400';
    default: return 'gray.400';
  }
}

/**
 * Get category icon for UI
 */
export function getCategoryIcon(category: MenuCategory): string {
  switch (category) {
    case MenuCategory.STARS: return '⭐';
    case MenuCategory.PLOWHORSES: return '🐎';
    case MenuCategory.PUZZLES: return '🧩';
    case MenuCategory.DOGS: return '🐕';
    default: return '❓';
  }
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: MenuCategory): string {
  switch (category) {
    case MenuCategory.STARS: return 'Estrellas';
    case MenuCategory.PLOWHORSES: return 'Caballos de Trabajo';
    case MenuCategory.PUZZLES: return 'Rompecabezas';
    case MenuCategory.DOGS: return 'Perros';
    default: return 'Sin Categoría';
  }
}