// ==========================================
// CUSTOMER ADDRESS TYPES
// Multiple delivery locations per customer
// Integrated with Delivery module
// ==========================================

export interface CustomerAddress {
  id: string;
  customer_id: string;

  // Address Info
  label: string;                  // "Casa", "Trabajo", "Oficina"
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;

  // Geocoded Coordinates (from Google Maps API)
  latitude?: number;
  longitude?: number;
  formatted_address?: string;      // Normalized address from geocoding

  // Delivery-Specific
  delivery_instructions?: string;  // "Timbre roto, llamar al celular"
  is_default: boolean;             // Default address for deliveries
  is_verified: boolean;            // Verified by successful delivery

  // Usage Tracking
  last_used_at?: string;
  usage_count: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerAddressData {
  customer_id: string;
  label: string;
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  delivery_instructions?: string;
  is_default?: boolean;
}

export interface UpdateCustomerAddressData extends Partial<CreateCustomerAddressData> {
  id: string;
}

export interface CustomerWithAddresses {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  addresses: CustomerAddress[];
  default_address?: CustomerAddress;
  created_at: string;
  updated_at: string;
}

// Helper to get default or first address
export function getCustomerDefaultAddress(
  addresses: CustomerAddress[]
): CustomerAddress | undefined {
  return addresses.find((a) => a.is_default) || addresses[0];
}

// Helper to format address for display
export function formatAddressDisplay(address: CustomerAddress): string {
  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.city,
    address.state,
    address.postal_code,
  ].filter(Boolean);

  return parts.join(', ');
}

// Helper to check if address has coordinates
export function hasCoordinates(address: CustomerAddress): boolean {
  return (
    address.latitude !== null &&
    address.latitude !== undefined &&
    address.longitude !== null &&
    address.longitude !== undefined
  );
}
