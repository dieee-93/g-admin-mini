// 📁 EJEMPLO DE USO: src/features/items/ui/StockAlertsCard.tsx - COMPONENTE DE PRUEBA
import {
  Card,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Alert,
  Skeleton
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useStockAlerts } from '../logic/useStockAlerts';

interface StockAlertsCardProps {
  threshold?: number;
  maxItems?: number;
}

export function StockAlertsCard({ threshold = 10, maxItems = 5 }: StockAlertsCardProps) {
  const { 
    alerts, 
    summary, 
    loading, 
    error, 
    refreshAlerts,
    hasAlerts,
    hasCriticalAlerts
  } = useStockAlerts(threshold);

  if (loading) {
    return (
      <Card.Root>
        <Card.Header>
          <HStack>
            <ExclamationTriangleIcon className="w-5 h-5 text-orange.500" />
            <Card.Title>Alertas de Stock</Card.Title>
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack gap="3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height="60px" borderRadius="md" />
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  if (error) {
    return (
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <HStack>
              <ExclamationTriangleIcon className="w-5 h-5 text-red.500" />
              <Card.Title>Alertas de Stock</Card.Title>
            </HStack>
            <Button size="sm" variant="outline" onClick={refreshAlerts}>
              <ArrowPathIcon className="w-4 h-4" />
              Reintentar
            </Button>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Error al cargar alertas</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!hasAlerts) {
    return (
      <Card.Root>
        <Card.Header>
          <HStack>
            <ExclamationTriangleIcon className="w-5 h-5 text-green.500" />
            <Card.Title>Alertas de Stock</Card.Title>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Alert.Root status="success">
            <Alert.Indicator />
            <Alert.Title>Todo está en orden</Alert.Title>
            <Alert.Description>
              No hay productos con stock bajo (umbral: {threshold} unidades)
            </Alert.Description>
          </Alert.Root>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <HStack justify="space-between">
          <HStack>
            <ExclamationTriangleIcon 
              className={`w-5 h-5 ${
                hasCriticalAlerts ? 'text-red.500' : 'text-orange.500'
              }`} 
            />
            <Card.Title>Alertas de Stock</Card.Title>
            <Badge colorPalette="red" size="sm">{summary.total_alerts}</Badge>
          </HStack>
          
          <Button size="sm" variant="outline" onClick={refreshAlerts}>
            <ArrowPathIcon className="w-4 h-4" />
          </Button>
        </HStack>
      </Card.Header>

      <Card.Body>
        <VStack gap="3">
          {/* Resumen */}
          <HStack justify="space-between" width="full" p="3" bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">
              {summary.critical_alerts} críticas, {summary.high_alerts} altas
            </Text>
            {summary.total_estimated_cost > 0 && (
              <Text fontSize="sm" fontWeight="bold" color="blue.600">
                ${summary.total_estimated_cost.toFixed(2)}
              </Text>
            )}
          </HStack>

          {/* Lista de alertas */}
          {alerts.slice(0, maxItems).map((alert) => (
            <HStack
              key={alert.item_id}
              justify="space-between"
              p="3"
              borderRadius="md"
              bg={alert.urgency_level === 'CRITICO' ? 'red.50' : 'orange.50'}
              border="1px solid"
              borderColor={alert.urgency_level === 'CRITICO' ? 'red.200' : 'orange.200'}
              width="full"
            >
              <VStack align="start" gap="1">
                <Text fontSize="sm" fontWeight="medium">
                  {alert.item_name}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Stock: {alert.current_stock} {alert.unit}
                </Text>
              </VStack>
              
              <Badge 
                colorPalette={alert.urgency_level === 'CRITICO' ? 'red' : 'orange'} 
                size="sm"
              >
                {alert.urgency_level}
              </Badge>
            </HStack>
          ))}

          {alerts.length > maxItems && (
            <Text fontSize="sm" color="gray.500" textAlign="center">
              ... y {alerts.length - maxItems} alertas más
            </Text>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}