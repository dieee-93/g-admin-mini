import { logger } from '@/lib/logging';

import {
  type MaterialItem,
  type MeasurableItem,
  type CountableItem,
  type ElaboratedItem,
  type ItemType
} from '@/pages/admin/supply-chain/materials/types';

/**
 * Raw API response type - mirrors database schema
 * This represents what we receive from Supabase
 */
interface ApiMaterialItem {
  id: string | number;
  name: string;
  type: string;
  unit?: string;
  stock?: number | string;
  unit_cost?: number | string;
  min_stock?: number | string;
  target_stock?: number | string;
  supplier_id?: string;
  category?: string;
  brand_id?: string;
  package_size?: number | string;
  package_unit?: string;
  package_cost?: number | string;
  display_mode?: string;
  precision_digits?: number | string;
  requires_production?: boolean;
  auto_calculate_cost?: boolean;
  ingredients_available?: boolean;
  recipe_id?: string;
  production_time?: number | string;
  batch_size?: number | string;
  created_at?: string;
  updated_at?: string;
  location_id?: string;
}

/**
 * Base item structure after initial validation
 */
interface NormalizedBaseItem {
  id: string;
  name: string;
  type: ItemType;
  stock: number;
  unit_cost: number;
  created_at: string;
  updated_at: string;
}

/**
 * Service responsible for normalizing API data into consistent MaterialItem objects.
 * Handles type-specific transformations and provides default values for missing properties.
 */
export class MaterialsNormalizer {
  /**
   * Maps API types to internal types
   */
  private static mapApiTypeToItemType(apiType: string): ItemType {
    const typeMapping: Record<string, ItemType> = {
      'UNIT': 'COUNTABLE',
      'COUNTABLE': 'COUNTABLE',
      'WEIGHT': 'MEASURABLE',
      'VOLUME': 'MEASURABLE',
      'LENGTH': 'MEASURABLE',
      'MEASURABLE': 'MEASURABLE',
      'ELABORATED': 'ELABORATED',
      'RECIPE': 'ELABORATED'
    };

    const mappedType = typeMapping[apiType?.toUpperCase()];
    if (!mappedType) {
      logger.warn('MaterialsStore', `Unknown API type "${apiType}", defaulting to COUNTABLE`);
      return 'COUNTABLE';
    }
    
    return mappedType;
  }

  /**
   * Maps business categories to technical categories expected by DB
   */
  static mapBusinessCategoryToTechnicalCategory(itemType: ItemType, unit: string): string | null {
    // For MEASURABLE items, map unit to technical category
    if (itemType === 'MEASURABLE') {
      const weightUnits = ['kg', 'g'];
      const volumeUnits = ['l', 'ml'];
      const lengthUnits = ['cm', 'm'];
      
      if (weightUnits.includes(unit)) return 'weight';
      if (volumeUnits.includes(unit)) return 'volume';
      if (lengthUnits.includes(unit)) return 'length';
    }
    
    // For COUNTABLE and ELABORATED, no technical category constraint
    return null;
  }

  /**
   * Maps internal TypeScript types to database types for API calls
   * Note: Removed unused 'category' parameter - not needed for simple type mapping
   */
  static mapItemTypeToApiType(itemType: ItemType): string {
    switch (itemType) {
      case 'COUNTABLE':
        return 'COUNTABLE';
      case 'MEASURABLE':
        return 'MEASURABLE';
      case 'ELABORATED':
        return 'ELABORATED';
      default:
        logger.warn('MaterialsStore', `Unknown item type "${itemType}", defaulting to COUNTABLE`);
        return 'COUNTABLE';
    }
  }

  /**
   * Normalizes a single item from API format to MaterialItem format
   */
  static normalizeApiItem(apiItem: unknown): MaterialItem {
    // Type guard: Ensure apiItem is an object
    if (!apiItem || typeof apiItem !== 'object') {
      throw new Error('Invalid API item: expected object, got ' + typeof apiItem);
    }

    const item = apiItem as ApiMaterialItem;

    // Validate required fields
    if (!item.id || !item.name || !item.type) {
      throw new Error('Invalid API item: missing required fields (id, name, type)');
    }

    // Map API type to internal type
    const internalType = this.mapApiTypeToItemType(item.type);

    const baseItem: NormalizedBaseItem = {
      id: String(item.id),
      name: String(item.name).trim(),
      type: internalType,
      stock: Math.max(0, Number(item.stock) || 0),
      unit_cost: Math.max(0, Number(item.unit_cost) || 0),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    };

    // Type-specific normalization based on internal type
    switch (internalType) {
      case 'COUNTABLE':
        return this.normalizeCountableItem(baseItem, item);
      case 'MEASURABLE':
        return this.normalizeMeasurableItem(baseItem, item);
      case 'ELABORATED':
        return this.normalizeElaboratedItem(baseItem, item);
      default:
        throw new Error(`Unknown internal type: ${internalType}`);
    }
  }

