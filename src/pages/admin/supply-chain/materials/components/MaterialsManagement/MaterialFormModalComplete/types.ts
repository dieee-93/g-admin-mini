import { type ItemType, type AllUnit, type PackagingInfo } from '../../types';

export interface ItemFormData {
  name: string;
  type: ItemType;
  unit: AllUnit;
  category?: string;
  initial_stock?: number;
  unit_cost?: number;
  recipe_id?: string;
  packaging?: PackagingInfo;
}
