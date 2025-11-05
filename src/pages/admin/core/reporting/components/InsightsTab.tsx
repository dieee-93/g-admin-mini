import {
  VStack,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import { type ReportInsight, type ReportTemplate } from '../types';

interface InsightsTabProps {
  insights: ReportInsight[];
  templates: ReportTemplate[];
}

export function InsightsTab({ insights, templates }: InsightsTabProps) {
  return (
    <VStack gap="4" align="stretch">
      {insights.map((insight) => (
        <CardWrapper key={insight.id} variant="outline">
          <CardWrapper.Body p="4">
            <VStack align="stretch" gap="3">
              {/* Header */}
              <HStack justify="space-between">
                <HStack gap="2">
                  <Badge colorPalette="purple">
                    {insight.type === 'trend' ? 'Tendencia' :
                     insight.type === 'anomaly' ? 'Anomalía' :
                     insight.type === 'correlation' ? 'Correlación' :
                     insight.type === 'forecast' ? 'Pronóstico' : 'Recomendación'}
                  </Badge>
                  <Badge colorPalette={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'yellow' : 'green'}>
                    Impacto {insight.impact}
                  </Badge>
                  {insight.actionable && (
                    <Badge colorPalette="blue" size="sm">
                      Accionable
                    </Badge>
                  )}
                </HStack>

                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  {insight.confidence}% confianza
                </Text>
              </HStack>

              {/* Content */}
              <VStack align="start" gap="2">
                <Text fontSize="md" fontWeight="bold">
                  {insight.title}
                </Text>
                <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                  {insight.description}
                </Text>
              </VStack>

              {/* Meta */}
              <HStack justify="space-between" fontSize="xs" color="gray.500">
                <Text>
                  Generado: {new Date(insight.generatedAt).toLocaleString()}
                </Text>
                <Text>
                  Reporte: {templates.find(t => t.id === insight.reportId)?.name || 'Desconocido'}
                </Text>
              </HStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      ))}
    </VStack>
  );
}
