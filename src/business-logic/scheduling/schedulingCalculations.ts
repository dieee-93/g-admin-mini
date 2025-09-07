/**
 * Scheduling Calculations Engine
 * Pure calculation functions for scheduling optimization with Decimal.js precision
 */

import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export interface ShiftCostCalculation {
  hours: number;
  hourlyRate: number;
  estimatedCost: number;
  overtimeCost: number;
  totalCost: number;
}

export interface StaffingMetrics {
  totalHours: number;
  totalCost: number;
  averageHourlyRate: number;
  overtimeHours: number;
  regularHours: number;
  costEfficiencyScore: number;
}

export interface EmployeeWorkload {
  employeeId: string;
  totalHours: number;
  overtimeHours: number;
  regularHours: number;
  totalCost: number;
  workloadScore: number; // 0-100, balanced workload score
}

/**
 * Calculate shift hours with precise time calculations
 */
export function calculateShiftHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutesDec = DecimalUtils.add(
    DecimalUtils.multiply(DecimalUtils.fromValue(startHour, 'financial'), DecimalUtils.fromValue(60, 'financial'), 'financial'),
    DecimalUtils.fromValue(startMin, 'financial'), 
    'financial'
  );
  
  const endMinutesDec = DecimalUtils.add(
    DecimalUtils.multiply(DecimalUtils.fromValue(endHour, 'financial'), DecimalUtils.fromValue(60, 'financial'), 'financial'),
    DecimalUtils.fromValue(endMin, 'financial'), 
    'financial'
  );
  
  const totalMinutesDec = DecimalUtils.subtract(endMinutesDec, startMinutesDec, 'financial');
  const hoursDec = DecimalUtils.divide(totalMinutesDec, DecimalUtils.fromValue(60, 'financial'), 'financial');
  
  return DecimalUtils.toNumber(hoursDec);
}

/**
 * Calculate shift cost breakdown with overtime calculations
 */
export function calculateShiftCost(
  hours: number, 
  hourlyRate: number, 
  overtimeThreshold: number = 8,
  overtimeMultiplier: number = 1.5
): ShiftCostCalculation {
  const hoursDec = DecimalUtils.fromValue(hours, 'financial');
  const rateDec = DecimalUtils.fromValue(hourlyRate, 'financial');
  const thresholdDec = DecimalUtils.fromValue(overtimeThreshold, 'financial');
  const multiplierDec = DecimalUtils.fromValue(overtimeMultiplier, 'financial');
  
  // Calculate regular and overtime hours
  const regularHoursDec = DecimalUtils.min(hoursDec, thresholdDec);
  const overtimeHoursDec = DecimalUtils.isPositive(DecimalUtils.subtract(hoursDec, thresholdDec, 'financial')) 
    ? DecimalUtils.subtract(hoursDec, thresholdDec, 'financial')
    : DecimalUtils.fromValue(0, 'financial');
  
  // Calculate costs
  const regularCostDec = DecimalUtils.multiply(regularHoursDec, rateDec, 'financial');
  const overtimeRateDec = DecimalUtils.multiply(rateDec, multiplierDec, 'financial');
  const overtimeCostDec = DecimalUtils.multiply(overtimeHoursDec, overtimeRateDec, 'financial');
  const totalCostDec = DecimalUtils.add(regularCostDec, overtimeCostDec, 'financial');
  
  return {
    hours: DecimalUtils.toNumber(hoursDec),
    hourlyRate: DecimalUtils.toNumber(rateDec),
    estimatedCost: DecimalUtils.toNumber(regularCostDec),
    overtimeCost: DecimalUtils.toNumber(overtimeCostDec),
    totalCost: DecimalUtils.toNumber(totalCostDec)
  };
}

/**
 * Calculate staffing metrics for a set of shifts
 */
