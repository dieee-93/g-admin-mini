import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Card,
  Table,
  Badge
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useStockAlerts } from '../logic/useStockAlerts';
import { createListCollection } from "@chakra-ui/react";

const URGENCY_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las urgencias', value: 'all' },
    { label: 'Solo críticas', value: 'CRITICO' },
    { label: 'Críticas y altas', value: 'urgent' },
    { label: 'Medias y bajas', value: 'low' },
  ],
});

export function StockAlertsPage() {
  const [threshold, setThreshold] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  
  const {
    alerts,
    summary,
    loading,
    error,
    refreshAlerts,
    hasAlerts
  } = useStockAlerts(threshold);

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesUrgency = true;
    if (urgencyFilter === 'CRITICO') {
      matchesUrgency = alert.urgency_level === 'CRITICO';
    } else if (urgencyFilter === 'urgent') {
      matchesUrgency = alert.urgency_level === 'CRITICO' || alert.urgency_level === 'ALTO';
    } else if (urgencyFilter === 'low') {
      matchesUrgency = alert.urgency_level === 'MEDIO' || alert.urgency_level === 'BAJO';
    }
    
    return matchesSearch && matchesUrgency;
  });

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack>
            <ExclamationTriangleIcon className="w-6 h-6 text-orange.500" />
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Alertas de Stock
            </Text>
            {hasAlerts && (
              <Badge colorPalette="orange" size="lg">{summary.total_alerts}</Badge>
            )}
          </HStack>
          
          <Button
            colorPalette="blue"
            onClick={refreshAlerts}
            loading={loading}
          >
            <ArrowPathIcon className="w-4 h-4" />
            Actualizar
          </Button>
        </HStack>

        {/* Controles y filtros */}
        <Card.Root>
          <Card.Body>
            <HStack gap="4" wrap="wrap">
              <VStack align="start" gap="1">
                <Text fontSize="sm" fontWeight="medium">Umbral de stock</Text>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  width="100px"
                  min="1"
                  max="100"
                />
              </VStack>
              
              <VStack align="start" gap="1" flex="1" minW="200px">
                <Text fontSize="sm" fontWeight="medium">Buscar producto</Text>
                <HStack>
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray.400" />
                  <Input
                    placeholder="Nombre del producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </HStack>
              </VStack>
              
              <VStack align="start" gap="1">
                <Text fontSize="sm" fontWeight="medium">Filtrar por urgencia</Text>
                <Select.Root
                  collection={URGENCY_FILTER_COLLECTION}
                  value={[urgencyFilter]}
                  onValueChange={(details) => setUrgencyFilter(details.value[0])}
                  width="200px"
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Filtrar..." />
                  </Select.Trigger>
                  <Select.Content>
                    {URGENCY_FILTER_COLLECTION.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Tabla de alertas */}
        <Card.Root>
          <Card.Body>
            {filteredAlerts.length === 0 ? (
              <Box textAlign="center" py="8">
                <Text color="gray.500">
                  {searchTerm || urgencyFilter !== 'all' 
                    ? 'No se encontraron alertas con los filtros aplicados'
                    : 'No hay alertas de stock en este momento'
                  }
                </Text>
              </Box>
            ) : (
              <Table.Root size="sm" variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Producto</Table.ColumnHeader>
                    <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                    <Table.ColumnHeader>Stock Actual</Table.ColumnHeader>
                    <Table.ColumnHeader>Urgencia</Table.ColumnHeader>
                    <Table.ColumnHeader>Sugerido</Table.ColumnHeader>
                    <Table.ColumnHeader>Costo Est.</Table.ColumnHeader>
                    <Table.ColumnHeader>Último Ingreso</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredAlerts.map((alert) => (
                    <Table.Row key={alert.item_id}>
                      <Table.Cell>
                        <Text fontWeight="medium">{alert.item_name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge size="sm" colorPalette="gray">
                          {alert.item_type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>
                          {alert.current_stock} {alert.unit}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          size="sm" 
                          colorPalette={
                            alert.urgency_level === 'CRITICO' ? 'red' :
                            alert.urgency_level === 'ALTO' ? 'orange' :
                            alert.urgency_level === 'MEDIO' ? 'yellow' : 'blue'
                          }
                        >
                          {alert.urgency_level}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>
                          {alert.suggested_order_quantity} {alert.unit}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {alert.estimated_cost ? (
                          <Text fontWeight="medium" color="blue.600">
                            ${alert.estimated_cost.toFixed(2)}
                          </Text>
                        ) : (
                          <Text color="gray.400">-</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {alert.last_stock_entry_date ? (
                          <VStack align="start" gap="0">
                            <Text fontSize="sm">
                              {new Date(alert.last_stock_entry_date).toLocaleDateString()}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              hace {alert.days_since_last_entry} días
                            </Text>
                          </VStack>
                        ) : (
                          <Text color="gray.400">Nunca</Text>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}