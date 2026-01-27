/**
 * Kitchen Display System Page - Real-time Order Management - v6.0 Magic Patterns
 *
 * SEMANTIC v3.0 - WCAG AA Compliant
 */

import React from 'react';
import { Box, Stack, Button, Flex, Text } from '@/shared/ui';
import { CogIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { KitchenDisplaySystem } from './components/KitchenDisplay';
import { useSalesStore } from '@/store/salesStore';
import { transformSalesToKitchenOrders } from './utils/salesTransformer';
import { logger } from '@/lib/logging';
import { usePermissions } from '@/hooks'; // 🆕 PERMISSIONS SYSTEM

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
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      {/* Decorative Background Blobs */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="500px"
        height="500px"
        bg="orange.50"
        borderRadius="full"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        width="400px"
        height="400px"
        bg="red.50"
        borderRadius="full"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />

      <Box position="relative" zIndex="1" p={{ base: "6", md: "8" }}>

      <Stack gap="8" w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
          <Flex align="center" gap="3">
            <Box
              p="3"
              bg="linear-gradient(135deg, var(--chakra-colors-orange-400), var(--chakra-colors-orange-600))"
              borderRadius="xl"
              shadow="lg"
            >
              🍳
            </Box>
            <Box>
              <Box as="h1" fontSize="2xl" fontWeight="bold">
                Kitchen Display System
              </Box>
              <Text fontSize="sm" color="text.muted">
                Real-time kitchen order management and display
              </Text>
            </Box>
          </Flex>
          {canConfigure && (
            <Button
              variant="outline"
              size="sm"
            >
              <Icon icon={CogIcon} size="sm" />
              Configuration
            </Button>
          )}
        </Flex>

        {/* Active Orders */}
        {canRead && (
          <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="xl">
            <Text fontSize="lg" fontWeight="semibold" mb="4">
              Active Kitchen Orders
            </Text>
            <KitchenDisplaySystem
              orders={kitchenOrders}
              onUpdateItemStatus={canUpdate ? handleUpdateItemStatus : undefined}
              onCompleteOrder={canUpdate ? handleCompleteOrder : undefined}
              onPriorityChange={canUpdate ? handlePriorityChange : undefined}
              showAllStations={true}
              // 🔒 Pass read-only mode for users without update permission
              readOnly={!canUpdate}
            />
          </Box>
        )}

        {/* TODO: Create KitchenConfigDrawer component */}
        {/* <KitchenConfigDrawer
          isOpen={configOpen}
          onClose={() => setConfigOpen(false)}
        /> */}
      </Stack>
      </Box>
    </Box>
  );
}
