import type { ModuleManifest } from '@/lib/modules/types';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
// NOTE: DINEIN_MANDATORY import removed - requirements now auto-registered by achievements module

export const fulfillmentOnsiteManifest: ModuleManifest = {
  id: 'fulfillment-onsite',
  name: 'Fulfillment - Onsite Service',
  version: '2.0.0',

  permissionModule: 'operations', // ✅ Uses 'operations' permission  activatedBy: 'operations_table_management',


  // ✅ OPTIONAL MODULE: Only loaded when required feature is active
  depends: ['sales'],
  hooks: {
    provide: [
      'fulfillment.onsite.table_status',
      'fulfillment.onsite.table_selected',
      'fulfillment.onsite.quick_view'
      // NOTE: toolbar.actions removed - Open Shift is now in ShiftControlWidget
    ],
    consume: ['sales.order_placed']
  },

  setup: async (registry) => {
    logger.info('App', '🏢 Setting up Floor module');

    try {
      // ============================================
      // NOTE: Requirements registration removed
      // ============================================
      // Requirements are now auto-registered centrally by achievements module
      // from ALL_MANDATORY_REQUIREMENTS in constants.ts
      // This eliminates duplicate registrations and follows centralized registry pattern

      // NOTE: Open Shift validation is now handled by ShiftControlWidget
      // The OpenShiftButton component has been removed to centralize the logic

      // ============================================
      // HOOK: Operating Hours Editor
      // ============================================

      /**
       * Hook: settings.hours.tabs + settings.hours.content
       * Inject operating hours editor into HoursPage
       */
      const { OperatingHoursTabTrigger, OperatingHoursTabContent } = await import(
        './components/OperatingHoursEditor'
      );

      console.log('🔧 [fulfillment-onsite] About to register settings.hours hooks');

      registry.addAction(
        'settings.hours.tabs',
        () => <OperatingHoursTabTrigger key="operating-tab" />,
        'fulfillment-onsite',
        100 // High priority - show first
      );

      registry.addAction(
        'settings.hours.content',
        () => <OperatingHoursTabContent key="operating-content" />,
        'fulfillment-onsite',
        100
      );

      console.log('✅ [fulfillment-onsite] Operating hours hooks registered');
      console.log('📊 [fulfillment-onsite] Registry stats after registration:', registry.getStats());
      logger.debug('App', '✅ Operating hours hooks registered');

      // ============================================
      // HOOK: Settings Specialized Card
      // ============================================

      /**
       * Hook: settings.specialized.cards
       * Inject "Horarios de Operación" card into Settings page
       */
      const { SettingCard } = await import('@/shared/components');
      const { ClockIcon } = await import('@heroicons/react/24/outline');

      registry.addAction(
        'settings.specialized.cards',
        () => (
          <SettingCard
            key="operating-hours-card"
            title="Horarios de Operación"
            description="Configura horarios de apertura para servicio en el local"
            icon={ClockIcon}
            href="/admin/settings/hours"
            status="configured"
          />
        ),
        'fulfillment-onsite',
        100, // High priority
        { requiredPermission: { module: 'operations', action: 'update' } }
      );

      logger.debug('App', '✅ Settings specialized card registered');

      // ============================================
      // HOOK: Table Selector in POS Modal
      // ============================================

      /**
       * Hook: sales.pos.context_selector
       * Inject OnsiteTableSelector into SaleFormModal header
       * Allows selecting a table when creating an order
       */
      const { OnsiteTableSelector } = await import('./components/OnsiteTableSelector');

      registry.addAction(
        'sales.pos.context_selector',
        (data) => (
          <OnsiteTableSelector
            key="onsite-table-selector"
            cart={data?.cart || []}
            onContextSelect={data?.onContextSelect || (() => { })}
            initialContext={data?.initialContext}
          />
        ),
        'fulfillment-onsite',
        100, // High priority - table is main context
        { requiredPermission: { module: 'operations', action: 'read' } }
      );

      logger.debug('App', '✅ Sales POS context selector hook registered');

      // ============================================
      // HOOK: Onsite POS View (Full Context View)
      // ============================================

      /**
       * Hook: sales.pos.context_view
       * Inject OnsitePOSView as the full view for 'onsite' context
       * Replaces the default product/cart view when context is 'onsite'
       */
      const { OnsitePOSView } = await import('./components/OnsitePOSView');

      registry.addAction(
        'sales.pos.context_view',
        (data) => {
          // Only render for PHYSICAL + onsite fulfillment (Opción B: ProductType-first)
          if (data?.productType !== 'PHYSICAL' || data?.selectedFulfillment !== 'onsite') return null;

          return (
            <OnsitePOSView
              key="onsite-pos-view"
              cart={data?.cart || []}
              onAddToCart={data?.onAddToCart}
              onRemoveItem={data?.onRemoveItem}
              onUpdateQuantity={data?.onUpdateQuantity}
              onClearCart={data?.onClearCart}
              tableContext={data?.tableContext}
              onTableSelect={data?.onTableSelect}
              totals={data?.totals}
              onSendToKitchen={data?.onSendToKitchen}
              onCloseTable={data?.onCloseTable}
            />
          );
        },
        'fulfillment-onsite',
        100, // High priority
        { requiredPermission: { module: 'operations', action: 'read' } }
      );

      logger.debug('App', '✅ Sales POS context view hook registered');

      logger.info('App', '✅ Fulfillment Onsite module setup complete', {
        requirementsRegistered: 'centralized', // Now handled by achievements module
        hooksRegistered: 5, // hours tabs + hours content + settings card + POS context selector + POS context view
      });
    } catch (error) {
      logger.error('App', '❌ Fulfillment Onsite module setup failed', error);
      throw error;
    }
  },

  teardown: () => {
    // Cleanup if needed
  },

  exports: {
    FloorPlanQuickView: async () => {
      const { FloorPlanQuickView } = await import(
        '@/pages/admin/operations/fulfillment/onsite/components/FloorPlanQuickView'
      );
      return FloorPlanQuickView;
    }
  },

  metadata: {
    category: 'operations',
    description: 'Comprehensive floor management for restaurant operations including table tracking and reservations',
    tags: ['fulfillment-onsite', 'tables', 'reservations'],
    navigation: {
      route: '/admin/operations/fulfillment/onsite',
      icon: BuildingStorefrontIcon,
      color: 'cyan',
      domain: 'operations'
    }
  }
};