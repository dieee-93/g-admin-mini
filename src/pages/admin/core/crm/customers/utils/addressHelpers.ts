/**
 * Customer Address Helper Functions
 * Utilities for working with customer_addresses
 */

import type { Customer, CustomerAddress } from '../types/customer';

/**
 * Get the default address for a customer
 * Falls back to the first address if no default is set
 */
export function getDefaultAddress(customer: Customer): CustomerAddress | null {
  if (!customer.customer_addresses || customer.customer_addresses.length === 0) {
    return null;
  }

  // Find address marked as default
  const defaultAddress = customer.customer_addresses.find(addr => addr.is_default);

  // Fallback to first address
  return defaultAddress || customer.customer_addresses[0];
}

/**
 * Get a formatted display string for an address
 * Prioritizes geocoded formatted_address, falls back to address_line_1
 */
export function getAddressDisplay(address: CustomerAddress | null): string {
  if (!address) return '-';

  return address.formatted_address || address.address_line_1 || '-';
}

/**
 * Get a short address display (useful for compact UIs)
 * Format: "Av. Corrientes 1234, CABA"
 */
export function getShortAddressDisplay(address: CustomerAddress | null): string {
  if (!address) return '-';

  const parts: string[] = [];

  if (address.address_line_1) {
    parts.push(address.address_line_1);
  }

  if (address.city || address.state) {
    const location = [address.city, address.state].filter(Boolean).join(', ');
    parts.push(location);
  }

  return parts.join(', ') || '-';
}

/**
 * Get the complete address display (useful for forms/modals)
 * Includes all available address fields
 */
export function getFullAddressDisplay(address: CustomerAddress | null): string {
  if (!address) return '';

  const parts: string[] = [];

  if (address.address_line_1) {
    parts.push(address.address_line_1);
  }

  if (address.address_line_2) {
    parts.push(address.address_line_2);
  }

  const cityStateZip = [
    address.city,
    address.state,
    address.postal_code
  ].filter(Boolean).join(', ');

  if (cityStateZip) {
    parts.push(cityStateZip);
  }

  if (address.country && address.country !== 'Argentina') {
    parts.push(address.country);
  }

  return parts.join('\n') || '';
}

/**
 * Check if an address has been geocoded (has coordinates)
 */
export function isAddressGeocoded(address: CustomerAddress | null): boolean {
  if (!address) return false;
  return !!(address.latitude && address.longitude && address.is_verified);
}

/**
 * Get all addresses for a customer, sorted by priority
 * Priority: default first, then most recently used, then newest
 */
export function getSortedAddresses(customer: Customer): CustomerAddress[] {
  if (!customer.customer_addresses) return [];

  return [...customer.customer_addresses].sort((a, b) => {
    // Default address comes first
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;

    // Then by last used
    if (a.last_used_at && b.last_used_at) {
      return new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
    }

    // Then by usage count
    if (a.usage_count !== b.usage_count) {
      return b.usage_count - a.usage_count;
    }

    // Finally by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Get coordinates for mapping/delivery
 * Returns [lat, lng] in Leaflet format or null if not geocoded
 */
export function getAddressCoordinates(address: CustomerAddress | null): [number, number] | null {
  if (!address || !address.latitude || !address.longitude) {
    return null;
  }

  return [address.latitude, address.longitude];
}

/**
 * Format address for display in a select/dropdown
 * Format: "Casa - Av. Corrientes 1234, CABA"
 */
export function getAddressSelectLabel(address: CustomerAddress): string {
  const shortAddress = getShortAddressDisplay(address);
  return `${address.label} - ${shortAddress}`;
}
