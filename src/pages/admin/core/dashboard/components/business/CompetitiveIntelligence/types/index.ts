// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface CompetitorData {
  id: string;
  name: string;
  type: 'direct' | 'indirect' | 'substitute';
  category: string;
  location: {
    address: string;
    distance: number; // km
    zone: string;
  };

  // Business metrics
  businessMetrics: {
    estimatedRevenue: number;
    marketShare: number;
    customerBase: number;
    operatingHours: string;
    deliveryRadius: number;
    averageTicket: number;
  };

  // Menu analysis
  menuAnalysis: {
    totalItems: number;
    categories: string[];
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
    uniqueItems: number;
    seasonalItems: number;
  };

  // Pricing intelligence
  pricingIntelligence: CompetitivePricing[];

  // Performance metrics
  performance: {
    customerRating: number;
    reviewCount: number;
    responseTime: number; // minutes
    deliveryTime: number; // minutes
    popularityTrend: 'up' | 'down' | 'stable';
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  };

  // Digital presence
  digitalPresence: {
    website: boolean;
    socialMedia: {
      instagram: number; // followers
      facebook: number;
      tiktok: number;
    };
    onlineOrdering: boolean;
    deliveryApps: string[];
    marketingBudget: number;
  };

  // Strengths and weaknesses
  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  lastUpdated: string;
  dataQuality: number; // 0-100
}

export interface CompetitivePricing {
  categoryId: string;
  categoryName: string;
  ourPrice: number;
  competitorPrice: number;
  priceDifference: number;
  pricePosition: 'premium' | 'competitive' | 'discount';
  marketAverage: number;
  recommendedAction: 'increase' | 'decrease' | 'maintain' | 'monitor';
  confidence: number; // 0-100
}

export interface MarketTrend {
  id: string;
  category: string;
  trend: 'growing' | 'declining' | 'stable';
  growthRate: number; // percentage
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  description: string;
  impact: 'high' | 'medium' | 'low';
  opportunity: string;
  recommendedActions: string[];
  dataPoints: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  category?: string;
}

export interface PositioningAnalysis {
  currentPosition: {
    x: number; // price axis
    y: number; // quality/service axis
  };
  optimalPosition: {
    x: number;
    y: number;
  };
  positioningQuadrant: 'premium' | 'value' | 'economy' | 'luxury';
  competitiveGap: number;
  marketOpportunity: number;
  recommendations: PositioningRecommendation[];
}

export interface PositioningRecommendation {
  id:string;
  type: 'pricing' | 'quality' | 'service' | 'marketing' | 'differentiation';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: {
    difficulty: 'low' | 'medium' | 'high';
    timeline: string;
    resources: string[];
    cost: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MarketInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend' | 'competitive_move';
  urgency: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  title: string;
  description: string;
  impact: {
    revenue: number;
    marketShare: number;
    customerBase: number;
  };
  confidence: number;
  source: 'competitor_analysis' | 'market_research' | 'customer_feedback' | 'industry_report';
  actionRequired: boolean;
  relatedCompetitors: string[];
  timestamp: string;
}
