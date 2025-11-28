/**
 * MetricsBarChartWidget - Widget wrapper para MetricsBarChart
 *
 * Wrapper para inyectar el chart de métricas vs objetivos en el dashboard.
 * Usa el componente MetricsBarChart ya creado.
 *
 * Registrado en dashboard.widgets via dashboard manifest
 */

import React from 'react';
import { MetricsBarChart } from '@/pages/admin/core/dashboard/components/charts';

export const MetricsBarChartWidget: React.FC = () => {
  // TODO: Fetch real data from API
  return <MetricsBarChart />;
};
