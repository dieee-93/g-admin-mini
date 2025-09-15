// ============================================================================
// CUSTOMER ANALYTICS ENGINE - Business Logic
// ============================================================================
// Sistema inteligente de análisis de comportamiento y segmentación de clientes

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';

// ============================================================================
// TYPES
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  registration_date: string;
  status: CustomerStatus;
  customer_type: CustomerType;
  loyalty_points: number;
  total_spent: number;
  visit_count: number;
  last_visit_date?: string;
  preferred_payment_method?: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'vip';
export type CustomerType = 'regular' | 'frequent' | 'vip' | 'corporate' | 'new';
export type PaymentMethod = 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' | 'credit';

export interface Sale {
  id: string;
  customer_id?: string;
  total_amount: number;
  payment_method: PaymentMethod;
  sale_date: string;
  items_count: number;
  discount_applied?: number;
  tip_amount?: number;
  service_type: ServiceType;
  table_number?: number;
  staff_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ServiceType = 'dine_in' | 'takeout' | 'delivery' | 'catering';

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  created_at: string;
}

// Customer Analytics Types
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customerIds: string[];
  totalCustomers: number;
  averageSpend: number;
  totalRevenue: number;
  averageVisitFrequency: number;
  retentionRate: number;
  profitabilityScore: number;
  characteristics: string[];
  recommendedActions: string[];
}

export interface SegmentCriteria {
  spendRange?: { min: number; max: number };
  visitFrequency?: { min: number; max: number };
  daysSinceLastVisit?: { min: number; max: number };
  loyaltyPoints?: { min: number; max: number };
  customerType?: CustomerType[];
  registrationAge?: { min: number; max: number }; // Days since registration
  averageOrderValue?: { min: number; max: number };
  preferredServices?: ServiceType[];
  paymentMethods?: PaymentMethod[];
}

export interface CustomerBehaviorAnalysis {
  customerId: string;
  customerName: string;
  
  // Purchase Behavior
  totalSpent: number;
  averageOrderValue: number;
  orderFrequency: number; // Orders per month
  lastOrderDays: number; // Days since last order
  totalOrders: number;
  
  // Visit Patterns
  visitFrequency: number; // Visits per month
  averageVisitDuration?: number; // Minutes
  preferredDayOfWeek: string;
  preferredTimeOfDay: string;
  seasonalityPattern: SeasonalPattern;
  
  // Service Preferences
  preferredServiceType: ServiceType;
  serviceTypeDistribution: Record<ServiceType, number>;
  preferredPaymentMethod: PaymentMethod;
  
  // Product Preferences
  favoriteCategories: Array<{
    category: string;
    orderCount: number;
    totalSpent: number;
    percentage: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    orderCount: number;
    totalSpent: number;
  }>;
  
  // Loyalty & Engagement
  loyaltyScore: number; // 0-100
  churnRisk: ChurnRisk;
  retentionProbability: number; // 0-100
  lifetimeValue: number;
  loyaltyPoints: number;
  
  // Financial Metrics
  profitability: number;
  marginContribution: number;
  discountSensitivity: number; // 0-100
  
  // Behavioral Insights
  behaviorSegment: string;
  personalityTraits: string[];
  recommendedOffers: string[];
  nextBestAction: string;
  
  // Trends
  spendingTrend: 'increasing' | 'stable' | 'decreasing';
  visitTrend: 'increasing' | 'stable' | 'decreasing';
  engagementTrend: 'improving' | 'stable' | 'declining';
}

export type SeasonalPattern = 'consistent' | 'summer_peak' | 'winter_peak' | 'weekend_warrior' | 'weekday_regular';
export type ChurnRisk = 'low' | 'medium' | 'high' | 'critical';

// Comprehensive Customer Analytics Result
export interface CustomerAnalyticsResult {
  // Metadata
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  totalCustomersAnalyzed: number;
  
  // Customer Segments
  segments: CustomerSegment[];
  
  // Individual Analysis
  customerAnalyses: CustomerBehaviorAnalysis[];
  
  // Aggregate Metrics
  overallMetrics: {
    totalActiveCustomers: number;
    totalRevenue: number;
    averageOrderValue: number;
    averageCustomerLifetimeValue: number;
    customerAcquisitionRate: number;
    customerRetentionRate: number;
    churnRate: number;
    
    // Revenue Distribution
    revenueBySegment: Record<string, number>;
    revenueByServiceType: Record<ServiceType, number>;
    revenueByPaymentMethod: Record<PaymentMethod, number>;
    
    // Behavioral Insights
    averageOrderFrequency: number;
    averageVisitFrequency: number;
    peakHours: string[];
    peakDays: string[];
    seasonalTrends: Record<string, number>;
    
    // Product Performance
    topCategories: Array<{
      category: string;
      revenue: number;
      orderCount: number;
      customerCount: number;
    }>;
    
    // Customer Health
    healthyCustomers: number; // Active, regular purchasers
    atRiskCustomers: number; // High churn risk
    lostCustomers: number; // Haven't purchased recently
    newCustomers: number; // Recently acquired
  };
  
  // Strategic Insights
  strategicInsights: Array<{
    type: 'opportunity' | 'threat' | 'strength' | 'weakness';
    category: 'retention' | 'acquisition' | 'monetization' | 'experience' | 'product';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number; // 0-100
    recommendation: string;
    estimatedValue?: number;
    timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  }>;
  
