/**
 * SalesTrendChart - Gráfico de tendencia de ventas
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/dashboard/charts/SalesTrendChart.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * LineChart con Recharts mostrando ventas vs órdenes en los últimos 7 días.
 *
 * @example
 * <SalesTrendChart data={chartData} />
 */

import React from 'react';
import { Box, Stack, Typography, Badge } from '@/shared/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// TYPES
export interface SalesTrendChartProps {
  data?: Array<{
    date: string;
    ventas: number;
    ordenes: number;
  }>;
}

// DEFAULT DATA
const defaultData = [
  {
    date: 'Lun',
    ventas: 45,
    ordenes: 32
  },
  {
    date: 'Mar',
    ventas: 52,
    ordenes: 38
  },
  {
    date: 'Mié',
    ventas: 48,
    ordenes: 35
  },
  {
    date: 'Jue',
    ventas: 61,
    ordenes: 42
  },
  {
    date: 'Vie',
    ventas: 55,
    ordenes: 40
  },
  {
    date: 'Sáb',
    ventas: 67,
    ordenes: 48
  },
  {
    date: 'Dom',
    ventas: 43,
    ordenes: 30
  }
];

// COMPONENT
export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data = defaultData
}) => {
  return (
    <Box bg="gray.100" p={6} borderRadius="2xl" height="100%">
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Box>
          <Typography variant="heading" size="lg" weight="bold" mb={1}>
            Tendencia de Ventas
          </Typography>
          <Typography variant="body" size="sm" color="fg.muted">
            Últimos 7 días
          </Typography>
        </Box>
        <Stack direction="row" gap={3}>
          <Badge colorPalette="green" px={3} py={1} borderRadius="full">
            Ventas
          </Badge>
          <Badge colorPalette="blue" px={3} py={1} borderRadius="full">
            Órdenes
          </Badge>
        </Stack>
      </Stack>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px'
            }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{
              fontSize: '12px'
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a1929',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: 'white'
            }}
          />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="#48bb78"
            strokeWidth={3}
            dot={{
              fill: '#48bb78',
              r: 5
            }}
            activeDot={{
              r: 7
            }}
          />
          <Line
            type="monotone"
            dataKey="ordenes"
            stroke="#4299e1"
            strokeWidth={3}
            dot={{
              fill: '#4299e1',
              r: 5
            }}
            activeDot={{
              r: 7
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
