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
  production_config?: ProductionConfig; // 🆕 PRODUCTION: Equipment, labor, overhead (ELABORATED only)
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
  production_config?: ProductionConfig; // 🆕 PRODUCTION: Equipment, labor, overhead configuration
}

// Form data type
export interface ItemFormData {
  id?: string; // 🆕 Added for edit mode context
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
  production_config?: ProductionConfig; // 🆕 Production configuration (equipment, labor, overhead)

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

// Production Configuration Types (🆕 Equipment + Labor + Overhead)
export interface ProductionEquipmentUsage {
  id: string;
  equipment_id: string;
  equipment_name: string;
  equipment_type: string;
  hours_used: number;
  hourly_cost_rate: number;
  total_cost: number;
  notes?: string;
  recorded_at?: string;
}

// Re-export StaffAssignment from shared components for convenience
export type { TeamAssignment as StaffAssignment } from '@/shared/components/TeamSelector';

export interface ProductionConfig {
  equipment_usage?: ProductionEquipmentUsage[];

  // 🆕 PHASE 2: Unified staff assignments (replaces simple labor fields)
  staff_assignments?: import('@/shared/components/TeamSelector').TeamAssignment[];

  // @deprecated Use staff_assignments instead (kept for backward compatibility during migration)
  labor_hours?: number;
  // @deprecated Use staff_assignments instead (kept for backward compatibility during migration)
  labor_cost_per_hour?: number;

  labor_total_cost?: number; // Calculated from staff_assignments
  overhead_percentage?: number;
  overhead_fixed?: number;
  overhead_total_cost?: number;
  packaging_cost?: number;
  materials_cost?: number;
  equipment_cost?: number;
  total_direct_cost?: number;
  total_indirect_cost?: number;
  total_cost?: number;
  cost_per_unit?: number;
  last_calculation_date?: string;
  notes?: string;
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