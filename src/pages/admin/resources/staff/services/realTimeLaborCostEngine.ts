/**
 * Real-Time Labor Cost Engine with Decimal.js Precision
 * Advanced labor cost calculations with mathematical precision for real-time monitoring
 */

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type Decimal from 'decimal.js';

export interface LiveCostCalculation {
  employee_id: string;
  employee_name: string;
  current_hours: number;
  projected_hours: number;
  current_cost: number;
  projected_cost: number;
  regular_hours: number;
  overtime_hours: number;
  overtime_cost: number;
  overtime_status: 'none' | 'approaching' | 'in_overtime';
  hourly_rate: number;
  overtime_rate: number;
}

export interface DailyCostSummary {
  date: string;
  total_current_cost: number;
  total_projected_cost: number;
  total_regular_hours: number;
  total_overtime_hours: number;
  total_regular_cost: number;
  total_overtime_cost: number;
  active_employees: number;
  average_hourly_rate: number;
  budget_utilization_percent: number;
  cost_variance: number;
  efficiency_score: number;
}

export interface OvertimeAnalysis {
  employee_id: string;
  employee_name: string;
  regular_hours: number;
  overtime_hours: number;
  overtime_percentage: number;
  additional_cost: number;
  cost_impact_percentage: number;
  recommendation: string;
}

export interface BudgetVarianceAnalysis {
  daily_budget: number;
  actual_cost: number;
  variance_amount: number;
  variance_percentage: number;
  variance_type: 'over' | 'under' | 'on_target';
  cost_trend: 'increasing' | 'stable' | 'decreasing';
  projected_monthly_impact: number;
}

/**
 * Calculate current worked hours with decimal precision
 */
export function calculateWorkedHours(clockInTime: Date, currentTime?: Date): number {
  const now = currentTime || new Date();
  const clockInTimestamp = DecimalUtils.fromValue(clockInTime.getTime(), 'inventory');
  const nowTimestamp = DecimalUtils.fromValue(now.getTime(), 'inventory');
  
  // Calculate difference in milliseconds
  const diffMsDec = DecimalUtils.subtract(nowTimestamp, clockInTimestamp, 'inventory');
  
  // Convert to hours with precision
  const msPerHourDec = DecimalUtils.fromValue(1000 * 60 * 60, 'inventory');
  const hoursDec = DecimalUtils.divide(diffMsDec, msPerHourDec, 'inventory');
  
  // Ensure non-negative
  return Math.max(0, DecimalUtils.toNumber(hoursDec));
}

/**
 * Calculate shift duration from time strings with decimal precision
 */
export function calculateShiftDuration(startTime: string, endTime: string): number {
  const baseDate = '2000-01-01';
  const start = new Date(`${baseDate} ${startTime}`);
  const end = new Date(`${baseDate} ${endTime}`);
  
  const startMs = DecimalUtils.fromValue(start.getTime(), 'inventory');
  const endMs = DecimalUtils.fromValue(end.getTime(), 'inventory');
  
  // Handle overnight shifts
  let durationMs = DecimalUtils.subtract(endMs, startMs, 'inventory');
  if (DecimalUtils.isNegative(durationMs)) {
    const dayMs = DecimalUtils.fromValue(24 * 60 * 60 * 1000, 'inventory');
    durationMs = DecimalUtils.add(durationMs, dayMs, 'inventory');
  }
  
  const msPerHourDec = DecimalUtils.fromValue(1000 * 60 * 60, 'inventory');
  const hoursDec = DecimalUtils.divide(durationMs, msPerHourDec, 'inventory');
  
  return DecimalUtils.toNumber(hoursDec);
}

/**
 * Calculate labor costs including overtime with decimal precision
 */
