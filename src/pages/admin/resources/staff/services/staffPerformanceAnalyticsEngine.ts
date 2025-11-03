// ============================================================================
// STAFF PERFORMANCE ANALYTICS ENGINE - Business Logic
// ============================================================================
// Sistema inteligente de análisis de rendimiento de personal y productividad

// TODO: Integrate DecimalUtils for precise financial calculations
// import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
// import { InventoryDecimal, DECIMAL_CONSTANTS } from '@/config/decimal-config';

// ============================================================================
// TYPES
// ============================================================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: Department;
  position: string;
  hourly_rate: number;
  hire_date: string;
  status: EmployeeStatus;
  skills: string[];
  performance_rating: number;
  contract_type: ContractType;
  created_at: string;
  updated_at: string;
}

export type Department = 'Cocina' | 'Servicio' | 'Administración' | 'Limpieza' | 'Gerencia';
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
export type ContractType = 'full_time' | 'part_time' | 'contractor' | 'temp';

export interface TimeEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number;
  total_hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  status: ScheduleStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ScheduleStatus = 'scheduled' | 'confirmed' | 'completed' | 'missed' | 'cancelled';

interface AttendanceMetrics {
  attendanceRate: number;
  punctualityScore: number;
}

interface ProductivityMetrics {
  productivityScore: number;
  qualityScore: number;
}

// Performance Analysis Types
export interface PerformanceMetrics {
  employeeId: string;
  employeeName: string;
  department: Department;
  position: string;
  
  // Time & Attendance Metrics
  attendanceRate: number;           // % of scheduled shifts attended
  punctualityScore: number;         // % of on-time arrivals
  overtimeHours: number;            // Total overtime hours
  totalHoursWorked: number;         // Total hours in period
  averageHoursPerShift: number;     // Average hours per shift
  
  // Productivity Metrics
  productivityScore: number;        // Overall productivity rating (0-100)
  tasksCompleted: number;           // Number of tasks completed
  taskCompletionRate: number;       // % of assigned tasks completed
  averageTaskTime: number;          // Average time per task (minutes)
  qualityScore: number;             // Quality rating (0-100)
  
  // Performance Indicators
  performanceRating: number;        // Overall performance rating (0-5)
  performanceTrend: 'improving' | 'stable' | 'declining';
  strengths: string[];              // Top performance strengths
  improvementAreas: string[];       // Areas needing improvement
  
  // Financial Impact
  laborCostPerHour: number;         // Cost per hour worked
  revenuePerHour?: number;          // Revenue generated per hour
  costEfficiencyRatio: number;      // Revenue/Cost ratio
  
  // Engagement & Development
  trainingHours: number;            // Hours spent in training
  skillsAcquired: string[];         // New skills acquired
  retentionRisk: 'low' | 'medium' | 'high'; // Risk of turnover
  
  // Metadata
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
}

// Department Analytics
export interface DepartmentAnalytics {
  department: Department;
  totalEmployees: number;
  activeEmployees: number;
  
  // Performance Aggregates
  averagePerformanceRating: number;
  averageAttendanceRate: number;
  averagePunctualityScore: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  
  // Productivity Metrics
  averageProductivityScore: number;
  totalTasksCompleted: number;
  averageTaskCompletionRate: number;
  averageQualityScore: number;
  
  // Cost Analysis
  totalLaborCost: number;
  averageLaborCostPerHour: number;
  costEfficiencyRatio: number;
  budgetVariance: number;           // Over/under budget %
  
  // Staffing Analysis
  understaffedShifts: number;       // Number of understaffed shifts
  overstaffedShifts: number;        // Number of overstaffed shifts
  optimalStaffingRate: number;      // % of optimally staffed shifts
  
  // Top Performers
  topPerformers: Array<{
    employeeId: string;
    name: string;
    performanceScore: number;
    keyStrengths: string[];
  }>;
  
  // Improvement Opportunities
  improvementOpportunities: Array<{
    area: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
    affectedEmployees: number;
  }>;
}

// Organization-wide Metrics
export interface OrganizationMetrics {
  totalActiveEmployees: number;
  averagePerformanceRating: number;
  overallAttendanceRate: number;
  overallPunctualityScore: number;
  totalLaborCost: number;
  averageTenure: number;           // Average employee tenure in months
  turnoverRate: number;            // % turnover in period

  // Efficiency Metrics
  revenuePerEmployee?: number;
  profitPerEmployee?: number;
  costPerServiceHour: number;

  // Trends
  performanceTrend: 'improving' | 'stable' | 'declining';
  costTrend: 'increasing' | 'stable' | 'decreasing';
  productivityTrend: 'improving' | 'stable' | 'declining';
}

