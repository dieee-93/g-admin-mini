/**
 * SalesTrendChartWidget - Widget wrapper para SalesTrendChart
 *
 * Wrapper para inyectar el chart de tendencia de ventas en el dashboard.
 * Usa el componente SalesTrendChart ya creado.
 *
 * Registrado en dashboard.widgets via dashboard manifest
 */

import React from 'react';
import { SalesTrendChart } from '@/pages/admin/core/dashboard/components/charts';

export const SalesTrendChartWidget: React.FC = () => {
  // TODO: Fetch real data from API
  return <SalesTrendChart />;
};