export function calculateStaffingMetrics(shifts: Array<{
  hours: number;
  hourlyRate: number;
  employeeId: string;
}>): StaffingMetrics {
  if (shifts.length === 0) {
    return {
      totalHours: 0,
      totalCost: 0,
      averageHourlyRate: 0,
      overtimeHours: 0,
      regularHours: 0,
      costEfficiencyScore: 0
    };
  }
  
  let totalHoursDec = DecimalUtils.fromValue(0, 'financial');
  let totalCostDec = DecimalUtils.fromValue(0, 'financial');
  let totalRatesDec = DecimalUtils.fromValue(0, 'financial');
  let overtimeHoursDec = DecimalUtils.fromValue(0, 'financial');
  
  shifts.forEach(shift => {
    const shiftCost = calculateShiftCost(shift.hours, shift.hourlyRate);
    
    totalHoursDec = DecimalUtils.add(totalHoursDec, DecimalUtils.fromValue(shift.hours, 'financial'), 'financial');
    totalCostDec = DecimalUtils.add(totalCostDec, DecimalUtils.fromValue(shiftCost.totalCost, 'financial'), 'financial');
    totalRatesDec = DecimalUtils.add(totalRatesDec, DecimalUtils.fromValue(shift.hourlyRate, 'financial'), 'financial');
    
    if (shift.hours > 8) {
      overtimeHoursDec = DecimalUtils.add(overtimeHoursDec, DecimalUtils.fromValue(shift.hours - 8, 'financial'), 'financial');
    }
  });
  
  const averageRateDec = DecimalUtils.divide(totalRatesDec, DecimalUtils.fromValue(shifts.length, 'financial'), 'financial');
  const regularHoursDec = DecimalUtils.subtract(totalHoursDec, overtimeHoursDec, 'financial');
  
  // Calculate cost efficiency (lower is better)
  const averageCostPerHourDec = DecimalUtils.divide(totalCostDec, totalHoursDec, 'financial');
  const efficiencyDec = DecimalUtils.subtract(
    DecimalUtils.fromValue(100, 'financial'),
    DecimalUtils.divide(averageCostPerHourDec, averageRateDec, 'financial'),
    'financial'
  );
  
  return {
    totalHours: DecimalUtils.toNumber(totalHoursDec),
    totalCost: DecimalUtils.toNumber(totalCostDec),
    averageHourlyRate: DecimalUtils.toNumber(averageRateDec),
    overtimeHours: DecimalUtils.toNumber(overtimeHoursDec),
    regularHours: DecimalUtils.toNumber(regularHoursDec),
    costEfficiencyScore: Math.max(0, Math.min(100, DecimalUtils.toNumber(efficiencyDec)))
  };
}

/**
 * Calculate employee workload distribution
 */
