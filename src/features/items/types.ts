// src/features/items/types.ts
export type ItemType = 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  unit: string;
  stock: number;
  unit_cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StockAlert {
  item_id: string;
  item_name: string;
  item_type: 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';
  unit: string;
  current_stock: number;
  threshold_used: number;
  urgency_level: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  suggested_order_quantity: number;
  unit_cost: number | null;
  estimated_cost: number | null;
  last_stock_entry_date: string | null;
  days_since_last_entry: number;
}

export interface StockAlertsSummary {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  total_estimated_cost: number;
}