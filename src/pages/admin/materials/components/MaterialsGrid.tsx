import React from 'react';
import {
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Button,
  Box,
  Alert
} from '@chakra-ui/react';
import { PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/solid';
import { CubeIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';
import { StockCalculations } from '../utils/stockCalculations';
import type { MaterialItem } from '../types';
import { isMeasurable } from '../types';

interface MaterialsGridProps {
  onEdit: (item: MaterialItem) => void;
  onView: (item: MaterialItem) => void;
  onDelete: (item: MaterialItem) => void;
}

// 🎯 Using centralized utilities for all calculations

export const MaterialsGrid: React.FC<MaterialsGridProps> = ({ onEdit, onView, onDelete }) => {
  // 🎯 Use the main hook directly for better reactivity
  const { getFilteredItems, loading } = useMaterials();
  const items = getFilteredItems();

  // 🚀 Calculate status for each item (removed memo for better reactivity)
  const itemsWithStatus = items.map(item => ({
    item,
    status: StockCalculations.getStockStatus(item),
    displayUnit: StockCalculations.getDisplayUnit(item),
    minStock: StockCalculations.getMinStock(item),
    totalValue: StockCalculations.getTotalValue(item)
  }));

  if (loading) {
    return (
      <Box p={6}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {Array.from({ length: 6 }, (_, i) => (
            <Box key={i} p={4} borderRadius="lg" bg="gray.50">
              <VStack gap={3}>
                <Box bg="gray.200" h="4" w="full" borderRadius="lg" />
                <Box bg="gray.200" h="3" w="20" borderRadius="lg" />
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (itemsWithStatus.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <VStack gap={4}>
          <CubeIcon className="w-12 h-12 text-gray-400" />
          <VStack gap={2}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.600">No se encontraron materiales</Text>
            <Text fontSize="sm" color="gray.500">Intenta ajustar los filtros o agregar nuevos materiales</Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={{ base: 2, md: 4 }}>
        {itemsWithStatus.map(({ item, status, displayUnit, minStock, totalValue }) => {
          return (
            <Box
              key={item.id}
              p={{ base: 3, md: 4 }}
              borderRadius="lg"
              bg="white"
              boxShadow="sm"
              tabIndex={0}
              role="article"
              aria-label={`${item.name} - ${isMeasurable(item) ? item.category : item.type.toLowerCase()}`}
              _focus={{ boxShadow: '0 0 0 4px rgba(14,165,255,0.12)', outline: 'none' }}
            >
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between" align="flex-start">
                  <VStack align="flex-start" gap={1} flex={1}>
                    <Text fontWeight="semibold" fontSize={{ base: 'md', md: 'lg' }} color="gray.800">{item.name}</Text>
                    <Text fontSize="sm" color="gray.500" textTransform="capitalize">{isMeasurable(item) ? item.category : item.type.toLowerCase()}</Text>
                  </VStack>

                  <Badge bg={StockCalculations.getStatusColor(status)} color={status === 'low' || status === 'critical' ? 'gray.800' : 'white'} px={2} py={1} borderRadius="sm" fontSize="xs">
                    {StockCalculations.getStatusLabel(status)}
                  </Badge>
                </HStack>

                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Stock Actual:</Text>
                    <Text fontSize="sm" fontWeight="semibold" color={status === 'ok' ? 'green.600' : 'red.600'}>{item.stock} {displayUnit}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Stock Mínimo:</Text>
                    <Text fontSize="sm">{minStock} {displayUnit}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Valor Total:</Text>
                    <Text fontSize="sm" fontWeight="semibold">${totalValue.toFixed(2)}</Text>
                  </HStack>
                </VStack>

                {(() => {
                  const loc = (item as unknown as { location?: string }).location;
                  return loc ? (<HStack><Text fontSize="xs" color="gray.500">📍 {loc}</Text></HStack>) : null;
                })()}

                {(status === 'critical' || status === 'out') && (
                  <Alert.Root status="error" size="sm">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title fontSize="xs">{status === 'out' ? 'Sin stock disponible' : 'Stock crítico'}</Alert.Title>
                    </Alert.Content>
                  </Alert.Root>
                )}

                <HStack gap={2} pt={2} borderTopWidth={1} borderColor="gray.100">
                  <Button size="xs" variant="outline" onClick={() => onView(item)} flex={1} aria-label={`Ver ${item.name}`} _focus={{ boxShadow: '0 0 0 4px rgba(14,165,255,0.12)' }}>
                    <EyeIcon className="w-3 h-3" />
                    Ver
                  </Button>

                  <Button size="xs" variant="outline" onClick={() => onEdit(item)} flex={1} aria-label={`Editar ${item.name}`} _focus={{ boxShadow: '0 0 0 4px rgba(14,165,255,0.12)' }}>
                    <PencilIcon className="w-3 h-3" />
                    Editar
                  </Button>

                  <IconButton size="xs" variant="outline" colorScheme="red" onClick={() => onDelete(item)} aria-label={`Eliminar ${item.name}`} _focus={{ boxShadow: '0 0 0 4px rgba(239,68,68,0.12)' }}>
                    <TrashIcon className="w-3 h-3" />
                  </IconButton>
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default MaterialsGrid;