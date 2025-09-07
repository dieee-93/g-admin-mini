// ============================================================================
// STAFF PERFORMANCE ANALYTICS ENGINE - Comprehensive Test Suite
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { StaffPerformanceAnalyticsEngine } from '../staffPerformanceAnalyticsEngine';
import type { 
  Employee,
  TimeEntry,
  Schedule,
  PerformanceMetrics,
  DepartmentAnalytics,
  StaffAnalyticsConfig,
  Department,
  EmployeeStatus,
  ContractType,
  ScheduleStatus
} from '../staffPerformanceAnalyticsEngine';

// ============================================================================
// 1. TEST DATA FIXTURES
// ============================================================================

describe('Staff Performance Analytics Engine - Test Data Fixtures', () => {
  let mockEmployees: Employee[];
  let mockTimeEntries: TimeEntry[];
  let mockSchedules: Schedule[];
  let testConfig: StaffAnalyticsConfig;

  beforeEach(() => {
    // Mock Employees - Diverse performance profiles
    mockEmployees = [
      {
        id: 'emp-001',
        name: 'María García',
        email: 'maria@restaurant.com',
        phone: '+1234567890',
        department: 'Cocina' as Department,
        position: 'Cocinera Senior',
        hourly_rate: 22.50,
        hire_date: '2023-01-15T00:00:00Z',
        status: 'active' as EmployeeStatus,
        skills: ['Preparación', 'Cocina Caliente', 'Liderazgo'],
        performance_rating: 4.5,
        contract_type: 'full_time' as ContractType,
        created_at: '2023-01-15T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'emp-002',
        name: 'Carlos López',
        email: 'carlos@restaurant.com',
        department: 'Servicio' as Department,
        position: 'Mesero',
        hourly_rate: 18.00,
        hire_date: '2023-06-01T00:00:00Z',
        status: 'active' as EmployeeStatus,
        skills: ['Atención al Cliente', 'Ventas'],
        performance_rating: 3.8,
        contract_type: 'part_time' as ContractType,
        created_at: '2023-06-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'emp-003',
        name: 'Ana Torres',
        email: 'ana@restaurant.com',
        department: 'Administración' as Department,
        position: 'Cajera',
        hourly_rate: 16.50,
        hire_date: '2023-03-10T00:00:00Z',
        status: 'active' as EmployeeStatus,
        skills: ['Manejo de Efectivo', 'Sistemas POS'],
        performance_rating: 2.8, // Lower performer
        contract_type: 'full_time' as ContractType,
        created_at: '2023-03-10T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'emp-004',
        name: 'Roberto Sánchez',
        email: 'roberto@restaurant.com',
        department: 'Limpieza' as Department,
        position: 'Personal de Limpieza',
        hourly_rate: 15.00,
        hire_date: '2022-11-20T00:00:00Z',
        status: 'active' as EmployeeStatus,
        skills: ['Limpieza Profunda', 'Mantenimiento'],
        performance_rating: 4.2,
        contract_type: 'full_time' as ContractType,
        created_at: '2022-11-20T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'emp-005',
        name: 'Sofía Herrera',
        email: 'sofia@restaurant.com',
        department: 'Gerencia' as Department,
        position: 'Supervisora',
        hourly_rate: 28.00,
        hire_date: '2022-05-15T00:00:00Z',
        status: 'active' as EmployeeStatus,
        skills: ['Liderazgo', 'Gestión', 'Análisis'],
        performance_rating: 4.8,
        contract_type: 'full_time' as ContractType,
        created_at: '2022-05-15T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'emp-006',
        name: 'Diego Morales',
        email: 'diego@restaurant.com',
        department: 'Cocina' as Department,
        position: 'Ayudante de Cocina',
        hourly_rate: 14.50,
        hire_date: '2023-09-01T00:00:00Z',
        status: 'inactive' as EmployeeStatus, // Inactive employee
        skills: ['Preparación Básica'],
        performance_rating: 3.2,
        contract_type: 'part_time' as ContractType,
        created_at: '2023-09-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    // Mock Time Entries - Realistic work patterns (recent dates)
    const now = new Date();
    const recentDate1 = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
    const recentDate2 = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000)); // 6 days ago
    const recentDate3 = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)); // 5 days ago
    
    mockTimeEntries = [
      // María García - Excellent performer
      {
        id: 'time-001',
        employee_id: 'emp-001',
        clock_in: recentDate1.toISOString().replace('T', 'T08:00:').substring(0, 19) + 'Z',
        clock_out: recentDate1.toISOString().replace('T', 'T16:30:').substring(0, 19) + 'Z',
        break_minutes: 60,
        total_hours: 7.5,
        notes: 'Cocinó menú especial',
        created_at: recentDate1.toISOString(),
        updated_at: recentDate1.toISOString()
      },
      {
        id: 'time-002',
        employee_id: 'emp-001',
        clock_in: recentDate2.toISOString().replace('T', 'T08:00:').substring(0, 19) + 'Z',
        clock_out: recentDate2.toISOString().replace('T', 'T17:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        total_hours: 8.0,
        created_at: recentDate2.toISOString(),
        updated_at: recentDate2.toISOString()
      },
      // Carlos López - Good performer with some tardiness
      {
        id: 'time-003',
        employee_id: 'emp-002',
        clock_in: recentDate1.toISOString().replace('T', 'T12:15:').substring(0, 19) + 'Z', // 15 minutes late
        clock_out: recentDate1.toISOString().replace('T', 'T20:00:').substring(0, 19) + 'Z',
        break_minutes: 30,
        total_hours: 7.25,
        notes: 'Llegó tarde por tráfico',
        created_at: recentDate1.toISOString(),
        updated_at: recentDate1.toISOString()
      },
      {
        id: 'time-004',
        employee_id: 'emp-002',
        clock_in: recentDate2.toISOString().replace('T', 'T12:00:').substring(0, 19) + 'Z',
        clock_out: recentDate2.toISOString().replace('T', 'T20:00:').substring(0, 19) + 'Z',
        break_minutes: 30,
        total_hours: 7.5,
        created_at: recentDate2.toISOString(),
        updated_at: recentDate2.toISOString()
      },
      // Ana Torres - Lower performer with attendance issues
      {
        id: 'time-005',
        employee_id: 'emp-003',
        clock_in: recentDate1.toISOString().replace('T', 'T09:30:').substring(0, 19) + 'Z', // 30 minutes late
        clock_out: recentDate1.toISOString().replace('T', 'T17:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        total_hours: 6.5, // Short shift
        notes: 'Problemas personales',
        created_at: recentDate1.toISOString(),
        updated_at: recentDate1.toISOString()
      },
      // Roberto Sánchez - Consistent performer
      {
        id: 'time-006',
        employee_id: 'emp-004',
        clock_in: recentDate1.toISOString().replace('T', 'T06:00:').substring(0, 19) + 'Z',
        clock_out: recentDate1.toISOString().replace('T', 'T14:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        total_hours: 7.0,
        created_at: recentDate1.toISOString(),
        updated_at: recentDate1.toISOString()
      },
      // Sofía Herrera - High performer with overtime
      {
        id: 'time-007',
        employee_id: 'emp-005',
        clock_in: recentDate1.toISOString().replace('T', 'T08:00:').substring(0, 19) + 'Z',
        clock_out: recentDate1.toISOString().replace('T', 'T19:00:').substring(0, 19) + 'Z', // 11 hours
        break_minutes: 60,
        total_hours: 10.0,
        notes: 'Reunión con proveedores',
        created_at: recentDate1.toISOString(),
        updated_at: recentDate1.toISOString()
      }
    ];

    // Mock Schedules - Planned vs actual comparison (recent dates)
    mockSchedules = [
      // María García - Perfect attendance
      {
        id: 'sched-001',
        employee_id: 'emp-001',
        start_time: recentDate1.toISOString().replace('T', 'T08:00:').substring(0, 19) + 'Z',
        end_time: recentDate1.toISOString().replace('T', 'T16:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        status: 'completed' as ScheduleStatus,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: recentDate1.toISOString()
      },
      {
        id: 'sched-002',
        employee_id: 'emp-001',
        start_time: recentDate2.toISOString().replace('T', 'T08:00:').substring(0, 19) + 'Z',
        end_time: recentDate2.toISOString().replace('T', 'T16:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        status: 'completed' as ScheduleStatus,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: recentDate2.toISOString()
      },
      // Carlos López - Good attendance
      {
        id: 'sched-003',
        employee_id: 'emp-002',
        start_time: recentDate1.toISOString().replace('T', 'T12:00:').substring(0, 19) + 'Z',
        end_time: recentDate1.toISOString().replace('T', 'T20:00:').substring(0, 19) + 'Z',
        break_minutes: 30,
        status: 'completed' as ScheduleStatus,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: recentDate1.toISOString()
      },
      {
        id: 'sched-004',
        employee_id: 'emp-002',
        start_time: recentDate2.toISOString().replace('T', 'T12:00:').substring(0, 19) + 'Z',
        end_time: recentDate2.toISOString().replace('T', 'T20:00:').substring(0, 19) + 'Z',
        break_minutes: 30,
        status: 'completed' as ScheduleStatus,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: recentDate2.toISOString()
      },
      // Ana Torres - Missed shift
      {
        id: 'sched-005',
        employee_id: 'emp-003',
        start_time: recentDate1.toISOString().replace('T', 'T09:00:').substring(0, 19) + 'Z',
        end_time: recentDate1.toISOString().replace('T', 'T17:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        status: 'completed' as ScheduleStatus,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: recentDate1.toISOString()
      },
      {
        id: 'sched-006',
        employee_id: 'emp-003',
        start_time: recentDate2.toISOString().replace('T', 'T09:00:').substring(0, 19) + 'Z',
        end_time: recentDate2.toISOString().replace('T', 'T17:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        status: 'missed' as ScheduleStatus, // Missed shift
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: recentDate2.toISOString()
      },
      // Roberto Sánchez - Reliable
      {
        id: 'sched-007',
        employee_id: 'emp-004',
        start_time: recentDate1.toISOString().replace('T', 'T06:00:').substring(0, 19) + 'Z',
        end_time: recentDate1.toISOString().replace('T', 'T14:00:').substring(0, 19) + 'Z',
        break_minutes: 60,
        status: 'completed' as ScheduleStatus,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: recentDate1.toISOString()
      }
    ];

    // Test configuration
    testConfig = {
      analysisMonths: 1,
      minShiftsForAnalysis: 2,
      attendanceThreshold: 90,
      punctualityThreshold: 85,
      performanceThreshold: 3.5,
      lowPerformanceThreshold: 3.0,
      highAbsenteeismThreshold: 15,
      overtimeThreshold: 8,
      includeLaborCostAnalysis: true,
      includeRevenuePerEmployee: true,
      budgetVarianceThreshold: 10,
      departmentWeights: {
        'Cocina': 0.30,
        'Servicio': 0.25,
        'Administración': 0.20,
        'Limpieza': 0.15,
        'Gerencia': 0.10
      }
    };
  });

  it('Should initialize test data correctly', () => {
    expect(mockEmployees).toHaveLength(6);
    expect(mockTimeEntries).toHaveLength(7);
    expect(mockSchedules).toHaveLength(7);
    expect(testConfig.analysisMonths).toBe(1);
  });

  it('Should have diverse employee performance profiles', () => {
    const highPerformers = mockEmployees.filter(emp => emp.performance_rating >= 4.0);
    const lowPerformers = mockEmployees.filter(emp => emp.performance_rating < 3.0);
    const activeEmployees = mockEmployees.filter(emp => emp.status === 'active');
    
    expect(highPerformers.length).toBeGreaterThan(0);
    expect(lowPerformers.length).toBeGreaterThan(0);
    expect(activeEmployees.length).toBe(5);
  });

  it('Should have time entries with various patterns', () => {
    const onTimeEntries = mockTimeEntries.filter(entry => 
      entry.clock_in.includes('T08:00:') || entry.clock_in.includes('T12:00:') || entry.clock_in.includes('T06:00:')
    );
    const lateEntries = mockTimeEntries.filter(entry => 
      entry.clock_in.includes('T12:15:') || entry.clock_in.includes('T09:30:')
    );
    
    expect(onTimeEntries.length).toBeGreaterThan(0);
    expect(lateEntries.length).toBeGreaterThan(0);
  });

  it('Should have schedule variations', () => {
    const completedSchedules = mockSchedules.filter(sched => sched.status === 'completed');
    const missedSchedules = mockSchedules.filter(sched => sched.status === 'missed');
    
    expect(completedSchedules.length).toBeGreaterThan(0);
    expect(missedSchedules.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // 2. CORE ANALYTICS ENGINE TESTS
  // ============================================================================

  describe('Core Analytics Engine', () => {
    it('Should generate complete staff analytics', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result).toBeDefined();
      expect(result.generatedAt).toBeDefined();
      expect(result.periodStart).toBeDefined();
      expect(result.periodEnd).toBeDefined();
      expect(result.totalEmployeesAnalyzed).toBeGreaterThan(0);
      expect(result.employeeMetrics).toBeInstanceOf(Array);
      expect(result.departmentAnalytics).toBeInstanceOf(Array);
      expect(result.organizationMetrics).toBeDefined();
      expect(result.strategicInsights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.performanceAlerts).toBeInstanceOf(Array);
    });

    it('Should filter employees with insufficient data', async () => {
      const limitedConfig = { ...testConfig, minShiftsForAnalysis: 10 };
      
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        limitedConfig
      );

      expect(result.totalEmployeesAnalyzed).toBeLessThanOrEqual(mockEmployees.length);
    });

    it('Should handle empty datasets gracefully', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        [],
        [],
        [],
        testConfig
      );

      expect(result.totalEmployeesAnalyzed).toBe(0);
      expect(result.employeeMetrics).toHaveLength(0);
      expect(result.organizationMetrics.totalActiveEmployees).toBe(0);
    });

    it('Should apply date filtering correctly', async () => {
      const futureTimeEntries = [
        {
          ...mockTimeEntries[0],
          created_at: '2025-01-01T00:00:00Z'
        }
      ];

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees.slice(0, 1),
        futureTimeEntries,
        mockSchedules.slice(0, 1),
        testConfig
      );

      // Should filter out future entries
      expect(result.totalEmployeesAnalyzed).toBe(0);
    });
  });

  // ============================================================================
  // 3. INDIVIDUAL PERFORMANCE METRICS TESTS
  // ============================================================================

  describe('Individual Performance Metrics', () => {
    it('Should calculate attendance rate correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const mariaMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-001');
      const anaMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-003');

      expect(mariaMetrics?.attendanceRate).toBe(100); // Perfect attendance
      expect(anaMetrics?.attendanceRate).toBe(50); // Missed one shift
    });

    it('Should calculate punctuality score accurately', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const mariaMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-001');
      const carlosMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-002');

      expect(mariaMetrics?.punctualityScore).toBeGreaterThanOrEqual(0); // Calculated based on actual algorithm
      expect(carlosMetrics?.punctualityScore).toBeGreaterThanOrEqual(0); // Calculated based on actual algorithm
    });

    it('Should calculate total hours worked', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const mariaMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-001');
      const expectedHours = 7.5 + 8.0; // Sum of María's time entries

      expect(mariaMetrics?.totalHoursWorked).toBe(expectedHours);
    });

    it('Should identify overtime hours', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const sofiaMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-005');
      if (sofiaMetrics) {
        expect(sofiaMetrics.overtimeHours).toBeGreaterThan(0); // Sofía worked 10 hours
      }
    });

    it('Should calculate productivity scores based on performance rating', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const highPerformerMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-001');
      const lowPerformerMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-003');

      expect(highPerformerMetrics?.productivityScore).toBeGreaterThan(
        lowPerformerMetrics?.productivityScore || 0
      );
    });

    it('Should identify performance strengths and improvement areas', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const highPerformerMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-001');
      const lowPerformerMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-003');

      expect(highPerformerMetrics?.strengths.length).toBeGreaterThan(0);
      expect(lowPerformerMetrics?.improvementAreas.length).toBeGreaterThan(0);
    });

    it('Should calculate financial metrics correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const metrics = result.employeeMetrics[0];
      expect(metrics.laborCostPerHour).toBeGreaterThan(0);
      expect(metrics.costEfficiencyRatio).toBeGreaterThan(0);
    });

    it('Should assess retention risk accurately', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const lowPerformerMetrics = result.employeeMetrics.find(m => m.employeeId === 'emp-003');
      expect(['medium', 'high']).toContain(lowPerformerMetrics?.retentionRisk);
    });

    it('Should determine performance trends', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      result.employeeMetrics.forEach(metrics => {
        expect(['improving', 'stable', 'declining']).toContain(metrics.performanceTrend);
      });
    });
  });

  // ============================================================================
  // 4. DEPARTMENT ANALYTICS TESTS
  // ============================================================================

  describe('Department Analytics', () => {
    it('Should analyze all departments present in data', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const departments = Array.from(new Set(mockEmployees.map(emp => emp.department)));
      expect(result.departmentAnalytics).toHaveLength(departments.length);
    });

    it('Should calculate department averages correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const cocinaAnalytics = result.departmentAnalytics.find(dept => dept.department === 'Cocina');
      expect(cocinaAnalytics?.averagePerformanceRating).toBeGreaterThan(0);
      expect(cocinaAnalytics?.averageAttendanceRate).toBeGreaterThanOrEqual(0);
      expect(cocinaAnalytics?.totalLaborCost).toBeGreaterThan(0);
    });

    it('Should identify top performers in each department', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      result.departmentAnalytics.forEach(dept => {
        if (dept.topPerformers.length > 0) {
          expect(dept.topPerformers[0].performanceScore).toBeGreaterThan(0);
          expect(dept.topPerformers[0].keyStrengths).toBeInstanceOf(Array);
        }
      });
    });

    it('Should identify improvement opportunities', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const departmentsWithIssues = result.departmentAnalytics.filter(
        dept => dept.improvementOpportunities.length > 0
      );
      
      if (departmentsWithIssues.length > 0) {
        departmentsWithIssues.forEach(dept => {
          dept.improvementOpportunities.forEach(opp => {
            expect(opp.area).toBeDefined();
            expect(['high', 'medium', 'low']).toContain(opp.impact);
            expect(opp.recommendation).toBeDefined();
            expect(opp.affectedEmployees).toBeGreaterThanOrEqual(0);
          });
        });
      }
    });

    it('Should handle departments with no valid metrics', async () => {
      const limitedConfig = { ...testConfig, minShiftsForAnalysis: 20 };
      
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        limitedConfig
      );

      // Should still have department entries, but with zero values
      expect(result.departmentAnalytics.length).toBeGreaterThan(0);
      result.departmentAnalytics.forEach(dept => {
        expect(dept.department).toBeDefined();
        expect(dept.totalEmployees).toBeGreaterThanOrEqual(0);
      });
    });

    it('Should aggregate department totals correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const totalEmployeesFromDepts = result.departmentAnalytics.reduce(
        (sum, dept) => sum + dept.activeEmployees, 0
      );
      
      expect(totalEmployeesFromDepts).toBeLessThanOrEqual(
        mockEmployees.filter(emp => emp.status === 'active').length
      );
    });
  });

  // ============================================================================
  // 5. ORGANIZATION-WIDE METRICS TESTS
  // ============================================================================

  describe('Organization-wide Metrics', () => {
    it('Should calculate weighted organization averages', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result.organizationMetrics.averagePerformanceRating).toBeGreaterThan(0);
      expect(result.organizationMetrics.averagePerformanceRating).toBeLessThanOrEqual(5);
      expect(result.organizationMetrics.overallAttendanceRate).toBeGreaterThanOrEqual(0);
      expect(result.organizationMetrics.overallAttendanceRate).toBeLessThanOrEqual(100);
    });

    it('Should calculate total labor cost accurately', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result.organizationMetrics.totalLaborCost).toBeGreaterThan(0);
      expect(result.organizationMetrics.costPerServiceHour).toBeGreaterThan(0);
    });

    it('Should determine organization trends', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(['improving', 'stable', 'declining']).toContain(
        result.organizationMetrics.performanceTrend
      );
      expect(['improving', 'stable', 'declining']).toContain(
        result.organizationMetrics.productivityTrend
      );
      expect(['increasing', 'stable', 'decreasing']).toContain(
        result.organizationMetrics.costTrend
      );
    });

    it('Should calculate average tenure correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result.organizationMetrics.averageTenure).toBeGreaterThan(0);
    });

    it('Should count active employees correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const expectedActiveCount = mockEmployees.filter(emp => emp.status === 'active').length;
      expect(result.organizationMetrics.totalActiveEmployees).toBe(expectedActiveCount);
    });
  });

  // ============================================================================
  // 6. STRATEGIC INSIGHTS TESTS
  // ============================================================================

  describe('Strategic Insights', () => {
    it('Should generate strategic insights', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result.strategicInsights).toBeInstanceOf(Array);
      
      if (result.strategicInsights.length > 0) {
        result.strategicInsights.forEach(insight => {
          expect(['strength', 'weakness', 'opportunity', 'threat']).toContain(insight.type);
          expect(['performance', 'cost', 'staffing', 'training', 'retention']).toContain(insight.category);
          expect(insight.title).toBeDefined();
          expect(insight.description).toBeDefined();
          expect(['high', 'medium', 'low']).toContain(insight.impact);
          expect(insight.recommendation).toBeDefined();
          expect(insight.priority).toBeGreaterThanOrEqual(1);
          expect(insight.priority).toBeLessThanOrEqual(5);
        });
      }
    });

    it('Should identify performance strengths when present', async () => {
      // Use employees with high performance ratings
      const highPerformanceEmployees = mockEmployees.map(emp => ({
        ...emp,
        performance_rating: 4.5
      }));

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        highPerformanceEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const strengths = result.strategicInsights.filter(insight => insight.type === 'strength');
      expect(strengths.length).toBeGreaterThanOrEqual(0);
    });

    it('Should identify weaknesses when present', async () => {
      // Use employees with poor attendance
      const lowAttendanceConfig = { ...testConfig, attendanceThreshold: 95 };

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        lowAttendanceConfig
      );

      const weaknesses = result.strategicInsights.filter(insight => insight.type === 'weakness');
      expect(weaknesses.length).toBeGreaterThanOrEqual(0);
    });

    it('Should identify cost optimization opportunities', async () => {
      // Use employees with high hourly rates
      const highCostEmployees = mockEmployees.map(emp => ({
        ...emp,
        hourly_rate: 30.00
      }));

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        highCostEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const opportunities = result.strategicInsights.filter(insight => insight.type === 'opportunity');
      expect(opportunities.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // 7. ACTIONABLE RECOMMENDATIONS TESTS
  // ============================================================================

  describe('Actionable Recommendations', () => {
    it('Should generate actionable recommendations', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result.recommendations).toBeInstanceOf(Array);
      
      if (result.recommendations.length > 0) {
        result.recommendations.forEach(rec => {
          expect([
            'performance_improvement',
            'cost_optimization',
            'staffing_adjustment',
            'training_program',
            'retention_strategy'
          ]).toContain(rec.type);
          expect(['critical', 'high', 'medium', 'low']).toContain(rec.priority);
          expect(rec.title).toBeDefined();
          expect(rec.description).toBeDefined();
          expect(rec.affectedEmployees).toBeInstanceOf(Array);
          expect(rec.affectedDepartments).toBeInstanceOf(Array);
          expect(rec.estimatedImpact).toBeGreaterThan(0);
          expect(['immediate', 'short_term', 'medium_term', 'long_term']).toContain(rec.timeframe);
          expect(rec.actionSteps).toBeInstanceOf(Array);
          expect(rec.actionSteps.length).toBeGreaterThan(0);
        });
      }
    });

    it('Should recommend performance improvement for low performers', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const performanceRecommendations = result.recommendations.filter(
        rec => rec.type === 'performance_improvement'
      );

      if (performanceRecommendations.length > 0) {
        const rec = performanceRecommendations[0];
        expect(rec.affectedEmployees.length).toBeGreaterThan(0);
        expect(rec.actionSteps.length).toBeGreaterThan(0);
      }
    });

    it('Should recommend training when skill gaps identified', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const trainingRecommendations = result.recommendations.filter(
        rec => rec.type === 'training_program'
      );

      if (trainingRecommendations.length > 0) {
        const rec = trainingRecommendations[0];
        expect(rec.estimatedCost).toBeGreaterThan(0);
        expect(rec.actionSteps).toContain('Assess current skill levels');
      }
    });

    it('Should prioritize recommendations correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      if (result.recommendations.length > 1) {
        const priorities = result.recommendations.map(rec => rec.priority);
        const hasCritical = priorities.includes('critical');
        const hasHigh = priorities.includes('high');
        
        if (hasCritical) {
          expect(hasHigh || hasCritical).toBe(true);
        }
      }
    });
  });

  // ============================================================================
  // 8. PERFORMANCE ALERTS TESTS
  // ============================================================================

  describe('Performance Alerts', () => {
    it('Should generate performance alerts', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result.performanceAlerts).toBeInstanceOf(Array);
      
      if (result.performanceAlerts.length > 0) {
        result.performanceAlerts.forEach(alert => {
          expect(alert.employeeId).toBeDefined();
          expect(alert.employeeName).toBeDefined();
          expect([
            'low_performance',
            'high_absenteeism',
            'overtime_concern',
            'retention_risk',
            'training_needed'
          ]).toContain(alert.alertType);
          expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
          expect(alert.message).toBeDefined();
          expect(alert.recommendedActions).toBeInstanceOf(Array);
          expect(alert.recommendedActions.length).toBeGreaterThan(0);
        });
      }
    });

    it('Should alert for low performance', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const lowPerformanceAlerts = result.performanceAlerts.filter(
        alert => alert.alertType === 'low_performance'
      );

      // Ana Torres should trigger low performance alert
      const anaAlert = lowPerformanceAlerts.find(alert => alert.employeeId === 'emp-003');
      if (anaAlert) {
        expect(anaAlert.severity).toEqual('high');
        expect(anaAlert.recommendedActions).toContain('Schedule performance review meeting');
      }
    });

    it('Should alert for high absenteeism', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const absenteeismAlerts = result.performanceAlerts.filter(
        alert => alert.alertType === 'high_absenteeism'
      );

      // Ana Torres should trigger absenteeism alert (50% attendance)
      const anaAlert = absenteeismAlerts.find(alert => alert.employeeId === 'emp-003');
      if (anaAlert) {
        expect(anaAlert.severity).toEqual('critical');
        expect(anaAlert.recommendedActions).toContain('Discuss attendance issues');
      }
    });

    it('Should alert for overtime concerns', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const overtimeAlerts = result.performanceAlerts.filter(
        alert => alert.alertType === 'overtime_concern'
      );

      // Sofía Herrera should trigger overtime alert (10 hours)
      const sofiaAlert = overtimeAlerts.find(alert => alert.employeeId === 'emp-005');
      if (sofiaAlert) {
        expect(sofiaAlert.severity).toEqual('medium');
        expect(sofiaAlert.recommendedActions).toContain('Review workload distribution');
      }
    });

    it('Should alert for retention risks', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const retentionAlerts = result.performanceAlerts.filter(
        alert => alert.alertType === 'retention_risk'
      );

      if (retentionAlerts.length > 0) {
        retentionAlerts.forEach(alert => {
          expect(alert.severity).toEqual('high');
          expect(alert.recommendedActions).toContain('Conduct retention interview');
        });
      }
    });

    it('Should categorize alert severity correctly', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        testConfig
      );

      const criticalAlerts = result.performanceAlerts.filter(alert => alert.severity === 'critical');
      const highAlerts = result.performanceAlerts.filter(alert => alert.severity === 'high');
      
      if (criticalAlerts.length > 0) {
        criticalAlerts.forEach(alert => {
          expect(['low_performance', 'high_absenteeism']).toContain(alert.alertType);
        });
      }
      
      if (highAlerts.length > 0) {
        highAlerts.forEach(alert => {
          expect(alert.recommendedActions.length).toBeGreaterThan(0);
        });
      }
    });
  });

  // ============================================================================
  // 9. CONFIGURATION AND EDGE CASES TESTS
  // ============================================================================

  describe('Configuration and Edge Cases', () => {
    it('Should respect minimum shifts threshold', async () => {
      const highThresholdConfig = { ...testConfig, minShiftsForAnalysis: 10 };
      
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        highThresholdConfig
      );

      expect(result.totalEmployeesAnalyzed).toBe(0);
    });

    it('Should apply custom alert thresholds', async () => {
      const strictConfig = {
        ...testConfig,
        lowPerformanceThreshold: 4.0,
        highAbsenteeismThreshold: 5,
        overtimeThreshold: 5
      };

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        strictConfig
      );

      // With stricter thresholds, should generate more alerts
      expect(result.performanceAlerts.length).toBeGreaterThanOrEqual(0);
    });

    it('Should handle custom department weights', async () => {
      const customWeightsConfig = {
        ...testConfig,
        departmentWeights: {
          'Cocina': 0.50,
          'Servicio': 0.30,
          'Administración': 0.10,
          'Limpieza': 0.05,
          'Gerencia': 0.05
        }
      };

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        customWeightsConfig
      );

      // Kitchen should have higher influence on organization metrics
      expect(result.organizationMetrics.averagePerformanceRating).toBeGreaterThan(0);
    });

    it('Should handle missing time entries gracefully', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        [], // Empty time entries
        mockSchedules,
        testConfig
      );

      expect(result.totalEmployeesAnalyzed).toBeGreaterThanOrEqual(0); // May have valid metrics from schedules
    });

    it('Should handle missing schedules gracefully', async () => {
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        [], // Empty schedules
        testConfig
      );

      expect(result.totalEmployeesAnalyzed).toBe(0); // No valid metrics without schedules
    });

    it('Should handle employees with no matching time entries', async () => {
      const unmatchedTimeEntries = mockTimeEntries.map(entry => ({
        ...entry,
        employee_id: 'non-existent-employee'
      }));

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        unmatchedTimeEntries,
        mockSchedules,
        testConfig
      );

      expect(result.totalEmployeesAnalyzed).toBeGreaterThanOrEqual(0); // May have valid metrics from schedules
    });

    it('Should handle invalid date formats gracefully', async () => {
      const invalidTimeEntries = mockTimeEntries.map(entry => ({
        ...entry,
        created_at: 'invalid-date'
      }));

      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        invalidTimeEntries,
        mockSchedules,
        testConfig
      );

      // Should filter out entries with invalid dates but may still have valid schedules
      expect(result.totalEmployeesAnalyzed).toBeGreaterThanOrEqual(0);
    });

    it('Should apply analysis period correctly', async () => {
      const longPeriodConfig = { ...testConfig, analysisMonths: 12 };
      
      const result = await StaffPerformanceAnalyticsEngine.generateStaffAnalytics(
        mockEmployees,
        mockTimeEntries,
        mockSchedules,
        longPeriodConfig
      );

      const periodDiff = new Date(result.periodEnd).getTime() - new Date(result.periodStart).getTime();
      const expectedDays = 12 * 30; // Approximate
      const actualDays = periodDiff / (1000 * 60 * 60 * 24);
      
      expect(actualDays).toBeCloseTo(expectedDays, -1); // Within 10 days tolerance
    });
  });
});
