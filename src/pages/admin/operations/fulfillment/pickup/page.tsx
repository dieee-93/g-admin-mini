/**
 * PICKUP ORDERS PAGE
 *
 * Main page for pickup order management with tabs:
 * - Active Orders: Orders being prepared
 * - Ready for Pickup: Orders ready for customer collection
 * - Completed: Historical completed orders
 * - Settings: Time slot configuration
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

import React from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Button,
  Icon,
  HStack,
  VStack,
  Tabs,
  Badge,
  SkipLink,
  Alert
} from '@/shared/ui';
import {
  ClockIcon,
  QrCodeIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HookPoint } from '@/lib/modules';
import { PickupQueue } from '@/modules/fulfillment/pickup/components';
import { PickupConfirmation } from '@/modules/fulfillment/pickup/components';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import { usePermissions } from '@/hooks';

export default function PickupOrdersPage() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('active');
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const { canRead, canUpdate, canConfigure } = usePermissions('fulfillment');

  // Check read permission
  if (!canRead) {
    return (
      <ContentLayout spacing="normal" mainLabel="Access Denied">
        <Section variant="elevated">
          <Alert status="warning" title="Access Denied">
            You don't have permission to view pickup orders.
          </Alert>
        </Section>
      </ContentLayout>
    );
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    notify.success({ title: 'Pickup orders refreshed' });
  };

  const handleTabChange = (tab: string) => {
    logger.debug('PickupPage', 'Tab changed', { tab });
    setActiveTab(tab);
  };

  return (
    <>
      {/* ✅ SKIP LINK */}
      <SkipLink />

      {/* ✅ MAIN CONTENT */}
      <ContentLayout spacing="normal" mainLabel="Pickup Orders Management">
        {/* ✅ HEADER */}
        <Section
          variant="flat"
          title="Pickup Orders"
          subtitle="Manage pickup orders, time slots, and customer notifications"
          semanticHeading="Pickup Orders Dashboard"
        />

        {/* ✅ HOOKPOINT: Toolbar Actions */}
        <HookPoint name="fulfillment.pickup.toolbar.actions" fallback={null} />

        {/* ✅ ACTIONS */}
        <Section variant="flat">
          <HStack gap="2">
            {canUpdate && (
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <Icon icon={ArrowPathIcon} size="sm" />
                Refresh
              </Button>
            )}

            {canUpdate && (
              <Button
                colorPalette="blue"
                size="sm"
                onClick={() => setShowConfirmation(!showConfirmation)}
              >
                <Icon icon={QrCodeIcon} size="sm" />
                {showConfirmation ? 'Hide' : 'Show'} Scanner
              </Button>
            )}
          </HStack>
        </Section>

        {/* ✅ PICKUP CONFIRMATION PANEL */}
        {showConfirmation && (
          <Section variant="elevated">
            <PickupConfirmation
              onConfirmed={(result) => {
                logger.info('PickupPage', 'Pickup confirmed', result);
                setShowConfirmation(false);
                handleRefresh();
              }}
              onCancelled={() => setShowConfirmation(false)}
            />
          </Section>
        )}

        {/* ✅ TABS */}
        <Section variant="flat">
          <Tabs.Root
            value={activeTab}
            onValueChange={(details) => handleTabChange(details.value)}
          >
            <Tabs.List>
              <Tabs.Trigger value="active">
                <Icon icon={ClockIcon} size="sm" />
                Active Orders
              </Tabs.Trigger>

              <Tabs.Trigger value="ready">
                <Icon icon={CheckCircleIcon} size="sm" />
                Ready for Pickup
              </Tabs.Trigger>

              <Tabs.Trigger value="completed">
                <Icon icon={CheckCircleIcon} size="sm" />
                Completed
              </Tabs.Trigger>

              {canConfigure && (
                <Tabs.Trigger value="settings">
                  <Icon icon={Cog6ToothIcon} size="sm" />
                  Settings
                </Tabs.Trigger>
              )}
            </Tabs.List>

            {/* TAB CONTENT */}
            <Tabs.Content value="active">
              <VStack gap="md" pt="4">
                <PickupQueue
                  key={`active-${refreshTrigger}`}
                  filters={{ status: ['pending', 'in_progress'] }}
                  showQRButton={false}
                  showNotifyButton={false}
                />
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="ready">
              <VStack gap="md" pt="4">
                <PickupQueue
                  key={`ready-${refreshTrigger}`}
                  filters={{ status: 'ready' }}
                  showQRButton={true}
                  showNotifyButton={true}
                />
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="completed">
              <VStack gap="md" pt="4">
                <PickupQueue
                  key={`completed-${refreshTrigger}`}
                  filters={{ status: 'completed' }}
                  actions={{
                    canAssign: false,
                    canComplete: false,
                    canCancel: false,
                    canRefresh: true
                  }}
                  showQRButton={false}
                  showNotifyButton={false}
                />
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="settings">
              <VStack gap="md" pt="4" align="start">
                <Section variant="elevated">
                  <VStack align="start" gap="md">
                    <Stack direction="column" gap="sm">
                      <Badge colorPalette="blue">Time Slot Configuration</Badge>
                      <Stack direction="column" gap="xs">
                        <Stack direction="row" justify="space-between">
                          <span>Slot Duration:</span>
                          <Badge>30 minutes</Badge>
                        </Stack>
                        <Stack direction="row" justify="space-between">
                          <span>Business Hours:</span>
                          <Badge>9 AM - 9 PM</Badge>
                        </Stack>
                        <Stack direction="row" justify="space-between">
                          <span>Capacity per Slot:</span>
                          <Badge>5 orders</Badge>
                        </Stack>
                        <Stack direction="row" justify="space-between">
                          <span>Booking Cutoff:</span>
                          <Badge>30 minutes</Badge>
                        </Stack>
                        <Stack direction="row" justify="space-between">
                          <span>Days Ahead:</span>
                          <Badge>7 days</Badge>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Button colorPalette="blue" size="sm">
                      <Icon icon={Cog6ToothIcon} size="sm" />
                      Edit Configuration
                    </Button>
                  </VStack>
                </Section>
              </VStack>
            </Tabs.Content>
          </Tabs.Root>
        </Section>
      </ContentLayout>
    </>
  );
}
