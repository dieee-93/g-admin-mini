import { Box, HStack, VStack, Text, Button, Badge } from '@chakra-ui/react';
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useInventory } from '@/hooks/useZustandStores';

interface MaterialsHeaderProps {
  onAddItem: () => void;
  onShowAnalytics: () => void;
}

export const MaterialsHeader = ({ onAddItem, onShowAnalytics }: MaterialsHeaderProps) => {
  const { stats } = useInventory();

  return (
    <Box p={6} borderBottomWidth={1} borderColor="gray.200">
      <VStack align="stretch" gap={4}>
        {/* Title and Actions */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" gap={1}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Gestión de Materiales
            </Text>
            <Text fontSize="md" color="gray.600">
              Controla el inventario de materias primas y productos
            </Text>
          </VStack>

          <HStack gap={3}>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowAnalytics}
            >
              <ChartBarIcon className="w-4 h-4" />
              Analytics
            </Button>
            
            <Button
              colorPalette="blue"
              onClick={onAddItem}
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo Material
            </Button>
          </HStack>
        </HStack>

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