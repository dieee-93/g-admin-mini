/**
 * Real-time Labor Cost Integration
 * Connects scheduling with staff costs for live cost tracking
 */

import { supabase } from '@/lib/supabase/client';
import type { Shift } from '@/pages/admin/resources/scheduling/types';
import type { Employee, TimeEntry } from '@/store/staffStore';
import { calculateLaborCosts, getLaborCostSummary } from './staffApi';

// Real-time cost tracking interfaces
export interface LiveCostData {
  employee_id: string;
  employee_name: string;
  current_shift: Shift | null;
  clock_in_time: string | null;
  current_hours: number;
  projected_hours: number;
  current_cost: number;
  projected_cost: number;
  overtime_status: 'none' | 'approaching' | 'in_overtime';
  department: string;
  hourly_rate: number;
}

export interface DailyCostSummary {
  date: string;
  total_current_cost: number;
  total_projected_cost: number;
  active_employees: number;
  total_hours_worked: number;
  total_projected_hours: number;
  overtime_hours: number;
  budget_utilization: number;
  cost_variance: number;
}

export interface CostAlert {
  id: string;
  type: 'overtime_approaching' | 'budget_exceeded' | 'understaffed' | 'overstaffed';
  severity: 'info' | 'warning' | 'critical';
  employee_id?: string;
  employee_name?: string;
  department?: string;
  message: string;
  current_value: number;
  threshold_value: number;
  timestamp: string;
}

class RealTimeLaborCostService {
  private subscribers: Set<(data: LiveCostData[]) => void> = new Set();
  private alertSubscribers: Set<(alerts: CostAlert[]) => void> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;
  private currentData: LiveCostData[] = [];
  private activeAlerts: CostAlert[] = [];

  // Configuration thresholds
  private readonly OVERTIME_THRESHOLD = 8; // Hours before overtime
  private readonly OVERTIME_WARNING = 7.5; // Hours before warning
  private readonly BUDGET_WARNING_THRESHOLD = 0.9; // 90% of budget
  private readonly UPDATE_INTERVAL = 60000; // 1 minute

  /**
   * Start real-time monitoring
   */
  startMonitoring(): void {
    if (this.updateInterval) {
      this.stopMonitoring();
    }

    // Initial load
    this.updateLiveCosts();

    // Set up regular updates
    this.updateInterval = setInterval(() => {
      this.updateLiveCosts();
    }, this.UPDATE_INTERVAL);

    console.log('🔄 Real-time labor cost monitoring started');
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log('⏹️ Real-time labor cost monitoring stopped');
  }

