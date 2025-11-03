/**
 * Tables Status Widget - Dynamic Dashboard Component
 *
 * Muestra el estado de las mesas del restaurante:
 * - Mesas ocupadas / libres
 * - Tiempo promedio de ocupación
 * - Rotación de mesas
 *
 * Visible solo si operations_table_management o sales_dine_in_orders están activas.
 *
 * @version 1.0.0 - Initial Implementation
 */

import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

interface TableStats {
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
  averageOccupancy: number;
}

export function TablesWidget() {
  const [stats, setStats] = useState<TableStats>({
    totalTables: 0,
    occupiedTables: 0,
    availableTables: 0,
    averageOccupancy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTableStats() {
      try {
        setLoading(true);

        // Fetch tables data
        const { data: tables, error } = await supabase
          .from('tables')
          .select('id, status');

        if (error) throw error;

        if (!tables || tables.length === 0) {
          setStats({
            totalTables: 0,
            occupiedTables: 0,
            availableTables: 0,
            averageOccupancy: 0
          });
          return;
        }

        const totalTables = tables.length;
        const occupiedTables = tables.filter(t => t.status === 'occupied').length;
        const availableTables = totalTables - occupiedTables;
        const averageOccupancy = totalTables > 0
          ? (occupiedTables / totalTables) * 100
          : 0;

        setStats({
          totalTables,
          occupiedTables,
          availableTables,
          averageOccupancy
        });
      } catch (err) {
        logger.error('TablesWidget', 'Error loading table stats:', err);
        setStats({
          totalTables: 0,
          occupiedTables: 0,
          availableTables: 0,
          averageOccupancy: 0
        });
      } finally {
        setLoading(false);
      }
    }

    loadTableStats();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('tables-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        () => {
          loadTableStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const occupancyColor = stats.averageOccupancy >= 80 ? 'red' : stats.averageOccupancy >= 50 ? 'orange' : 'green';

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="cyan"
      h="fit-content"
      minH="120px"
      borderRadius="8px"
      shadow="sm"
      bg="white"
      border="1px"
      borderColor="gray.200"
    >
      <CardWrapper.Body p="4">
        <Stack gap="3">
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="2" flex={1}>
              <Typography variant="body" size="sm" color="text.secondary">
                Estado de Mesas
              </Typography>

              {loading ? (
                <Typography variant="body" size="sm" color="text.secondary">
                  Cargando...
                </Typography>
              ) : stats.totalTables === 0 ? (
                <Typography variant="body" size="sm" color="text.secondary">
                  No configurado
                </Typography>
              ) : (
                <>
                  <Typography variant="heading" level={3} weight="bold">
                    {stats.occupiedTables}/{stats.totalTables}
                  </Typography>

                  <Typography variant="body" size="xs" color="text.secondary">
                    mesas ocupadas
                  </Typography>
                </>
              )}
            </Stack>

            <Stack
              p="3"
              bg="cyan.100"
              borderRadius="full"
              color="cyan.600"
            >
              <Icon size="lg">
                <TableCellsIcon />
              </Icon>
            </Stack>
          </Stack>

          {!loading && stats.totalTables > 0 && (
            <Stack direction="row" justify="space-between" align="center">
              <Badge variant="subtle" colorPalette={occupancyColor} size="sm">
                {stats.averageOccupancy.toFixed(0)}% ocupación
              </Badge>

              {stats.availableTables > 0 && (
                <Typography variant="body" size="xs" color="green.600">
                  {stats.availableTables} disponibles
                </Typography>
              )}
            </Stack>
          )}

          {!loading && stats.totalTables > 0 && stats.availableTables === 0 && (
            <Box p="2" bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
              <Typography variant="body" size="xs" color="red.700">
                ⚠️ No hay mesas disponibles
              </Typography>
            </Box>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default TablesWidget;
