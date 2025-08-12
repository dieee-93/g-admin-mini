// AI Recipe Optimizer - Advanced Recipe Intelligence Enhancement
// AI-powered ingredient substitution, cost optimization, and yield analysis

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Table,
  Progress.Root,
  ProgressTrack,
  ProgressRange,
  Alert,
  Tabs,
  Select,
  createListCollection,
  IconButton,
  Spinner,
  Input,
  Textarea,
  NumberInput,
  Slider,
  SwitchRoot,
  SwitchThumb
} from '@chakra-ui/react';
import {
  BeakerIcon,
  SparklesIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  
  ingredients: RecipeIngredient[];
  instructions: string[];
  
  // Nutritional info
  nutrition: NutritionalInfo;
  
  // Cost analysis
  costAnalysis: RecipeCostAnalysis;
  
  // Performance metrics
  performance: RecipePerformance;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

export interface RecipeIngredient {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isOptional: boolean;
  category: 'protein' | 'vegetables' | 'dairy' | 'grains' | 'spices' | 'other';
  allergens?: string[];
  
  // Substitution data
  substitutionOptions: IngredientSubstitution[];
  criticality: 'essential' | 'important' | 'flexible';
}

export interface IngredientSubstitution {
  id: string;
  substituteMaterialId: string;
  substituteName: string;
  conversionRatio: number; // how much substitute needed vs original
  costRatio: number; // cost difference ratio
  flavorImpact: number; // 0-1 scale
  nutritionImpact: NutritionalImpact;
  availability: 'always' | 'seasonal' | 'limited';
  confidence: number; // AI confidence in substitution
  reason: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sodium: number; // mg
  sugar: number; // grams
  servingSize: number; // grams
}

export interface NutritionalImpact {
  calorieChange: number; // percentage
  proteinChange: number; // percentage
  carbChange: number; // percentage
  fatChange: number; // percentage
  healthScore: number; // 0-100
}

export interface RecipeCostAnalysis {
  totalCost: number;
  costPerServing: number;
  ingredientCostBreakdown: Array<{
    category: string;
    cost: number;
    percentage: number;
  }>;
  laborCost: number;
  overheadCost: number;
  targetCostPerServing?: number;
  profitability: {
    margin: number;
    markup: number;
    suggestedPrice: number;
  };
}

export interface RecipePerformance {
  popularity: number; // 0-100
  averageRating: number; // 1-5
  orderFrequency: number; // orders per week
  seasonalTrend: 'up' | 'down' | 'stable';
  yieldConsistency: number; // 0-100
  preparationTime: {
    average: number;
    variance: number;
  };
  customerSatisfaction: number; // 0-100
}

export interface AIOptimizationSuggestion {
  id: string;
  type: 'cost_reduction' | 'nutrition_improvement' | 'yield_optimization' | 'substitution' | 'efficiency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedBenefit: string;
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number; // minutes
    requiredActions: string[];
  };
  impact: {
    costSaving?: number;
    nutritionImprovement?: number;
    yieldIncrease?: number;
    timeReduction?: number;
  };
  confidence: number; // 0-100
  reasoning: string;
}

export interface OptimizationGoals {
  primaryGoal: 'cost' | 'nutrition' | 'taste' | 'efficiency' | 'sustainability';
  maxCostIncrease: number; // percentage
  minNutritionScore: number; // 0-100
  allowedSubstitutions: string[]; // ingredient categories
  preserveAllergenFree: boolean;
  maintainDifficulty: boolean;
  seasonalPreference: 'none' | 'local' | 'seasonal';
}

