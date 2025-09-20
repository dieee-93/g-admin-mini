// src/features/customers/ui/CustomerOrdersHistory.tsx
import { useState, useEffect } from 'react';
import { 
  Stack,
  Typography,
  Badge,
  CardWrapper ,
  Table,
  Grid
} from '@/shared/ui';
import { fetchSales } from '@/pages/admin/sales/services/saleApi';
import { useCustomers } from '../hooks/useCustomers';
import type { Sale } from '@/pages/admin/sales/types';

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
        const filters: unknown = selectedCustomer ? { customerId: selectedCustomer } : {};
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

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="text-muted">Cargando historial de pedidos...</div>
    </div>
  );

  return (
    <Stack direction="column" gap="lg">
      {/* Filtros */}
      <CardWrapper>
        <CardWrapper.Header>
          <Typography variant="heading">Filtros de Búsqueda</Typography>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Stack direction="row" gap="md" className="flex-wrap">
            <div>
              <Typography size="sm" color="text.muted" className="mb-1">Cliente</Typography>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="min-w-48 px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Todos los clientes</option>
                {customers?.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                )) || []}
              </select>
            </div>

            <div>
              <Typography size="sm" color="text.muted" className="mb-1">Fecha</Typography>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="max-w-40 px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  setSelectedCustomer('');
                  setDateFilter('');
                }}
                className="px-3 py-1.5 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Resumen */}
      <Grid className="grid-cols-3 gap-4">
        <CardWrapper>
          <CardWrapper.Body className="text-center">
            <Typography size="2xl" weight="bold" className="text-blue-600">
              {sales.length}
            </Typography>
            <Typography size="sm" color="text.muted">Total Pedidos</Typography>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body className="text-center">
            <Typography size="2xl" weight="bold" className="text-green-600">
              {formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0))}
            </Typography>
            <Typography size="sm" color="text.muted">Revenue Total</Typography>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Body className="text-center">
            <Typography size="2xl" weight="bold" className="text-purple-600">
              {sales.length > 0 ? formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length) : '$0'}
            </Typography>
            <Typography size="sm" color="text.muted">Ticket Promedio</Typography>
          </CardWrapper.Body>
        </CardWrapper>
      </Grid>

      {/* Lista de pedidos */}
      <CardWrapper>
        <CardWrapper.Header>
          <Stack direction="row" justify="space-between">
            <Typography variant="heading">
              Historial de Pedidos
              {selectedCustomer && (
                <Badge colorPalette="info" className="ml-2">
                  {customers?.find(c => c.id === selectedCustomer)?.name}
                </Badge>
              )}
            </Typography>
            <Badge variant="outline">
              {sales.length} pedidos
            </Badge>
          </Stack>
        </CardWrapper.Header>

        <CardWrapper.Body>
          {sales.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <Typography>No se encontraron pedidos</Typography>
              <Typography size="sm" className="mt-2">
                {selectedCustomer || dateFilter ? 'Prueba ajustando los filtros' : 'Aún no hay ventas registradas'}
              </Typography>
            </div>
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
                      <Typography size="sm">
                        {formatDate(sale.created_at)}
                      </Typography>
                    </Table.Cell>
                    
                    <Table.Cell>
                      <Stack direction="column" align="start" gap="xs">
                        <Typography weight="medium">
                          {sale.customer?.name || 'Cliente sin nombre'}
                        </Typography>
                        {sale.customer?.phone && (
                          <Typography size="xs" color="text.muted">
                            📞 {sale.customer.phone}
                          </Typography>
                        )}
                      </Stack>
                    </Table.Cell>

                    <Table.Cell>
                      <Stack direction="column" align="start" gap="xs">
                        {sale.sale_items?.slice(0, 2).map((item, index) => (
                          <Typography key={index} size="sm">
                            {item.quantity}x {item.product?.name || 'Producto'}
                          </Typography>
                        ))}
                        {sale.sale_items && sale.sale_items.length > 2 && (
                          <Typography size="xs" color="text.muted">
                            +{sale.sale_items.length - 2} más...
                          </Typography>
                        )}
                        {!sale.sale_items?.length && (
                          <Typography size="sm" color="text.muted">Sin items</Typography>
                        )}
                      </Stack>
                    </Table.Cell>

                    <Table.Cell>
                      <Typography weight="bold" className="text-green-600">
                        {formatCurrency(sale.total)}
                      </Typography>
                    </Table.Cell>

                    <Table.Cell>
                      <Typography size="sm" color="text.muted">
                        {sale.note || '-'}
                      </Typography>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </CardWrapper.Body>
      </CardWrapper>
    </Stack>
  );
}
