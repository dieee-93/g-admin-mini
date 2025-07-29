// src/features/customers/types.ts
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string;
}

export interface CustomerStats {
  total_purchases: number;
  total_spent: number;
  last_purchase_date?: string;
  average_purchase: number;
  purchase_count: number;
}

export interface CustomerWithStats extends Customer {
  stats?: CustomerStats;
}