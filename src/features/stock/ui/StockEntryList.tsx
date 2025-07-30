// ===================================

// 📁 src/features/stock_entries/ui/StockEntryList.tsx
import { Table, Box, Heading, Spinner, Badge } from '@chakra-ui/react';
import { useStockEntries } from '../logic/useStockEntries';

export function StockEntryList() {
  const { stockEntries, loading } = useStockEntries();

  if (loading) return <Spinner />;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      UNIT: 'blue',
      WEIGHT: 'green',
      VOLUME: 'orange',
      ELABORATED: 'purple'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  return (
    <Box>
      <Heading size="md" mb={3}>Entradas de Stock</Heading>
      {stockEntries.length === 0 ? (
        <Box p={4} textAlign="center" color="gray.500">
          No hay entradas de stock registradas
        </Box>
      ) : (
        <Table.Root size="md" variant="line" showColumnBorder>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Fecha</Table.ColumnHeader>
              <Table.ColumnHeader>Insumo</Table.ColumnHeader>
              <Table.ColumnHeader>Tipo</Table.ColumnHeader>
              <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
              <Table.ColumnHeader>Costo Unit.</Table.ColumnHeader>
              <Table.ColumnHeader>Total</Table.ColumnHeader>
              <Table.ColumnHeader>Nota</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {stockEntries.map((entry) => (
              <Table.Row key={entry.id}>
                <Table.Cell>{formatDate(entry.date)}</Table.Cell>
                <Table.Cell>
                  <strong>{entry.item?.name}</strong>
                  <br />
                  <small style={{ color: 'gray' }}>({entry.item?.unit})</small>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorScheme={getTypeColor(entry.item?.type || '')}>
                    {entry.item?.type}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{entry.quantity}</Table.Cell>
                <Table.Cell>{formatCurrency(entry.unit_cost)}</Table.Cell>
                <Table.Cell>
                  <strong>{formatCurrency(entry.quantity * entry.unit_cost)}</strong>
                </Table.Cell>
                <Table.Cell>{entry.note || '-'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
}