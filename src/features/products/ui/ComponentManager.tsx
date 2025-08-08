// src/features/products/ui/ComponentManager.tsx
// Component Management for Products with Inventory Integration

import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Alert,
  Card,
  Badge,
  Spinner,
  Select,
  NumberInput,
  createListCollection
} from "@chakra-ui/react";
import { useProductComponents } from "../logic/useProductComponents";
import { useInventory } from "@/features/inventory/logic/useInventory";
import { useRecipes } from "@/features/recipes/logic/useRecipes";
import { type Product, type AddComponentData } from "../types";

interface ComponentManagerProps {
  product: Product;
  onClose?: () => void;
}

export function ComponentManager({ product, onClose }: ComponentManagerProps) {
  const { components, loading, error, addComponent, removeComponent } = useProductComponents(product.id);
  const { items: inventoryItems, loading: itemsLoading } = useInventory();
  const { recipes, loading: recipesLoading } = useRecipes();
  const [showAddForm, setShowAddForm] = useState(false);
  const [componentType, setComponentType] = useState<"inventory" | "recipe">("inventory");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Get elaborated items from recipes (recipes that create inventory items)
  const elaboratedItems = recipes.filter(recipe => recipe.output_item_id);

  const handleRemoveComponent = async (componentId: string) => {
    if (confirm("¿Confirma eliminar este componente?")) {
      await removeComponent(componentId);
    }
  };

  const handleAddComponent = async () => {
    if (!selectedItemId || quantity <= 0) return;

    try {
      setSubmitting(true);
      await addComponent({
        product_id: product.id,
        item_id: selectedItemId,
        quantity
      });
      
      // Reset form
      setShowAddForm(false);
      setComponentType("inventory");
      setSelectedItemId("");
      setQuantity(1);
    } catch (err) {
      console.error("Error adding component:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
      <VStack align="stretch" gap={4}>
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="stretch" gap={1}>
            <Text fontSize="lg" fontWeight="semibold">
              Componentes - {product.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Gestiona los ingredientes y materias primas
            </Text>
          </VStack>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          )}
        </HStack>

        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        {/* Components List */}
        {loading ? (
          <Box textAlign="center" py={4}>
            <Spinner size="sm" />
            <Text mt={2} fontSize="sm" color="gray.600">Cargando componentes...</Text>
          </Box>
        ) : components.length === 0 ? (
          <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
            <Text color="gray.500">No hay componentes configurados</Text>
            <Text fontSize="sm" color="gray.400" mt={1}>
              Agrega ingredientes para calcular costos y disponibilidad
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" gap={2}>
            {components.map((component) => (
              <Card.Root key={component.id} p={3}>
                <HStack justify="space-between" align="center">
                  <VStack align="stretch" gap={1} flex={1}>
                    <HStack gap={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        {component.item_name || "Ingrediente desconocido"}
                      </Text>
                      <Badge size="xs" colorPalette="gray">
                        {component.item_unit}
                      </Badge>
                    </HStack>
                    
                    <HStack gap={4}>
                      <Text fontSize="xs" color="gray.600">
                        Cantidad: {component.quantity}
                      </Text>
                      {component.item_cost && (
                        <Text fontSize="xs" color="gray.600">
                          Costo: ${(component.item_cost * component.quantity).toFixed(2)}
                        </Text>
                      )}
                      {component.item_stock !== undefined && (
                        <Text fontSize="xs" color="gray.600">
                          Stock: {component.item_stock}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                  
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => handleRemoveComponent(component.id)}
                  >
                    Eliminar
                  </Button>
                </HStack>
              </Card.Root>
            ))}
          </VStack>
        )}

        {/* Add Component Form */}
        {showAddForm && (
          <Card.Root p={4} bg="blue.50" borderColor="blue.200">
            <VStack align="stretch" gap={3}>
              <Text fontSize="md" fontWeight="semibold">Agregar Componente</Text>
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Tipo de Componente</Text>
                <Select.Root
                  collection={createListCollection({
                    items: [
                      { value: "inventory", label: "Items de Inventario" },
                      { value: "recipe", label: "Items Elaborados (Recetas)" }
                    ]
                  })}
                  value={[componentType]}
                  onValueChange={(details) => {
                    setComponentType(details.value[0] as any);
                    setSelectedItemId("");
                  }}
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item item={{ value: "inventory", label: "Items de Inventario" }}>
                      Items de Inventario
                    </Select.Item>
                    <Select.Item item={{ value: "recipe", label: "Items Elaborados (Recetas)" }}>
                      Items Elaborados (Recetas)
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </Box>
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  {componentType === "inventory" ? "Seleccionar Item de Inventario" : "Seleccionar Item Elaborado"}
                </Text>
                <Select.Root
                  collection={createListCollection({
                    items: componentType === "inventory" 
                      ? inventoryItems.map(item => ({
                          value: item.id,
                          label: `${item.name} (${item.stock} ${item.unit} - $${item.unit_cost?.toFixed(2) || '0.00'})`
                        }))
                      : elaboratedItems.map(recipe => ({
                          value: recipe.output_item_id,
                          label: `${recipe.name} (Elaborado) - Cantidad: ${recipe.output_quantity}`
                        }))
                  })}
                  value={selectedItemId ? [selectedItemId] : []}
                  onValueChange={(details) => setSelectedItemId(details.value[0] || "")}
                  disabled={itemsLoading || recipesLoading}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Seleccionar item..." />
                  </Select.Trigger>
                  <Select.Content>
                    {componentType === "inventory" 
                      ? inventoryItems.map((item) => (
                          <Select.Item key={item.id} item={{ value: item.id, label: `${item.name} (${item.stock} ${item.unit} - $${item.unit_cost?.toFixed(2) || '0.00'})` }}>
                            <VStack align="stretch" gap={1}>
                              <Text fontSize="sm" fontWeight="medium">{item.name}</Text>
                              <HStack gap={2}>
                                <Badge size="xs" colorPalette="blue">Stock: {item.stock}</Badge>
                                <Badge size="xs" colorPalette="green">${item.unit_cost?.toFixed(2) || '0.00'}/{item.unit}</Badge>
                              </HStack>
                            </VStack>
                          </Select.Item>
                        ))
                      : elaboratedItems.map((recipe) => (
                          <Select.Item key={recipe.id} item={{ value: recipe.output_item_id, label: `${recipe.name} (Elaborado) - Cantidad: ${recipe.output_quantity}` }}>
                            <VStack align="stretch" gap={1}>
                              <Text fontSize="sm" fontWeight="medium">{recipe.name}</Text>
                              <HStack gap={2}>
                                <Badge size="xs" colorPalette="purple">Elaborado</Badge>
                                <Badge size="xs" colorPalette="orange">Cantidad: {recipe.output_quantity}</Badge>
                              </HStack>
                            </VStack>
                          </Select.Item>
                        ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Cantidad Requerida</Text>
                <NumberInput.Root
                  value={quantity.toString()}
                  onValueChange={(e) => setQuantity(parseFloat(e.value) || 0)}
                  min={0.01}
                  step={0.1}
                >
                  <NumberInput.Field />
                  <NumberInput.Control>
                    <NumberInput.IncrementTrigger />
                    <NumberInput.DecrementTrigger />
                  </NumberInput.Control>
                </NumberInput.Root>
              </Box>
              
              <HStack justify="space-between" pt={2}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setComponentType("inventory");
                    setSelectedItemId("");
                    setQuantity(1);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  colorPalette="blue"
                  loading={submitting}
                  disabled={!selectedItemId || quantity <= 0}
                  onClick={handleAddComponent}
                >
                  Agregar Componente
                </Button>
              </HStack>
            </VStack>
          </Card.Root>
        )}
        
        {/* Add Component Button */}
        {!showAddForm && (
          <Box textAlign="center">
            <Button
              colorPalette="blue"
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={itemsLoading || inventoryItems.length === 0}
            >
              + Agregar Componente
            </Button>
            {inventoryItems.length === 0 && !itemsLoading && (
              <Text fontSize="xs" color="gray.500" mt={2}>
                No hay items disponibles en inventario
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
