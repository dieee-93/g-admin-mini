/**
 * Sales Analytics with Decimal.js Precision
 * Advanced sales performance analytics with mathematical precision for revenue analysis
 */

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export interface SalesMetrics {
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  revenue_growth_rate: number;
  profit_margin: number;
  units_sold: number;
  transactions_count: number;
  refunds_amount: number;
  net_revenue: number;
}

export interface PeriodComparison {
  current_period: SalesMetrics;
  previous_period: SalesMetrics;
  growth_metrics: {
    revenue_growth: number;
    aov_growth: number;
    volume_growth: number;
    margin_growth: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    strength: 'strong' | 'moderate' | 'weak';
    sustainability_score: number;
  };
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  revenue: number;
  units_sold: number;
  profit_margin: number;
  contribution_percentage: number;
  growth_rate: number;
  seasonality_score: number;
  inventory_turnover: number;
}

export interface SalesForecast {
  period: string;
  predicted_revenue: number;
  confidence_interval: {
    lower_bound: number;
    upper_bound: number;
  };
  key_factors: string[];
  risk_assessment: 'low' | 'medium' | 'high';
}

export interface RevenueBreakdown {
  gross_revenue: number;
  discounts_applied: number;
  refunds_processed: number;
  taxes_collected: number;
  net_revenue: number;
  cost_of_goods_sold: number;
  gross_profit: number;
  gross_margin_percentage: number;
}

/**
 * Calculate comprehensive sales metrics with decimal precision
 */
export function calculateSalesMetrics(
  transactions: Array<{
    amount: number;
    items_count: number;
    discount?: number;
    refund_amount?: number;
    cost_of_goods?: number;
  }>
): SalesMetrics {
  if (transactions.length === 0) {
    return {
      total_revenue: 0,
      average_order_value: 0,
      conversion_rate: 0,
      revenue_growth_rate: 0,
      profit_margin: 0,
      units_sold: 0,
      transactions_count: 0,
      refunds_amount: 0,
      net_revenue: 0
    };
  }

  let totalRevenueDec = DecimalUtils.fromValue(0, 'financial');
  let totalItemsDec = DecimalUtils.fromValue(0, 'financial');
  let totalRefundsDec = DecimalUtils.fromValue(0, 'financial');
  let totalCostDec = DecimalUtils.fromValue(0, 'financial');

  // Process each transaction with decimal precision
  transactions.forEach(transaction => {
    const amountDec = DecimalUtils.fromValue(transaction.amount, 'financial');
    const itemsDec = DecimalUtils.fromValue(transaction.items_count, 'financial');
    const refundDec = DecimalUtils.fromValue(transaction.refund_amount || 0, 'financial');
    const costDec = DecimalUtils.fromValue(transaction.cost_of_goods || 0, 'financial');

    totalRevenueDec = DecimalUtils.add(totalRevenueDec, amountDec, 'financial');
    totalItemsDec = DecimalUtils.add(totalItemsDec, itemsDec, 'financial');
    totalRefundsDec = DecimalUtils.add(totalRefundsDec, refundDec, 'financial');
    totalCostDec = DecimalUtils.add(totalCostDec, costDec, 'financial');
  });

  // Calculate net revenue
  const netRevenueDec = DecimalUtils.subtract(totalRevenueDec, totalRefundsDec, 'financial');

  // Calculate AOV
  const transactionCountDec = DecimalUtils.fromValue(transactions.length, 'financial');
  const aovDec = DecimalUtils.divide(totalRevenueDec, transactionCountDec, 'financial');

  // Calculate profit margin
  const grossProfitDec = DecimalUtils.subtract(netRevenueDec, totalCostDec, 'financial');
  const profitMarginDec = DecimalUtils.isZero(netRevenueDec) 
    ? DecimalUtils.fromValue(0, 'financial')
    : DecimalUtils.multiply(
        DecimalUtils.divide(grossProfitDec, netRevenueDec, 'financial'),
        DecimalUtils.fromValue(100, 'financial'),
        'financial'
      );

  return {
    total_revenue: DecimalUtils.toNumber(totalRevenueDec),
    average_order_value: DecimalUtils.toNumber(aovDec),
    conversion_rate: 0, // Would need visitor data
    revenue_growth_rate: 0, // Would need historical data
    profit_margin: DecimalUtils.toNumber(profitMarginDec),
    units_sold: DecimalUtils.toNumber(totalItemsDec),
    transactions_count: transactions.length,
    refunds_amount: DecimalUtils.toNumber(totalRefundsDec),
    net_revenue: DecimalUtils.toNumber(netRevenueDec)
  };
}

