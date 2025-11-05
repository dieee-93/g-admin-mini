/**
 * Supplier Orders Page - Purchase Orders Management
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ ARIA live region for offline status
 * ✅ Aside pattern for metrics
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 *
 * FEATURES:
 * - Purchase order creation and tracking
 * - Material restocking workflow
 * - Offline-first support
 */

import React from 'react';
import { ContentLayout, Section, Alert, SkipLink } from '@/shared/ui';
import { SupplierOrdersMetrics, SupplierOrdersManagement, SupplierOrderFormModal } from './components';
import { useSupplierOrdersPage } from './hooks/useSupplierOrdersPage';
import { useOfflineStatus } from '@/lib/offline/useOfflineStatus';

export default function SupplierOrdersPage() {
  const { isOnline } = useOfflineStatus();
  const pageState = useSupplierOrdersPage();

  const {
    metrics,
    loading,
    error,
    isCreateModalOpen,
    closeModals
  } = pageState;

  if (error) {
    return (
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="Supplier Orders Error">
          <Alert status="error" title="Error de carga">
            {error}
          </Alert>
        </ContentLayout>
      </>
    );
  }

  return (
      <>
        {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
        <SkipLink />

        {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
        <ContentLayout spacing="normal" mainLabel="Supplier Purchase Orders">

          {/* ✅ OFFLINE WARNING SECTION - ARIA live region */}
          {!isOnline && (
            <Section
              variant="flat"
              semanticHeading="System Status Alert"
              live="polite"
              atomic
            >
              <Alert status="warning" title="Modo Offline">
                Los cambios se sincronizarán cuando recuperes la conexión
              </Alert>
            </Section>
          )}

          {/* ✅ METRICS SECTION - Complementary aside pattern */}
          <Section
            as="aside"
            variant="flat"
            semanticHeading="Purchase Order Metrics Overview"
          >
            <SupplierOrdersMetrics metrics={metrics} loading={loading} />
          </Section>

          {/* ✅ MAIN MANAGEMENT SECTION - Primary content area */}
          <Section
            variant="elevated"
            semanticHeading="Purchase Order Management Tools"
          >
            <SupplierOrdersManagement pageState={pageState} />
          </Section>

          {/* FORM MODAL */}
          <SupplierOrderFormModal
            isOpen={isCreateModalOpen}
            onClose={closeModals}
          />

        </ContentLayout>
      </>
  );
}