  /**
   * Subscribe to live cost updates
   */
  subscribe(callback: (data: LiveCostData[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Send current data immediately
    if (this.currentData.length > 0) {
      callback(this.currentData);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Subscribe to cost alerts
   */
  subscribeToAlerts(callback: (alerts: CostAlert[]) => void): () => void {
    this.alertSubscribers.add(callback);
    
    // Send current alerts immediately
    if (this.activeAlerts.length > 0) {
      callback(this.activeAlerts);
    }

    return () => {
      this.alertSubscribers.delete(callback);
    };
  }

  /**
   * Update live cost data
   */
  private async updateLiveCosts(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get all employees with their current shifts
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          *,
          shifts:shifts!employee_id (
            *
          )
        `)
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // Get active employees (those who clocked in today but haven't clocked out)
      const { data: clockInEntries, error: timeEntriesError } = await supabase
        .from('time_entries')
        .select('employee_id, timestamp')
        .eq('entry_type', 'clock_in')
        .gte('timestamp', `${today}T00:00:00Z`);

      if (timeEntriesError) throw timeEntriesError;

      // Get today's shift schedules (use shift_schedules table which has date column)
      const { data: todayShifts, error: shiftsError } = await supabase
        .from('shift_schedules')
        .select(`
          *,
          employees:employee_id (
            name,
            hourly_rate
          )
        `)
        .eq('date', today);

      if (shiftsError) throw shiftsError;

      // Get clock out entries to determine who is still active
      const { data: clockOutEntries } = await supabase
        .from('time_entries')
        .select('employee_id, timestamp')
        .eq('entry_type', 'clock_out')
        .gte('timestamp', `${today}T00:00:00Z`);

      // Process live cost data
      const liveData: LiveCostData[] = (employees || []).map(employee => {
        const clockInEntry = (clockInEntries || []).find(te => te.employee_id === employee.id);
        const clockOutEntry = (clockOutEntries || []).find(te => te.employee_id === employee.id);
        const currentShift = (todayShifts || []).find(shift => shift.employee_id === employee.id);

        // Only include if clocked in but not clocked out (or clocked in after last clock out)
        const clockInTime = clockInEntry?.timestamp;
        const clockOutTime = clockOutEntry?.timestamp;
        const isCurrentlyActive = clockInTime && (!clockOutTime || new Date(clockInTime) > new Date(clockOutTime));

        const currentHours = (isCurrentlyActive && clockInTime) ? this.calculateCurrentHours(clockInTime) : 0;
        
        // Calculate projected hours based on shift schedule
        let projectedHours = 0;
        if (currentShift) {
          projectedHours = this.calculateShiftHours(currentShift.start_time, currentShift.end_time);
        }

        const hourlyRate = employee.hourly_rate || 0;
        const currentCost = this.calculateCostWithOvertime(currentHours, hourlyRate);
        const projectedCost = this.calculateCostWithOvertime(projectedHours, hourlyRate);

        const overtimeStatus = this.getOvertimeStatus(currentHours, projectedHours);

        return {
          employee_id: employee.id,
          employee_name: employee.name,
          current_shift: currentShift || null,
          clock_in_time: clockInTime,
          current_hours: currentHours,
          projected_hours: projectedHours,
          current_cost: currentCost,
          projected_cost: projectedCost,
          overtime_status: overtimeStatus,
          department: employee.department,
          hourly_rate: hourlyRate
        };
      });

      this.currentData = liveData;

      // Check for alerts
      await this.checkForAlerts(liveData);

      // Notify subscribers
      this.notifySubscribers();

    } catch (error) {
      console.error('Error updating live costs:', error);
    }
  }

  /**
   * Calculate current worked hours
   */
  private calculateCurrentHours(clockInTime: string): number {
    const clockIn = new Date(clockInTime);
    const now = new Date();
    const diffMs = now.getTime() - clockIn.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  }

  /**
   * Calculate shift hours
   */
  private calculateShiftHours(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Calculate cost including overtime
   */
  private calculateCostWithOvertime(hours: number, hourlyRate: number): number {
    if (hours <= this.OVERTIME_THRESHOLD) {
      return hours * hourlyRate;
    } else {
      const regularHours = this.OVERTIME_THRESHOLD;
      const overtimeHours = hours - this.OVERTIME_THRESHOLD;
      const overtimeRate = hourlyRate * 1.5; // 1.5x for overtime
      
      return (regularHours * hourlyRate) + (overtimeHours * overtimeRate);
    }
  }

  /**
   * Determine overtime status
   */
  private getOvertimeStatus(currentHours: number, projectedHours: number): LiveCostData['overtime_status'] {
    if (currentHours >= this.OVERTIME_THRESHOLD || projectedHours >= this.OVERTIME_THRESHOLD) {
      return 'in_overtime';
    } else if (currentHours >= this.OVERTIME_WARNING || projectedHours >= this.OVERTIME_WARNING) {
      return 'approaching';
    }
    return 'none';
  }

  /**
   * Check for cost alerts
   */
  private async checkForAlerts(liveData: LiveCostData[]): Promise<void> {
    const newAlerts: CostAlert[] = [];

    // Check overtime alerts
    liveData.forEach(employee => {
      if (employee.overtime_status === 'approaching') {
        newAlerts.push({
          id: `overtime_warning_${employee.employee_id}`,
          type: 'overtime_approaching',
          severity: 'warning',
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          department: employee.department,
          message: `${employee.employee_name} is approaching overtime (${employee.current_hours.toFixed(1)}h worked)`,
          current_value: employee.current_hours,
          threshold_value: this.OVERTIME_WARNING,
          timestamp: new Date().toISOString()
        });
      } else if (employee.overtime_status === 'in_overtime') {
        newAlerts.push({
          id: `overtime_exceeded_${employee.employee_id}`,
          type: 'overtime_approaching',
          severity: 'critical',
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          department: employee.department,
          message: `${employee.employee_name} is in overtime (${employee.current_hours.toFixed(1)}h worked)`,
          current_value: employee.current_hours,
          threshold_value: this.OVERTIME_THRESHOLD,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Check budget alerts
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = this.getWeekStart(today);
      const weekEnd = this.getWeekEnd(today);
      
      const costSummary = await getLaborCostSummary(weekStart, weekEnd);
      
      if (costSummary && costSummary.variance_percentage > 10) { // 10% over budget
        newAlerts.push({
          id: 'budget_exceeded',
          type: 'budget_exceeded',
          severity: 'critical',
          message: `Weekly labor costs are ${costSummary.variance_percentage.toFixed(1)}% over budget`,
          current_value: costSummary.total_cost,
          threshold_value: costSummary.total_cost - (costSummary.variance_from_budget || 0),
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }

    // Update active alerts (remove old ones, add new ones)
    this.activeAlerts = newAlerts;

    // Notify alert subscribers
    this.notifyAlertSubscribers();
  }

  /**
   * Get week start date
   */
  private getWeekStart(date: string): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to get Monday
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  /**
   * Get week end date
   */
  private getWeekEnd(date: string): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6; // Adjust to get Sunday
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  /**
   * Notify cost data subscribers
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback([...this.currentData]);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  /**
   * Notify alert subscribers
   */
  private notifyAlertSubscribers(): void {
    this.alertSubscribers.forEach(callback => {
      try {
        callback([...this.activeAlerts]);
      } catch (error) {
        console.error('Error notifying alert subscriber:', error);
      }
    });
  }

  /**
   * Get daily cost summary
   */
  async getDailyCostSummary(date: string = new Date().toISOString().split('T')[0]): Promise<DailyCostSummary> {
    try {
      // Get cost data for the specific date
      const costData = await calculateLaborCosts(date, date);
      
      const totalCurrentCost = costData.reduce((sum, employee) => sum + employee.total_cost, 0);
      const totalCurrentHours = costData.reduce((sum, employee) => sum + employee.regular_hours + employee.overtime_hours, 0);
      const overtimeHours = costData.reduce((sum, employee) => sum + employee.overtime_hours, 0);

      // Get projected data from live monitoring
      const liveEmployees = this.currentData.filter(emp => emp.clock_in_time !== null);
      const totalProjectedCost = liveEmployees.reduce((sum, emp) => sum + emp.projected_cost, 0);
      const totalProjectedHours = liveEmployees.reduce((sum, emp) => sum + emp.projected_hours, 0);

      // Calculate budget utilization (would need budget data from database)
      const dailyBudget = 2000; // This should come from configuration
      const budgetUtilization = (totalCurrentCost / dailyBudget) * 100;

      return {
        date,
        total_current_cost: totalCurrentCost,
        total_projected_cost: totalProjectedCost,
        active_employees: liveEmployees.length,
        total_hours_worked: totalCurrentHours,
        total_projected_hours: totalProjectedHours,
        overtime_hours: overtimeHours,
        budget_utilization: budgetUtilization,
        cost_variance: totalProjectedCost - dailyBudget
      };

    } catch (error) {
      console.error('Error calculating daily cost summary:', error);
      throw new Error('Failed to calculate daily cost summary');
    }
  }

  /**
   * Force immediate update
   */
  async forceUpdate(): Promise<void> {
    await this.updateLiveCosts();
  }

  /**
   * Get current data without subscription
   */
  getCurrentData(): LiveCostData[] {
    return [...this.currentData];
  }

  /**
   * Get current alerts without subscription
   */
  getCurrentAlerts(): CostAlert[] {
    return [...this.activeAlerts];
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.subscribers.clear();
    this.alertSubscribers.clear();
    this.currentData = [];
    this.activeAlerts = [];
  }
}

// Export singleton instance
export const realTimeLaborCosts = new RealTimeLaborCostService();

// Export types and service
export default realTimeLaborCosts;