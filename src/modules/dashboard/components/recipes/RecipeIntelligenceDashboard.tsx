import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Card, 
  Text, 
  Badge, 
  Grid,
  Progress,
  Alert,
  Button,
  Skeleton,
  SimpleGrid
} from '@chakra-ui/react';
import { CircularProgress, CircularProgressValueText } from '@/shared/ui/CircularProgress';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import type { Recipe, RecipeWithCost } from '@/services/recipe/types';
import { fetchRecipesWithCosts } from '@/services/recipe/api/recipeApi';

interface RecipeIntelligenceDashboardProps {
  recipes: Recipe[];
  loading?: boolean;
}

interface RecipeAnalytics {
  totalRecipes: number;
  averageCost: number;
  averageProfitability: number;
  totalViableRecipes: number;
  menuHealthScore: number;
  topPerformingRecipes: RecipeWithCost[];
}

export const RecipeIntelligenceDashboard: React.FC<RecipeIntelligenceDashboardProps> = ({ recipes }) => {
  const [analytics, setAnalytics] = useState<RecipeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipeAnalytics = async () => {
    try {
      setLoading(true);
      const costsData = await fetchRecipesWithCosts();
      
      if (costsData.length > 0) {
        const totalCost = costsData.reduce((sum, r) => sum + (r.total_cost || 0), 0);
        const averageCost = totalCost / costsData.length;
        const viableRecipes = costsData.filter(r => r.is_viable).length;
        
        // Calculate profitability with 2.5x markup assumption
        const averageProfitability = costsData.reduce((sum, r) => {
          const estimatedPrice = (r.cost_per_unit || 0) * 2.5;
          const profit = estimatedPrice - (r.cost_per_unit || 0);
          const margin = estimatedPrice > 0 ? (profit / estimatedPrice) * 100 : 0;
          return sum + margin;
        }, 0) / costsData.length;

        // Calculate menu health score
        const viabilityScore = (viableRecipes / costsData.length) * 100;
        const profitabilityWeight = Math.min(averageProfitability / 60, 1) * 100;
        const menuHealthScore = Math.round((viabilityScore * 0.7) + (profitabilityWeight * 0.3));

        setAnalytics({
          totalRecipes: costsData.length,
          averageCost,
          averageProfitability,
          totalViableRecipes: viableRecipes,
          menuHealthScore,
          topPerformingRecipes: costsData
            .filter(r => r.is_viable)
            .sort((a, b) => (b.total_cost || 0) - (a.total_cost || 0))
            .slice(0, 5)
        });
      }
    } catch (err) {
      console.error('Error loading recipe analytics:', err);
      setError('Error loading recipe analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipeAnalytics();
  }, [recipes]);

  if (error) {
    return (
      <Alert.Root status="error" variant="subtle">
        <Alert.Indicator />
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        {/* Enhanced Header */}
        <Card.Root p={6} bg="blue.500" color="white">
          <Card.Body>
            <VStack align="center" gap={3}>
              <HStack gap={2} align="center">
                <ChartBarIcon className="w-8 h-8" />
                <Text fontSize="2xl" fontWeight="bold">
                  Recipe Intelligence Dashboard v3.0
                </Text>
              </HStack>
              <Text fontSize="md" opacity={0.9}>
                Real-time Cost Analysis + Menu Engineering + Performance Intelligence
              </Text>
              
              {/* Real-time Metrics */}
              <HStack gap={8} mt={4}>
                <VStack gap={1}>
                  <Text fontSize="2xl" fontWeight="bold">{recipes.length}</Text>
                  <Text fontSize="sm" opacity={0.8}>Total Recipes</Text>
                </VStack>
                <VStack gap={1}>
                  {loading ? (
                    <Skeleton height="32px" width="60px" />
                  ) : (
                    <Text fontSize="2xl" fontWeight="bold">
                      {analytics ? `${Math.round(analytics.averageProfitability)}%` : 'N/A'}
                    </Text>
                  )}
                  <Text fontSize="sm" opacity={0.8}>Avg Profitability</Text>
                </VStack>
                <VStack gap={1}>
                  {loading ? (
                    <Skeleton height="32px" width="60px" />
                  ) : (
                    <Text fontSize="2xl" fontWeight="bold">
                      {analytics ? `$${analytics.averageCost.toFixed(2)}` : 'N/A'}
                    </Text>
                  )}
                  <Text fontSize="sm" opacity={0.8}>Avg Cost</Text>
                </VStack>
                <VStack gap={1}>
                  <CircularProgress 
                    value={analytics?.menuHealthScore || 0} 
                    size="60px"
                    color="rgba(255,255,255,0.9)"
                    trackColor="rgba(255,255,255,0.3)"
                    strokeWidth={6}
                  >
                    <CircularProgressValueText fontSize="sm" fontWeight="bold" color="white">
                      {analytics?.menuHealthScore || 0}%
                    </CircularProgressValueText>
                  </CircularProgress>
                  <Text fontSize="sm" opacity={0.8}>Health Score</Text>
                </VStack>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Analytics Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          {/* Recipe Viability */}
          <Card.Root borderTop="4px solid" borderTopColor="green.400">
            <Card.Body p={4}>
              <VStack align="stretch" gap={3}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold" color="gray.700">Recipe Viability</Text>
                  <Badge colorPalette="green" size="sm">
                    {loading ? '...' : `${analytics?.totalViableRecipes || 0}/${recipes.length}`}
                  </Badge>
                </HStack>
                {!loading && analytics && (
                  <>
                    <Progress.Root 
                      value={(analytics.totalViableRecipes / recipes.length) * 100} 
                      colorPalette="green" 
                      size="sm" 
                    >
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text fontSize="sm" color="gray.600">
                      {Math.round((analytics.totalViableRecipes / recipes.length) * 100)}% of recipes are viable
                    </Text>
                  </>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Cost Analysis */}
          <Card.Root borderTop="4px solid" borderTopColor="blue.400">
            <Card.Body p={4}>
              <VStack align="stretch" gap={3}>
                <Text fontWeight="semibold" color="gray.700">Cost Analysis</Text>
                {loading ? (
                  <Skeleton height="32px" width="80px" />
                ) : (
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {analytics ? `$${analytics.averageCost.toFixed(2)}` : 'N/A'}
                  </Text>
                )}
                <Text fontSize="sm" color="gray.600">Average recipe cost</Text>
                <Badge colorPalette="blue" size="sm">Stable trend</Badge>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Performance Score */}
          <Card.Root borderTop="4px solid" borderTopColor="purple.400">
            <Card.Body p={4}>
              <VStack align="stretch" gap={3}>
                <Text fontWeight="semibold" color="gray.700">Menu Health</Text>
                <CircularProgress 
                  value={analytics?.menuHealthScore || 0}
                  size="80px"
                  color="purple.400"
                  trackColor="gray.200"
                  strokeWidth={6}
                >
                  <CircularProgressValueText fontSize="lg" fontWeight="bold" color="purple.500">
                    {analytics?.menuHealthScore || 0}%
                  </CircularProgressValueText>
                </CircularProgress>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Overall optimization score
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Top Performers */}
          <Card.Root borderTop="4px solid" borderTopColor="orange.400">
            <Card.Body p={4}>
              <VStack align="stretch" gap={3}>
                <Text fontWeight="semibold" color="gray.700">Top Performers</Text>
                {!loading && analytics?.topPerformingRecipes.length ? (
                  <VStack align="stretch" gap={2}>
                    {analytics.topPerformingRecipes.slice(0, 3).map((recipe) => (
                      <HStack key={recipe.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="medium" css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {recipe.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {recipe.ingredient_count} ingredients
                          </Text>
                        </VStack>
                        <Badge colorPalette="green" size="sm">
                          ${recipe.total_cost?.toFixed(2)}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    {loading ? 'Loading...' : 'No performance data available'}
                  </Text>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Menu Engineering Preview */}
        <Card.Root>
          <Card.Body p={6}>
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="semibold">Menu Engineering Categories</Text>
                <Badge colorPalette="blue" size="sm">Based on Cost + Sales Data</Badge>
              </HStack>
              
              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <Card.Root bg="yellow.50" borderColor="yellow.200" borderWidth="1px">
                  <Card.Body p={4}>
                    <VStack gap={2}>
                      <Text fontSize="2xl">⭐</Text>
                      <Text fontWeight="bold" color="yellow.700">Stars</Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        High profit + High popularity
                      </Text>
                      <Badge colorPalette="yellow" size="sm">Promote</Badge>
                    </VStack>
                  </Card.Body>
                </Card.Root>
                
                <Card.Root bg="blue.50" borderColor="blue.200" borderWidth="1px">
                  <Card.Body p={4}>
                    <VStack gap={2}>
                      <Text fontSize="2xl">🐎</Text>
                      <Text fontWeight="bold" color="blue.700">Plowhorses</Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Low profit + High popularity
                      </Text>
                      <Badge colorPalette="blue" size="sm">Optimize</Badge>
                    </VStack>
                  </Card.Body>
                </Card.Root>
                
                <Card.Root bg="orange.50" borderColor="orange.200" borderWidth="1px">
                  <Card.Body p={4}>
                    <VStack gap={2}>
                      <Text fontSize="2xl">🧩</Text>
                      <Text fontWeight="bold" color="orange.700">Puzzles</Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        High profit + Low popularity
                      </Text>
                      <Badge colorPalette="orange" size="sm">Reposition</Badge>
                    </VStack>
                  </Card.Body>
                </Card.Root>
                
                <Card.Root bg="red.50" borderColor="red.200" borderWidth="1px">
                  <Card.Body p={4}>
                    <VStack gap={2}>
                      <Text fontSize="2xl">🐕</Text>
                      <Text fontWeight="bold" color="red.700">Dogs</Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Low profit + Low popularity
                      </Text>
                      <Badge colorPalette="red" size="sm">Remove</Badge>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </Grid>
              
              <Alert.Root status="info" variant="subtle">
                <Alert.Description fontSize="sm">
                  Menu engineering analysis requires sales data to determine popularity metrics. 
                  Connect to sales data for complete category classification.
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Action Center */}
        <Card.Root bg="gray.50">
          <Card.Body p={4}>
            <HStack justify="center" gap={4}>
              <Button 
                variant="outline" 
                colorPalette="blue"
                onClick={loadRecipeAnalytics}
                loading={loading}
              >
                <ClockIcon className="w-4 h-4" />
                Refresh Analytics
              </Button>
              <Button 
                colorPalette="blue"
              >
                <FireIcon className="w-4 h-4" />
                Optimize Menu
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Status Footer */}
        <Text fontSize="sm" color="gray.500" textAlign="center" fontStyle="italic">
          Enhanced recipe management with real-time costing, yield analysis, and menu engineering intelligence. 
          Last updated: {new Date().toLocaleString()}
        </Text>
      </VStack>
    </Box>
  );
};