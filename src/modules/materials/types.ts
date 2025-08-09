// src/features/inventory/types.ts
// 🚀 SISTEMA EXPANDIDO - Soporte para 3 tipos de items con precisión total

// ============================================================================
// 📏 SISTEMA DE UNIDADES Y CONVERSIONES
// ============================================================================

export type WeightUnit = 'kg' | 'g' | 'ton';
export type VolumeUnit = 'l' | 'ml' | 'cm3';
export type LengthUnit = 'm' | 'cm' | 'mm';
export type CountUnit = 'unidad' | 'docena' | 'caja' | 'paquete' | 'bolsa';

export type MeasurableUnit = WeightUnit | VolumeUnit | LengthUnit;
export type AllUnit = MeasurableUnit | CountUnit;

// Conversiones a unidad base (gramos para peso, ml para volumen, mm para longitud)
export const UNIT_CONVERSIONS = {
  // Peso → gramos
  weight: {
    g: 1,
    kg: 1000,
    ton: 1000000
  },
  // Volumen → ml
  volume: {
    ml: 1,
    cm3: 1,
    l: 1000
  },
  // Longitud → mm
  length: {
    mm: 1,
    cm: 10,
    m: 1000
  }
} as const;

export const UNIT_CATEGORIES = {
  weight: ['g', 'kg', 'ton'] as WeightUnit[],
  volume: ['ml', 'cm3', 'l'] as VolumeUnit[],
  length: ['mm', 'cm', 'm'] as LengthUnit[],
  count: ['unidad', 'docena', 'caja', 'paquete', 'bolsa'] as CountUnit[]
} as const;

// ============================================================================
// 🎯 TIPOS DE ITEMS (3 categorías)
// ============================================================================

export type ItemType = 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED';

// Base interface para todos los items
export interface BaseItem {
  id: string;
  name: string;
  type: ItemType;
  stock: number;           // Cantidad actual en stock
  unit_cost?: number;      // Costo por unidad base
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📐 1. ITEMS CONMENSURABLES (peso, volumen, longitud)
// ============================================================================

export interface MeasurableItem extends BaseItem {
  type: 'MEASURABLE';
  unit: MeasurableUnit;
  category: 'weight' | 'volume' | 'length';
  
  // Para conversiones y display
  preferred_display_unit?: MeasurableUnit;  // ej: mostrar en kg aunque se almacene en g
  precision?: number;                       // decimales para display (default: 0)
}

// ============================================================================
// 🔢 2. ITEMS CONTABLES (unidades, con packaging opcional)
// ============================================================================

export interface PackagingInfo {
  package_size: number;       // ej: 50 (cajas de pizza)
  package_unit: string;       // ej: "caja", "docena" 
  package_cost?: number;      // costo del paquete completo
  display_mode: 'individual' | 'packaged' | 'both';
}

export interface CountableItem extends BaseItem {
  type: 'COUNTABLE';
  unit: 'unidad';
  
  // Packaging info (opcional)
  packaging?: PackagingInfo;
  
  // Para casos como "6 docenas = 72 unidades"
  base_quantity?: number;     // 72 (unidades individuales)
  display_quantity?: number;  // 6 (docenas)
  display_unit?: string;      // "docena"
}

// ============================================================================
// 🍳 3. ITEMS ELABORADOS (tienen receta, requieren ingredients)
// ============================================================================

export interface ElaboratedItem extends BaseItem {
  type: 'ELABORATED';
  unit: AllUnit;  // Puede ser cualquier unidad
  
  // Receta asociada
  recipe_id?: string;
  requires_production: boolean;     // true = debe producirse antes de usar
  auto_calculate_cost: boolean;     // true = costo se calcula automáticamente de ingredientes
  
  // Control de producción
  ingredients_available?: boolean;  // se calcula automáticamente
  production_time?: number;         // minutos estimados de producción
  batch_size?: number;             // cantidad que produce cada batch de la receta
}

// ============================================================================
// 📊 UNION TYPE Y UTILIDADES
// ============================================================================

export type InventoryItem = MeasurableItem | CountableItem | ElaboratedItem;

// Type guards para distinguir tipos
export const isMeasurable = (item: InventoryItem): item is MeasurableItem => 
  item.type === 'MEASURABLE';

export const isCountable = (item: InventoryItem): item is CountableItem => 
  item.type === 'COUNTABLE';

export const isElaborated = (item: InventoryItem): item is ElaboratedItem => 
  item.type === 'ELABORATED';

// ============================================================================
// 📈 STOCK ENTRIES Y MOVIMIENTOS
// ============================================================================

export interface StockEntry {
  id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
  note?: string;
  
  // Info del item para joins
  item?: {
    name: string;
    unit: string;
    type: ItemType;
  };
  
  // Metadatos adicionales
  entry_type?: 'purchase' | 'production' | 'adjustment' | 'return';
  supplier?: string;
  batch_number?: string;
  expiry_date?: string;
}

// ============================================================================
// 🚨 ALERTAS Y THRESHOLDS
// ============================================================================

export interface AlertThreshold {
  id: string;
  item_id: string;
  min_stock: number;
  critical_stock: number;
  auto_reorder?: boolean;
  reorder_quantity?: number;
}

export interface StockAlert {
  id: string;
  item_id: string;
  item_name: string;
  item_type: ItemType;
  item_unit: string;
  current_stock: number;
  min_stock: number;
  urgency: 'info' | 'warning' | 'critical';
  suggested_order?: number;
  created_at: string;
}

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  hasCritical: boolean;
  hasWarning: boolean;
}

// ============================================================================
// 📊 ESTADÍSTICAS Y MÉTRICAS
// ============================================================================

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentMovements: number;
  
  // Por tipo
  measurableItems: number;
  countableItems: number;
  elaboratedItems: number;
  
  // Valor por categoría
  valueByCategory: {
    measurable: number;
    countable: number;
    elaborated: number;
  };
}

// ============================================================================
// 🔧 UTILIDADES DE CONVERSIÓN
// ============================================================================

export interface ConversionResult {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  conversionFactor: number;
}

export interface UnitHelper {
  category: 'weight' | 'volume' | 'length' | 'count';
  availableUnits: string[];
  baseUnit: string;
  displayFormat: (value: number, unit: string) => string;
}

// ============================================================================
// 📝 FORM DATA TYPES
// ============================================================================

export interface ItemFormData {
  name: string;
  type: ItemType;
  unit: AllUnit;
  initial_stock?: number;
  unit_cost?: number;
  
  // Campos específicos por tipo
  category?: 'weight' | 'volume' | 'length';  // Para MEASURABLE
  packaging?: Partial<PackagingInfo>;          // Para COUNTABLE
  recipe_id?: string;                          // Para ELABORATED
  requires_production?: boolean;               // Para ELABORATED
}

export interface StockEntryFormData {
  item_id: string;
  quantity: number;
  unit_cost: number;
  note?: string;
  entry_type?: 'purchase' | 'production' | 'adjustment';
  supplier?: string;
  batch_number?: string;
}

export interface BulkStockEntry {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_cost: number;
  note?: string;
}

export interface BulkStockFormData {
  supplier?: string;
  purchase_date?: string;
  entries: BulkStockEntry[];
  total_cost?: number;
}