/**
 * InventoryInsight - Insight de inventario crítico
 *
 * Widget de insight que muestra:
 * - Stock bajo en materiales críticos
 * - Tiempo estimado hasta desabastecimiento
 * - Tags de módulos relacionados
 * - Acción para ordenar ahora
 *
 * Registrado en dashboard.widgets via executive manifest
 */

import React from 'react';
import { InsightCard } from '@/shared/widgets/InsightCard';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

export const InventoryInsight: React.FC = () => {
  // TODO: Conectar con API real de inventory alerts
  const handleOrderNow = () => {
    // Navigate to supplier orders
    logger.info('App', 'Navigate to supplier orders');
  };

  return (
    <InsightCard
      title="Stock bajo en 3 materiales críticos"
      description="Se necesita reabastecimiento urgente para mantener producción"
      metric="15 días"
      metricLabel="hasta desabastecimiento"
      tags={['Inventory', 'Production']}
      actionLabel="Ordenar Ahora"
      icon={<ExclamationTriangleIcon style={{ width: '18px', height: '18px' }} />}
      positive={false}
      onAction={handleOrderNow}
    />
  );
};
