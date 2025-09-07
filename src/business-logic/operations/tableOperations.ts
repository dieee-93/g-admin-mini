/**
 * Table Operations with Decimal.js Precision
 * Advanced table management, capacity calculations, and service time analytics
 */

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export interface TableCapacityMetrics {
  table_id: string;
  capacity: number;
  current_occupancy: number;
  utilization_rate: number;
  average_turn_time: number;
  estimated_wait_time: number;
  revenue_per_hour: number;
  service_efficiency: number;
}

export interface ServiceTimeAnalysis {
  party_id: string;
  table_id: string;
  seated_time: Date;
  completion_time?: Date;
  estimated_duration: number;
  actual_duration?: number;
  service_stages: ServiceStage[];
  efficiency_score: number;
  delay_factors: string[];
}

export interface ServiceStage {
  stage: 'seated' | 'ordered' | 'served' | 'completed';
  timestamp: Date;
  duration_minutes: number;
  expected_duration: number;
  variance: number;
}

export interface CapacityOptimization {
  current_capacity: number;
  optimal_capacity: number;
  bottlenecks: string[];
  recommendations: string[];
  projected_revenue_increase: number;
}

/**
 * Calculate estimated table duration with precise decimal calculations
 */
export function calculateEstimatedDuration(
  partySize: number, 
  averageTurnTime: number,
  serviceType: 'breakfast' | 'lunch' | 'dinner' | 'late_night' = 'lunch',
  isWeekend: boolean = false
): number {
  const partySizeDec = DecimalUtils.fromValue(partySize, 'inventory');
  const avgTimeDec = DecimalUtils.fromValue(averageTurnTime, 'inventory');
  
  // Base size multiplier (larger parties typically stay longer)
  const sizeMultiplierDec = DecimalUtils.add(
    DecimalUtils.fromValue(1, 'inventory'),
    DecimalUtils.multiply(
      DecimalUtils.subtract(partySizeDec, DecimalUtils.fromValue(2, 'inventory'), 'inventory'),
      DecimalUtils.fromValue(0.1, 'inventory'),
      'inventory'
    ),
    'inventory'
  );
  
  // Cap the size multiplier at 1.5
  const cappedSizeMultiplierDec = DecimalUtils.min(sizeMultiplierDec, DecimalUtils.fromValue(1.5, 'inventory'));
  
  // Service type adjustment
  const serviceTypeMultipliers = {
    breakfast: 0.8,  // Faster service
    lunch: 1.0,      // Baseline
    dinner: 1.3,     // Slower, more relaxed
    late_night: 1.1  // Slightly longer
  };
  
  const serviceMultiplierDec = DecimalUtils.fromValue(serviceTypeMultipliers[serviceType], 'inventory');
  
  // Weekend adjustment (people tend to stay longer on weekends)
  const weekendMultiplierDec = isWeekend 
    ? DecimalUtils.fromValue(1.15, 'inventory')
    : DecimalUtils.fromValue(1.0, 'inventory');
  
  // Calculate final duration
  const estimatedDurationDec = DecimalUtils.multiply(
    DecimalUtils.multiply(
      DecimalUtils.multiply(avgTimeDec, cappedSizeMultiplierDec, 'inventory'),
      serviceMultiplierDec,
      'inventory'
    ),
    weekendMultiplierDec,
    'inventory'
  );
  
  return Math.round(DecimalUtils.toNumber(estimatedDurationDec));
}

/**
 * Calculate actual table duration from service events
 */
export function calculateActualDuration(
  seatedAt: Date, 
  completedAt: Date = new Date()
): number {
  const seatedTimestamp = DecimalUtils.fromValue(seatedAt.getTime(), 'inventory');
  const completedTimestamp = DecimalUtils.fromValue(completedAt.getTime(), 'inventory');
  
  const durationMsDec = DecimalUtils.subtract(completedTimestamp, seatedTimestamp, 'inventory');
  const durationMinutesDec = DecimalUtils.divide(
    durationMsDec, 
    DecimalUtils.fromValue(1000 * 60, 'inventory'), // ms to minutes
    'inventory'
  );
  
  return Math.round(DecimalUtils.toNumber(durationMinutesDec));
}