export interface YieldAnalysis {
  expectedYield: number;
  actualYield: number;
  yieldVariance: number; // percentage
  consistencyScore: number; // 0-100
  improvementSuggestions: string[];
  optimalBatchSize: number;
  scalingFactors: {
    ingredients: number;
    time: number;
    equipment: number;
  };
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockRecipes = (): Recipe[] => {
  const categories = ['Principales', 'Postres', 'Entradas', 'Sopas', 'Ensaladas', 'Bebidas'];
  const difficulties = ['easy', 'medium', 'hard'] as const;
  
  return Array.from({ length: 12 }, (_, index) => {
    const baseServings = Math.floor(Math.random() * 8) + 2;
    const totalCost = Math.random() * 50 + 15;
    
    return {
      id: `recipe-${index + 1}`,
      name: `Receta Premium ${index + 1}`,
      description: `Deliciosa receta con ingredientes seleccionados y técnicas avanzadas de cocción`,
      category: categories[Math.floor(Math.random() * categories.length)],
      servings: baseServings,
      prepTime: Math.floor(Math.random() * 30) + 10,
      cookTime: Math.floor(Math.random() * 60) + 15,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      
      ingredients: generateMockIngredients(5 + Math.floor(Math.random() * 8)),
      instructions: [
        'Preparar todos los ingredientes',
        'Precalentar el horno a temperatura adecuada', 
        'Mezclar ingredientes secos',
        'Incorporar ingredientes húmedos',
        'Cocinar según tiempo indicado',
        'Verificar cocción y servir'
      ],
      
      nutrition: {
        calories: Math.floor(Math.random() * 400) + 200,
        protein: Math.floor(Math.random() * 30) + 10,
        carbs: Math.floor(Math.random() * 50) + 20,
        fat: Math.floor(Math.random() * 20) + 5,
        fiber: Math.floor(Math.random() * 10) + 2,
        sodium: Math.floor(Math.random() * 800) + 200,
        sugar: Math.floor(Math.random() * 15) + 2,
        servingSize: Math.floor(Math.random() * 200) + 150
      },
      
      costAnalysis: {
        totalCost,
        costPerServing: totalCost / baseServings,
        ingredientCostBreakdown: [
          { category: 'Proteínas', cost: totalCost * 0.4, percentage: 40 },
          { category: 'Vegetales', cost: totalCost * 0.3, percentage: 30 },
          { category: 'Especias', cost: totalCost * 0.15, percentage: 15 },
          { category: 'Otros', cost: totalCost * 0.15, percentage: 15 }
        ],
        laborCost: Math.random() * 10 + 5,
        overheadCost: Math.random() * 5 + 2,
        targetCostPerServing: (totalCost / baseServings) * 0.8,
        profitability: {
          margin: Math.random() * 0.4 + 0.3,
          markup: Math.random() * 1.5 + 1.2,
          suggestedPrice: (totalCost / baseServings) * (Math.random() * 1.5 + 2.0)
        }
      },
      
      performance: {
        popularity: Math.floor(Math.random() * 50) + 50,
        averageRating: Math.random() * 1.5 + 3.5,
        orderFrequency: Math.floor(Math.random() * 20) + 5,
        seasonalTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        yieldConsistency: Math.floor(Math.random() * 20) + 80,
        preparationTime: {
          average: Math.floor(Math.random() * 10) + 15,
          variance: Math.floor(Math.random() * 5) + 2
        },
        customerSatisfaction: Math.floor(Math.random() * 20) + 80
      },
      
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Chef Principal',
      version: Math.floor(Math.random() * 3) + 1
    };
  });
};

const generateMockIngredients = (count: number): RecipeIngredient[] => {
  const materials = ['Carne de Res', 'Pollo', 'Salmón', 'Papas', 'Cebolla', 'Tomate', 'Ajo', 'Aceite de Oliva', 'Sal', 'Pimienta', 'Queso', 'Leche'];
  const categories = ['protein', 'vegetables', 'dairy', 'grains', 'spices', 'other'] as const;
  const criticalities = ['essential', 'important', 'flexible'] as const;
  
  return Array.from({ length: count }, (_, index) => {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const quantity = Math.random() * 500 + 50;
    const unitCost = Math.random() * 10 + 1;
    
    return {
      id: `ingredient-${index + 1}`,
      materialId: `mat-${index + 1}`,
      materialName: material,
      quantity,
      unit: ['kg', 'g', 'ml', 'l', 'unidad'][Math.floor(Math.random() * 5)],
      unitCost,
      totalCost: quantity * unitCost / 1000,
      isOptional: Math.random() > 0.8,
      category: categories[Math.floor(Math.random() * categories.length)],
      allergens: Math.random() > 0.7 ? ['gluten', 'lactosa'][Math.floor(Math.random() * 2)] ? [['gluten', 'lactosa'][Math.floor(Math.random() * 2)]] : undefined : undefined,
      substitutionOptions: generateMockSubstitutions(Math.floor(Math.random() * 4) + 1),
      criticality: criticalities[Math.floor(Math.random() * criticalities.length)]
    };
  });
};

const generateMockSubstitutions = (count: number): IngredientSubstitution[] => {
  const substitutes = ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Sustituto Natural', 'Opción Orgánica'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `sub-${index + 1}`,
    substituteMaterialId: `sub-mat-${index + 1}`,
    substituteName: substitutes[index] || `Sustituto ${index + 1}`,
    conversionRatio: Math.random() * 0.5 + 0.75,
    costRatio: Math.random() * 0.4 + 0.8,
    flavorImpact: Math.random() * 0.3 + 0.7,
    nutritionImpact: {
      calorieChange: (Math.random() - 0.5) * 20,
      proteinChange: (Math.random() - 0.5) * 30,
      carbChange: (Math.random() - 0.5) * 25,
      fatChange: (Math.random() - 0.5) * 20,
      healthScore: Math.floor(Math.random() * 30) + 70
    },
    availability: ['always', 'seasonal', 'limited'][Math.floor(Math.random() * 3)] as any,
    confidence: Math.floor(Math.random() * 30) + 70,
    reason: 'Análisis de compatibilidad nutricional y de sabor mediante IA'
  }));
};

