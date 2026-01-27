/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/**
 * Customer RFM Analytics with Decimal.js Precision
 * Advanced customer analytics with mathematical precision for CLV, RFM scores, and segmentation
 */

import { DecimalUtils } from '@/lib/decimal';

export interface CustomerRFMProfile {
  customer_id: string;
  customer_name: string;
  email?: string;
  recency: number;
  frequency: number;
  monetary: number;
  recency_score: number;
  frequency_score: number;
  monetary_score: number;
  rfm_score: string;
  segment: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  first_purchase_date: string;
  last_purchase_date: string;
  clv_estimate: number;
  churn_risk: 'Low' | 'Medium' | 'High';
  recommended_action: string;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers_this_month: number;
  returning_customers: number;
  customer_retention_rate: number;
  average_clv: number;
  churn_rate: number;
  segment_distribution: Record<string, number>;
  revenue_by_segment: Record<string, number>;
  top_customers: Array<{
    customer_id: string;
    name: string;
    total_spent: number;
    segment: string;
    last_order_days_ago: number;
  }>;
}

export interface RFMScoreWeights {
  recency_weight: number;
  frequency_weight: number;
  monetary_weight: number;
}

export interface CLVCalculationParams {
  average_order_value: number;
  purchase_frequency: number;
  customer_lifespan_months: number;
  profit_margin_rate: number;
  discount_rate?: number; // NPV discount rate
}

/**
 * Calculate Customer Lifetime Value with precise decimal calculations
 */
export function calculateCustomerCLV(params: CLVCalculationParams): number {
  const {
    average_order_value,
    purchase_frequency,
    customer_lifespan_months,
    profit_margin_rate,
    discount_rate = 0.1 // 10% default discount rate
  } = params;

  // Convert to Decimal for precision
  const aovDec = DecimalUtils.fromValue(average_order_value, 'financial');
  const frequencyDec = DecimalUtils.fromValue(purchase_frequency, 'financial');
  const lifespanDec = DecimalUtils.fromValue(customer_lifespan_months, 'financial');
  const marginDec = DecimalUtils.fromValue(profit_margin_rate, 'financial');
  const discountDec = DecimalUtils.fromValue(discount_rate, 'financial');

  // Monthly revenue = AOV × Monthly Purchase Frequency
  const monthlyRevenueDec = DecimalUtils.multiply(aovDec, frequencyDec, 'financial');
  
  // Monthly profit = Monthly Revenue × Profit Margin
  const monthlyProfitDec = DecimalUtils.multiply(monthlyRevenueDec, marginDec, 'financial');
  
  // Total undiscounted CLV = Monthly Profit × Lifespan
  const undiscountedCLVDec = DecimalUtils.multiply(monthlyProfitDec, lifespanDec, 'financial');
  
  // Apply NPV discount if provided
  if (DecimalUtils.isPositive(discountDec)) {
    // NPV formula: CLV × (1 - (1 + discount_rate)^(-lifespan)) / discount_rate
    const onePlusRateDec = DecimalUtils.add(DecimalUtils.fromValue(1, 'financial'), discountDec, 'financial');
    const negativeLifespanDec = DecimalUtils.multiply(lifespanDec, DecimalUtils.fromValue(-1, 'financial'), 'financial');
    
    // This is a simplified NPV calculation - in production you'd want more sophisticated formula
    const discountFactorDec = DecimalUtils.multiply(
      undiscountedCLVDec,
      DecimalUtils.subtract(DecimalUtils.fromValue(1, 'financial'), 
        DecimalUtils.divide(DecimalUtils.fromValue(1, 'financial'), onePlusRateDec, 'financial'), 
        'financial'
      ),
      'financial'
    );
    
    return DecimalUtils.toNumber(discountFactorDec);
  }
  
  return DecimalUtils.toNumber(undiscountedCLVDec);
}

/**
 * Calculate RFM scores for a customer with precise mathematics
 */
