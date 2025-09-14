// ABC Analysis types for Materials Inventory Management
// Advanced inventory categorization and analytics

import type { MaterialItem } from '../types';

// ============================================================================
// 🎯 ABC CLASSIFICATION TYPES
// ============================================================================

export type ABCClass = 'A' | 'B' | 'C';

export type AnalysisType = 'revenue' | 'quantity' | 'frequency' | 'cost';

// ABC Category overview for dashboard cards
export interface ABCCategory {
  category: ABCClass;
  title: string;
  description: string;
  color: 'red' | 'yellow' | 'green';
  items: number;
  percentage: number;
  revenue: number;
  strategy: string;
}

// Material with ABC classification data
export interface MaterialABC extends MaterialItem {
  // ABC Classification
  abcClass: ABCClass;
  
  // Analysis metrics
  annualConsumption: number;      // Total units consumed per year
  annualValue: number;           // Total value (consumption * unit_cost)
  revenuePercentage: number;     // % of total revenue this item represents
  cumulativeRevenue: number;     // Cumulative % up to this item
  
  // Current stock status
  currentStock: number;
  
  // Optional analysis data
  consumptionFrequency?: number;  // Times used per month
  lastUsedDate?: string;
  averageOrderQuantity?: number;
  leadTime?: number;             // Days from order to delivery
  
  // Cost analysis
  totalStockValue?: number;      // current_stock * unit_cost
  monthlyConsumption?: number;   // Average monthly usage
  
  // Supplier information
  primarySupplier?: string;
  alternativeSuppliers?: string[];
}

// ============================================================================
// 🔄 ABC ANALYSIS ALGORITHM PARAMETERS
// ============================================================================

export interface ABCAnalysisConfig {
  // Classification thresholds
  classAThreshold: number;    // % for Class A (default: 80%)
  classBThreshold: number;    // % for Class B (default: 15%)
  // Class C is remaining (default: 5%)
  
  // Analysis criteria
  primaryCriteria: AnalysisType;
  secondaryCriteria?: AnalysisType;
  
  // Time periods
  analysisPeridMonths: number;  // Months to look back (default: 12)
  minDataPoints: number;        // Minimum usage data points required
  
  // Filters
  includeInactive?: boolean;    // Include items with 0 consumption
  minValue?: number;           // Minimum value threshold to include
  excludeCategories?: string[]; // Categories to exclude from analysis
}

// ============================================================================
// 📊 ANALYSIS RESULTS
// ============================================================================

export interface ABCAnalysisResult {
  // Metadata
  generatedAt: string;
  config: ABCAnalysisConfig;
  totalItemsAnalyzed: number;
  totalValue: number;
  
  // Classifications
  classA: MaterialABC[];
  classB: MaterialABC[];
  classC: MaterialABC[];
  
  // Summary statistics
  summary: {
    classA: ABCClassSummary;
    classB: ABCClassSummary;
    classC: ABCClassSummary;
  };
  
  // Recommendations
  recommendations: ABCRecommendation[];
}

export interface ABCClassSummary {
  itemCount: number;
  totalValue: number;
  percentageOfValue: number;
  percentageOfItems: number;
  averageValue: number;
  strategy: string;
}

// ============================================================================
// 💡 RECOMMENDATIONS ENGINE
// ============================================================================

export interface ABCRecommendation {
  id: string;
  type: 'stock_optimization' | 'supplier_negotiation' | 'cost_reduction' | 'process_improvement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings?: number;
  implementationEffort: 'low' | 'medium' | 'high';
  affectedItems: string[];  // Item IDs
  actionItems: string[];
}

// ============================================================================
// 📈 HISTORICAL TRACKING
// ============================================================================

export interface ABCHistorySnapshot {
  id: string;
  snapshotDate: string;
  config: ABCAnalysisConfig;
  
