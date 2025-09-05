// ==========================================
// ADVANCED PRODUCTION TYPES - Lazy Loaded
// Only loaded when production scheduling features are needed
// ==========================================

export enum KitchenStation {
  PREP = 'prep',
  GRILL = 'grill',
  FRYER = 'fryer',
  SAUTE = 'saute',
  OVEN = 'oven',
  COLD = 'cold',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage'
}

export enum PreparationMethod {
  CHOP = 'chop',
  DICE = 'dice',
  SLICE = 'slice',
  MINCE = 'mince',
  GRILL = 'grill',
  BAKE = 'bake',
  FRY = 'fry',
  STEAM = 'steam',
  BOIL = 'boil',
  SAUTE = 'saute'
}

export interface ProductionStep {
  step_number: number;
  instruction: string;
  station: KitchenStation;
  estimated_time: number; // minutes
  temperature?: number;
  equipment_needed?: string[];
}

export interface QualityRequirement {
  visual_standards: string[];
  texture_requirements: string[];
  temperature_specs: {
    min: number;
    max: number;
    unit: 'celsius' | 'fahrenheit';
  };
}

export interface ProductionSchedule {
  recipe_id: string;
  batch_size: number;
  production_steps: ProductionStep[];
  total_time: number;
  parallel_steps: number[][];
}

export interface RecipeWithProduction {
  id: string;
  name: string;
  kitchen_station: KitchenStation;
  production_schedule: ProductionSchedule;
  quality_requirements: QualityRequirement;
}