// Clean Recipe Form - Optimized for G-Admin Mini
import {
  Box,
  Button,
  Textarea,
  Text,
  NumberInput,
  IconButton,
  Flex,
  Badge,
  Alert,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { useState, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  TrashIcon,
  BeakerIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useRecipes } from '../hooks/useRecipes';
import { MaterialSelector } from '@/shared/components/MaterialSelector';
import type { MaterialItem, MeasurableItem, CountableItem } from '@/modules/materials/types';
import type { Recipe } from '../types';
import { CardWrapper, Stack, Icon, InputField } from '@/shared/ui';
interface RecipeFormProps {
  recipe?: Recipe;
  onSave?: (recipe: Recipe) => void;
  onCancel?: () => void;
}

interface RecipeIngredient {
  id: string;
  item_id: string;
  quantity: number;
  unit: string;
  cost: number;
  material?: MaterialItem;
}

// Conversiones de unidades comunes para medibles
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  'kg': { 'kg': 1, 'g': 1000, 'gr': 1000 },
  'l': { 'l': 1, 'ml': 1000, 'cc': 1000 },
  'm': { 'm': 1, 'cm': 100, 'mm': 1000 }
};

const getAvailableUnits = (baseUnit: string): string[] => {
  return Object.keys(UNIT_CONVERSIONS[baseUnit] || { [baseUnit]: 1 });
};

const convertUnits = (value: number, fromUnit: string, toUnit: string): number => {
  if (fromUnit === toUnit) return value;
  
  // Buscar el factor de conversión
  for (const baseUnit in UNIT_CONVERSIONS) {
    const conversions = UNIT_CONVERSIONS[baseUnit];
    if (conversions[fromUnit] && conversions[toUnit]) {
      // Convertir a unidad base y luego a unidad objetivo
      const baseValue = value / conversions[fromUnit];
      return baseValue * conversions[toUnit];
    }
  }
  
  return value; // Si no hay conversión disponible, devolver el valor original
};

