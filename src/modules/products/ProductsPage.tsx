import { useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Grid,
  SimpleGrid,
  Heading
} from '@chakra-ui/react';
import { CogIcon, PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Import components
import { useNavigation } from '@/contexts/NavigationContext';
import { ProductList } from './ui/ProductList';
import { ProductForm } from './ui/ProductForm';
import { MenuEngineeringOnly } from './ui/MenuEngineeringOnly';
import { CostAnalysisModule } from './ui/CostAnalysisModule';

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
            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <CogIcon className="w-8 h-8 text-purple-600" />
                  <Heading size="sm">Product Management</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Manage menu items and pricing
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <ChartBarIcon className="w-8 h-8 text-blue-600" />
                  <Heading size="sm">Menu Engineering</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Optimize menu performance
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <VStack align="start" gap={2}>
                  <ChartBarIcon className="w-8 h-8 text-green-600" />
                  <Heading size="sm">Cost Analysis</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Track product costs and margins
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>

          {/* All sections displayed together */}
          <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={{ base: 4, md: 6 }}>
            <Card.Root>
              <Card.Header>
                <Heading size="md">Product Management</Heading>
              </Card.Header>
              <Card.Body>
                <ProductList />
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <Heading size="md">Menu Engineering</Heading>
              </Card.Header>
              <Card.Body>
                <MenuEngineeringOnly />
              </Card.Body>
            </Card.Root>

            <Card.Root gridColumn={{ base: "1", xl: "1 / -1" }}>
              <Card.Header>
                <Heading size="md">Cost Analysis</Heading>
              </Card.Header>
              <Card.Body>
                <CostAnalysisModule />
              </Card.Body>
            </Card.Root>
          </Grid>
        </VStack>
      </VStack>
    </Box>
  );
}

export default ProductsPage;