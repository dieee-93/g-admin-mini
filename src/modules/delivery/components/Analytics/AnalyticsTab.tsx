import { Stack, SimpleGrid, MetricCard, Button, Spinner } from '@/shared/ui';
import { TruckIcon, ClockIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { DeliveryMetrics } from '../../types';
import { DeliveriesChart } from './DeliveriesChart';
import { TopDriversTable } from './TopDriversTable';

interface AnalyticsTabProps {
  metrics: DeliveryMetrics;
  loading: boolean;
}

export default function AnalyticsTab({ metrics, loading }: AnalyticsTabProps) {
  if (loading) {
    return (
      <Stack gap="md" p="md" align="center" justify="center" height="400px">
        <Spinner size="lg" />
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="md">
      {/* Date Range Selector (placeholder) */}
      <Stack direction="row" gap="sm">
        <Button variant="solid" size="sm">
          Hoy
        </Button>
        <Button variant="outline" size="sm">
          Esta Semana
        </Button>
        <Button variant="outline" size="sm">
          Este Mes
        </Button>
      </Stack>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="md">
        <MetricCard
          title="Deliveries Activos"
          value={metrics.active_deliveries}
          icon={TruckIcon}
          colorPalette="blue"
        />
        <MetricCard
          title="Tiempo Promedio"
          value={`${metrics.avg_delivery_time_minutes} min`}
          icon={ClockIcon}
          colorPalette="green"
        />
        <MetricCard
          title="On-Time Rate"
          value={`${metrics.on_time_rate_percentage}%`}
          icon={CheckCircleIcon}
          colorPalette="teal"
        />
        <MetricCard
          title="Total Hoy"
          value={metrics.total_deliveries_today}
          icon={ChartBarIcon}
          colorPalette="purple"
        />
      </SimpleGrid>

      {/* Deliveries by Status Chart */}
      <DeliveriesChart metrics={metrics} />

      {/* Top Drivers Table */}
      <TopDriversTable />
    </Stack>
  );
}