  // Actionable Recommendations
  recommendations: Array<{
    id: string;
    type: 'retention_campaign' | 'acquisition_strategy' | 'upsell_opportunity' | 'product_recommendation' | 'experience_improvement';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    targetSegment: string;
    affectedCustomers: string[];
    estimatedImpact: {
      revenueIncrease?: number;
      retentionImprovement?: number;
      acquisitionIncrease?: number;
    };
    implementation: {
      steps: string[];
      resources: string[];
      timeline: string;
      budget?: number;
    };
    successMetrics: string[];
  }>;
  
  // Predictive Analytics
  predictions: {
    churnPredictions: Array<{
      customerId: string;
      churnProbability: number;
      timeToChurn?: number; // Days
      preventionActions: string[];
    }>;
    lifetimeValuePredictions: Array<{
      customerId: string;
      predictedLTV: number;
      confidence: number;
      factors: string[];
    }>;
    nextPurchasePredictions: Array<{
      customerId: string;
      nextPurchaseProbability: number;
      expectedDate?: string;
      recommendedProducts: string[];
    }>;
  };
}

// Configuration for customer analytics
export interface CustomerAnalyticsConfig {
  // Analysis Parameters
  analysisMonths: number;
  minTransactionsForAnalysis: number;
  
  // Segmentation Thresholds
  highValueThreshold: number;
  frequentCustomerThreshold: number; // Visits per month
  loyalCustomerDays: number; // Days for loyalty consideration
  churnRiskDays: number; // Days without purchase = risk
  
  // Behavioral Analysis
  includeSeasonalAnalysis: boolean;
  includePredictiveAnalytics: boolean;
  includeProductRecommendations: boolean;
  
  // Business Rules
  vipSpendThreshold: number;
  corporateMinOrders: number;
  newCustomerDays: number; // Days to consider "new"
  
  // Profitability Analysis
  averageMarginPercentage: number;
  fixedCostPerCustomer: number;
  
  // Segment Definitions
  customSegments?: SegmentCriteria[];
  
  // Predictive Model Parameters
  churnModelWeights: {
    daysSinceLastVisit: number;
    orderFrequency: number;
    spendingTrend: number;
    engagementLevel: number;
  };
}

// ============================================================================
// CUSTOMER ANALYTICS ENGINE
// ============================================================================

export class CustomerAnalyticsEngine {
  
  // Default configuration optimized for restaurant business
  private static readonly DEFAULT_CONFIG: CustomerAnalyticsConfig = {
    analysisMonths: 6,
    minTransactionsForAnalysis: 2,
    
    highValueThreshold: 500,         // $500+ total spend
    frequentCustomerThreshold: 4,    // 4+ visits per month
    loyalCustomerDays: 90,          // 90 days for loyalty
    churnRiskDays: 45,              // 45 days without purchase
    
    includeSeasonalAnalysis: true,
    includePredictiveAnalytics: true,
    includeProductRecommendations: true,
    
    vipSpendThreshold: 1000,        // $1000+ for VIP
    corporateMinOrders: 10,         // 10+ orders for corporate
    newCustomerDays: 30,            // 30 days = new customer
    
    averageMarginPercentage: 65,    // 65% average margin
    fixedCostPerCustomer: 5,        // $5 fixed cost per customer
    
    churnModelWeights: {
      daysSinceLastVisit: 0.4,
      orderFrequency: 0.3,
      spendingTrend: 0.2,
      engagementLevel: 0.1
    }
  };

  // Pre-defined customer segments
  private static readonly DEFAULT_SEGMENTS: Omit<CustomerSegment, 'customerIds' | 'totalCustomers' | 'averageSpend' | 'totalRevenue' | 'averageVisitFrequency' | 'retentionRate' | 'profitabilityScore'>[] = [
    {
      id: 'vip-customers',
      name: 'VIP Customers',
      description: 'High-value customers with significant lifetime spending',
      criteria: {
        spendRange: { min: 1000, max: Number.MAX_VALUE },
        visitFrequency: { min: 2, max: Number.MAX_VALUE }
      },
      characteristics: ['High Spending', 'Regular Visits', 'Premium Service'],
      recommendedActions: ['Personalized Service', 'Exclusive Offers', 'Priority Reservations']
    },
    {
      id: 'frequent-diners',
      name: 'Frequent Diners',
      description: 'Regular customers who visit often but spend moderately',
      criteria: {
        visitFrequency: { min: 4, max: Number.MAX_VALUE },
        spendRange: { min: 200, max: 999 }
      },
      characteristics: ['High Frequency', 'Moderate Spending', 'Loyal Behavior'],
      recommendedActions: ['Loyalty Rewards', 'Volume Discounts', 'Special Events']
    },
    {
      id: 'occasional-visitors',
      name: 'Occasional Visitors',
      description: 'Customers who visit infrequently but may have potential',
      criteria: {
        visitFrequency: { min: 1, max: 3 },
        daysSinceLastVisit: { min: 0, max: 90 }
      },
      characteristics: ['Low Frequency', 'Variable Spending', 'Potential Growth'],
      recommendedActions: ['Engagement Campaigns', 'Special Promotions', 'Follow-up Communications']
    },
    {
      id: 'at-risk-customers',
      name: 'At-Risk Customers',
      description: 'Previously active customers who haven\'t visited recently',
      criteria: {
        daysSinceLastVisit: { min: 45, max: 180 },
        spendRange: { min: 100, max: Number.MAX_VALUE }
      },
      characteristics: ['Declining Activity', 'Previous Value', 'Churn Risk'],
      recommendedActions: ['Win-Back Campaigns', 'Personal Outreach', 'Special Incentives']
    },
    {
      id: 'new-customers',
      name: 'New Customers',
      description: 'Recently acquired customers in their first month',
      criteria: {
        registrationAge: { min: 0, max: 30 }
      },
      characteristics: ['Recent Acquisition', 'Learning Phase', 'High Potential'],
      recommendedActions: ['Welcome Experience', 'Onboarding Program', 'First-Visit Follow-up']
    },
    {
      id: 'price-sensitive',
      name: 'Price-Sensitive',
      description: 'Customers who respond well to discounts and promotions',
      criteria: {
        averageOrderValue: { min: 0, max: 25 }
      },
      characteristics: ['Budget Conscious', 'Promotion Seekers', 'Value-Oriented'],
      recommendedActions: ['Discount Offers', 'Value Meals', 'Happy Hour Promotions']
    }
  ];

