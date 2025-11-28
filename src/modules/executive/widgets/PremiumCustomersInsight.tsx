/**
 * PremiumCustomersInsight - Insight de clientes premium
 *
 * Widget de insight que muestra:
 * - Impacto de clientes premium en revenue
 * - Valor promedio de transacción
 * - Tags de módulos relacionados
 * - Acción para ver detalles
 *
 * Registrado en dashboard.widgets via executive manifest
 */

import React from 'react';
import { InsightCard } from '@/shared/widgets/InsightCard';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

export const PremiumCustomersInsight: React.FC = () => {
  // TODO: Conectar con API real de analytics
  const handleViewDetails = () => {
    // Navigate to CRM/Memberships analytics
    logger.info('App', 'Navigate to premium customers analytics');
  };

  return (
    <InsightCard
      title="Clientes Premium generan 68% del Revenue"
      description="Los clientes con membresías activas tienen 3.2x mayor valor promedio de transacción"
      metric="+$180K"
      metricLabel="potencial anual"
      tags={['CRM', 'Memberships', 'Sales']}
      actionLabel="Ver Detalles"
      icon={<ChartBarIcon style={{ width: '18px', height: '18px' }} />}
      positive={true}
      onAction={handleViewDetails}
    />
  );
};
