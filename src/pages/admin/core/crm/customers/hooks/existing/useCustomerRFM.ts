// src/features/customers/logic/useCustomerRFM.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { logger } from '@/lib/logging';
import type {
  CustomerRFMProfile,
  CustomerSegment,
  ChurnRisk,
  CustomerAnalytics
} from '../../types';
import {
  calculateCustomerRFM,
  getCustomerAnalyticsDashboard,
  getCustomerProfileWithRFM
} from '../../services/existing/advancedCustomerApi';

export function useCustomerRFM() {
  const [rfmProfiles, setRFMProfiles] = useState<CustomerRFMProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RFM Calculation Logic (client-side for real-time updates)
  const calculateRFMScores = useMemo(() => ({
    recency: (lastVisit: Date): number => {
      const nowMs = DecimalUtils.fromValue(Date.now(), 'financial');
      const visitMs = DecimalUtils.fromValue(lastVisit.getTime(), 'financial');
      const diffMs = DecimalUtils.subtract(nowMs.toString(), visitMs.toString(), 'financial');
      const msPerDay = DecimalUtils.fromValue(1000 * 60 * 60 * 24, 'financial');
      const days = Math.floor(DecimalUtils.divide(diffMs.toString(), msPerDay.toString(), 'financial').toNumber());
      
      if (days <= 30) return 5;
      if (days <= 60) return 4;
      if (days <= 90) return 3;
      if (days <= 180) return 2;
      return 1;
    },
    
    frequency: (visitCount: number): number => {
      if (visitCount >= 20) return 5;
      if (visitCount >= 10) return 4;
      if (visitCount >= 5) return 3;
      if (visitCount >= 2) return 2;
      return 1;
    },
    
    monetary: (totalSpent: number): number => {
      if (totalSpent >= 1000) return 5;
      if (totalSpent >= 500) return 4;
      if (totalSpent >= 200) return 3;
      if (totalSpent >= 50) return 2;
      return 1;
    }
  }), []);

  // Customer Segmentation Logic
  const determineSegment = useCallback((r: number, f: number, m: number): CustomerSegment => {
    const rfmScore = `${r}${f}${m}`;
    
    // Champions: 555, 554, 544, 545, 454, 455, 445
    if (['555', '554', '544', '545', '454', '455', '445'].includes(rfmScore)) {
      return CustomerSegment.CHAMPIONS;
    }
    
    // Loyal Customers: 543, 444, 435, 355, 354, 345, 344, 335
    if (['543', '444', '435', '355', '354', '345', '344', '335'].includes(rfmScore)) {
      return CustomerSegment.LOYAL;
    }
    
    // Potential Loyalists: 512, 511, 422, 421, 412, 411, 311
    if (['512', '511', '422', '421', '412', '411', '311'].includes(rfmScore)) {
      return CustomerSegment.POTENTIAL_LOYALISTS;
    }
    
    // New Customers: 5XX with low frequency
    if (r === 5 && f <= 2) {
      return CustomerSegment.NEW_CUSTOMERS;
    }
    
    // Promising: 4XX, 3XX with decent monetary
    if ((r >= 3 && f >= 1 && m >= 3) || ['411', '412', '311', '312'].includes(rfmScore)) {
      return CustomerSegment.PROMISING;
    }
    
    // Need Attention: Medium recency, low frequency
    if (r === 3 && f <= 2) {
      return CustomerSegment.NEED_ATTENTION;
    }
    
    // About to Sleep: Low recency, medium frequency
    if (r === 2 && f >= 2) {
      return CustomerSegment.ABOUT_TO_SLEEP;
    }
    
    // Cannot Lose: Low recency, high monetary
    if (r <= 2 && m >= 4) {
      return CustomerSegment.CANNOT_LOSE;
    }
    
    // At Risk: Declining behavior
    if (r <= 2 && f >= 3 && m >= 3) {
      return CustomerSegment.AT_RISK;
    }
    
    // Hibernating: Very low recency, some history
    if (r === 1 && f >= 2) {
      return CustomerSegment.HIBERNATING;
    }
    
    // Lost: Lowest scores
    return CustomerSegment.LOST;
  }, []);

  // Churn Risk Assessment
  const assessChurnRisk = useCallback((rfmProfile: CustomerRFMProfile): ChurnRisk => {
    const { recency_score, frequency_score, monetary_score } = rfmProfile;

    // Critical risk: Low recency, frequency, AND low monetary value
    if (recency_score <= 2 && frequency_score <= 2 && monetary_score <= 2) {
      return ChurnRisk.HIGH;
    }

    // High risk: Low recency and frequency (but good monetary - worth saving)
    if (recency_score <= 2 && frequency_score <= 2) {
      return ChurnRisk.HIGH;
    }

    // Medium risk: Either low recency or frequency (monetary score considered)
    if ((recency_score <= 2 || frequency_score <= 2) && monetary_score >= 3) {
      return ChurnRisk.MEDIUM; // Higher value customer, medium risk
    }

    if (recency_score <= 2 || frequency_score <= 2) {
      return ChurnRisk.MEDIUM;
    }

    // Low risk: Good scores across the board
    return ChurnRisk.LOW;
  }, []);

  // Calculate Customer Lifetime Value
  const calculateCLV = useCallback((
    avgOrderValue: number, 
    visitFrequency: number, 
    customerLifespan: number = 12 // months
  ): number => {
    const orderValue = DecimalUtils.fromValue(avgOrderValue, 'financial');
    const frequency = DecimalUtils.fromValue(visitFrequency, 'financial');
    const lifespan = DecimalUtils.fromValue(customerLifespan, 'financial');
    
    const clv = DecimalUtils.multiply(
      DecimalUtils.multiply(orderValue.toString(), frequency.toString(), 'financial').toString(),
      lifespan.toString(),
      'financial'
    );
    
    return clv.toNumber();
  }, []);

  // Load RFM profiles from database
  const loadRFMProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const profiles = await calculateCustomerRFM();
      setRFMProfiles(profiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading RFM profiles');
      logger.error('App', 'Error loading RFM profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get RFM profile for specific customer
  const getCustomerRFM = useCallback(async (customerId: string): Promise<CustomerRFMProfile | null> => {
    try {
      const profile = await getCustomerProfileWithRFM(customerId);
      return profile.rfm_profile || null;
    } catch (err) {
      logger.error('App', 'Error getting customer RFM:', err);
      return null;
    }
  }, []);

  // Force recalculation of RFM for specific customer
  const recalculateCustomerRFM = async () => {
    try {
      // This would trigger the database function
      await calculateCustomerRFM();
      // Reload all profiles to get updated data
      await loadRFMProfiles();
    } catch (err) {
      logger.error('App', 'Error recalculating RFM:', err);
      throw err;
    }
  };

  // Get segment statistics
  const getSegmentStats = useMemo(() => {
    const segmentCounts: Record<CustomerSegment, number> = {
      [CustomerSegment.CHAMPIONS]: 0,
      [CustomerSegment.LOYAL]: 0,
      [CustomerSegment.POTENTIAL_LOYALISTS]: 0,
      [CustomerSegment.NEW_CUSTOMERS]: 0,
      [CustomerSegment.PROMISING]: 0,
      [CustomerSegment.NEED_ATTENTION]: 0,
      [CustomerSegment.ABOUT_TO_SLEEP]: 0,
      [CustomerSegment.AT_RISK]: 0,
      [CustomerSegment.CANNOT_LOSE]: 0,
      [CustomerSegment.HIBERNATING]: 0,
      [CustomerSegment.LOST]: 0,
    };

    rfmProfiles.forEach(profile => {
      segmentCounts[profile.rfm_segment]++;
    });

    const total = rfmProfiles.length;
    
    return Object.entries(segmentCounts).map(([segment, count]) => ({
      segment: segment as CustomerSegment,
      count,
      percentage: total > 0 
        ? DecimalUtils.calculatePercentage(count.toString(), total.toString()).toNumber() 
        : 0
    }));
  }, [rfmProfiles]);

  useEffect(() => {
    loadRFMProfiles();
  }, []);

  return {
    rfmProfiles,
    loading,
    error,
    
    // Calculation functions
    calculateRFMScores,
    determineSegment,
    assessChurnRisk,
    calculateCLV,
    
    // Data operations
    loadRFMProfiles,
    getCustomerRFM,
    recalculateCustomerRFM,
    
    // Analytics
    segmentStats: getSegmentStats
  };
}

export function useCustomerAnalytics() {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCustomerAnalyticsDashboard();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics');
      logger.error('App', 'Error loading customer analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get customers by segment
  const getCustomersBySegment = useCallback((segment: CustomerSegment) => {
    if (!analytics) return [];
    return analytics.segment_distribution[segment] || { count: 0, percentage: 0, avg_lifetime_value: 0, revenue_contribution: 0 };
  }, [analytics]);

  // Get high-value customers (Champions + Loyal)
  const getHighValueCustomers = useMemo(() => {
    if (!analytics) return [];
    return [...analytics.top_customers].sort((a, b) => b.total_spent - a.total_spent);
  }, [analytics]);

  // Get customers at risk of churning
  const getChurnRiskCustomers = useMemo(() => {
    if (!analytics) return [];
    return analytics.at_risk_customers;
  }, [analytics]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    
    // Data operations  
    loadAnalytics,
    reloadAnalytics: loadAnalytics,
    
    // Computed analytics
    getCustomersBySegment,
    getHighValueCustomers,
    getChurnRiskCustomers
  };
}

// Customer Segmentation Hook
export function useCustomerSegmentation() {
  const { rfmProfiles, segmentStats } = useCustomerRFM();
  
  // Filter customers by segment
  const getCustomersInSegment = useCallback((segment: CustomerSegment) => {
    return rfmProfiles.filter(profile => profile.rfm_segment === segment);
  }, [rfmProfiles]);

  // Get segment performance metrics
  const getSegmentPerformance = useCallback((segment: CustomerSegment) => {
    const customers = getCustomersInSegment(segment);
    
    if (customers.length === 0) {
      return {
        count: 0,
        totalRevenue: 0,
        avgLifetimeValue: 0,
        avgOrderValue: 0
      };
    }

    const totalRevenue = customers.reduce((sum, c) => sum + c.lifetime_value, 0);
    const avgLifetimeValue = totalRevenue / customers.length;
    const avgOrderValue = customers.reduce((sum, c) => sum + c.avg_order_value, 0) / customers.length;

    return {
      count: customers.length,
      totalRevenue,
      avgLifetimeValue,
      avgOrderValue
    };
  }, [getCustomersInSegment]);

  // Get actionable recommendations for each segment
  const getSegmentRecommendations = useCallback((segment: CustomerSegment): string[] => {
    switch (segment) {
      case CustomerSegment.CHAMPIONS:
        return [
          'Reward them with exclusive offers',
          'Ask for referrals and reviews',
          'Consider them for beta testing new products'
        ];
        
      case CustomerSegment.LOYAL:
        return [
          'Offer loyalty programs',
          'Recommend related products',
          'Invite to special events'
        ];
        
      case CustomerSegment.AT_RISK:
        return [
          'Send personalized win-back campaigns',
          'Offer limited-time discounts',
          'Request feedback on service issues'
        ];
        
      case CustomerSegment.LOST:
        return [
          'Send strong win-back offers',
          'Survey for reasons they left',
          'Consider them for re-engagement campaigns'
        ];
        
      case CustomerSegment.NEW_CUSTOMERS:
        return [
          'Send welcome series',
          'Offer onboarding incentives',
          'Educate about your best products'
        ];
        
      default:
        return ['Monitor customer behavior', 'Consider targeted campaigns'];
    }
  }, []);

  return {
    segmentStats,
    getCustomersInSegment,
    getSegmentPerformance,
    getSegmentRecommendations
  };
}