export function calculateLaborCosts(
  hours: number,
  hourlyRate: number,
  overtimeThreshold: number = 8,
  overtimeMultiplier: number = 1.5
): LiveCostCalculation['current_cost'] & {
  regular_hours: number;
  overtime_hours: number;
  regular_cost: number;
  overtime_cost: number;
  total_cost: number;
} {
  const hoursDec = DecimalUtils.fromValue(hours, 'inventory');
  const rateDec = DecimalUtils.fromValue(hourlyRate, 'financial');
  const thresholdDec = DecimalUtils.fromValue(overtimeThreshold, 'inventory');
  const multiplierDec = DecimalUtils.fromValue(overtimeMultiplier, 'financial');

  let regularHoursDec: Decimal;
  let overtimeHoursDec: Decimal;

  // Calculate regular and overtime hours
  const hoursNum = DecimalUtils.toNumber(hoursDec);
  const thresholdNum = DecimalUtils.toNumber(thresholdDec);

  if (hoursNum <= thresholdNum) {
    // No overtime
    regularHoursDec = hoursDec;
    overtimeHoursDec = DecimalUtils.fromValue(0, 'inventory');
  } else {
    // Has overtime
    regularHoursDec = thresholdDec;
    overtimeHoursDec = DecimalUtils.subtract(hoursDec, thresholdDec, 'inventory');
  }

  // Calculate costs
  const regularCostDec = DecimalUtils.multiply(regularHoursDec, rateDec, 'financial');
  const overtimeRateDec = DecimalUtils.multiply(rateDec, multiplierDec, 'financial');
  const overtimeCostDec = DecimalUtils.multiply(overtimeHoursDec, overtimeRateDec, 'financial');
  const totalCostDec = DecimalUtils.add(regularCostDec, overtimeCostDec, 'financial');

  return {
    regular_hours: DecimalUtils.toNumber(regularHoursDec),
    overtime_hours: DecimalUtils.toNumber(overtimeHoursDec),
    regular_cost: DecimalUtils.toNumber(regularCostDec),
    overtime_cost: DecimalUtils.toNumber(overtimeCostDec),
    total_cost: DecimalUtils.toNumber(totalCostDec)
  };
}

/**
 * Determine overtime status with precision thresholds
 */
export function determineOvertimeStatus(
  hours: number,
  overtimeThreshold: number = 8,
  warningThreshold: number = 7.5
): 'none' | 'approaching' | 'in_overtime' {
  const hoursDec = DecimalUtils.fromValue(hours, 'inventory');
  const thresholdDec = DecimalUtils.fromValue(overtimeThreshold, 'inventory');
  const warningDec = DecimalUtils.fromValue(warningThreshold, 'inventory');

  const hoursNum = DecimalUtils.toNumber(hoursDec);
  const thresholdNum = DecimalUtils.toNumber(thresholdDec);
  const warningNum = DecimalUtils.toNumber(warningDec);

  if (hoursNum >= thresholdNum) {
    return 'in_overtime';
  } else if (hoursNum >= warningNum) {
    return 'approaching';
  } else {
    return 'none';
  }
}

/**
 * Calculate comprehensive live cost data for an employee
 */
export function calculateEmployeeLiveCost(
  employeeData: {
    employee_id: string;
    employee_name: string;
    hourly_rate: number;
    clock_in_time?: Date;
    shift_start_time?: string;
    shift_end_time?: string;
    current_time?: Date;
  },
  overtimeThreshold: number = 8,
  overtimeMultiplier: number = 1.5
): LiveCostCalculation {
  const currentTime = employeeData.current_time || new Date();
  
  // Calculate current hours worked
  const currentHours = employeeData.clock_in_time 
    ? calculateWorkedHours(employeeData.clock_in_time, currentTime)
    : 0;

  // Calculate projected hours (full shift duration)
  const projectedHours = (employeeData.shift_start_time && employeeData.shift_end_time)
    ? calculateShiftDuration(employeeData.shift_start_time, employeeData.shift_end_time)
    : currentHours;

  // Calculate current costs
  const currentCostData = calculateLaborCosts(
    currentHours, 
    employeeData.hourly_rate, 
    overtimeThreshold, 
    overtimeMultiplier
  );

  // Calculate projected costs
  const projectedCostData = calculateLaborCosts(
    projectedHours, 
    employeeData.hourly_rate, 
    overtimeThreshold, 
    overtimeMultiplier
  );

  // Determine overtime status
  const overtimeStatus = determineOvertimeStatus(currentHours, overtimeThreshold);

  // Calculate overtime rate
  const overtimeRateDec = DecimalUtils.multiply(
    DecimalUtils.fromValue(employeeData.hourly_rate, 'financial'),
    DecimalUtils.fromValue(overtimeMultiplier, 'financial'),
    'financial'
  );

  return {
    employee_id: employeeData.employee_id,
    employee_name: employeeData.employee_name,
    current_hours: currentHours,
    projected_hours: projectedHours,
    current_cost: currentCostData.total_cost,
    projected_cost: projectedCostData.total_cost,
    regular_hours: currentCostData.regular_hours,
    overtime_hours: currentCostData.overtime_hours,
    overtime_cost: currentCostData.overtime_cost,
    overtime_status: overtimeStatus,
    hourly_rate: employeeData.hourly_rate,
    overtime_rate: DecimalUtils.toNumber(overtimeRateDec)
  };
}

