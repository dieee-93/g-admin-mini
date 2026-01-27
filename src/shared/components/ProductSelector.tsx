/**
 * ProductSelector - Component for selecting products with cost and stock info
 *
 * Similar to MaterialSelector but adapted for products.
 * Used in recipe system for BOM (Bill of Materials) composition.
 *
 * @see MaterialSelector.tsx (reference implementation)
 * @see RECIPE_UI_INTEGRATION_GUIDE.md
 */

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
import { useDebounce } from '@/shared/hooks';
import { CardWrapper, InputField } from '../ui';
import { useProductsPage } from '@/modules/products';

export interface ProductSelectorProps {
  /**
   * Callback when a product is selected
   */
  onProductSelected: (product: Product) => void;

  /**
   * Placeholder text for search input
   */
  placeholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Product IDs to exclude from search results
   * (e.g., prevent selecting parent product to avoid circular dependency)
   */
  excludeIds?: string[];

  /**
   * Filter by product type
   */
  filterByType?: string;

  /**
   * Show cost in dropdown
   */
  showCost?: boolean;

  /**
   * Show stock in dropdown
   */
  showStock?: boolean;
}

// Simplified Product type (adjust according to your actual Product type)
interface Product {
  id: string;
  name: string;
  product_type?: string;
  unit?: string;
  final_cost?: number;
  unit_cost?: number;
  current_stock?: number;
  is_active?: boolean;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelected,
  placeholder = "Buscar producto...",
  disabled = false,
  excludeIds = [],
  filterByType,
  showCost = true,
  showStock = false
}) => {
  // Get products from store/hook
  const { filteredProducts, isLoading } = useProductsPage();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Filtered products based on search query
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const searchQuery = debouncedQuery.toLowerCase();
    return filteredProducts
      .filter(product => {
        // Exclude specified IDs
        if (excludeIds.includes(product.id)) return false;

        // Filter by type if specified
        if (filterByType && product.product_type !== filterByType) return false;

        // Only show active products
        if (product.is_active === false) return false;

        // Search by name
        return product.name.toLowerCase().includes(searchQuery);
      })
      .slice(0, 8); // Limit results to 8
  }, [debouncedQuery, filteredProducts, excludeIds, filterByType]);

  // Handle product selection
  const handleSelect = useCallback((product: Product) => {
    setQuery('');
    setIsOpen(false);
    onProductSelected(product);
  }, [onProductSelected]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.trim().length > 0 && searchResults.length > 0);
  }, [searchResults.length]);

  // Get display cost (final_cost or unit_cost)
  const getDisplayCost = useCallback((product: Product): string => {
    const cost = product.final_cost ?? product.unit_cost;
    if (cost === undefined || cost === null) return '-';
    return `$${cost.toFixed(2)}`;
  }, []);

  // Get product type icon
  const getProductTypeIcon = useCallback((type?: string) => {
    switch (type) {
      case 'physical_product':
        return '📦';
      case 'service':
        return '⚙️';
      case 'digital_product':
        return '💾';
      case 'rental':
        return '🔄';
      default:
        return '📋';
    }
  }, []);

  // Get product type label
  const getProductTypeLabel = useCallback((type?: string) => {
    switch (type) {
      case 'physical_product':
        return 'Físico';
      case 'service':
        return 'Servicio';
      case 'digital_product':
        return 'Digital';
      case 'rental':
        return 'Alquiler';
      default:
        return 'Producto';
    }
  }, []);

  return (
    <Box position="relative" w="full">
      <Box position="relative">
        <InputField
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          pr="10"
          onFocus={() => query && setIsOpen(searchResults.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />

        <Box
          position="absolute"
          right="3"
          top="50%"
          transform="translateY(-50%)"
          pointerEvents="none"
        >
          {isLoading ? (
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
      {isOpen && searchResults.length > 0 && (
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
              {searchResults.map((product) => (
                <Flex
                  key={product.id}
                  p="3"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "purple.50" }}
                  onClick={() => handleSelect(product)}
                  align="center"
                  gap="3"
                >
                  <Box fontSize="lg">
                    {getProductTypeIcon(product.product_type)}
                  </Box>

                  <Stack gap="0" flex="1" minW="0">
                    <Text fontWeight="medium" noOfLines={1}>
                      {product.name}
                    </Text>
                    <Flex gap="2" fontSize="sm" color="gray.600" flexWrap="wrap">
                      {showCost && (
                        <Text>Costo: {getDisplayCost(product)}</Text>
                      )}
                      {showStock && product.current_stock !== undefined && (
                        <Text>Stock: {product.current_stock}</Text>
                      )}
                    </Flex>
                  </Stack>

                  <Badge
                    colorPalette="purple"
                    size="sm"
                  >
                    {getProductTypeLabel(product.product_type)}
                  </Badge>
                </Flex>
              ))}
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      )}

      {/* No Results */}
      {isOpen && debouncedQuery.trim() && searchResults.length === 0 && (
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
              No se encontraron productos
            </Text>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </Box>
  );
};

export default ProductSelector;
