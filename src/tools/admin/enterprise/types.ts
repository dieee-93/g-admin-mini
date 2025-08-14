// Enterprise Tools Types
export interface Location {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  manager_id: string;
  status: 'active' | 'inactive' | 'maintenance';
  settings: LocationSettings;
  metrics: LocationMetrics;
  created_at: string;
}

export interface LocationSettings {
  timezone: string;
  currency: string;
  language: string;
  business_hours: {
    day: number;
    open: string;
    close: string;
    is_closed: boolean;
  }[];
  features_enabled: string[];
}

export interface LocationMetrics {
  daily_revenue: number;
  monthly_revenue: number;
  order_count: number;
  staff_count: number;
  customer_satisfaction: number;
  inventory_value: number;
}

export interface EnterpriseUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'regional_manager' | 'location_manager';
  locations_access: string[];
  permissions: string[];
  last_login: string;
}