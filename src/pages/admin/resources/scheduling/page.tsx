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
import EventBus from '@/lib/events';
import { CapabilityGate, useCapabilities } from '@/lib/capabilities';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useNavigation } from '@/contexts/NavigationContext';

// ✅ HOOKS ESPECIALIZADOS
import { useSchedulingPage } from './hooks';
import { useScheduling } from './hooks/useScheduling';

// ✅ REGISTER CALENDAR ADAPTER (import triggers registration)
import './services/schedulingApi';

import { logger } from '@/lib/logging';
// ✅ COMPONENTES ESPECIALIZADOS ENTERPRISE v2.1
import {
  SchedulingMetrics,
  SchedulingManagement,
  SchedulingActions,
  SchedulingAlerts,
  AutoSchedulingModal,
  ShiftEditorModal
} from './components';

// ✅ UNIFIED CALENDAR SYSTEM

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
      logger.debug('API', '♻️ Scheduling: Staff availability changed, recalculating...', data);
    },
    'sales.volume_forecast': (data: any) => {
      logger.info('API', '📊 Scheduling: Sales forecast updated, adjusting staffing...', data);
    },
    'hr.rate_updated': (data: any) => {
      logger.debug('API', '💰 Scheduling: Labor rates updated, recalculating costs...', data);
    }
  }
} as const;

export default function SchedulingPage() {
  // ✅ SISTEMAS INTEGRATION
  const { hasFeature } = useCapabilities();
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { isMobile } = useNavigation();

  // ✅ PAGE ORCHESTRATION
  const {
    viewState,
    schedulingStats,
    isAutoSchedulingOpen,
    isShiftEditorOpen,
    editingShift,
    handleTabChange,
    setViewState,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated,
    handleOpenCreateShift,
    handleOpenEditShift,
    handleCloseShiftEditor,
    loading,
    error
  } = useSchedulingPage();

  // ✅ UNIFIED SCHEDULING SYSTEM
  const { shifts: allShifts, refreshData } = useScheduling();

  // Debug logs removed to prevent console spam

  const handleCalendarShiftClick = (shiftId: string) => {
    const clickedShift = allShifts.find(s => s.id === shiftId);
    if (clickedShift) {
      handleOpenEditShift(clickedShift);
    } else {
      console.error(`Shift with ID ${shiftId} not found.`);
      // Optionally, show a notification to the user
    }
  };

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
          logger.info('API', '[SchedulingPage] 🚨 Alert action triggered:', { action, data });

          // Handle alert actions
          if (action === 'find_coverage') handleTabChange('coverage');
          if (action === 'review_overtime') handleTabChange('costs');
          if (action === 'review_requests') handleTabChange('timeoff');
          if (action === 'improve_coverage') handleTabChange('coverage');
          if (action === 'review_costs') handleTabChange('costs');

          // Emit events for further processing
          EventBus.emit(`scheduling.alert_action_${action}`, data);
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
          onShiftClick={handleCalendarShiftClick}
        />
      </Section>

      {/* ⚡ 5. ACCIONES RÁPIDAS - OBLIGATORIO */}
      <SchedulingActions
        onAddShift={handleOpenCreateShift}
        onAutoSchedule={() => setIsAutoSchedulingOpen(true)}
        onExportSchedule={() => EventBus.emit('scheduling.export_requested', {})}
        onGenerateReport={() => EventBus.emit('scheduling.report_requested', {})}
        onCopyWeek={() => EventBus.emit('scheduling.copy_week_requested', { week: viewState.selectedWeek })}
        onFindCoverage={() => {
          handleTabChange('coverage');
          EventBus.emit('scheduling.find_coverage_requested', {});
        }}
        onBulkOperations={() => EventBus.emit('scheduling.bulk_operations_requested', {})}
        hasCapability={hasFeature}
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

      {/* 🪟 MODAL - SHIFT EDITOR */}
      {isShiftEditorOpen && (
        <ShiftEditorModal
          isOpen={isShiftEditorOpen}
          onClose={handleCloseShiftEditor}
          onSuccess={() => {
            handleCloseShiftEditor();
            refreshData();
          }}
          shift={editingShift}
          prefilledDate={viewState.selectedWeek}
        />
      )}
    </ContentLayout>
  );
}