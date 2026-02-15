// CustomerMenu.tsx - Vista tipo "store" para que clientes vean productos
// Experiencia de catálogo moderna y visual

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Badge,
  Tabs,
  CardWrapper,
  Icon,
  InputField
} from '@/shared/ui';
import { logger } from '@/lib/logging';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  PlusIcon,
  StarIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

// Tipos para productos
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  preparationTime: string;
}

// Datos de ejemplo
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Base de tomate, mozzarella fresca, albahaca',
    price: 15.90,
    category: 'Pizzas',
    rating: 4.8,
    isPopular: true,
    preparationTime: '15-20 min'
  },
  {
    id: '2', 
    name: 'Hamburguesa Clásica',
    description: 'Carne 200g, lechuga, tomate, cebolla, queso cheddar',
    price: 12.50,
    category: 'Hamburguesas',
    rating: 4.6,
    preparationTime: '10-15 min'
  },
  {
    id: '3',
    name: 'Ensalada César',
    description: 'Lechuga romana, pollo grillado, parmesano, croutons',
    price: 8.90,
    category: 'Ensaladas',
    rating: 4.5,
    isNew: true,
    preparationTime: '5-10 min'
  },
  {
    id: '4',
    name: 'Tacos al Pastor',
    description: '3 tacos con carne al pastor, piña, cilantro, cebolla',
    price: 11.50,
    category: 'Mexicana',
    rating: 4.9,
    isPopular: true,
    preparationTime: '12-18 min'
  }
];

const CATEGORIES = ['Todos', 'Pizzas', 'Hamburguesas', 'Ensaladas', 'Mexicana', 'Bebidas', 'Postres'];

// Componente de filtros y búsqueda
function MenuFilters({ searchTerm, onSearchChange, selectedCategory, onCategoryChange }: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}) {
  return (
    <VStack align="stretch" gap="4">
      {/* Búsqueda */}
      <Box position="relative">
        <InputField
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          pl="40px"
          size="lg"
          borderRadius="xl"
          bg="bg.surface"
          border="2px solid"
          borderColor="border.default"
          _focus={{
            borderColor: "orange.400",
            boxShadow: "0 0 0 1px orange.400"
          }}
        />
        <Box position="absolute" left="3" top="50%" transform="translateY(-50%)">
          <Icon icon={MagnifyingGlassIcon} size="md" color="text.muted" />
        </Box>
      </Box>

      {/* Tabs de categorías */}
      <Tabs.Root value={selectedCategory} onValueChange={(e) => onCategoryChange(e.value as string)}>
        <Tabs.List bg="bg.surface" borderRadius="xl" p="1">
          {CATEGORIES.map((category) => (
            <Tabs.Trigger key={category} value={category} flex="1" borderRadius="lg">
              <Text fontSize="sm" fontWeight="medium">
                {category}
              </Text>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
    </VStack>
  );
}

// Componente de card de producto 
function ProductCard({ product, onAddToCart }: {
  product: Product;
  onAddToCart: (productId: string) => void;
}) {
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);

  return (
    <CardWrapper 
      variant="elevated" 
      overflow="hidden" 
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s"
      bg="bg.surface"
    >
      {/* Imagen placeholder */}
      <Box 
        h="200px" 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon icon={ShoppingBagIcon} size="xl" color="white" />
        
        {/* Badges */}
        <VStack position="absolute" top="3" left="3" gap="2">
          {product.isPopular && (
            <Badge colorPalette="orange" variant="solid">
              Popular
            </Badge>
          )}
          {product.isNew && (
            <Badge colorPalette="green" variant="solid">
              Nuevo
            </Badge>
          )}
        </VStack>
        
        {/* Botón favorito */}
        <Button
          position="absolute"
          top="3"
          right="3"
          variant="ghost"
          size="sm"
          p="2"
          borderRadius="full"
          bg="rgba(255,255,255,0.9)"
          onClick={() => setIsFavorite(!isFavorite)}
          _hover={{ bg: "rgba(255,255,255,1)" }}
        >
          <Icon 
            icon={HeartIcon} 
            size="sm" 
            color={isFavorite ? "red.500" : "gray.500"} 
          />
        </Button>
      </Box>
      
      <CardWrapper.Body>
        <VStack align="start" gap="3">
          {/* Header del producto */}
          <VStack align="start" gap="1" w="full">
            <HStack justify="space-between" w="full" align="start">
              <Text fontSize="lg" fontWeight="semibold" lineHeight="1.2">
                {product.name}
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="orange.600">
                ${product.price.toFixed(2)}
              </Text>
            </HStack>
            
            <Text fontSize="sm" color="text.secondary" noOfLines={2}>
              {product.description}
            </Text>
          </VStack>
          
          {/* Rating y tiempo */}
          <HStack justify="space-between" w="full">
            <HStack gap="1">
              <Icon icon={StarIcon} size="sm" color="yellow.400" />
              <Text fontSize="sm" fontWeight="medium">
                {product.rating}
              </Text>
            </HStack>
            <Text fontSize="sm" color="text.muted">
              {product.preparationTime}
            </Text>
          </HStack>
          
          {/* Botón agregar al carrito */}
          <Button
            leftIcon={<Icon icon={PlusIcon} size="sm" />}
            colorPalette="orange"
            size="md"
            w="full"
            borderRadius="xl"
            onClick={() => onAddToCart(product.id)}
            _hover={{ transform: "translateY(-1px)" }}
          >
            Agregar al Carrito
          </Button>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export function CustomerMenu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cartItems, setCartItems] = useState<string[]>([]);

  // Filtrar productos
  const filteredProducts = SAMPLE_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (productId: string) => {
    setCartItems(prev => [...prev, productId]);
    // TODO: Implementar lógica real del carrito
    logger.info('App', 'Producto agregado al carrito:', productId);
  };

  return (
    <Box p={{ base: "4", md: "6" }} maxW="1400px" mx="auto">
      <VStack align="stretch" gap="8">
        {/* Header */}
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold" color="text.primary">
            Nuestro Menú
          </Text>
          <Text fontSize="lg" color="text.secondary">
            Descubre nuestros deliciosos platos preparados con los mejores ingredientes
          </Text>
        </VStack>
        
        {/* Filtros y búsqueda */}
        <MenuFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        {/* Resultados */}
        <Box>
          <HStack justify="space-between" align="center" mb="6">
            <Text fontSize="lg" color="text.primary">
              {filteredProducts.length} productos encontrados
            </Text>
            {cartItems.length > 0 && (
              <Button
                leftIcon={<Icon icon={ShoppingBagIcon} size="sm" />}
                colorPalette="orange"
                variant="solid"
              >
                Carrito ({cartItems.length})
              </Button>
            )}
          </HStack>
          
          <Grid 
            templateColumns={{ 
              base: "1fr", 
              md: "repeat(2, 1fr)", 
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)" 
            }} 
            gap="6"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </Grid>
          
          {filteredProducts.length === 0 && (
            <VStack gap="4" py="12">
              <Icon icon={ShoppingBagIcon} size="2xl" color="text.muted" />
              <VStack gap="2">
                <Text fontSize="lg" fontWeight="medium" color="text.secondary">
                  No encontramos productos
                </Text>
                <Text fontSize="md" color="text.muted">
                  Intenta con otros términos de búsqueda o categoría
                </Text>
              </VStack>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todos');
                }}
              >
                Limpiar Filtros
              </Button>
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
}

export default CustomerMenu;