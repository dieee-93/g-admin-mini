// src/features/customers/ui/CustomerList.tsx - Design System v2.0
// MIGRATED: Now uses centralized financial calculations
import {
  Stack,
  CardWrapper,
  Typography,
  Button,
  Badge,
  Alert,
  Table,
  Dialog,
  InputField
} from '@/shared/ui';
import { QuickCalculations } from '@/lib/decimal';
// TODO: Implement virtualization for large customer lists (1000+ records)
// import { VirtualizedList } from '@/lib/performance/virtualization/VirtualizedList';
import { useState } from 'react';
import { useCustomersStore } from '@/modules/customers/store';
import { useShallow } from 'zustand/react/shallow';
import { useCustomers, useCustomerSearch } from '@/modules/customers/hooks';
import { type Customer } from '../../types/customer';
import { CustomerForm } from '../CustomerForm/CustomerForm';
import { notify } from '@/lib/notifications';
import { getDefaultAddress, getAddressDisplay } from '../../utils/addressHelpers';
import { usePermissions } from '@/hooks';

export function CustomerList() {
  const { customers, loading, loadingStats, removeCustomer } = useCustomers();
  const { searchResults, loading: searchLoading, query, search, clearSearch } = useCustomerSearch();

  // ✅ ENTERPRISE PATTERN: Modal state from store
  const isModalOpen = useCustomersStore((state) => state.isModalOpen);
  const currentCustomer = useCustomersStore((state) => state.currentCustomer);
  const openModal = useCustomersStore((state) => state.openModal);
  const closeModal = useCustomersStore((state) => state.closeModal);

  // ✅ PERMISSIONS: Check user permissions
  const { canUpdate, canDelete } = usePermissions('customers');

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
    // Verificar permisos primero
    if (!canDelete) {
      notify.error({
        title: 'Sin permisos',
        description: 'No tienes permisos para eliminar clientes'
      });
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar al cliente "${customer.name}"?`)) {
      return;
    }

    console.log('🗑️ [CustomerList] Attempting to delete customer:', customer.id);

    try {
      await removeCustomer(customer.id);
      console.log('✅ [CustomerList] Customer deleted successfully');

      notify.success({ title: 'Cliente eliminado', description: 'Cliente eliminado correctamente' })

    } catch (error) {
      console.error('❌ [CustomerList] Error deleting customer:', error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      notify.error({
        title: 'Error al eliminar cliente',
        description: errorMessage
      })
    }
  };

  const handleEdit = (customer: Customer) => {
    // Verificar permisos primero
    if (!canUpdate) {
      notify.error({
        title: 'Sin permisos',
        description: 'No tienes permisos para editar clientes'
      });
      return;
    }

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
    <Stack p="6" gap="6">
      {/* Modal de creación/edición */}
      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(details) => {
          if (!details.open) {
            closeModal();
          }
        }}
        size="xl"
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content minW={{ base: "90vw", md: "700px", lg: "800px" }} maxW="900px">
            <Dialog.Header>
              <Dialog.Title>
                {currentCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body maxHeight="75vh" overflowY="auto" pb="6">
              <CustomerForm
                customer={currentCustomer || undefined}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Header con búsqueda */}
      <Stack direction="row" justify="space-between" align="center" mb="6" flexWrap="wrap" gap="4">
        <Stack direction="column" align="start" gap="2">
          <Typography variant="heading" size="md" color="text.primary">
            👥 Gestión de Clientes
          </Typography>
          <Stack direction="row" gap="4">
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

        <Stack direction="row" gap="2">
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
      <Stack mb="4" gap="2">
        <Stack direction="row" gap="2">
          <InputField
            type="text"
            placeholder="Buscar por nombre, DNI, teléfono o email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            maxW="450px"
            size="md"
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
          <Typography size="sm" color="text.muted" mt="2">
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
              <Table.ColumnHeader>DNI</Table.ColumnHeader>
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
                    <Stack direction="column" align="start" gap="1">
                      <Typography fontWeight="medium">{customer.name}</Typography>
                      <Typography size="xs" color="text.muted">
                        Cliente desde {formatDate(customer.created_at)}
                      </Typography>
                      {customer.notes && (
                        <Typography size="xs" color="text.muted" fontStyle="italic">
                          📝 {customer.notes.length > 50 ? customer.notes.substring(0, 50) + '...' : customer.notes}
                        </Typography>
                      )}
                    </Stack>
                  </Table.Cell>

                  <Table.Cell>
                    <Typography size="sm">
                      {customer.dni || '-'}
                    </Typography>
                  </Table.Cell>

                  <Table.Cell>
                    <Stack direction="column" align="start" gap="xs">
                      {customer.phone && (
                        <Typography size="sm">☎️ {customer.phone}</Typography>
                      )}
                      {customer.mobile && (
                        <Typography size="sm">📱 {customer.mobile}</Typography>
                      )}
                      {customer.email && (
                        <Typography size="sm">✉️ {customer.email}</Typography>
                      )}
                      {!customer.phone && !customer.mobile && !customer.email && (
                        <Typography size="sm" color="text.muted">Sin contacto</Typography>
                      )}
                    </Stack>
                  </Table.Cell>

                  <Table.Cell>
                    <Typography size="sm">
                      {getAddressDisplay(getDefaultAddress(customer))}
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
                    <Stack direction="row" gap="2">
                      {canUpdate && (
                        <Button
                          size="xs"
                          colorPalette="blue"
                          variant="ghost"
                          onClick={() => handleEdit(customer)}
                          title="Editar cliente"
                        >
                          ✏️
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          size="xs"
                          colorPalette="red"
                          variant="ghost"
                          onClick={() => handleDelete(customer)}
                          title="Eliminar cliente"
                        >
                          🗑️
                        </Button>
                      )}

                      {!canUpdate && !canDelete && (
                        <Typography size="xs" color="text.muted">
                          Sin permisos
                        </Typography>
                      )}
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