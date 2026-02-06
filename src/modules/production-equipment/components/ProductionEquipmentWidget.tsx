/**
 * Production Equipment Widget
 *
 * Dashboard widget showing equipment metrics and status
 */

import React from 'react';
import { Box, Stack, Typography, Badge, Spinner } from '@/shared/ui';
import { CubeIcon } from '@heroicons/react/24/outline';
import { useEquipmentMetrics } from '../hooks';

export const ProductionEquipmentWidget: React.FC = () => {
  const { data: metrics, isLoading, error } = useEquipmentMetrics();

  if (isLoading) {
    return (
      <Box p="4" bg="bg.panel" borderRadius="lg">
        <Stack align="center" justify="center" minH="150px">
          <Spinner size="lg" />
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="4" bg="bg.panel" borderRadius="lg">
        <Typography color="red.500">Error loading equipment metrics</Typography>
      </Box>
    );
  }

  if (!metrics) {
    return null;
  }

  const avgRate = metrics.avg_hourly_rate || 0;
  const totalHours = metrics.total_hours_used || 0;

  return (
    <Box
      p="5"
      bg="bg.panel"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Stack gap="4">
        {/* Header */}
        <Stack direction="row" align="center" justify="space-between">
          <Stack direction="row" align="center" gap="2">
            <CubeIcon style={{ width: 20, height: 20 }} />
            <Typography fontSize="md" fontWeight="700">
              Production Equipment
            </Typography>
          </Stack>
          <Badge colorPalette="purple" variant="subtle">
            {metrics.total_equipment} Total
          </Badge>
        </Stack>

        {/* Metrics */}
        <Stack gap="3">
          <Stack direction="row" justify="space-between">
            <Typography fontSize="sm" color="fg.muted">
              Available
            </Typography>
            <Typography fontSize="sm" fontWeight="600" color="green.500">
              {metrics.available}
            </Typography>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Typography fontSize="sm" color="fg.muted">
              In Use
            </Typography>
            <Typography fontSize="sm" fontWeight="600" color="blue.500">
              {metrics.in_use}
            </Typography>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Typography fontSize="sm" color="fg.muted">
              Maintenance
            </Typography>
            <Typography fontSize="sm" fontWeight="600" color="orange.500">
              {metrics.maintenance}
            </Typography>
          </Stack>

          <Box h="1px" bg="border.subtle" />

          <Stack direction="row" justify="space-between">
            <Typography fontSize="sm" color="fg.muted">
              Avg. Hourly Rate
            </Typography>
            <Typography fontSize="sm" fontWeight="700" color="purple.500">
              ${avgRate.toFixed(2)}/h
            </Typography>
          </Stack>

          <Stack direction="row" justify="space-between">
            <Typography fontSize="sm" color="fg.muted">
              Total Hours Used
            </Typography>
            <Typography fontSize="sm" fontWeight="600">
              {totalHours.toLocaleString()}h
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProductionEquipmentWidget;
