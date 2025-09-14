// src/features/products/ui/costs/PricingScenarios.tsx
// Escenarios de precios como componente independiente

import React from 'react';
import {
  Box,
  CardWrapper,
  VStack,
  HStack,
  Text,
  Badge,
  Grid
} from '@/shared/ui';
import {
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface CostCalculation {
  id: string;
  product_name: string;
  batch_size: number;
  total_cost: number;
  cost_per_unit: number;
  overhead_total: number;
}

interface PricingScenario {
  name: string;
  price: number;
  margin: number;
  units_to_breakeven: number;
  projected_profit: number;
}

interface PricingScenariosProps {
  calculations: CostCalculation[];
}

export function PricingScenarios({ calculations }: PricingScenariosProps) {
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

  if (calculations.length === 0) {
    return (
      <CardWrapper .Root>
        <CardWrapper .Body>
          <VStack gap={4} py={8}>
            <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400" />
            <Text fontSize="lg" fontWeight="medium">No pricing scenarios available</Text>
            <Text color="gray.500">Complete a cost calculation to see pricing scenarios</Text>
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <HStack>
        <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
        <Text fontSize="lg" fontWeight="semibold">
          Pricing Scenarios for {calculations[0].product_name}
        </Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={4}>
        {getPricingScenarios(calculations[0]).map((scenario, index) => (
          <CardWrapper .Root key={index}>
            <CardWrapper .Header>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold">{scenario.name}</Text>
                <Badge colorPalette={scenario.name === 'Conservative' ? 'blue' : scenario.name === 'Standard' ? 'green' : 'purple'}>
                  {scenario.margin.toFixed(1)}% margin
                </Badge>
              </HStack>
            </CardWrapper .Header>
            <CardWrapper .Body>
              <VStack gap={3} align="stretch">
                <Box textAlign="center" p={3} bg="bg.canvas" borderRadius="md">
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
            </CardWrapper .Body>
          </CardWrapper .Root>
        ))}
      </Grid>
    </VStack>
  );
}