/**
 * E-COMMERCE MODULE TYPES
 * TypeScript definitions for e-commerce entities
 */

// ============================================
// PRODUCT CATALOG TYPES
// ============================================

export interface OnlineProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  available_online: boolean;
  online_price?: number;
  online_stock?: number;
  online_visibility: 'visible' | 'hidden' | 'featured';
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogProduct {
  catalog_id: string;
  product_id: string;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
  product?: OnlineProduct;
}

export interface Catalog {
  id: string;
  name: string;
  description?: string;
  type: 'default' | 'location' | 'tier' | 'season' | 'promotion';
  is_active: boolean;
  is_default: boolean;
  // TODO: Define specific filter types instead of 'any'
  filters?: Record<string, string | number | boolean>;
  created_at: string;
  updated_at: string;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
}

export interface Cart {
  id: string;
  customer_id?: string;
  session_id?: string;
  location_id?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

// ============================================
// ORDER TYPES
// ============================================

export interface OnlineOrder {
  id: string;
  customer_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_status: 'pending' | 'shipped' | 'delivered';
  total: number;
  created_at: string;
  updated_at?: string;

  // Relations
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;

  // Relations
  product?: {
    id: string;
    name: string;
  };
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface UpdateProductVisibilityRequest {
  product_id: string;
  available_online: boolean;
  online_visibility?: 'visible' | 'hidden' | 'featured';
  online_price?: number;
  online_stock?: number;
}

export interface UpdateOrderStatusRequest {
  order_id: string;
  status?: OnlineOrder['status'];
  payment_status?: OnlineOrder['payment_status'];
  shipping_status?: OnlineOrder['shipping_status'];
}

// ============================================
// UI STATE TYPES
// ============================================

export interface OnlineCatalogFilters {
  search?: string;
  visibility?: 'all' | 'visible' | 'hidden' | 'featured';
  available_online?: boolean;
}

export interface OnlineOrdersFilters {
  search?: string;
  status?: OnlineOrder['status'] | 'all';
  payment_status?: OnlineOrder['payment_status'] | 'all';
  shipping_status?: OnlineOrder['shipping_status'] | 'all';
  date_from?: string;
  date_to?: string;
}
