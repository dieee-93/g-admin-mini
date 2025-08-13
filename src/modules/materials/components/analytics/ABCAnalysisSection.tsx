// ABCAnalysisSection.tsx - Advanced ABC Analysis for Materials Inventory Management
import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Card, 
  SimpleGrid, 
  Badge, 
  Tabs,
  Button,
  Table,
  Progress
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { ABCCategory, MaterialABC } from '../../types/abc-analysis';

const ABCAnalysisSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analysisType, setAnalysisType] = useState('revenue');

  // Mock data for the overview cards
  const abcOverview = {
    A: { items: 25, revenue: 67800, percentage: 73.2 },
    B: { items: 48, revenue: 18400, percentage: 19.8 },
    C: { items: 127, revenue: 6500, percentage: 7.0 }
  };

  const categoryData: ABCCategory[] = [
    {
      category: 'A',
      title: 'Clase A - Críticos',
      description: 'Alto valor, control riguroso',
      color: 'red',
      items: abcOverview.A.items,
      percentage: abcOverview.A.percentage,
      revenue: abcOverview.A.revenue,
      strategy: 'Control diario, stock de seguridad mínimo'
    },
    {
      category: 'B',
      title: 'Clase B - Importantes',
      description: 'Valor moderado, control normal',
      color: 'yellow',
      items: abcOverview.B.items,
      percentage: abcOverview.B.percentage,
      revenue: abcOverview.B.revenue,
      strategy: 'Control semanal, stock moderado'
    },
    {
      category: 'C',
      title: 'Clase C - Ordinarios',
      description: 'Bajo valor, control simple',
      color: 'green',
      items: abcOverview.C.items,
      percentage: abcOverview.C.percentage,
      revenue: abcOverview.C.revenue,
      strategy: 'Control mensual, stock elevado permitido'
    }
  ];

  // Mock materials data
  const materialsData: MaterialABC[] = [
    {
      id: '1',
      name: 'Carne Premium',
      category: 'carnes',
      abcClass: 'A',
      currentStock: 15,
      unit: 'kg',
      unitCost: 2500,
      annualConsumption: 2400,
      annualValue: 6000000,
      revenuePercentage: 32.1,
      cumulativeRevenue: 32.1
    },
    {
      id: '2',
      name: 'Queso Mozzarella',
      category: 'lacteos',
      abcClass: 'A',
      currentStock: 8,
      unit: 'kg',
      unitCost: 1800,
      annualConsumption: 1800,
      annualValue: 3240000,
      revenuePercentage: 17.3,
      cumulativeRevenue: 49.4
    },
    {
      id: '3',
      name: 'Aceite de Oliva',
      category: 'condimentos',
      abcClass: 'B',
      currentStock: 12,
      unit: 'l',
      unitCost: 1200,
      annualConsumption: 240,
      annualValue: 288000,
      revenuePercentage: 1.5,
      cumulativeRevenue: 85.2
    }
  ];

  const filteredMaterials = selectedCategory === 'all' 
    ? materialsData 
    : materialsData.filter(m => m.abcClass === selectedCategory);

  return (
    <Box p="6">
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">ABC Analysis - Supply Chain Intelligence</Heading>
          <Text color="gray.600">
            Advanced categorization of inventory items based on consumption patterns and value analysis
          </Text>
        </Box>

        {/* Analysis Type Selector */}
        <HStack gap="4">
          <Text fontSize="sm" fontWeight="medium">Criterio de análisis:</Text>
          <Button
            size="sm"
            variant={analysisType === 'revenue' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => setAnalysisType('revenue')}
          >
            Por Facturación
          </Button>
          <Button
            size="sm"
            variant={analysisType === 'quantity' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => setAnalysisType('quantity')}
          >
            Por Cantidad
          </Button>
          <Button
            size="sm"
            variant={analysisType === 'frequency' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => setAnalysisType('frequency')}
          >
            Por Frecuencia
          </Button>
        </HStack>

        {/* ABC Categories Overview */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="6" w="full">
          {categoryData.map((category) => (
            <Card.Root key={category.category} p="6">
              <Card.Body>
                <VStack align="start" gap="4">
                  <HStack justify="space-between" w="full">
                    <Badge 
                      size="lg" 
                      colorPalette={category.color}
                      variant="solid"
                    >
                      Clase {category.category}
                    </Badge>
                    <Text fontSize="2xl" fontWeight="bold">
                      {category.items}
                    </Text>
                  </HStack>
                  
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold">{category.title}</Text>
                    <Text fontSize="sm" color="gray.600">{category.description}</Text>
                  </Box>

                  <VStack align="start" gap="2" w="full">
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm">Facturación</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        ${category.revenue.toLocaleString()}
                      </Text>
                    </HStack>
                    <Progress.Root value={category.percentage} size="sm" w="full">
                      <Progress.Track>
                        <Progress.Range bg={`${category.color}.500`} />
                      </Progress.Track>
                    </Progress.Root>
                    <Text fontSize="xs" color="gray.500">
                      {category.percentage}% del total
                    </Text>
                  </VStack>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb="1">Estrategia recomendada:</Text>
                    <Text fontSize="xs" color="gray.600">{category.strategy}</Text>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        {/* Materials Table */}
        <Card.Root w="full">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="lg">Detalle por Material</Heading>
              <HStack gap="2">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'solid' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                >
                  Todos
                </Button>
                {['A', 'B', 'C'].map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'solid' : 'outline'}
                    colorPalette={cat === 'A' ? 'red' : cat === 'B' ? 'yellow' : 'green'}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    Clase {cat}
                  </Button>
                ))}
              </HStack>
            </HStack>
          </Card.Header>
          <Card.Body>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Material</Table.ColumnHeader>
                  <Table.ColumnHeader>Clase ABC</Table.ColumnHeader>
                  <Table.ColumnHeader>Stock Actual</Table.ColumnHeader>
                  <Table.ColumnHeader>Costo Unitario</Table.ColumnHeader>
                  <Table.ColumnHeader>Consumo Anual</Table.ColumnHeader>
                  <Table.ColumnHeader>Valor Anual</Table.ColumnHeader>
                  <Table.ColumnHeader>% Facturación</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredMaterials.map((material) => (
                  <Table.Row key={material.id}>
                    <Table.Cell>
                      <VStack align="start" gap="1">
                        <Text fontWeight="medium">{material.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {material.category}
                        </Text>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        colorPalette={
                          material.abcClass === 'A' ? 'red' : 
                          material.abcClass === 'B' ? 'yellow' : 'green'
                        }
                        variant="subtle"
                      >
                        Clase {material.abcClass}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {material.currentStock} {material.unit}
                    </Table.Cell>
                    <Table.Cell>
                      ${material.unitCost.toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      {material.annualConsumption.toLocaleString()} {material.unit}
                    </Table.Cell>
                    <Table.Cell>
                      ${material.annualValue.toLocaleString()}
                    </Table.Cell>
                    <Table.Cell>
                      {material.revenuePercentage}%
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        {/* Action Buttons */}
        <HStack gap="4">
          <Button colorPalette="blue" leftIcon={<DocumentChartBarIcon className="w-4 h-4" />}>
            Generar Reporte
          </Button>
          <Button variant="outline" leftIcon={<ArrowTrendingUpIcon className="w-4 h-4" />}>
            Configurar Umbrales
          </Button>
          <Button variant="outline" leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
            Aplicar Estrategias
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ABCAnalysisSection;