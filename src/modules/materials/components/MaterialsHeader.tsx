import { Box, HStack, VStack, Text, Button, Badge } from '@chakra-ui/react';
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';

interface MaterialsHeaderProps {
  onAddItem: () => void;
  onShowAnalytics?: () => void;
  itemCount?: number;
}

export const MaterialsHeader = ({ onAddItem, onShowAnalytics }: MaterialsHeaderProps) => {
  const { stats } = useMaterials();

  return (
    <Box p={6} borderBottomWidth={1} borderColor="gray.200">
      <VStack align="stretch" gap={4}>
        {/* Analytics Action Only - Title moved to ModuleHeader */}
        {onShowAnalytics && (
          <HStack justify="flex-end">
            <Button
              variant="outline"
              size="md"
              minH="44px"
              minW="44px"
              gap="2"
              onClick={onShowAnalytics}
            >
              <ChartBarIcon className="w-4 h-4" />
              Analytics
            </Button>
          </HStack>
        )}

        {/* Stats Overview */}
        <HStack gap={6}>
          <VStack align="flex-start" gap={1}>
            <Text fontSize="sm" color="gray.500">Total Items</Text>
            <Text fontSize="lg" fontWeight="semibold">{stats.totalItems}</Text>
          </VStack>

          <VStack align="flex-start" gap={1}>
            <Text fontSize="sm" color="gray.500">Valor Total</Text>
            <Text fontSize="lg" fontWeight="semibold">
              ${stats.totalValue.toLocaleString()}
            </Text>
          </VStack>

          <VStack align="flex-start" gap={1}>
            <HStack gap={2}>
              <Text fontSize="sm" color="gray.500">Stock Bajo</Text>
              {stats.lowStockCount > 0 && (
                <Badge colorPalette="orange" size="sm">
                  {stats.lowStockCount}
                </Badge>
              )}
            </HStack>
            <Text fontSize="lg" fontWeight="semibold" color="orange.600">
              {stats.lowStockCount}
            </Text>
          </VStack>

          <VStack align="flex-start" gap={1}>
            <HStack gap={2}>
              <Text fontSize="sm" color="gray.500">Stock Crítico</Text>
              {stats.criticalStockCount > 0 && (
                <Badge colorPalette="red" size="sm">
                  {stats.criticalStockCount}
                </Badge>
              )}
            </HStack>
            <Text fontSize="lg" fontWeight="semibold" color="red.600">
              {stats.criticalStockCount}
            </Text>
          </VStack>

          <VStack align="flex-start" gap={1}>
            <HStack gap={2}>
              <Text fontSize="sm" color="gray.500">Sin Stock</Text>
              {stats.outOfStockCount > 0 && (
                <Badge colorPalette="red" size="sm">
                  {stats.outOfStockCount}
                </Badge>
              )}
            </HStack>
            <Text fontSize="lg" fontWeight="semibold" color="red.700">
              {stats.outOfStockCount}
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};