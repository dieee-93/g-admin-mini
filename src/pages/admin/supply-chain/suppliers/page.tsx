/**
 * SUPPLIERS PAGE - Main entry point
 *
 * Standalone module for supplier management.
 * Handles CRUD operations, analytics, and performance tracking.
 *
 * @version 1.0.0
 * @see ./README.md
 */

import React from 'react';
import {
  ContentLayout,
  Alert,
  Button,
  Icon
} from '@/shared/ui';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

// Components
import { SuppliersMetrics, SuppliersManagement, SupplierFormModal } from './components';

// Hooks & Services
import { useSuppliersPage } from './hooks/useSuppliersPage';

// Types
import type { SupplierFormData } from './types/supplierTypes';

// Systems Integration
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { CapabilityGate } from '@/lib/capabilities';
import { logger } from '@/lib/logging';

export default function SuppliersPage() {
  // ============================================
  // SYSTEMS INTEGRATION
  // ============================================

  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();

  // ============================================
  // PAGE ORCHESTRATION
  // ============================================

  const pageState = useSuppliersPage();

  const {
    metrics,
    loading,
    error,
    isModalOpen,
    editingSupplier,
    allSuppliers,
    closeModal,
    createSupplier,
    updateSupplier,
    refreshData
  } = pageState;

  // ============================================
  // MODAL HANDLERS
  // ============================================

  const handleModalSubmit = async (data: SupplierFormData) => {
    try {
      if (editingSupplier) {
        // Update existing
        await updateSupplier(editingSupplier, data);
        logger.info('Suppliers', 'Supplier updated successfully');
      } else {
        // Create new
        await createSupplier(data);
        logger.info('Suppliers', 'Supplier created successfully');
      }

      // Refresh data
      await refreshData();
    } catch (err) {
      handleError(err as Error);
      throw err; // Re-throw to let form handle it
    }
  };

  // ============================================
  // ERROR HANDLING
  // ============================================

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

  // ============================================
  // CAPABILITY GATE
  // ============================================

  return (
    <CapabilityGate capability="inventory_supplier_management">
      <ContentLayout spacing="normal">
        {/* OFFLINE WARNING */}
        {!isOnline && (
          <Alert status="warning" title="Modo Offline">
            Los cambios se sincronizarán cuando recuperes la conexión
          </Alert>
        )}

        {/* METRICS */}
        <SuppliersMetrics metrics={metrics} loading={loading} />

        {/* MAIN MANAGEMENT COMPONENT */}
        <SuppliersManagement pageState={pageState} />

        {/* FORM MODAL */}
        <SupplierFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          supplier={editingSupplier ? allSuppliers.find(s => s.id === editingSupplier) : null}
        />
      </ContentLayout>
    </CapabilityGate>
  );
}
