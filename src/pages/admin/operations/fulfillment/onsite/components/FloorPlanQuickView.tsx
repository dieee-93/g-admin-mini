import React from 'react';
import { Stack, Grid, Button, Badge, Typography } from '@/shared/ui';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'ready_for_bill' | 'maintenance';
  capacity: number;
}

interface FloorPlanQuickViewProps {
  onTableSelect?: (tableId: string) => void;
}

/**
 * Simplified FloorPlan view for embedding in Sales POS
 * Shows only available/occupied tables with quick selection
 */
export function FloorPlanQuickView({ onTableSelect }: FloorPlanQuickViewProps) {
  const [tables, setTables] = React.useState<Table[]>([]);

  React.useEffect(() => {
    loadTables();

    // Real-time subscription
    const subscription = supabase
      .channel('tables-quick-view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        loadTables();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('id, number, status, capacity')
        .eq('is_active', true)
        .order('number');

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      logger.error('FloorPlanQuickView', 'Error loading tables:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'warning';
      case 'reserved': return 'info';
      default: return 'gray';
    }
  };

  return (
    <Stack gap="sm">
      <Typography size="sm" fontWeight="medium">Quick Table Selection</Typography>
      <Grid templateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap="sm">
        {tables.map((table) => (
          <Button
            key={table.id}
            variant="outline"
            size="sm"
            onClick={() => onTableSelect?.(table.id)}
            disabled={table.status !== 'available'}
            w="full"
          >
            <Stack direction="column" align="center" gap="xs">
              <Typography size="sm" fontWeight="bold">
                T{table.number}
              </Typography>
              <Badge size="sm" colorPalette={getStatusColor(table.status)}>
                {table.status === 'available' ? 'Free' : 'Busy'}
              </Badge>
            </Stack>
          </Button>
        ))}
      </Grid>
    </Stack>
  );
}
