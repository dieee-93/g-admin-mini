// src/features/products/ui/CostAnalysisTab.tsx
// Advanced Cost Analysis Calculator - Production Cost Intelligence

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Grid,
  Input,
  NumberInput,
  Select,
  createListCollection,
  Tabs,
  Alert,
  Separator,
  Table
} from '@chakra-ui/react';
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';

interface CostCalculation {
  id: string;
  product_name: string;
  batch_size: number;
  
  // Material Costs
  materials_cost: number;
  materials_per_unit: number;
  
  // Labor Costs
  labor_hours: number;
  labor_rate_per_hour: number;
  labor_cost: number;
  
  // Overhead Costs
  equipment_cost: number;
  utility_cost: number;
  facility_cost: number;
  overhead_total: number;
  
  // Total Calculations
  total_cost: number;
  cost_per_unit: number;
  
  // Pricing Analysis
  suggested_price: number;
  profit_margin: number;
  markup_percentage: number;
  
  // Benchmarks
  industry_benchmark: number;
  competitor_price: number;
  
  created_at: string;
}

interface CostBreakdown {
  materials_percentage: number;
  labor_percentage: number;
  overhead_percentage: number;
  profit_percentage: number;
}

interface PricingScenario {
  name: string;
  price: number;
  margin: number;
  units_to_breakeven: number;
  projected_profit: number;
}

