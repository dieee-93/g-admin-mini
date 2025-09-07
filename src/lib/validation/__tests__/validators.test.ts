import { describe, it, expect, beforeEach } from 'vitest';
import { createValidationSchema, validateData } from '../validators';

describe('Validation System', () => {
  describe('Inventory Validation', () => {
    let schema: any;

    beforeEach(() => {
      schema = createValidationSchema('inventory');
    });

    it('should validate valid inventory data', async () => {
      const validData = {
        name: 'Tomate',
        current_stock: 10,
        min_stock: 5,
        max_stock: 50,
        cost_per_unit: 1.50,
        category: 'vegetales',
        unit: 'kg'
      };

      const result = await validateData(validData, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid inventory data', async () => {
      const invalidData = {
        name: '', // Too short
        current_stock: -5, // Negative
        min_stock: 0,
        cost_per_unit: -1, // Negative
        category: 'invalid@category', // Invalid characters
        unit: '' // Required
      };

      const result = await validateData(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate stock relationships', async () => {
      const invalidStockData = {
        name: 'Test Item',
        current_stock: 10,
        min_stock: 15, // Min greater than current
        max_stock: 10, // Max less than min
        cost_per_unit: 1.00,
        category: 'test',
        unit: 'kg'
      };

      const result = await validateData(invalidStockData, schema);
      expect(result.isValid).toBe(false);
    });

    it('should sanitize input data', async () => {
      const dirtyData = {
        name: '  <script>alert("xss")</script>Tomate  ',
        current_stock: 10,
        min_stock: 5,
        cost_per_unit: 1.50,
        category: 'vegetales',
        unit: 'kg'
      };

      const result = await validateData(dirtyData, schema);
      expect(result.sanitizedData?.name).not.toContain('<script>');
      expect(result.sanitizedData?.name).toBe('Tomate');
    });
  });

  describe('Customer Validation', () => {
    let schema: any;

    beforeEach(() => {
      schema = createValidationSchema('customer');
    });

    it('should validate valid customer data', async () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+5491123456789',
        address: 'Calle Falsa 123'
      };

      const result = await validateData(validData, schema);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'invalid-email',
        phone: '+5491123456789'
      };

      const result = await validateData(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should reject invalid phone', async () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: 'abc123' // Invalid phone format
      };

      const result = await validateData(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'phone')).toBe(true);
    });
  });

  describe('Sales Validation', () => {
    let schema: any;

    beforeEach(() => {
      schema = createValidationSchema('sale');
    });

    it('should validate valid sale data', async () => {
      const validData = {
        items: [
          {
            product_id: '1',
            product_name: 'Test Product',
            quantity: 2,
            unit_price: 10.00
          }
        ],
        total: 20.00,
        payment_method: 'cash'
      };

      const result = await validateData(validData, schema);
      expect(result.isValid).toBe(true);
    });

    it('should reject empty items array', async () => {
      const invalidData = {
        items: [],
        total: 0,
        payment_method: 'cash'
      };

      const result = await validateData(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'items')).toBe(true);
    });

    it('should reject invalid payment method', async () => {
      const invalidData = {
        items: [
          {
            product_id: '1',
            product_name: 'Test Product',
            quantity: 2,
            unit_price: 10.00
          }
        ],
        total: 20.00,
        payment_method: 'crypto' // Invalid method
      };

      const result = await validateData(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'payment_method')).toBe(true);
    });
  });

  describe('Staff Validation', () => {
    let schema: any;

    beforeEach(() => {
      schema = createValidationSchema('staff');
    });

    it('should validate valid staff data', async () => {
      const validData = {
        name: 'María García',
        email: 'maria@restaurant.com',
        phone: '+5491187654321',
        position: 'Cocinera',
        salary: 250000,
        hire_date: '2023-01-01'
      };

      const result = await validateData(validData, schema);
      expect(result.isValid).toBe(true);
    });

    it('should reject future hire date', async () => {
      const invalidData = {
        name: 'María García',
        email: 'maria@restaurant.com',
        position: 'Cocinera',
        salary: 250000,
        hire_date: '2026-01-01' // Future date
      };

      const result = await validateData(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'hire_date')).toBe(true);
    });

    it('should reject invalid salary', async () => {
      const invalidData = {
        name: 'María García',
        email: 'maria@restaurant.com',
        position: 'Cocinera',
        salary: -1000, // Negative salary
        hire_date: '2023-01-01'
      };

      const result = await validateData(invalidData, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'salary')).toBe(true);
    });
  });

  describe('Custom Validation Rules', () => {
    it('should handle custom validation functions', async () => {
      const schema = {
        rules: [
          {
            field: 'custom_field',
            rules: {
              custom: (value: unknown) => {
                if (value === 'invalid') {
                  return 'Custom validation failed';
                }
                return true;
              }
            }
          }
        ],
        sanitize: false
      };

      const invalidResult = await validateData({ custom_field: 'invalid' }, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors[0].message).toBe('Custom validation failed');

      const validResult = await validateData({ custom_field: 'valid' }, schema);
      expect(validResult.isValid).toBe(true);
    });

    it('should handle validation errors gracefully', async () => {
      const schema = {
        rules: [
          {
            field: 'error_field',
            rules: {
              custom: () => {
                throw new Error('Validation error');
              }
            }
          }
        ]
      };

      const result = await validateData({ error_field: 'test' }, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'custom_error')).toBe(true);
    });
  });

  describe('Sanitization', () => {
    it('should sanitize HTML tags', async () => {
      const schema = { rules: [], sanitize: true };
      const dirtyData = {
        name: '<script>alert("xss")</script>Clean Name',
        description: 'Normal text with <b>bold</b> tags'
      };

      const result = await validateData(dirtyData, schema);
      expect(result.sanitizedData?.name).not.toContain('<script>');
      expect(result.sanitizedData?.description).not.toContain('<b>');
    });

    it('should trim whitespace', async () => {
      const schema = { rules: [], sanitize: true };
      const dirtyData = {
        name: '  Extra Spaces  ',
        email: '\t  email@test.com  \n'
      };

      const result = await validateData(dirtyData, schema);
      expect(result.sanitizedData?.name).toBe('Extra Spaces');
      expect(result.sanitizedData?.email).toBe('email@test.com');
    });

    it('should normalize whitespace', async () => {
      const schema = { rules: [], sanitize: true };
      const dirtyData = {
        description: 'Text   with\tmultiple\n\nspaces'
      };

      const result = await validateData(dirtyData, schema);
      expect(result.sanitizedData?.description).toBe('Text with multiple spaces');
    });
  });
});