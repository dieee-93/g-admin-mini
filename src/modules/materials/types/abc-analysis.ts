// ABC Analysis Types for Materials Module
export interface ABCCategory {
  category: 'A' | 'B' | 'C';
  title: string;
  description: string;
  color: string;
  items: number;
  percentage: number;
  revenue: number;
  strategy: string;
}

export interface MaterialABC {
  id: string;
  name: string;
  category: string;
  abcClass: 'A' | 'B' | 'C';
  currentStock: number;
  unit: string;
  unitCost: number;
  annualConsumption: number;
  annualValue: number;
  revenuePercentage: number;
  cumulativeRevenue: number;
}

export interface ABCAnalysisResult {
  categories: ABCCategory[];
  materials: MaterialABC[];
  totalValue: number;
  analysisDate: string;
  criteria: 'revenue' | 'quantity' | 'frequency';
}