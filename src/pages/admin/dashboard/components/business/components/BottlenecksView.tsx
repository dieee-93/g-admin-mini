// BottlenecksView.tsx - Business bottlenecks analysis component
import {
  VStack,
  HStack,
  Text,
  Card,
  Badge,
  SimpleGrid,
  Box
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface BottleneckRecommendation {
  action: string;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  expectedImprovement: number;
  cost: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface BusinessBottleneck {
  id: string;
  name: string;
  type: 'capacity' | 'process' | 'resource' | 'information' | 'quality';
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedModules: string[];
  rootCause: string;
  symptoms: string[];
  estimatedImpact: {
    financial: number;
    operational: number;
    customer: number;
  };
  recommendations: BottleneckRecommendation[];
  detectedAt: string;
  priority: number;
}

interface BottlenecksViewProps {
  bottlenecks: BusinessBottleneck[];
}

export function BottlenecksView({ bottlenecks }: BottlenecksViewProps) {
  const getBottleneckColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  return (
    <VStack gap={4} align="stretch">
      {bottlenecks.map((bottleneck) => (
        <Card.Root key={bottleneck.id} variant="outline">
          <Card.Header>
            <HStack justify="space-between">
              <HStack gap={3}>
                <Box p={2} bg={`${getBottleneckColor(bottleneck.severity)}.100`} borderRadius="md">
                  <ExclamationTriangleIcon className={`w-5 h-5 text-${getBottleneckColor(bottleneck.severity)}-600`} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="lg" fontWeight="bold">{bottleneck.name}</Text>
                  <HStack gap={2}>
                    <Badge colorPalette={getBottleneckColor(bottleneck.severity)}>
                      {bottleneck.severity}
                    </Badge>
                    <Badge colorPalette="gray" size="sm">
                      {bottleneck.type}
                    </Badge>
                    <Badge colorPalette="blue" size="sm">
                      Prioridad: {bottleneck.priority}/10
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
            </HStack>
          </Card.Header>
          
          <Card.Body>
            <VStack gap={4} align="stretch">
              {/* Description */}
              <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                <Text as="span" fontWeight="medium">Causa raíz:</Text> {bottleneck.rootCause}
              </Text>

              {/* Symptoms */}
              <VStack gap={2} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Síntomas detectados:</Text>
                <VStack gap={1} align="stretch" pl={3}>
                  {bottleneck.symptoms.map((symptom, index) => (
                    <HStack key={index} gap={2}>
                      <Box w="4px" h="4px" bg="red.400" borderRadius="full" mt={1} />
                      <Text fontSize="sm" color="gray.600">{symptom}</Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>

              {/* Impact */}
              <SimpleGrid columns={3} gap={4} bg="bg.canvas" p={3} borderRadius="md">
                <VStack>
                  <Text fontSize="xs" color="gray.600">Impacto Financiero</Text>
                  <Text fontSize="sm" fontWeight="bold" color="red.600">
                    ${Math.abs(bottleneck.estimatedImpact.financial)}
                  </Text>
                </VStack>
                <VStack>
                  <Text fontSize="xs" color="gray.600">Pérdida Operacional</Text>
                  <Text fontSize="sm" fontWeight="bold" color="orange.600">
                    -{Math.abs(bottleneck.estimatedImpact.operational)}%
                  </Text>
                </VStack>
                <VStack>
                  <Text fontSize="xs" color="gray.600">Impacto Cliente</Text>
                  <Text fontSize="sm" fontWeight="bold" color="yellow.600">
                    -{Math.abs(bottleneck.estimatedImpact.customer)}%
                  </Text>
                </VStack>
              </SimpleGrid>

              {/* Affected Modules */}
              <HStack gap={2} align="center">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Módulos afectados:</Text>
                <HStack gap={1}>
                  {bottleneck.affectedModules.map((moduleId, index) => (
                    <Badge key={index} colorPalette="blue" size="sm">
                      {moduleId}
                    </Badge>
                  ))}
                </HStack>
              </HStack>

              {/* Recommendations */}
              <VStack gap={2} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Recomendaciones:</Text>
                <VStack gap={2} align="stretch">
                  {bottleneck.recommendations.map((rec, index) => (
                    <Card.Root key={index} variant="subtle" size="sm">
                      <Card.Body p={3}>
                        <VStack gap={2} align="stretch">
                          <Text fontSize="sm" fontWeight="medium">{rec.action}</Text>
                          <HStack gap={4} fontSize="xs" color="gray.600">
                            <Text>Esfuerzo: {rec.effort}</Text>
                            <Text>Tiempo: {rec.timeframe}</Text>
                            <Text>Mejora: +{rec.expectedImprovement}%</Text>
                            <Text>Costo: ${rec.cost}</Text>
                            <Badge colorPalette={rec.riskLevel === 'low' ? 'green' : rec.riskLevel === 'medium' ? 'yellow' : 'red'} size="xs">
                              Riesgo {rec.riskLevel}
                            </Badge>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
}

export default BottlenecksView;