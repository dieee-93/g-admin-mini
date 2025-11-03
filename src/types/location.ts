// ================================================================
// LOCATION TYPES
// ================================================================
// Purpose: TypeScript types for multi-location support
// ================================================================

export interface Location {
  id: string;
  organization_id?: string;

  // Location Info
  name: string;
  code: string;
  type: 'headquarters' | 'branch' | 'warehouse';

  // AFIP Data (Critical for Argentina)
  punto_venta_afip: number;
  domicilio_afip: string;

  // Address
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;

  // Geocoded (for maps)
  latitude?: number;
  longitude?: number;

  // Operational Status
  status: 'active' | 'opening' | 'maintenance' | 'closed';
  opening_date?: string;
  closing_date?: string;

  // Contact
  phone?: string;
  email?: string;
  manager_id?: string;

  // Configuration
  operating_hours?: OperatingHours;
  timezone: string;

  // Flags
  is_main: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface OperatingHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open: string;  // Format: "09:00"
  close: string; // Format: "22:00"
  closed?: boolean;
}

export interface LocationFormData {
  name: string;
  code: string;
  type: 'headquarters' | 'branch' | 'warehouse';
  punto_venta_afip: number;
  domicilio_afip: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  operating_hours?: OperatingHours;
  status: 'active' | 'opening' | 'maintenance' | 'closed';
  timezone?: string;
  is_main?: boolean;
}

export interface LocationMetrics {
  revenue: number;
  orders: number;
  staff_count: number;
  inventory_value: number;
}

export interface LocationWithMetrics extends Location {
  metrics?: LocationMetrics;
}

// Helper type for location selection in UI
export type LocationOption = {
  value: string;
  label: string;
  pdv?: number;
};
