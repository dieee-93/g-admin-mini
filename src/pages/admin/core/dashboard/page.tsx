/**
 * Dashboard Page - Executive Command Center with Semantic Architecture
 *
 * REFACTORED v3.0 - SEMANTIC HTML + ARIA:
 * ✅ Uses 3-Layer Architecture:
 *    - Layer 3: Semantic components (Main, SemanticSection, SkipLink)
 *    - Layer 2: Layout components (ContentLayout, Section)
 *    - Layer 1: Primitives (Box, Stack, Typography)
 * ✅ WCAG 2.4.1 Level A compliant (Bypass Blocks)
 * ✅ Auto-generated screen reader headings
 * ✅ ARIA live regions for dynamic content
 * ✅ Proper landmark navigation
 *
 * DASHBOARD EVOLUTIVO v2.0 - UNIFIED DYNAMIC GRID:
 * - HeaderSwitch: Alterna entre vistas (🔔 Alertas | 🏆 Setup/Logros)
 * - Estado < 100%: BusinessSetupProgressWidget (guía setup)
 * - Estado = 100%: AchievementsWidget (logros de maestría)
 * - Default: Siempre muestra Alertas primero
 * - DynamicDashboardGrid: Widgets dinámicos con drag-n-drop
 * - CrossModuleInsights: Analytics multi-módulo
 *
 * Best Practices (2024-2025):
 * - Uses React 18 useId() for stable SSR/CSR IDs
 * - Follows WAI-ARIA authoring practices
 * - Progressive Disclosure pattern (NN/G)
 * - Gamification patterns (Yu-kai Chou)
 *
 * Basado en:
 * - Progressive Disclosure (NN/G)
 * - Dashboard Evolutivo design doc (DASHBOARD_EVOLUTIVO_Y_LOGROS.md)
 * - Gamification patterns (Yu-kai Chou)
 * - Atomic Capabilities v2.0 (Dynamic Slot System)
 */

import React, { useState, useMemo } from 'react';
import { ContentLayout, Section, SkipLink } from '@/shared/ui';
import { HeaderSwitch } from '@/shared/ui/HeaderSwitch';
import { useCapabilityStore } from '@/store/capabilityStore';
import { useShallow } from 'zustand/react/shallow';
import { DynamicDashboardGrid } from './components/DynamicDashboardGrid';
import { CrossModuleInsights } from './components/CrossModuleInsights';
// DEPRECATED: BusinessSetupProgressWidget moved to Module Registry system
// import { BusinessSetupProgressWidget } from './components/BusinessSetupProgressWidget';
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
  // 🔧 FIX: Usar useShallow para prevenir re-renders por cambio de referencia de arrays
  const pendingMilestones = useCapabilityStore(
    useShallow(state => state.features.pendingMilestones)
  );
  const completedMilestoneIds = useCapabilityStore(
    useShallow(state => state.features.completedMilestones)
  );

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
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="compact" mainLabel="Executive Dashboard">

        {/* HEADER SWITCH - Dashboard Evolutivo */}
        <HeaderSwitch.Dashboard
          setupComplete={setupComplete}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view as DashboardView)}
          setupBadge={setupBadge}
          alertsBadge={alertsBadge}
        />

        {/* ✅ ALERTS SECTION - ARIA live region for dynamic updates */}
        {activeView === 'alerts' && (
          <Section
            variant="flat"
            semanticHeading="System Alerts and Notifications"
            live="polite"
            atomic
          >
            <AlertsView />
          </Section>
        )}

        {/* ✅ BUSINESS SETUP SECTION - Progress tracking */}
        {/* DEPRECATED: BusinessSetupProgressWidget moved to Module Registry system */}
        {/* {activeView === 'setup' && !setupComplete && (
          <Section
            variant="flat"
            semanticHeading="Business Setup Progress"
            live="polite"
          >
            <BusinessSetupProgressWidget
              onSetupCompleted={() => setActiveView('achievements')}
            />
          </Section>
        )} */}

        {/* ✅ ACHIEVEMENTS SECTION - Gamification */}
        {(activeView === 'achievements' || (activeView === 'setup' && setupComplete)) && (
          <Section
            variant="flat"
            semanticHeading="Business Achievements"
          >
            <AchievementsWidget />
          </Section>
        )}

        {/* ✅ WIDGETS SECTION - Dynamic dashboard grid with ARIA live */}
        <Section
          variant="flat"
          semanticHeading="Performance Metrics and Analytics"
          live="polite"
          relevant="additions removals"
        >
          <DynamicDashboardGrid />
        </Section>

        {/* ✅ INSIGHTS SECTION - Complementary content as <aside> */}
        <Section
          as="aside"
          variant="flat"
          semanticHeading="Cross-Module Business Insights"
        >
          <CrossModuleInsights />
        </Section>

      </ContentLayout>
    </>
  );
};

export default DashboardPage;
