/**
 * Suppliers Page - Supplier Relationship Management
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
 * - Supplier CRUD operations
 * - Performance analytics
 * - Offline-first support
 *
 * @version 1.0.0
 * @see ./README.md
 */

import React from 'react';
import {
  ContentLayout,
  Section,
  Alert,
  Button,
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
  // ============================================
  // SYSTEMS INTEGRATION
  // ============================================

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
      <>
        <SkipLink />
        <ContentLayout spacing="normal" mainLabel="Supplier Management Error">
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

  // ============================================
  // CAPABILITY GATE
  // ============================================

  return (
      <>
        {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
        <SkipLink />

        {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
        <ContentLayout spacing="normal" mainLabel="Supplier Relationship Management">

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
            semanticHeading="Supplier Metrics Overview"
          >
            <SuppliersMetrics metrics={metrics} loading={loading} />
          </Section>

          {/* ✅ MAIN MANAGEMENT SECTION - Primary content area */}
          <Section
            variant="elevated"
            semanticHeading="Supplier Management Tools"
          >
            <SuppliersManagement pageState={pageState} />
          </Section>

          {/* FORM MODAL - Now handles submission internally */}
          <SupplierFormModal
            isOpen={isModalOpen}
            onClose={closeModal}
            supplier={editingSupplier ? allSuppliers.find(s => s.id === editingSupplier) : null}
          />

        </ContentLayout>
      </>
  );
}
