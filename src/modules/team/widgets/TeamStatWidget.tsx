/**
 * TeamStatWidget - Widget de equipo activo para dashboard
 *
 * Widget KPI que muestra:
 * - Equipo activo vs total
 * - Performance promedio
 * - Icono de usuarios
 *
 * Registrado en dashboard.widgets via team manifest
 */

import React from 'react';
import { StatCard } from '@/shared/widgets/StatCard';
import { UsersIcon } from '@heroicons/react/24/outline';

export const TeamStatWidget: React.FC = () => {
  // TODO: Conectar con API real de team
  const activeTeam = 6;
  const totalTeam = 9;
  const performance = 94;

  return (
    <StatCard
      title="Equipo Activo"
      value={`${activeTeam}/${totalTeam}`}
      icon={<UsersIcon style={{ width: '20px', height: '20px' }} />}
      accentColor="purple.500"
      footer="Performance"
      footerValue={`${performance}%`}
      footerColor="green.500"
    />
  );
};
