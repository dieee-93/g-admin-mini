/**
 * Rentals Module - Type Definitions
 *
 * Defines TypeScript interfaces for rental items and reservations
 */

/**
 * Specifications structure for rental items
 * Contains custom attributes like dimensions, capacity, features, etc.
 */
export interface RentalItemSpecifications {
  capacity?: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    unit?: 'cm' | 'in' | 'm';
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lb';
  };
  brand?: string;
  model?: string;
  year?: number;
  amenities?: string[];
  features?: string[];
  items?: string[];
  // Allow additional custom fields
  [key: string]: string | number | boolean | string[] | Record<string, number | string> | undefined;
}

export interface RentalItem {
  id: string;
  item_name: string;
  item_type: 'equipment' | 'space' | 'vehicle' | 'tools';
  description?: string;

  // Pricing
  hourly_rate?: number;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  deposit_amount?: number;

  // Availability
  quantity_available: number;
  max_rental_duration_days?: number;
  min_rental_duration_hours?: number;

  // Status
  is_active: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'needs_maintenance' | 'out_of_service';

  // Media & Details
  images?: string[];
  specifications?: RentalItemSpecifications;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface RentalReservation {
  id: string;

  // Relations
  item_id: string;
  customer_id: string;

  // Status
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

  // Rental Period
  start_datetime: string;
  end_datetime: string;
  actual_pickup_datetime?: string;
  actual_return_datetime?: string;

  // Pricing
  rental_rate: number;
  rate_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  deposit_paid: number;
  total_amount: number;
  late_fees?: number;
  damage_fees?: number;

  // Payment
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded' | 'overdue';
  payment_method?: string;

  // Condition Tracking
  checkout_condition: 'excellent' | 'good' | 'fair' | 'damaged';
  return_condition?: 'excellent' | 'good' | 'fair' | 'damaged';
  damage_report?: string;

  // Notes
  notes?: string;
  internal_notes?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;

  // Relations (populated)
  item?: RentalItem;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RentalMetrics {
  active_rentals: number;
  pending_reservations: number;
  total_items: number;
  available_items?: number;
  utilization_rate: number;
  total_revenue_today?: number;
  overdue_payments?: number;
  items_needing_maintenance?: number;
}

export interface AvailabilityCheck {
  available: boolean;
  reason?: string;
  available_quantity?: number;
  total_quantity?: number;
  conflicting_reservations?: number;
  hourly_rate?: number;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  deposit_amount?: number;
}

export interface CreateRentalItemInput {
  item_name: string;
  item_type: 'equipment' | 'space' | 'vehicle' | 'tools';
  description?: string;
  hourly_rate?: number;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  deposit_amount?: number;
  quantity_available?: number;
  max_rental_duration_days?: number;
  min_rental_duration_hours?: number;
  specifications?: RentalItemSpecifications;
}

export interface CreateReservationInput {
  item_id: string;
  customer_id: string;
  start_datetime: string;
  end_datetime: string;
  rental_rate: number;
  rate_type?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  deposit_paid?: number;
  notes?: string;
}

export interface UpdateReservationInput {
  status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  actual_pickup_datetime?: string;
  actual_return_datetime?: string;
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded' | 'overdue';
  return_condition?: 'excellent' | 'good' | 'fair' | 'damaged';
  damage_report?: string;
  late_fees?: number;
  damage_fees?: number;
  internal_notes?: string;
}
