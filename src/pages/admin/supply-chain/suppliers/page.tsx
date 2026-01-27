/**
 * Suppliers Page - Supplier Relationship Management
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
 * - Supplier CRUD operations
 * - Performance analytics
 * - Offline-first support
 * - WCAG AA Compliant
 *
 * @version 6.0.0
 */

import React from 'react';
import {
  Box,
  Flex,
  Stack,
  Text
} from '@chakra-ui/react';
import {
  Alert,
  Button,
  Badge,
  Icon,
  SkipLink
} from '@/shared/ui';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Components
import { SuppliersMetrics, SuppliersManagement, SupplierFormModal } from './components';

// Hooks & Services
import { useSuppliersPage } from './hooks/useSuppliersPage';

// Systems Integration
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';

export default function SuppliersPage() {
  // 🔍 DEBUG: Track re-renders
  const renderCount = React.useRef(0);
  renderCount.current++;


  // ============================================
  // SYSTEMS INTEGRATION
  // ============================================

  const { isOnline } = useOfflineStatus();


  // ============================================
  // PAGE ORCHESTRATION
  // ============================================

  const pageStateRaw = useSuppliersPage();


  // ⚡ PERFORMANCE TEST: Log if useMemo is working
  const pageState = React.useMemo(() => {

    return pageStateRaw;
  }, [
    pageStateRaw.suppliers,
    pageStateRaw.allSuppliers,
    pageStateRaw.metrics,
    pageStateRaw.loading,
    pageStateRaw.error,
    pageStateRaw.activeTab,
    pageStateRaw.isModalOpen,
    pageStateRaw.modalMode,
    pageStateRaw.currentSupplier,
    pageStateRaw.filters,
    pageStateRaw.sort,
    // Actions are already memoized with useCallback, stable references
    pageStateRaw.setActiveTab,
    pageStateRaw.openCreateModal,
    pageStateRaw.openEditModal,
    pageStateRaw.closeModal,
    pageStateRaw.setFilters,
    pageStateRaw.resetFilters,
    pageStateRaw.setSort,
    pageStateRaw.toggleActive,
    pageStateRaw.deleteSupplier,
    pageStateRaw.createSupplier,
    pageStateRaw.updateSupplier,
    pageStateRaw.refreshData
  ]);

  const {
    metrics,
    loading,
    error,
    isModalOpen,
    modalMode,
    currentSupplier,
    closeModal
  } = pageState;


  // ============================================
  // MODAL HANDLERS
  // ============================================
  // NOTE: Modal now handles submission internally via useSupplierForm hook
  // No need for external handleModalSubmit - removed in migration to new pattern

  // ============================================
  // ERROR HANDLING
  // ============================================

  if (error) {
    return (
      <Box p={{ base: "6", md: "8" }}>
        <SkipLink />
        <Alert status="error" title="Error de carga del módulo">
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()} mt="4">
          <Icon icon={ArrowPathIcon} size="sm" />
          Recargar página
        </Button>
      </Box>
    );
  }

  // ============================================
  // CAPABILITY GATE
  // ============================================

  return (
    <>
      <SkipLink />
      
      {/* Decorative background elements */}
      <Box position="fixed" top="-10%" right="-5%" w="500px" h="500px" borderRadius="full" bg="orange.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" zIndex="-1" />
      <Box position="fixed" bottom="-10%" left="-5%" w="400px" h="400px" borderRadius="full" bg="yellow.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" zIndex="-1" />

      <Box p={{ base: "6", md: "8" }}>
        <Stack gap="8" w="100%">

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Title + Status
              ═══════════════════════════════════════════════════════════════ */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <Flex align="center" gap="3">
              <Box bg="linear-gradient(135deg, var(--chakra-colors-orange-500) 0%, var(--chakra-colors-orange-600) 100%)" p="3" borderRadius="xl" shadow="lg">
                <Text fontSize="2xl">🤝</Text>
              </Box>
              <Box>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="orange.600">
                  Proveedores
                </Text>
                <Flex align="center" gap="2" mt="1">
                  {!isOnline && (
                    <Badge colorPalette="orange" size="sm">Modo Offline</Badge>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Flex>

          {/* Offline Warning */}
          {!isOnline && (
            <Alert status="warning" title="Modo Offline">
              Los cambios se sincronizarán cuando recuperes la conexión
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              METRICS - Rendered by SuppliersMetrics
              ═══════════════════════════════════════════════════════════════ */}
          <SuppliersMetrics metrics={metrics} loading={loading} />

          {/* ═══════════════════════════════════════════════════════════════
              MAIN MANAGEMENT
              ═══════════════════════════════════════════════════════════════ */}
          <SuppliersManagement pageState={pageState} />

          {/* FORM MODAL */}
          <SupplierFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            supplier={currentSupplier}
          />

        </Stack>
      </Box>
    </Box>
  );
}
