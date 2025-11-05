// ============================================
// STRATEGIC RECOMMENDATIONS
// ============================================
// Displays strategic recommendations from supplier analysis engine

import { VStack, Text, Card, HStack, Badge, Stack, Alert } from '@/shared/ui';
import type { SupplierAnalysisResult } from '@/pages/admin/supply-chain/materials/services/supplierAnalysisEngine';
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';

interface StrategicRecommendationsProps {
  recommendations: SupplierAnalysisResult['strategicRecommendations'];
}

/**
 * Strategic Recommendations Component
 * Shows strategic recommendations from the analysis engine
 */
export function StrategicRecommendations({
  recommendations
}: StrategicRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <VStack align="stretch" gap="4">
        <Text fontSize="xl" fontWeight="bold">
          Recomendaciones Estratégicas
        </Text>
        <Alert status="success" title="Portfolio optimizado">
          No se identificaron acciones estratégicas urgentes. Mantén el monitoreo continuo del desempeño.
        </Alert>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap="4">
      <Text fontSize="xl" fontWeight="bold">
        Recomendaciones Estratégicas
      </Text>

      <Stack direction="column" gap="3">
        {recommendations.map(rec => (
          <Card.Root key={rec.id}>
            <Card.Header>
              <HStack justify="space-between">
                <HStack>
                  {getRecommendationIcon(rec.type)}
                  <Text fontWeight="bold">{rec.title}</Text>
                </HStack>

                <Badge colorPalette={getPriorityColor(rec.priority)} size="lg">
                  {getPriorityLabel(rec.priority)}
                </Badge>
              </HStack>
            </Card.Header>

            <Card.Body>
              <VStack align="stretch" gap="3">
                {/* Description */}
                <Text>{rec.description}</Text>

                {/* Expected Impact */}
                {rec.impact > 0 && (
                  <HStack>
                    <ArrowTrendingUpIcon width={16} height={16} />
                    <Text fontSize="sm" fontWeight="semibold">
                      Impacto esperado:
                    </Text>
                    <Badge colorPalette="green">
                      {rec.impact.toFixed(0)}% mejora
                    </Badge>
                  </HStack>
                )}

                {/* Timeframe */}
                {rec.timeframe && (
                  <HStack>
                    <Text fontSize="sm" color="fg.muted">
                      Plazo: {rec.timeframe}
                    </Text>
                  </HStack>
                )}

                {/* Type Badge */}
                <HStack>
                  <Badge colorPalette={getTypeColor(rec.type)} size="sm">
                    {getTypeLabel(rec.type)}
                  </Badge>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>
    </VStack>
  );
}

/**
 * Get icon component for recommendation type
 */
function getRecommendationIcon(type: string) {
  const iconProps = { width: 20, height: 20 };

  switch (type) {
    case 'diversification':
      return <ChartBarSquareIcon {...iconProps} />;
    case 'consolidation':
      return <ArrowsRightLeftIcon {...iconProps} />;
    case 'upgrade':
      return <ArrowTrendingUpIcon {...iconProps} />;
    case 'risk_mitigation':
      return <ShieldCheckIcon {...iconProps} />;
    default:
      return <LightBulbIcon {...iconProps} />;
  }
}

/**
 * Get color for priority
 */
function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Get label for priority
 */
function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high':
      return 'Prioridad Alta';
    case 'medium':
      return 'Prioridad Media';
    case 'low':
      return 'Prioridad Baja';
    default:
      return priority;
  }
}

/**
 * Get color for recommendation type
 */
function getTypeColor(type: string): string {
  switch (type) {
    case 'diversification':
      return 'purple';
    case 'consolidation':
      return 'blue';
    case 'upgrade':
      return 'green';
    case 'risk_mitigation':
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Get label for recommendation type
 */
function getTypeLabel(type: string): string {
  switch (type) {
    case 'diversification':
      return 'Diversificación';
    case 'consolidation':
      return 'Consolidación';
    case 'upgrade':
      return 'Mejora';
    case 'risk_mitigation':
      return 'Mitigación de Riesgo';
    default:
      return type;
  }
}