const generateMockOptimizationSuggestions = (): AIOptimizationSuggestion[] => {
  return [
    {
      id: 'opt-1',
      type: 'cost_reduction',
      priority: 'high',
      title: 'Optimización de Costo de Proteína',
      description: 'Sustituir corte premium por alternativa de igual calidad nutricional',
      expectedBenefit: 'Reducción del 25% en costo de ingredientes',
      implementation: {
        difficulty: 'easy',
        estimatedTime: 5,
        requiredActions: ['Actualizar receta', 'Probar nueva combinación', 'Validar con equipo']
      },
      impact: {
        costSaving: 12.50,
        nutritionImprovement: 5
      },
      confidence: 87,
      reasoning: 'Análisis de 1000+ recetas similares muestra resultado exitoso en 92% de casos'
    },
    {
      id: 'opt-2',
      type: 'nutrition_improvement',
      priority: 'medium',
      title: 'Mejora Nutricional sin Impacto en Costo',
      description: 'Incorporar superalimentos locales para aumentar valor nutricional',
      expectedBenefit: 'Aumento del 30% en score nutricional',
      implementation: {
        difficulty: 'medium',
        estimatedTime: 15,
        requiredActions: ['Sourcing de ingredientes', 'Ajuste de proporciones', 'Testing de sabor']
      },
      impact: {
        nutritionImprovement: 30,
        costSaving: -2.00
      },
      confidence: 78,
      reasoning: 'Tendencia de mercado hacia alimentación saludable genera valor agregado'
    },
    {
      id: 'opt-3',
      type: 'yield_optimization',
      priority: 'high',
      title: 'Optimización de Rendimiento',
      description: 'Ajuste en técnica de cocción para mejorar yield consistency',
      expectedBenefit: 'Mejora del 15% en consistencia de porciones',
      implementation: {
        difficulty: 'medium',
        estimatedTime: 30,
        requiredActions: ['Training de equipo', 'Estandarización de proceso', 'Medición de resultados']
      },
      impact: {
        yieldIncrease: 15,
        costSaving: 8.30
      },
      confidence: 92,
      reasoning: 'Machine learning detecta patrón de mejora basado en datos históricos de preparación'
    },
    {
      id: 'opt-4',
      type: 'efficiency',
      priority: 'medium',
      title: 'Optimización de Tiempo de Preparación',
      description: 'Reorganizar secuencia de pasos para reducir tiempo total',
      expectedBenefit: 'Reducción del 20% en tiempo de preparación',
      implementation: {
        difficulty: 'easy',
        estimatedTime: 10,
        requiredActions: ['Reordenar instrucciones', 'Actualizar mise en place', 'Validar tiempos']
      },
      impact: {
        timeReduction: 8,
        costSaving: 5.20
      },
      confidence: 85,
      reasoning: 'Análisis de flujo de trabajo identifica cuellos de botella optimizables'
    }
  ];
};

// ============================================================================
// AI RECIPE OPTIMIZER COMPONENT
// ============================================================================

const optimizationGoalOptions = createListCollection({
  items: [
    { value: 'cost', label: 'Optimización de Costos' },
    { value: 'nutrition', label: 'Mejora Nutricional' },
    { value: 'taste', label: 'Optimización de Sabor' },
    { value: 'efficiency', label: 'Eficiencia Operacional' },
    { value: 'sustainability', label: 'Sostenibilidad' }
  ]
});

