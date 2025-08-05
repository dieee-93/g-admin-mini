// src/features/customers/data/advancedCustomerApi.test.ts
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

// Mock supabase
const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis()
  }))
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('advancedCustomerApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('RFM Analytics API', () => {
    it('should calculate customer RFM successfully', async () => {
      const mockRFMData = [
        {
          customer_id: '1',
          recency_score: 5,
          frequency_score: 4,
          monetary_score: 5,
          rfm_segment: 'champions',
          lifetime_value: 1000,
          churn_risk: 'low'
        }
      ]

      mockSupabase.rpc.mockResolvedValue({
        data: mockRFMData,
        error: null
      })

      const result = await calculateCustomerRFM()

      expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_customer_rfm_profiles')
      expect(result).toEqual(mockRFMData)
    })

    it('should handle RFM calculation errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(calculateCustomerRFM()).rejects.toThrow('Failed to calculate customer RFM profiles')
    })

    it('should get customer analytics dashboard', async () => {
      const mockAnalytics = {
        total_customers: 100,
        new_customers_this_month: 15,
        customer_retention_rate: 85.5,
        segment_distribution: {
          champions: { count: 20, percentage: 20, avg_lifetime_value: 1000 }
        }
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockAnalytics,
        error: null
      })

      const result = await getCustomerAnalyticsDashboard()

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_customer_analytics_dashboard')
      expect(result).toEqual(mockAnalytics)
    })

    it('should get customer profile with RFM', async () => {
      const mockProfile = {
        id: '1',
        name: 'John Doe',
        rfm_profile: {
          recency_score: 5,
          frequency_score: 4,
          monetary_score: 5
        }
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await getCustomerProfileWithRFM('1')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_customer_profile_with_rfm', {
        customer_id: '1'
      })
      expect(result).toEqual(mockProfile)
    })
  })

  describe('Customer Tags API', () => {
    it('should get customer tags successfully', async () => {
      const mockTags = [
        { id: '1', name: 'VIP', color: '#gold', category: 'behavior' },
        { id: '2', name: 'Vegan', color: '#green', category: 'preference' }
      ]

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTags, error: null })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const result = await getCustomerTags()

      expect(mockSupabase.from).toHaveBeenCalledWith('customer_tags')
      expect(mockFromChain.select).toHaveBeenCalledWith('*')
      expect(mockFromChain.order).toHaveBeenCalledWith('name')
      expect(result).toEqual(mockTags)
    })

    it('should handle empty tags result', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const result = await getCustomerTags()
      expect(result).toEqual([])
    })

    it('should handle tags fetch error', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      await expect(getCustomerTags()).rejects.toThrow('Failed to fetch customer tags')
    })
  })

  describe('Customer Notes API', () => {
    it('should get customer notes successfully', async () => {
      const mockNotes = [
        {
          id: '1',
          customer_id: '1',
          content: 'Great customer',
          type: 'general',
          created_at: '2024-01-01',
          is_important: false
        }
      ]

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockNotes, error: null })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const result = await getCustomerNotes('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('customer_notes')
      expect(mockFromChain.select).toHaveBeenCalledWith('*')
      expect(mockFromChain.eq).toHaveBeenCalledWith('customer_id', '1')
      expect(mockFromChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockNotes)
    })

    it('should create customer note successfully', async () => {
      const noteData = {
        customer_id: '1',
        content: 'New note',
        type: 'general' as const,
        created_by: 'user1',
        is_important: false
      }

      const mockCreatedNote = { id: '1', ...noteData, created_at: '2024-01-01' }

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCreatedNote, error: null })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const result = await createCustomerNote(noteData)

      expect(mockSupabase.from).toHaveBeenCalledWith('customer_notes')
      expect(mockFromChain.insert).toHaveBeenCalledWith([noteData])
      expect(result).toEqual(mockCreatedNote)
    })
  })

  describe('Customer Preferences API', () => {
    it('should get customer preferences successfully', async () => {
      const mockPreferences = {
        customer_id: '1',
        dietary_restrictions: ['vegan'],
        allergies: ['nuts'],
        favorite_cuisines: ['italian'],
        disliked_items: [],
        special_requests: ['no ice']
      }

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPreferences, error: null })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const result = await getCustomerPreferences('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('customer_preferences')
      expect(mockFromChain.select).toHaveBeenCalledWith('*')
      expect(mockFromChain.eq).toHaveBeenCalledWith('customer_id', '1')
      expect(result).toEqual(mockPreferences)
    })

    it('should return null when no preferences found', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116' } // Not found error
        })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      const result = await getCustomerPreferences('1')
      expect(result).toBeNull()
    })

    it('should handle preferences fetch error', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'OTHER_ERROR', message: 'Database error' } 
        })
      }

      mockSupabase.from.mockReturnValue(mockFromChain)

      await expect(getCustomerPreferences('1')).rejects.toThrow('Failed to fetch customer preferences')
    })
  })
})