export function CostAnalysisTab() {
  const [calculations, setCalculations] = useState<CostCalculation[]>([]);
  const [currentCalculation, setCurrentCalculation] = useState<Partial<CostCalculation>>({
    batch_size: 1,
    labor_rate_per_hour: 15.00
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');

  useEffect(() => {
    loadSavedCalculations();
  }, []);

  const loadSavedCalculations = async () => {
    // Mock saved calculations
    const mockCalculations: CostCalculation[] = [
      {
        id: '1',
        product_name: 'Pizza Margherita',
        batch_size: 10,
        materials_cost: 45.50,
        materials_per_unit: 4.55,
        labor_hours: 2.5,
        labor_rate_per_hour: 15.00,
        labor_cost: 37.50,
        equipment_cost: 8.25,
        utility_cost: 4.15,
        facility_cost: 6.00,
        overhead_total: 18.40,
        total_cost: 101.40,
        cost_per_unit: 10.14,
        suggested_price: 18.25,
        profit_margin: 44.44,
        markup_percentage: 80.00,
        industry_benchmark: 17.50,
        competitor_price: 19.00,
        created_at: '2024-08-07T10:30:00Z'
      },
      {
        id: '2',
        product_name: 'Pasta Bolognese',
        batch_size: 8,
        materials_cost: 28.80,
        materials_per_unit: 3.60,
        labor_hours: 1.8,
        labor_rate_per_hour: 15.00,
        labor_cost: 27.00,
        equipment_cost: 5.50,
        utility_cost: 2.75,
        facility_cost: 4.20,
        overhead_total: 12.45,
        total_cost: 68.25,
        cost_per_unit: 8.53,
        suggested_price: 15.35,
        profit_margin: 44.44,
        markup_percentage: 80.00,
        industry_benchmark: 14.75,
        competitor_price: 16.50,
        created_at: '2024-08-07T09:15:00Z'
      }
    ];

    setCalculations(mockCalculations);
  };

  const calculateCosts = () => {
    const calc = currentCalculation;
    
    if (!calc.materials_cost || !calc.labor_hours || !calc.batch_size) {
      notify.error('Please fill in all required fields');
      return;
    }

    // Calculate derived values
    const materials_per_unit = calc.materials_cost / calc.batch_size;
    const labor_cost = calc.labor_hours * (calc.labor_rate_per_hour || 15);
    const overhead_total = (calc.equipment_cost || 0) + (calc.utility_cost || 0) + (calc.facility_cost || 0);
    const total_cost = calc.materials_cost + labor_cost + overhead_total;
    const cost_per_unit = total_cost / calc.batch_size;
    
    // Pricing calculations (80% markup as default)
    const markup_percentage = 80;
    const suggested_price = cost_per_unit * (1 + markup_percentage / 100);
    const profit_margin = ((suggested_price - cost_per_unit) / suggested_price) * 100;

    const newCalculation: CostCalculation = {
      id: Date.now().toString(),
      product_name: calc.product_name || 'Unnamed Product',
      batch_size: calc.batch_size,
      materials_cost: calc.materials_cost,
      materials_per_unit,
      labor_hours: calc.labor_hours,
      labor_rate_per_hour: calc.labor_rate_per_hour || 15,
      labor_cost,
      equipment_cost: calc.equipment_cost || 0,
      utility_cost: calc.utility_cost || 0,
      facility_cost: calc.facility_cost || 0,
      overhead_total,
      total_cost,
      cost_per_unit,
      suggested_price,
      profit_margin,
      markup_percentage,
      industry_benchmark: suggested_price * 0.95, // Mock benchmark
      competitor_price: suggested_price * 1.05, // Mock competitor price
      created_at: new Date().toISOString()
    };

    setCalculations(prev => [newCalculation, ...prev]);
    setCurrentCalculation({ batch_size: 1, labor_rate_per_hour: 15.00 });
    notify.success('Cost calculation completed successfully');
  };

  const getCostBreakdown = (calc: CostCalculation): CostBreakdown => {
    const total = calc.total_cost;
    return {
      materials_percentage: (calc.materials_cost / total) * 100,
      labor_percentage: (calc.labor_cost / total) * 100,
      overhead_percentage: (calc.overhead_total / total) * 100,
      profit_percentage: calc.profit_margin
    };
  };

  const getPricingScenarios = (calc: CostCalculation): PricingScenario[] => {
    const basePrice = calc.cost_per_unit;
    
    return [
      {
        name: 'Conservative',
        price: basePrice * 1.5,
        margin: 33.33,
        units_to_breakeven: Math.ceil(calc.overhead_total / (basePrice * 0.5)),
        projected_profit: (basePrice * 0.5) * calc.batch_size
      },
      {
        name: 'Standard',
        price: basePrice * 1.8,
        margin: 44.44,
        units_to_breakeven: Math.ceil(calc.overhead_total / (basePrice * 0.8)),
        projected_profit: (basePrice * 0.8) * calc.batch_size
      },
      {
        name: 'Premium',
        price: basePrice * 2.2,
        margin: 54.55,
        units_to_breakeven: Math.ceil(calc.overhead_total / (basePrice * 1.2)),
        projected_profit: (basePrice * 1.2) * calc.batch_size
      }
    ];
  };

  const exportCalculation = (calc: CostCalculation) => {
    // Mock export functionality
    const data = JSON.stringify(calc, null, 2);
    console.log('Exporting calculation:', data);
    notify.success('Calculation exported to console');
  };

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" gap={1}>
            <Text fontSize="xl" fontWeight="bold">Advanced Cost Analysis</Text>
            <Text fontSize="sm" color="gray.600">
              Calculate production costs, analyze profitability, and optimize pricing strategies
            </Text>
          </VStack>
        </HStack>

        {/* Main Tabs */}
        <Tabs.Root defaultValue="calculator" variant="line">
          <Tabs.List>
            <Tabs.Trigger value="calculator">
              <CalculatorIcon className="w-4 h-4" />
              Cost Calculator
            </Tabs.Trigger>
            <Tabs.Trigger value="analysis">
              <ChartBarIcon className="w-4 h-4" />
              Analysis & Reports
            </Tabs.Trigger>
            <Tabs.Trigger value="scenarios">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              Pricing Scenarios
            </Tabs.Trigger>
          </Tabs.List>

          {/* Calculator Tab */}
          <Tabs.Content value="calculator">
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Input Form */}
              <Card.Root>
                <Card.Header>
                  <Text fontSize="lg" fontWeight="semibold">Cost Calculation Input</Text>
                </Card.Header>
                <Card.Body>
                  <VStack gap={4} align="stretch">
                    {/* Product Info */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Product Name</Text>
                      <Input
                        value={currentCalculation.product_name || ''}
                        onChange={(e) => setCurrentCalculation(prev => ({ ...prev, product_name: e.target.value }))}
                        placeholder="Enter product name"
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Batch Size (units)</Text>
                      <NumberInput.Root
                        value={currentCalculation.batch_size?.toString()}
                        onValueChange={(details) => setCurrentCalculation(prev => ({ ...prev, batch_size: parseInt(details.value) }))}
                        min={1}
                      >
                        <NumberInput.Input />
                      </NumberInput.Root>
                    </Box>

                    <Separator />

                    {/* Material Costs */}
                    <Text fontSize="md" fontWeight="semibold" color="blue.600">Material Costs</Text>
                    
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Total Materials Cost ($)</Text>
                      <NumberInput.Root
                        value={currentCalculation.materials_cost?.toString()}
                        onValueChange={(details) => setCurrentCalculation(prev => ({ ...prev, materials_cost: parseFloat(details.value) }))}
                        min={0}
                        precision={2}
                      >
                        <NumberInput.Input />
                      </NumberInput.Root>
                    </Box>

                    <Separator />

                    {/* Labor Costs */}
                    <Text fontSize="md" fontWeight="semibold" color="green.600">Labor Costs</Text>
                    
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Labor Hours</Text>
                        <NumberInput.Root
                          value={currentCalculation.labor_hours?.toString()}
                          onValueChange={(details) => setCurrentCalculation(prev => ({ ...prev, labor_hours: parseFloat(details.value) }))}
                          min={0}
                          precision={2}
                        >
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Rate/Hour ($)</Text>
                        <NumberInput.Root
                          value={currentCalculation.labor_rate_per_hour?.toString()}
                          onValueChange={(details) => setCurrentCalculation(prev => ({ ...prev, labor_rate_per_hour: parseFloat(details.value) }))}
                          min={0}
                          precision={2}
                        >
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Box>
                    </Grid>

                    <Separator />

                    {/* Overhead Costs */}
                    <Text fontSize="md" fontWeight="semibold" color="orange.600">Overhead Costs</Text>
                    
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Equipment ($)</Text>
                        <NumberInput.Root
                          value={currentCalculation.equipment_cost?.toString()}
                          onValueChange={(details) => setCurrentCalculation(prev => ({ ...prev, equipment_cost: parseFloat(details.value) }))}
                          min={0}
                          precision={2}
                        >
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Box>
                      
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Utilities ($)</Text>
                        <NumberInput.Root
                          value={currentCalculation.utility_cost?.toString()}
                          onValueChange={(details) => setCurrentCalculation(prev => ({ ...prev, utility_cost: parseFloat(details.value) }))}
                          min={0}
                          precision={2}
                        >
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Box>
                    </Grid>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Facility Cost ($)</Text>
                      <NumberInput.Root
                        value={currentCalculation.facility_cost?.toString()}
                        onValueChange={(details) => setCurrentCalculation(prev => ({ ...prev, facility_cost: parseFloat(details.value) }))}
                        min={0}
                        precision={2}
                      >
                        <NumberInput.Input />
                      </NumberInput.Root>
                    </Box>

                    <Button
                      colorPalette="blue"
                      size="lg"
                      onClick={calculateCosts}
                      loading={loading}
                    >
                      <CalculatorIcon className="w-4 h-4" />
                      Calculate Costs
                    </Button>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Latest Calculation Results */}
              {calculations.length > 0 && (
                <Card.Root>
                  <Card.Header>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="semibold">Latest Calculation</Text>
                      <Badge colorPalette="green">
                        {calculations[0].product_name}
                      </Badge>
                    </HStack>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={4} align="stretch">
                      {/* Cost Summary */}
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box textAlign="center" p={3} bg="blue.50" borderRadius="md">
                          <Text fontSize="xs" color="gray.600">Total Cost</Text>
                          <Text fontSize="xl" fontWeight="bold" color="blue.600">
                            ${calculations[0].total_cost.toFixed(2)}
                          </Text>
                        </Box>
                        
                        <Box textAlign="center" p={3} bg="green.50" borderRadius="md">
                          <Text fontSize="xs" color="gray.600">Cost per Unit</Text>
                          <Text fontSize="xl" fontWeight="bold" color="green.600">
                            ${calculations[0].cost_per_unit.toFixed(2)}
                          </Text>
                        </Box>
                      </Grid>

                      {/* Pricing Analysis */}
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Pricing Analysis</Text>
                        <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="sm">
                          <HStack justify="space-between">
                            <Text>Suggested Price:</Text>
                            <Text fontWeight="bold">${calculations[0].suggested_price.toFixed(2)}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Profit Margin:</Text>
                            <Text fontWeight="bold" color="green.600">{calculations[0].profit_margin.toFixed(1)}%</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Industry Benchmark:</Text>
                            <Text>${calculations[0].industry_benchmark.toFixed(2)}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Competitor Price:</Text>
                            <Text>${calculations[0].competitor_price.toFixed(2)}</Text>
                          </HStack>
                        </Grid>
                      </Box>

                      {/* Cost Breakdown */}
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Cost Breakdown</Text>
                        <VStack gap={2}>
                          {(() => {
                            const breakdown = getCostBreakdown(calculations[0]);
                            return (
                              <>
                                <HStack justify="space-between" w="full" fontSize="sm">
                                  <Text>Materials:</Text>
                                  <HStack>
                                    <Text>${calculations[0].materials_cost.toFixed(2)}</Text>
                                    <Text color="gray.600">({breakdown.materials_percentage.toFixed(1)}%)</Text>
                                  </HStack>
                                </HStack>
                                <HStack justify="space-between" w="full" fontSize="sm">
                                  <Text>Labor:</Text>
                                  <HStack>
                                    <Text>${calculations[0].labor_cost.toFixed(2)}</Text>
                                    <Text color="gray.600">({breakdown.labor_percentage.toFixed(1)}%)</Text>
                                  </HStack>
                                </HStack>
                                <HStack justify="space-between" w="full" fontSize="sm">
                                  <Text>Overhead:</Text>
                                  <HStack>
                                    <Text>${calculations[0].overhead_total.toFixed(2)}</Text>
                                    <Text color="gray.600">({breakdown.overhead_percentage.toFixed(1)}%)</Text>
                                  </HStack>
                                </HStack>
                              </>
                            );
                          })()}
                        </VStack>
                      </Box>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportCalculation(calculations[0])}
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        Export Report
                      </Button>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}
            </Grid>
          </Tabs.Content>

          {/* Analysis Tab */}
          <Tabs.Content value="analysis">
            <VStack gap={6} align="stretch">
              {calculations.length === 0 ? (
                <Card.Root>
                  <Card.Body>
                    <VStack gap={4} py={8}>
                      <ChartBarIcon className="w-12 h-12 text-gray-400" />
                      <Text fontSize="lg" fontWeight="medium">No calculations to analyze</Text>
                      <Text color="gray.500">Create some cost calculations to see analysis here</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ) : (
                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Calculation History</Text>
                  </Card.Header>
                  <Card.Body>
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Product</Table.ColumnHeader>
                          <Table.ColumnHeader>Batch Size</Table.ColumnHeader>
                          <Table.ColumnHeader>Total Cost</Table.ColumnHeader>
                          <Table.ColumnHeader>Cost/Unit</Table.ColumnHeader>
                          <Table.ColumnHeader>Suggested Price</Table.ColumnHeader>
                          <Table.ColumnHeader>Margin</Table.ColumnHeader>
                          <Table.ColumnHeader>Date</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {calculations.map((calc) => (
                          <Table.Row key={calc.id}>
                            <Table.Cell fontWeight="medium">{calc.product_name}</Table.Cell>
                            <Table.Cell>{calc.batch_size}</Table.Cell>
                            <Table.Cell>${calc.total_cost.toFixed(2)}</Table.Cell>
                            <Table.Cell>${calc.cost_per_unit.toFixed(2)}</Table.Cell>
                            <Table.Cell>${calc.suggested_price.toFixed(2)}</Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette="green">
                                {calc.profit_margin.toFixed(1)}%
                              </Badge>
                            </Table.Cell>
                            <Table.Cell fontSize="sm" color="gray.600">
                              {new Date(calc.created_at).toLocaleDateString()}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Card.Body>
                </Card.Root>
              )}
            </VStack>
          </Tabs.Content>

          {/* Pricing Scenarios Tab */}
          <Tabs.Content value="scenarios">
            {calculations.length > 0 ? (
              <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4}>
                {getPricingScenarios(calculations[0]).map((scenario, index) => (
                  <Card.Root key={index}>
                    <Card.Header>
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="semibold">{scenario.name}</Text>
                        <Badge colorPalette={scenario.name === 'Conservative' ? 'blue' : scenario.name === 'Standard' ? 'green' : 'purple'}>
                          {scenario.margin.toFixed(1)}% margin
                        </Badge>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <VStack gap={3} align="stretch">
                        <Box textAlign="center" p={3} bg="gray.50" borderRadius="md">
                          <Text fontSize="xs" color="gray.600">Selling Price</Text>
                          <Text fontSize="2xl" fontWeight="bold">
                            ${scenario.price.toFixed(2)}
                          </Text>
                        </Box>
                        
                        <VStack gap={2} fontSize="sm">
                          <HStack justify="space-between" w="full">
                            <Text>Profit Margin:</Text>
                            <Text fontWeight="bold">{scenario.margin.toFixed(1)}%</Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text>Break-even Units:</Text>
                            <Text fontWeight="bold">{scenario.units_to_breakeven}</Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text>Projected Profit:</Text>
                            <Text fontWeight="bold" color="green.600">
                              ${scenario.projected_profit.toFixed(2)}
                            </Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Grid>
            ) : (
              <Card.Root>
                <Card.Body>
                  <VStack gap={4} py={8}>
                    <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400" />
                    <Text fontSize="lg" fontWeight="medium">No pricing scenarios available</Text>
                    <Text color="gray.500">Complete a cost calculation to see pricing scenarios</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}