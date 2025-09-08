import { VStack, HStack, Text, Badge, Button } from '@chakra-ui/react';
import { CardWrapper, Icon } from '@/shared/ui';
import { MaterialDemand } from '../types';
import { BoltIcon } from '@heroicons/react/24/outline';

interface RecommendationsTabProps {
  materials: MaterialDemand[];
}

export function RecommendationsTab({ materials }: RecommendationsTabProps) {
  return (
    <VStack gap={4} align="stretch">
      {materials.map((material) => (
        <CardWrapper key={material.materialId} variant="outline">
          <CardWrapper.Header>
            <HStack justify="space-between">
              <Text fontSize="md" fontWeight="bold">
                {material.materialName}
              </Text>
              <Badge
                colorPalette={
                  material.prediction.recommendedAction.priority === 'urgent' ? 'red' :
                  material.prediction.recommendedAction.priority === 'high' ? 'orange' :
                  material.prediction.recommendedAction.priority === 'medium' ? 'yellow' : 'blue'
                }
              >
                {material.prediction.recommendedAction.priority}
              </Badge>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack gap={3} align="stretch">
              <HStack gap={4}>
                <Icon icon={BoltIcon} size="md" color="var(--chakra-colors-blue-500)" style={{ flexShrink: "0" }} />
                <VStack align="start" gap={1} flex="1">
                  <Text fontSize="sm" fontWeight="medium">
                    Acción Recomendada
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {material.prediction.recommendedAction.action === 'increase_order' ? 'Incrementar pedido' :
                     material.prediction.recommendedAction.action === 'decrease_order' ? 'Reducir pedido' :
                     material.prediction.recommendedAction.action === 'urgent_restock' ? 'Restock urgente' :
                     material.prediction.recommendedAction.action === 'reduce_inventory' ? 'Reducir inventario' :
                     'Mantener nivel actual'}
                  </Text>
                </VStack>
              </HStack>

              <Text fontSize="sm" color="gray.700">
                {material.prediction.recommendedAction.reasoning}
              </Text>

              {material.prediction.recommendedAction.suggestedQuantity && (
                <HStack justify="space-between" bg="blue.50" p={3} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    Cantidad Sugerida:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="blue.600">
                    {material.prediction.recommendedAction.suggestedQuantity} {material.unit}
                  </Text>
                </HStack>
              )}

              {material.prediction.recommendedAction.estimatedSavings && (
                <HStack justify="space-between"  p={3} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    Ahorro Estimado:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="green.600">
                    ${material.prediction.recommendedAction.estimatedSavings}
                  </Text>
                </HStack>
              )}

              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">
                  Riesgo: {material.prediction.recommendedAction.riskLevel}
                </Text>
                <Button size="sm" variant="outline" colorPalette="blue">
                  Aplicar Recomendación
                </Button>
              </HStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      ))}
    </VStack>
  );
}
