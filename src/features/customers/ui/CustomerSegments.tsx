// src/features/customers/ui/CustomerSegments.tsx
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Badge,
  Table,
  Progress,
  Input,
  Select
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useCustomers } from '../logic/useCustomers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { CustomerWithStats } from '../types';

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  color: string;
  filter: (customer: CustomerWithStats) => boolean;
  customers: CustomerWithStats[];
}

export function CustomerSegments() {
  const { customersWithStats, loading } = useCustomers();
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Definir segmentos predefinidos
  const segments: CustomerSegment[] = useMemo(() => {
    const segmentDefinitions = [
      {
        id: 'all',
        name: 'Todos los Clientes',
        description: 'Todos los clientes registrados',
        color: 'gray',
        filter: () => true
      },
      {
        id: 'new',
        name: 'Clientes Nuevos',
        description: 'Sin compras realizadas',
        color: 'blue',
        filter: (customer: CustomerWithStats) => !customer.stats || customer.stats.purchase_count === 0
      },
      {
        id: 'first-time',
        name: 'Primera Compra',
        description: 'Realizaron solo 1 compra',
        color: 'green',
        filter: (customer: CustomerWithStats) => customer.stats?.purchase_count === 1
      },
      {
        id: 'repeat',
        name: 'Clientes Recurrentes',
        description: '2-4 compras realizadas',
        color: 'orange',
        filter: (customer: CustomerWithStats) => {
          const count = customer.stats?.purchase_count || 0;
          return count >= 2 && count <= 4;
        }
      },
      {
        id: 'loyal',
        name: 'Clientes Leales',
        description: '5 o más compras',
        color: 'purple',
        filter: (customer: CustomerWithStats) => (customer.stats?.purchase_count || 0) >= 5
      },
      {
        id: 'high-value',
        name: 'Alto Valor',
        description: 'Más de $500 en compras',
        color: 'pink',
        filter: (customer: CustomerWithStats) => (customer.stats?.total_spent || 0) > 500
      },
      {
        id: 'inactive',
        name: 'Inactivos',
        description: 'Sin compras en los últimos 60 días',
        color: 'red',
        filter: (customer: CustomerWithStats) => {
          if (!customer.stats?.last_purchase_date) return true;
          const lastPurchase = new Date(customer.stats.last_purchase_date);
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          return lastPurchase < sixtyDaysAgo;
        }
      }
    ];

    return segmentDefinitions.map(def => ({
      ...def,
      customers: customersWithStats.filter(def.filter)
    }));
  }, [customersWithStats]);

  // Filtrar por término de búsqueda
  const filteredCustomers = useMemo(() => {
    const segment = segments.find(s => s.id === selectedSegment);
    if (!segment) return [];

    if (!searchTerm) return segment.customers;

    return segment.customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  }, [segments, selectedSegment, searchTerm]);

  if (loading) {
    return <LoadingSpinner message="Cargando segmentos..." />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const selectedSegmentData = segments.find(s => s.id === selectedSegment);

  return (
    <VStack gap="6" align="stretch">
      {/* Resumen de segmentos */}
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="bold">Resumen de Segmentos</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="3" align="stretch">
            {segments.slice(1).map((segment) => (
              <Box key={segment.id}>
                <HStack justify="space-between" mb="2">
                  <HStack>
                    <Badge colorScheme={segment.color} cursor="pointer" onClick={() => setSelectedSegment(segment.id)}>
                      {segment.name}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {segment.description}
                    </Text>
                  </HStack>
                  <Text fontWeight="medium">{segment.customers.length}</Text>
                </HStack>
                <Progress
                  value={customersWithStats.length > 0 ? (segment.customers.length / customersWithStats.length) * 100 : 0}
                  colorScheme={segment.color}
                  size="sm"
                />
              </Box>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Filtros y búsqueda */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between" flexWrap="wrap" gap="4">
            <Text fontSize="lg" fontWeight="bold">
              {selectedSegmentData?.name}
              <Badge colorScheme={selectedSegmentData?.color} ml="2">
                {filteredCustomers.length}
              </Badge>
            </Text>

            <HStack gap="3">
              <Select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                minWidth="200px"
              >
                {segments.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({segment.customers.length})
                  </option>
                ))}
              </Select>

              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxWidth="200px"
              />
            </HStack>
          </HStack>
        </Card.Header>

        <Card.Body>
          {filteredCustomers.length === 0 ? (
            <Box textAlign="center" py="8" color="gray.500">
              <Text>No se encontraron clientes en este segmento</Text>
              <Text fontSize="sm" mt="2">
                {searchTerm ? 'Prueba ajustando el término de búsqueda' : 'Este segmento está vacío'}
              </Text>
            </Box>
          ) : (
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Cliente</Table.ColumnHeader>
                  <Table.ColumnHeader>Contacto</Table.ColumnHeader>
                  <Table.ColumnHeader>Compras</Table.ColumnHeader>
                  <Table.ColumnHeader>Total Gastado</Table.ColumnHeader>
                  <Table.ColumnHeader>Última Compra</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredCustomers.map((customer) => (
                  <Table.Row key={customer.id}>
                    <Table.Cell>
                      <VStack align="start" gap="1">
                        <Text fontWeight="medium">{customer.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          Cliente desde {formatDate(customer.created_at)}
                        </Text>
                      </VStack>
                    </Table.Cell>

                    <Table.Cell>
                      <VStack align="start" gap="1">
                        {customer.phone && (
                          <Text fontSize="sm">📞 {customer.phone}</Text>
                        )}
                        {customer.email && (
                          <Text fontSize="sm">✉️ {customer.email}</Text>
                        )}
                        {!customer.phone && !customer.email && (
                          <Text fontSize="sm" color="gray.400">Sin contacto</Text>
                        )}
                      </VStack>
                    </Table.Cell>

                    <Table.Cell>
                      <VStack align="start" gap="0">
                        <Text fontWeight="medium">
                          {customer.stats?.purchase_count || 0}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          compras
                        </Text>
                      </VStack>
                    </Table.Cell>

                    <Table.Cell>
                      <VStack align="start" gap="0">
                        <Text fontWeight="medium" color="green.600">
                          {formatCurrency(customer.stats?.total_spent || 0)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          total
                        </Text>
                      </VStack>
                    </Table.Cell>

                    <Table.Cell>
                      <Text fontSize="sm">
                        {formatDate(customer.stats?.last_purchase_date)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}