/**
 * Top Products Widget - Dynamic Dashboard Component
 *
 * Muestra los productos más vendidos:
 * - Top 3 productos del mes
 * - Cantidad vendida
 * - Ingresos generados
 *
 * Visible solo si sales_catalog_menu o production_bom_management están activas.
 *
 * @version 1.0.0 - Initial Implementation
 */

import React from 'react';
import { Box, Stack, Typography, Icon } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { FireIcon } from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/lib/decimal';

export function ProductsWidget() {
  // TODO: Migrate to TanStack Query - useSales() should provide topProducts stats
  // For now, return empty data to prevent crashes
  const loading = false;
  const topProducts = [];
  const top3 = topProducts.slice(0, 3);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="amber"
      h="fit-content"
      minH="120px"
      borderRadius="8px"
      shadow="sm"
      bg="white"
      border="1px"
      borderColor="gray.200"
    >
      <CardWrapper.Body p="4">
        <Stack gap="4">
          <Stack direction="row" align="center" gap="2">
            <Icon size="md" color="amber.500" >
                <FireIcon />
              </Icon>
            <Typography variant="body" size="md" weight="medium">
              Top Productos
            </Typography>
          </Stack>

          {loading ? (
            <Typography variant="body" size="sm" color="text.secondary">
              Cargando productos...
            </Typography>
          ) : top3.length === 0 ? (
            <Box p="3" bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
              <Typography variant="body" size="sm" color="text.secondary">
                No hay datos de productos vendidos
              </Typography>
            </Box>
          ) : (
            <Stack gap="2">
              {top3.map((product, index) => (
                <Box
                  key={product.product_id}
                  p="3"
                  bg={index === 0 ? 'amber.50' : 'bg.subtle'}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={index === 0 ? 'amber.200' : 'border.default'}
                >
                  <Stack gap="1">
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack direction="row" align="center" gap="2">
                        <Typography
                          variant="body"
                          size="xs"
                          weight="bold"
                          color={index === 0 ? 'amber.700' : 'text.secondary'}
                        >
                          #{index + 1}
                        </Typography>
                        <Typography variant="body" size="sm" weight="medium">
                          {product.name}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" justify="space-between" align="center">
                      <Typography variant="body" size="xs" color="text.secondary">
                        {product.quantity} vendidos
                      </Typography>
                      <Typography variant="body" size="xs" weight="medium">
                        {DecimalUtils.formatCurrency(product.revenue)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default ProductsWidget;
