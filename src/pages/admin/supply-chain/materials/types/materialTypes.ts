// Material Types - Core type definitions for materials module

import type { Brand } from '../../shared/brands';

// Base item types
export type ItemType = 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED';

// Material Item interface - Core material definition
export interface MaterialItem {
  id: string;
  location_id?: string; // 🆕 MULTI-LOCATION: Location where material is stocked
  name: string;
  type: ItemType;
  unit: string;
  stock: number;
  unit_cost: number;
  min_stock?: number;
  target_stock?: number;
  supplier_id?: string;
  category?: string;
  brand_id?: string; // 🆕 BRANDS: Brand foreign key
  brand?: Brand; // 🆕 BRANDS: Joined brand data
  package_size?: number;
  packaging?: {
    package_size: number;
    package_unit: string;
    package_cost?: number;
  };
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
  location_id?: string; // 🆕 MULTI-LOCATION: Location where material will be stocked
  name: string;
  type: ItemType;
  unit: string;
  stock: number;
  unit_cost: number;
  min_stock?: number;
  target_stock?: number;
  supplier_id?: string;
  category?: string;
  description?: string; // 🆕 Optional description
  brand_id?: string; // 🆕 BRANDS: Brand foreign key
  package_size?: number;

  // Packaging fields (for COUNTABLE items)
  packaging?: {
    package_size: number;
    package_unit: string;
    package_cost?: number;
    display_mode: 'individual' | 'packaged' | 'both';
  };

  // Elaborated item fields
  recipe_id?: string;
  requires_production?: boolean;
  auto_calculate_cost?: boolean;

  // Supplier and stock entry fields
  supplier?: {
    supplier_id?: string;
    new_supplier?: {
      name: string;
      contact?: string;
      email?: string;
      phone?: string;
    };
    purchase_date?: string;
    invoice_number?: string;
    delivery_date?: string;
    quality_rating?: number;
  };
  initial_stock?: number;
}

// Inventory stats interface
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentMovements: number;
  measurableItems: number;
  countableItems: number;
  elaboratedItems: number;
  valueByCategory: {
    measurable: number;
    countable: number;
    elaborated: number;
  };
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