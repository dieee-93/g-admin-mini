/**
 * Staff Analytics Enhanced - Using AnalyticsEngine patterns
 * Specialized HR analytics with performance metrics, retention analysis, and labor cost optimization
 */
import React, { useMemo } from 'react';
import {
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Badge, Icon, Typography
} from '@/shared/ui';
import {
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { AnalyticsEngine, TrendAnalytics } from '@/shared/services/AnalyticsEngine';
import type { FC, SVGProps } from 'react';

// Hero icon type
type HeroIcon = FC<SVGProps<SVGSVGElement>>;

// HR-specific analytics types
interface StaffMember {
  id: string;
  name: string;
  department: string;
  position: string;
  hire_date: string;
  salary: number;
  hourly_rate: number;
  performance_rating: number; // 0-100
  attendance_rate: number; // 0-100
  hours_worked_monthly: number;
  last_review_date: string;
  certifications: string[];
  skills: string[];
  employment_type: 'full_time' | 'part_time' | 'contractor';
  status: 'active' | 'inactive' | 'terminated';
}

interface StaffPerformanceMetrics {
  totalStaff: number;
  activeStaff: number;
  averagePerformance: number;
  retentionRate: number;
  turnoverRate: number;
  totalLaborCost: number;
  averageHourlyRate: number;
  overtimeHours: number;
  trainingInvestment: number;
}

interface DepartmentAnalysis {
  name: string;
  headcount: number;
  averagePerformance: number;
  averageHourlyRate: number;
  totalCost: number;
  retention: number;
  productivity: number;
  skillGaps: string[];
}

interface PerformanceQuadrant {
  name: string;
  description: string;
  employees: StaffMember[];
  count: number;
  avgSalary: number;
  retention: number;
  color: string;
  icon: HeroIcon;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRecommendations: string[];
}

interface StaffAnalyticsEnhancedProps {
  staff?: StaffMember[];
  timeframe?: '1M' | '3M' | '6M' | '1Y';
}

// Mock data generator for demonstration
const generateMockStaffData = (): StaffMember[] => {
  const departments = ['kitchen', 'service', 'admin', 'cleaning', 'management'];
  const positions = {
    kitchen: ['Chef', 'Line Cook', 'Prep Cook', 'Dishwasher'],
    service: ['Server', 'Host', 'Bartender', 'Cashier'],
    admin: ['Manager', 'Accountant', 'HR Specialist'],
    cleaning: ['Cleaner', 'Maintenance'],
    management: ['General Manager', 'Assistant Manager']
  };

  return Array.from({ length: 35 }, (_, i) => {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const positionsInDept = positions[dept as keyof typeof positions];
    const position = positionsInDept[Math.floor(Math.random() * positionsInDept.length)];

    const baseHourlyRate = dept === 'management' ? 25 + Math.random() * 15 :
                          dept === 'admin' ? 18 + Math.random() * 12 :
                          dept === 'service' ? 12 + Math.random() * 8 :
                          dept === 'kitchen' ? 14 + Math.random() * 10 :
                          10 + Math.random() * 5;

    return {
      id: `emp_${i + 1}`,
      name: `Employee ${i + 1}`,
      department: dept,
      position,
      hire_date: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1).toISOString(),
      salary: Math.floor(baseHourlyRate * 40 * 4.33),
      hourly_rate: Math.round(baseHourlyRate * 100) / 100,
      performance_rating: 60 + Math.random() * 35, // 60-95 range
      attendance_rate: 85 + Math.random() * 15, // 85-100 range
      hours_worked_monthly: 150 + Math.random() * 30, // 150-180 hours
      last_review_date: new Date(2024, Math.floor(Math.random() * 6), 1).toISOString(),
      certifications: Math.random() > 0.7 ? ['Food Safety', 'First Aid'] : [],
      skills: ['Communication', 'Teamwork', 'Customer Service'].slice(0, Math.floor(Math.random() * 3) + 1),
      employment_type: (Math.random() > 0.2 ? 'full_time' : 'part_time') as StaffMember['employment_type'],
      status: (Math.random() > 0.1 ? 'active' : 'inactive') as StaffMember['status']
    };
  });
};