/**
 * Calculate daily cost summary with decimal precision
 */
export function calculateDailyCostSummary(
  employeeCosts: LiveCostCalculation[],
  dailyBudget: number
): DailyCostSummary {
  if (employeeCosts.length === 0) {
    return {
      date: new Date().toISOString().split('T')[0],
      total_current_cost: 0,
      total_projected_cost: 0,
      total_regular_hours: 0,
      total_overtime_hours: 0,
      total_regular_cost: 0,
      total_overtime_cost: 0,
      active_employees: 0,
      average_hourly_rate: 0,
      budget_utilization_percent: 0,
      cost_variance: 0,
      efficiency_score: 0
    };
  }

  // Aggregate totals with decimal precision
  let totalCurrentCostDec = DecimalUtils.fromValue(0, 'financial');
  let totalProjectedCostDec = DecimalUtils.fromValue(0, 'financial');
  let totalRegularHoursDec = DecimalUtils.fromValue(0, 'inventory');
  let totalOvertimeHoursDec = DecimalUtils.fromValue(0, 'inventory');
  let totalRegularCostDec = DecimalUtils.fromValue(0, 'financial');
  let totalOvertimeCostDec = DecimalUtils.fromValue(0, 'financial');
  let totalHourlyRatesDec = DecimalUtils.fromValue(0, 'financial');

  employeeCosts.forEach(emp => {
    totalCurrentCostDec = DecimalUtils.add(totalCurrentCostDec, DecimalUtils.fromValue(emp.current_cost, 'financial'), 'financial');
    totalProjectedCostDec = DecimalUtils.add(totalProjectedCostDec, DecimalUtils.fromValue(emp.projected_cost, 'financial'), 'financial');
    totalRegularHoursDec = DecimalUtils.add(totalRegularHoursDec, DecimalUtils.fromValue(emp.regular_hours, 'inventory'), 'inventory');
    totalOvertimeHoursDec = DecimalUtils.add(totalOvertimeHoursDec, DecimalUtils.fromValue(emp.overtime_hours, 'inventory'), 'inventory');
    totalOvertimeCostDec = DecimalUtils.add(totalOvertimeCostDec, DecimalUtils.fromValue(emp.overtime_cost, 'financial'), 'financial');
    totalHourlyRatesDec = DecimalUtils.add(totalHourlyRatesDec, DecimalUtils.fromValue(emp.hourly_rate, 'financial'), 'financial');
    
    // Calculate regular cost (current cost minus overtime cost)
    const empRegularCostDec = DecimalUtils.subtract(
      DecimalUtils.fromValue(emp.current_cost, 'financial'),
      DecimalUtils.fromValue(emp.overtime_cost, 'financial'),
      'financial'
    );
    totalRegularCostDec = DecimalUtils.add(totalRegularCostDec, empRegularCostDec, 'financial');
  });

  // Calculate averages and percentages
  const employeeCountDec = DecimalUtils.fromValue(employeeCosts.length, 'inventory');
  const averageHourlyRateDec = DecimalUtils.divide(totalHourlyRatesDec, employeeCountDec, 'financial');

  const dailyBudgetDec = DecimalUtils.fromValue(dailyBudget, 'financial');
  const budgetUtilizationDec = DecimalUtils.multiply(
    DecimalUtils.divide(totalCurrentCostDec, dailyBudgetDec, 'financial'),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  const costVarianceDec = DecimalUtils.subtract(totalProjectedCostDec, dailyBudgetDec, 'financial');

  // Calculate efficiency score (lower overtime percentage = higher efficiency)
  const totalHoursDec = DecimalUtils.add(totalRegularHoursDec, totalOvertimeHoursDec, 'inventory');
  let efficiencyScoreDec = DecimalUtils.fromValue(100, 'financial');
  
  if (DecimalUtils.isPositive(totalHoursDec)) {
    const overtimePercentDec = DecimalUtils.multiply(
      DecimalUtils.divide(totalOvertimeHoursDec, totalHoursDec, 'inventory'),
      DecimalUtils.fromValue(100, 'inventory'),
      'inventory'
    );
    // Efficiency decreases with overtime percentage
    efficiencyScoreDec = DecimalUtils.subtract(
      DecimalUtils.fromValue(100, 'financial'),
      overtimePercentDec,
      'financial'
    );
  }

  return {
    date: new Date().toISOString().split('T')[0],
    total_current_cost: DecimalUtils.toNumber(totalCurrentCostDec),
    total_projected_cost: DecimalUtils.toNumber(totalProjectedCostDec),
    total_regular_hours: DecimalUtils.toNumber(totalRegularHoursDec),
    total_overtime_hours: DecimalUtils.toNumber(totalOvertimeHoursDec),
    total_regular_cost: DecimalUtils.toNumber(totalRegularCostDec),
    total_overtime_cost: DecimalUtils.toNumber(totalOvertimeCostDec),
    active_employees: employeeCosts.length,
    average_hourly_rate: DecimalUtils.toNumber(averageHourlyRateDec),
    budget_utilization_percent: DecimalUtils.toNumber(budgetUtilizationDec),
    cost_variance: DecimalUtils.toNumber(costVarianceDec),
    efficiency_score: Math.max(0, Math.min(100, DecimalUtils.toNumber(efficiencyScoreDec)))
  };
}

/**
 * Analyze overtime patterns and costs
 */
export function analyzeOvertimePattern(
  employeeCosts: LiveCostCalculation[]
): OvertimeAnalysis[] {
  return employeeCosts
    .filter(emp => emp.overtime_hours > 0)
    .map(emp => {
      const regularHoursDec = DecimalUtils.fromValue(emp.regular_hours, 'inventory');
      const overtimeHoursDec = DecimalUtils.fromValue(emp.overtime_hours, 'inventory');
      const totalHoursDec = DecimalUtils.add(regularHoursDec, overtimeHoursDec, 'inventory');

      // Calculate overtime percentage
      const overtimePercentDec = DecimalUtils.multiply(
        DecimalUtils.divide(overtimeHoursDec, totalHoursDec, 'inventory'),
        DecimalUtils.fromValue(100, 'inventory'),
        'inventory'
      );

      // Calculate additional cost due to overtime premium
      const regularRateDec = DecimalUtils.fromValue(emp.hourly_rate, 'financial');
      const overtimeRateDec = DecimalUtils.fromValue(emp.overtime_rate, 'financial');
      const overtimePremiumDec = DecimalUtils.subtract(overtimeRateDec, regularRateDec, 'financial');
      const additionalCostDec = DecimalUtils.multiply(overtimeHoursDec, overtimePremiumDec, 'financial');

      // Calculate cost impact percentage
      const totalCostDec = DecimalUtils.fromValue(emp.current_cost, 'financial');
      const costImpactDec = DecimalUtils.multiply(
        DecimalUtils.divide(additionalCostDec, totalCostDec, 'financial'),
        DecimalUtils.fromValue(100, 'financial'),
        'financial'
      );

      // Generate recommendation
      let recommendation: string;
      const overtimePercent = DecimalUtils.toNumber(overtimePercentDec);
      if (overtimePercent > 25) {
        recommendation = 'Critical: Consider additional staffing or schedule adjustment';
      } else if (overtimePercent > 15) {
        recommendation = 'High overtime usage - review workload distribution';
      } else if (overtimePercent > 10) {
        recommendation = 'Monitor overtime trends and plan accordingly';
      } else {
        recommendation = 'Acceptable overtime levels - continue monitoring';
      }

      return {
        employee_id: emp.employee_id,
        employee_name: emp.employee_name,
        regular_hours: emp.regular_hours,
        overtime_hours: emp.overtime_hours,
        overtime_percentage: DecimalUtils.toNumber(overtimePercentDec),
        additional_cost: DecimalUtils.toNumber(additionalCostDec),
        cost_impact_percentage: DecimalUtils.toNumber(costImpactDec),
        recommendation
      };
    })
    .sort((a, b) => b.overtime_percentage - a.overtime_percentage);
}

/**
 * Analyze budget variance with decimal precision
 */
export function analyzeBudgetVariance(
  actualCost: number,
  dailyBudget: number,
  previousDayCost?: number
): BudgetVarianceAnalysis {
  const actualDec = DecimalUtils.fromValue(actualCost, 'financial');
  const budgetDec = DecimalUtils.fromValue(dailyBudget, 'financial');

  // Calculate variance
  const varianceAmountDec = DecimalUtils.subtract(actualDec, budgetDec, 'financial');
  const variancePercentDec = DecimalUtils.multiply(
    DecimalUtils.divide(varianceAmountDec, budgetDec, 'financial'),
    DecimalUtils.fromValue(100, 'financial'),
    'financial'
  );

  const varianceAmount = DecimalUtils.toNumber(varianceAmountDec);
  const variancePercent = DecimalUtils.toNumber(variancePercentDec);

  // Determine variance type
  let varianceType: 'over' | 'under' | 'on_target';
  if (Math.abs(variancePercent) < 5) {
    varianceType = 'on_target';
  } else if (variancePercent > 0) {
    varianceType = 'over';
  } else {
    varianceType = 'under';
  }

  // Determine cost trend
  let costTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  if (previousDayCost !== undefined) {
    const previousDec = DecimalUtils.fromValue(previousDayCost, 'financial');
    const changePercentDec = DecimalUtils.multiply(
      DecimalUtils.divide(
        DecimalUtils.subtract(actualDec, previousDec, 'financial'),
        previousDec,
        'financial'
      ),
      DecimalUtils.fromValue(100, 'financial'),
      'financial'
    );

    const changePercent = DecimalUtils.toNumber(changePercentDec);
    if (changePercent > 5) costTrend = 'increasing';
    else if (changePercent < -5) costTrend = 'decreasing';
  }

  // Project monthly impact
  const monthlyImpactDec = DecimalUtils.multiply(varianceAmountDec, DecimalUtils.fromValue(30, 'financial'), 'financial');

  return {
    daily_budget: dailyBudget,
    actual_cost: actualCost,
    variance_amount: varianceAmount,
    variance_percentage: variancePercent,
    variance_type: varianceType,
    cost_trend: costTrend,
    projected_monthly_impact: DecimalUtils.toNumber(monthlyImpactDec)
  };
}

/**
 * Calculate labor efficiency metrics
 */
export function calculateLaborEfficiency(
  employeeCosts: LiveCostCalculation[],
  _targetProductivity: number = 100 // Reserved for future productivity calculations
): {
  overall_efficiency: number;
  cost_per_hour: number;
  productivity_score: number;
  efficiency_recommendations: string[];
} {
  if (employeeCosts.length === 0) {
    return {
      overall_efficiency: 0,
      cost_per_hour: 0,
      productivity_score: 0,
      efficiency_recommendations: ['No active employees to analyze']
    };
  }

  const summary = calculateDailyCostSummary(employeeCosts, 1000); // Using arbitrary budget for calculation

  const totalHoursDec = DecimalUtils.add(
    DecimalUtils.fromValue(summary.total_regular_hours, 'inventory'),
    DecimalUtils.fromValue(summary.total_overtime_hours, 'inventory'),
    'inventory'
  );

  const totalCostDec = DecimalUtils.fromValue(summary.total_current_cost, 'financial');
  
  // Calculate cost per hour
  const costPerHourDec = DecimalUtils.isZero(totalHoursDec)
    ? DecimalUtils.fromValue(0, 'financial')
    : DecimalUtils.divide(totalCostDec, totalHoursDec, 'financial');

  // Calculate efficiency (lower overtime = higher efficiency)
  const efficiencyScore = summary.efficiency_score;

  // Calculate productivity score (this would need actual productivity data)
  // For now, we'll base it on overtime usage as a proxy
  const productivityScore = Math.max(0, 100 - (summary.total_overtime_hours * 5));

  // Generate recommendations
  const recommendations: string[] = [];
  if (summary.total_overtime_hours > summary.total_regular_hours * 0.15) {
    recommendations.push('High overtime usage detected - consider additional hiring');
  }
  if (summary.average_hourly_rate > 25) {
    recommendations.push('High average hourly rate - review compensation structure');
  }
  if (efficiencyScore < 80) {
    recommendations.push('Low efficiency score - review scheduling and workload distribution');
  }
  if (productivityScore < 70) {
    recommendations.push('Consider productivity training and process optimization');
  }

  return {
    overall_efficiency: efficiencyScore,
    cost_per_hour: DecimalUtils.toNumber(costPerHourDec),
    productivity_score: productivityScore,
    efficiency_recommendations: recommendations.length > 0 ? recommendations : ['Labor efficiency is within acceptable ranges']
  };
}