  // ============================================================================
  // MAIN ANALYTICS METHOD
  // ============================================================================

  /**
   * Generates comprehensive customer analytics and insights
   */
  static async generateCustomerAnalytics(
    customers: Customer[],
    sales: Sale[],
    saleItems: SaleItem[],
    config: Partial<CustomerAnalyticsConfig> = {}
  ): Promise<CustomerAnalyticsResult> {
    
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const now = new Date();
    const periodEnd = now.toISOString();
    const periodStart = new Date(now.getTime() - (fullConfig.analysisMonths * 30 * 24 * 60 * 60 * 1000)).toISOString();
    
    // Filter data to analysis period
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    const filteredSaleItems = saleItems.filter(item => 
      filteredSales.some(sale => sale.id === item.sale_id)
    );
    
    // 1. Analyze individual customer behavior
    const customerAnalyses = await Promise.all(
      customers
        .filter(customer => customer.status === 'active')
        .map(customer => this.analyzeCustomerBehavior(
          customer,
          filteredSales,
          filteredSaleItems,
          fullConfig,
          periodStart,
          periodEnd
        ))
    );
    
    // Filter customers with sufficient data
    const validCustomerAnalyses = customerAnalyses.filter(
      analysis => analysis !== null
    ) as CustomerBehaviorAnalysis[];
    
    // 2. Generate customer segments
    const segments = await this.generateCustomerSegments(
      validCustomerAnalyses,
      customers,
      fullConfig
    );
    
    // 3. Calculate aggregate metrics
    const overallMetrics = this.calculateOverallMetrics(
      validCustomerAnalyses,
      filteredSales,
      filteredSaleItems,
      fullConfig
    );
    
    // 4. Generate strategic insights
    const strategicInsights = this.generateStrategicInsights(
      validCustomerAnalyses,
      segments,
      overallMetrics,
      fullConfig
    );
    
    // 5. Generate actionable recommendations
    const recommendations = this.generateRecommendations(
      validCustomerAnalyses,
      segments,
      strategicInsights
    );
    
    // 6. Generate predictive analytics
    const predictions = this.generatePredictions(
      validCustomerAnalyses,
      fullConfig
    );
    
    return {
      generatedAt: now.toISOString(),
      periodStart,
      periodEnd,
      totalCustomersAnalyzed: validCustomerAnalyses.length,
      segments,
      customerAnalyses: validCustomerAnalyses,
      overallMetrics,
      strategicInsights,
      recommendations,
      predictions
    };
  }

  // ============================================================================
  // INDIVIDUAL CUSTOMER BEHAVIOR ANALYSIS
  // ============================================================================

  private static async analyzeCustomerBehavior(
    customer: Customer,
    sales: Sale[],
    saleItems: SaleItem[],
    config: CustomerAnalyticsConfig,
    periodStart: string,
    periodEnd: string
  ): Promise<CustomerBehaviorAnalysis | null> {
    
    const customerSales = sales.filter(sale => sale.customer_id === customer.id);
    const customerSaleItems = saleItems.filter(item => 
      customerSales.some(sale => sale.id === item.sale_id)
    );
    
    // Skip if insufficient data
    if (customerSales.length < config.minTransactionsForAnalysis) {
      return null;
    }
    
    // Calculate purchase behavior
    const purchaseBehavior = this.calculatePurchaseBehavior(customer, customerSales);
    
    // Calculate visit patterns
    const visitPatterns = this.calculateVisitPatterns(customerSales);
    
    // Calculate service preferences
    const servicePreferences = this.calculateServicePreferences(customerSales);
    
    // Calculate product preferences
    const productPreferences = this.calculateProductPreferences(customerSaleItems);
    
    // Calculate loyalty & engagement
    const loyaltyMetrics = this.calculateLoyaltyMetrics(customer, customerSales, config);
    
    // Calculate financial metrics
    const financialMetrics = this.calculateFinancialMetrics(customer, customerSales, config);
    
    // Generate behavioral insights
    const behavioralInsights = this.generateBehavioralInsights(customer, customerSales, loyaltyMetrics);
    
    // Calculate trends
    const trends = this.calculateCustomerTrends(customerSales);
    
    return {
      customerId: customer.id,
      customerName: customer.name,
      
      ...purchaseBehavior,
      ...visitPatterns,
      ...servicePreferences,
      ...productPreferences,
      ...loyaltyMetrics,
      ...financialMetrics,
      ...behavioralInsights,
      ...trends
    };
  }