export function calculateRFMScores(
  customerData: {
    recency_days: number;
    frequency_count: number;
    monetary_total: number;
  },
  benchmarks: {
    recency_quintiles: number[];
    frequency_quintiles: number[];
    monetary_quintiles: number[];
  }
): { recency_score: number; frequency_score: number; monetary_score: number; rfm_score: string } {
  
  // Calculate Recency Score (lower recency = higher score)
  const recencyScore = calculateQuintileScore(customerData.recency_days, benchmarks.recency_quintiles, true);
  
  // Calculate Frequency Score (higher frequency = higher score)  
  const frequencyScore = calculateQuintileScore(customerData.frequency_count, benchmarks.frequency_quintiles, false);
  
  // Calculate Monetary Score (higher monetary = higher score)
  const monetaryScore = calculateQuintileScore(customerData.monetary_total, benchmarks.monetary_quintiles, false);
  
  return {
    recency_score: recencyScore,
    frequency_score: frequencyScore,
    monetary_score: monetaryScore,
    rfm_score: `${recencyScore}${frequencyScore}${monetaryScore}`
  };
}

/**
 * Calculate quintile score with decimal precision
 */
function calculateQuintileScore(value: number, quintiles: number[], reverse: boolean = false): number {
  const valueDec = DecimalUtils.fromValue(value, 'financial');
  
  for (let i = 0; i < quintiles.length; i++) {
    const quintileDec = DecimalUtils.fromValue(quintiles[i], 'financial');
    
    if (DecimalUtils.lessThanOrEqual(valueDec, quintileDec)) {
      return reverse ? quintiles.length - i : i + 1;
    }
  }
  
  return reverse ? 1 : quintiles.length;
}

/**
 * Segment customers based on RFM scores
 */
export function determineCustomerSegment(rfm_score: string): string {
  const [r, f, m] = rfm_score.split('').map(Number);
  
  // Champions: High RFM across all dimensions
  if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
  
  // Loyal Customers: High F&M, moderate R
  if (r >= 3 && f >= 4 && m >= 4) return 'Loyal Customers';
  
  // Potential Loyalists: High R, moderate F&M
  if (r >= 4 && f >= 2 && m >= 2) return 'Potential Loyalists';
  
  // New Customers: High R, low F&M
  if (r >= 4 && f <= 2 && m <= 2) return 'New Customers';
  
  // Promising: High R&M, low F
  if (r >= 4 && f <= 2 && m >= 3) return 'Promising';
  
  // Need Attention: Moderate R, high F&M
  if (r >= 2 && r <= 3 && f >= 3 && m >= 3) return 'Need Attention';
  
  // About to Sleep: Low R, high F&M  
  if (r <= 2 && f >= 3 && m >= 3) return 'About to Sleep';
  
  // At Risk: Low R&F, high M
  if (r <= 2 && f <= 2 && m >= 4) return 'At Risk';
  
  // Cannot Lose Them: Very low R, high F&M
  if (r <= 1 && f >= 4 && m >= 4) return 'Cannot Lose Them';
  
  // Hibernating: Low R&F, moderate M
  if (r <= 2 && f <= 2 && m >= 2 && m <= 3) return 'Hibernating';
  
  // Lost: Low across all dimensions
  return 'Lost';
}

/**
 * Calculate average order value with decimal precision
 */
export function calculateAverageOrderValue(total_spent: number, total_orders: number): number {
  if (total_orders === 0) return 0;
  
  const spentDec = DecimalUtils.fromValue(total_spent, 'financial');
  const ordersDec = DecimalUtils.fromValue(total_orders, 'financial');
  
  const aovDec = DecimalUtils.divide(spentDec, ordersDec, 'financial');
  return DecimalUtils.toNumber(aovDec);
}

/**
 * Calculate customer retention rate with decimal precision
 */
export function calculateRetentionRate(
  customers_start_period: number,
  customers_end_period: number,
  new_customers_in_period: number
): number {
  if (customers_start_period === 0) return 0;
  
  const startDec = DecimalUtils.fromValue(customers_start_period, 'financial');
  const endDec = DecimalUtils.fromValue(customers_end_period, 'financial');
  const newDec = DecimalUtils.fromValue(new_customers_in_period, 'financial');
  
  // Retention Rate = ((End Customers - New Customers) / Start Customers) × 100
  const retainedDec = DecimalUtils.subtract(endDec, newDec, 'financial');
  const rateDec = DecimalUtils.divide(retainedDec, startDec, 'financial');
  const percentageDec = DecimalUtils.multiply(rateDec, DecimalUtils.fromValue(100, 'financial'), 'financial');
  
  return Math.max(0, Math.min(100, DecimalUtils.toNumber(percentageDec)));
}

