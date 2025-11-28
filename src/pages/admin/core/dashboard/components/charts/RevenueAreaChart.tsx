/**
 * RevenueAreaChart - Gráfico de revenue acumulado
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/dashboard/charts/RevenueAreaChart.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * AreaChart con Recharts mostrando revenue acumulado de los últimos 12 meses.
 *
 * @example
 * <RevenueAreaChart data={revenueData} />
 */

import React from 'react';
import { Box, Stack, Typography, Icon } from '@/shared/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

// TYPES
export interface RevenueAreaChartProps {
  data?: Array<{
    date: string;
    revenue: number;
  }>;
}

// DEFAULT DATA
const defaultData = [
  {
    date: 'Ene',
    revenue: 12400
  },
  {
    date: 'Feb',
    revenue: 14800
  },
  {
    date: 'Mar',
    revenue: 13200
  },
  {
    date: 'Abr',
    revenue: 16500
  },
  {
    date: 'May',
    revenue: 18900
  },
  {
    date: 'Jun',
    revenue: 21300
  },
  {
    date: 'Jul',
    revenue: 19800
  },
  {
    date: 'Ago',
    revenue: 23400
  },
  {
    date: 'Sep',
    revenue: 25100
  },
  {
    date: 'Oct',
    revenue: 27800
  },
  {
    date: 'Nov',
    revenue: 26500
  },
  {
    date: 'Dic',
    revenue: 31200
  }
];

// COMPONENT
export const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({
  data = defaultData
}) => {
  return (
    <Box bg="gray.100" p={6} borderRadius="2xl" height="100%">
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Box>
          <Typography variant="heading" size="lg" weight="bold" mb={1}>
            Revenue Acumulado
          </Typography>
          <Typography variant="body" size="sm" color="fg.muted">
            Últimos 12 meses
          </Typography>
        </Box>
        <Stack direction="row" align="center" gap="2">
          <Icon size="md" color="green.500">
            <ArrowTrendingUpIcon />
          </Icon>
          <Typography variant="body" size="sm" weight="semibold" color="green.500">
            +24.5%
          </Typography>
        </Stack>
      </Stack>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#48bb78" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#48bb78" stopOpacity={0.1} />
            </linearGradient>
          </defs>
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
            tickFormatter={value => `$${value / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a1929',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#48bb78"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};
