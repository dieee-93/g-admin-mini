// Team Labor Cost API - Advanced Labor Cost Calculations
// Extracted from services/team/teamApi.ts

import { supabase } from '@/lib/supabase/client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface LaborCostData {
  teamMember_id: string;
  name: string;
  position: string;
  department: string;
  hourly_rate: number;
  hours_scheduled: number;
  hours_worked: number;
  overtime_hours: number;
  regular_cost: number;
  overtime_cost: number;
  total_cost: number;
  efficiency_rating: number;
  cost_per_performance_point: number;
}

export interface LaborCostSummary {
  period: string;
  total_scheduled_cost: number;
  total_actual_cost: number;
  variance: number;
  variance_percentage: number;
  total_hours_scheduled: number;
  total_hours_worked: number;
  average_hourly_cost: number;
  department_breakdown: Record<string, {
    scheduled_cost: number;
    actual_cost: number;
    hours_worked: number;
    teamMember_count: number;
    avg_efficiency: number;
  }>;
  cost_efficiency_score: number;
}

export interface CostPerHourAnalysis {
  department: string;
  teamMembers: number;
  avg_hourly_cost: number;
  avg_performance: number;
  cost_per_performance_point: number;
  total_weekly_hours: number;
  efficiency_score: number;
}

// =====================================================
// LABOR COST CALCULATIONS
// =====================================================

/**
 * Calculate labor costs for a specific period
 */
