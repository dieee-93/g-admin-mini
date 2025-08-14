import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Card,
  Text,
  Badge,
  Button,
  Grid,
  Alert,
  Skeleton,
  Progress,
  SimpleGrid
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  StarIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { fetchRecipesWithCosts } from '../../data/recipeApi';
import type { Recipe, RecipeWithCost } from '../../types';

interface MenuEngineeringMatrixProps {
  recipes: Recipe[];
  onCategoryChange?: (category: MenuCategory, recipes: RecipeWithCost[]) => void;
}

type MenuCategory = 'stars' | 'plowhorses' | 'puzzles' | 'dogs';

interface MenuEngineeringAnalysis {
  stars: RecipeWithCost[];
  plowhorses: RecipeWithCost[];
  puzzles: RecipeWithCost[];
  dogs: RecipeWithCost[];
  totalAnalyzed: number;
  averageProfitability: number;
  averagePopularity: number;
}

interface CategoryMetrics {
  count: number;
  percentage: number;
  avgCost: number;
  recommendations: string[];
}

export const MenuEngineeringMatrix: React.FC<MenuEngineeringMatrixProps> = ({ 
  recipes, 
  onCategoryChange 
}) => {
  const [analysis, setAnalysis] = useState<MenuEngineeringAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('stars');

  const performMenuEngineering = async () => {
    try {
      setLoading(true);
      setError(null);

      const costData = await fetchRecipesWithCosts();
      
      if (costData.length > 0) {
        // Calculate profitability scores (based on cost-to-price ratio)
        const recipesWithScores = costData.map(recipe => {
          const estimatedPrice = (recipe.cost_per_unit || 0) * 2.5; // 2.5x markup assumption
          const profitScore = estimatedPrice > 0 ? ((estimatedPrice - (recipe.cost_per_unit || 0)) / estimatedPrice) * 100 : 0;
          
          // Mock popularity score (in real app, this would come from sales data)
          const popularityScore = Math.random() * 100; // Random for demo
          
          return {
            ...recipe,
            profitScore,
            popularityScore
          };
        });

        // Calculate median scores for classification
        const profitScores = recipesWithScores.map(r => r.profitScore).sort((a, b) => a - b);
        const popularityScores = recipesWithScores.map(r => r.popularityScore).sort((a, b) => a - b);
        
        const medianProfit = profitScores[Math.floor(profitScores.length / 2)];
        const medianPopularity = popularityScores[Math.floor(popularityScores.length / 2)];

        // Classify recipes into categories
        const stars = recipesWithScores.filter(r => r.profitScore >= medianProfit && r.popularityScore >= medianPopularity);
        const plowhorses = recipesWithScores.filter(r => r.profitScore < medianProfit && r.popularityScore >= medianPopularity);
        const puzzles = recipesWithScores.filter(r => r.profitScore >= medianProfit && r.popularityScore < medianPopularity);
        const dogs = recipesWithScores.filter(r => r.profitScore < medianProfit && r.popularityScore < medianPopularity);

        setAnalysis({
          stars,
          plowhorses,
          puzzles,
          dogs,
          totalAnalyzed: recipesWithScores.length,
          averageProfitability: profitScores.reduce((sum, score) => sum + score, 0) / profitScores.length,
          averagePopularity: popularityScores.reduce((sum, score) => sum + score, 0) / popularityScores.length
        });
      }
    } catch (err) {
      console.error('Error performing menu engineering analysis:', err);
      setError('Failed to analyze menu performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipes.length > 0) {
      performMenuEngineering();
    }
  }, [recipes]);

  const getCategoryMetrics = (category: MenuCategory): CategoryMetrics => {
    if (!analysis) return { count: 0, percentage: 0, avgCost: 0, recommendations: [] };

    const categoryRecipes = analysis[category];
    const count = categoryRecipes.length;
    const percentage = analysis.totalAnalyzed > 0 ? (count / analysis.totalAnalyzed) * 100 : 0;
    const avgCost = count > 0 ? categoryRecipes.reduce((sum, r) => sum + (r.total_cost || 0), 0) / count : 0;

    const recommendations = {
      stars: ['Promote heavily', 'Maintain quality', 'Feature prominently', 'Cross-sell opportunities'],
      plowhorses: ['Reduce costs', 'Increase portion prices', 'Improve efficiency', 'Bundle with stars'],
      puzzles: ['Reposition on menu', 'Improve marketing', 'Lower prices slightly', 'Train staff to upsell'],
      dogs: ['Consider removal', 'Complete redesign', 'Seasonal special only', 'Use ingredients elsewhere']
    }[category];

    return { count, percentage, avgCost, recommendations };
  };

  const getCategoryIcon = (category: MenuCategory) => {
    switch (category) {
      case 'stars': return '⭐';
      case 'plowhorses': return '🐎';
      case 'puzzles': return '🧩';
      case 'dogs': return '🐕';
    }
  };

  const getCategoryColor = (category: MenuCategory) => {
    switch (category) {
      case 'stars': return 'yellow';
      case 'plowhorses': return 'blue';
      case 'puzzles': return 'orange';
      case 'dogs': return 'red';
    }
  };

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator>
          <ExclamationTriangleIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Card.Root>
          <Card.Body p={6}>
            <VStack align="stretch" gap={4}>
              <HStack align="center" gap={3}>
                <ChartBarIcon className="w-8 h-8 text-purple-500" />
                <VStack align="start" gap={0}>
                  <Text fontSize="2xl" fontWeight="bold">Menu Engineering Matrix</Text>
                  <Text color="gray.600">Strategic recipe categorization based on profitability and popularity</Text>
                </VStack>
              </HStack>

              {analysis && (
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">{analysis.totalAnalyzed}</Text>
                    <Text fontSize="sm" color="gray.600">Recipes Analyzed</Text>
                  </VStack>
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">{analysis.averageProfitability.toFixed(1)}%</Text>
                    <Text fontSize="sm" color="gray.600">Avg Profitability</Text>
                  </VStack>
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">{analysis.averagePopularity.toFixed(1)}</Text>
                    <Text fontSize="sm" color="gray.600">Avg Popularity Score</Text>
                  </VStack>
                </Grid>
              )}

              <Button 
                variant="outline" 
                onClick={performMenuEngineering}
                loading={loading}
              >
                <ClockIcon className="w-4 h-4" />
                Refresh Analysis
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>

        {loading && !analysis ? (
          <VStack gap={4}>
            <Skeleton height="200px" />
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Skeleton height="150px" />
              <Skeleton height="150px" />
            </Grid>
          </VStack>
        ) : analysis ? (
          <>
            {/* Category Overview */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              {(['stars', 'plowhorses', 'puzzles', 'dogs'] as MenuCategory[]).map(category => {
                const metrics = getCategoryMetrics(category);
                const color = getCategoryColor(category);
                
                return (
                  <Card.Root 
                    key={category}
                    cursor="pointer"
                    onClick={() => {
                      setSelectedCategory(category);
                      onCategoryChange?.(category, analysis[category]);
                    }}
                    bg={selectedCategory === category ? `${color}.50` : 'white'}
                    borderColor={selectedCategory === category ? `${color}.200` : 'gray.200'}
                    borderWidth="2px"
                    _hover={{ borderColor: `${color}.300` }}
                  >
                    <Card.Body p={4} textAlign="center">
                      <VStack gap={3}>
                        <Text fontSize="3xl">{getCategoryIcon(category)}</Text>
                        <Text fontSize="lg" fontWeight="bold" textTransform="capitalize" color={`${color}.700`}>
                          {category}
                        </Text>
                        <VStack gap={1}>
                          <Text fontSize="2xl" fontWeight="bold">{metrics.count}</Text>
                          <Text fontSize="sm" color="gray.600">recipes</Text>
                        </VStack>
                        <Badge colorPalette={color} size="sm">
                          {metrics.percentage.toFixed(1)}% of menu
                        </Badge>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                );
              })}
            </SimpleGrid>

            {/* Detailed Analysis */}
            <Card.Root>
              <Card.Header>
                <HStack gap={3} align="center">
                  <Text fontSize="2xl">{getCategoryIcon(selectedCategory)}</Text>
                  <VStack align="start" gap={0}>
                    <Text fontSize="xl" fontWeight="bold" textTransform="capitalize" color={`${getCategoryColor(selectedCategory)}.700`}>
                      {selectedCategory} Analysis
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {getCategoryMetrics(selectedCategory).count} recipes in this category
                    </Text>
                  </VStack>
                </HStack>
              </Card.Header>
              <Card.Body>
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                  {/* Category Performance */}
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">Performance Metrics</Text>
                    
                    <VStack align="stretch" gap={3}>
                      <HStack justify="space-between">
                        <Text>Recipe Count</Text>
                        <Text fontWeight="bold">{getCategoryMetrics(selectedCategory).count}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text>Menu Share</Text>
                        <Badge colorPalette={getCategoryColor(selectedCategory)}>
                          {getCategoryMetrics(selectedCategory).percentage.toFixed(1)}%
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text>Average Cost</Text>
                        <Text fontWeight="bold">${getCategoryMetrics(selectedCategory).avgCost.toFixed(2)}</Text>
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        {selectedCategory === 'stars' && 'High profit, high popularity - your menu champions!'}
                        {selectedCategory === 'plowhorses' && 'Popular but low profit - optimize costs or increase prices'}
                        {selectedCategory === 'puzzles' && 'High profit but low popularity - improve marketing and positioning'}
                        {selectedCategory === 'dogs' && 'Low profit and popularity - consider removal or major changes'}
                      </Text>
                    </VStack>
                  </VStack>

                  {/* Strategic Recommendations */}
                  <VStack align="stretch" gap={4}>
                    <Text fontSize="lg" fontWeight="semibold">Strategic Recommendations</Text>
                    
                    <VStack align="stretch" gap={2}>
                      {getCategoryMetrics(selectedCategory).recommendations.map((recommendation, index) => (
                        <HStack key={index} gap={3} p={3} bg="gray.50" borderRadius="md">
                          <Text fontSize="sm" color={`${getCategoryColor(selectedCategory)}.600`}>
                            {index + 1}.
                          </Text>
                          <Text fontSize="sm">{recommendation}</Text>
                        </HStack>
                      ))}
                    </VStack>

                    {selectedCategory === 'stars' && (
                      <Alert.Root status="success">
                        <Alert.Description fontSize="sm">
                          <strong>Action:</strong> Promote these recipes heavily and maintain their quality standards.
                        </Alert.Description>
                      </Alert.Root>
                    )}
                    
                    {selectedCategory === 'dogs' && (
                      <Alert.Root status="warning">
                        <Alert.Description fontSize="sm">
                          <strong>Caution:</strong> These recipes may be dragging down overall profitability.
                        </Alert.Description>
                      </Alert.Root>
                    )}
                  </VStack>
                </Grid>

                {/* Recipe List */}
                {analysis[selectedCategory].length > 0 && (
                  <VStack align="stretch" gap={3} mt={6}>
                    <Text fontSize="lg" fontWeight="semibold">Recipes in this Category</Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
                      {analysis[selectedCategory].slice(0, 6).map(recipe => (
                        <Card.Root key={recipe.id} size="sm" variant="outline">
                          <Card.Body p={3}>
                            <VStack align="stretch" gap={2}>
                              <Text fontWeight="medium" lineClamp={1}>
                                {recipe.name}
                              </Text>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="gray.600">Cost:</Text>
                                <Text fontWeight="medium">${(recipe.cost_per_unit || 0).toFixed(2)}</Text>
                              </HStack>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="gray.600">Viable:</Text>
                                <Badge colorPalette={recipe.is_viable ? 'green' : 'red'} size="sm">
                                  {recipe.is_viable ? 'Yes' : 'No'}
                                </Badge>
                              </HStack>
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </SimpleGrid>
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>
          </>
        ) : null}

        {/* Analysis Notice */}
        <Alert.Root status="info" variant="subtle">
          <Alert.Description fontSize="sm">
            Menu Engineering analysis uses recipe cost data and simulated popularity scores. 
            Connect to sales data for accurate popularity metrics and enhanced strategic insights.
          </Alert.Description>
        </Alert.Root>
      </VStack>
    </Box>
  );
};