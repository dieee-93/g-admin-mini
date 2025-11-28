/**
 * SalesStatWidget - Widget de ventas diarias para dashboard
 *
 * Widget KPI que muestra:
 * - Número de ventas del día
 * - Tendencia vs día anterior
 * - Icono de gráfico
 *
 * Registrado en dashboard.widgets via sales manifest
 */

import React from 'react';
import { StatCard } from '@/shared/widgets/StatCard';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export const SalesStatWidget: React.FC = () => {
  // TODO: Conectar con API real de ventas
  const todaySales = 47;
  const yesterdaySales = 43;
  const trend = ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1);
  const isPositive = todaySales >= yesterdaySales;

  return (
    <StatCard
      title="Ventas Hoy"
      value={todaySales.toString()}
      icon={<ChartBarIcon style={{ width: '20px', height: '20px' }} />}
      accentColor="blue.500"
      trend={{
        value: `${isPositive ? '+' : ''}${trend}%`,
        isPositive
      }}
      footer="vs ayer"
    />
  );
};
