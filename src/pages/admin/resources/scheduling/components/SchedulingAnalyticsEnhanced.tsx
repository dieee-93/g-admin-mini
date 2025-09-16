/**
 * Scheduling Analytics Enhanced - Using AnalyticsEngine patterns
 * Specialized scheduling analytics with coverage optimization, labor cost analysis, and shift efficiency
 */
import React, { useMemo } from 'react';
import {
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Button, Badge, Icon, Stack, Typography
} from '@/shared/ui';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import { AnalyticsEngine, RFMAnalytics, TrendAnalytics } from '@/shared/services/AnalyticsEngine';

// Scheduling-specific analytics types
interface ScheduleEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  department: string;
  shift_type: 'opening' | 'mid' | 'closing' | 'split' | 'double';
  status: 'scheduled' | 'confirmed' | 'missed' | 'covered' | 'cancelled';
  hourly_rate: number;
  break_minutes: number;
  overtime_hours: number;
  total_cost: number;
  weather_factor: string;
  expected_volume: 'low' | 'normal' | 'high' | 'peak';
  coverage_requirements: number;
  actual_coverage: number;
}

interface SchedulingMetrics {
  totalShifts: number;
  completedShifts: number;
  missedShifts: number;
  coverageRate: number;
  totalLaborCost: number;
  averageShiftCost: number;
  overtimeHours: number;
  overtimeCost: number;
  efficiencyScore: number;
  understaffingIncidents: number;
}

interface CoverageAnalysis {
  timeSlot: string;
  required: number;
  scheduled: number;
  actual: number;
  coveragePercentage: number;
  understaffing: number;
  costImpact: number;
}

interface ShiftEfficiencyQuadrant {
  name: string;
  description: string;
  shifts: ScheduleEntry[];
  count: number;
  averageCost: number;
  efficiency: number;
  color: string;
  icon: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  optimizationRecommendations: string[];
}

interface SchedulingAnalyticsEnhancedProps {
  schedules?: ScheduleEntry[];
  timeframe?: '1M' | '3M' | '6M' | '1Y';
}

// Mock data generator for demonstration
const generateMockScheduleData = (): ScheduleEntry[] => {
  const departments = ['kitchen', 'service', 'admin', 'cleaning', 'management'];
  const shiftTypes = ['opening', 'mid', 'closing', 'split', 'double'];
  const statuses = ['scheduled', 'confirmed', 'missed', 'covered', 'cancelled'];
  const volumes = ['low', 'normal', 'high', 'peak'];

  return Array.from({ length: 150 }, (_, i) => {
    const startHour = 6 + Math.floor(Math.random() * 16); // 6 AM to 10 PM
    const shiftLength = 4 + Math.floor(Math.random() * 6); // 4-9 hour shifts
    const dept = departments[Math.floor(Math.random() * departments.length)];

    const baseCost = dept === 'management' ? 25 : dept === 'kitchen' ? 18 : 15;
    const hourlyRate = baseCost + Math.random() * 8;
    const totalHours = shiftLength + (Math.random() * 2 - 1); // +/- 1 hour variation
    const overtimeHours = Math.max(0, totalHours - 8);

    return {
      id: `schedule_${i + 1}`,
      employee_id: `emp_${Math.floor(i / 5) + 1}`,
      employee_name: `Employee ${Math.floor(i / 5) + 1}`,
      date: new Date(2024, 0, 1 + Math.floor(i / 5)).toISOString().split('T')[0],
      start_time: `${startHour.toString().padStart(2, '0')}:00`,
      end_time: `${(startHour + shiftLength).toString().padStart(2, '0')}:00`,
      position: dept === 'service' ? 'Server' : dept === 'kitchen' ? 'Cook' : 'Staff',
      department: dept,
      shift_type: shiftTypes[Math.floor(Math.random() * shiftTypes.length)] as any,
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      hourly_rate: Math.round(hourlyRate * 100) / 100,
      break_minutes: 30 + Math.floor(Math.random() * 30),
      overtime_hours: Math.round(overtimeHours * 100) / 100,
      total_cost: Math.round(totalHours * hourlyRate * 100) / 100,
      weather_factor: Math.random() > 0.8 ? 'rain' : 'none',
      expected_volume: volumes[Math.floor(Math.random() * volumes.length)] as any,
      coverage_requirements: 1 + Math.floor(Math.random() * 3),
      actual_coverage: 1 + Math.floor(Math.random() * 4)
    };
  });
};

