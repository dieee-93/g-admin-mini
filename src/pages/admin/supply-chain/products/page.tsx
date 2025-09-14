import { useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  CardWrapper ,
  Grid,
  SimpleGrid,
  Heading
} from '@/shared/ui';
import { CogIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Import components
import { useNavigation } from '@/contexts/NavigationContext';
import {
  ProductList,
  ProductFormModal,
  MenuEngineeringMatrix,
  CostAnalysisTab
} from './components';

export function ProductsPage() {
  const { setQuickActions } = useNavigation();

  // Set up quick actions
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-product',
        label: 'Nuevo Producto',
        icon: PlusIcon,
        action: () => console.log('New product'),
        color: 'purple'
      },
      {
        id: 'menu-analysis',
        label: 'Análisis de Menú',
        icon: CogIcon,
        action: () => console.log('Menu analysis'),
        color: 'blue'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  return (
    <Box p="6" maxW="container.xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" gap="1">
            <Text fontSize="3xl" fontWeight="bold">Products</Text>
            <Text color="gray.600">Menu items, pricing & analytics</Text>
          </VStack>
          <HStack gap="2">
            <Button 
              variant="outline"
              colorPalette="blue" 
              onClick={() => {
                // Use internal navigation instead of window.open
                // This maintains context and better UX
                console.log('Navigate to menu engineering internally');
                // TODO: Implement proper routing to /products/menu-engineering
              }}
              size="md"
              minH="44px"
              minW="44px"
            >
              📊 Menu Engineering
            </Button>
            <Button 
              colorPalette="purple"
              size="md"
              minH="44px"
              minW="44px"
              gap="2"
            >
              <PlusIcon className="w-4 h-4" />
              New Product
            </Button>
          </HStack>
        </HStack>

        {/* Products Dashboard - No nested tabs */}
        <VStack gap={6} align="stretch">
          {/* Products Overview Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 2, md: 4 }}>
            <CardWrapper .Root>
              <CardWrapper .Body>
                <VStack align="start" gap={2}>
                  <CogIcon className="w-8 h-8 text-purple-600" />
                  <Heading size="sm">Product Management</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Manage menu items and pricing
                  </Text>
                </VStack>
              </CardWrapper .Body>
            </CardWrapper .Root>

            <CardWrapper .Root>
              <CardWrapper .Body>
                <VStack align="start" gap={2}>
                  <ChartBarIcon className="w-8 h-8 text-blue-600" />
                  <Heading size="sm">Menu Engineering</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Optimize menu performance
                  </Text>
                </VStack>
              </CardWrapper .Body>
            </CardWrapper .Root>

            <CardWrapper .Root>
              <CardWrapper .Body>
                <VStack align="start" gap={2}>
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                  <Heading size="sm">Cost Analysis</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Track product costs and margins
                  </Text>
                </VStack>
              </CardWrapper .Body>
            </CardWrapper .Root>
          </SimpleGrid>

          {/* All sections displayed together */}
          <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={{ base: 4, md: 6 }}>
            <CardWrapper .Root>
              <CardWrapper .Header>
                <Heading size="md">Product Management</Heading>
              </CardWrapper .Header>
              <CardWrapper .Body>
                <ProductList />
              </CardWrapper .Body>
            </CardWrapper .Root>

            <CardWrapper .Root>
              <CardWrapper .Header>
                <Heading size="md">Menu Engineering</Heading>
              </CardWrapper .Header>
              <CardWrapper .Body>
                <MenuEngineeringMatrix />
              </CardWrapper .Body>
            </CardWrapper .Root>

            <CardWrapper .Root gridColumn={{ base: "1", xl: "1 / -1" }}>
              <CardWrapper .Header>
                <Heading size="md">Cost Analysis</Heading>
              </CardWrapper .Header>
              <CardWrapper .Body>
                <CostAnalysisTab />
              </CardWrapper .Body>
            </CardWrapper .Root>
          </Grid>
        </VStack>
      </VStack>
    </Box>
  );
}

export default ProductsPage;