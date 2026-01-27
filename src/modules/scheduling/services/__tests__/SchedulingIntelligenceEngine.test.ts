// SchedulingIntelligenceEngine.test.ts - Tests para Sistema Inteligente
// Valida algoritmos de análisis y generación de alertas

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SchedulingIntelligenceEngine,
  type SchedulingData,
  type IntelligentAlert
} from '../SchedulingIntelligenceEngine';

describe('SchedulingIntelligenceEngine', () => {
  let engine: SchedulingIntelligenceEngine;
  let mockData: SchedulingData;

  beforeEach(() => {
    engine = new SchedulingIntelligenceEngine();

    // Mock data representativo
    mockData = {
      schedulingStats: {
        total_shifts_this_week: 156,
        employees_scheduled: 24,
        coverage_percentage: 85,
        pending_time_off: 8,
        labor_cost_this_week: 22000,
        overtime_hours: 15,
        understaffed_shifts: 2,
        approved_requests: 15
      },
      shifts: [
        {
          id: '1',
          employeeId: 'emp1',
          startTime: '09:00',
          endTime: '17:00',
          date: '2024-01-15',
          position: 'manager',
          status: 'confirmed'
        },
        {
          id: '2',
          employeeId: 'emp2',
          startTime: '08:00',
          endTime: '18:00', // 10 horas = overtime
          date: '2024-01-15',
          position: 'staff',
          status: 'confirmed'
        }
      ],
      timeOffRequests: [
        {
          id: '1',
          employeeId: 'emp3',
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          status: 'pending',
          type: 'vacation'
        }
      ],
      employees: [
        {
          id: 'emp1',
          name: 'Manager One',
          position: 'manager',
          hourlyRate: 25,
          maxWeeklyHours: 40
        },
        {
          id: 'emp2',
          name: 'Staff Two',
          position: 'staff',
          hourlyRate: 18,
          maxWeeklyHours: 40
        }
      ],
      laborRates: {
        manager: 25,
        staff: 18,
        supervisor: 22
      },
      settings: {
        enablePredictive: true,
        analysisDepth: 'detailed',
        includeProjections: true,
        maxAlerts: 10
      }
    };
  });

  describe('Core Analysis Functionality', () => {
    it('should generate intelligent alerts from scheduling data', () => {
      const alerts = engine.analyze(mockData);

      expect(alerts).toBeDefined();
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should include required alert properties', () => {
      const alerts = engine.analyze(mockData);
      const alert = alerts[0];

      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('title');
      expect(alert).toHaveProperty('description');
      expect(alert).toHaveProperty('confidence');
      expect(alert).toHaveProperty('recommendation');
      expect(alert).toHaveProperty('metadata');
      expect(alert).toHaveProperty('affectedAreas');
    });

    it('should assign appropriate confidence levels', () => {
      const alerts = engine.analyze(mockData);

      alerts.forEach(alert => {
        expect(alert.confidence).toBeGreaterThanOrEqual(0);
        expect(alert.confidence).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Labor Cost Analysis', () => {
    it('should detect high labor costs', () => {
      const highCostData = {
        ...mockData,
        schedulingStats: {
          ...mockData.schedulingStats,
          labor_cost_this_week: 35000 // Excede umbral
        }
      };

      const alerts = engine.analyze(highCostData);
      const laborCostAlert = alerts.find(alert => alert.type === 'high_labor_cost');

      expect(laborCostAlert).toBeDefined();
      expect(laborCostAlert?.severity).toBe('warning');
      expect(laborCostAlert?.metadata.costImpact).toBeGreaterThan(0);
    });

    it('should detect overtime patterns', () => {
      const overtimeData = {
        ...mockData,
        schedulingStats: {
          ...mockData.schedulingStats,
          overtime_hours: 25 // Alto nivel de overtime
        }
      };

      const alerts = engine.analyze(overtimeData);
      const overtimeAlert = alerts.find(alert => alert.type === 'overtime_detected');

      expect(overtimeAlert).toBeDefined();
      expect(overtimeAlert?.affectedAreas).toContain('labor_compliance');
    });
  });

  describe('Coverage Gap Analysis', () => {
    it('should detect critical coverage gaps', () => {
      const lowCoverageData = {
        ...mockData,
        schedulingStats: {
          ...mockData.schedulingStats,
          coverage_percentage: 70, // Crítico
          understaffed_shifts: 5
        }
      };

      const alerts = engine.analyze(lowCoverageData);
      const coverageAlert = alerts.find(alert => alert.type === 'coverage_critical');

      expect(coverageAlert).toBeDefined();
      expect(coverageAlert?.severity).toBe('critical');
    });

    it('should predict coverage gaps based on patterns', () => {
      // Simular datos que sugieren gaps futuros
      const predictiveData = {
        ...mockData,
        timeOffRequests: [
          ...mockData.timeOffRequests,
          {
            id: '2',
            employeeId: 'emp1',
            startDate: '2024-01-25',
            endDate: '2024-01-27',
            status: 'approved',
            type: 'sick'
          },
          {
            id: '3',
            employeeId: 'emp2',
            startDate: '2024-01-26',
            endDate: '2024-01-28',
            status: 'approved',
            type: 'vacation'
          }
        ]
      };

      const alerts = engine.analyze(predictiveData);
      const predictiveAlert = alerts.find(alert => alert.type === 'predictive_coverage_gap');

      expect(predictiveAlert).toBeDefined();
      expect(predictiveAlert?.metadata.projectedDate).toBeDefined();
    });
  });

  describe('Efficiency Pattern Analysis', () => {
    it('should detect low efficiency patterns', () => {
      const inefficientData = {
        ...mockData,
        schedulingStats: {
          ...mockData.schedulingStats,
          labor_cost_this_week: 30000, // Alto costo
          total_shifts_this_week: 100   // Pocos turnos para el costo
        }
      };

      const alerts = engine.analyze(inefficientData);
      const efficiencyAlert = alerts.find(alert => alert.type === 'efficiency_low');

      expect(efficiencyAlert).toBeDefined();
      expect(efficiencyAlert?.metadata.costPerShift).toBeGreaterThan(200);
    });

    it('should calculate cost efficiency metrics correctly', () => {
      const alerts = engine.analyze(mockData);
      const costAlert = alerts.find(alert => alert.metadata.costPerShift);

      if (costAlert) {
        const expectedCostPerShift = mockData.schedulingStats.labor_cost_this_week /
                                   mockData.schedulingStats.total_shifts_this_week;
        expect(costAlert.metadata.costPerShift).toBeCloseTo(expectedCostPerShift, 2);
      }
    });
  });

  describe('Cross-Module Impact Analysis', () => {
    it('should detect impacts on sales module', () => {
      const salesImpactData = {
        ...mockData,
        schedulingStats: {
          ...mockData.schedulingStats,
          coverage_percentage: 60, // Muy bajo, afecta ventas
          understaffed_shifts: 8
        }
      };

      const alerts = engine.analyze(salesImpactData);
      const salesImpactAlert = alerts.find(alert =>
        alert.affectedAreas.includes('sales')
      );

      expect(salesImpactAlert).toBeDefined();
      expect(salesImpactAlert?.metadata.crossModuleImpact).toBeDefined();
    });

    it('should identify hr module correlations', () => {
      const hrImpactData = {
        ...mockData,
        schedulingStats: {
          ...mockData.schedulingStats,
          overtime_hours: 30, // Alto overtime afecta HR
          pending_time_off: 15
        }
      };

      const alerts = engine.analyze(hrImpactData);
      const hrImpactAlert = alerts.find(alert =>
        alert.affectedAreas.includes('hr')
      );

      expect(hrImpactAlert).toBeDefined();
    });
  });

  describe('Compliance Analysis', () => {
    it('should detect labor law violations', () => {
      const violationData = {
        ...mockData,
        shifts: [
          {
            id: '1',
            employeeId: 'emp1',
            startTime: '06:00',
            endTime: '20:00', // 14 horas = violación
            date: '2024-01-15',
            position: 'staff',
            status: 'confirmed'
          }
        ]
      };

      const alerts = engine.analyze(violationData);
      const complianceAlert = alerts.find(alert => alert.type === 'compliance_violation');

      expect(complianceAlert).toBeDefined();
      expect(complianceAlert?.severity).toBe('critical');
    });

    it('should validate maximum weekly hours', () => {
      // Mock data que excede límites semanales
      const excessiveHoursData = {
        ...mockData,
        employees: mockData.employees.map(emp => ({
          ...emp,
          weeklyHours: 50, // Excede límite de 40
          maxWeeklyHours: 40
        }))
      };

      const alerts = engine.analyze(excessiveHoursData);
      const weeklyHoursAlert = alerts.find(alert =>
        alert.metadata.weeklyHoursViolation
      );

      expect(weeklyHoursAlert).toBeDefined();
    });
  });

  describe('Alert Prioritization', () => {
    it('should prioritize critical alerts over warnings', () => {
      const criticalData = {
        ...mockData,
        schedulingStats: {
          ...mockData.schedulingStats,
          coverage_percentage: 50, // Crítico
          overtime_hours: 10       // Warning
        }
      };

      const alerts = engine.analyze(criticalData);
      const sortedAlerts = alerts.sort((a, b) => {
        const priorityA = a.severity === 'critical' ? 1 : 2;
        const priorityB = b.severity === 'critical' ? 1 : 2;
        return priorityA - priorityB;
      });

      expect(sortedAlerts[0].severity).toBe('critical');
    });

    it('should include business impact in metadata', () => {
      const alerts = engine.analyze(mockData);

      alerts.forEach(alert => {
        if (alert.severity === 'critical') {
          expect(alert.metadata.businessImpact).toBeDefined();
          expect(typeof alert.metadata.businessImpact).toBe('string');
        }
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing scheduling stats gracefully', () => {
      const incompleteData = {
        ...mockData,
        schedulingStats: undefined as any
      };

      expect(() => engine.analyze(incompleteData)).not.toThrow();
      const alerts = engine.analyze(incompleteData);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should handle empty arrays gracefully', () => {
      const emptyData = {
        ...mockData,
        shifts: [],
        employees: [],
        timeOffRequests: []
      };

      expect(() => engine.analyze(emptyData)).not.toThrow();
      const alerts = engine.analyze(emptyData);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should validate alert structure consistency', () => {
      const alerts = engine.analyze(mockData);

      alerts.forEach(alert => {
        expect(typeof alert.id).toBe('string');
        expect(typeof alert.title).toBe('string');
        expect(typeof alert.description).toBe('string');
        expect(['critical', 'warning', 'info'].includes(alert.severity)).toBe(true);
        expect(Array.isArray(alert.affectedAreas)).toBe(true);
        expect(typeof alert.metadata).toBe('object');
      });
    });
  });
});