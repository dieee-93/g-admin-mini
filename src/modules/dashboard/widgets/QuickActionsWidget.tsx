/**
 * QuickActionsWidget - Widget wrapper para QuickActions
 *
 * Wrapper para inyectar el widget de acciones rápidas en el dashboard.
 * Usa el componente QuickActionsWidget ya creado.
 *
 * Registrado en dashboard.widgets via dashboard manifest (priority: 105)
 */

import React from 'react';
import { QuickActionsWidget as QuickActionsComponent } from '@/pages/admin/core/dashboard/components/QuickActionsWidget';

export const QuickActionsWidget: React.FC = () => {
  return <QuickActionsComponent />;
};
