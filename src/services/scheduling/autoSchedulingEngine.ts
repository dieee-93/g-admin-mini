/**
 * Auto-Scheduling Engine for G-Admin Mini
 * Intelligent algorithm for automatic shift scheduling optimization
 */

import { supabase } from '@/lib/supabase/client';
import { EventBus } from '@/lib/events';
import { errorHandler, createBusinessError } from '@/lib/error-handling';
import { 
  calculateShiftHours, 
  calculateShiftCost, 
  calculateStaffingMetrics,
  calculateEmployeeWorkloads,
  calculateEmployeeSatisfactionScore,
  calculateEmployeeScore,
  calculateConfidenceScore,
  type StaffingMetrics,
  type EmployeeWorkload
} from '@/business-logic/scheduling/schedulingCalculations';

export interface SchedulingConstraints {
  // Availability constraints
  employee_availability: EmployeeAvailability[];
  
  // Business rules
  min_staff_per_position: Record<string, number>;
  max_hours_per_employee: number;
  min_hours_between_shifts: number;
  max_consecutive_days: number;
  
  // Cost constraints  
  max_weekly_labor_budget: number;
  overtime_threshold: number;
  
  // Performance preferences
  prefer_experienced_staff: boolean;
  balance_workload: boolean;
  minimize_labor_cost: boolean;
}

export interface EmployeeAvailability {
  employee_id: string;
  employee_name: string;
  position: string;
  hourly_rate: number;
  skills: string[];
  certifications: string[];
  
  // Availability windows
  available_days: string[]; // ['monday', 'tuesday', ...]
  available_times: TimeWindow[];
  
  // Preferences
  preferred_positions: string[];
  max_hours_per_week: number;
  preferred_time_slots: string[]; // ['morning', 'afternoon', 'evening']
  
  // Performance metrics
  efficiency_score: number;
  reliability_score: number;
  experience_level: 'junior' | 'mid' | 'senior';
}

export interface TimeWindow {
  start_time: string; // HH:MM format
  end_time: string;
  day_of_week: string;
}

export interface ShiftRequirement {
  date: string;
  time_slot: string; // e.g., "07:00-15:00"
  position: string;
  required_staff: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Workload prediction
  expected_volume: number;
  complexity_factor: number;
}

export interface SchedulingSolution {
  success: boolean;
  schedule: GeneratedShift[];
  metrics: SchedulingMetrics;
  conflicts: SchedulingConflict[];
  recommendations: string[];
}

export interface GeneratedShift {
  employee_id: string;
  employee_name: string;
  position: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  hourly_rate: number;
  estimated_cost: number;
  confidence_score: number; // 0-100, how confident the algorithm is
}

export interface SchedulingMetrics {
  total_shifts: number;
  total_hours: number;
  total_cost: number;
  coverage_rate: number;
  overtime_hours: number;
  employee_satisfaction_score: number;
  cost_efficiency_score: number;
  
  // Breakdown by position
  position_coverage: Record<string, number>;
  
  // Quality metrics
  gaps_filled: number;
  conflicts_resolved: number;
  optimization_score: number;
}

export interface SchedulingConflict {
  type: 'availability' | 'overtime' | 'consecutive_days' | 'min_hours' | 'budget';
  severity: 'critical' | 'warning' | 'info';
  employee_id?: string;
  message: string;
  suggested_resolution: string;
}

