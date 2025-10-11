/**
 * Dashboard Page - Executive Command Center with Evolutionary Design
 *
 * DASHBOARD EVOLUTIVO v2.0 - UNIFIED DYNAMIC GRID:
 * - HeaderSwitch: Alterna entre vistas (🔔 Alertas | 🏆 Setup/Logros)
 * - Estado < 100%: BusinessSetupProgressWidget (guía setup)
 * - Estado = 100%: AchievementsWidget (logros de maestría)
 * - Default: Siempre muestra Alertas primero
 * - DynamicDashboardGrid: Widgets dinámicos con drag-n-drop (reemplaza ExecutiveOverview)
 * - CrossModuleInsights: Analytics multi-módulo
 *
 * REFACTORED v2.0:
 * - ✅ Reemplaza ExecutiveOverview + Dynamic Widgets por DynamicDashboardGrid unificado
 * - ✅ Drag-n-drop integrado con dynamic loading
 * - ✅ Widgets dinámicos según features activas (Atomic Capabilities v2.0)
 * - ✅ Persistencia de layout en localStorage
 *
 * Basado en:
 * - Progressive Disclosure (NN/G)
 * - Dashboard Evolutivo design doc (DASHBOARD_EVOLUTIVO_Y_LOGROS.md)
 * - Gamification patterns (Yu-kai Chou)
 * - Atomic Capabilities v2.0 (Dynamic Slot System)
 */

import React, { useState, useMemo } from 'react';
import { ContentLayout, Stack } from '@/shared/ui';
import { HeaderSwitch } from '@/shared/ui/HeaderSwitch';
import { useCapabilityStore } from '@/store/capabilityStore';
import { DynamicDashboardGrid } from './components/DynamicDashboardGrid';
import { CrossModuleInsights } from './components/CrossModuleInsights';
import { BusinessSetupProgressWidget } from './components/BusinessSetupProgressWidget';
import { AchievementsWidget } from './components/AchievementsWidget';
import { AlertsView } from './components/AlertsView';

// ===============================
// TYPES
// ===============================

type DashboardView = 'alerts' | 'setup' | 'achievements';

// ===============================
// COMPONENT
// ===============================

const DashboardPage: React.FC = () => {
  // ✅ CRITICAL FIX: Usar selectores directos para evitar objeto nuevo en cada render
  const pendingMilestones = useCapabilityStore(state => state.features.pendingMilestones);
  const completedMilestoneIds = useCapabilityStore(state => state.features.completedMilestones);

  // Estado local: vista activa del HeaderSwitch
  const [activeView, setActiveView] = useState<DashboardView>('alerts');

  // ===============================
  // COMPUTED VALUES
  // ===============================

  // Calcular si setup está completo
  const setupComplete = useMemo(() => {
    const totalMilestones = pendingMilestones.length + completedMilestoneIds.length;
    if (totalMilestones === 0) return false; // Sin milestones = aún no configurado

    return pendingMilestones.length === 0; // Completado si no hay pendientes
  }, [pendingMilestones, completedMilestoneIds]);

  // Badges para el HeaderSwitch
  const setupBadge = useMemo(() => {
    if (setupComplete) return undefined; // No badge si está completo
    return pendingMilestones.length; // Número de pasos pendientes
  }, [setupComplete, pendingMilestones]);

  const alertsBadge = useMemo(() => {
    // TODO: Implementar conteo real de alertas críticas
    // Por ahora, retornar undefined
    return undefined;
  }, []);

  // ===============================
  // RENDER
  // ===============================

  return (
    <ContentLayout spacing="compact">
      <Stack gap={4}>
        {/* HEADER SWITCH - Dashboard Evolutivo */}
        <HeaderSwitch.Dashboard
          setupComplete={setupComplete}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view as DashboardView)}
          setupBadge={setupBadge}
          alertsBadge={alertsBadge}
        />

        {/* VISTA SEGÚN POSICIÓN DEL SWITCH */}
        {activeView === 'alerts' && <AlertsView />}

        {activeView === 'setup' && !setupComplete && (
          <BusinessSetupProgressWidget
            onSetupCompleted={() => setActiveView('achievements')}
          />
        )}

        {(activeView === 'achievements' || (activeView === 'setup' && setupComplete)) && (
          <AchievementsWidget />
        )}

        {/* ✅ UNIFIED DYNAMIC DASHBOARD GRID - Drag-n-drop + Dynamic Widgets */}
        {/* Reemplaza: ExecutiveOverview + Dynamic Widgets section */}
        <DynamicDashboardGrid />

        {/* CROSS-MODULE ANALYTICS E INSIGHTS - Siempre visible */}
        <CrossModuleInsights />
      </Stack>
    </ContentLayout>
  );
};

export default DashboardPage;
