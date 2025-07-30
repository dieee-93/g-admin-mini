export interface StockEntry {
  id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  date: string;
  note?: string;
  // Relaciones
  item?: {
    id: string;
    name: string;
    unit: string;
    type: string;
  };
}