/**
 * UNIT TESTS: Product Form Validation Service
 *
 * Tests for productFormValidation.ts
 */

import { describe, it, expect } from 'vitest';
import { validateProduct } from '../productFormValidation';
import type { ProductFormData } from '../../types/productForm';

describe('productFormValidation', () => {
  describe('validateProduct - Basic Info', () => {
    it('should validate required name field', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: '',
          active: true
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'physical_product');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('basic_info.name');
      expect(result.errors[0].severity).toBe('error');
    });

    it('should pass with valid name', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: 'Valid Product',
          active: true
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'physical_product');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should trim whitespace when validating name', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: '   ',
          active: true
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'physical_product');

      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('basic_info.name');
    });
  });

  describe('validateProduct - Pricing', () => {
    it('should validate positive price', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        pricing: {
          price: -10
        }
      };

      const result = validateProduct(formData, 'service');

      expect(result.isValid).toBe(false);
      const priceError = result.errors.find(e => e.field === 'pricing.price');
      expect(priceError).toBeDefined();
      expect(priceError?.severity).toBe('error');
    });

    it('should reject zero price', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Free Service',
          active: true
        },
        pricing: {
          price: 0
        }
      };

      const result = validateProduct(formData, 'service');

      // Should have error for zero price
      expect(result.isValid).toBe(false);
      const priceError = result.errors.find(e => e.field === 'pricing.price');
      expect(priceError).toBeDefined();
    });

    it('should validate compare_at_price is higher than price', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: 'Product',
          active: true
        },
        pricing: {
          price: 100,
          compare_at_price: 80
        }
      };

      const result = validateProduct(formData, 'physical_product');

      const compareError = result.errors.find(e => e.field === 'pricing.compare_at_price');
      expect(compareError).toBeDefined();
    });
  });

  describe('validateProduct - Materials', () => {
    it('should validate materials when has_materials is true', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: 'Product',
          active: true
        },
        materials: {
          has_materials: true,
          components: []
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'physical_product');

      expect(result.isValid).toBe(false);
      const materialsError = result.errors.find(e => e.field.includes('materials'));
      expect(materialsError).toBeDefined();
    });

    it('should pass with valid components', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: 'Product',
          active: true
        },
        materials: {
          has_materials: true,
          components: [
            {
              material_id: '1',
              quantity: 2,
              unit_cost: 10
            }
          ]
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'physical_product');

      expect(result.isValid).toBe(true);
    });

    it('should validate component quantities are positive', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: 'Product',
          active: true
        },
        materials: {
          has_materials: true,
          components: [
            {
              material_id: '1',
              quantity: -1,
              unit_cost: 10
            }
          ]
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'physical_product');

      expect(result.isValid).toBe(false);
      const quantityError = result.errors.find(e => e.field.includes('quantity'));
      expect(quantityError).toBeDefined();
    });
  });

  describe('validateProduct - Staff', () => {
    it('should validate staff when has_staff_requirements is true', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        staff: {
          has_staff_requirements: true,
          staff_allocation: []
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'service');

      expect(result.isValid).toBe(false);
      const staffError = result.errors.find(e => e.field.includes('staff'));
      expect(staffError).toBeDefined();
    });

    it('should pass with valid staff allocation', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        staff: {
          has_staff_requirements: true,
          staff_allocation: [
            {
              role_id: '1',
              count: 1,
              duration_minutes: 60,
              hourly_rate: 20
            }
          ]
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'service');

      expect(result.isValid).toBe(true);
    });

    it('should validate staff count is positive', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        staff: {
          has_staff_requirements: true,
          staff_allocation: [
            {
              role_id: '1',
              count: 0,
              duration_minutes: 60,
              hourly_rate: 20
            }
          ]
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'service');

      expect(result.isValid).toBe(false);
      const countError = result.errors.find(e => e.field.includes('count'));
      expect(countError).toBeDefined();
    });

    it('should validate duration is positive', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        staff: {
          has_staff_requirements: true,
          staff_allocation: [
            {
              role_id: '1',
              count: 1,
              duration_minutes: 0,
              hourly_rate: 20
            }
          ]
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'service');

      expect(result.isValid).toBe(false);
      const durationError = result.errors.find(e => e.field.includes('duration'));
      expect(durationError).toBeDefined();
    });
  });

  describe('validateProduct - Booking', () => {
    it('should validate booking configuration when requires_booking is true', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        booking: {
          requires_booking: true
          // Missing required booking fields
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'service');

      expect(result.isValid).toBe(false);
      const bookingError = result.errors.find(e => e.field.includes('booking'));
      expect(bookingError).toBeDefined();
    });

    it('should pass with valid booking config', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        booking: {
          requires_booking: true,
          booking_window_days: 7,
          duration_minutes: 60
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'service');

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateProduct - Production', () => {
    it('should validate production for physical products', () => {
      const formData: ProductFormData = {
        product_type: 'physical_product',
        basic_info: {
          name: 'Product',
          active: true
        },
        production: {
          requires_production: true
          // Missing production_time_minutes
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'physical_product');

      expect(result.isValid).toBe(false);
      const productionError = result.errors.find(e => e.field.includes('production'));
      expect(productionError).toBeDefined();
    });

    it('should not validate production for services', () => {
      const formData: ProductFormData = {
        product_type: 'service',
        basic_info: {
          name: 'Service',
          active: true
        },
        production: {
          requires_production: true
          // Missing fields but shouldn't matter for services
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'service');

      // Should not have production errors for service type
      const productionError = result.errors.find(e => e.field.includes('production'));
      expect(productionError).toBeUndefined();
    });
  });

  describe('validateProduct - Digital Delivery', () => {
    it('should validate digital delivery for digital products', () => {
      const formData: ProductFormData = {
        product_type: 'digital',
        basic_info: {
          name: 'Digital Product',
          active: true
        },
        digital_delivery: {
          delivery_type: 'download'
          // Missing download_config
        },
        pricing: {
          price: 100
        }
      };

      const result = validateProduct(formData, 'digital');

      expect(result.isValid).toBe(false);
      const deliveryError = result.errors.find(e => e.field.includes('digital_delivery'));
      expect(deliveryError).toBeDefined();
    });

    it('should pass with valid download config', () => {
      const formData: ProductFormData = {
        product_type: 'digital',
        basic_info: {
          name: 'Ebook',
          active: true
        },
        digital_delivery: {
          delivery_type: 'download',
          download_config: {
            file_url: 'https://example.com/file.pdf',
            file_size_mb: 5,
            file_format: 'PDF'
          }
        },
        pricing: {
          price: 29.99
        }
      };

      const result = validateProduct(formData, 'digital');

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateProduct - Recurring Config', () => {
    it('should validate recurring config for memberships', () => {
      const formData: ProductFormData = {
        product_type: 'membership',
        basic_info: {
          name: 'Premium Membership',
          active: true
        },
        recurring_config: {
          billing_cycle: 'monthly',
          trial_enabled: false,
          auto_renewal: true,
          access_type: 'unlimited'
        },
        pricing: {
          price: 49.99
        }
      };

      const result = validateProduct(formData, 'membership');

      expect(result.isValid).toBe(true);
    });

    it('should validate trial configuration when enabled', () => {
      const formData: ProductFormData = {
        product_type: 'membership',
        basic_info: {
          name: 'Premium Membership',
          active: true
        },
        recurring_config: {
          billing_cycle: 'monthly',
          trial_enabled: true,
          // Missing trial_duration_days
          auto_renewal: true,
          access_type: 'unlimited'
        },
        pricing: {
          price: 49.99
        }
      };

      const result = validateProduct(formData, 'membership');

      expect(result.isValid).toBe(false);
      const trialError = result.errors.find(e => e.field.includes('trial'));
      expect(trialError).toBeDefined();
    });
  });
});