export function calculateEmployeeWorkloads(shifts: Array<{
  employeeId: string;
  hours: number;
  hourlyRate: number;
}>): EmployeeWorkload[] {
  const employeeMap = new Map<string, {
    hours: number;
    rates: number[];
    costs: number[];
  }>();
  
  // Group shifts by employee
  shifts.forEach(shift => {
    const existing = employeeMap.get(shift.employeeId) || { hours: 0, rates: [], costs: [] };
    const shiftCost = calculateShiftCost(shift.hours, shift.hourlyRate);
    
    existing.hours += shift.hours;
    existing.rates.push(shift.hourlyRate);
    existing.costs.push(shiftCost.totalCost);
    
    employeeMap.set(shift.employeeId, existing);
  });
  
  // Calculate workload metrics for each employee
  const workloads: EmployeeWorkload[] = [];
  const allHours = Array.from(employeeMap.values()).map(e => e.hours);
  const averageHoursDec = allHours.length > 0 
    ? DecimalUtils.divide(
        allHours.reduce((sum, hours) => DecimalUtils.add(sum, DecimalUtils.fromValue(hours, 'financial'), 'financial'), DecimalUtils.fromValue(0, 'financial')),
        DecimalUtils.fromValue(allHours.length, 'financial'),
        'financial'
      )
    : DecimalUtils.fromValue(0, 'financial');
  
  employeeMap.forEach((data, employeeId) => {
    const hoursDec = DecimalUtils.fromValue(data.hours, 'financial');
    const overtimeHoursDec = DecimalUtils.isPositive(DecimalUtils.subtract(hoursDec, DecimalUtils.fromValue(40, 'financial'), 'financial'))
      ? DecimalUtils.subtract(hoursDec, DecimalUtils.fromValue(40, 'financial'), 'financial')
      : DecimalUtils.fromValue(0, 'financial');
    const regularHoursDec = DecimalUtils.subtract(hoursDec, overtimeHoursDec, 'financial');
    
    const totalCostDec = data.costs.reduce((sum, cost) => 
      DecimalUtils.add(sum, DecimalUtils.fromValue(cost, 'financial'), 'financial'), 
      DecimalUtils.fromValue(0, 'financial')
    );
    
    // Calculate workload balance score (0-100, where 100 is perfectly balanced)
    const hoursDifferenceDec = DecimalUtils.abs(DecimalUtils.subtract(hoursDec, averageHoursDec, 'financial'));
    const workloadScoreDec = DecimalUtils.subtract(
      DecimalUtils.fromValue(100, 'financial'),
      DecimalUtils.multiply(hoursDifferenceDec, DecimalUtils.fromValue(2, 'financial'), 'financial'),
      'financial'
    );
    
    workloads.push({
      employeeId,
      totalHours: DecimalUtils.toNumber(hoursDec),
      overtimeHours: DecimalUtils.toNumber(overtimeHoursDec),
      regularHours: DecimalUtils.toNumber(regularHoursDec),
      totalCost: DecimalUtils.toNumber(totalCostDec),
      workloadScore: Math.max(0, Math.min(100, DecimalUtils.toNumber(workloadScoreDec)))
    });
  });
  
  return workloads.sort((a, b) => b.workloadScore - a.workloadScore);
}

/**
 * Calculate employee satisfaction score based on workload distribution
 */
export function calculateEmployeeSatisfactionScore(workloads: EmployeeWorkload[]): number {
  if (workloads.length === 0) return 0;
  
  const workloadScoresDec = workloads.map(w => DecimalUtils.fromValue(w.workloadScore, 'financial'));
  const averageScoreDec = workloadScoresDec.reduce(
    (sum, score) => DecimalUtils.add(sum, score, 'financial'),
    DecimalUtils.fromValue(0, 'financial')
  );
  
  const finalScoreDec = DecimalUtils.divide(averageScoreDec, DecimalUtils.fromValue(workloads.length, 'financial'), 'financial');
  
  return DecimalUtils.toNumber(finalScoreDec);
}

/**
 * Calculate optimal employee scoring for shift assignment
 */
