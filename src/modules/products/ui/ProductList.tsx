// src/features/products/ui/ProductList.tsx
// Product List with Intelligence Display

import React from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Card,
  Spinner,
  Alert,
  Grid
} from "@chakra-ui/react";
import { VirtualizedList } from "@/lib/performance/virtualization/VirtualizedList";
import { type ProductWithIntelligence } from "../types";

interface ProductListProps {
  products: ProductWithIntelligence[];
  loading: boolean;
  error: string | null;
  onEdit?: (product: ProductWithIntelligence) => void;
  onDelete?: (productId: string) => void;
  onManageComponents?: (product: ProductWithIntelligence) => void;
}

export function ProductList({ 
  products, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onManageComponents 
}: ProductListProps) {
  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4} color="gray.600">Cargando productos...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>Error al cargar productos</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    );
  }

  if (products.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Text fontSize="lg" color="gray.500" mb={4}>
          No hay productos registrados
        </Text>
        <Text color="gray.400">
          Comienza creando tu primer producto
        </Text>
      </Box>
    );
  }

  const getAvailabilityColor = (availability: number) => {
    if (availability === 0) return "red";
    if (availability <= 5) return "yellow";
    return "green";
  };

  const getAvailabilityLabel = (availability: number) => {
    if (availability === 0) return "Sin Stock";
    if (availability <= 5) return "Stock Bajo";
    return "Disponible";
  };

  // Use virtualization for large product lists (>30 products)
  if (products.length > 30) {
    return (
      <VStack align="stretch" gap={4}>
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            Productos ({products.length})
          </Text>
          <Text fontSize="sm" color="gray.600">
            Lista de productos con información de costos y disponibilidad
          </Text>
        </Box>

        <Box h="calc(100vh - 200px)">
          <VirtualizedList
            items={products}
            itemHeight={320}
            containerHeight={window.innerHeight - 200}
            renderItem={(product, index, style) => (
              <Box px={2} pb={4}>
                <Card.Root p={4} shadow="sm">
                  <VStack align="stretch" gap={3}>
                    {/* Header */}
                    <HStack justify="space-between" align="flex-start">
                      <VStack align="stretch" gap={1} flex={1}>
                        <Text fontSize="md" fontWeight="semibold">
                          {product.name}
                        </Text>
                        {product.unit && (
                          <Text fontSize="xs" color="gray.500">
                            Unidad: {product.unit}
                          </Text>
                        )}
                      </VStack>
                      <Badge colorPalette="blue" size="sm">
                        {product.type}
                      </Badge>
                    </HStack>

                    {/* Description */}
                    {product.description && (
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {product.description}
                      </Text>
                    )}

                    {/* Intelligence Metrics */}
                    <VStack align="stretch" gap={2}>
                      {/* Cost */}
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Costo:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          ${product.cost.toFixed(2)}
                        </Text>
                      </HStack>

                      {/* Availability */}
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Disponibilidad:</Text>
                        <HStack gap={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {product.availability}
                          </Text>
                          <Badge 
                            colorPalette={getAvailabilityColor(product.availability)} 
                            size="xs"
                          >
                            {getAvailabilityLabel(product.availability)}
                          </Badge>
                        </HStack>
                      </HStack>

                      {/* Components */}
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Componentes:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {product.components_count}
                        </Text>
                      </HStack>

                      {/* Production Status */}
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Estado:</Text>
                        <Badge 
                          colorPalette={product.production_ready ? "green" : "gray"}
                          size="xs"
                        >
                          {product.production_ready ? "Listo para producir" : "Requiere configuración"}
                        </Badge>
                      </HStack>
                    </VStack>

                    {/* Actions */}
                    <VStack align="stretch" gap={2} pt={2}>
                      {onManageComponents && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onManageComponents(product)}
                        >
                          Gestionar Componentes ({product.components_count})
                        </Button>
                      )}
                      
                      <HStack gap={2}>
                        {onEdit && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            flex={1}
                            onClick={() => onEdit(product)}
                          >
                            Editar
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            colorPalette="red"
                            flex={1}
                            onClick={() => onDelete(product.id)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </VStack>
                </Card.Root>
              </Box>
            )}
            overscan={3}
            hasMore={false}
            loading={false}
          />
        </Box>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          Productos ({products.length})
        </Text>
        <Text fontSize="sm" color="gray.600">
          Lista de productos con información de costos y disponibilidad
        </Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
        {products.map((product) => (
          <Card.Root key={product.id} p={4} shadow="sm">
            <VStack align="stretch" gap={3}>
              {/* Header */}
              <HStack justify="space-between" align="flex-start">
                <VStack align="stretch" gap={1} flex={1}>
                  <Text fontSize="md" fontWeight="semibold">
                    {product.name}
                  </Text>
                  {product.unit && (
                    <Text fontSize="xs" color="gray.500">
                      Unidad: {product.unit}
                    </Text>
                  )}
                </VStack>
                <Badge colorPalette="blue" size="sm">
                  {product.type}
                </Badge>
              </HStack>

              {/* Description */}
              {product.description && (
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  {product.description}
                </Text>
              )}

              {/* Intelligence Metrics */}
              <VStack align="stretch" gap={2}>
                {/* Cost */}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Costo:</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    ${product.cost.toFixed(2)}
                  </Text>
                </HStack>

                {/* Availability */}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Disponibilidad:</Text>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      {product.availability}
                    </Text>
                    <Badge 
                      colorPalette={getAvailabilityColor(product.availability)} 
                      size="xs"
                    >
                      {getAvailabilityLabel(product.availability)}
                    </Badge>
                  </HStack>
                </HStack>

                {/* Components */}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Componentes:</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {product.components_count}
                  </Text>
                </HStack>

                {/* Production Status */}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Estado:</Text>
                  <Badge 
                    colorPalette={product.production_ready ? "green" : "gray"}
                    size="xs"
                  >
                    {product.production_ready ? "Listo para producir" : "Requiere configuración"}
                  </Badge>
                </HStack>
              </VStack>

              {/* Actions */}
              <VStack align="stretch" gap={2} pt={2}>
                {onManageComponents && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onManageComponents(product)}
                  >
                    Gestionar Componentes ({product.components_count})
                  </Button>
                )}
                
                <HStack gap={2}>
                  {onEdit && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      flex={1}
                      onClick={() => onEdit(product)}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      colorPalette="red"
                      flex={1}
                      onClick={() => onDelete(product.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </HStack>
              </VStack>
            </VStack>
          </Card.Root>
        ))}
      </Grid>
    </VStack>
  );
}
