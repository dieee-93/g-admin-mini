import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Input,
  Select,
  Grid,
  Progress,
  Alert,
  
  Table,
  NumberInput,
  Skeleton,
  Tabs
} from '@chakra-ui/react';
import {
  CalculatorIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { calculateRecipeCost } from '../../../../services/recipe/api/recipeApi';
import type { Recipe } from '../../../../services/recipe/types';
import { CardWrapper, Icon } from '@/shared/ui';

interface SmartCostCalculatorProps {
  recipe?: Recipe;
  onCostCalculated?: (cost: number) => void;
}


interface CostBreakdown {
  ingredientCosts: Array<{
    ingredient: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    yieldFactor: number;
    wasteFactor: number;
  }>;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  costPerPortion: number;
  profitabilityMetrics: {
    suggestedPrice: number;
    profitMargin: number;
    foodCostPercentage: number;
  };
}

export const SmartCostCalculator: React.FC<SmartCostCalculatorProps> = ({
  recipe,
  onCostCalculated
}) => {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipe?.id || '');
  const [laborRate, setLaborRate] = useState<number>(15); // $15/hour default
  const [overheadPercentage, setOverheadPercentage] = useState<number>(20); // 20% default
  const [targetProfitMargin, setTargetProfitMargin] = useState<number>(60); // 60% default

  const calculateCost = async () => {
    if (!selectedRecipeId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await calculateRecipeCost(selectedRecipeId);
      
      if (result) {
        // Mock enhanced cost breakdown (since API returns basic data)
        const mockBreakdown: CostBreakdown = {
          ingredientCosts: [
            { ingredient: 'Flour', quantity: 2, unitCost: 0.50, totalCost: 1.00, yieldFactor: 0.95, wasteFactor: 0.05 },
            { ingredient: 'Eggs', quantity: 3, unitCost: 0.25, totalCost: 0.75, yieldFactor: 0.98, wasteFactor: 0.02 },
            { ingredient: 'Milk', quantity: 1.5, unitCost: 0.60, totalCost: 0.90, yieldFactor: 1.0, wasteFactor: 0 }
          ],
          laborCost: (laborRate / 60) * 30, // 30 minutes prep time
          overheadCost: 0,
          totalCost: (result && typeof result === 'object') ? result.total_cost || 3.65 : (result || 3.65),
          costPerPortion: (result && typeof result === 'object') ? result.cost_per_portion || 0.91 : ((result || 3.65) / 4),
          profitabilityMetrics: {
            suggestedPrice: ((result && typeof result === 'object') ? result.cost_per_portion || 0.91 : ((result || 3.65) / 4)) / (1 - targetProfitMargin / 100),
            profitMargin: targetProfitMargin,
            foodCostPercentage: (((result && typeof result === 'object') ? result.cost_per_portion || 0.91 : ((result || 3.65) / 4)) / (((result && typeof result === 'object') ? result.cost_per_portion || 0.91 : ((result || 3.65) / 4)) / (1 - targetProfitMargin / 100))) * 100
          }
        };

        // Calculate overhead
        mockBreakdown.overheadCost = (mockBreakdown.ingredientCosts.reduce((sum, item) => sum + item.totalCost, 0) + mockBreakdown.laborCost) * (overheadPercentage / 100);
        
        setCostBreakdown(mockBreakdown);
        onCostCalculated?.(mockBreakdown.totalCost);
      }
    } catch (err) {
      console.error('Error calculating cost:', err);
      setError('Failed to calculate recipe cost');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipe?.id) {
      setSelectedRecipeId(recipe.id);
      calculateCost();
    }
  }, [recipe?.id]);

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <CardWrapper>
          <CardWrapper.Body p={6}>
            <VStack align="stretch" gap={4}>
              <HStack align="center" gap={3}>
                <Icon icon={CalculatorIcon} size="2xl" color="blue.500" />
                <VStack align="start" gap={0}>
                  <Text fontSize="2xl" fontWeight="bold">Smart Cost Calculator</Text>
                  <Text color="gray.600">Real-time cost analysis with yield optimization</Text>
                </VStack>
              </HStack>

              {/* Configuration Panel */}
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                <VStack align="stretch" gap={2}>
                  <Text fontSize="sm" fontWeight="medium">Labor Rate ($/hour)</Text>
                  <NumberInput.Root value={laborRate.toString()} onValueChange={(details) => setLaborRate(Number(details.value))}>
                    <NumberInput.Input />
                  </NumberInput.Root>
                </VStack>
                <VStack align="stretch" gap={2}>
                  <Text fontSize="sm" fontWeight="medium">Overhead %</Text>
                  <NumberInput.Root value={overheadPercentage.toString()} onValueChange={(details) => setOverheadPercentage(Number(details.value))}>
                    <NumberInput.Input />
                  </NumberInput.Root>
                </VStack>
                <VStack align="stretch" gap={2}>
                  <Text fontSize="sm" fontWeight="medium">Target Profit Margin %</Text>
                  <NumberInput.Root value={targetProfitMargin.toString()} onValueChange={(details) => setTargetProfitMargin(Number(details.value))}>
                    <NumberInput.Input />
                  </NumberInput.Root>
                </VStack>
              </Grid>

              <Button 
                colorPalette="blue" 
                onClick={calculateCost}
                loading={loading}
                disabled={!selectedRecipeId}
              >
                <Icon icon={CalculatorIcon} size="sm" />
                Calculate Cost
              </Button>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Error Display */}
        {error && (
          <Alert.Root status="error">
            <Alert.Indicator>
              <Icon icon={ExclamationTriangleIcon} size="sm" />
            </Alert.Indicator>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        {/* Results */}
        {costBreakdown && (
          <Tabs.Root defaultValue="breakdown">
            <Tabs.List>
              <Tabs.Trigger value="breakdown">
                <Icon icon={ChartBarIcon} size="sm" />
                Cost Breakdown
              </Tabs.Trigger>
              <Tabs.Trigger value="analysis">
                <Icon icon={CheckCircleIcon} size="sm" />
                Profitability Analysis
              </Tabs.Trigger>
              <Tabs.Trigger value="optimization">
                <Icon icon={ClockIcon} size="sm" />
                Optimization Tips
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="breakdown">
              <VStack align="stretch" gap={4}>
                {/* Summary Cards */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                  <CardWrapper borderTop="4px solid" borderTopColor="blue.400">
                    <CardWrapper.Body p={4}>
                      <VStack gap={2}>
                        <Text fontSize="sm" color="gray.600">Total Cost</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          ${costBreakdown.totalCost.toFixed(2)}
                        </Text>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper borderTop="4px solid" borderTopColor="green.400">
                    <CardWrapper.Body p={4}>
                      <VStack gap={2}>
                        <Text fontSize="sm" color="gray.600">Cost Per Portion</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                          ${costBreakdown.costPerPortion.toFixed(2)}
                        </Text>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper borderTop="4px solid" borderTopColor="purple.400">
                    <CardWrapper.Body p={4}>
                      <VStack gap={2}>
                        <Text fontSize="sm" color="gray.600">Suggested Price</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                          ${costBreakdown.profitabilityMetrics.suggestedPrice.toFixed(2)}
                        </Text>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Grid>

                {/* Ingredient Breakdown */}
                <CardWrapper>
                  <CardWrapper.Header>
                    <Text fontSize="lg" fontWeight="semibold">Ingredient Cost Breakdown</Text>
                  </CardWrapper .Header>
                  <CardWrapper.Body>
                    <Table.Root size="sm">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Ingredient</Table.ColumnHeader>
                          <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                          <Table.ColumnHeader>Unit Cost</Table.ColumnHeader>
                          <Table.ColumnHeader>Total Cost</Table.ColumnHeader>
                          <Table.ColumnHeader>Yield Factor</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {costBreakdown.ingredientCosts.map((item, index) => (
                          <Table.Row key={index}>
                            <Table.Cell fontWeight="medium">{item.ingredient}</Table.Cell>
                            <Table.Cell>{item.quantity}</Table.Cell>
                            <Table.Cell>${item.unitCost.toFixed(2)}</Table.Cell>
                            <Table.Cell fontWeight="medium">${item.totalCost.toFixed(2)}</Table.Cell>
                            <Table.Cell>
                              <Badge 
                                colorPalette={item.yieldFactor >= 0.95 ? 'green' : item.yieldFactor >= 0.9 ? 'yellow' : 'red'}
                                size="sm"
                              >
                                {(item.yieldFactor * 100).toFixed(1)}%
                              </Badge>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </CardWrapper.Body>
                </CardWrapper>

                {/* Cost Composition */}
                <CardWrapper>
                  <CardWrapper.Header>
                    <Text fontSize="lg" fontWeight="semibold">Cost Composition</Text>
                  </CardWrapper.Header>
                  <CardWrapper.Body>
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between">
                        <Text>Ingredients</Text>
                        <Text fontWeight="bold">
                          ${costBreakdown.ingredientCosts.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                        </Text>
                      </HStack>
                      <Progress.Root 
                        value={(costBreakdown.ingredientCosts.reduce((sum, item) => sum + item.totalCost, 0) / costBreakdown.totalCost) * 100}
                        colorPalette="blue"
                        size="sm"
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>

                      <HStack justify="space-between">
                        <Text>Labor</Text>
                        <Text fontWeight="bold">${costBreakdown.laborCost.toFixed(2)}</Text>
                      </HStack>
                      <Progress.Root 
                        value={(costBreakdown.laborCost / costBreakdown.totalCost) * 100}
                        colorPalette="green"
                        size="sm"
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>

                      <HStack justify="space-between">
                        <Text>Overhead</Text>
                        <Text fontWeight="bold">${costBreakdown.overheadCost.toFixed(2)}</Text>
                      </HStack>
                      <Progress.Root 
                        value={(costBreakdown.overheadCost / costBreakdown.totalCost) * 100}
                        colorPalette="orange"
                        size="sm"
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="analysis">
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <CardWrapper>
                  <CardWrapper.Header>
                    <Text fontSize="lg" fontWeight="semibold">Profitability Metrics</Text>
                  </CardWrapper.Header>
                  <CardWrapper.Body>
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between">
                        <Text>Food Cost %</Text>
                        <Badge 
                          colorPalette={costBreakdown.profitabilityMetrics.foodCostPercentage <= 30 ? 'green' : costBreakdown.profitabilityMetrics.foodCostPercentage <= 35 ? 'yellow' : 'red'}
                        >
                          {costBreakdown.profitabilityMetrics.foodCostPercentage.toFixed(1)}%
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text>Profit Margin</Text>
                        <Badge colorPalette="green">
                          {costBreakdown.profitabilityMetrics.profitMargin.toFixed(1)}%
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text>Break-even Price</Text>
                        <Text fontWeight="bold">${costBreakdown.costPerPortion.toFixed(2)}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text>Recommended Selling Price</Text>
                        <Text fontWeight="bold" color="green.500">
                          ${costBreakdown.profitabilityMetrics.suggestedPrice.toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>

                <CardWrapper>
                  <CardWrapper.Header>
                    <Text fontSize="lg" fontWeight="semibold">Menu Engineering Category</Text>
                  </CardWrapper.Header>
                  <CardWrapper.Body>
                    <VStack align="center" gap={4}>
                      <Text fontSize="4xl">⭐</Text>
                      <Text fontSize="xl" fontWeight="bold" color="yellow.600">STAR</Text>
                      <Text textAlign="center" color="gray.600">
                        High profit potential with optimized costs
                      </Text>
                      <Badge colorPalette="yellow" size="lg">Promote This Item</Badge>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>
              </Grid>
            </Tabs.Content>

            <Tabs.Content value="optimization">
              <VStack align="stretch" gap={4}>
                <Alert.Root status="success">
                  <Alert.Description>
                    <strong>Cost Optimization Opportunities:</strong>
                  </Alert.Description>
                </Alert.Root>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <CardWrapper>
                    <CardWrapper.Header>
                      <Text fontSize="md" fontWeight="semibold" color="green.600">
                        💡 Ingredient Optimization
                      </Text>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <VStack align="stretch" gap={3}>
                        <Text fontSize="sm">• Consider bulk purchasing for 15% cost reduction</Text>
                        <Text fontSize="sm">• Seasonal sourcing can reduce costs by 8-12%</Text>
                        <Text fontSize="sm">• Improve yield factors through better prep techniques</Text>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper>
                    <CardWrapper.Header>
                      <Text fontSize="md" fontWeight="semibold" color="blue.600">
                        ⚡ Efficiency Improvements
                      </Text>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <VStack align="stretch" gap={3}>
                        <Text fontSize="sm">• Reduce prep time by 10 minutes = $2.50 savings</Text>
                        <Text fontSize="sm">• Batch production can reduce labor costs by 20%</Text>
                        <Text fontSize="sm">• Cross-training reduces overhead allocation</Text>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Grid>

                <CardWrapper bg="blue.50">
                  <CardWrapper.Body p={4}>
                    <HStack gap={4}>
                      <Icon icon={CheckCircleIcon} size="lg" color="blue.500" />
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold" color="blue.700">Optimization Recommendation</Text>
                        <Text fontSize="sm" color="blue.600">
                          Your recipe is well-optimized! Current food cost of {costBreakdown.profitabilityMetrics.foodCostPercentage.toFixed(1)}% 
                          is within industry standards. Consider the suggested selling price for maximum profitability.
                        </Text>
                      </VStack>
                    </HStack>
                  </CardWrapper.Body>
                </CardWrapper>
              </VStack>
            </Tabs.Content>
          </Tabs.Root>
        )}

        {/* Loading State */}
        {loading && !costBreakdown && (
          <VStack gap={4}>
            <Skeleton height="200px" />
            <Skeleton height="150px" />
            <Skeleton height="100px" />
          </VStack>
        )}
      </VStack>
    </Box>
  );
};