/**
 * Calculate table utilization rate with precision
 */
export function calculateTableUtilization(
  operatingHours: number,
  totalSeatedTime: number,
  tableCapacity: number = 1
): number {
  if (operatingHours <= 0) return 0;
  
  const operatingMinutesDec = DecimalUtils.multiply(
    DecimalUtils.fromValue(operatingHours, 'inventory'),
    DecimalUtils.fromValue(60, 'inventory'),
    'inventory'
  );
  
  const seatedTimeDec = DecimalUtils.fromValue(totalSeatedTime, 'inventory');
  const capacityDec = DecimalUtils.fromValue(tableCapacity, 'inventory');
  
  // Available capacity-minutes
  const availableCapacityDec = DecimalUtils.multiply(operatingMinutesDec, capacityDec, 'inventory');
  
  // Utilization rate
  const utilizationDec = DecimalUtils.divide(seatedTimeDec, availableCapacityDec, 'inventory');
  const utilizationPercentDec = DecimalUtils.multiply(utilizationDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory');
  
  return Math.min(100, Math.max(0, DecimalUtils.toNumber(utilizationPercentDec)));
}

/**
 * Calculate revenue per hour for a table
 */
export function calculateRevenuePerHour(
  totalRevenue: number,
  totalOperatingHours: number
): number {
  if (totalOperatingHours <= 0) return 0;
  
  const revenueDec = DecimalUtils.fromValue(totalRevenue, 'financial');
  const hoursDec = DecimalUtils.fromValue(totalOperatingHours, 'financial');
  
  const revenuePerHourDec = DecimalUtils.divide(revenueDec, hoursDec, 'financial');
  
  return DecimalUtils.toNumber(revenuePerHourDec);
}

/**
 * Calculate service efficiency score
 */
export function calculateServiceEfficiency(
  actualDuration: number,
  estimatedDuration: number,
  customerSatisfactionScore?: number
): number {
  const actualDec = DecimalUtils.fromValue(actualDuration, 'inventory');
  const estimatedDec = DecimalUtils.fromValue(estimatedDuration, 'inventory');
  
  // Time efficiency (closer to estimated = better)
  const timeVarianceDec = DecimalUtils.abs(
    DecimalUtils.divide(
      DecimalUtils.subtract(actualDec, estimatedDec, 'inventory'),
      estimatedDec,
      'inventory'
    )
  );
  
  // Convert variance to efficiency score (lower variance = higher score)
  const timeEfficiencyDec = DecimalUtils.subtract(
    DecimalUtils.fromValue(1, 'inventory'),
    DecimalUtils.min(timeVarianceDec, DecimalUtils.fromValue(1, 'inventory')),
    'inventory'
  );
  
  let finalEfficiencyDec = DecimalUtils.multiply(
    timeEfficiencyDec,
    DecimalUtils.fromValue(100, 'inventory'),
    'inventory'
  );
  
  // Factor in customer satisfaction if available
  if (customerSatisfactionScore !== undefined) {
    const satisfactionDec = DecimalUtils.fromValue(customerSatisfactionScore / 100, 'inventory');
    const timeWeightDec = DecimalUtils.fromValue(0.7, 'inventory'); // 70% weight for time
    const satisfactionWeightDec = DecimalUtils.fromValue(0.3, 'inventory'); // 30% weight for satisfaction
    
    finalEfficiencyDec = DecimalUtils.add(
      DecimalUtils.multiply(
        DecimalUtils.divide(finalEfficiencyDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory'),
        timeWeightDec,
        'inventory'
      ),
      DecimalUtils.multiply(satisfactionDec, satisfactionWeightDec, 'inventory'),
      'inventory'
    );
    
    finalEfficiencyDec = DecimalUtils.multiply(finalEfficiencyDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory');
  }
  
  return Math.min(100, Math.max(0, DecimalUtils.toNumber(finalEfficiencyDec)));
}

/**
 * Calculate optimal table capacity for maximum revenue
 */
export function calculateOptimalCapacity(
  currentRevenue: number,
  currentCapacity: number,
  averageOrderValue: number,
  averageTurnTime: number,
  operatingHours: number,
  fixedCosts: number = 0
): CapacityOptimization {
  const currentRevenueDec = DecimalUtils.fromValue(currentRevenue, 'financial');
  const currentCapacityDec = DecimalUtils.fromValue(currentCapacity, 'financial');
  const aovDec = DecimalUtils.fromValue(averageOrderValue, 'financial');
  const turnTimeDec = DecimalUtils.fromValue(averageTurnTime, 'financial');
  const operatingHoursDec = DecimalUtils.fromValue(operatingHours, 'financial');
  const fixedCostsDec = DecimalUtils.fromValue(fixedCosts, 'financial');
  
  // Calculate turns per day
  const operatingMinutesDec = DecimalUtils.multiply(operatingHoursDec, DecimalUtils.fromValue(60, 'financial'), 'financial');
  const turnsPerTableDec = DecimalUtils.divide(operatingMinutesDec, turnTimeDec, 'financial');
  
  // Revenue per table per day
  const revenuePerTableDec = DecimalUtils.multiply(turnsPerTableDec, aovDec, 'financial');
  
  // Current performance metrics
  const currentRevenuePerTableDec = DecimalUtils.divide(currentRevenueDec, currentCapacityDec, 'financial');
  
  // Efficiency ratio
  const efficiencyRatioDec = DecimalUtils.divide(currentRevenuePerTableDec, revenuePerTableDec, 'financial');
  
  // Optimal capacity based on current efficiency
  const theoreticalOptimalDec = DecimalUtils.divide(currentCapacityDec, efficiencyRatioDec, 'financial');
  
  // Apply practical constraints (don't recommend more than 50% increase or decrease)
  const maxIncreaseDec = DecimalUtils.multiply(currentCapacityDec, DecimalUtils.fromValue(1.5, 'financial'), 'financial');
  const maxDecreaseDec = DecimalUtils.multiply(currentCapacityDec, DecimalUtils.fromValue(0.5, 'financial'), 'financial');
  
  const practicalOptimalDec = DecimalUtils.max(
    maxDecreaseDec,
    DecimalUtils.min(maxIncreaseDec, theoreticalOptimalDec)
  );
  
  const optimalCapacity = Math.round(DecimalUtils.toNumber(practicalOptimalDec));
  
  // Calculate projected revenue increase
  const projectedRevenueDec = DecimalUtils.multiply(
    DecimalUtils.fromValue(optimalCapacity, 'financial'),
    revenuePerTableDec,
    'financial'
  );
  
  const revenueIncreaseDec = DecimalUtils.subtract(projectedRevenueDec, currentRevenueDec, 'financial');
  
  // Generate recommendations
  const recommendations: string[] = [];
  const bottlenecks: string[] = [];
  
  if (optimalCapacity > currentCapacity) {
    recommendations.push(`Consider increasing capacity by ${optimalCapacity - currentCapacity} tables`);
    recommendations.push('Analyze peak hour demand patterns');
    recommendations.push('Evaluate space utilization and layout optimization');
  } else if (optimalCapacity < currentCapacity) {
    recommendations.push(`Consider reducing capacity by ${currentCapacity - optimalCapacity} tables`);
    recommendations.push('Focus on increasing table turnover rate');
    recommendations.push('Improve service efficiency and speed');
    bottlenecks.push('Over-capacity leading to underutilization');
  } else {
    recommendations.push('Current capacity appears optimal');
    recommendations.push('Focus on operational efficiency improvements');
  }
  
  if (DecimalUtils.toNumber(efficiencyRatioDec) < 0.8) {
    bottlenecks.push('Low table utilization efficiency');
    bottlenecks.push('Potential service delivery issues');
  }
  
  return {
    current_capacity: currentCapacity,
    optimal_capacity: optimalCapacity,
    bottlenecks,
    recommendations,
    projected_revenue_increase: DecimalUtils.toNumber(revenueIncreaseDec)
  };
}

/**
 * Calculate wait time estimation based on current occupancy
 */
export function calculateWaitTime(
  availableTables: number,
  partiesWaiting: number,
  averageTurnTime: number,
  currentOccupancyRate: number
): number {
  if (availableTables > 0) return 0;
  if (partiesWaiting === 0) return 0;
  
  const waitingDec = DecimalUtils.fromValue(partiesWaiting, 'inventory');
  const turnTimeDec = DecimalUtils.fromValue(averageTurnTime, 'inventory');
  const occupancyDec = DecimalUtils.fromValue(currentOccupancyRate, 'inventory');
  
  // Estimate tables becoming available based on occupancy
  const tablesBecomingAvailableDec = DecimalUtils.multiply(
    DecimalUtils.divide(occupancyDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory'),
    DecimalUtils.fromValue(10, 'inventory'), // Assume 10 tables for calculation
    'inventory'
  );
  
  // Wait time = (parties waiting / tables becoming available) * average turn time
  const waitTimeDec = DecimalUtils.multiply(
    DecimalUtils.divide(waitingDec, DecimalUtils.max(tablesBecomingAvailableDec, DecimalUtils.fromValue(1, 'inventory')), 'inventory'),
    turnTimeDec,
    'inventory'
  );
  
  return Math.round(DecimalUtils.toNumber(waitTimeDec));
}

/**
 * Analyze service stage performance
 */
export function analyzeServiceStages(serviceEvents: Array<{
  stage: string;
  timestamp: Date;
  expected_duration: number;
}>): ServiceStage[] {
  if (serviceEvents.length === 0) return [];
  
  const stages: ServiceStage[] = [];
  
  for (let i = 0; i < serviceEvents.length; i++) {
    const current = serviceEvents[i];
    const previous = i > 0 ? serviceEvents[i - 1] : null;
    
    if (previous) {
      const actualDuration = calculateActualDuration(previous.timestamp, current.timestamp);
      const expectedDec = DecimalUtils.fromValue(current.expected_duration, 'inventory');
      const actualDec = DecimalUtils.fromValue(actualDuration, 'inventory');
      
      const varianceDec = DecimalUtils.subtract(actualDec, expectedDec, 'inventory');
      
      stages.push({
        stage: current.stage as ServiceStage['stage'],
        timestamp: current.timestamp,
        duration_minutes: actualDuration,
        expected_duration: current.expected_duration,
        variance: DecimalUtils.toNumber(varianceDec)
      });
    }
  }
  
  return stages;
}

/**
 * Calculate peak hour capacity requirements
 */
export function calculatePeakCapacityRequirement(
  hourlyDemand: number[],
  averagePartySize: number,
  averageTurnTime: number
): { peak_hour: number; required_capacity: number; current_gap: number } {
  if (hourlyDemand.length === 0) {
    return { peak_hour: 0, required_capacity: 0, current_gap: 0 };
  }
  
  // Find peak demand hour
  let peakDemand = 0;
  let peakHour = 0;
  
  hourlyDemand.forEach((demand, hour) => {
    if (demand > peakDemand) {
      peakDemand = demand;
      peakHour = hour;
    }
  });
  
  const peakDemandDec = DecimalUtils.fromValue(peakDemand, 'inventory');
  const partySizeDec = DecimalUtils.fromValue(averagePartySize, 'inventory');
  const turnTimeDec = DecimalUtils.fromValue(averageTurnTime, 'inventory');
  
  // Calculate required tables for peak hour
  // Tables needed = (Peak Parties * Avg Party Size * Turn Time) / 60 minutes
  const requiredCapacityDec = DecimalUtils.divide(
    DecimalUtils.multiply(
      DecimalUtils.multiply(peakDemandDec, partySizeDec, 'inventory'),
      turnTimeDec,
      'inventory'
    ),
    DecimalUtils.fromValue(60, 'inventory'),
    'inventory'
  );
  
  return {
    peak_hour: peakHour,
    required_capacity: Math.ceil(DecimalUtils.toNumber(requiredCapacityDec)),
    current_gap: 0 // Would need current capacity to calculate gap
  };
}