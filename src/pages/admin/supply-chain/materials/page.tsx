import {
  ContentLayout, Section, Button, Alert, Icon, CollapsibleAlertStack, type AlertItem
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
  MaterialsMetrics,
  MaterialsManagement,
  MaterialsActions,
  MaterialsAlerts,
  LazyMaterialFormModal
} from './components';

// ✅ HOOKS ESPECIALIZADOS
import { useMaterialsPage } from './hooks';
import { useMaterials } from '@/store/materialsStore';

import { logger } from '@/lib/logging';
// ✅ MODULE CONFIGURATION
const MATERIALS_MODULE_CONFIG = {
  capabilities: ['inventory_tracking', 'supplier_management', 'purchase_orders'],
  events: {
    emits: ['materials.stock_updated', 'materials.low_stock_alert', 'materials.material_created', 'materials.purchase_order_created'],
    listens: ['sales.completed', 'products.recipe_updated', 'kitchen.item_consumed']
  },
  eventHandlers: {
    'sales.completed': (data: any) => {
      // Auto-reduce stock based on sale
      logger.info('MaterialsStore', '🛒 Materials: Sale completed, updating stock...', data);
    },
    'products.recipe_updated': (data: any) => {
      // Recalculate material requirements
      logger.debug('MaterialsStore', '📝 Materials: Recipe updated, recalculating requirements...', data);
    },
    'kitchen.item_consumed': (data: any) => {
      // Real-time stock depletion
      logger.info('MaterialsStore', '🍳 Materials: Kitchen consumption recorded...', data);
    }
  }
} as const;

export default function MaterialsPage() {
  // ✅ SISTEMAS INTEGRATION
  const { hasFeature } = useCapabilities();
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const { shouldReduceAnimations } = usePerformanceMonitor();
  const { isMobile } = useNavigation();

  // ✅ PAGE ORCHESTRATION
  const {
    metrics,
    pageState,
    actions,
    loading,
    error,
    activeTab,
    setActiveTab
  } = useMaterialsPage();

  // ✅ MODAL STATE
  const { isModalOpen, closeModal } = useMaterials();


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
    <ContentLayout spacing="normal">
      {/* 🔒 1. ALERTAS DEL SISTEMA - Solo si existen */}
      {systemAlerts.length > 0 && (
        <CollapsibleAlertStack
          alerts={systemAlerts}
          defaultOpen={false}
          title="Alertas del Sistema"
          variant="subtle"
          size="md"
          showCount
        />
      )}

      {/* 📊 2. MÉTRICAS DE NEGOCIO - OBLIGATORIO PRIMERO */}
      <MaterialsMetrics
        metrics={metrics}
        onMetricClick={actions.handleMetricClick}
        loading={loading}
      />

      {/* 🚨 3. ALERTAS CRÍTICAS - Solo si existen */}
      <CapabilityGate capability="inventory_tracking">
        <MaterialsAlerts
          onAlertAction={actions.handleAlertAction}
          context="materials"
        />
      </CapabilityGate>

      {/* 🎯 4. GESTIÓN PRINCIPAL CON TABS - OBLIGATORIO */}
      <Section variant="elevated" title="Gestión de Inventario">
        <MaterialsManagement
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onStockUpdate={actions.handleStockUpdate}
          onBulkAction={actions.handleBulkAction}
          onAddMaterial={actions.handleOpenAddModal}
          performanceMode={shouldReduceAnimations}
        />
      </Section>

      {/* ⚡ 5. ACCIONES RÁPIDAS - OBLIGATORIO */}
      <MaterialsActions
        onAddMaterial={actions.handleOpenAddModal}
        onBulkOperations={actions.handleBulkOperations}
        onGenerateReport={actions.handleGenerateReport}
        onSyncInventory={actions.handleSyncInventory}
        isMobile={isMobile}
        hasCapability={hasFeature}
      />

      {/* 🪟 MODAL - AGREGAR/EDITAR MATERIAL */}
      {isModalOpen && (
        <LazyMaterialFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </ContentLayout>
  );
}