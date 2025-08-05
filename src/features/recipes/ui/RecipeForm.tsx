// src/features/recipes/ui/RecipeForm.tsx - VERSIÓN CORREGIDA CON COLLECTION
import {
  Box, 
  Button, 
  Input, 
  VStack, 
  HStack,
  Textarea, 
  Heading,
  Grid,
  Text,
  Badge,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { useRecipes } from '../logic/useRecipes'; 
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { fetchItems } from '../../items/data/itemApi';
import { type Item } from '../../items/types';
import { type CreateRecipeData } from '../types';

interface RecipeIngredientForm {
  item_id: string;
  quantity: string;
}

interface FormErrors {
  name?: string;
  output_item_id?: string;
  output_quantity?: string;
  ingredients?: string;
}

export function RecipeForm() {
  const { addRecipe } = useRecipes();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [items, setItems] = useState<Item[]>([]);
  
  const [form, setForm] = useState({
    name: '',
    output_item_id: '',
    output_quantity: '',
    preparation_time: '',
    instructions: '',
  });

  const [ingredients, setIngredients] = useState<RecipeIngredientForm[]>([
    { item_id: '', quantity: '' }
  ]);

  // Calculate estimated total cost
  const estimatedCost = useMemo(() => {
    return ingredients.reduce((total, ing) => {
      if (!ing.item_id || !ing.quantity) return total;
      const item = items.find(i => i.id === ing.item_id);
      if (!item?.unit_cost) return total;
      return total + (item.unit_cost * parseFloat(ing.quantity || '0'));
    }, 0);
  }, [ingredients, items]);

  const estimatedCostPerUnit = useMemo(() => {
    const outputQty = parseFloat(form.output_quantity || '0');
    return outputQty > 0 ? estimatedCost / outputQty : 0;
  }, [estimatedCost, form.output_quantity]);

  // ✅ CORRECTO - Collections dinámicas basadas en tipos de items
  const elaboratedItemsCollection = useMemo(() => {
    const elaboratedItems = items.filter(item => item.type === 'ELABORATED');
    return createListCollection({
      items: elaboratedItems.map(item => ({
        label: `${item.name} (${item.unit})`,
        value: item.id,
      })),
    });
  }, [items]);

  const ingredientItemsCollection = useMemo(() => {
    const ingredientItems = items.filter(item => item.type !== 'ELABORATED');
    return createListCollection({
      items: ingredientItems.map(item => {
        const hasLowStock = item.stock <= 5;
        const hasNoCost = !item.unit_cost || item.unit_cost <= 0;
        const warningLabel = hasLowStock ? ' ⚠️' : hasNoCost ? ' 💰❌' : '';
        return {
          label: `${item.name} (${item.unit}) - Stock: ${item.stock}${warningLabel}`,
          value: item.id,
        };
      }),
    });
  }, [items]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const itemsData = await fetchItems();
      setItems(itemsData);
    } catch (error) {
      handleError(error, 'Error cargando insumos');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!form.output_item_id) {
      newErrors.output_item_id = 'Debe seleccionar el producto que genera';
    }

    if (!form.output_quantity || parseFloat(form.output_quantity) <= 0) {
      newErrors.output_quantity = 'La cantidad debe ser mayor a 0';
    }

    const validIngredients = ingredients.filter(ing => 
      ing.item_id && ing.quantity && parseFloat(ing.quantity) > 0
    );

    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Debe agregar al menos un ingrediente válido';
    }

    // Validate stock and costs
    const stockIssues: string[] = [];
    const costIssues: string[] = [];
    
    validIngredients.forEach(ing => {
      const item = items.find(i => i.id === ing.item_id);
      if (item) {
        const requiredQty = parseFloat(ing.quantity);
        if (item.stock < requiredQty) {
          stockIssues.push(`${item.name}: necesita ${requiredQty}, disponible ${item.stock}`);
        }
        if (!item.unit_cost || item.unit_cost <= 0) {
          costIssues.push(`${item.name}: sin costo unitario definido`);
        }
      }
    });

    if (stockIssues.length > 0) {
      newErrors.ingredients = `Stock insuficiente: ${stockIssues.join('; ')}`;
    } else if (costIssues.length > 0) {
      newErrors.ingredients = `Costos faltantes: ${costIssues.join('; ')}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ✅ CORRECTO - Handler para Select de producto de salida
  const handleOutputSelectChange = (details: { value: string[] }) => {
    setForm(prev => ({ ...prev, output_item_id: details.value[0] || '' }));
    
    if (errors.output_item_id) {
      setErrors(prev => ({ ...prev, output_item_id: undefined }));
    }
  };

  // ✅ CORRECTO - Handler para Select de ingredientes
  const handleIngredientSelectChange = (index: number, details: { value: string[] }) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], item_id: details.value[0] || '' };
    setIngredients(newIngredients);
    
    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: undefined }));
    }
  };

  const handleIngredientQuantityChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], quantity: value };
    setIngredients(newIngredients);
    
    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: undefined }));
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { item_id: '', quantity: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validIngredients = ingredients
        .filter(ing => ing.item_id && ing.quantity && parseFloat(ing.quantity) > 0)
        .map(ing => ({
          item_id: ing.item_id,
          quantity: parseFloat(ing.quantity)
        }));

      const recipeData: CreateRecipeData = {
        name: form.name.trim(),
        output_item_id: form.output_item_id,
        output_quantity: parseFloat(form.output_quantity),
        preparation_time: form.preparation_time ? parseInt(form.preparation_time) : undefined,
        instructions: form.instructions.trim() || undefined,
        ingredients: validIngredients
      };

      await addRecipe(recipeData);
      
      handleSuccess('Receta creada correctamente');
      
      // Resetear formulario
      setForm({
        name: '',
        output_item_id: '',
        output_quantity: '',
        preparation_time: '',
        instructions: '',
      });
      setIngredients([{ item_id: '', quantity: '' }]);
      
    } catch (error) {
      handleError(error, 'Error al crear la receta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOutputItem = items.find(item => item.id === form.output_item_id);

  return (
    <Box borderWidth="1px" rounded="md" p={6} mb={6} bg="white">
      <Heading size="md" mb={6} color="purple.600">
        📝 Nueva Receta
      </Heading>
      
      <VStack gap="6" align="stretch">
        {/* Información básica */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
            Información Básica
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Nombre de la receta</Text>
              <Input
                placeholder="Ej: Pan integral casero"
                name="name"
                value={form.name}
                onChange={handleChange}
                borderColor={errors.name ? 'red.300' : undefined}
              />
              {errors.name && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.name}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Producto que genera</Text>
              <Select.Root 
                collection={elaboratedItemsCollection}
                value={form.output_item_id ? [form.output_item_id] : []}
                onValueChange={handleOutputSelectChange}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger borderColor={errors.output_item_id ? 'red.300' : undefined}>
                    <Select.ValueText placeholder="Seleccionar producto" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {elaboratedItemsCollection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
              {errors.output_item_id && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.output_item_id}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Cantidad{selectedOutputItem ? ` (${selectedOutputItem.unit})` : ''}
              </Text>
              <Input
                placeholder="Cantidad"
                name="output_quantity"
                type="number"
                step="0.01"
                min="0"
                value={form.output_quantity}
                onChange={handleChange}
                borderColor={errors.output_quantity ? 'red.300' : undefined}
              />
              {errors.output_quantity && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.output_quantity}
                </Text>
              )}
            </Box>
          </Grid>
        </Box>

        {/* Cost Estimation Display */}
        {estimatedCost > 0 && (
          <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
            <VStack gap="2" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="medium" color="blue.700">
                  💰 Estimación de Costos
                </Text>
                <Badge colorScheme="blue" variant="subtle">
                  Preliminar
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="blue.600">Costo total estimado:</Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.700">
                  ${estimatedCost.toFixed(2)}
                </Text>
              </HStack>
              {estimatedCostPerUnit > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="sm" color="blue.600">Costo por unidad:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    ${estimatedCostPerUnit.toFixed(2)}
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        {/* Separador visual */}
        <Box height="1px" bg="gray.200" />

        {/* Ingredientes CON COLLECTION */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Ingredientes
            </Text>
            <Badge colorScheme="purple" variant="subtle">
              {ingredients.filter(ing => ing.item_id && ing.quantity).length} ingredientes
            </Badge>
          </HStack>
          
          {errors.ingredients && (
            <Text color="red.500" fontSize="sm" mb={3}>
              {errors.ingredients}
            </Text>
          )}

          <VStack gap="3">
            {ingredients.map((ingredient, index) => {
              const selectedItem = items.find(item => item.id === ingredient.item_id);
              const requiredQty = parseFloat(ingredient.quantity || '0');
              const hasStockIssue = selectedItem && requiredQty > selectedItem.stock;
              const hasNoCost = selectedItem && (!selectedItem.unit_cost || selectedItem.unit_cost <= 0);
              const ingredientCost = selectedItem?.unit_cost ? selectedItem.unit_cost * requiredQty : 0;
              
              return (
                <VStack key={index} gap="2" width="100%" align="stretch">
                  <HStack gap="3" width="100%">
                    <Box flex={2}>
                      <Select.Root 
                        collection={ingredientItemsCollection}
                        value={ingredient.item_id ? [ingredient.item_id] : []}
                        onValueChange={(details) => handleIngredientSelectChange(index, details)}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Seleccionar ingrediente" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content>
                            {ingredientItemsCollection.items.map((item) => (
                              <Select.Item key={item.value} item={item}>
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Box>
                    
                    <Input
                      placeholder={`Cantidad${selectedItem ? ` (${selectedItem.unit})` : ''}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientQuantityChange(index, e.target.value)}
                      flex={1}
                      borderColor={hasStockIssue ? 'red.300' : undefined}
                    />
                    
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      ✕
                    </Button>
                  </HStack>
                  
                  {/* Warnings and cost info for this ingredient */}
                  {selectedItem && ingredient.quantity && (
                    <HStack justify="space-between" fontSize="xs" px={2}>
                      <HStack gap="2">
                        {hasStockIssue && (
                          <Badge colorScheme="red" size="sm">
                            ⚠️ Stock insuficiente
                          </Badge>
                        )}
                        {hasNoCost && (
                          <Badge colorScheme="orange" size="sm">
                            💰 Sin costo
                          </Badge>
                        )}
                      </HStack>
                      {ingredientCost > 0 && (
                        <Text color="green.600" fontWeight="medium">
                          ${ingredientCost.toFixed(2)}
                        </Text>
                      )}
                    </HStack>
                  )}
                </VStack>
              );
            })}
            
            <Button
              size="sm"
              variant="outline"
              colorScheme="purple"
              onClick={addIngredient}
              alignSelf="flex-start"
            >
              + Agregar ingrediente
            </Button>
          </VStack>
        </Box>

        {/* Separador visual */}
        <Box height="1px" bg="gray.200" />

        {/* Información adicional */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
            Información Adicional
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "1fr 3fr" }} gap={4}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Tiempo de preparación (min)</Text>
              <Input
                placeholder="Ej: 120"
                name="preparation_time"
                type="number"
                min="0"
                value={form.preparation_time}
                onChange={handleChange}
              />
            </Box>
            
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Instrucciones</Text>
              <Textarea
                placeholder="Describe los pasos para preparar esta receta..."
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                rows={3}
                resize="vertical"
              />
            </Box>
          </Grid>
        </Box>

        {/* Botón de envío */}
        <Button 
          colorScheme="purple"
          size="lg"
          onClick={handleSubmit}
          loading={isSubmitting}
          loadingText="Creando receta..."
        >
          ✅ Crear Receta
        </Button>
      </VStack>
    </Box>
  );
}