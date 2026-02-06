/**
 * Production Equipment Types
 * Clean architecture, no legacy fields
 */

export type EquipmentType =
  | 'oven' | 'mixer' | 'press' | 'lathe'
  | 'mill' | 'saw' | 'welder' | 'conveyor'
  | 'packaging' | 'dryer' | 'grinder' | 'cutter'
  | 'other'

export type EquipmentStatus =
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'retired'

export type EquipmentCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'

/**
 * ProductionEquipment: Clean model
 */
export interface ProductionEquipment {
  // Identity
  id: string
  name: string
  code: string
  description?: string
  equipment_type: EquipmentType

  // Financial (Depreciation)
  purchase_price?: number
  current_value?: number
  purchase_date?: string
  useful_life_years?: number
  salvage_value: number
  accumulated_depreciation: number

  // Costing (Hourly Rate)
  estimated_annual_hours: number
  hourly_cost_rate?: number
  auto_calculate_rate: boolean

  // Cost Components
  maintenance_cost_percentage: number
  energy_cost_per_hour: number
  consumables_cost_per_hour: number
  insurance_cost_annual: number
  overhead_cost_per_hour: number

  // Usage Tracking
  actual_hours_used: number
  last_cost_calculation_date?: string

  // Operational
  status: EquipmentStatus
  condition: EquipmentCondition
  location?: string
  assigned_to?: string

  // Maintenance
  last_maintenance_date?: string
  next_maintenance_date?: string
  maintenance_interval_days: number

  // Metadata
  notes?: string
  tags?: string[]
  custom_fields?: Record<string, unknown>

  // Audit
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

/**
 * Cost Breakdown
 */
export interface EquipmentCostBreakdown {
  equipment_name: string
  depreciation_per_hour: number
  maintenance_per_hour: number
  energy_per_hour: number
  consumables_per_hour: number
  insurance_per_hour: number
  overhead_per_hour: number
  total_per_hour: number
}

/**
 * Create/Update DTOs
 */
export interface CreateEquipmentInput {
  name: string
  code: string
  description?: string
  equipment_type: EquipmentType

  // Financial (optional)
  purchase_price?: number
  purchase_date?: string
  useful_life_years?: number
  salvage_value?: number

  // Costing (optional)
  estimated_annual_hours?: number
  auto_calculate_rate?: boolean
  maintenance_cost_percentage?: number
  energy_cost_per_hour?: number
  consumables_cost_per_hour?: number
  insurance_cost_annual?: number
  overhead_cost_per_hour?: number

  // Operational
  location?: string
  assigned_to?: string

  // Maintenance
  maintenance_interval_days?: number

  // Metadata
  notes?: string
  tags?: string[]
}

export interface UpdateEquipmentInput extends Partial<CreateEquipmentInput> {
  id: string
}

/**
 * Equipment Metrics
 */
export interface EquipmentMetrics {
  total_equipment: number
  available: number
  in_use: number
  maintenance: number
  total_value: number
  avg_hourly_rate: number
  total_hours_used: number
}
