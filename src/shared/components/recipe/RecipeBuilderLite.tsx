// Unified Recipe Builder Lite - Works for both products and materials
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  Stack,
  Flex,
  Badge,
  Input,
  NumberInput,
  Select,
  IconButton,
  Field,
  Textarea,
  createListCollection
} from '@chakra-ui/react';
import { 
  ArrowTopRightOnSquareIcon, 
  CurrencyDollarIcon, 
  BeakerIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { recipeService, type Recipe, type RecipeIngredient } from '@/services/recipe';
import { MaterialSelector } from '../MaterialSelector';
import type { MaterialItem, MeasurableItem, CountableItem } from '@/modules/materials/types';
import { CardWrapper, Icon } from '@/shared/ui';
interface RecipeBuilderLiteProps {
  mode: 'product' | 'material';
  onRecipeCreated?: (recipe: Recipe) => void;
  onCostChange?: (cost: number) => void;
  showPricing?: boolean;
  context?: string;
  className?: string;
}

export const RecipeBuilderLite: React.FC<RecipeBuilderLiteProps> = ({
  mode,
  onRecipeCreated,
  onCostChange,
  showPricing,
  context,
  className
}) => {
  const { navigate } = useNavigation();
  const [recipe, setRecipe] = useState<Partial<Recipe>>(() => 
    recipeService.getRecipeTemplate(mode)
  );
  
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Estado para el flujo guiado de ingredientes
  const [currentIngredient, setCurrentIngredient] = useState<{
    material: MaterialItem | null;
    quantity: number;
    isComplete: boolean;
  }>({
    material: null,
    quantity: 0,
    isComplete: false
  });

  // Auto-calculate costs and portions when ingredients change
  useEffect(() => {
    if (ingredients.length > 0) {
      setIsCalculating(true);
      const totalCost = ingredients.reduce(
        (sum, ing) => sum + ing.cost, 
        0
      );
      
      // Calculate portions automatically (each ingredient = 1 portion, or custom logic)
      const calculatedPortions = Math.max(1, ingredients.length);
      
      setRecipe(prev => ({ 
        ...prev, 
        totalCost,
        servingSize: calculatedPortions,
        costPerServing: totalCost / calculatedPortions
      }));
      
      onCostChange?.(totalCost);
      setIsCalculating(false);
    } else {
      // Reset when no ingredients
      setRecipe(prev => ({ 
        ...prev, 
        totalCost: 0,
        servingSize: 1,
        costPerServing: 0
      }));
      onCostChange?.(0);
    }
  }, [ingredients, onCostChange]);

  const handleMaterialSelected = (material: MaterialItem) => {
    setCurrentIngredient({
      material,
      quantity: 0,
      isComplete: false
    });
  };

  const handleQuantitySet = (quantity: number) => {
    if (!currentIngredient.material) return;

    // Calcular costo según el tipo de material
    let cost = 0;
    const material = currentIngredient.material;
    
    if (material.unit_cost) {
      cost = material.unit_cost * quantity;
    }

    const newIngredient: RecipeIngredient = {
      id: `ing-${Date.now()}`,
      name: material.name,
      quantity,
      unit: getUnitFromMaterial(material),
      cost,
      notes: `Material ID: ${material.id}`
    };
    
    setIngredients(prev => [...prev, newIngredient]);
    
    // Reset current ingredient
    setCurrentIngredient({
      material: null,
      quantity: 0,
      isComplete: false
    });
  };

  const getUnitFromMaterial = (material: MaterialItem): string => {
    if (material.type === 'MEASURABLE') {
      return (material as MeasurableItem).unit;
    } else if (material.type === 'COUNTABLE') {
      return 'unidad';
    } else {
      return 'porción';
    }
  };

  const startNewIngredient = () => {
    setCurrentIngredient({
      material: null,
      quantity: 0,
      isComplete: false
    });
  };

  const renderQuantityInput = () => {
    if (!currentIngredient.material) return null;

    const material = currentIngredient.material;
    const unit = getUnitFromMaterial(material);

    return (
      <CardWrapper variant="outline" bg="blue.50" borderColor="blue.200">
        <CardWrapper.Body p="4">
          <Stack gap="3">
            <Text fontSize="sm" fontWeight="semibold" color="blue.800">
              📏 Cantidad necesaria de {material.name}
            </Text>
            
            <Flex gap="4" align="end">
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Cantidad a usar
                </Text>
                <Flex>
                  <NumberInput.Root
                    value={currentIngredient.quantity.toString()}
                    onValueChange={(details) => 
                      setCurrentIngredient(prev => ({
                        ...prev,
                        quantity: parseFloat(details.value) || 0
                      }))
                    }
                    min={0}
                    allowDecimal={material.type === 'MEASURABLE'}
                    width="full"
                  >
                    <NumberInput.Control>
                      <NumberInput.IncrementTrigger />
                      <NumberInput.DecrementTrigger />
                    </NumberInput.Control>
                    <NumberInput.Input 
                      height="44px"
                      fontSize="md"
                      px="3"
                      borderRadius="md"
                      borderRightRadius="0"
                    />
                  </NumberInput.Root>
                  <Box 
                    height="44px"
                    px="3"
                    bg="bg.canvas"
                    border="1px solid"
                    borderColor="border"
                    borderLeft="0"
                    borderRightRadius="md"
                    display="flex"
                    alignItems="center"
                    fontSize="sm"
                    color="text.muted"
                    fontWeight="medium"
                  >
                    {unit}
                  </Box>
                </Flex>
              </Box>

              <Button
                colorPalette="blue"
                onClick={() => handleQuantitySet(currentIngredient.quantity)}
                disabled={currentIngredient.quantity <= 0}
                height="44px"
              >
                ✓ Confirmar
              </Button>
            </Flex>

            {/* Mostrar stock disponible */}
            <Text fontSize="xs" color="blue.600">
              💡 Stock disponible: {material.stock} {unit}
            </Text>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    setIngredients(prev => prev.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateRecipe = () => {
    const completeRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      type: mode,
      ingredients,
      totalCost: recipe.totalCost || 0,
      costPerServing: recipe.costPerServing || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user' // Should come from auth context
    } as Recipe;

    // Validate recipe
    const validation = recipeService.validateRecipe(completeRecipe);
    if (!validation.isValid) {
      alert(`Error: ${validation.errors.join(', ')}`);
      return;
    }

    onRecipeCreated?.(completeRecipe);
  };

  const openFullRecipeBuilder = () => {
    // Will redirect to new dashboard location after navigation restructure
    navigate('dashboard', '/recipes');
  };

  const getIcon = () => {
    return mode === 'product' 
      ? '🍔'
      : '🧪';
  };

  const getTitle = () => {
    return mode === 'product' 
      ? 'Constructor de Recetas - Productos'
      : 'Constructor de Recetas - Materiales';
  };

  const calculations = recipe.totalCost 
    ? recipeService.calculateRecipeCosts(recipe as Recipe)
    : null;

  return (
    <Box className={className}>
      <CardWrapper variant="outline">
        <CardWrapper.Header p="4">
          <Flex justify="space-between" align="center">
            <Flex gap="3" align="center">
              <Box fontSize="2xl">
                {getIcon()}
              </Box>
              <Stack gap="1">
                <Text fontSize="md" fontWeight="semibold">
                  {getTitle()}
                </Text>
                {context && (
                  <Badge colorPalette={mode === 'product' ? 'blue' : 'green'} size="sm" variant="subtle">
                    {context}
                  </Badge>
                )}
              </Stack>
            </Flex>
            <Button
              size="sm"
              variant="ghost"
              colorPalette="gray"
              onClick={openFullRecipeBuilder}
            >
              Avanzado
              <Icon icon={ArrowTopRightOnSquareIcon} size="sm" />
            </Button>
          </Flex>
        </CardWrapper.Header>

        <CardWrapper.Body>
          <Stack gap="4">
            {/* Basic Recipe Info */}
            <Stack gap="4">
              <Flex gap="4">
                <Box flex="2">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Nombre de la receta
                  </Text>
                  <Input
                    value={recipe.name || ''}
                    onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={mode === 'product' ? 'ej. Hamburguesa Clásica' : 'ej. Masa para Pizza'}
                    height="44px"
                    fontSize="md"
                    px="3"
                    borderRadius="md"
                  />
                </Box>
                
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Porciones (calculado automáticamente)
                  </Text>
                  <Box
                    height="44px"
                    px="3"
                    bg="bg.canvas"
                    border="1px solid"
                    borderColor="border"
                    borderRadius="md"
                  display="flex"
                  alignItems="center"
                  fontSize="md"
                  color="text.muted"
                >
                  {ingredients.length > 0 ? `${ingredients.length} porción${ingredients.length === 1 ? '' : 'es'}` : 'Se calculará según ingredientes'}
                </Box>
              </Box>
            </Flex>
            
            {/* Instructions Field */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Instrucciones de preparación
              </Text>
              <Textarea
                value={recipe.instructions || ''}
                onChange={(e) => setRecipe(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder={mode === 'product' ? 'ej. 1. Formar la hamburguesa, 2. Cocinar por 5 min...' : 'ej. 1. Mezclar ingredientes secos, 2. Agregar líquidos...'}
                fontSize="md"
                rows={3}
                resize="vertical"
              />
            </Box>
            </Stack>

            {/* Ingredients Section - Smart Material Selection */}
            <Box>
              <Text fontSize="md" fontWeight="medium" mb="4">
                🥘 Ingredientes de la receta
              </Text>

              {/* Current Ingredient Workflow */}
              {!currentIngredient.material ? (
                <Stack gap="3">
                  <Text fontSize="sm" color="text.muted">
                    Selecciona una materia prima para agregar:
                  </Text>
                  <MaterialSelector
                    onMaterialSelected={handleMaterialSelected}
                    placeholder="Buscar materia prima en stock..."
                    filterByStock={true}
                    excludeIds={ingredients.map(ing => ing.notes?.replace('Material ID: ', '') || '')}
                  />
                </Stack>
              ) : (
                renderQuantityInput()
              )}

              {/* Added Ingredients List */}
              {ingredients.length > 0 && (
                <Stack gap="3" mt="6">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="semibold">
                      ✅ Ingredientes agregados ({ingredients.length})
                    </Text>
                    {!currentIngredient.material && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={startNewIngredient}
                      >
                        <Icon icon={PlusIcon} size="sm" />
                        Agregar otro
                      </Button>
                    )}
                  </Flex>

                  <Stack gap="2">
                    {ingredients.map((ingredient, index) => (
                      <CardWrapper key={ingredient.id} variant="outline" size="sm">
                        <CardWrapper.Body p="3">
                          <Flex justify="space-between" align="center">
                            <Stack gap="0" flex="1">
                              <Text fontSize="sm" fontWeight="medium">
                                {ingredient.name}
                              </Text>
                              <Text fontSize="xs" color="text.muted">
                                {ingredient.quantity} {ingredient.unit} • ${ingredient.cost.toFixed(2)} ARS
                              </Text>
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
                </Stack>
              )}
            </Box>

            {/* Cost Summary */}
            {calculations && (
              <CardWrapper variant="subtle" bg={mode === 'product' ? 'blue.50' : 'green.50'}>
                <CardWrapper.Body p={3}>
                  <Flex justify="space-between">
                    <Stack gap="0">
                      <Text fontSize="sm" color="gray.600">
                        Costo Total
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        ${calculations.totalCost.toFixed(2)}
                      </Text>
                    </Stack>
                    
                    <Stack gap="0" textAlign="center">
                      <Text fontSize="sm" color="gray.600">
                        Por Porción
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        ${calculations.costPerServing.toFixed(2)}
                      </Text>
                    </Stack>
                    
                    {mode === 'product' && calculations.profitPercentage !== undefined && (
                      <Stack gap="0" textAlign="end">
                        <Text fontSize="sm" color="gray.600">
                          Margen Potencial
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          {calculations.profitPercentage.toFixed(1)}%
                        </Text>
                      </Stack>
                    )}
                  </Flex>
                </CardWrapper.Body>
              </CardWrapper>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreateRecipe}
              colorPalette={mode === 'product' ? 'blue' : 'green'}
              isLoading={isCalculating}
              loadingText="Calculando..."
              isDisabled={!recipe.name || ingredients.length === 0}
            >
              {mode === 'product' ? 'Crear Receta de Producto' : 'Crear Receta de Material'}
            </Button>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    </Box>
  );
};

export default RecipeBuilderLite;