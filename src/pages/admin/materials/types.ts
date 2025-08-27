// Materials module types - Simplified and focused
// Clean, maintainable type system for inventory management

// ============================================================================
// 🎯 CORE TYPES - Simplified
// ============================================================================

// Common units (keep it simple)
export type MeasurableUnit = 'kg' | 'g' | 'l' | 'ml' | 'cm' | 'm';
export type CountUnit = 'unidad' | 'docena' | 'caja' | 'paquete';
export type AllUnit = MeasurableUnit | CountUnit;

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
  category: string;        // Business category (e.g., "Lácteos", "Carnes", "Verduras")
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 📐 1. ITEMS CONMENSURABLES (peso, volumen, longitud) - Simplified
// ============================================================================

export interface MeasurableItem extends BaseItem {
  type: 'MEASURABLE';
  unit: MeasurableUnit;
  precision?: number;  // decimales para display (default: 2)
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
  packaging?: PackagingInfo;  // Packaging info (opcional)
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

export type MaterialItem = MeasurableItem | CountableItem | ElaboratedItem;

// Legacy alias for compatibility
export type InventoryItem = MaterialItem;

// Type guards para distinguir tipos
export const isMeasurable = (item: MaterialItem): item is MeasurableItem => 
  item.type === 'MEASURABLE';

export const isCountable = (item: MaterialItem): item is CountableItem => 
  item.type === 'COUNTABLE';

export const isElaborated = (item: MaterialItem): item is ElaboratedItem => 
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
// 🚨 ALERTAS - Essential only
// ============================================================================

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
// 🔧 CONVERSIONS - Keep minimal for existing utils
// ============================================================================

export interface ConversionResult {
  originalValue: number;
  originalUnit: string;
  convertedValue: number;
  convertedUnit: string;
  conversionFactor: number;
}

// Types for conversion system
export type WeightUnit = 'kg' | 'g';
export type VolumeUnit = 'l' | 'ml';
export type LengthUnit = 'cm' | 'm';

export interface UnitHelper {
  category: 'weight' | 'volume' | 'length';
  availableUnits: readonly string[];
  baseUnit: string;
  displayFormat: (value: number, unit: string) => string;
}

// Unit categories for conversions
export const UNIT_CATEGORIES = {
  weight: ['kg', 'g'] as const,
  volume: ['l', 'ml'] as const,
  length: ['cm', 'm'] as const,
} as const;

// Conversion factors to base units (g, ml, mm)
export const UNIT_CONVERSIONS = {
  weight: {
    g: 1,      // base unit
    kg: 1000,  // 1 kg = 1000 g
  },
  volume: {
    ml: 1,     // base unit
    l: 1000,   // 1 l = 1000 ml
  },
  length: {
    cm: 1,     // treating cm as base for simplicity
    m: 100,    // 1 m = 100 cm
  },
} as const;

// ============================================================================
// 🏢 SUPPLIER DATA - Para integración con compras
// ============================================================================

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: string;
  rating?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  supplier_id?: string;
  purchase_date?: string;
  invoice_number?: string;
  delivery_date?: string;
  quality_rating?: number;
  
  // Para crear nuevo supplier
  new_supplier?: {
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    tax_id?: string;
    notes?: string;
  };
}

// ============================================================================
// 📝 FORM DATA - Essential types only
// ============================================================================

export interface ItemFormData {
  name: string;
  type: ItemType;
  unit: AllUnit;
  initial_stock?: number;
  unit_cost?: number;
  category?: string;                           // Business category for all item types
  
  // Campos específicos por tipo
  packaging?: Partial<PackagingInfo>;          // Para COUNTABLE
  recipe_id?: string;                          // Para ELABORATED
  requires_production?: boolean;               // Para ELABORATED
  auto_calculate_cost?: boolean;               // Para ELABORATED
  
  // Datos del proveedor (opcional)
  supplier?: SupplierFormData;
}