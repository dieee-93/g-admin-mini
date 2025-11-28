// MaterialSelector - Clean component for selecting materials with stock validation
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Stack,
  Flex,
  Text,
  Badge,
  Spinner
} from '@chakra-ui/react';
import {
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useMaterialsStore } from '@/store/materialsStore';
import { useShallow } from 'zustand/react/shallow';
import { useDebounce } from '@/shared/hooks';
import type { MaterialItem, MeasurableItem, CountableItem } from '@/modules/materials/types';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
import { CardWrapper, InputField } from '../ui';
export interface MaterialSelectorProps {
  onMaterialSelected: (material: MaterialItem) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeIds?: string[];
  filterByStock?: boolean;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  onMaterialSelected,
  placeholder = "Buscar materia prima...",
  disabled = false,
  excludeIds = [],
  filterByStock = true
}) => {
  // ✅ FIX: Use atomic selectors to prevent re-renders when modal state changes
  const items = useMaterialsStore(useShallow(state => state.items));
  const loading = useMaterialsStore(state => state.loading);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Helper functions - now using centralized StockCalculation
  const getStockStatus = useCallback((material: MaterialItem) => {
    return StockCalculation.getStockStatus(material);
  }, []);

  const getDisplayText = useCallback((material: MaterialItem): string => {
    const stock = material.stock || 0;

    if (material.type === 'MEASURABLE') {
      const measurable = material as MeasurableItem;
      return `${stock} ${measurable.unit}`;
    } else if (material.type === 'COUNTABLE') {
      const countable = material as CountableItem;
      if (countable.packaging) {
        const packages = Math.floor(stock / countable.packaging.package_size);
        const loose = stock % countable.packaging.package_size;
        let stockText = `${packages} ${countable.packaging.package_unit}s`;
        if (loose > 0) stockText += ` + ${loose} sueltas`;
        return stockText;
      } else {
        return `${stock} unidades`;
      }
    } else {
      return `${stock} porciones`;
    }
  }, []);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const searchQuery = debouncedQuery.toLowerCase();
    return items
      .filter(item => {
        if (excludeIds.includes(item.id)) return false;
        if (filterByStock && (!item.stock || item.stock <= 0)) return false;
        return item.name.toLowerCase().includes(searchQuery);
      })
      .slice(0, 8); // Limit results
  }, [debouncedQuery, items, excludeIds, filterByStock]);

  const handleSelect = useCallback((material: MaterialItem) => {
    setQuery('');
    setIsOpen(false);
    onMaterialSelected(material);
  }, [onMaterialSelected]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.trim().length > 0 && filteredMaterials.length > 0);
  }, [filteredMaterials.length]);

  return (
    <Box position="relative" w="full">
      <Box position="relative">
        <InputField
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || loading}
          pr="10"
          onFocus={() => query && setIsOpen(filteredMaterials.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />

        <Box
          position="absolute"
          right="3"
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <MagnifyingGlassIcon
              style={{
                width: '16px',
                height: '16px',
                color: 'var(--chakra-colors-gray-400)'
              }}
            />
          )}
        </Box>
      </Box>

      {/* Results Dropdown */}
      {isOpen && filteredMaterials.length > 0 && (
        <CardWrapper
          position="absolute"
          top="100%"
          left="0"
          right="0"
          zIndex="dropdown"
          mt="1"
          maxH="300px"
          overflowY="auto"
          variant="elevated"
        >
          <CardWrapper.Body p="2">
            <Stack gap="1">
              {filteredMaterials.map((material) => (
                <Flex
                  key={material.id}
                  p="3"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => handleSelect(material)}
                  align="center"
                  gap="3"
                >
                  <Box fontSize="lg">
                    {getTypeIcon(material.type)}
                  </Box>

                  <Stack gap="0" flex="1" minW="0">
                    <Text fontWeight="medium" noOfLines={1}>
                      {material.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {getDisplayText(material)}
                    </Text>
                  </Stack>

                  <Badge
                    colorPalette={getStockBadgeColor(getStockStatus(material))}
                    size="sm"
                  >
                    {StockCalculation.getStatusLabel(getStockStatus(material))}
                  </Badge>
                </Flex>
              ))}
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      )}

      {/* No Results */}
      {isOpen && debouncedQuery.trim() && filteredMaterials.length === 0 && (
        <CardWrapper
          position="absolute"
          top="100%"
          left="0"
          right="0"
          zIndex="dropdown"
          mt="1"
          variant="elevated"
        >
          <CardWrapper.Body p="4" textAlign="center">
            <Text fontSize="sm" color="gray.600">
              {filterByStock
                ? 'No se encontraron materiales con stock disponible'
                : 'No se encontraron materiales'
              }
            </Text>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </Box>
  );
};

// Helper functions for Material display
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'MEASURABLE':
      return '📏';
    case 'COUNTABLE':
      return '📦';
    case 'ELABORATED':
      return '🧪';
    default:
      return '📋';
  }
};

const getStockBadgeColor = (status: string) => {
  switch (status) {
    case 'ok':
      return 'green';
    case 'low':
      return 'yellow';
    case 'critical':
      return 'orange';
    case 'out':
      return 'red';
    default:
      return 'gray';
  }
};

export default MaterialSelector;