export function calculateEmployeeScore(
  employeeData: {
    efficiencyScore: number;
    reliabilityScore: number;
    experienceLevel: 'junior' | 'mid' | 'senior';
    hourlyRate: number;
    preferredPositions: string[];
    preferredTimeSlots: string[];
  },
  shiftRequirement: {
    position: string;
    timeSlot: string;
  },
  constraints: {
    minimizeLaborCost: boolean;
    preferExperiencedStaff: boolean;
  }
): number {
  let scoreDec = DecimalUtils.fromValue(0, 'financial');
  
  // Performance scoring (40% weight)
  const efficiencyDec = DecimalUtils.multiply(
    DecimalUtils.fromValue(employeeData.efficiencyScore, 'financial'),
    DecimalUtils.fromValue(0.2, 'financial'),
    'financial'
  );
  const reliabilityDec = DecimalUtils.multiply(
    DecimalUtils.fromValue(employeeData.reliabilityScore, 'financial'),
    DecimalUtils.fromValue(0.2, 'financial'),
    'financial'
  );
  
  scoreDec = DecimalUtils.add(scoreDec, efficiencyDec, 'financial');
  scoreDec = DecimalUtils.add(scoreDec, reliabilityDec, 'financial');
  
  // Experience scoring (20% weight)
  const experiencePoints = { junior: 20, mid: 50, senior: 80 };
  const experienceScoreDec = DecimalUtils.multiply(
    DecimalUtils.fromValue(experiencePoints[employeeData.experienceLevel], 'financial'),
    DecimalUtils.fromValue(0.2, 'financial'),
    'financial'
  );
  
  if (constraints.preferExperiencedStaff) {
    scoreDec = DecimalUtils.add(scoreDec, experienceScoreDec, 'financial');
  } else {
    scoreDec = DecimalUtils.add(scoreDec, DecimalUtils.fromValue(50 * 0.2, 'financial'), 'financial');
  }
  
  // Cost efficiency (20% weight)
  if (constraints.minimizeLaborCost) {
    const maxReasonableRate = 50; // Assume $50/hour is high
    const costScoreDec = DecimalUtils.multiply(
      DecimalUtils.subtract(
        DecimalUtils.fromValue(maxReasonableRate, 'financial'),
        DecimalUtils.fromValue(employeeData.hourlyRate, 'financial'),
        'financial'
      ),
      DecimalUtils.fromValue(0.2, 'financial'),
      'financial'
    );
    scoreDec = DecimalUtils.add(scoreDec, DecimalUtils.max(DecimalUtils.fromValue(0, 'financial'), costScoreDec), 'financial');
  } else {
    scoreDec = DecimalUtils.add(scoreDec, DecimalUtils.fromValue(50 * 0.2, 'financial'), 'financial');
  }
  
  // Preference alignment (20% weight)
  let preferenceBonusDec = DecimalUtils.fromValue(0, 'financial');
  
  if (employeeData.preferredPositions.includes(shiftRequirement.position)) {
    preferenceBonusDec = DecimalUtils.add(preferenceBonusDec, DecimalUtils.fromValue(10, 'financial'), 'financial');
  }
  
  const timeSlot = getTimeSlotFromShift(shiftRequirement.timeSlot);
  if (employeeData.preferredTimeSlots.includes(timeSlot)) {
    preferenceBonusDec = DecimalUtils.add(preferenceBonusDec, DecimalUtils.fromValue(10, 'financial'), 'financial');
  }
  
  scoreDec = DecimalUtils.add(scoreDec, preferenceBonusDec, 'financial');
  
  return Math.min(100, Math.max(0, DecimalUtils.toNumber(scoreDec)));
}

/**
 * Get time slot category from shift time
 */
function getTimeSlotFromShift(timeSlot: string): string {
  const [startTime] = timeSlot.split('-');
  const hour = parseInt(startTime.split(':')[0]);
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Calculate confidence score for a shift assignment
 */
export function calculateConfidenceScore(
  employeeData: {
    experienceLevel: 'junior' | 'mid' | 'senior';
    position: string;
    reliabilityScore: number;
  },
  shiftRequirement: {
    position: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }
): number {
  let confidenceDec = DecimalUtils.fromValue(70, 'financial'); // Base confidence
  
  // Experience boost
  if (employeeData.experienceLevel === 'senior') {
    confidenceDec = DecimalUtils.add(confidenceDec, DecimalUtils.fromValue(15, 'financial'), 'financial');
  } else if (employeeData.experienceLevel === 'mid') {
    confidenceDec = DecimalUtils.add(confidenceDec, DecimalUtils.fromValue(10, 'financial'), 'financial');
  }
  
  // Position match boost
  if (employeeData.position === shiftRequirement.position) {
    confidenceDec = DecimalUtils.add(confidenceDec, DecimalUtils.fromValue(10, 'financial'), 'financial');
  }
  
  // Reliability boost
  if (employeeData.reliabilityScore > 90) {
    confidenceDec = DecimalUtils.add(confidenceDec, DecimalUtils.fromValue(5, 'financial'), 'financial');
  }
  
  return Math.min(100, Math.max(0, DecimalUtils.toNumber(confidenceDec)));
}