/**
 * Compare sales performance between two periods
 */
export function comparePeriods(
  currentMetrics: SalesMetrics,
  previousMetrics: SalesMetrics
): PeriodComparison {
  const currentRevDec = DecimalUtils.fromValue(currentMetrics.total_revenue, 'financial');
  const previousRevDec = DecimalUtils.fromValue(previousMetrics.total_revenue, 'financial');
  const currentAovDec = DecimalUtils.fromValue(currentMetrics.average_order_value, 'financial');
  const previousAovDec = DecimalUtils.fromValue(previousMetrics.average_order_value, 'financial');
  const currentVolumeDec = DecimalUtils.fromValue(currentMetrics.units_sold, 'financial');
  const previousVolumeDec = DecimalUtils.fromValue(previousMetrics.units_sold, 'financial');
  const currentMarginDec = DecimalUtils.fromValue(currentMetrics.profit_margin, 'financial');
  const previousMarginDec = DecimalUtils.fromValue(previousMetrics.profit_margin, 'financial');

  // Calculate growth rates
  const revenueGrowthDec = calculateGrowthRate(currentRevDec, previousRevDec);
  const aovGrowthDec = calculateGrowthRate(currentAovDec, previousAovDec);
  const volumeGrowthDec = calculateGrowthRate(currentVolumeDec, previousVolumeDec);
  const marginGrowthDec = calculateGrowthRate(currentMarginDec, previousMarginDec);

  // Analyze trends
  const revenueGrowth = DecimalUtils.toNumber(revenueGrowthDec);
  const trends = analyzeTrends(revenueGrowth, 
    DecimalUtils.toNumber(aovGrowthDec), 
    DecimalUtils.toNumber(volumeGrowthDec)
  );

  return {
    current_period: currentMetrics,
    previous_period: previousMetrics,
    growth_metrics: {
      revenue_growth: revenueGrowth,
      aov_growth: DecimalUtils.toNumber(aovGrowthDec),
      volume_growth: DecimalUtils.toNumber(volumeGrowthDec),
      margin_growth: DecimalUtils.toNumber(marginGrowthDec)
    },
    trends
  };
}

/**
 * Calculate growth rate between two values
 */
function calculateGrowthRate(current: any, previous: any): any {
  if (DecimalUtils.isZero(previous)) {
    return DecimalUtils.fromValue(0, 'financial');
  }

  const changeDec = DecimalUtils.subtract(current, previous, 'financial');
  const rateDec = DecimalUtils.divide(changeDec, previous, 'financial');
  return DecimalUtils.multiply(rateDec, DecimalUtils.fromValue(100, 'financial'), 'financial');
}

/**
 * Analyze trend patterns and sustainability
 */
