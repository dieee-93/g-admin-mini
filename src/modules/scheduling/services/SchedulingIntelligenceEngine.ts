// SchedulingIntelligenceEngine.ts - Intelligent Analysis Engine
// Following G-Admin Mini v2.1 Enterprise Intelligence Architecture

import { DecimalUtils } from '@/lib/decimal';

// Types for intelligent analysis
interface Employee {
  id: string;
  name: string;
  position: string;
  hourlyRate: number;
  maxWeeklyHours: number;
  skills: string[];
  availability: string[];
  performanceRating: number;
}

interface Shift {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  break_time?: number;
  overtime?: boolean;
}

interface SalesForecast {
  date: string;
  hour: number;
  predictedVolume: number;
  staffRequirement: number;
  confidence: number;
}

interface SchedulingData {
  shifts: Shift[];
  employees: Employee[];
  salesForecast: SalesForecast[];
  historicalData: {
    laborCosts: number[];
    coveragePercentages: number[];
    overtimeHours: number[];
    customerSatisfaction: number[];
  };
  budgetConstraints: {
    weeklyBudget: number;
    overtimeThreshold: number;
    minCoveragePercentage: number;
  };
}

interface IntelligentAlert {
  id: string;
  type: 'coverage_gap' | 'overtime_detected' | 'understaffing' | 'high_labor_cost' | 'coverage_critical' | 'efficiency_low' | 'compliance_violation' | 'predictive_issue';
  severity: 'critical' | 'warning' | 'info';
  category: 'labor_costs' | 'coverage' | 'efficiency' | 'compliance' | 'prediction';
  title: string;
  description: string;
  recommendation?: string;
  confidence: number; // 0-100
  affectedAreas: string[]; // Areas affected by the alert
  metadata: {
    timeFrame?: string;
    costImpact?: number;
    [key: string]: any;
  };
  actions?: Array<{
    label: string;
    action: string;
    params?: any;
  }>;
  predictedImpact?: {
    financial: number;
    operational: number;
    satisfaction: number;
  };
}

export class SchedulingIntelligenceEngine {
  private historicalDataWeight = 0.7;
  private forecastWeight = 0.3;
  private confidenceThreshold = 0.75;

  /**
   * Main analysis method - generates all intelligent alerts
   */
  analyze(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // 1. Análisis de costos laborales
    alerts.push(...this.analyzeLaborCosts(data));

    // 2. Análisis de cobertura y gaps
    alerts.push(...this.analyzeCoverageGaps(data));

    // 3. Análisis de eficiencia y patterns
    alerts.push(...this.analyzeEfficiencyPatterns(data));

    // 4. Análisis predictivo
    alerts.push(...this.analyzePredictivePatterns(data));

    // 5. Análisis cross-module (correlaciones)
    alerts.push(...this.analyzeCrossModuleImpact(data));

    // 6. Análisis de compliance y regulaciones
    alerts.push(...this.analyzeComplianceIssues(data));

    // Filtrar por confidence y priorizar
    return this.prioritizeAlerts(alerts);
  }

