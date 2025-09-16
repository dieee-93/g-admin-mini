// Material Types - Core type definitions for materials module

// Base item types
export type ItemType = 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED';

// Material Item interface - Core material definition
export interface MaterialItem {
  id: string;
  name: string;
  type: ItemType;
  unit: string;
  stock: number;
  unit_cost: number;
  min_stock?: number;
  target_stock?: number;
  supplier_id?: string;
  category?: string;
  package_size?: number;
  created_at?: string;
  updated_at?: string;
}

// Specific item types
export interface MeasurableItem extends MaterialItem {
  type: 'MEASURABLE';
  unit: 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm';
  precision?: number;
}

export interface CountableItem extends MaterialItem {
  type: 'COUNTABLE';
  unit: 'unidad' | 'piezas' | 'paquetes';
  packaging?: {
    package_size: number;
    package_unit: string;
    package_cost?: number;
    display_mode: 'individual' | 'packaged' | 'both';
  };
}

export interface ElaboratedItem extends MaterialItem {
  type: 'ELABORATED';
  unit: 'kg' | 'g' | 'l' | 'ml' | 'porción' | 'unidades';
  requires_production?: boolean;
  auto_calculate_cost?: boolean;
  ingredients_available?: boolean;
  recipe_id?: string;
  production_time?: number;
  batch_size?: number;
}

// Form data type
export interface ItemFormData {
  name: string;
  type: ItemType;
  unit: string;
  stock: number;
  unit_cost: number;
  min_stock?: number;
  target_stock?: number;
  supplier_id?: string;
  category?: string;
  package_size?: number;
}

// Inventory stats interface
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
}

// Supplier interface
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  performance?: number;
  reliability?: 'high' | 'medium' | 'low';
}

// Type guard functions
export function isMeasurable(item: MaterialItem): item is MeasurableItem {
  return item.type === 'MEASURABLE';
}

export function isCountable(item: MaterialItem): item is CountableItem {
  return item.type === 'COUNTABLE';
}

export function isElaborated(item: MaterialItem): item is ElaboratedItem {
  return item.type === 'ELABORATED';
}

// Unit types
export type MeasurableUnit = 'kg' | 'g' | 'l' | 'ml' | 'm' | 'cm';
export type CountableUnit = 'units' | 'pieces' | 'packages';
export type ElaboratedUnit = MeasurableUnit | CountableUnit;
export type AllUnit = MeasurableUnit | CountableUnit;