// Predictive Analytics Interfaces
export interface MaterialDemand {
  materialId: string;
  materialName: string;
  currentStock: number;
  unit: string;
  historicalData: DemandDataPoint[];
  prediction: DemandPrediction;
  seasonality: SeasonalityPattern;
  alerts: PredictiveAlert[];
}

export interface DemandDataPoint {
  date: string;
  actualDemand: number;
  stockLevel: number;
  events?: string[]; // Special events that affected demand
  temperature?: number;
  dayOfWeek: number;
  isHoliday?: boolean;
}

export interface DemandPrediction {
  forecastPeriod: number; // days
  predictions: ForecastPoint[];
  accuracy: number; // 0-100%
  confidenceLevel: number; // 0-100%
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  seasonalityDetected: boolean;
  recommendedAction: PredictiveRecommendation;
}

export interface ForecastPoint {
  date: string;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  impact: number; // -100 to +100
  category: 'seasonal' | 'trend' | 'event' | 'weather' | 'day_of_week';
}

export interface SeasonalityPattern {
  detected: boolean;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'event_driven';
  strength: number; // 0-100%
  peakPeriods: PeakPeriod[];
  adjustments: SeasonalAdjustment[];
}

export interface PeakPeriod {
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number; // 1.5 = 50% increase
  category: 'seasonal' | 'holiday' | 'event' | 'weather';
}

export interface SeasonalAdjustment {
  period: string;
  adjustment: number;
  reasoning: string;
}

export interface PredictiveAlert {
  id: string;
  type: 'stockout_risk' | 'overstock_risk' | 'demand_spike' | 'trend_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  estimatedImpact: number;
  recommendedAction: string;
  daysUntilEvent: number;
}

export interface PredictiveRecommendation {
  action: 'increase_order' | 'decrease_order' | 'maintain_current' | 'urgent_restock' | 'reduce_inventory';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedQuantity?: number;
  reasoning: string;
  estimatedSavings?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PredictiveAnalyticsConfig {
  forecastHorizon: number;
  confidenceThreshold: number;
  seasonalityDetection: boolean;
  weatherIntegration: boolean;
  eventCalendarSync: boolean;
  autoReorderTrigger: boolean;
  alertThresholds: {
    stockoutRisk: number;
    overstockRisk: number;
    demandSpike: number;
  };
}
