/**
 * Dashboard Page - Executive Command Center FIXED
 *
 * TRANSFORMACIÓN COMPLETA:
 * - De HTML vanilla mal hecho a componentes semánticos profesionales
 * - Información REAL de 23+ módulos empresariales
 * - Layout limpio con componentes @/shared/ui
 */

import React from 'react';
import { ContentLayout, Stack } from '@/shared/ui';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { CrossModuleInsights } from './components/CrossModuleInsights';

const DashboardPage: React.FC = () => {
  return (
    <ContentLayout spacing="normal">
      <Stack gap={12}>
        {/* Vista Ejecutiva Principal */}
        <ExecutiveOverview />

        {/* Cross-Module Analytics e Insights */}
        <CrossModuleInsights />
      </Stack>
    </ContentLayout>
  );
};

export default DashboardPage;