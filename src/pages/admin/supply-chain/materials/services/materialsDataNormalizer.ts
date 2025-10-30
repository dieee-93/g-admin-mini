/**
 * Data Normalizer for Materials Module
 * Converts between Supabase schema and app MaterialItem format
 */

import type { MaterialItem } from '../types/materialTypes';

// Supabase items table structure (real schema)
interface SupabaseMaterial {
  id: string;
  name: string;
  type: string;
  stock: number;
  unit_cost: number | null;
  unit: string;
  category: string | null;
  precision_digits: number | null;
  package_size: number | null;
  package_unit: string | null;
  package_cost: number | null;
  display_mode: string | null;
  recipe_id: string | null;
  requires_production: boolean | null;
  auto_calculate_cost: boolean | null;
  ingredients_available: boolean | null;
  production_time: number | null;
  batch_size: number | null;
  min_stock: number | null;
  max_stock: number | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export class MaterialsDataNormalizer {
  /**
   * Convert Supabase material to MaterialItem format
   */
  static fromSupabase(dbMaterial: SupabaseMaterial): MaterialItem {
    // Use type from database (already stored)
    const type = (dbMaterial.type || 'MEASURABLE') as 'MEASURABLE' | 'COUNTABLE' | 'ELABORATED';

    return {
      id: dbMaterial.id,
      name: dbMaterial.name,
      type,
      unit: dbMaterial.unit,
      stock: dbMaterial.stock,
      unit_cost: dbMaterial.unit_cost || 0,
      min_stock: dbMaterial.min_stock || 0,
      category: dbMaterial.category || undefined,
      created_at: dbMaterial.created_at,
      updated_at: dbMaterial.updated_at,
      // Additional fields for elaborated items
      ...(type === 'ELABORATED' && {
        recipe_id: dbMaterial.recipe_id || undefined,
        requires_production: dbMaterial.requires_production || false,
        auto_calculate_cost: dbMaterial.auto_calculate_cost || false
      })
    };
  }

  /**
   * Convert MaterialItem to Supabase format
   */
  static toSupabase(material: Partial<MaterialItem>): Partial<SupabaseMaterial> {
    return {
      ...(material.name && { name: material.name }),
      ...(material.type && { type: material.type }),
      ...(material.unit && { unit: material.unit }),
      ...(material.stock !== undefined && { stock: material.stock }),
      ...(material.unit_cost !== undefined && { unit_cost: material.unit_cost }),
      ...(material.min_stock !== undefined && { min_stock: material.min_stock }),
      ...(material.category && { category: material.category }),
      // Elaborated item fields
      ...((material as any).recipe_id && { recipe_id: (material as any).recipe_id }),
      ...((material as any).requires_production !== undefined && {
        requires_production: (material as any).requires_production
      }),
      ...((material as any).auto_calculate_cost !== undefined && {
        auto_calculate_cost: (material as any).auto_calculate_cost
      })
    };
  }

  /**
   * Normalize array of materials from Supabase
   */
  static normalizeArray(dbMaterials: any[]): MaterialItem[] {
    return dbMaterials.map(dbMaterial => this.fromSupabase(dbMaterial));
  }
}
