// SchedulingPage.tsx - Enterprise Module Following G-Admin Mini v2.1
// Migrated to Design System v2.1 and Business Template

import React from 'react';

// ✅ DESIGN SYSTEM V2.1 - IMPORTS OBLIGATORIOS
import {
  ContentLayout, Section, Button, Alert, Icon
} from '@/shared/ui';

// ✅ ICONOS HEROICONS
import {
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// ✅ 13 SISTEMAS INTEGRADOS
import { useModuleIntegration } from '@/hooks/useModuleIntegration';
import { CapabilityGate } from '@/lib/capabilities';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useNavigation } from '@/contexts/NavigationContext';

// ✅ HOOKS ESPECIALIZADOS
import { useSchedulingPage } from './hooks';

// ✅ COMPONENTES ESPECIALIZADOS ENTERPRISE v2.1
import {
  SchedulingMetrics,
  SchedulingManagement,
  SchedulingActions,
  SchedulingAlerts,
  AutoSchedulingModal
} from './components';

// ✅ MODULE CONFIGURATION
const SCHEDULING_MODULE_CONFIG = {
  capabilities: ['schedule_management', 'approve_timeoff', 'view_labor_costs'],
  events: {
    emits: [
      'scheduling.schedule_updated',
      'scheduling.overtime_alert',
      'scheduling.coverage_gap',
      'scheduling.shift_confirmed'
    ],
    listens: [
      'staff.availability_updated',
      'sales.volume_forecast',
      'hr.rate_updated'
    ]
  },
  eventHandlers: {
    'staff.availability_updated': (data: any) => {
      console.log('♻️ Scheduling: Staff availability changed, recalculating...', data);
    },
    'sales.volume_forecast': (data: any) => {
      console.log('📊 Scheduling: Sales forecast updated, adjusting staffing...', data);
    },
    'hr.rate_updated': (data: any) => {
      console.log('💰 Scheduling: Labor rates updated, recalculating costs...', data);
    }
  }
} as const;

export default function SchedulingPage() {
  // ✅ SISTEMAS INTEGRATION
  const { emitEvent, hasCapability, status } = useModuleIntegration('scheduling', SCHEDULING_MODULE_CONFIG);
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { isMobile } = useNavigation();

  // ✅ PAGE ORCHESTRATION
  const {
    viewState,
    schedulingStats,
    isAutoSchedulingOpen,
    handleTabChange,
    setViewState,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated,
    loading,
    error
  } = useSchedulingPage();

  // Debug logs removed to prevent console spam

  // ✅ ERROR HANDLING
  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de carga del módulo">
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>
          <Icon icon={ArrowPathIcon} size="sm" />
          Recargar página
        </Button>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* 🔒 1. ESTADO DE CONEXIÓN - Solo si crítico */}
      {!status.isActive && (
        <Alert
          variant="subtle"
          title="Module Capabilities Required"
          description={`Missing capabilities: ${status.missingCapabilities.join(', ')}`}
        />
      )}

      {!isOnline && (
        <Alert variant="warning" title="Modo Offline">
          Los cambios se sincronizarán cuando recuperes la conexión
        </Alert>
      )}

      {/* 📊 2. MÉTRICAS DE NEGOCIO - OBLIGATORIO PRIMERO */}
      <SchedulingMetrics
        metrics={schedulingStats}
        onMetricClick={(metric) => {
          // Handle metric clicks to navigate to specific tabs
          if (metric === 'coverage') handleTabChange('coverage');
          if (metric === 'timeoff') handleTabChange('timeoff');
          if (metric === 'costs') handleTabChange('costs');
          if (metric === 'shifts') handleTabChange('schedule');
        }}
        loading={loading}
      />

      {/* 🚨 3. ALERTAS CRÍTICAS - Solo si existen */}
      <SchedulingAlerts
        context="scheduling"
        schedulingStats={schedulingStats}
        onAlertAction={(action, data) => {
          console.log('[SchedulingPage] 🚨 Alert action triggered:', { action, data });

          // Handle alert actions
          if (action === 'find_coverage') handleTabChange('coverage');
          if (action === 'review_overtime') handleTabChange('costs');
          if (action === 'review_requests') handleTabChange('timeoff');
          if (action === 'improve_coverage') handleTabChange('coverage');
          if (action === 'review_costs') handleTabChange('costs');

          // Emit events for further processing
          emitEvent(`scheduling.alert_action_${action}`, data);
        }}
      />

      {/* 🎯 4. GESTIÓN PRINCIPAL CON TABS - OBLIGATORIO */}
      <Section variant="elevated" title="Gestión de Horarios">
        <SchedulingManagement
          activeTab={viewState.activeTab}
          onTabChange={handleTabChange}
          schedulingStats={schedulingStats}
          viewState={viewState}
          onViewStateChange={setViewState}
          performanceMode={shouldReduceAnimations}
          isMobile={isMobile}
        />
      </Section>

      {/* ⚡ 5. ACCIONES RÁPIDAS - OBLIGATORIO */}
      <SchedulingActions
        onAddShift={() => {
          // TODO: Open shift creation modal
          emitEvent('scheduling.new_shift_requested', {});
        }}
        onAutoSchedule={() => setIsAutoSchedulingOpen(true)}
        onExportSchedule={() => emitEvent('scheduling.export_requested', {})}
        onGenerateReport={() => emitEvent('scheduling.report_requested', {})}
        onCopyWeek={() => emitEvent('scheduling.copy_week_requested', { week: viewState.selectedWeek })}
        onFindCoverage={() => {
          handleTabChange('coverage');
          emitEvent('scheduling.find_coverage_requested', {});
        }}
        onBulkOperations={() => emitEvent('scheduling.bulk_operations_requested', {})}
        hasCapability={hasCapability}
        isMobile={isMobile}
        loading={loading}
      />

      {/* 🪟 MODAL - AUTO SCHEDULING */}
      {isAutoSchedulingOpen && (
        <AutoSchedulingModal
          isOpen={isAutoSchedulingOpen}
          onClose={() => setIsAutoSchedulingOpen(false)}
          onScheduleGenerated={handleScheduleGenerated}
          currentWeek={viewState.selectedWeek}
        />
      )}
    </ContentLayout>
  );
}