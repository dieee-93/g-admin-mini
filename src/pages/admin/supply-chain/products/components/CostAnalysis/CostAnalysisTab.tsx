// src/features/products/ui/CostAnalysisTab.tsx
// Advanced Cost Analysis Calculator - DESIGN SYSTEM VERSION

import React, { useState, useEffect } from 'react';

// SOLO Design System Components - SIGUIENDO LAS REGLAS
import {
  // Layout & Structure
  Stack, HStack,
  
  // Components del Design System
  CardWrapper ,
  Typography, 
  Alert, AlertDescription,
  Badge,
  SelectField, createListCollection,
  NumberField,
  Button,
  Tabs, TabList, Tab, TabPanels, TabPanel,
  
  // Context para defaults automáticos
  
} from '@/shared/ui';

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

// Import REAL data connections - NO MORE MOCK DATA
import { useCostAnalysis, type RealCostAnalysisResult, type RealCostCalculationInput } from '../../hooks/useCostAnalysis';
// import { useCostCalculations } from '../hooks/useCostCalculations'; // Commented out - hook not found

export function CostAnalysisTab() {
  // REAL data hooks - connected to MaterialsStore and ProductsStore
  const { 
    availableProducts, 
    performRealCostAnalysis, 
    validateMaterialsAvailability 
  } = useCostAnalysis();
  // const { generatePricingScenarios } = useCostCalculations(); // Commented out - hook not found

  // State for real calculations
  const [calculations, setCalculations] = useState<RealCostAnalysisResult[]>([]);
  const [currentInput, setCurrentInput] = useState<Partial<RealCostCalculationInput>>({
    batch_size: 1,
    labor_rate_per_hour: 15.00,
    labor_hours: 1.0,
    equipment_cost: 0,
    utility_cost: 0,
    facility_cost: 0
  });
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');

  // Product options for select (REAL data)
  const productOptions = availableProducts.map(product => ({
    value: product.id,
    label: product.name,
    description: `${product.components_count} components available`
  }));

  // REAL materials validation
  const availability = selectedProductId ? 
    validateMaterialsAvailability(selectedProductId, currentInput.batch_size || 1) : null;

  // REAL cost calculation handler
  const handleCostCalculation = async () => {
    if (!selectedProductId || loading) return;
    
    setLoading(true);
    try {
      // Perform REAL cost analysis
      const analysisInput: RealCostCalculationInput = {
        product_id: selectedProductId,
        batch_size: currentInput.batch_size || 1,
        labor_hours: currentInput.labor_hours || 1,
        labor_rate_per_hour: currentInput.labor_rate_per_hour || 15,
        equipment_cost: currentInput.equipment_cost || 0,
        utility_cost: currentInput.utility_cost || 0,
        facility_cost: currentInput.facility_cost || 0
      };

      const result = performRealCostAnalysis(analysisInput);
      
      if (result) {
        setCalculations(prev => [result, ...prev]);
        
        // Reset form
        setCurrentInput({
          batch_size: 1,
          labor_rate_per_hour: 15.00,
          labor_hours: 1.0,
          equipment_cost: 0,
          utility_cost: 0,
          facility_cost: 0
        });
        
        notify.success({
          title: 'Cost Analysis Complete',
          description: 'Real cost calculation completed!'
        });
      } else {
        notify.error({
          title: 'Calculation Failed',
          description: 'Could not calculate costs for selected product'
        });
      }
    } catch (err) {
      console.error('Error calculating real costs:', err);
      notify.error({
        title: 'Error',
        description: 'Error performing cost analysis'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get cost breakdown for display (using real data)
  const getCostBreakdown = (calc: RealCostAnalysisResult) => {
    const total = calc.total_cost;
    return [
      { label: 'Materials', value: calc.materials_cost, color: 'blue' },
      { label: 'Labor', value: calc.labor_cost, color: 'green' },
      { label: 'Overhead', value: total - calc.materials_cost - calc.labor_cost, color: 'orange' }
    ];
  };

  return (
    
      <Stack gap="lg" align="stretch">
        {/* Header con Design System */}
        <Stack align="start" gap="xs">
          <Typography variant="heading">Advanced Cost Analysis</Typography>
          <Typography variant="body" color="text.muted">
            Calculate comprehensive production costs including materials, labor, overhead, and profit margins using real inventory data.
          </Typography>
        </Stack>

        {/* Tabs usando Design System */}
        <Tabs defaultValue="calculator" variant="line">
          <TabList>
            <Tab value="calculator">
              <CalculatorIcon className="w-4 h-4" />
              Cost Calculator
            </Tab>
            <Tab value="analysis">
              <ChartBarIcon className="w-4 h-4" />
              Analysis Results
            </Tab>
            <Tab value="scenarios">
              <DocumentTextIcon className="w-4 h-4" />
              Pricing Scenarios
            </Tab>
          </TabList>

          <TabPanels>
            {/* Calculator Tab */}
            <TabPanel value="calculator">
              <HStack gap="lg" align="start">
                {/* Left Panel - Input Form */}
                <CardWrapper variant="elevated" padding="lg" width="full">
                  <CardWrapper.Header>
                    <Typography variant="title">Cost Calculation Input</Typography>
                  </CardWrapper.Header>

                  <CardWrapper.Body>
                    <Stack gap="md" align="stretch">
                      {/* Product Selection */}
                      <Stack gap="xs">
                        <Typography variant="label">Select Product (with recipe)</Typography>
                        {availableProducts.length > 0 ? (
                          <SelectField
                            options={productOptions}
                            placeholder="Choose a product..."
                            value={selectedProductId}
                            onChange={(value) => setSelectedProductId(value as string)}
                          />
                        ) : (
                          <Alert status="warning" title="No products with recipes found">
                            <AlertDescription>
                              Create products with recipes in the Products module to enable cost analysis.
                            </AlertDescription>
                          </Alert>
                        )}
                      </Stack>

                      {/* Materials Cost Info */}
                      <Alert status="info" title="Materials Cost Auto-Calculated">
                        <AlertDescription>
                          Materials cost is automatically calculated from the selected product's recipe and current inventory prices.
                        </AlertDescription>
                      </Alert>

                      {/* Batch Size */}
                      <Stack gap="xs">
                        <Typography variant="label">Batch Size (units)</Typography>
                        <NumberField
                          value={currentInput.batch_size || 1}
                          onChange={(value) => setCurrentInput(prev => ({ ...prev, batch_size: value }))}
                          min={1}
                          step={1}
                          precision={0}
                        />
                      </Stack>

                      {/* Materials Availability Warning */}
                      {availability && !availability.valid && (
                        <Alert status="warning" title="Insufficient Materials">
                          <AlertDescription>
                            Some materials are not available in sufficient quantities for this batch size.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Labor Costs */}
                      <Typography variant="title" >Labor Costs</Typography>
                      
                      <HStack gap="md">
                        <Stack gap="xs" width="full">
                          <Typography variant="label">Labor Hours</Typography>
                          <NumberField
                            value={currentInput.labor_hours || 1}
                            onChange={(value) => setCurrentInput(prev => ({ ...prev, labor_hours: value }))}
                            min={0}
                            step={0.5}
                            precision={1}
                          />
                        </Stack>
                        <Stack gap="xs" width="full">
                          <Typography variant="label">Rate/Hour ($)</Typography>
                          <NumberField
                            value={currentInput.labor_rate_per_hour || 15}
                            onChange={(value) => setCurrentInput(prev => ({ ...prev, labor_rate_per_hour: value }))}
                            min={0}
                            step={0.25}
                            precision={2}
                          />
                        </Stack>
                      </HStack>

                      {/* Overhead Costs */}
                      <Typography variant="title" >Overhead Costs</Typography>
                      
                      <HStack gap="md">
                        <Stack gap="xs" width="full">
                          <Typography variant="label">Equipment ($)</Typography>
                          <NumberField
                            value={currentInput.equipment_cost || 0}
                            onChange={(value) => setCurrentInput(prev => ({ ...prev, equipment_cost: value }))}
                            min={0}
                            step={0.01}
                            precision={2}
                          />
                        </Stack>
                        <Stack gap="xs" width="full">
                          <Typography variant="label">Utilities ($)</Typography>
                          <NumberField
                            value={currentInput.utility_cost || 0}
                            onChange={(value) => setCurrentInput(prev => ({ ...prev, utility_cost: value }))}
                            min={0}
                            step={0.01}
                            precision={2}
                          />
                        </Stack>
                      </HStack>

                      <Stack gap="xs">
                        <Typography variant="label">Facility Cost ($)</Typography>
                        <NumberField
                          value={currentInput.facility_cost || 0}
                          onChange={(value) => setCurrentInput(prev => ({ ...prev, facility_cost: value }))}
                          min={0}
                          step={0.01}
                          precision={2}
                        />
                      </Stack>

                      {/* Calculate Button */}
                      <Button 
                        variant="solid" 
                        onClick={handleCostCalculation}
                        disabled={!selectedProductId || loading}
                        size="lg"
                      >
                        <CalculatorIcon className="w-4 h-4" />
                        {loading ? 'Calculating...' : 'Calculate Real Costs'}
                      </Button>
                    </Stack>
                  </CardWrapper.Body>
                </CardWrapper>

                {/* Right Panel - Latest Result */}
                <CardWrapper variant="elevated" padding="lg" width="full">
                  <CardWrapper.Header>
                    <Typography variant="title">Latest Cost Analysis</Typography>
                  </CardWrapper.Header>

                  <CardWrapper.Body>
                    {calculations.length > 0 ? (
                      <Stack gap="md" align="stretch">
                        {(() => {
                          const latest = calculations[0];
                          const breakdown = getCostBreakdown(latest);
                          
                          return (
                            <>
                              {/* Product Info */}
                              <Stack gap="xs">
                                <Typography variant="body" weight="medium">
                                  {latest.product_name}
                                </Typography>
                                <Typography variant="caption" color="text.muted">
                                  Batch size: {latest.batch_size} units
                                </Typography>
                              </Stack>

                              {/* Cost Breakdown */}
                              <Stack gap="sm">
                                {breakdown.map((item, index) => (
                                  <HStack key={index} justify="space-between" align="center">
                                    <Typography variant="body">{item.label}</Typography>
                                    <Badge variant="subtle" colorPalette={item.color as any}>
                                      ${item.value.toFixed(2)}
                                    </Badge>
                                  </HStack>
                                ))}
                              </Stack>

                              {/* Total Cost */}
                              <CardWrapper variant="outline" padding="md">
                                <HStack justify="space-between" align="center">
                                  <Typography variant="title">Total Cost</Typography>
                                  <Typography variant="heading" color="text.primary">
                                    ${latest.total_cost.toFixed(2)}
                                  </Typography>
                                </HStack>
                              </CardWrapper>

                              {/* Pricing Info */}
                              <Stack gap="sm">
                                <HStack justify="space-between">
                                  <Typography variant="body">Cost per Unit</Typography>
                                  <Typography variant="body" weight="medium">
                                    ${latest.cost_per_unit.toFixed(2)}
                                  </Typography>
                                </HStack>
                                <HStack justify="space-between">
                                  <Typography variant="body">Suggested Price</Typography>
                                  <Typography variant="body" weight="medium" >
                                    ${latest.suggested_price.toFixed(2)}
                                  </Typography>
                                </HStack>
                                <HStack justify="space-between">
                                  <Typography variant="body">Profit Margin</Typography>
                                  <Badge variant="subtle" colorPalette="success">
                                    {latest.profit_margin.toFixed(1)}%
                                  </Badge>
                                </HStack>
                              </Stack>

                              {/* Production Viability */}
                              {latest.can_produce ? (
                                <Alert status="success" title="Production Ready">
                                  <AlertDescription>
                                    All materials available for production of {latest.batch_size} units.
                                  </AlertDescription>
                                </Alert>
                              ) : (
                                <Alert status="warning" title="Production Limited">
                                  <AlertDescription>
                                    Some materials may be insufficient. Max possible batches: {latest.max_possible_batches}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </>
                          );
                        })()}
                      </Stack>
                    ) : (
                      <Stack align="center" gap="md" padding="xl">
                        <CalculatorIcon className="w-16 h-16 text-gray-400" />
                        <Typography variant="body" color="text.muted" align="center">
                          Select a product and calculate costs to see results
                        </Typography>
                      </Stack>
                    )}
                  </CardWrapper.Body>
                </CardWrapper>
              </HStack>
            </TabPanel>

            {/* Analysis Results Tab */}
            <TabPanel value="analysis">
              <CardWrapper variant="elevated" padding="lg">
                <CardWrapper.Header>
                  <Typography variant="title">Historical Cost Analysis</Typography>
                </CardWrapper.Header>

                <CardWrapper.Body>
                  {calculations.length > 0 ? (
                    <Stack gap="md">
                      {calculations.map((calc, index) => (
                        <CardWrapper key={index} variant="outline" padding="md">
                          <HStack justify="space-between" align="center">
                            <Stack gap="xs">
                              <Typography variant="body" weight="medium">
                                {calc.product_name}
                              </Typography>
                              <Typography variant="caption" color="text.muted">
                                {calc.batch_size} units • ${calc.cost_per_unit.toFixed(2)}/unit
                              </Typography>
                            </Stack>
                            <HStack gap="md">
                              <Stack align="end" gap="xs">
                                <Typography variant="caption" color="text.muted">Total Cost</Typography>
                                <Typography variant="body" weight="semibold">
                                  ${calc.total_cost.toFixed(2)}
                                </Typography>
                              </Stack>
                              <Stack align="end" gap="xs">
                                <Typography variant="caption" color="text.muted">Suggested Price</Typography>
                                <Typography variant="body" weight="semibold" >
                                  ${calc.suggested_price.toFixed(2)}
                                </Typography>
                              </Stack>
                              <Badge variant="subtle" colorPalette={calc.can_produce ? 'success' : 'warning'}>
                                {calc.can_produce ? 'Ready' : 'Limited'}
                              </Badge>
                            </HStack>
                          </HStack>
                        </CardWrapper>
                      ))}
                    </Stack>
                  ) : (
                    <Stack align="center" gap="md" padding="xl">
                      <ChartBarIcon className="w-16 h-16 text-gray-400" />
                      <Typography variant="body" color="text.muted" align="center">
                        No cost analyses performed yet
                      </Typography>
                    </Stack>
                  )}
                </CardWrapper.Body>
              </CardWrapper>
            </TabPanel>

            {/* Pricing Scenarios Tab */}
            <TabPanel value="scenarios">
              <CardWrapper variant="elevated" padding="lg">
                <CardWrapper.Header>
                  <Typography variant="title">Pricing Scenarios</Typography>
                </CardWrapper.Header>

                <CardWrapper.Body>
                  <Stack align="center" gap="md" padding="xl">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400" />
                    <Typography variant="body" color="text.muted" align="center">
                      Pricing scenarios feature coming soon
                    </Typography>
                  </Stack>
                </CardWrapper.Body>
              </CardWrapper>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    
  );
}
