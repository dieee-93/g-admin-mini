// src/features/sales/ui/SaleList.tsx - Chakra UI v3
import { 
  Table, 
  Box, 
  Heading, 
  Badge, 
  Button,
  HStack,
  VStack,
  Text,
  Input,
  Grid,
  Select,
  createListCollection,
  Alert,
  Dialog,
  Card
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useSales, useSalesData } from '../logic/useSales';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LoadingSpinner } from '@/modules/dashboard/common/LoadingSpinner';
import { type SalesListFilters } from '../types';

export function SaleList() {
  const { sales, loading, filters, applyFilters, clearFilters, removeSale } = useSales();
  const { customers } = useSalesData();
  const { handleError, handleSuccess } = useErrorHandler();
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [localFilters, setLocalFilters] = useState<SalesListFilters>({
    dateFrom: '',
    dateTo: '',
    customerId: '',
    minTotal: undefined,
    maxTotal: undefined
  });

  // ✅ CORRECTO - Collection para filtro de clientes
  const customerFilterCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: 'Todos los clientes', value: '' },
        ...customers.map(customer => ({
          label: customer.name,
          value: customer.id,
        }))
      ],
    });
  }, [customers]);

  if (loading) return <LoadingSpinner message="Cargando ventas..." />;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleFilterChange = (field: keyof SalesListFilters, value: string | number | undefined) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerFilterChange = (details: { value: string[] }) => {
    setLocalFilters(prev => ({ ...prev, customerId: details.value[0] || '' }));
  };

  const handleApplyFilters = async () => {
    try {
      // Limpiar valores vacíos
      const cleanFilters: SalesListFilters = {};
      
      if (localFilters.dateFrom) cleanFilters.dateFrom = localFilters.dateFrom;
      if (localFilters.dateTo) cleanFilters.dateTo = localFilters.dateTo;
      if (localFilters.customerId) cleanFilters.customerId = localFilters.customerId;
      if (localFilters.minTotal !== undefined && localFilters.minTotal > 0) {
        cleanFilters.minTotal = localFilters.minTotal;
      }
      if (localFilters.maxTotal !== undefined && localFilters.maxTotal > 0) {
        cleanFilters.maxTotal = localFilters.maxTotal;
      }

      await applyFilters(cleanFilters);
      handleSuccess('Filtros aplicados correctamente');
    } catch (error) {
      handleError(error, 'Error aplicando filtros');
    }
  };

  const handleClearFilters = async () => {
    try {
      setLocalFilters({
        dateFrom: '',
        dateTo: '',
        customerId: '',
        minTotal: undefined,
        maxTotal: undefined
      });
      await clearFilters();
      handleSuccess('Filtros limpiados');
    } catch (error) {
      handleError(error, 'Error limpiando filtros');
    }
  };

  const handleDeleteSale = async (saleId: string, customerName?: string) => {
    if (window.confirm(`¿Está seguro de eliminar esta venta${customerName ? ` de ${customerName}` : ''}?`)) {
      try {
        await removeSale(saleId);
        handleSuccess('Venta eliminada correctamente');
      } catch (error) {
        handleError(error, 'Error eliminando venta');
      }
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Box>
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="md" color="teal.600">
          💰 Registro de Ventas
        </Heading>
        <HStack gap="2">
          <Badge colorScheme="teal" variant="subtle">
            {sales.length} ventas
          </Badge>
          {totalSales > 0 && (
            <Badge colorScheme="green" variant="subtle">
              Total: {formatCurrency(totalSales)}
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </HStack>
      </HStack>

      {/* Panel de Filtros */}
      {showFilters && (
        <Box borderWidth="1px" borderRadius="md" p={4} mb={4} bg="gray.50">
          <VStack gap="4" align="stretch">
            <Text fontWeight="medium" color="gray.700">
              🔍 Filtros de Búsqueda
            </Text>
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Desde</Text>
                <Input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Hasta</Text>
                <Input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Cliente</Text>
                <Select.Root 
                  collection={customerFilterCollection}
                  value={localFilters.customerId ? [localFilters.customerId] : []}
                  onValueChange={handleCustomerFilterChange}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Todos los clientes" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {customerFilterCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          <Select.ItemText>{item.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Total mínimo</Text>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={localFilters.minTotal || ''}
                  onChange={(e) => handleFilterChange('minTotal', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Total máximo</Text>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={localFilters.maxTotal || ''}
                  onChange={(e) => handleFilterChange('maxTotal', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </Box>
            </Grid>
            
            <HStack gap="3">
              <Button
                size="sm"
                colorScheme="teal"
                onClick={handleApplyFilters}
              >
                Aplicar Filtros
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
              >
                Limpiar
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <Alert.Root status="info" mb={4}>
          <Alert.Indicator />
          <Alert.Description>
            Mostrando resultados filtrados. {sales.length} venta(s) encontrada(s).
          </Alert.Description>
        </Alert.Root>
      )}

      {sales.length === 0 ? (
        <Box p={8} textAlign="center" color="gray.500">
          <Text>No hay ventas registradas</Text>
          <Text fontSize="sm" mt={2}>
            {hasActiveFilters 
              ? 'Intente ajustar los filtros de búsqueda'
              : 'Cree su primera venta usando el formulario de arriba'
            }
          </Text>
        </Box>
      ) : (
        <Table.Root size="sm" variant="line" showColumnBorder>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Fecha</Table.ColumnHeader>
              <Table.ColumnHeader>Cliente</Table.ColumnHeader>
              <Table.ColumnHeader>Productos</Table.ColumnHeader>
              <Table.ColumnHeader>Total</Table.ColumnHeader>
              <Table.ColumnHeader>Nota</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
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
                  {sale.customer ? (
                    <VStack align="start" gap="0">
                      <Text fontWeight="medium" fontSize="sm">
                        {sale.customer.name}
                      </Text>
                      {sale.customer.phone && (
                        <Text fontSize="xs" color="gray.500">
                          {sale.customer.phone}
                        </Text>
                      )}
                    </VStack>
                  ) : (
                    <Badge size="sm" colorScheme="gray">
                      Sin cliente
                    </Badge>
                  )}
                </Table.Cell>
                
                <Table.Cell>
                  <VStack align="start" gap="1">
                    {sale.sale_items?.slice(0, 2).map((item, index) => (
                      <Text key={index} fontSize="xs" color="gray.600">
                        {item.quantity}x {item.product?.name || 'Producto'} 
                        @ {formatCurrency(item.unit_price)}
                      </Text>
                    )) || <Text fontSize="xs" color="gray.500">Sin items</Text>}
                    
                    {(sale.sale_items?.length || 0) > 2 && (
                      <Text fontSize="xs" color="blue.500">
                        +{(sale.sale_items?.length || 0) - 2} más...
                      </Text>
                    )}
                  </VStack>
                </Table.Cell>
                
                <Table.Cell>
                  <Text fontWeight="bold" color="green.600">
                    {formatCurrency(sale.total)}
                  </Text>
                </Table.Cell>
                
                <Table.Cell>
                  {sale.note ? (
                    <Text fontSize="sm" noOfLines={2} maxWidth="150px">
                      {sale.note}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.400">-</Text>
                  )}
                </Table.Cell>
                
                <Table.Cell>
                  <HStack gap="1">
                    <Button
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => {
                        setSelectedSale(sale);
                        setShowDetailDialog(true);
                      }}
                    >
                      👁️
                    </Button>
                    
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteSale(sale.id, sale.customer?.name)}
                    >
                      🗑️
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      {/* Sale Detail Dialog */}
      <Dialog.Root open={showDetailDialog} onOpenChange={() => setShowDetailDialog(false)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Detalle de Venta #{selectedSale?.id}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              {selectedSale && (
                <VStack align="stretch" gap={4}>
                  {/* Sale Info */}
                  <Card.Root>
                    <Card.Header>
                      <Text fontWeight="bold">Información de la Venta</Text>
                    </Card.Header>
                    <Card.Body>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Fecha</Text>
                          <Text fontWeight="medium">
                            {new Date(selectedSale.sale_date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Total</Text>
                          <Text fontWeight="bold" fontSize="lg" color="green.600">
                            ${selectedSale.total_amount.toFixed(2)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Cliente</Text>
                          <Text fontWeight="medium">
                            {selectedSale.customer_name || 'Cliente anónimo'}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.600">Estado</Text>
                          <Badge colorScheme="green">Completada</Badge>
                        </Box>
                      </Grid>
                    </Card.Body>
                  </Card.Root>

                  {/* Sale Items */}
                  <Card.Root>
                    <Card.Header>
                      <Text fontWeight="bold">Productos Vendidos</Text>
                    </Card.Header>
                    <Card.Body>
                      {selectedSale.items && selectedSale.items.length > 0 ? (
                        <Table.Root size="sm">
                          <Table.Header>
                            <Table.Row>
                              <Table.ColumnHeader>Producto</Table.ColumnHeader>
                              <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                              <Table.ColumnHeader>Precio Unit.</Table.ColumnHeader>
                              <Table.ColumnHeader>Subtotal</Table.ColumnHeader>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {selectedSale.items.map((item: any, index: number) => (
                              <Table.Row key={index}>
                                <Table.Cell fontWeight="medium">{item.name}</Table.Cell>
                                <Table.Cell>{item.quantity}</Table.Cell>
                                <Table.Cell>${item.price.toFixed(2)}</Table.Cell>
                                <Table.Cell fontWeight="bold">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                      ) : (
                        <Text color="gray.500" textAlign="center" py={4}>
                          No hay detalles de productos disponibles
                        </Text>
                      )}
                    </Card.Body>
                  </Card.Root>

                  {/* Notes */}
                  {selectedSale.notes && (
                    <Card.Root>
                      <Card.Header>
                        <Text fontWeight="bold">Notas</Text>
                      </Card.Header>
                      <Card.Body>
                        <Text>{selectedSale.notes}</Text>
                      </Card.Body>
                    </Card.Root>
                  )}
                </VStack>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Cerrar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}