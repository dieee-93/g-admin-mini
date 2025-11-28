/**
 * PendingOrdersWidget - Widget de órdenes pendientes para dashboard
 *
 * Widget KPI que muestra:
 * - Número de órdenes pendientes
 * - Estado (en proceso)
 * - Icono de base de datos
 *
 * Registrado en dashboard.widgets via materials manifest
 */

import React from 'react';
import { StatCard } from '@/shared/widgets/StatCard';
import { CircleStackIcon } from '@heroicons/react/24/outline';

export const PendingOrdersWidget: React.FC = () => {
  // TODO: Conectar con API real de órdenes
  const pendingOrders = 12;

  return (
    <StatCard
      title="Órdenes Pendientes"
      value={pendingOrders.toString()}
      icon={<CircleStackIcon style={{ width: '20px', height: '20px' }} />}
      accentColor="orange.500"
      footer="En proceso"
    />
  );
};
