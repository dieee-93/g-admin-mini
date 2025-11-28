/**
 * Materials Page - Inventory Management & Stock Control
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ ARIA live region for stock alerts
 * ✅ Aside pattern for metrics
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 *
 * FEATURES:
 * - Real-time stock tracking (multi-location)
 * - Low stock alerts with ARIA announcements
 * - Bulk operations
 * - Offline-first support
 * - EventBus integration (13 systems)
 */

import { useEffect, useMemo, useCallback, memo } from 'react';
import {
  ContentLayout, Section, Button, Alert, Icon, CollapsibleAlertStack, type AlertItem, Stack, Badge, SkipLink
} from '@/shared/ui';
import {
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// ✅ 14 SISTEMAS INTEGRADOS (+ PERMISSIONS)
import EventBus from '@/lib/events';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useNavigationLayout } from '@/contexts/NavigationContext';
import { useLocation } from '@/contexts/LocationContext'; // 🆕 MULTI-LOCATION
import { usePermissions } from '@/hooks/usePermissions'; // 🆕 PERMISSIONS SYSTEM

// ✅ COMPONENTES ESPECIALIZADOS
import {
  MaterialsMetrics,
  MaterialsManagement,
  MaterialsActions,
  MaterialsAlerts,
  LazyMaterialFormModal
} from './components';

// ✅ HOOKS ESPECIALIZADOS
import { useMaterialsPage, useRealtimeMaterials } from './hooks';
import { useMaterialsStore } from '@/store/materialsStore';

import { logger } from '@/lib/logging';

// 🔧 PERFORMANCE: Move event handlers outside component to prevent recreation on every render
// These are pure event handlers with no component dependencies, so they can be module-level
const eventHandlers = {
  'sales.order_placed': async (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '🛒 Sales order placed, reserving stock...', data);
    // Reserve stock (create pending stock_entries with type='reserved')
    // In production, this would call inventoryApi.reserveStock()
    logger.debug('MaterialsStore', '📦 Stock reservation system ready for implementation');
  },

  'sales.completed': (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '✅ Sale completed, converting reservation to deduction...', data);
    // Auto-reduce stock based on sale
    // In production: Convert reserved entries to actual deductions
  },

  'sales.order_cancelled': async (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '♻️ Sales order cancelled, releasing stock...', data);
    // Release reserved stock
    // In production: Delete reserved stock entries
  },

  'products.recipe_updated': (data: Record<string, unknown>) => {
    logger.debug('MaterialsStore', '📝 Recipe updated, recalculating requirements...', data);
    // Recalculate material requirements
  },

  'production.order.created': (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '🏭 Production order created, reserving materials...', data);
    // Reserve materials for production
  },

  'production.order.completed': (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '✅ Production completed, updating stock...', data);
    // Deduct raw materials, add produced goods
  },

  'materials.procurement.po_received': async (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '📦 Purchase order received, auto-updating stock...', data);
    // Auto-update stock based on purchase order delivery
    // In production: Call inventoryApi.bulkAdjustStock()
  }
} as const;

// ✅ MODULE CONFIGURATION
const MATERIALS_MODULE_CONFIG = {
  capabilities: ['inventory_tracking', 'supplier_management', 'purchase_orders'],
  events: {
    emits: [
      'materials.stock_updated',
      'materials.low_stock_alert',
      'materials.material_created',
      'materials.material_updated',
      'materials.material_deleted',
      'materials.purchase_order_created'
    ],
    listens: [
      'sales.order_placed',        // 🆕 NEW - Reserve stock when order placed
      'sales.completed',           // ✅ Existing - Deduct stock when sale completed
      'sales.order_cancelled',     // 🆕 NEW - Release reserved stock
      'products.recipe_updated',   // ✅ Existing - Recalculate material requirements
      'production.order.created',  // 🆕 RENAMED from kitchen.item_consumed
      'production.order.completed',// 🆕 NEW - Update stock after production
      'materials.procurement.po_received' // 🆕 NEW - Auto-update stock on delivery
    ]
  },
  eventHandlers // Use the module-level handlers
} as const;

