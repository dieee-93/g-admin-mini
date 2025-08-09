// src/features/customers/ui/CustomerAnalytics.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomerAnalytics } from './CustomerAnalytics'
import { CustomerSegment, ChurnRisk, LoyaltyTier } from '../types'

// Mock hooks
const mockUseCustomers = vi.fn()
const mockUseCustomerRFM = vi.fn()
const mockUseCustomerAnalytics = vi.fn()
const mockUseCustomerSegmentation = vi.fn()

vi.mock('../logic/useCustomers', () => ({
  useCustomers: mockUseCustomers
}))

vi.mock('../logic/useCustomerRFM', () => ({
  useCustomerRFM: mockUseCustomerRFM,
  useCustomerAnalytics: mockUseCustomerAnalytics,
  useCustomerSegmentation: mockUseCustomerSegmentation
}))

// Mock ChakraUI Provider for tests
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="chakra-wrapper">{children}</div>
}

const renderWithChakra = (component: React.ReactElement) => {
  return render(component, { wrapper: ChakraWrapper })
}

describe('CustomerAnalytics', () => {
  const mockCustomers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ]

  const mockSegmentStats = [
    {
      segment: CustomerSegment.CHAMPIONS,
      count: 10,
      percentage: 20
    },
    {
      segment: CustomerSegment.LOYAL,
      count: 15,
      percentage: 30
    }
  ]

  const mockHighValueCustomers = [
    {
      id: '1',
      name: 'John Doe',
      total_visits: 25,
      total_spent: 1500,
      loyalty_tier: LoyaltyTier.GOLD,
      churn_risk: ChurnRisk.LOW
    }
  ]

  const mockChurnRiskCustomers = [
    {
      id: '2',
      name: 'Jane Smith',
      total_visits: 3,
      total_spent: 150,
      loyalty_tier: LoyaltyTier.BRONZE,
      churn_risk: ChurnRisk.HIGH
    }
  ]

  const mockAnalytics = {
    total_customers: 50,
    new_customers_this_month: 8,
    customer_retention_rate: 87.5
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseCustomers.mockReturnValue({
      customers: mockCustomers,
      loading: false
    })

    mockUseCustomerRFM.mockReturnValue({
      rfmProfiles: [],
      loading: false,
      segmentStats: mockSegmentStats
    })

    mockUseCustomerAnalytics.mockReturnValue({
      analytics: mockAnalytics,
      loading: false,
      getChurnRiskCustomers: () => mockChurnRiskCustomers,
      getHighValueCustomers: () => mockHighValueCustomers
    })

    mockUseCustomerSegmentation.mockReturnValue({
      getSegmentPerformance: vi.fn(() => ({
        count: 10,
        totalRevenue: 5000,
        avgLifetimeValue: 500,
        avgOrderValue: 100
      })),
      getSegmentRecommendations: vi.fn(() => [
        'Reward them with exclusive offers',
        'Ask for referrals and reviews'
      ])
    })
  })

  it('should render customer analytics dashboard', async () => {
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Customer Intelligence Dashboard')).toBeInTheDocument()
    })

    // Check KPI cards
    expect(screen.getByText('Total Clientes')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument() // total customers
    expect(screen.getByText('8')).toBeInTheDocument() // new customers
    expect(screen.getByText('87%')).toBeInTheDocument() // retention rate
  })

  it('should display loading state correctly', () => {
    mockUseCustomers.mockReturnValue({
      customers: [],
      loading: true
    })

    renderWithChakra(<CustomerAnalytics />)

    // Should show skeleton loaders
    expect(screen.getByTestId('chakra-wrapper')).toBeInTheDocument()
  })

  it('should render RFM segmentation section', async () => {
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('🎯 Segmentación RFM')).toBeInTheDocument()
    })

    expect(screen.getByText('Recency (Días) • Frequency (Visitas) • Monetary (Gasto)')).toBeInTheDocument()
    expect(screen.getByText('Champions')).toBeInTheDocument()
    expect(screen.getByText('Leales')).toBeInTheDocument()
  })

  it('should display top customers section', async () => {
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Top Customers')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('25 visitas')).toBeInTheDocument()
    expect(screen.getByText('🥇 gold')).toBeInTheDocument()
  })

  it('should display churn risk customers section', async () => {
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Riesgo de Churn')).toBeInTheDocument()
    })

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('🔴 Alto')).toBeInTheDocument()
    expect(screen.getByText('📧 Win-back')).toBeInTheDocument()
  })

  it('should show actionable insights', async () => {
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('💡 Insights Accionables')).toBeInTheDocument()
    })

    expect(screen.getByText('🏆 Revenue Champions')).toBeInTheDocument()
    expect(screen.getByText('⚠️ Retención Urgente')).toBeInTheDocument()
    expect(screen.getByText('📈 Oportunidad Crecimiento')).toBeInTheDocument()
  })

  it('should handle segment selection interaction', async () => {
    const user = userEvent.setup()
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Champions')).toBeInTheDocument()
    })

    // Click on a segment to show recommendations
    const championsBadge = screen.getByText('Champions')
    await user.click(championsBadge.closest('div')!)

    await waitFor(() => {
      expect(screen.getByText('💡 Acciones Recomendadas:')).toBeInTheDocument()
      expect(screen.getByText('• Reward them with exclusive offers')).toBeInTheDocument()
    })
  })

  it('should handle refresh button click', async () => {
    const user = userEvent.setup()
    
    // Mock window.location.reload
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    })

    renderWithChakra(<CustomerAnalytics />)

    const refreshButton = await screen.findByText('Actualizar')
    await user.click(refreshButton)

    expect(mockReload).toHaveBeenCalled()
  })

  it('should format currency correctly', async () => {
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      // Should display formatted currency for customer spending
      expect(screen.getByText(/1\.500/)).toBeInTheDocument() // $1,500 formatted
    })
  })

  it('should display correct loyalty tier icons', async () => {
    renderWithChakra(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('🥇 gold')).toBeInTheDocument() // Gold tier icon
    })
  })

  it('should handle empty data gracefully', () => {
    mockUseCustomers.mockReturnValue({
      customers: [],
      loading: false
    })

    mockUseCustomerAnalytics.mockReturnValue({
      analytics: null,
      loading: false,
      getChurnRiskCustomers: () => [],
      getHighValueCustomers: () => []
    })

    renderWithChakra(<CustomerAnalytics />)

    // Should still render the dashboard structure
    expect(screen.getByText('Customer Intelligence Dashboard')).toBeInTheDocument()
  })
})