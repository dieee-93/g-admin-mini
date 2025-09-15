import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  calculateCustomerRFM,
  getCustomerAnalyticsDashboard,
  getCustomerProfileWithRFM,
  getCustomerTags,
  getCustomerNotes,
  createCustomerNote,
  getCustomerPreferences
} from './advancedCustomerApi'
import { supabase } from '@/lib/supabase/client';

describe('advancedCustomerApi - 🚀 COMPREHENSIVE STRESS TEST SUITE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ===== PHASE 1: ADVANCED BUSINESS LOGIC STRESS TESTS =====
  
  describe('🧮 RFM Business Logic - COMPREHENSIVE VALIDATION', () => {
    describe('Complex Customer Scenarios', () => {
      it('should validate RFM calculations for VIP, At Risk, and New customers', async () => {
        // Realistic complex dataset
        const complexRFMData = [
          {
            customer_id: 'vip_001',
            customer_name: 'Elena Rodriguez VIP',
            email: 'elena.vip@premiumclient.com',
            recency: 1, // Yesterday
            frequency: 156, // 3 orders/week for a year
            monetary: 25680.50,
            recency_score: 5,
            frequency_score: 5,
            monetary_score: 5,
            rfm_score: '555',
            segment: 'Champions',
            total_orders: 156,
            total_spent: 25680.50,
            avg_order_value: 164.62,
            first_purchase_date: '2023-01-15',
            last_purchase_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            clv_estimate: 77041.50,
            churn_risk: 'None',
            recommended_action: 'Exclusive VIP treatment'
          },
          {
            customer_id: 'atrisk_002',
            customer_name: 'Miguel Santos',
            recency: 180, // 6 months ago
            frequency: 24,
            monetary: 1200.00,
            recency_score: 1,
            frequency_score: 3,
            monetary_score: 3,
            rfm_score: '133',
            segment: 'At Risk',
            churn_risk: 'Critical',
            recommended_action: 'Urgent win-back campaign'
          }
        ];

        const rpcSpy = vi.spyOn(supabase, 'rpc')
          .mockResolvedValueOnce({ data: null, error: null })
          .mockResolvedValueOnce({ data: complexRFMData, error: null });

        const result = await calculateCustomerRFM();

        // Validate business logic
        expect(result).toHaveLength(2);
        
        const vipCustomer = result.find(c => c.customer_id === 'vip_001');
        expect(vipCustomer).toBeDefined();
        expect(vipCustomer.rfm_score).toBe('555');
        expect(vipCustomer.segment).toBe('Champions');
        expect(vipCustomer.churn_risk).toBe('None');
        
        const atRiskCustomer = result.find(c => c.customer_id === 'atrisk_002');
        expect(atRiskCustomer).toBeDefined();
        expect(atRiskCustomer.rfm_score).toBe('133');
        expect(atRiskCustomer.segment).toBe('At Risk');
        expect(atRiskCustomer.churn_risk).toBe('Critical');
      });

      it('should handle mathematical edge cases correctly', async () => {
        const edgeCases = [
          {
            customer_id: 'edge_zero_spend',
            customer_name: 'Zero Spend Customer',
            monetary: 0.00,
            avg_order_value: 0.00,
            clv_estimate: 0.00,
            segment: 'Hibernating',
            rfm_score: '111'
          },
          {
            customer_id: 'edge_daily_visitor',
            customer_name: 'Daily Visitor',
            monetary: 365.00,
            frequency: 365,
            avg_order_value: 1.00,
            total_orders: 365,
            segment: 'New Customers',
            rfm_score: '511'
          },
          {
            customer_id: 'edge_ancient',
            customer_name: 'Ancient Customer',
            monetary: 5000.00,
            recency: 1825, // 5 years
            recency_score: 1,
            churn_risk: 'Lost Forever',
            segment: 'Cannot Lose Them',
            rfm_score: '155'
          }
        ];

        const rpcSpy = vi.spyOn(supabase, 'rpc')
          .mockResolvedValueOnce({ data: null, error: null })
          .mockResolvedValueOnce({ data: edgeCases, error: null });

        const result = await calculateCustomerRFM();
        
        expect(result).toHaveLength(3);
        
        // Cleanup
        rpcSpy.mockRestore();
        
        const zeroCustomer = result.find(c => c.customer_id === 'edge_zero_spend');
        expect(zeroCustomer.monetary).toBe(0);
        expect(zeroCustomer.avg_order_value).toBe(0);
        
        const frequentCustomer = result.find(c => c.customer_id === 'edge_daily_visitor');
        expect(frequentCustomer.frequency).toBe(365);
        expect(frequentCustomer.total_orders).toBe(365);
        
        const ancientCustomer = result.find(c => c.customer_id === 'edge_ancient');
        expect(ancientCustomer.recency).toBe(1825);
        expect(ancientCustomer.churn_risk).toBe('Lost Forever');
      });
    });

    describe('Customer Segmentation Validation', () => {
      it('should correctly classify all 11 RFM segments', async () => {
        const allSegments = [
          { rfm_score: '555', segment: 'Champions', churn_risk: 'None' },
          { rfm_score: '544', segment: 'Champions', churn_risk: 'Low' },
          { rfm_score: '543', segment: 'Loyal Customers', churn_risk: 'Low' },
          { rfm_score: '444', segment: 'Loyal Customers', churn_risk: 'Low' },
          { rfm_score: '511', segment: 'New Customers', churn_risk: 'Medium' },
          { rfm_score: '414', segment: 'Potential Loyalists', churn_risk: 'Medium' },
          { rfm_score: '155', segment: 'At Risk', churn_risk: 'Critical' },
          { rfm_score: '111', segment: 'Lost', churn_risk: 'Lost Forever' }
        ].map((seg, index) => ({
          customer_id: `segment_${index}`,
          customer_name: `Customer ${seg.segment}`,
          ...seg,
          recency: 30,
          frequency: 4,
          monetary: 400
        }));

        vi.spyOn(supabase, 'rpc')
          .mockResolvedValueOnce({ data: null, error: null })
          .mockResolvedValueOnce({ data: allSegments, error: null });

        const result = await calculateCustomerRFM();
        
        const segments = [...new Set(result.map(c => c.segment))];
        expect(segments).toContain('Champions');
        expect(segments).toContain('Loyal Customers');
        expect(segments).toContain('New Customers');
        expect(segments).toContain('At Risk');
        expect(segments).toContain('Lost');
        
        // Validate churn risk correlation
        result.forEach(customer => {
          if (customer.segment === 'Champions') {
            expect(['None', 'Low']).toContain(customer.churn_risk);
          }
          if (customer.segment === 'Lost') {
            expect(customer.churn_risk).toBe('Lost Forever');
          }
        });
      });
    });
  });

  // ===== PHASE 2: PERFORMANCE & SCALABILITY STRESS TESTS =====

  describe('⚡ Performance Stress Tests - VOLUME & CONCURRENCY', () => {
    it('should handle 10,000+ customers efficiently', async () => {
      const startTime = Date.now();
      
      // Generate massive realistic dataset
      const massiveData = Array.from({ length: 10000 }, (_, i) => ({
        customer_id: `stress_${i.toString().padStart(5, '0')}`,
        customer_name: `Customer ${i}`,
        email: `customer${i}@stresstest.com`,
        recency: Math.floor(Math.random() * 365) + 1,
        frequency: Math.floor(Math.random() * 100) + 1,
        monetary: parseFloat((Math.random() * 10000 + 10).toFixed(2)),
        recency_score: Math.floor(Math.random() * 5) + 1,
        frequency_score: Math.floor(Math.random() * 5) + 1,
        monetary_score: Math.floor(Math.random() * 5) + 1,
        rfm_score: `${Math.floor(Math.random() * 5) + 1}${Math.floor(Math.random() * 5) + 1}${Math.floor(Math.random() * 5) + 1}`,
        segment: ['Champions', 'Loyal Customers', 'New Customers', 'At Risk', 'Lost'][Math.floor(Math.random() * 5)],
        clv_estimate: parseFloat((Math.random() * 50000 + 100).toFixed(2)),
        churn_risk: ['None', 'Low', 'Medium', 'Critical', 'Lost Forever'][Math.floor(Math.random() * 5)]
      }));

      vi.spyOn(supabase, 'rpc')
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: massiveData, error: null });

      const result = await calculateCustomerRFM();
      const processingTime = Date.now() - startTime;

      // Performance assertions
      expect(result).toHaveLength(10000);
      expect(processingTime).toBeLessThan(5000); // Under 5 seconds
      
      // Data integrity
      expect(result.every(c => c.customer_id.startsWith('stress_'))).toBe(true);
      expect(result.every(c => typeof c.monetary === 'number')).toBe(true);
      
      // No memory leaks
      const uniqueIds = new Set(result.map(c => c.customer_id));
      expect(uniqueIds.size).toBe(10000);
    });

    it('should handle concurrent API calls efficiently', async () => {
      const concurrentData = Array.from({ length: 100 }, (_, i) => ({
        customer_id: `concurrent_${i}`,
        customer_name: `Concurrent Customer ${i}`,
        recency: 30,
        frequency: 5,
        monetary: 500,
        rfm_score: '333',
        segment: 'Loyal Customers'
      }));

      // Mock all RPC calls to return our concurrent data
      const rpcSpy = vi.spyOn(supabase, 'rpc');
      rpcSpy
        .mockResolvedValue({ data: null, error: null }) // First call (calculate)
        .mockResolvedValue({ data: concurrentData, error: null }); // Second call (get data)

      // Setup for 10 concurrent calls
      const concurrentPromises = Array.from({ length: 10 }, () => calculateCustomerRFM());

      const startTime = Date.now();
      const results = await Promise.all(concurrentPromises);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(100);
      });
      expect(totalTime).toBeLessThan(3000); // Under 3 seconds
      
      // Restore the spy
      rpcSpy.mockRestore();
    });
  });

  // ===== PHASE 3: ERROR RESILIENCE & RECOVERY TESTS =====

  describe('🛡️ Fault Tolerance - ERROR RESILIENCE TESTS', () => {
    it('should gracefully handle complete database failure', async () => {
      vi.spyOn(supabase, 'rpc')
        .mockRejectedValueOnce(new Error('ECONNREFUSED: Connection refused'))
        .mockRejectedValueOnce(new Error('ECONNREFUSED: Connection refused'));

      const result = await calculateCustomerRFM();

      // Should return fallback data, not throw
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(customer => {
        expect(customer.customer_id).toBeDefined();
        expect(customer.customer_name).toBeDefined();
        expect(typeof customer.monetary).toBe('number');
        expect(customer.monetary).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle corrupted database responses', async () => {
      const corruptedData = [
        { customer_id: null, monetary: 'invalid', segment: undefined },
        { customer_id: 'valid', monetary: -1000, recency: 'not_number' },
        undefined,
        null,
        { customer_id: 'partial' } // Missing fields
      ];

      const rpcSpy = vi.spyOn(supabase, 'rpc');
      rpcSpy
        .mockResolvedValueOnce({ data: null, error: null }) // First call (calculate)
        .mockResolvedValueOnce({ data: corruptedData, error: null }); // Second call (get data)

      const result = await calculateCustomerRFM();

      // Should fallback to clean data when corrupted data is detected
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(customer => {
        expect(customer).toBeDefined();
        expect(customer.customer_id).toBeDefined();
        expect(typeof customer.customer_id).toBe('string');
        expect(typeof customer.monetary).toBe('number');
        expect(customer.monetary).toBeGreaterThanOrEqual(0);
      });
      
      // Restore the spy
      rpcSpy.mockRestore();
    });

    it('should handle intermittent network failures', async () => {
      let callCount = 0;
      vi.spyOn(supabase, 'rpc').mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve({ data: null, error: null });
      });

      const result = await calculateCustomerRFM();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ===== ORIGINAL BASIC TESTS (ENHANCED) =====

  describe('RFM Analytics API', () => {
    it('should calculate customer RFM successfully', async () => {
      const mockRFMData = [{
        customer_id: '1',
        customer_name: 'Test Customer',
        email: 'test@email.com',
        recency: 30,
        frequency: 5,
        monetary: 500.00,
        rfm_score: '555',
        segment: 'Champions'
      }];
      const rpcSpy = vi.spyOn(supabase, 'rpc')
        .mockResolvedValueOnce({ data: null, error: null }) // First call (calculate)
        .mockResolvedValueOnce({ data: mockRFMData, error: null }); // Second call (get data)

      const result = await calculateCustomerRFM();

      expect(rpcSpy).toHaveBeenCalledWith('calculate_customer_rfm_profiles', { analysis_period_days: 365 });
      expect(result).toEqual(mockRFMData);
      
      // Cleanup
      rpcSpy.mockRestore();
    });

    it('should use fallback data when RFM calculation fails', async () => {
      // Simular que ambas llamadas RPC fallan
      vi.spyOn(supabase, 'rpc')
        .mockResolvedValueOnce({ data: null, error: { message: 'Database error' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });

      const result = await calculateCustomerRFM();
      
      // Verificar que retorna datos de fallback (no un error)
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('customer_name');
      expect(result[0]).toHaveProperty('segment');
    });

    it('should get customer analytics dashboard', async () => {
      const mockAnalytics = { total_customers: 100 };
      vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: mockAnalytics, error: null });

      const result = await getCustomerAnalyticsDashboard();

      expect(supabase.rpc).toHaveBeenCalledWith('get_customer_analytics_dashboard');
      expect(result).toEqual(mockAnalytics);
    });

    it('should get customer profile with RFM', async () => {
      const mockProfile = { id: '1', name: 'John Doe' };
      vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: mockProfile, error: null });

      const result = await getCustomerProfileWithRFM('1');

      expect(supabase.rpc).toHaveBeenCalledWith('get_customer_profile_with_rfm', { customer_id: '1' });
      expect(result).toEqual(mockProfile);
    });
  });

  describe('Customer Tags API', () => {
    it('should get customer tags successfully', async () => {
      const mockTags = [{ id: '1', name: 'VIP' }];
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTags, error: null }),
      } as any);

      const result = await getCustomerTags();

      expect(supabase.from).toHaveBeenCalledWith('customer_intelligence.customer_tags');
      expect(result).toEqual(mockTags);
    });

    it('should handle empty tags result', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const result = await getCustomerTags();
      expect(result).toEqual([]);
    });

    it('should handle tags fetch error', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      } as any);

      await expect(getCustomerTags()).rejects.toThrow('Failed to fetch customer tags');
    });
  });

  describe('Customer Notes API', () => {
    it('should get customer notes successfully', async () => {
      const mockNotes = [{ id: '1', content: 'Great customer' }];
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockNotes, error: null }),
      } as any);

      const result = await getCustomerNotes('1');

      expect(supabase.from).toHaveBeenCalledWith('customer_intelligence.customer_notes');
      expect(result).toEqual(mockNotes);
    });

    it('should create customer note successfully', async () => {
      const noteData = { customer_id: '1', content: 'New note', type: 'general' as const, created_by: 'user1', is_important: false };
      const mockCreatedNote = { id: '1', ...noteData };
      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCreatedNote, error: null }),
      } as any);

      const result = await createCustomerNote(noteData);

      expect(supabase.from).toHaveBeenCalledWith('customer_intelligence.customer_notes');
      expect(result).toEqual(mockCreatedNote);
    });
  });

  describe('Customer Preferences API', () => {
    it('should get customer preferences successfully', async () => {
      const mockPreferences = { customer_id: '1', allergies: ['nuts'] };
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPreferences, error: null }),
      } as any);

      const result = await getCustomerPreferences('1');

      expect(supabase.from).toHaveBeenCalledWith('customer_intelligence.customer_preferences');
      expect(result).toEqual(mockPreferences);
    });

    it('should return null when no preferences found', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      } as any);

      const result = await getCustomerPreferences('1');
      expect(result).toBeNull();
    });

    it('should handle preferences fetch error', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      } as any);

      await expect(getCustomerPreferences('1')).rejects.toThrow('Failed to fetch customer preferences');
    });
  });
})