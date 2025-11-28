/**
 * StaffStatWidget - Widget de staff activo para dashboard
 *
 * Widget KPI que muestra:
 * - Staff activo vs total
 * - Performance promedio
 * - Icono de usuarios
 *
 * Registrado en dashboard.widgets via staff manifest
 */

import React from 'react';
import { StatCard } from '@/shared/widgets/StatCard';
import { UsersIcon } from '@heroicons/react/24/outline';

export const StaffStatWidget: React.FC = () => {
  // TODO: Conectar con API real de staff
  const activeStaff = 6;
  const totalStaff = 9;
  const performance = 94;

  return (
    <StatCard
      title="Staff Activo"
      value={`${activeStaff}/${totalStaff}`}
      icon={<UsersIcon style={{ width: '20px', height: '20px' }} />}
      accentColor="purple.500"
      footer="Performance"
      footerValue={`${performance}%`}
      footerColor="green.500"
    />
  );
};
