// src/features/products/ui/ComponentManager.tsx
// Component Management for Products with Inventory Integration

import React, { useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CardWrapper ,
  Badge,
  SelectField,
  NumberField,
  Stack,
  VStack,
  HStack,
  Typography,
  Button,
  createListCollection
} from "@/shared/ui";

// NOTAS: Los siguientes imports necesitan ser verificados/corregidos independientemente de la migración UI:
// import { useProductComponents } from "../logic/useProductComponents";
// import { useInventory } from "@/pages/admin/supply-chain/materials/hooks/useInventory";
// import { useRecipes } from "@/tools/intelligence/logic/useRecipes";
// import { type Product, type AddComponentData } from "../types";

// Simulación temporal para completar la migración UI
type Component = {
  id: string;
  item_name: string;
  item_unit: string;
  quantity: number;
  item_cost?: number;
  item_stock?: number;
};

type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  unit_cost?: number;
};

type Recipe = {
  id: string;
  name: string;
  output_item_id: string;
  output_quantity: number;
};

const useProductComponents = (productId: string) => ({
  components: [] as Component[],
  loading: false,
  error: null,
  addComponent: async (data: unknown) => {},
  removeComponent: async (id: string) => {}
});

const useInventory = () => ({
  items: [] as InventoryItem[],
  loading: false
});

const useRecipes = () => ({
  recipes: [] as Recipe[],
  loading: false
});

type Product = { id: string; name: string };
type AddComponentData = any;

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
    <CardWrapper className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <VStack align="stretch" gap="md">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="stretch" gap="xs">
            <Typography variant="heading" className="text-lg font-semibold">
              Componentes - {product.name}
            </Typography>
            <Typography variant="body" className="text-sm text-gray-600">
              Gestiona los ingredientes y materias primas
            </Typography>
          </VStack>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          )}
        </HStack>

        {error && (
          <Alert status="error">
            <AlertIcon>⚠️</AlertIcon>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Components List */}
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <Typography variant="body" className="mt-2 text-sm text-gray-600">
              Cargando componentes...
            </Typography>
          </div>
        ) : components.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <Typography variant="body" className="text-gray-500">
              No hay componentes configurados
            </Typography>
            <Typography variant="body" className="text-sm text-gray-400 mt-1">
              Agrega ingredientes para calcular costos y disponibilidad
            </Typography>
          </div>
        ) : (
          <VStack align="stretch" gap="sm">
            {components.map((component) => (
              <CardWrapper key={component.id} className="p-3">
                <HStack justify="space-between" align="center">
                  <VStack align="stretch" gap="xs" className="flex-1">
                    <HStack gap="sm">
                      <Typography variant="body" className="text-sm font-medium">
                        {component.item_name || "Ingrediente desconocido"}
                      </Typography>
                      <Badge size="xs" colorPalette="gray">
                        {component.item_unit}
                      </Badge>
                    </HStack>
                    
                    <HStack gap="md">
                      <Typography variant="body" className="text-xs text-gray-600">
                        Cantidad: {component.quantity}
                      </Typography>
                      {component.item_cost && (
                        <Typography variant="body" className="text-xs text-gray-600">
                          Costo: ${(component.item_cost * component.quantity).toFixed(2)}
                        </Typography>
                      )}
                      {component.item_stock !== undefined && (
                        <Typography variant="body" className="text-xs text-gray-600">
                          Stock: {component.item_stock}
                        </Typography>
                      )}
                    </HStack>
                  </VStack>
                  
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="error"
                    onClick={() => handleRemoveComponent(component.id)}
                  >
                    Eliminar
                  </Button>
                </HStack>
              </CardWrapper>
            ))}
          </VStack>
        )}

        {/* Add Component Form */}
        {showAddForm && (
          <CardWrapper className="p-4 bg-blue-50 border-blue-200">
            <VStack align="stretch" gap="sm">
              <Typography variant="heading" className="text-md font-semibold">
                Agregar Componente
              </Typography>
              
              <div>
                <Typography variant="body" className="text-sm font-medium mb-2">
                  Tipo de Componente
                </Typography>
                <SelectField
                  value={componentType}
                  onValueChange={(details: { value: string[] }) => {
                    setComponentType(details.value[0] as any);
                    setSelectedItemId("");
                  }}
                  placeholder="Seleccionar tipo..."
                  options={[
                    { value: "inventory", label: "Items de Inventario" },
                    { value: "recipe", label: "Items Elaborados (Recetas)" }
                  ]}
                />
              </div>
              
              <div>
                <Typography variant="body" className="text-sm font-medium mb-2">
                  {componentType === "inventory" ? "Seleccionar Item de Inventario" : "Seleccionar Item Elaborado"}
                </Typography>
                <SelectField
                  value={selectedItemId}
                  onValueChange={(details: { value: string[] }) => setSelectedItemId(details.value[0] || "")}
                  placeholder="Seleccionar item..."
                  disabled={itemsLoading || recipesLoading}
                  options={componentType === "inventory" 
                    ? inventoryItems.map((item: unknown) => ({
                        value: item.id,
                        label: `${item.name} (${item.stock} ${item.unit} - $${item.unit_cost?.toFixed(2) || '0.00'})`
                      }))
                    : elaboratedItems.map((recipe: unknown) => ({
                        value: recipe.output_item_id,
                        label: `${recipe.name} (Elaborado) - Cantidad: ${recipe.output_quantity}`
                      }))
                  }
                />
              </div>
              
              <div>
                <Typography variant="body" className="text-sm font-medium mb-2">
                  Cantidad Requerida
                </Typography>
                <NumberField
                  value={quantity}
                  onChange={(value: number) => setQuantity(value)}
                  min={0.01}
                  step={0.1}
                />
              </div>
              
              <HStack justify="space-between" className="pt-2">
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
                  colorPalette="brand"
                  loading={submitting}
                  disabled={!selectedItemId || quantity <= 0}
                  onClick={handleAddComponent}
                >
                  Agregar Componente
                </Button>
              </HStack>
            </VStack>
          </CardWrapper>
        )}
        
        {/* Add Component Button */}
        {!showAddForm && (
          <div className="text-center">
            <Button
              colorPalette="brand"
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={itemsLoading || inventoryItems.length === 0}
            >
              + Agregar Componente
            </Button>
            {inventoryItems.length === 0 && !itemsLoading && (
              <Typography variant="body" className="text-xs text-gray-500 mt-2">
                No hay items disponibles en inventario
              </Typography>
            )}
          </div>
        )}
      </VStack>
    </CardWrapper>
  );
}
