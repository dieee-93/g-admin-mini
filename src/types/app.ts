// src/types/app.ts
export type AppRoute = 
  | 'dashboard' 
  | 'items' 
  | 'stock' 
  | 'recipes' 
  | 'products' 
  | 'sales' 
  | 'customers';

export type ColorScheme = 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'teal' 
  | 'pink' 
  | 'red' 
  | 'gray';

export interface DashboardStats {
  totalItems: number;
  totalStockValue: number;
  stockEntriesThisMonth: number;
  lowStockItems: number;
  loading: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface FormError {
  field: string;
  message: string;
}

