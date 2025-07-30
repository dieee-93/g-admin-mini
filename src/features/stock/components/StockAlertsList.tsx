import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
  Input,
  Select,
  Card,
  Progress,
  Skeleton,
  Tabs,
  createListCollection
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PlusIcon,
  CogIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useStockAlerts, type StockAlert } from '../logic/useStockAlerts';

interface StockAlertsListProps {
  onAddStock?: (alertId: string, itemName: string) => void;
  onConfigure?: (alertId: string) => void;
  onMarkOrdered?: (alertId: string) => void;
}

const urgencyOptions = createListCollection({
  items: [
    { label: 'Todas las alertas', value: 'all' },
    { label: 'Críticas', value: 'critical' },
    { label: 'Advertencias', value: 'warning' },
    { label: 'Informativas', value: 'info' }
  ]
});

export function StockAlertsList({ 
  onAddStock, 
  onConfigure, 
  onMarkOrdered 
}: StockAlertsListProps) {
  const { 
    alerts, 
    loading, 
    error, 
    getAlertsByUrgency, 
    acknowledgeAlert,
    refresh 
  } = useStockAlerts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'urgency'>('urgency');

  const alertsByUrgency = getAlertsByUrgency();

  // Filter and sort alerts
  const filteredAlerts = React.useMemo(() => {
    let filtered = alerts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by urgency
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(alert => alert.urgency === selectedUrgency);
    }

    // Sort alerts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item_name.localeCompare(b.item_name);
        case 'stock':
          return a.current_stock - b.current_stock;
        case 'urgency':
        default:
          const urgencyOrder = { critical: 0, warning: 1, info: 2 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
    });

    return filtered;
  }, [alerts, searchTerm, selectedUrgency, sortBy]);

  const handleAcknowledge = async (alertId: string) => {
    await acknowledgeAlert(alertId);
  };

  // Loading state
  if (loading) {
    return (
      <Box>
        <VStack gap="4">
          <Skeleton height="40px" width="100%" />
          <Skeleton height="80px" width="100%" />
          <Skeleton height="80px" width="100%" />
          <Skeleton height="80px" width="100%" />
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Card.Root>
        <Card.Body>
          <VStack gap="4" p="6" textAlign="center">
            <ExclamationCircleIcon className="w-12 h-12 text-red-500" />
            <VStack gap="2">
              <Text fontSize="lg" fontWeight="medium" color="red.600">
                Error al cargar alertas
              </Text>
              <Text fontSize="sm" color="gray.600">
                {error}
              </Text>
            </VStack>
            <Button colorPalette="blue" onClick={refresh}>
              Reintentar
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Box>
      {/* Header with controls */}
      <VStack gap="4" mb="6">
        {/* Search and filters */}
        <HStack gap="4" width="100%">
          <Box position="relative" flex="1">
            <Input
              placeholder="Buscar items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pl="10"
            />
            <Box position="absolute" left="3" top="50%" transform="translateY(-50%)">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            </Box>
          </Box>

          <Select.Root 
            collection={urgencyOptions}
            value={[selectedUrgency]}
            onValueChange={(details) => setSelectedUrgency(details.value[0] || 'all')}
            width="200px"
          >
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content>
              {urgencyOptions.items.map((option) => (
                <Select.Item key={option.value} item={option}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Button
            variant="outline"
            colorPalette="gray"
            onClick={refresh}
          >
            Actualizar
          </Button>
        </HStack>

        {/* Summary cards */}
        <HStack gap="4" width="100%">
          <Card.Root flex="1" bg="red.50" borderColor="red.200">
            <Card.Body p="4">
              <HStack gap="3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                <VStack align="start" gap="0">
                  <Text fontSize="lg" fontWeight="bold" color="red.600">
                    {alertsByUrgency.critical.length}
                  </Text>
                  <Text fontSize="sm" color="red.600">
                    Críticas
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

          <Card.Root flex="1" bg="yellow.50" borderColor="yellow.200">
            <Card.Body p="4">
              <HStack gap="3">
                <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />
                <VStack align="start" gap="0">
                  <Text fontSize="lg" fontWeight="bold" color="yellow.600">
                    {alertsByUrgency.warning.length}
                  </Text>
                  <Text fontSize="sm" color="yellow.600">
                    Advertencias
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>

          <Card.Root flex="1" bg="blue.50" borderColor="blue.200">
            <Card.Body p="4">
              <HStack gap="3">
                <InformationCircleIcon className="w-6 h-6 text-blue-500" />
                <VStack align="start" gap="0">
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    {alertsByUrgency.info.length}
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Informativas
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        </HStack>
      </VStack>

      {/* Alerts list */}
      {filteredAlerts.length === 0 ? (
        <Card.Root>
          <Card.Body>
            <VStack gap="4" p="6" textAlign="center">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
              <VStack gap="2">
                <Text fontSize="lg" fontWeight="medium" color="green.600">
                  {searchTerm || selectedUrgency !== 'all' ? 'No se encontraron alertas' : '¡Todo está bajo control!'}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {searchTerm || selectedUrgency !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda' 
                    : 'Todos los items tienen stock suficiente'
                  }
                </Text>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        <VStack gap="3">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAddStock={onAddStock}
              onConfigure={onConfigure}
              onMarkOrdered={onMarkOrdered}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
}

// Individual alert card component
interface AlertCardProps {
  alert: StockAlert;
  onAddStock?: (alertId: string, itemName: string) => void;
  onConfigure?: (alertId: string) => void;
  onMarkOrdered?: (alertId: string) => void;
  onAcknowledge?: (alertId: string) => void;
}

function AlertCard({ 
  alert, 
  onAddStock, 
  onConfigure, 
  onMarkOrdered, 
  onAcknowledge 
}: AlertCardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const stockPercentage = (alert.current_stock / alert.threshold) * 100;

  return (
    <Card.Root 
      borderLeft="4px solid" 
      borderLeftColor={`${getUrgencyColor(alert.urgency)}.400`}
      _hover={{ bg: 'gray.50' }}
    >
      <Card.Body p="4">
        <HStack justify="space-between" align="start">
          <HStack gap="4" flex="1">
            {/* Urgency indicator */}
            {getUrgencyIcon(alert.urgency)}

            {/* Item information */}
            <VStack align="start" gap="2" flex="1">
              <HStack justify="space-between" width="100%">
                <Text fontSize="md" fontWeight="semibold">
                  {alert.item_name}
                </Text>
                <Badge 
                  colorPalette={getUrgencyColor(alert.urgency)}
                  variant="outline"
                >
                  {alert.urgency === 'critical' ? 'CRÍTICO' : 
                   alert.urgency === 'warning' ? 'ADVERTENCIA' : 'INFO'}
                </Badge>
              </HStack>

              {/* Stock information */}
              <HStack gap="6" width="100%">
                <VStack align="start" gap="1">
                  <Text fontSize="sm" color="gray.600">
                    Stock actual
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color={`${getUrgencyColor(alert.urgency)}.600`}>
                    {alert.current_stock} {alert.unit}
                  </Text>
                </VStack>

                <VStack align="start" gap="1">
                  <Text fontSize="sm" color="gray.600">
                    Umbral mínimo
                  </Text>
                  <Text fontSize="md">
                    {alert.threshold} {alert.unit}
                  </Text>
                </VStack>

                {alert.days_remaining !== undefined && alert.days_remaining < 30 && (
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" color="gray.600">
                      Estimado
                    </Text>
                    <HStack gap="1">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <Text fontSize="md">
                        ~{alert.days_remaining} días
                      </Text>
                    </HStack>
                  </VStack>
                )}

                {alert.suggested_reorder && (
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" color="gray.600">
                      Recomendado
                    </Text>
                    <Text fontSize="md" fontWeight="medium" color="blue.600">
                      +{alert.suggested_reorder} {alert.unit}
                    </Text>
                  </VStack>
                )}
              </HStack>

              {/* Progress bar */}
              <Box width="100%">
                <Progress
                  value={Math.min(stockPercentage, 100)}
                  colorPalette={getUrgencyColor(alert.urgency)}
                  size="sm"
                />
                <Text fontSize="xs" color="gray.500" mt="1">
                  {stockPercentage.toFixed(1)}% del umbral mínimo
                </Text>
              </Box>
            </VStack>
          </HStack>

          {/* Action buttons */}
          <VStack gap="2">
            <Button
              size="sm"
              colorPalette="blue"
              variant="solid"
              onClick={() => onAddStock?.(alert.id, alert.item_name)}
            >
              <PlusIcon className="w-4 h-4" />
              Agregar Stock
            </Button>

            <HStack gap="2">
              <Button
                size="sm"
                variant="outline"
                colorPalette="gray"
                onClick={() => onMarkOrdered?.(alert.id)}
              >
                <CheckCircleIcon className="w-4 h-4" />
                Marcar Pedido
              </Button>

              <Button
                size="sm"
                variant="ghost"
                colorPalette="gray"
                onClick={() => onConfigure?.(alert.id)}
              >
                <CogIcon className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                colorPalette="gray"
                onClick={() => onAcknowledge?.(alert.id)}
              >
                Revisar
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}