// src/features/sales/types.ts - ESQUEMA NORMALIZADO
export interface Sale {
  id: string;
  customer_id?: string;
  total: number;
  note?: string;
  created_at: string; // ✅ Normalizado
  updated_at?: string; // ✅ Agregado
  
  // Relaciones
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at?: string; // ✅ Agregado
  updated_at?: string; // ✅ Agregado
  
  // Relaciones
  product?: {
    id: string;
    name: string;
    unit?: string; // ✅ Ahora existe
    type?: string; // ✅ Ahora existe
    description?: string; // ✅ Agregado
  };
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  address?: string; // ✅ Agregado
  created_at: string; // ✅ Normalizado
  updated_at?: string; // ✅ Agregado
}

export interface Product {
  id: string;
  name: string;
  unit?: string; // ✅ Ahora existe
  type?: string; // ✅ Ahora existe
  description?: string; // ✅ Agregado
  cost?: number; // Calculado por función
  availability?: number; // Calculado por función
  components_count?: number; // Calculado por función
  created_at: string; // ✅ Normalizado
  updated_at?: string; // ✅ Agregado
}

export interface CreateSaleData {
  customer_id?: string;
  note?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface SaleValidation {
  is_valid: boolean;
  error_message?: string;
  insufficient_items?: {
    product_id: string;
    product_name: string;
    requested: number;
    available: number;
  }[];
}

export interface SaleProcessResult {
  success: boolean;
  sale_id?: string;
  message: string;
}

export interface SalesListFilters {
  dateFrom?: string; // ✅ Ahora funciona con created_at
  dateTo?: string;   // ✅ Ahora funciona con created_at
  customerId?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface SalesSummary {
  total_sales: number;
  revenue: number;
  avg_amount: number;
  top_customer?: {
    id: string;
    name: string;
    total_spent: number;
  };
}

// Interfaz para items del formulario de venta
export interface SaleFormItem {
  product_id: string;
  quantity: string;
  unit_price: string;
}