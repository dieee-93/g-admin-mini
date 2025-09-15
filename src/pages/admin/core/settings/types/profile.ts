// Business profile and company information types
import type { TaxSettings, CurrencySettings } from './tax';
import type { NotificationSettings } from './system';

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