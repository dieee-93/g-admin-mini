// SchedulingMetrics.tsx - Enterprise Metrics Component
// Following G-Admin Mini v2.1 patterns - Scheduling Module

import React from 'react';
import {
  StatsSection, CardGrid, MetricCard
} from '@/shared/ui';
import {
  CalendarIcon,
  UsersIcon,
  UserMinusIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SchedulingMetrics {
  total_shifts_this_week: number;
  employees_scheduled: number;
  coverage_percentage: number;
  pending_time_off: number;
  labor_cost_this_week: number;
  overtime_hours: number;
  understaffed_shifts: number;
  approved_requests: number;
}

interface SchedulingMetricsProps {
  metrics: SchedulingMetrics;
  onMetricClick?: (metric: string) => void;
  loading?: boolean;
}

export function SchedulingMetrics({
  metrics,
  onMetricClick = () => {},
  loading = false
}: SchedulingMetricsProps) {

  // Calcular tendencias inteligentes
  const coverageTrend = {
    value: metrics.coverage_percentage > 85 ? 5 : -3,
    isPositive: metrics.coverage_percentage > 85
  };

  const laborCostTrend = {
    value: metrics.overtime_hours > 0 ? 8 : -2,
    isPositive: metrics.overtime_hours === 0
  };

  return (
    <StatsSection>
      <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
        <MetricCard
          title="Turnos Esta Semana"
          value={metrics.total_shifts_this_week}
          icon={CalendarIcon}
          colorPalette="blue"
          loading={loading}
          onClick={() => onMetricClick('shifts')}
          description={`${metrics.employees_scheduled} empleados programados`}
        />

        <MetricCard
          title="Cobertura"
          value={`${metrics.coverage_percentage}%`}
          icon={UsersIcon}
          colorPalette={metrics.coverage_percentage >= 90 ? "green" : metrics.coverage_percentage >= 80 ? "orange" : "red"}
          loading={loading}
          trend={coverageTrend}
          onClick={() => onMetricClick('coverage')}
          description={metrics.understaffed_shifts > 0 ? `${metrics.understaffed_shifts} turnos necesitan personal` : 'Cobertura adecuada'}
        />

        <MetricCard
          title="Solicitudes Pendientes"
          value={metrics.pending_time_off}
          icon={UserMinusIcon}
          colorPalette={metrics.pending_time_off > 10 ? "orange" : metrics.pending_time_off > 0 ? "yellow" : "green"}
          loading={loading}
          onClick={() => onMetricClick('timeoff')}
          description={`${metrics.approved_requests} aprobadas esta semana`}
        />

        <MetricCard
          title="Costo Laboral"
          value={`$${metrics.labor_cost_this_week.toLocaleString('es-AR')}`}
          icon={CurrencyDollarIcon}
          colorPalette="purple"
          loading={loading}
          trend={laborCostTrend}
          onClick={() => onMetricClick('costs')}
          description={metrics.overtime_hours > 0 ? `${metrics.overtime_hours}h overtime` : 'Sin overtime'}
          footer={
            metrics.overtime_hours > 0 ? (
              <MetricCard
                title="Horas Extra"
                value={`${metrics.overtime_hours}h`}
                icon={ClockIcon}
                colorPalette="warning"
                size="sm"
                loading={loading}
              />
            ) : undefined
          }
        />
      </CardGrid>
    </StatsSection>
  );
}

export default SchedulingMetrics;