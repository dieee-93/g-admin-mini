import {
  VStack,
  HStack,
  Text,
  Badge,
  Switch,
  IconButton,
} from '@chakra-ui/react';
import {
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CardWrapper } from '@/shared/ui';
import { type ReportAutomation } from '../types';

interface AutomationTabProps {
  automations: ReportAutomation[];
  toggleAutomation: (automationId: string) => void;
}

export function AutomationTab({ automations, toggleAutomation }: AutomationTabProps) {
  return (
    <VStack gap="4" align="stretch">
      {automations.map((automation) => (
        <CardWrapper key={automation.id} variant="outline">
          <CardWrapper.Body p="4">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="2" flex="1">
                <HStack gap="2">
                  <Text fontSize="md" fontWeight="bold">
                    {automation.name}
                  </Text>
                  <Switch.Root
                    checked={automation.isEnabled}
                    onCheckedChange={() => toggleAutomation(automation.id)}
                    colorPalette="green"
                    size="sm"
                  />
                </HStack>

                <Text fontSize="sm" color="gray.600" lineHeight={1.4}>
                  {automation.description}
                </Text>

                <HStack gap="4" fontSize="sm" color="gray.600">
                  <Text>Ejecutado: {automation.executionCount} veces</Text>
                  <Text>Éxito: {automation.successRate.toFixed(1)}%</Text>
                  {automation.lastExecuted && (
                    <Text>
                      Último: {new Date(automation.lastExecuted).toLocaleDateString()}
                    </Text>
                  )}
                </HStack>

                {/* Triggers */}
                <VStack align="start" gap="1">
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    Disparadores:
                  </Text>
                  <HStack gap="1" flexWrap="wrap">
                    {automation.triggers.map((trigger, index) => (
                      <Badge key={index} colorPalette="blue" size="xs">
                        {trigger.type === 'schedule' ? 'Programado' :
                         trigger.type === 'threshold' ? 'Umbral' :
                         trigger.type === 'data_change' ? 'Cambio de Datos' : 'Manual'}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>

                {/* Actions */}
                <VStack align="start" gap="1">
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    Acciones:
                  </Text>
                  <HStack gap="1" flexWrap="wrap">
                    {automation.actions.map((action, index) => (
                      <Badge key={index} colorPalette="green" size="xs">
                        {action.type === 'generate_report' ? 'Generar Reporte' :
                         action.type === 'send_email' ? 'Enviar Email' :
                         action.type === 'create_alert' ? 'Crear Alerta' : action.type}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              </VStack>

              <VStack gap="2">
                <IconButton size="sm" variant="outline">
                  <PencilIcon className="w-3 h-3" />
                </IconButton>

                <IconButton size="sm" variant="outline" colorPalette="red">
                  <TrashIcon className="w-3 h-3" />
                </IconButton>
              </VStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      ))}
    </VStack>
  );
}