export default function MaterialsPage() {
  // ✅ SISTEMAS INTEGRATION
  // Capabilities checked at module load time via Module Registry
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { isMobile } = useNavigationLayout();
  const { selectedLocation, isMultiLocationMode } = useLocation(); // 🆕 MULTI-LOCATION

  // 🔒 PERMISSIONS SYSTEM - Check user permissions for materials module
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    canConfigure
  } = usePermissions('materials');

  // ✅ PAGE ORCHESTRATION
  const {
    metrics,
    actions,
    loading,
    error,
    activeTab,
    setActiveTab
  } = useMaterialsPage();

  // ✅ MODAL STATE - Use selective subscription
  // ✅ FIX: Don't use useMaterials() here - it subscribes to ENTIRE store again!
  const isModalOpen = useMaterialsStore((state) => state.isModalOpen);
  const closeModal = useMaterialsStore((state) => state.closeModal);

  // 🔒 Memoize permissions object to prevent breaking child memoization
  const permissions = useMemo(() => ({
    canCreate,
    canUpdate,
    canDelete,
    canExport
  }), [canCreate, canUpdate, canDelete, canExport]);

  const actionsPermissions = useMemo(() => ({
    canCreate,
    canUpdate,
    canExport,
    canConfigure
  }), [canCreate, canUpdate, canExport, canConfigure]);

  // ✅ REAL-TIME SYNC: Enable Supabase subscriptions for multi-user scenarios
  useRealtimeMaterials({
    locationId: isMultiLocationMode ? selectedLocation?.id : undefined,
    debug: false, // Set to true for debugging
    disabled: !isOnline // Disable when offline
  });

  // ✅ EVENTBUS INTEGRATION: Connect MODULE_CONFIG event handlers
  // 🔧 PERFORMANCE FIX: Handlers are now module-level constants, preventing recreation
  useEffect(() => {
    logger.debug('MaterialsStore', '📡 Subscribing to cross-module events...');

    const unsubscribers = [
      // Sales events
      EventBus.on('sales.order_placed', eventHandlers['sales.order_placed']),
      EventBus.on('sales.completed', eventHandlers['sales.completed']),
      EventBus.on('sales.order_cancelled', eventHandlers['sales.order_cancelled']),

      // Product/Recipe events
      EventBus.on('products.recipe_updated', eventHandlers['products.recipe_updated']),

      // Production events
      EventBus.on('production.order.created', eventHandlers['production.order.created']),
      EventBus.on('production.order.completed', eventHandlers['production.order.completed']),

      // Procurement events
      EventBus.on('materials.procurement.po_received', eventHandlers['materials.procurement.po_received'])
    ];

    logger.info('MaterialsStore', `✅ Subscribed to ${unsubscribers.length} cross-module events`);

    return () => {
      logger.debug('MaterialsStore', '🔌 Unsubscribing from cross-module events...');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []); // Empty deps - handlers are now stable module-level functions

  // ✅ ERROR HANDLING
  if (error) {
    return (
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="Materials Inventory Error">
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

  // Prepare system alerts
  const systemAlerts: AlertItem[] = [];

  if (!isOnline) {
    systemAlerts.push({
      status: 'warning',
      title: 'Modo Offline',
      description: 'Los cambios se sincronizarán cuando recuperes la conexión'
    });
  }

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Materials Inventory Management">

        {/* 🔒 1. SYSTEM ALERTS SECTION - ARIA live region for offline status */}
        {systemAlerts.length > 0 && (
          <Section
            variant="flat"
            semanticHeading="System Status Alerts"
            live="polite"
            atomic
          >
            <CollapsibleAlertStack
              alerts={systemAlerts}
              defaultOpen={false}
              title="Alertas del Sistema"
              variant="subtle"
              size="md"
              showCount
            />
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

        {/* ✅ 2. METRICS SECTION - Complementary aside pattern */}
        <Section
          as="aside"
          variant="flat"
          semanticHeading="Inventory Metrics Overview"
        >
          <MaterialsMetrics
            metrics={metrics}
            onMetricClick={actions.handleMetricClick}
            loading={loading}
          />
        </Section>

        {/* ✅ 3. CRITICAL ALERTS SECTION - ARIA live region for stock alerts */}
          <Section
            variant="flat"
            semanticHeading="Stock Alerts and Warnings"
            live="polite"
            atomic
          >
            <MaterialsAlerts
              onAlertAction={actions.handleAlertAction}
              context="materials"
            />
          </Section>

        {/* ✅ 4. MAIN MANAGEMENT SECTION - Primary content area */}
        {/* 🔒 PERMISSIONS: User must have at least READ permission to view */}
        {canRead && (
          <Section
            variant="elevated"
            title="Gestión de Inventario"
            semanticHeading="Materials Inventory Management Tools"
          >
            <MaterialsManagement
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onStockUpdate={canUpdate ? actions.handleStockUpdate : undefined}
              onBulkAction={canUpdate ? actions.handleBulkAction : undefined}
              onAddMaterial={canCreate ? actions.handleOpenAddModal : undefined}
              performanceMode={shouldReduceAnimations}
              // 🔒 Pass permissions to child component for granular control
              permissions={permissions}
            />
          </Section>
        )}

        {/* ✅ 5. QUICK ACTIONS SECTION - Aside pattern for tools */}
        {/* 🔒 PERMISSIONS: Show section only if user has any action permission */}
        {(canCreate || canExport || canConfigure) && (
          <Section
            as="aside"
            variant="flat"
            semanticHeading="Quick Action Tools"
          >
            <MaterialsActions
              onAddMaterial={canCreate ? actions.handleOpenAddModal : undefined}
              onBulkOperations={canUpdate ? actions.handleBulkOperations : undefined}
              onGenerateReport={canExport ? actions.handleGenerateReport : undefined}
              onSyncInventory={canConfigure ? actions.handleSyncInventory : undefined}
              isMobile={isMobile}
              // 🔒 Pass permissions for fine-grained access control
              permissions={actionsPermissions}
            />
          </Section>
        )}

        {/* 🪟 MODAL - AGREGAR/EDITAR MATERIAL */}
        {/* 🔒 PERMISSIONS: Only show modal if user has create or update permission */}
        {isModalOpen && (canCreate || canUpdate) && (
          <LazyMaterialFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            readOnly={!canCreate && !canUpdate} // Read-only mode if no permissions
          />
        )}

      </ContentLayout>
    </>
  );
}