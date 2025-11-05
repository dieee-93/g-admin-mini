/**
 * SCHEDULING TOP BAR
 *
 * Barra superior compacta con métricas y alertas críticas.
 * Reemplaza el layout anterior de métricas + alertas separadas.
 *
 * @version 2.0.0 - Compact Design
 * @see ../docs/SCHEDULING_CALENDAR_DESIGN.md#top-bar
 */

import React from 'react';
import { Stack, Badge, Alert, Icon, Typography } from '@/shared/ui';
import {
  UsersIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export interface SchedulingStats {
  total_shifts_this_week: number;
  employees_scheduled: number;
  coverage_percentage: number;
  pending_time_off: number;
  labor_cost_this_week: number;
  overtime_hours: number;
  understaffed_shifts: number;
  approved_requests: number;
}

export interface SchedulingTopBarProps {
  /** Estadísticas del scheduling */
  stats: SchedulingStats;

  /** Si está cargando */
  loading?: boolean;

  /** Callback cuando se hace click en una métrica */
  onMetricClick?: (metric: string) => void;
}

/**
 * SchedulingTopBar Component
 *
 * Renderiza:
 * - Fila de métricas compactas (4-6 cards)
 * - Alertas críticas (solo si existen problemas)
 */
export function SchedulingTopBar({
  stats,
  loading = false,
  onMetricClick
}: SchedulingTopBarProps) {

  // ============================================
  // ALERT DETECTION
  // ============================================

  const alerts = detectAlerts(stats);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <Stack direction="column" gap="3">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                flex: '1 1 200px',
                height: '80px',
                backgroundColor: '#F7FAFC',
                borderRadius: '8px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
          ))}
        </div>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="3">
      {/* METRICS ROW */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Metric 1: Total Shifts */}
        <MetricCard
          label="Turnos"
          value={stats.total_shifts_this_week.toString()}
          icon={UsersIcon}
          colorPalette="blue"
          onClick={() => onMetricClick?.('shifts')}
        />

        {/* Metric 2: Coverage */}
        <MetricCard
          label="Cobertura"
          value={`${stats.coverage_percentage.toFixed(1)}%`}
          icon={CheckCircleIcon}
          colorPalette={stats.coverage_percentage >= 90 ? 'green' : stats.coverage_percentage >= 70 ? 'orange' : 'red'}
          onClick={() => onMetricClick?.('coverage')}
        />

        {/* Metric 3: Pending Time-Off */}
        <MetricCard
          label="Permisos"
          value={stats.pending_time_off.toString()}
          icon={ClockIcon}
          colorPalette={stats.pending_time_off > 0 ? 'orange' : 'gray'}
          badge={stats.pending_time_off > 0 ? 'Pendientes' : undefined}
          onClick={() => onMetricClick?.('timeoff')}
        />

        {/* Metric 4: Labor Cost */}
        <MetricCard
          label="Costo Laboral"
          value={formatCurrency(stats.labor_cost_this_week)}
          icon={CurrencyDollarIcon}
          colorPalette="purple"
          subtitle={stats.overtime_hours > 0 ? `${stats.overtime_hours}h extras` : undefined}
          onClick={() => onMetricClick?.('costs')}
        />
      </div>

      {/* CRITICAL ALERTS (only if problems exist) */}
      {alerts.length > 0 && (
        <Stack direction="column" gap="2">
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              status={alert.severity}
              title={alert.title}
            >
              <Typography variant="body" size="sm">
                {alert.message}
              </Typography>
            </Alert>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  colorPalette: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  badge?: string;
  subtitle?: string;
  onClick?: () => void;
}

function MetricCard({
  label,
  value,
  icon: IconComponent,
  colorPalette,
  badge,
  subtitle,
  onClick
}: MetricCardProps) {
  return (
    <div
      style={{
        flex: '1 1 200px',
        minWidth: '180px',
        padding: '16px',
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = '#3182CE';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = '#E2E8F0';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        }
      }}
    >
      <Stack direction="row" justify="space-between" align="start" gap="2">
        {/* Left: Icon + Label */}
        <Stack direction="column" gap="1" flex="1">
          <Stack direction="row" align="center" gap="2">
            <div
              style={{
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: `var(--chakra-colors-${colorPalette}-50)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon icon={IconComponent} size="sm" color={`${colorPalette}.600`} />
            </div>

            <Typography variant="body" size="xs" color="gray.600" fontWeight="medium">
              {label}
            </Typography>
          </Stack>

          {/* Value */}
          <Typography variant="heading" size="lg" fontWeight="bold" color="gray.900">
            {value}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography variant="body" size="xs" color="gray.500">
              {subtitle}
            </Typography>
          )}
        </Stack>

        {/* Right: Badge (if exists) */}
        {badge && (
          <Badge size="sm" colorPalette={colorPalette}>
            {badge}
          </Badge>
        )}
      </Stack>
    </div>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

interface Alert {
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

/**
 * Detecta alertas críticas basadas en stats
 */
function detectAlerts(stats: SchedulingStats): Alert[] {
  const alerts: Alert[] = [];

  // Alert: Understaffed shifts
  if (stats.understaffed_shifts > 0) {
    alerts.push({
      severity: 'warning',
      title: 'Gaps de cobertura detectados',
      message: `${stats.understaffed_shifts} turno${stats.understaffed_shifts > 1 ? 's' : ''} con cobertura insuficiente`
    });
  }

  // Alert: Low coverage
  if (stats.coverage_percentage < 70) {
    alerts.push({
      severity: 'error',
      title: 'Cobertura baja',
      message: `Cobertura actual: ${stats.coverage_percentage.toFixed(1)}% (objetivo: 90%+)`
    });
  }

  // Alert: High overtime
  if (stats.overtime_hours > 20) {
    alerts.push({
      severity: 'warning',
      title: 'Horas extras elevadas',
      message: `${stats.overtime_hours}h de overtime esta semana - Revisar costos`
    });
  }

  // Alert: Pending time-off
  if (stats.pending_time_off > 5) {
    alerts.push({
      severity: 'info',
      title: 'Solicitudes de permiso pendientes',
      message: `${stats.pending_time_off} solicitudes esperando revisión`
    });
  }

  return alerts;
}

/**
 * Formatea currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