function analyzeTrends(
  revenueGrowth: number, 
  aovGrowth: number, 
  volumeGrowth: number
): PeriodComparison['trends'] {
  const overallGrowth = (revenueGrowth + aovGrowth + volumeGrowth) / 3;
  
  let direction: 'up' | 'down' | 'stable';
  let strength: 'strong' | 'moderate' | 'weak';
  
  if (Math.abs(overallGrowth) < 2) {
    direction = 'stable';
  } else {
    direction = overallGrowth > 0 ? 'up' : 'down';
  }

  const absGrowth = Math.abs(overallGrowth);
  if (absGrowth > 15) strength = 'strong';
  else if (absGrowth > 5) strength = 'moderate';
  else strength = 'weak';

  // Sustainability score based on balanced growth
  const growthVariance = Math.sqrt(
    Math.pow(revenueGrowth - overallGrowth, 2) +
    Math.pow(aovGrowth - overallGrowth, 2) +
    Math.pow(volumeGrowth - overallGrowth, 2)
  ) / 3;

  const sustainabilityScore = Math.max(0, Math.min(100, 
    100 - (growthVariance * 2) + (direction === 'up' ? 10 : -10)
  ));

  return {
    direction,
    strength,
    sustainability_score: Math.round(sustainabilityScore)
  };
}

/**
 * Analyze product performance and ranking
 */
