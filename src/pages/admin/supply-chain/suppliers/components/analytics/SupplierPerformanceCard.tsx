// ============================================
// SUPPLIER PERFORMANCE CARD
// ============================================
// Individual supplier performance metrics card

import { Card, HStack, VStack, Text, Badge, SimpleGrid, Button } from '@/shared/ui';
import type { SupplierAnalysis } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import {
  CheckBadgeIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SupplierPerformanceCardProps {
  supplier: SupplierAnalysis;
  onViewDetails?: (supplier: SupplierAnalysis) => void;
  onCreateOrder?: (supplier: SupplierAnalysis) => void;
}

/**
 * Supplier Performance Card Component
 * Shows KPIs and metrics for an individual supplier
 */
export function SupplierPerformanceCard({
  supplier,
  onViewDetails,
  onCreateOrder
}: SupplierPerformanceCardProps) {
  return (
    <Card.Root>
      <Card.Header>
        <HStack justify="space-between">
          <VStack align="start" gap="1">
            <Text fontWeight="bold" fontSize="lg">
              {supplier.name}
            </Text>
            {supplier.contact_person && (
              <Text fontSize="sm" color="fg.muted">
                {supplier.contact_person}
              </Text>
            )}
          </VStack>

          <Badge colorPalette={getRatingColor(supplier.overallRating)} size="lg">
            {supplier.overallRating.toFixed(0)}/100
          </Badge>
        </HStack>
      </Card.Header>

      <Card.Body>
        <VStack align="stretch" gap="4">
          {/* Metrics Grid */}
          <SimpleGrid columns={2} gap="3">
            {/* Quality Score */}
            <MetricDisplay
              label="Calidad"
              value={`${supplier.metrics.qualityScore.toFixed(0)}/100`}
              icon={CheckBadgeIcon}
              color={getMetricColor(supplier.metrics.qualityScore)}
            />

            {/* On-Time Delivery */}
            <MetricDisplay
              label="Entregas a Tiempo"
              value={`${supplier.metrics.onTimeDeliveryRate.toFixed(0)}%`}
              icon={TruckIcon}
              color={getMetricColor(supplier.metrics.onTimeDeliveryRate)}
            />

            {/* Cost Stability */}
            <MetricDisplay
              label="Estabilidad Costos"
              value={`${supplier.metrics.costStability.toFixed(0)}/100`}
              icon={CurrencyDollarIcon}
              color={getMetricColor(supplier.metrics.costStability)}
            />

            {/* Average Lead Time */}
            <MetricDisplay
              label="Tiempo Entrega"
              value={`${supplier.metrics.averageLeadTime.toFixed(0)}d`}
              icon={ClockIcon}
              color={
                supplier.metrics.averageLeadTime <= 7
                  ? 'green'
                  : supplier.metrics.averageLeadTime <= 14
                  ? 'yellow'
                  : 'orange'
              }
            />
          </SimpleGrid>

          {/* Business Metrics */}
          <VStack align="stretch" gap="2">
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Valor Anual:
              </Text>
              <Text fontWeight="semibold">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  minimumFractionDigits: 0
                }).format(supplier.totalAnnualValue)}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Items Suministrados:
              </Text>
              <Text fontWeight="semibold">{supplier.itemCount}</Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.muted">
                Categoría:
              </Text>
              <Badge colorPalette={getRatingCategoryColor(supplier.ratingCategory)}>
                {getRatingCategoryLabel(supplier.ratingCategory)}
              </Badge>
            </HStack>
          </VStack>

          {/* Risk Level Badge */}
          {supplier.riskLevel !== 'low' && (
            <HStack>
              <ExclamationTriangleIcon width={16} height={16} />
              <Text fontSize="sm" fontWeight="semibold">
                Riesgo:{' '}
                <Badge colorPalette={getRiskColor(supplier.riskLevel)} size="sm">
                  {getRiskLabel(supplier.riskLevel)}
                </Badge>
              </Text>
            </HStack>
          )}

          {/* Actions */}
          <HStack gap="2" mt="2">
            <Button size="sm" variant="solid" flex={1} onClick={() => onViewDetails?.(supplier)}>
              Ver Detalles
            </Button>
            <Button
              size="sm"
              variant="outline"
              flex={1}
              onClick={() => onCreateOrder?.(supplier)}
            >
              Nueva Orden
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

/**
 * Metric Display Component
 */
interface MetricDisplayProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; width?: number; height?: number }>;
  color: string;
}

function MetricDisplay({ label, value, icon: Icon, color }: MetricDisplayProps) {
  return (
    <HStack gap="2">
      <Icon width={20} height={20} style={{ color: `var(--chakra-colors-${color}-500)` }} />
      <VStack align="start" gap="0">
        <Text fontSize="xs" color="fg.muted">
          {label}
        </Text>
        <Text fontWeight="semibold" fontSize="sm">
          {value}
        </Text>
      </VStack>
    </HStack>
  );
}

/**
 * Get color based on metric value (0-100 scale)
 */
function getMetricColor(value: number): string {
  if (value >= 85) return 'green';
  if (value >= 70) return 'blue';
  if (value >= 55) return 'yellow';
  if (value >= 40) return 'orange';
  return 'red';
}

/**
 * Get color based on overall rating
 */
function getRatingColor(rating: number): string {
  if (rating >= 85) return 'green';
  if (rating >= 70) return 'blue';
  if (rating >= 55) return 'yellow';
  if (rating >= 40) return 'orange';
  return 'red';
}

/**
 * Get color for rating category
 */
function getRatingCategoryColor(category: string): string {
  switch (category) {
    case 'excellent':
      return 'green';
    case 'good':
      return 'blue';
    case 'fair':
      return 'yellow';
    case 'poor':
      return 'orange';
    case 'critical':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Get label for rating category
 */
function getRatingCategoryLabel(category: string): string {
  switch (category) {
    case 'excellent':
      return 'Excelente';
    case 'good':
      return 'Bueno';
    case 'fair':
      return 'Regular';
    case 'poor':
      return 'Malo';
    case 'critical':
      return 'Crítico';
    default:
      return category;
  }
}

/**
 * Get color for risk level
 */
function getRiskColor(level: string): string {
  switch (level) {
    case 'low':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'orange';
    case 'critical':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Get label for risk level
 */
function getRiskLabel(level: string): string {
  switch (level) {
    case 'low':
      return 'Bajo';
    case 'medium':
      return 'Medio';
    case 'high':
      return 'Alto';
    case 'critical':
      return 'Crítico';
    default:
      return level;
  }
}
