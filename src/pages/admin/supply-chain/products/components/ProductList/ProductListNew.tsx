/**Sig
 *
 * Features:
 * - Category filtering
 * - Search by name
 * - Visual indicators (has recipe, booking, staff, digital)
 * - Card grid layout
 * - Empty states
 * - Color-coded badges
 */

import { memo } from 'react';
import {
  Stack,
  HStack,
  Grid,
  CardWrapper,
  Button,
  InputField,
  SelectField,
  Switch,
  Badge,
  IconButton,
  Typography,
  Box,
  Text,
  Flex
} from '@/shared/ui';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserGroupIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { type ProductWithConfig, type ProductCategory, PRODUCT_CATEGORIES } from '../../types';
import type { FilterState } from '../../hooks/useProductsPage';

export interface ProductListProps {
  products: ProductWithConfig[];
  loading?: boolean;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onEdit?: (product: ProductWithConfig) => void;
  onDelete?: (productId: string) => void;
  onViewDetails?: (product: ProductWithConfig) => void;
  onTogglePublish?: (productId: string) => void;
}

// Category color mapping
const CATEGORY_COLORS: Record<ProductCategory, string> = {
  FOOD: 'orange',
  BEVERAGE: 'cyan',
  RETAIL_GOODS: 'purple',
  BEAUTY_SERVICE: 'pink',
  REPAIR_SERVICE: 'yellow',
  PROFESSIONAL_SERVICE: 'blue',
  EVENT: 'green',
  COURSE: 'teal',
  DIGITAL_PRODUCT: 'indigo',
  RENTAL: 'gray',
  CUSTOM: 'gray',
};