export function analyzeProductPerformance(
  products: Array<{
    product_id: string;
    product_name: string;
    revenue: number;
    units_sold: number;
    cost_of_goods: number;
    previous_period_revenue?: number;
    seasonal_factor?: number;
    inventory_turns?: number;
  }>,
  totalRevenue: number
): ProductPerformance[] {
  const totalRevenueDec = DecimalUtils.fromValue(totalRevenue, 'financial');

  return products.map(product => {
    const revenueDec = DecimalUtils.fromValue(product.revenue, 'financial');
    const costDec = DecimalUtils.fromValue(product.cost_of_goods, 'financial');
    const unitsDec = DecimalUtils.fromValue(product.units_sold, 'financial');

    // Calculate profit margin
    const profitDec = DecimalUtils.subtract(revenueDec, costDec, 'financial');
    const marginDec = DecimalUtils.isZero(revenueDec) 
      ? DecimalUtils.fromValue(0, 'financial')
      : DecimalUtils.multiply(
          DecimalUtils.divide(profitDec, revenueDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        );

    // Calculate contribution percentage
    const contributionDec = DecimalUtils.multiply(
      DecimalUtils.divide(revenueDec, totalRevenueDec, 'financial'),
      DecimalUtils.fromValue(100, 'financial'),
      'financial'
    );

    // Calculate growth rate if previous period data available
    let growthRate = 0;
    if (product.previous_period_revenue) {
      const previousDec = DecimalUtils.fromValue(product.previous_period_revenue, 'financial');
      const growthDec = calculateGrowthRate(revenueDec, previousDec);
      growthRate = DecimalUtils.toNumber(growthDec);
    }

    return {
      product_id: product.product_id,
      product_name: product.product_name,
      revenue: product.revenue,
      units_sold: product.units_sold,
      profit_margin: DecimalUtils.toNumber(marginDec),
      contribution_percentage: DecimalUtils.toNumber(contributionDec),
      growth_rate: growthRate,
      seasonality_score: product.seasonal_factor || 0,
      inventory_turnover: product.inventory_turns || 0
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Generate detailed revenue breakdown
 */
export function calculateRevenueBreakdown(
  grossRevenue: number,
  discounts: number,
  refunds: number,
  taxes: number,
  costOfGoodsSold: number
): RevenueBreakdown {
  const grossDec = DecimalUtils.fromValue(grossRevenue, 'financial');
  const discountsDec = DecimalUtils.fromValue(discounts, 'financial');
  const refundsDec = DecimalUtils.fromValue(refunds, 'financial');
  const taxesDec = DecimalUtils.fromValue(taxes, 'financial');
  const cogsDec = DecimalUtils.fromValue(costOfGoodsSold, 'financial');

  // Calculate net revenue
  const netRevenueDec = DecimalUtils.subtract(
    DecimalUtils.subtract(grossDec, discountsDec, 'financial'),
    refundsDec,
    'financial'
  );

  // Calculate gross profit
  const grossProfitDec = DecimalUtils.subtract(netRevenueDec, cogsDec, 'financial');

  // Calculate gross margin percentage
  const marginPercentDec = DecimalUtils.isZero(netRevenueDec) 
    ? DecimalUtils.fromValue(0, 'financial')
    : DecimalUtils.multiply(
        DecimalUtils.divide(grossProfitDec, netRevenueDec, 'financial'),
        DecimalUtils.fromValue(100, 'financial'),
        'financial'
      );

  return {
    gross_revenue: DecimalUtils.toNumber(grossDec),
    discounts_applied: DecimalUtils.toNumber(discountsDec),
    refunds_processed: DecimalUtils.toNumber(refundsDec),
    taxes_collected: DecimalUtils.toNumber(taxesDec),
    net_revenue: DecimalUtils.toNumber(netRevenueDec),
    cost_of_goods_sold: DecimalUtils.toNumber(cogsDec),
    gross_profit: DecimalUtils.toNumber(grossProfitDec),
    gross_margin_percentage: DecimalUtils.toNumber(marginPercentDec)
  };
}

/**
 * Calculate sales velocity and momentum
 */
export function calculateSalesVelocity(
  dailySales: Array<{ date: string; revenue: number; transactions: number }>,
  windowDays: number = 7
): {
  current_velocity: number;
  velocity_trend: 'accelerating' | 'stable' | 'decelerating';
  momentum_score: number;
  predicted_next_period: number;
} {
  if (dailySales.length < windowDays * 2) {
    return {
      current_velocity: 0,
      velocity_trend: 'stable',
      momentum_score: 0,
      predicted_next_period: 0
    };
  }

  // Calculate recent and previous window averages
  const recentWindow = dailySales.slice(-windowDays);
  const previousWindow = dailySales.slice(-windowDays * 2, -windowDays);

  const recentAvgDec = calculateAverageRevenue(recentWindow);
  const previousAvgDec = calculateAverageRevenue(previousWindow);

  // Current velocity (recent average)
  const currentVelocity = DecimalUtils.toNumber(recentAvgDec);

  // Velocity trend
  const velocityChangeDec = DecimalUtils.subtract(recentAvgDec, previousAvgDec, 'financial');
  const velocityChangePercent = DecimalUtils.isZero(previousAvgDec) 
    ? 0 
    : DecimalUtils.toNumber(
        DecimalUtils.multiply(
          DecimalUtils.divide(velocityChangeDec, previousAvgDec, 'financial'),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        )
      );

  let velocityTrend: 'accelerating' | 'stable' | 'decelerating';
  if (velocityChangePercent > 5) velocityTrend = 'accelerating';
  else if (velocityChangePercent < -5) velocityTrend = 'decelerating';
  else velocityTrend = 'stable';

  // Momentum score (0-100)
  const momentumScore = Math.max(0, Math.min(100, 50 + velocityChangePercent));

  // Simple linear prediction for next period
  const trendDec = DecimalUtils.divide(velocityChangeDec, DecimalUtils.fromValue(windowDays, 'financial'), 'financial');
  const predictedDec = DecimalUtils.add(
    recentAvgDec,
    DecimalUtils.multiply(trendDec, DecimalUtils.fromValue(windowDays, 'financial'), 'financial'),
    'financial'
  );

  return {
    current_velocity: currentVelocity,
    velocity_trend: velocityTrend,
    momentum_score: Math.round(momentumScore),
    predicted_next_period: DecimalUtils.toNumber(predictedDec) * windowDays
  };
}

/**
 * Helper to calculate average revenue from daily sales
 */
function calculateAverageRevenue(salesData: Array<{ revenue: number }>): any {
  if (salesData.length === 0) return DecimalUtils.fromValue(0, 'financial');

  let totalDec = DecimalUtils.fromValue(0, 'financial');
  salesData.forEach(day => {
    totalDec = DecimalUtils.add(totalDec, DecimalUtils.fromValue(day.revenue, 'financial'), 'financial');
  });

  return DecimalUtils.divide(totalDec, DecimalUtils.fromValue(salesData.length, 'financial'), 'financial');
}