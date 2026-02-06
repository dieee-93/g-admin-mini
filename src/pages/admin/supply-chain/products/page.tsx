/**
 * Products Page - Product Catalog & Menu Engineering
 *
 * REFACTORED v6.0 - MAGIC PATTERNS DESIGN
 * Design Principles:
 * - Decorative background blobs for visual depth
 * - Gradient metric cards with top border accents (3px)
 * - Elevated content cards with modern shadows
 * - Responsive grid layouts (SimpleGrid)
 * - Clean spacing system (gap="6/8", p="6/8")
 * - No maxW restrictions (w="100%")
 * 
 * Features:
 * - TanStack Query for server state
 * - Zustand for UI state
 * - Facade hook pattern
 */

import {
  Box,
  Flex,
  SimpleGrid,
  Stack,
  Text
} from '@chakra-ui/react';
import {
  Button,
  Tabs,
  SkipLink,
  Badge,
  Alert,
  Icon
} from '@/shared/ui';
import { PlusIcon, ChartBarIcon, CogIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HookPoint } from '@/lib/modules';
import { useNavigate } from 'react-router-dom';

import {
  ProductList,
} from './components';

// ✅ TABS
import { CatalogConfigTab } from './tabs/catalog-config';

// ✅ NEW: Import from clean module architecture
import { useProductsPage } from '@/modules/products';

export function ProductsPage() {
  const navigate = useNavigate();

  // ✅ Using clean module hook
  const {
    metrics,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    filteredProducts,
    filters,
    setFilters,
    clearFilters,
    selectProduct,
    togglePublish,
    deleteProduct,
  } = useProductsPage();

  return (
    <>
      <SkipLink />

      {/* Decorative background elements */}
      <Box position="fixed" top="-10%" right="-5%" w="500px" h="500px" borderRadius="full" bg="purple.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" zIndex="-1" />
      <Box position="fixed" bottom="-10%" left="-5%" w="400px" h="400px" borderRadius="full" bg="pink.50" opacity="0.4" filter="blur(80px)" pointerEvents="none" zIndex="-1" />

      <Box p={{ base: "6", md: "8" }}>
        <Stack gap="8" w="100%">

          {/* Error Alert */}
          {error && (
            <Alert status="error" title="Error">{error}</Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              HEADER - Title + Actions
              ═══════════════════════════════════════════════════════════════ */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <Flex align="center" gap="3">
              <Box bg="linear-gradient(135deg, var(--chakra-colors-purple-500) 0%, var(--chakra-colors-purple-600) 100%)" p="3" borderRadius="xl" shadow="lg">
                <Text fontSize="2xl">🛍️</Text>
              </Box>
              <Box>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" color="purple.600">
                  Catálogo de Productos
                </Text>
                <Text color="text.muted" fontSize="sm">Menu Engineering & Pricing</Text>
              </Box>
            </Flex>

            <Flex gap="2" flexWrap="wrap">
              <Button variant="outline" colorPalette="blue" size="md" onClick={() => setActiveTab('analytics')}>
                <Icon icon={ChartBarIcon} size="sm" />
                Menu Engineering
              </Button>
              <Button variant="outline" colorPalette="green" size="md" onClick={() => setActiveTab('cost-analysis')}>
                <Icon icon={CogIcon} size="sm" />
                Cost Analysis
              </Button>
              <Button colorPalette="purple" size="lg" onClick={() => navigate('/admin/supply-chain/products/new')}>
                <Icon icon={PlusIcon} size="sm" />
                Nuevo Producto
              </Button>
            </Flex>
          </Flex>

          {/* ═══════════════════════════════════════════════════════════════
              METRICS CARDS - Gradient style
              ═══════════════════════════════════════════════════════════════ */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap="4">
            {/* Total Products */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-purple-400) 0%, var(--chakra-colors-purple-600) 100%)" />
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Total Products</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">{metrics.totalProducts}</Text>
            </Box>

            {/* Elaborated */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-blue-400) 0%, var(--chakra-colors-blue-600) 100%)" />
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Elaborated</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">{metrics.elaboratedProducts}</Text>
            </Box>

            {/* With Recipes */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-green-400) 0%, var(--chakra-colors-green-600) 100%)" />
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">With Recipes</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">{metrics.productsWithRecipes}</Text>
            </Box>

            {/* Services */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-orange-400) 0%, var(--chakra-colors-orange-600) 100%)" />
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Services</Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">{metrics.serviceProducts}</Text>
            </Box>

            {/* Digital */}
            <Box position="relative" overflow="hidden" bg="bg.surface" p="4" borderRadius="xl" shadow="md" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
              <Box position="absolute" top={0} left={0} right={0} h="3px" bg="linear-gradient(90deg, var(--chakra-colors-cyan-400) 0%, var(--chakra-colors-cyan-600) 100%)" />
              <Text fontSize="xs" fontWeight="semibold" color="text.muted" textTransform="uppercase" mb="1">Digital</Text>
              <Text fontSize="2xl" fontWeight="bold" color="cyan.600">{metrics.digitalProducts}</Text>
            </Box>
          </SimpleGrid>

          {/* ═══════════════════════════════════════════════════════════════
              MAIN CONTENT - Elevated Tabs Card
              ═══════════════════════════════════════════════════════════════ */}
          <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="xl">
            <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as typeof activeTab)}>
              <Tabs.List>
                <Tabs.Trigger value="products">
                  Products
                  {filteredProducts.length > 0 && (
                    <Badge colorPalette="purple" size="sm" ml="2">
                      {filteredProducts.length}
                    </Badge>
                  )}
                </Tabs.Trigger>

                <Tabs.Trigger value="catalog-config">
                  <Icon icon={Cog6ToothIcon} size="sm" />
                  Config. Catálogo
                </Tabs.Trigger>

                <HookPoint
                  name="products.analytics_tabs"
                  data={{ activeTab, setActiveTab }}
                  direction="row"
                  gap="0"
                  fallback={null}
                />

                <HookPoint
                  name="products.tabs"
                  data={{ activeTab, setActiveTab }}
                  direction="row"
                  gap="0"
                  fallback={null}
                />
              </Tabs.List>

              {/* Tab Content: Products */}
              <Tabs.Content value="products">
                <Box pt="6">
                  <ProductList
                    products={filteredProducts}
                    loading={isLoading}
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearFilters={clearFilters}
                    onEdit={(product) => selectProduct(product.id)}
                    onDelete={deleteProduct}
                    onViewDetails={(product) => selectProduct(product.id)}
                    onTogglePublish={async (productId) => {
                      const product = filteredProducts.find(p => p.id === productId);
                      if (product) {
                        await togglePublish({
                          productId,
                          isPublished: !product.is_published
                        });
                      }
                    }}
                  />
                </Box>
              </Tabs.Content>

              {/* Catalog Configuration Tab */}
              <Tabs.Content value="catalog-config">
                <Box pt="6">
                  <CatalogConfigTab />
                </Box>
              </Tabs.Content>

              <HookPoint
                name="products.analytics_content"
                data={{ activeTab, setActiveTab }}
                direction="column"
                gap="4"
                fallback={null}
              />

              <HookPoint
                name="products.tab_content"
                data={{ activeTab, setActiveTab }}
                direction="column"
                gap="4"
                fallback={null}
              />
            </Tabs.Root>
          </Box>

          <HookPoint
            name="products.page_sections"
            data={{ products: filteredProducts }}
            direction="column"
            gap="4"
            fallback={null}
          />

        </Stack>
      </Box>
    </>
  );
}

export default ProductsPage;