export const ProductListNew = memo(function ProductListNew({
  products,
  loading = false,
  filters,
  onFilterChange,
  onClearFilters,
  onEdit,
  onDelete,
  onViewDetails,
  onTogglePublish,
}: ProductListProps) {
  // Handle filter changes
  const handleSearchChange = (search: string) => {
    onFilterChange({ search: search || undefined });
ProductListNew.displayName = 'ProductListNew';
  };

  const handleCategoryChange = (category: string | null) => {
    onFilterChange({ category: (category as ProductCategory) || undefined });
  };

  const handleHasRecipeChange = (checked: boolean) => {
    onFilterChange({ hasRecipe: checked ? true : undefined });
  };

  const handleRequiresBookingChange = (checked: boolean) => {
    onFilterChange({ requiresBooking: checked ? true : undefined });
  };

  const handleIsDigitalChange = (checked: boolean) => {
    onFilterChange({ isDigital: checked ? true : undefined });
  };

  // Loading state
  if (loading) {
    return (
      <Stack gap="4" align="center" justify="center" minH="400px">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        <Typography variant="body" color="text.muted">Cargando productos...</Typography>
      </Stack>
    );
  }

  const hasActiveFilters =
    filters.category || filters.hasRecipe || filters.requiresBooking || filters.isDigital || filters.search;

  return (
    <Stack gap="6">
      {/* ========== FILTERS SECTION ========== */}
      <Stack gap="4">
        <HStack gap="4" flexWrap="wrap">
          {/* Search */}
          <Box flex="1" minW="250px">
            <InputField
              label="Buscar"
              placeholder="Buscar por nombre..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Box>

          {/* Category filter */}
          <Box minW="200px">
            <SelectField
              label="Categoría"
              placeholder="Todas"
              options={PRODUCT_CATEGORIES.map(cat => ({
                value: cat.value,
                label: cat.label,
              }))}
              value={filters.category ? [filters.category] : []}
              onValueChange={(details) => handleCategoryChange(details.value[0] || null)}
            />
          </Box>
        </HStack>

        {/* Boolean filters */}
        <HStack gap="6" flexWrap="wrap" align="center">
          <Switch
            checked={filters.hasRecipe || false}
            onChange={(checked) => handleHasRecipeChange(checked)}
            label="Con receta"
          />

          <Switch
            checked={filters.requiresBooking || false}
            onChange={(checked) => handleRequiresBookingChange(checked)}
            label="Requiere reserva"
          />

          <Switch
            checked={filters.isDigital || false}
            onChange={(checked) => handleIsDigitalChange(checked)}
            label="Digital"
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </HStack>
      </Stack>

      {/* ========== PRODUCTS GRID ========== */}
      {products.length === 0 ? (
        <Box textAlign="center" py="12">
          <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <Typography variant="heading" size="lg" weight="semibold" color="text.muted" style={{ marginBottom: '0.5rem' }}>
            {hasActiveFilters ? 'No se encontraron productos' : 'No hay productos registrados'}
          </Typography>
          <Typography variant="body" color="text.muted">
            {hasActiveFilters
              ? 'Intenta ajustar los filtros para ver más resultados'
              : 'Comienza creando tu primer producto'}
          </Typography>
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          }}
          gap="4"
        >
          {products.map((product) => {
            const categoryColor = CATEGORY_COLORS[product.category] || 'gray';
            const categoryLabel =
              PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category;

            return (
              <CardWrapper key={product.id} variant="outline">
                <CardWrapper.Header>
                  <HStack justify="space-between" align="start">
                    <Stack gap="1" flex="1">
                      <CardWrapper.Title>
                        {product.name}
                      </CardWrapper.Title>
                      {product.description && (
                        <CardWrapper.Description>
                          {product.description}
                        </CardWrapper.Description>
                      )}
                    </Stack>
                    <HStack gap="2">
                      <Badge colorPalette={categoryColor} size="sm">
                        {categoryLabel}
                      </Badge>
                      {onTogglePublish && (
                        <Box>
                          <Switch
                            checked={product.is_published || false}
                            onCheckedChange={() => onTogglePublish(product.id)}
                            size="sm"
                          />
                          <Text fontSize="xs" color="fg.muted" mt="1">
                            {product.is_published ? 'Publicado' : 'No publicado'}
                          </Text>
                        </Box>
                      )}
                    </HStack>
                  </HStack>
                </CardWrapper.Header>

                <CardWrapper.Body>
                  <Stack gap="4">
                    {/* Visual Indicators */}
                    <HStack gap="2" flexWrap="wrap">
                      {product.config?.has_components && (
                        <Badge variant="subtle" colorPalette="blue" size="sm">
                          <HStack gap="1">
                            <ClipboardDocumentListIcon className="w-3 h-3" />
                            <span>Receta</span>
                          </HStack>
                        </Badge>
                      )}

                      {product.config?.requires_booking && (
                        <Badge variant="subtle" colorPalette="green" size="sm">
                          <HStack gap="1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>Reserva</span>
                          </HStack>
                        </Badge>
                      )}

                      {product.config?.requires_staff && (
                        <Badge variant="subtle" colorPalette="orange" size="sm">
                          <HStack gap="1">
                            <UserGroupIcon className="w-3 h-3" />
                            <span>Personal</span>
                          </HStack>
                        </Badge>
                      )}

                      {product.config?.is_digital && (
                        <Badge variant="subtle" colorPalette="purple" size="sm">
                          <HStack gap="1">
                            <ComputerDesktopIcon className="w-3 h-3" />
                            <span>Digital</span>
                          </HStack>
                        </Badge>
                      )}
                    </HStack>

                    {/* Pricing */}
                    {product.pricing && (
                      <HStack justify="space-between" pt="2" borderTopWidth="1px">
                        <Typography variant="body" size="sm" color="text.muted">Precio:</Typography>
                        <Typography variant="body" size="lg" weight="semibold" colorPalette="purple">
                          ${product.pricing.price?.toFixed(2) || '0.00'}
                        </Typography>
                      </HStack>
                    )}

                    {/* Actions */}
                    <HStack gap="2" pt="2">
                      {onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          flex="1"
                          onClick={() => onViewDetails(product)}
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      )}

                      {onEdit && (
                        <IconButton
                          aria-label="Editar"
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(product)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </IconButton>
                      )}

                      {onDelete && (
                        <IconButton
                          aria-label="Eliminar"
                          variant="outline"
                          colorPalette="red"
                          size="sm"
                          onClick={() => onDelete(product.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </IconButton>
                      )}
                    </HStack>
                  </Stack>
                </CardWrapper.Body>
              </CardWrapper>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
});
