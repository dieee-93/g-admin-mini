// src/features/customers/ui/CustomerOrdersHistory.tsx
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Input,
  Select,
  Button,
  Card,
  Table
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { fetchSales } from '@/features/sales/data/saleApi';
import { useCustomers } from '../logic/useCustomers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Sale } from '@/features/sales/types';

export function CustomerOrdersHistory() {
  const { customers } = useCustomers();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const filters = selectedCustomer ? { customerId: selectedCustomer } : {};
        if (dateFilter) {
          const date = new Date(dateFilter);
          date.setDate(date.getDate() + 1);
          filters.dateFrom = dateFilter;
          filters.dateTo = date.toISOString().split('T')[0];
        }
        
        const data = await fetchSales(filters);
        setSales(data);
      } catch (error) {
        console.error('Error loading sales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [selectedCustomer, dateFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner message="Cargando historial de pedidos..." />;

  return (
    <VStack gap="6" align="stretch">
      {/* Filtros */}
      <Card.Root>
        <Card.Header>
          <Text fontSize="md" fontWeight="bold">Filtros de Búsqueda</Text>
        </Card.Header>
        <Card.Body>
          <HStack gap="4" flexWrap="wrap">
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Cliente</Text>
              <Select
                placeholder="Todos los clientes"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                minWidth="200px"
              >
                {customers?.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                )) || []}
              </Select>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Fecha</Text>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                maxWidth="160px"
              />
            </Box>

            <Box pt="6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedCustomer('');
                  setDateFilter('');
                }}
              >
                Limpiar Filtros
              </Button>
            </Box>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Resumen */}
      <HStack gap="4">
        <Card.Root flex="1">
          <Card.Body textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {sales.length}
            </Text>
            <Text fontSize="sm" color="gray.600">Total Pedidos</Text>
          </Card.Body>
        </Card.Root>

        <Card.Root flex="1">
          <Card.Body textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0))}
            </Text>
            <Text fontSize="sm" color="gray.600">Revenue Total</Text>
          </Card.Body>
        </Card.Root>

        <Card.Root flex="1">
          <Card.Body textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="purple.500">
              {sales.length > 0 ? formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length) : '$0'}
            </Text>
            <Text fontSize="sm" color="gray.600">Ticket Promedio</Text>
          </Card.Body>
        </Card.Root>
      </HStack>

      {/* Lista de pedidos */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">
              Historial de Pedidos
              {selectedCustomer && (
                <Badge colorScheme="blue" ml="2">
                  {customers?.find(c => c.id === selectedCustomer)?.name}
                </Badge>
              )}
            </Text>
            <Badge variant="outline">
              {sales.length} pedidos
            </Badge>
          </HStack>
        </Card.Header>

        <Card.Body>
          {sales.length === 0 ? (
            <Box p={8} textAlign="center" color="gray.500">
              <Text>No se encontraron pedidos</Text>
              <Text fontSize="sm" mt={2}>
                {selectedCustomer || dateFilter ? 'Prueba ajustando los filtros' : 'Aún no hay ventas registradas'}
              </Text>
            </Box>
          ) : (
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                  <Table.ColumnHeader>Cliente</Table.ColumnHeader>
                  <Table.ColumnHeader>Items</Table.ColumnHeader>
                  <Table.ColumnHeader>Total</Table.ColumnHeader>
                  <Table.ColumnHeader>Notas</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sales.map((sale) => (
                  <Table.Row key={sale.id}>
                    <Table.Cell>
                      <Text fontSize="sm">
                        {formatDate(sale.created_at)}
                      </Text>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <VStack align="start" gap="0">
                        <Text fontWeight="medium">
                          {sale.customer?.name || 'Cliente sin nombre'}
                        </Text>
                        {sale.customer?.phone && (
                          <Text fontSize="xs" color="gray.500">
                            📞 {sale.customer.phone}
                          </Text>
                        )}
                      </VStack>
                    </Table.Cell>

                    <Table.Cell>
                      <VStack align="start" gap="1">
                        {sale.sale_items?.slice(0, 2).map((item, index) => (
                          <Text key={index} fontSize="sm">
                            {item.quantity}x {item.product?.name || 'Producto'}
                          </Text>
                        ))}
                        {sale.sale_items && sale.sale_items.length > 2 && (
                          <Text fontSize="xs" color="gray.500">
                            +{sale.sale_items.length - 2} más...
                          </Text>
                        )}
                        {!sale.sale_items?.length && (
                          <Text fontSize="sm" color="gray.400">Sin items</Text>
                        )}
                      </VStack>
                    </Table.Cell>

                    <Table.Cell>
                      <Text fontWeight="bold" color="green.600">
                        {formatCurrency(sale.total)}
                      </Text>
                    </Table.Cell>

                    <Table.Cell>
                      <Text fontSize="sm" color="gray.600">
                        {sale.note || '-'}
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