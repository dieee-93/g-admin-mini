/**
 * Materials Page - Inventory Management & Stock Control
 *
 * REFACTORED v6.0 - MAGIC PATTERNS DESIGN
 * Design Principles:
 * - Decorative background blobs for visual depth
 * - Gradient metric cards with top border accents (3px)
 * - Elevated content cards with modern shadows
 * - Responsive grid layouts (SimpleGrid)
 * - Clean spacing system (gap="6/8", p="6/8")
 * - No maxW restrictions (w="100%")
 * 
 * FEATURES:
 * - Real-time stock tracking (multi-location)
 * - Low stock alerts with ARIA announcements
 * - Bulk operations
 * - Offline-first support
 * - EventBus integration
 */

import { useEffect, useMemo, useCallback, useState } from 'react';
import {
  Box,
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Button,
  Alert,
  Icon,
  Badge,
  SkipLink,
  Tabs,
  Typography
} from '@/shared/ui';
import type { MaterialItem } from '@/modules/materials/types';
import {
  ArrowPathIcon,
  BellAlertIcon,
  CubeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import { AlertsTab } from './tabs/alerts';

import EventBus from '@/lib/events';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useNavigationLayout } from '@/contexts/NavigationContext';
import { useLocation } from '@/contexts/LocationContext';
import { usePermissions } from '@/hooks';
import { useDisclosure } from '@/shared/hooks';

import {
  MaterialsMetrics,
  MaterialsManagement,
  MaterialsActions,
  MaterialsAlerts,
  LazyMaterialFormModal
} from './components';

import { useMaterialsPage } from '@/modules/materials/hooks';
import { logger } from '@/lib/logging';

