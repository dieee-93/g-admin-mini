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