// src/features/inventory/components/AlertsTab.tsx
// Tab de alertas de stock - CORREGIDO

import  { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Select,
  createListCollection
} from '@chakra-ui/react';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { InputField, CardWrapper } from '@/shared/ui/';

interface AlertsTabProps {
  alerts: any[];
  alertSummary: any;
  onAddStock: (item: unknown) => void;
  loading: boolean;
}

const URGENCY_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las urgencias', value: 'all' },
    { label: 'Solo críticas', value: 'critical' },
    { label: 'Advertencias', value: 'warning' },
    { label: 'Informativas', value: 'info' }
  ]
});

export function AlertsTab({ alerts, alertSummary, onAddStock, loading }: AlertsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = alert.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUrgency = urgencyFilter === 'all' || alert.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  }, [alerts, searchTerm, urgencyFilter]);

  if (loading) {
    return (
      <VStack gap="4">
        <HStack gap="4" w="full">
          {['critical', 'warning', 'info'].map((type) => (
            <CardWrapper key={type} flex="1">
              <CardWrapper.Body p="4">
                <HStack gap="3">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  <VStack align="start" gap="0">
                    <Text fontSize="lg" fontWeight="bold">-</Text>
                    <Text fontSize="sm">Cargando...</Text>
                  </VStack>
                </HStack>
              </CardWrapper.Body>
            </CardWrapper>
          ))}
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Resumen de alertas */}
      <HStack gap="4">
        <CardWrapper flex="1" bg="red.50" borderColor="red.200">
          <CardWrapper.Body p="4">
            <HStack gap="3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              <VStack align="start" gap="0">
                <Text fontSize="lg" fontWeight="bold" color="red.600">
                  {alertSummary.critical}
                </Text>
                <Text fontSize="sm" color="red.600">Críticas</Text>
              </VStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper flex="1" bg="yellow.50" borderColor="yellow.200">
          <CardWrapper.Body p="4">
            <HStack gap="3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              <VStack align="start" gap="0">
                <Text fontSize="lg" fontWeight="bold" color="yellow.600">
                  {alertSummary.warning}
                </Text>
                <Text fontSize="sm" color="yellow.600">Advertencias</Text>
              </VStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper flex="1" bg="blue.50" borderColor="blue.200">
          <CardWrapper.Body p="4">
            <HStack gap="3">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-500" />
              <VStack align="start" gap="0">
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  {alertSummary.info}
                </Text>
                <Text fontSize="sm" color="blue.600">Informativas</Text>
              </VStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      </HStack>

      {/* Controles */}
      <HStack gap="4">
        <InputField
          placeholder="Buscar alertas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <Select.Root
          collection={URGENCY_FILTER_COLLECTION}
          value={urgencyFilter ? [urgencyFilter] : []}
          onValueChange={(details) => setUrgencyFilter(details.value[0] || 'all')}
          maxW="200px"
        >
          <Select.Trigger>
            <Select.ValueText placeholder="Filtrar por urgencia" />
          </Select.Trigger>
          <Select.Content>
            {URGENCY_FILTER_COLLECTION.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </HStack>

      {/* Lista de alertas */}
      {filteredAlerts.length === 0 ? (
        <CardWrapper>
          <CardWrapper.Body>
            <VStack gap="4" p="6" textAlign="center">
              <ExclamationTriangleIcon className="w-12 h-12 text-green-500" />
              <VStack gap="2">
                <Text fontSize="lg" fontWeight="medium" color="green.600">
                  ¡Todo está bajo control!
                </Text>
                <Text fontSize="sm" color="gray.600">
                  No hay alertas de stock en este momento
                </Text>
              </VStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      ) : (
        <VStack gap="3">
          {filteredAlerts.map((alert) => (
            <CardWrapper key={alert.id}>
              <CardWrapper.Body>
                <HStack justify="space-between" align="start">
                  <HStack gap="3">
                    <ExclamationTriangleIcon 
                      className={`w-5 h-5 ${
                        alert.urgency === 'critical' ? 'text-red-500' :
                        alert.urgency === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                      }`}
                    />
                    <VStack align="start" gap="1">
                      <Text fontWeight="medium">{alert.item_name}</Text>
                      <HStack gap="2">
                        <Text fontSize="sm" color="gray.600">
                          Stock actual: {alert.current_stock}
                        </Text>
                        <Text fontSize="sm" color="gray.600">•</Text>
                        <Text fontSize="sm" color="gray.600">
                          Mínimo: {alert.min_threshold}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  <HStack gap="2">
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="blue"
                      onClick={() => onAddStock(alert)}
                    >
                      Agregar Stock
                    </Button>
                  </HStack>
                </HStack>
              </CardWrapper.Body>
            </CardWrapper>
          ))}
        </VStack>
      )}
    </VStack>
  );
}