export function SchedulingAnalyticsEnhanced({
  schedules = generateMockScheduleData(),
  timeframe = '3M'
}: SchedulingAnalyticsEnhancedProps) {

  // Core analytics calculations
  const analytics = useMemo(() => {
    const activeSchedules = schedules.filter(s => s.status !== 'cancelled');

    // Basic metrics
    const metrics: SchedulingMetrics = {
      totalShifts: schedules.length,
      completedShifts: schedules.filter(s => s.status === 'confirmed').length,
      missedShifts: schedules.filter(s => s.status === 'missed').length,
      coverageRate: (activeSchedules.filter(s => s.actual_coverage >= s.coverage_requirements).length / activeSchedules.length) * 100,
      totalLaborCost: activeSchedules.reduce((sum, s) => sum + s.total_cost, 0),
      averageShiftCost: activeSchedules.reduce((sum, s) => sum + s.total_cost, 0) / activeSchedules.length,
      overtimeHours: activeSchedules.reduce((sum, s) => sum + s.overtime_hours, 0),
      overtimeCost: activeSchedules.reduce((sum, s) => sum + (s.overtime_hours * s.hourly_rate * 1.5), 0),
      efficiencyScore: 85 + Math.random() * 10, // Mock efficiency calculation
      understaffingIncidents: activeSchedules.filter(s => s.actual_coverage < s.coverage_requirements).length
    };

    // Coverage analysis by time slots
    const coverageAnalysis: CoverageAnalysis[] = [
      '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
      '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'
    ].map(timeSlot => {
      const slotsInRange = activeSchedules.filter(s => {
        const [slotStart] = timeSlot.split('-');
        return s.start_time <= slotStart && s.end_time >= slotStart;
      });

      const required = slotsInRange.reduce((sum, s) => sum + s.coverage_requirements, 0);
      const actual = slotsInRange.reduce((sum, s) => sum + s.actual_coverage, 0);
      const understaffing = Math.max(0, required - actual);

      return {
        timeSlot,
        required,
        scheduled: slotsInRange.length,
        actual,
        coveragePercentage: required > 0 ? (actual / required) * 100 : 100,
        understaffing,
        costImpact: understaffing * 20 // $20 average impact per missing person-hour
      };
    });

    // Shift Efficiency Quadrants (BCG Matrix adapted for scheduling)
    const shiftQuadrants: ShiftEfficiencyQuadrant[] = [
      {
        name: 'Optimal Shifts',
        description: 'High efficiency, proper coverage, on-budget',
        shifts: activeSchedules.filter(s =>
          s.actual_coverage >= s.coverage_requirements &&
          s.overtime_hours <= 1 &&
          s.status === 'confirmed'
        ),
        count: 0,
        averageCost: 0,
        efficiency: 95,
        color: 'green',
        icon: TrophyIcon,
        priority: 'low',
        optimizationRecommendations: [
          'Maintain current scheduling patterns',
          'Use as template for other shifts',
          'Consider slight cost optimization',
          'Reward high-performing staff'
        ]
      },
      {
        name: 'Overstaffed Shifts',
        description: 'Good coverage but higher costs than needed',
        shifts: activeSchedules.filter(s =>
          s.actual_coverage > s.coverage_requirements + 1 &&
          s.overtime_hours <= 2
        ),
        count: 0,
        averageCost: 0,
        efficiency: 70,
        color: 'blue',
        icon: UsersIcon,
        priority: 'medium',
        optimizationRecommendations: [
          'Reduce staff by 1 person per shift',
          'Reallocate excess capacity to understaffed periods',
          'Consider cross-training for flexibility',
          'Analyze if overstaffing is demand-driven'
        ]
      },
      {
        name: 'Understaffed Shifts',
        description: 'Insufficient coverage, potential service issues',
        shifts: activeSchedules.filter(s =>
          s.actual_coverage < s.coverage_requirements &&
          s.overtime_hours <= 2
        ),
        count: 0,
        averageCost: 0,
        efficiency: 60,
        color: 'orange',
        icon: ExclamationTriangleIcon,
        priority: 'high',
        optimizationRecommendations: [
          'Increase staffing immediately',
          'Implement on-call system',
          'Cross-train staff for flexibility',
          'Review forecasting accuracy'
        ]
      },
      {
        name: 'Problem Shifts',
        description: 'High costs, poor coverage, excessive overtime',
        shifts: activeSchedules.filter(s =>
          (s.actual_coverage < s.coverage_requirements || s.overtime_hours > 2) &&
          s.status !== 'confirmed'
        ),
        count: 0,
        averageCost: 0,
        efficiency: 35,
        color: 'red',
        icon: XCircleIcon,
        priority: 'critical',
        optimizationRecommendations: [
          'Immediate schedule restructuring needed',
          'Review staffing policies',
          'Implement automated scheduling tools',
          'Conduct cost-benefit analysis'
        ]
      }
    ];

    // Calculate quadrant statistics
    shiftQuadrants.forEach(quadrant => {
      quadrant.count = quadrant.shifts.length;
      quadrant.averageCost = quadrant.count > 0
        ? quadrant.shifts.reduce((sum, shift) => sum + shift.total_cost, 0) / quadrant.count
        : 0;
    });

    // Department analysis
    const departmentAnalysis = Array.from(
      new Set(activeSchedules.map(s => s.department))
    ).map(dept => {
      const deptShifts = activeSchedules.filter(s => s.department === dept);
      return {
        department: dept,
        totalShifts: deptShifts.length,
        totalCost: deptShifts.reduce((sum, s) => sum + s.total_cost, 0),
        averageEfficiency: deptShifts.reduce((sum, s) =>
          sum + (s.actual_coverage >= s.coverage_requirements ? 90 : 60), 0
        ) / deptShifts.length,
        overtimeRate: (deptShifts.filter(s => s.overtime_hours > 0).length / deptShifts.length) * 100,
        missedShiftRate: (deptShifts.filter(s => s.status === 'missed').length / deptShifts.length) * 100
      };
    });

    // Trend analysis for shift completion over time
    const shiftTrend = TrendAnalytics.calculateTrend(
      activeSchedules.map((shift, index) => ({
        date: shift.date,
        value: shift.status === 'confirmed' ? 100 : shift.status === 'missed' ? 0 : 50
      })).slice(0, 30) // Last 30 shifts for trend
    );

    return {
      metrics,
      coverageAnalysis,
      shiftQuadrants,
      departmentAnalysis,
      shiftTrend
    };
  }, [schedules]);

  // Generate insights and recommendations
  const insights = useMemo(() => {
    const { metrics, shiftQuadrants, departmentAnalysis, coverageAnalysis } = analytics;
    const insights = [];

    // Coverage insights
    if (metrics.coverageRate < 85) {
      insights.push({
        type: 'coverage',
        priority: 'critical',
        message: `Tasa de cobertura baja (${metrics.coverageRate.toFixed(1)}%)`,
        recommendation: 'Revisar políticas de staffing y implementar sistema de llamadas'
      });
    }

    // Cost insights
    const overtimePercentage = (metrics.overtimeCost / metrics.totalLaborCost) * 100;
    if (overtimePercentage > 15) {
      insights.push({
        type: 'cost',
        priority: 'high',
        message: `Costos de tiempo extra altos (${overtimePercentage.toFixed(1)}% del total)`,
        recommendation: 'Optimizar horarios para reducir dependencia de overtime'
      });
    }

    // Efficiency insights
    if (metrics.efficiencyScore < 80) {
      insights.push({
        type: 'efficiency',
        priority: 'medium',
        message: `Eficiencia de turnos por debajo del objetivo (${metrics.efficiencyScore.toFixed(1)}%)`,
        recommendation: 'Analizar patrones de turnos y implementar mejores prácticas'
      });
    }

    // Understaffing insights
    if (metrics.understaffingIncidents > metrics.totalShifts * 0.1) {
      insights.push({
        type: 'staffing',
        priority: 'high',
        message: `${metrics.understaffingIncidents} incidentes de falta de personal`,
        recommendation: 'Implementar sistema de personal de respaldo y alertas tempranas'
      });
    }

    // Time slot insights
    const problemTimeSlots = coverageAnalysis.filter(ca => ca.coveragePercentage < 80);
    if (problemTimeSlots.length > 0) {
      insights.push({
        type: 'timing',
        priority: 'medium',
        message: `${problemTimeSlots.length} franjas horarias con cobertura insuficiente`,
        recommendation: `Reforzar staffing en: ${problemTimeSlots.map(t => t.timeSlot).join(', ')}`
      });
    }

    // Department-specific insights
    departmentAnalysis.forEach(dept => {
      if (dept.missedShiftRate > 10) {
        insights.push({
          type: 'department',
          priority: 'medium',
          message: `${dept.department}: ${dept.missedShiftRate.toFixed(1)}% de turnos perdidos`,
          recommendation: `Revisar políticas de asistencia en ${dept.department}`
        });
      }
    });

    return insights.slice(0, 6); // Top 6 insights
  }, [analytics]);

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="📊 Analytics de Scheduling"
        subtitle="Optimización de turnos, análisis de cobertura y eficiencia operacional"
        icon={CalendarIcon}
      />

      {/* Key Scheduling Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Tasa de Cobertura"
            value={`${analytics.metrics.coverageRate.toFixed(1)}%`}
            icon={CheckCircleIcon}
            colorPalette={analytics.metrics.coverageRate >= 90 ? "green" : analytics.metrics.coverageRate >= 80 ? "orange" : "red"}
            trend={{
              value: analytics.shiftTrend.growthRate || 0,
              isPositive: (analytics.shiftTrend.growthRate || 0) > 0
            }}
          />
          <MetricCard
            title="Eficiencia General"
            value={`${analytics.metrics.efficiencyScore.toFixed(1)}%`}
            icon={TrophyIcon}
            colorPalette={analytics.metrics.efficiencyScore >= 85 ? "green" : "orange"}
          />
          <MetricCard
            title="Costo Laboral Total"
            value={`$${analytics.metrics.totalLaborCost.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            colorPalette="purple"
          />
          <MetricCard
            title="Incidentes de Falta de Personal"
            value={analytics.metrics.understaffingIncidents}
            icon={ExclamationTriangleIcon}
            colorPalette={analytics.metrics.understaffingIncidents > 10 ? "red" : analytics.metrics.understaffingIncidents > 5 ? "orange" : "green"}
          />
        </CardGrid>
      </StatsSection>

      {/* Shift Efficiency Quadrants (BCG Matrix for Scheduling) */}
      <Section variant="elevated" title="🎯 Matriz de Eficiencia de Turnos">
        <Typography variant="body" size="sm" color="text.muted" mb="lg">
          Análisis de turnos basado en cobertura vs costo - Metodología BCG Matrix adaptada
        </Typography>

        <CardGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          {analytics.shiftQuadrants.map((quadrant, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: `2px solid var(--colors-${quadrant.color}-200)`,
                borderLeft: `6px solid var(--colors-${quadrant.color}-500)`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Icon icon={quadrant.icon} size="sm" color={`${quadrant.color}.600`} />
                <div>
                  <div style={{ fontWeight: 'bold', color: `var(--colors-${quadrant.color}-800)` }}>
                    {quadrant.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'gray', marginBottom: '4px' }}>
                    {quadrant.description}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                  <div><strong>Turnos:</strong> {quadrant.count}</div>
                  <div><strong>Eficiencia:</strong> {quadrant.efficiency}%</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Costo Prom:</strong> ${quadrant.averageCost.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: `var(--colors-${quadrant.color}-700)` }}>
                  Optimizaciones:
                </div>
                <ul style={{ fontSize: '11px', color: 'gray', margin: 0, paddingLeft: '16px' }}>
                  {quadrant.optimizationRecommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      {/* Coverage Analysis by Time Slots */}
      <Section variant="elevated" title="⏰ Análisis de Cobertura por Franjas Horarias">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {analytics.coverageAnalysis.map((slot, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: `1px solid ${slot.coveragePercentage >= 90 ? 'var(--colors-green-200)' :
                       slot.coveragePercentage >= 80 ? 'var(--colors-orange-200)' : 'var(--colors-red-200)'}`
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {slot.timeSlot}
                </div>
                <div style={{ fontSize: '12px', color: 'gray' }}>
                  {slot.required} requeridos, {slot.actual} disponibles
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--colors-gray-200)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, slot.coveragePercentage)}%`,
                    height: '100%',
                    backgroundColor: slot.coveragePercentage >= 90 ? 'green' :
                                   slot.coveragePercentage >= 80 ? 'orange' : 'red'
                  }} />
                </div>
              </div>

              <div style={{ fontSize: '12px' }}>
                <div><strong>{slot.coveragePercentage.toFixed(0)}%</strong> cobertura</div>
                {slot.understaffing > 0 && (
                  <div style={{ color: 'red' }}>
                    -{slot.understaffing} personas
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Department Performance Analysis */}
      <Section variant="elevated" title="🏢 Análisis por Departamento">
        <CardGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
          {analytics.departmentAnalysis.map((dept, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid var(--colors-gray-200)'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize' }}>
                  {dept.department}
                </div>
                <div style={{ fontSize: '13px', color: 'gray' }}>
                  {dept.totalShifts} turnos programados
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div>
                  <strong>Eficiencia:</strong><br />
                  <span style={{ color: dept.averageEfficiency >= 85 ? 'green' : 'orange' }}>
                    {dept.averageEfficiency.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <strong>Costo Total:</strong><br />
                  ${dept.totalCost.toLocaleString()}
                </div>
                <div>
                  <strong>Overtime:</strong><br />
                  <span style={{ color: dept.overtimeRate > 15 ? 'red' : 'green' }}>
                    {dept.overtimeRate.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <strong>Ausencias:</strong><br />
                  <span style={{ color: dept.missedShiftRate > 10 ? 'red' : 'green' }}>
                    {dept.missedShiftRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      {/* Insights and Recommendations */}
      <Section variant="elevated" title="💡 Insights y Recomendaciones">
        <Typography variant="body" size="sm" color="text.muted" mb="lg">
          Análisis inteligente de patrones de scheduling y oportunidades de optimización
        </Typography>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
          {insights.map((insight, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: insight.priority === 'critical' ? 'var(--colors-red-50)' :
                                insight.priority === 'high' ? 'var(--colors-orange-50)' :
                                'var(--colors-blue-50)',
                borderRadius: '6px',
                border: `1px solid var(--colors-${insight.priority === 'critical' ? 'red' :
                                                   insight.priority === 'high' ? 'orange' : 'blue'}-200)`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Badge
                  variant="solid"
                  colorPalette={insight.priority === 'critical' ? 'red' :
                               insight.priority === 'high' ? 'orange' : 'blue'}
                  size="sm"
                >
                  {insight.priority.toUpperCase()}
                </Badge>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                    {insight.message}
                  </div>
                  <div style={{ fontSize: '13px', color: 'gray', fontStyle: 'italic' }}>
                    💡 {insight.recommendation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Overtime Analysis */}
      <Section variant="elevated" title="⏱️ Análisis de Tiempo Extra">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>
              {analytics.metrics.overtimeHours.toFixed(1)}h
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>Total Overtime</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
              ${analytics.metrics.overtimeCost.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>Costo Overtime</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'purple' }}>
              {((analytics.metrics.overtimeCost / analytics.metrics.totalLaborCost) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>% del Costo Total</div>
          </div>
        </div>
      </Section>
    </ContentLayout>
  );
}