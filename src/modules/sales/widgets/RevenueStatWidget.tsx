/**
 * RevenueStatWidget - Widget de Revenue diario para dashboard
 *
 * Widget KPI que muestra:
 * - Revenue del día actual
 * - Tendencia vs día anterior
 * - Icono de moneda
 *
 * Registrado en dashboard.widgets via sales manifest
 */

import React from 'react';
import { StatCard } from '@/shared/widgets/StatCard';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';

export const RevenueStatWidget: React.FC = () => {
  // TODO: Conectar con API real de ventas
  const todayRevenue = 12450;
  const yesterdayRevenue = 11100;
  const trend = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1);
  const isPositive = todayRevenue >= yesterdayRevenue;

  return (
    <StatCard
      title="Revenue Hoy"
      value={`$${todayRevenue.toLocaleString()}`}
      icon={<CurrencyDollarIcon style={{ width: '20px', height: '20px' }} />}
      accentColor="green.500"
      trend={{
        value: `${isPositive ? '+' : ''}${trend}%`,
        isPositive
      }}
      footer="vs ayer"
    />
  );
};
