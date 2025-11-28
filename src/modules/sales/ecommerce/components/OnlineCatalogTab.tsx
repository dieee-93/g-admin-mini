/**
 * ONLINE CATALOG TAB COMPONENT
 * Manages product visibility and settings for e-commerce catalog
 *
 * FEATURES:
 * - Toggle product online availability
 * - Set featured products
 * - Configure online-specific pricing
 * - Filter and search products
 */

import { useState } from 'react';
import {
  Stack,
  Button,
  Input,
  Badge,
  Alert,
  Icon,
  Text,
  SelectField,
  Spinner,
  Table,
} from '@/shared/ui';
import {
  GlobeAltIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  // TODO: Add search functionality using MagnifyingGlassIcon
  // MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useProductCatalog } from '../hooks';
import { logger } from '@/lib/logging';

export function OnlineCatalogTab() {
  const {
    products,
    loading,
    error,
    filters,
    setFilters,
    toggleProductOnline,
    toggleFeatured,
  } = useProductCatalog();

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Handle toggle online availability
  const handleToggleOnline = async (productId: string, currentValue: boolean) => {
    setProcessingId(productId);
    try {
      await toggleProductOnline(productId, currentValue);
      logger.info('OnlineCatalogTab', `✅ Toggled product ${productId} online status`);
    } catch (error) {
      logger.error('OnlineCatalogTab', '❌ Error toggling product:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (productId: string, currentVisibility: string) => {
    setProcessingId(productId);
    try {
      await toggleFeatured(productId, currentVisibility);
      logger.info('OnlineCatalogTab', `✅ Toggled product ${productId} featured status`);
    } catch (error) {
      logger.error('OnlineCatalogTab', '❌ Error toggling featured:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Get visibility badge
  const getVisibilityBadge = (product: { available_online?: boolean; online_visibility?: string }) => {
    if (!product.available_online) {
      return <Badge colorPalette="gray">Offline</Badge>;
    }

    if (product.online_visibility === 'featured') {
      return <Badge colorPalette="yellow">Featured</Badge>;
    }

    if (product.online_visibility === 'visible') {
      return <Badge colorPalette="green">Online</Badge>;
    }

    return <Badge colorPalette="gray">Hidden</Badge>;
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack gap="xs">
          <Text fontSize="xl" fontWeight="semibold">
            <Icon as={GlobeAltIcon} mr="2" />
            Online Product Catalog
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage which products are visible in your online store
          </Text>
        </Stack>
      </Stack>

      {/* Filters */}
      <Stack direction="row" gap="md">
        <Input
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          width="300px"
        />
        <SelectField
          options={[
            { value: 'all', label: 'All Products' },
            { value: 'visible', label: 'Online Only' },
            { value: 'featured', label: 'Featured Only' },
            { value: 'hidden', label: 'Hidden Only' }
          ]}
          value={[filters.visibility || 'all']}
          onValueChange={(details) => setFilters({ ...filters, visibility: details.value[0] as 'all' | 'visible' | 'featured' | 'hidden' })}
          width="200px"
          noPortal
        />
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert status="error" title="Error loading products">
          {error.message}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Stack align="center" py="8">
          <Spinner size="lg" />
          <Text>Loading products...</Text>
        </Stack>
      )}

      {/* Products Table */}
      {!loading && products.length > 0 && (
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Product Name</Table.ColumnHeader>
              <Table.ColumnHeader>Price</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {products.map((product) => (
              <Table.Row key={product.id}>
                <Table.Cell>
                  <Stack direction="row" align="center" gap="2">
                    {product.online_visibility === 'featured' && (
                      <Icon as={StarIconSolid} color="yellow.500" />
                    )}
                    <Text fontWeight="medium">{product.name}</Text>
                  </Stack>
                </Table.Cell>
                <Table.Cell>
                  <Text>
                    ${product.online_price || product.price}
                  </Text>
                </Table.Cell>
                <Table.Cell>{getVisibilityBadge(product)}</Table.Cell>
                <Table.Cell>
                  <Stack direction="row" gap="2">
                    <Button
                      size="sm"
                      variant={product.available_online ? 'solid' : 'outline'}
                      colorPalette={product.available_online ? 'green' : 'gray'}
                      onClick={() => handleToggleOnline(product.id, product.available_online)}
                      loading={processingId === product.id}
                    >
                      <Icon as={product.available_online ? EyeIcon : EyeSlashIcon} />
                      {product.available_online ? 'Online' : 'Offline'}
                    </Button>
                    <Button
                      size="sm"
                      variant={product.online_visibility === 'featured' ? 'solid' : 'outline'}
                      colorPalette="yellow"
                      onClick={() => handleToggleFeatured(product.id, product.online_visibility)}
                      loading={processingId === product.id}
                      disabled={!product.available_online}
                    >
                      <Icon as={StarIcon} />
                      Featured
                    </Button>
                  </Stack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <Stack align="center" py="8" gap="md">
          <Icon as={GlobeAltIcon} boxSize="12" color="gray.400" />
          <Text fontSize="lg" color="gray.600">
            No products found
          </Text>
          <Text fontSize="sm" color="gray.500">
            {filters.search || filters.visibility !== 'all'
              ? 'Try adjusting your filters'
              : 'Create products to add them to your online catalog'}
          </Text>
        </Stack>
      )}

      {/* Info Alert */}
      <Alert status="info" title="💡 Online Catalog Tips">
        <Stack gap="2">
          <Text>• Toggle products online to make them available in your e-commerce store</Text>
          <Text>• Mark products as "Featured" to highlight them on your storefront</Text>
          <Text>• Online prices can differ from in-store POS prices</Text>
        </Stack>
      </Alert>
    </Stack>
  );
}