  /**
   * Análisis inteligente de costos laborales
   */
  private analyzeLaborCosts(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Calcular costos actuales
    const currentWeekCost = this.calculateWeeklyLaborCost(data.shifts, data.employees);
    const budgetVariance = DecimalUtils.divide(
      DecimalUtils.subtract(currentWeekCost, data.budgetConstraints.weeklyBudget),
      data.budgetConstraints.weeklyBudget
    ).toNumber();

    // Alert de presupuesto excedido
    if (budgetVariance > 0.15) {
      alerts.push({
        id: `budget_exceeded_${Date.now()}`,
        type: 'high_labor_cost',
        severity: 'critical',
        category: 'labor_costs',
        title: '🚨 Presupuesto Laboral Crítico',
        description: `Costo proyectado excede presupuesto en ${(budgetVariance * 100).toFixed(1)}%`,
        recommendation: 'Optimizar horarios o reasignar personal para reducir costos',
        confidence: 95,
        affectedAreas: ['finance', 'operations', 'management'],
        metadata: {
          timeFrame: 'Esta semana',
          costImpact: currentWeekCost.toNumber() - data.budgetConstraints.weeklyBudget,
          currentCost: currentWeekCost.toNumber(),
          budget: data.budgetConstraints.weeklyBudget,
          variance: budgetVariance,
          suggestions: this.generateCostOptimizationSuggestions(data)
        },
        actions: [
          { label: 'Optimizar Horarios', action: 'optimize_schedule' },
          { label: 'Ver Detalles', action: 'view_cost_breakdown' }
        ],
        predictedImpact: {
          financial: currentWeekCost.toNumber() - data.budgetConstraints.weeklyBudget,
          operational: -0.15,
          satisfaction: -0.1
        }
      });
    }

    // Análisis de overtime patterns
    const overtimeEmployees = this.detectOvertimePatterns(data.shifts, data.employees);
    if (overtimeEmployees.length > 0) {
      const totalOvertimeCost = this.calculateOvertimeCost(overtimeEmployees, data.employees);

      alerts.push({
        id: `overtime_pattern_${Date.now()}`,
        type: 'overtime_detected',
        severity: 'warning',
        category: 'labor_costs',
        title: '⚠️ Patrón de Overtime Detectado',
        description: `${overtimeEmployees.length} empleados en riesgo de overtime (costo adicional: $${totalOvertimeCost.toFixed(0)})`,
        recommendation: 'Redistribuir turnos para evitar horas extra innecesarias',
        confidence: 88,
        affectedAreas: ['hr', 'finance', 'operations'],
        metadata: {
          timeFrame: 'Esta semana',
          costImpact: totalOvertimeCost,
          employees: overtimeEmployees,
          additionalCost: totalOvertimeCost,
          redistributionOptions: this.suggestShiftRedistribution(data)
        },
        actions: [
          { label: 'Redistribuir Turnos', action: 'redistribute_shifts' },
          { label: 'Ver Empleados', action: 'view_overtime_employees' }
        ]
      });
    }

    // Análisis de eficiencia de costos
    const costEfficiency = this.analyzeCostEfficiency(data);
    if (costEfficiency.score < 0.7) {
      alerts.push({
        id: `cost_efficiency_${Date.now()}`,
        type: 'efficiency_low',
        severity: 'info',
        category: 'efficiency',
        title: '📊 Oportunidad de Optimización',
        description: `Eficiencia de costos: ${(costEfficiency.score * 100).toFixed(1)}% - Se puede mejorar`,
        recommendation: 'Revisar asignación de personal y optimizar horarios',
        confidence: 82,
        affectedAreas: ['operations', 'management'],
        metadata: {
          timeFrame: 'Análisis semanal',
          efficiencyScore: costEfficiency.score,
          ...costEfficiency
        },
        actions: [
          { label: 'Ver Análisis', action: 'view_efficiency_analysis' },
          { label: 'Optimizar', action: 'optimize_cost_efficiency' }
        ]
      });
    }

    return alerts;
  }

