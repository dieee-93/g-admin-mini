// src/features/recipes/ui/RecipeForm.tsx - ENHANCED WITH AI SUGGESTIONS
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
  createListCollection,
  CardWrapper ,
  Alert,
  IconButton,
  Tabs,
  Switch,
  Progress,
  SimpleGrid,
  Skeleton,
  NumberInput
} from '@chakra-ui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from '@/shared/ui';
import {
  LightBulbIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useRecipes } from '@/shared/components'; 
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { inventoryApi } from '@/pages/admin/supply-chain/materials/services/inventoryApi';
import { StockCalculation } from '@/pages/admin/supply-chain/inventory/stockCalculation';
import { type InventoryItem } from '@/pages/admin/supply-chain/materials/types';
import { type CreateRecipeData } from '@/shared/components'; 
import { RecipeFormBasicInfo } from './form-parts/RecipeFormBasicInfo';
import { RecipeFormAISuggestions } from './form-parts/RecipeFormAISuggestions';
import { RecipeFormIngredients } from './form-parts/RecipeFormIngredients';

// Import event system
import { EventBus } from '@/lib/events';
import { EventBus } from '@/lib/events';

interface FormErrors {
  name?: string;
  output_item_id?: string;
  output_quantity?: string;
  ingredients?: string;
}

import {
  generateMockAISuggestions,
  type AIRecipeSuggestions,
  type IngredientSubstitution,
  type CostOptimization,
  type YieldOptimization,
  type NutritionalInsight,
  type YieldAdjustment,
} from './RecipeForm.mock';

