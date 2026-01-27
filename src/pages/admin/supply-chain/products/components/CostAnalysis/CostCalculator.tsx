// src/features/products/ui/costs/CostCalculator.tsx
// Calculadora de costos como componente independiente

import React, { useState } from 'react';
import {
  CardWrapper,
  VStack,
  HStack,
  Button,
  Badge,
  Grid,
  InputField,
  NumberField,
  Box,
  Separator,
  Text
} from '@/shared/ui';
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/lib/decimal';
import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';
interface CostCalculation {
  id: string;
  product_name: string;
  batch_size: number;
  materials_cost: number;
  materials_per_unit: number;
  labor_hours: number;
  labor_rate_per_hour: number;
  labor_cost: number;
  equipment_cost: number;
  utility_cost: number;
  facility_cost: number;
  overhead_total: number;
  total_cost: number;
  cost_per_unit: number;
  suggested_price: number;
  profit_margin: number;
  markup_percentage: number;
  industry_benchmark: number;
  competitor_price: number;
  created_at: string;
}

interface CostCalculatorProps {
  calculations: CostCalculation[];
  onCalculationComplete: (calculation: CostCalculation) => void;
}

export function CostCalculator({ calculations, onCalculationComplete }: CostCalculatorProps) {
  const [currentCalculation, setCurrentCalculation] = useState<Partial<CostCalculation>>({
    batch_size: 1,
    labor_rate_per_hour: 15.00
  });
  const [loading, setLoading] = useState(false);

  const calculateCosts = () => {
    const calc = currentCalculation;
    
    if (!calc.materials_cost || !calc.labor_hours || !calc.batch_size) {
      notify.error({ title:'Please fill in all required fields' });
      return;
    }

    setLoading(true);

    // Calculate derived values - MIGRATED TO DECIMAL PRECISION
    const materials_per_unit = DecimalUtils.divide(
      (calc.materials_cost || 0).toString(),
      (calc.batch_size || 1).toString(),
      'financial'
    ).toNumber();
    
    const labor_cost = DecimalUtils.multiply(
      (calc.labor_hours || 0).toString(),
      (calc.labor_rate_per_hour || 15).toString(),
      'financial'
    ).toNumber();
    
    const overhead_total = DecimalUtils.add(
      DecimalUtils.add(
        (calc.equipment_cost || 0).toString(),
        (calc.utility_cost || 0).toString(),
        'financial'
      ).toString(),
      (calc.facility_cost || 0).toString(),
      'financial'
    ).toNumber();
    
    const total_cost = DecimalUtils.add(
      DecimalUtils.add(
        (calc.materials_cost || 0).toString(),
        labor_cost.toString(),
        'financial'
      ).toString(),
      overhead_total.toString(),
      'financial'
    ).toNumber();
    
    const cost_per_unit = DecimalUtils.divide(
      total_cost.toString(),
      (calc.batch_size || 1).toString(),
      'financial'
    ).toNumber();
    
    // Pricing calculations (80% markup as default) - MIGRATED TO DECIMAL PRECISION
    const markup_percentage = 80;
    const markupFactor = DecimalUtils.divide(markup_percentage.toString(), '100', 'financial');
    const suggested_price = DecimalUtils.multiply(
      cost_per_unit.toString(),
      DecimalUtils.add('1', markupFactor.toString(), 'financial').toString(),
      'financial'
    ).toNumber();
    
    const profit_margin = DecimalUtils.calculatePercentage(
      DecimalUtils.subtract(suggested_price.toString(), cost_per_unit.toString(), 'financial').toString(),
      suggested_price.toString()
    ).toNumber();

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
      industry_benchmark: suggested_price * 0.95,
      competitor_price: suggested_price * 1.05,
      created_at: new Date().toISOString()
    };

    onCalculationComplete(newCalculation);
    setCurrentCalculation({ batch_size: 1, labor_rate_per_hour: 15.00 });
    setLoading(false);
    notify.success({title:'Cost calculation completed successfully'});
  };

  const exportCalculation = (calc: CostCalculation) => {
    const data = JSON.stringify(calc, null, 2);
    logger.info('App', 'Exporting calculation:', data);
    notify.success( { title:'Calculation exported to console' } );
  };

  return (
    <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6">
      {/* Input Form */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack>
            <CalculatorIcon className="w-5 h-5 text-blue-600" />
            <Text fontSize="lg" fontWeight="semibold">Cost Calculation Input</Text>
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack gap="4" align="stretch">
            {/* Product Info */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="2">Product Name</Text>
              <InputField
                value={currentCalculation.product_name || ''}
                onChange={(e) => setCurrentCalculation(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="Enter product name"
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="2">Batch Size (units)</Text>
              <NumberField
                value={currentCalculation.batch_size}
                onChange={(value) => setCurrentCalculation(prev => ({ ...prev, batch_size: value }))}
                min={1}
                placeholder="Enter batch size"
              />
            </Box>

            <Separator />

            {/* Material Costs */}
            <Text fontSize="md" fontWeight="semibold" color="blue.600">Material Costs</Text>
            
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="2">Total Materials Cost ($)</Text>
              <NumberField
                value={currentCalculation.materials_cost}
                onChange={(value) => setCurrentCalculation(prev => ({ ...prev, materials_cost: value }))}
                min={0}
                precision={2}
                placeholder="Enter materials cost"
              />
            </Box>

            <Separator />

            {/* Labor Costs */}
            <Text fontSize="md" fontWeight="semibold" color="green.600">Labor Costs</Text>
            
            <Grid templateColumns="1fr 1fr" gap="3">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">Labor Hours</Text>
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
                <Text fontSize="sm" fontWeight="medium" mb="2">Rate/Hour ($)</Text>
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
            
            <Grid templateColumns="1fr 1fr" gap="3">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">Equipment ($)</Text>
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
                <Text fontSize="sm" fontWeight="medium" mb="2">Utilities ($)</Text>
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
              <Text fontSize="sm" fontWeight="medium" mb="2">Facility Cost ($)</Text>
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
        </CardWrapper.Body>
      </CardWrapper>

      {/* Latest Calculation Results */}
      {calculations.length > 0 && (
        <CardWrapper>
          <CardWrapper.Header>
            <HStack justify="space-between">
              <HStack>
                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                <Text fontSize="lg" fontWeight="semibold">Latest Calculation</Text>
              </HStack>
              <Badge colorPalette="green">
                {calculations[0].product_name}
              </Badge>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack gap="4" align="stretch">
              {/* Cost Summary */}
              <Grid templateColumns="repeat(2, 1fr)" gap="4">
                <Box textAlign="center" p="3" bg="blue.50" borderRadius="md">
                  <Text fontSize="xs" color="gray.600">Total Cost</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    ${calculations[0].total_cost.toFixed(2)}
                  </Text>
                </Box>
                
                <Box textAlign="center" p="3"  borderRadius="md">
                  <Text fontSize="xs" color="gray.600">Cost per Unit</Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                    ${calculations[0].cost_per_unit.toFixed(2)}
                  </Text>
                </Box>
              </Grid>

              {/* Pricing Analysis */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb="2">Pricing Analysis</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap="3" fontSize="sm">
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

              <Button
                size="sm"
                variant="outline"
                onClick={() => exportCalculation(calculations[0])}
              >
                <DocumentTextIcon className="w-4 h-4" />
                Export Report
              </Button>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </Grid>
  );
}