export function StaffAnalyticsEnhanced({
  staff = generateMockStaffData()
}: Omit<StaffAnalyticsEnhancedProps, 'timeframe'>) {
  // TODO: Implement timeframe filtering when historical data is available

  // Core analytics calculations
  const analytics = useMemo(() => {
    const activeStaff = staff.filter(s => s.status === 'active');

    // Basic metrics
    const metrics: StaffPerformanceMetrics = {
      totalStaff: staff.length,
      activeStaff: activeStaff.length,
      averagePerformance: activeStaff.reduce((sum, s) => sum + s.performance_rating, 0) / activeStaff.length,
      retentionRate: (activeStaff.length / staff.length) * 100,
      turnoverRate: ((staff.length - activeStaff.length) / staff.length) * 100,
      totalLaborCost: activeStaff.reduce((sum, s) => sum + s.salary, 0),
      averageHourlyRate: activeStaff.reduce((sum, s) => sum + s.hourly_rate, 0) / activeStaff.length,
      overtimeHours: activeStaff.reduce((sum, s) => sum + Math.max(0, s.hours_worked_monthly - 160), 0),
      trainingInvestment: activeStaff.reduce((sum, s) => sum + (s.certifications.length * 500), 0)
    };

    // Department analysis
    const departmentAnalysis: DepartmentAnalysis[] = Array.from(
      new Set(activeStaff.map(s => s.department))
    ).map(dept => {
      const deptStaff = activeStaff.filter(s => s.department === dept);
      return {
        name: dept,
        headcount: deptStaff.length,
        averagePerformance: deptStaff.reduce((sum, s) => sum + s.performance_rating, 0) / deptStaff.length,
        averageHourlyRate: deptStaff.reduce((sum, s) => sum + s.hourly_rate, 0) / deptStaff.length,
        totalCost: deptStaff.reduce((sum, s) => sum + s.salary, 0),
        retention: 95 + Math.random() * 5, // Mock retention rate
        productivity: 80 + Math.random() * 15, // Mock productivity score
        skillGaps: ['Customer Service', 'Technical Skills', 'Leadership'].slice(0, Math.floor(Math.random() * 2) + 1)
      };
    });

    // Performance Matrix (9-Box Grid simplified to quadrants)
    const performanceQuadrants: PerformanceQuadrant[] = [
      {
        name: 'High Performers',
        description: 'Top talent - high performance, high potential',
        employees: activeStaff.filter(s => s.performance_rating >= 85 && s.attendance_rate >= 95),
        count: 0,
        avgSalary: 0,
        retention: 95,
        color: 'green',
        icon: TrophyIcon,
        priority: 'high',
        actionRecommendations: [
          'Consider for promotion opportunities',
          'Assign mentoring responsibilities',
          'Offer advanced training programs',
          'Retention bonuses and career development'
        ]
      },
      {
        name: 'Solid Contributors',
        description: 'Reliable performers with growth potential',
        employees: activeStaff.filter(s => s.performance_rating >= 75 && s.performance_rating < 85),
        count: 0,
        avgSalary: 0,
        retention: 85,
        color: 'blue',
        icon: CheckCircleIcon,
        priority: 'medium',
        actionRecommendations: [
          'Provide skill development opportunities',
          'Set stretch goals and challenges',
          'Consider for specialized projects',
          'Regular feedback and coaching'
        ]
      },
      {
        name: 'Developing Talent',
        description: 'Newer or developing employees with potential',
        employees: activeStaff.filter(s => s.performance_rating >= 65 && s.performance_rating < 75),
        count: 0,
        avgSalary: 0,
        retention: 75,
        color: 'orange',
        icon: AcademicCapIcon,
        priority: 'medium',
        actionRecommendations: [
          'Structured training programs',
          'Assign experienced mentors',
          'Regular performance check-ins',
          'Clear development roadmap'
        ]
      },
      {
        name: 'Performance Concerns',
        description: 'Employees needing improvement or intervention',
        employees: activeStaff.filter(s => s.performance_rating < 65 || s.attendance_rate < 85),
        count: 0,
        avgSalary: 0,
        retention: 45,
        color: 'red',
        icon: ExclamationTriangleIcon,
        priority: 'critical',
        actionRecommendations: [
          'Performance improvement plans',
          'Additional training and support',
          'Weekly progress reviews',
          'Consider role realignment or termination'
        ]
      }
    ];

    // Calculate quadrant statistics
    performanceQuadrants.forEach(quadrant => {
      quadrant.count = quadrant.employees.length;
      quadrant.avgSalary = quadrant.count > 0
        ? quadrant.employees.reduce((sum, emp) => sum + emp.salary, 0) / quadrant.count
        : 0;
    });

    // RFM Analysis for employee engagement (Recency of review, Frequency of training, Monetary value)
    const employeeRFM = AnalyticsEngine.processData(activeStaff.map(emp => ({
      id: emp.id,
      recency: Math.floor((Date.now() - new Date(emp.last_review_date).getTime()) / (1000 * 60 * 60 * 24)), // Days since last review
      frequency: emp.certifications.length + emp.skills.length, // Training frequency proxy
      monetary: emp.salary // Monetary value to company
    })));

    // Trend analysis for performance over time
    const performanceTrend = TrendAnalytics.calculateTrend(
      activeStaff.map((emp, index) => ({
        date: new Date(2024, index % 6, 1).toISOString(),
        value: emp.performance_rating
      }))
    );

    return {
      metrics,
      departmentAnalysis,
      performanceQuadrants,
      employeeRFM,
      performanceTrend
    };
  }, [staff]);

  // Generate insights and recommendations
  const insights = useMemo(() => {
    const { metrics, departmentAnalysis } = analytics;
    const insights = [];

    // Performance insights
    if (metrics.averagePerformance < 75) {
      insights.push({
        type: 'performance',
        priority: 'high',
        message: `Performance promedio (${metrics.averagePerformance.toFixed(1)}%) está por debajo del objetivo`,
        recommendation: 'Implementar programa de mejora de performance y coaching'
      });
    }

    // Retention insights
    if (metrics.turnoverRate > 15) {
      insights.push({
        type: 'retention',
        priority: 'critical',
        message: `Tasa de rotación (${metrics.turnoverRate.toFixed(1)}%) es preocupante`,
        recommendation: 'Análisis de causa raíz de rotación y plan de retención'
      });
    }

    // Cost insights
    const avgMonthlyCostPerEmployee = metrics.totalLaborCost / metrics.activeStaff;
    if (avgMonthlyCostPerEmployee > 3000) {
      insights.push({
        type: 'cost',
        priority: 'medium',
        message: `Costo promedio por empleado ($${avgMonthlyCostPerEmployee.toFixed(0)}) es alto`,
        recommendation: 'Revisar estructura de compensación y productividad'
      });
    }

    // Overtime insights
    if (metrics.overtimeHours > metrics.activeStaff * 20) { // More than 20 hours overtime per employee
      insights.push({
        type: 'overtime',
        priority: 'high',
        message: `Horas extra excesivas (${metrics.overtimeHours} total)`,
        recommendation: 'Optimizar horarios y considerar contrataciones adicionales'
      });
    }

    // Department-specific insights
    departmentAnalysis.forEach(dept => {
      if (dept.averagePerformance < 70) {
        insights.push({
          type: 'department',
          priority: 'medium',
          message: `Departamento ${dept.name} tiene performance baja (${dept.averagePerformance.toFixed(1)}%)`,
          recommendation: `Capacitación específica y revisión de procesos en ${dept.name}`
        });
      }
    });

    return insights.slice(0, 6); // Top 6 insights
  }, [analytics]);

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="📊 Analytics de Personal"
        subtitle="Análisis profundo de performance, retención y optimización de costos laborales"
        icon={ChartBarIcon}
      />

      {/* Key Performance Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Performance Promedio"
            value={`${analytics.metrics.averagePerformance.toFixed(1)}%`}
            icon={TrophyIcon}
            colorPalette={analytics.metrics.averagePerformance >= 80 ? "green" : "orange"}
            trend={{
              value: analytics.performanceTrend.growthRate || 0,
              isPositive: (analytics.performanceTrend.growthRate || 0) > 0
            }}
          />
          <MetricCard
            title="Tasa de Retención"
            value={`${analytics.metrics.retentionRate.toFixed(1)}%`}
            icon={CheckCircleIcon}
            colorPalette={analytics.metrics.retentionRate >= 85 ? "green" : "red"}
          />
          <MetricCard
            title="Costo Laboral Total"
            value={`$${analytics.metrics.totalLaborCost.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            colorPalette="purple"
          />
          <MetricCard
            title="Horas Extra Totales"
            value={`${analytics.metrics.overtimeHours.toFixed(0)}h`}
            icon={ClockIcon}
            colorPalette={analytics.metrics.overtimeHours > analytics.metrics.activeStaff * 20 ? "orange" : "green"}
          />
        </CardGrid>
      </StatsSection>

      {/* Performance Matrix (9-Box Grid) */}
      <Section variant="elevated" title="🎯 Matriz de Performance">
        <Typography variant="body" size="sm" color="text.muted" mb="lg">
          Análisis de personal basado en performance y potencial - Metodología 9-Box Grid
        </Typography>

        <CardGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          {analytics.performanceQuadrants.map((quadrant, index) => (
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
                  <div><strong>Empleados:</strong> {quadrant.count}</div>
                  <div><strong>Retención:</strong> {quadrant.retention}%</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Salario Prom:</strong> ${quadrant.avgSalary.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: `var(--colors-${quadrant.color}-700)` }}>
                  Acciones Recomendadas:
                </div>
                <ul style={{ fontSize: '11px', color: 'gray', margin: 0, paddingLeft: '16px' }}>
                  {quadrant.actionRecommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      {/* Department Analysis */}
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
                  {dept.name}
                </div>
                <div style={{ fontSize: '13px', color: 'gray' }}>
                  {dept.headcount} empleados
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div>
                  <strong>Performance:</strong><br />
                  <span style={{ color: dept.averagePerformance >= 80 ? 'green' : 'orange' }}>
                    {dept.averagePerformance.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <strong>Tarifa Prom:</strong><br />
                  ${dept.averageHourlyRate.toFixed(2)}/h
                </div>
                <div>
                  <strong>Costo Total:</strong><br />
                  ${dept.totalCost.toLocaleString()}
                </div>
                <div>
                  <strong>Productividad:</strong><br />
                  <span style={{ color: dept.productivity >= 85 ? 'green' : 'orange' }}>
                    {dept.productivity.toFixed(0)}%
                  </span>
                </div>
              </div>

              {dept.skillGaps.length > 0 && (
                <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'var(--colors-yellow-50)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--colors-yellow-800)' }}>
                    Brechas de Habilidades:
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--colors-yellow-700)' }}>
                    {dept.skillGaps.join(', ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardGrid>
      </Section>

      {/* Insights and Recommendations */}
      <Section variant="elevated" title="💡 Insights y Recomendaciones">
        <Typography variant="body" size="sm" color="text.muted" mb="lg">
          Análisis inteligente de patrones y oportunidades de mejora
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

      {/* RFM Engagement Analysis */}
      {analytics.employeeRFM.insights.length > 0 && (
        <Section variant="elevated" title="📈 Análisis de Engagement (RFM)">
          <Typography variant="body" size="sm" color="text.muted" mb="md">
            Segmentación de empleados basada en Recencia de evaluaciones, Frecuencia de capacitación y Valor Monetario
          </Typography>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {analytics.employeeRFM.insights.slice(0, 4).map((insight, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid var(--colors-gray-200)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </ContentLayout>
  );
}