import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Tabs,
  Switch,
  Progress,
  SimpleGrid,
} from '@chakra-ui/react';
import { Icon, CardWrapper } from '@/shared/ui';
import {
  LightBulbIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import type { AIRecipeSuggestions } from '../RecipeForm.mock';

interface RecipeFormAISuggestionsProps {
  aiEnabled: boolean;
  setAiEnabled: (checked: boolean) => void;
  isGeneratingAI: boolean;
  generateAISuggestions: () => void;
  aiSuggestions: AIRecipeSuggestions | null;
  estimatedCost: number;
  estimatedCostPerUnit: number;
  optimizedCost: number;
  optimizedCostPerUnit: number;
  showAISuggestions: boolean;
  setShowAISuggestions: (value: boolean) => void;
  activeAITab: string;
  setActiveAITab: (value: string) => void;
  appliedSuggestions: Set<string>;
  applySuggestion: (suggestionId: string, type: string) => void;
}

export const RecipeFormAISuggestions: React.FC<RecipeFormAISuggestionsProps> = ({
  aiEnabled,
  setAiEnabled,
  isGeneratingAI,
  generateAISuggestions,
  aiSuggestions,
  estimatedCost,
  estimatedCostPerUnit,
  optimizedCost,
  optimizedCostPerUnit,
  showAISuggestions,
  setShowAISuggestions,
  activeAITab,
  setActiveAITab,
  appliedSuggestions,
  applySuggestion,
}) => {
  return (
    <>
      <CardWrapper variant="outline" bg="gradient(to-r, purple.50, blue.50)">
        <CardWrapper.Body p="4">
          <HStack justify="space-between">
            <HStack gap="3">
              <Icon icon={SparklesIcon} size="lg" color="purple.500" />
              <VStack align="start" gap="0">
                <Text fontSize="sm" fontWeight="medium" color="purple.700">
                  🤖 AI Recipe Assistant
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Obtén sugerencias inteligentes para optimizar tu receta
                </Text>
              </VStack>
            </HStack>

            <HStack gap="2">
              {isGeneratingAI && (
                <HStack gap="2">
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
                  <Icon icon={ArrowPathIcon} size="xs" style={{ marginRight: '8px' }} />
                  Generar Sugerencias
                </Button>
              )}
            </HStack>
          </HStack>

          {aiSuggestions && (
            <HStack gap="4" mt="3" fontSize="xs">
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
        </CardWrapper.Body>
      </CardWrapper>

      {estimatedCost > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <CardWrapper variant="outline" bg="blue.50">
            <CardWrapper.Body p="4">
              <VStack gap="2" align="stretch">
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
            </CardWrapper.Body>
          </CardWrapper>

          {aiSuggestions && optimizedCost < estimatedCost && (
            <CardWrapper variant="outline" >
              <CardWrapper.Body p="4">
                <VStack gap="2" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium" color="green.700">
                      🎯 Costo Optimizado (IA)
                    </Text>
                    <Badge colorPalette="green" variant="subtle">
                      -{((1 - optimizedCost / estimatedCost) * 100).toFixed(1)}%
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
              </CardWrapper.Body>
            </CardWrapper>
          )}
        </SimpleGrid>
      )}

      {aiSuggestions && showAISuggestions && (
        <CardWrapper variant="outline" bg="gradient(to-br, purple.25, blue.25)">
          <CardWrapper.Header>
            <HStack justify="space-between">
              <HStack gap="2">
                <Icon icon={LightBulbIcon} size="lg" color="purple.500" />
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
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Tabs.Root value={activeAITab} onValueChange={(details) => setActiveAITab(details.value as any)}>
              <Tabs.List>
                <Tabs.Trigger value="substitutions">
                  <HStack gap="1">
                    <Icon icon={ArrowPathIcon} size="xs" />
                    <Text fontSize="sm">Sustituciones</Text>
                    {aiSuggestions.substitutions.length > 0 && (
                      <Badge size="sm" colorPalette="purple">{aiSuggestions.substitutions.length}</Badge>
                    )}
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger value="optimization">
                  <HStack gap="1">
                    <Icon icon={CurrencyDollarIcon} size="xs" />
                    <Text fontSize="sm">Optimización</Text>
                    {aiSuggestions.costOptimizations.length > 0 && (
                      <Badge size="sm" colorPalette="green">{aiSuggestions.costOptimizations.length}</Badge>
                    )}
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger value="yield">
                  <HStack gap="1">
                    <Icon icon={ScaleIcon} size="xs" />
                    <Text fontSize="sm">Rendimiento</Text>
                  </HStack>
                </Tabs.Trigger>

                <Tabs.Trigger value="nutrition">
                  <HStack gap="1">
                    <Icon icon={BeakerIcon} size="xs" />
                    <Text fontSize="sm">Nutrición</Text>
                    {aiSuggestions.nutritionalInsights.length > 0 && (
                      <Badge size="sm" colorPalette="orange">{aiSuggestions.nutritionalInsights.length}</Badge>
                    )}
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>

              <Box mt="4">
                <Tabs.Content value="substitutions">
                  <VStack gap="3" align="stretch">
                    {aiSuggestions.substitutions.length > 0 ? (
                      aiSuggestions.substitutions.map((sub, index) => {
                        const suggestionId = `sub_${index}`;
                        const isApplied = appliedSuggestions.has(suggestionId);

                        return (
                          <CardWrapper key={index} variant="subtle" size="sm">
                            <CardWrapper.Body p="3">
                              <VStack gap="2" align="stretch">
                                <HStack justify="space-between">
                                  <VStack align="start" gap="0">
                                    <Text fontSize="sm" fontWeight="medium">
                                      {sub.originalIngredient} → {sub.suggestedSubstitute}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      {sub.reason}
                                    </Text>
                                  </VStack>
                                  {isApplied ? (
                                    <Badge colorPalette="green" size="sm">
                                      <Icon icon={CheckCircleIcon} size="xs" style={{ marginRight: '4px' }} />
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

                                <SimpleGrid columns={3} gap="2" fontSize="xs">
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
                            </CardWrapper.Body>
                          </CardWrapper>
                        );
                      })
                    ) : (
                      <Text fontSize="sm" color="gray.600" textAlign="center" py="4">
                        No se encontraron sustituciones recomendadas para esta receta.
                      </Text>
                    )}
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="optimization">
                  <VStack gap="3" align="stretch">
                    {aiSuggestions.costOptimizations.map((opt, index) => (
                      <CardWrapper key={index} variant="subtle" size="sm">
                        <CardWrapper.Body p="3">
                          <VStack gap="2" align="stretch">
                            <HStack justify="space-between">
                              <VStack align="start" gap="0">
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

                            <SimpleGrid columns={3} gap="2" fontSize="xs">
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
                        </CardWrapper.Body>
                      </CardWrapper>
                    ))}
                  </VStack>
                </Tabs.Content>

                <Tabs.Content value="yield">
                  {aiSuggestions.yieldOptimization ? (
                    <CardWrapper variant="subtle" size="sm">
                      <CardWrapper.Body p="4">
                        <VStack gap="3" align="stretch">
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

                          <SimpleGrid columns={3} gap="3" fontSize="xs">
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
                            <VStack gap="2" align="stretch">
                              <Text fontSize="xs" fontWeight="medium" color="gray.700">Ajustes recomendados:</Text>
                              {aiSuggestions.yieldOptimization.adjustments.map((adj, index) => (
                                <HStack key={index} justify="space-between" fontSize="xs" bg="white" p="2" borderRadius="sm">
                                  <Text>{adj.ingredient}</Text>
                                  <Text color="blue.600">
                                    {adj.currentQuantity} → {adj.suggestedQuantity}
                                  </Text>
                                </HStack>
                              ))}
                            </VStack>
                          )}
                        </VStack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ) : (
                    <Text fontSize="sm" color="gray.600" textAlign="center" py="4">
                      No se detectaron oportunidades de optimización de rendimiento.
                    </Text>
                  )}
                </Tabs.Content>

                <Tabs.Content value="nutrition">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                    {aiSuggestions.nutritionalInsights.map((insight, index) => (
                      <CardWrapper key={index} variant="subtle" size="sm">
                        <CardWrapper.Body p="3">
                          <VStack gap="2" align="stretch">
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
                              <VStack gap="1" align="start">
                                {insight.recommendations.map((rec, recIndex) => (
                                  <Text key={recIndex} fontSize="xs" color="gray.600">
                                    • {rec}
                                  </Text>
                                ))}
                              </VStack>
                            )}
                          </VStack>
                        </CardWrapper.Body>
                      </CardWrapper>
                    ))}
                  </SimpleGrid>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </>
  );
};
