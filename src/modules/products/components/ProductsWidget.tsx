/**
 * PRODUCTS WIDGET - Dashboard Component
 *
 * Widget que muestra métricas clave de productos:
 * - Total de productos activos
 * - Productos con recetas
 * - Producto más vendido (futuro)
 * - Margen promedio (futuro)
 *
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, VStack, HStack, Heading, Text, Button, Badge, Stack } from '@/shared/ui';
import { useProductsStore } from '@/store/productsStore';

/**
 * Estadísticas básicas de productos
 */
interface ProductStats {
  totalProducts: number;
  productsWithRecipes: number;
  averageMargin: number;
  bestSellerName: string | null;
}

/**
 * Main Widget Component - Exported for lazy loading
 */
export default function ProductsWidget() {
  const navigate = useNavigate();
  const { products, getProductsWithRecipes } = useProductsStore();

  // Calcular estadísticas
  const stats: ProductStats = useMemo(() => {
    const productsWithRecipes = getProductsWithRecipes();

    // Calcular margen promedio (basado en cost_per_unit si está disponible)
    const productsWithCost = products.filter(p => p.cost_per_unit !== undefined && p.cost_per_unit > 0);
    const averageMargin = productsWithCost.length > 0
      ? productsWithCost.reduce((sum, p) => sum + ((p.cost_per_unit || 0) * 100), 0) / productsWithCost.length
      : 0;

    // Producto más vendido (basado en availability como proxy)
    const sortedByAvailability = [...products].sort((a, b) => {
      const availA = a.availability || 0;
      const availB = b.availability || 0;
      return availB - availA;
    });
    const bestSeller = sortedByAvailability[0];

    return {
      totalProducts: products.length,
      productsWithRecipes: productsWithRecipes.length,
      averageMargin,
      bestSellerName: bestSeller?.name || null,
    };
  }, [products, getProductsWithRecipes]);

  return (
    <Box
      p="5"
      bg="gray.50"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
    >
      <VStack align="stretch" gap="4">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="md" color="orange.600" _dark={{ color: 'orange.400' }}>
            Productos
          </Heading>
          <Badge colorPalette="orange" variant="subtle">
            Catálogo
          </Badge>
        </HStack>

        {/* Stats Grid */}
        <Stack direction={{ base: 'column', md: 'row' }} gap="4">
          {/* Total Products */}
          <Box flex="1">
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              Total Productos
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }}>
              {stats.totalProducts}
            </Text>
          </Box>

          {/* Products with Recipes */}
          <Box flex="1">
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              Con Recetas
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.600" _dark={{ color: 'orange.400' }}>
              {stats.productsWithRecipes}
            </Text>
          </Box>
        </Stack>

        {/* Best Seller (if available) */}
        {stats.bestSellerName && (
          <Box>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              Más Vendido
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="gray.900" _dark={{ color: 'white' }}>
              {stats.bestSellerName}
            </Text>
          </Box>
        )}

        {/* Average Margin (if available) */}
        {stats.averageMargin > 0 && (
          <Box>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              Margen Promedio
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }}>
              {stats.averageMargin.toFixed(1)}%
            </Text>
          </Box>
        )}

        {/* Action Button */}
        <Button
          size="sm"
          colorPalette="orange"
          variant="outline"
          onClick={() => navigate('/admin/supply-chain/products')}
        >
          Ver Catálogo
        </Button>
      </VStack>
    </Box>
  );
}
