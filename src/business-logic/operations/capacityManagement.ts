/**
 * Operations Capacity Management with Decimal.js Precision
 * Advanced kitchen capacity, workflow optimization, and resource management calculations
 */

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export interface KitchenCapacity {
  station_id: string;
  station_name: string;
  max_hourly_capacity: number;
  current_utilization: number;
  efficiency_score: number;
  bottleneck_probability: number;
  recommended_staff: number;
  equipment_capacity: number;
  skill_requirements: string[];
}

export interface WorkflowOptimization {
  current_throughput: number;
  optimal_throughput: number;
  efficiency_gap: number;
  bottlenecks: Array<{
    station: string;
    severity: 'critical' | 'moderate' | 'minor';
    impact_percentage: number;
    recommended_action: string;
  }>;
  optimization_recommendations: string[];
  projected_improvement: number;
}

export interface StaffingPlan {
  shift_period: string;
  required_staff_count: number;
  current_staff_count: number;
  skill_distribution: Record<string, number>;
  labor_cost_per_hour: number;
  productivity_score: number;
  staffing_efficiency: number;
}

export interface ResourceUtilization {
  resource_type: 'equipment' | 'staff' | 'space';
  resource_id: string;
  resource_name: string;
  utilization_percentage: number;
  capacity_remaining: number;
  peak_usage_times: string[];
  cost_per_hour: number;
  roi_score: number;
}

export interface CapacityForecast {
  forecast_period: string;
  predicted_demand: number;
  available_capacity: number;
  capacity_gap: number;
  confidence_level: number;
  risk_factors: string[];
  mitigation_strategies: string[];
}

/**
 * Calculate kitchen station capacity with decimal precision
 */
