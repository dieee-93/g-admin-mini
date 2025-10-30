/**
 * SUPPLIER ORDERS PAGE - Main entry point
 * Purchase orders from suppliers to restock materials
 */

import React from 'react';
import { ContentLayout, Alert } from '@/shared/ui';
import { SupplierOrdersMetrics, SupplierOrdersManagement, SupplierOrderFormModal } from './components';
import { useSupplierOrdersPage } from './hooks/useSupplierOrdersPage';
import { useErrorHandler } from '@/lib/error-handling';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';
import { CapabilityGate } from '@/lib/capabilities';

export default function SupplierOrdersPage() {
  const { handleError } = useErrorHandler();
  const { isOnline } = useOfflineStatus();
  const pageState = useSupplierOrdersPage();

  const {
    metrics,
    loading,
    error,
    isCreateModalOpen,
    closeModals,
    createOrder
  } = pageState;

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert status="error" title="Error de carga">
          {error}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <CapabilityGate capability="inventory_supplier_management">
      <ContentLayout spacing="normal">
        {!isOnline && (
          <Alert status="warning" title="Modo Offline">
            Los cambios se sincronizarán cuando recuperes la conexión
          </Alert>
        )}

        <SupplierOrdersMetrics metrics={metrics} loading={loading} />
        <SupplierOrdersManagement pageState={pageState} />

        <SupplierOrderFormModal
          isOpen={isCreateModalOpen}
          onClose={closeModals}
        />
      </ContentLayout>
    </CapabilityGate>
  );
}
