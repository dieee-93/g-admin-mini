import React from 'react';
import { Stack, Grid, CardWrapper, Typography, Badge, Button } from '@/shared/ui';
import { supabase } from '@/lib/supabase/client';
import { EyeIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'ready_for_bill' | 'maintenance';
  location: string;
  priority: 'normal' | 'vip' | 'urgent' | 'attention_needed';
  color_code: string;
  turn_count: number;
  daily_revenue: number;
  current_party?: {
    size: number;
    primary_customer_name?: string;
    seated_at: string;
    estimated_duration: number;
    total_spent: number;
    status: string;
  };
}

interface FloorPlanViewProps {
  refreshTrigger?: number;
}

export function FloorPlanView({ refreshTrigger }: FloorPlanViewProps) {
  const [tables, setTables] = React.useState<Table[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadTableData();

    // Real-time subscription
    const subscription = supabase
      .channel('tables-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
        loadTableData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshTrigger]);

  const loadTableData = async () => {
    try {
      setLoading(true);
      const { data, error} = await supabase
        .from('tables')
        .select(`
          *,
          parties (
            size,
            customer_name,
            seated_at,
            estimated_duration,
            total_spent,
            status
          )
        `)
        .eq('is_active', true)
        .order('number');

      if (error) throw error;

      interface PartyData {
        status: string;
        size: number;
        customer_name: string;
        seated_at: string;
        estimated_duration?: number;
      }

      interface TableData {
        section?: string;
        parties?: PartyData[];
        [key: string]: unknown;
      }

      const formattedTables = data.map((table: TableData) => ({
        ...table,
        location: table.section || 'main', // Map section → location for code compatibility
        current_party: table.parties?.find((p: PartyData) =>
          p.status === 'seated' || p.status === 'active'
        ) ? {
          size: table.parties[0].size,
          primary_customer_name: table.parties[0].customer_name,
          seated_at: table.parties[0].seated_at,
          estimated_duration: table.parties[0].estimated_duration || 60,
          total_spent: table.parties[0].total_spent || 0,
          status: table.parties[0].status
        } : null
      }));

      setTables(formattedTables);
    } catch (error) {
      logger.error('FloorPlanView', 'Error loading tables:', error);
      notify.error({ title: 'Error loading table data' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'warning';
      case 'reserved': return 'info';
      case 'cleaning': return 'gray';
      case 'ready_for_bill': return 'accent';
      case 'maintenance': return 'error';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'vip': return '👑';
      case 'urgent': return '🚨';
      case 'attention_needed': return '⚠️';
      default: return '';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading && !tables.length) {
    return (
      <Stack direction="row" align="center" justify="center" h="50vh">
        <Typography>Loading table data...</Typography>
      </Stack>
    );
  }

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="md">
      {tables.map((table) => (
        <CardWrapper key={table.id}>
          <Stack direction="column" align="start" gap="sm">
            {/* Table Header */}
            <Stack direction="row" justify="space-between" w="full">
              <Stack direction="row">
                <Typography size="lg" fontWeight="bold">
                  Table {table.number}
                </Typography>
                {getPriorityIcon(table.priority) && (
                  <Typography size="lg">{getPriorityIcon(table.priority)}</Typography>
                )}
              </Stack>
              <Badge colorPalette={getStatusColor(table.status)}>
                {table.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </Stack>

            {/* Table Details */}
            <Stack direction="row" justify="space-between" w="full">
              <Stack direction="row">
                <Icon icon={UsersIcon} size="sm" />
                <Typography size="sm" color="text.muted">
                  Capacity: {table.capacity}
                </Typography>
              </Stack>
              <Typography size="sm" color="text.muted" textTransform="capitalize">
                {table.location.replace('_', ' ')}
              </Typography>
            </Stack>

            {/* Current Party Info */}
            {table.current_party && (
              <>
                <hr />
                <Stack direction="column" align="start" gap="xs" w="full">
                  <Stack direction="row" justify="space-between" w="full">
                    <Typography size="sm" fontWeight="medium">
                      Party of {table.current_party.size}
                    </Typography>
                    <Typography size="sm" color="text.muted">
                      {DecimalUtils.formatCurrency(table.current_party.total_spent)}
                    </Typography>
                  </Stack>

                  {table.current_party.primary_customer_name && (
                    <Typography size="sm" color="text.muted">
                      {table.current_party.primary_customer_name}
                    </Typography>
                  )}

                  <Stack direction="row" justify="space-between" w="full">
                    <Stack direction="row">
                      <Icon icon={ClockIcon} size="sm" />
                      <Typography size="sm" color="text.muted">
                        {formatDuration(
                          Math.floor(
                            (new Date().getTime() - new Date(table.current_party.seated_at).getTime()) / 60000
                          )
                        )}
                      </Typography>
                    </Stack>
                    <Typography size="sm" color="text.muted">
                      Est: {formatDuration(table.current_party.estimated_duration)}
                    </Typography>
                  </Stack>
                </Stack>
              </>
            )}

            {/* Performance Stats */}
            <hr />
            <Stack direction="row" justify="space-between" w="full" fontSize="sm" color="text.muted">
              <Typography>Turns: {table.turn_count}</Typography>
              <Typography>Revenue: {DecimalUtils.formatCurrency(table.daily_revenue)}</Typography>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" justify="end" w="full" pt="2">
              <Button size="sm" variant="ghost">
                <Icon icon={EyeIcon} size="sm" />
                View
              </Button>
              {table.status === 'available' && (
                <Button size="sm" colorPalette="blue">
                  Seat Party
                </Button>
              )}
              {table.status === 'occupied' && table.color_code === 'red' && (
                <Button size="sm" colorPalette="red">
                  Check Status
                </Button>
              )}
            </Stack>
          </Stack>
        </CardWrapper>
      ))}
    </Grid>
  );
}
