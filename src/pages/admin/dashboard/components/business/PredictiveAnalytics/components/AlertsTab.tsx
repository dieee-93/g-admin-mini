import { VStack, HStack, Text, Badge, Alert } from '@chakra-ui/react';
import { CardWrapper, Icon } from '@/shared/ui';
import { MaterialDemand } from '../types';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface AlertsTabProps {
  materials: MaterialDemand[];
}

export function AlertsTab({ materials }: AlertsTabProps) {
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  return (
    <VStack gap={4} align="stretch">
      {materials.filter(m => m.alerts.length > 0).length > 0 ? (
        materials.filter(m => m.alerts.length > 0).map((material) => (
          <CardWrapper key={material.materialId} variant="outline">
            <CardWrapper.Header>
              <HStack justify="space-between">
                <Text fontSize="md" fontWeight="bold">
                  {material.materialName}
                </Text>
                <Badge colorPalette="blue">
                  {material.alerts.length} alerta{material.alerts.length !== 1 ? 's' : ''}
                </Badge>
              </HStack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <VStack gap={3} align="stretch">
                {material.alerts.map((alert) => (
                  <Alert.Root
                    key={alert.id}
                    status={alert.severity === 'critical' ? 'error' : 'warning'}
                    variant="subtle"
                  >
                    <Alert.Indicator>
                      {alert.severity === 'critical' ?
                        <Icon icon={ExclamationTriangleIcon} size="md" /> :
                        <Icon icon={ClockIcon} size="md" />
                      }
                    </Alert.Indicator>
                    <VStack align="start" gap={1} flex="1">
                      <Alert.Title>
                        {alert.message}
                      </Alert.Title>
                      <Alert.Description>
                        {alert.recommendedAction}
                      </Alert.Description>
                      <HStack gap={4} fontSize="xs" color="gray.600">
                        <Text>Impacto estimado: ${alert.estimatedImpact}</Text>
                        <Text>En {alert.daysUntilEvent} día{alert.daysUntilEvent !== 1 ? 's' : ''}</Text>
                        <Badge colorPalette={getAlertColor(alert.severity)} size="xs">
                          {alert.severity}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Alert.Root>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        ))
      ) : (
        <CardWrapper variant="subtle">
          <CardWrapper.Body p={8} textAlign="center">
            <Icon icon={CheckCircleIcon} size="3xl" color="var(--chakra-colors-green-500)" style={{ margin: "0 auto 16px auto" }} />
            <Text fontSize="lg" fontWeight="medium" mb={2} color="green.600">
              No hay alertas activas
            </Text>
            <Text color="gray.600">
              Todos los materiales están dentro de los parámetros normales de predicción.
            </Text>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </VStack>
  );
}
