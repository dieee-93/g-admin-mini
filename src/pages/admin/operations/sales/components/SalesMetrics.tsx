import { StatsSection, CardGrid, MetricCard } from '@/shared/ui';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  TableCellsIcon,
  ClockIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import type { SalesPageMetrics } from '../hooks/useSalesPage';

interface SalesMetricsProps {
  metrics: SalesPageMetrics;
  onMetricClick?: (metric: string, value: any) => void;
  loading?: boolean;
}

export function SalesMetrics({ metrics, onMetricClick, loading }: SalesMetricsProps) {
  const handleMetricClick = (metric: string, value: any) => {
    onMetricClick?.(metric, value);
  };

  if (loading) {
    return (
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <MetricCard
              key={i}
              title="Cargando..."
              value="---"
              icon={CurrencyDollarIcon}
              colorPalette="gray"
              loading={true}
            />
          ))}
        </CardGrid>
      </StatsSection>
    );
  }

  return (
    <StatsSection>
      <CardGrid columns={{ base: 1, sm: 2, lg: 4 }}>
        <MetricCard
          title="Revenue Hoy"
          value={`$${metrics.todayRevenue.toLocaleString('es-AR')}`}
          icon={CurrencyDollarIcon}
          colorPalette="green"
          trend={{ value: metrics.salesGrowth, isPositive: metrics.salesGrowth > 0 }}
          onClick={() => handleMetricClick('revenue', metrics.todayRevenue)}
        />
        <MetricCard
          title="Transacciones Activas"
          value={metrics.todayTransactions}
          icon={CreditCardIcon}
          colorPalette="blue"
          onClick={() => handleMetricClick('transactions', metrics.todayTransactions)}
        />
        <MetricCard
          title="Ticket Promedio"
          value={`$${metrics.averageOrderValue.toLocaleString('es-AR')}`}
          icon={ArrowTrendingUpIcon}
          colorPalette="purple"
          onClick={() => handleMetricClick('averageOrder', metrics.averageOrderValue)}
        />
        <MetricCard
          title="Mesas Activas"
          value={metrics.activeTables}
          icon={TableCellsIcon}
          colorPalette="teal"
          onClick={() => handleMetricClick('activeTables', metrics.activeTables)}
        />

        {/* Segunda fila - Métricas operacionales */}
        <MetricCard
          title="Órdenes Pendientes"
          value={metrics.pendingOrders}
          icon={ClockIcon}
          colorPalette="orange"
          onClick={() => handleMetricClick('pendingOrders', metrics.pendingOrders)}
        />
        <MetricCard
          title="Tiempo Servicio"
          value={`${metrics.averageServiceTime} min`}
          icon={UsersIcon}
          colorPalette="cyan"
          onClick={() => handleMetricClick('serviceTime', metrics.averageServiceTime)}
        />
        <MetricCard
          title="Margen Ganancia"
          value={`${metrics.profitMargin.toFixed(1)}%`}
          icon={ChartBarIcon}
          colorPalette="green"
          trend={{ value: metrics.profitMargin, isPositive: metrics.profitMargin > 0 }}
          onClick={() => handleMetricClick('profitMargin', metrics.profitMargin)}
        />
        <MetricCard
          title="Ocupación Mesas"
          value={`${metrics.tableOccupancy.toFixed(1)}%`}
          icon={DocumentTextIcon}
          colorPalette="purple"
          onClick={() => handleMetricClick('tableOccupancy', metrics.tableOccupancy)}
        />
      </CardGrid>
    </StatsSection>
  );
}