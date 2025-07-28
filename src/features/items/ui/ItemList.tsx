import { Table, Box, Heading, Spinner } from '@chakra-ui/react';
import { useItems } from '../logic/useItems'; 

export function ItemList() {
  const { items, loading } = useItems();

  if (loading) return <Spinner />;

  return (
    <Box>
      <Heading size="md" mb={3}>Insumos</Heading>
      <Table.Root size="md" variant="simple" showColumnBorder>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Nombre</Table.ColumnHeader>
            <Table.ColumnHeader>Tipo</Table.ColumnHeader>
            <Table.ColumnHeader>Unidad</Table.ColumnHeader>
            <Table.ColumnHeader>Stock</Table.ColumnHeader>
            <Table.ColumnHeader>Costo</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.type}</Table.Cell>
              <Table.Cell>{item.unit}</Table.Cell>
              <Table.Cell>{item.stock}</Table.Cell>
              <Table.Cell>{item.unit_cost ?? '-'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
