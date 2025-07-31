// src/features/inventory/types.ts
// Módulo unificado que reemplaza items + stock según arquitectura v2

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  unit: string;
  stock: number;
  unit_cost?: number;
  created_at: string;
  updated_at: string;
}

export enum ItemType {
  UNIT = 'UNIT',           // Contables (huevos, bolsas)
  WEIGHT = 'WEIGHT',       // Por peso (harina kg)
  VOLUME = 'VOLUME',       // Por volumen (leche lt)
  ELABORATED = 'ELABORATED' // Productos elaborados
}

export interface StockEntry {
  id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
  note?: string;
  updated_at: string;
}

export interface StockAlert {
  id: string;
  item_id: string;
  item_name: string;
  current_stock: number;
  min_threshold: number;
  max_threshold?: number;
  unit: string;
  urgency: 'critical' | 'warning' | 'info';
  urgency_level: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  suggested_quantity: number;
  last_restock_date?: string;
  days_since_restock?: number;
}

export interface StockMovement {
  id: string;
  item_id: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'production';
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
  note?: string;
}

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  hasCritical: boolean;
  hasWarning: boolean;
}

export interface AlertThreshold {
  item_id: string;
  critical_threshold: number;
  warning_threshold: number;
  info_threshold: number;
  auto_reorder_enabled: boolean;
  suggested_reorder_quantity: number;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentMovements: number;
}