// ============================================================================
// METRIC CARD COMPONENT (Magic Patterns Style)
// ============================================================================
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  gradient: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: IconComponent, label, value, change, changeType, gradient, loading }) => {
  return (
    <Box
      bg="bg.surface"
      p="6"
      borderRadius="2xl"
      shadow="md"
      position="relative"
      overflow="hidden"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      {/* Top gradient border */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg={gradient}
      />

      <Stack gap="4">
        <Flex justify="space-between" align="start">
          <Box
            p="3"
            borderRadius="xl"
            bg={`${gradient.split('.')[0]}.100`}
          >
            <IconComponent className="w-6 h-6" />
          </Box>
          {change && (
            <Badge colorPalette={changeType === 'increase' ? 'green' : 'red'} size="sm">
              {change}
            </Badge>
          )}
        </Flex>
        <Stack gap="1">
          <Typography variant="body" size="sm" color="text.muted">
            {label}
          </Typography>
          <Typography variant="heading" size="2xl" fontWeight="bold">
            {loading ? '---' : value}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const eventHandlers = {
  'sales.order_placed': async (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '🛒 Sales order placed, reserving stock...', data);
  },

  'sales.completed': (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '✅ Sale completed, converting reservation to deduction...', data);
  },

  'sales.order_cancelled': async (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '♻️ Sales order cancelled, releasing stock...', data);
  },

  'products.recipe_updated': (data: Record<string, unknown>) => {
    logger.debug('MaterialsStore', '📝 Recipe updated, recalculating requirements...', data);
  },

  'production.order.created': (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '🏭 Production order created, reserving materials...', data);
  },

  'production.order.completed': (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '✅ Production completed, updating stock...', data);
  },

  'materials.procurement.po_received': async (data: Record<string, unknown>) => {
    logger.info('MaterialsStore', '📦 Purchase order received, auto-updating stock...', data);
  }
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export default function MaterialsPage() {
  console.log('[MaterialsPage] COMPONENT RENDER');

  const offlineStatus = useOfflineStatus();
  console.log('[MaterialsPage] - useOfflineStatus:', offlineStatus.isOnline);

  // ✅ PERFORMANCE: Extract only needed value to prevent re-renders from other offlineStatus changes
  const isOnline = useMemo(() => offlineStatus.isOnline, [offlineStatus.isOnline]);

  const perfMonitor = usePerformanceMonitor();
  console.log('[MaterialsPage] - usePerformanceMonitor:', perfMonitor.shouldReduceAnimations);

  const navLayout = useNavigationLayout();
  console.log('[MaterialsPage] - useNavigationLayout:', navLayout.isMobile);

  const location = useLocation();
  console.log('[MaterialsPage] - useLocation:', location.selectedLocation?.id);

  // ✅ PERFORMANCE: Extract only needed values to minimize re-renders
  const { shouldReduceAnimations } = perfMonitor;
  const { isMobile } = navLayout;
  const { selectedLocation, isMultiLocationMode } = location;

  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    canConfigure
  } = usePermissions('materials');

  const materialModal = useDisclosure();
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentItem, setCurrentItem] = useState<MaterialItem | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'alerts'>('inventory');

  const openModal = useCallback((mode: 'add' | 'edit' | 'view', item?: MaterialItem) => {
    setModalMode(mode);
    setCurrentItem(item || null);
    materialModal.onOpen();
  }, [materialModal]);

  const closeModal = useCallback(() => {
    materialModal.onClose();
    setCurrentItem(null);
  }, [materialModal]);

  const {
    materials,
    filteredMaterials,
    loading,
    error,
    pageState,
    setActiveTab,
    setFilters,
    toggleBulkMode,
    metrics,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    adjustStock,
    bulkDelete,
    abcAnalysis,
    refresh,
  } = useMaterialsPage({ openModal });

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

  const handleView = useCallback((item: MaterialItem) => {
    openModal('view', item);
  }, [openModal]);

  const handleEdit = useCallback((item: MaterialItem) => {
    openModal('edit', item);
  }, [openModal]);

  const handleDelete = useCallback(async (item: MaterialItem) => {
    if (window.confirm(`¿Eliminar "${item.name}"?`)) {
      await deleteMaterial(item.id);
    }
  }, [deleteMaterial]);

  const handleAddMaterial = useCallback(() => {
    openModal('add');
  }, [openModal]);

  // ============================================================================
  // EVENTBUS INTEGRATION
  // ============================================================================

  useEffect(() => {
    logger.debug('MaterialsStore', '📡 Subscribing to cross-module events...');

    const unsubscribers = [
      EventBus.on('sales.order_placed', eventHandlers['sales.order_placed'] as any),
      EventBus.on('sales.completed', eventHandlers['sales.completed'] as any),
      EventBus.on('sales.order_cancelled', eventHandlers['sales.order_cancelled'] as any),
      EventBus.on('products.recipe_updated', eventHandlers['products.recipe_updated'] as any),
      EventBus.on('production.order.created', eventHandlers['production.order.created'] as any),
      EventBus.on('production.order.completed', eventHandlers['production.order.completed'] as any),
      EventBus.on('materials.procurement.po_received', eventHandlers['materials.procurement.po_received'] as any)
    ];

    logger.info('MaterialsStore', `✅ Subscribed to ${unsubscribers.length} cross-module events`);

    return () => {
      logger.debug('MaterialsStore', '🔌 Unsubscribing from cross-module events...');
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // ============================================================================
  // PAGE ACTIONS (Wrapped from hook)
  // ============================================================================

  const handleMetricClick = useCallback((metricType: string) => {
    switch (metricType) {
      case 'lowStock':
        setFilters({ stockStatus: 'low' });
        setActiveTab('inventory');
        break;
      case 'critical':
        setFilters({ stockStatus: 'critical' });
        setActiveTab('inventory');
        break;
      case 'abc':
        setActiveTab('analytics');
        break;
    }
  }, [setFilters, setActiveTab]);

  const handleStockUpdate = useCallback(async (itemId: string, newStock: number) => {
    const material = materials.find(m => m.id === itemId);
    if (material) {
      await adjustStock(itemId, newStock, material.stock);
    }
  }, [materials, adjustStock]);

  const handleBulkAction = useCallback(async (action: string, itemIds: string[]) => {
    if (action === 'delete') {
      await bulkDelete(itemIds);
    }
  }, [bulkDelete]);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  if (error) {
    return (
      <Box p={{ base: "6", md: "8" }}>
        <SkipLink />
        <Alert status="error" title="Error de carga del módulo">
          {error.message}
        </Alert>
        <Box marginTop="4">
          <Button onClick={() => window.location.reload()}>
            <Icon icon={ArrowPathIcon} size="sm" />
            Recargar página
          </Button>
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden" data-testid="materials-page">
      <SkipLink />

      {/* Decorative background blobs */}
      <Box position="absolute" top="-10%" right="-5%" width="500px" height="500px" borderRadius="full" bg="blue.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" />
      <Box position="absolute" bottom="-10%" left="-5%" width="400px" height="400px" borderRadius="full" bg="purple.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" />

      <Box position="relative" zIndex="1" p={{ base: "6", md: "8" }}>
        <Stack gap="8" w="100%">

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Magic Patterns Style
              ═══════════════════════════════════════════════════════════════ */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <Flex align="center" gap="4">
              <Box
                p="4"
                borderRadius="2xl"
                bg="linear-gradient(135deg, var(--chakra-colors-blue-500) 0%, var(--chakra-colors-blue-700) 100%)"
                shadow="lg"
              >
                <CubeIcon style={{ width: '32px', height: '32px', color: 'white' }} />
              </Box>
              <Stack gap="1">
                <Typography variant="heading" size="3xl" fontWeight="bold">
                  StockLab - Inventario
                </Typography>
                <Flex align="center" gap="2">
                  <Typography variant="body" size="md" color="text.muted">
                    Control de materiales y stock
                  </Typography>
                  {!isOnline && (
                    <Badge colorPalette="orange" size="sm">Offline</Badge>
                  )}
                  {isMultiLocationMode && selectedLocation && (
                    <>
                      <Badge colorPalette="blue" size="sm">
                        📍 {selectedLocation.name}
                      </Badge>
                      <Badge variant="outline" colorPalette="green" size="sm">
                        {selectedLocation.code}
                      </Badge>
                    </>
                  )}
                </Flex>
              </Stack>
            </Flex>

            {canCreate && (
              <Button colorPalette="blue" size="lg" onClick={() => openModal('add')}>
                <Icon icon={PlusIcon} size="sm" />
                Nuevo Material
              </Button>
            )}
          </Flex>

          {/* ═══════════════════════════════════════════════════════════════
              METRICS CARDS - Gradient style (rendered by MaterialsMetrics)
              ═══════════════════════════════════════════════════════════════ */}
          <MaterialsMetrics
            metrics={metrics}
            onMetricClick={handleMetricClick}
            loading={loading}
          />

          {/* ═══════════════════════════════════════════════════════════════
              ALERTS SECTION
              ═══════════════════════════════════════════════════════════════ */}
          <MaterialsAlerts
            onAlertAction={async () => { }}
            context="materials"
          />

          {/* ═══════════════════════════════════════════════════════════════
              MAIN CONTENT - Elevated Tabs Card (Magic Patterns Style)
              ═══════════════════════════════════════════════════════════════ */}
          <Box
            position="relative"
            overflow="hidden"
            bg="bg.surface"
            p="8"
            borderRadius="2xl"
            shadow="xl"
          >
            {/* ⭐ MAGICPATTERNS SIGNATURE: 4px gradient top border for elevated content */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, var(--chakra-colors-purple-500) 0%, var(--chakra-colors-pink-500) 50%, var(--chakra-colors-purple-600) 100%)"
            />
            <Tabs.Root
              defaultValue="inventory"
              value={activeMainTab}
              onValueChange={(details) => setActiveMainTab(details.value as typeof activeMainTab)}
              lazyMount
            >
              <Tabs.List mb="6">
                <Tabs.Trigger value="inventory">
                  <Icon icon={CubeIcon} size="sm" />
                  Inventario
                </Tabs.Trigger>
                <Tabs.Trigger value="alerts">
                  <Icon icon={BellAlertIcon} size="sm" />
                  Config. Alertas
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="inventory">
                <Stack gap="6">
                  {canRead && (
                    <MaterialsManagement
                      items={filteredMaterials}
                      activeTab={pageState.activeTab}
                      onTabChange={(tab) => setActiveTab(tab as any)}
                      onStockUpdate={canUpdate ? handleStockUpdate : async () => { }}
                      onBulkAction={canUpdate ? handleBulkAction : async () => { }}
                      onAddMaterial={canCreate ? handleAddMaterial : undefined}
                      onView={canRead ? handleView : undefined}
                      onEdit={canUpdate ? handleEdit : undefined}
                      onDelete={canDelete ? handleDelete : undefined}
                      performanceMode={shouldReduceAnimations}
                    />
                  )}

                  {(canCreate || canExport || canConfigure) && (
                    <MaterialsActions
                      onAddMaterial={canCreate ? handleAddMaterial : undefined}
                      onBulkOperations={canUpdate ? toggleBulkMode : undefined}
                      onGenerateReport={canExport ? async () => { } : undefined}
                      onSyncInventory={canConfigure ? async () => refresh() : undefined}
                      isMobile={isMobile}
                      permissions={actionsPermissions}
                    />
                  )}
                </Stack>
              </Tabs.Content>

              <Tabs.Content value="alerts">
                <Stack gap="6">
                  <AlertsTab />
                </Stack>
              </Tabs.Content>

            </Tabs.Root>
          </Box>

          {/* Material Modal */}
          {materialModal.isOpen && (canCreate || canUpdate) && (
            <LazyMaterialFormModal
              isOpen={materialModal.isOpen}
              onClose={closeModal}
              mode={modalMode}
              item={currentItem}
              readOnly={!canCreate && !canUpdate}
            />
          )}

        </Stack>
      </Box>
    </Box>
  );
}