export function RecipeForm() {
  const { addRecipe } = useRecipes();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [items, setItems] = useState<InventoryItem[]>([]);
  
  // AI Enhancement States
  const [aiSuggestions, setAiSuggestions] = useState<AIRecipeSuggestions | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [activeAITab, setActiveAITab] = useState<'substitutions' | 'optimization' | 'yield' | 'nutrition'>('substitutions');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  
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

  // AI-optimized cost calculation
  const optimizedCost = useMemo(() => {
    if (!aiSuggestions) return estimatedCost;
    
    const totalSavings = aiSuggestions.costOptimizations.reduce(
      (sum, opt) => sum + opt.savings, 0
    );
    
    return Math.max(0, estimatedCost - totalSavings);
  }, [estimatedCost, aiSuggestions]);

  const optimizedCostPerUnit = useMemo(() => {
    const outputQty = parseFloat(form.output_quantity || '0');
    return outputQty > 0 ? optimizedCost / outputQty : 0;
  }, [optimizedCost, form.output_quantity]);

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
        const stockStatus = StockCalculation.getStockStatus(item);
        const hasLowStock = stockStatus === 'low' || stockStatus === 'critical' || stockStatus === 'out';
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

  // Auto-generate AI suggestions when form changes significantly
  useEffect(() => {
    if (aiEnabled && form.name && form.output_item_id && ingredients.some(ing => ing.item_id && ing.quantity)) {
      const timer = setTimeout(() => {
        generateAISuggestions();
      }, 2000); // Debounce 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [form.name, form.output_item_id, ingredients, aiEnabled]);

  const loadItems = async () => {
    try {
      const itemsData = await inventoryApi.getItems();
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

  // Generate AI suggestions
  const generateAISuggestions = useCallback(async () => {
    if (!aiEnabled || isGeneratingAI) return;
    
    const validIngredients = ingredients.filter(ing => ing.item_id && ing.quantity && parseFloat(ing.quantity) > 0);
    if (validIngredients.length === 0) return;
    
    setIsGeneratingAI(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockSuggestions = generateMockAISuggestions(validIngredients, items, estimatedCost);
      setAiSuggestions(mockSuggestions);
      setShowAISuggestions(true);
      
      // Emit AI suggestions event
      await EventBus.emit('system.data_synced', {
        type: 'ai_recipe_suggestions_generated',
        recipeName: form.name,
        ingredientsCount: validIngredients.length,
        suggestionsCount: mockSuggestions.substitutions.length + mockSuggestions.costOptimizations.length,
        overallScore: mockSuggestions.overallScore,
        potentialSavings: mockSuggestions.costOptimizations.reduce((sum, opt) => sum + opt.savings, 0)
      }, 'RecipeForm');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error generating AI suggestions: ${errorMessage}`);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [aiEnabled, ingredients, items, estimatedCost, form.name, isGeneratingAI]);

  // Apply AI suggestion
  const applySuggestion = useCallback((suggestionId: string, type: string) => {
    if (type === 'substitution') {
      const substitution = aiSuggestions?.substitutions.find((_, index) => `sub_${index}` === suggestionId);
      if (substitution) {
        // Find and replace ingredient
        const ingredientIndex = ingredients.findIndex(ing => {
          const item = items.find(i => i.id === ing.item_id);
          return item?.name === substitution.originalIngredient;
        });
        
        if (ingredientIndex >= 0) {
          const substituteItem = items.find(i => i.name === substitution.suggestedSubstitute);
          if (substituteItem) {
            const newIngredients = [...ingredients];
            newIngredients[ingredientIndex].item_id = substituteItem.id;
            setIngredients(newIngredients);
            setAppliedSuggestions(prev => new Set([...prev, suggestionId]));
          }
        }
      }
    } else if (type === 'yield') {
      const yieldOpt = aiSuggestions?.yieldOptimization;
      if (yieldOpt) {
        setForm(prev => ({ ...prev, output_quantity: yieldOpt.suggestedYield.toString() }));
        
        // Apply yield adjustments
        const newIngredients = ingredients.map(ing => {
          const item = items.find(i => i.id === ing.item_id);
          if (item) {
            const adjustment = yieldOpt.adjustments.find(adj => adj.ingredient === item.name);
            if (adjustment) {
              return { ...ing, quantity: adjustment.suggestedQuantity.toString() };
            }
          }
          return ing;
        });
        
        setIngredients(newIngredients);
        setAppliedSuggestions(prev => new Set([...prev, 'yield_optimization']));
      }
    }
  }, [aiSuggestions, ingredients, items]);

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
      
      // Reset form and AI state
      setForm({
        name: '',
        output_item_id: '',
        output_quantity: '',
        preparation_time: '',
        instructions: '',
      });
      setIngredients([{ item_id: '', quantity: '' }]);
      setAiSuggestions(null);
      setShowAISuggestions(false);
      setAppliedSuggestions(new Set());
      
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
        <RecipeFormBasicInfo
          form={form}
          errors={errors}
          handleChange={handleChange}
          handleOutputSelectChange={handleOutputSelectChange}
          elaboratedItemsCollection={elaboratedItemsCollection}
          selectedOutputItem={selectedOutputItem}
        />

        <RecipeFormAISuggestions
          aiEnabled={aiEnabled}
          setAiEnabled={setAiEnabled}
          isGeneratingAI={isGeneratingAI}
          generateAISuggestions={generateAISuggestions}
          aiSuggestions={aiSuggestions}
          estimatedCost={estimatedCost}
          estimatedCostPerUnit={estimatedCostPerUnit}
          optimizedCost={optimizedCost}
          optimizedCostPerUnit={optimizedCostPerUnit}
          showAISuggestions={showAISuggestions}
          setShowAISuggestions={setShowAISuggestions}
          activeAITab={activeAITab}
          setActiveAITab={setActiveAITab}
          appliedSuggestions={appliedSuggestions}
          applySuggestion={applySuggestion}
        />

        {/* Separador visual */}
        <Box height="1px" bg="bg.subtle" />

        <RecipeFormIngredients
          ingredients={ingredients}
          errors={errors}
          items={items}
          ingredientItemsCollection={ingredientItemsCollection}
          handleIngredientSelectChange={handleIngredientSelectChange}
          handleIngredientQuantityChange={handleIngredientQuantityChange}
          addIngredient={addIngredient}
          removeIngredient={removeIngredient}
        />

        {/* Separador visual */}
        <Box height="1px" bg="bg.subtle" />

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

        {/* Botón de envío mejorado */}
        <HStack gap={4} justify="flex-end">
          {aiSuggestions && showAISuggestions && (
            <Button 
              variant="outline"
              colorPalette="purple"
              onClick={() => setShowAISuggestions(false)}
            >
              Ocultar Sugerencias IA
            </Button>
          )}
          
          <Button 
            colorPalette="purple"
            size="lg"
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText="Creando receta..."
          >
            {aiSuggestions ? (
              <>
                <Icon icon={SparklesIcon} size="sm" style={{ marginRight: '8px' }} />
                🤖 Crear Receta Optimizada
              </>
            ) : (
              '✅ Crear Receta'
            )}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

// Export enhanced component
export default RecipeForm;