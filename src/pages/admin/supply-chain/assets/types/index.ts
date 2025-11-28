/**
 * ASSETS TYPES
 * Type definitions for asset management
 */

export type AssetStatus = 'available' | 'in_use' | 'maintenance' | 'retired' | 'rented';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
export type AssetCategory = 'equipment' | 'vehicle' | 'tool' | 'furniture' | 'electronics';

export interface Asset {
  id: string;

  // Basic Info
  name: string;
  asset_code: string;
  description?: string;
  category: AssetCategory;

  // Status
  status: AssetStatus;
  condition: AssetCondition;

  // Financial
  purchase_price?: number;
  current_value?: number;
  purchase_date?: string;

  // Location
  location?: string;
  assigned_to?: string;

  // Rental Fields (for Rentals module)
  is_rentable: boolean;
  rental_price_per_day?: number;
  rental_price_per_hour?: number;
  currently_rented: boolean;
  current_rental_id?: string;

  // Maintenance
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_interval_days: number;

  // Metadata
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateAssetDTO {
  name: string;
  asset_code: string;
  description?: string;
  category: AssetCategory;
  status?: AssetStatus;
  condition?: AssetCondition;
  purchase_price?: number;
  current_value?: number;
  purchase_date?: string;
  location?: string;
  assigned_to?: string;
  is_rentable?: boolean;
  rental_price_per_day?: number;
  rental_price_per_hour?: number;
  maintenance_interval_days?: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateAssetDTO extends Partial<CreateAssetDTO> {
  id: string;
}

export interface AssetFilters {
  status?: AssetStatus[];
  category?: AssetCategory[];
  condition?: AssetCondition[];
  is_rentable?: boolean;
  currently_rented?: boolean;
  assigned_to?: string;
  search?: string;
}

export interface AssetMetrics {
  total_assets: number;
  available_count: number;
  in_use_count: number;
  maintenance_count: number;
  rented_count: number;
  total_value: number;
  rentable_count: number;
  maintenance_due_soon: number;
}