// Strategic Insight
export interface StrategicInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  category: 'performance' | 'cost' | 'staffing' | 'training' | 'retention';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  priority: number; // 1-5
}

// Comprehensive Analytics Result
export interface StaffAnalyticsResult {
  // Metadata
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  totalEmployeesAnalyzed: number;
  
  // Individual Performance
  employeeMetrics: PerformanceMetrics[];
  
  // Department Analysis
  departmentAnalytics: DepartmentAnalytics[];
  
  // Organization-wide Metrics
  organizationMetrics: {
    totalActiveEmployees: number;
    averagePerformanceRating: number;
    overallAttendanceRate: number;
    overallPunctualityScore: number;
    totalLaborCost: number;
    averageTenure: number;           // Average employee tenure in months
    turnoverRate: number;            // % turnover in period
    
    // Efficiency Metrics
    revenuePerEmployee?: number;
    profitPerEmployee?: number;
    costPerServiceHour: number;
    
    // Trends
    performanceTrend: 'improving' | 'stable' | 'declining';
    costTrend: 'increasing' | 'stable' | 'decreasing';
    productivityTrend: 'improving' | 'stable' | 'declining';
  };
  
  // Strategic Insights
  strategicInsights: Array<{
    type: 'strength' | 'weakness' | 'opportunity' | 'threat';
    category: 'performance' | 'cost' | 'staffing' | 'training' | 'retention';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
    priority: number; // 1-5
  }>;
  
  // Actionable Recommendations
  recommendations: Array<{
    id: string;
    type: 'performance_improvement' | 'cost_optimization' | 'staffing_adjustment' | 'training_program' | 'retention_strategy';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedEmployees: string[];
    affectedDepartments: Department[];
    estimatedImpact: number;         // Expected improvement %
    estimatedCost?: number;          // Implementation cost
    timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
    actionSteps: string[];
  }>;
  
  // Performance Alerts
  performanceAlerts: Array<{
    employeeId: string;
    employeeName: string;
    alertType: 'low_performance' | 'high_absenteeism' | 'overtime_concern' | 'retention_risk' | 'training_needed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendedActions: string[];
    deadline?: string;
  }>;
}

// Configuration for analytics
export interface StaffAnalyticsConfig {
  // Analysis Parameters
  analysisMonths: number;            // Months to analyze
  minShiftsForAnalysis: number;      // Minimum shifts for valid analysis
  
  // Performance Thresholds
  attendanceThreshold: number;       // Minimum acceptable attendance %
  punctualityThreshold: number;      // Minimum acceptable punctuality %
  performanceThreshold: number;      // Minimum acceptable performance rating
  
  // Alert Thresholds
  lowPerformanceThreshold: number;   // Threshold for low performance alert
  highAbsenteeismThreshold: number;  // Threshold for absenteeism alert
  overtimeThreshold: number;         // Hours threshold for overtime concern
  
  // Cost Analysis
  includeLaborCostAnalysis: boolean;
  includeRevenuePerEmployee: boolean;
  budgetVarianceThreshold: number;   // % variance threshold for alerts
  
  // Department Weights (for organization-wide calculations)
  departmentWeights: Record<Department, number>;
  
  // Benchmarking
  industryBenchmarks?: {
    averagePerformanceRating: number;
    averageAttendanceRate: number;
    averageTurnoverRate: number;
    averageRevenuePerEmployee: number;
  };
}

// ============================================================================
// STAFF PERFORMANCE ANALYTICS ENGINE
// ============================================================================

export class StaffPerformanceAnalyticsEngine {
  
  // Default configuration optimized for restaurant operations
  private static readonly DEFAULT_CONFIG: StaffAnalyticsConfig = {
    analysisMonths: 3,                 // Analyze last 3 months
    minShiftsForAnalysis: 10,          // Minimum 10 shifts for analysis
    
    attendanceThreshold: 90,           // 90% minimum attendance
    punctualityThreshold: 85,          // 85% minimum punctuality
    performanceThreshold: 3.5,         // 3.5/5 minimum performance
    
    lowPerformanceThreshold: 3.0,      // Below 3.0 triggers alert
    highAbsenteeismThreshold: 15,      // >15% absence rate triggers alert
    overtimeThreshold: 10,             // >10 hours/week overtime concern
    
    includeLaborCostAnalysis: true,
    includeRevenuePerEmployee: false,   // Requires sales integration
    budgetVarianceThreshold: 10,       // 10% budget variance threshold
    
    departmentWeights: {
      'Cocina': 0.35,                  // Kitchen is critical
      'Servicio': 0.30,                // Service is customer-facing
      'Administración': 0.15,          // Admin support
      'Limpieza': 0.10,                // Cleaning operations
      'Gerencia': 0.10                 // Management oversight
    },
    
    industryBenchmarks: {
      averagePerformanceRating: 3.8,
      averageAttendanceRate: 88,
      averageTurnoverRate: 35,         // Restaurant industry average
      averageRevenuePerEmployee: 65000 // Annual revenue per employee
    }
  };