  // Classification changes
  classificationChanges: {
    promotions: ABCClassChange[];    // Items moved to higher class
    demotions: ABCClassChange[];     // Items moved to lower class
  };
  
  // Performance metrics
  accuracy: number;                  // % of classifications that remained stable
  volatility: number;                // Average position changes
  
  // Summary comparison
  summaryComparison: {
    previous: ABCClassSummary;
    current: ABCClassSummary;
    change: ABCClassSummary;
  };
}

export interface ABCClassChange {
  itemId: string;
  itemName: string;
  previousClass: ABCClass;
  newClass: ABCClass;
  valueChange: number;
  reason: string;
}

// ============================================================================
// 🎯 CONTROL STRATEGIES
// ============================================================================

export interface ControlStrategy {
  abcClass: ABCClass;
  
  // Inventory control
  reviewFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  stockLevels: {
    safetyStock: number;       // As percentage of avg consumption
    reorderPoint: number;      // When to reorder
    maxStock: number;         // Maximum stock allowed
  };
  
  // Procurement approach
  procurementStrategy: 'just_in_time' | 'bulk_purchase' | 'flexible' | 'strategic';
  negotiationPriority: 'high' | 'medium' | 'low';
  supplierRequirements: string[];
  
  // Quality control
  qualityCheckFrequency: 'every_delivery' | 'sample_based' | 'monthly' | 'quarterly';
  
  // Documentation requirements
  documentation: 'detailed' | 'standard' | 'minimal';
}

// Default control strategies for each class
export const DEFAULT_CONTROL_STRATEGIES: Record<ABCClass, ControlStrategy> = {
  A: {
    abcClass: 'A',
    reviewFrequency: 'daily',
    stockLevels: {
      safetyStock: 10,  // 10% safety stock
      reorderPoint: 80, // Reorder when 80% depleted
      maxStock: 120     // Max 120% of avg consumption
    },
    procurementStrategy: 'just_in_time',
    negotiationPriority: 'high',
    supplierRequirements: ['multiple_suppliers', 'quality_certification', 'fast_delivery'],
    qualityCheckFrequency: 'every_delivery',
    documentation: 'detailed'
  },
  B: {
    abcClass: 'B',
    reviewFrequency: 'weekly',
    stockLevels: {
      safetyStock: 20,
      reorderPoint: 70,
      maxStock: 150
    },
    procurementStrategy: 'flexible',
    negotiationPriority: 'medium',
    supplierRequirements: ['reliable_delivery', 'competitive_pricing'],
    qualityCheckFrequency: 'sample_based',
    documentation: 'standard'
  },
  C: {
    abcClass: 'C',
    reviewFrequency: 'monthly',
    stockLevels: {
      safetyStock: 30,
      reorderPoint: 50,
      maxStock: 200
    },
    procurementStrategy: 'bulk_purchase',
    negotiationPriority: 'low',
    supplierRequirements: ['cost_effective'],
    qualityCheckFrequency: 'quarterly',
    documentation: 'minimal'
  }
};

// ============================================================================
// 🔍 EXPORT UTILITIES
// ============================================================================

// Type guards
export const isClassA = (item: MaterialABC): boolean => item.abcClass === 'A';
export const isClassB = (item: MaterialABC): boolean => item.abcClass === 'B';
export const isClassC = (item: MaterialABC): boolean => item.abcClass === 'C';

// Class color mapping for UI
export const getClassColor = (abcClass: ABCClass): 'red' | 'yellow' | 'green' => {
  switch (abcClass) {
    case 'A': return 'red';
    case 'B': return 'yellow';
    case 'C': return 'green';
  }
};

// Strategic importance mapping
export const getClassImportance = (abcClass: ABCClass): string => {
  switch (abcClass) {
    case 'A': return 'Crítico - Control riguroso diario';
    case 'B': return 'Importante - Control semanal regular';
    case 'C': return 'Ordinario - Control mensual básico';
  }
};