export async function calculateLaborCosts(
  startDate: string,
  endDate: string,
  departmentFilter?: string
): Promise<LaborCostData[]> {
  // Get teamMembers with their salary/hourly rate info
  let teamMemberQuery = supabase
    .from('team_members')
    .select('id, first_name, last_name, position, department, salary, weekly_hours, performance_score, attendance_rate')
    .eq('employment_status', 'active');

  if (departmentFilter && departmentFilter !== 'all') {
    teamMemberQuery = teamMemberQuery.eq('department', departmentFilter);
  }

  const { data: teamMembers } = await teamMemberQuery;
  if (!teamMembers) return [];

  // Get shift schedules for the period
  const { data: schedules } = await supabase
    .from('shift_schedules')
    .select('teamMember_id, date, start_time, end_time, status, break_duration')
    .gte('date', startDate)
    .lte('date', endDate)
    .in('teamMember_id', teamMembers.map(e => e.id));

  // Get actual time entries for comparison
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('teamMember_id, entry_type, timestamp')
    .gte('timestamp', startDate + 'T00:00:00Z')
    .lte('timestamp', endDate + 'T23:59:59Z')
    .in('teamMember_id', teamMembers.map(e => e.id));

  // Calculate costs for each teamMember
  const laborCostData: LaborCostData[] = teamMembers.map(teamMember => {
    // Calculate hourly rate (assuming salary is monthly)
    const monthlyHours = (teamMember.weekly_hours || 40) * 4.33; // Average weeks per month
    const hourlyRate = (teamMember.salary || 0) / monthlyHours;

    // Get teamMember's schedules
    const empSchedules = schedules?.filter(s => s.teamMember_id === teamMember.id) || [];

    // Calculate scheduled hours
    const scheduledHours = empSchedules.reduce((total, schedule) => {
      const startTime = new Date(`2024-01-01T${schedule.start_time}`);
      const endTime = new Date(`2024-01-01T${schedule.end_time}`);
      const breakMinutes = schedule.break_duration || 0;

      const diffMs = endTime.getTime() - startTime.getTime();
      const hours = (diffMs / (1000 * 60 * 60)) - (breakMinutes / 60);

      return total + Math.max(0, hours);
    }, 0);

    // Calculate actual hours worked (simplified - using time entries)
    const empTimeEntries = timeEntries?.filter(t => t.teamMember_id === teamMember.id) || [];
    const clockInEntries = empTimeEntries.filter(t => t.entry_type === 'clock_in');
    const clockOutEntries = empTimeEntries.filter(t => t.entry_type === 'clock_out');

    // Simplified actual hours calculation
    const actualHours = Math.min(clockInEntries.length * 8, scheduledHours * 1.1); // Max 10% over scheduled

    // Calculate overtime (anything over 40 hours per week)
    const weekCount = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const regularHoursLimit = 40 * weekCount;
    const overtimeHours = Math.max(0, actualHours - regularHoursLimit);
    const regularHours = actualHours - overtimeHours;

    // Calculate costs
    const regularCost = regularHours * hourlyRate;
    const overtimeCost = overtimeHours * hourlyRate * 1.5; // 1.5x rate for overtime
    const totalCost = regularCost + overtimeCost;

    // Calculate efficiency metrics
    const efficiencyRating = (teamMember.performance_score || 85) / 100;
    const costPerPerformancePoint = totalCost / (teamMember.performance_score || 85);

    return {
      teamMember_id: teamMember.id,
      name: `${teamMember.first_name} ${teamMember.last_name}`,
      position: teamMember.position,
      department: teamMember.department,
      hourly_rate: Math.round(hourlyRate * 100) / 100,
      hours_scheduled: Math.round(scheduledHours * 100) / 100,
      hours_worked: Math.round(actualHours * 100) / 100,
      overtime_hours: Math.round(overtimeHours * 100) / 100,
      regular_cost: Math.round(regularCost * 100) / 100,
      overtime_cost: Math.round(overtimeCost * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
      efficiency_rating: Math.round(efficiencyRating * 100) / 100,
      cost_per_performance_point: Math.round(costPerPerformancePoint * 100) / 100
    };
  });

  return laborCostData;
}

/**
 * Get labor cost summary for a period
 */
export async function getLaborCostSummary(
  startDate: string,
  endDate: string
): Promise<LaborCostSummary> {
  const laborCosts = await calculateLaborCosts(startDate, endDate);

  if (laborCosts.length === 0) {
    return {
      period: `${startDate} to ${endDate}`,
      total_scheduled_cost: 0,
      total_actual_cost: 0,
      variance: 0,
      variance_percentage: 0,
      total_hours_scheduled: 0,
      total_hours_worked: 0,
      average_hourly_cost: 0,
      department_breakdown: {},
      cost_efficiency_score: 0
    };
  }

  // Calculate totals
  const totalScheduledCost = laborCosts.reduce((sum, lc) => sum + (lc.hours_scheduled * lc.hourly_rate), 0);
  const totalActualCost = laborCosts.reduce((sum, lc) => sum + lc.total_cost, 0);
  const totalHoursScheduled = laborCosts.reduce((sum, lc) => sum + lc.hours_scheduled, 0);
  const totalHoursWorked = laborCosts.reduce((sum, lc) => sum + lc.hours_worked, 0);

  const variance = totalActualCost - totalScheduledCost;
  const variancePercentage = totalScheduledCost > 0 ? (variance / totalScheduledCost) * 100 : 0;

  // Department breakdown
  const departmentBreakdown = laborCosts.reduce((acc, lc) => {
    if (!acc[lc.department]) {
      acc[lc.department] = {
        scheduled_cost: 0,
        actual_cost: 0,
        hours_worked: 0,
        teamMember_count: 0,
        avg_efficiency: 0
      };
    }

    acc[lc.department].scheduled_cost += lc.hours_scheduled * lc.hourly_rate;
    acc[lc.department].actual_cost += lc.total_cost;
    acc[lc.department].hours_worked += lc.hours_worked;
    acc[lc.department].teamMember_count++;
    acc[lc.department].avg_efficiency += lc.efficiency_rating;

    return acc;
  }, {} as Record<string, any>);

  // Calculate average efficiency for each department
  Object.keys(departmentBreakdown).forEach(dept => {
    departmentBreakdown[dept].avg_efficiency =
      departmentBreakdown[dept].avg_efficiency / departmentBreakdown[dept].teamMember_count;
  });

  // Calculate cost efficiency score (higher is better)
  const avgEfficiency = laborCosts.reduce((sum, lc) => sum + lc.efficiency_rating, 0) / laborCosts.length;
  const costEfficiencyScore = Math.round((avgEfficiency * 100) - Math.abs(variancePercentage));

  return {
    period: `${startDate} to ${endDate}`,
    total_scheduled_cost: Math.round(totalScheduledCost * 100) / 100,
    total_actual_cost: Math.round(totalActualCost * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    variance_percentage: Math.round(variancePercentage * 100) / 100,
    total_hours_scheduled: Math.round(totalHoursScheduled * 100) / 100,
    total_hours_worked: Math.round(totalHoursWorked * 100) / 100,
    average_hourly_cost: Math.round((totalActualCost / totalHoursWorked) * 100) / 100,
    department_breakdown: departmentBreakdown,
    cost_efficiency_score: Math.max(0, Math.min(100, costEfficiencyScore))
  };
}

/**
 * Get cost per hour analysis by department
 */
export async function getCostPerHourAnalysis(): Promise<CostPerHourAnalysis[]> {
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('department, salary, weekly_hours, performance_score')
    .eq('employment_status', 'active');

  if (!teamMembers) return [];

  const departmentAnalysis = teamMembers.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = {
        department: emp.department,
        teamMembers: 0,
        total_hourly_cost: 0,
        total_performance: 0,
        hours: 0
      };
    }

    const monthlyHours = (emp.weekly_hours || 40) * 4.33;
    const hourlyRate = (emp.salary || 0) / monthlyHours;

    acc[emp.department].teamMembers++;
    acc[emp.department].total_hourly_cost += hourlyRate;
    acc[emp.department].total_performance += emp.performance_score || 85;
    acc[emp.department].hours += emp.weekly_hours || 40;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(departmentAnalysis).map((dept: any) => ({
    department: dept.department,
    teamMembers: dept.teamMembers,
    avg_hourly_cost: Math.round((dept.total_hourly_cost / dept.teamMembers) * 100) / 100,
    avg_performance: Math.round(dept.total_performance / dept.teamMembers),
    cost_per_performance_point: Math.round(((dept.total_hourly_cost / dept.teamMembers) / (dept.total_performance / dept.teamMembers)) * 100) / 100,
    total_weekly_hours: dept.hours,
    efficiency_score: Math.round(((dept.total_performance / dept.teamMembers) / (dept.total_hourly_cost / dept.teamMembers)) * 10)
  }));
}
