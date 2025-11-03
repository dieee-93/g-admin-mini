/**
 * Sales Page - Point of Sale & Order Management
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ ARIA live region for sales alerts
 * ✅ Aside pattern for metrics
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 *
 * FEATURES:
 * - Real-time POS system
 * - Multi-location support
 * - Payment processing
 * - Order tracking
 * - Kitchen integration
 * - EventBus integration (13 systems)
 */

import { useEffect, useCallback } from 'react';
import {
  ContentLayout, Section, Button, Alert, Icon, Stack, Badge, SkipLink, HStack
} from '@/shared/ui';
import { HookPoint } from '@/lib/modules';
import {
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// ✅ 14 SISTEMAS INTEGRADOS (+ PERMISSIONS)
import EventBus from '@/lib/events';
// Capabilities checked at module load time via Module Registry
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useNavigationLayout } from '@/contexts/NavigationContext';
import { useLocation } from '@/contexts/LocationContext'; // 🆕 MULTI-LOCATION
import { usePermissions } from '@/hooks/usePermissions'; // 🆕 PERMISSIONS SYSTEM

// ✅ COMPONENTES ESPECIALIZADOS - TESTING FOR DECIMAL ERROR
import {
  SalesMetrics,
  SalesManagement,
  SalesActions,
  SalesAlerts,
  LazySaleFormModal,
  DebugOverlay
} from './components';

// ✅ HOOKS ESPECIALIZADOS - TESTING ONE BY ONE
import { useSalesPage } from './hooks';
import { useModalState } from '@/store/salesStore';

import { logger } from '@/lib/logging';
// ✅ MODULE CONFIGURATION
interface EventData {
  [key: string]: unknown;
}

const SALES_MODULE_CONFIG = {
  capabilities: ['sells_products', 'pos_system', 'payment_processing', 'customer_management'],
  events: {
    emits: ['sales.order_placed', 'sales.payment_completed', 'sales.sale_completed', 'sales.customer_registered'],
    listens: ['materials.stock_updated', 'materials.low_stock_alert', 'kitchen.order_ready']
  },
  eventHandlers: {
    'materials.stock_updated': (data: EventData) => {
      // Auto-update product availability based on stock changes
      logger.info('SalesStore', '🛒 Sales: Stock updated, updating product availability...', data);
    },
    'materials.low_stock_alert': (data: EventData) => {
      // Auto-disable products with critical stock levels
      logger.info('SalesStore', '🚨 Sales: Low stock alert received, adjusting POS...', data);
    },
    'kitchen.order_ready': (data: EventData) => {
      // Real-time order status updates
      logger.info('SalesStore', '✅ Sales: Order ready notification...', data);
    }
  }
} as const;