  // ============================================================================
  // MAIN ANALYTICS METHOD
  // ============================================================================

  /**
   * Generates comprehensive staff performance analytics
   */
  static async generateStaffAnalytics(
    employees: Employee[],
    timeEntries: TimeEntry[],
    schedules: Schedule[],
    config: Partial<StaffAnalyticsConfig> = {}
  ): Promise<StaffAnalyticsResult> {
    
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const now = new Date();
    const periodEnd = now.toISOString();
    const periodStart = new Date(now.getTime() - (fullConfig.analysisMonths * 30 * 24 * 60 * 60 * 1000)).toISOString();
    
    // Filter data to analysis period
    const filteredTimeEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    const filteredSchedules = schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      return scheduleDate >= startDate && scheduleDate <= endDate;
    });
    
    // 1. Calculate individual employee metrics
    const employeeMetrics = await Promise.all(
      employees
        .filter(emp => emp.status === 'active')
        .map(employee => this.calculateEmployeeMetrics(
          employee, 
          filteredTimeEntries, 
          filteredSchedules, 
          fullConfig,
          periodStart,
          periodEnd
        ))
    );
    
    // Filter employees with sufficient data
    const validEmployeeMetrics = employeeMetrics.filter(
      metrics => metrics !== null
    ) as PerformanceMetrics[];
    
    // 2. Calculate department analytics
    const departmentAnalytics = this.calculateDepartmentAnalytics(
      validEmployeeMetrics,
      employees
    );
    
    // 3. Calculate organization-wide metrics
    const organizationMetrics = this.calculateOrganizationMetrics(
      validEmployeeMetrics, 
      employees, 
      fullConfig
    );
    
    // 4. Generate strategic insights
    const strategicInsights = this.generateStrategicInsights(
      validEmployeeMetrics, 
      departmentAnalytics, 
      organizationMetrics, 
      fullConfig
    );
    
    // 5. Generate actionable recommendations
    const recommendations = this.generateRecommendations(
      validEmployeeMetrics
    );
    
    // 6. Generate performance alerts
    const performanceAlerts = this.generatePerformanceAlerts(
      validEmployeeMetrics, 
      fullConfig
    );
    
    return {
      generatedAt: now.toISOString(),
      periodStart,
      periodEnd,
      totalEmployeesAnalyzed: validEmployeeMetrics.length,
      employeeMetrics: validEmployeeMetrics,
      departmentAnalytics,
      organizationMetrics,
      strategicInsights,
      recommendations,
      performanceAlerts
    };
  }

  // ============================================================================
  // INDIVIDUAL EMPLOYEE METRICS CALCULATION
  // ============================================================================

  private static async calculateEmployeeMetrics(
    employee: Employee,
    timeEntries: TimeEntry[],
    schedules: Schedule[],
    config: StaffAnalyticsConfig,
    periodStart: string,
    periodEnd: string
  ): Promise<PerformanceMetrics | null> {
    
    const employeeTimeEntries = timeEntries.filter(entry => entry.employee_id === employee.id);
    const employeeSchedules = schedules.filter(schedule => schedule.employee_id === employee.id);
    
    // Skip if insufficient data
    if (employeeSchedules.length < config.minShiftsForAnalysis) {
      return null;
    }
    
    // Calculate time & attendance metrics
    const attendanceMetrics = this.calculateAttendanceMetrics(employeeTimeEntries, employeeSchedules);
    
    // Calculate productivity metrics
    const productivityMetrics = this.calculateProductivityMetrics(employee, employeeTimeEntries);
    
    // Calculate performance indicators
    const performanceIndicators = this.calculatePerformanceIndicators(employee, attendanceMetrics, productivityMetrics);
    
    // Calculate financial impact
    const financialMetrics = this.calculateFinancialMetrics(employee);

    // Determine performance trend
    const performanceTrend = this.determinePerformanceTrend(employee);
    
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      
      ...attendanceMetrics,
      ...productivityMetrics,
      ...performanceIndicators,
      ...financialMetrics,
      
      performanceTrend,
      
      // Mock values for engagement metrics (would come from HR system)
      trainingHours: Math.floor(Math.random() * 20),
      skillsAcquired: [],
      retentionRisk: this.assessRetentionRisk(employee, attendanceMetrics, performanceIndicators),
      
      periodStart,
      periodEnd,
      generatedAt: new Date().toISOString()
    };
  }

  private static calculateAttendanceMetrics(timeEntries: TimeEntry[], schedules: Schedule[]) {
    const completedShifts = schedules.filter(s => s.status === 'completed').length;
    const totalScheduledShifts = schedules.length;
    const attendanceRate = totalScheduledShifts > 0 ? (completedShifts / totalScheduledShifts) * 100 : 0;
    
    // Calculate punctuality (arrivals within 5 minutes of scheduled time)
    const onTimeArrivals = timeEntries.filter(entry => {
      if (!entry.clock_in) return false;
      const scheduledShift = schedules.find(s => s.employee_id === entry.employee_id);
      if (!scheduledShift) return true; // Assume on time if no schedule found
      
      const clockInTime = new Date(entry.clock_in);
      const scheduledTime = new Date(scheduledShift.start_time);
      const timeDiffMinutes = (clockInTime.getTime() - scheduledTime.getTime()) / (1000 * 60);
      
      return timeDiffMinutes <= 5; // Within 5 minutes is considered on time
    }).length;
    
    const punctualityScore = timeEntries.length > 0 ? (onTimeArrivals / timeEntries.length) * 100 : 0;
    
    // Calculate total hours and overtime
    const totalHoursWorked = timeEntries.reduce((sum, entry) => sum + entry.total_hours, 0);
    const regularHoursPerWeek = 40; // Standard full-time hours
    const weeksInPeriod = Math.ceil(timeEntries.length / 5); // Rough estimate
    const expectedHours = weeksInPeriod * regularHoursPerWeek;
    const overtimeHours = Math.max(0, totalHoursWorked - expectedHours);
    
    const averageHoursPerShift = completedShifts > 0 ? totalHoursWorked / completedShifts : 0;
    
    return {
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      punctualityScore: Math.round(punctualityScore * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
      averageHoursPerShift: Math.round(averageHoursPerShift * 100) / 100
    };
  }

  private static calculateProductivityMetrics(employee: Employee, timeEntries: TimeEntry[]) {
    // For demonstration - in real system these would come from task tracking
    const baseProductivity = 70 + (employee.performance_rating - 3) * 10;
    const experienceBonus = this.calculateExperienceBonus(employee.hire_date);
    
    const productivityScore = Math.min(100, Math.max(0, baseProductivity + experienceBonus));
    
    // Mock task metrics (would come from task management system)
    const tasksCompleted = Math.floor(timeEntries.length * 2.5); // Rough estimate
    const taskCompletionRate = Math.min(100, 85 + (employee.performance_rating - 3) * 5);
    const averageTaskTime = 45 + Math.random() * 30; // 45-75 minutes average
    const qualityScore = Math.min(100, 75 + employee.performance_rating * 5);
    
    return {
      productivityScore: Math.round(productivityScore * 100) / 100,
      tasksCompleted,
      taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
      averageTaskTime: Math.round(averageTaskTime * 100) / 100,
      qualityScore: Math.round(qualityScore * 100) / 100
    };
  }

  private static calculatePerformanceIndicators(employee: Employee, attendanceMetrics: AttendanceMetrics, productivityMetrics: ProductivityMetrics) {
    const performanceRating = employee.performance_rating;
    
    // Determine strengths and improvement areas based on metrics
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    
    if (attendanceMetrics.attendanceRate >= 95) strengths.push('Excellent Attendance');
    if (attendanceMetrics.punctualityScore >= 90) strengths.push('Consistently Punctual');
    if (productivityMetrics.productivityScore >= 85) strengths.push('High Productivity');
    if (productivityMetrics.qualityScore >= 90) strengths.push('Quality Work');
    
    if (attendanceMetrics.attendanceRate < 85) improvementAreas.push('Attendance Improvement Needed');
    if (attendanceMetrics.punctualityScore < 80) improvementAreas.push('Punctuality Improvement Needed');
    if (productivityMetrics.productivityScore < 70) improvementAreas.push('Productivity Enhancement');
    if (productivityMetrics.qualityScore < 75) improvementAreas.push('Quality Standards');
    
    return {
      performanceRating,
      strengths,
      improvementAreas
    };
  }

  private static calculateFinancialMetrics(employee: Employee) {
    const laborCostPerHour = employee.hourly_rate * 1.3; // Include benefits/overhead
    // TODO: Use timeEntries parameter for more accurate cost calculations based on actual hours

    // Mock revenue calculation (would require sales integration)
    const revenuePerHour = employee.department === 'Servicio' ? employee.hourly_rate * 4 : undefined;
    const costEfficiencyRatio = revenuePerHour ? revenuePerHour / laborCostPerHour : 1.0;
    
    return {
      laborCostPerHour: Math.round(laborCostPerHour * 100) / 100,
      revenuePerHour,
      costEfficiencyRatio: Math.round(costEfficiencyRatio * 100) / 100
    };
  }

  private static determinePerformanceTrend(employee: Employee): 'improving' | 'stable' | 'declining' {
    // TODO: Use timeEntries parameter to analyze historical performance trends
    // Simplified trend analysis - in real system would analyze historical performance data
    const recentPerformance = employee.performance_rating;
    
    if (recentPerformance >= 4.0) return 'improving';
    if (recentPerformance >= 3.5) return 'stable';
    return 'declining';
  }

  private static assessRetentionRisk(employee: Employee, attendanceMetrics: AttendanceMetrics, performanceIndicators: Pick<PerformanceMetrics, 'performanceRating'>): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    if (performanceIndicators.performanceRating < 3.0) riskScore += 2;
    if (attendanceMetrics.attendanceRate < 80) riskScore += 2;
    if (attendanceMetrics.punctualityScore < 70) riskScore += 1;
    
    // Tenure factor
    const tenureMonths = this.calculateTenureMonths(employee.hire_date);
    if (tenureMonths < 6) riskScore += 1; // New employees higher risk
    
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  private static calculateExperienceBonus(hireDate: string): number {
    const tenureMonths = this.calculateTenureMonths(hireDate);
    return Math.min(10, tenureMonths * 0.5); // Up to 10 points for experience
  }

  private static calculateTenureMonths(hireDate: string): number {
    const now = new Date();
    const hire = new Date(hireDate);
    return Math.floor((now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }

  // ============================================================================
  // DEPARTMENT ANALYTICS CALCULATION
  // ============================================================================

  private static calculateDepartmentAnalytics(
    employeeMetrics: PerformanceMetrics[],
    allEmployees: Employee[]
  ): DepartmentAnalytics[] {
    // TODO: Add config parameter for department-specific thresholds and settings
    
    const departments = Array.from(new Set(allEmployees.map(emp => emp.department)));
    
    return departments.map(department => {
      const deptEmployees = allEmployees.filter(emp => emp.department === department);
      const deptMetrics = employeeMetrics.filter(metrics => metrics.department === department);
      
      if (deptMetrics.length === 0) {
        return this.createEmptyDepartmentAnalytics(department, deptEmployees.length);
      }
      
      // Calculate aggregated metrics
      const avgPerformanceRating = this.calculateAverage(deptMetrics.map(m => m.performanceRating));
      const avgAttendanceRate = this.calculateAverage(deptMetrics.map(m => m.attendanceRate));
      const avgPunctualityScore = this.calculateAverage(deptMetrics.map(m => m.punctualityScore));
      const totalHoursWorked = deptMetrics.reduce((sum, m) => sum + m.totalHoursWorked, 0);
      const totalOvertimeHours = deptMetrics.reduce((sum, m) => sum + m.overtimeHours, 0);
      
      // Productivity metrics
      const avgProductivityScore = this.calculateAverage(deptMetrics.map(m => m.productivityScore));
      const totalTasksCompleted = deptMetrics.reduce((sum, m) => sum + m.tasksCompleted, 0);
      const avgTaskCompletionRate = this.calculateAverage(deptMetrics.map(m => m.taskCompletionRate));
      const avgQualityScore = this.calculateAverage(deptMetrics.map(m => m.qualityScore));
      
      // Cost analysis
      const totalLaborCost = deptMetrics.reduce((sum, m) => sum + (m.laborCostPerHour * m.totalHoursWorked), 0);
      const avgLaborCostPerHour = this.calculateAverage(deptMetrics.map(m => m.laborCostPerHour));
      const avgCostEfficiencyRatio = this.calculateAverage(deptMetrics.map(m => m.costEfficiencyRatio));
      
      // Top performers
      const topPerformers = deptMetrics
        .sort((a, b) => b.performanceRating - a.performanceRating)
        .slice(0, 3)
        .map(metrics => ({
          employeeId: metrics.employeeId,
          name: metrics.employeeName,
          performanceScore: metrics.performanceRating * 20, // Convert to 0-100 scale
          keyStrengths: metrics.strengths.slice(0, 3)
        }));
      
      // Improvement opportunities
      const improvementOpportunities = this.identifyDepartmentImprovements(deptMetrics);
      
      return {
        department,
        totalEmployees: deptEmployees.length,
        activeEmployees: deptEmployees.filter(emp => emp.status === 'active').length,
        
        averagePerformanceRating: avgPerformanceRating,
        averageAttendanceRate: avgAttendanceRate,
        averagePunctualityScore: avgPunctualityScore,
        totalHoursWorked: totalHoursWorked,
        totalOvertimeHours: totalOvertimeHours,
        
        averageProductivityScore: avgProductivityScore,
        totalTasksCompleted: totalTasksCompleted,
        averageTaskCompletionRate: avgTaskCompletionRate,
        averageQualityScore: avgQualityScore,
        
        totalLaborCost: Math.round(totalLaborCost * 100) / 100,
        averageLaborCostPerHour: avgLaborCostPerHour,
        costEfficiencyRatio: avgCostEfficiencyRatio,
        budgetVariance: 0, // Would require budget data
        
        understaffedShifts: 0, // Would require scheduling analysis
        overstaffedShifts: 0,
        optimalStaffingRate: 85, // Mock value
        
        topPerformers,
        improvementOpportunities
      };
    });
  }

  private static createEmptyDepartmentAnalytics(department: Department, totalEmployees: number): DepartmentAnalytics {
    return {
      department,
      totalEmployees,
      activeEmployees: 0,
      averagePerformanceRating: 0,
      averageAttendanceRate: 0,
      averagePunctualityScore: 0,
      totalHoursWorked: 0,
      totalOvertimeHours: 0,
      averageProductivityScore: 0,
      totalTasksCompleted: 0,
      averageTaskCompletionRate: 0,
      averageQualityScore: 0,
      totalLaborCost: 0,
      averageLaborCostPerHour: 0,
      costEfficiencyRatio: 0,
      budgetVariance: 0,
      understaffedShifts: 0,
      overstaffedShifts: 0,
      optimalStaffingRate: 0,
      topPerformers: [],
      improvementOpportunities: []
    };
  }

  private static identifyDepartmentImprovements(metrics: PerformanceMetrics[]) {
    const improvements = [];
    
    const avgAttendance = this.calculateAverage(metrics.map(m => m.attendanceRate));
    if (avgAttendance < 85) {
      improvements.push({
        area: 'Attendance',
        impact: 'high' as const,
        recommendation: 'Implement attendance incentive program',
        affectedEmployees: metrics.filter(m => m.attendanceRate < 85).length
      });
    }
    
    const avgProductivity = this.calculateAverage(metrics.map(m => m.productivityScore));
    if (avgProductivity < 75) {
      improvements.push({
        area: 'Productivity',
        impact: 'high' as const,
        recommendation: 'Provide productivity training and tools',
        affectedEmployees: metrics.filter(m => m.productivityScore < 75).length
      });
    }
    
    return improvements;
  }

  // ============================================================================
  // ORGANIZATION METRICS CALCULATION
  // ============================================================================

  private static calculateOrganizationMetrics(
    employeeMetrics: PerformanceMetrics[],
    allEmployees: Employee[],
    config: StaffAnalyticsConfig
  ) {
    if (employeeMetrics.length === 0) {
      return this.createEmptyOrganizationMetrics();
    }
    
    const activeEmployees = allEmployees.filter(emp => emp.status === 'active');
    
    // Weighted averages by department
    const avgPerformanceRating = this.calculateWeightedAverage(
      employeeMetrics, 
      m => m.performanceRating, 
      m => config.departmentWeights[m.department as Department] || 1
    );
    
    const overallAttendanceRate = this.calculateWeightedAverage(
      employeeMetrics,
      m => m.attendanceRate,
      m => config.departmentWeights[m.department as Department] || 1
    );
    
    const overallPunctualityScore = this.calculateWeightedAverage(
      employeeMetrics,
      m => m.punctualityScore,
      m => config.departmentWeights[m.department as Department] || 1
    );
    
    const totalLaborCost = employeeMetrics.reduce((sum, m) => sum + (m.laborCostPerHour * m.totalHoursWorked), 0);
    
    // Calculate average tenure
    const avgTenure = this.calculateAverage(
      activeEmployees.map(emp => this.calculateTenureMonths(emp.hire_date))
    );
    
    // Mock turnover rate (would require historical data)
    const turnoverRate = 25; // 25% annual turnover
    
    return {
      totalActiveEmployees: activeEmployees.length,
      averagePerformanceRating: Math.round(avgPerformanceRating * 100) / 100,
      overallAttendanceRate: Math.round(overallAttendanceRate * 100) / 100,
      overallPunctualityScore: Math.round(overallPunctualityScore * 100) / 100,
      totalLaborCost: Math.round(totalLaborCost * 100) / 100,
      averageTenure: Math.round(avgTenure * 100) / 100,
      turnoverRate,
      
      costPerServiceHour: totalLaborCost / Math.max(1, employeeMetrics.reduce((sum, m) => sum + m.totalHoursWorked, 0)),
      
      performanceTrend: this.determineOrganizationTrend(employeeMetrics, 'performance') as 'improving' | 'stable' | 'declining',
      costTrend: 'stable' as const, // Would require historical cost data
      productivityTrend: this.determineOrganizationTrend(employeeMetrics, 'productivity') as 'improving' | 'stable' | 'declining'
    };
  }

  private static createEmptyOrganizationMetrics() {
    return {
      totalActiveEmployees: 0,
      averagePerformanceRating: 0,
      overallAttendanceRate: 0,
      overallPunctualityScore: 0,
      totalLaborCost: 0,
      averageTenure: 0,
      turnoverRate: 0,
      costPerServiceHour: 0,
      performanceTrend: 'stable' as const,
      costTrend: 'stable' as const,
      productivityTrend: 'stable' as const
    };
  }

  private static determineOrganizationTrend(metrics: PerformanceMetrics[], type: 'performance' | 'productivity'): string {
    const values = type === 'performance' 
      ? metrics.map(m => m.performanceRating)
      : metrics.map(m => m.productivityScore);
    
    const avg = this.calculateAverage(values);
    
    if (avg >= 4.0 || avg >= 85) return 'improving';
    if (avg >= 3.5 || avg >= 75) return 'stable';
    return 'declining';
  }

  // ============================================================================
  // STRATEGIC INSIGHTS GENERATION
  // ============================================================================

  private static generateStrategicInsights(
    employeeMetrics: PerformanceMetrics[],
    departmentAnalytics: DepartmentAnalytics[],
    organizationMetrics: OrganizationMetrics,
    config: StaffAnalyticsConfig
  ) {
    const insights = [];
    
    // Performance insights
    if (organizationMetrics.averagePerformanceRating >= 4.0) {
      insights.push({
        type: 'strength' as const,
        category: 'performance' as const,
        title: 'High Overall Performance',
        description: 'Organization maintains excellent performance standards across departments',
        impact: 'high' as const,
        recommendation: 'Continue current practices and share best practices across teams',
        priority: 2
      });
    }
    
    // Attendance insights
    if (organizationMetrics.overallAttendanceRate < config.attendanceThreshold) {
      insights.push({
        type: 'weakness' as const,
        category: 'performance' as const,
        title: 'Attendance Below Threshold',
        description: 'Organization-wide attendance rate needs improvement',
        impact: 'high' as const,
        recommendation: 'Implement attendance improvement program and review policies',
        priority: 4
      });
    }
    
    // Cost insights
    const highCostDepts = departmentAnalytics.filter(dept => dept.averageLaborCostPerHour > 25);
    if (highCostDepts.length > 0) {
      insights.push({
        type: 'opportunity' as const,
        category: 'cost' as const,
        title: 'Cost Optimization Opportunity',
        description: `High labor costs identified in ${highCostDepts.map(d => d.department).join(', ')}`,
        impact: 'medium' as const,
        recommendation: 'Review staffing levels and optimize scheduling efficiency',
        priority: 3
      });
    }
    
    return insights;
  }

  // ============================================================================
  // RECOMMENDATIONS GENERATION
  // ============================================================================

  private static generateRecommendations(
    employeeMetrics: PerformanceMetrics[]
  ) {
    // TODO: Use departmentAnalytics to generate department-specific recommendations
    // TODO: Use strategicInsights to align recommendations with strategic insights
    const recommendations = [];
    
    // Performance improvement recommendations
    const lowPerformers = employeeMetrics.filter(m => m.performanceRating < 3.0);
    if (lowPerformers.length > 0) {
      recommendations.push({
        id: 'perf-improvement-1',
        type: 'performance_improvement' as const,
        priority: 'high' as const,
        title: 'Performance Improvement Plan',
        description: 'Implement targeted performance improvement plans for underperforming employees',
        affectedEmployees: lowPerformers.map(m => m.employeeId),
        affectedDepartments: Array.from(new Set(lowPerformers.map(m => m.department))),
        estimatedImpact: 25,
        timeframe: 'medium_term' as const,
        actionSteps: [
          'Conduct performance reviews with affected employees',
          'Develop individual improvement plans',
          'Provide additional training and mentoring',
          'Set clear performance milestones',
          'Monitor progress monthly'
        ]
      });
    }
    
    // Training recommendations
    const skillGaps = this.identifySkillGaps(employeeMetrics);
    if (skillGaps.length > 0) {
      recommendations.push({
        id: 'training-1',
        type: 'training_program' as const,
        priority: 'medium' as const,
        title: 'Skills Development Program',
        description: 'Address identified skill gaps through targeted training programs',
        affectedEmployees: employeeMetrics.map(m => m.employeeId),
        affectedDepartments: Array.from(new Set(employeeMetrics.map(m => m.department))),
        estimatedImpact: 15,
        estimatedCost: 5000,
        timeframe: 'medium_term' as const,
        actionSteps: [
          'Assess current skill levels',
          'Design training curriculum',
          'Schedule training sessions',
          'Track skill development progress'
        ]
      });
    }
    
    return recommendations;
  }

  // ============================================================================
  // PERFORMANCE ALERTS GENERATION
  // ============================================================================

  private static generatePerformanceAlerts(
    employeeMetrics: PerformanceMetrics[],
    config: StaffAnalyticsConfig
  ) {
    const alerts: Array<{
      employeeId: string;
      employeeName: string;
      alertType: 'low_performance' | 'high_absenteeism' | 'overtime_concern' | 'retention_risk' | 'training_needed';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      recommendedActions: string[];
      deadline?: string;
    }> = [];
    
    employeeMetrics.forEach(metrics => {
      // Low performance alert
      if (metrics.performanceRating < config.lowPerformanceThreshold) {
        alerts.push({
          employeeId: metrics.employeeId,
          employeeName: metrics.employeeName,
          alertType: 'low_performance' as const,
          severity: metrics.performanceRating < 2.5 ? 'critical' as const : 'high' as const,
          message: `Performance rating (${metrics.performanceRating}/5) below acceptable threshold`,
          recommendedActions: [
            'Schedule performance review meeting',
            'Develop improvement plan',
            'Provide additional training'
          ]
        });
      }
      
      // High absenteeism alert
      if (metrics.attendanceRate < (100 - config.highAbsenteeismThreshold)) {
        alerts.push({
          employeeId: metrics.employeeId,
          employeeName: metrics.employeeName,
          alertType: 'high_absenteeism' as const,
          severity: metrics.attendanceRate < 70 ? 'critical' as const : 'high' as const,
          message: `Attendance rate (${metrics.attendanceRate}%) indicates high absenteeism`,
          recommendedActions: [
            'Discuss attendance issues',
            'Review attendance policy',
            'Consider support programs'
          ]
        });
      }
      
      // Overtime concern alert
      if (metrics.overtimeHours > config.overtimeThreshold) {
        alerts.push({
          employeeId: metrics.employeeId,
          employeeName: metrics.employeeName,
          alertType: 'overtime_concern' as const,
          severity: 'medium' as const,
          message: `Excessive overtime hours (${metrics.overtimeHours}) may indicate burnout risk`,
          recommendedActions: [
            'Review workload distribution',
            'Consider additional staffing',
            'Monitor employee wellbeing'
          ]
        });
      }
      
      // Retention risk alert
      if (metrics.retentionRisk === 'high') {
        alerts.push({
          employeeId: metrics.employeeId,
          employeeName: metrics.employeeName,
          alertType: 'retention_risk' as const,
          severity: 'high' as const,
          message: 'Employee shows high risk of turnover',
          recommendedActions: [
            'Conduct retention interview',
            'Review compensation and benefits',
            'Discuss career development opportunities'
          ]
        });
      }
    });
    
    return alerts;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static calculateWeightedAverage<T>(
    items: T[],
    valueSelector: (item: T) => number,
    weightSelector: (item: T) => number
  ): number {
    if (items.length === 0) return 0;
    
    const totalWeight = items.reduce((sum, item) => sum + weightSelector(item), 0);
    if (totalWeight === 0) return 0;
    
    const weightedSum = items.reduce((sum, item) => sum + (valueSelector(item) * weightSelector(item)), 0);
    return weightedSum / totalWeight;
  }

  private static identifySkillGaps(metrics: PerformanceMetrics[]): string[] {
    // Simplified skill gap analysis
    const gaps = [];
    
    const lowProductivityEmployees = metrics.filter(m => m.productivityScore < 70);
    if (lowProductivityEmployees.length > 0) {
      gaps.push('Productivity Enhancement');
    }
    
    const lowQualityEmployees = metrics.filter(m => m.qualityScore < 75);
    if (lowQualityEmployees.length > 0) {
      gaps.push('Quality Standards Training');
    }
    
    return gaps;
  }
}
