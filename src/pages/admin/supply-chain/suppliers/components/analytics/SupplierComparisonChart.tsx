// ============================================
// SUPPLIER COMPARISON CHART
// ============================================
// Visual comparison of multiple suppliers

import { VStack, Text, Card, HStack, Badge, SimpleGrid } from '@/shared/ui';
import type { SupplierAnalysis } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import { useMemo } from 'react';

interface SupplierComparisonChartProps {
  data: SupplierAnalysis[];
}

/**
 * Supplier Comparison Chart Component
 * Shows visual comparison between suppliers
 * TODO: Integrate with actual chart library (Recharts) for production
 */
export function SupplierComparisonChart({ data }: SupplierComparisonChartProps) {
  // Sort suppliers by overall rating
  const sortedSuppliers = useMemo(() => {
    return [...data].sort((a, b) => b.overallRating - a.overallRating);
  }, [data]);

  return (
    <VStack align="stretch" gap={4}>
      <Text fontSize="xl" fontWeight="bold">
        Comparación de Proveedores (por Rating)
      </Text>

      {/* Bar Chart Representation */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        {sortedSuppliers.map(supplier => (
          <Card.Root key={supplier.id}>
            <Card.Body>
              <VStack align="stretch" gap={3}>
                {/* Supplier Header */}
                <HStack justify="space-between">
                  <Text fontWeight="bold">{supplier.name}</Text>
                  <Badge colorPalette={getRatingColor(supplier.overallRating)}>
                    {supplier.overallRating.toFixed(0)}
                  </Badge>
                </HStack>

                {/* Metrics Bars */}
                <VStack align="stretch" gap={2}>
                  <MetricBar
                    label="Calidad"
                    value={supplier.metrics.qualityScore}
                    color={getMetricColor(supplier.metrics.qualityScore)}
                  />
                  <MetricBar
                    label="Entregas"
                    value={supplier.metrics.onTimeDeliveryRate}
                    color={getMetricColor(supplier.metrics.onTimeDeliveryRate)}
                  />
                  <MetricBar
                    label="Estabilidad"
                    value={supplier.metrics.costStability}
                    color={getMetricColor(supplier.metrics.costStability)}
                  />
                  <MetricBar
                    label="Servicio"
                    value={supplier.metrics.responsiveness}
                    color={getMetricColor(supplier.metrics.responsiveness)}
                  />
                </VStack>

                {/* Summary */}
                <HStack justify="space-between" fontSize="sm" color="fg.muted">
                  <Text>{supplier.itemCount} items</Text>
                  <Text>
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                      minimumFractionDigits: 0
                    }).format(supplier.totalAnnualValue)}
                  </Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      {/* Legend */}
      <Card.Root>
        <Card.Body>
          <HStack justify="center" gap={4} flexWrap="wrap">
            <HStack>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--chakra-colors-green-500)',
                  borderRadius: 4
                }}
              />
              <Text fontSize="sm">Excelente (85+)</Text>
            </HStack>
            <HStack>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--chakra-colors-blue-500)',
                  borderRadius: 4
                }}
              />
              <Text fontSize="sm">Bueno (70-84)</Text>
            </HStack>
            <HStack>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--chakra-colors-yellow-500)',
                  borderRadius: 4
                }}
              />
              <Text fontSize="sm">Regular (55-69)</Text>
            </HStack>
            <HStack>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--chakra-colors-orange-500)',
                  borderRadius: 4
                }}
              />
              <Text fontSize="sm">Malo (40-54)</Text>
            </HStack>
            <HStack>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--chakra-colors-red-500)',
                  borderRadius: 4
                }}
              />
              <Text fontSize="sm">Crítico (&lt;40)</Text>
            </HStack>
          </HStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

/**
 * Metric Bar Component
 */
interface MetricBarProps {
  label: string;
  value: number;
  color: string;
}

function MetricBar({ label, value, color }: MetricBarProps) {
  return (
    <VStack align="stretch" gap={1}>
      <HStack justify="space-between" fontSize="sm">
        <Text color="fg.muted">{label}</Text>
        <Text fontWeight="semibold">{value.toFixed(0)}</Text>
      </HStack>
      <div
        style={{
          width: '100%',
          height: 8,
          backgroundColor: 'var(--chakra-colors-gray-200)',
          borderRadius: 4,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            backgroundColor: `var(--chakra-colors-${color}-500)`,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </VStack>
  );
}

/**
 * Get color based on metric value
 */
function getMetricColor(value: number): string {
  if (value >= 85) return 'green';
  if (value >= 70) return 'blue';
  if (value >= 55) return 'yellow';
  if (value >= 40) return 'orange';
  return 'red';
}

/**
 * Get color based on rating
 */
function getRatingColor(rating: number): string {
  if (rating >= 85) return 'green';
  if (rating >= 70) return 'blue';
  if (rating >= 55) return 'yellow';
  if (rating >= 40) return 'orange';
  return 'red';
}