  /**
   * Normalizes COUNTABLE item with packaging information
   */
  private static normalizeCountableItem(base: NormalizedBaseItem, api: ApiMaterialItem): CountableItem {
    const item: CountableItem = {
      ...base,
      type: 'COUNTABLE',
      unit: 'unidad',
      category: api.category || 'Sin categoría', // Business category for all item types
      brand_id: api.brand_id // 🆕 BRANDS: Include brand_id
    };

    // Handle packaging information if present
    if (api.package_size && Number(api.package_size) > 0) {
      item.packaging = {
        package_size: Number(api.package_size),
        package_unit: String(api.package_unit || 'paquete').trim(),
        package_cost: api.package_cost ? Number(api.package_cost) : undefined,
        display_mode: this.validateDisplayMode(api.display_mode) || 'individual'
      };
    }

    return item;
  }

  /**
   * Normalizes MEASURABLE item with business category and precision
   */
  private static normalizeMeasurableItem(base: NormalizedBaseItem, api: ApiMaterialItem): MeasurableItem {
    const unit = api.unit || 'kg';
    const item: MeasurableItem = {
      ...base,
      type: 'MEASURABLE',
      unit: unit, // Default unit
      brand_id: api.brand_id, // 🆕 BRANDS: Include brand_id
      category: api.category || 'Sin categoría', // Business category (Lácteos, Carnes, etc.)
      precision: this.validatePrecision(api.precision_digits)
    };

    return item;
  }

  /**
   * Normalizes ELABORATED item with production settings
   */
  private static normalizeElaboratedItem(base: NormalizedBaseItem, api: ApiMaterialItem): ElaboratedItem {
    const item: ElaboratedItem = {
      ...base,
      type: 'ELABORATED',
      unit: api.unit || 'porción',
      category: api.category || 'Sin categoría', // Business category for all item types
      brand_id: api.brand_id, // 🆕 BRANDS: Include brand_id
      requires_production: Boolean(api.requires_production ?? true),
      auto_calculate_cost: Boolean(api.auto_calculate_cost ?? true),
      ingredients_available: Boolean(api.ingredients_available ?? false)
    };

    // Optional fields
    if (api.recipe_id) {
      item.recipe_id = String(api.recipe_id);
    }

    if (api.production_time && Number(api.production_time) > 0) {
      item.production_time = Number(api.production_time);
    }

    if (api.batch_size && Number(api.batch_size) > 0) {
      item.batch_size = Number(api.batch_size);
    }

    return item;
  }

  /**
   * Normalizes an array of API items
   */
  static normalizeApiItems(apiItems: unknown[]): MaterialItem[] {
    if (!Array.isArray(apiItems)) {
      logger.warn('MaterialsStore', 'MaterialsNormalizer: Expected array, got:', typeof apiItems);
      return [];
    }

    const normalized: MaterialItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < apiItems.length; i++) {
      try {
        const normalizedItem = this.normalizeApiItem(apiItems[i]);
        normalized.push(normalizedItem);
      } catch (error) {
        const errorMsg = `Item at index ${i}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        logger.error('MaterialsStore', 'MaterialsNormalizer error:', errorMsg, apiItems[i]);
      }
    }

    // Report errors but don't fail completely
    if (errors.length > 0) {
      logger.error('MaterialsStore', `MaterialsNormalizer: ${errors.length} items failed to normalize:`, errors);
    }

    return normalized;
  }


  /**
   * Validates and normalizes precision for measurable items
   */
  private static validatePrecision(precision: unknown): number {
    const num = Number(precision);
    if (Number.isInteger(num) && num >= 0 && num <= 6) {
      return num;
    }
    return 2; // default precision
  }

  /**
   * Validates display mode for packaging
   */
  private static validateDisplayMode(mode: string): 'individual' | 'packaged' | 'both' {
    const validModes = ['individual', 'packaged', 'both'];
    if (validModes.includes(mode)) {
      return mode as 'individual' | 'packaged' | 'both';
    }
    return 'individual'; // default
  }

  /**
   * Creates a new item with proper defaults (useful for forms)
   */
  static createNewItem(type: ItemType, partialData: Partial<MaterialItem> = {}): Partial<MaterialItem> {
    const baseDefaults = {
      name: '',
      type,
      stock: 0,
      unit_cost: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...partialData
    };

    switch (type) {
      case 'COUNTABLE':
        return {
          ...baseDefaults,
          unit: 'unidad',
          category: 'Sin categoría' // Business category for all item types
        };
      case 'MEASURABLE':
        return {
          ...baseDefaults,
          unit: 'kg',
          category: 'Sin categoría', // Business category (Lácteos, Carnes, etc.)
          precision: 2
        };
      case 'ELABORATED':
        return {
          ...baseDefaults,
          unit: 'porción',
          category: 'Sin categoría', // Business category for all item types
          requires_production: true,
          auto_calculate_cost: true,
          ingredients_available: false
        };
      default:
        return baseDefaults;
    }
  }
}