  private static calculatePurchaseBehavior(customer: Customer, sales: Sale[]) {
    const totalSpent = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalOrders = sales.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Calculate order frequency (orders per month)
    const firstOrder = new Date(Math.min(...sales.map(s => new Date(s.sale_date).getTime())));
    const lastOrder = new Date(Math.max(...sales.map(s => new Date(s.sale_date).getTime())));
    const monthsActive = Math.max(1, (lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const orderFrequency = totalOrders / monthsActive;
    
    // Days since last order
    const lastOrderDays = customer.last_visit_date 
      ? Math.floor((new Date().getTime() - new Date(customer.last_visit_date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      orderFrequency: Math.round(orderFrequency * 100) / 100,
      lastOrderDays,
      totalOrders
    };
  }

  private static calculateVisitPatterns(sales: Sale[]) {
    // Calculate visit frequency
    const uniqueVisitDates = new Set(sales.map(sale => sale.sale_date.split('T')[0]));
    const totalVisits = uniqueVisitDates.size;
    const firstVisit = new Date(Math.min(...sales.map(s => new Date(s.sale_date).getTime())));
    const lastVisit = new Date(Math.max(...sales.map(s => new Date(s.sale_date).getTime())));
    const monthsActive = Math.max(1, (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const visitFrequency = totalVisits / monthsActive;
    
    // Preferred day of week
    const dayOccurrences: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    sales.forEach(sale => {
      const dayIndex = new Date(sale.sale_date).getDay();
      const dayName = dayNames[dayIndex];
      dayOccurrences[dayName] = (dayOccurrences[dayName] || 0) + 1;
    });
    
    const preferredDayOfWeek = Object.keys(dayOccurrences).length > 0 
      ? Object.keys(dayOccurrences).reduce((a, b) =>
          dayOccurrences[a] > dayOccurrences[b] ? a : b
        )
      : 'No data';    // Preferred time of day
    const hourOccurrences: Record<string, number> = {};
    sales.forEach(sale => {
      const hour = new Date(sale.sale_date).getHours();
      let timeSlot = '';
      if (hour < 12) timeSlot = 'Morning';
      else if (hour < 17) timeSlot = 'Afternoon';
      else timeSlot = 'Evening';
      
      hourOccurrences[timeSlot] = (hourOccurrences[timeSlot] || 0) + 1;
    });
    
    const preferredTimeOfDay = Object.keys(hourOccurrences).length > 0
      ? Object.keys(hourOccurrences).reduce((a, b) => 
          hourOccurrences[a] > hourOccurrences[b] ? a : b
        )
      : 'No data';
    
    // Seasonality pattern (simplified)
    const seasonalityPattern: SeasonalPattern = this.determineSeasonalityPattern(sales);
    
    return {
      visitFrequency: Math.round(visitFrequency * 100) / 100,
      preferredDayOfWeek,
      preferredTimeOfDay,
      seasonalityPattern
    };
  }

  private static calculateServicePreferences(sales: Sale[]) {
    const serviceTypeOccurrences: Record<ServiceType, number> = {
      'dine_in': 0,
      'takeout': 0,
      'delivery': 0,
      'catering': 0
    };
    
    sales.forEach(sale => {
      serviceTypeOccurrences[sale.service_type]++;
    });
    
    const preferredServiceType = Object.keys(serviceTypeOccurrences).length > 0
      ? Object.keys(serviceTypeOccurrences).reduce((a, b) => 
          serviceTypeOccurrences[a as ServiceType] > serviceTypeOccurrences[b as ServiceType] ? a : b
        ) as ServiceType
      : 'dine_in' as ServiceType;
    
    // Calculate distribution percentages
    const totalSales = sales.length;
    const serviceTypeDistribution: Record<ServiceType, number> = {
      'dine_in': Math.round((serviceTypeOccurrences.dine_in / totalSales) * 100),
      'takeout': Math.round((serviceTypeOccurrences.takeout / totalSales) * 100),
      'delivery': Math.round((serviceTypeOccurrences.delivery / totalSales) * 100),
      'catering': Math.round((serviceTypeOccurrences.catering / totalSales) * 100)
    };
    
    // Preferred payment method
    const paymentMethodOccurrences: Record<PaymentMethod, number> = {
      'cash': 0,
      'card': 0,
      'digital_wallet': 0,
      'bank_transfer': 0,
      'credit': 0
    };
    
    sales.forEach(sale => {
      paymentMethodOccurrences[sale.payment_method]++;
    });
    
    const preferredPaymentMethod = Object.keys(paymentMethodOccurrences).length > 0
      ? Object.keys(paymentMethodOccurrences).reduce((a, b) => 
          paymentMethodOccurrences[a as PaymentMethod] > paymentMethodOccurrences[b as PaymentMethod] ? a : b
        ) as PaymentMethod
      : 'cash' as PaymentMethod;
    
    return {
      preferredServiceType,
      serviceTypeDistribution,
      preferredPaymentMethod
    };
  }

  private static calculateProductPreferences(saleItems: SaleItem[]) {
    // Category analysis
    const categoryStats: Record<string, { orderCount: number; totalSpent: number }> = {};
    
    saleItems.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { orderCount: 0, totalSpent: 0 };
      }
      categoryStats[item.category].orderCount += item.quantity;
      categoryStats[item.category].totalSpent += item.total_price;
    });
    
    const totalSpent = Object.values(categoryStats).reduce((sum, cat) => sum + cat.totalSpent, 0);
    
    const favoriteCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        orderCount: stats.orderCount,
        totalSpent: Math.round(stats.totalSpent * 100) / 100,
        percentage: Math.round((stats.totalSpent / totalSpent) * 100)
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    // Product analysis
    const productStats: Record<string, { productName: string; orderCount: number; totalSpent: number }> = {};
    
    saleItems.forEach(item => {
      const key = item.product_id;
      if (!productStats[key]) {
        productStats[key] = { productName: item.product_name, orderCount: 0, totalSpent: 0 };
      }
      productStats[key].orderCount += item.quantity;
      productStats[key].totalSpent += item.total_price;
    });
    
    const topProducts = Object.entries(productStats)
      .map(([productId, stats]) => ({
        productId,
        productName: stats.productName,
        orderCount: stats.orderCount,
        totalSpent: Math.round(stats.totalSpent * 100) / 100
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    return {
      favoriteCategories,
      topProducts
    };
  }

  private static calculateLoyaltyMetrics(customer: Customer, sales: Sale[], config: CustomerAnalyticsConfig) {
    // Calculate loyalty score (0-100)
    const recencyScore = this.calculateRecencyScore(customer.last_visit_date, config.churnRiskDays);
    const frequencyScore = this.calculateFrequencyScore(sales.length, config.frequentCustomerThreshold);
    const monetaryScore = this.calculateMonetaryScore(customer.total_spent, config.highValueThreshold);
    
    const loyaltyScore = Math.round((recencyScore * 0.3 + frequencyScore * 0.4 + monetaryScore * 0.3));
    
    // Calculate churn risk
    const daysSinceLastVisit = customer.last_visit_date 
      ? Math.floor((new Date().getTime() - new Date(customer.last_visit_date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const churnRisk: ChurnRisk = this.calculateChurnRisk(daysSinceLastVisit, sales.length, config);
    
    // Calculate retention probability
    const retentionProbability = Math.max(0, Math.min(100, 100 - (daysSinceLastVisit / config.churnRiskDays) * 50));
    
    // Calculate lifetime value
    const registrationDays = Math.floor((new Date().getTime() - new Date(customer.registration_date).getTime()) / (1000 * 60 * 60 * 24));
    const avgMonthlySpend = customer.total_spent / Math.max(1, registrationDays / 30);
    const lifetimeValue = avgMonthlySpend * 24; // 2-year projection
    
    return {
      loyaltyScore,
      churnRisk,
      retentionProbability: Math.round(retentionProbability),
      lifetimeValue: Math.round(lifetimeValue * 100) / 100,
      loyaltyPoints: customer.loyalty_points
    };
  }

  private static calculateFinancialMetrics(customer: Customer, sales: Sale[], config: CustomerAnalyticsConfig) {
    const totalRevenue = customer.total_spent;
    const estimatedMargin = totalRevenue * (config.averageMarginPercentage / 100);
    const customerCosts = sales.length * config.fixedCostPerCustomer;
    const profitability = estimatedMargin - customerCosts;
    const marginContribution = totalRevenue > 0 ? (profitability / totalRevenue) * 100 : 0;
    
    // Calculate discount sensitivity
    const discountedSales = sales.filter(sale => sale.discount_applied && sale.discount_applied > 0);
    const discountSensitivity = sales.length > 0 ? (discountedSales.length / sales.length) * 100 : 0;
    
    return {
      profitability: Math.round(profitability * 100) / 100,
      marginContribution: Math.round(marginContribution * 100) / 100,
      discountSensitivity: Math.round(discountSensitivity)
    };
  }

  private static generateBehavioralInsights(customer: Customer, sales: Sale[], loyaltyMetrics: any) {
    // Determine behavior segment
    let behaviorSegment = '';
    if (loyaltyMetrics.loyaltyScore >= 80) {
      behaviorSegment = 'Champion';
    } else if (loyaltyMetrics.loyaltyScore >= 60) {
      behaviorSegment = 'Loyal Customer';
    } else if (loyaltyMetrics.loyaltyScore >= 40) {
      behaviorSegment = 'Potential Loyalist';
    } else if (loyaltyMetrics.churnRisk === 'high') {
      behaviorSegment = 'At Risk';
    } else {
      behaviorSegment = 'Needs Attention';
    }
    
    // Determine personality traits
    const personalityTraits: string[] = [];
    if (sales.length >= 10) personalityTraits.push('Frequent Visitor');
    if (customer.total_spent >= 500) personalityTraits.push('High Spender');
    if (loyaltyMetrics.loyaltyScore >= 70) personalityTraits.push('Brand Loyal');
    
    // Generate recommended offers
    const recommendedOffers: string[] = [];
    if (loyaltyMetrics.churnRisk === 'high') {
      recommendedOffers.push('Win-back discount', 'Personal outreach');
    } else if (behaviorSegment === 'Champion') {
      recommendedOffers.push('VIP perks', 'Exclusive events');
    } else {
      recommendedOffers.push('Loyalty program', 'Referral incentives');
    }
    
    // Determine next best action
    let nextBestAction = '';
    if (loyaltyMetrics.churnRisk === 'critical') {
      nextBestAction = 'Immediate retention campaign';
    } else if (loyaltyMetrics.loyaltyScore >= 80) {
      nextBestAction = 'Upsell premium offerings';
    } else {
      nextBestAction = 'Engagement campaign';
    }
    
    return {
      behaviorSegment,
      personalityTraits,
      recommendedOffers,
      nextBestAction
    };
  }

  private static calculateCustomerTrends(sales: Sale[]) {
    if (sales.length < 4) {
      return {
        spendingTrend: 'stable' as const,
        visitTrend: 'stable' as const,
        engagementTrend: 'stable' as const
      };
    }
    
    // Sort sales by date
    const sortedSales = sales.sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime());
    
    // Calculate spending trend
    const midPoint = Math.floor(sortedSales.length / 2);
    const firstHalfSpend = sortedSales.slice(0, midPoint).reduce((sum, sale) => sum + sale.total_amount, 0);
    const secondHalfSpend = sortedSales.slice(midPoint).reduce((sum, sale) => sum + sale.total_amount, 0);
    
    const spendingTrend: 'increasing' | 'stable' | 'decreasing' = secondHalfSpend > firstHalfSpend * 1.1 ? 'increasing' : 
                         secondHalfSpend < firstHalfSpend * 0.9 ? 'decreasing' : 'stable';
    
    // Calculate visit trend (simplified)
    const visitTrend: 'increasing' | 'stable' | 'decreasing' = spendingTrend; // Simplified for now
    const engagementTrend: 'improving' | 'stable' | 'declining' = loyaltyTrend(spendingTrend);
    
    return {
      spendingTrend,
      visitTrend,
      engagementTrend
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static calculateRecencyScore(lastVisitDate: string | undefined, churnRiskDays: number): number {
    if (!lastVisitDate) return 0;
    
    const daysSinceLastVisit = Math.floor((new Date().getTime() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, 100 - (daysSinceLastVisit / churnRiskDays) * 100));
  }

  private static calculateFrequencyScore(orderCount: number, threshold: number): number {
    return Math.min(100, (orderCount / threshold) * 100);
  }

  private static calculateMonetaryScore(totalSpent: number, threshold: number): number {
    return Math.min(100, (totalSpent / threshold) * 100);
  }

  private static calculateChurnRisk(daysSinceLastVisit: number, orderCount: number, config: CustomerAnalyticsConfig): ChurnRisk {
    if (daysSinceLastVisit >= config.churnRiskDays * 2) return 'critical';
    if (daysSinceLastVisit >= config.churnRiskDays) return 'high';
    if (daysSinceLastVisit >= config.churnRiskDays * 0.7) return 'medium';
    return 'low';
  }

  private static determineSeasonalityPattern(sales: Sale[]): SeasonalPattern {
    // Simplified seasonality detection
    const monthCounts: Record<number, number> = {};
    
    sales.forEach(sale => {
      const month = new Date(sale.sale_date).getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    // Find peak months
    const maxCount = Math.max(...Object.values(monthCounts));
    const peakMonths = Object.keys(monthCounts).filter(month => monthCounts[parseInt(month)] === maxCount);
    
    if (peakMonths.includes('5') || peakMonths.includes('6') || peakMonths.includes('7')) {
      return 'summer_peak';
    } else if (peakMonths.includes('11') || peakMonths.includes('0') || peakMonths.includes('1')) {
      return 'winter_peak';
    } else {
      return 'consistent';
    }
  }

  // ============================================================================
  // CUSTOMER SEGMENTATION
  // ============================================================================

  private static async generateCustomerSegments(
    customerAnalyses: CustomerBehaviorAnalysis[],
    allCustomers: Customer[],
    config: CustomerAnalyticsConfig
  ): Promise<CustomerSegment[]> {
    
    const segments: CustomerSegment[] = [];
    
    // Generate segments based on default criteria
    for (const segmentTemplate of this.DEFAULT_SEGMENTS) {
      const matchingCustomers = customerAnalyses.filter(analysis => 
        this.customerMatchesSegment(analysis, segmentTemplate.criteria)
      );
      
      if (matchingCustomers.length > 0) {
        const segment: CustomerSegment = {
          ...segmentTemplate,
          customerIds: matchingCustomers.map(c => c.customerId),
          totalCustomers: matchingCustomers.length,
          averageSpend: this.calculateAverage(matchingCustomers.map(c => c.totalSpent)),
          totalRevenue: matchingCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
          averageVisitFrequency: this.calculateAverage(matchingCustomers.map(c => c.visitFrequency)),
          retentionRate: this.calculateRetentionRate(matchingCustomers),
          profitabilityScore: this.calculateProfitabilityScore(matchingCustomers)
        };
        
        segments.push(segment);
      }
    }
    
    return segments;
  }

  private static customerMatchesSegment(analysis: CustomerBehaviorAnalysis, criteria: SegmentCriteria): boolean {
    // Check spend range
    if (criteria.spendRange) {
      if (analysis.totalSpent < criteria.spendRange.min || analysis.totalSpent > criteria.spendRange.max) {
        return false;
      }
    }
    
    // Check visit frequency
    if (criteria.visitFrequency) {
      if (analysis.visitFrequency < criteria.visitFrequency.min || analysis.visitFrequency > criteria.visitFrequency.max) {
        return false;
      }
    }
    
    // Check days since last visit
    if (criteria.daysSinceLastVisit) {
      if (analysis.lastOrderDays < criteria.daysSinceLastVisit.min || analysis.lastOrderDays > criteria.daysSinceLastVisit.max) {
        return false;
      }
    }
    
    // Check average order value
    if (criteria.averageOrderValue) {
      if (analysis.averageOrderValue < criteria.averageOrderValue.min || analysis.averageOrderValue > criteria.averageOrderValue.max) {
        return false;
      }
    }
    
    return true;
  }

  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 100) / 100;
  }

  private static calculateRetentionRate(customers: CustomerBehaviorAnalysis[]): number {
    const activeCustomers = customers.filter(c => c.churnRisk === 'low' || c.churnRisk === 'medium');
    return customers.length > 0 ? Math.round((activeCustomers.length / customers.length) * 100) : 0;
  }

  private static calculateProfitabilityScore(customers: CustomerBehaviorAnalysis[]): number {
    const avgProfitability = this.calculateAverage(customers.map(c => c.profitability));
    return Math.max(0, Math.min(100, avgProfitability));
  }

  // ============================================================================
  // AGGREGATE METRICS CALCULATION
  // ============================================================================

  private static calculateOverallMetrics(
    customerAnalyses: CustomerBehaviorAnalysis[],
    sales: Sale[],
    saleItems: SaleItem[],
    config: CustomerAnalyticsConfig
  ) {
    const totalActiveCustomers = customerAnalyses.length;
    const totalRevenue = customerAnalyses.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageOrderValue = this.calculateAverage(customerAnalyses.map(c => c.averageOrderValue));
    const averageCustomerLifetimeValue = this.calculateAverage(customerAnalyses.map(c => c.lifetimeValue));
    
    // Customer health metrics
    const healthyCustomers = customerAnalyses.filter(c => c.churnRisk === 'low').length;
    const atRiskCustomers = customerAnalyses.filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical').length;
    const retainedCustomers = customerAnalyses.filter(c => c.lastOrderDays <= 30).length;
    const churnRate = totalActiveCustomers > 0 ? Math.round(((totalActiveCustomers - retainedCustomers) / totalActiveCustomers) * 100) : 0;
    
    // Revenue distribution
    const revenueByServiceType: Record<ServiceType, number> = {
      'dine_in': 0,
      'takeout': 0,
      'delivery': 0,
      'catering': 0
    };
    
    const revenueByPaymentMethod: Record<PaymentMethod, number> = {
      'cash': 0,
      'card': 0,
      'digital_wallet': 0,
      'bank_transfer': 0,
      'credit': 0
    };
    
    sales.forEach(sale => {
      revenueByServiceType[sale.service_type] += sale.total_amount;
      revenueByPaymentMethod[sale.payment_method] += sale.total_amount;
    });
    
    // Top categories
    const categoryStats: Record<string, { revenue: number; orderCount: number; customerCount: Set<string> }> = {};
    
    saleItems.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { revenue: 0, orderCount: 0, customerCount: new Set() };
      }
      categoryStats[item.category].revenue += item.total_price;
      categoryStats[item.category].orderCount += item.quantity;
      
      // Find customer for this sale item
      const sale = sales.find(s => s.id === item.sale_id);
      if (sale?.customer_id) {
        categoryStats[item.category].customerCount.add(sale.customer_id);
      }
    });
    
    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        revenue: Math.round(stats.revenue * 100) / 100,
        orderCount: stats.orderCount,
        customerCount: stats.customerCount.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    return {
      totalActiveCustomers,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue,
      averageCustomerLifetimeValue,
      customerAcquisitionRate: 0, // Would need historical data
      customerRetentionRate: 100 - churnRate,
      churnRate,
      
      revenueBySegment: {}, // Would be calculated from segments
      revenueByServiceType,
      revenueByPaymentMethod,
      
      averageOrderFrequency: this.calculateAverage(customerAnalyses.map(c => c.orderFrequency)),
      averageVisitFrequency: this.calculateAverage(customerAnalyses.map(c => c.visitFrequency)),
      peakHours: ['12:00-13:00', '18:00-20:00'], // Mock data
      peakDays: ['Friday', 'Saturday'], // Mock data
      seasonalTrends: {}, // Would require seasonal analysis
      
      topCategories,
      
      healthyCustomers,
      atRiskCustomers,
      lostCustomers: churnRate > 0 ? Math.round((churnRate / 100) * totalActiveCustomers) : 0,
      newCustomers: 0 // Would need registration date analysis
    };
  }

  // ============================================================================
  // STRATEGIC INSIGHTS GENERATION
  // ============================================================================

  private static generateStrategicInsights(
    customerAnalyses: CustomerBehaviorAnalysis[],
    segments: CustomerSegment[],
    overallMetrics: any,
    config: CustomerAnalyticsConfig
  ) {
    const insights = [];
    
    // High churn risk insight
    const highRiskCustomers = customerAnalyses.filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical');
    if (highRiskCustomers.length > customerAnalyses.length * 0.2) {
      insights.push({
        type: 'threat' as const,
        category: 'retention' as const,
        title: 'High Customer Churn Risk',
        description: `${highRiskCustomers.length} customers (${Math.round((highRiskCustomers.length / customerAnalyses.length) * 100)}%) are at high risk of churning`,
        impact: 'high' as const,
        confidence: 85,
        recommendation: 'Implement immediate retention campaigns for at-risk customers',
        estimatedValue: highRiskCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0),
        timeframe: 'immediate' as const
      });
    }
    
    // High-value segment opportunity
    const vipSegment = segments.find(s => s.id === 'vip-customers');
    if (vipSegment && vipSegment.totalCustomers > 0) {
      insights.push({
        type: 'opportunity' as const,
        category: 'monetization' as const,
        title: 'VIP Customer Upselling Opportunity',
        description: `${vipSegment.totalCustomers} VIP customers with high lifetime value potential`,
        impact: 'high' as const,
        confidence: 90,
        recommendation: 'Develop premium offerings and personalized experiences for VIP segment',
        estimatedValue: vipSegment.averageSpend * vipSegment.totalCustomers * 0.3,
        timeframe: 'short_term' as const
      });
    }
    
    // Low average order value insight
    if (overallMetrics.averageOrderValue < 25) {
      insights.push({
        type: 'weakness' as const,
        category: 'monetization' as const,
        title: 'Low Average Order Value',
        description: `Average order value of $${overallMetrics.averageOrderValue} is below optimal range`,
        impact: 'medium' as const,
        confidence: 80,
        recommendation: 'Implement upselling strategies and bundle offers to increase order values',
        timeframe: 'medium_term' as const
      });
    }
    
    return insights;
  }

  // ============================================================================
  // RECOMMENDATIONS GENERATION
  // ============================================================================

  private static generateRecommendations(
    customerAnalyses: CustomerBehaviorAnalysis[],
    segments: CustomerSegment[],
    strategicInsights: any[]
  ) {
    const recommendations = [];
    
    // Retention campaign for at-risk customers
    const atRiskCustomers = customerAnalyses.filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical');
    if (atRiskCustomers.length > 0) {
      recommendations.push({
        id: 'retention-campaign-1',
        type: 'retention_campaign' as const,
        priority: 'critical' as const,
        title: 'At-Risk Customer Retention Campaign',
        description: 'Immediate intervention for customers with high churn risk',
        targetSegment: 'at-risk-customers',
        affectedCustomers: atRiskCustomers.map(c => c.customerId),
        estimatedImpact: {
          retentionImprovement: 40,
          revenueIncrease: atRiskCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0) * 0.4
        },
        implementation: {
          steps: [
            'Identify specific churn indicators for each customer',
            'Design personalized win-back offers',
            'Execute multi-channel outreach campaign',
            'Monitor response and adjust tactics'
          ],
          resources: ['Marketing team', 'Customer service', 'Analytics tools'],
          timeline: '2-4 weeks',
          budget: 5000
        },
        successMetrics: ['Retention rate improvement', 'Response rate', 'Revenue recovery']
      });
    }
    
    // Loyalty program for frequent customers
    const frequentCustomers = customerAnalyses.filter(c => c.behaviorSegment === 'Loyal Customer');
    if (frequentCustomers.length > 0) {
      recommendations.push({
        id: 'loyalty-program-1',
        type: 'retention_campaign' as const,
        priority: 'high' as const,
        title: 'Enhanced Loyalty Program',
        description: 'Strengthen relationships with loyal customers through enhanced benefits',
        targetSegment: 'frequent-diners',
        affectedCustomers: frequentCustomers.map(c => c.customerId),
        estimatedImpact: {
          retentionImprovement: 20,
          revenueIncrease: frequentCustomers.reduce((sum, c) => sum + c.totalSpent, 0) * 0.15
        },
        implementation: {
          steps: [
            'Design tiered loyalty benefits',
            'Implement points and rewards system',
            'Create exclusive member experiences',
            'Launch with targeted communications'
          ],
          resources: ['Product team', 'Marketing', 'Operations'],
          timeline: '6-8 weeks',
          budget: 10000
        },
        successMetrics: ['Program enrollment', 'Engagement rate', 'Repeat purchase rate']
      });
    }
    
    return recommendations;
  }

  // ============================================================================
  // PREDICTIVE ANALYTICS
  // ============================================================================

  private static generatePredictions(
    customerAnalyses: CustomerBehaviorAnalysis[],
    config: CustomerAnalyticsConfig
  ) {
    // Churn predictions
    const churnPredictions = customerAnalyses.map(analysis => {
      const weights = config.churnModelWeights;
      
      // Calculate weighted churn probability
      const recencyFactor = Math.min(1, analysis.lastOrderDays / 60) * weights.daysSinceLastVisit;
      const frequencyFactor = Math.max(0, 1 - (analysis.orderFrequency / 4)) * weights.orderFrequency;
      const spendingFactor = analysis.spendingTrend === 'decreasing' ? 0.3 : 0 * weights.spendingTrend;
      const engagementFactor = analysis.engagementTrend === 'declining' ? 0.4 : 0 * weights.engagementLevel;
      
      const churnProbability = Math.min(100, Math.round((recencyFactor + frequencyFactor + spendingFactor + engagementFactor) * 100));
      
      const preventionActions = [];
      if (churnProbability > 70) {
        preventionActions.push('Immediate personal outreach', 'Special discount offer');
      } else if (churnProbability > 40) {
        preventionActions.push('Engagement campaign', 'Loyalty incentives');
      }
      
      return {
        customerId: analysis.customerId,
        churnProbability,
        timeToChurn: churnProbability > 50 ? Math.round(30 - (analysis.lastOrderDays * 0.5)) : undefined,
        preventionActions
      };
    }).filter(pred => pred.churnProbability > 30);
    
    // Lifetime value predictions
    const lifetimeValuePredictions = customerAnalyses.map(analysis => ({
      customerId: analysis.customerId,
      predictedLTV: Math.round(analysis.lifetimeValue * 1.2), // 20% growth assumption
      confidence: analysis.totalOrders >= 5 ? 85 : 60,
      factors: ['Purchase frequency', 'Average order value', 'Customer tenure']
    }));
    
    // Next purchase predictions
    const nextPurchasePredictions = customerAnalyses
      .filter(analysis => analysis.churnRisk === 'low' || analysis.churnRisk === 'medium')
      .map(analysis => {
        const avgDaysBetweenOrders = analysis.orderFrequency > 0 ? 30 / analysis.orderFrequency : 30;
        const expectedDays = Math.round(avgDaysBetweenOrders - analysis.lastOrderDays);
        
        return {
          customerId: analysis.customerId,
          nextPurchaseProbability: Math.max(0, Math.min(100, 100 - analysis.lastOrderDays * 2)),
          expectedDate: expectedDays > 0 ? new Date(Date.now() + expectedDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
          recommendedProducts: analysis.topProducts.slice(0, 3).map(p => p.productName)
        };
      });
    
    return {
      churnPredictions,
      lifetimeValuePredictions,
      nextPurchasePredictions
    };
  }
}

// Helper function for trend calculation
function loyaltyTrend(spendingTrend: 'increasing' | 'stable' | 'decreasing'): 'improving' | 'stable' | 'declining' {
  switch (spendingTrend) {
    case 'increasing': return 'improving';
    case 'decreasing': return 'declining';
    default: return 'stable';
  }
}
