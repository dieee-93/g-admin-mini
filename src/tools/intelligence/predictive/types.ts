// Predictive Analytics Types
export interface MLModel {
  id: string;
  title: string;
  description: string;
  accuracy: string;
  status: 'active' | 'training' | 'development';
  lastTrained: string;
  predictions: Prediction[];
}

export interface Prediction {
  id: string;
  type: 'demand' | 'sales' | 'inventory' | 'risk';
  value: number | string;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface ForecastResult {
  title: string;
  value: string;
  confidence: string;
  trend: string;
  color: string;
}