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

describe('advancedCustomerApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('RFM Analytics API', () => {
    it('should calculate customer RFM successfully', async () => {
      const mockRFMData = [{ customer_id: '1', rfm_score: '555' }];
      const rpcSpy = vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: mockRFMData, error: null });

      const result = await calculateCustomerRFM();

      expect(rpcSpy).toHaveBeenCalledWith('calculate_customer_rfm_profiles', { analysis_period_days: 365 });
      expect(result).toEqual(mockRFMData);
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