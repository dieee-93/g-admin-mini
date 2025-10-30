// ============================================
// CONSOLIDATION OPPORTUNITIES
// ============================================
// Displays supplier consolidation opportunities with savings estimates

import { VStack, Text, Card, HStack, Badge, Button, Alert } from '@/shared/ui';
import { CardGrid } from '@/shared/ui';
import type { SupplierAnalysisResult } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import {
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ConsolidationOpportunitiesProps {
  opportunities: SupplierAnalysisResult['consolidationOpportunities'];
}

/**
 * Consolidation Opportunities Component
 * Shows opportunities to consolidate multiple suppliers
 */
export function ConsolidationOpportunities({
  opportunities
}: ConsolidationOpportunitiesProps) {
  if (opportunities.length === 0) {
    return (
      <VStack align="stretch" gap={4}>
        <Text fontSize="xl" fontWeight="bold">
          Oportunidades de Consolidación
        </Text>
        <Alert status="info" title="No se identificaron oportunidades de consolidación">
          La estructura actual de proveedores parece óptima. Continúa monitoreando el portfolio.
        </Alert>
      </VStack>
    );
  }

  // Calculate total potential savings
  const totalSavings = opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);

  return (
    <VStack align="stretch" gap={4}>
      <HStack justify="space-between">
        <Text fontSize="xl" fontWeight="bold">
          Oportunidades de Consolidación
        </Text>
        <Badge colorPalette="green" size="lg">
          Ahorro potencial: {formatCurrency(totalSavings)}
        </Badge>
      </HStack>

      <CardGrid columns={{ base: 1, md: 2 }} gap={4}>
        {opportunities.map((opp, index) => (
          <Card.Root key={`${opp.category}-${index}`}>
            <Card.Header>
              <HStack justify="space-between">
                <HStack>
                  <ArrowsRightLeftIcon width={20} height={20} />
                  <Text fontWeight="bold">{opp.category}</Text>
                </HStack>
                <Badge
                  colorPalette={getComplexityColor(opp.implementationComplexity)}
                  size="sm"
                >
                  {getComplexityLabel(opp.implementationComplexity)}
                </Badge>
              </HStack>
            </Card.Header>

            <Card.Body>
              <VStack align="stretch" gap={3}>
                {/* Current Suppliers */}
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                    Proveedores Actuales ({opp.currentSuppliers.length}):
                  </Text>
                  <VStack align="start" gap={0} pl={2}>
                    {opp.currentSuppliers.map(supplier => (
                      <Text key={supplier} fontSize="sm">
                        • {supplier}
                      </Text>
                    ))}
                  </VStack>
                </VStack>

                {/* Recommended Supplier */}
                <VStack align="start" gap={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                    Proveedor Recomendado:
                  </Text>
                  <HStack>
                    <CheckCircleIcon width={16} height={16} color="green" />
                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                      {opp.recommendedSupplier}
                    </Text>
                  </HStack>
                </VStack>

                {/* Metrics */}
                <HStack justify="space-between">
                  <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="fg.muted">
                      Ahorro Estimado
                    </Text>
                    <HStack>
                      <CurrencyDollarIcon width={16} height={16} />
                      <Text fontWeight="bold" color="green.600">
                        {formatCurrency(opp.potentialSavings)}
                      </Text>
                    </HStack>
                  </VStack>

                  <VStack align="end" gap={0}>
                    <Text fontSize="xs" color="fg.muted">
                      Reducción de Riesgo
                    </Text>
                    <Text fontWeight="bold">
                      {opp.riskReduction.toFixed(0)}%
                    </Text>
                  </VStack>
                </HStack>

                {/* Action Button */}
                <Button size="sm" colorPalette="blue" variant="outline" width="full">
                  Crear Plan de Consolidación
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </CardGrid>
    </VStack>
  );
}

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Get color for implementation complexity
 */
function getComplexityColor(complexity: string): string {
  switch (complexity) {
    case 'low':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Get label for implementation complexity
 */
function getComplexityLabel(complexity: string): string {
  switch (complexity) {
    case 'low':
      return 'Complejidad Baja';
    case 'medium':
      return 'Complejidad Media';
    case 'high':
      return 'Complejidad Alta';
    default:
      return complexity;
  }
}
