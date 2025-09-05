// ==========================================
// ADVANCED MENU ENGINEERING TYPES - Lazy Loaded
// Only loaded when menu analysis features are needed
// ==========================================

export enum MenuCategory {
  STARS = 'stars',           // High profit + High popularity
  PLOWHORSES = 'plowhorses', // Low profit + High popularity  
  PUZZLES = 'puzzles',       // High profit + Low popularity
  DOGS = 'dogs'              // Low profit + Low popularity
}

export enum HealthCategory {
  LIGHT = 'light',
  BALANCED = 'balanced',
  INDULGENT = 'indulgent'
}

export interface MenuEngineeringData {
  menu_category: MenuCategory;
  popularity_score: number;
  profitability_score: number;
  contribution_margin: number;
  sales_volume: number;
  recommended_action: string;
}

export interface MenuAnalysis {
  recipe_id: string;
  current_performance: MenuEngineeringData;
  optimization_suggestions: string[];
  pricing_recommendations: {
    current_price: number;
    suggested_price: number;
    price_elasticity: number;
  };
}

export interface CompetitorAnalysis {
  similar_items: Array<{
    name: string;
    price: number;
    restaurant: string;
  }>;
  market_position: 'premium' | 'competitive' | 'value';
}

export interface RecipeWithMenuData {
  id: string;
  name: string;
  menu_engineering: MenuEngineeringData;
  competitor_analysis?: CompetitorAnalysis;
}