/**
 * Calculate churn risk probability with decimal precision
 */
export function calculateChurnRisk(
  days_since_last_purchase: number,
  average_purchase_interval: number,
  frequency_trend: number // -1 to 1, negative means declining
): 'Low' | 'Medium' | 'High' {
  const daysSinceDec = DecimalUtils.fromValue(days_since_last_purchase, 'financial');
  const avgIntervalDec = DecimalUtils.fromValue(average_purchase_interval, 'financial');
  const trendDec = DecimalUtils.fromValue(frequency_trend, 'financial');
  
  // Risk factor based on time since last purchase
  const timeRiskDec = DecimalUtils.divide(daysSinceDec, avgIntervalDec, 'financial');
  const timeRisk = DecimalUtils.toNumber(timeRiskDec);
  
  // Trend factor adjustment
  const trendFactor = DecimalUtils.toNumber(trendDec);
  
  // Combined risk score
  const riskScore = timeRisk + Math.abs(trendFactor);
  
  if (riskScore >= 3.0 || trendFactor <= -0.5) return 'High';
  if (riskScore >= 1.5 || trendFactor <= -0.2) return 'Medium';
  return 'Low';
}

/**
 * Calculate segment revenue contribution with decimal precision
 */
export function calculateSegmentRevenueContribution(
  customers_in_segment: CustomerRFMProfile[],
  total_revenue: number
): { segment: string; revenue: number; percentage: number; customer_count: number }[] {
  
  const totalRevenueDec = DecimalUtils.fromValue(total_revenue, 'financial');
  const segmentMap = new Map<string, { revenue: any; count: number }>();
  
  // Group by segment and sum revenue
  customers_in_segment.forEach(customer => {
    const existing = segmentMap.get(customer.segment) || { 
      revenue: DecimalUtils.fromValue(0, 'financial'), 
      count: 0 
    };
    
    existing.revenue = DecimalUtils.add(
      existing.revenue, 
      DecimalUtils.fromValue(customer.total_spent, 'financial'), 
      'financial'
    );
    existing.count += 1;
    
    segmentMap.set(customer.segment, existing);
  });
  
  // Calculate percentages
  const results = Array.from(segmentMap.entries()).map(([segment, data]) => {
    const percentageDec = DecimalUtils.multiply(
      DecimalUtils.divide(data.revenue, totalRevenueDec, 'financial'),
      DecimalUtils.fromValue(100, 'financial'),
      'financial'
    );
    
    return {
      segment,
      revenue: DecimalUtils.toNumber(data.revenue),
      percentage: DecimalUtils.toNumber(percentageDec),
      customer_count: data.count
    };
  });
  
  return results.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Generate customer recommendations based on segment and behavior
 */
export function generateCustomerRecommendations(customer: CustomerRFMProfile): string[] {
  const recommendations: string[] = [];
  
  switch (customer.segment) {
    case 'Champions':
      recommendations.push('Offer exclusive VIP experiences');
      recommendations.push('Request referrals and reviews');
      recommendations.push('Early access to new products');
      break;
      
    case 'Loyal Customers':
      recommendations.push('Reward loyalty with points program');
      recommendations.push('Upsell premium products');
      recommendations.push('Send personalized offers');
      break;
      
    case 'Potential Loyalists':
      recommendations.push('Encourage repeat purchases with incentives');
      recommendations.push('Recommend complementary products');
      recommendations.push('Build relationship through engagement');
      break;
      
    case 'New Customers':
      recommendations.push('Welcome series with onboarding');
      recommendations.push('Educate about product value');
      recommendations.push('First-time buyer discount');
      break;
      
    case 'At Risk':
      recommendations.push('Win-back campaign with special offers');
      recommendations.push('Survey for feedback and improvement');
      recommendations.push('Personal outreach from account manager');
      break;
      
    case 'Cannot Lose Them':
      recommendations.push('Immediate intervention required');
      recommendations.push('High-value win-back offers');
      recommendations.push('Executive-level outreach');
      break;
      
    case 'Lost':
      recommendations.push('Final win-back attempt with deep discount');
      recommendations.push('Survey for exit feedback');
      recommendations.push('Remove from active marketing lists');
      break;
      
    default:
      recommendations.push('Re-engage with targeted campaigns');
      recommendations.push('Monitor behavior for improvement');
  }
  
  return recommendations;
}