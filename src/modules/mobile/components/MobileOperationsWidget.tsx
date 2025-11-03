/**
 * Mobile Operations Widget - Dashboard Widget
 *
 * Shows active routes, driver locations, and mobile inventory status
 */

import { Box, Heading, Text, Stack, Badge, HStack, VStack } from '@/shared/ui';
import { TruckIcon, MapPinIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getTodaysActiveRoutes, getActiveDriversWithLocations } from '../services/mobileService';
import type { MobileRoute } from '../types';

export function MobileOperationsWidget() {
  const [routes, setRoutes] = useState<MobileRoute[]>([]);
  const [activeDriversCount, setActiveDriversCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);

    const { data: routesData } = await getTodaysActiveRoutes();
    const { data: driversData } = await getActiveDriversWithLocations();

    setRoutes(routesData);
    setActiveDriversCount(driversData.length);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <Box borderWidth="1px" borderRadius="lg" p={4}>
        <Heading size="md" mb={2}>
          Mobile Operations
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Loading...
        </Text>
      </Box>
    );
  }

  const activeRoutesCount = routes.filter((r) => r.status === 'in_progress').length;
  const plannedRoutesCount = routes.filter((r) => r.status === 'planned').length;
  const completedRoutesCount = routes.filter((r) => r.status === 'completed').length;

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
      <HStack justify="space-between" mb={4}>
        <HStack gap={2}>
          <TruckIcon width={20} height={20} />
          <Heading size="md">Mobile Operations</Heading>
        </HStack>
        <Badge colorScheme={activeRoutesCount > 0 ? 'green' : 'gray'}>
          {activeRoutesCount} Active
        </Badge>
      </HStack>

      <VStack align="stretch" gap={3}>
        {/* Active Drivers */}
        <Box>
          <HStack justify="space-between">
            <HStack gap={2}>
              <MapPinIcon width={16} height={16} />
              <Text fontSize="sm" fontWeight="medium">
                Active Drivers
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold">
              {activeDriversCount}
            </Text>
          </HStack>
        </Box>

        {/* Routes Status */}
        <Stack gap={2}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              In Progress
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
              {activeRoutesCount}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              Planned
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
              {plannedRoutesCount}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              Completed Today
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color="green.600">
              {completedRoutesCount}
            </Text>
          </HStack>
        </Stack>

        {/* Quick Actions */}
        {activeRoutesCount === 0 && plannedRoutesCount === 0 && (
          <Box mt={2} p={3} bg="gray.50" borderRadius="md">
            <HStack gap={2}>
              <CubeIcon width={16} height={16} />
              <Text fontSize="sm" color="gray.600">
                No active routes today
              </Text>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
