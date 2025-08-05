// src/features/customers/logic/useCustomerRFM.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCustomerRFM, useCustomerSegmentation } from './useCustomerRFM'
import { CustomerSegment, ChurnRisk } from '../types'

// Mock the API
vi.mock('../data/advancedCustomerApi', () => ({
  calculateCustomerRFM: vi.fn(),
  getCustomerAnalyticsDashboard: vi.fn(),
  getCustomerProfileWithRFM: vi.fn()
}))

describe('useCustomerRFM', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('RFM Calculation Logic', () => {
    it('should calculate correct recency scores', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { calculateRFMScores } = result.current

      // Test recency scoring (days since last visit)
      expect(calculateRFMScores.recency(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))).toBe(5) // 15 days ago
      expect(calculateRFMScores.recency(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000))).toBe(4) // 45 days ago
      expect(calculateRFMScores.recency(new Date(Date.now() - 75 * 24 * 60 * 60 * 1000))).toBe(3) // 75 days ago
      expect(calculateRFMScores.recency(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000))).toBe(2) // 120 days ago
      expect(calculateRFMScores.recency(new Date(Date.now() - 200 * 24 * 60 * 60 * 1000))).toBe(1) // 200 days ago
    })

    it('should calculate correct frequency scores', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { calculateRFMScores } = result.current

      // Test frequency scoring (number of visits)
      expect(calculateRFMScores.frequency(25)).toBe(5) // 25 visits
      expect(calculateRFMScores.frequency(15)).toBe(4) // 15 visits
      expect(calculateRFMScores.frequency(7)).toBe(3) // 7 visits
      expect(calculateRFMScores.frequency(3)).toBe(2) // 3 visits
      expect(calculateRFMScores.frequency(1)).toBe(1) // 1 visit
    })

    it('should calculate correct monetary scores', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { calculateRFMScores } = result.current

      // Test monetary scoring (total spent)
      expect(calculateRFMScores.monetary(1500)).toBe(5) // $1500
      expect(calculateRFMScores.monetary(750)).toBe(4) // $750
      expect(calculateRFMScores.monetary(300)).toBe(3) // $300
      expect(calculateRFMScores.monetary(100)).toBe(2) // $100
      expect(calculateRFMScores.monetary(25)).toBe(1) // $25
    })
  })

  describe('Customer Segmentation', () => {
    it('should determine Champions segment correctly', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { determineSegment } = result.current

      // Champions: 555, 554, 544, 545, 454, 455, 445
      expect(determineSegment(5, 5, 5)).toBe(CustomerSegment.CHAMPIONS)
      expect(determineSegment(5, 5, 4)).toBe(CustomerSegment.CHAMPIONS)
      expect(determineSegment(5, 4, 4)).toBe(CustomerSegment.CHAMPIONS)
      expect(determineSegment(4, 5, 5)).toBe(CustomerSegment.CHAMPIONS)
    })

    it('should determine Loyal segment correctly', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { determineSegment } = result.current

      // Loyal: 543, 444, 435, 355, 354, 345, 344, 335
      expect(determineSegment(5, 4, 3)).toBe(CustomerSegment.LOYAL)
      expect(determineSegment(4, 4, 4)).toBe(CustomerSegment.LOYAL)
      expect(determineSegment(3, 5, 5)).toBe(CustomerSegment.LOYAL)
    })

    it('should determine New Customers segment correctly', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { determineSegment } = result.current

      // New Customers: 5XX with low frequency
      expect(determineSegment(5, 1, 3)).toBe(CustomerSegment.NEW_CUSTOMERS)
      expect(determineSegment(5, 2, 2)).toBe(CustomerSegment.NEW_CUSTOMERS)
    })

    it('should determine Lost segment for lowest scores', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { determineSegment } = result.current

      // Lost: Very low scores across the board
      expect(determineSegment(1, 1, 1)).toBe(CustomerSegment.LOST)
    })
  })

  describe('Churn Risk Assessment', () => {
    it('should assess high churn risk correctly', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { assessChurnRisk } = result.current

      const highRiskProfile = {
        customer_id: '1',
        recency_score: 1,
        frequency_score: 1,
        monetary_score: 3,
        rfm_segment: CustomerSegment.LOST,
        lifetime_value: 100,
        avg_order_value: 50,
        visit_frequency: 0.1,
        churn_risk: ChurnRisk.HIGH,
        last_calculated_at: '2024-01-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      expect(assessChurnRisk(highRiskProfile)).toBe(ChurnRisk.HIGH)
    })

    it('should assess medium churn risk correctly', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { assessChurnRisk } = result.current

      const mediumRiskProfile = {
        customer_id: '1',
        recency_score: 2,
        frequency_score: 3,
        monetary_score: 3,
        rfm_segment: CustomerSegment.ABOUT_TO_SLEEP,
        lifetime_value: 200,
        avg_order_value: 75,
        visit_frequency: 0.5,
        churn_risk: ChurnRisk.MEDIUM,
        last_calculated_at: '2024-01-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      expect(assessChurnRisk(mediumRiskProfile)).toBe(ChurnRisk.MEDIUM)
    })

    it('should assess low churn risk correctly', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { assessChurnRisk } = result.current

      const lowRiskProfile = {
        customer_id: '1',
        recency_score: 5,
        frequency_score: 5,
        monetary_score: 5,
        rfm_segment: CustomerSegment.CHAMPIONS,
        lifetime_value: 1000,
        avg_order_value: 150,
        visit_frequency: 2,
        churn_risk: ChurnRisk.LOW,
        last_calculated_at: '2024-01-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      expect(assessChurnRisk(lowRiskProfile)).toBe(ChurnRisk.LOW)
    })
  })

  describe('Customer Lifetime Value', () => {
    it('should calculate CLV correctly', () => {
      const { result } = renderHook(() => useCustomerRFM())
      const { calculateCLV } = result.current

      // CLV = avgOrderValue * visitFrequency * customerLifespan
      expect(calculateCLV(100, 2, 12)).toBe(2400) // $100 * 2 visits/month * 12 months
      expect(calculateCLV(50, 1, 6)).toBe(300) // $50 * 1 visit/month * 6 months
    })
  })
})

