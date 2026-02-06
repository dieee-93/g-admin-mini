/**
 * MaterialSelector v5.1 - Focus Fix Implementation
 * 
 * CHANGES v5.1:
 * - ⌨️ FIXED: Added autoFocus={false} to Popover.Content to prevent stealing focus on open
 * - 🛡️ SAFETY: Added restoreFocus={false} to prevent jumping around
 * - 🧠 LOGIC: Kept onOpenAutoFocus preventDefault as backup
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Stack,
  Flex,
  Text,
  Badge,
  Spinner,
  Input,
  Popover
} from '@/shared/ui';
import {
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '@/shared/hooks';
import type { MaterialItem, MeasurableItem, CountableItem } from '@/pages/admin/supply-chain/materials/types/materialTypes';
import { StockCalculation } from '@/modules/materials/services/stockCalculation';
import { CardWrapper } from '@/shared/ui';

// ============================================================================
// TYPES
// ============================================================================

export interface MaterialSelectorProps {
  items: MaterialItem[];
  onSelect: (material: MaterialItem) => void;
  selectedMaterialIds?: string[];
  filterByStock?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  initialValue?: string;
  'aria-label'?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  items,
  onSelect,
  selectedMaterialIds = [],
  filterByStock = true,
  placeholder = "Buscar materia prima...",
  disabled = false,
  loading = false,
  autoFocus = false,
  initialValue = '',
  'aria-label': ariaLabel
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  // Refs for focus management
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Sync initialValue
  useEffect(() => {
    if (initialValue && query !== initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Filter Logic
  const filteredMaterials = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const searchQuery = debouncedQuery.toLowerCase();
    return items
      .filter(item => {
        if (selectedMaterialIds.includes(item.id)) return false;
        if (filterByStock && (!item.stock || item.stock <= 0)) return false;
        return item.name.toLowerCase().includes(searchQuery);
      })
      .slice(0, 8);
  }, [debouncedQuery, items, selectedMaterialIds, filterByStock]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.trim().length > 0);
  }, []);

  const handleSelect = useCallback((material: MaterialItem) => {
    console.log('[DEBUG_UI] MaterialSelector Selected:', material.name);
    onSelect(material);
    setQuery(material.name);
    setIsOpen(false);
  }, [onSelect]);

  const getDisplayText = (material: MaterialItem): string => {
    const stock = material.stock || 0;
    if (material.type === 'MEASURABLE') {
      return `${stock} ${(material as MeasurableItem).unit}`;
    } else if (material.type === 'COUNTABLE') {
      const c = material as CountableItem;
      if (c.packaging) {
        return `${Math.floor(stock / c.packaging.package_size)} ${c.packaging.package_unit}s`;
      }
      return `${stock} un.`;
    }
    return `${stock} porc.`;
  };

  return (
    <Popover.Root
      open={isOpen && filteredMaterials.length > 0}
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{ placement: "bottom-start", sameWidth: true, gutter: 4 }}
      // Disable all automatic focus management
      autoFocus={false}
      restoreFocus={false}
      closeOnInteractOutside={true}
    >
      <Popover.Trigger asChild>
        <Box position="relative" w="full">
          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled || loading}
            autoFocus={autoFocus}
            pr="10"
            onFocus={() => {
              if (query) setIsOpen(filteredMaterials.length > 0);
            }}
            data-testid="material-selector-search"
            aria-label={ariaLabel || "Buscar material"}
            size="sm"
            autoComplete="off"
            // Ensure input keeps focus
            onBlur={(e) => {
              // Optional: logic to close if related target is not popover
            }}
          />

          <Box
            position="absolute"
            right="3"
            top="50%"
            transform="translateY(-50%)"
            pointerEvents="none"
          >
            {loading ? (
              <Spinner size="xs" />
            ) : (
              <MagnifyingGlassIcon style={{ width: '14px', color: 'var(--chakra-colors-gray-400)' }} />
            )}
          </Box>
        </Box>
      </Popover.Trigger>

      <Popover.Positioner style={{ zIndex: 9999 }}>
        <Popover.Content
          width="auto"
          minW="300px"
          p="0"
          // Explicitly disable auto focus on content too
          autoFocus={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Let click outside close it normally
          }}
        >
          <Popover.Body p="0">
            <CardWrapper
              variant="elevated"
              maxH="300px"
              overflowY="auto"
              css={{ border: 'none', boxShadow: 'none' }}
            >
              <CardWrapper.Body p="1">
                <Stack gap="0">
                  {filteredMaterials.map((material) => (
                    <Flex
                      key={material.id}
                      p="2"
                      borderRadius="sm"
                      cursor="pointer"
                      _hover={{ bg: "blue.50" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(material);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      align="center"
                      gap="3"
                      transition="background 0.1s"
                    >
                      <Box fontSize="sm">{getTypeIcon(material.type)}</Box>

                      <Stack gap="0" flex="1" minW="0">
                        <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                          {material.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {getDisplayText(material)}
                        </Text>
                      </Stack>

                      <Badge
                        colorPalette={getStockBadgeColor(StockCalculation.getStockStatus(material))}
                        size="xs"
                        variant="surface"
                      >
                        {StockCalculation.getStatusLabel(StockCalculation.getStockStatus(material))}
                      </Badge>
                    </Flex>
                  ))}
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};

// Helpers
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'MEASURABLE': return '📏';
    case 'COUNTABLE': return '📦';
    case 'ELABORATED': return '🧪';
    default: return '📋';
  }
};

const getStockBadgeColor = (status: string) => {
  switch (status) {
    case 'ok': return 'green';
    case 'low': return 'yellow';
    case 'critical': return 'orange';
    case 'out': return 'red';
    default: return 'gray';
  }
};

export default MaterialSelector;
