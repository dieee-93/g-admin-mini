import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Card,
  Progress,
  Skeleton
} from '@chakra-ui/react';
import { 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useStockAlerts } from '../logic/useStockAlerts';

interface StockAlertsWidgetProps {
  onViewAll?: () => void;
  onQuickAction?: (alertId: string, action: 'add_stock' | 'mark_ordered') => void;
  maxItems?: number;
}

export function StockAlertsWidget({ 
  onViewAll, 
  onQuickAction,
  maxItems = 5 
}: StockAlertsWidgetProps) {
  const { 
    alerts, 
    loading, 
    error, 
    getAlertsByUrgency, 
    getTotalAlertCount,
    getCriticalAlertCount 
  } = useStockAlerts();

  const alertsByUrgency = getAlertsByUrgency();
  const displayAlerts = alerts.slice(0, maxItems);
  const totalCount = getTotalAlertCount();
  const criticalCount = getCriticalAlertCount();

  // Loading state
  if (loading) {
    return (
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Alertas de Stock
            </Text>
            <Skeleton height="24px" width="60px" />
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack gap="3">
            <Skeleton height="60px" width="100%" />
            <Skeleton height="60px" width="100%" />
            <Skeleton height="60px" width="100%" />
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  // Error state
  if (error) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">
            Alertas de Stock
          </Text>
        </Card.Header>
        <Card.Body>
          <HStack gap="3" p="4" bg="red.50" borderRadius="md">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            <Text color="red.600" fontSize="sm">
              Error al cargar alertas: {error}
            </Text>
          </HStack>
        </Card.Body>
      </Card.Root>
    );
  }

  // Empty state
  if (totalCount === 0) {
    return (
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Alertas de Stock
            </Text>
            <Badge colorPalette="green" variant="solid">
              Todo OK
            </Badge>
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack gap="4" p="6" textAlign="center">
            <InformationCircleIcon className="w-12 h-12 text-green-500" />
            <VStack gap="1">
              <Text fontSize="md" fontWeight="medium" color="green.600">
                ¡Excelente!
              </Text>
              <Text fontSize="sm" color="gray.600">
                Todos los items tienen stock suficiente
              </Text>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <HStack justify="space-between">
          <HStack gap="3">
            <Text fontSize="lg" fontWeight="semibold">
              Alertas de Stock
            </Text>
            {criticalCount > 0 && (
              <Badge colorPalette="red" variant="solid">
                {criticalCount} críticas
              </Badge>
            )}
          </HStack>
          <HStack gap="2">
            <Badge colorPalette="gray" variant="outline">
              {totalCount} total
            </Badge>
            {onViewAll && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onViewAll}
                p="2"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            )}
          </HStack>
        </HStack>
      </Card.Header>

      <Card.Body p="0">
        <VStack gap="0">
          {displayAlerts.map((alert, index) => (
            <Box
              key={alert.id}
              p="4"
              borderBottom={index < displayAlerts.length - 1 ? "1px solid" : "none"}
              borderColor="gray.100"
              width="100%"
              _hover={{ bg: "gray.50" }}
            >
              <HStack justify="space-between" align="start">
                <HStack gap="3" flex="1">
                  {/* Urgency Icon */}
                  {alert.urgency === 'critical' && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  {alert.urgency === 'warning' && (
                    <ExclamationCircleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                  {alert.urgency === 'info' && (
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}

                  {/* Item Info */}
                  <VStack align="start" gap="1" flex="1">
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="sm" fontWeight="medium">
                        {alert.item_name}
                      </Text>
                      <Badge 
                        colorPalette={
                          alert.urgency === 'critical' ? 'red' : 
                          alert.urgency === 'warning' ? 'yellow' : 'blue'
                        }
                        variant="subtle"
                        size="sm"
                      >
                        {alert.current_stock} {alert.unit}
                      </Badge>
                    </HStack>

                    {/* Stock Progress Bar */}
                    <Box width="100%">
                      <Progress
                        value={(alert.current_stock / alert.threshold) * 100}
                        colorPalette={
                          alert.urgency === 'critical' ? 'red' : 
                          alert.urgency === 'warning' ? 'yellow' : 'blue'
                        }
                        size="sm"
                      />
                    </Box>

                    {/* Days Remaining */}
                    {alert.days_remaining !== undefined && alert.days_remaining < 30 && (
                      <Text fontSize="xs" color="gray.600">
                        ~{alert.days_remaining} días restantes
                      </Text>
                    )}
                  </VStack>
                </HStack>

                {/* Quick Action Button */}
                <Button
                  size="sm"
                  colorPalette="blue"
                  variant="outline"
                  onClick={() => onQuickAction?.(alert.id, 'add_stock')}
                  ml="2"
                >
                  <PlusIcon className="w-3 h-3" />
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Card.Body>

      {/* Footer with summary */}
      {totalCount > maxItems && (
        <Card.Footer p="3" bg="gray.50">
          <HStack justify="center" width="100%">
            <Button 
              size="sm" 
              variant="ghost" 
              colorPalette="gray"
              onClick={onViewAll}
            >
              Ver {totalCount - maxItems} alertas más
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </HStack>
        </Card.Footer>
      )}
    </Card.Root>
  );
}