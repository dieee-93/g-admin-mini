import React from 'react';
import { Stack, Grid, CardWrapper, Typography, Badge, Alert, AlertTitle, AlertDescription } from '@/shared/ui';
import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

interface TableStats {
  total_tables: number;
  available_tables: number;
  occupied_tables: number;
  reserved_tables: number;
  average_occupancy: number;
  total_revenue: number;
  average_turn_time: number;
}

interface WaitTimeData {
  estimated_wait_minutes: number;
  confidence_level: string;
}

interface FloorStatsProps {
  refreshTrigger?: number;
}

export function FloorStats({ refreshTrigger }: FloorStatsProps) {
  const [stats, setStats] = React.useState<TableStats | null>(null);
  const [waitTimeData, setWaitTimeData] = React.useState<WaitTimeData | null>(null);

  React.useEffect(() => {
    loadTableStats();
    loadWaitTimeEstimate();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadTableStats();
      loadWaitTimeEstimate();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const loadTableStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('status, daily_revenue, turn_count')
        .eq('is_active', true);

      if (error) throw error;

      const statsData = {
        total_tables: data.length,
        available_tables: data.filter((t: any) => t.status === 'available').length,
        occupied_tables: data.filter((t: any) => t.status === 'occupied').length,
        reserved_tables: data.filter((t: any) => t.status === 'reserved').length,
        average_occupancy: DecimalUtils.multiply(
          DecimalUtils.divide(
            data.filter((t: any) => t.status === 'occupied').length.toString(),
            data.length.toString(),
            'financial'
          ).toString(),
          '100',
          'financial'
        ).toNumber(),
        total_revenue: data.reduce((sum: number, t: any) =>
          DecimalUtils.add(sum.toString(), (t.daily_revenue || 0).toString(), 'financial').toNumber(),
          0
        ),
        average_turn_time: DecimalUtils.divide(
          data.reduce((sum: number, t: any) =>
            DecimalUtils.add(sum.toString(), (t.turn_count || 0).toString(), 'financial').toNumber(),
            0
          ).toString(),
          data.length.toString(),
          'financial'
        ).toNumber()
      };

      setStats(statsData);
    } catch (error) {
      logger.error('FloorStats', 'Error loading table stats:', error);
      notify.error({ title: 'Error loading stats' });
    }
  };

  const loadWaitTimeEstimate = async () => {
    try {
      const { data, error } = await supabase.rpc('pos_estimate_next_table_available');
      if (error) throw error;
      setWaitTimeData(data);
    } catch (error) {
      logger.error('FloorStats', 'Error loading wait time:', error);
    }
  };

  if (!stats) {
    return <Typography>Loading stats...</Typography>;
  }

  return (
    <Stack gap="lg">
      {/* Quick Stats Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="lg">
        <CardWrapper>
          <Stack direction="column" align="start">
            <Stack direction="row" justify="space-between" w="full">
              <Typography size="sm" color="text.muted">Available Tables</Typography>
              <Badge colorPalette="success">{stats.available_tables}</Badge>
            </Stack>
            <Typography size="2xl" fontWeight="bold">
              {stats.available_tables}/{stats.total_tables}
            </Typography>
          </Stack>
        </CardWrapper>

        <CardWrapper>
          <Stack direction="column" align="start">
            <Stack direction="row" justify="space-between" w="full">
              <Typography size="sm" color="text.muted">Occupancy Rate</Typography>
              <Badge colorPalette="info">
                {DecimalUtils.fromValue(stats.average_occupancy, 'financial').toFixed(1)}%
              </Badge>
            </Stack>
            <Typography size="2xl" fontWeight="bold">
              {stats.occupied_tables} Occupied
            </Typography>
          </Stack>
        </CardWrapper>

        <CardWrapper>
          <Stack direction="column" align="start">
            <Stack direction="row" justify="space-between" w="full">
              <Typography size="sm" color="text.muted">Today's Revenue</Typography>
              <Badge colorPalette="accent">
                {DecimalUtils.formatCurrency(stats.total_revenue)}
              </Badge>
            </Stack>
            <Typography size="2xl" fontWeight="bold">
              ${stats.total_revenue.toLocaleString()}
            </Typography>
          </Stack>
        </CardWrapper>

        <CardWrapper>
          <Stack direction="column" align="start">
            <Stack direction="row" justify="space-between" w="full">
              <Typography size="sm" color="text.muted">Avg Wait Time</Typography>
              <Badge colorPalette="warning">
                {waitTimeData?.estimated_wait_minutes || 0} min
              </Badge>
            </Stack>
            <Typography size="2xl" fontWeight="bold">
              {waitTimeData?.confidence_level || 'Unknown'}
            </Typography>
          </Stack>
        </CardWrapper>
      </Grid>

      {/* Wait Time Alert */}
      {waitTimeData && waitTimeData.estimated_wait_minutes > 30 && (
        <Alert status="warning" title="High Wait Times">
          Current estimated wait time is {waitTimeData.estimated_wait_minutes} minutes.
          Consider managing reservations or optimizing table turnover.
        </Alert>
      )}
    </Stack>
  );
}