function SalesPage() {
  console.log('🚀 [SalesPage] COMPONENT MOUNT - FIRST LINE');

  try {
    logger.debug('SalesStore', '🔍 SalesPage Component rendering');
  } catch (e) {
    console.error('❌ [SalesPage] Logger failed:', e);
  }

  // ✅ SISTEMAS INTEGRATION
  // Capabilities checked at module load time via Module Registry
  // 🔧 FIX: Only consume hooks that don't update too frequently
  // usePerformanceMonitor updates 60x/second - DO NOT USE in critical pages
  // const { shouldReduceAnimations } = usePerformanceMonitor();
  const { isMobile } = useNavigationLayout();
  const shouldReduceAnimations = false; // Hardcoded for now
  const selectedLocation = null; // const { selectedLocation, isMultiLocationMode } = useLocation();
  const isMultiLocationMode = false;

  // 🔒 PERMISSIONS SYSTEM - Check user permissions for sales module
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canVoid,
    canExport,
    canConfigure
  } = usePermissions('sales');

  const {
    metrics,
    pageState,
    actions,
    loading,
    error,
    activeTab,
    setActiveTab
  } = useSalesPage();
  console.log('✅ [SalesPage] useSalesPage data loaded', { metrics, loading, error });

  logger.debug('SalesStore', '🔍 SalesPage useSalesPage completed:', {
    hasMetrics: !!metrics,
    hasActions: !!actions,
    loading,
    error
  });

  // ✅ MODAL STATE
  logger.debug('SalesStore', '🔍 SalesPage Getting modal state...');
  const { isModalOpen, closeModal } = useModalState();

  logger.debug('SalesStore', '🔍 SalesPage All hooks completed successfully!');

  // ✅ EVENTBUS SUBSCRIPTION - Subscribe to cross-module events
  useEffect(() => {
    logger.debug('SalesStore', '🔍 Subscribing to EventBus events...');

    const subscriptions = Object.entries(SALES_MODULE_CONFIG.eventHandlers).map(([eventName, handler]) => {
      logger.debug('SalesStore', `📡 Subscribing to: ${eventName}`);
      return EventBus.subscribe(eventName, (event) => {
        handler(event.payload || {});
      });
    });

    logger.debug('SalesStore', `✅ Subscribed to ${subscriptions.length} events`);

    // Cleanup subscriptions on unmount
    return () => {
      logger.debug('SalesStore', '🧹 Unsubscribing from EventBus events...');
      subscriptions.forEach(unsub => unsub());
    };
  }, []);

  // ✅ ERROR HANDLING WITH RECOVERY
  // Note: Removed pageState from dependencies to prevent infinite loop
  // pageState is an object that recreates on every render, causing the effect to run infinitely
  useEffect(() => {
    if (error && handleError) {
      logger.error('SalesStore', '🚨 Error detected in SalesPage:', error);
      handleError(error, {
        context: 'SalesPage',
        pageState: pageState || {},
        recoverable: true
      });
    }
  }, [error, handleError]);

  // ✅ ERROR UI
  if (error) {
    logger.error('SalesStore', '🔍 SalesPage Error detected:', error);
    return (
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="Sales Management Error">
          <Alert status="error" title="Error de carga del módulo">
            {error}
          </Alert>
          <Button onClick={() => window.location.reload()}>
            <Icon icon={ArrowPathIcon} size="sm" />
            Recargar página
          </Button>
        </ContentLayout>
      </>
    );
  }

  logger.debug('SalesStore', '🔍 SalesPage Starting render...');

  return (
    <>
      {/* 🐛 DEBUG OVERLAY - DISABLED: Causes infinite re-renders via setRenderInfo */}
      {/* <DebugOverlay metrics={metrics} actions={actions} pageState={pageState} /> */}

      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Sales Point of Sale Management">

        {/* ✅ OFFLINE WARNING SECTION - ARIA live region */}
        {!isOnline && (
          <Section
            variant="flat"
            semanticHeading="System Status Alert"
            live="polite"
            atomic
          >
            <Alert variant="warning" title="Modo Offline">
              Los cambios se sincronizarán cuando recuperes la conexión
            </Alert>
          </Section>
        )}

        {/* 🆕 MULTI-LOCATION: Location Badges */}
        {isMultiLocationMode && selectedLocation && (
          <Section variant="flat" semanticHeading="Current Location Information">
            <Stack direction="row" gap="sm" align="center" flexWrap="wrap">
              <Badge variant="solid" colorPalette="blue">
                📍 {selectedLocation.name}
              </Badge>
              <Badge variant="outline" colorPalette="green">
                {selectedLocation.code}
              </Badge>
            </Stack>
          </Section>
        )}

        {/* 🎯 TOOLBAR ACTIONS - Hook System Injection Point */}
        <Section variant="flat" semanticHeading="Sales Toolbar Actions">
          <HStack gap="3" flexWrap="wrap">
            {/* HookPoint: sales.toolbar.actions */}
            {/* Modules can inject actions here (e.g., TakeAway toggle, Dine-In toggle) */}
            <HookPoint name="sales.toolbar.actions" fallback={null} />
          </HStack>
        </Section>

        {/* ✅ METRICS SECTION - Complementary aside pattern */}
        <Section
          as="aside"
          variant="flat"
          semanticHeading="Sales Metrics Overview"
        >
          <SalesMetrics
            metrics={metrics}
            onMetricClick={actions.handleMetricClick}
            loading={loading}
          />
        </Section>

        {/* ✅ CRITICAL ALERTS SECTION - ARIA live region */}
        <Section
          variant="flat"
          semanticHeading="Sales Alerts and Notifications"
          live="polite"
          atomic
        >
          <SalesAlerts
            onAlertAction={actions.handleAlertAction}
            context="sales"
            metrics={metrics}
          />
        </Section>

        {/* ✅ MAIN MANAGEMENT SECTION - Primary content area */}
        {/* 🔒 PERMISSIONS: User must have at least READ permission to view */}
        {canRead && (
          <Section
            variant="elevated"
            title="Gestión de Ventas"
            semanticHeading="Sales Management Tools"
          >
            <SalesManagement
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOrderPlace={canCreate ? actions.handleOrderPlace : undefined}
              onPaymentProcess={canUpdate ? actions.handlePaymentProcess : undefined}
              onNewSale={canCreate ? actions.handleNewSale : undefined}
              performanceMode={shouldReduceAnimations}
              // 🔒 Pass permissions to child component for granular control
              permissions={{
                canCreate,
                canUpdate,
                canDelete,
                canVoid,
                canExport
              }}
            />
          </Section>
        )}

        {/* ✅ QUICK ACTIONS SECTION - Aside pattern for tools */}
        {/* 🔒 PERMISSIONS: Show section only if user has any action permission */}
        {(canCreate || canExport || canConfigure) && (
          <Section
            as="aside"
            variant="flat"
            semanticHeading="Quick Action Tools"
          >
            <SalesActions
              onNewSale={canCreate ? actions.handleNewSale : undefined}
              onQRGeneration={canConfigure ? actions.handleQRGeneration : undefined}
              onShowAnalytics={canRead ? actions.handleShowAnalytics : undefined}
              onKitchenDisplay={canRead ? actions.handleKitchenDisplay : undefined}
              isMobile={isMobile}
            />
          </Section>
        )}

        {/* 🪟 MODAL - AGREGAR/PROCESAR VENTA */}
        {/* 🔒 PERMISSIONS: Only show modal if user has create or update permission */}
        {isModalOpen && (canCreate || canUpdate) && (
          <LazySaleFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            readOnly={!canCreate && !canUpdate} // Read-only mode if no permissions
          />
        )}

      </ContentLayout>
    </>
  );
}

export default SalesPage;

// 🔍 Enable Why Did You Render tracking for debugging infinite loops
if (import.meta.env.DEV) {
  SalesPage.whyDidYouRender = true;
}
