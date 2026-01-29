/**
 * MaterialSelector v2.0 - Reactive Material Picker
 * 
 * FEATURES:
 * - ✅ Type-aware: Shows appropriate fields for COUNTABLE vs MEASURABLE
 * - ✅ Search with debounce
 * - ✅ Stock validation
 * - ✅ Clean architecture: Receives items as props (no direct store access)
 * 
 * USAGE:
 * ```tsx
 * <MaterialSelector
 *   items={materials}
 *   onSelect={(material, quantity, unit) => {...}}
 *   selectedMaterialIds={[...]}
 * />
 * ```
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Stack,
  Flex,
  Text,
  Badge,
  Spinner,
  Input
} from '@/shared/ui';
import {
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '@/shared/hooks';
import type { MaterialItem, MeasurableItem, CountableItem } from '@/modules/materials/types';
import { StockCalculation } from '@/modules/materials/services/stockCalculation';
import { CardWrapper } from '@/shared/ui';

// ============================================================================
// TYPES
// ============================================================================

export interface MaterialSelectorProps {
  /**
   * Array of materials to search from
   * NOTE: Materials should come from useMaterials hook, not directly from store
   */
  items: MaterialItem[];
  
  /**
   * Callback when a material is selected with quantity and unit
   */
  onSelect: (material: MaterialItem, quantity: number, unit: string) => void;
  
  /**
   * IDs of materials already selected (to exclude from results)
   */
  selectedMaterialIds?: string[];
  
  /**
   * Only show materials with stock > 0
   */
  filterByStock?: boolean;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Loading state (external)
   */
  loading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * MaterialSelector v2.0 - Type-aware material picker with search and validation
 * 
 * @component
 * @description
 * Searchable material selector that adapts UI based on material type:
 * - COUNTABLE: Shows unit/units fields
 * - MEASURABLE: Shows kg/L/g/ml fields
 * - ELABORATED: Shows portions field
 * 
 * Features:
 * - Debounced search (300ms)
 * - Stock validation
 * - Prevents selection of already-selected materials
 * - Two-step flow: Search → Select → Configure → Confirm
 * 
 * @example
 * ```tsx
 * <MaterialSelector
 *   items={materials}
 *   onSelect={(material, quantity, unit) => {
 *     console.log('Selected:', material.name, quantity, unit);
 *   }}
 *   selectedMaterialIds={['id1', 'id2']}
 *   filterByStock={true}
 * />
 * ```
 * 
 * @param {MaterialSelectorProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  items,
  onSelect,
  selectedMaterialIds = [],
  filterByStock = true,
  placeholder = "Buscar materia prima...",
  disabled = false,
  loading = false
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // For quantity/unit input after selecting a material
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('');

  const debouncedQuery = useDebounce(query, 500); // Increased from 300ms
  
  console.log('[MaterialSelector] State:', {
    query,
    debouncedQuery,
    isOpen,
    itemsReceived: items?.length || 0,
    loading
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Get stock status for badge
   */
  const getStockStatus = useCallback((material: MaterialItem) => {
    return StockCalculation.getStockStatus(material);
  }, []);

  /**
   * Get display text for stock
   */
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

  /**
   * Get available units for selected material
   */
  const getAvailableUnits = useCallback((material: MaterialItem): string[] => {
    if (material.type === 'MEASURABLE') {
      const measurable = material as MeasurableItem;
      // Return units based on base unit
      if (measurable.unit === 'kg') return ['kg', 'g'];
      if (measurable.unit === 'l') return ['l', 'ml'];
      if (measurable.unit === 'g') return ['g', 'kg'];
      if (measurable.unit === 'ml') return ['ml', 'l'];
      return [measurable.unit];
    } else if (material.type === 'COUNTABLE') {
      return ['unit', 'piece', 'unidad'];
    }
    return ['portion', 'porción'];
  }, []);

  /**
   * Filtered materials based on search query
   */
  const filteredMaterials = useMemo(() => {
    console.log('[MaterialSelector] Filtering:', {
      debouncedQuery,
      itemsCount: items?.length || 0,
      filterByStock,
      selectedMaterialIds
    });
    
    if (!debouncedQuery.trim()) {
      console.log('[MaterialSelector] Empty query, returning []');
      return [];
    }

    const searchQuery = debouncedQuery.toLowerCase();
    const filtered = items
      .filter(item => {
        // Exclude already selected
        if (selectedMaterialIds.includes(item.id)) return false;
        
        // Filter by stock if enabled
        if (filterByStock && (!item.stock || item.stock <= 0)) return false;
        
        // Search by name
        return item.name.toLowerCase().includes(searchQuery);
      })
      .slice(0, 8); // Limit results
    
    console.log('[MaterialSelector] Filtered results:', {
      count: filtered.length,
      names: filtered.map(m => m.name)
    });
    
    return filtered;
  }, [debouncedQuery, items, selectedMaterialIds, filterByStock]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle material selection from search results
   */
  const handleMaterialClick = useCallback((material: MaterialItem) => {
    setSelectedMaterial(material);
    setQuery('');
    setIsOpen(false);
    
    // Pre-fill unit with material's default unit
    const units = getAvailableUnits(material);
    setUnit(units[0]);
    setQuantity(1);
  }, [getAvailableUnits]);

  /**
   * Handle input change (search)
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('[MaterialSelector] Input change:', value);
    setQuery(value);
    setIsOpen(value.trim().length > 0);
    
    // Show searching indicator while waiting for debounce
    if (value.trim().length > 0) {
      setIsSearching(true);
    }
  }, []);

  // Reset searching state when debounced query updates
  React.useEffect(() => {
    setIsSearching(false);
  }, [debouncedQuery]);

  /**
   * Handle final selection confirmation
   */
  const handleConfirm = useCallback(() => {
    if (!selectedMaterial || !quantity || !unit) return;
    
    onSelect(selectedMaterial, quantity, unit);
    
    // Reset
    setSelectedMaterial(null);
    setQuantity(1);
    setUnit('');
  }, [selectedMaterial, quantity, unit, onSelect]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    setSelectedMaterial(null);
    setQuantity(1);
    setUnit('');
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  // If a material is selected, show quantity/unit input
  if (selectedMaterial) {
    const units = getAvailableUnits(selectedMaterial);
    const isMeasurable = selectedMaterial.type === 'MEASURABLE';
    
    return (
      <CardWrapper variant="outlined">
        <CardWrapper.Body p="4">
          <Stack gap="3">
            {/* Selected Material Info */}
            <Flex align="center" gap="2" justify="space-between">
              <Box>
                <Text fontWeight="medium">{selectedMaterial.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {getDisplayText(selectedMaterial)}
                </Text>
              </Box>
              <Badge
                colorPalette={getStockBadgeColor(getStockStatus(selectedMaterial))}
                size="sm"
              >
                {StockCalculation.getStatusLabel(getStockStatus(selectedMaterial))}
              </Badge>
            </Flex>

            {/* Quantity Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">
                {isMeasurable ? 'Cantidad' : 'Unidades'}
              </Text>
              <Input
                type="number"
                min="0"
                step={isMeasurable ? "0.01" : "1"}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                placeholder={isMeasurable ? "Ej: 2.5" : "Ej: 10"}
              />
            </Box>

            {/* Unit Selector */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Unidad de medida
              </Text>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--chakra-colors-gray-300)',
                  fontSize: '14px'
                }}
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Box>

            {/* Action Buttons */}
            <Flex gap="2" justify="flex-end">
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--chakra-colors-gray-300)',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!quantity || !unit}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--chakra-colors-blue-500)',
                  color: 'white',
                  cursor: quantity && unit ? 'pointer' : 'not-allowed',
                  opacity: quantity && unit ? 1 : 0.5
                }}
              >
                Confirmar
              </button>
            </Flex>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  // Otherwise, show search input
  return (
    <Box position="relative" w="full">
      <Box position="relative">
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || loading}
          pr="10"
          onFocus={() => query && setIsOpen(filteredMaterials.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          data-testid="material-selector-search"
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
      {isOpen && (
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
            {/* Searching State */}
            {isSearching ? (
              <Flex align="center" justify="center" gap="2" p="4">
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.600">
                  Buscando materiales...
                </Text>
              </Flex>
            ) : filteredMaterials.length > 0 ? (
              /* Results List */
              <Stack gap="1">
                {filteredMaterials.map((material) => (
                  <Flex
                    key={material.id}
                    p="3"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => handleMaterialClick(material)}
                    align="center"
                    gap="3"
                    data-testid={`material-option-${material.id}`}
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
            ) : (
              /* No Results */
              <Box p="4" textAlign="center">
                <Text fontSize="sm" color="gray.600">
                  {filterByStock
                    ? 'No se encontraron materiales con stock disponible'
                    : 'No se encontraron materiales'
                  }
                </Text>
              </Box>
            )}
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </Box>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
