/**
 * Kitchen Display System Page - Real-time Order Management
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ ARIA live region for order updates
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 */

import React from 'react';
import { ContentLayout, Section, Button, SkipLink } from '@/shared/ui';
import { CogIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { KitchenDisplaySystem } from './components/KitchenDisplay';
import { useSalesStore } from '@/store/salesStore';
import { transformSalesToKitchenOrders } from './utils/salesTransformer';
import { logger } from '@/lib/logging';
import { usePermissions } from '@/hooks/usePermissions'; // 🆕 PERMISSIONS SYSTEM

export default function KitchenPage() {
  // 🔒 PERMISSIONS SYSTEM - Check user permissions for production module
  const {
    canRead,
    canUpdate,
    canConfigure
  } = usePermissions('production');

  // Configuration state - reserved for future use
  // const [configOpen, setConfigOpen] = React.useState(false);

  // Get sales from store
  const sales = useSalesStore((state) => state.sales);

  // Transform sales to kitchen orders
  const kitchenOrders = React.useMemo(() => {
    logger.debug('Page', 'Raw sales from store:', sales);
    const transformed = transformSalesToKitchenOrders(sales);
    logger.debug('Page', 'Transformed kitchen orders:', transformed);
    return transformed;
  }, [sales]);

  // Handlers for KDS
  const handleUpdateItemStatus = (orderId: string, itemId: string, status: string) => {
    logger.debug('Page', 'Update item status:', { orderId, itemId, status });
    // TODO: Implement update logic via EventBus
    // EventBus.emit('kitchen.item.status.updated', { orderId, itemId, status });
  };

  const handleCompleteOrder = (orderId: string) => {
    logger.info('Page', 'Complete order:', orderId);
    // TODO: Implement complete logic via EventBus
    // EventBus.emit('kitchen.order.completed', { orderId });
  };

  const handlePriorityChange = (orderId: string, priority: number) => {
    logger.debug('Page', 'Priority change:', { orderId, priority });
    // TODO: Implement priority change via EventBus
    // EventBus.emit('kitchen.order.priority.changed', { orderId, priority });
  };

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Kitchen Display System">

        {/* ✅ HEADER SECTION - Title and actions */}
        {/* 🔒 PERMISSIONS: Show configuration only for users with configure permission */}
        <Section
          variant="flat"
          title="Kitchen Display System"
          subtitle="Real-time kitchen order management and display"
          semanticHeading="Kitchen Display System Dashboard"
          actions={
            canConfigure && (
              <Button
                variant="outline"
                onClick={() => setConfigOpen(true)}
                size="sm"
              >
                <Icon icon={CogIcon} size="sm" />
                Configuration
              </Button>
            )
          }
        />

        {/* ✅ ACTIVE ORDERS SECTION - ARIA live region for real-time updates */}
        {/* 🔒 PERMISSIONS: User must have at least READ permission to view */}
        {canRead && (
          <Section
            variant="elevated"
            title="Active Orders"
            semanticHeading="Active Kitchen Orders Display"
            live="polite"
            relevant="additions removals"
          >
            <KitchenDisplaySystem
              orders={kitchenOrders}
              onUpdateItemStatus={canUpdate ? handleUpdateItemStatus : undefined}
              onCompleteOrder={canUpdate ? handleCompleteOrder : undefined}
              onPriorityChange={canUpdate ? handlePriorityChange : undefined}
              showAllStations={true}
              // 🔒 Pass read-only mode for users without update permission
              readOnly={!canUpdate}
            />
          </Section>
        )}

        {/* TODO: Create KitchenConfigDrawer component */}
        {/* <KitchenConfigDrawer
          isOpen={configOpen}
          onClose={() => setConfigOpen(false)}
        /> */}

      </ContentLayout>
    </>
  );
}
