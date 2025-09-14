import { useEffect, useState } from 'react';
import { Box, Button, Grid, Text } from '@chakra-ui/react';
import { supabase } from '@/lib/supabase/client';
import { useSalesStore } from '@/store/salesStore';

// Define the table type based on your database schema
interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied';
  capacity: number;
}

export function TableFloorPlan() {
  const [tables, setTables] = useState<Table[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { selectedTableId, setSelectedTableId } = useSalesStore();

  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase.from('tables').select('*');
      if (error) {
        console.error('Error fetching tables:', error);
        setError('Could not fetch tables.');
      } else {
        setTables(data as Table[]);
      }
    };

    fetchTables();

    const channel = supabase
      .channel('tables-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTables((prevTables) => [...prevTables, payload.new as Table]);
          }
          if (payload.eventType === 'UPDATE') {
            setTables((prevTables) =>
              prevTables.map((table) =>
                table.id === payload.new.id ? (payload.new as Table) : table
              )
            );
          }
          if (payload.eventType === 'DELETE') {
            setTables((prevTables) =>
              prevTables.filter((table) => table.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTableClick = (tableId: string) => {
    // Deselect if the same table is clicked again
    if (selectedTableId === tableId) {
      setSelectedTableId(null);
    } else {
      setSelectedTableId(tableId);
    }
  };

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (tables.length === 0) {
    return <Text>No tables found. Add some in the database.</Text>;
  }

  return (
    <Box p={4}>
      <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={6}>
        {tables.map((table) => {
          const isSelected = table.id === selectedTableId;
          const isAvailable = table.status === 'available';

          return (
            <Button
              key={table.id}
              height="100px"
              variant="outline"
              colorScheme={isAvailable ? 'green' : 'red'}
              borderWidth={isSelected ? '3px' : '1px'}
              borderColor={isSelected ? 'blue.500' : undefined}
              onClick={() => handleTableClick(table.id)}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontWeight="bold">Table {table.number}</Text>
              <Text fontSize="sm">({table.capacity} seats)</Text>
            </Button>
          );
        })}
      </Grid>
    </Box>
  );
}