import {
  ContentLayout, Section, Button, Alert, Icon
} from '@/shared/ui';
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

// ✅ COMPONENTES ESPECIALIZADOS
import {
  SalesMetrics,
  SalesManagement,
  SalesActions,
  SalesAlerts,
  LazySaleFormModal
} from './components';

// ✅ HOOKS ESPECIALIZADOS
import { useSalesPage } from './hooks';
import { useModalState } from '@/store/salesStore';

import { logger } from '@/lib/logging';
// ✅ MODULE CONFIGURATION
const SALES_MODULE_CONFIG = {
  capabilities: ['sells_products', 'pos_system', 'payment_processing', 'customer_management'],
  events: {
    emits: ['sales.order_placed', 'sales.payment_completed', 'sales.sale_completed', 'sales.customer_registered'],
    listens: ['materials.stock_updated', 'materials.low_stock_alert', 'kitchen.order_ready']
  },
  eventHandlers: {
    'materials.stock_updated': (data: any) => {
      // Auto-update product availability based on stock changes
      logger.info('SalesStore', '🛒 Sales: Stock updated, updating product availability...', data);
    },
    'materials.low_stock_alert': (data: any) => {
      // Auto-disable products with critical stock levels
      logger.info('SalesStore', '🚨 Sales: Low stock alert received, adjusting POS...', data);
    },
    'kitchen.order_ready': (data: any) => {
      // Real-time order status updates
      logger.info('SalesStore', '✅ Sales: Order ready notification...', data);
    }
  }
} as const;

export default function SalesPage() {
  logger.debug('SalesStore', '🔍 SalesPage Component rendering');

  // ✅ SISTEMAS INTEGRATION
  const { hasFeature } = useCapabilities();
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { isMobile } = useNavigation();

  logger.debug('SalesStore', '🔍 SalesPage Hooks initialized successfully');

  // ✅ PAGE ORCHESTRATION
  logger.debug('SalesStore', '🔍 SalesPage Calling useSalesPage...');
  const {
    metrics,
    pageState,
    actions,
    loading,
    error,
    activeTab,
    setActiveTab
  } = useSalesPage();

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


  // ✅ ERROR HANDLING
  if (error) {
    logger.error('SalesStore', '🔍 SalesPage Error detected:', error);
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

  logger.debug('SalesStore', '🔍 SalesPage Starting render...');

  return (
    <ContentLayout spacing="normal">
      {/* 🔒 1. ESTADO DE CONEXIÓN - Solo si crítico */}
      {!isOnline && (
        <Alert variant="warning" title="Modo Offline">
          Los cambios se sincronizarán cuando recuperes la conexión
        </Alert>
      )}

      {/* 📊 2. MÉTRICAS DE NEGOCIO - OBLIGATORIO PRIMERO */}
      <SalesMetrics
        metrics={metrics}
        onMetricClick={actions.handleMetricClick}
        loading={loading}
      />

      {/* 🚨 3. ALERTAS CRÍTICAS - Solo si existen */}
      <CapabilityGate capability="sells_products">
        <SalesAlerts
          onAlertAction={actions.handleAlertAction}
          context="sales"
          metrics={metrics}
        />
      </CapabilityGate>

      {/* 🎯 4. GESTIÓN PRINCIPAL CON TABS - OBLIGATORIO */}
      <Section variant="elevated" title="Gestión de Ventas">
        <SalesManagement
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOrderPlace={actions.handleOrderPlace}
          onPaymentProcess={actions.handlePaymentProcess}
          onNewSale={actions.handleNewSale}
          performanceMode={shouldReduceAnimations}
        />
      </Section>

      {/* ⚡ 5. ACCIONES RÁPIDAS - OBLIGATORIO */}
      <SalesActions
        onNewSale={actions.handleNewSale}
        onQRGeneration={actions.handleQRGeneration}
        onShowAnalytics={actions.handleShowAnalytics}
        onKitchenDisplay={actions.handleKitchenDisplay}
        isMobile={isMobile}
        hasCapability={hasFeature}
      />

      {/* 🪟 MODAL - AGREGAR/PROCESAR VENTA */}
      {isModalOpen && (
        <LazySaleFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </ContentLayout>
  );
}
