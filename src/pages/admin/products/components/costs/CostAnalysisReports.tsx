// src/features/products/ui/costs/CostAnalysisReports.tsx
// Reportes y análisis de costos como componente independiente

import React from 'react';
import {
  Box,
  CardWrapper ,
  VStack,
  HStack,
  Text,
  Badge,
  Table
} from '@chakra-ui/react';
import {
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface CostCalculation {
  id: string;
  product_name: string;
  batch_size: number;
  total_cost: number;
  cost_per_unit: number;
  suggested_price: number;
  profit_margin: number;
  created_at: string;
}

interface CostAnalysisReportsProps {
  calculations: CostCalculation[];
}

export function CostAnalysisReports({ calculations }: CostAnalysisReportsProps) {
  if (calculations.length === 0) {
    return (
      <CardWrapper .Root>
        <CardWrapper .Body>
          <VStack gap={4} py={8}>
            <ChartBarIcon className="w-12 h-12 text-gray-400" />
            <Text fontSize="lg" fontWeight="medium">No calculations to analyze</Text>
            <Text color="gray.500">Create some cost calculations to see analysis here</Text>
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <CardWrapper .Root>
        <CardWrapper .Header>
          <HStack>
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            <Text fontSize="lg" fontWeight="semibold">Calculation History</Text>
          </HStack>
        </CardWrapper .Header>
        <CardWrapper .Body>
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
        </CardWrapper .Body>
      </CardWrapper .Root>
    </VStack>
  );
}