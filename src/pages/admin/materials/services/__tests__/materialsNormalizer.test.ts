import { describe, it, expect, vi } from 'vitest';
import { MaterialsNormalizer } from '../materialsNormalizer';
import { MaterialItem, CountableItem, MeasurableItem, ElaboratedItem } from '../../types';

describe('MaterialsNormalizer', () => {
  describe('normalizeApiItem', () => {
    it('should throw error for missing required fields', () => {
      expect(() => MaterialsNormalizer.normalizeApiItem({})).toThrow('Invalid API item');
      expect(() => MaterialsNormalizer.normalizeApiItem({ id: '1' })).toThrow('Invalid API item');
      expect(() => MaterialsNormalizer.normalizeApiItem({ id: '1', name: 'Test' })).toThrow('Invalid API item');
    });

    it('should normalize COUNTABLE items correctly', () => {
      const apiItem = {
        id: '1',
        name: 'Test Countable',
        type: 'COUNTABLE',
        stock: 50,
        unit_cost: 100,
        package_size: 12,
        package_unit: 'docena',
        package_cost: 150,
        display_mode: 'individual'
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as CountableItem;

      expect(result.type).toBe('COUNTABLE');
      expect(result.name).toBe('Test Countable');
      expect(result.unit).toBe('unidad');
      expect(result.stock).toBe(50);
      expect(result.unit_cost).toBe(100);
      expect(result.packaging?.package_size).toBe(12);
      expect(result.packaging?.package_unit).toBe('docena');
      expect(result.packaging?.package_cost).toBe(150);
      expect(result.packaging?.display_mode).toBe('individual');
    });

    it('should handle COUNTABLE items without packaging', () => {
      const apiItem = {
        id: '2',
        name: 'Simple Countable',
        type: 'COUNTABLE',
        stock: 25
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as CountableItem;

      expect(result.type).toBe('COUNTABLE');
      expect(result.unit).toBe('unidad');
      expect(result.packaging).toBeUndefined();
    });

    it('should normalize MEASURABLE items correctly', () => {
      const apiItem = {
        id: '3',
        name: 'Test Measurable',
        type: 'MEASURABLE',
        unit: 'kg',
        category: 'weight',
        precision_digits: 3,
        stock: 75.5
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as MeasurableItem;

      expect(result.type).toBe('MEASURABLE');
      expect(result.unit).toBe('kg');
      expect(result.category).toBe('weight');
      expect(result.precision).toBe(3);
      expect(result.stock).toBe(75.5);
    });

    it('should apply defaults for MEASURABLE items', () => {
      const apiItem = {
        id: '4',
        name: 'Minimal Measurable',
        type: 'MEASURABLE'
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as MeasurableItem;

      expect(result.unit).toBe('kg');
      expect(result.category).toBe('Sin categoría'); // Business category default
      expect(result.precision).toBe(2);
    });

    it('should normalize ELABORATED items correctly', () => {
      const apiItem = {
        id: '5',
        name: 'Test Elaborated',
        type: 'ELABORATED',
        unit: 'porción',
        recipe_id: 'recipe-123',
        requires_production: false,
        auto_calculate_cost: false,
        production_time: 30,
        batch_size: 10
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as ElaboratedItem;

      expect(result.type).toBe('ELABORATED');
      expect(result.unit).toBe('porción');
      expect(result.recipe_id).toBe('recipe-123');
      expect(result.requires_production).toBe(false);
      expect(result.auto_calculate_cost).toBe(false);
      expect(result.production_time).toBe(30);
      expect(result.batch_size).toBe(10);
    });

    it('should apply defaults for ELABORATED items', () => {
      const apiItem = {
        id: '6',
        name: 'Minimal Elaborated',
        type: 'ELABORATED'
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as ElaboratedItem;

      expect(result.unit).toBe('porción');
      expect(result.requires_production).toBe(true);
      expect(result.auto_calculate_cost).toBe(true);
      expect(result.ingredients_available).toBe(false);
      expect(result.recipe_id).toBeUndefined();
    });

    it('should validate and sanitize numeric values', () => {
      const apiItem = {
        id: '7',
        name: 'Test Numbers',
        type: 'COUNTABLE',
        stock: -10, // Should be clamped to 0
        unit_cost: -5 // Should be clamped to 0
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem);

      expect(result.stock).toBe(0);
      expect(result.unit_cost).toBe(0);
    });

    it('should handle string IDs', () => {
      const apiItem = {
        id: 123, // numeric ID
        name: 'Test ID',
        type: 'COUNTABLE'
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
    });

    it('should trim whitespace from names', () => {
      const apiItem = {
        id: '8',
        name: '  Whitespace Test  ',
        type: 'COUNTABLE'
      };

      const result = MaterialsNormalizer.normalizeApiItem(apiItem);

      expect(result.name).toBe('Whitespace Test');
    });
  });

  describe('normalizeApiItems', () => {
    it('should handle empty array', () => {
      const result = MaterialsNormalizer.normalizeApiItems([]);
      expect(result).toEqual([]);
    });

    it('should handle non-array input', () => {
      const result = MaterialsNormalizer.normalizeApiItems(null as any);
      expect(result).toEqual([]);
    });

    it('should normalize multiple items', () => {
      const apiItems = [
        { id: '1', name: 'Item 1', type: 'COUNTABLE' },
        { id: '2', name: 'Item 2', type: 'MEASURABLE' },
        { id: '3', name: 'Item 3', type: 'ELABORATED' }
      ];

      const result = MaterialsNormalizer.normalizeApiItems(apiItems);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('COUNTABLE');
      expect(result[1].type).toBe('MEASURABLE');
      expect(result[2].type).toBe('ELABORATED');
    });

    it('should handle partial failures gracefully', () => {
      const apiItems = [
        { id: '1', name: 'Valid Item', type: 'COUNTABLE' },
        { name: 'Invalid Item' }, // Missing required fields
        { id: '3', name: 'Another Valid', type: 'MEASURABLE' }
      ];

      // Mock console.error to avoid test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = MaterialsNormalizer.normalizeApiItems(apiItems);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Valid Item');
      expect(result[1].name).toBe('Another Valid');
      
      consoleSpy.mockRestore();
    });
  });

  describe('createNewItem', () => {
    it('should create COUNTABLE item with defaults', () => {
      const result = MaterialsNormalizer.createNewItem('COUNTABLE');

      expect(result.type).toBe('COUNTABLE');
      expect(result.unit).toBe('unidad');
      expect(result.stock).toBe(0);
      expect(result.unit_cost).toBe(0);
    });

    it('should create MEASURABLE item with defaults', () => {
      const result = MaterialsNormalizer.createNewItem('MEASURABLE') as Partial<MeasurableItem>;

      expect(result.type).toBe('MEASURABLE');
      expect(result.unit).toBe('kg');
      expect(result.category).toBe('Sin categoría'); // Business category default
      expect(result.precision).toBe(2);
    });

    it('should create ELABORATED item with defaults', () => {
      const result = MaterialsNormalizer.createNewItem('ELABORATED') as Partial<ElaboratedItem>;

      expect(result.type).toBe('ELABORATED');
      expect(result.unit).toBe('porción');
      expect(result.requires_production).toBe(true);
      expect(result.auto_calculate_cost).toBe(true);
      expect(result.ingredients_available).toBe(false);
    });

    it('should merge partial data', () => {
      const partial = { name: 'Custom Name', stock: 100 };
      const result = MaterialsNormalizer.createNewItem('COUNTABLE', partial);

      expect(result.name).toBe('Custom Name');
      expect(result.stock).toBe(100);
      expect(result.type).toBe('COUNTABLE');
      expect(result.unit).toBe('unidad');
    });
  });

  describe('validation helpers', () => {
    it('should validate categories correctly', () => {
      const apiItem = { id: '1', name: 'Test', type: 'MEASURABLE', category: 'invalid' };
      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as MeasurableItem;
      
      expect(result.category).toBe('invalid'); // Business categories can be any string, no validation needed
    });

    it('should validate precision correctly', () => {
      const apiItem = { 
        id: '1', 
        name: 'Test', 
        type: 'MEASURABLE', 
        precision_digits: 10 // Invalid, too high
      };
      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as MeasurableItem;
      
      expect(result.precision).toBe(2); // Should default to 2
    });

    it('should validate display mode correctly', () => {
      const apiItem = {
        id: '1',
        name: 'Test',
        type: 'COUNTABLE',
        package_size: 10,
        display_mode: 'invalid'
      };
      const result = MaterialsNormalizer.normalizeApiItem(apiItem) as CountableItem;
      
      expect(result.packaging?.display_mode).toBe('individual'); // Should default
    });
  });
});