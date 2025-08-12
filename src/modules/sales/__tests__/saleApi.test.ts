import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSales, fetchSaleById, validateSaleStock } from '../data/saleApi';
import { errorHandler } from '@/lib/error-handling';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        })),
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    rpc: vi.fn()
  }
}));

// Mock error handler
vi.mock('@/lib/error-handling', () => ({
  errorHandler: {
    handle: vi.fn()
  },
  createNetworkError: vi.fn((message, details) => ({
    type: 'network',
    message,
    details
  }))
}));

// Mock other dependencies
vi.mock('@/lib/events/EventBus', () => ({
  EventBus: {
    emit: vi.fn()
  }
}));

vi.mock('@/lib/events/RestaurantEvents', () => ({
  RestaurantEvents: {}
}));

vi.mock('@/modules/fiscal/services/taxCalculationService', () => ({
  taxService: {}
}));

describe('saleApi', () => {
  const mockSupabase = vi.hoisted(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        })),
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    rpc: vi.fn()
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchSales', () => {
    it('should fetch sales successfully', async () => {
      const mockData = [
        { id: '1', total: 100, created_at: '2023-01-01' },
        { id: '2', total: 200, created_at: '2023-01-02' }
      ];

      // Setup mock chain
      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      
      // Mock the full chain
      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => mockQuery)
            }))
          }))
        }
      }));

      // Mock the final result
      Object.assign(mockQuery, {
        then: vi.fn((callback) => callback({ data: mockData, error: null }))
      });

      const result = await fetchSales();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      
      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((callback) => callback({ data: null, error: mockError }))
      };

      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => mockQuery)
            }))
          }))
        }
      }));

      await expect(fetchSales()).rejects.toThrow('Network error');
      expect(errorHandler.handle).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      const filters = {
        dateFrom: '2023-01-01',
        dateTo: '2023-01-31',
        customerId: '123',
        minTotal: 100,
        maxTotal: 500
      };

      const mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((callback) => callback({ data: [], error: null }))
      };

      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => mockQuery)
            }))
          }))
        }
      }));

      await fetchSales(filters);

      expect(mockQuery.gte).toHaveBeenCalledWith('created_at', '2023-01-01');
      expect(mockQuery.lte).toHaveBeenCalledWith('created_at', '2023-01-31');
      expect(mockQuery.eq).toHaveBeenCalledWith('customer_id', '123');
      expect(mockQuery.gte).toHaveBeenCalledWith('total', 100);
      expect(mockQuery.lte).toHaveBeenCalledWith('total', 500);
    });
  });

  describe('fetchSaleById', () => {
    it('should fetch a single sale by ID', async () => {
      const mockSale = {
        id: '1',
        total: 100,
        customer: { id: '1', name: 'John Doe' },
        sale_items: []
      };

      const mockQuery = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockSale, error: null })
        }))
      };

      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => mockQuery)
          }))
        }
      }));

      const result = await fetchSaleById('1');
      expect(result).toEqual(mockSale);
    });

    it('should handle errors when fetching by ID', async () => {
      const mockError = new Error('Sale not found');
      
      const mockQuery = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: mockError })
        }))
      };

      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => mockQuery)
          }))
        }
      }));

      await expect(fetchSaleById('nonexistent')).rejects.toThrow('Sale not found');
      expect(errorHandler.handle).toHaveBeenCalled();
    });
  });

  describe('validateSaleStock', () => {
    it('should validate stock availability', async () => {
      const items = [
        { product_id: '1', quantity: 2 },
        { product_id: '2', quantity: 1 }
      ];

      const mockValidation = {
        is_valid: true,
        insufficient_items: [],
        total_value: 150
      };

      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          rpc: vi.fn().mockResolvedValue({ data: mockValidation, error: null })
        }
      }));

      const result = await validateSaleStock(items);
      expect(result.is_valid).toBe(true);
      expect(result.total_value).toBe(150);
    });

    it('should handle validation errors', async () => {
      const items = [{ product_id: '1', quantity: 100 }];
      const mockError = new Error('Validation failed');

      vi.doMock('@/lib/supabase', () => ({
        supabase: {
          rpc: vi.fn().mockResolvedValue({ data: null, error: mockError })
        }
      }));

      await expect(validateSaleStock(items)).rejects.toThrow('Validation failed');
    });
  });
});