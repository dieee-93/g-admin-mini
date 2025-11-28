/**
 * DistributionChartWidget - Widget wrapper para DistributionChart
 *
 * Wrapper para inyectar el chart de distribución de revenue en el dashboard.
 * Usa el componente DistributionChart ya creado.
 *
 * Registrado en dashboard.widgets via dashboard manifest
 */

import React from 'react';
import { DistributionChart } from '@/pages/admin/core/dashboard/components/charts';

export const DistributionChartWidget: React.FC = () => {
  // TODO: Fetch real data from API
  return <DistributionChart />;
};
