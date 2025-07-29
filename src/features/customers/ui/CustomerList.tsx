// src/features/customers/ui/CustomerList.tsx - Chakra UI v3.23
import { 
  Table, 
  Box, 
  Heading, 
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Input,
  Flex,
  Spinner,
  Alert
} from '@chakra-ui/react';
import { useState } from 'react';
import { useCustomers, useCustomerSearch } from '../logic/useCustomers';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { type Customer } from '../types';
import { CustomerForm } from './CustomerForm';

export function CustomerList() {
  const { customers, customersWithStats, loading, loadingStats, removeCustomer } = useCustomers();
  const { searchResults, loading: searchLoading, query, search, clearSearch } = useCustomerSearch();
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showStats, setShowStats] = useState(false);

  if (loading) return <LoadingSpinner message="Cargando clientes..." />;

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

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      try {
        await search(value);
      } catch (error) {
        handleError(error, 'Error buscando clientes');
      }
    } else {
      clearSearch();
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`¿Estás seguro de eliminar al cliente "${customer.name}"?`)) {
      return;
    }

    try {
      await removeCustomer(customer.id);
      handleSuccess('Cliente eliminado correctamente');
    } catch (error) {
      handleError(error, 'Error eliminando cliente');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleEditSuccess = () => {
    setEditingCustomer(null);
  };

  const handleEditCancel = () => {
    setEditingCustomer(null);
  };

  // Determinar qué lista mostrar
  const displayCustomers = query ? searchResults : customers;
  const displayCustomersWithStats = query ? [] : customersWithStats;

  return (
    <Box>
      {/* Modal de edición */}
      {editingCustomer && (
        <Box 
          position="fixed" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          bg="blackAlpha.600" 
          zIndex="overlay"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box 
            maxWidth="600px" 
            width="100%" 
            maxHeight="90vh" 
            overflow="auto"
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
          >
            <CustomerForm 
              customer={editingCustomer}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </Box>
        </Box>
      )}

      {/* Header con búsqueda */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <VStack align="start" gap="1">
          <Heading size="md" color="pink.600">
            👥 Gestión de Clientes
          </Heading>
          <HStack gap="4">
            <Badge colorScheme="pink" variant="subtle">
              {customers.length} clientes
            </Badge>
            {showStats && !loadingStats && (
              <Badge colorScheme="blue" variant="subtle">
                Con estadísticas
              </Badge>
            )}
          </HStack>
        </VStack>

        <HStack gap="3">
          <Button
            size="sm"
            variant={showStats ? "solid" : "outline"}
            colorScheme="blue"
            onClick={() => setShowStats(!showStats)}
            loading={loadingStats}
            loadingText="Cargando stats..."
          >
            {showStats ? '📊' : '📈'} Stats
          </Button>
        </HStack>
      </Flex>

      {/* Búsqueda */}
      <Box mb={4}>
        <HStack gap="3">
          <Input
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            maxWidth="400px"
          />
          {query && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setSearchQuery('');
                clearSearch();
              }}
            >
              ✕ Limpiar
            </Button>
          )}
          {searchLoading && <Spinner size="sm" />}
        </HStack>
        
        {query && (
          <Text fontSize="sm" color="gray.600" mt={2}>
            Mostrando {searchResults.length} resultado(s) para "{query}"
          </Text>
        )}
      </Box>

      {/* Lista de clientes */}
      {displayCustomers.length === 0 ? (
        <Box p={8} textAlign="center" color="gray.500">
          {query ? (
            <>
              <Text>No se encontraron clientes que coincidan con "{query}"</Text>
              <Text fontSize="sm" mt={2}>
                Intenta con otros términos de búsqueda
              </Text>
            </>
          ) : (
            <>
              <Text>No hay clientes registrados</Text>
              <Text fontSize="sm" mt={2}>
                Crea tu primer cliente usando el formulario de arriba
              </Text>
            </>
          )}
        </Box>
      ) : (
        <Table.Root size="sm" variant="line" showColumnBorder>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Cliente</Table.ColumnHeader>
              <Table.ColumnHeader>Contacto</Table.ColumnHeader>
              <Table.ColumnHeader>Dirección</Table.ColumnHeader>
              {showStats && !query && (
                <>
                  <Table.ColumnHeader>Compras</Table.ColumnHeader>
                  <Table.ColumnHeader>Total Gastado</Table.ColumnHeader>
                  <Table.ColumnHeader>Última Compra</Table.ColumnHeader>
                </>
              )}
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {displayCustomers.map((customer) => {
              const customerWithStats = displayCustomersWithStats.find(c => c.id === customer.id);
              
              return (
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
                    <Text fontSize="sm">
                      {customer.address || '-'}
                    </Text>
                  </Table.Cell>
                  
                  {showStats && !query && (
                    <>
                      <Table.Cell>
                        <VStack align="start" gap="0">
                          <Text fontWeight="medium">
                            {customerWithStats?.stats?.purchase_count || 0}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            compras
                          </Text>
                        </VStack>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <VStack align="start" gap="0">
                          <Text fontWeight="medium" color="green.600">
                            {formatCurrency(customerWithStats?.stats?.total_spent || 0)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            total
                          </Text>
                        </VStack>
                      </Table.Cell>
                      
                      <Table.Cell>
                        <Text fontSize="sm">
                          {formatDate(customerWithStats?.stats?.last_purchase_date)}
                        </Text>
                      </Table.Cell>
                    </>
                  )}
                  
                  <Table.Cell>
                    <HStack gap="1">
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleEdit(customer)}
                      >
                        ✏️
                      </Button>
                      
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(customer)}
                      >
                        🗑️
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      )}

      {/* Información adicional */}
      {!query && showStats && !loadingStats && (
        <Alert.Root status="info" mt={4}>
          <Alert.Indicator />
          <Alert.Description>
            Las estadísticas muestran datos basados en las ventas registradas. 
            Activa el módulo de ventas para obtener información más detallada.
          </Alert.Description>
        </Alert.Root>
      )}
    </Box>
  );
}