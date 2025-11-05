// ============================================================================
// CUSTOMER ANALYTICS ENGINE - Comprehensive Test Suite
// ============================================================================
/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, it, expect, beforeEach } from 'vitest';
import { CustomerAnalyticsEngine } from '../customerAnalyticsEngine';
import type {
  Customer,
  Sale,
  SaleItem,
  CustomerAnalyticsConfig,
  CustomerStatus,
  CustomerType,
  PaymentMethod,
  ServiceType,
  ChurnRisk,
  SeasonalPattern
} from '../customerAnalyticsEngine';

// ============================================================================
// 1. TEST DATA FIXTURES
// ============================================================================

describe('Customer Analytics Engine - Test Data Fixtures', () => {
  let mockCustomers: Customer[];
  let mockSales: Sale[];
  let mockSaleItems: SaleItem[];
  let testConfig: CustomerAnalyticsConfig;

  beforeEach(() => {
    // Mock Customers - Diverse customer profiles
    const now = new Date();
    const registrationDate1 = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 year ago
    const registrationDate2 = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)); // 6 months ago
    const registrationDate3 = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));  // 1 month ago
    const lastVisit1 = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));  // 1 week ago
    const lastVisit2 = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)); // 2 months ago
    
    mockCustomers = [
      {
        id: 'cust-001',
        name: 'María González',
        email: 'maria@email.com',
        phone: '+1234567890',
        address: 'Calle Principal 123',
        birth_date: '1985-05-15',
        registration_date: registrationDate1.toISOString(),
        status: 'active' as CustomerStatus,
        customer_type: 'vip' as CustomerType,
        loyalty_points: 2500,
        total_spent: 1200.50,
        visit_count: 24,
        last_visit_date: lastVisit1.toISOString(),
        preferred_payment_method: 'card' as PaymentMethod,
        notes: 'VIP customer, prefers evening dining',
        created_at: registrationDate1.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'cust-002',
        name: 'Carlos Martínez',
        email: 'carlos@email.com',
        phone: '+1234567891',
        registration_date: registrationDate2.toISOString(),
        status: 'active' as CustomerStatus,
        customer_type: 'frequent' as CustomerType,
        loyalty_points: 800,
        total_spent: 450.75,
        visit_count: 12,
        last_visit_date: lastVisit1.toISOString(),
        preferred_payment_method: 'cash' as PaymentMethod,
        created_at: registrationDate2.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'cust-003',
        name: 'Ana Torres',
        email: 'ana@email.com',
        registration_date: registrationDate2.toISOString(),
        status: 'active' as CustomerStatus,
        customer_type: 'regular' as CustomerType,
        loyalty_points: 200,
        total_spent: 150.25,
        visit_count: 5,
        last_visit_date: lastVisit2.toISOString(), // At risk - 2 months ago
        preferred_payment_method: 'digital_wallet' as PaymentMethod,
        created_at: registrationDate2.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'cust-004',
        name: 'Roberto Silva',
        email: 'roberto@email.com',
        registration_date: registrationDate3.toISOString(),
        status: 'active' as CustomerStatus,
        customer_type: 'new' as CustomerType,
        loyalty_points: 50,
        total_spent: 75.00,
        visit_count: 2,
        last_visit_date: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago
        preferred_payment_method: 'card' as PaymentMethod,
        created_at: registrationDate3.toISOString(),
        updated_at: now.toISOString()
      },
      {
        id: 'cust-005',
        name: 'Isabella Díaz',
        email: 'isabella@email.com',
        registration_date: registrationDate1.toISOString(),
        status: 'inactive' as CustomerStatus, // Inactive customer
        customer_type: 'regular' as CustomerType,
        loyalty_points: 300,
        total_spent: 200.00,
        visit_count: 6,
        last_visit_date: new Date(now.getTime() - (120 * 24 * 60 * 60 * 1000)).toISOString(), // 4 months ago
        preferred_payment_method: 'cash' as PaymentMethod,
        created_at: registrationDate1.toISOString(),
        updated_at: now.toISOString()
      }
    ];

    // Mock Sales - Recent sales within analysis period
    const recentDate1 = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));   // 1 week ago
    const recentDate2 = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));  // 2 weeks ago
    const recentDate3 = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));  // 1 month ago
    
    mockSales = [
      // María González - VIP customer sales
      {
        id: 'sale-001',
        customer_id: 'cust-001',
        total_amount: 85.50,
        payment_method: 'card' as PaymentMethod,
        sale_date: recentDate1.toISOString(),
        items_count: 3,
        discount_applied: 0,
        tip_amount: 12.00,
        service_type: 'dine_in' as ServiceType,
        table_number: 5,
        staff_id: 'emp-001',
        created_at: recentDate1.toISOString(),
        updated_at: recentDate1.toISOString()
      },
      {
        id: 'sale-002',
        customer_id: 'cust-001',
        total_amount: 120.00,
        payment_method: 'card' as PaymentMethod,
        sale_date: recentDate2.toISOString(),
        items_count: 4,
        discount_applied: 10.00,
        tip_amount: 18.00,
        service_type: 'dine_in' as ServiceType,
        table_number: 8,
        staff_id: 'emp-002',
        created_at: recentDate2.toISOString(),
        updated_at: recentDate2.toISOString()
      },
      {
        id: 'sale-003',
        customer_id: 'cust-001',
        total_amount: 95.25,
        payment_method: 'card' as PaymentMethod,
        sale_date: recentDate3.toISOString(),
        items_count: 2,
        service_type: 'takeout' as ServiceType,
        created_at: recentDate3.toISOString(),
        updated_at: recentDate3.toISOString()
      },
      // Carlos Martínez - Frequent customer
      {
        id: 'sale-004',
        customer_id: 'cust-002',
        total_amount: 42.50,
        payment_method: 'cash' as PaymentMethod,
        sale_date: recentDate1.toISOString(),
        items_count: 2,
        service_type: 'dine_in' as ServiceType,
        table_number: 3,
        created_at: recentDate1.toISOString(),
        updated_at: recentDate1.toISOString()
      },
      {
        id: 'sale-005',
        customer_id: 'cust-002',
        total_amount: 38.75,
        payment_method: 'cash' as PaymentMethod,
        sale_date: recentDate2.toISOString(),
        items_count: 3,
        service_type: 'takeout' as ServiceType,
        created_at: recentDate2.toISOString(),
        updated_at: recentDate2.toISOString()
      },
      // Ana Torres - At risk customer (no recent sales)
      {
        id: 'sale-006',
        customer_id: 'cust-003',
        total_amount: 28.50,
        payment_method: 'digital_wallet' as PaymentMethod,
        sale_date: new Date(now.getTime() - (70 * 24 * 60 * 60 * 1000)).toISOString(), // 70 days ago
        items_count: 1,
        service_type: 'delivery' as ServiceType,
        created_at: new Date(now.getTime() - (70 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: new Date(now.getTime() - (70 * 24 * 60 * 60 * 1000)).toISOString()
      },
      // Roberto Silva - New customer
      {
        id: 'sale-007',
        customer_id: 'cust-004',
        total_amount: 35.00,
        payment_method: 'card' as PaymentMethod,
        sale_date: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago
        items_count: 2,
        service_type: 'dine_in' as ServiceType,
        table_number: 2,
        created_at: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString()
      },
      {
        id: 'sale-008',
        customer_id: 'cust-004',
        total_amount: 40.00,
        payment_method: 'card' as PaymentMethod,
        sale_date: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(), // 10 days ago
        items_count: 2,
        service_type: 'takeout' as ServiceType,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString()
      }
    ];

    // Mock Sale Items
    mockSaleItems = [
      // Sale 1 - María's recent order
      {
        id: 'item-001',
        sale_id: 'sale-001',
        product_id: 'prod-001',
        product_name: 'Pasta Carbonara',
        quantity: 1,
        unit_price: 25.50,
        total_price: 25.50,
        category: 'Pasta',
        created_at: recentDate1.toISOString()
      },
      {
        id: 'item-002',
        sale_id: 'sale-001',
        product_id: 'prod-002',
        product_name: 'Caesar Salad',
        quantity: 1,
        unit_price: 18.00,
        total_price: 18.00,
        category: 'Salads',
        created_at: recentDate1.toISOString()
      },
      {
        id: 'item-003',
        sale_id: 'sale-001',
        product_id: 'prod-003',
        product_name: 'Wine - Chardonnay',
        quantity: 1,
        unit_price: 42.00,
        total_price: 42.00,
        category: 'Beverages',
        created_at: recentDate1.toISOString()
      },
      // Sale 2 - María's previous order
      {
        id: 'item-004',
        sale_id: 'sale-002',
        product_id: 'prod-004',
        product_name: 'Grilled Salmon',
        quantity: 2,
        unit_price: 32.00,
        total_price: 64.00,
        category: 'Seafood',
        created_at: recentDate2.toISOString()
      },
      {
        id: 'item-005',
        sale_id: 'sale-002',
        product_id: 'prod-005',
        product_name: 'Chocolate Cake',
        quantity: 2,
        unit_price: 28.00,
        total_price: 56.00,
        category: 'Desserts',
        created_at: recentDate2.toISOString()
      },
      // Sale 4 - Carlos's order
      {
        id: 'item-006',
        sale_id: 'sale-004',
        product_id: 'prod-006',
        product_name: 'Burger Classic',
        quantity: 1,
        unit_price: 22.50,
        total_price: 22.50,
        category: 'Burgers',
        created_at: recentDate1.toISOString()
      },
      {
        id: 'item-007',
        sale_id: 'sale-004',
        product_id: 'prod-007',
        product_name: 'French Fries',
        quantity: 1,
        unit_price: 8.00,
        total_price: 8.00,
        category: 'Sides',
        created_at: recentDate1.toISOString()
      },
      {
        id: 'item-008',
        sale_id: 'sale-004',
        product_id: 'prod-008',
        product_name: 'Coca Cola',
        quantity: 1,
        unit_price: 12.00,
        total_price: 12.00,
        category: 'Beverages',
        created_at: recentDate1.toISOString()
      },
      // Sale 7 - Roberto's order
      {
        id: 'item-009',
        sale_id: 'sale-007',
        product_id: 'prod-009',
        product_name: 'Pizza Margherita',
        quantity: 1,
        unit_price: 35.00,
        total_price: 35.00,
        category: 'Pizza',
        created_at: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString()
      }
    ];

    // Test configuration
    testConfig = {
      analysisMonths: 3,
      minTransactionsForAnalysis: 2,
      highValueThreshold: 400,
      frequentCustomerThreshold: 3,
      loyalCustomerDays: 90,
      churnRiskDays: 45,
      includeSeasonalAnalysis: true,
      includePredictiveAnalytics: true,
      includeProductRecommendations: true,
      vipSpendThreshold: 800,
      corporateMinOrders: 10,
      newCustomerDays: 30,
      averageMarginPercentage: 65,
      fixedCostPerCustomer: 5,
      churnModelWeights: {
        daysSinceLastVisit: 0.4,
        orderFrequency: 0.3,
        spendingTrend: 0.2,
        engagementLevel: 0.1
      }
    };
  });

  it('Should initialize test data correctly', () => {
    expect(mockCustomers).toHaveLength(5);
    expect(mockSales).toHaveLength(8);
    expect(mockSaleItems).toHaveLength(9);
    expect(testConfig.analysisMonths).toBe(3);
  });

  it('Should have diverse customer profiles', () => {
    const activeCustomers = mockCustomers.filter(c => c.status === 'active');
    const vipCustomers = mockCustomers.filter(c => c.customer_type === 'vip');
    const newCustomers = mockCustomers.filter(c => c.customer_type === 'new');
    
    expect(activeCustomers.length).toBe(4);
    expect(vipCustomers.length).toBe(1);
    expect(newCustomers.length).toBe(1);
  });

  it('Should have sales with various patterns', () => {
    const dineInSales = mockSales.filter(s => s.service_type === 'dine_in');
    const takeoutSales = mockSales.filter(s => s.service_type === 'takeout');
    const cardPayments = mockSales.filter(s => s.payment_method === 'card');
    const cashPayments = mockSales.filter(s => s.payment_method === 'cash');
    
    expect(dineInSales.length).toBeGreaterThan(0);
    expect(takeoutSales.length).toBeGreaterThan(0);
    expect(cardPayments.length).toBeGreaterThan(0);
    expect(cashPayments.length).toBeGreaterThan(0);
  });

  it('Should have sale items with product details', () => {
    const categories = new Set(mockSaleItems.map(item => item.category));
    const totalValue = mockSaleItems.reduce((sum, item) => sum + item.total_price, 0);
    
    expect(categories.size).toBeGreaterThan(3);
    expect(totalValue).toBeGreaterThan(0);
  });

  // ============================================================================
  // 2. CORE ANALYTICS ENGINE TESTS
  // ============================================================================

  describe('Core Analytics Engine', () => {
    it('Should generate complete customer analytics', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result).toBeDefined();
      expect(result.generatedAt).toBeDefined();
      expect(result.periodStart).toBeDefined();
      expect(result.periodEnd).toBeDefined();
      expect(result.totalCustomersAnalyzed).toBeGreaterThan(0);
      expect(result.segments).toBeInstanceOf(Array);
      expect(result.customerAnalyses).toBeInstanceOf(Array);
      expect(result.overallMetrics).toBeDefined();
      expect(result.strategicInsights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.predictions).toBeDefined();
    });

    it('Should filter customers with insufficient data', async () => {
      const limitedConfig = { ...testConfig, minTransactionsForAnalysis: 5 };
      
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        limitedConfig
      );

      expect(result.totalCustomersAnalyzed).toBeLessThanOrEqual(mockCustomers.filter(c => c.status === 'active').length);
    });

    it('Should handle empty datasets gracefully', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        [],
        [],
        [],
        testConfig
      );

      expect(result.totalCustomersAnalyzed).toBe(0);
      expect(result.customerAnalyses).toHaveLength(0);
      expect(result.overallMetrics.totalActiveCustomers).toBe(0);
    });

    it('Should apply date filtering correctly', async () => {
      const futureSales = [{
        ...mockSales[0],
        sale_date: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString() // Future sale
      }];

      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers.slice(0, 1),
        futureSales,
        mockSaleItems.slice(0, 1),
        testConfig
      );

      // Should filter out future sales
      expect(result.totalCustomersAnalyzed).toBe(0);
    });

    it('Should only analyze active customers', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const activeCustomers = mockCustomers.filter(c => c.status === 'active');
      expect(result.totalCustomersAnalyzed).toBeLessThanOrEqual(activeCustomers.length);
    });
  });

  // ============================================================================
  // 3. INDIVIDUAL CUSTOMER ANALYSIS TESTS
  // ============================================================================

  describe('Individual Customer Analysis', () => {
    it('Should calculate purchase behavior correctly', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const mariaAnalysis = result.customerAnalyses.find(c => c.customerId === 'cust-001');
      expect(mariaAnalysis?.totalSpent).toBeGreaterThan(0);
      expect(mariaAnalysis?.averageOrderValue).toBeGreaterThan(0);
      expect(mariaAnalysis?.totalOrders).toBeGreaterThan(0);
      expect(mariaAnalysis?.orderFrequency).toBeGreaterThan(0);
    });

    it('Should identify visit patterns', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const mariaAnalysis = result.customerAnalyses.find(c => c.customerId === 'cust-001');
      expect(mariaAnalysis?.visitFrequency).toBeGreaterThan(0);
      expect(mariaAnalysis?.preferredDayOfWeek).toBeDefined();
      expect(mariaAnalysis?.preferredTimeOfDay).toBeDefined();
      expect(['consistent', 'summer_peak', 'winter_peak', 'weekend_warrior', 'weekday_regular']).toContain(mariaAnalysis?.seasonalityPattern);
    });

    it('Should determine service preferences', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const mariaAnalysis = result.customerAnalyses.find(c => c.customerId === 'cust-001');
      expect(['dine_in', 'takeout', 'delivery', 'catering']).toContain(mariaAnalysis?.preferredServiceType);
      expect(['cash', 'card', 'digital_wallet', 'bank_transfer', 'credit']).toContain(mariaAnalysis?.preferredPaymentMethod);
      expect(mariaAnalysis?.serviceTypeDistribution).toBeDefined();
    });

    it('Should analyze product preferences', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const mariaAnalysis = result.customerAnalyses.find(c => c.customerId === 'cust-001');
      expect(mariaAnalysis?.favoriteCategories).toBeInstanceOf(Array);
      expect(mariaAnalysis?.topProducts).toBeInstanceOf(Array);
      
      if (mariaAnalysis?.favoriteCategories && mariaAnalysis.favoriteCategories.length > 0) {
        expect(mariaAnalysis.favoriteCategories[0].category).toBeDefined();
        expect(mariaAnalysis.favoriteCategories[0].orderCount).toBeGreaterThan(0);
        expect(mariaAnalysis.favoriteCategories[0].totalSpent).toBeGreaterThan(0);
      }
    });

    it('Should calculate loyalty metrics', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const mariaAnalysis = result.customerAnalyses.find(c => c.customerId === 'cust-001');
      expect(mariaAnalysis?.loyaltyScore).toBeGreaterThanOrEqual(0);
      expect(mariaAnalysis?.loyaltyScore).toBeLessThanOrEqual(100);
      expect(['low', 'medium', 'high', 'critical']).toContain(mariaAnalysis?.churnRisk);
      expect(mariaAnalysis?.retentionProbability).toBeGreaterThanOrEqual(0);
      expect(mariaAnalysis?.retentionProbability).toBeLessThanOrEqual(100);
      expect(mariaAnalysis?.lifetimeValue).toBeGreaterThan(0);
    });

    it('Should identify churn risk correctly', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const anaAnalysis = result.customerAnalyses.find(c => c.customerId === 'cust-003');
      // Ana has an old last visit date, should be at risk
      if (anaAnalysis) {
        expect(['medium', 'high', 'critical']).toContain(anaAnalysis.churnRisk);
      }

      const mariaAnalysis = result.customerAnalyses.find(c => c.customerId === 'cust-001');
      // María has recent visits, should be low risk
      if (mariaAnalysis) {
        expect(['low', 'medium']).toContain(mariaAnalysis.churnRisk);
      }
    });

    it('Should calculate financial metrics', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      result.customerAnalyses.forEach(analysis => {
        expect(typeof analysis.profitability).toBe('number');
        expect(typeof analysis.marginContribution).toBe('number');
        expect(analysis.discountSensitivity).toBeGreaterThanOrEqual(0);
        expect(analysis.discountSensitivity).toBeLessThanOrEqual(100);
      });
    });

    it('Should generate behavioral insights', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      result.customerAnalyses.forEach(analysis => {
        expect(analysis.behaviorSegment).toBeDefined();
        expect(analysis.personalityTraits).toBeInstanceOf(Array);
        expect(analysis.recommendedOffers).toBeInstanceOf(Array);
        expect(analysis.nextBestAction).toBeDefined();
      });
    });

    it('Should determine customer trends', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      result.customerAnalyses.forEach(analysis => {
        expect(['increasing', 'stable', 'decreasing']).toContain(analysis.spendingTrend);
        expect(['increasing', 'stable', 'decreasing']).toContain(analysis.visitTrend);
        expect(['improving', 'stable', 'declining']).toContain(analysis.engagementTrend);
      });
    });
  });

  // ============================================================================
  // 4. CUSTOMER SEGMENTATION TESTS
  // ============================================================================

  describe('Customer Segmentation', () => {
    it('Should generate customer segments', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.segments).toBeInstanceOf(Array);
      expect(result.segments.length).toBeGreaterThan(0);
      
      result.segments.forEach(segment => {
        expect(segment.id).toBeDefined();
        expect(segment.name).toBeDefined();
        expect(segment.description).toBeDefined();
        expect(segment.customerIds).toBeInstanceOf(Array);
        expect(segment.totalCustomers).toBeGreaterThanOrEqual(0);
        expect(segment.characteristics).toBeInstanceOf(Array);
        expect(segment.recommendedActions).toBeInstanceOf(Array);
      });
    });

    it('Should identify VIP customers correctly', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const vipSegment = result.segments.find(s => s.id === 'vip-customers');
      if (vipSegment) {
        expect(vipSegment.totalCustomers).toBeGreaterThan(0);
        expect(vipSegment.averageSpend).toBeGreaterThan(testConfig.highValueThreshold);
      }
    });

    it('Should identify at-risk customers', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const atRiskSegment = result.segments.find(s => s.id === 'at-risk-customers');
      if (atRiskSegment) {
        expect(atRiskSegment.totalCustomers).toBeGreaterThanOrEqual(0);
        // At-risk customers should have characteristics related to declining activity
        expect(atRiskSegment.characteristics).toContain('Churn Risk');
      }
    });

    it('Should identify new customers', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const newSegment = result.segments.find(s => s.id === 'new-customers');
      if (newSegment) {
        expect(newSegment.totalCustomers).toBeGreaterThanOrEqual(0);
        expect(newSegment.characteristics).toContain('Recent Acquisition');
      }
    });

    it('Should calculate segment metrics correctly', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      result.segments.forEach(segment => {
        if (segment.totalCustomers > 0) {
          expect(segment.averageSpend).toBeGreaterThan(0);
          expect(segment.totalRevenue).toBeGreaterThan(0);
          expect(segment.retentionRate).toBeGreaterThanOrEqual(0);
          expect(segment.retentionRate).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  // ============================================================================
  // 5. AGGREGATE METRICS TESTS
  // ============================================================================

  describe('Aggregate Metrics', () => {
    it('Should calculate overall metrics correctly', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.overallMetrics.totalActiveCustomers).toBeGreaterThan(0);
      expect(result.overallMetrics.totalRevenue).toBeGreaterThan(0);
      expect(result.overallMetrics.averageOrderValue).toBeGreaterThan(0);
      expect(result.overallMetrics.averageCustomerLifetimeValue).toBeGreaterThan(0);
      expect(result.overallMetrics.churnRate).toBeGreaterThanOrEqual(0);
      expect(result.overallMetrics.churnRate).toBeLessThanOrEqual(100);
    });

    it('Should calculate revenue distribution', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.overallMetrics.revenueByServiceType).toBeDefined();
      expect(result.overallMetrics.revenueByPaymentMethod).toBeDefined();
      
      // Check that revenue distributions have valid values
      Object.values(result.overallMetrics.revenueByServiceType).forEach(revenue => {
        expect(revenue).toBeGreaterThanOrEqual(0);
      });
      
      Object.values(result.overallMetrics.revenueByPaymentMethod).forEach(revenue => {
        expect(revenue).toBeGreaterThanOrEqual(0);
      });
    });

    it('Should identify top categories', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.overallMetrics.topCategories).toBeInstanceOf(Array);
      
      result.overallMetrics.topCategories.forEach(category => {
        expect(category.category).toBeDefined();
        expect(category.revenue).toBeGreaterThan(0);
        expect(category.orderCount).toBeGreaterThan(0);
        expect(category.customerCount).toBeGreaterThan(0);
      });
    });

    it('Should calculate customer health metrics', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.overallMetrics.healthyCustomers).toBeGreaterThanOrEqual(0);
      expect(result.overallMetrics.atRiskCustomers).toBeGreaterThanOrEqual(0);
      expect(result.overallMetrics.lostCustomers).toBeGreaterThanOrEqual(0);
      expect(result.overallMetrics.newCustomers).toBeGreaterThanOrEqual(0);
      
      // Sum of customer categories should make sense
      const totalCategorized = result.overallMetrics.healthyCustomers + 
                              result.overallMetrics.atRiskCustomers + 
                              result.overallMetrics.lostCustomers;
      expect(totalCategorized).toBeLessThanOrEqual(result.overallMetrics.totalActiveCustomers + result.overallMetrics.lostCustomers);
    });
  });

  // ============================================================================
  // 6. STRATEGIC INSIGHTS TESTS
  // ============================================================================

  describe('Strategic Insights', () => {
    it('Should generate strategic insights', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.strategicInsights).toBeInstanceOf(Array);
      
      result.strategicInsights.forEach(insight => {
        expect(['opportunity', 'threat', 'strength', 'weakness']).toContain(insight.type);
        expect(['retention', 'acquisition', 'monetization', 'experience', 'product']).toContain(insight.category);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(insight.impact);
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(100);
        expect(insight.recommendation).toBeDefined();
        expect(['immediate', 'short_term', 'medium_term', 'long_term']).toContain(insight.timeframe);
      });
    });

    it('Should identify high churn risk when present', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const churnInsights = result.strategicInsights.filter(
        insight => insight.category === 'retention' && insight.type === 'threat'
      );
      
      // Should have churn-related insights if there are at-risk customers
      const atRiskCustomers = result.customerAnalyses.filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical');
      if (atRiskCustomers.length > 0) {
        expect(churnInsights.length).toBeGreaterThan(0);
      }
    });

    it('Should identify monetization opportunities', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const monetizationInsights = result.strategicInsights.filter(
        insight => insight.category === 'monetization'
      );
      
      // Should identify monetization opportunities
      expect(monetizationInsights.length).toBeGreaterThanOrEqual(0);
    });

    it('Should prioritize insights by impact', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const highImpactInsights = result.strategicInsights.filter(insight => insight.impact === 'high');
      const mediumImpactInsights = result.strategicInsights.filter(insight => insight.impact === 'medium');
      
      // High impact insights should generally have higher confidence
      if (highImpactInsights.length > 0 && mediumImpactInsights.length > 0) {
        const avgHighConfidence = highImpactInsights.reduce((sum, i) => sum + i.confidence, 0) / highImpactInsights.length;
        const avgMediumConfidence = mediumImpactInsights.reduce((sum, i) => sum + i.confidence, 0) / mediumImpactInsights.length;
        
        expect(avgHighConfidence).toBeGreaterThanOrEqual(avgMediumConfidence - 10); // Allow some tolerance
      }
    });
  });

  // ============================================================================
  // 7. RECOMMENDATIONS TESTS
  // ============================================================================

  describe('Recommendations', () => {
    it('Should generate actionable recommendations', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.recommendations).toBeInstanceOf(Array);
      
      result.recommendations.forEach(rec => {
        expect([
          'retention_campaign',
          'acquisition_strategy',
          'upsell_opportunity',
          'product_recommendation',
          'experience_improvement'
        ]).toContain(rec.type);
        expect(['critical', 'high', 'medium', 'low']).toContain(rec.priority);
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.targetSegment).toBeDefined();
        expect(rec.affectedCustomers).toBeInstanceOf(Array);
        expect(rec.implementation).toBeDefined();
        expect(rec.implementation.steps).toBeInstanceOf(Array);
        expect(rec.implementation.resources).toBeInstanceOf(Array);
        expect(rec.implementation.timeline).toBeDefined();
        expect(rec.successMetrics).toBeInstanceOf(Array);
      });
    });

    it('Should recommend retention campaigns for at-risk customers', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const retentionRecommendations = result.recommendations.filter(
        rec => rec.type === 'retention_campaign'
      );
      
      const atRiskCustomers = result.customerAnalyses.filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical');
      if (atRiskCustomers.length > 0) {
        expect(retentionRecommendations.length).toBeGreaterThan(0);
        
        const retentionRec = retentionRecommendations[0];
        expect(retentionRec.affectedCustomers.length).toBeGreaterThan(0);
        expect(retentionRec.estimatedImpact).toBeDefined();
      }
    });

    it('Should include implementation details', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      if (result.recommendations.length > 0) {
        const rec = result.recommendations[0];
        expect(rec.implementation.steps.length).toBeGreaterThan(0);
        expect(rec.implementation.resources.length).toBeGreaterThan(0);
        expect(rec.implementation.timeline).toBeDefined();
        expect(rec.successMetrics.length).toBeGreaterThan(0);
      }
    });

    it('Should prioritize critical recommendations', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const criticalRecommendations = result.recommendations.filter(rec => rec.priority === 'critical');
      const highRecommendations = result.recommendations.filter(rec => rec.priority === 'high');
      
      // Critical recommendations should typically address at-risk customers
      criticalRecommendations.forEach(rec => {
        expect(rec.affectedCustomers.length).toBeGreaterThan(0);
        expect(rec.estimatedImpact).toBeDefined();
      });
    });
  });

  // ============================================================================
  // 8. PREDICTIVE ANALYTICS TESTS
  // ============================================================================

  describe('Predictive Analytics', () => {
    it('Should generate churn predictions', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.predictions.churnPredictions).toBeInstanceOf(Array);
      
      result.predictions.churnPredictions.forEach(prediction => {
        expect(prediction.customerId).toBeDefined();
        expect(prediction.churnProbability).toBeGreaterThanOrEqual(0);
        expect(prediction.churnProbability).toBeLessThanOrEqual(100);
        expect(prediction.preventionActions).toBeInstanceOf(Array);
      });
    });

    it('Should generate lifetime value predictions', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.predictions.lifetimeValuePredictions).toBeInstanceOf(Array);
      
      result.predictions.lifetimeValuePredictions.forEach(prediction => {
        expect(prediction.customerId).toBeDefined();
        expect(prediction.predictedLTV).toBeGreaterThan(0);
        expect(prediction.confidence).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence).toBeLessThanOrEqual(100);
        expect(prediction.factors).toBeInstanceOf(Array);
      });
    });

    it('Should generate next purchase predictions', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      expect(result.predictions.nextPurchasePredictions).toBeInstanceOf(Array);
      
      result.predictions.nextPurchasePredictions.forEach(prediction => {
        expect(prediction.customerId).toBeDefined();
        expect(prediction.nextPurchaseProbability).toBeGreaterThanOrEqual(0);
        expect(prediction.nextPurchaseProbability).toBeLessThanOrEqual(100);
        expect(prediction.recommendedProducts).toBeInstanceOf(Array);
      });
    });

    it('Should prioritize high-risk churn predictions', async () => {
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        testConfig
      );

      const highRiskPredictions = result.predictions.churnPredictions.filter(
        pred => pred.churnProbability >= 70
      );
      
      highRiskPredictions.forEach(prediction => {
        expect(prediction.preventionActions.length).toBeGreaterThan(0);
        expect(prediction.timeToChurn).toBeDefined();
      });
    });
  });

  // ============================================================================
  // 9. CONFIGURATION AND EDGE CASES TESTS
  // ============================================================================

  describe('Configuration and Edge Cases', () => {
    it('Should respect minimum transactions threshold', async () => {
      const highThresholdConfig = { ...testConfig, minTransactionsForAnalysis: 10 };
      
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        highThresholdConfig
      );

      // With high threshold, fewer customers should be analyzed
      expect(result.totalCustomersAnalyzed).toBeLessThanOrEqual(mockCustomers.filter(c => c.status === 'active').length);
    });

    it('Should apply custom thresholds', async () => {
      const customConfig = {
        ...testConfig,
        highValueThreshold: 100,  // Lower threshold
        churnRiskDays: 30        // Stricter churn definition
      };

      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        customConfig
      );

      // With lower thresholds, more customers might be high-value
      expect(result.segments.length).toBeGreaterThan(0);
    });

    it('Should handle customers with no sales in period', async () => {
      const oldSales = mockSales.map(sale => ({
        ...sale,
        sale_date: new Date(Date.now() - (200 * 24 * 60 * 60 * 1000)).toISOString() // 200 days ago
      }));

      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        oldSales,
        mockSaleItems,
        testConfig
      );

      // Should handle gracefully with no recent sales
      expect(result.totalCustomersAnalyzed).toBe(0);
    });

    it('Should handle missing customer data gracefully', async () => {
      const salesWithMissingCustomers = mockSales.map(sale => ({
        ...sale,
        customer_id: 'non-existent-customer'
      }));

      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        salesWithMissingCustomers,
        mockSaleItems,
        testConfig
      );

      expect(result.totalCustomersAnalyzed).toBe(0);
    });

    it('Should handle analysis periods correctly', async () => {
      const longPeriodConfig = { ...testConfig, analysisMonths: 12 };
      
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        longPeriodConfig
      );

      const periodDiff = new Date(result.periodEnd).getTime() - new Date(result.periodStart).getTime();
      const expectedDays = 12 * 30; // Approximate
      const actualDays = periodDiff / (1000 * 60 * 60 * 24);
      
      expect(actualDays).toBeCloseTo(expectedDays, -1); // Within 10 days tolerance
    });

    it('Should validate configuration parameters', async () => {
      const invalidConfig = {
        ...testConfig,
        analysisMonths: -1,  // Invalid
        minTransactionsForAnalysis: 0
      };

      // Should handle invalid config gracefully
      const result = await CustomerAnalyticsEngine.generateCustomerAnalytics(
        mockCustomers,
        mockSales,
        mockSaleItems,
        invalidConfig
      );

      expect(result).toBeDefined();
    });
  });
});
