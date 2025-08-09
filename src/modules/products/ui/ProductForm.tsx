// src/features/products/ui/ProductForm.tsx
// Product Creation and Editing Form with ChakraUI v3

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  Select,
  Text,
  Alert,
  Card,
  Badge,
  Spinner,
  createListCollection
} from "@chakra-ui/react";
import { useProductComponents } from "../logic/useProductComponents";
import { getProductCost, getProductAvailability } from "../data/productApi";
import { type CreateProductData, type UpdateProductData, type Product, PRODUCT_TYPES } from "../types";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    unit: product?.unit || "",
    type: product?.type || "ELABORATED",
    description: product?.description || ""
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costData, setCostData] = useState({ cost: 0, availability: 0, loading: false });
  
  // Get components if editing existing product
  const { components } = useProductComponents(product?.id || "");

  const productTypeCollection = createListCollection({
    items: PRODUCT_TYPES.map(type => ({ value: type.value, label: type.label }))
  });

  // Load cost and availability data for existing products
  useEffect(() => {
    if (product?.id) {
      setCostData(prev => ({ ...prev, loading: true }));
      Promise.all([
        getProductCost(product.id),
        getProductAvailability(product.id)
      ]).then(([cost, availability]) => {
        setCostData({ cost, availability, loading: false });
      }).catch(err => {
        console.error("Error loading product analytics:", err);
        setCostData(prev => ({ ...prev, loading: false }));
      });
    }
  }, [product?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (product) {
        await onSubmit({ id: product.id, ...formData });
      } else {
        await onSubmit(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
      <VStack align="stretch" gap={4}>
        <Text fontSize="lg" fontWeight="semibold">
          {product ? "Editar Producto" : "Nuevo Producto"}
        </Text>

        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Nombre del Producto *
              </Text>
              <Input
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="Ej: Pizza Margherita"
                required
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Unidad de Medida
              </Text>
              <Input
                value={formData.unit}
                onChange={handleInputChange("unit")}
                placeholder="Ej: unidad, porción, kg"
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Tipo de Producto *
              </Text>
              <Select.Root 
                collection={productTypeCollection}
                value={[formData.type]}
                onValueChange={(details) => setFormData(prev => ({ ...prev, type: details.value[0] as any }))}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {productTypeCollection.items.map((type) => (
                    <Select.Item key={type.value} item={type}>
                      {type.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Descripción
              </Text>
              <Textarea
                value={formData.description}
                onChange={handleInputChange("description")}
                placeholder="Descripción detallada del producto"
                rows={3}
              />
            </Box>

            {/* Cost Analytics Card - Only for existing products */}
            {product && (
              <Card.Root p={4} bg="gray.50" borderColor="gray.200">
                <VStack align="stretch" gap={3}>
                  <Text fontSize="md" fontWeight="semibold">Análisis de Costos y Disponibilidad</Text>
                  
                  {costData.loading ? (
                    <HStack justify="center" py={2}>
                      <Spinner size="sm" />
                      <Text fontSize="sm" color="gray.600">Calculando...</Text>
                    </HStack>
                  ) : (
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Costo Total:</Text>
                        <Badge colorPalette="green" size="sm">
                          ${costData.cost.toFixed(2)}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Disponibilidad:</Text>
                        <Badge 
                          colorPalette={costData.availability > 0 ? "green" : "red"} 
                          size="sm"
                        >
                          {costData.availability} unidades
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Componentes:</Text>
                        <Badge colorPalette="blue" size="sm">
                          {components.length} items
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Estado:</Text>
                        <Badge 
                          colorPalette={costData.availability > 0 ? "green" : "yellow"} 
                          size="sm"
                        >
                          {costData.availability > 0 ? "Listo para producir" : "Requiere componentes"}
                        </Badge>
                      </HStack>
                    </VStack>
                  )}
                </VStack>
              </Card.Root>
            )}

            <HStack justify="space-between" pt={4}>
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                colorPalette="blue"
                loading={isSubmitting || loading}
              >
                {product ? "Actualizar Producto" : "Crear Producto"}
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