  /**
   * Análisis de gaps de cobertura con predicción
   */
  private analyzeCoverageGaps(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Calcular cobertura por franjas horarias
    const coverageAnalysis = this.analyzeCoverageByTimeSlots(data);

    // Detectar gaps críticos
    const criticalGaps = coverageAnalysis.timeSlots.filter(slot =>
      slot.coverage < data.budgetConstraints.minCoveragePercentage
    );

    if (criticalGaps.length > 0) {
      alerts.push({
        id: `coverage_gaps_${Date.now()}`,
        type: 'coverage_critical',
        severity: 'critical',
        category: 'coverage',
        title: '🚨 Gaps Críticos de Cobertura',
        description: `${criticalGaps.length} franjas horarias por debajo del mínimo (${data.budgetConstraints.minCoveragePercentage}%)`,
        recommendation: 'Buscar personal disponible o ajustar horarios para cubrir gaps críticos',
        confidence: 92,
        affectedAreas: ['operations', 'customer_service', 'revenue'],
        metadata: {
          timeFrame: 'Esta semana',
          gapCount: criticalGaps.length,
          minCoverageRequired: data.budgetConstraints.minCoveragePercentage,
          gaps: criticalGaps,
          solutions: this.generateCoverageSolutions(criticalGaps, data),
          impactAnalysis: this.calculateCoverageImpact(criticalGaps, data.salesForecast)
        },
        actions: [
          { label: 'Auto-Resolver', action: 'auto_resolve_gaps' },
          { label: 'Buscar Personal', action: 'find_available_staff' },
          { label: 'Ver Detalles', action: 'view_gap_details' }
        ],
        predictedImpact: {
          financial: -this.estimateRevenueImpact(criticalGaps, data.salesForecast),
          operational: -0.25,
          satisfaction: -0.3
        }
      });
    }

    // Predicción de gaps futuros
    const predictedGaps = this.predictFutureCoverageGaps(data);
    if (predictedGaps.length > 0) {
      alerts.push({
        id: `predicted_gaps_${Date.now()}`,
        type: 'predictive_issue',
        severity: 'warning',
        category: 'prediction',
        title: '🔮 Gaps Futuros Predichos',
        description: `${predictedGaps.length} gaps potenciales detectados para próximos días`,
        recommendation: 'Planificar personal adicional para prevenir gaps futuros',
        confidence: 78,
        affectedAreas: ['planning', 'operations'],
        metadata: {
          timeFrame: 'Próximos 7 días',
          predictedGapCount: predictedGaps.length,
          predictions: predictedGaps,
          preventionActions: this.generatePreventionActions(predictedGaps, data)
        },
        actions: [
          { label: 'Prevenir Gaps', action: 'prevent_future_gaps' },
          { label: 'Ver Predicciones', action: 'view_predictions' }
        ]
      });
    }

    return alerts;
  }

  /**
   * Análisis de patrones de eficiencia
   */
  private analyzeEfficiencyPatterns(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Análisis de productividad por empleado
    const productivityAnalysis = this.analyzeEmployeeProductivity(data);
    const lowPerformers = productivityAnalysis.employees.filter(emp => emp.efficiency < 0.7);

    if (lowPerformers.length > 0) {
      alerts.push({
        id: `low_productivity_${Date.now()}`,
        type: 'efficiency_low',
        severity: 'warning',
        category: 'efficiency',
        title: '📉 Baja Productividad Detectada',
        description: `${lowPerformers.length} empleados por debajo del promedio de eficiencia`,
        recommendation: 'Implementar plan de mejora y considerar reasignación de tareas',
        confidence: 85,
        affectedAreas: ['hr', 'operations', 'productivity'],
        metadata: {
          timeFrame: 'Últimas 2 semanas',
          lowPerformerCount: lowPerformers.length,
          employees: lowPerformers,
          recommendations: this.generateProductivityRecommendations(lowPerformers, data),
          trainingNeeds: this.identifyTrainingNeeds(lowPerformers)
        },
        actions: [
          { label: 'Plan de Mejora', action: 'create_improvement_plan' },
          { label: 'Reasignar Tareas', action: 'reassign_tasks' }
        ]
      });
    }

    // Análisis de patterns de ausentismo
    const absenteeismPattern = this.analyzeAbsenteeismPatterns(data);
    if (absenteeismPattern.riskLevel > 0.6) {
      alerts.push({
        id: `absenteeism_risk_${Date.now()}`,
        type: 'understaffing',
        severity: 'warning',
        category: 'efficiency',
        title: '🏃‍♂️ Riesgo de Ausentismo Alto',
        description: `Patrón de ausentismo detectado - riesgo ${(absenteeismPattern.riskLevel * 100).toFixed(0)}%`,
        recommendation: 'Preparar plan de contingencia y contactar personal de respaldo',
        confidence: 75,
        affectedAreas: ['hr', 'operations', 'planning'],
        metadata: {
          timeFrame: 'Esta semana',
          riskLevel: absenteeismPattern.riskLevel,
          ...absenteeismPattern
        },
        actions: [
          { label: 'Contingencia', action: 'prepare_contingency' },
          { label: 'Contactar Staff', action: 'contact_backup_staff' }
        ]
      });
    }

    return alerts;
  }

