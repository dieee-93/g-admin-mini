// RecipeAISuggestions.tsx - AI-powered recipe optimization suggestions
import { useState } from 'react';
import {
  CardWrapper ,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Tabs,
  SimpleGrid,
  Progress
} from '@chakra-ui/react';
import {
  LightBulbIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  BeakerIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// AI Suggestions Interfaces
interface IngredientSubstitution {
  originalIngredient: string;
  suggestedSubstitute: string;
  reason: string;
  costImpact: number;
  availabilityScore: number;
  nutritionalImpact: string;
  confidenceLevel: number;
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
  improvement: number;
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
  healthScore: number;
  recommendations: string[];
}

interface AIRecipeSuggestions {
  substitutions: IngredientSubstitution[];
  costOptimizations: CostOptimization[];
  yieldOptimization?: YieldOptimization;
  nutritionalInsights: NutritionalInsight[];
  overallScore: number;
  confidence: number;
}

interface RecipeAISuggestionsProps {
  suggestions: AIRecipeSuggestions;
  appliedSuggestions: Set<string>;
  onApplySuggestion: (suggestionId: string, type: string) => void;
  onClose: () => void;
}

export function RecipeAISuggestions({
  suggestions,
  appliedSuggestions,
  onApplySuggestion,
  onClose
}: RecipeAISuggestionsProps) {
  const [activeTab, setActiveTab] = useState<'substitutions' | 'optimization' | 'yield' | 'nutrition'>('substitutions');

  return (
    <CardWrapper .Root variant="outline" bg="gradient(to-br, purple.25, blue.25)">
      <CardWrapper .Header>
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
            onClick={onClose}
          >
            ✕
          </Button>
        </HStack>
      </CardWrapper .Header>
      <CardWrapper .Body>
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="substitutions">
              <HStack gap={1}>
                <ArrowPathIcon className="w-3 h-3" />
                <Text fontSize="sm">Sustituciones</Text>
                {suggestions.substitutions.length > 0 && (
                  <Badge size="sm" colorPalette="purple">{suggestions.substitutions.length}</Badge>
                )}
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="optimization">
              <HStack gap={1}>
                <CurrencyDollarIcon className="w-3 h-3" />
                <Text fontSize="sm">Optimización</Text>
                {suggestions.costOptimizations.length > 0 && (
                  <Badge size="sm" colorPalette="green">{suggestions.costOptimizations.length}</Badge>
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
                {suggestions.nutritionalInsights.length > 0 && (
                  <Badge size="sm" colorPalette="orange">{suggestions.nutritionalInsights.length}</Badge>
                )}
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>
          
          <VStack mt={4} gap={4} align="stretch">
            {/* Substitutions Tab */}
            <Tabs.Content value="substitutions">
              <VStack gap={3} align="stretch">
                {suggestions.substitutions.length > 0 ? (
                  suggestions.substitutions.map((sub, index) => {
                    const suggestionId = `sub_${index}`;
                    const isApplied = appliedSuggestions.has(suggestionId);
                    
                    return (
                      <CardWrapper .Root key={index} variant="subtle" size="sm">
                        <CardWrapper .Body p={3}>
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
                                  onClick={() => onApplySuggestion(suggestionId, 'substitution')}
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
                        </CardWrapper .Body>
                      </CardWrapper .Root>
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
                {suggestions.costOptimizations.map((opt, index) => (
                  <CardWrapper .Root key={index} variant="subtle" size="sm">
                    <CardWrapper .Body p={3}>
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
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                ))}
              </VStack>
            </Tabs.Content>
            
            {/* Yield Tab */}
            <Tabs.Content value="yield">
              {suggestions.yieldOptimization ? (
                <CardWrapper .Root variant="subtle" size="sm">
                  <CardWrapper .Body p={4}>
                    <VStack gap={3} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          Optimización de Rendimiento
                        </Text>
                        <Button
                          size="sm"
                          colorPalette="blue"
                          onClick={() => onApplySuggestion('yield_optimization', 'yield')}
                          disabled={appliedSuggestions.has('yield_optimization')}
                        >
                          {appliedSuggestions.has('yield_optimization') ? 'Aplicado' : 'Aplicar'}
                        </Button>
                      </HStack>
                      
                      <Text fontSize="xs" color="gray.600">
                        {suggestions.yieldOptimization.reasoning}
                      </Text>
                      
                      <SimpleGrid columns={3} gap={3} fontSize="xs">
                        <VStack>
                          <Text color="gray.500">Rendimiento Actual</Text>
                          <Text fontSize="sm" fontWeight="medium">{suggestions.yieldOptimization.currentYield}</Text>
                        </VStack>
                        <VStack>
                          <Text color="gray.500">Rendimiento Sugerido</Text>
                          <Text fontSize="sm" fontWeight="medium" color="green.600">
                            {suggestions.yieldOptimization.suggestedYield}
                          </Text>
                        </VStack>
                        <VStack>
                          <Text color="gray.500">Mejora</Text>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            +{suggestions.yieldOptimization.improvement}%
                          </Text>
                        </VStack>
                      </SimpleGrid>
                      
                      {suggestions.yieldOptimization.adjustments.length > 0 && (
                        <VStack gap={2} align="stretch">
                          <Text fontSize="xs" fontWeight="medium" color="gray.700">Ajustes recomendados:</Text>
                          {suggestions.yieldOptimization.adjustments.map((adj, index) => (
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
                  </CardWrapper .Body>
                </CardWrapper .Root>
              ) : (
                <Text fontSize="sm" color="gray.600" textAlign="center" py={4}>
                  No se detectaron oportunidades de optimización de rendimiento.
                </Text>
              )}
            </Tabs.Content>
            
            {/* Nutrition Tab */}
            <Tabs.Content value="nutrition">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                {suggestions.nutritionalInsights.map((insight, index) => (
                  <CardWrapper .Root key={index} variant="subtle" size="sm">
                    <CardWrapper .Body p={3}>
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
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                ))}
              </SimpleGrid>
            </Tabs.Content>
          </VStack>
        </Tabs.Root>
      </CardWrapper .Body>
    </CardWrapper .Root>
  );
}

export default RecipeAISuggestions;