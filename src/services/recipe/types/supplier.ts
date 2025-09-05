// ==========================================
// ADVANCED SUPPLIER TYPES - Lazy Loaded
// Only loaded when supplier management features are needed
// ==========================================

export interface SupplierData {
  primary_supplier: string;
  alternative_suppliers: string[];
  lead_time_days: number;
  minimum_order_quantity: number;
  price_per_unit: number;
  price_last_updated: string;
}

export interface PriceVolatility {
  current_trend: 'stable' | 'increasing' | 'decreasing';
  volatility_score: number; // 0-100
  price_history: Array<{
    date: string;
    price: number;
  }>;
}

export interface SeasonalAvailability {
  high_season: string[];
  low_season: string[];
  availability_score: number;
}

export interface RecipeWithSupplierData {
  id: string;
  name: string;
  supplier_dependencies: SupplierData[];
  supply_risk_score: number;
}