export const RecipeFormClean: React.FC<RecipeFormProps> = ({
  recipe,
  onSave,
  onCancel
}) => {
  const { createRecipe, updateRecipe, isLoading } = useRecipes();
  
  const [form, setForm] = useState({
    name: recipe?.name || '',
    instructions: recipe?.instructions || '',
    preparation_time: recipe?.preparation_time || 30,
    output_quantity: recipe?.output_quantity || 1
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipe?.recipe_ingredients?.map(ing => ({
      id: ing.id,
      item_id: ing.item_id,
      quantity: ing.quantity,
      unit: ing.unit || 'unidad',
      cost: ing.cost || 0,
      material: ing.item
    })) || []
  );

  const [currentMaterial, setCurrentMaterial] = useState<MaterialItem | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [currentUnit, setCurrentUnit] = useState<string>('');

  // Cálculo del costo total
  const totalCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => sum + ing.cost, 0);
  }, [ingredients]);

  const handleFormChange = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMaterialSelected = useCallback((material: MaterialItem) => {
    setCurrentMaterial(material);
    setCurrentQuantity(1);
    
    // Configurar unidad por defecto según el tipo
    if (material.type === 'MEASURABLE') {
      const measurable = material as MeasurableItem;
      setCurrentUnit(measurable.unit);
    } else if (material.type === 'COUNTABLE') {
      setCurrentUnit('unidad');
    } else {
      setCurrentUnit('porción');
    }
  }, []);

  // Calcular costo previo antes de agregar
  const previewCost = useMemo(() => {
    if (!currentMaterial || currentQuantity <= 0) return 0;

    const unitCost = currentMaterial.unit_cost || 0;
    
    if (currentMaterial.type === 'MEASURABLE') {
      const measurable = currentMaterial as MeasurableItem;
      // Convertir la cantidad a la unidad base del material para calcular el costo
      const baseQuantity = convertUnits(currentQuantity, currentUnit, measurable.unit);
      return baseQuantity * unitCost;
    } else if (currentMaterial.type === 'COUNTABLE') {
      return currentQuantity * unitCost;
    } else {
      return currentQuantity * unitCost;
    }
  }, [currentMaterial, currentQuantity, currentUnit]);

  // Validar disponibilidad de stock para items elaborados
  const stockValidation = useMemo(() => {
    if (!currentMaterial || currentMaterial.type !== 'ELABORATED') {
      return { isValid: true, maxAvailable: Infinity };
    }

    const available = currentMaterial.stock || 0;
    const isValid = currentQuantity <= available;
    
    return { isValid, maxAvailable: available };
  }, [currentMaterial, currentQuantity]);

  const addIngredient = useCallback(() => {
    if (!currentMaterial || currentQuantity <= 0) return;
    
    // Validar stock para items elaborados
    if (currentMaterial.type === 'ELABORATED' && !stockValidation.isValid) {
      return;
    }

    const newIngredient: RecipeIngredient = {
      id: `temp-${Date.now()}`,
      item_id: currentMaterial.id,
      quantity: currentQuantity,
      unit: currentUnit,
      cost: previewCost,
      material: currentMaterial
    };

    setIngredients(prev => [...prev, newIngredient]);
    setCurrentMaterial(null);
    setCurrentQuantity(1);
    setCurrentUnit('');
  }, [currentMaterial, currentQuantity, currentUnit, stockValidation.isValid, previewCost]);

  const removeIngredient = useCallback((index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || ingredients.length === 0) return;

    const recipeData = {
      ...form,
      ingredients: ingredients.map(ing => ({
        item_id: ing.item_id,
        quantity: ing.quantity,
        unit: ing.unit,
        cost: ing.cost
      })),
      total_cost: totalCost
    };

    try {
      if (recipe?.id) {
        const updated = await updateRecipe(recipe.id, recipeData);
        onSave?.(updated);
      } else {
        const created = await createRecipe(recipeData);
        onSave?.(created);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  }, [form, ingredients, totalCost, recipe, createRecipe, updateRecipe, onSave]);

  const isValid = form.name.trim() && ingredients.length > 0;

  const renderQuantityInput = () => {
    if (!currentMaterial) return null;

    const material = currentMaterial;
    
    return (
      <CardWrapper variant="outline" bg="blue.50" borderColor="blue.200">
        <CardWrapper.Body p="4">
          <Stack gap="4">
            <Flex justify="space-between" align="start">
              <Stack gap="1">
                <Text fontSize="sm" fontWeight="semibold" color="blue.800">
                  📏 Configurar: {material.name}
                </Text>
                <Text fontSize="xs" color="blue.600">
                  Stock disponible: {material.stock || 0} {
                    material.type === 'MEASURABLE' 
                      ? (material as MeasurableItem).unit
                      : material.type === 'COUNTABLE' ? 'unidades' : 'porciones'
                  }
                </Text>
              </Stack>
              
              {/* Mostrar costo previo */}
              <Badge colorPalette="green" variant="subtle">
                Costo: ${previewCost.toFixed(2)}
              </Badge>
            </Flex>

            {/* Input de cantidad y unidad */}
            <Flex gap="3" align="end">
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Cantidad
                </Text>
                <NumberInput.Root
                  value={currentQuantity.toString()}
                  onValueChange={(details) => setCurrentQuantity(parseFloat(details.value) || 0)}
                  min={0.1}
                  max={material.type === 'ELABORATED' ? stockValidation.maxAvailable : undefined}
                  step={material.type === 'MEASURABLE' ? 0.1 : 1}
                >
                  <NumberInput.Input />
                </NumberInput.Root>
              </Box>

              {/* Selector de unidad para medibles */}
              {material.type === 'MEASURABLE' && (
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb="2">
                    Unidad
                  </Text>
                  <Select.Root
                    collection={createListCollection({
                      items: getAvailableUnits((material as MeasurableItem).unit).map(unit => ({
                        label: unit,
                        value: unit
                      }))
                    })}
                    value={[currentUnit]}
                    onValueChange={(details) => setCurrentUnit(details.value[0])}
                  >
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.Content>
                      {getAvailableUnits((material as MeasurableItem).unit).map(unit => (
                        <Select.Item key={unit} item={{ label: unit, value: unit }}>
                          {unit}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              )}

              {/* Texto fijo para otros tipos */}
              {material.type !== 'MEASURABLE' && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb="2">
                    Unidad
                  </Text>
                  <Box
                    height="40px"
                    px="3"
                    bg="bg.canvas"
                    border="1px solid"
                    borderColor="border"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    fontSize="sm"
                    color="gray.600"
                    minW="80px"
                  >
                    {currentUnit}
                  </Box>
                </Box>
              )}
              
              <Button
                colorPalette="green"
                onClick={addIngredient}
                disabled={currentQuantity <= 0 || (material.type === 'ELABORATED' && !stockValidation.isValid)}
                height="40px"
              >
                <Icon icon={PlusIcon} size="sm" />
                Agregar
              </Button>
              
              <Button
                onClick={() => setCurrentMaterial(null)}
                variant="outline"
                height="40px"
              >
                Cancelar
              </Button>
            </Flex>

            {/* Advertencia de stock para elaborados */}
            {material.type === 'ELABORATED' && !stockValidation.isValid && (
              <Alert.Root status="warning" size="sm">
                <Alert.Indicator>
                  <ExclamationTriangleIcon style={{ width: '14px', height: '14px' }} />
                </Alert.Indicator>
                <Alert.Description>
                  Stock insuficiente. Máximo disponible: {stockValidation.maxAvailable}
                </Alert.Description>
              </Alert.Root>
            )}
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  };

  return (
    <Box maxW="2xl" mx="auto">
      <CardWrapper>
        <CardWrapper.Header>
          <Flex align="center" gap="3">
            <Icon icon={BeakerIcon} size="lg" />
            <Text fontSize="lg" fontWeight="semibold">
              {recipe ? 'Editar Receta' : 'Nueva Receta'}
            </Text>
          </Flex>
        </CardWrapper.Header>

        <CardWrapper.Body>
          <Stack gap="6">
            {/* Basic Info */}
            <Stack gap="4">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Nombre de la receta *
                </Text>
                <InputField
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="ej. Hamburguesa Clásica"
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Instrucciones de preparación
                </Text>
                <Textarea
                  value={form.instructions}
                  onChange={(e) => handleFormChange('instructions', e.target.value)}
                  placeholder="1. Paso uno&#10;2. Paso dos&#10;3. Paso tres..."
                  rows={4}
                  resize="vertical"
                />
              </Box>

              <Flex gap="4">
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb="2">
                    Tiempo de preparación (min)
                  </Text>
                  <NumberInput.Root
                    value={form.preparation_time.toString()}
                    onValueChange={(e) => handleFormChange('preparation_time', parseInt(e.value) || 30)}
                    min={1}
                    max={300}
                  >
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Box>

                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb="2">
                    Porciones a producir
                  </Text>
                  <NumberInput.Root
                    value={form.output_quantity.toString()}
                    onValueChange={(e) => handleFormChange('output_quantity', parseInt(e.value) || 1)}
                    min={1}
                  >
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Box>
              </Flex>
            </Stack>

            {/* Ingredients */}
            <Stack gap="4">
              <Flex justify="space-between" align="center">
                <Text fontSize="md" fontWeight="semibold">
                  Ingredientes
                </Text>
                {totalCost > 0 && (
                  <Badge colorPalette="blue" variant="solid">
                    Costo Total: ${totalCost.toFixed(2)}
                  </Badge>
                )}
              </Flex>

              {/* Add Ingredient */}
              {!currentMaterial ? (
                <Stack gap="3">
                  <Text fontSize="sm" color="gray.600">
                    Selecciona una materia prima para agregar:
                  </Text>
                  <MaterialSelector
                    onMaterialSelected={handleMaterialSelected}
                    placeholder="Buscar materia prima..."
                    filterByStock={false} // Permitir seleccionar aunque no tenga stock (validaremos después)
                    excludeIds={ingredients.map(ing => ing.item_id)}
                  />
                </Stack>
              ) : (
                renderQuantityInput()
              )}

              {/* Ingredients List */}
              {ingredients.length > 0 && (
                <Stack gap="2">
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Ingredientes agregados ({ingredients.length})
                  </Text>
                  
                  {ingredients.map((ingredient, index) => (
                    <CardWrapper key={ingredient.id} variant="outline" size="sm">
                      <CardWrapper.Body p="3">
                        <Flex justify="space-between" align="center">
                          <Stack gap="0" flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              {ingredient.material?.name}
                            </Text>
                            <Flex gap="4" align="center">
                              <Text fontSize="xs" color="gray.600">
                                {ingredient.quantity} {ingredient.unit}
                              </Text>
                              <Badge colorPalette="green" size="sm" variant="subtle">
                                ${ingredient.cost.toFixed(2)}
                              </Badge>
                            </Flex>
                          </Stack>
                          
                          <IconButton
                            variant="ghost"
                            colorPalette="red"
                            size="sm"
                            onClick={() => removeIngredient(index)}
                          >
                            <Icon icon={TrashIcon} size="sm" />
                          </IconButton>
                        </Flex>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </Stack>
              )}
            </Stack>

            {/* Actions */}
            <Flex gap="3" justify="end">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
              )}
              
              <Button
                colorPalette="blue"
                onClick={handleSave}
                isLoading={isLoading}
                disabled={!isValid}
              >
                {recipe ? 'Actualizar' : 'Crear'} Receta
              </Button>
            </Flex>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    </Box>
  );
};