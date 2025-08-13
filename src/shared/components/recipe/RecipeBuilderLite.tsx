// Unified Recipe Builder Lite - Works for both products and materials
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  HStack, 
  VStack,
  Badge,
  Input,
  NumberInput,
  Select,
  Card,
  IconButton
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

  // Auto-calculate costs when ingredients change
  useEffect(() => {
    if (ingredients.length > 0) {
      setIsCalculating(true);
      const totalCost = ingredients.reduce(
        (sum, ing) => sum + (ing.cost * ing.quantity), 
        0
      );
      
      setRecipe(prev => ({ 
        ...prev, 
        totalCost,
        costPerServing: prev.servingSize ? totalCost / prev.servingSize : totalCost
      }));
      
      onCostChange?.(totalCost);
      setIsCalculating(false);
    }
  }, [ingredients, recipe.servingSize, onCostChange]);

  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: `ing-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: mode === 'product' ? 'porción' : 'kg',
      cost: 0,
      notes: ''
    };
    
    setIngredients(prev => [...prev, newIngredient]);
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
      ? <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
      : <BeakerIcon className="w-5 h-5 text-green-600" />;
  };

  const getTitle = () => {
    return mode === 'product' 
      ? 'Recipe Builder - Product Context'
      : 'Recipe Builder - Material Context';
  };

  const calculations = recipe.totalCost 
    ? recipeService.calculateRecipeCosts(recipe as Recipe)
    : null;

  return (
    <Box className={className}>
      <Card.Root variant="outline">
        <Card.Header>
          <HStack justify="space-between">
            <HStack gap={2}>
              {getIcon()}
              <VStack align="start" gap={0}>
                <Text fontSize="lg" fontWeight="semibold">
                  {getTitle()}
                </Text>
                {context && (
                  <Badge colorPalette={mode === 'product' ? 'blue' : 'green'} size="sm">
                    {context}
                  </Badge>
                )}
              </VStack>
            </HStack>
            <Button
              size="sm"
              variant="outline"
              colorPalette="orange"
              onClick={openFullRecipeBuilder}
              rightIcon={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
            >
              Generador Completo
            </Button>
          </HStack>
        </Card.Header>

        <Card.Body>
          <VStack gap={4} align="stretch">
            {/* Basic Recipe Info */}
            <HStack gap={4}>
              <Box flex="2">
                <Text fontSize="sm" fontWeight="medium" mb={1}>
                  Nombre de la receta
                </Text>
                <Input
                  value={recipe.name || ''}
                  onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={mode === 'product' ? 'ej. Hamburguesa Clásica' : 'ej. Masa para Pizza'}
                />
              </Box>
              
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb={1}>
                  Porciones
                </Text>
                <NumberInput.Root
                  value={recipe.servingSize?.toString() || '1'}
                  onValueChange={(details) => 
                    setRecipe(prev => ({ ...prev, servingSize: parseInt(details.value) || 1 }))
                  }
                  min={1}
                >
                  <NumberInput.Field />
                </NumberInput.Root>
              </Box>
            </HStack>

            {/* Ingredients Section */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="md" fontWeight="medium">
                  Ingredientes
                </Text>
                <Button
                  size="sm"
                  onClick={addIngredient}
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                >
                  Agregar
                </Button>
              </HStack>

              <VStack gap={2} align="stretch">
                {ingredients.map((ingredient, index) => (
                  <Card.Root key={ingredient.id} variant="subtle" size="sm">
                    <Card.Body p={3}>
                      <HStack gap={2}>
                        <Box flex="2">
                          <Input
                            size="sm"
                            value={ingredient.name}
                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                            placeholder="Nombre del ingrediente"
                          />
                        </Box>
                        
                        <Box flex="1">
                          <NumberInput.Root
                            size="sm"
                            value={ingredient.quantity.toString()}
                            onValueChange={(details) => 
                              updateIngredient(index, 'quantity', parseFloat(details.value) || 0)
                            }
                          >
                            <NumberInput.Field />
                          </NumberInput.Root>
                        </Box>
                        
                        <Box flex="1">
                          <Input
                            size="sm"
                            value={ingredient.unit}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            placeholder="Unidad"
                          />
                        </Box>
                        
                        <Box flex="1">
                          <NumberInput.Root
                            size="sm"
                            value={ingredient.cost.toString()}
                            onValueChange={(details) => 
                              updateIngredient(index, 'cost', parseFloat(details.value) || 0)
                            }
                            formatOptions={{
                              style: 'currency',
                              currency: 'USD'
                            }}
                          >
                            <NumberInput.Field />
                          </NumberInput.Root>
                        </Box>
                        
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => removeIngredient(index)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </IconButton>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </Box>

            {/* Cost Summary */}
            {calculations && (
              <Card.Root variant="subtle" bg={mode === 'product' ? 'blue.50' : 'green.50'}>
                <Card.Body p={3}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" color="gray.600">
                        Costo Total
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        ${calculations.totalCost.toFixed(2)}
                      </Text>
                    </VStack>
                    
                    <VStack align="center" gap={0}>
                      <Text fontSize="sm" color="gray.600">
                        Por Porción
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        ${calculations.costPerServing.toFixed(2)}
                      </Text>
                    </VStack>
                    
                    {mode === 'product' && calculations.profitPercentage !== undefined && (
                      <VStack align="end" gap={0}>
                        <Text fontSize="sm" color="gray.600">
                          Margen Potencial
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          {calculations.profitPercentage.toFixed(1)}%
                        </Text>
                      </VStack>
                    )}
                  </HStack>
                </Card.Body>
              </Card.Root>
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
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default RecipeBuilderLite;