export function calculateKitchenCapacity(
  stationData: {
    station_id: string;
    station_name: string;
    equipment_units: number;
    staff_count: number;
    hourly_output: number;
    max_theoretical_output: number;
    operating_hours: number;
    downtime_minutes: number;
    skill_level_average: number;
  }
): KitchenCapacity {
  const equipmentDec = DecimalUtils.fromValue(stationData.equipment_units, 'inventory');
  const staffDec = DecimalUtils.fromValue(stationData.staff_count, 'inventory');
  const hourlyOutputDec = DecimalUtils.fromValue(stationData.hourly_output, 'inventory');
  const maxOutputDec = DecimalUtils.fromValue(stationData.max_theoretical_output, 'inventory');
  const operatingHoursDec = DecimalUtils.fromValue(stationData.operating_hours, 'inventory');
  const downtimeDec = DecimalUtils.fromValue(stationData.downtime_minutes, 'inventory');
  const skillLevelDec = DecimalUtils.fromValue(stationData.skill_level_average, 'inventory');

  // Calculate effective operating time
  const downtimeHoursDec = DecimalUtils.divide(downtimeDec, DecimalUtils.fromValue(60, 'inventory'), 'inventory');
  const effectiveHoursDec = DecimalUtils.subtract(operatingHoursDec, downtimeHoursDec, 'inventory');

  // Calculate current utilization
  const utilizationDec = DecimalUtils.divide(hourlyOutputDec, maxOutputDec, 'inventory');
  const utilizationPercent = DecimalUtils.multiply(utilizationDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory');

  // Calculate efficiency score (output per staff member adjusted for skill)
  const outputPerStaffDec = DecimalUtils.divide(hourlyOutputDec, DecimalUtils.max(staffDec, DecimalUtils.fromValue(1, 'inventory')), 'inventory');
  const skillFactorDec = DecimalUtils.divide(skillLevelDec, DecimalUtils.fromValue(10, 'inventory'), 'inventory'); // Normalize skill (1-10 scale)
  const efficiencyDec = DecimalUtils.multiply(
    DecimalUtils.divide(outputPerStaffDec, DecimalUtils.fromValue(10, 'inventory'), 'inventory'), // Base efficiency
    skillFactorDec,
    'inventory'
  );
  const efficiencyScore = DecimalUtils.multiply(efficiencyDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory');

  // Calculate bottleneck probability based on utilization and efficiency
  let bottleneckProb = 0;
  const utilPercent = DecimalUtils.toNumber(utilizationPercent);
  const effScore = DecimalUtils.toNumber(efficiencyScore);
  
  if (utilPercent > 90) bottleneckProb += 40;
  if (utilPercent > 80) bottleneckProb += 20;
  if (effScore < 60) bottleneckProb += 30;
  if (stationData.downtime_minutes > 60) bottleneckProb += 10;

  // Calculate recommended staff based on demand vs capacity
  const demandCapacityRatioDec = DecimalUtils.divide(hourlyOutputDec, maxOutputDec, 'inventory');
  const recommendedStaffDec = DecimalUtils.multiply(
    staffDec,
    DecimalUtils.max(demandCapacityRatioDec, DecimalUtils.fromValue(1, 'inventory')),
    'inventory'
  );

  return {
    station_id: stationData.station_id,
    station_name: stationData.station_name,
    max_hourly_capacity: DecimalUtils.toNumber(maxOutputDec),
    current_utilization: DecimalUtils.toNumber(utilizationPercent),
    efficiency_score: Math.min(100, DecimalUtils.toNumber(efficiencyScore)),
    bottleneck_probability: Math.min(100, bottleneckProb),
    recommended_staff: Math.ceil(DecimalUtils.toNumber(recommendedStaffDec)),
    equipment_capacity: stationData.equipment_units,
    skill_requirements: determineSkillRequirements(utilPercent, effScore)
  };
}

/**
 * Determine skill requirements based on utilization and efficiency
 */
function determineSkillRequirements(utilization: number, efficiency: number): string[] {
  const skills: string[] = [];

  if (utilization > 80) {
    skills.push('Fast-paced work environment');
    skills.push('Multi-tasking capabilities');
  }

  if (efficiency < 70) {
    skills.push('Additional training required');
    skills.push('Process optimization knowledge');
  }

  if (utilization > 90 || efficiency < 60) {
    skills.push('Senior-level experience');
    skills.push('Leadership skills');
  }

  return skills.length > 0 ? skills : ['Standard operational skills'];
}

/**
 * Analyze workflow optimization opportunities
 */
export function analyzeWorkflowOptimization(
  stations: KitchenCapacity[],
  orderVolume: number,
  targetEfficiency: number = 85
): WorkflowOptimization {
  const totalCurrentCapacity = stations.reduce((sum, station) => 
    sum + (station.max_hourly_capacity * station.current_utilization / 100), 0
  );

  const totalMaxCapacity = stations.reduce((sum, station) => 
    sum + station.max_hourly_capacity, 0
  );

  const currentThroughputDec = DecimalUtils.fromValue(totalCurrentCapacity, 'inventory');
  const maxThroughputDec = DecimalUtils.fromValue(totalMaxCapacity, 'inventory');
  const targetEfficiencyDec = DecimalUtils.fromValue(targetEfficiency / 100, 'inventory');

  // Calculate optimal throughput based on target efficiency
  const optimalThroughputDec = DecimalUtils.multiply(maxThroughputDec, targetEfficiencyDec, 'inventory');

  // Calculate efficiency gap
  const efficiencyGapDec = DecimalUtils.subtract(optimalThroughputDec, currentThroughputDec, 'inventory');
  const efficiencyGapPercent = DecimalUtils.multiply(
    DecimalUtils.divide(efficiencyGapDec, maxThroughputDec, 'inventory'),
    DecimalUtils.fromValue(100, 'inventory'),
    'inventory'
  );

  // Identify bottlenecks
  const bottlenecks = stations
    .filter(station => station.bottleneck_probability > 30)
    .map(station => {
      let severity: 'critical' | 'moderate' | 'minor';
      if (station.bottleneck_probability > 70) severity = 'critical';
      else if (station.bottleneck_probability > 50) severity = 'moderate';
      else severity = 'minor';

      const impact = (station.max_hourly_capacity / totalMaxCapacity) * station.bottleneck_probability;

      return {
        station: station.station_name,
        severity,
        impact_percentage: Math.round(impact),
        recommended_action: getRecommendedAction(station)
      };
    })
    .sort((a, b) => b.impact_percentage - a.impact_percentage);

  // Generate optimization recommendations
  const recommendations: string[] = [];
  
  if (bottlenecks.length > 0) {
    recommendations.push(`Address ${bottlenecks.length} identified bottleneck${bottlenecks.length > 1 ? 's' : ''}`);
  }

  const avgEfficiency = stations.reduce((sum, s) => sum + s.efficiency_score, 0) / stations.length;
  if (avgEfficiency < targetEfficiency) {
    recommendations.push('Implement cross-training program to improve flexibility');
    recommendations.push('Review and optimize standard operating procedures');
  }

  const highUtilizationStations = stations.filter(s => s.current_utilization > 90);
  if (highUtilizationStations.length > 0) {
    recommendations.push('Consider additional equipment for high-utilization stations');
  }

  // Calculate projected improvement
  const potentialImprovementDec = DecimalUtils.multiply(
    efficiencyGapDec,
    DecimalUtils.fromValue(0.7, 'inventory'), // Assume 70% of gap can be closed
    'inventory'
  );

  return {
    current_throughput: DecimalUtils.toNumber(currentThroughputDec),
    optimal_throughput: DecimalUtils.toNumber(optimalThroughputDec),
    efficiency_gap: DecimalUtils.toNumber(efficiencyGapPercent),
    bottlenecks,
    optimization_recommendations: recommendations,
    projected_improvement: DecimalUtils.toNumber(potentialImprovementDec)
  };
}

/**
 * Get recommended action for a station based on its performance
 */
function getRecommendedAction(station: KitchenCapacity): string {
  if (station.current_utilization > 90 && station.efficiency_score < 60) {
    return 'Urgent: Add staff and provide efficiency training';
  }
  
  if (station.current_utilization > 90) {
    return 'Add additional capacity or redistribute workload';
  }
  
  if (station.efficiency_score < 60) {
    return 'Provide training and process optimization';
  }
  
  if (station.bottleneck_probability > 70) {
    return 'Implement preventive maintenance and backup procedures';
  }
  
  return 'Monitor performance and maintain current operations';
}

/**
 * Calculate optimal staffing plan with decimal precision
 */
export function calculateOptimalStaffing(
  shiftData: {
    shift_period: string;
    expected_orders: number;
    avg_prep_time_minutes: number;
    skill_requirements: Record<string, number>;
    hourly_wage_by_skill: Record<string, number>;
    shift_duration_hours: number;
  }
): StaffingPlan {
  const ordersDec = DecimalUtils.fromValue(shiftData.expected_orders, 'inventory');
  const prepTimeDec = DecimalUtils.fromValue(shiftData.avg_prep_time_minutes, 'inventory');
  const shiftDurationDec = DecimalUtils.fromValue(shiftData.shift_duration_hours, 'inventory');

  // Calculate total work minutes needed
  const totalWorkMinutesDec = DecimalUtils.multiply(ordersDec, prepTimeDec, 'inventory');
  
  // Convert to work hours
  const totalWorkHoursDec = DecimalUtils.divide(totalWorkMinutesDec, DecimalUtils.fromValue(60, 'inventory'), 'inventory');

  // Calculate base staff requirement
  const baseStaffDec = DecimalUtils.divide(totalWorkHoursDec, shiftDurationDec, 'inventory');

  // Add efficiency buffer (20% additional capacity)
  const staffWithBufferDec = DecimalUtils.multiply(baseStaffDec, DecimalUtils.fromValue(1.2, 'inventory'), 'inventory');

  // Calculate skill distribution
  const totalSkillUnits = Object.values(shiftData.skill_requirements).reduce((sum, units) => sum + units, 0);
  const skillDistribution: Record<string, number> = {};
  
  Object.entries(shiftData.skill_requirements).forEach(([skill, units]) => {
    const skillRatio = units / totalSkillUnits;
    skillDistribution[skill] = Math.ceil(DecimalUtils.toNumber(staffWithBufferDec) * skillRatio);
  });

  // Calculate labor cost
  let totalLaborCostDec = DecimalUtils.fromValue(0, 'financial');
  Object.entries(skillDistribution).forEach(([skill, count]) => {
    const wageDec = DecimalUtils.fromValue(shiftData.hourly_wage_by_skill[skill] || 15, 'financial');
    const skillCostDec = DecimalUtils.multiply(
      DecimalUtils.multiply(
        DecimalUtils.fromValue(count, 'financial'),
        wageDec,
        'financial'
      ),
      shiftDurationDec,
      'financial'
    );
    totalLaborCostDec = DecimalUtils.add(totalLaborCostDec, skillCostDec, 'financial');
  });

  const laborCostPerHourDec = DecimalUtils.divide(totalLaborCostDec, shiftDurationDec, 'financial');

  // Calculate productivity score (orders per staff hour)
  const requiredStaffCount = Math.ceil(DecimalUtils.toNumber(staffWithBufferDec));
  const productivityDec = DecimalUtils.divide(
    ordersDec,
    DecimalUtils.multiply(
      DecimalUtils.fromValue(requiredStaffCount, 'inventory'),
      shiftDurationDec,
      'inventory'
    ),
    'inventory'
  );
  const productivityScore = DecimalUtils.multiply(productivityDec, DecimalUtils.fromValue(10, 'inventory'), 'inventory'); // Scale to 0-100

  // Calculate staffing efficiency (work hours utilized vs available)
  const availableHoursDec = DecimalUtils.multiply(
    DecimalUtils.fromValue(requiredStaffCount, 'inventory'),
    shiftDurationDec,
    'inventory'
  );
  const utilizationDec = DecimalUtils.divide(totalWorkHoursDec, availableHoursDec, 'inventory');
  const efficiencyPercent = DecimalUtils.multiply(utilizationDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory');

  return {
    shift_period: shiftData.shift_period,
    required_staff_count: requiredStaffCount,
    current_staff_count: 0, // Would need current data
    skill_distribution: skillDistribution,
    labor_cost_per_hour: DecimalUtils.toNumber(laborCostPerHourDec),
    productivity_score: Math.min(100, DecimalUtils.toNumber(productivityScore)),
    staffing_efficiency: Math.min(100, DecimalUtils.toNumber(efficiencyPercent))
  };
}

/**
 * Analyze resource utilization across different resource types
 */
export function analyzeResourceUtilization(
  resources: Array<{
    resource_type: 'equipment' | 'staff' | 'space';
    resource_id: string;
    resource_name: string;
    usage_hours: number;
    available_hours: number;
    hourly_cost: number;
    revenue_generated: number;
    peak_usage_periods: string[];
  }>
): ResourceUtilization[] {
  return resources.map(resource => {
    const usageDec = DecimalUtils.fromValue(resource.usage_hours, 'inventory');
    const availableDec = DecimalUtils.fromValue(resource.available_hours, 'inventory');
    const costDec = DecimalUtils.fromValue(resource.hourly_cost, 'financial');
    const revenueDec = DecimalUtils.fromValue(resource.revenue_generated, 'financial');

    // Calculate utilization percentage
    const utilizationDec = DecimalUtils.divide(usageDec, availableDec, 'inventory');
    const utilizationPercent = DecimalUtils.multiply(utilizationDec, DecimalUtils.fromValue(100, 'inventory'), 'inventory');

    // Calculate remaining capacity
    const remainingDec = DecimalUtils.subtract(availableDec, usageDec, 'inventory');

    // Calculate ROI score
    const totalCostDec = DecimalUtils.multiply(usageDec, costDec, 'financial');
    const roiDec = DecimalUtils.isZero(totalCostDec) 
      ? DecimalUtils.fromValue(0, 'financial')
      : DecimalUtils.multiply(
          DecimalUtils.divide(
            DecimalUtils.subtract(revenueDec, totalCostDec, 'financial'),
            totalCostDec,
            'financial'
          ),
          DecimalUtils.fromValue(100, 'financial'),
          'financial'
        );

    return {
      resource_type: resource.resource_type,
      resource_id: resource.resource_id,
      resource_name: resource.resource_name,
      utilization_percentage: DecimalUtils.toNumber(utilizationPercent),
      capacity_remaining: DecimalUtils.toNumber(remainingDec),
      peak_usage_times: resource.peak_usage_periods,
      cost_per_hour: resource.hourly_cost,
      roi_score: DecimalUtils.toNumber(roiDec)
    };
  });
}

/**
 * Generate capacity forecast based on historical data and trends
 */
export function generateCapacityForecast(
  historicalDemand: number[],
  currentCapacity: number,
  seasonalFactors: number[] = [],
  forecastPeriods: number = 7
): CapacityForecast[] {
  if (historicalDemand.length < 3) {
    return [{
      forecast_period: 'Next Period',
      predicted_demand: 0,
      available_capacity: currentCapacity,
      capacity_gap: 0,
      confidence_level: 0,
      risk_factors: ['Insufficient historical data'],
      mitigation_strategies: ['Collect more operational data']
    }];
  }

  const forecasts: CapacityForecast[] = [];
  
  // Calculate trend using simple linear regression
  const trend = calculateTrend(historicalDemand);
  const avgDemand = historicalDemand.reduce((sum, d) => sum + d, 0) / historicalDemand.length;
  const variance = calculateVariance(historicalDemand, avgDemand);

  for (let period = 1; period <= forecastPeriods; period++) {
    // Basic trend projection
    const trendProjection = avgDemand + (trend * period);
    
    // Apply seasonal factor if available
    const seasonalIndex = (period - 1) % seasonalFactors.length;
    const seasonalFactor = seasonalFactors.length > 0 ? seasonalFactors[seasonalIndex] : 1;
    
    const predictedDemandDec = DecimalUtils.multiply(
      DecimalUtils.fromValue(trendProjection, 'inventory'),
      DecimalUtils.fromValue(seasonalFactor, 'inventory'),
      'inventory'
    );
    
    const capacityDec = DecimalUtils.fromValue(currentCapacity, 'inventory');
    const capacityGapDec = DecimalUtils.subtract(predictedDemandDec, capacityDec, 'inventory');
    
    // Calculate confidence based on variance and forecast distance
    const baseConfidence = Math.max(20, 100 - (variance * 10) - (period * 5));
    const confidenceLevel = Math.min(95, Math.max(20, baseConfidence));

    // Identify risk factors
    const riskFactors: string[] = [];
    if (DecimalUtils.toNumber(capacityGapDec) > 0) {
      riskFactors.push('Predicted demand exceeds capacity');
    }
    if (variance > 20) {
      riskFactors.push('High demand variability');
    }
    if (period > 3) {
      riskFactors.push('Long-term forecast uncertainty');
    }

    // Generate mitigation strategies
    const mitigationStrategies: string[] = [];
    if (DecimalUtils.toNumber(capacityGapDec) > 0) {
      mitigationStrategies.push('Consider capacity expansion');
      mitigationStrategies.push('Implement demand smoothing strategies');
    }
    if (riskFactors.length > 1) {
      mitigationStrategies.push('Develop contingency plans');
      mitigationStrategies.push('Monitor leading indicators closely');
    }

    forecasts.push({
      forecast_period: `Period ${period}`,
      predicted_demand: DecimalUtils.toNumber(predictedDemandDec),
      available_capacity: currentCapacity,
      capacity_gap: DecimalUtils.toNumber(capacityGapDec),
      confidence_level: Math.round(confidenceLevel),
      risk_factors: riskFactors,
      mitigation_strategies: mitigationStrategies
    });
  }

  return forecasts;
}

/**
 * Calculate linear trend from historical data
 */
function calculateTrend(data: number[]): number {
  const n = data.length;
  const sumX = (n * (n + 1)) / 2; // Sum of 1,2,3...n
  const sumY = data.reduce((sum, value) => sum + value, 0);
  const sumXY = data.reduce((sum, value, index) => sum + value * (index + 1), 0);
  const sumXX = (n * (n + 1) * (2 * n + 1)) / 6; // Sum of squares

  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

/**
 * Calculate variance for confidence assessment
 */
function calculateVariance(data: number[], mean: number): number {
  const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / data.length;
  return Math.sqrt(avgSquaredDiff);
}