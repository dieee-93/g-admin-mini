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
  Card,
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
import { useRecipes } from '../hooks/useRecipes'; 
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { inventoryApi } from '@/modules/materials/data/inventoryApi';
import { type InventoryItem } from '@/modules/materials/types';
import { type CreateRecipeData } from '../types';

// Import event system
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

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

// AI Suggestions Interfaces
interface IngredientSubstitution {
  originalIngredient: string;
  suggestedSubstitute: string;
  reason: string;
  costImpact: number; // positive = savings, negative = cost increase
  availabilityScore: number; // 0-100
  nutritionalImpact: string;
  confidenceLevel: number; // 0-100
}

interface CostOptimization {
  type: 'ingredient_substitution' | 'yield_adjustment' | 'batch_optimization';
  description: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  implementation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface YieldOptimization {
  currentYield: number;
  suggestedYield: number;
  improvement: number; // percentage
  reasoning: string;
  adjustments: YieldAdjustment[];
}

interface YieldAdjustment {
  ingredient: string;
  currentQuantity: number;
  suggestedQuantity: number;
  reason: string;
}

interface NutritionalInsight {
  category: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sodium';
  value: number;
  unit: string;
  dailyValuePercentage?: number;
  healthScore: number; // 0-100
  recommendations: string[];
}

interface AIRecipeSuggestions {
  substitutions: IngredientSubstitution[];
  costOptimizations: CostOptimization[];
  yieldOptimization?: YieldOptimization;
  nutritionalInsights: NutritionalInsight[];
  overallScore: number; // 0-100
  confidence: number; // 0-100
}

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
      await EventBus.emit(RestaurantEvents.DATA_SYNCED, {
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

  // Generate mock AI suggestions
  const generateMockAISuggestions = (validIngredients: any[], allItems: InventoryItem[], currentCost: number): AIRecipeSuggestions => {
    const substitutions: IngredientSubstitution[] = [];
    const costOptimizations: CostOptimization[] = [];
    const nutritionalInsights: NutritionalInsight[] = [];
    
    // Generate substitutions for expensive or unavailable ingredients
    validIngredients.forEach((ingredient, index) => {
      const item = allItems.find(i => i.id === ingredient.item_id);
      if (item && Math.random() > 0.6) { // 40% chance of suggestion
        const possibleSubs = allItems.filter(i => 
          i.id !== item.id && 
          i.type === item.type &&
          i.stock > 0
        );
        
        if (possibleSubs.length > 0) {
          const substitute = possibleSubs[Math.floor(Math.random() * possibleSubs.length)];
          const costImpact = (item.unit_cost || 0) - (substitute.unit_cost || 0);
          
          substitutions.push({
            originalIngredient: item.name,
            suggestedSubstitute: substitute.name,
            reason: costImpact > 0 ? 'Menor costo y mejor disponibilidad' : 'Mejor disponibilidad en stock',
            costImpact: costImpact * parseFloat(ingredient.quantity),
            availabilityScore: Math.min(100, substitute.stock * 10),
            nutritionalImpact: 'Similar perfil nutricional',
            confidenceLevel: 75 + Math.floor(Math.random() * 20)
          });
        }
      }
    });
    
    // Generate cost optimizations
    if (substitutions.length > 0) {
      const totalSubSavings = substitutions.reduce((sum, sub) => sum + Math.max(0, sub.costImpact), 0);
      if (totalSubSavings > 0) {
        costOptimizations.push({
          type: 'ingredient_substitution',
          description: `Sustitución de ${substitutions.length} ingrediente${substitutions.length > 1 ? 's' : ''}`,
          currentCost,
          optimizedCost: currentCost - totalSubSavings,
          savings: totalSubSavings,
          implementation: 'Aplicar sustituciones sugeridas automáticamente',
          riskLevel: 'low'
        });
      }
    }
    
    // Batch optimization suggestion
    if (currentCost > 50) {
      costOptimizations.push({
        type: 'batch_optimization',
        description: 'Optimización por lotes de preparación',
        currentCost,
        optimizedCost: currentCost * 0.85,
        savings: currentCost * 0.15,
        implementation: 'Preparar en lotes más grandes para economías de escala',
        riskLevel: 'medium'
      });
    }
    
    // Generate nutritional insights
    const nutritionCategories = ['calories', 'protein', 'carbs', 'fat', 'fiber'] as const;
    nutritionCategories.forEach(category => {
      nutritionalInsights.push({
        category,
        value: Math.floor(Math.random() * 200) + 50,
        unit: category === 'calories' ? 'kcal' : 'g',
        dailyValuePercentage: Math.floor(Math.random() * 30) + 10,
        healthScore: Math.floor(Math.random() * 40) + 60,
        recommendations: [
          `Considera agregar más ${category === 'protein' ? 'proteínas' : category === 'fiber' ? 'fibra' : category}`,
          'Balancear con otros nutrientes para mejor perfil nutricional'
        ]
      });
    });
    
    // Yield optimization
    const currentYield = parseFloat(form.output_quantity || '1');
    const yieldOptimization: YieldOptimization = {
      currentYield,
      suggestedYield: currentYield * 1.15,
      improvement: 15,
      reasoning: 'Optimización de técnicas de preparación y reducción de desperdicios',
      adjustments: validIngredients.slice(0, 2).map(ing => {
        const item = allItems.find(i => i.id === ing.item_id);
        const currentQty = parseFloat(ing.quantity);
        return {
          ingredient: item?.name || 'Ingrediente',
          currentQuantity: currentQty,
          suggestedQuantity: currentQty * 1.05,
          reason: 'Ajuste para mejor rendimiento'
        };
      })
    };
    
    return {
      substitutions,
      costOptimizations,
      yieldOptimization,
      nutritionalInsights,
      overallScore: 75 + Math.floor(Math.random() * 20),
      confidence: 80 + Math.floor(Math.random() * 15)
    };
  };

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

        {/* AI Enhancement Toggle */}
        <Card.Root variant="outline" bg="gradient(to-r, purple.50, blue.50)">
          <Card.Body p={4}>
            <HStack justify="space-between">
              <HStack gap={3}>
                <SparklesIcon className="w-5 h-5 text-purple-500" />
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="medium" color="purple.700">
                    🤖 AI Recipe Assistant
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Obtén sugerencias inteligentes para optimizar tu receta
                  </Text>
                </VStack>
              </HStack>
              
              <HStack gap={2}>
                {isGeneratingAI && (
                  <HStack gap={2}>
                    <Text fontSize="xs" color="purple.600">Analizando...</Text>
                    <Progress.Root size="sm" width="60px" colorPalette="purple">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </HStack>
                )}
                
                <Switch.Root 
                  checked={aiEnabled}
                  onCheckedChange={(e) => setAiEnabled(e.checked)}
                  colorPalette="purple"
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
                
                {aiEnabled && !isGeneratingAI && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="purple"
                    onClick={generateAISuggestions}
                  >
                    <ArrowPathIcon className="w-3 h-3 mr-2" />
                    Generar Sugerencias
                  </Button>
                )}
              </HStack>
            </HStack>
            
            {aiSuggestions && (
              <HStack gap={4} mt={3} fontSize="xs">
                <Badge colorPalette="green" variant="subtle">
                  Score: {aiSuggestions.overallScore}/100
                </Badge>
                <Badge colorPalette="blue" variant="subtle">
                  Confianza: {aiSuggestions.confidence}%
                </Badge>
                <Badge colorPalette="orange" variant="subtle">
                  {aiSuggestions.substitutions.length} sustituciones
                </Badge>
                <Badge colorPalette="purple" variant="subtle">
                  ${aiSuggestions.costOptimizations.reduce((sum, opt) => sum + opt.savings, 0).toFixed(2)} ahorro
                </Badge>
              </HStack>
            )}
          </Card.Body>
        </Card.Root>

        {/* Cost Estimation Display Enhanced */}
        {estimatedCost > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {/* Current Cost */}
            <Card.Root variant="outline" bg="blue.50">
              <Card.Body p={4}>
                <VStack gap={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="blue.700">
                      💰 Costo Actual
                    </Text>
                    <Badge colorPalette="blue" variant="subtle">
                      Estimado
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="blue.600">Total:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.700">
                      ${estimatedCost.toFixed(2)}
                    </Text>
                  </HStack>
                  {estimatedCostPerUnit > 0 && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="blue.600">Por unidad:</Text>
                      <Text fontSize="sm" fontWeight="medium" color="blue.700">
                        ${estimatedCostPerUnit.toFixed(2)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>
            
            {/* AI-Optimized Cost */}
            {aiSuggestions && optimizedCost < estimatedCost && (
              <Card.Root variant="outline" bg="green.50">
                <Card.Body p={4}>
                  <VStack gap={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium" color="green.700">
                        🎯 Costo Optimizado (IA)
                      </Text>
                      <Badge colorPalette="green" variant="subtle">
                        -{((1 - optimizedCost/estimatedCost) * 100).toFixed(1)}%
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="green.600">Total:</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.700">
                        ${optimizedCost.toFixed(2)}
                      </Text>
                    </HStack>
                    {optimizedCostPerUnit > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="green.600">Por unidad:</Text>
                        <Text fontSize="sm" fontWeight="medium" color="green.700">
                          ${optimizedCostPerUnit.toFixed(2)}
                        </Text>
                      </HStack>
                    )}
                    <Text fontSize="xs" color="green.600">
                      Ahorro: ${(estimatedCost - optimizedCost).toFixed(2)}
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}
          </SimpleGrid>
        )}

        {/* AI Suggestions Panel */}
        {aiSuggestions && showAISuggestions && (
          <Card.Root variant="outline" bg="gradient(to-br, purple.25, blue.25)">
            <Card.Header>
              <HStack justify="space-between">
                <HStack gap={2}>
                  <LightBulbIcon className="w-5 h-5 text-purple-500" />
                  <Text fontSize="md" fontWeight="bold" color="purple.700">
                    🧠 Sugerencias de IA
                  </Text>
                </HStack>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowAISuggestions(false)}
                >
                  ✕
                </Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              <Tabs.Root value={activeAITab} onValueChange={(details) => setActiveAITab(details.value as any)}>
                <Tabs.List>
                  <Tabs.Trigger value="substitutions">
                    <HStack gap={1}>
                      <ArrowPathIcon className="w-3 h-3" />
                      <Text fontSize="sm">Sustituciones</Text>
                      {aiSuggestions.substitutions.length > 0 && (
                        <Badge size="sm" colorPalette="purple">{aiSuggestions.substitutions.length}</Badge>
                      )}
                    </HStack>
                  </Tabs.Trigger>
                  
                  <Tabs.Trigger value="optimization">
                    <HStack gap={1}>
                      <CurrencyDollarIcon className="w-3 h-3" />
                      <Text fontSize="sm">Optimización</Text>
                      {aiSuggestions.costOptimizations.length > 0 && (
                        <Badge size="sm" colorPalette="green">{aiSuggestions.costOptimizations.length}</Badge>
                      )}
                    </HStack>
                  </Tabs.Trigger>
                  
                  <Tabs.Trigger value="yield">
                    <HStack gap={1}>
                      <ScaleIcon className="w-3 h-3" />
                      <Text fontSize="sm">Rendimiento</Text>
                    </HStack>
                  </Tabs.Trigger>
                  
                  <Tabs.Trigger value="nutrition">
                    <HStack gap={1}>
                      <BeakerIcon className="w-3 h-3" />
                      <Text fontSize="sm">Nutrición</Text>
                      {aiSuggestions.nutritionalInsights.length > 0 && (
                        <Badge size="sm" colorPalette="orange">{aiSuggestions.nutritionalInsights.length}</Badge>
                      )}
                    </HStack>
                  </Tabs.Trigger>
                </Tabs.List>
                
                <Box mt={4}>
                  {/* Substitutions Tab */}
                  <Tabs.Content value="substitutions">
                    <VStack gap={3} align="stretch">
                      {aiSuggestions.substitutions.length > 0 ? (
                        aiSuggestions.substitutions.map((sub, index) => {
                          const suggestionId = `sub_${index}`;
                          const isApplied = appliedSuggestions.has(suggestionId);
                          
                          return (
                            <Card.Root key={index} variant="subtle" size="sm">
                              <Card.Body p={3}>
                                <VStack gap={2} align="stretch">
                                  <HStack justify="space-between">
                                    <VStack align="start" gap={0}>
                                      <Text fontSize="sm" fontWeight="medium">
                                        {sub.originalIngredient} → {sub.suggestedSubstitute}
                                      </Text>
                                      <Text fontSize="xs" color="gray.600">
                                        {sub.reason}
                                      </Text>
                                    </VStack>
                                    {isApplied ? (
                                      <Badge colorPalette="green" size="sm">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        Aplicado
                                      </Badge>
                                    ) : (
                                      <Button
                                        size="xs"
                                        colorPalette="purple"
                                        onClick={() => applySuggestion(suggestionId, 'substitution')}
                                      >
                                        Aplicar
                                      </Button>
                                    )}
                                  </HStack>
                                  
                                  <SimpleGrid columns={3} gap={2} fontSize="xs">
                                    <VStack>
                                      <Text color="gray.500">Ahorro</Text>
                                      <Text fontWeight="medium" color={sub.costImpact > 0 ? 'green.600' : 'red.600'}>
                                        ${Math.abs(sub.costImpact).toFixed(2)}
                                      </Text>
                                    </VStack>
                                    <VStack>
                                      <Text color="gray.500">Disponibilidad</Text>
                                      <Text fontWeight="medium" color="blue.600">
                                        {sub.availabilityScore}%
                                      </Text>
                                    </VStack>
                                    <VStack>
                                      <Text color="gray.500">Confianza</Text>
                                      <Text fontWeight="medium" color="purple.600">
                                        {sub.confidenceLevel}%
                                      </Text>
                                    </VStack>
                                  </SimpleGrid>
                                </VStack>
                              </Card.Body>
                            </Card.Root>
                          );
                        })
                      ) : (
                        <Text fontSize="sm" color="gray.600" textAlign="center" py={4}>
                          No se encontraron sustituciones recomendadas para esta receta.
                        </Text>
                      )}
                    </VStack>
                  </Tabs.Content>
                  
                  {/* Optimization Tab */}
                  <Tabs.Content value="optimization">
                    <VStack gap={3} align="stretch">
                      {aiSuggestions.costOptimizations.map((opt, index) => (
                        <Card.Root key={index} variant="subtle" size="sm">
                          <Card.Body p={3}>
                            <VStack gap={2} align="stretch">
                              <HStack justify="space-between">
                                <VStack align="start" gap={0}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {opt.description}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {opt.implementation}
                                  </Text>
                                </VStack>
                                <Badge 
                                  colorPalette={opt.riskLevel === 'low' ? 'green' : opt.riskLevel === 'medium' ? 'yellow' : 'red'}
                                  size="sm"
                                >
                                  {opt.riskLevel}
                                </Badge>
                              </HStack>
                              
                              <SimpleGrid columns={3} gap={2} fontSize="xs">
                                <VStack>
                                  <Text color="gray.500">Costo Actual</Text>
                                  <Text fontWeight="medium">${opt.currentCost.toFixed(2)}</Text>
                                </VStack>
                                <VStack>
                                  <Text color="gray.500">Costo Optimizado</Text>
                                  <Text fontWeight="medium" color="green.600">${opt.optimizedCost.toFixed(2)}</Text>
                                </VStack>
                                <VStack>
                                  <Text color="gray.500">Ahorro</Text>
                                  <Text fontWeight="bold" color="green.600">${opt.savings.toFixed(2)}</Text>
                                </VStack>
                              </SimpleGrid>
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </VStack>
                  </Tabs.Content>
                  
                  {/* Yield Tab */}
                  <Tabs.Content value="yield">
                    {aiSuggestions.yieldOptimization ? (
                      <Card.Root variant="subtle" size="sm">
                        <Card.Body p={4}>
                          <VStack gap={3} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="sm" fontWeight="medium">
                                Optimización de Rendimiento
                              </Text>
                              <Button
                                size="sm"
                                colorPalette="blue"
                                onClick={() => applySuggestion('yield_optimization', 'yield')}
                                disabled={appliedSuggestions.has('yield_optimization')}
                              >
                                {appliedSuggestions.has('yield_optimization') ? 'Aplicado' : 'Aplicar'}
                              </Button>
                            </HStack>
                            
                            <Text fontSize="xs" color="gray.600">
                              {aiSuggestions.yieldOptimization.reasoning}
                            </Text>
                            
                            <SimpleGrid columns={3} gap={3} fontSize="xs">
                              <VStack>
                                <Text color="gray.500">Rendimiento Actual</Text>
                                <Text fontSize="sm" fontWeight="medium">{aiSuggestions.yieldOptimization.currentYield}</Text>
                              </VStack>
                              <VStack>
                                <Text color="gray.500">Rendimiento Sugerido</Text>
                                <Text fontSize="sm" fontWeight="medium" color="green.600">
                                  {aiSuggestions.yieldOptimization.suggestedYield}
                                </Text>
                              </VStack>
                              <VStack>
                                <Text color="gray.500">Mejora</Text>
                                <Text fontSize="sm" fontWeight="bold" color="green.600">
                                  +{aiSuggestions.yieldOptimization.improvement}%
                                </Text>
                              </VStack>
                            </SimpleGrid>
                            
                            {aiSuggestions.yieldOptimization.adjustments.length > 0 && (
                              <VStack gap={2} align="stretch">
                                <Text fontSize="xs" fontWeight="medium" color="gray.700">Ajustes recomendados:</Text>
                                {aiSuggestions.yieldOptimization.adjustments.map((adj, index) => (
                                  <HStack key={index} justify="space-between" fontSize="xs" bg="white" p={2} borderRadius="sm">
                                    <Text>{adj.ingredient}</Text>
                                    <Text color="blue.600">
                                      {adj.currentQuantity} → {adj.suggestedQuantity}
                                    </Text>
                                  </HStack>
                                ))}
                              </VStack>
                            )}
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    ) : (
                      <Text fontSize="sm" color="gray.600" textAlign="center" py={4}>
                        No se detectaron oportunidades de optimización de rendimiento.
                      </Text>
                    )}
                  </Tabs.Content>
                  
                  {/* Nutrition Tab */}
                  <Tabs.Content value="nutrition">
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                      {aiSuggestions.nutritionalInsights.map((insight, index) => (
                        <Card.Root key={index} variant="subtle" size="sm">
                          <Card.Body p={3}>
                            <VStack gap={2} align="stretch">
                              <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">
                                  {insight.category === 'calories' ? 'Calorías' : 
                                   insight.category === 'protein' ? 'Proteínas' :
                                   insight.category === 'carbs' ? 'Carbohidratos' :
                                   insight.category === 'fat' ? 'Grasas' : 'Fibra'}
                                </Text>
                                <Badge 
                                  colorPalette={insight.healthScore > 80 ? 'green' : insight.healthScore > 60 ? 'yellow' : 'red'}
                                  size="sm"
                                >
                                  {insight.healthScore}/100
                                </Badge>
                              </HStack>
                              
                              <HStack justify="space-between">
                                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                  {insight.value}{insight.unit}
                                </Text>
                                {insight.dailyValuePercentage && (
                                  <Text fontSize="xs" color="gray.600">
                                    {insight.dailyValuePercentage}% VD
                                  </Text>
                                )}
                              </HStack>
                              
                              {insight.recommendations.length > 0 && (
                                <VStack gap={1} align="start">
                                  {insight.recommendations.map((rec, recIndex) => (
                                    <Text key={recIndex} fontSize="xs" color="gray.600">
                                      • {rec}
                                    </Text>
                                  ))}
                                </VStack>
                              )}
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </SimpleGrid>
                  </Tabs.Content>
                </Box>
              </Tabs.Root>
            </Card.Body>
          </Card.Root>
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
                <SparklesIcon className="w-4 h-4 mr-2" />
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