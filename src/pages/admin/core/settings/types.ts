// src/features/settings/types.ts
// Tipos para configuraciones del negocio

export interface BusinessSettings {
  id: string;
  business_name: string;
  business_type: BusinessType;
  address: BusinessAddress;
  contact: BusinessContact;
  operating_hours: OperatingHours[];
  tax_settings: TaxSettings;
  currency: CurrencySettings;
  notification_settings: NotificationSettings;
  updated_at: string;
}

export type BusinessType = 
  | 'restaurant' 
  | 'cafe' 
  | 'bakery' 
  | 'food_truck' 
  | 'catering' 
  | 'other';

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface BusinessContact {
  phone: string;
  email: string;
  website?: string;
  social_media?: SocialMediaLinks;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface OperatingHours {
  day_of_week: number; // 0-6 (Sunday-Saturday)
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  is_24_hours?: boolean;
}

export interface TaxSettings {
  tax_rate: number;
  tax_name: string;
  include_tax_in_prices: boolean;
  tax_number?: string;
}

export interface CurrencySettings {
  code: string; // 'USD', 'EUR', etc.
  symbol: string;
  decimal_places: number;
  position: 'before' | 'after';
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  low_stock_alerts: boolean;
  order_notifications: boolean;
  employee_notifications: boolean;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
}