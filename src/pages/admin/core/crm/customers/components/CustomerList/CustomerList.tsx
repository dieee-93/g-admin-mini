// src/features/customers/ui/CustomerList.tsx - Design System v2.0
// MIGRATED: Now uses centralized financial calculations
import {
  Stack,
  CardWrapper,
  Typography,
  Button,
  Badge,
  Alert,
  Table
} from '@/shared/ui';
import { QuickCalculations } from '@/business-logic/shared/FinancialCalculations';
// TODO: Implement virtualization for large customer lists (1000+ records)
// import { VirtualizedList } from '@/lib/performance/virtualization/VirtualizedList';
import { useState } from 'react';
import { useCustomersStore } from '@/store/customersStore';
import { useShallow } from 'zustand/react/shallow';
import { useCustomers, useCustomerSearch } from '../../hooks/existing/useCustomers';
import { type Customer } from '../../types/customer';
import { CustomerForm } from '../CustomerForm/CustomerForm';
import { notify } from '@/lib/notifications';

export function CustomerList() {
  const { customers, loading, loadingStats, removeCustomer } = useCustomers();
  const { searchResults, loading: searchLoading, query, search, clearSearch } = useCustomerSearch();

  // ✅ ENTERPRISE PATTERN: Modal state from store
  const isModalOpen = useCustomersStore((state) => state.isModalOpen);
  const currentCustomer = useCustomersStore((state) => state.currentCustomer);
  const openModal = useCustomersStore((state) => state.openModal);
  const closeModal = useCustomersStore((state) => state.closeModal);

  const [searchQuery, setSearchQuery] = useState('');
  // const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // Removed local state
  const [showStats, setShowStats] = useState(false);

  if (loading) return (
    <Stack direction="row" align="center" justify="center" h="50vh">
      <Typography>Cargando clientes...</Typography>
    </Stack>
  );

  // MIGRATED: Use centralized currency formatting

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      try {
        await search(value);
      } catch {
        notify.error({ title: 'ERROR', description: 'Error buscando clientes' });

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

      notify.success({ title: 'CLIENT_DELETED', description: 'Cliente eliminado correctamente' })

    } catch {
      notify.error({ title: 'ERROR', description: 'Error eliminando cliente' })

    }
  };

  const handleEdit = (customer: Customer) => {
    // Customer now has unified type, no casting needed
    openModal('edit', customer);
  };

  const handleEditSuccess = () => {
    closeModal();
  };

  const handleEditCancel = () => {
    closeModal();
  };

  // Determinar qué lista mostrar
  const displayCustomers = query ? searchResults : customers;

  return (
    <Stack p="lg">
      {/* Modal de edición */}
      {isModalOpen && currentCustomer && (
        <Stack
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="overlay"
          direction="row"
          align="center"
          justify="center"
          p="4"
        >
          <CardWrapper padding="md" width="full">
            <div style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <CustomerForm
                customer={currentCustomer}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </div>
          </CardWrapper>
        </Stack>
      )}

      {/* Header con búsqueda */}
      <Stack direction="row" justify="space-between" align="center" mb="lg" flexWrap="wrap" gap="md">
        <Stack direction="column" align="start" gap="xs">
          <Typography variant="heading" size="md" color="text.primary">
            👥 Gestión de Clientes
          </Typography>
          <Stack direction="row" gap="md">
            <Badge colorPalette="blue" variant="subtle">
              {customers.length} clientes
            </Badge>
            {showStats && !loadingStats && (
              <Badge colorPalette="blue" variant="subtle">
                Con estadísticas
              </Badge>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" gap="sm">
          <Button
            size="sm"
            variant={showStats ? "solid" : "outline"}
            colorPalette="blue"
            onClick={() => setShowStats(!showStats)}
            disabled={loadingStats}
          >
            {showStats ? '📊' : '📈'} {loadingStats ? 'Cargando...' : 'Stats'}
          </Button>
        </Stack>
      </Stack>

      {/* Búsqueda */}
      <Stack mb="md">
        <Stack direction="row" gap="sm">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              maxWidth: '400px',
              padding: '8px 12px',
              border: '1px solid #e2e2e2',
              borderRadius: '6px'
            }}
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
          {searchLoading && <Typography size="sm">⏳</Typography>}
        </Stack>

        {query && (
          <Typography size="sm" color="text.muted" mt="xs">
            Mostrando {searchResults.length} resultado(s) para "{query}"
          </Typography>
        )}
      </Stack>

      {/* Lista de clientes */}
      {displayCustomers.length === 0 ? (
        <Stack p="xl" direction="column" align="center" color="text.muted">
          {query ? (
            <>
              <Typography>No se encontraron clientes que coincidan con "{query}"</Typography>
              <Typography size="sm" mt="xs">
                Intenta con otros términos de búsqueda
              </Typography>
            </>
          ) : (
            <>
              <Typography>No hay clientes registrados</Typography>
              <Typography size="sm" mt="xs">
                Crea tu primer cliente usando el formulario de arriba
              </Typography>
            </>
          )}
        </Stack>
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

              return (
                <Table.Row key={customer.id}>
                  <Table.Cell>
                    <Stack direction="column" align="start" gap="xs">
                      <Typography fontWeight="medium">{customer.name}</Typography>
                      <Typography size="xs" color="text.muted">
                        Cliente desde {formatDate(customer.created_at)}
                      </Typography>
                    </Stack>
                  </Table.Cell>

                  <Table.Cell>
                    <Stack direction="column" align="start" gap="xs">
                      {customer.phone && (
                        <Typography size="sm">📞 {customer.phone}</Typography>
                      )}
                      {customer.email && (
                        <Typography size="sm">✉️ {customer.email}</Typography>
                      )}
                      {!customer.phone && !customer.email && (
                        <Typography size="sm" color="text.muted">Sin contacto</Typography>
                      )}
                    </Stack>
                  </Table.Cell>

                  <Table.Cell>
                    <Typography size="sm">
                      {customer.address || '-'}
                    </Typography>
                  </Table.Cell>

                  {showStats && !query && (
                    <>
                      <Table.Cell>
                        <Stack direction="column" align="start" gap="none">
                          <Typography fontWeight="medium">
                            {customer.total_orders || 0}
                          </Typography>
                          <Typography size="xs" color="text.muted">
                            compras
                          </Typography>
                        </Stack>
                      </Table.Cell>

                      <Table.Cell>
                        <Stack direction="column" align="start" gap="none">
                          <Typography fontWeight="medium" >
                            {QuickCalculations.formatCurrency(customer.total_spent || 0)}
                          </Typography>
                          <Typography size="xs" color="text.muted">
                            total
                          </Typography>
                        </Stack>
                      </Table.Cell>

                      <Table.Cell>
                        <Typography size="sm">
                          {formatDate(customer.last_order_date)}
                        </Typography>
                      </Table.Cell>
                    </>
                  )}

                  <Table.Cell>
                    <Stack direction="row" gap="xs">
                      <Button
                        size="xs"
                        colorPalette="blue"
                        variant="ghost"
                        onClick={() => handleEdit(customer)}
                      >
                        ✏️
                      </Button>

                      <Button
                        size="xs"
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => handleDelete(customer)}
                      >
                        🗑️
                      </Button>
                    </Stack>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      )}

      {/* Información adicional */}
      {!query && showStats && !loadingStats && (
        <Alert variant="subtle">
          Las estadísticas muestran datos basados en las ventas registradas.
          Activa el módulo de ventas para obtener información más detallada.
        </Alert>
      )}
    </Stack>
  );
}