  /**
   * Análisis predictivo avanzado
   */
  private analyzePredictivePatterns(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Predicción de demanda vs staffing
    const demandPrediction = this.predictDemandVsStaffing(data);
    if (demandPrediction.mismatchAreas.length > 0) {
      alerts.push({
        id: `demand_mismatch_${Date.now()}`,
        type: 'predictive_issue',
        severity: 'warning',
        category: 'prediction',
        title: '🎯 Desajuste Demanda-Personal Predicho',
        description: `${demandPrediction.mismatchAreas.length} períodos con desajuste staff-demanda`,
        recommendation: 'Ajustar horarios para balancear demanda y personal disponible',
        confidence: demandPrediction.confidence,
        affectedAreas: ['operations', 'planning', 'customer_service'],
        metadata: {
          timeFrame: 'Próximos 14 días',
          mismatchCount: demandPrediction.mismatchAreas.length,
          ...demandPrediction
        },
        actions: [
          { label: 'Ajustar Horarios', action: 'adjust_staffing' },
          { label: 'Ver Predicción', action: 'view_demand_prediction' }
        ]
      });
    }

    // Predicción de costos laborales
    const costPrediction = this.predictLaborCostTrends(data);
    if (costPrediction.budgetRisk > 0.8) {
      alerts.push({
        id: `cost_trend_${Date.now()}`,
        type: 'high_labor_cost',
        severity: 'critical',
        category: 'labor_costs',
        title: '💰 Tendencia de Costos Alarmante',
        description: `Predicción: excederás presupuesto en ${costPrediction.excessDays} días`,
        recommendation: 'Implementar controles de costos inmediatamente para evitar exceso presupuestario',
        confidence: costPrediction.confidence,
        affectedAreas: ['finance', 'management', 'operations'],
        metadata: {
          timeFrame: `Próximos ${costPrediction.excessDays} días`,
          budgetRisk: costPrediction.budgetRisk,
          excessDays: costPrediction.excessDays,
          ...costPrediction
        },
        actions: [
          { label: 'Tomar Acción', action: 'implement_cost_controls' },
          { label: 'Ver Proyección', action: 'view_cost_projection' }
        ]
      });
    }

    return alerts;
  }

  /**
   * Análisis de impacto cross-module
   */
  private analyzeCrossModuleImpact(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Correlación con ventas
    const salesCorrelation = this.analyzeSalesStaffingCorrelation(data);
    if (salesCorrelation.misalignment > 0.3) {
      alerts.push({
        id: `sales_correlation_${Date.now()}`,
        type: 'efficiency_low',
        severity: 'info',
        category: 'efficiency',
        title: '📈 Desalineación con Patrones de Ventas',
        description: `Staff no está optimizado para patrones de ventas (${(salesCorrelation.misalignment * 100).toFixed(0)}% desalineación)`,
        recommendation: 'Ajustar horarios según patrones históricos de ventas para optimizar eficiencia',
        confidence: 80,
        affectedAreas: ['scheduling', 'sales', 'operations'],
        metadata: {
          timeFrame: 'Esta semana',
          misalignment: salesCorrelation.misalignment,
          salesCorrelation: salesCorrelation
        }
      });
    }

    // TODO: Integración con Materials, Kitchen, Customer modules

    return alerts;
  }

  /**
   * Análisis de compliance y regulaciones
   */
  private analyzeComplianceIssues(data: SchedulingData): IntelligentAlert[] {
    const alerts: IntelligentAlert[] = [];

    // Verificar límites de horas de trabajo
    const complianceIssues = this.checkLaborCompliance(data);
    if (complianceIssues.violations.length > 0) {
      alerts.push({
        id: `compliance_violation_${Date.now()}`,
        type: 'compliance_violation',
        severity: 'critical',
        category: 'compliance',
        title: '⚖️ Violación de Regulaciones Laborales',
        description: `${complianceIssues.violations.length} violaciones de límites de horas detectadas`,
        recommendation: 'Revisar y ajustar inmediatamente los horarios para cumplir con las regulaciones laborales',
        confidence: 100,
        affectedAreas: ['scheduling', 'hr', 'legal'],
        metadata: {
          timeFrame: 'Crítico - Acción inmediata requerida',
          violationsCount: complianceIssues.violations.length,
          complianceData: complianceIssues
        }
      });
    }

    return alerts;
  }

