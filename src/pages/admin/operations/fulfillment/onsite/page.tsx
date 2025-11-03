/**
 * Floor Management Page - Table Status & Reservations
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ Aside pattern for stats
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 */

import React from 'react';
import { ContentLayout, Section, Button, SkipLink, HStack, Alert } from '@/shared/ui';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { HookPoint } from '@/lib/modules';
import { FloorStats } from './components/FloorStats';
import { FloorPlanView } from './components/FloorPlanView';
import { ReservationsList } from './components/ReservationsList';
import { notify } from '@/lib/notifications';
import { usePermissions } from '@/hooks/usePermissions';

export default function FloorManagementPage() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const { canRead, canCreate, canUpdate } = usePermissions('fulfillment');

  // Check read permission
  if (!canRead) {
    return (
      <ContentLayout spacing="normal" mainLabel="Access Denied">
        <Section variant="elevated">
          <Alert status="warning" title="Access Denied">
            You don't have permission to view fulfillment operations.
          </Alert>
        </Section>
      </ContentLayout>
    );
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    notify.success({ title: 'Data refreshed successfully' });
  };

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Floor Management and Table Status">

        {/* ✅ HEADER SECTION - Title and actions */}
        <Section
          variant="flat"
          title="Floor Management"
          subtitle="Real-time table status and restaurant operations"
          semanticHeading="Floor Management Dashboard"
        />

        {/* ✅ HOOKPOINT: Toolbar Actions - Open Shift button with validation */}
        <HookPoint
          name="fulfillment.onsite.toolbar.actions"
          fallback={null}
        />

        {/* ✅ ACTIONS SECTION - Standard actions */}
        <Section variant="flat">
          <HStack gap="2">
            {canUpdate && (
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <Icon icon={ArrowPathIcon} size="sm" />
                Refresh
              </Button>
            )}
            {canCreate && (
              <Button colorPalette="blue" size="sm">
                <Icon icon={PlusIcon} size="sm" />
                New Reservation
              </Button>
            )}
          </HStack>
        </Section>

        {/* ✅ STATS SECTION - Complementary aside pattern */}
        <Section
          as="aside"
          variant="flat"
          semanticHeading="Floor Statistics Overview"
        >
          <FloorStats refreshTrigger={refreshTrigger} />
        </Section>

        {/* ✅ FLOOR PLAN SECTION - Main content area */}
        <Section
          variant="elevated"
          title="Floor Plan"
          semanticHeading="Interactive Floor Plan View"
        >
          <FloorPlanView refreshTrigger={refreshTrigger} />
        </Section>

        {/* ✅ RESERVATIONS SECTION - Article pattern */}
        <Section
          as="article"
          variant="default"
          title="Upcoming Reservations"
          semanticHeading="Upcoming Table Reservations List"
        >
          <ReservationsList />
        </Section>

      </ContentLayout>
    </>
  );
}