const difficultyOptions = createListCollection({
  items: [
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Medio' },
    { value: 'hard', label: 'Difícil' }
  ]
});

export function AIRecipeOptimizer() {
  // State management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<AIOptimizationSuggestion[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'optimizer' | 'substitutions' | 'yield' | 'nutrition'>('optimizer');
  
  // Optimization settings
  const [goals, setGoals] = useState<OptimizationGoals>({
    primaryGoal: 'cost',
    maxCostIncrease: 10,
    minNutritionScore: 70,
    allowedSubstitutions: ['vegetables', 'spices'],
    preserveAllergenFree: true,
    maintainDifficulty: true,
    seasonalPreference: 'local'
  });

  // Load recipes data
  useEffect(() => {
    loadRecipesData();
  }, []);

  const loadRecipesData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockRecipes = generateMockRecipes();
      setRecipes(mockRecipes);
      setSelectedRecipe(mockRecipes[0]);
      
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Optimization Process
  const runAIOptimization = useCallback(async () => {
    if (!selectedRecipe) return;
    
    try {
      setIsOptimizing(true);
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const suggestions = generateMockOptimizationSuggestions();
      setOptimizationSuggestions(suggestions);
      
      // Emit optimization event
      await EventBus.emit(
        RestaurantEvents.DATA_SYNCED,
        {
          type: 'ai_recipe_optimization_completed',
          recipeId: selectedRecipe.id,
          recipeName: selectedRecipe.name,
          suggestionsCount: suggestions.length,
          primaryGoal: goals.primaryGoal,
          estimatedSavings: suggestions.reduce((sum, s) => sum + (s.impact.costSaving || 0), 0)
        },
        'AIRecipeOptimizer'
      );
      
    } catch (error) {
      console.error('Error running AI optimization:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [selectedRecipe, goals]);

  // Apply optimization suggestion
  const applySuggestion = async (suggestionId: string) => {
    const suggestion = optimizationSuggestions.find(s => s.id === suggestionId);
    if (!suggestion || !selectedRecipe) return;
    
    console.log(`Applying suggestion: ${suggestion.title} to recipe: ${selectedRecipe.name}`);
    
    // Simulate application
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update suggestions list
    setOptimizationSuggestions(prev => 
      prev.map(s => 
        s.id === suggestionId 
          ? { ...s, implementation: { ...s.implementation, difficulty: 'easy' } }
          : s
      )
    );
    
    // Emit application event
    await EventBus.emit(
      RestaurantEvents.DATA_SYNCED,
      {
        type: 'ai_suggestion_applied',
        suggestionId,
        recipeId: selectedRecipe.id,
        suggestionType: suggestion.type
      },
      'AIRecipeOptimizer'
    );
  };

  // Calculate optimization impact
  const optimizationImpact = useMemo(() => {
    if (optimizationSuggestions.length === 0) return null;
    
    const totalCostSaving = optimizationSuggestions.reduce((sum, s) => sum + (s.impact.costSaving || 0), 0);
    const totalNutritionImprovement = optimizationSuggestions.reduce((sum, s) => sum + (s.impact.nutritionImprovement || 0), 0);
    const totalTimeReduction = optimizationSuggestions.reduce((sum, s) => sum + (s.impact.timeReduction || 0), 0);
    const averageConfidence = optimizationSuggestions.reduce((sum, s) => sum + s.confidence, 0) / optimizationSuggestions.length;
    
    return {
      costSaving: totalCostSaving,
      nutritionImprovement: totalNutritionImprovement / optimizationSuggestions.length,
      timeReduction: totalTimeReduction,
      confidence: averageConfidence,
      criticalSuggestions: optimizationSuggestions.filter(s => s.priority === 'critical').length,
      highPriority: optimizationSuggestions.filter(s => s.priority === 'high').length
    };
  }, [optimizationSuggestions]);

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="purple" />
          <Text>Cargando AI Recipe Optimizer...</Text>
          <Text fontSize="sm" color="gray.600">Analizando recetas y preparando sugerencias inteligentes</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header with Controls */}
      <Card.Root>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="1">
                <HStack gap="2">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                  <Text fontSize="xl" fontWeight="bold">AI Recipe Optimizer</Text>
                  <Badge colorPalette="purple" size="sm">Intelligence Enhancement</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Optimización inteligente de recetas con IA: sustituciones, costos y análisis nutricional
                </Text>
              </VStack>

              <HStack gap="2">
                <Select.Root
                  value={selectedRecipe ? [selectedRecipe.id] : []}
                  onValueChange={(details) => {
                    const recipe = recipes.find(r => r.id === details.value[0]);
                    setSelectedRecipe(recipe || null);
                  }}
                  width="250px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Seleccionar receta" />
                  </Select.Trigger>
                  <Select.Content>
                    {recipes.map(recipe => (
                      <Select.Item key={recipe.id} item={{ value: recipe.id, label: recipe.name }}>
                        {recipe.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Button
                  colorPalette="purple"
                  onClick={runAIOptimization}
                  loading={isOptimizing}
                  loadingText="Analizando..."

                  size="sm"
                  disabled={!selectedRecipe}
                >
                  <BoltIcon className="w-4 h-4" />
                  Optimizar con IA
                </Button>
              </HStack>
            </HStack>

            {/* Recipe Overview */}
            {selectedRecipe && (
              <Card.Root variant="outline">
                <Card.Body p="4">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap="2">
                      <Text fontSize="lg" fontWeight="bold">{selectedRecipe.name}</Text>
                      <Text fontSize="sm" color="gray.600">{selectedRecipe.description}</Text>
                      <HStack gap="4">
                        <HStack gap="1">
                          <ScaleIcon className="w-4 h-4 text-gray-400" />
                          <Text fontSize="sm">{selectedRecipe.servings} porciones</Text>
                        </HStack>
                        <HStack gap="1">
                          <BeakerIcon className="w-4 h-4 text-gray-400" />
                          <Text fontSize="sm">{selectedRecipe.difficulty}</Text>
                        </HStack>
                        <HStack gap="1">
                          <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                          <Text fontSize="sm">${selectedRecipe.costAnalysis.costPerServing.toFixed(2)}/porción</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                    
                    <VStack align="end" gap="1">
                      <Badge colorPalette="green" size="sm">
                        Rating: {selectedRecipe.performance.averageRating.toFixed(1)}⭐
                      </Badge>
                      <Badge colorPalette="blue" size="sm">
                        Popularidad: {selectedRecipe.performance.popularity}%
                      </Badge>
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            )}

            {/* Optimization Impact Summary */}
            {optimizationImpact && (
              <SimpleGrid columns={{ base: 2, md: 5 }} gap="4">
                <Card.Root variant="subtle" bg="green.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        ${Math.abs(optimizationImpact.costSaving).toFixed(2)}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Ahorro Pot.</Text>
                      <Text fontSize="xs" color="green.600">por porción</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        +{optimizationImpact.nutritionImprovement.toFixed(0)}%
                      </Text>
                      <Text fontSize="sm" color="gray.600">Mejora Nutric.</Text>
                      <Text fontSize="xs" color="blue.600">promedio</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="orange.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        -{optimizationImpact.timeReduction}min
                      </Text>
                      <Text fontSize="sm" color="gray.600">Tiempo Menos</Text>
                      <Text fontSize="xs" color="orange.600">preparación</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="purple.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {optimizationImpact.confidence.toFixed(0)}%
                      </Text>
                      <Text fontSize="sm" color="gray.600">Confianza IA</Text>
                      <Text fontSize="xs" color="purple.600">promedio</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="red.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {optimizationImpact.highPriority}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Alta Prioridad</Text>
                      <Text fontSize="xs" color="red.600">sugerencias</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Main Content Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="optimizer">
            <HStack gap={2}>
              <SparklesIcon className="w-4 h-4" />
              <Text>Optimizaciones IA</Text>
              {optimizationImpact && optimizationImpact.highPriority > 0 && (
                <Badge colorPalette="red" size="sm">{optimizationImpact.highPriority}</Badge>
              )}
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="substitutions">
            <HStack gap={2}>
              <ArrowsUpDownIcon className="w-4 h-4" />
              <Text>Sustituciones</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="yield">
            <HStack gap={2}>
              <ScaleIcon className="w-4 h-4" />
              <Text>Análisis Yield</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="nutrition">
            <HStack gap={2}>
              <BeakerIcon className="w-4 h-4" />
              <Text>Optimización Nutricional</Text>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Optimizer Tab */}
          <Tabs.Content value="optimizer">
            <VStack gap="6" align="stretch">
              {/* Optimization Goals */}
              <Card.Root>
                <Card.Header>
                  <Text fontWeight="bold">Configuración de Optimización</Text>
                </Card.Header>
                <Card.Body>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    <VStack align="start" gap="2">
                      <Text fontSize="sm" fontWeight="medium">Objetivo Principal</Text>
                      <Select.Root
                        collection={optimizationGoalOptions}
                        value={[goals.primaryGoal]}
                        onValueChange={(details) => setGoals(prev => ({ ...prev, primaryGoal: details.value[0] as any }))}
                      >
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.Content>
                          {optimizationGoalOptions.items.map(item => (
                            <Select.Item key={item.value} item={item}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </VStack>

                    <VStack align="start" gap="2">
                      <Text fontSize="sm" fontWeight="medium">Máximo Aumento de Costo (%)</Text>
                      <Slider
                        value={[goals.maxCostIncrease]}
                        onValueChange={([value]) => setGoals(prev => ({ ...prev, maxCostIncrease: value }))}
                        min={0}
                        max={50}
                        step={5}
                        width="100%"
                      >
                        <Slider.Track>
                          <Slider.Range />
                        </Slider.Track>
                        <Slider.Thumb />
                        <Slider.ValueText />
                      </Slider>
                    </VStack>

                    <VStack align="start" gap="2">
                      <HStack justify="space-between" w="full">
                        <SwitchRoot
                          checked={goals.preserveAllergenFree}
                          onCheckedChange={(checked) => setGoals(prev => ({ ...prev, preserveAllergenFree: checked.checked }))}
                        >
                          <SwitchThumb />
                        </SwitchRoot>
                      </HStack>
                    </VStack>

                    <VStack align="start" gap="2">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" fontWeight="medium">Mantener Dificultad</Text>
                        <Switch
                          checked={goals.maintainDifficulty}
                          onCheckedChange={(checked) => setGoals(prev => ({ ...prev, maintainDifficulty: checked.checked }))}
                        />
                      </HStack>
                    </VStack>
                  </SimpleGrid>
                </Card.Body>
              </Card.Root>

              <OptimizationSuggestionsTable 
                suggestions={optimizationSuggestions}
                onApply={applySuggestion}
              />
            </VStack>
          </Tabs.Content>

          {/* Substitutions Tab */}
          <Tabs.Content value="substitutions">
            <IngredientSubstitutionsPanel 
              recipe={selectedRecipe}
              goals={goals}
            />
          </Tabs.Content>

          {/* Yield Analysis Tab */}
          <Tabs.Content value="yield">
            <YieldAnalysisPanel 
              recipe={selectedRecipe}
            />
          </Tabs.Content>

          {/* Nutrition Tab */}
          <Tabs.Content value="nutrition">
            <NutritionOptimizationPanel 
              recipe={selectedRecipe}
              goals={goals}
            />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface OptimizationSuggestionsTableProps {
  suggestions: AIOptimizationSuggestion[];
  onApply: (suggestionId: string) => void;
}

function OptimizationSuggestionsTable({ suggestions, onApply }: OptimizationSuggestionsTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cost_reduction': return CurrencyDollarIcon;
      case 'nutrition_improvement': return BeakerIcon;
      case 'yield_optimization': return ScaleIcon;
      case 'efficiency': return BoltIcon;
      default: return LightBulbIcon;
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <SparklesIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay sugerencias disponibles</Text>
            <Text fontSize="sm" color="gray.400">Ejecuta la optimización para ver recomendaciones de IA</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="bold">Sugerencias de Optimización IA - {suggestions.length}</Text>
      </Card.Header>
      <Card.Body>
        <VStack gap="4" align="stretch">
          {suggestions.map((suggestion) => {
            const TypeIcon = getTypeIcon(suggestion.type);
            return (
              <Card.Root key={suggestion.id} variant="outline">
                <Card.Body p="4">
                  <VStack gap="3" align="stretch">
                    <HStack justify="space-between" align="start">
                      <HStack gap="3">
                        <Box p="2" bg={`${getPriorityColor(suggestion.priority)}.100`} borderRadius="md">
                          <TypeIcon className={`w-5 h-5 text-${getPriorityColor(suggestion.priority)}-600`} />
                        </Box>
                        <VStack align="start" gap="1">
                          <Text fontWeight="bold">{suggestion.title}</Text>
                          <Text fontSize="sm" color="gray.600">{suggestion.description}</Text>
                        </VStack>
                      </HStack>
                      <VStack align="end" gap="1">
                        <Badge colorPalette={getPriorityColor(suggestion.priority)} size="sm">
                          {suggestion.priority === 'critical' ? 'Crítica' :
                           suggestion.priority === 'high' ? 'Alta' :
                           suggestion.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          Confianza: {suggestion.confidence}%
                        </Text>
                      </VStack>
                    </HStack>

                    <Text fontSize="sm" color="green.600">
                      💡 {suggestion.expectedBenefit}
                    </Text>

                    <HStack gap="6" flexWrap="wrap">
                      {suggestion.impact.costSaving && (
                        <HStack gap="1">
                          <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                          <Text fontSize="sm">
                            {suggestion.impact.costSaving > 0 ? '+' : ''}${suggestion.impact.costSaving.toFixed(2)}
                          </Text>
                        </HStack>
                      )}
                      
                      {suggestion.impact.nutritionImprovement && (
                        <HStack gap="1">
                          <BeakerIcon className="w-4 h-4 text-blue-500" />
                          <Text fontSize="sm">+{suggestion.impact.nutritionImprovement}% nutrición</Text>
                        </HStack>
                      )}
                      
                      {suggestion.impact.timeReduction && (
                        <HStack gap="1">
                          <BoltIcon className="w-4 h-4 text-orange-500" />
                          <Text fontSize="sm">-{suggestion.impact.timeReduction}min</Text>
                        </HStack>
                      )}
                    </HStack>

                    <HStack justify="space-between" pt="2" borderTop="1px solid" borderColor="gray.100">
                      <VStack align="start" gap="1">
                        <Text fontSize="xs" color="gray.500">
                          Dificultad: {suggestion.implementation.difficulty} • 
                          Tiempo: {suggestion.implementation.estimatedTime}min
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {suggestion.reasoning}
                        </Text>
                      </VStack>
                      
                      <Button
                        size="sm"
                        colorPalette="purple"
                        onClick={() => onApply(suggestion.id)}
                      >
                        Aplicar
                      </Button>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            );
          })}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

interface IngredientSubstitutionsPanelProps {
  recipe: Recipe | null;
  goals: OptimizationGoals;
}

function IngredientSubstitutionsPanel({ recipe, goals }: IngredientSubstitutionsPanelProps) {
  if (!recipe) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <ArrowsUpDownIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">Selecciona una receta para ver sustituciones</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack gap="4" align="stretch">
      {recipe.ingredients.map(ingredient => (
        <Card.Root key={ingredient.id} variant="outline">
          <Card.Body p="4">
            <VStack gap="3" align="stretch">
              <HStack justify="space-between">
                <VStack align="start" gap="1">
                  <Text fontWeight="bold">{ingredient.materialName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {ingredient.quantity} {ingredient.unit} • ${ingredient.totalCost.toFixed(2)}
                  </Text>
                  <Badge colorPalette={ingredient.criticality === 'essential' ? 'red' : ingredient.criticality === 'important' ? 'yellow' : 'green'} size="xs">
                    {ingredient.criticality === 'essential' ? 'Esencial' : ingredient.criticality === 'important' ? 'Importante' : 'Flexible'}
                  </Badge>
                </VStack>
                <VStack align="end" gap="1">
                  <Text fontSize="sm" color="gray.500">
                    {ingredient.substitutionOptions.length} alternativas
                  </Text>
                </VStack>
              </HStack>

              {ingredient.substitutionOptions.length > 0 && (
                <VStack gap="2" align="stretch">
                  <Text fontSize="sm" fontWeight="medium">Sustituciones Recomendadas:</Text>
                  {ingredient.substitutionOptions.slice(0, 2).map(sub => (
                    <HStack key={sub.id} p="2" bg="gray.50" borderRadius="md" justify="space-between">
                      <VStack align="start" gap="0">
                        <Text fontSize="sm" fontWeight="medium">{sub.substituteName}</Text>
                        <Text fontSize="xs" color="gray.600">
                          Ratio: {sub.conversionRatio.toFixed(2)} • 
                          Costo: {((sub.costRatio - 1) * 100).toFixed(0)}% • 
                          Confianza: {sub.confidence}%
                        </Text>
                      </VStack>
                      <Button size="xs" variant="outline">Usar</Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
}

interface YieldAnalysisPanelProps {
  recipe: Recipe | null;
}

function YieldAnalysisPanel({ recipe }: YieldAnalysisPanelProps) {
  if (!recipe) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <ScaleIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">Selecciona una receta para análisis de rendimiento</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  const mockYieldAnalysis: YieldAnalysis = {
    expectedYield: recipe.servings,
    actualYield: recipe.servings * 0.95,
    yieldVariance: -5,
    consistencyScore: recipe.performance.yieldConsistency,
    improvementSuggestions: [
      'Estandarizar el tamaño de porciones',
      'Mejorar técnicas de medición',
      'Entrenar al equipo en consistencia'
    ],
    optimalBatchSize: recipe.servings * 2,
    scalingFactors: {
      ingredients: 1.0,
      time: 0.85,
      equipment: 1.1
    }
  };

  return (
    <VStack gap="6" align="stretch">
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
        <Card.Root variant="outline">
          <Card.Body p="4" textAlign="center">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {mockYieldAnalysis.consistencyScore}%
              </Text>
              <Text fontSize="sm" color="gray.600">Consistencia</Text>
              <Progress
                value={mockYieldAnalysis.consistencyScore}
                colorPalette="blue"
                size="sm"
              />
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4" textAlign="center">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color={mockYieldAnalysis.yieldVariance < 0 ? "red.600" : "green.600"}>
                {mockYieldAnalysis.yieldVariance}%
              </Text>
              <Text fontSize="sm" color="gray.600">Variación</Text>
              <Text fontSize="xs" color="gray.500">
                Esperado: {mockYieldAnalysis.expectedYield} | Actual: {mockYieldAnalysis.actualYield}
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4" textAlign="center">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {mockYieldAnalysis.optimalBatchSize}
              </Text>
              <Text fontSize="sm" color="gray.600">Batch Óptimo</Text>
              <Text fontSize="xs" color="gray.500">porciones</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Sugerencias de Mejora</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="2" align="stretch">
            {mockYieldAnalysis.improvementSuggestions.map((suggestion, index) => (
              <HStack key={index} gap="2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <Text fontSize="sm">{suggestion}</Text>
              </HStack>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

interface NutritionOptimizationPanelProps {
  recipe: Recipe | null;
  goals: OptimizationGoals;
}

function NutritionOptimizationPanel({ recipe, goals }: NutritionOptimizationPanelProps) {
  if (!recipe) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <BeakerIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">Selecciona una receta para optimización nutricional</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  const nutrition = recipe.nutrition;
  const healthScore = (nutrition.protein * 4 + nutrition.fiber * 10 - nutrition.sodium / 100 - nutrition.sugar * 2) / 10;

  return (
    <VStack gap="6" align="stretch">
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <Card.Root variant="outline">
          <Card.Body p="3" textAlign="center">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold">{nutrition.calories}</Text>
              <Text fontSize="sm" color="gray.600">Calorías</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="3" textAlign="center">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="green.600">{nutrition.protein}g</Text>
              <Text fontSize="sm" color="gray.600">Proteína</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="3" textAlign="center">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="blue.600">{nutrition.carbs}g</Text>
              <Text fontSize="sm" color="gray.600">Carbos</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="3" textAlign="center">
            <VStack gap="1">
              <Text fontSize="xl" fontWeight="bold" color="orange.600">{nutrition.fat}g</Text>
              <Text fontSize="sm" color="gray.600">Grasa</Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Score Nutricional</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between">
              <Text>Score de Salud</Text>
              <HStack gap="2">
                <Progress
                  value={Math.max(0, Math.min(100, healthScore))}
                  colorPalette={healthScore > 70 ? 'green' : healthScore > 40 ? 'yellow' : 'red'}
                  size="lg"
                  width="200px"
                />
                <Text fontWeight="bold">
                  {Math.max(0, Math.min(100, healthScore)).toFixed(0)}/100
                </Text>
              </HStack>
            </HStack>

            <Alert.Root status={healthScore > 70 ? 'success' : healthScore > 40 ? 'warning' : 'error'} variant="subtle">
              <Alert.Title>
                {healthScore > 70 ? 'Excelente perfil nutricional' : 
                 healthScore > 40 ? 'Perfil nutricional moderado' : 'Oportunidad de mejora nutricional'}
              </Alert.Title>
              <Alert.Description>
                {healthScore > 70 ? 'Esta receta tiene un balance nutricional muy bueno' :
                 healthScore > 40 ? 'Se pueden hacer mejoras menores para optimizar el perfil nutricional' :
                 'Considere sustituciones para mejorar el valor nutricional'}
              </Alert.Description>
            </Alert.Root>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

export default AIRecipeOptimizer;