  // ========================================
  // HELPER METHODS - Implementación de algoritmos específicos
  // ========================================

  private calculateWeeklyLaborCost(shifts: Shift[], employees: Employee[]): DecimalJS {
    let totalCost = DecimalUtils.fromValue(0, 'financial');

    for (const shift of shifts) {
      const employee = employees.find(emp => emp.id === shift.employee_id);
      if (!employee) continue;

      const hours = this.calculateShiftHours(shift);
      const regularHours = Math.min(hours, 8); // Regular hours per day
      const overtimeHours = Math.max(0, hours - 8);

      const regularCost = DecimalUtils.multiply(regularHours, employee.hourlyRate);
      const overtimeCost = DecimalUtils.multiply(overtimeHours, employee.hourlyRate * 1.5);

      totalCost = DecimalUtils.add(totalCost, DecimalUtils.add(regularCost, overtimeCost));
    }

    return totalCost;
  }

  private calculateShiftHours(shift: Shift): number {
    const startTime = new Date(`2024-01-01T${shift.start_time}`);
    const endTime = new Date(`2024-01-01T${shift.end_time}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return hours - (shift.break_time || 0) / 60;
  }

  private detectOvertimePatterns(shifts: Shift[], employees: Employee[]): Array<{employeeId: string, projectedHours: number, overtime: number}> {
    const weeklyHours: Record<string, number> = {};

    // Calculate weekly hours per employee
    shifts.forEach(shift => {
      if (!weeklyHours[shift.employee_id]) {
        weeklyHours[shift.employee_id] = 0;
      }
      weeklyHours[shift.employee_id] += this.calculateShiftHours(shift);
    });

    return Object.entries(weeklyHours)
      .map(([employeeId, hours]) => ({
        employeeId,
        projectedHours: hours,
        overtime: Math.max(0, hours - 40)
      }))
      .filter(emp => emp.overtime > 0);
  }

  private calculateOvertimeCost(overtimeEmployees: any[], employees: Employee[]): number {
    return overtimeEmployees.reduce((total, emp) => {
      const employee = employees.find(e => e.id === emp.employeeId);
      if (!employee) return total;
      return total + (emp.overtime * employee.hourlyRate * 0.5); // 50% overtime premium
    }, 0);
  }

  private generateCostOptimizationSuggestions(data: SchedulingData): string[] {
    const suggestions = [];

    // Analyze current scheduling for optimization opportunities
    const overtimeEmployees = this.detectOvertimePatterns(data.shifts, data.employees);
    if (overtimeEmployees.length > 0) {
      suggestions.push('Redistribuir turnos para reducir overtime');
    }

    const lowUtilization = data.employees.filter(emp => {
      const employeeShifts = data.shifts.filter(s => s.employee_id === emp.id);
      const totalHours = employeeShifts.reduce((sum, shift) => sum + this.calculateShiftHours(shift), 0);
      return totalHours < 32; // Less than 32 hours per week
    });

    if (lowUtilization.length > 0) {
      suggestions.push('Aumentar utilización de empleados sub-utilizados');
    }

    suggestions.push('Evaluar contratación de personal part-time');
    suggestions.push('Revisar asignación de tareas por skill level');

    return suggestions;
  }

  private suggestShiftRedistribution(data: SchedulingData): any[] {
    // Algorithm to suggest how to redistribute shifts to avoid overtime
    // This is a simplified version - real implementation would be more complex
    return [
      {
        fromEmployee: 'emp1',
        toEmployee: 'emp2',
        shifts: ['shift1', 'shift2'],
        savings: 150
      }
    ];
  }

  private analyzeCostEfficiency(data: SchedulingData): {score: number, factors: any[]} {
    // Analyze cost efficiency based on multiple factors
    const factors = [];
    let score = 1.0;

    // Factor 1: Overtime ratio
    const totalHours = data.shifts.reduce((sum, shift) => sum + this.calculateShiftHours(shift), 0);
    const overtimeHours = data.shifts.reduce((sum, shift) => {
      const hours = this.calculateShiftHours(shift);
      return sum + Math.max(0, hours - 8);
    }, 0);
    const overtimeRatio = overtimeHours / totalHours;

    if (overtimeRatio > 0.15) {
      score -= 0.3;
      factors.push({ name: 'High Overtime', impact: -0.3 });
    }

    // Factor 2: Staff utilization
    const avgUtilization = this.calculateAverageUtilization(data);
    if (avgUtilization < 0.8) {
      score -= 0.2;
      factors.push({ name: 'Low Utilization', impact: -0.2 });
    }

    return { score: Math.max(0, score), factors };
  }

  private calculateAverageUtilization(data: SchedulingData): number {
    const employeeUtilizations = data.employees.map(emp => {
      const employeeShifts = data.shifts.filter(s => s.employee_id === emp.id);
      const totalHours = employeeShifts.reduce((sum, shift) => sum + this.calculateShiftHours(shift), 0);
      return totalHours / emp.maxWeeklyHours;
    });

    return employeeUtilizations.reduce((sum, util) => sum + util, 0) / employeeUtilizations.length;
  }

  private analyzeCoverageByTimeSlots(data: SchedulingData): {coverage: number, timeSlots: any[]} {
    // Analyze coverage by hour of day
    const timeSlots = [];

    for (let hour = 6; hour <= 23; hour++) {
      const requiredStaff = this.getRequiredStaffForHour(hour, data.salesForecast);
      const scheduledStaff = this.getScheduledStaffForHour(hour, data.shifts);
      const coverage = requiredStaff > 0 ? (scheduledStaff / requiredStaff) * 100 : 100;

      timeSlots.push({
        hour,
        requiredStaff,
        scheduledStaff,
        coverage,
        gap: Math.max(0, requiredStaff - scheduledStaff)
      });
    }

    const overallCoverage = timeSlots.reduce((sum, slot) => sum + slot.coverage, 0) / timeSlots.length;

    return { coverage: overallCoverage, timeSlots };
  }

  private getRequiredStaffForHour(hour: number, salesForecast: SalesForecast[]): number {
    const forecast = salesForecast.find(f => f.hour === hour);
    return forecast ? forecast.staffRequirement : 2; // Default minimum
  }

  private getScheduledStaffForHour(hour: number, shifts: Shift[]): number {
    return shifts.filter(shift => {
      const startHour = parseInt(shift.start_time.split(':')[0]);
      const endHour = parseInt(shift.end_time.split(':')[0]);
      return hour >= startHour && hour < endHour;
    }).length;
  }

  private generateCoverageSolutions(gaps: any[], data: SchedulingData): any[] {
    return gaps.map(gap => ({
      timeSlot: gap.hour,
      solutions: [
        'Contactar empleados disponibles',
        'Reasignar desde otros períodos',
        'Contratar personal temporal'
      ],
      estimatedCost: gap.gap * 25 * 8 // $25/hour * gap * 8 hours
    }));
  }

  private calculateCoverageImpact(gaps: any[], salesForecast: SalesForecast[]): any {
    const impactedSales = gaps.reduce((total, gap) => {
      const forecast = salesForecast.find(f => f.hour === gap.hour);
      return total + (forecast ? forecast.predictedVolume * gap.gap * 0.1 : 0);
    }, 0);

    return {
      lostRevenue: impactedSales * 15, // Average ticket $15
      customerImpact: gaps.length * 10, // 10 customers per gap hour
      reputationRisk: gaps.length > 3 ? 'High' : 'Medium'
    };
  }

  private estimateRevenueImpact(gaps: any[], salesForecast: SalesForecast[]): number {
    return gaps.reduce((total, gap) => {
      const forecast = salesForecast.find(f => f.hour === gap.hour);
      const lostSales = forecast ? forecast.predictedVolume * (gap.gap / gap.requiredStaff) : 0;
      return total + (lostSales * 15); // $15 average ticket
    }, 0);
  }

  private predictFutureCoverageGaps(data: SchedulingData): any[] {
    // Predict future gaps based on patterns and trends
    // This is a simplified prediction algorithm
    const predictions = [];

    const coverageAnalysis = this.analyzeCoverageByTimeSlots(data);
    const problematicSlots = coverageAnalysis.timeSlots.filter(slot => slot.coverage < 90);

    problematicSlots.forEach(slot => {
      if (Math.random() > 0.7) { // 30% chance of future gap
        predictions.push({
          date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Next 7 days
          hour: slot.hour,
          predictedGap: Math.ceil(slot.gap * (0.8 + Math.random() * 0.4)),
          confidence: 65 + Math.random() * 20
        });
      }
    });

    return predictions;
  }

  private generatePreventionActions(predictions: any[], data: SchedulingData): any[] {
    return predictions.map(pred => ({
      prediction: pred,
      actions: [
        'Programar turnos adicionales',
        'Contactar personal de reserva',
        'Ajustar horarios existentes'
      ],
      deadline: new Date(pred.date.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days before
    }));
  }

  private analyzeEmployeeProductivity(data: SchedulingData): {employees: any[], averageEfficiency: number} {
    const employees = data.employees.map(emp => {
      const employeeShifts = data.shifts.filter(s => s.employee_id === emp.id);
      const totalHours = employeeShifts.reduce((sum, shift) => sum + this.calculateShiftHours(shift), 0);

      // Simplified efficiency calculation based on performance rating and hours
      const efficiency = emp.performanceRating * (totalHours > 0 ? Math.min(1, totalHours / 35) : 0);

      return {
        ...emp,
        totalHours,
        efficiency,
        shifts: employeeShifts.length
      };
    });

    const averageEfficiency = employees.reduce((sum, emp) => sum + emp.efficiency, 0) / employees.length;

    return { employees, averageEfficiency };
  }

  private generateProductivityRecommendations(lowPerformers: any[], data: SchedulingData): string[] {
    const recommendations = [];

    lowPerformers.forEach(emp => {
      if (emp.totalHours < 20) {
        recommendations.push(`${emp.name}: Aumentar horas asignadas`);
      }
      if (emp.performanceRating < 0.7) {
        recommendations.push(`${emp.name}: Programa de entrenamiento requerido`);
      }
      if (emp.shifts < 3) {
        recommendations.push(`${emp.name}: Asignar turnos más consistentes`);
      }
    });

    return recommendations;
  }

  private identifyTrainingNeeds(employees: any[]): any[] {
    return employees.map(emp => ({
      employeeId: emp.id,
      name: emp.name,
      trainingAreas: emp.performanceRating < 0.6 ? ['Customer Service', 'Efficiency'] : ['Advanced Skills'],
      priority: emp.performanceRating < 0.5 ? 'High' : 'Medium'
    }));
  }

  private analyzeAbsenteeismPatterns(data: SchedulingData): {riskLevel: number, patterns: any[]} {
    // Simplified absenteeism analysis
    const patterns = [];
    const cancelledShifts = data.shifts.filter(s => s.status === 'cancelled');
    const cancellationRate = cancelledShifts.length / data.shifts.length;

    if (cancellationRate > 0.1) {
      patterns.push('High cancellation rate detected');
    }

    // Check for patterns by day of week, employee, etc.
    const mondayShifts = data.shifts.filter(s => new Date(s.date).getDay() === 1);
    const mondayCancellations = mondayShifts.filter(s => s.status === 'cancelled');

    if (mondayCancellations.length / mondayShifts.length > 0.15) {
      patterns.push('Monday absenteeism pattern detected');
    }

    return {
      riskLevel: Math.min(1, cancellationRate * 3),
      patterns
    };
  }

  private predictDemandVsStaffing(data: SchedulingData): {mismatchAreas: any[], confidence: number} {
    const mismatchAreas = [];
    let totalMismatch = 0;

    data.salesForecast.forEach(forecast => {
      const scheduledStaff = this.getScheduledStaffForHour(forecast.hour, data.shifts);
      const mismatch = Math.abs(forecast.staffRequirement - scheduledStaff) / forecast.staffRequirement;

      if (mismatch > 0.2) { // 20% mismatch threshold
        mismatchAreas.push({
          hour: forecast.hour,
          required: forecast.staffRequirement,
          scheduled: scheduledStaff,
          mismatch: mismatch * 100,
          impact: forecast.predictedVolume * mismatch
        });
        totalMismatch += mismatch;
      }
    });

    const confidence = Math.max(60, 90 - (totalMismatch * 20));

    return { mismatchAreas, confidence };
  }

  private predictLaborCostTrends(data: SchedulingData): {budgetRisk: number, excessDays: number, confidence: number} {
    const currentWeeklyCost = this.calculateWeeklyLaborCost(data.shifts, data.employees).toNumber();
    const weeklyBudget = data.budgetConstraints.weeklyBudget;
    const currentOverrun = Math.max(0, currentWeeklyCost - weeklyBudget);

    // Simple projection based on current trend
    const budgetRisk = currentOverrun / weeklyBudget;
    const excessDays = budgetRisk > 0 ? Math.ceil(7 * budgetRisk) : 0;

    return {
      budgetRisk,
      excessDays,
      confidence: 75,
      projectedOverrun: currentOverrun * 4 // Monthly projection
    };
  }

  private analyzeSalesStaffingCorrelation(data: SchedulingData): {misalignment: number, recommendations: string[]} {
    let totalMisalignment = 0;
    let validHours = 0;

    data.salesForecast.forEach(forecast => {
      const scheduledStaff = this.getScheduledStaffForHour(forecast.hour, data.shifts);
      const optimalStaff = forecast.staffRequirement;

      if (optimalStaff > 0) {
        const misalignment = Math.abs(scheduledStaff - optimalStaff) / optimalStaff;
        totalMisalignment += misalignment;
        validHours++;
      }
    });

    const avgMisalignment = validHours > 0 ? totalMisalignment / validHours : 0;

    const recommendations = [];
    if (avgMisalignment > 0.3) {
      recommendations.push('Realinear horarios con patrones de ventas');
      recommendations.push('Implementar staffing dinámico por hora');
    }

    return {
      misalignment: avgMisalignment,
      recommendations
    };
  }

  private checkLaborCompliance(data: SchedulingData): {violations: any[], riskLevel: string} {
    const violations = [];

    // Check for overtime violations
    const overtimeEmployees = this.detectOvertimePatterns(data.shifts, data.employees);
    overtimeEmployees.forEach(emp => {
      if (emp.projectedHours > 50) { // Excessive hours
        violations.push({
          type: 'excessive_hours',
          employeeId: emp.employeeId,
          hours: emp.projectedHours,
          violation: 'Exceeds 50 hours per week'
        });
      }
    });

    // Check for minimum rest periods
    data.employees.forEach(employee => {
      const employeeShifts = data.shifts
        .filter(s => s.employee_id === employee.id)
        .sort((a, b) => new Date(a.date + ' ' + a.start_time).getTime() - new Date(b.date + ' ' + b.start_time).getTime());

      for (let i = 1; i < employeeShifts.length; i++) {
        const prevShift = employeeShifts[i - 1];
        const currentShift = employeeShifts[i];

        const prevEnd = new Date(prevShift.date + ' ' + prevShift.end_time);
        const currentStart = new Date(currentShift.date + ' ' + currentShift.start_time);

        const restHours = (currentStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60);

        if (restHours < 11) { // Minimum 11 hours rest
          violations.push({
            type: 'insufficient_rest',
            employeeId: employee.id,
            restHours,
            violation: 'Less than 11 hours rest between shifts'
          });
        }
      }
    });

    const riskLevel = violations.length > 0 ? 'High' : 'Low';

    return { violations, riskLevel };
  }

  /**
   * Priorizar alertas por importancia, confidence y impact
   */
  private prioritizeAlerts(alerts: IntelligentAlert[]): IntelligentAlert[] {
    return alerts
      .filter(alert => alert.confidence >= this.confidenceThreshold)
      .sort((a, b) => {
        // Priority order: critical > warning > prediction > info
        const priorityOrder = { critical: 4, warning: 3, prediction: 2, info: 1 };
        const aPriority = priorityOrder[a.type] || 0;
        const bPriority = priorityOrder[b.type] || 0;

        if (aPriority !== bPriority) return bPriority - aPriority;

        // If same priority, sort by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, 10); // Limit to top 10 alerts
  }
}

export default SchedulingIntelligenceEngine;