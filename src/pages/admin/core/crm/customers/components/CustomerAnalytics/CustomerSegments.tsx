// src/features/customers/ui/CustomerSegments.tsx - Design System v2.0
// MIGRATED: Now uses centralized financial calculations
import {
  Stack,
  Typography,
  CardWrapper ,
  Badge,
  Table,
  Grid
} from '@/shared/ui';
import { QuickCalculations } from '@/business-logic/shared/FinancialCalculations';
import { useState, useMemo } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import type { CustomerWithStats } from '../../types';

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
    return (
      <Stack direction="row" align="center" justify="center" h="50vh">
        <Typography>Cargando segmentos...</Typography>
      </Stack>
    );
  }

  // MIGRATED: Use centralized currency formatting

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const selectedSegmentData = segments.find(s => s.id === selectedSegment);

  return (
    <Stack direction="column" gap="lg" align="stretch">
      {/* Resumen de segmentos */}
      <CardWrapper>
        <Stack direction="column" gap="md" p="lg">
          <Typography variant="heading" size="lg">Resumen de Segmentos</Typography>
          
          <Stack direction="column" gap="sm" align="stretch">
            {segments.slice(1).map((segment) => (
              <Stack key={segment.id} direction="column" gap="xs">
                <Stack direction="row" justify="space-between" align="center">
                  <Stack direction="row" gap="sm" align="center">
                    <Badge 
                      colorPalette={segment.color as any} 
                      clickable
                      onClick={() => setSelectedSegment(segment.id)}
                    >
                      {segment.name}
                    </Badge>
                    <Typography size="sm" color="text.muted">
                      {segment.description}
                    </Typography>
                  </Stack>
                  <Typography fontWeight="medium">{segment.customers.length}</Typography>
                </Stack>
                <div 
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{
                      width: `${customersWithStats.length > 0 ? (segment.customers.length / customersWithStats.length) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: 'var(--colors-brand)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardWrapper>

      {/* Filtros y búsqueda */}
      <CardWrapper>
        <Stack direction="column" gap="md" p="lg">
          <Stack direction="row" justify="space-between" flexWrap="wrap" gap="md">
            <Stack direction="row" align="center" gap="xs">
              <Typography variant="heading" size="lg">
                {selectedSegmentData?.name}
              </Typography>
              <Badge colorPalette={selectedSegmentData?.color as any}>
                {filteredCustomers.length}
              </Badge>
            </Stack>

            <Stack direction="row" gap="sm">
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                style={{
                  minWidth: '200px',
                  padding: '8px 12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                {segments.map(segment => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({segment.customers.length})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  maxWidth: '200px',
                  padding: '8px 12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </Stack>
          </Stack>

          {filteredCustomers.length === 0 ? (
            <Stack direction="column" align="center" p="xl" color="text.muted">
              <Typography>No se encontraron clientes en este segmento</Typography>
              <Typography size="sm" mt="xs">
                {searchTerm ? 'Prueba ajustando el término de búsqueda' : 'Este segmento está vacío'}
              </Typography>
            </Stack>
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
                      <Stack direction="column" align="start" gap="none">
                        <Typography fontWeight="medium">
                          {customer.stats?.purchase_count || 0}
                        </Typography>
                        <Typography size="xs" color="text.muted">
                          compras
                        </Typography>
                      </Stack>
                    </Table.Cell>

                    <Table.Cell>
                      <Stack direction="column" align="start" gap="none">
                        <Typography fontWeight="medium" >
                          {QuickCalculations.formatCurrency(customer.stats?.total_spent || 0)}
                        </Typography>
                        <Typography size="xs" color="text.muted">
                          total
                        </Typography>
                      </Stack>
                    </Table.Cell>

                    <Table.Cell>
                      <Typography size="sm">
                        {formatDate(customer.stats?.last_purchase_date)}
                      </Typography>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Stack>
      </CardWrapper>
    </Stack>
  );
}