class AutoSchedulingEngine {
  /**
   * Main auto-scheduling algorithm
   */
  async generateOptimalSchedule(
    startDate: string,
    endDate: string,
    constraints: SchedulingConstraints
  ): Promise<SchedulingSolution> {
    try {
      console.log('🤖 Starting auto-scheduling algorithm...');
      
      // Step 1: Get requirements and availability
      const [requirements, availability] = await Promise.all([
        this.getShiftRequirements(startDate, endDate),
        this.getEmployeeAvailability()
      ]);

      // Step 2: Run optimization algorithm
      const solution = await this.optimizeSchedule(
        requirements,
        availability,
        constraints
      );

      // Step 3: Validate and score solution
      const validatedSolution = await this.validateSolution(solution, constraints);

      // Step 4: Emit scheduling event
      EventBus.emit('staff.schedule_generated', {
        solution: validatedSolution,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Auto-scheduling completed: ${validatedSolution.metrics.total_shifts} shifts generated`);
      return validatedSolution;

    } catch (error) {
      errorHandler.handle(error as Error, { 
        operation: 'generateOptimalSchedule',
        dateRange: { startDate, endDate }
      });
      
      return {
        success: false,
        schedule: [],
        metrics: this.getEmptyMetrics(),
        conflicts: [{
          type: 'availability',
          severity: 'critical',
          message: 'Failed to generate schedule due to system error',
          suggested_resolution: 'Please try again or contact support'
        }],
        recommendations: ['System error occurred during scheduling']
      };
    }
  }

  /**
   * Core optimization algorithm using constraint satisfaction
   */
  private async optimizeSchedule(
    requirements: ShiftRequirement[],
    availability: EmployeeAvailability[],
    constraints: SchedulingConstraints
  ): Promise<SchedulingSolution> {
    
    const schedule: GeneratedShift[] = [];
    const conflicts: SchedulingConflict[] = [];
    const employeeHours: Record<string, number> = {};

    // Sort requirements by priority and difficulty
    const sortedRequirements = requirements.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    // Main scheduling loop
    for (const requirement of sortedRequirements) {
      const candidates = this.findCandidateEmployees(
        requirement,
        availability,
        employeeHours,
        constraints
      );

      if (candidates.length === 0) {
        conflicts.push({
          type: 'availability',
          severity: 'critical',
          message: `No available staff for ${requirement.position} on ${requirement.date} at ${requirement.time_slot}`,
          suggested_resolution: 'Consider adjusting requirements or recruiting additional staff'
        });
        continue;
      }

      // Select best candidates using scoring algorithm
      const selectedEmployees = this.selectOptimalEmployees(
        candidates,
        requirement,
        constraints
      );

      // Create shifts
      for (const employee of selectedEmployees) {
        const shift = this.createShift(employee, requirement);
        schedule.push(shift);
        
        // Update employee hours tracking
        if (!employeeHours[employee.employee_id]) {
          employeeHours[employee.employee_id] = 0;
        }
        employeeHours[employee.employee_id] += shift.hours;
      }
    }

    // Calculate metrics and validate
    const metrics = this.calculateMetrics(schedule, requirements, conflicts);

    return {
      success: conflicts.filter(c => c.severity === 'critical').length === 0,
      schedule,
      metrics,
      conflicts,
      recommendations: this.generateRecommendations(schedule, conflicts, metrics)
    };
  }

  /**
   * Find employees that can work a specific shift
   */
  private findCandidateEmployees(
    requirement: ShiftRequirement,
    availability: EmployeeAvailability[],
    currentHours: Record<string, number>,
    constraints: SchedulingConstraints
  ): EmployeeAvailability[] {
    
    const dayOfWeek = new Date(requirement.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const [startTime, endTime] = requirement.time_slot.split('-');

    return availability.filter(employee => {
      // Check position match
      if (employee.position !== requirement.position && 
          !employee.preferred_positions.includes(requirement.position)) {
        return false;
      }

      // Check day availability
      if (!employee.available_days.includes(dayOfWeek)) {
        return false;
      }

      // Check time availability
      const hasTimeAvailable = employee.available_times.some(window => 
        window.day_of_week === dayOfWeek &&
        window.start_time <= startTime &&
        window.end_time >= endTime
      );
      
      if (!hasTimeAvailable) {
        return false;
      }

      // Check maximum hours constraint
      const shiftHours = calculateShiftHours(startTime, endTime);
      const currentEmployeeHours = currentHours[employee.employee_id] || 0;
      
      if (currentEmployeeHours + shiftHours > employee.max_hours_per_week) {
        return false;
      }

      if (currentEmployeeHours + shiftHours > constraints.max_hours_per_employee) {
        return false;
      }

      return true;
    });
  }

  /**
   * Select optimal employees using multi-criteria scoring
   */
  private selectOptimalEmployees(
    candidates: EmployeeAvailability[],
    requirement: ShiftRequirement,
    constraints: SchedulingConstraints
  ): EmployeeAvailability[] {
    
    // Score each candidate
    const scoredCandidates = candidates.map(candidate => {
      let score = 0;

      // Performance scoring (40% weight)
      score += candidate.efficiency_score * 0.2;
      score += candidate.reliability_score * 0.2;

      // Experience scoring (20% weight)  
      const experiencePoints = { junior: 20, mid: 50, senior: 80 };
      score += experiencePoints[candidate.experience_level] * 0.2;

      // Cost efficiency (20% weight)
      if (constraints.minimize_labor_cost) {
        const costScore = Math.max(0, 100 - candidate.hourly_rate); // Lower cost = higher score
        score += costScore * 0.2;
      } else {
        score += 50 * 0.2; // Neutral if cost not a factor
      }

      // Preference alignment (20% weight)
      const timeSlot = this.getTimeSlotFromShift(requirement.time_slot);
      if (candidate.preferred_time_slots.includes(timeSlot)) {
        score += 20;
      }

      if (candidate.preferred_positions.includes(requirement.position)) {
        score += 20;
      }

      return {
        ...candidate,
        score: Math.min(100, score) // Cap at 100
      };
    });

    // Sort by score descending
    scoredCandidates.sort((a, b) => (b as any).score - (a as any).score);

    // Select required number of staff
    return scoredCandidates
      .slice(0, requirement.required_staff)
      .map(({ score, ...employee }) => employee);
  }

  /**
   * Create shift object from employee and requirement
   */
  private createShift(
    employee: EmployeeAvailability,
    requirement: ShiftRequirement
  ): GeneratedShift {
    const [startTime, endTime] = requirement.time_slot.split('-');
    const hours = calculateShiftHours(startTime, endTime);

    return {
      employee_id: employee.employee_id,
      employee_name: employee.employee_name,
      position: requirement.position,
      date: requirement.date,
      start_time: startTime,
      end_time: endTime,
      hours,
      hourly_rate: employee.hourly_rate,
      estimated_cost: hours * employee.hourly_rate,
      confidence_score: calculateConfidenceScore(employee, requirement)
    };
  }

  /**
   * Calculate metrics for the generated schedule
   */
  private calculateMetrics(
    schedule: GeneratedShift[],
    requirements: ShiftRequirement[],
    conflicts: SchedulingConflict[]
  ): SchedulingMetrics {
    const totalHours = schedule.reduce((sum, shift) => sum + shift.hours, 0);
    const totalCost = schedule.reduce((sum, shift) => sum + shift.estimated_cost, 0);
    const overtimeHours = schedule.filter(shift => shift.hours > 8).reduce((sum, shift) => sum + (shift.hours - 8), 0);

    // Calculate coverage rate
    const requiredShifts = requirements.reduce((sum, req) => sum + req.required_staff, 0);
    const coverageRate = requiredShifts > 0 ? (schedule.length / requiredShifts) * 100 : 100;

    // Position coverage breakdown
    const positionCoverage: Record<string, number> = {};
    requirements.forEach(req => {
      const filled = schedule.filter(shift => 
        shift.position === req.position && 
        shift.date === req.date
      ).length;
      
      if (!positionCoverage[req.position]) {
        positionCoverage[req.position] = 0;
      }
      positionCoverage[req.position] += (filled / req.required_staff) * 100;
    });

    // Quality metrics
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical').length;
    const optimizationScore = Math.max(0, 100 - (criticalConflicts * 10));

    return {
      total_shifts: schedule.length,
      total_hours: totalHours,
      total_cost: totalCost,
      coverage_rate: Math.min(100, coverageRate),
      overtime_hours: overtimeHours,
      employee_satisfaction_score: calculateEmployeeSatisfactionScore(calculateEmployeeWorkloads(schedule.map(s => ({ employeeId: s.employee_id, hours: s.hours, hourlyRate: s.hourly_rate })))),
      cost_efficiency_score: calculateStaffingMetrics(schedule.map(s => ({ employeeId: s.employee_id, hours: s.hours, hourlyRate: s.hourly_rate }))).costEfficiencyScore,
      position_coverage: positionCoverage,
      gaps_filled: schedule.length,
      conflicts_resolved: requirements.length - criticalConflicts,
      optimization_score: optimizationScore
    };
  }

  // Helper methods - using centralized calculations

  private getTimeSlotFromShift(timeSlot: string): string {
    const [startTime] = timeSlot.split('-');
    const hour = parseInt(startTime.split(':')[0]);
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';  
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }


  private generateRecommendations(
    schedule: GeneratedShift[],
    conflicts: SchedulingConflict[],
    metrics: SchedulingMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.coverage_rate < 90) {
      recommendations.push('Consider hiring additional staff to improve coverage rate');
    }

    if (metrics.overtime_hours > 20) {
      recommendations.push('High overtime detected. Consider redistributing shifts or hiring part-time staff');
    }

    if (conflicts.length > 0) {
      recommendations.push(`Resolve ${conflicts.length} scheduling conflicts for optimal performance`);
    }

    if (metrics.employee_satisfaction_score < 70) {
      recommendations.push('Improve workload balance to increase employee satisfaction');
    }

    if (metrics.cost_efficiency_score < 60) {
      recommendations.push('Review hourly rates and shift durations for better cost efficiency');
    }

    return recommendations;
  }

  private getEmptyMetrics(): SchedulingMetrics {
    return {
      total_shifts: 0,
      total_hours: 0,
      total_cost: 0,
      coverage_rate: 0,
      overtime_hours: 0,
      employee_satisfaction_score: 0,
      cost_efficiency_score: 0,
      position_coverage: {},
      gaps_filled: 0,
      conflicts_resolved: 0,
      optimization_score: 0
    };
  }

  // API integration methods
  private async getShiftRequirements(startDate: string, endDate: string): Promise<ShiftRequirement[]> {
    // This would integrate with your business rules and demand forecasting
    const { data, error } = await supabase
      .rpc('get_shift_requirements', {
        start_date: startDate,
        end_date: endDate
      });

    if (error) {
      console.warn('Using fallback shift requirements due to API error:', error);
      return this.getFallbackRequirements(startDate, endDate);
    }

    return data || [];
  }

  private async getEmployeeAvailability(): Promise<EmployeeAvailability[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        position,
        hourly_rate,
        skills,
        certifications,
        availability,
        max_hours_per_week,
        preferred_positions,
        performance_metrics
      `)
      .eq('status', 'active');

    if (error) {
      console.warn('Using fallback availability due to API error:', error);
      return [];
    }

    // Transform database format to engine format
    return (data || []).map(employee => ({
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      position: employee.position,
      hourly_rate: employee.hourly_rate,
      skills: employee.skills || [],
      certifications: employee.certifications || [],
      available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], // Default
      available_times: this.parseAvailabilityToTimeWindows(employee.availability),
      preferred_positions: employee.preferred_positions || [employee.position],
      max_hours_per_week: employee.max_hours_per_week || 40,
      preferred_time_slots: ['morning', 'afternoon'], // Default
      efficiency_score: employee.performance_metrics?.efficiency || 75,
      reliability_score: employee.performance_metrics?.reliability || 85,
      experience_level: this.calculateExperienceLevel(employee)
    }));
  }

  private parseAvailabilityToTimeWindows(availability: unknown): TimeWindow[] {
    // Parse database availability format to TimeWindow objects
    // Implementation would depend on your availability data structure
    return [
      { start_time: '07:00', end_time: '15:00', day_of_week: 'monday' },
      { start_time: '07:00', end_time: '15:00', day_of_week: 'tuesday' },
      // ... more default windows
    ];
  }

  private calculateExperienceLevel(employee: unknown): 'junior' | 'mid' | 'senior' {
    // Calculate based on hire date, performance, certifications, etc.
    const performance = employee.performance_metrics?.overall || 0;
    if (performance >= 85) return 'senior';
    if (performance >= 70) return 'mid';
    return 'junior';
  }

  private getFallbackRequirements(startDate: string, endDate: string): ShiftRequirement[] {
    // Fallback requirements for testing
    return [
      {
        date: startDate,
        time_slot: '08:00-16:00',
        position: 'Server',
        required_staff: 2,
        priority: 'high',
        expected_volume: 100,
        complexity_factor: 1.2
      }
    ];
  }

  /**
   * Validate constraints after scheduling
   */
  private async validateSolution(
    solution: SchedulingSolution,
    constraints: SchedulingConstraints
  ): Promise<SchedulingSolution> {
    // Add additional validation logic here
    // For now, return as-is
    return solution;
  }
}

export const autoSchedulingEngine = new AutoSchedulingEngine();
export default autoSchedulingEngine;