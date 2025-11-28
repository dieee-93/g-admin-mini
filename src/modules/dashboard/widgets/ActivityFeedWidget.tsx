/**
 * ActivityFeedWidget - Widget wrapper para ActivityFeed
 *
 * Wrapper para inyectar el widget de feed de actividad en el dashboard.
 * Usa el componente ActivityFeedWidget ya creado.
 *
 * Registrado en dashboard.widgets via dashboard manifest (priority: 50)
 */

import React from 'react';
import { ActivityFeedWidget as ActivityFeedComponent } from '@/pages/admin/core/dashboard/components/ActivityFeedWidget';

export const ActivityFeedWidget: React.FC = () => {
  return <ActivityFeedComponent />;
};
