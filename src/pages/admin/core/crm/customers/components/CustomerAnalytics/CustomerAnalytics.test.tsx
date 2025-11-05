// src/features/customers/ui/CustomerAnalytics.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomerAnalytics } from './CustomerAnalytics'
import { CustomerSegment, ChurnRisk, LoyaltyTier } from '../../types'

import { Provider } from '@/shared/ui/provider'
import { useThemeStore } from '@/store/themeStore'

// Mock functions will be configured in individual tests as needed

vi.mock('../hooks/useCustomers', () => ({
  useCustomers: vi.fn(),
}));

vi.mock('../hooks/useCustomerRFM', () => ({
  useCustomerRFM: vi.fn(),
  useCustomerAnalytics: vi.fn(),
  useCustomerSegmentation: vi.fn(),
}));

vi.mock('@/store/themeStore')

const renderWithDesignSystem = (component: React.ReactElement) => {
  (useThemeStore as vi.Mock).mockReturnValue({
    currentTheme: { id: 'light', name: 'Light' },
  });
  return render(component, { wrapper: Provider })
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

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked functions directly from the modules
    const { useCustomers } = await import('../hooks/useCustomers')
    const { useCustomerRFM, useCustomerAnalytics, useCustomerSegmentation } = await import('../hooks/useCustomerRFM')
    
    ;(useCustomers as vi.Mock).mockReturnValue({
      customers: mockCustomers,
      loading: false
    })

    ;(useCustomerRFM as vi.Mock).mockReturnValue({
      rfmProfiles: [],
      loading: false,
      segmentStats: mockSegmentStats
    })

    ;(useCustomerAnalytics as vi.Mock).mockReturnValue({
      analytics: mockAnalytics,
      loading: false,
      getChurnRiskCustomers: mockChurnRiskCustomers,
      getHighValueCustomers: mockHighValueCustomers
    })

    ;(useCustomerSegmentation as vi.Mock).mockReturnValue({
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
    renderWithDesignSystem(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Customer Intelligence Dashboard')).toBeInTheDocument()
    })

    // Check KPI cards
    expect(screen.getByText('Total Clientes')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument() // total customers
    expect(screen.getByText('8')).toBeInTheDocument() // new customers
    expect(screen.getByText('88%')).toBeInTheDocument() // retention rate (87.5 rounded)
  })

  it('should display loading state correctly', async () => {
    const { useCustomers } = await import('../hooks/useCustomers')
    ;(useCustomers as vi.Mock).mockReturnValue({
      customers: [],
      loading: true
    })

    const { container } = renderWithDesignSystem(<CustomerAnalytics />)

    // Should show loading skeleton
    const skeletonElements = container.querySelectorAll('div[style*="background-color: var(--bg-subtle)"]')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('should render RFM segmentation section', async () => {
    renderWithDesignSystem(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('🎯 Segmentación RFM')).toBeInTheDocument()
    })

    expect(screen.getByText('Recency (Días) • Frequency (Visitas) • Monetary (Gasto)')).toBeInTheDocument()
    expect(screen.getByText('Champions')).toBeInTheDocument()
    expect(screen.getByText('Leales')).toBeInTheDocument()
  })

  it('should display top customers section', async () => {
    renderWithDesignSystem(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Top Customers')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('25 visitas')).toBeInTheDocument()
    expect(screen.getByText('🥇 gold')).toBeInTheDocument()
  })

  it('should display churn risk customers section', async () => {
    renderWithDesignSystem(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('Riesgo de Churn')).toBeInTheDocument()
    })

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('🔴 Alto')).toBeInTheDocument()
    expect(screen.getByText('📧 Win-back')).toBeInTheDocument()
  })

  it('should show actionable insights', async () => {
    renderWithDesignSystem(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('💡 Insights Accionables')).toBeInTheDocument()
    })

    expect(screen.getByText('🏆 Revenue Champions')).toBeInTheDocument()
    expect(screen.getByText('⚠️ Retención Urgente')).toBeInTheDocument()
    expect(screen.getByText('📈 Oportunidad Crecimiento')).toBeInTheDocument()
  })

  it('should handle segment selection interaction', async () => {
    const user = userEvent.setup()
    renderWithDesignSystem(<CustomerAnalytics />)

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

    renderWithDesignSystem(<CustomerAnalytics />)

    const refreshButton = await screen.findByText('🔄 Actualizar')
    await user.click(refreshButton)

    expect(mockReload).toHaveBeenCalled()
  })

  it('should render without errors', () => {
    // This test ensures basic functionality works
    // Since detailed customer sections depend on complex data flow,
    // we focus on main dashboard rendering
    const { container } = renderWithDesignSystem(<CustomerAnalytics />)
    expect(container).toBeInTheDocument()
  })

  it('should display correct loyalty tier icons', async () => {
    renderWithDesignSystem(<CustomerAnalytics />)

    await waitFor(() => {
      expect(screen.getByText('🥇 gold')).toBeInTheDocument() // Gold tier icon
    })
  })

  it('should handle empty data gracefully', async () => {
    const { useCustomers } = await import('../hooks/useCustomers')
    const { useCustomerAnalytics } = await import('../hooks/useCustomerRFM')
    
    ;(useCustomers as vi.Mock).mockReturnValue({
      customers: [],
      loading: false
    })

    ;(useCustomerAnalytics as vi.Mock).mockReturnValue({
      analytics: null,
      loading: false,
      getChurnRiskCustomers: [],
      getHighValueCustomers: []
    })

    renderWithDesignSystem(<CustomerAnalytics />)

    // Should still render the dashboard structure
    expect(screen.getByText('Customer Intelligence Dashboard')).toBeInTheDocument()
  })
})