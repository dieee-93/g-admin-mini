/**
 * ASSETS PAGE - v6.0 Magic Patterns
 * Main page for asset management
 *
 * Follows G-Admin architecture patterns:
 * - Magic Patterns layout with decorative blobs
 * - Gradient header with icon
 * - Shared UI components
 * - Zustand store for state
 * - EventBus integration
 */

import { Box, Stack, Flex, Text } from '@/shared/ui';
import { AssetsMetrics } from './components/AssetsMetrics';
import { AssetsManagement } from './components/AssetsManagement';
import { useAssetsPage } from './hooks';

export default function AssetsPage() {
  const { metrics, loading } = useAssetsPage();

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      {/* Decorative Background Blobs */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="500px"
        height="500px"
        bg="cyan.50"
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
        bg="blue.50"
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
              bg="linear-gradient(135deg, var(--chakra-colors-cyan-400), var(--chakra-colors-cyan-600))"
              borderRadius="xl"
              shadow="lg"
            >
              🏢
            </Box>
            <Box>
              <Box as="h1" fontSize="2xl" fontWeight="bold">
                Gestión de Assets
              </Box>
              <Text fontSize="sm" color="text.muted">
                Administra tus activos físicos, equipamiento e inventario de alquiler
              </Text>
            </Box>
          </Flex>
        </Flex>

        {/* Metrics */}
        <AssetsMetrics metrics={metrics} isLoading={loading} />

        {/* Main Management */}
        <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="xl">
          <AssetsManagement />
        </Box>
      </Stack>
      </Box>
    </Box>
  );
}