describe('useCustomerSegmentation', () => {
  const mockRFMProfiles = [
    {
      customer_id: '1',
      recency_score: 5,
      frequency_score: 5,
      monetary_score: 5,
      rfm_segment: CustomerSegment.CHAMPIONS,
      lifetime_value: 1000,
      avg_order_value: 200,
      visit_frequency: 2,
      churn_risk: ChurnRisk.LOW,
      last_calculated_at: '2024-01-01',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      customer_id: '2',
      recency_score: 1,
      frequency_score: 1,
      monetary_score: 1,
      rfm_segment: CustomerSegment.LOST,
      lifetime_value: 50,
      avg_order_value: 25,
      visit_frequency: 0.1,
      churn_risk: ChurnRisk.HIGH,
      last_calculated_at: '2024-01-01',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ]

  it('should provide correct segment recommendations', () => {
    const { result } = renderHook(() => useCustomerSegmentation())
    const { getSegmentRecommendations } = result.current

    const championRecommendations = getSegmentRecommendations(CustomerSegment.CHAMPIONS)
    expect(championRecommendations).toContain('Reward them with exclusive offers')
    expect(championRecommendations).toContain('Ask for referrals and reviews')

    const atRiskRecommendations = getSegmentRecommendations(CustomerSegment.AT_RISK)
    expect(atRiskRecommendations).toContain('Send personalized win-back campaigns')
    expect(atRiskRecommendations).toContain('Offer limited-time discounts')

    const newCustomerRecommendations = getSegmentRecommendations(CustomerSegment.NEW_CUSTOMERS)
    expect(newCustomerRecommendations).toContain('Send welcome series')
    expect(newCustomerRecommendations).toContain('Offer onboarding incentives')
  })
})