/**
 * RevenueAreaChartWidget - Widget wrapper para RevenueAreaChart
 *
 * Wrapper para inyectar el chart de revenue acumulado en el dashboard.
 * Usa el componente RevenueAreaChart ya creado.
 *
 * Registrado en dashboard.widgets via dashboard manifest
 */

import React from 'react';
import { RevenueAreaChart } from '@/pages/admin/core/dashboard/components/charts';

export const RevenueAreaChartWidget: React.FC = () => {
  // TODO: Fetch real data from API
  return <RevenueAreaChart />;
};
